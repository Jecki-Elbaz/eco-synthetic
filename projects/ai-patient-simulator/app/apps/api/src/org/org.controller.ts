import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
} from "@nestjs/common";
import { OrgService } from "./org.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { RolesGuard } from "../rbac/roles.guard.js";
import { RequiredRoles } from "../rbac/roles.decorator.js";
import { IsString, IsOptional, IsIn } from "class-validator";
import type { AuthTokenPayload } from "@aps/shared-types";

class CreateAttemptDto {
  @IsString()
  language!: string;

  /** Optional type field. Defaults to STUDENT on server.
   * AUTHOR_PREVIEW requires TEACHER or SYSTEM_ADMIN role (TRACK-A-GAL item B). */
  @IsOptional()
  @IsIn(["STUDENT", "AUTHOR_PREVIEW"])
  type?: "STUDENT" | "AUTHOR_PREVIEW";
}

interface RequestWithUser extends Request {
  user: AuthTokenPayload;
}

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  /** GET /colleges/:collegeId */
  @Get("colleges/:collegeId")
  @RequiredRoles("TEACHER", "SYSTEM_ADMIN")
  getCollege(@Param("collegeId") collegeId: string) {
    return this.orgService.getCollege(collegeId);
  }

  /** GET /courses -- list courses visible to actor */
  @Get("courses")
  listCourses(@Request() req: RequestWithUser) {
    return this.orgService.listCoursesForActor(req.user);
  }

  /** GET /courses/:courseId */
  @Get("courses/:courseId")
  getCourse(
    @Param("courseId") courseId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.orgService.getCourse(courseId, req.user);
  }

  /** GET /assignments/:assignmentId */
  @Get("assignments/:assignmentId")
  getAssignment(
    @Param("assignmentId") assignmentId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.orgService.getAssignment(assignmentId, req.user);
  }

  /**
   * POST /assignments/:assignmentId/attempts
   * Create or return an existing attempt for the authenticated user.
   * type=AUTHOR_PREVIEW: requires TEACHER or SYSTEM_ADMIN role (returns 403 otherwise).
   * type=STUDENT (default): requires STUDENT role.
   */
  @Post("assignments/:assignmentId/attempts")
  @RequiredRoles("STUDENT", "TEACHER", "SYSTEM_ADMIN")
  createAttempt(
    @Param("assignmentId") assignmentId: string,
    @Body() body: CreateAttemptDto,
    @Request() req: RequestWithUser,
  ) {
    const attemptType = body.type ?? "STUDENT";

    if (attemptType === "AUTHOR_PREVIEW") {
      // TEACHER or SYSTEM_ADMIN only
      const isTeacherOrAdmin = req.user.scopes.some(
        (s) => s.role === "TEACHER" || s.role === "SYSTEM_ADMIN",
      );
      if (!isTeacherOrAdmin) {
        throw new ForbiddenException("AUTHOR_PREVIEW requires TEACHER or SYSTEM_ADMIN role");
      }
    } else {
      // STUDENT type: only STUDENT role (original behaviour)
      const isStudent = req.user.scopes.some((s) => s.role === "STUDENT");
      if (!isStudent) {
        throw new ForbiddenException("Only STUDENT role can create STUDENT attempts");
      }
    }

    return this.orgService.getOrCreateAttempt(
      assignmentId,
      req.user.sub,
      body.language,
      attemptType,
    );
  }

  /** GET /attempts/:attemptId */
  @Get("attempts/:attemptId")
  getAttempt(
    @Param("attemptId") attemptId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.orgService.getAttempt(attemptId, req.user);
  }
}
