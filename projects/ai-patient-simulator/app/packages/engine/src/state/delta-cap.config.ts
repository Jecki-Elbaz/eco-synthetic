// Delta-cap configuration for the state updater.
// These thresholds are ADVISOR-EDITABLE CONFIG -- not magic numbers.
// Clinical advisor must review and calibrate before Sprint 2 go-live.
// See RISK-2 in engine-architecture-gal.md.
// All values are per-turn caps on state dimension change (0.0 - 1.0 scale).

export interface DeltaCapConfig {
  // Maximum change on any single dimension per turn
  maxDeltaPerTurn: number;

  // Trust and openness can only increase if analyser empathy >= this threshold
  trustOpennessIncreaseEmpathyThreshold: number;

  // Avoidance and defensiveness can only decrease if analyser pressure <= this threshold
  avoidanceDefensivenessDecreaseMaxPressure: number;

  // Analyser score thresholds used in delta table
  analyserHighEmpathy: number;
  analyserLowEmpathy: number;
  analyserHighPressure: number;
  analyserLowPressure: number;
  analyserHighValidation: number;

  // State dimension delta magnitudes (positive = increase direction; actual sign depends on context)
  deltaTrustOnHighEmpathy: number;
  deltaTrustOnLowEmpathy: number;
  deltaOpennessOnHighValidation: number;
  deltaEmotionalActivOnPressure: number;
  deltaAvoidanceOnLowPressure: number;
  deltaDefensivenessOnHighEmpathy: number;
  deltaAllianceOnHighValidation: number;
  deltaDisclosureReadyOnHighTrust: number; // applied when trust > 0.6 after update
  trustThresholdForDisclosureBoost: number;
}

// Initial placeholder values -- REQUIRE clinical advisor calibration before Sprint 2.
export const DEFAULT_DELTA_CAP_CONFIG: DeltaCapConfig = {
  maxDeltaPerTurn: 0.10,

  trustOpennessIncreaseEmpathyThreshold: 0.60,
  avoidanceDefensivenessDecreaseMaxPressure: 0.30,

  analyserHighEmpathy: 0.70,
  analyserLowEmpathy: 0.30,
  analyserHighPressure: 0.60,
  analyserLowPressure: 0.25,
  analyserHighValidation: 0.65,

  deltaTrustOnHighEmpathy: 0.05,
  deltaTrustOnLowEmpathy: -0.04,
  deltaOpennessOnHighValidation: 0.04,
  deltaEmotionalActivOnPressure: 0.06,
  deltaAvoidanceOnLowPressure: -0.05,
  deltaDefensivenessOnHighEmpathy: -0.04,
  deltaAllianceOnHighValidation: 0.05,
  deltaDisclosureReadyOnHighTrust: 0.03,
  trustThresholdForDisclosureBoost: 0.60,
};
