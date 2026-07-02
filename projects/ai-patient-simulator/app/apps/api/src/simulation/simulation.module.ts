import { Module } from "@nestjs/common";
import { SimulationService } from "./simulation.service.js";
import { SimulationController } from "./simulation.controller.js";
import { EngineProvider } from "./engine.provider.js";

@Module({
  providers: [SimulationService, ...EngineProvider],
  controllers: [SimulationController],
})
export class SimulationModule {}
