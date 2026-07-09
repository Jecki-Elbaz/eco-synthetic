/**
 * Support + academic-safety integration specs (APS-REQ-105/106/107/108/109/118/119/120/121)
 *
 * IMPLEMENTED 2026-07-09 (Adi, Sprint 2 hardening). All 8 stubs are now live
 * against the live Postgres instance at :5433.
 *
 * Run with: pnpm --filter @aps/api test:integration
 *
 * Prerequisites:
 *   - DATABASE_URL in .env.local points to localhost:5433
 *   - pnpm --filter @aps/db seed has been run at least once (schema current)
 *
 * Tests are sequential within each describe (state flows: ticket -> flag ->
 * list -> confirm -> authorise-retry). --runInBand is set in the integration
 * jest config, so the ordering is deterministic.
 *
 * Covered scenarios:
 *   INT-SUP-001: POST /support/tickets -- creates ticket + diag log in DB
 *   INT-SUP-002: DiagnosticLog payload is redacted in DB (no raw token)
 *   INT-SUP-003: POST /support/attempts/:id/flag-affected -- TECHNICALLY_AFFECTED
 *   INT-SUP-004: GET /support/attempts/technically-affected -- teacher scope filter
 *   INT-SUP-005: POST /support/attempts/:id/confirm-failure -- TECHNICAL_FAILURE_CONFIRMED
 *   INT-SUP-006: POST /attempts/:id/authorise-retry -- RETRY_AUTHORISED; result shape
 *   INT-SUP-007: POST /attempts/:id/authorise-retry -- student JWT -> 403
 *   INT-SUP-008: Illegal transition COMPLETED -> RETRY_AUTHORISED -> 422
 */

import { PrismaClient } from "@aps/db";
import { SupportService } from "../support/support.service.js";
import { ForbiddenException, UnprocessableEntityException } from "@nestjs/common";
import type { UserScope } from "@aps/shared-types";
import type { CreateSupportTicketDto } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Shared Prisma instance
// ---------------------------------------------------------------------------
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Random fixture suffix helper
// ---------------------------------------------------------------------------
const uid = () => Math.random().toString(36).slice(2, 10);

// ---------------------------------------------------------------------------
// Fixture IDs (populated in beforeAll)
// ---------------------------------------------------------------------------
let collegeId: string;
let courseId: string;
let studentId: string;
let teacherAId: string;
let templateId: string;
let groundTruthId: string;
let rubricVersionId: string;
let assignmentId: string;

/** Main attempt: starts IN_PROGRESS; transitions through the support flow. */
let attemptId: string;

/** Separate attempt seeded in COMPLETED status for the illegal-transition test (INT-SUP-008). */
let completedAttemptId: string;

// ---------------------------------------------------------------------------
// Shared state populated by INT-SUP-001 and reused in later tests
// ---------------------------------------------------------------------------
let ticketId: string;
let diagLogId: string;

// ---------------------------------------------------------------------------
// Setup: seed minimal hierarchy
// ---------------------------------------------------------------------------
beforeAll(async () => {
  await prisma.$connect();
  const suffix = uid();

  const college = await prisma.college.create({
    data: { name: `SUP-Int-College-${suffix}`, slug: `sup-tc-${suffix}` },
  });
  collegeId = college.id;

  const course = await prisma.course.create({
    data: { collegeId, name: `SUP-Int-Course-${suffix}`, code: `SUP-${suffix}` },
  });
  courseId = course.id;

  const student = await prisma.user.create({
    data: {
      email: `student-sup-${suffix}@int.test`,
      displayName: `Student SUP ${suffix}`,
    },
  });
  studentId = student.id;

  const teacherA = await prisma.user.create({
    data: {
      email: `teacher-a-sup-${suffix}@int.test`,
      displayName: `Teacher A SUP ${suffix}`,
    },
  });
  teacherAId = teacherA.id;

  // GroundTruth placeholder (simulationTemplateId updated after template creation)
  const gt = await prisma.groundTruth.create({
    data: {
      simulationTemplateId: "placeholder",
      knownFacts: { doNotInvent: [] },
      disclosureAllowList: { unlocked: [], locked: [] },
      escalationRules: {},
      hardOffRampText: "This is a simulation.",
    },
  });
  groundTruthId = gt.id;

  const template = await prisma.simulationTemplate.create({
    data: {
      title: `SUP Int Template ${suffix}`,
      clinicalModel: "CBT",
      studentLevel: "undergraduate",
      challengeLevel: 2,
      riskLevel: "low",
      languages: ["en"],
      personaPrompt: "You are a stub patient.",
      groundTruthId,
    },
  });
  templateId = template.id;

  await prisma.groundTruth.update({
    where: { id: groundTruthId },
    data: { simulationTemplateId: templateId },
  });

  const rubric = await prisma.rubricVersion.create({
    data: {
      simulationTemplateId: templateId,
      version: 1,
      status: "PUBLISHED",
    },
  });
  rubricVersionId = rubric.id;

  const assignment = await prisma.assignment.create({
    data: {
      courseId,
      simulationTemplateId: templateId,
      rubricVersionId,
      challengeLevel: 2,
      languagesAllowed: ["en"],
      maxTurns: 10,
    },
  });
  assignmentId = assignment.id;

  // Main attempt -- starts IN_PROGRESS
  const attempt = await prisma.attempt.create({
    data: {
      assignmentId,
      userId: studentId,
      status: "IN_PROGRESS",
      language: "en",
      startedAt: new Date(),
    },
  });
  attemptId = attempt.id;

  // Completed attempt for INT-SUP-008 (illegal transition from COMPLETED)
  const completedAttempt = await prisma.attempt.create({
    data: {
      assignmentId,
      userId: studentId,
      status: "COMPLETED",
      language: "en",
      startedAt: new Date(),
      finishedAt: new Date(),
    },
  });
  completedAttemptId = completedAttempt.id;
});

// ---------------------------------------------------------------------------
// Teardown: delete all created rows in FK-safe order
// ---------------------------------------------------------------------------
afterAll(async () => {
  // SupportTickets reference Attempts (attemptId FK) and DiagnosticLogs.
  // Must be deleted before Attempts and DiagnosticLogs.
  await prisma.supportTicket.deleteMany({
    where: { userId: studentId },
  });
  // DiagnosticLogs have no incoming FKs after SupportTickets are removed.
  if (diagLogId) {
    await prisma.diagnosticLog.deleteMany({ where: { id: diagLogId } });
  }
  await prisma.attempt.deleteMany({ where: { id: { in: [attemptId, completedAttemptId] } } });
  await prisma.assignment.deleteMany({ where: { id: assignmentId } });
  await prisma.rubricVersion.deleteMany({ where: { id: rubricVersionId } });
  await prisma.simulationTemplate.deleteMany({ where: { id: templateId } });
  await prisma.groundTruth.deleteMany({ where: { id: groundTruthId } });
  await prisma.user.deleteMany({ where: { id: { in: [studentId, teacherAId] } } });
  await prisma.course.deleteMany({ where: { id: courseId } });
  await prisma.college.deleteMany({ where: { id: collegeId } });
  await prisma.$disconnect();
});

// ---------------------------------------------------------------------------
// Helper: build SupportService with real Prisma
// ---------------------------------------------------------------------------
function buildService(): SupportService {
  return new SupportService(prisma as never);
}

// ---------------------------------------------------------------------------
// Scope helpers (JWT-level: not backed by UserRoleAssignment rows)
// ---------------------------------------------------------------------------

function teacherAScopes(): UserScope[] {
  return [{ role: "TEACHER", scopeType: "COURSE", scopeId: courseId }];
}

function studentScopes(): UserScope[] {
  return [{ role: "STUDENT", scopeType: "COURSE", scopeId: courseId }];
}

// ---------------------------------------------------------------------------
// Ticket DTO factory
// Injects a JWT-pattern token into diagnosticState for redaction testing (INT-SUP-002).
// ---------------------------------------------------------------------------

function makeTicketDto(): CreateSupportTicketDto {
  return {
    userId: studentId,
    userRole: "STUDENT",
    issueCategory: "AI_RESPONSE_FAILURE",
    browserDevice: "Chrome/Windows (integration-test)",
    errorCodes: ["ERR_AI_TIMEOUT"],
    attemptId: attemptId,
    courseId: courseId,
    assignmentId: assignmentId,
    userFreeText: "The AI stopped responding mid-session (integration test).",
    diagnosticState: {
      userAgent: "Mozilla/5.0 (integration test)",
      micPermission: "granted",
      simulationLoaded: true,
      lastApiStatus: 504,
      clientErrorCodes: ["ERR_AI_TIMEOUT"],
      attemptId: attemptId,
      assignmentId: assignmentId,
      courseId: courseId,
      // Inject a JWT-pattern token to verify redaction in INT-SUP-002.
      // The redactor strips keys named "token" and values matching JWT pattern.
      ...(({ token: "eyJ.sensitive.sig" } as unknown) as object),
    } as CreateSupportTicketDto["diagnosticState"],
  };
}

// ---------------------------------------------------------------------------
// INT-SUP-001: create ticket + diag log in DB
// ---------------------------------------------------------------------------

describe("INT-SUP-001: POST /support/tickets -- ticket creation (live Postgres)", () => {
  it("creates SupportTicket and DiagnosticLog in DB, returns confirmation", async () => {
    const service = buildService();
    const dto = makeTicketDto();

    const result = await service.createTicket(dto);

    expect(result.ticketId).toBeTruthy();
    expect(result.notifiedEmail).toBe("academic-support@aps.pilot");
    expect(result.expectedResponseHours).toBe(1);
    expect(typeof result.canContinueNow).toBe("boolean");
    expect(typeof result.recoveryGuidance).toBe("string");

    // Store for use in later tests
    ticketId = result.ticketId;

    // Verify SupportTicket row in DB
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    expect(ticket).not.toBeNull();
    expect(ticket!.userId).toBe(studentId);
    expect(ticket!.issueCategory).toBe("AI_RESPONSE_FAILURE");
    expect(ticket!.status).toBe("OPEN");
    expect(ticket!.emailSent).toBe(true);
    expect(ticket!.diagnosticLogId).toBeTruthy();

    // Store diagLogId for INT-SUP-002 verification
    diagLogId = ticket!.diagnosticLogId!;

    // Verify DiagnosticLog row in DB
    const diagLog = await prisma.diagnosticLog.findUnique({ where: { id: diagLogId } });
    expect(diagLog).not.toBeNull();
    expect(diagLog!.payload).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// INT-SUP-002: DiagnosticLog payload is redacted in DB
// ---------------------------------------------------------------------------

describe("INT-SUP-002: DiagnosticLog redaction (live Postgres)", () => {
  it("stored payload does not contain the raw JWT token value", async () => {
    // diagLogId is set by INT-SUP-001; tests run sequentially via --runInBand
    expect(diagLogId).toBeTruthy();

    const diagLog = await prisma.diagnosticLog.findUnique({ where: { id: diagLogId } });
    expect(diagLog).not.toBeNull();

    const payload = diagLog!.payload as Record<string, unknown>;

    // "token" key is in SENSITIVE_TOP_LEVEL_KEYS -> must be "[REDACTED]"
    expect(payload["token"]).toBe("[REDACTED]");

    // Raw JWT value must not appear anywhere in the payload
    const serialised = JSON.stringify(payload);
    expect(serialised).not.toContain("eyJ.sensitive.sig");
  });
});

// ---------------------------------------------------------------------------
// INT-SUP-003: flag-affected -- IN_PROGRESS -> TECHNICALLY_AFFECTED
// ---------------------------------------------------------------------------

describe("INT-SUP-003: flag-affected status transition (live Postgres)", () => {
  it("transitions attempt to TECHNICALLY_AFFECTED and escalates ticket", async () => {
    expect(ticketId).toBeTruthy();
    const service = buildService();

    const result = await service.flagTechnicallyAffected(attemptId, ticketId, studentId);

    expect(result.attemptId).toBe(attemptId);
    expect(result.ticketId).toBe(ticketId);
    expect(result.teacherNotified).toBe(true);

    // Verify attempt status in DB
    const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
    expect(attempt!.status).toBe("TECHNICALLY_AFFECTED");

    // Verify SupportTicket status escalated
    const ticket = await prisma.supportTicket.findUnique({ where: { id: ticketId } });
    expect(ticket!.status).toBe("ESCALATED");
  });
});

// ---------------------------------------------------------------------------
// INT-SUP-004: teacher list of technically-affected attempts
// ---------------------------------------------------------------------------

describe("INT-SUP-004: teacher list of technically-affected attempts (live Postgres)", () => {
  it("returns only teacher-scoped course attempts", async () => {
    const service = buildService();

    // Query for the teacher's course specifically
    const results = await service.listTechnicallyAffectedAttempts(
      teacherAId,
      teacherAScopes(),
      courseId,
    );

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThanOrEqual(1);

    // The seeded attempt must appear in the list
    const found = results.find((r) => (r as Record<string, unknown>)["id"] === attemptId);
    expect(found).toBeDefined();
  });

  it("teacher without scope for this course is forbidden", async () => {
    const service = buildService();

    // Teacher B scopes: a different course -- should be Forbidden
    const teacherBScopes: UserScope[] = [
      { role: "TEACHER", scopeType: "COURSE", scopeId: "other-course-not-seeded" },
    ];

    await expect(
      service.listTechnicallyAffectedAttempts(teacherAId, teacherBScopes, courseId),
    ).rejects.toThrow(ForbiddenException);
  });
});

// ---------------------------------------------------------------------------
// INT-SUP-005: confirm-failure -- TECHNICALLY_AFFECTED -> TECHNICAL_FAILURE_CONFIRMED
// ---------------------------------------------------------------------------

describe("INT-SUP-005: confirm-failure transition (live Postgres)", () => {
  it("transitions to TECHNICAL_FAILURE_CONFIRMED", async () => {
    const service = buildService();

    const result = await service.confirmTechnicalFailure(
      attemptId,
      teacherAId,
      teacherAScopes(),
    );

    expect(result.attemptId).toBe(attemptId);
    expect(result.status).toBe("TECHNICAL_FAILURE_CONFIRMED");

    // Verify in DB
    const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
    expect(attempt!.status).toBe("TECHNICAL_FAILURE_CONFIRMED");
  });
});

// ---------------------------------------------------------------------------
// INT-SUP-006: authorise-retry happy path -- RETRY_AUTHORISED
// ---------------------------------------------------------------------------

describe("INT-SUP-006: authorise-retry happy path (live Postgres)", () => {
  it("transitions to RETRY_AUTHORISED and returns result shape", async () => {
    const service = buildService();

    const result = await service.authoriseRetry(
      attemptId,
      { teacherNote: "Integration test: authorise retry." },
      teacherAId,
      teacherAScopes(),
    );

    expect(result.attemptId).toBe(attemptId);
    expect(result.newStatus).toBe("RETRY_AUTHORISED");
    expect(result.previousStatus).toBe("TECHNICAL_FAILURE_CONFIRMED");
    expect(result.authorisedBy).toBe(teacherAId);
    expect(typeof result.authorisedAt).toBe("string");

    // Verify in DB
    const attempt = await prisma.attempt.findUnique({ where: { id: attemptId } });
    expect(attempt!.status).toBe("RETRY_AUTHORISED");
  });
});

// ---------------------------------------------------------------------------
// INT-SUP-007: authorise-retry -- student JWT -> 403
// ---------------------------------------------------------------------------

describe("INT-SUP-007: authorise-retry student forbidden (live Postgres)", () => {
  it("returns 403 ForbiddenException for student scopes", async () => {
    // Attempt is now RETRY_AUTHORISED (from INT-SUP-006).
    // Auth check (isTeacherOfCourse) fires before state-transition check,
    // so the student gets 403 regardless of attempt status.
    const service = buildService();

    await expect(
      service.authoriseRetry(attemptId, {}, studentId, studentScopes()),
    ).rejects.toThrow(ForbiddenException);
  });
});

// ---------------------------------------------------------------------------
// INT-SUP-008: authorise-retry -- illegal transition COMPLETED -> RETRY_AUTHORISED -> 422
// ---------------------------------------------------------------------------

describe("INT-SUP-008: authorise-retry illegal transition (live Postgres)", () => {
  it("returns 422 UnprocessableEntityException for COMPLETED -> RETRY_AUTHORISED", async () => {
    // completedAttemptId was seeded with status=COMPLETED.
    // COMPLETED -> RETRY_AUTHORISED is not in ACADEMIC_SAFETY_TRANSITIONS.
    const service = buildService();

    await expect(
      service.authoriseRetry(
        completedAttemptId,
        {},
        teacherAId,
        teacherAScopes(),
      ),
    ).rejects.toThrow(UnprocessableEntityException);

    // Verify DB: attempt status unchanged (still COMPLETED)
    const attempt = await prisma.attempt.findUnique({ where: { id: completedAttemptId } });
    expect(attempt!.status).toBe("COMPLETED");
  });
});
