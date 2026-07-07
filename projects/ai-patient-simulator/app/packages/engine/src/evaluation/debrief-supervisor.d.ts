import type { LLMProvider } from "../llm/provider.interface.js";
import type { StructuredScores, TranscriptHighlight } from "./evaluator.js";
export interface DebriefTranscriptMessage {
    role: "STUDENT" | "PATIENT";
    turnNumber: number;
    text: string;
}
export interface DebriefRubricCriteria {
    id: string;
    labelKey: string;
    weight: number;
}
export interface DebriefEvaluationContext {
    overallSummary: string;
    structuredScores: StructuredScores;
    transcriptHighlights: TranscriptHighlight[];
}
export interface DebriefSupervisorInput {
    studentMessage: string;
    transcript: DebriefTranscriptMessage[];
    rubricCriteria: DebriefRubricCriteria[];
    evaluationContext: DebriefEvaluationContext;
    priorDebriefTurns: Array<{
        role: "STUDENT" | "SUPERVISOR";
        text: string;
    }>;
}
export interface DebriefSupervisorOutput {
    supervisorText: string;
    citedTurns: number[];
    inputTokensUsed: number;
    outputTokensUsed: number;
}
export declare class DebriefSupervisor {
    private readonly provider;
    constructor(provider: LLMProvider);
    /**
     * Generate one supervisor response.
     * Context is built via buildDebriefContext() which structurally EXCLUDES
     * persona prompt, ground truth, and PatientStateLog.
     */
    respond(input: DebriefSupervisorInput): Promise<DebriefSupervisorOutput>;
    /**
     * Build the prompt context for the debrief supervisor.
     *
     * STRUCTURAL ISOLATION: this method only incorporates:
     *   - transcript text
     *   - rubric criteria labels/weights (NOT scoringAnchors which contain clinical ground-truth detail)
     *   - evaluation summary (scores + highlights + overallSummary)
     *   - prior debrief conversation
     *   - the student's current message
     *
     * Persona prompt, ground-truth disclosure lists, and PatientStateLog analyserOutput
     * are NOT parameters here and are never passed in -- isolation is enforced by type.
     *
     * Note: this method is intentionally exported-accessible so tests can invoke it
     * directly and assert the returned messages contain no persona/ground-truth content.
     */
    buildDebriefContext(input: DebriefSupervisorInput): ({
        role: "system";
        content: string;
    } | {
        role: "user";
        content: string;
    })[];
    private parseDebriefResponse;
}
//# sourceMappingURL=debrief-supervisor.d.ts.map