import type { PatientState, AnalyserResult } from "@aps/shared-types";
import type { DeltaCapConfig } from "./delta-cap.config.js";
export interface StateUpdateResult {
    nextState: PatientState;
    firedTriggerConditions: string[];
}
export declare class StateUpdater {
    private readonly config;
    constructor(config?: DeltaCapConfig);
    /**
     * Apply analyser result to current state and produce next state.
     * challengeLevel (1-5) modulates delta magnitudes:
     *   1 = fastest-changing patient (small challenge -- student sees effect quickly)
     *   5 = slowest-changing patient (maximum challenge -- state moves minimally per turn)
     *
     * NOTE: the modulation multiplier below is a placeholder. Clinical advisor must
     * define the exact per-level curve before Sprint 2 go-live.
     */
    update(current: PatientState, analyser: AnalyserResult, challengeLevel: number): StateUpdateResult;
}
//# sourceMappingURL=state-updater.d.ts.map