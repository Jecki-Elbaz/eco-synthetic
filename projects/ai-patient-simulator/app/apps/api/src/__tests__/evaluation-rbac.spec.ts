/**
 * EvaluationService -- RBAC + business-rule unit tests (APS-REQ-068/070/071/072/076, Inc 4)
 *
 * Mocks Prisma -- no live DB required.
 * Mirrors the pattern from teacher-review-rbac.spec.ts.
 *
 * Cases:
 *   (a) generate: TEACHER of course allowed; other-course TEACHER forbidden; admin allowed.
 *   (b) get: student sees own PUBLISHED; student cannot see DRAFT; teacher sees DRAFT.
 *   (c) get: student of OTHER attempt cannot see any evaluation.
 *   (d) override: TEACHER of course allowed; other-course TEACHER forbidden; admin allowed.
 *   (e) override: publish sets status=PUBLISHED and publishedAt.
 *   (f) generate: regeneration of PUBLISHED raises ConflictException.
 */

import { EvaluationService } from "../evaluation/evaluation.service.js";
import {
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import type { UserScope } from "@aps/shared-types";
import type { EvaluatorOutput } from "@aps/engine";

// ---------------------------------------------------------------------------
// Fixture constants
// ---------------------------------------------------------------------------

const ATTEMPT_ID = "attempt-eval-unit-001";
const COURSE_A_ID = "course-eval-a-001";
const COURSE_B_ID = "course-eval-b-002";
const COLLEGE_ID = "college-eval-001";
const TEACHER_A_ID = "teacher-eval-a-001";
const TEACHER_B_ID = "teacher-eval-b-002";
const ADMIN_ID = "admin-eval-001";
const STUDENT_ID = "student-eval-001";
const OTHER_STUDENT_ID = "other-student-002";
const RUBRIC_VERSION_ID = "rubric-v1-001";

// ---------------------------------------------------------------------------
// Fake data
// ---------------------------------------------------------------------------

const FAKE_ATTEMPT_WITH_COURSE_A = {
  id: ATTEMPT_ID,
  userId: STUDENT_ID,
  status: "COMPLETED",
  assignment: {
    courseId: COURSE_A_ID,
    rubricVersion: {
      id: RUBRIC_VERSION_ID,
      criteria: [
        {
          id: "crit-001",
          weight: 0.5,
          maxScore: 10,
          scoringAnchors: {},
          competencyId: null,
          formativeOnly: false,
          labelKey: "empathy",
          labels: {},
        },
        {
          id: "crit-002",
          weight: 0.5,
          maxScore: 10,
          scoringAnchors: {},
          competencyId: null,
          formativeOnly: true,
          labelKey: "risk_awareness",
          labels: {},
        },
      ],
    },
  },
  messages: [
    { role: "STUDENT", turnNumber: 1, originalText: "Hello" },
    { role: "PATIENT", turnNumber: 1, originalText: "Hi there." },
  ],
  patientStateLogs: [
    { turnNumber: 1, analyserOutput: { empathy: 0.5 } },
  ],
};

const FAKE_EVALUATION_DRAFT = {
  id: "eval-001",
  attemptId: ATTEMPT_ID,
  rubricVersionId: RUBRIC_VERSION_ID,
  status: "DRAFT",
  structuredScores: { "crit-001": { score: 7, maxScore: 10, evidence: [], notes: "", requiresTeacherReview: false } },
  transcriptHighlights: [],
  overallSummary: "Good session.",
  teacherOverride: false,
  teacherNotes: null,
  publishedAt: null,
  generatedAt: new Date(),
};

const FAKE_EVALUATION_PUBLISHED = {
  ...FAKE_EVALUATION_DRAFT,
  status: "PUBLISHED",
  publishedAt: new Date(),
};

const STUB_EVALUATOR_OUTPUT: EvaluatorOutput = {
  structuredScores: {
    "crit-001": { score: 7, maxScore: 10, evidence: [1], notes: "Good", requiresTeacherReview: false },
    "crit-002": { score: 5, maxScore: 10, evidence: [1], notes: "Needs review [FORMATIVE-ONLY: requires teacher review before official]", requiresTeacherReview: true },
  },
  transcriptHighlights: [{ type: "STRONG", turnNumber: 1, note: "Good opening." }],
  overallSummary: "Stub evaluation summary.",
  inputTokensUsed: 20,
  outputTokensUsed: 30,
};

// ---------------------------------------------------------------------------
// Mock factories
// ---------------------------------------------------------------------------

function makeEvaluatorStub(output: EvaluatorOutput = STUB_EVALUATOR_OUTPUT) {
  return {
    evaluate: jest.fn().mockResolvedValue(output),
  };
}

function makePrismaForGenerate(existingEvaluation: object | null = null) {
  return {
    attempt: {
      findUnique: jest.fn().mockResolvedValue(FAKE_ATTEMPT_WITH_COURSE_A),
    },
    evaluation: {
      findUnique: jest.fn().mockResolvedValue(existingEvaluation),
      create: jest.fn().mockImplementation((args: { data: object }) => ({
        ...args.data,
        id: "new-eval-001",
        status: "DRAFT",
      })),
      update: jest.fn().mockImplementation((args: { data: object }) => ({
        ...args.data,
        attemptId: ATTEMPT_ID,
      })),
    },
  };
}

function makePrismaForRead(
  attemptUserId: string,
  evaluation: object | null,
) {
  return {
    attempt: {
      findUnique: jest.fn().mockResolvedValue({
        id: ATTEMPT_ID,
        userId: attemptUserId,
        status: "COMPLETED",
        assignment: { courseId: COURSE_A_ID },
      }),
    },
    evaluation: {
      findUnique: jest.fn().mockResolvedValue(evaluation),
    },
  };
}

function makePrismaForOverride(evaluation: object | null) {
  return {
    attempt: {
      findUnique: jest.fn().mockResolvedValue({
        id: ATTEMPT_ID,
        userId: STUDENT_ID,
        status: "COMPLETED",
        assignment: { courseId: COURSE_A_ID },
      }),
    },
    evaluation: {
      findUnique: jest.fn().mockResolvedValue(evaluation),
      update: jest.fn().mockImplementation((args: { data: object }) => ({
        ...args.data,
        attemptId: ATTEMPT_ID,
      })),
    },
  };
}

// ---------------------------------------------------------------------------
// Scope helpers
// ---------------------------------------------------------------------------

function teacherACourseScopes(): UserScope[] {
  return [{ role: "TEACHER", scopeType: "COURSE", scopeId: COURSE_A_ID }];
}

function teacherBCourseScopes(): UserScope[] {
  return [{ role: "TEACHER", scopeType: "COURSE", scopeId: COURSE_B_ID }];
}

function adminScopes(): UserScope[] {
  return [{ role: "SYSTEM_ADMIN", scopeType: "COLLEGE", scopeId: COLLEGE_ID }];
}

function studentScopes(): UserScope[] {
  return [{ role: "STUDENT", scopeType: "COURSE", scopeId: COURSE_A_ID }];
}

// ---------------------------------------------------------------------------
// (a) generate RBAC
// ---------------------------------------------------------------------------

describe("EvaluationService.generateEvaluation -- RBAC (unit, mocked Prisma)", () => {
  it("(a) TEACHER of course A can generate evaluation", async () => {
    const prisma = makePrismaForGenerate(null);
    const evaluator = makeEvaluatorStub();
    const service = new EvaluationService(prisma as never, evaluator as never);

    const result = await service.generateEvaluation(ATTEMPT_ID, TEACHER_A_ID, teacherACourseScopes());

    expect(result).toBeDefined();
    expect(prisma.evaluation.create).toHaveBeenCalled();
  });

  it("(a) TEACHER of different course is forbidden", async () => {
    const prisma = makePrismaForGenerate(null);
    const evaluator = makeEvaluatorStub();
    const service = new EvaluationService(prisma as never, evaluator as never);

    await expect(
      service.generateEvaluation(ATTEMPT_ID, TEACHER_B_ID, teacherBCourseScopes()),
    ).rejects.toThrow(ForbiddenException);
  });

  it("(a) SYSTEM_ADMIN can generate evaluation", async () => {
    const prisma = makePrismaForGenerate(null);
    const evaluator = makeEvaluatorStub();
    const service = new EvaluationService(prisma as never, evaluator as never);

    const result = await service.generateEvaluation(ATTEMPT_ID, ADMIN_ID, adminScopes());

    expect(result).toBeDefined();
  });

  it("(a) attempt not found throws NotFoundException", async () => {
    const prisma = {
      attempt: { findUnique: jest.fn().mockResolvedValue(null) },
      evaluation: { findUnique: jest.fn().mockResolvedValue(null) },
    };
    const evaluator = makeEvaluatorStub();
    const service = new EvaluationService(prisma as never, evaluator as never);

    await expect(
      service.generateEvaluation("nonexistent", TEACHER_A_ID, teacherACourseScopes()),
    ).rejects.toThrow(NotFoundException);
  });

  it("(f) regeneration of PUBLISHED evaluation raises ConflictException", async () => {
    const prisma = makePrismaForGenerate(FAKE_EVALUATION_PUBLISHED);
    const evaluator = makeEvaluatorStub();
    const service = new EvaluationService(prisma as never, evaluator as never);

    await expect(
      service.generateEvaluation(ATTEMPT_ID, TEACHER_A_ID, teacherACourseScopes()),
    ).rejects.toThrow(ConflictException);
  });

  it("(a) regeneration of DRAFT evaluation succeeds (updates, does not create)", async () => {
    const prisma = makePrismaForGenerate(FAKE_EVALUATION_DRAFT);
    const evaluator = makeEvaluatorStub();
    const service = new EvaluationService(prisma as never, evaluator as never);

    const result = await service.generateEvaluation(ATTEMPT_ID, TEACHER_A_ID, teacherACourseScopes());

    expect(result).toBeDefined();
    expect(prisma.evaluation.update).toHaveBeenCalled();
    expect(prisma.evaluation.create).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// (b) get RBAC -- student vs teacher
// ---------------------------------------------------------------------------

describe("EvaluationService.getEvaluation -- student vs teacher visibility (unit)", () => {
  it("(b) student sees own PUBLISHED evaluation", async () => {
    const prisma = makePrismaForRead(STUDENT_ID, FAKE_EVALUATION_PUBLISHED);
    const evaluator = makeEvaluatorStub();
    const service = new EvaluationService(prisma as never, evaluator as never);

    const result = await service.getEvaluation(ATTEMPT_ID, STUDENT_ID, studentScopes());

    expect(result).toBeDefined();
    expect((result as { status: string }).status).toBe("PUBLISHED");
  });

  it("(b) student cannot see a DRAFT evaluation -- throws ForbiddenException", async () => {
    const prisma = makePrismaForRead(STUDENT_ID, FAKE_EVALUATION_DRAFT);
    const evaluator = makeEvaluatorStub();
    const service = new EvaluationService(prisma as never, evaluator as never);

    await expect(
      service.getEvaluation(ATTEMPT_ID, STUDENT_ID, studentScopes()),
    ).rejects.toThrow(ForbiddenException);
  });

  it("(b) teacher sees DRAFT evaluation without restriction", async () => {
    const prisma = makePrismaForRead(STUDENT_ID, FAKE_EVALUATION_DRAFT);
    const evaluator = makeEvaluatorStub();
    const service = new EvaluationService(prisma as never, evaluator as never);

    const result = await service.getEvaluation(ATTEMPT_ID, TEACHER_A_ID, teacherACourseScopes());

    expect(result).toBeDefined();
    expect((result as { status: string }).status).toBe("DRAFT");
  });

  it("(b) admin sees DRAFT evaluation without restriction", async () => {
    const prisma = makePrismaForRead(STUDENT_ID, FAKE_EVALUATION_DRAFT);
    const evaluator = makeEvaluatorStub();
    const service = new EvaluationService(prisma as never, evaluator as never);

    const result = await service.getEvaluation(ATTEMPT_ID, ADMIN_ID, adminScopes());

    expect(result).toBeDefined();
  });

  it("(c) student of OTHER attempt cannot see evaluation -- ForbiddenException", async () => {
    // attemptUserId=STUDENT_ID but actorId=OTHER_STUDENT_ID
    const prisma = makePrismaForRead(STUDENT_ID, FAKE_EVALUATION_PUBLISHED);
    const evaluator = makeEvaluatorStub();
    const service = new EvaluationService(prisma as never, evaluator as never);

    await expect(
      service.getEvaluation(ATTEMPT_ID, OTHER_STUDENT_ID, studentScopes()),
    ).rejects.toThrow(ForbiddenException);
  });

  it("get returns NotFoundException when no evaluation exists", async () => {
    const prisma = makePrismaForRead(STUDENT_ID, null);
    const evaluator = makeEvaluatorStub();
    const service = new EvaluationService(prisma as never, evaluator as never);

    await expect(
      service.getEvaluation(ATTEMPT_ID, TEACHER_A_ID, teacherACourseScopes()),
    ).rejects.toThrow(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// (d) override RBAC
// ---------------------------------------------------------------------------

describe("EvaluationService.overrideEvaluation -- RBAC (unit)", () => {
  it("(d) TEACHER of course A can override", async () => {
    const prisma = makePrismaForOverride(FAKE_EVALUATION_DRAFT);
    const evaluator = makeEvaluatorStub();
    const service = new EvaluationService(prisma as never, evaluator as never);

    const result = await service.overrideEvaluation(
      ATTEMPT_ID,
      { teacherNotes: "Good effort." },
      TEACHER_A_ID,
      teacherACourseScopes(),
    );

    expect(result).toBeDefined();
    expect(prisma.evaluation.update).toHaveBeenCalled();
  });

  it("(d) TEACHER of different course is forbidden", async () => {
    const prisma = makePrismaForOverride(FAKE_EVALUATION_DRAFT);
    const evaluator = makeEvaluatorStub();
    const service = new EvaluationService(prisma as never, evaluator as never);

    await expect(
      service.overrideEvaluation(
        ATTEMPT_ID,
        { teacherNotes: "Nope." },
        TEACHER_B_ID,
        teacherBCourseScopes(),
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it("(d) SYSTEM_ADMIN can override", async () => {
    const prisma = makePrismaForOverride(FAKE_EVALUATION_DRAFT);
    const evaluator = makeEvaluatorStub();
    const service = new EvaluationService(prisma as never, evaluator as never);

    const result = await service.overrideEvaluation(
      ATTEMPT_ID,
      { teacherNotes: "Admin note." },
      ADMIN_ID,
      adminScopes(),
    );

    expect(result).toBeDefined();
  });

  it("(e) publish=true sets status=PUBLISHED in the update call", async () => {
    const prisma = makePrismaForOverride(FAKE_EVALUATION_DRAFT);
    const evaluator = makeEvaluatorStub();
    const service = new EvaluationService(prisma as never, evaluator as never);

    await service.overrideEvaluation(
      ATTEMPT_ID,
      { publish: true, teacherNotes: "Approved." },
      TEACHER_A_ID,
      teacherACourseScopes(),
    );

    const updateCall = (prisma.evaluation.update as jest.Mock).mock.calls[0] as [{ data: Record<string, unknown> }];
    expect(updateCall[0].data["status"]).toBe("PUBLISHED");
    expect(updateCall[0].data["publishedAt"]).toBeDefined();
  });

  it("override with no evaluation throws NotFoundException", async () => {
    const prisma = makePrismaForOverride(null);
    const evaluator = makeEvaluatorStub();
    const service = new EvaluationService(prisma as never, evaluator as never);

    await expect(
      service.overrideEvaluation(
        ATTEMPT_ID,
        { teacherNotes: "x" },
        TEACHER_A_ID,
        teacherACourseScopes(),
      ),
    ).rejects.toThrow(NotFoundException);
  });
});
