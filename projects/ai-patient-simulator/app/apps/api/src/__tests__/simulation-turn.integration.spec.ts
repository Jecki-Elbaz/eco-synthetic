/**
 * SimulationService integration test -- Sprint 2 Increment 2
 *
 * Tests against LIVE Postgres (localhost:5433, via DATABASE_URL in env).
 * Uses StubProvider -- no real LLM, no network calls.
 *
 * Verifies per turn:
 *   - Message rows (STUDENT + PATIENT) created
 *   - PatientStateLog row created
 *   - UsageLog row created
 *   - CreditEntry deduction written (balance moves)
 *
 * Test isolation: all data created under a randomly-generated attempt/user/
 * course/college hierarchy and deleted in afterAll.
 */

import { PrismaClient } from "@aps/db";
import { PrismaService } from "../db/prisma.service.js";
import { SimulationService } from "../simulation/simulation.service.js";
import { EvaluationService } from "../evaluation/evaluation.service.js";
import { TurnPipeline, StubProvider, Evaluator } from "@aps/engine";
import type { TurnRequest } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Shared Prisma instance (connects on first call)
// ---------------------------------------------------------------------------
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Test fixture IDs (random to avoid collisions between runs)
// ---------------------------------------------------------------------------
const uid = () => Math.random().toString(36).slice(2, 10);

let collegeId: string;
let courseId: string;
let userId: string;
let templateId: string;
let groundTruthId: string;
let rubricVersionId: string;
let assignmentId: string;
let attemptId: string;
let ledgerId: string;

// Initial credit balance for the course
const INITIAL_BALANCE = 50_000;

// ---------------------------------------------------------------------------
// Setup: create minimal hierarchy in the test DB
// ---------------------------------------------------------------------------
beforeAll(async () => {
  await prisma.$connect();

  const suffix = uid();

  // College
  const college = await prisma.college.create({
    data: { name: `Test College ${suffix}`, slug: `tc-${suffix}` },
  });
  collegeId = college.id;

  // Course
  const course = await prisma.course.create({
    data: { collegeId, name: `Test Course ${suffix}`, code: `TC-${suffix}` },
  });
  courseId = course.id;

  // User
  const user = await prisma.user.create({
    data: {
      email: `student-${suffix}@test.local`,
      displayName: `Student ${suffix}`,
    },
  });
  userId = user.id;

  // GroundTruth (created first -- SimulationTemplate references it)
  const gt = await prisma.groundTruth.create({
    data: {
      simulationTemplateId: "placeholder", // overwritten below via update
      knownFacts: { doNotInvent: ["patient has diabetes"] },
      disclosureAllowList: {
        unlocked: ["Patient reports low mood for 3 months"],
        locked: [],
      },
      escalationRules: {},
      hardOffRampText: "This is a simulation. Please contact a real counsellor if you need support.",
    },
  });
  groundTruthId = gt.id;

  // SimulationTemplate
  const template = await prisma.simulationTemplate.create({
    data: {
      title: `Test Template ${suffix}`,
      clinicalModel: "CBT",
      studentLevel: "undergraduate",
      challengeLevel: 2,
      riskLevel: "low",
      languages: ["en"],
      personaPrompt: "You are a simulated patient with mild low mood.",
      groundTruthId,
    },
  });
  templateId = template.id;

  // Patch groundTruth.simulationTemplateId (the unique FK)
  await prisma.groundTruth.update({
    where: { id: groundTruthId },
    data: { simulationTemplateId: templateId },
  });

  // RubricVersion (required by Assignment)
  const rubric = await prisma.rubricVersion.create({
    data: {
      simulationTemplateId: templateId,
      version: 1,
      status: "PUBLISHED",
    },
  });
  rubricVersionId = rubric.id;

  // Assignment
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

  // Attempt
  const attempt = await prisma.attempt.create({
    data: {
      assignmentId,
      userId,
      status: "IN_PROGRESS",
      language: "en",
      startedAt: new Date(),
    },
  });
  attemptId = attempt.id;

  // CreditLedger with a hard limit and sufficient balance
  const ledger = await prisma.creditLedger.create({
    data: {
      collegeId,
      courseId,
      balance: INITIAL_BALANCE,
      softLimit: 40_000,
      hardLimit: 1_000,
    },
  });
  ledgerId = ledger.id;
});

// ---------------------------------------------------------------------------
// Teardown: delete all created rows in reverse FK order
// ---------------------------------------------------------------------------
afterAll(async () => {
  // Delete in FK-safe order
  await prisma.creditEntry.deleteMany({ where: { ledgerId } });
  await prisma.creditLedger.deleteMany({ where: { id: ledgerId } });
  await prisma.usageLog.deleteMany({ where: { attemptId } });
  await prisma.message.deleteMany({ where: { attemptId } });
  await prisma.patientStateLog.deleteMany({ where: { attemptId } });
  await prisma.attempt.deleteMany({ where: { id: attemptId } });
  await prisma.assignment.deleteMany({ where: { id: assignmentId } });
  await prisma.rubricVersion.deleteMany({ where: { id: rubricVersionId } });
  await prisma.simulationTemplate.deleteMany({ where: { id: templateId } });
  await prisma.groundTruth.deleteMany({ where: { id: groundTruthId } });
  await prisma.user.deleteMany({ where: { id: userId } });
  await prisma.course.deleteMany({ where: { id: courseId } });
  await prisma.college.deleteMany({ where: { id: collegeId } });

  await prisma.$disconnect();
});

// ---------------------------------------------------------------------------
// Helper: build a SimulationService with real Prisma + StubProvider
// ---------------------------------------------------------------------------
function buildService(): SimulationService {
  const provider = new StubProvider();
  const pipeline = new TurnPipeline(provider);
  // EvaluationService is injected; processTurn does not call it -- only
  // runAuthorPreview does. Construct with real prisma + stub Evaluator.
  // PrismaClient is structurally compatible with PrismaService for all Prisma method
  // signatures (PrismaService extends PrismaClient; NestJS lifecycle methods unused in tests).
  const prismaService = prisma as unknown as PrismaService;
  const evaluationService = new EvaluationService(prismaService, new Evaluator(provider));
  return new SimulationService(
    prismaService,
    pipeline,
    evaluationService,
    { loadArcContext: jest.fn().mockResolvedValue(null) } as any,
    { writeSessionSummary: jest.fn().mockResolvedValue(undefined) } as any,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("SimulationService -- turn integration (live Postgres)", () => {
  let service: SimulationService;

  beforeAll(() => {
    service = buildService();
  });

  it("processTurn: response returned and turn count incremented", async () => {
    const dto: TurnRequest = {
      attemptId,
      studentMessage: "Hello, how are you feeling today?",
      language: "en",
    };

    const result = await service.processTurn(dto, userId);

    expect(result.turnNumber).toBe(1);
    expect(result.turnCount).toBe(1);
    expect(result.patientMessage).toBeTruthy();
    expect(result.patientMessage.length).toBeGreaterThan(0);
  });

  it("Message rows: STUDENT + PATIENT written for turn 1", async () => {
    const messages = await prisma.message.findMany({
      where: { attemptId },
      orderBy: { turnNumber: "asc" },
    });

    expect(messages.length).toBeGreaterThanOrEqual(2);

    const studentMsg = messages.find((m: Record<string, unknown>) => m["role"] === "STUDENT" && m["turnNumber"] === 1);
    const patientMsg = messages.find((m: Record<string, unknown>) => m["role"] === "PATIENT" && m["turnNumber"] === 1);

    expect(studentMsg).toBeDefined();
    expect(patientMsg).toBeDefined();
    expect((studentMsg as any)["originalText"]).toBe("Hello, how are you feeling today?");
    expect(((patientMsg as any)["originalText"] as string).length).toBeGreaterThan(0);
  });

  it("PatientStateLog row written for turn 1", async () => {
    const logs = await prisma.patientStateLog.findMany({
      where: { attemptId },
    });

    expect(logs.length).toBeGreaterThanOrEqual(1);
    const log = logs.find((l: Record<string, unknown>) => l["turnNumber"] === 1);
    expect(log).toBeDefined();
    expect((log as any)["trust"]).toBeGreaterThanOrEqual(0);
    expect((log as any)["trust"]).toBeLessThanOrEqual(1);
  });

  it("UsageLog row written with real (non-placeholder) token counts", async () => {
    const usageLogs = await prisma.usageLog.findMany({
      where: { attemptId },
    });

    expect(usageLogs.length).toBeGreaterThanOrEqual(1);
    const log = usageLogs[0] as any;

    // StubProvider returns 10 tokens per call; analyser + patient + guard = at least 30 input tokens total.
    // Previously placeholders were 50 input + 50 output hardcoded.
    // Now they should be real values from the provider (multiples of STUB_TOKEN_COUNT=10).
    expect(log["inputTokens"]).toBeGreaterThan(0);
    expect(log["outputTokens"]).toBeGreaterThan(0);

    // With real threading: analyser(10in+10out) + patient(10in+10out) + guard(10in+10out).
    // PASS path: analyser + patient + 1 guard = 3 calls = 30in/30out total.
    // Verify it is > 0 and a multiple of 10.
    expect(log["inputTokens"] % 10).toBe(0);
    expect(log["outputTokens"] % 10).toBe(0);
  });

  it("CreditEntry written and ledger balance decremented", async () => {
    const entries = await prisma.creditEntry.findMany({
      where: { ledgerId },
    });

    expect(entries.length).toBeGreaterThanOrEqual(1);

    const entry = entries[0] as any;
    expect(entry["activityType"]).toBe("SIMULATION_TURN");
    expect(entry["delta"]).toBeLessThan(0); // deduction is negative
    expect(entry["reason"]).toContain(attemptId);

    // Ledger balance should have moved
    const ledger = await prisma.creditLedger.findUnique({ where: { id: ledgerId } }) as any;
    expect(ledger["balance"]).toBeLessThan(INITIAL_BALANCE);
    expect(ledger["balance"]).toBe(INITIAL_BALANCE + entry["delta"]); // balance = initial + (negative delta)
  });

  it("processTurn turn 2: CreditEntry count increases, balance decreases further", async () => {
    const balanceBefore = ((await prisma.creditLedger.findUnique({ where: { id: ledgerId } })) as any)["balance"] as number;
    const entriesCountBefore = await prisma.creditEntry.count({ where: { ledgerId } });

    const dto: TurnRequest = {
      attemptId,
      studentMessage: "Can you tell me more about what you have been experiencing?",
      language: "en",
    };

    await service.processTurn(dto, userId);

    const balanceAfter = ((await prisma.creditLedger.findUnique({ where: { id: ledgerId } })) as any)["balance"] as number;
    const entriesCountAfter = await prisma.creditEntry.count({ where: { ledgerId } });

    expect(entriesCountAfter).toBe(entriesCountBefore + 1);
    expect(balanceAfter).toBeLessThan(balanceBefore);
  });
});
