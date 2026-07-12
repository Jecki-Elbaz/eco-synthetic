/**
 * SimulationService.getTranscript unit tests (Item F -- TRACK-A-GAL)
 *
 * Mocked Prisma -- no live DB required.
 *
 * Covers:
 *   (a) Student can read own attempt transcript
 *   (b) Student cannot read another student's transcript (ForbiddenException)
 *   (c) Teacher-of-course can read any attempt in their course
 *   (d) Teacher of a DIFFERENT course cannot read the attempt (ForbiddenException)
 *   (e) SYSTEM_ADMIN can read any attempt
 *   (f) Non-existent attempt -> NotFoundException
 *   (g) Response shape: each item has turnIndex, studentInput, patientResponse, timestamp
 *   (h) STUDENT and PATIENT messages are paired by turnNumber
 *   (i) Empty message list -> empty array returned
 */

import { SimulationService } from "../simulation/simulation.service.js";
import { NotFoundException, ForbiddenException } from "@nestjs/common";
import type { UserScope } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ATTEMPT_ID = "attempt-tr-001";
const COURSE_ID = "course-tr-001";
const STUDENT_ID = "student-tr-001";
const OTHER_STUDENT_ID = "student-tr-002";
const TEACHER_ID = "teacher-tr-001";
const ADMIN_ID = "admin-tr-001";
const OTHER_COURSE_ID = "course-tr-other";

function makeAttempt(userId = STUDENT_ID) {
  return {
    id: ATTEMPT_ID,
    userId,
    assignment: { courseId: COURSE_ID },
  };
}

function makeMessages() {
  const base = new Date("2026-07-09T10:00:00.000Z");
  return [
    {
      role: "STUDENT",
      turnNumber: 1,
      originalText: "Hello patient.",
      sentAt: new Date(base.getTime()),
    },
    {
      role: "PATIENT",
      turnNumber: 1,
      originalText: "Hello student.",
      sentAt: new Date(base.getTime() + 1000),
    },
    {
      role: "STUDENT",
      turnNumber: 2,
      originalText: "How are you?",
      sentAt: new Date(base.getTime() + 2000),
    },
    {
      role: "PATIENT",
      turnNumber: 2,
      originalText: "I am fine.",
      sentAt: new Date(base.getTime() + 3000),
    },
  ];
}

function makeScopes(role: string, scopeId: string): UserScope[] {
  return [{ role: role as UserScope["role"], scopeType: "COURSE", scopeId }];
}

function makeAdminScopes(): UserScope[] {
  return [{ role: "SYSTEM_ADMIN", scopeType: "COLLEGE", scopeId: "college-001" }];
}

// ---------------------------------------------------------------------------
// Minimal mock of PrismaService
// ---------------------------------------------------------------------------

function makePrismaMock(
  attempt: ReturnType<typeof makeAttempt> | null,
  messages: ReturnType<typeof makeMessages>,
) {
  return {
    attempt: {
      findUnique: jest.fn().mockResolvedValue(attempt),
    },
    message: {
      findMany: jest.fn().mockResolvedValue(messages),
    },
  };
}

// ---------------------------------------------------------------------------
// Helper to build SimulationService with only the prisma dependency needed
// ---------------------------------------------------------------------------

function makeService(prisma: ReturnType<typeof makePrismaMock>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new SimulationService(
    prisma as any,
    {} as any,
    { generateEvaluation: jest.fn().mockResolvedValue({}) } as any,
    { loadArcContext: jest.fn().mockResolvedValue(null) } as any,
    { writeSessionSummary: jest.fn().mockResolvedValue(undefined) } as any,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SimulationService.getTranscript", () => {
  it("(a) student reads own attempt", async () => {
    const prisma = makePrismaMock(makeAttempt(STUDENT_ID), makeMessages());
    const svc = makeService(prisma);
    const result = await svc.getTranscript(
      ATTEMPT_ID,
      STUDENT_ID,
      makeScopes("STUDENT", COURSE_ID),
    );
    expect(result).toHaveLength(2);
  });

  it("(b) student CANNOT read another student's attempt", async () => {
    const prisma = makePrismaMock(makeAttempt(STUDENT_ID), makeMessages());
    const svc = makeService(prisma);
    await expect(
      svc.getTranscript(
        ATTEMPT_ID,
        OTHER_STUDENT_ID,
        makeScopes("STUDENT", COURSE_ID),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("(c) teacher-of-course can read attempt", async () => {
    const prisma = makePrismaMock(makeAttempt(STUDENT_ID), makeMessages());
    const svc = makeService(prisma);
    const result = await svc.getTranscript(
      ATTEMPT_ID,
      TEACHER_ID,
      makeScopes("TEACHER", COURSE_ID),
    );
    expect(result).toHaveLength(2);
  });

  it("(d) teacher of DIFFERENT course cannot read attempt", async () => {
    const prisma = makePrismaMock(makeAttempt(STUDENT_ID), makeMessages());
    const svc = makeService(prisma);
    await expect(
      svc.getTranscript(
        ATTEMPT_ID,
        TEACHER_ID,
        makeScopes("TEACHER", OTHER_COURSE_ID),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("(e) SYSTEM_ADMIN reads any attempt", async () => {
    const prisma = makePrismaMock(makeAttempt(STUDENT_ID), makeMessages());
    const svc = makeService(prisma);
    const result = await svc.getTranscript(
      ATTEMPT_ID,
      ADMIN_ID,
      makeAdminScopes(),
    );
    expect(result).toHaveLength(2);
  });

  it("(f) non-existent attempt throws NotFoundException", async () => {
    const prisma = makePrismaMock(null, []);
    const svc = makeService(prisma);
    await expect(
      svc.getTranscript(ATTEMPT_ID, STUDENT_ID, makeScopes("STUDENT", COURSE_ID)),
    ).rejects.toThrow(NotFoundException);
  });

  it("(g) response shape: each item has turnIndex, studentInput, patientResponse, timestamp", async () => {
    const prisma = makePrismaMock(makeAttempt(STUDENT_ID), makeMessages());
    const svc = makeService(prisma);
    const result = await svc.getTranscript(
      ATTEMPT_ID,
      STUDENT_ID,
      makeScopes("STUDENT", COURSE_ID),
    );
    const first = result[0]!;
    expect(typeof first.turnIndex).toBe("number");
    expect(typeof first.studentInput).toBe("string");
    expect(typeof first.patientResponse).toBe("string");
    expect(typeof first.timestamp).toBe("string");
    // Timestamp must be a valid ISO string
    expect(() => new Date(first.timestamp)).not.toThrow();
    expect(new Date(first.timestamp).toISOString()).toBe(first.timestamp);
  });

  it("(h) STUDENT and PATIENT messages paired by turnNumber", async () => {
    const prisma = makePrismaMock(makeAttempt(STUDENT_ID), makeMessages());
    const svc = makeService(prisma);
    const result = await svc.getTranscript(
      ATTEMPT_ID,
      STUDENT_ID,
      makeScopes("STUDENT", COURSE_ID),
    );
    expect(result[0]).toMatchObject({
      turnIndex: 1,
      studentInput: "Hello patient.",
      patientResponse: "Hello student.",
    });
    expect(result[1]).toMatchObject({
      turnIndex: 2,
      studentInput: "How are you?",
      patientResponse: "I am fine.",
    });
  });

  it("(i) empty message list returns empty array", async () => {
    const prisma = makePrismaMock(makeAttempt(STUDENT_ID), []);
    const svc = makeService(prisma);
    const result = await svc.getTranscript(
      ATTEMPT_ID,
      STUDENT_ID,
      makeScopes("STUDENT", COURSE_ID),
    );
    expect(result).toEqual([]);
  });
});
