/**
 * DashboardService unit tests -- AUTHOR_PREVIEW exclusion filter (F1, Sprint 2 hardening 2026-07-09)
 *
 * Mocked Prisma -- no live DB required.
 *
 * Covers (APS-REQ-088/089, TRACK-A-GAL item B, Oren Finding 1):
 *   B1. getStudentDashboard: attempt.findMany called with type: { not: "AUTHOR_PREVIEW" }
 *   B2. getStudentDashboard: STUDENT-type completed attempt appears in completedSimulations
 *   B3. getStudentDashboard: empty completedSimulations when no attempts returned
 *   B4. getStudentDashboard: NotFoundException for unknown userId
 *   B5. getStudentDashboard: ForbiddenException when non-owner non-teacher actor requests
 *   B6. getStudentDashboard: finishedAt used as completedAt (fallback updatedAt)
 *   C1. getClassDashboard: attempt.findMany called with type: { not: "AUTHOR_PREVIEW" } (Oren Finding 1)
 *   C2. getClassDashboard: ForbiddenException for non-teacher non-admin
 *   C3. getClassDashboard: NotFoundException when course has no assignments
 */

import { DashboardService } from "../dashboard/dashboard.service.js";
import { NotFoundException, ForbiddenException } from "@nestjs/common";
import type { UserScope } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Fixture constants
// ---------------------------------------------------------------------------

const USER_ID = "user-dash-001";
const COURSE_ID = "course-dash-001";
const OTHER_ACTOR_ID = "other-actor-002";
const ATTEMPT_ID = "attempt-dash-001";
const RUBRIC_VERSION_ID = "rubric-dash-001";
const CRITERION_ID = "criterion-dash-001";

// ---------------------------------------------------------------------------
// Fake data factories
// ---------------------------------------------------------------------------

function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: USER_ID,
    displayName: "Test Student",
    roleAssignments: [
      {
        role: "STUDENT",
        scopeType: "COURSE",
        scopeId: COURSE_ID,
        userId: USER_ID,
        user: { displayName: "Test Student" },
      },
    ],
    ...overrides,
  };
}

function makeAttemptRow(overrides: Record<string, unknown> = {}) {
  return {
    id: ATTEMPT_ID,
    userId: USER_ID,
    status: "COMPLETED",
    finishedAt: new Date("2026-07-01T10:00:00Z"),
    updatedAt: new Date("2026-07-01T10:00:00Z"),
    assignment: {
      courseId: COURSE_ID,
      simulationTemplate: { title: "Test Simulation" },
      rubricVersion: {
        criteria: [
          {
            id: CRITERION_ID,
            labelKey: "empathy",
            labels: { he: "אמפתיה", en: "Empathy" },
            weight: 1,
            maxScore: 10,
          },
        ],
      },
    },
    evaluation: null,
    debriefMessages: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Prisma mock factory
// ---------------------------------------------------------------------------

function makePrisma(
  user: ReturnType<typeof makeUser> | null = makeUser(),
  attempts: ReturnType<typeof makeAttemptRow>[] = [],
) {
  return {
    user: {
      findUnique: jest.fn().mockResolvedValue(user),
    },
    attempt: {
      findMany: jest.fn().mockResolvedValue(attempts),
    },
    supportTicket: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };
}

// ---------------------------------------------------------------------------
// B1-B3: AUTHOR_PREVIEW exclusion filter
// ---------------------------------------------------------------------------

describe("DashboardService.getStudentDashboard -- AUTHOR_PREVIEW exclusion (F1)", () => {
  it("B1: attempt.findMany called with type: { not: 'AUTHOR_PREVIEW' }", async () => {
    const prisma = makePrisma();
    const svc = new DashboardService(prisma as never);

    await svc.getStudentDashboard(USER_ID, USER_ID, []);

    expect(prisma.attempt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: { not: "AUTHOR_PREVIEW" },
        }),
      }),
    );
  });

  it("B1b: where clause also filters userId and finishedAt: { not: null }", async () => {
    const prisma = makePrisma();
    const svc = new DashboardService(prisma as never);

    await svc.getStudentDashboard(USER_ID, USER_ID, []);

    expect(prisma.attempt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: USER_ID,
          finishedAt: { not: null },
          type: { not: "AUTHOR_PREVIEW" },
        }),
      }),
    );
  });

  it("B2: STUDENT-type completed attempt appears in completedSimulations", async () => {
    const attempt = makeAttemptRow();
    const prisma = makePrisma(makeUser(), [attempt]);
    const svc = new DashboardService(prisma as never);

    const result = await svc.getStudentDashboard(USER_ID, USER_ID, []);

    expect(result.completedSimulations).toHaveLength(1);
    expect(result.completedSimulations[0]!.attemptId).toBe(ATTEMPT_ID);
    expect(result.completedSimulations[0]!.title).toBe("Test Simulation");
  });

  it("B3: empty completedSimulations when no attempts returned", async () => {
    const prisma = makePrisma(makeUser(), []);
    const svc = new DashboardService(prisma as never);

    const result = await svc.getStudentDashboard(USER_ID, USER_ID, []);

    expect(result.completedSimulations).toHaveLength(0);
  });

  it("B6: completedAt uses finishedAt when set", async () => {
    const attempt = makeAttemptRow({ finishedAt: new Date("2026-07-05T08:00:00Z") });
    const prisma = makePrisma(makeUser(), [attempt]);
    const svc = new DashboardService(prisma as never);

    const result = await svc.getStudentDashboard(USER_ID, USER_ID, []);

    expect(result.completedSimulations[0]!.completedAt).toBe("2026-07-05T08:00:00.000Z");
  });
});

// ---------------------------------------------------------------------------
// B4: NotFoundException for unknown user
// ---------------------------------------------------------------------------

describe("DashboardService.getStudentDashboard -- NotFoundException", () => {
  it("B4: throws NotFoundException for unknown userId", async () => {
    const prisma = makePrisma(null);
    const svc = new DashboardService(prisma as never);

    await expect(
      svc.getStudentDashboard("unknown-user", "unknown-user", []),
    ).rejects.toThrow(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// B5: ForbiddenException for unauthorised actor
// ---------------------------------------------------------------------------

describe("DashboardService.getStudentDashboard -- ForbiddenException", () => {
  it("B5: non-owner non-teacher throws ForbiddenException", async () => {
    // OTHER_ACTOR_ID != USER_ID and does not teach any of USER_ID's courses
    const prisma = makePrisma();
    const svc = new DashboardService(prisma as never);

    // Actor has STUDENT role in a different course -- not a teacher of USER_ID's course
    await expect(
      svc.getStudentDashboard(USER_ID, OTHER_ACTOR_ID, [
        { role: "STUDENT", scopeType: "COURSE", scopeId: "other-course-999" },
      ]),
    ).rejects.toThrow(ForbiddenException);
  });

  it("B5b: actor with TEACHER role in a different course is also Forbidden", async () => {
    const prisma = makePrisma();
    const svc = new DashboardService(prisma as never);

    await expect(
      svc.getStudentDashboard(USER_ID, OTHER_ACTOR_ID, [
        { role: "TEACHER", scopeType: "COURSE", scopeId: "other-course-999" },
      ]),
    ).rejects.toThrow(ForbiddenException);
  });

  it("B5c: teacher of student's own course is allowed", async () => {
    const prisma = makePrisma();
    const svc = new DashboardService(prisma as never);

    // Teacher has TEACHER scope for COURSE_ID -- the course USER_ID is enrolled in
    const result = await svc.getStudentDashboard(USER_ID, "teacher-001", [
      { role: "TEACHER", scopeType: "COURSE", scopeId: COURSE_ID },
    ]);

    expect(result.userId).toBe(USER_ID);
  });
});

// ---------------------------------------------------------------------------
// Evaluation visibility: student vs teacher view
// ---------------------------------------------------------------------------

describe("DashboardService.getStudentDashboard -- evaluation visibility", () => {
  const CRITERION_SCORE = { score: 8, maxScore: 10 };

  function makeAttemptWithEval(status: string) {
    return makeAttemptRow({
      evaluation: {
        status,
        structuredScores: { [CRITERION_ID]: CRITERION_SCORE },
        transcriptHighlights: [],
      },
    });
  }

  it("student sees PUBLISHED evaluation score", async () => {
    const attempt = makeAttemptWithEval("PUBLISHED");
    const prisma = makePrisma(makeUser(), [attempt]);
    const svc = new DashboardService(prisma as never);

    const result = await svc.getStudentDashboard(USER_ID, USER_ID, []);

    expect(result.completedSimulations[0]!.hasEvaluation).toBe(true);
  });

  it("student does NOT see DRAFT evaluation (hasEvaluation=false)", async () => {
    const attempt = makeAttemptWithEval("DRAFT");
    const prisma = makePrisma(makeUser(), [attempt]);
    const svc = new DashboardService(prisma as never);

    const result = await svc.getStudentDashboard(USER_ID, USER_ID, []);

    // Student view: DRAFT eval is hidden
    expect(result.completedSimulations[0]!.hasEvaluation).toBe(false);
  });

  it("teacher sees DRAFT evaluation (hasEvaluation=true)", async () => {
    const attempt = makeAttemptWithEval("DRAFT");
    const prisma = makePrisma(makeUser(), [attempt]);
    const svc = new DashboardService(prisma as never);

    // Teacher viewing student's dashboard
    const result = await svc.getStudentDashboard(USER_ID, "teacher-001", [
      { role: "TEACHER", scopeType: "COURSE", scopeId: COURSE_ID },
    ]);

    // Teacher view: DRAFT eval IS visible
    expect(result.completedSimulations[0]!.hasEvaluation).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// C1-C3: getClassDashboard -- AUTHOR_PREVIEW exclusion (Oren Finding 1)
// ---------------------------------------------------------------------------

const ASSIGNMENT_ID_DASH = "assignment-dash-001";
const TEACHER_ID = "teacher-dash-001";
const COLLEGE_ID = "college-dash-001";

function makeCourse() {
  return {
    id: COURSE_ID,
    name: "Test Course",
    college: { id: COLLEGE_ID, name: "Test College" },
  };
}

function makeAssignmentRow() {
  return {
    id: ASSIGNMENT_ID_DASH,
    simulationTemplate: { title: "Test Sim" },
    rubricVersion: {
      criteria: [
        {
          id: CRITERION_ID,
          labelKey: "empathy",
          labels: { he: "אמפתיה", en: "Empathy" },
          weight: 1,
          maxScore: 10,
        },
      ],
    },
  };
}

function makeEnrolment(userId: string, displayName: string) {
  return {
    role: "STUDENT",
    scopeType: "COURSE",
    scopeId: COURSE_ID,
    userId,
    user: { displayName },
  };
}

function makeClassDashPrisma(
  courseExists = true,
  assignmentCount = 1,
  attempts: object[] = [],
) {
  return {
    course: {
      findUnique: jest.fn().mockResolvedValue(
        courseExists ? makeCourse() : null,
      ),
    },
    assignment: {
      findMany: jest.fn().mockResolvedValue(
        assignmentCount > 0 ? [makeAssignmentRow()] : [],
      ),
    },
    userRoleAssignment: {
      findMany: jest.fn().mockResolvedValue([
        makeEnrolment(USER_ID, "Test Student"),
      ]),
    },
    attempt: {
      findMany: jest.fn().mockResolvedValue(attempts),
    },
    user: {
      findUnique: jest.fn().mockResolvedValue({
        id: TEACHER_ID,
        displayName: "Test Teacher",
      }),
    },
  };
}

function teacherScopes(): UserScope[] {
  return [{ role: "TEACHER", scopeType: "COURSE", scopeId: COURSE_ID }];
}

describe("DashboardService.getClassDashboard -- AUTHOR_PREVIEW exclusion (Oren Finding 1, C1)", () => {
  it("C1: attempt.findMany called with type: { not: 'AUTHOR_PREVIEW' }", async () => {
    const prisma = makeClassDashPrisma();
    const svc = new DashboardService(prisma as never);

    await svc.getClassDashboard(COURSE_ID, TEACHER_ID, teacherScopes());

    expect(prisma.attempt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: { not: "AUTHOR_PREVIEW" },
        }),
      }),
    );
  });

  it("C1b: where clause also includes assignmentId and userId filter", async () => {
    const prisma = makeClassDashPrisma();
    const svc = new DashboardService(prisma as never);

    await svc.getClassDashboard(COURSE_ID, TEACHER_ID, teacherScopes());

    expect(prisma.attempt.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          assignmentId: ASSIGNMENT_ID_DASH,
          userId: expect.objectContaining({ in: expect.any(Array) }),
          type: { not: "AUTHOR_PREVIEW" },
        }),
      }),
    );
  });

  it("C2: non-teacher non-admin throws ForbiddenException", async () => {
    const prisma = makeClassDashPrisma();
    const svc = new DashboardService(prisma as never);

    await expect(
      svc.getClassDashboard(COURSE_ID, USER_ID, [
        { role: "STUDENT", scopeType: "COURSE", scopeId: COURSE_ID },
      ]),
    ).rejects.toThrow(ForbiddenException);
  });

  it("C3: NotFoundException when course has no assignments", async () => {
    const prisma = makeClassDashPrisma(true, 0);
    const svc = new DashboardService(prisma as never);

    await expect(
      svc.getClassDashboard(COURSE_ID, TEACHER_ID, teacherScopes()),
    ).rejects.toThrow(NotFoundException);
  });

  it("C4: student row shows NOT_STARTED when no attempts for that student", async () => {
    const prisma = makeClassDashPrisma(true, 1, []); // no attempts
    const svc = new DashboardService(prisma as never);

    const result = await svc.getClassDashboard(COURSE_ID, TEACHER_ID, teacherScopes());

    expect(result.students).toHaveLength(1);
    expect(result.students[0]!.status).toBe("NOT_STARTED");
    expect(result.students[0]!.overallScore).toBeNull();
  });
});
