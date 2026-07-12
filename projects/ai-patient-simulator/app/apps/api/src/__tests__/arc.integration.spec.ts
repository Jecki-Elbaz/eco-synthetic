/**
 * arc.integration.spec.ts -- S5-GAL-ARC-TESTS (7th integration suite)
 *
 * Tests the 3-session arc end-to-end against LIVE Postgres.
 * Uses StubProvider -- no real LLM, no network calls.
 * Uses REAL ArcLoaderService + ArcWriterService (not mocks).
 *
 * Verifies:
 *   A1: ArcWriterService.writeSessionSummary persists ArcSessionSummary after session 1 completes
 *   A2: ArcLoaderService.loadArcContext returns session-1 context for session-2 attempt
 *   A3: Session 2 loads ONLY session-1 summary (not a phantom session-0)
 *   A4: ARC_COMPLETE guard (OrgService) blocks a 4th attempt when maxSessions=3
 *   A5: getOrCreateAttempt assigns sessionNumber=1 for first attempt on an arc template
 *   A6: ArcSessionSummary row has correct (userId, templateId, sessionNumber) isolation
 *
 * Test isolation: all data created under a random suffix and deleted in afterAll.
 */

import { PrismaClient } from "@aps/db";
import { PrismaService } from "../db/prisma.service.js";
import { ArcLoaderService } from "../simulation/arc/arc-loader.service.js";
import { ArcWriterService } from "../simulation/arc/arc-writer.service.js";
import { OrgService } from "../org/org.service.js";
import { HttpException } from "@nestjs/common";

const prisma = new PrismaClient();

const uid = () => Math.random().toString(36).slice(2, 10);

let suffix: string;
let collegeId: string;
let courseId: string;
let userId: string;
let templateId: string;
let groundTruthId: string;
let rubricVersionId: string;
let assignmentId: string;
// attemptIds created during tests
const attemptIds: string[] = [];

// ---------------------------------------------------------------------------
// Setup: minimal arc-enabled hierarchy
// ---------------------------------------------------------------------------
beforeAll(async () => {
  await prisma.$connect();
  suffix = uid();

  const college = await prisma.college.create({
    data: { name: `Arc College ${suffix}`, slug: `arc-${suffix}` },
  });
  collegeId = college.id;

  const course = await prisma.course.create({
    data: { collegeId, name: `Arc Course ${suffix}`, code: `ARC-${suffix}` },
  });
  courseId = course.id;

  const user = await prisma.user.create({
    data: {
      email: `arc-student-${suffix}@test.local`,
      displayName: `Arc Student ${suffix}`,
    },
  });
  userId = user.id;

  const gt = await prisma.groundTruth.create({
    data: {
      simulationTemplateId: "placeholder",
      knownFacts: {
        facts: ["patient reports anxiety for 6 months"],
        doNotInvent: ["patient has no prior therapy"],
        riskBoundaries: [],
      },
      disclosureAllowList: {
        unlocked: ["Patient reports low mood"],
        locked: [],
      },
      escalationRules: {},
      hardOffRampText: "This is a simulation.",
    },
  });
  groundTruthId = gt.id;

  // Arc-enabled template: maxSessions=3
  const template = await prisma.simulationTemplate.create({
    data: {
      title: `Arc Template ${suffix}`,
      clinicalModel: "CBT",
      studentLevel: "undergraduate",
      challengeLevel: 2,
      riskLevel: "low",
      languages: ["en"],
      personaPrompt: "You are a simulated patient with anxiety.",
      groundTruthId,
      maxSessions: 3,
    },
  });
  templateId = template.id;

  await prisma.groundTruth.update({
    where: { id: groundTruthId },
    data: { simulationTemplateId: templateId },
  });

  const rubric = await prisma.rubricVersion.create({
    data: { simulationTemplateId: templateId, version: 1, status: "PUBLISHED" },
  });
  rubricVersionId = rubric.id;

  const assignment = await prisma.assignment.create({
    data: {
      courseId,
      simulationTemplateId: templateId,
      rubricVersionId,
      challengeLevel: 2,
      languagesAllowed: ["en"],
      maxTurns: 5,
    },
  });
  assignmentId = assignment.id;
});

// ---------------------------------------------------------------------------
// Teardown
// ---------------------------------------------------------------------------
afterAll(async () => {
  // Delete ArcSessionSummary rows for this user+template
  await prisma.arcSessionSummary.deleteMany({ where: { userId, templateId } });
  // Delete PatientStateLog + UsageLog + Message for attempts
  for (const aId of attemptIds) {
    await prisma.usageLog.deleteMany({ where: { attemptId: aId } });
    await prisma.message.deleteMany({ where: { attemptId: aId } });
    await prisma.patientStateLog.deleteMany({ where: { attemptId: aId } });
  }
  await prisma.attempt.deleteMany({ where: { id: { in: attemptIds } } });
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
// Helpers
// ---------------------------------------------------------------------------
const prismaService = () => prisma as unknown as PrismaService;

function makeArcLoaderService() {
  return new ArcLoaderService(prismaService());
}

function makeArcWriterService() {
  return new ArcWriterService(prismaService());
}

function makeOrgService() {
  return new OrgService(prismaService());
}

// ---------------------------------------------------------------------------
// Tests (sequential -- each test builds on prior state)
// ---------------------------------------------------------------------------

describe("S5-GAL-ARC-TESTS: arc integration (live Postgres)", () => {
  let session1AttemptId: string;
  let session2AttemptId: string;
  let session3AttemptId: string;

  // A5: getOrCreateAttempt assigns sessionNumber=1 for first STUDENT attempt on arc template
  it("A5: getOrCreateAttempt assigns sessionNumber=1 for first arc attempt", async () => {
    const orgService = makeOrgService();
    const attempt = await orgService.getOrCreateAttempt(assignmentId, userId, "en", "STUDENT");
    session1AttemptId = (attempt as Record<string, unknown>)["id"] as string;
    attemptIds.push(session1AttemptId);

    expect((attempt as Record<string, unknown>)["sessionNumber"]).toBe(1);
    expect((attempt as Record<string, unknown>)["status"]).toBe("NOT_STARTED");
  });

  // A3: session 1 loader returns null (no prior session)
  it("A3: ArcLoaderService returns null for session 1 (no prior history)", async () => {
    const loaderService = makeArcLoaderService();
    const ctx = await loaderService.loadArcContext(userId, templateId, 1);
    expect(ctx).toBeNull();
  });

  // Set up: create a minimal PatientStateLog for session 1 so ArcWriterService has data
  it("setup: write PatientStateLog for session-1 attempt", async () => {
    // Insert a minimal PatientStateLog row to simulate a completed turn
    await prisma.patientStateLog.create({
      data: {
        attemptId: session1AttemptId,
        turnNumber: 1,
        trust: 0.45,
        openness: 0.35,
        emotionalActiv: 0.40,
        avoidanceLevel: 0.50,
        defensiveness: 0.45,
        allianceQuality: 0.40,
        disclosureReady: 0.10,
        riskRelevance: 0.00,
        unlockedFactIds: ["fact-01"],
        pendingTriggers: [],
        analyserOutput: {},
        challengeLevel: 2,
        guardResult: "PASS",
        guardDetail: null,
        summarisedUpTo: null,
        contextSummary: "Initial session. Student showed basic empathy.",
      },
    });

    // Mark attempt COMPLETED + set sessionNumber (simulate session completion)
    await prisma.attempt.update({
      where: { id: session1AttemptId },
      data: { status: "COMPLETED", finishedAt: new Date(), sessionNumber: 1 },
    });

    expect(true).toBe(true); // setup succeeded
  });

  // A1: ArcWriterService persists ArcSessionSummary after session 1 completes
  it("A1: ArcWriterService persists ArcSessionSummary for session 1", async () => {
    const writerService = makeArcWriterService();
    await writerService.writeSessionSummary(session1AttemptId);

    const summary = await prisma.arcSessionSummary.findUnique({
      where: {
        userId_templateId_sessionNumber: { userId, templateId, sessionNumber: 1 },
      },
    });

    expect(summary).not.toBeNull();
    expect((summary as Record<string, unknown>)["userId"]).toBe(userId);
    expect((summary as Record<string, unknown>)["templateId"]).toBe(templateId);
    expect((summary as Record<string, unknown>)["sessionNumber"]).toBe(1);
    // finalTrustLevel clamped from 0.45 (within range [0.15, 0.70])
    expect((summary as Record<string, unknown>)["finalTrustLevel"]).toBeCloseTo(0.45, 2);
  });

  // A2: ArcLoaderService returns session-1 context for session-2 attempt
  it("A2: ArcLoaderService returns session-1 context for session 2", async () => {
    const loaderService = makeArcLoaderService();
    const ctx = await loaderService.loadArcContext(userId, templateId, 2);

    expect(ctx).not.toBeNull();
    expect(ctx!.sessionNumber).toBe(1);
    expect(ctx!.trustLevel).toBeCloseTo(0.45, 2);
    expect(ctx!.notableMomentsSummary).toBe("Initial session. Student showed basic empathy.");
  });

  // Create session 2 attempt via OrgService
  it("setup: getOrCreateAttempt assigns sessionNumber=2 for second arc attempt", async () => {
    const orgService = makeOrgService();
    const attempt = await orgService.getOrCreateAttempt(assignmentId, userId, "en", "STUDENT");
    session2AttemptId = (attempt as Record<string, unknown>)["id"] as string;
    attemptIds.push(session2AttemptId);

    expect((attempt as Record<string, unknown>)["sessionNumber"]).toBe(2);
  });

  // A6: data isolation -- ArcSessionSummary row is scoped to (userId, templateId, sessionNumber)
  it("A6: ArcSessionSummary row isolation -- unique per (userId, templateId, sessionNumber)", async () => {
    const otherUserId = `other-user-${suffix}`;

    // Confirm no summary exists for otherUserId (data isolation)
    const otherSummary = await prisma.arcSessionSummary.findUnique({
      where: {
        userId_templateId_sessionNumber: { userId: otherUserId, templateId, sessionNumber: 1 },
      },
    });
    expect(otherSummary).toBeNull();

    // Confirm summary exists only for our userId
    const ourSummary = await prisma.arcSessionSummary.findUnique({
      where: {
        userId_templateId_sessionNumber: { userId, templateId, sessionNumber: 1 },
      },
    });
    expect(ourSummary).not.toBeNull();
  });

  // Complete session 2 and create session 3
  it("setup: complete session 2, write session-3 attempt", async () => {
    // Write minimal PatientStateLog for session 2
    await prisma.patientStateLog.create({
      data: {
        attemptId: session2AttemptId,
        turnNumber: 1,
        trust: 0.55,
        openness: 0.45,
        emotionalActiv: 0.42,
        avoidanceLevel: 0.44,
        defensiveness: 0.38,
        allianceQuality: 0.52,
        disclosureReady: 0.18,
        riskRelevance: 0.00,
        unlockedFactIds: ["fact-01", "fact-02"],
        pendingTriggers: [],
        analyserOutput: {},
        challengeLevel: 2,
        guardResult: "PASS",
        guardDetail: null,
        summarisedUpTo: null,
        contextSummary: "Session 2. Trust building observed.",
      },
    });
    await prisma.attempt.update({
      where: { id: session2AttemptId },
      data: { status: "COMPLETED", finishedAt: new Date(), sessionNumber: 2 },
    });

    // Write session-2 summary
    const writerService = makeArcWriterService();
    await writerService.writeSessionSummary(session2AttemptId);

    // Create session 3 attempt
    const orgService = makeOrgService();
    const attempt = await orgService.getOrCreateAttempt(assignmentId, userId, "en", "STUDENT");
    session3AttemptId = (attempt as Record<string, unknown>)["id"] as string;
    attemptIds.push(session3AttemptId);
    expect((attempt as Record<string, unknown>)["sessionNumber"]).toBe(3);
  });

  // Complete session 3
  it("setup: complete session 3", async () => {
    await prisma.patientStateLog.create({
      data: {
        attemptId: session3AttemptId,
        turnNumber: 1,
        trust: 0.62,
        openness: 0.55,
        emotionalActiv: 0.44,
        avoidanceLevel: 0.40,
        defensiveness: 0.32,
        allianceQuality: 0.60,
        disclosureReady: 0.22,
        riskRelevance: 0.00,
        unlockedFactIds: ["fact-01", "fact-02", "fact-03"],
        pendingTriggers: [],
        analyserOutput: {},
        challengeLevel: 2,
        guardResult: "PASS",
        guardDetail: null,
        summarisedUpTo: null,
        contextSummary: "Session 3. Therapeutic alliance established.",
      },
    });
    await prisma.attempt.update({
      where: { id: session3AttemptId },
      data: { status: "COMPLETED", finishedAt: new Date(), sessionNumber: 3 },
    });
    const writerService = makeArcWriterService();
    await writerService.writeSessionSummary(session3AttemptId);

    const summary = await prisma.arcSessionSummary.findUnique({
      where: {
        userId_templateId_sessionNumber: { userId, templateId, sessionNumber: 3 },
      },
    });
    expect(summary).not.toBeNull();
  });

  // A4: ARC_COMPLETE guard blocks a 4th attempt when maxSessions=3
  it("A4: ARC_COMPLETE guard blocks attempt creation when all 3 sessions are completed", async () => {
    const orgService = makeOrgService();

    try {
      await orgService.getOrCreateAttempt(assignmentId, userId, "en", "STUDENT");
      fail("Should have thrown ARC_COMPLETE");
    } catch (err: unknown) {
      const ex = err as HttpException;
      expect(ex.getStatus()).toBe(403);
      const body = ex.getResponse() as Record<string, unknown>;
      expect(body["code"]).toBe("ARC_COMPLETE");
    }
  });
});
