// EngineProvider -- registers the LLMProvider via NestJS DI.
// Active provider selected by LLM_PROVIDER env var.
// StubProvider is the default (no API calls).
// Real providers require APS-004 gate clearance before wiring in.

import { Provider } from "@nestjs/common";
import { TurnPipeline, StubProvider } from "@aps/engine";
import type { LLMProvider } from "@aps/engine";
import { AppConfig } from "../config/app.config.js";

export const LLM_PROVIDER_TOKEN = "LLM_PROVIDER";

export const EngineProvider: Provider[] = [
  {
    provide: LLM_PROVIDER_TOKEN,
    inject: [AppConfig],
    useFactory: (config: AppConfig): LLMProvider => {
      switch (config.llmProvider) {
        case "stub":
          return new StubProvider();
        // case "anthropic": return new AnthropicProvider(config); // APS-004 gate required
        // case "openai":    return new OpenAIProvider(config);    // APS-004 gate required
        default:
          console.warn(`Unknown LLM_PROVIDER "${config.llmProvider}" -- falling back to stub`);
          return new StubProvider();
      }
    },
  },
  {
    provide: TurnPipeline,
    inject: [LLM_PROVIDER_TOKEN],
    useFactory: (provider: LLMProvider) => new TurnPipeline(provider),
  },
];
