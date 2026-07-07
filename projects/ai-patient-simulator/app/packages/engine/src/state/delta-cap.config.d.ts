export interface DeltaCapConfig {
    maxDeltaPerTurn: number;
    trustOpennessIncreaseEmpathyThreshold: number;
    avoidanceDefensivenessDecreaseMaxPressure: number;
    analyserHighEmpathy: number;
    analyserLowEmpathy: number;
    analyserHighPressure: number;
    analyserLowPressure: number;
    analyserHighValidation: number;
    deltaTrustOnHighEmpathy: number;
    deltaTrustOnLowEmpathy: number;
    deltaOpennessOnHighValidation: number;
    deltaEmotionalActivOnPressure: number;
    deltaAvoidanceOnLowPressure: number;
    deltaDefensivenessOnHighEmpathy: number;
    deltaAllianceOnHighValidation: number;
    deltaDisclosureReadyOnHighTrust: number;
    trustThresholdForDisclosureBoost: number;
}
export declare const DEFAULT_DELTA_CAP_CONFIG: DeltaCapConfig;
//# sourceMappingURL=delta-cap.config.d.ts.map