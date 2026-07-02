// Interaction analyser output types [APS-REQ-059]

export type QuestionType =
  | "open"
  | "closed"
  | "leading"
  | "clarifying"
  | "none";

export type TherapeuticStance =
  | "supportive"
  | "directive"
  | "avoidant"
  | "exploratory"
  | "confrontational"
  | "reflective";

export interface AnalyserResult {
  empathy: number;                // 0.0 - 1.0
  questionType: QuestionType;
  specificity: number;            // 0.0 - 1.0
  validation: number;             // 0.0 - 1.0
  actConsistency: number;         // 0.0 - 1.0
  prematureAdvice: boolean;
  pressure: number;               // 0.0 - 1.0
  missedCues: string[];
  riskRelevance: boolean;
  therapeuticStance: TherapeuticStance;
  turnLanguage: string;           // ISO 639-1 e.g. "he" | "en"
  rawClassification: string;      // full LLM output stored for audit
}
