/**
 * SimulationService.getPatientStateLogs -- RBAC scope-enforcement unit tests
 * (APS-REQ-017, Sprint 2 Inc 3)
 *
 * Mocks Prisma -- no live DB required.
 * Follows the mocking pattern from simulation-soft-warn.spec.ts.
 *
 * Cases:
 *   (a) TEACHER with matching courseId -> returns rows
 *   (b) TEACHER with a DIFFERENT courseId -> throws ForbiddenException
 *   (c) SYSTEM_ADMIN -> returns rows (scope bypass)
 *   (d) attempt not found -> throws NotFoundException
 */

import { SimulationService } from "../simulation/simulation.service.js";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import type { UserScope } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Fixture constants
// ---------------------------------------------------------------------------

const ATTEMPT_ID = "attempt-rbac-unit-001";
const COURSE_A_ID = "course-a-001";
const COURSE_B_ID = "course-b-002";
const COLLEGE_ID = "college-001";
const TEACHER_A_ID = "teacher-a-001";
const TEACHER_B_ID = "teacher-b-002";
const ADMIN_ID = "admin-001";

const FAKE_STATE_LOG_ROWS = [
  {
    id: "log-row-1",
    attemptId: ATTEMPT_ID,
    turnNumber: 1,
    trust: 0.3,
    openness: 0.2,
    emotionalActiv: 0.4,
    avoidanceLevel: 0.6,
    defensiveness: 0.5,
    allianceQuality: 0.2,
    disclosureReady: 0.1,
    riskRelevance: 0.0,
    unlockedFactIds: [],
    pendingTriggers: [],
    analyserOutput: {},
    challengeLevel: 2,
    guardResult: "PASS",
    guardDetail: null,
    summarisedUpTo: null,
    contextSummary: null,
  },
  {
    id: "log-row-2",
    attemptId: ATTEMPT_ID,
    turnNumber: 2,
    trust: 0.35,
    openness: 0.25,
    emotionalActiv: 0.42,
    avoidanceLevel: 0.58,
    defensiveness: 0.48,
    allianceQuality: 0.22,
    disclosureReady: 0.12,
    riskRelevance: 0.0,
    unlockedFactIds: [],
    pendingTriggers: [],
    analyserOutput: {},
    challengeLevel: 2,
    guardResult: "PASS",
    guardDetail: null,
    summarisedUpTo: null,
    contextSummary: null,
  },
];

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

/**
 * Build a minimal Prisma mock that:
 *   - attempt.findUnique returns an attempt with assignment.courseId = COURSE_A_ID
 *   - patientStateLog.findMany returns FAKE_STATE_LOG_ROWS
 *   - all other methods are no-ops (not called in getPatientStateLogs)
 */
function makePrismaWithAttempt() {
  return {
    attempt: {
      findUnique: jest.fn().mockResolvedValue({
        id: ATTEMPT_ID,
        userId: "student-001",
        status: "COMPLETED",
        assignment: {
          courseId: COURSE_A_ID,
        },
      }),
    },
    patientStateLog: {
      findMany: jest.fn().mockResolvedValue(FAKE_STATE_LOG_ROWS),
    },
  };
}

/** Prisma mock where attempt is not found (null). */
function makePrismaNoAttempt() {
  return {
    attempt: {
      findUnique: jest.fn().mockResolvedValue(null),
    },
    patientStateLog: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };
}

/** Build a minimal pipeline stub (not called in getPatientStateLogs). */
function makeNullPipeline() {
  return { run: jest.fn() };
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SimulationService.getPatientStateLogs -- RBAC scope enforcement (unit, mocked Prisma)", () => {
  it("(a) TEACHER with matching courseId receives state-log rows", async () => {
    const prisma = makePrismaWithAttempt();
    const service = new SimulationService(prisma as never, makeNullPipeline() as never);

    const result = await service.getPatientStateLogs(ATTEMPT_ID, TEACHER_A_ID, teacherAScopes());

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
    expect((result[0] as Record<string, unknown>)["attemptId"]).toBe(ATTEMPT_ID);
  });

  it("(a) returned rows contain expected turn fields", async () => {
    const prisma = makePrismaWithAttempt();
    const service = new SimulationService(prisma as never, makeNullPipeline() as never);

    const result = await service.getPatientStateLogs(ATTEMPT_ID, TEACHER_A_ID, teacherAScopes());

    const first = result[0] as Record<string, unknown>;
    expect(first["turnNumber"]).toBe(1);
    expect(first["trust"]).toBe(0.3);
    expect(first["guardResult"]).toBe("PASS");
  });

  it("(b) TEACHER with a DIFFERENT courseId throws ForbiddenException", async () => {
    const prisma = makePrismaWithAttempt();
    const service = new SimulationService(prisma as never, makeNullPipeline() as never);

    await expect(
      service.getPatientStateLogs(ATTEMPT_ID, TEACHER_B_ID, teacherBScopes()),
    ).rejects.toThrow(ForbiddenException);
  });

  it("(b) TEACHER with wrong courseId does NOT receive rows", async () => {
    const prisma = makePrismaWithAttempt();
    const service = new SimulationService(prisma as never, makeNullPipeline() as never);

    let threw = false;
    try {
      await service.getPatientStateLogs(ATTEMPT_ID, TEACHER_B_ID, teacherBScopes());
    } catch {
      threw = true;
    }

    expect(threw).toBe(true);
    // patientStateLog.findMany must not have been called
    expect(prisma.patientStateLog.findMany).not.toHaveBeenCalled();
  });

  it("(c) SYSTEM_ADMIN receives state-log rows regardless of course scope", async () => {
    const prisma = makePrismaWithAttempt();
    const service = new SimulationService(prisma as never, makeNullPipeline() as never);

    const result = await service.getPatientStateLogs(ATTEMPT_ID, ADMIN_ID, adminScopes());

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(2);
  });

  it("(d) non-existent attemptId throws NotFoundException", async () => {
    const prisma = makePrismaNoAttempt();
    const service = new SimulationService(prisma as never, makeNullPipeline() as never);

    await expect(
      service.getPatientStateLogs("00000000-0000-0000-0000-000000000000", TEACHER_A_ID, teacherAScopes()),
    ).rejects.toThrow(NotFoundException);
  });

  it("(d) NotFoundException does not trigger patientStateLog query", async () => {
    const prisma = makePrismaNoAttempt();
    const service = new SimulationService(prisma as never, makeNullPipeline() as never);

    try {
      await service.getPatientStateLogs("missing-id", TEACHER_A_ID, teacherAScopes());
    } catch {
      // expected
    }

    expect(prisma.patientStateLog.findMany).not.toHaveBeenCalled();
  });
});
