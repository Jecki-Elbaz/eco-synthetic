// EngineProvider -- registers TurnPipeline via NestJS DI.
// APS-012: LLM_PROVIDER_TOKEN is now provided by LlmModule (shared across all modules).
// SimulationModule imports LlmModule to get the token, then this provider uses it
// to wire TurnPipeline. The LLM factory (stub/real selection) lives in LlmModule only.
//
// S5-GAL-REQ066: TurnPipeline now receives three named provider slots.
// All three default to StubProvider today. Production ops sets different model IDs at APS-004.

import type { Provider } from "@nestjs/common";
import { Inject } from "@nestjs/common";
import { TurnPipeline } from "@aps/engine";
import type { LLMProvider } from "@aps/engine";
import {
  LLM_PROVIDER_TOKEN,
  LLM_PROVIDER_ANALYSER_TOKEN,
  LLM_PROVIDER_GUARD_TOKEN,
  LLM_PROVIDER_PATIENT_TOKEN,
} from "../llm/llm.module.js";

// Re-export all tokens so callers that imported from here continue to work.
export {
  LLM_PROVIDER_TOKEN,
  LLM_PROVIDER_ANALYSER_TOKEN,
  LLM_PROVIDER_GUARD_TOKEN,
  LLM_PROVIDER_PATIENT_TOKEN,
} from "../llm/llm.module.js";

export const EngineProvider: Provider[] = [
  {
    provide: TurnPipeline,
    inject: [
      LLM_PROVIDER_TOKEN,
      LLM_PROVIDER_ANALYSER_TOKEN,
      LLM_PROVIDER_GUARD_TOKEN,
      LLM_PROVIDER_PATIENT_TOKEN,
    ],
    useFactory: (
      provider: LLMProvider,
      analyserProvider: LLMProvider,
      guardProvider: LLMProvider,
      patientProvider: LLMProvider,
    ) =>
      new TurnPipeline(provider, {
        analyserProvider,
        guardProvider,
        patientProvider,
      }),
  },
];
