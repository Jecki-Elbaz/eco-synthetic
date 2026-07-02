// Per-turn API request/response types

export interface TurnRequest {
  attemptId: string;
  studentMessage: string;
  language: string;                  // "he" | "en"
  nonVerbalCues?: string | undefined; // e.g. "[Long pause]"
}

export interface TurnResponse {
  patientMessage: string;
  turnNumber: number;
  guardResult: "PASS" | "REGENERATE" | "BLOCKED";
  turnCount: number;
  softWarnTriggered: boolean; // true if turnCount >= softWarnTurns
  hardLimitReached: boolean;  // true if attempt closed
}
