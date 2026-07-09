// DebriefModule -- wires DebriefService + DebriefController.
// APS-012: DebriefSupervisor now consumes the shared LLM_PROVIDER_TOKEN from LlmModule.
// No more per-module `new StubProvider()`. Provider choice is env-driven in LlmModule.
// DEBRIEF_MAX_QUESTIONS not provided here -- DebriefService uses the DEFAULT_TURN_BUDGET default.
// Inject the token explicitly only when you need a non-default cap (e.g. tests). [RE-3 fix]

import { Module } from "@nestjs/common";
import { DebriefService } from "./debrief.service.js";
import { DebriefController } from "./debrief.controller.js";
import { DebriefSupervisor } from "@aps/engine";
import type { LLMProvider } from "@aps/engine";
import { LlmModule, LLM_PROVIDER_TOKEN } from "../llm/llm.module.js";

@Module({
  imports: [LlmModule],
  providers: [
    {
      provide: DebriefSupervisor,
      inject: [LLM_PROVIDER_TOKEN],
      useFactory: (provider: LLMProvider) => new DebriefSupervisor(provider),
    },
    DebriefService,
  ],
  controllers: [DebriefController],
})
export class DebriefModule {}
