// EvaluationModule -- wires EvaluationService + EvaluationController.
// Evaluator is provided via the same LLM_PROVIDER_TOKEN used by SimulationModule.
// Since LLM_PROVIDER_TOKEN is scoped to SimulationModule, we instantiate Evaluator
// here using StubProvider directly (consistent with StubProvider-only pilot constraint).
// When a real LLM provider is gated in (APS-004), this module should be refactored
// to share a single LLM provider instance via a global EngineModule.

import { Module } from "@nestjs/common";
import { EvaluationService } from "./evaluation.service.js";
import { EvaluationController } from "./evaluation.controller.js";
import { Evaluator, StubProvider } from "@aps/engine";

@Module({
  providers: [
    {
      provide: Evaluator,
      useFactory: () => new Evaluator(new StubProvider()),
    },
    EvaluationService,
  ],
  controllers: [EvaluationController],
})
export class EvaluationModule {}
