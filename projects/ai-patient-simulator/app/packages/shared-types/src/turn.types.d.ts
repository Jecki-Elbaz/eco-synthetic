export interface TurnRequest {
    attemptId: string;
    studentMessage: string;
    language: string;
    nonVerbalCues?: string | undefined;
}
export interface TurnResponse {
    patientMessage: string;
    turnNumber: number;
    guardResult: "PASS" | "REGENERATE" | "BLOCKED";
    turnCount: number;
    softWarnTriggered: boolean;
    softWarnAnnotation: string | null;
    hardLimitReached: boolean;
}
//# sourceMappingURL=turn.types.d.ts.map