// DashboardController -- REST endpoints for teacher + student dashboards.
// APS-REQ-088 (teacher class dashboard), APS-REQ-089 (student dashboard).
//
//   GET /dashboard/student/:userId              -- student own / teacher-of-course / admin
//   GET /dashboard/teacher/:courseId            -- teacher-of-course / admin
//   GET /dashboard/teacher/:courseId?assignmentId=... -- select assignment

import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { DashboardService } from "./dashboard.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { RolesGuard } from "../rbac/roles.guard.js";
import { RequiredRoles } from "../rbac/roles.decorator.js";
import type { AuthTokenPayload } from "@aps/shared-types";

interface RequestWithUser extends Request {
  user: AuthTokenPayload;
}

@Controller("dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("student/:userId")
  @RequiredRoles("STUDENT", "TEACHER", "SYSTEM_ADMIN")
  getStudentDashboard(
    @Param("userId") userId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.dashboardService.getStudentDashboard(
      userId,
      req.user.sub,
      req.user.scopes,
    );
  }

  @Get("teacher/:courseId")
  @RequiredRoles("TEACHER", "SYSTEM_ADMIN")
  getClassDashboard(
    @Param("courseId") courseId: string,
    @Request() req: RequestWithUser,
    @Query("assignmentId") assignmentId?: string,
  ) {
    return this.dashboardService.getClassDashboard(
      courseId,
      req.user.sub,
      req.user.scopes,
      assignmentId,
    );
  }
}
