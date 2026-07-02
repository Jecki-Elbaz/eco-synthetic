// @aps/engine -- public exports
// apps/api imports engine only through this barrel.
// Engine NEVER imports from @aps/db directly (reads via api service layer).

export { TurnPipeline } from "./pipeline/turn-pipeline.js";
export type { TurnPipelineInput, TurnPipelineOutput, TurnPipelineConfig } from "./pipeline/turn-pipeline.js";
export { StateUpdater } from "./state/state-updater.js";
export type { DeltaCapConfig } from "./state/delta-cap.config.js";
export { DEFAULT_DELTA_CAP_CONFIG } from "./state/delta-cap.config.js";
export type { LLMProvider, LLMRequest, LLMResponse, LLMMessage } from "./llm/provider.interface.js";
export { ModelHint } from "./llm/provider.interface.js";
export { StubProvider } from "./llm/providers/stub.provider.js";
export { ContextBuilder, estimateTokens, selectWindowByTokenBudget } from "./pipeline/context-builder.js";
export type { GroundTruthRef, MessageRecord, ContextBuildInput } from "./pipeline/context-builder.js";
export { GuardRunner } from "./pipeline/guard-runner.js";
export { InputGate } from "./pipeline/input-gate.js";
export type { AttemptTotals, TurnBudget, GateResult } from "./pipeline/input-gate.js";
export { DEFAULT_TURN_BUDGET } from "./pipeline/input-gate.js";
