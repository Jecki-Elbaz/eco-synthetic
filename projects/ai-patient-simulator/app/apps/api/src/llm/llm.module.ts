// LlmModule -- shared LLM provider for the entire API.
// APS-012: All modules (SimulationModule, EvaluationModule, DebriefModule) consume
// the SAME provider instance via LLM_PROVIDER_TOKEN. Provider choice is env-driven
// (AppConfig.llmProvider) so the switch to a real provider (APS-004 gate) requires
// only adding a case here -- no changes in consuming modules.
//
// STUB-ONLY constraint: "stub" is the only allowed value until the APS-004
// production go-live gate clears. Other cases are commented out as placeholders.
//
// S5-GAL-REQ066: Three named tier slots (APS-REQ-066 Perry split ruling).
//   LLM_PROVIDER_ANALYSER  -- interaction analyser (lighter tier at production)
//   LLM_PROVIDER_GUARD     -- ground-truth guard (lighter tier at production)
//   LLM_PROVIDER_PATIENT   -- patient-response generation (premium tier through pilot-1)
// All three default to StubProvider when env vars are unset (current state).
// Production ops sets ANALYSER + GUARD to a lighter model ID at APS-004 go-live.
// No code change needed at that point -- only env var updates.
//
// ConfigModule is @Global(), so AppConfig is available without importing it here.

import { Module } from "@nestjs/common";
import { AppConfig } from "../config/app.config.js";
import { StubProvider } from "@aps/engine";
import type { LLMProvider } from "@aps/engine";

/** Backward-compat token (LLM_PROVIDER_TOKEN still exported for existing consumers). */
export const LLM_PROVIDER_TOKEN = "LLM_PROVIDER";

// S5-GAL-REQ066 named tokens
export const LLM_PROVIDER_ANALYSER_TOKEN = "LLM_PROVIDER_ANALYSER";
export const LLM_PROVIDER_GUARD_TOKEN = "LLM_PROVIDER_GUARD";
export const LLM_PROVIDER_PATIENT_TOKEN = "LLM_PROVIDER_PATIENT";

/** Build a provider from config. StubProvider is the only allowed value until APS-004. */
function buildProvider(config: AppConfig): LLMProvider {
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
}

@Module({
  providers: [
    // Legacy single-token provider (backward compat for EvaluationModule, DebriefModule)
    {
      provide: LLM_PROVIDER_TOKEN,
      inject: [AppConfig],
      useFactory: (config: AppConfig): LLMProvider => buildProvider(config),
    },
    // S5-GAL-REQ066: three named slots.
    // All default to StubProvider today; production ops sets different model IDs at APS-004.
    {
      provide: LLM_PROVIDER_ANALYSER_TOKEN,
      inject: [AppConfig],
      useFactory: (config: AppConfig): LLMProvider => buildProvider(config),
    },
    {
      provide: LLM_PROVIDER_GUARD_TOKEN,
      inject: [AppConfig],
      useFactory: (config: AppConfig): LLMProvider => buildProvider(config),
    },
    {
      provide: LLM_PROVIDER_PATIENT_TOKEN,
      inject: [AppConfig],
      useFactory: (config: AppConfig): LLMProvider => buildProvider(config),
    },
  ],
  exports: [
    LLM_PROVIDER_TOKEN,
    LLM_PROVIDER_ANALYSER_TOKEN,
    LLM_PROVIDER_GUARD_TOKEN,
    LLM_PROVIDER_PATIENT_TOKEN,
  ],
})
export class LlmModule {}
