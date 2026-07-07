/**
 * SupportService unit tests (APS-REQ-105/106/107/108/109/118/119/120/121)
 *
 * Mocked Prisma -- no live DB.
 *
 * Cases:
 *   (a) createTicket: persists DiagnosticLog + SupportTicket, returns confirmation
 *   (b) createTicket: emailSent=true set on ticket
 *   (c) flagTechnicallyAffected: transitions IN_PROGRESS -> TECHNICALLY_AFFECTED
 *   (d) flagTechnicallyAffected: wrong owner throws ForbiddenException
 *   (e) flagTechnicallyAffected: illegal transition throws UnprocessableEntityException
 *   (f) confirmTechnicalFailure: TECHNICALLY_AFFECTED -> TECHNICAL_FAILURE_CONFIRMED (teacher)
 *   (g) confirmTechnicalFailure: other-course teacher throws ForbiddenException
 *   (h) confirmTechnicalFailure: admin bypasses scope check
 *   (i) authoriseRetry: TECHNICAL_FAILURE_CONFIRMED -> RETRY_AUTHORISED (teacher-of-course)
 *   (j) authoriseRetry: student/other forbidden
 *   (k) authoriseRetry: admin allowed
 *   (l) illegal status transition rejected (COMPLETED -> RETRY_AUTHORISED)
 *   (m) listTechnicallyAffectedAttempts: teacher sees own course, not other
 *   (n) createTicket: attempt not found is handled (no attempt required for ticket)
 */

import { SupportService } from "../support/support.service.js";
import {
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from "@nestjs/common";
import type { UserScope } from "@aps/shared-types";
import type { CreateSupportTicketDto } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Fixture constants
// ---------------------------------------------------------------------------

const ATTEMPT_ID = "attempt-support-001";
const COURSE_A_ID = "course-a-sup-001";
const COURSE_B_ID = "course-b-sup-002";
const COLLEGE_ID = "college-sup-001";
const STUDENT_ID = "student-sup-001";
const OTHER_STUDENT_ID = "other-student-sup-002";
const TEACHER_A_ID = "teacher-a-sup-001";
const TEACHER_B_ID = "teacher-b-sup-002";
const ADMIN_ID = "admin-sup-001";
const ASSIGNMENT_ID = "assignment-sup-001";
const TICKET_ID = "ticket-sup-001";
const DIAG_LOG_ID = "diag-log-001";

// ---------------------------------------------------------------------------
// Fake attempt rows
// ---------------------------------------------------------------------------

function fakeAttempt(status: string, userId: string = STUDENT_ID) {
  return {
    id: ATTEMPT_ID,
    userId,
    status,
    assignment: {
      id: ASSIGNMENT_ID,
      courseId: COURSE_A_ID,
    },
  };
}

// ---------------------------------------------------------------------------
// Prisma mock factories
// ---------------------------------------------------------------------------

function makePrismaForTicket() {
  return {
    diagnosticLog: {
      create: jest.fn().mockResolvedValue({ id: DIAG_LOG_ID }),
    },
    supportTicket: {
      create: jest.fn().mockResolvedValue({
        id: TICKET_ID,
        userId: STUDENT_ID,
        issueCategory: "AI_RESPONSE_FAILURE",
        status: "OPEN",
        emailSent: true,
        emailSentAt: new Date(),
      }),
      update: jest.fn().mockResolvedValue({ id: TICKET_ID }),
    },
    attempt: {
      findUnique: jest.fn().mockResolvedValue(fakeAttempt("IN_PROGRESS")),
      update: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: ATTEMPT_ID, status: args.data["status"] }),
      ),
    },
  };
}

function makePrismaForFlag(
  attemptStatus: string,
  attemptUserId: string = STUDENT_ID,
  ticketUserId: string = STUDENT_ID,
) {
  return {
    attempt: {
      findUnique: jest.fn().mockResolvedValue(fakeAttempt(attemptStatus, attemptUserId)),
      update: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: ATTEMPT_ID, status: args.data["status"] }),
      ),
    },
    supportTicket: {
      // MAJOR-3: findUnique needed for ticket ownership check
      findUnique: jest.fn().mockResolvedValue({ id: TICKET_ID, userId: ticketUserId }),
      update: jest.fn().mockResolvedValue({ id: TICKET_ID }),
    },
    diagnosticLog: {
      create: jest.fn().mockResolvedValue({ id: DIAG_LOG_ID }),
    },
  };
}

function makePrismaForConfirm(attemptStatus: string) {
  return {
    attempt: {
      findUnique: jest.fn().mockResolvedValue(fakeAttempt(attemptStatus)),
      update: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: ATTEMPT_ID, status: args.data["status"] }),
      ),
    },
    supportTicket: {
      update: jest.fn().mockResolvedValue({ id: TICKET_ID }),
    },
    diagnosticLog: {
      create: jest.fn().mockResolvedValue({ id: DIAG_LOG_ID }),
    },
  };
}

function makePrismaForRetry(attemptStatus: string) {
  return {
    attempt: {
      findUnique: jest.fn().mockResolvedValue(fakeAttempt(attemptStatus)),
      update: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: ATTEMPT_ID, status: args.data["status"] }),
      ),
    },
    supportTicket: {
      update: jest.fn().mockResolvedValue({ id: TICKET_ID }),
    },
    diagnosticLog: {
      create: jest.fn().mockResolvedValue({ id: DIAG_LOG_ID }),
    },
  };
}

function makePrismaForList(attempts: object[]) {
  return {
    attempt: {
      findMany: jest.fn().mockResolvedValue(attempts),
      findUnique: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({}),
    },
    supportTicket: {
      update: jest.fn().mockResolvedValue({}),
    },
    diagnosticLog: {
      create: jest.fn().mockResolvedValue({ id: DIAG_LOG_ID }),
    },
  };
}

// ---------------------------------------------------------------------------
// Scope helpers
// ---------------------------------------------------------------------------

function teacherAScopes(): UserScope[] {
  return [{ role: "TEACHER", scopeType: "COURSE", scopeId: COURSE_A_ID }];
}

function teacherBScopes(): UserScope[] {
  return [{ role: "TEACHER", scopeType: "COURSE", scopeId: COURSE_B_ID }];
}

function adminScopes(): UserScope[] {
  return [{ role: "SYSTEM_ADMIN", scopeType: "COLLEGE", scopeId: COLLEGE_ID }];
}

function studentScopes(): UserScope[] {
  return [{ role: "STUDENT", scopeType: "COURSE", scopeId: COURSE_A_ID }];
}

// ---------------------------------------------------------------------------
// Ticket DTO factory
// ---------------------------------------------------------------------------

function makeTicketDto(): CreateSupportTicketDto {
  return {
    userId: STUDENT_ID,
    userRole: "STUDENT",
    issueCategory: "AI_RESPONSE_FAILURE",
    browserDevice: "Chrome/Windows",
    errorCodes: ["ERR_AI_TIMEOUT"],
    attemptId: ATTEMPT_ID,
    courseId: COURSE_A_ID,
    assignmentId: ASSIGNMENT_ID,
    userFreeText: "The AI stopped responding mid-session.",
    diagnosticState: {
      userAgent: "Mozilla/5.0",
      micPermission: "granted",
      simulationLoaded: true,
      lastApiStatus: 504,
      clientErrorCodes: ["ERR_AI_TIMEOUT"],
      attemptId: ATTEMPT_ID,
      assignmentId: ASSIGNMENT_ID,
      courseId: COURSE_A_ID,
    },
  };
}

// ---------------------------------------------------------------------------
// (a) createTicket: persists DiagnosticLog + SupportTicket, returns confirmation
// ---------------------------------------------------------------------------

describe("SupportService.createTicket (APS-REQ-105/106/107/108/109)", () => {
  it("(a) creates DiagnosticLog and SupportTicket, returns confirmation with ticketId", async () => {
    const prisma = makePrismaForTicket();
    const service = new SupportService(prisma as never);

    const result = await service.createTicket(makeTicketDto());

    expect(prisma.diagnosticLog.create).toHaveBeenCalled();
    expect(prisma.supportTicket.create).toHaveBeenCalled();
    expect(result.ticketId).toBe(TICKET_ID);
    expect(result.notifiedEmail).toBeTruthy();
    expect(typeof result.expectedResponseHours).toBe("number");
  });

  it("(a) routes AI_RESPONSE_FAILURE:COURSE to academic-support email", async () => {
    const prisma = makePrismaForTicket();
    const service = new SupportService(prisma as never);

    const result = await service.createTicket(makeTicketDto());

    expect(result.notifiedEmail).toBe("academic-support@aps.pilot");
    expect(result.expectedResponseHours).toBe(1);
  });

  it("(b) ticket is created with emailSent=true and emailSentAt set", async () => {
    const prisma = makePrismaForTicket();
    const service = new SupportService(prisma as never);

    await service.createTicket(makeTicketDto());

    const createCall = (prisma.supportTicket.create as jest.Mock).mock.calls[0] as [{ data: Record<string, unknown> }];
    expect(createCall[0].data["emailSent"]).toBe(true);
    expect(createCall[0].data["emailSentAt"]).toBeInstanceOf(Date);
  });

  it("(a) DiagnosticLog is created with redacted payload (no token in payload)", async () => {
    const prisma = makePrismaForTicket();
    const service = new SupportService(prisma as never);

    const dto = makeTicketDto();
    // Inject a token into the diagnostic state to verify redaction
    (dto.diagnosticState as unknown as Record<string, unknown>)["token"] = "eyJ.abc.sig";
    await service.createTicket(dto);

    const diagCreate = (prisma.diagnosticLog.create as jest.Mock).mock.calls[0] as [{ data: { payload: Record<string, unknown> } }];
    const payload = diagCreate[0].data["payload"] as Record<string, unknown>;
    expect(payload["token"]).toBe("[REDACTED]");
  });

  it("(BLOCKER-3) unknown sensitive key on diagnosticState is redacted from DiagnosticLog payload", async () => {
    // APS-REQ-106 privacy boundary. The controller uses @ValidateNested() + GlobalDiagnosticStateDto
    // with whitelist:true so unknown keys never reach the service. This test verifies that IF
    // an unknown key somehow enters the service payload (e.g. in older code with bare @IsObject()),
    // the redactor at least catches known-sensitive patterns. The primary guard is the controller
    // DTO boundary; the redactor is the secondary safety net.
    //
    // Simulates a caller injecting 'personaPrompt' (a sensitive field the redactor handles)
    // into diagnosticState. After the controller fix, this field is stripped before service
    // entry. This test confirms it does NOT appear unredacted in the persisted DiagnosticLog.
    const prisma = makePrismaForTicket();
    const service = new SupportService(prisma as never);

    const dto = makeTicketDto();
    (dto.diagnosticState as unknown as Record<string, unknown>)["personaPrompt"] =
      "You are a patient named Sarah. You have hidden trauma.";
    await service.createTicket(dto);

    const diagCreate = (prisma.diagnosticLog.create as jest.Mock).mock.calls[0] as [
      { data: { payload: Record<string, unknown> } },
    ];
    const payload = diagCreate[0].data["payload"] as Record<string, unknown>;
    // The redactor must catch 'personaPrompt' (matches 'prompt' substring) and redact it.
    // If the controller DTO boundary is working, this field is stripped before reaching here.
    expect(payload["personaPrompt"]).toBe("[REDACTED]");
  });

  it("(a) ticket metadata does not include transcript text", async () => {
    const prisma = makePrismaForTicket();
    const service = new SupportService(prisma as never);

    await service.createTicket(makeTicketDto());

    const createCall = (prisma.supportTicket.create as jest.Mock).mock.calls[0] as [{ data: Record<string, unknown> }];
    const metadata = createCall[0].data["metadata"] as Record<string, unknown>;
    expect(metadata["transcriptText"]).toBeUndefined();
    expect(metadata["originalText"]).toBeUndefined();
  });

  it("uses GLOBAL scope routing when no courseId provided", async () => {
    const prisma = makePrismaForTicket();
    const service = new SupportService(prisma as never);

    const dto = makeTicketDto();
    delete dto.courseId;
    const result = await service.createTicket(dto);

    expect(result.notifiedEmail).toBe("platform@aps.pilot");
    expect(result.expectedResponseHours).toBe(4);
  });

  it("(BLOCKER-2) routes AI_RESPONSE_FAILURE:COLLEGE when collegeId present and courseId absent", async () => {
    // Before the fix: scope was always COURSE or GLOBAL, making COLLEGE routing dead.
    // collegeId is injected by the controller from JWT scopes; never from caller body.
    const prisma = makePrismaForTicket();
    const service = new SupportService(prisma as never);

    const dto = makeTicketDto();
    delete dto.courseId;
    dto.collegeId = COLLEGE_ID;
    const result = await service.createTicket(dto);

    // AI_RESPONSE_FAILURE:COLLEGE -> academic-support@aps.pilot / 2h
    expect(result.notifiedEmail).toBe("academic-support@aps.pilot");
    expect(result.expectedResponseHours).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// (c-e) flagTechnicallyAffected
// ---------------------------------------------------------------------------

describe("SupportService.flagTechnicallyAffected (APS-REQ-118)", () => {
  it("(c) IN_PROGRESS -> TECHNICALLY_AFFECTED transition succeeds", async () => {
    const prisma = makePrismaForFlag("IN_PROGRESS");
    const service = new SupportService(prisma as never);

    const result = await service.flagTechnicallyAffected(ATTEMPT_ID, TICKET_ID, STUDENT_ID);

    expect(result.attemptId).toBe(ATTEMPT_ID);
    expect(result.teacherNotified).toBe(true);

    const updateCall = (prisma.attempt.update as jest.Mock).mock.calls[0] as [{ data: Record<string, unknown> }];
    expect(updateCall[0].data["status"]).toBe("TECHNICALLY_AFFECTED");
  });

  it("(c) COMPLETED -> TECHNICALLY_AFFECTED transition succeeds", async () => {
    const prisma = makePrismaForFlag("COMPLETED");
    const service = new SupportService(prisma as never);

    const result = await service.flagTechnicallyAffected(ATTEMPT_ID, TICKET_ID, STUDENT_ID);
    expect(result.teacherNotified).toBe(true);
  });

  it("(d) wrong owner throws ForbiddenException", async () => {
    const prisma = makePrismaForFlag("IN_PROGRESS", STUDENT_ID);
    const service = new SupportService(prisma as never);

    await expect(
      service.flagTechnicallyAffected(ATTEMPT_ID, TICKET_ID, OTHER_STUDENT_ID),
    ).rejects.toThrow(ForbiddenException);
  });

  it("(e) illegal transition (ABANDONED -> TECHNICALLY_AFFECTED) throws UnprocessableEntityException", async () => {
    const prisma = makePrismaForFlag("ABANDONED");
    const service = new SupportService(prisma as never);

    await expect(
      service.flagTechnicallyAffected(ATTEMPT_ID, TICKET_ID, STUDENT_ID),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it("attempt not found throws NotFoundException", async () => {
    const prisma = {
      ...makePrismaForFlag("IN_PROGRESS"),
      attempt: {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
    };
    const service = new SupportService(prisma as never);

    await expect(
      service.flagTechnicallyAffected(ATTEMPT_ID, TICKET_ID, STUDENT_ID),
    ).rejects.toThrow(NotFoundException);
  });

  it("(MAJOR-3) ticket belonging to a different student throws ForbiddenException", async () => {
    // A student passes a valid ticketId that belongs to another student.
    // Before the fix, the service would stamp teacherVisible=true on that foreign ticket.
    const prisma = makePrismaForFlag("IN_PROGRESS", STUDENT_ID, OTHER_STUDENT_ID);
    const service = new SupportService(prisma as never);

    await expect(
      service.flagTechnicallyAffected(ATTEMPT_ID, TICKET_ID, STUDENT_ID),
    ).rejects.toThrow(ForbiddenException);
  });

  it("(MAJOR-3) ticket not found throws ForbiddenException", async () => {
    const prisma = makePrismaForFlag("IN_PROGRESS");
    (prisma.supportTicket.findUnique as jest.Mock).mockResolvedValue(null);
    const service = new SupportService(prisma as never);

    await expect(
      service.flagTechnicallyAffected(ATTEMPT_ID, TICKET_ID, STUDENT_ID),
    ).rejects.toThrow(ForbiddenException);
  });
});

// ---------------------------------------------------------------------------
// (f-h) confirmTechnicalFailure
// ---------------------------------------------------------------------------

describe("SupportService.confirmTechnicalFailure (APS-REQ-120)", () => {
  it("(f) TECHNICALLY_AFFECTED -> TECHNICAL_FAILURE_CONFIRMED (teacher-of-course)", async () => {
    const prisma = makePrismaForConfirm("TECHNICALLY_AFFECTED");
    const service = new SupportService(prisma as never);

    const result = await service.confirmTechnicalFailure(
      ATTEMPT_ID,
      TEACHER_A_ID,
      teacherAScopes(),
    );

    expect(result.status).toBe("TECHNICAL_FAILURE_CONFIRMED");
    const updateCall = (prisma.attempt.update as jest.Mock).mock.calls[0] as [{ data: Record<string, unknown> }];
    expect(updateCall[0].data["status"]).toBe("TECHNICAL_FAILURE_CONFIRMED");
  });

  it("(g) teacher of different course throws ForbiddenException", async () => {
    const prisma = makePrismaForConfirm("TECHNICALLY_AFFECTED");
    const service = new SupportService(prisma as never);

    await expect(
      service.confirmTechnicalFailure(ATTEMPT_ID, TEACHER_B_ID, teacherBScopes()),
    ).rejects.toThrow(ForbiddenException);
  });

  it("(h) admin can confirm regardless of course scope", async () => {
    const prisma = makePrismaForConfirm("TECHNICALLY_AFFECTED");
    const service = new SupportService(prisma as never);

    const result = await service.confirmTechnicalFailure(ATTEMPT_ID, ADMIN_ID, adminScopes());
    expect(result.status).toBe("TECHNICAL_FAILURE_CONFIRMED");
  });

  it("illegal transition (COMPLETED -> TECHNICAL_FAILURE_CONFIRMED) throws UnprocessableEntityException", async () => {
    const prisma = makePrismaForConfirm("COMPLETED");
    const service = new SupportService(prisma as never);

    await expect(
      service.confirmTechnicalFailure(ATTEMPT_ID, TEACHER_A_ID, teacherAScopes()),
    ).rejects.toThrow(UnprocessableEntityException);
  });
});

// ---------------------------------------------------------------------------
// (i-k) authoriseRetry
// ---------------------------------------------------------------------------

describe("SupportService.authoriseRetry (APS-REQ-121)", () => {
  it("(i) TECHNICAL_FAILURE_CONFIRMED -> RETRY_AUTHORISED (teacher-of-course)", async () => {
    const prisma = makePrismaForRetry("TECHNICAL_FAILURE_CONFIRMED");
    const service = new SupportService(prisma as never);

    const result = await service.authoriseRetry(
      ATTEMPT_ID,
      {},
      TEACHER_A_ID,
      teacherAScopes(),
    );

    expect(result.newStatus).toBe("RETRY_AUTHORISED");
    expect(result.authorisedBy).toBe(TEACHER_A_ID);
    expect(result.previousStatus).toBe("TECHNICAL_FAILURE_CONFIRMED");
  });

  it("(j) student throws ForbiddenException (studentScopes)", async () => {
    const prisma = makePrismaForRetry("TECHNICAL_FAILURE_CONFIRMED");
    const service = new SupportService(prisma as never);

    await expect(
      service.authoriseRetry(ATTEMPT_ID, {}, STUDENT_ID, studentScopes()),
    ).rejects.toThrow(ForbiddenException);
  });

  it("(j) teacher of different course throws ForbiddenException", async () => {
    const prisma = makePrismaForRetry("TECHNICAL_FAILURE_CONFIRMED");
    const service = new SupportService(prisma as never);

    await expect(
      service.authoriseRetry(ATTEMPT_ID, {}, TEACHER_B_ID, teacherBScopes()),
    ).rejects.toThrow(ForbiddenException);
  });

  it("(k) admin can authorise retry", async () => {
    const prisma = makePrismaForRetry("TECHNICAL_FAILURE_CONFIRMED");
    const service = new SupportService(prisma as never);

    const result = await service.authoriseRetry(ATTEMPT_ID, {}, ADMIN_ID, adminScopes());
    expect(result.newStatus).toBe("RETRY_AUTHORISED");
  });

  it("(l) illegal transition (COMPLETED -> RETRY_AUTHORISED) throws UnprocessableEntityException", async () => {
    const prisma = makePrismaForRetry("COMPLETED");
    const service = new SupportService(prisma as never);

    await expect(
      service.authoriseRetry(ATTEMPT_ID, {}, TEACHER_A_ID, teacherAScopes()),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it("(l) illegal transition (IN_PROGRESS -> RETRY_AUTHORISED) throws UnprocessableEntityException", async () => {
    const prisma = makePrismaForRetry("IN_PROGRESS");
    const service = new SupportService(prisma as never);

    await expect(
      service.authoriseRetry(ATTEMPT_ID, {}, TEACHER_A_ID, teacherAScopes()),
    ).rejects.toThrow(UnprocessableEntityException);
  });

  it("attempt not found throws NotFoundException", async () => {
    const prisma = {
      ...makePrismaForRetry("TECHNICAL_FAILURE_CONFIRMED"),
      attempt: {
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn(),
      },
    };
    const service = new SupportService(prisma as never);

    await expect(
      service.authoriseRetry(ATTEMPT_ID, {}, TEACHER_A_ID, teacherAScopes()),
    ).rejects.toThrow(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// (m) listTechnicallyAffectedAttempts -- teacher scope filtering (APS-REQ-119)
// ---------------------------------------------------------------------------

describe("SupportService.listTechnicallyAffectedAttempts (APS-REQ-119)", () => {
  const TECHNICALLY_AFFECTED_ATTEMPTS = [
    {
      id: ATTEMPT_ID,
      userId: STUDENT_ID,
      status: "TECHNICALLY_AFFECTED",
      assignment: { id: ASSIGNMENT_ID, courseId: COURSE_A_ID },
    },
    {
      id: "attempt-other-course",
      userId: "student-other",
      status: "TECHNICALLY_AFFECTED",
      assignment: { id: "assignment-b", courseId: COURSE_B_ID },
    },
  ];

  it("(m) teacher-of-course-A sees only course-A attempts when courseId specified", async () => {
    const courseAAttempts = TECHNICALLY_AFFECTED_ATTEMPTS.filter(
      (a) => a.assignment.courseId === COURSE_A_ID,
    );
    const prisma = makePrismaForList(courseAAttempts);
    const service = new SupportService(prisma as never);

    const result = await service.listTechnicallyAffectedAttempts(
      TEACHER_A_ID,
      teacherAScopes(),
      COURSE_A_ID,
    );

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });

  it("(m) teacher-of-course-A cannot query course-B scope", async () => {
    const prisma = makePrismaForList(TECHNICALLY_AFFECTED_ATTEMPTS);
    const service = new SupportService(prisma as never);

    await expect(
      service.listTechnicallyAffectedAttempts(TEACHER_A_ID, teacherAScopes(), COURSE_B_ID),
    ).rejects.toThrow(ForbiddenException);
  });

  it("(m) admin sees all technically-affected attempts", async () => {
    const prisma = makePrismaForList(TECHNICALLY_AFFECTED_ATTEMPTS);
    const service = new SupportService(prisma as never);

    const result = await service.listTechnicallyAffectedAttempts(
      ADMIN_ID,
      adminScopes(),
    );

    expect(result.length).toBe(2);
  });

  it("(m) teacher with no TEACHER scope throws ForbiddenException", async () => {
    const prisma = makePrismaForList(TECHNICALLY_AFFECTED_ATTEMPTS);
    const service = new SupportService(prisma as never);

    await expect(
      service.listTechnicallyAffectedAttempts(STUDENT_ID, studentScopes()),
    ).rejects.toThrow(ForbiddenException);
  });
});

// ---------------------------------------------------------------------------
// Status transition table completeness
// ---------------------------------------------------------------------------

describe("ACADEMIC_SAFETY_TRANSITIONS -- status transition rules (APS-REQ-118/119/120/121)", () => {
  it("TECHNICALLY_AFFECTED -> TECHNICAL_FAILURE_CONFIRMED is allowed", () => {
    const { ACADEMIC_SAFETY_TRANSITIONS } = require("@aps/shared-types");
    expect(ACADEMIC_SAFETY_TRANSITIONS["TECHNICALLY_AFFECTED"]).toContain("TECHNICAL_FAILURE_CONFIRMED");
  });

  it("TECHNICAL_FAILURE_CONFIRMED -> RETRY_AUTHORISED is allowed", () => {
    const { ACADEMIC_SAFETY_TRANSITIONS } = require("@aps/shared-types");
    expect(ACADEMIC_SAFETY_TRANSITIONS["TECHNICAL_FAILURE_CONFIRMED"]).toContain("RETRY_AUTHORISED");
  });

  it("RETRY_AUTHORISED -> IN_PROGRESS is allowed (student can resume)", () => {
    const { ACADEMIC_SAFETY_TRANSITIONS } = require("@aps/shared-types");
    expect(ACADEMIC_SAFETY_TRANSITIONS["RETRY_AUTHORISED"]).toContain("IN_PROGRESS");
    // JC-2 re-entry: SimulationService.processTurn only rejects COMPLETED/ABANDONED.
    // RETRY_AUTHORISED is NOT in the rejection list, so the student can re-enter
    // via the existing simulation-start/turn path without any code change.
    // Verified 2026-07-04 (simulation.service.ts line 52).
  });

  it("ABANDONED has no outbound transitions (terminal state)", () => {
    const { ACADEMIC_SAFETY_TRANSITIONS } = require("@aps/shared-types");
    expect(ACADEMIC_SAFETY_TRANSITIONS["ABANDONED"]).toHaveLength(0);
  });

  it("EVALUATED has no outbound transitions (terminal state)", () => {
    const { ACADEMIC_SAFETY_TRANSITIONS } = require("@aps/shared-types");
    expect(ACADEMIC_SAFETY_TRANSITIONS["EVALUATED"]).toHaveLength(0);
  });

  it("IN_PROGRESS -> TECHNICALLY_AFFECTED is allowed", () => {
    const { ACADEMIC_SAFETY_TRANSITIONS } = require("@aps/shared-types");
    expect(ACADEMIC_SAFETY_TRANSITIONS["IN_PROGRESS"]).toContain("TECHNICALLY_AFFECTED");
  });
});
