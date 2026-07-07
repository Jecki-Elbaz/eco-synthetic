// DebriefController -- POST /simulations/:attemptId/debrief
// APS-REQ-073

import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { DebriefService } from "./debrief.service.js";
import type { DebriefMessageDto } from "./debrief.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { RolesGuard } from "../rbac/roles.guard.js";
import { RequiredRoles } from "../rbac/roles.decorator.js";
import { IsString, IsNotEmpty } from "class-validator";
import type { AuthTokenPayload } from "@aps/shared-types";

class DebriefMessageBodyDto implements DebriefMessageDto {
  @IsString()
  @IsNotEmpty()
  message!: string;
}

interface RequestWithUser extends Request {
  user: AuthTokenPayload;
}

@Controller("simulations")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DebriefController {
  constructor(private readonly debriefService: DebriefService) {}

  /**
   * POST /simulations/:attemptId/debrief
   * Student sends a debrief question and receives a supervisor response.
   * Requires: own attempt, PUBLISHED evaluation, question count < maxDebriefQuestions.
   */
  @Post(":attemptId/debrief")
  @RequiredRoles("STUDENT")
  postMessage(
    @Param("attemptId") attemptId: string,
    @Body() body: DebriefMessageBodyDto,
    @Request() req: RequestWithUser,
  ) {
    return this.debriefService.postMessage(
      attemptId,
      body,
      req.user.sub,
      req.user.scopes,
    );
  }
}
