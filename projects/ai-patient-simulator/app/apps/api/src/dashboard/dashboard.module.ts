// DashboardModule -- wires DashboardService + DashboardController.
// Pure read-model over Prisma; no LLM provider involved.

import { Module } from "@nestjs/common";
import { DashboardService } from "./dashboard.service.js";
import { DashboardController } from "./dashboard.controller.js";

@Module({
  providers: [DashboardService],
  controllers: [DashboardController],
})
export class DashboardModule {}
