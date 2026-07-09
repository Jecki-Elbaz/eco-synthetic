// PreviewController -- author-preview endpoint (TRACK-A-GAL items C/D/E)
//
// Route: POST /assignments/:assignmentId/preview
// Auth:  TEACHER or SYSTEM_ADMIN only. Student -> 403.
// Body:  { profile: 'COMPETENT' | 'WEAK' | 'TYPICAL' }
// Resp:  { attemptId: string }
//
// Registered in SimulationModule (SimulationService is available there).
// Controller has no prefix (@Controller("assignments")) so the full route is
// /assignments/:assignmentId/preview -- consistent with OrgController's
// /assignments/:assignmentId/attempts pattern.

import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { SimulationService } from "./simulation.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { RolesGuard } from "../rbac/roles.guard.js";
import { RequiredRoles } from "../rbac/roles.decorator.js";
import { IsIn } from "class-validator";
import type { AuthTokenPayload } from "@aps/shared-types";
import type { BotProfile } from "@aps/engine";

class PreviewDto {
  @IsIn(["COMPETENT", "WEAK", "TYPICAL"])
  profile!: BotProfile;
}

interface RequestWithUser extends Request {
  user: AuthTokenPayload;
}

@Controller("assignments")
@UseGuards(JwtAuthGuard, RolesGuard)
export class PreviewController {
  constructor(private readonly simulationService: SimulationService) {}

  /**
   * POST /assignments/:assignmentId/preview
   * Run a full synchronous author-preview simulation.
   * Returns { attemptId } of the created AUTHOR_PREVIEW attempt.
   */
  @Post(":assignmentId/preview")
  @RequiredRoles("TEACHER", "SYSTEM_ADMIN")
  runPreview(
    @Param("assignmentId") assignmentId: string,
    @Body() body: PreviewDto,
    @Request() req: RequestWithUser,
  ) {
    return this.simulationService.runAuthorPreview(
      assignmentId,
      req.user.sub,
      body.profile,
      req.user.scopes,
    );
  }
}
