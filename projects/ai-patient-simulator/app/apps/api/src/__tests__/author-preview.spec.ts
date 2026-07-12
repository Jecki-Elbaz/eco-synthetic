/**
 * Author-preview unit tests (TRACK-A-GAL items C, D, E)
 *
 * Mocked Prisma + mocked TurnPipeline -- no live DB, no LLM.
 *
 * Covers:
 *   C1. runAuthorPreview creates an AUTHOR_PREVIEW attempt (type field)
 *   C2. runAuthorPreview returns { attemptId } of created attempt
 *   C3. runAuthorPreview runs all turns in the bot profile sequence (6 turns)
 *   C4. runAuthorPreview marks attempt COMPLETED at end
 *   D1. UsageLog emitted with eventType=SELF_SIMULATION for every turn (Rambo M18)
 *   D2. UsageLog count equals number of bot turns run (6 for a 6-turn profile)
 *   E1. CreditEntry.create NOT called for AUTHOR_PREVIEW turns
 *   E2. CreditLedger.update NOT called for AUTHOR_PREVIEW turns
 *   E3. processTurn (student turn) DOES call CreditEntry.create when ledger exists
 *   I1. InputGate: bypassCreditCheck=true allows turn even when creditBalance=0
 *   I2. InputGate: bypassCreditCheck=false blocks turn when creditBalance=0
 *   R1. PreviewController student role -> 403 via RolesGuard
 */

import { SimulationService } from "../simulation/simulation.service.js";
import { RolesGuard } from "../rbac/roles.guard.js";
import { Reflector } from "@nestjs/core";
import { ForbiddenException } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import type { TurnPipelineOutput } from "@aps/engine";
import type { AuthTokenPayload, UserScope } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ASSIGNMENT_ID = "assignment-prev-001";
const TEMPLATE_ID = "template-prev-001";
const ATTEMPT_ID_CREATED = "attempt-prev-created-001";
const TEACHER_ID = "teacher-prev-001";
const STUDENT_ID = "student-prev-001";
const COLLEGE_ID = "college-prev-001";
const COURSE_ID = "course-prev-001";

const TEACHER_SCOPES: UserScope[] = [
  { role: "TEACHER", scopeType: "COURSE", scopeId: COURSE_ID },
];

function makeAssignment() {
  return {
    id: ASSIGNMENT_ID,
    courseId: COURSE_ID,
    challengeLevel: 2,
    maxTurns: 75,
    simulationTemplate: {
      personaPrompt: "You are a patient.",
      groundTruth: {
        disclosureAllowList: { unlocked: [], locked: [] },
        knownFacts: { doNotInvent: [] },
        hardOffRampText: "Session ended.",
      },
    },
  };
}

/** Attempt created by runAuthorPreview (before any turns run) */
function makeCreatedAttempt(overrides: Record<string, unknown> = {}) {
  return {
    id: ATTEMPT_ID_CREATED,
    userId: TEACHER_ID,
    type: "AUTHOR_PREVIEW",
    turnCount: 0,
    tokenInputTotal: 0,
    tokenOutputTotal: 0,
    status: "IN_PROGRESS",
    ...overrides,
  };
}

const PIPELINE_OUTPUT: TurnPipelineOutput = {
  gateResult: { allowed: true, softWarn: false },
  patientResponse: "Stub patient response.",
  nextStateSnapshot: {
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
    challengeLevel: 2,
    guardResult: "PASS",
    guardDetail: null,
    summarisedUpTo: null,
    contextSummary: null,
  },
  analyserResult: {
    empathy: 0.5,
    questionType: "open",
    specificity: 0.5,
    validation: 0.4,
    actConsistency: 0.5,
    prematureAdvice: false,
    pressure: 0.2,
    missedCues: [],
    riskRelevance: false,
    therapeuticStance: "exploratory",
    turnLanguage: "he",
    rawClassification: "[stub]",
  },
  guardOutcome: "PASS",
  guardDetail: null,
  inputTokensUsed: 10,
  outputTokensUsed: 10,
  softWarnTriggered: false,
};

// ---------------------------------------------------------------------------
// Prisma mock factory for author-preview
// ---------------------------------------------------------------------------

type PrismaMock = ReturnType<typeof makePreviewPrismaMock>;

function makePreviewPrismaMock(
  attempt: ReturnType<typeof makeCreatedAttempt> | null = makeCreatedAttempt(),
  withLedger = false,
) {
  // Each call to attempt.findUnique (once per runPipelineTurn iteration) returns
  // the same attempt with incrementing turnCount via sequential mock values.
  const turnCounts = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  let findUniqueCallIdx = 0;

  const findUniqueMock = jest.fn().mockImplementation(() => {
    const tc = turnCounts[findUniqueCallIdx++] ?? 6;
    return Promise.resolve(attempt ? { ...attempt, turnCount: tc } : null);
  });

  return {
    assignment: {
      findUnique: jest.fn().mockResolvedValue(makeAssignment()),
    },
    attempt: {
      create: jest.fn().mockResolvedValue(attempt),
      findUnique: findUniqueMock,
      update: jest.fn().mockResolvedValue({}),
    },
    creditLedger: {
      findFirst: jest.fn().mockResolvedValue(
        withLedger
          ? { id: "ledger-001", balance: 10000, hardLimit: 0 }
          : null,
      ),
      update: jest.fn().mockResolvedValue({}),
    },
    patientStateLog: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
    },
    message: {
      findMany: jest.fn().mockResolvedValue([]),
      createMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
    usageLog: {
      create: jest.fn().mockResolvedValue({}),
    },
    creditEntry: {
      create: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn().mockImplementation((ops: Promise<unknown>[]) =>
      Promise.all(ops),
    ),
  };
}

function makePipelineMock() {
  return { run: jest.fn().mockResolvedValue(PIPELINE_OUTPUT) };
}

function makeEvalMock() {
  return {
    generateEvaluation: jest.fn().mockResolvedValue({ id: "eval-prev-001", status: "DRAFT" }),
  };
}

function makeService(
  prisma: PrismaMock,
  pipeline = makePipelineMock(),
  evalService = makeEvalMock(),
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new SimulationService(
    prisma as any,
    pipeline as any,
    evalService as any,
    { loadArcContext: jest.fn().mockResolvedValue(null) } as any,
    { writeSessionSummary: jest.fn().mockResolvedValue(undefined) } as any,
  );
}

// NOTE: InputGate bypassCreditCheck tests (I1, I2, I1b) live in
// packages/engine-test-harness/src/__tests__/input-gate.spec.ts
// where InputGate is imported directly from its source package.

// ---------------------------------------------------------------------------
// runAuthorPreview tests (C, D, E)
// ---------------------------------------------------------------------------

describe("SimulationService.runAuthorPreview (items C, D, E)", () => {
  it("C1: creates attempt with type=AUTHOR_PREVIEW", async () => {
    const prisma = makePreviewPrismaMock();
    const svc = makeService(prisma);
    await svc.runAuthorPreview(ASSIGNMENT_ID, TEACHER_ID, "COMPETENT");
    expect(prisma.attempt.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ type: "AUTHOR_PREVIEW" }) }),
    );
  });

  it("C2: returns { attemptId } of the created attempt", async () => {
    const prisma = makePreviewPrismaMock();
    const svc = makeService(prisma);
    const result = await svc.runAuthorPreview(ASSIGNMENT_ID, TEACHER_ID, "COMPETENT");
    expect(result).toEqual({ attemptId: ATTEMPT_ID_CREATED });
  });

  it("C3: runs all 6 turns in the COMPETENT bot sequence", async () => {
    const prisma = makePreviewPrismaMock();
    const pipeline = makePipelineMock();
    const svc = makeService(prisma, pipeline);
    await svc.runAuthorPreview(ASSIGNMENT_ID, TEACHER_ID, "COMPETENT");
    // StudentBotProvider.COMPETENT has 6 turns -> pipeline.run called 6 times
    expect(pipeline.run).toHaveBeenCalledTimes(6);
  });

  it("C4: marks attempt COMPLETED after all turns run", async () => {
    const prisma = makePreviewPrismaMock();
    const svc = makeService(prisma);
    await svc.runAuthorPreview(ASSIGNMENT_ID, TEACHER_ID, "TYPICAL");
    const updateCalls = (prisma.attempt.update as jest.Mock).mock.calls;
    const lastUpdate = updateCalls[updateCalls.length - 1][0] as Record<string, unknown>;
    expect((lastUpdate as { data: { status: string } }).data.status).toBe("COMPLETED");
  });

  it("D1: UsageLog emitted with eventType=SELF_SIMULATION for every turn", async () => {
    const prisma = makePreviewPrismaMock();
    const svc = makeService(prisma);
    await svc.runAuthorPreview(ASSIGNMENT_ID, TEACHER_ID, "WEAK");
    const usageLogCalls = (prisma.usageLog.create as jest.Mock).mock.calls;
    expect(usageLogCalls.length).toBeGreaterThan(0);
    for (const call of usageLogCalls) {
      expect((call[0] as { data: { eventType: string } }).data.eventType).toBe("SELF_SIMULATION");
    }
  });

  it("D2: UsageLog call count equals number of turns run (6 for any profile)", async () => {
    const prisma = makePreviewPrismaMock();
    const svc = makeService(prisma);
    await svc.runAuthorPreview(ASSIGNMENT_ID, TEACHER_ID, "TYPICAL");
    expect(prisma.usageLog.create).toHaveBeenCalledTimes(6);
  });

  it("E1: CreditEntry.create NOT called for AUTHOR_PREVIEW (no ledger deduction)", async () => {
    // withLedger=true to prove credit IS skipped even when ledger exists
    const prisma = makePreviewPrismaMock(makeCreatedAttempt(), true);
    const svc = makeService(prisma);
    await svc.runAuthorPreview(ASSIGNMENT_ID, TEACHER_ID, "COMPETENT");
    expect(prisma.creditEntry.create).not.toHaveBeenCalled();
  });

  it("E2: CreditLedger.update NOT called for AUTHOR_PREVIEW", async () => {
    const prisma = makePreviewPrismaMock(makeCreatedAttempt(), true);
    const svc = makeService(prisma);
    await svc.runAuthorPreview(ASSIGNMENT_ID, TEACHER_ID, "COMPETENT");
    expect(prisma.creditLedger.update).not.toHaveBeenCalled();
  });

  it("Ev1: preview ends with Evaluation triggered + no CreditEntry (Track-A-fix-001)", async () => {
    // Ido ruling Finding 5: evaluation auto-triggered after loop; author sees rubric scores.
    // Credit must remain untouched (evaluation uses stub -- no CreditEntry written).
    const prisma = makePreviewPrismaMock(makeCreatedAttempt(), true);
    const evalService = makeEvalMock();
    const svc = makeService(prisma, undefined, evalService);
    await svc.runAuthorPreview(ASSIGNMENT_ID, TEACHER_ID, "COMPETENT", TEACHER_SCOPES);
    expect(evalService.generateEvaluation).toHaveBeenCalledTimes(1);
    expect(evalService.generateEvaluation).toHaveBeenCalledWith(
      ATTEMPT_ID_CREATED,
      TEACHER_ID,
      TEACHER_SCOPES,
    );
    expect(prisma.creditEntry.create).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// RolesGuard: student role -> 403 on preview endpoint (R1)
// ---------------------------------------------------------------------------

describe("PreviewController -- student role 403 via RolesGuard (R1)", () => {
  function makeStudentPayload(): AuthTokenPayload {
    return {
      sub: STUDENT_ID,
      email: "student@preview.test",
      scopes: [{ role: "STUDENT", scopeType: "COURSE", scopeId: COURSE_ID }],
      iat: 1000000,
      exp: 9999999,
    };
  }

  function makeTeacherPayload(): AuthTokenPayload {
    return {
      sub: TEACHER_ID,
      email: "teacher@preview.test",
      scopes: [{ role: "TEACHER", scopeType: "COURSE", scopeId: COURSE_ID }],
      iat: 1000000,
      exp: 9999999,
    };
  }

  function makeContext(
    user: AuthTokenPayload,
    requiredRoles: string[],
  ): ExecutionContext {
    const reflector = new Reflector();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(requiredRoles as any);
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user,
          params: { assignmentId: ASSIGNMENT_ID },
        }),
      }),
    } as unknown as ExecutionContext;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ctx as any)._reflector = reflector;
    return ctx;
  }

  it("R1: student role throws ForbiddenException for TEACHER/SYSTEM_ADMIN-only route", () => {
    const reflector = new Reflector();
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["TEACHER", "SYSTEM_ADMIN"]);
    const guard = new RolesGuard(reflector);

    const studentCtx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user: makeStudentPayload(),
          params: { assignmentId: ASSIGNMENT_ID },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(studentCtx)).toThrow(ForbiddenException);
  });

  it("R1b: teacher role passes guard for TEACHER/SYSTEM_ADMIN-only route", () => {
    const reflector = new Reflector();
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["TEACHER", "SYSTEM_ADMIN"]);
    const guard = new RolesGuard(reflector);

    const teacherCtx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({
          user: makeTeacherPayload(),
          params: { assignmentId: ASSIGNMENT_ID },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(teacherCtx)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// processTurn (STUDENT turn) regression: credit IS decremented, SIMULATION_TURN logged
// Covers envelope specs: "STUDENT attempt turn: credit ledger balance decremented after turn"
// and "STUDENT turn: UsageLog entry emitted with activity_type=STUDENT_TURN"
// ---------------------------------------------------------------------------

function makeStudentTurnPrismaMock(withLedger = true) {
  const studentAttempt = {
    id: ATTEMPT_ID_CREATED,
    userId: STUDENT_ID,
    type: "STUDENT",
    turnCount: 0,
    tokenInputTotal: 0,
    tokenOutputTotal: 0,
    status: "IN_PROGRESS",
  };

  const attemptWithAssignment = {
    ...studentAttempt,
    assignment: {
      courseId: COURSE_ID,
      challengeLevel: 2,
      maxTurns: 75,
      simulationTemplate: {
        personaPrompt: "You are a patient.",
        groundTruth: {
          disclosureAllowList: { unlocked: [], locked: [] },
          knownFacts: { doNotInvent: [] },
          hardOffRampText: "Session ended.",
        },
      },
    },
  };

  return {
    attempt: {
      // First call: processTurn ownership check (needs assignment include)
      // Second call: runPipelineTurn reload (bare attempt)
      findUnique: jest.fn()
        .mockResolvedValueOnce(attemptWithAssignment)
        .mockResolvedValueOnce({ ...studentAttempt }),
      update: jest.fn().mockResolvedValue({}),
    },
    creditLedger: {
      findFirst: jest.fn().mockResolvedValue(
        withLedger ? { id: "ledger-001", balance: 10000, hardLimit: 0 } : null,
      ),
      update: jest.fn().mockResolvedValue({}),
    },
    patientStateLog: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
    },
    message: {
      findMany: jest.fn().mockResolvedValue([]),
      createMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
    usageLog: { create: jest.fn().mockResolvedValue({}) },
    creditEntry: { create: jest.fn().mockResolvedValue({}) },
    $transaction: jest.fn().mockImplementation((ops: Promise<unknown>[]) =>
      Promise.all(ops),
    ),
  };
}

describe("processTurn (STUDENT turn) -- credit decrement + SIMULATION_TURN log (E3 + STUDENT_TURN_LOG)", () => {
  it("E3: STUDENT turn calls CreditEntry.create and CreditLedger.update when ledger exists", async () => {
    const prisma = makeStudentTurnPrismaMock(true);
    const pipeline = makePipelineMock();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svc = new SimulationService(prisma as any, pipeline as any, makeEvalMock() as any, { loadArcContext: jest.fn().mockResolvedValue(null) } as any, { writeSessionSummary: jest.fn().mockResolvedValue(undefined) } as any);
    await svc.processTurn(
      { attemptId: ATTEMPT_ID_CREATED, studentMessage: "Hello patient.", language: "he" },
      STUDENT_ID,
    );
    expect(prisma.creditEntry.create).toHaveBeenCalled();
    expect(prisma.creditLedger.update).toHaveBeenCalled();
  });

  it("STUDENT_TURN_LOG: STUDENT turn writes UsageLog with eventType=SIMULATION_TURN (regression)", async () => {
    const prisma = makeStudentTurnPrismaMock(false);
    const pipeline = makePipelineMock();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svc = new SimulationService(prisma as any, pipeline as any, makeEvalMock() as any, { loadArcContext: jest.fn().mockResolvedValue(null) } as any, { writeSessionSummary: jest.fn().mockResolvedValue(undefined) } as any);
    await svc.processTurn(
      { attemptId: ATTEMPT_ID_CREATED, studentMessage: "Hello patient.", language: "he" },
      STUDENT_ID,
    );
    const usageLogCalls = (prisma.usageLog.create as jest.Mock).mock.calls;
    expect(usageLogCalls.length).toBeGreaterThan(0);
    expect(
      (usageLogCalls[0][0] as { data: { eventType: string } }).data.eventType,
    ).toBe("SIMULATION_TURN");
  });
});
