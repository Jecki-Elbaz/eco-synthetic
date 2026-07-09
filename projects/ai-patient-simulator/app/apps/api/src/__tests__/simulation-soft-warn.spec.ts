/**
 * SimulationService -- soft-warn annotation unit tests (APS Sprint 2 Inc 3)
 *
 * Tests the softWarnAnnotation field on TurnResponse.
 * Mocks Prisma and TurnPipeline so no live DB or network is required.
 *
 * Assertions:
 *   - softWarnAnnotation is null when softWarnTriggered is false
 *   - softWarnAnnotation is a non-empty string when softWarnTriggered is true
 */

import { SimulationService } from "../simulation/simulation.service.js";
import type { TurnPipelineOutput } from "@aps/engine";
import { NotFoundException, ForbiddenException } from "@nestjs/common";

// ---------------------------------------------------------------------------
// Minimal stub factories
// ---------------------------------------------------------------------------

const ATTEMPT_ID = "attempt-stub-001";
const USER_ID = "user-stub-001";
const COURSE_ID = "course-stub-001";
const LEDGER_ID = "ledger-stub-001";

function makeBaseAttempt(overrides: Record<string, unknown> = {}) {
  return {
    id: ATTEMPT_ID,
    userId: USER_ID,
    status: "IN_PROGRESS",
    turnCount: 0,
    tokenInputTotal: 0,
    tokenOutputTotal: 0,
    assignment: {
      courseId: COURSE_ID,
      challengeLevel: 2,
      maxTurns: 75,
      simulationTemplate: {
        personaPrompt: "You are a stub patient.",
        groundTruth: {
          knownFacts: { doNotInvent: [] },
          disclosureAllowList: { unlocked: [], locked: [] },
          hardOffRampText: "This is a simulation.",
        },
      },
    },
    ...overrides,
  };
}

function makePipeline(pipelineOutput: Partial<TurnPipelineOutput>) {
  const defaultOutput: TurnPipelineOutput = {
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
      turnLanguage: "en",
      rawClassification: "[stub]",
    },
    guardOutcome: "PASS",
    guardDetail: null,
    inputTokensUsed: 10,
    outputTokensUsed: 10,
    softWarnTriggered: false,
    ...pipelineOutput,
  };

  return {
    run: jest.fn().mockResolvedValue(defaultOutput),
  };
}

function makePrisma(attempt: ReturnType<typeof makeBaseAttempt> | null = makeBaseAttempt()) {
  return {
    attempt: {
      findUnique: jest.fn().mockResolvedValue(attempt),
      update: jest.fn().mockResolvedValue({ ...attempt, turnCount: (attempt?.turnCount ?? 0) + 1 }),
    },
    creditLedger: {
      findFirst: jest.fn().mockResolvedValue(null), // no credit limit
    },
    patientStateLog: {
      findFirst: jest.fn().mockResolvedValue(null), // no prior state
      create: jest.fn().mockResolvedValue({}),
    },
    message: {
      findMany: jest.fn().mockResolvedValue([]),
      createMany: jest.fn().mockResolvedValue({ count: 2 }),
    },
    usageLog: {
      create: jest.fn().mockResolvedValue({}),
    },
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("SimulationService -- softWarnAnnotation", () => {
  it("softWarnAnnotation is null when softWarnTriggered is false", async () => {
    const prisma = makePrisma();
    const pipeline = makePipeline({ softWarnTriggered: false });
    const service = new SimulationService(prisma as never, pipeline as never, { generateEvaluation: jest.fn() } as never);

    const result = await service.processTurn(
      { attemptId: ATTEMPT_ID, studentMessage: "Hello", language: "en" },
      USER_ID,
    );

    expect(result.softWarnTriggered).toBe(false);
    expect(result.softWarnAnnotation).toBeNull();
  });

  it("softWarnAnnotation is a non-empty string when softWarnTriggered is true", async () => {
    const prisma = makePrisma(makeBaseAttempt({ turnCount: 60 }));
    const pipeline = makePipeline({
      gateResult: { allowed: true, softWarn: true },
      softWarnTriggered: true,
    });
    const service = new SimulationService(prisma as never, pipeline as never, { generateEvaluation: jest.fn() } as never);

    const result = await service.processTurn(
      { attemptId: ATTEMPT_ID, studentMessage: "Hello again", language: "en" },
      USER_ID,
    );

    expect(result.softWarnTriggered).toBe(true);
    expect(result.softWarnAnnotation).not.toBeNull();
    expect(typeof result.softWarnAnnotation).toBe("string");
    expect((result.softWarnAnnotation as string).length).toBeGreaterThan(0);
  });

  it("softWarnAnnotation contains a human-readable turn-warning message", async () => {
    const prisma = makePrisma(makeBaseAttempt({ turnCount: 60 }));
    const pipeline = makePipeline({
      gateResult: { allowed: true, softWarn: true },
      softWarnTriggered: true,
    });
    const service = new SimulationService(prisma as never, pipeline as never, { generateEvaluation: jest.fn() } as never);

    const result = await service.processTurn(
      { attemptId: ATTEMPT_ID, studentMessage: "Hello again", language: "en" },
      USER_ID,
    );

    // Annotation should mention turns or simulation
    expect(result.softWarnAnnotation).toMatch(/turn|simulation/i);
  });

  it("gate-blocked response has softWarnAnnotation null", async () => {
    const prisma = makePrisma();
    const pipeline = makePipeline({
      gateResult: { allowed: false, reason: "TURN_LIMIT" },
      softWarnTriggered: false,
    });
    const service = new SimulationService(prisma as never, pipeline as never, { generateEvaluation: jest.fn() } as never);

    const result = await service.processTurn(
      { attemptId: ATTEMPT_ID, studentMessage: "Hello", language: "en" },
      USER_ID,
    );

    expect(result.softWarnAnnotation).toBeNull();
  });
});
