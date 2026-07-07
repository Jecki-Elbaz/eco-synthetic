// DebriefModule -- wires DebriefService + DebriefController.
// DebriefSupervisor is provided with StubProvider (pilot constraint, same as EvaluationModule).
// Refactor to shared provider token when APS-004 LLM gate clears.

import { Module } from "@nestjs/common";
import { DebriefService } from "./debrief.service.js";
import { DebriefController } from "./debrief.controller.js";
import { DebriefSupervisor, StubProvider } from "@aps/engine";
// DEBRIEF_MAX_QUESTIONS not provided here -- DebriefService uses the DEFAULT_TURN_BUDGET default.
// Inject the token explicitly only when you need a non-default cap (e.g. tests). [RE-3 fix]

@Module({
  providers: [
    {
      provide: DebriefSupervisor,
      useFactory: () => new DebriefSupervisor(new StubProvider()),
    },
    DebriefService,
  ],
  controllers: [DebriefController],
})
export class DebriefModule {}
