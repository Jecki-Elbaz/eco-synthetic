"use strict";
// TurnPipeline -- orchestrates all 8 steps per turn [APS-REQ-057]
// Engine is pure TS: NO db imports here.
// All DB reads/writes are done by the api service layer which calls this pipeline.
// The pipeline receives pre-loaded state and returns artifacts; the caller persists them.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurnPipeline = void 0;
const provider_interface_js_1 = require("../llm/provider.interface.js");
const input_gate_js_1 = require("./input-gate.js");
const context_builder_js_1 = require("./context-builder.js");
const guard_runner_js_1 = require("./guard-runner.js");
const state_updater_js_1 = require("../state/state-updater.js");
const delta_cap_config_js_1 = require("../state/delta-cap.config.js");
class TurnPipeline {
    gate;
    contextBuilder;
    guardRunner;
    stateUpdater;
    provider;
    constructor(provider, config = {}) {
        const budget = config.budget ?? input_gate_js_1.DEFAULT_TURN_BUDGET;
        const deltaCapConfig = config.deltaCapConfig ?? delta_cap_config_js_1.DEFAULT_DELTA_CAP_CONFIG;
        this.provider = provider;
        this.gate = new input_gate_js_1.InputGate(budget);
        this.contextBuilder = new context_builder_js_1.ContextBuilder();
        this.guardRunner = new guard_runner_js_1.GuardRunner(provider, budget.maxGuardRetries);
        this.stateUpdater = new state_updater_js_1.StateUpdater(deltaCapConfig);
    }
    async run(input) {
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
        const windowedMessages = (0, context_builder_js_1.selectWindowByTokenBudget)(input.recentMessages, tokenBudget);
        // Messages outside the window = recentMessages minus windowedMessages
        const windowedSet = new Set(windowedMessages.map((m) => m.turnNumber));
        const droppedMessages = input.recentMessages.filter((m) => !windowedSet.has(m.turnNumber) &&
            (priorSummarisedUpTo === null || m.turnNumber > priorSummarisedUpTo));
        let currentContextSummary = input.contextSummary;
        let currentSummarisedUpTo = priorSummarisedUpTo;
        if (droppedMessages.length > 0) {
            // Build summariser prompt: prior summary + dropped messages
            const summaryLines = [];
            if (currentContextSummary) {
                summaryLines.push("PRIOR SUMMARY:\n" + currentContextSummary + "\n");
            }
            summaryLines.push("MESSAGES TO SUMMARISE:");
            for (const m of droppedMessages) {
                summaryLines.push(`[Turn ${m.turnNumber} ${m.role}]: ${m.originalText}`);
            }
            const summaryMessages = [
                {
                    role: "system",
                    content: "You are a clinical session summariser. Produce a concise rolling summary of the " +
                        "simulated therapy session so far, integrating the prior summary (if any) with the " +
                        "new messages below. Preserve clinically relevant details. Maximum 200 words.",
                },
                { role: "user", content: summaryLines.join("\n") },
            ];
            const summaryResult = await this.provider.complete({
                messages: summaryMessages,
                maxOutputTokens: 300,
                temperature: 0.0,
                modelHint: provider_interface_js_1.ModelHint.SUMMARISER,
            });
            inputTokensUsed += summaryResult.inputTokens;
            outputTokensUsed += summaryResult.outputTokens;
            currentContextSummary = summaryResult.text;
            currentSummarisedUpTo = Math.max(...droppedMessages.map((m) => m.turnNumber));
        }
        // [2] INTERACTION ANALYSER
        // Build analyser prompt using a lightweight approach:
        // send system prompt + last student message; expect structured JSON back.
        const analyserMessages = [
            {
                role: "system",
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
            { role: "user", content: input.studentMessage },
        ];
        const analyserRaw = await this.provider.complete({
            messages: analyserMessages,
            maxOutputTokens: 300,
            temperature: 0.0,
            modelHint: provider_interface_js_1.ModelHint.ANALYSER,
        });
        inputTokensUsed += analyserRaw.inputTokens;
        outputTokensUsed += analyserRaw.outputTokens;
        let analyserResult;
        try {
            analyserResult = JSON.parse(analyserRaw.text);
        }
        catch {
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
        const priorState = input.priorState ?? {
            trust: 0.3,
            openness: 0.2,
            emotionalActiv: 0.4,
            avoidanceLevel: 0.6,
            defensiveness: 0.5,
            allianceQuality: 0.2,
            disclosureReady: 0.1,
            riskRelevance: 0.0,
        };
        const { nextState } = this.stateUpdater.update(priorState, analyserResult, input.challengeLevel);
        // Merge full snapshot fields (turn-level metadata added by caller before persist)
        const partialSnapshot = {
            ...nextState,
            unlockedFactIds: input.priorState?.unlockedFactIds ?? [],
            pendingTriggers: input.priorState?.pendingTriggers ?? [],
            challengeLevel: input.challengeLevel,
            guardResult: "PASS", // overwritten below
            guardDetail: null,
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
        const guardPromptBuilder = (proposedResponse) => this.contextBuilder.buildGuardPrompt(proposedResponse, input.groundTruth, input.turnNumber);
        const guardResult = await this.guardRunner.run(patientMessages, guardPromptBuilder);
        // Thread real token counts from GuardRunner (patient generator + guard calls)
        inputTokensUsed += guardResult.inputTokens;
        outputTokensUsed += guardResult.outputTokens;
        // [7] Assemble output for caller to persist
        const finalSnapshot = {
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
exports.TurnPipeline = TurnPipeline;
//# sourceMappingURL=turn-pipeline.js.map