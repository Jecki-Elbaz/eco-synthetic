import { Controller, Get, Post, Param, Body, UseGuards, Request } from "@nestjs/common";
import { OrgService } from "./org.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { RolesGuard } from "../rbac/roles.guard.js";
import { RequiredRoles } from "../rbac/roles.decorator.js";
import { IsString, IsOptional } from "class-validator";
import type { AuthTokenPayload } from "@aps/shared-types";

class CreateAttemptDto {
  @IsString()
  language!: string;
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

  /** POST /assignments/:assignmentId/attempts -- get or create attempt for authenticated user */
  @Post("assignments/:assignmentId/attempts")
  @RequiredRoles("STUDENT")
  createAttempt(
    @Param("assignmentId") assignmentId: string,
    @Body() body: CreateAttemptDto,
    @Request() req: RequestWithUser,
  ) {
    return this.orgService.getOrCreateAttempt(
      assignmentId,
      req.user.sub,
      body.language,
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
