import { Module } from "@nestjs/common";
import { SimulationService } from "./simulation.service.js";
import { SimulationController } from "./simulation.controller.js";
import { PreviewController } from "./preview.controller.js";
import { EngineProvider } from "./engine.provider.js";
import { LlmModule } from "../llm/llm.module.js";
import { EvaluationModule } from "../evaluation/evaluation.module.js";

// APS-012: LlmModule provides the shared LLM_PROVIDER_TOKEN consumed by EngineProvider
// (TurnPipeline wiring). EvaluationModule is imported for the preview auto-evaluation
// pipeline (fix-001). No circular import: LlmModule has no feature-module dependencies.
@Module({
  imports: [LlmModule, EvaluationModule],
  providers: [SimulationService, ...EngineProvider],
  controllers: [SimulationController, PreviewController],
})
export class SimulationModule {}
