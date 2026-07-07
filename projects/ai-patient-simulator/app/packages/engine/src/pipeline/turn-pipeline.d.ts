import type { PatientStateSnapshot, AnalyserResult } from "@aps/shared-types";
import type { LLMProvider } from "../llm/provider.interface.js";
import type { AttemptTotals, TurnBudget, GateResult } from "./input-gate.js";
import type { GroundTruthRef, MessageRecord } from "./context-builder.js";
import type { DeltaCapConfig } from "../state/delta-cap.config.js";
export interface TurnPipelineConfig {
    budget?: TurnBudget;
    deltaCapConfig?: DeltaCapConfig;
}
export interface TurnPipelineInput {
    attemptId: string;
    turnNumber: number;
    challengeLevel: number;
    studentMessage: string;
    studentLanguage: string;
    nonVerbalCues?: string | undefined;
    priorState: PatientStateSnapshot | null;
    personaSystemPrompt: string;
    groundTruth: GroundTruthRef;
    recentMessages: MessageRecord[];
    contextSummary: string | null;
    totals: AttemptTotals;
}
export interface TurnPipelineOutput {
    gateResult: GateResult;
    patientResponse?: string;
    nextStateSnapshot?: Omit<PatientStateSnapshot, "attemptId" | "turnNumber">;
    analyserResult?: AnalyserResult;
    guardOutcome?: "PASS" | "REGENERATE" | "BLOCKED";
    guardDetail?: string | null;
    inputTokensUsed: number;
    outputTokensUsed: number;
    softWarnTriggered: boolean;
}
export declare class TurnPipeline {
    private readonly gate;
    private readonly contextBuilder;
    private readonly guardRunner;
    private readonly stateUpdater;
    private readonly provider;
    constructor(provider: LLMProvider, config?: TurnPipelineConfig);
    run(input: TurnPipelineInput): Promise<TurnPipelineOutput>;
}
//# sourceMappingURL=turn-pipeline.d.ts.map