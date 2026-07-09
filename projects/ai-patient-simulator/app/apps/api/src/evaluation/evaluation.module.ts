// EvaluationModule -- wires EvaluationService + EvaluationController.
// APS-012: Evaluator now consumes the shared LLM_PROVIDER_TOKEN from LlmModule.
// No more per-module `new StubProvider()`. Provider choice is env-driven in LlmModule.

import { Module } from "@nestjs/common";
import { EvaluationService } from "./evaluation.service.js";
import { EvaluationController } from "./evaluation.controller.js";
import { Evaluator } from "@aps/engine";
import type { LLMProvider } from "@aps/engine";
import { LlmModule, LLM_PROVIDER_TOKEN } from "../llm/llm.module.js";

@Module({
  imports: [LlmModule],
  providers: [
    {
      provide: Evaluator,
      inject: [LLM_PROVIDER_TOKEN],
      useFactory: (provider: LLMProvider) => new Evaluator(provider),
    },
    EvaluationService,
  ],
  controllers: [EvaluationController],
  exports: [EvaluationService],
})
export class EvaluationModule {}
