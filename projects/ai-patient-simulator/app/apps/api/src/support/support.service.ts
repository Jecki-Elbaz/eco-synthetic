// SupportService (APS-REQ-105/106/107/108/109/118/119/120/121)
//
// Responsibilities:
//   - Create SupportTicket + DiagnosticLog (with redaction)
//   - Assemble email stub (never actually sent)
//   - Mark attempt TECHNICALLY_AFFECTED + emit teacher-visible notification stub
//   - Teacher query: technically-affected attempts (scope-filtered)
//   - Authorise retry (TECHNICAL_FAILURE_CONFIRMED -> RETRY_AUTHORISED)
//   - Enforce valid status transitions

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { PrismaService } from "../db/prisma.service.js";
import {
  resolveRoutingTarget,
  redactDiagnosticPayload,
} from "@aps/engine";
import type {
  CreateSupportTicketDto,
  SupportConfirmation,
  SupportEmailObject,
  AttemptStatusValue,
  AuthoriseRetryDto,
  AuthoriseRetryResult,
  UserScope,
} from "@aps/shared-types";
import { ACADEMIC_SAFETY_TRANSITIONS } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Strip characters that can enable email header injection.
 * MUST be applied to any user-supplied string before it is interpolated into
 * an email body or headers. This is a stub-stage contract: the stub never sends
 * email, but establishing sanitisation now prevents unsafe patterns being copied
 * to a real sender when one is wired.
 *
 * Strips: CR (\r), LF (\n), and other control characters that mail libraries
 * may interpret as header delimiters.
 */
function sanitiseForEmail(text: string): string {
  // Remove CRLF and any other control characters (U+0000-U+001F except tab U+0009)
  return text.replace(/[\r\n]/g, " ").replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "");
}

function isAdmin(scopes: UserScope[]): boolean {
  return scopes.some((s) => s.role === "SYSTEM_ADMIN");
}

function isTeacherOfCourse(scopes: UserScope[], courseId: string): boolean {
  return scopes.some(
    (s) =>
      s.role === "TEACHER" &&
      s.scopeType === "COURSE" &&
      s.scopeId === courseId,
  );
}

function allowedTransitions(from: AttemptStatusValue): AttemptStatusValue[] {
  return ACADEMIC_SAFETY_TRANSITIONS[from] ?? [];
}

function assertTransitionAllowed(
  from: AttemptStatusValue,
  to: AttemptStatusValue,
): void {
  const allowed = allowedTransitions(from);
  if (!allowed.includes(to)) {
    throw new UnprocessableEntityException(
      `Status transition ${from} -> ${to} is not allowed. Allowed from ${from}: [${allowed.join(", ")}]`,
    );
  }
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------------------
  // Create SupportTicket + DiagnosticLog + email stub (APS-REQ-105/106/107/108/109)
  // -------------------------------------------------------------------------

  async createTicket(dto: CreateSupportTicketDto): Promise<SupportConfirmation> {
    // Determine routing scope: COURSE > COLLEGE > GLOBAL
    // collegeId is populated by the controller from the JWT scopes (never from caller body).
    const scope = dto.courseId ? "COURSE" : dto.collegeId ? "COLLEGE" : "GLOBAL";
    const routing = resolveRoutingTarget(dto.issueCategory, scope);

    // Structured ticket metadata (no clinical transcript by default)
    const metadata = {
      userRole: dto.userRole,
      browserDevice: dto.browserDevice,
      errorCodes: dto.errorCodes,
      attemptId: dto.attemptId ?? null,
      courseId: dto.courseId ?? null,
      assignmentId: dto.assignmentId ?? null,
      userFreeText: dto.userFreeText ?? null,
      micPermission: dto.diagnosticState.micPermission,
      simulationLoaded: dto.diagnosticState.simulationLoaded,
      lastApiStatus: dto.diagnosticState.lastApiStatus,
      clientErrorCodes: dto.diagnosticState.clientErrorCodes,
    };

    // Redact diagnostic payload before persisting DiagnosticLog (APS-REQ-106)
    const rawPayload: Record<string, unknown> = {
      ...dto.diagnosticState,
      userAgent: dto.diagnosticState.userAgent,
      // Intentionally NO transcript text in the raw payload
    };
    const redactedPayload = redactDiagnosticPayload(rawPayload);

    const now = new Date();

    // Persist DiagnosticLog first (ticket references it by unique ID)
    const diagLog = await this.prisma.diagnosticLog.create({
      data: { payload: redactedPayload as object },
    });

    // Assemble email object (stub -- never actually sent)
    const emailObj: SupportEmailObject = {
      to: routing.toEmail,
      from: "noreply@aps.pilot",
      subject: `[APS Support] ${dto.issueCategory} - ${dto.userId}`,
      bodyText:
        `Issue: ${dto.issueCategory}\n` +
        `User: ${dto.userId} (${dto.userRole})\n` +
        `Course: ${dto.courseId ?? "N/A"}\n` +
        `Assignment: ${dto.assignmentId ?? "N/A"}\n` +
        `Attempt: ${dto.attemptId ?? "N/A"}\n` +
        `Device: ${dto.browserDevice}\n` +
        `Error codes: ${dto.errorCodes.join(", ") || "none"}\n` +
        // sanitiseForEmail MUST run before any real sender is wired (APS-REQ MAJOR-4).
        // Strips CRLF and control chars to prevent email header injection.
        (dto.userFreeText ? `\nStudent message:\n${sanitiseForEmail(dto.userFreeText)}\n` : "") +
        `\nDiagnostic log ID: ${diagLog.id}`,
      context: {
        ticketId: "", // filled after ticket created
        userId: dto.userId,
        userRole: dto.userRole,
        issueCategory: dto.issueCategory,
        courseId: dto.courseId ?? null,
        assignmentId: dto.assignmentId ?? null,
        attemptId: dto.attemptId ?? null,
        browserDevice: dto.browserDevice,
        errorCodes: dto.errorCodes,
        userFreeText: dto.userFreeText ?? null,
        diagnosticSummary: redactedPayload,
        issuedAt: now.toISOString(),
      },
    };

    // Create ticket.
    // emailSent=true here means "email assembled and logged" (stub: never actually sent).
    // MINOR-3: this field conflates "assembled" with "delivered". When a real sender is
    // wired, set emailSent=false initially and flip it to true only on confirmed delivery.
    // Until then, treat emailSent as emailAssembled for all read paths.
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId: dto.userId,
        issueCategory: dto.issueCategory,
        status: "OPEN",
        metadata: metadata as object,
        diagnosticLogId: diagLog.id,
        attemptId: dto.attemptId ?? null,
        emailSent: true,   // stub: means "assembled", not "delivered" -- see MINOR-3 comment above
        emailSentAt: now,
      },
    });

    // Log assembled email (stub: write to console in non-prod; no actual send)
    emailObj.context.ticketId = ticket.id;
    console.log("[SUPPORT-EMAIL-STUB]", JSON.stringify({
      to: emailObj.to,
      subject: emailObj.subject,
      ticketId: ticket.id,
      issuedAt: now.toISOString(),
    }));

    return {
      ticketId: ticket.id,
      notifiedEmail: routing.toEmail,
      expectedResponseHours: routing.expectedResponseHours,
      canContinueNow: false,
      recoveryGuidance:
        "Your support ticket has been submitted. Your instructor has been notified and will follow up within " +
        `${routing.expectedResponseHours} hour(s).`,
    };
  }

  // -------------------------------------------------------------------------
  // Flag attempt TECHNICALLY_AFFECTED + notify teacher (APS-REQ-118/119)
  // -------------------------------------------------------------------------

  async flagTechnicallyAffected(
    attemptId: string,
    ticketId: string,
    actorId: string,
  ): Promise<{ attemptId: string; ticketId: string; teacherNotified: true }> {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { assignment: true },
    });
    if (!attempt) throw new NotFoundException("Attempt not found");
    if (attempt.userId !== actorId) {
      throw new ForbiddenException("Not your attempt");
    }

    // MAJOR-3: verify the ticket belongs to this actor (not just the attempt).
    // Without this check a student could pass any valid ticketId and stamp
    // teacherVisible=true + attemptId onto a ticket they do not own.
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });
    if (!ticket || ticket.userId !== actorId) {
      throw new ForbiddenException("Ticket does not belong to you");
    }

    const from = attempt.status as AttemptStatusValue;
    assertTransitionAllowed(from, "TECHNICALLY_AFFECTED");

    await this.prisma.attempt.update({
      where: { id: attemptId },
      data: { status: "TECHNICALLY_AFFECTED" },
    });

    // Teacher-visible notification stub: persisted as a metadata-enriched ticket update.
    // The teacher dashboard reads SupportTicket where status=OPEN and
    // metadata->>'teacherVisible'='true' for attempts in their course.
    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: "ESCALATED",
        metadata: {
          attemptId,
          courseId: (attempt.assignment as Record<string, unknown>)["courseId"] ?? null,
          assignmentId: attempt.assignment?.id ?? null,
          studentId: actorId,
          teacherVisible: true,
          flaggedAt: new Date().toISOString(),
        } as object,
      },
    });

    return { attemptId, ticketId, teacherNotified: true };
  }

  // -------------------------------------------------------------------------
  // Teacher: list technically-affected attempts (scope-filtered) (APS-REQ-119)
  // -------------------------------------------------------------------------

  async listTechnicallyAffectedAttempts(
    actorId: string,
    actorScopes: UserScope[],
    courseId?: string,
  ): Promise<Array<Record<string, unknown>>> {
    const actorIsAdmin = isAdmin(actorScopes);

    // Compute teacher's authorised course IDs once (used in both auth check and DB filter).
    const teacherCourseIds = actorIsAdmin
      ? null
      : actorScopes
          .filter((s) => s.role === "TEACHER" && s.scopeType === "COURSE")
          .map((s) => s.scopeId);

    if (!actorIsAdmin) {
      if (courseId) {
        // Specific course requested: verify teacher has that scope.
        if (!isTeacherOfCourse(actorScopes, courseId)) {
          throw new ForbiddenException("Not authorised for this course");
        }
      } else {
        // No courseId: teacher sees all their own courses.
        if (!teacherCourseIds || teacherCourseIds.length === 0) {
          throw new ForbiddenException("No TEACHER scope found");
        }
      }
    }

    // Single DB query -- scope filter is applied here, not in-memory afterward.
    // Admin: no course filter (all results).
    // Teacher + specific courseId: filter to that course (already auth-checked above).
    // Teacher + no courseId: filter to all teacher-owned courses.
    const courseFilter = actorIsAdmin
      ? undefined
      : courseId
        ? { assignment: { courseId } }
        : { assignment: { courseId: { in: teacherCourseIds! } } };

    const attempts = await this.prisma.attempt.findMany({
      where: {
        status: "TECHNICALLY_AFFECTED",
        ...courseFilter,
      },
      include: { assignment: true },
    });

    return attempts as Array<Record<string, unknown>>;
  }

  // -------------------------------------------------------------------------
  // Teacher confirms: TECHNICAL_FAILURE_CONFIRMED (APS-REQ-120)
  // -------------------------------------------------------------------------

  async confirmTechnicalFailure(
    attemptId: string,
    actorId: string,
    actorScopes: UserScope[],
  ): Promise<{ attemptId: string; status: "TECHNICAL_FAILURE_CONFIRMED" }> {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { assignment: true },
    });
    if (!attempt) throw new NotFoundException("Attempt not found");

    const courseId = (attempt.assignment as Record<string, unknown>)["courseId"] as string;

    if (!isAdmin(actorScopes) && !isTeacherOfCourse(actorScopes, courseId)) {
      throw new ForbiddenException("Not authorised for this attempt");
    }

    const from = attempt.status as AttemptStatusValue;
    assertTransitionAllowed(from, "TECHNICAL_FAILURE_CONFIRMED");

    await this.prisma.attempt.update({
      where: { id: attemptId },
      data: { status: "TECHNICAL_FAILURE_CONFIRMED" },
    });

    return { attemptId, status: "TECHNICAL_FAILURE_CONFIRMED" };
  }

  // -------------------------------------------------------------------------
  // Teacher authorises retry: RETRY_AUTHORISED (APS-REQ-121)
  // -------------------------------------------------------------------------

  async authoriseRetry(
    attemptId: string,
    dto: AuthoriseRetryDto,
    actorId: string,
    actorScopes: UserScope[],
  ): Promise<AuthoriseRetryResult> {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { assignment: true },
    });
    if (!attempt) throw new NotFoundException("Attempt not found");

    const courseId = (attempt.assignment as Record<string, unknown>)["courseId"] as string;

    if (!isAdmin(actorScopes) && !isTeacherOfCourse(actorScopes, courseId)) {
      throw new ForbiddenException("Not authorised to authorise retry for this attempt");
    }

    const from = attempt.status as AttemptStatusValue;
    assertTransitionAllowed(from, "RETRY_AUTHORISED");

    const now = new Date();
    await this.prisma.attempt.update({
      where: { id: attemptId },
      data: {
        status: "RETRY_AUTHORISED",
        // MINOR-4 audit-trail gap: the Attempt schema has no dedicated retryNote field,
        // so the teacher's note cannot be persisted to the attempt row here.
        // A console.log is insufficient for a production audit trail -- a teacher authorising
        // a retry is a significant academic event. Before beta: add a retryNote field to the
        // Attempt schema (or a SupportTicket comment), migrate, and persist the note here.
      },
    });

    if (dto.teacherNote) {
      // MINOR-4: only console logging because schema has no retryNote column yet.
      // See comment above -- this must be persisted before beta.
      console.log(`[RETRY-AUTH] attempt=${attemptId} teacher=${actorId} note=${dto.teacherNote}`);
    }

    return {
      attemptId,
      previousStatus: from,
      newStatus: "RETRY_AUTHORISED",
      authorisedBy: actorId,
      authorisedAt: now.toISOString(),
    };
  }
}
