export interface PatientState {
    trust: number;
    openness: number;
    emotionalActiv: number;
    avoidanceLevel: number;
    defensiveness: number;
    allianceQuality: number;
    disclosureReady: number;
    riskRelevance: number;
}
export interface PatientStateSnapshot extends PatientState {
    attemptId: string;
    turnNumber: number;
    unlockedFactIds: string[];
    pendingTriggers: string[];
    challengeLevel: number;
    guardResult: "PASS" | "REGENERATE" | "BLOCKED";
    guardDetail: string | null;
    summarisedUpTo: number | null;
    contextSummary: string | null;
}
export declare const INITIAL_PATIENT_STATE: PatientState;
//# sourceMappingURL=engine.types.d.ts.map