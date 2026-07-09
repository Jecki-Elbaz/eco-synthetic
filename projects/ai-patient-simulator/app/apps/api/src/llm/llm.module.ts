// LlmModule -- shared LLM provider for the entire API.
// APS-012: All modules (SimulationModule, EvaluationModule, DebriefModule) consume
// the SAME provider instance via LLM_PROVIDER_TOKEN. Provider choice is env-driven
// (AppConfig.llmProvider) so the switch to a real provider (APS-004 gate) requires
// only adding a case here -- no changes in consuming modules.
//
// STUB-ONLY constraint: "stub" is the only allowed value until the APS-004
// production go-live gate clears. Other cases are commented out as placeholders.
//
// ConfigModule is @Global(), so AppConfig is available without importing it here.

import { Module } from "@nestjs/common";
import { AppConfig } from "../config/app.config.js";
import { StubProvider } from "@aps/engine";
import type { LLMProvider } from "@aps/engine";

export const LLM_PROVIDER_TOKEN = "LLM_PROVIDER";

@Module({
  providers: [
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
            console.warn(
              `Unknown LLM_PROVIDER "${config.llmProvider}" -- falling back to stub`,
            );
            return new StubProvider();
        }
      },
    },
  ],
  exports: [LLM_PROVIDER_TOKEN],
})
export class LlmModule {}
