import type { LLMProvider } from "../llm/provider.interface.js";
export interface RubricCriterionInput {
    id: string;
    weight: number;
    maxScore: number;
    scoringAnchors: unknown;
    competencyId: string | null;
    formativeOnly: boolean;
}
export interface AnalyserOutputRecord {
    turnNumber: number;
    output: Record<string, unknown>;
}
export interface TranscriptMessage {
    role: "STUDENT" | "PATIENT";
    turnNumber: number;
    text: string;
}
export interface EvaluatorInput {
    attemptId: string;
    transcript: TranscriptMessage[];
    analyserOutputs: AnalyserOutputRecord[];
    rubricCriteria: RubricCriterionInput[];
}
export interface CriterionScore {
    score: number;
    maxScore: number;
    evidence: number[];
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
export declare class Evaluator {
    private readonly provider;
    constructor(provider: LLMProvider);
    /**
     * Run two-step evaluation.
     * Step 1 MUST complete before step 2 begins -- sequential awaits enforce this.
     * Callers can assert ordering via a spy that records call sequence.
     */
    evaluate(input: EvaluatorInput): Promise<EvaluatorOutput>;
    private buildScoringPrompt;
    private buildProsePrompt;
    private parseStructuredScores;
    private parseProseOutput;
}
//# sourceMappingURL=evaluator.d.ts.map