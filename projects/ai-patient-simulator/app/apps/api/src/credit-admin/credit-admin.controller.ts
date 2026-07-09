// CreditAdminController -- admin governance API for credit ledgers.
// APS-REQ-139..148 (pilot: SYSTEM_ADMIN only).
//
// Routes:
//   GET    /admin/credits                          -- usage by college (?collegeId=)
//   GET    /admin/credits/course/:courseId         -- usage by course
//   GET    /admin/credits/ledger/:ledgerId         -- single ledger view
//   GET    /admin/credits/activity                 -- activity log (filterable)
//   POST   /admin/credits/:ledgerId/actions        -- add/deduct/reset/bonus
//   PATCH  /admin/credits/:ledgerId/limits         -- set soft/hard limits
//   POST   /admin/credits/:ledgerId/override       -- hard-limit override
//   GET    /admin/credits/low-balance              -- ledgers at/below softLimit
//
// Access: SYSTEM_ADMIN only (pilot).
// COLLEGE_MANAGER role is deferred -- not a pilot role (APS-REQ-145 note).
//
// Students and teachers receive 403 Forbidden via RolesGuard on all endpoints.

import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { CreditAdminService } from "./credit-admin.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { RolesGuard } from "../rbac/roles.guard.js";
import { RequiredRoles } from "../rbac/roles.decorator.js";
import {
  IsString,
  IsNumber,
  IsOptional,
  IsIn,
  Min,
  IsInt,
} from "class-validator";
import { Type } from "class-transformer";
import type { AuthTokenPayload, AdminCreditActionType, ActivityLogQuery } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Request body DTOs
// ---------------------------------------------------------------------------

const VALID_ACTION_TYPES: AdminCreditActionType[] = [
  "ADMIN_ADD",
  "ADMIN_DEDUCT",
  "ADMIN_RESET",
  "ADMIN_BONUS",
];

class AdminCreditActionBodyDto {
  @IsIn(VALID_ACTION_TYPES)
  actionType!: AdminCreditActionType;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount!: number;

  @IsString()
  reason!: string;
}

class SetLimitsBodyDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  softLimit?: number | null;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  hardLimit?: number | null;

  @IsString()
  reason!: string;
}

class OverrideHardLimitBodyDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  newHardLimit!: number | null;

  @IsString()
  reason!: string;
}

// ---------------------------------------------------------------------------
// Request interface
// ---------------------------------------------------------------------------

interface RequestWithUser extends Request {
  user: AuthTokenPayload;
}

// ---------------------------------------------------------------------------
// Controller
// ---------------------------------------------------------------------------

@Controller("admin/credits")
@UseGuards(JwtAuthGuard, RolesGuard)
@RequiredRoles("SYSTEM_ADMIN")
export class CreditAdminController {
  constructor(private readonly creditAdminService: CreditAdminService) {}

  /**
   * GET /admin/credits?collegeId=<id>
   * Usage summary for all ledgers in a college (APS-REQ-144).
   */
  @Get()
  getCollegeUsage(@Query("collegeId") collegeId: string) {
    return this.creditAdminService.getCollegeUsage(collegeId);
  }

  /**
   * GET /admin/credits/low-balance
   * Ledgers whose balance is at/below softLimit (APS-REQ-147, pilot threshold).
   * NOTE: Route is declared before :ledgerId to prevent param ambiguity.
   */
  @Get("low-balance")
  getLowBalanceLedgers() {
    return this.creditAdminService.getLowBalanceLedgers();
  }

  /**
   * GET /admin/credits/activity?collegeId=&courseId=&from=&to=&page=&pageSize=
   * Credit-consuming activity log, filterable (APS-REQ-144).
   */
  @Get("activity")
  getActivityLog(
    @Query("collegeId") collegeId: string | undefined,
    @Query("courseId") courseId: string | undefined,
    @Query("from") from: string | undefined,
    @Query("to") to: string | undefined,
    @Query("page") page: string | undefined,
    @Query("pageSize") pageSize: string | undefined,
  ) {
    const query: ActivityLogQuery = {};
    if (collegeId !== undefined) query.collegeId = collegeId;
    if (courseId !== undefined) query.courseId = courseId;
    if (from !== undefined) query.from = from;
    if (to !== undefined) query.to = to;
    if (page !== undefined) query.page = parseInt(page, 10);
    if (pageSize !== undefined) query.pageSize = parseInt(pageSize, 10);
    return this.creditAdminService.getActivityLog(query);
  }

  /**
   * GET /admin/credits/course/:courseId
   * Usage summary for a specific course ledger (APS-REQ-144).
   */
  @Get("course/:courseId")
  getCourseUsage(@Param("courseId") courseId: string) {
    return this.creditAdminService.getCourseUsage(courseId);
  }

  /**
   * GET /admin/credits/ledger/:ledgerId
   * Current balance + soft/hard limits for one ledger (APS-REQ-144).
   */
  @Get("ledger/:ledgerId")
  getLedger(@Param("ledgerId") ledgerId: string) {
    return this.creditAdminService.getLedger(ledgerId);
  }

  /**
   * POST /admin/credits/:ledgerId/actions
   * Add / deduct / reset / grant-bonus credits (APS-REQ-143).
   * Each call writes a CreditEntry + updates CreditLedger.balance in a $transaction.
   */
  @Post(":ledgerId/actions")
  applyAction(
    @Param("ledgerId") ledgerId: string,
    @Body() body: AdminCreditActionBodyDto,
    @Request() req: RequestWithUser,
  ) {
    return this.creditAdminService.applyAction(ledgerId, body, req.user.sub);
  }

  /**
   * PATCH /admin/credits/:ledgerId/limits
   * Set / edit softLimit and hardLimit (APS-REQ-141/142).
   * Audited via a CreditEntry with activityType ADMIN_SET_LIMITS.
   */
  @Patch(":ledgerId/limits")
  setLimits(
    @Param("ledgerId") ledgerId: string,
    @Body() body: SetLimitsBodyDto,
    @Request() req: RequestWithUser,
  ) {
    return this.creditAdminService.setLimits(ledgerId, body, req.user.sub);
  }

  /**
   * POST /admin/credits/:ledgerId/override
   * Hard-limit manual override (APS-REQ-143).
   * SCHEMA GAP: no auto-expiry -- see service comment.
   */
  @Post(":ledgerId/override")
  overrideHardLimit(
    @Param("ledgerId") ledgerId: string,
    @Body() body: OverrideHardLimitBodyDto,
    @Request() req: RequestWithUser,
  ) {
    return this.creditAdminService.overrideHardLimit(ledgerId, body, req.user.sub);
  }
}
