// EvaluationController -- REST endpoints for evaluation generate/read/override.
// APS-REQ-068/070/076

import {
  Controller,
  Post,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { EvaluationService } from "./evaluation.service.js";
import type { TeacherOverrideDto } from "./evaluation.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { RolesGuard } from "../rbac/roles.guard.js";
import { RequiredRoles } from "../rbac/roles.decorator.js";
import { IsString, IsOptional, IsBoolean } from "class-validator";
import type { AuthTokenPayload } from "@aps/shared-types";

class TeacherOverrideBodyDto implements TeacherOverrideDto {
  @IsString()
  @IsOptional()
  teacherNotes?: string;

  @IsBoolean()
  @IsOptional()
  publish?: boolean;
}

interface RequestWithUser extends Request {
  user: AuthTokenPayload;
}

@Controller("simulations")
@UseGuards(JwtAuthGuard, RolesGuard)
export class EvaluationController {
  constructor(private readonly evaluationService: EvaluationService) {}

  /**
   * POST /simulations/:attemptId/evaluate
   * Generate or regenerate the evaluation.
   * Access: TEACHER of course or SYSTEM_ADMIN.
   */
  @Post(":attemptId/evaluate")
  @RequiredRoles("TEACHER", "SYSTEM_ADMIN")
  generate(
    @Param("attemptId") attemptId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.evaluationService.generateEvaluation(
      attemptId,
      req.user.sub,
      req.user.scopes,
    );
  }

  /**
   * GET /simulations/:attemptId/evaluation
   * Student: own attempt, PUBLISHED only.
   * Teacher-of-course / admin: full detail at any status.
   */
  @Get(":attemptId/evaluation")
  @RequiredRoles("STUDENT", "TEACHER", "SYSTEM_ADMIN")
  getEvaluation(
    @Param("attemptId") attemptId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.evaluationService.getEvaluation(
      attemptId,
      req.user.sub,
      req.user.scopes,
    );
  }

  /**
   * PATCH /simulations/:attemptId/evaluation
   * Teacher override: set teacherNotes, optionally publish.
   * Access: TEACHER of course or SYSTEM_ADMIN.
   */
  @Patch(":attemptId/evaluation")
  @RequiredRoles("TEACHER", "SYSTEM_ADMIN")
  override(
    @Param("attemptId") attemptId: string,
    @Body() body: TeacherOverrideBodyDto,
    @Request() req: RequestWithUser,
  ) {
    return this.evaluationService.overrideEvaluation(
      attemptId,
      body,
      req.user.sub,
      req.user.scopes,
    );
  }
}
