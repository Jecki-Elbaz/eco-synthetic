import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { SimulationService } from "./simulation.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { RolesGuard } from "../rbac/roles.guard.js";
import { RequiredRoles } from "../rbac/roles.decorator.js";
import { IsString, IsOptional } from "class-validator";
import type { AuthTokenPayload } from "@aps/shared-types";

class TurnRequestDto {
  @IsString()
  studentMessage!: string;

  @IsString()
  language!: string;

  @IsString()
  @IsOptional()
  nonVerbalCues?: string;
}

interface RequestWithUser extends Request {
  user: AuthTokenPayload;
}

@Controller("simulations")
@UseGuards(JwtAuthGuard, RolesGuard)
export class SimulationController {
  constructor(private readonly simulationService: SimulationService) {}

  /**
   * POST /simulations/:attemptId/turn
   * Process one student turn [APS-REQ-057]
   */
  @Post(":attemptId/turn")
  @RequiredRoles("STUDENT")
  processTurn(
    @Param("attemptId") attemptId: string,
    @Body() body: TurnRequestDto,
    @Request() req: RequestWithUser,
  ) {
    return this.simulationService.processTurn(
      {
        attemptId,
        studentMessage: body.studentMessage,
        language: body.language,
        nonVerbalCues: body.nonVerbalCues ?? undefined,
      },
      req.user.sub,
    );
  }

  /**
   * POST /simulations/:attemptId/finish
   * Student explicitly finishes the simulation [APS-REQ-051]
   */
  @Post(":attemptId/finish")
  @RequiredRoles("STUDENT")
  finishAttempt(
    @Param("attemptId") attemptId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.simulationService.finishAttempt(attemptId, req.user.sub);
  }

  /**
   * GET /simulations/:attemptId/transcript
   * Public-facing turn-by-turn transcript (no system prompts, no ground truth, no persona internals).
   * RBAC: student (own attempt), teacher (any attempt in own course), system admin (all).
   * Fine-grained ownership check is enforced in SimulationService.getTranscript.
   */
  @Get(":attemptId/transcript")
  @RequiredRoles("STUDENT", "TEACHER", "SYSTEM_ADMIN")
  getTranscript(
    @Param("attemptId") attemptId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.simulationService.getTranscript(
      attemptId,
      req.user.sub,
      req.user.scopes,
    );
  }

  /**
   * GET /simulations/:attemptId/state-log
   * Teacher review: PatientStateLog per turn [teacher-review API, Ido condition]
   * Access: teacher of course or system admin.
   */
  @Get(":attemptId/state-log")
  @RequiredRoles("TEACHER", "SYSTEM_ADMIN")
  getStateLogs(
    @Param("attemptId") attemptId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.simulationService.getPatientStateLogs(
      attemptId,
      req.user.sub,
      req.user.scopes,
    );
  }
}
