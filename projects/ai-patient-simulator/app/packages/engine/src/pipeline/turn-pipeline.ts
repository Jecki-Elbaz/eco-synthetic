// TurnPipeline -- orchestrates all 8 steps per turn [APS-REQ-057]
// Engine is pure TS: NO db imports here.
// All DB reads/writes are done by the api service layer which calls this pipeline.
// The pipeline receives pre-loaded state and returns artifacts; the caller persists them.

import type { PatientState, PatientStateSnapshot, AnalyserResult } from "@aps/shared-types";
import type { LLMProvider } from "../llm/provider.interface.js";
import { ModelHint } from "../llm/provider.interface.js";
import { InputGate, DEFAULT_TURN_BUDGET } from "./input-gate.js";
import type { AttemptTotals, TurnBudget, GateResult } from "./input-gate.js";
import { ContextBuilder, selectWindowByTokenBudget } from "./context-builder.js";
import type { GroundTruthRef, MessageRecord } from "./context-builder.js";
import { GuardRunner } from "./guard-runner.js";
import { StateUpdater } from "../state/state-updater.js";
import type { DeltaCapConfig } from "../state/delta-cap.config.js";
import { DEFAULT_DELTA_CAP_CONFIG } from "../state/delta-cap.config.js";

export interface TurnPipelineConfig {
  budget?: TurnBudget;
  deltaCapConfig?: DeltaCapConfig;
}

export interface TurnPipelineInput {
  // Attempt context
  attemptId: string;
  turnNumber: number;                  // this turn's number (prior turn was turnNumber - 1)
  challengeLevel: number;

  // Student input
  studentMessage: string;
  studentLanguage: string;
  nonVerbalCues?: string | undefined;

  // Prior state (loaded from PatientStateLog by caller -- hard-persisted pattern)
  priorState: PatientStateSnapshot | null;  // null on turn 1

  // Simulation context
  personaSystemPrompt: string;
  groundTruth: GroundTruthRef;
  recentMessages: MessageRecord[];
  contextSummary: string | null;

  // Budget tracking (fresh from DB -- no in-memory accumulation)
  totals: AttemptTotals;
}

export interface TurnPipelineOutput {
  // Gate result
  gateResult: GateResult;

  // Engine output (only present if gateResult.allowed === true)
  patientResponse?: string;
  nextStateSnapshot?: Omit<PatientStateSnapshot, "attemptId" | "turnNumber">;
  analyserResult?: AnalyserResult;
  guardOutcome?: "PASS" | "REGENERATE" | "BLOCKED";
  guardDetail?: string | null;

  // Token usage for this turn (for UsageLog + credit deduction)
  inputTokensUsed: number;
  outputTokensUsed: number;

  // Soft warning flag
  softWarnTriggered: boolean;
}

export class TurnPipeline {
  private readonly gate: InputGate;
  private readonly contextBuilder: ContextBuilder;
  private readonly guardRunner: GuardRunner;
  private readonly stateUpdater: StateUpdater;
  private readonly provider: LLMProvider;

  constructor(provider: LLMProvider, config: TurnPipelineConfig = {}) {
    const budget = config.budget ?? DEFAULT_TURN_BUDGET;
    const deltaCapConfig = config.deltaCapConfig ?? DEFAULT_DELTA_CAP_CONFIG;

    this.provider = provider;
    this.gate = new InputGate(budget);
    this.contextBuilder = new ContextBuilder();
    this.guardRunner = new GuardRunner(provider, budget.maxGuardRetries);
    this.stateUpdater = new StateUpdater(deltaCapConfig);
  }

  async run(input: TurnPipelineInput): Promise<TurnPipelineOutput> {
    // [1] INPUT GATE
    const gateResult = this.gate.check(input.totals);
    if (!gateResult.allowed) {
      return {
        gateResult,
        inputTokensUsed: 0,
        outputTokensUsed: 0,
        softWarnTriggered: false,
      };
    }

    let inputTokensUsed = 0;
    let outputTokensUsed = 0;

    // [1b] CONTEXT SUMMARISER (APS-REQ-063) -- runs before context build so the
    // fresh summary is available for this turn's prompt.
    //
    // Determine which messages fall outside the sliding window AND have not yet
    // been summarised (turnNumber > prior summarisedUpTo).
    const tokenBudget = this.gate.contextWindowTokenBudget;
    const priorSummarisedUpTo = input.priorState?.summarisedUpTo ?? null;

    // Find the retained window using the same logic as ContextBuilder
    const windowedMessages = selectWindowByTokenBudget(input.recentMessages, tokenBudget);

    // Messages outside the window = recentMessages minus windowedMessages
    const windowedSet = new Set(windowedMessages.map((m) => m.turnNumber));
    const droppedMessages = input.recentMessages.filter(
      (m) =>
        !windowedSet.has(m.turnNumber) &&
        (priorSummarisedUpTo === null || m.turnNumber > priorSummarisedUpTo),
    );

    let currentContextSummary = input.contextSummary;
    let currentSummarisedUpTo = priorSummarisedUpTo;

    if (droppedMessages.length > 0) {
      // Build summariser prompt: prior summary + dropped messages
      const summaryLines: string[] = [];
      if (currentContextSummary) {
        summaryLines.push("PRIOR SUMMARY:\n" + currentContextSummary + "\n");
      }
      summaryLines.push("MESSAGES TO SUMMARISE:");
      for (const m of droppedMessages) {
        summaryLines.push(`[Turn ${m.turnNumber} ${m.role}]: ${m.originalText}`);
      }

      const summaryMessages = [
        {
          role: "system" as const,
          content:
            "You are a clinical session summariser. Produce a concise rolling summary of the " +
            "simulated therapy session so far, integrating the prior summary (if any) with the " +
            "new messages below. Preserve clinically relevant details. Maximum 200 words.",
        },
        { role: "user" as const, content: summaryLines.join("\n") },
      ];

      const summaryResult = await this.provider.complete({
        messages: summaryMessages,
        maxOutputTokens: 300,
        temperature: 0.0,
        modelHint: ModelHint.SUMMARISER,
      });

      inputTokensUsed += summaryResult.inputTokens;
      outputTokensUsed += summaryResult.outputTokens;

      currentContextSummary = summaryResult.text;
      currentSummarisedUpTo = Math.max(
        ...droppedMessages.map((m) => m.turnNumber),
      );
    }

    // [2] INTERACTION ANALYSER
    // Build analyser prompt using a lightweight approach:
    // send system prompt + last student message; expect structured JSON back.
    const analyserMessages = [
      {
        role: "system" as const,
        content: [
          "You are a clinical interaction analyser. Classify the following student message.",
          "Output ONLY valid JSON matching the AnalyserResult schema.",
          "Fields: empathy(0-1), questionType(open|closed|leading|clarifying|none),",
          "specificity(0-1), validation(0-1), actConsistency(0-1), prematureAdvice(bool),",
          "pressure(0-1), missedCues([string]), riskRelevance(bool),",
          "therapeuticStance(supportive|directive|avoidant|exploratory|confrontational|reflective),",
          "turnLanguage(ISO 639-1), rawClassification(string).",
        ].join(" "),
      },
      { role: "user" as const, content: input.studentMessage },
    ];

    const analyserRaw = await this.provider.complete({
      messages: analyserMessages,
      maxOutputTokens: 300,
      temperature: 0.0,
      modelHint: ModelHint.ANALYSER,
    });
    inputTokensUsed += analyserRaw.inputTokens;
    outputTokensUsed += analyserRaw.outputTokens;

    let analyserResult: AnalyserResult;
    try {
      analyserResult = JSON.parse(analyserRaw.text) as AnalyserResult;
    } catch {
      // Malformed analyser output -- use safe defaults; log in caller
      analyserResult = {
        empathy: 0.5,
        questionType: "none",
        specificity: 0.5,
        validation: 0.3,
        actConsistency: 0.5,
        prematureAdvice: false,
        pressure: 0.2,
        missedCues: [],
        riskRelevance: false,
        therapeuticStance: "exploratory",
        turnLanguage: input.studentLanguage,
        rawClassification: "[parse error] " + analyserRaw.text,
      };
    }

    // [3] STATE UPDATER
    const priorState: PatientState = input.priorState ?? {
      trust: 0.3,
      openness: 0.2,
      emotionalActiv: 0.4,
      avoidanceLevel: 0.6,
      defensiveness: 0.5,
      allianceQuality: 0.2,
      disclosureReady: 0.1,
      riskRelevance: 0.0,
    };

    const { nextState } = this.stateUpdater.update(
      priorState,
      analyserResult,
      input.challengeLevel,
    );

    // Merge full snapshot fields (turn-level metadata added by caller before persist)
    const partialSnapshot = {
      ...nextState,
      unlockedFactIds: input.priorState?.unlockedFactIds ?? [],
      pendingTriggers: input.priorState?.pendingTriggers ?? [],
      challengeLevel: input.challengeLevel,
      guardResult: "PASS" as const,  // overwritten below
      guardDetail: null as string | null,
      // Use freshly-computed values (updated by summariser in step 1b, or passed through)
      summarisedUpTo: currentSummarisedUpTo,
      contextSummary: currentContextSummary,
    };

    // [4] CONTEXT BUILDER -- sliding window driven by token budget (APS-REQ-063)
    // Uses the FRESH contextSummary from step 1b so this turn's prompt reflects it.
    const patientMessages = this.contextBuilder.build({
      personaSystemPrompt: input.personaSystemPrompt,
      currentState: {
        ...partialSnapshot,
        attemptId: input.attemptId,
        turnNumber: input.turnNumber,
      },
      groundTruth: input.groundTruth,
      recentMessages: input.recentMessages,
      contextTokenBudget: this.gate.contextWindowTokenBudget,
      contextSummary: currentContextSummary,
      challengeLevel: input.challengeLevel,
      studentMessage: input.studentMessage,
      studentLanguage: input.studentLanguage,
    });

    // [5 + 6] PATIENT RESPONSE GENERATOR + GUARD (guard runs parallel, gates delivery)
    const guardPromptBuilder = (proposedResponse: string) =>
      this.contextBuilder.buildGuardPrompt(
        proposedResponse,
        input.groundTruth,
        input.turnNumber,
      );

    const guardResult = await this.guardRunner.run(patientMessages, guardPromptBuilder);

    // Thread real token counts from GuardRunner (patient generator + guard calls)
    inputTokensUsed += guardResult.inputTokens;
    outputTokensUsed += guardResult.outputTokens;

    // [7] Assemble output for caller to persist
    const finalSnapshot: Omit<PatientStateSnapshot, "attemptId" | "turnNumber"> = {
      ...partialSnapshot,
      guardResult: guardResult.outcome,
      guardDetail: guardResult.guardDetail,
    };

    return {
      gateResult,
      patientResponse: guardResult.response,
      nextStateSnapshot: finalSnapshot,
      analyserResult,
      guardOutcome: guardResult.outcome,
      guardDetail: guardResult.guardDetail,
      inputTokensUsed,
      outputTokensUsed,
      softWarnTriggered: gateResult.allowed ? gateResult.softWarn : false,
    };
  }
}
