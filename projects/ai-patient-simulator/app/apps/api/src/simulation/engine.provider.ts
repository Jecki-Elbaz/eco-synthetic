// EngineProvider -- registers TurnPipeline via NestJS DI.
// APS-012: LLM_PROVIDER_TOKEN is now provided by LlmModule (shared across all modules).
// SimulationModule imports LlmModule to get the token, then this provider uses it
// to wire TurnPipeline. The LLM factory (stub/real selection) lives in LlmModule only.

import type { Provider } from "@nestjs/common";
import { TurnPipeline } from "@aps/engine";
import type { LLMProvider } from "@aps/engine";
import { LLM_PROVIDER_TOKEN } from "../llm/llm.module.js";

// Re-export token so callers that imported it from here continue to work.
export { LLM_PROVIDER_TOKEN } from "../llm/llm.module.js";

export const EngineProvider: Provider[] = [
  {
    provide: TurnPipeline,
    inject: [LLM_PROVIDER_TOKEN],
    useFactory: (provider: LLMProvider) => new TurnPipeline(provider),
  },
];
