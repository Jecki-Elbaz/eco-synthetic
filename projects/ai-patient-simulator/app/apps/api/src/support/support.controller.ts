// SupportController (APS-REQ-105/107/108/109/118/119/120/121)
//
// Routes:
//   POST   /support/tickets                       -- create ticket
//   POST   /support/attempts/:id/flag-affected    -- flag TECHNICALLY_AFFECTED (student)
//   GET    /support/attempts/technically-affected -- teacher list (scope-filtered)
//   POST   /support/attempts/:id/confirm-failure  -- teacher confirms TECHNICAL_FAILURE_CONFIRMED
//   POST   /attempts/:id/authorise-retry          -- teacher authorises retry RETRY_AUTHORISED

import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { SupportService } from "./support.service.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { RolesGuard } from "../rbac/roles.guard.js";
import { RequiredRoles } from "../rbac/roles.decorator.js";
import {
  IsString,
  IsOptional,
  IsArray,
  IsBoolean,
  IsNumber,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import type { AuthTokenPayload } from "@aps/shared-types";
import type {
  CreateSupportTicketDto,
  GlobalDiagnosticState,
  SupportIssueCategory,
  AuthoriseRetryDto,
} from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Request body DTOs
// ---------------------------------------------------------------------------

/**
 * Typed DTO for GlobalDiagnosticState (APS-REQ-106 / BLOCKER-3 privacy boundary).
 *
 * WHY: The previous @IsObject() decorator only checked that the field was an object;
 * it did NOT strip unknown keys. A caller could inject arbitrary fields
 * (e.g. transcriptMessages, personaPrompt) into diagnosticState and they would
 * flow through the redactor as unknown keys, potentially reaching the persisted
 * DiagnosticLog unredacted.
 *
 * FIX: Using @ValidateNested() + @Type(() => GlobalDiagnosticStateDto) together with
 * the global ValidationPipe (whitelist:true, forbidNonWhitelisted:true in main.ts)
 * ensures only the declared fields are accepted. Unknown keys are stripped at this
 * controller boundary before the payload ever reaches the service or redactor.
 *
 * Do NOT weaken this: the redactor (diagnostic-redact.ts) is correct and handles
 * known-sensitive keys, but it cannot protect against keys it has never seen.
 * This DTO is the upstream guard.
 */
class GlobalDiagnosticStateDto implements GlobalDiagnosticState {
  @IsString()
  userAgent!: string;

  @IsString()
  micPermission!: "granted" | "denied" | "prompt" | "unknown";

  @IsBoolean()
  simulationLoaded!: boolean;

  @IsNumber()
  @IsOptional()
  lastApiStatus!: number | null;

  @IsArray()
  clientErrorCodes!: string[];

  @IsString()
  @IsOptional()
  attemptId!: string | null;

  @IsString()
  @IsOptional()
  assignmentId!: string | null;

  @IsString()
  @IsOptional()
  courseId!: string | null;
}

class CreateTicketBodyDto implements CreateSupportTicketDto {
  @IsString()
  userId!: string;

  @IsString()
  userRole!: string;

  @IsString()
  issueCategory!: SupportIssueCategory;

  @IsString()
  browserDevice!: string;

  @IsArray()
  errorCodes!: string[];

  @IsString()
  @IsOptional()
  attemptId?: string;

  @IsString()
  @IsOptional()
  courseId?: string;

  @IsString()
  @IsOptional()
  assignmentId?: string;

  // collegeId is NOT accepted from the caller body -- it is injected by the controller
  // from the JWT scopes. The field is declared here only so the DTO satisfies
  // CreateSupportTicketDto; the ValidationPipe whitelist will strip it if a caller
  // tries to send it directly (forbidNonWhitelisted is active in main.ts).
  // NOTE: because this field is optional and never whitelisted from the body, it cannot
  // be set by callers. The controller sets it via req.user.scopes below.

  @IsString()
  @IsOptional()
  userFreeText?: string;

  @ValidateNested()
  @Type(() => GlobalDiagnosticStateDto)
  diagnosticState!: GlobalDiagnosticStateDto;
}

class FlagAffectedBodyDto {
  @IsString()
  ticketId!: string;
}

class AuthoriseRetryBodyDto implements AuthoriseRetryDto {
  @IsString()
  @IsOptional()
  teacherNote?: string;
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

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  /**
   * POST /support/tickets
   * Create a support ticket + diagnostic log + email stub.
   * Any authenticated user (student or teacher) can create a ticket.
   */
  @Post("support/tickets")
  @RequiredRoles("STUDENT", "TEACHER", "SYSTEM_ADMIN")
  createTicket(
    @Body() body: CreateTicketBodyDto,
    @Request() req: RequestWithUser,
  ) {
    // Enforce: ticket userId must match the JWT subject (students cannot create on behalf of others).
    // Extract collegeId from JWT scopes for COLLEGE routing (COURSE > COLLEGE > GLOBAL).
    // We pick the first COLLEGE-scoped entry; if none exists, collegeId stays undefined (GLOBAL).
    const collegeScope = req.user.scopes.find(
      (s: { scopeType: string }) => s.scopeType === "COLLEGE",
    );
    const dto: CreateSupportTicketDto = {
      ...body,
      userId: req.user.sub, // always use the authenticated user's ID
      // collegeId omitted when undefined to satisfy exactOptionalPropertyTypes
      ...(collegeScope ? { collegeId: collegeScope.scopeId } : {}),
    };
    return this.supportService.createTicket(dto);
  }

  /**
   * POST /support/attempts/:id/flag-affected
   * Student flags their attempt as TECHNICALLY_AFFECTED.
   * Body: { ticketId }
   */
  @Post("support/attempts/:id/flag-affected")
  @RequiredRoles("STUDENT", "SYSTEM_ADMIN")
  flagAffected(
    @Param("id") attemptId: string,
    @Body() body: FlagAffectedBodyDto,
    @Request() req: RequestWithUser,
  ) {
    return this.supportService.flagTechnicallyAffected(
      attemptId,
      body.ticketId,
      req.user.sub,
    );
  }

  /**
   * GET /support/attempts/technically-affected
   * Teacher dashboard query: attempts with status TECHNICALLY_AFFECTED.
   * Scope-filtered by courseId query param.
   * Access: TEACHER of course or SYSTEM_ADMIN.
   */
  @Get("support/attempts/technically-affected")
  @RequiredRoles("TEACHER", "SYSTEM_ADMIN")
  listTechnicallyAffected(
    @Query("courseId") courseId: string | undefined,
    @Request() req: RequestWithUser,
  ) {
    return this.supportService.listTechnicallyAffectedAttempts(
      req.user.sub,
      req.user.scopes,
      courseId,
    );
  }

  /**
   * POST /support/attempts/:id/confirm-failure
   * Teacher confirms attempt is TECHNICAL_FAILURE_CONFIRMED.
   * Access: TEACHER of course or SYSTEM_ADMIN.
   */
  @Post("support/attempts/:id/confirm-failure")
  @RequiredRoles("TEACHER", "SYSTEM_ADMIN")
  confirmFailure(
    @Param("id") attemptId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.supportService.confirmTechnicalFailure(
      attemptId,
      req.user.sub,
      req.user.scopes,
    );
  }

  /**
   * POST /attempts/:id/authorise-retry
   * Teacher authorises retry (TECHNICAL_FAILURE_CONFIRMED -> RETRY_AUTHORISED).
   * This is the endpoint the teacher dashboard stubbed in Inc 5/6.
   * Access: TEACHER of course or SYSTEM_ADMIN.
   */
  @Post("attempts/:id/authorise-retry")
  @RequiredRoles("TEACHER", "SYSTEM_ADMIN")
  authoriseRetry(
    @Param("id") attemptId: string,
    @Body() body: AuthoriseRetryBodyDto,
    @Request() req: RequestWithUser,
  ) {
    return this.supportService.authoriseRetry(
      attemptId,
      body,
      req.user.sub,
      req.user.scopes,
    );
  }
}
