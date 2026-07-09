// evaluation-types.ts -- client-side view-model types for evaluation + debrief.
// Faithful to evaluation.service.ts GET response and engine evaluator.ts output.
// Web package does not import @aps/engine directly; shapes are mirrored here.

// Per-criterion score (mirrors CriterionScore in @aps/engine evaluator.ts)
export interface CriterionScore {
  score: number;
  maxScore: number;
  /** Turn numbers cited as evidence for this criterion */
  evidence: number[];
  /** Rationale / notes from evaluator */
  notes: string;
  /** True when criterion is formativeOnly -- student sees yellow badge, non-dismissable */
  requiresTeacherReview: boolean;
}

// Map of criterionId -> CriterionScore (mirrors StructuredScores in @aps/engine)
export type StructuredScores = Record<string, CriterionScore>;

// Highlight type enum (mirrors HighlightType in @aps/engine)
export type HighlightType = "STRONG" | "MISSED" | "RISK_FLAG";

// Transcript highlight (mirrors TranscriptHighlight in @aps/engine)
export interface TranscriptHighlight {
  type: HighlightType;
  turnNumber: number;
  note: string;
}

// Student-facing evaluation response (GET /simulations/:attemptId/evaluation)
// Matches the student-view subset returned by EvaluationService.getEvaluation()
export interface EvaluationResponse {
  attemptId: string;
  status: "PENDING" | "DRAFT" | "TEACHER_REVIEW" | "PUBLISHED";
  structuredScores: StructuredScores;
  transcriptHighlights: TranscriptHighlight[];
  overallSummary: string | null;
  publishedAt: string | null;
}

// Rubric criterion info for display -- labels from DB schema (RubricCriterion).
// Web fetches this alongside the evaluation to render criterion ID + label.
// In mock mode, label data is inlined in the mock payload.
export interface RubricCriterionView {
  id: string;
  labelKey: string;
  /** Localised label -- "he" | "en" key from labels JSON column */
  label: string;
  weight: number;
  maxScore: number;
  formativeOnly: boolean;
}

// Debrief API request/response
// POST /simulations/:attemptId/debrief { message }
export interface DebriefRequest {
  message: string;
}

// Response from DebriefService.postMessage()
export interface DebriefResponse {
  supervisorText: string;
  /** Turn numbers from the attempt transcript cited in the response */
  citedTurns: number[];
  /** True when the student has exhausted the question cap (10) */
  capped: boolean;
}

// Single message in the debrief chat thread (client state only)
export interface DebriefMessage {
  id: string;
  role: "student" | "supervisor";
  text: string;
  /** Only present on supervisor messages */
  citedTurns?: number[];
}

// Transcript turn for display in feedback + debrief panels
export interface TranscriptTurn {
  turnNumber: number;
  role: "STUDENT" | "PATIENT";
  text: string;
}

// Raw shape returned by GET /simulations/:attemptId/transcript
// Each element is one exchange: one student input + one patient response
export interface ApiTranscriptTurn {
  turnIndex: number;   // 1-based exchange index from DB
  studentInput: string;
  patientResponse: string;
  timestamp: string;   // ISO 8601, sentAt of student message for that turn
}
