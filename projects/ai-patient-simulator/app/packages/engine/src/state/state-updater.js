"use strict";
// StateUpdater -- deterministic, config-driven.
// Applies AnalyserResult deltas to PatientState per the delta-cap config.
// No LLM inference for the delta itself (design requirement from engine-architecture-gal.md s.3.2).
// Challenge-level modulation applied on top of base deltas.
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateUpdater = void 0;
const delta_cap_config_js_1 = require("./delta-cap.config.js");
/** Clamp a value to [0.0, 1.0]. */
function clamp(value) {
    return Math.max(0.0, Math.min(1.0, value));
}
/** Apply per-turn delta, respecting the maxDeltaPerTurn cap. */
function applyDelta(current, delta, maxDelta) {
    const cappedDelta = Math.max(-maxDelta, Math.min(maxDelta, delta));
    return clamp(current + cappedDelta);
}
class StateUpdater {
    config;
    constructor(config = delta_cap_config_js_1.DEFAULT_DELTA_CAP_CONFIG) {
        this.config = config;
    }
    /**
     * Apply analyser result to current state and produce next state.
     * challengeLevel (1-5) modulates delta magnitudes:
     *   1 = fastest-changing patient (small challenge -- student sees effect quickly)
     *   5 = slowest-changing patient (maximum challenge -- state moves minimally per turn)
     *
     * NOTE: the modulation multiplier below is a placeholder. Clinical advisor must
     * define the exact per-level curve before Sprint 2 go-live.
     */
    update(current, analyser, challengeLevel) {
        const cfg = this.config;
        // Challenge-level multiplier: level 1 = 1.4x, level 3 = 1.0x, level 5 = 0.6x.
        // TODO: clinical advisor to define exact curve.
        const levelMultiplier = clamp(1.4 - (challengeLevel - 1) * 0.2);
        const effectiveMax = cfg.maxDeltaPerTurn * levelMultiplier;
        const canIncreaseTrustOpenness = analyser.empathy >= cfg.trustOpennessIncreaseEmpathyThreshold;
        const canDecreaseAvoidanceDefensiveness = analyser.pressure <= cfg.avoidanceDefensivenessDecreaseMaxPressure;
        // --- trust ---
        let trustDelta = 0;
        if (analyser.empathy >= cfg.analyserHighEmpathy) {
            trustDelta = cfg.deltaTrustOnHighEmpathy;
        }
        else if (analyser.empathy <= cfg.analyserLowEmpathy) {
            trustDelta = cfg.deltaTrustOnLowEmpathy;
        }
        if (trustDelta > 0 && !canIncreaseTrustOpenness)
            trustDelta = 0;
        // --- openness ---
        let opennessDelta = 0;
        if (analyser.validation >= cfg.analyserHighValidation) {
            opennessDelta = cfg.deltaOpennessOnHighValidation;
        }
        if (opennessDelta > 0 && !canIncreaseTrustOpenness)
            opennessDelta = 0;
        // --- emotionalActiv ---
        let emotionalActivDelta = 0;
        if (analyser.pressure >= cfg.analyserHighPressure) {
            emotionalActivDelta = cfg.deltaEmotionalActivOnPressure;
        }
        // --- avoidanceLevel ---
        let avoidanceDelta = 0;
        if (analyser.pressure <= cfg.analyserLowPressure) {
            avoidanceDelta = cfg.deltaAvoidanceOnLowPressure; // negative -- decreases avoidance
        }
        if (avoidanceDelta < 0 && !canDecreaseAvoidanceDefensiveness)
            avoidanceDelta = 0;
        // --- defensiveness ---
        let defensivenessDelta = 0;
        if (analyser.empathy >= cfg.analyserHighEmpathy) {
            defensivenessDelta = cfg.deltaDefensivenessOnHighEmpathy; // negative
        }
        if (defensivenessDelta < 0 && !canDecreaseAvoidanceDefensiveness)
            defensivenessDelta = 0;
        // --- allianceQuality ---
        let allianceDelta = 0;
        if (analyser.validation >= cfg.analyserHighValidation) {
            allianceDelta = cfg.deltaAllianceOnHighValidation;
        }
        // --- disclosureReady ---
        // Boost when trust crosses threshold after this update
        const nextTrust = applyDelta(current.trust, trustDelta * levelMultiplier, effectiveMax);
        let disclosureDelta = 0;
        if (nextTrust >= cfg.trustThresholdForDisclosureBoost && current.trust < cfg.trustThresholdForDisclosureBoost) {
            disclosureDelta = cfg.deltaDisclosureReadyOnHighTrust;
        }
        // --- riskRelevance ---
        // Binary flag: if analyser flagged risk relevance, bump toward 1.0; else decay slightly.
        const riskDelta = analyser.riskRelevance ? 0.05 : -0.02;
        const nextState = {
            trust: applyDelta(current.trust, trustDelta * levelMultiplier, effectiveMax),
            openness: applyDelta(current.openness, opennessDelta * levelMultiplier, effectiveMax),
            emotionalActiv: applyDelta(current.emotionalActiv, emotionalActivDelta * levelMultiplier, effectiveMax),
            avoidanceLevel: applyDelta(current.avoidanceLevel, avoidanceDelta * levelMultiplier, effectiveMax),
            defensiveness: applyDelta(current.defensiveness, defensivenessDelta * levelMultiplier, effectiveMax),
            allianceQuality: applyDelta(current.allianceQuality, allianceDelta * levelMultiplier, effectiveMax),
            disclosureReady: applyDelta(current.disclosureReady, disclosureDelta * levelMultiplier, effectiveMax),
            riskRelevance: applyDelta(current.riskRelevance, riskDelta, effectiveMax),
        };
        // Trigger condition evaluation placeholder.
        // Sprint 2 will evaluate TriggerRule.triggerCondition expressions against nextState + analyser.
        const firedTriggerConditions = [];
        return { nextState, firedTriggerConditions };
    }
}
exports.StateUpdater = StateUpdater;
//# sourceMappingURL=state-updater.js.map