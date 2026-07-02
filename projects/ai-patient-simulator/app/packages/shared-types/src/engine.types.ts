// Shared engine state types -- used by api + engine packages.
// No framework dependencies. No db imports.

export interface PatientState {
  trust: number;           // 0.0 - 1.0
  openness: number;        // 0.0 - 1.0
  emotionalActiv: number;  // 0.0 - 1.0 (emotional activation)
  avoidanceLevel: number;  // 0.0 - 1.0
  defensiveness: number;   // 0.0 - 1.0
  allianceQuality: number; // 0.0 - 1.0
  disclosureReady: number; // 0.0 - 1.0
  riskRelevance: number;   // 0.0 - 1.0
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

export const INITIAL_PATIENT_STATE: PatientState = {
  trust: 0.3,
  openness: 0.2,
  emotionalActiv: 0.4,
  avoidanceLevel: 0.6,
  defensiveness: 0.5,
  allianceQuality: 0.2,
  disclosureReady: 0.1,
  riskRelevance: 0.0,
};
