// Evaluator -- post-simulation structured scoring + language generation.
// APS-REQ-068/069/070/071/072
//
// Two-step ordering enforced structurally:
//   Step 1: EVALUATOR call -> structuredScores (JSON)
//   Step 2: EVALUATOR call -> prose (overallSummary + transcriptHighlights)
// Step 2 never starts before step 1 resolves (sequential awaits).
// Engine is pure TS -- no @aps/db imports.

import type { LLMProvider } from "../llm/provider.interface.js";
import { ModelHint } from "../llm/provider.interface.js";

// ---------------------------------------------------------------------------
// Input types
// ---------------------------------------------------------------------------

export interface RubricCriterionInput {
  id: string;
  weight: number;
  maxScore: number;
  scoringAnchors: unknown; // JSON blob from DB
  competencyId: string | null;
  formativeOnly: boolean;  // Sami rule: risk-awareness criterion is formative-only
}

export interface AnalyserOutputRecord {
  turnNumber: number;
  output: Record<string, unknown>; // AnalyserResult JSON from PatientStateLog
}

export interface TranscriptMessage {
  role: "STUDENT" | "PATIENT";
  turnNumber: number;
  text: string;
}

export interface EvaluatorInput {
  attemptId: string;
  transcript: TranscriptMessage[];
  analyserOutputs: AnalyserOutputRecord[]; // per-turn analyser results
  rubricCriteria: RubricCriterionInput[];
}

// ---------------------------------------------------------------------------
// Output types
// ---------------------------------------------------------------------------

export interface CriterionScore {
  score: number;
  maxScore: number;
  evidence: number[]; // turn numbers cited as evidence
  notes: string;
  /** True when this criterion is formativeOnly and score must not be treated as official. */
  requiresTeacherReview: boolean;
}

export type StructuredScores = Record<string, CriterionScore>;

export type HighlightType = "STRONG" | "MISSED" | "RISK_FLAG";

export interface TranscriptHighlight {
  type: HighlightType;
  turnNumber: number;
  note: string;
}

export interface EvaluatorOutput {
  structuredScores: StructuredScores;
  transcriptHighlights: TranscriptHighlight[];
  overallSummary: string;
  inputTokensUsed: number;
  outputTokensUsed: number;
}

// ---------------------------------------------------------------------------
// Internal shapes expected from LLM JSON responses
// ---------------------------------------------------------------------------

interface RawCriterionScore {
  score?: unknown;
  maxScore?: unknown;
  evidence?: unknown;
  notes?: unknown;
}

interface RawStructuredScores {
  [criterionId: string]: RawCriterionScore;
}

interface RawProseOutput {
  overallSummary?: unknown;
  transcriptHighlights?: unknown[];
}

interface RawHighlight {
  type?: unknown;
  turnNumber?: unknown;
  note?: unknown;
}

// ---------------------------------------------------------------------------
// Evaluator class
// ---------------------------------------------------------------------------

export class Evaluator {
  private readonly provider: LLMProvider;

  constructor(provider: LLMProvider) {
    this.provider = provider;
  }

  /**
   * Run two-step evaluation.
   * Step 1 MUST complete before step 2 begins -- sequential awaits enforce this.
   * Callers can assert ordering via a spy that records call sequence.
   */
  async evaluate(input: EvaluatorInput): Promise<EvaluatorOutput> {
    let inputTokensUsed = 0;
    let outputTokensUsed = 0;

    // ---------------------------------------------------------------------------
    // STEP 1: Structured scoring (JSON)
    // Produces per-criterion scores BEFORE any language generation.
    // ---------------------------------------------------------------------------
    const step1Messages = this.buildScoringPrompt(input);

    const step1Response = await this.provider.complete({
      messages: step1Messages,
      maxOutputTokens: 800,
      temperature: 0.0,
      modelHint: ModelHint.EVALUATOR,
    });

    inputTokensUsed += step1Response.inputTokens;
    outputTokensUsed += step1Response.outputTokens;

    // Parse step 1 output
    const structuredScores = this.parseStructuredScores(
      step1Response.text,
      input.rubricCriteria,
    );

    // ---------------------------------------------------------------------------
    // STEP 2: Language / prose generation
    // Uses step 1 scores as context -- score drift prevented because scores are
    // already fixed before this call executes.
    // ---------------------------------------------------------------------------
    const step2Messages = this.buildProsePrompt(input, structuredScores);

    const step2Response = await this.provider.complete({
      messages: step2Messages,
      maxOutputTokens: 600,
      temperature: 0.2,
      modelHint: ModelHint.EVALUATOR,
    });

    inputTokensUsed += step2Response.inputTokens;
    outputTokensUsed += step2Response.outputTokens;

    // Parse step 2 output
    const { overallSummary, transcriptHighlights } = this.parseProseOutput(
      step2Response.text,
      input.transcript,
    );

    return {
      structuredScores,
      transcriptHighlights,
      overallSummary,
      inputTokensUsed,
      outputTokensUsed,
    };
  }

  // ---------------------------------------------------------------------------
  // Prompt builders
  // ---------------------------------------------------------------------------

  private buildScoringPrompt(input: EvaluatorInput) {
    const criteriaBlock = input.rubricCriteria
      .map(
        (c) =>
          `  criterionId: ${c.id}\n` +
          `  weight: ${c.weight}\n` +
          `  maxScore: ${c.maxScore}\n` +
          `  formativeOnly: ${c.formativeOnly}\n` +
          `  scoringAnchors: ${JSON.stringify(c.scoringAnchors)}`,
      )
      .join("\n\n");

    const transcriptBlock = input.transcript
      .map((m) => `[Turn ${m.turnNumber} ${m.role}]: ${m.text}`)
      .join("\n");

    const analyserBlock = input.analyserOutputs
      .map((a) => `[Turn ${a.turnNumber}]: ${JSON.stringify(a.output)}`)
      .join("\n");

    return [
      {
        role: "system" as const,
        content: [
          "You are a clinical simulation evaluator. Your task is ONLY to produce structured scores.",
          "Return ONLY valid JSON matching this schema, no prose:",
          '{ "criterionId": { "score": number, "maxScore": number, "evidence": number[], "notes": string } }',
          "score must be between 0 and maxScore. evidence is a list of turn numbers.",
          "Do not generate summaries or highlight text in this step.",
        ].join(" "),
      },
      {
        role: "user" as const,
        content: [
          "RUBRIC CRITERIA:",
          criteriaBlock,
          "",
          "TRANSCRIPT:",
          transcriptBlock,
          "",
          "PER-TURN ANALYSER OUTPUTS:",
          analyserBlock,
        ].join("\n"),
      },
    ];
  }

  private buildProsePrompt(
    input: EvaluatorInput,
    scores: StructuredScores,
  ) {
    const scoresBlock = JSON.stringify(scores, null, 2);
    const transcriptBlock = input.transcript
      .map((m) => `[Turn ${m.turnNumber} ${m.role}]: ${m.text}`)
      .join("\n");

    return [
      {
        role: "system" as const,
        content: [
          "You are a clinical simulation evaluator. The structured scores are already fixed (provided below).",
          "Your task is ONLY to produce the narrative summary and transcript highlights.",
          "Do NOT change any scores. Return ONLY valid JSON:",
          '{',
          '  "overallSummary": string,',
          '  "transcriptHighlights": [{ "type": "STRONG"|"MISSED"|"RISK_FLAG", "turnNumber": number, "note": string }]',
          '}',
          "RISK_FLAG highlights must be cited with specific turn numbers.",
        ].join(" "),
      },
      {
        role: "user" as const,
        content: [
          "STRUCTURED SCORES (do not alter):",
          scoresBlock,
          "",
          "TRANSCRIPT:",
          transcriptBlock,
        ].join("\n"),
      },
    ];
  }

  // ---------------------------------------------------------------------------
  // Parsers
  // ---------------------------------------------------------------------------

  private parseStructuredScores(
    rawText: string,
    criteria: RubricCriterionInput[],
  ): StructuredScores {
    const formativeIds = new Set(
      criteria.filter((c) => c.formativeOnly).map((c) => c.id),
    );
    const maxScoreById = new Map(criteria.map((c) => [c.id, c.maxScore]));

    let parsed: RawStructuredScores = {};
    try {
      parsed = JSON.parse(rawText) as RawStructuredScores;
    } catch {
      // Malformed -- return zero scores for all criteria
      const fallback: StructuredScores = {};
      for (const c of criteria) {
        fallback[c.id] = {
          score: 0,
          maxScore: c.maxScore,
          evidence: [],
          notes: "[parse error] " + rawText.slice(0, 120),
          requiresTeacherReview: c.formativeOnly,
        };
      }
      return fallback;
    }

    const scores: StructuredScores = {};
    for (const c of criteria) {
      const raw = parsed[c.id] ?? {};
      const maxScore = maxScoreById.get(c.id) ?? c.maxScore;
      const score = typeof raw.score === "number"
        ? Math.min(Math.max(raw.score, 0), maxScore)
        : 0;
      const evidence = Array.isArray(raw.evidence)
        ? (raw.evidence as unknown[]).filter((v): v is number => typeof v === "number")
        : [];
      const notes = typeof raw.notes === "string" ? raw.notes : "";
      const isFormative = formativeIds.has(c.id);

      scores[c.id] = {
        score,
        maxScore,
        evidence,
        notes: isFormative
          ? notes + (notes ? " " : "") + "[FORMATIVE-ONLY: requires teacher review before official]"
          : notes,
        requiresTeacherReview: isFormative,
      };
    }
    return scores;
  }

  private parseProseOutput(
    rawText: string,
    transcript: TranscriptMessage[],
  ): { overallSummary: string; transcriptHighlights: TranscriptHighlight[] } {
    const validTurnNumbers = new Set(transcript.map((m) => m.turnNumber));

    let parsed: RawProseOutput = {};
    try {
      parsed = JSON.parse(rawText) as RawProseOutput;
    } catch {
      // Graceful fallback
      return {
        overallSummary: rawText.slice(0, 500) || "[evaluation summary unavailable]",
        transcriptHighlights: [],
      };
    }

    const overallSummary =
      typeof parsed.overallSummary === "string" && parsed.overallSummary
        ? parsed.overallSummary
        : "[evaluation summary unavailable]";

    const rawHighlights = Array.isArray(parsed.transcriptHighlights)
      ? parsed.transcriptHighlights
      : [];

    const transcriptHighlights: TranscriptHighlight[] = rawHighlights
      .filter((h): h is RawHighlight => h !== null && typeof h === "object")
      .map((h) => {
        const type: HighlightType =
          h.type === "STRONG" || h.type === "MISSED" || h.type === "RISK_FLAG"
            ? h.type
            : "MISSED";
        const turnNumber =
          typeof h.turnNumber === "number" && validTurnNumbers.has(h.turnNumber)
            ? h.turnNumber
            : (transcript[0]?.turnNumber ?? 1);
        const note = typeof h.note === "string" ? h.note : "";
        return { type, turnNumber, note };
      });

    return { overallSummary, transcriptHighlights };
  }
}
