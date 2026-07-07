export type QuestionType = "open" | "closed" | "leading" | "clarifying" | "none";
export type TherapeuticStance = "supportive" | "directive" | "avoidant" | "exploratory" | "confrontational" | "reflective";
export interface AnalyserResult {
    empathy: number;
    questionType: QuestionType;
    specificity: number;
    validation: number;
    actConsistency: number;
    prematureAdvice: boolean;
    pressure: number;
    missedCues: string[];
    riskRelevance: boolean;
    therapeuticStance: TherapeuticStance;
    turnLanguage: string;
    rawClassification: string;
}
//# sourceMappingURL=analyser.types.d.ts.map