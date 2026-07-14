/**
 * dsr-live.integration.spec.ts -- S8-ADI-DSRLIVE
 *
 * Live-Postgres DSR integration test.
 * ADDITIVE spec: does NOT modify any existing suite or spec file.
 *
 * Why this test exists (Oren S7 MINOR-3 / MAJOR-1):
 *   dsr.spec.ts is fully mocked -- it cannot prove FK ordering is safe against real
 *   Postgres constraints, cannot catch the MAJOR-1 class of gap (null-attemptId
 *   SupportTickets), and cannot confirm DiagnosticLog rows are swept. This spec is
 *   the live-DB proof and regression guard for all three.
 *
 * Seed -- target student (targetUserId):
 *   - User row
 *   - One Attempt with six non-cascading child types:
 *       Message, PatientStateLog, Evaluation, DebriefChat, UsageLog,
 *       SupportTicket (attemptId = Attempt.id)
 *   - SupportTicket with attemptId = NULL (MAJOR-1 regression case)
 *   - DiagnosticLog linked to the null-attemptId SupportTicket
 *   - ArcSessionSummary (userId = targetUserId)
 *
 * Seed -- second student (otherUserId):
 *   - ArcSessionSummary, SupportTicket (attemptId = NULL), linked DiagnosticLog
 *
 * Action: simulationService.deleteStudentData(targetUserId)
 *
 * Assertions (a)-(j): zero target-user rows remain; no FK error thrown.
 * Assertions (k)-(l): other-student rows survive (data isolation).
 *
 * Teardown: all seeded rows deleted in FK-safe order in afterAll.
 *
 * Run via: pnpm --filter @aps/api test:integration
 */

// CONVENTION (Sprint 9, S9-ADI-TRYFIN): all integration specs MUST wrap
// beforeAll/afterAll seed+teardown in try/finally (afterAll) and try/catch (beforeAll)
// to prevent partial-seed orphan rows on test failure.
// Exemplar: this file. Pattern applies to all new integration specs from Sprint 9 onward.
// Ref: Oren S8 MINOR-2, review-sprint-8-oren.md.

import { PrismaClient } from "@aps/db";
import { PrismaService } from "../db/prisma.service.js";
import { SimulationService } from "../simulation/simulation.service.js";

const prisma = new PrismaClient();
const uid = () => Math.random().toString(36).slice(2, 10);
const asPrismaService = () => prisma as unknown as PrismaService;

// ---------------------------------------------------------------------------
// Fixture IDs (set in outer beforeAll)
// ---------------------------------------------------------------------------

let suffix: string;

// Shared hierarchy
let collegeId: string;
let courseId: string;
let groundTruthId: string;
let templateId: string;
let rubricVersionId: string;
let assignmentId: string;

// Target student
let targetUserId: string;
let seededAttemptId: string;
let seededDiagnosticLogId: string; // linked to the null-attemptId SupportTicket

// Other student
let otherUserId: string;
let otherDiagnosticLogId: string;

// ---------------------------------------------------------------------------
// Outer setup: seed all data
// ---------------------------------------------------------------------------

beforeAll(async () => {
  try {
    await prisma.$connect();
    suffix = uid();

  // Shared hierarchy
  const college = await prisma.college.create({
    data: { name: `DSR-Live-College-${suffix}`, slug: `dsr-${suffix}` },
  });
  collegeId = college.id;

  const course = await prisma.course.create({
    data: { collegeId, name: `DSR-Live-Course-${suffix}`, code: `DSR-${suffix}` },
  });
  courseId = course.id;

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
      title: `DSR-Live-Template-${suffix}`,
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

  // Back-fill real templateId on GroundTruth (pattern from arc.integration.spec.ts)
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

  // ---------------------------------------------------------------------------
  // Target student
  // ---------------------------------------------------------------------------

  const targetUser = await prisma.user.create({
    data: {
      email: `dsr-target-${suffix}@test.local`,
      displayName: `DSR Target ${suffix}`,
    },
  });
  targetUserId = targetUser.id;

  // Attempt
  const attempt = await prisma.attempt.create({
    data: {
      assignmentId,
      userId: targetUserId,
      language: "en",
      type: "STUDENT",
      status: "COMPLETED",
      startedAt: new Date(),
      finishedAt: new Date(),
    },
  });
  seededAttemptId = attempt.id;

  // 1. Message (child of Attempt -- no userId FK)
  await prisma.message.create({
    data: {
      attemptId: seededAttemptId,
      role: "STUDENT",
      turnNumber: 1,
      originalText: "DSR live test student message",
      language: "en",
    },
  });

  // 2. PatientStateLog
  await prisma.patientStateLog.create({
    data: {
      attemptId: seededAttemptId,
      turnNumber: 1,
      trust: 0.40,
      openness: 0.30,
      emotionalActiv: 0.40,
      avoidanceLevel: 0.50,
      defensiveness: 0.45,
      allianceQuality: 0.40,
      disclosureReady: 0.10,
      riskRelevance: 0.00,
      unlockedFactIds: [],
      pendingTriggers: [],
      analyserOutput: {},
      challengeLevel: 2,
      guardResult: "PASS",
      guardDetail: null,
      summarisedUpTo: null,
      contextSummary: null,
    },
  });

  // 3. Evaluation (attemptId is @unique -- one per attempt)
  await prisma.evaluation.create({
    data: {
      attemptId: seededAttemptId,
      rubricVersionId,
      status: "PENDING",
      structuredScores: {},
      transcriptHighlights: {},
    },
  });

  // 4. DebriefChat
  await prisma.debriefChat.create({
    data: {
      attemptId: seededAttemptId,
      role: "STUDENT",
      turnNumber: 1,
      text: "DSR live test debrief message",
      citedTurns: [],
    },
  });

  // 5. UsageLog
  await prisma.usageLog.create({
    data: {
      attemptId: seededAttemptId,
      eventType: "SIMULATION_TURN",
      inputTokens: 10,
      outputTokens: 20,
    },
  });

  // 6. SupportTicket with attemptId = Attempt.id (no DiagnosticLog on this one)
  await prisma.supportTicket.create({
    data: {
      attemptId: seededAttemptId,
      userId: targetUserId,
      issueCategory: "AI_RESPONSE_FAILURE",
      metadata: {},
    },
  });

  // MAJOR-1 REGRESSION CASE: SupportTicket with attemptId = NULL.
  // Create DiagnosticLog first (SupportTicket.diagnosticLogId FK points to it).
  const diagLog = await prisma.diagnosticLog.create({
    data: { payload: { source: "dsr-live-test", testSuffix: suffix } },
  });
  seededDiagnosticLogId = diagLog.id;

  await prisma.supportTicket.create({
    data: {
      attemptId: null,
      userId: targetUserId,
      issueCategory: "OTHER",
      metadata: {},
      diagnosticLogId: seededDiagnosticLogId,
    },
  });

  // ArcSessionSummary for target user
  await prisma.arcSessionSummary.create({
    data: {
      userId: targetUserId,
      templateId,
      sessionNumber: 1,
      finalTrustLevel: 0.45,
      finalOpennessLevel: 0.35,
      finalAllianceLevel: 0.40,
    },
  });

  // ---------------------------------------------------------------------------
  // Other student (must survive deleteStudentData)
  // ---------------------------------------------------------------------------

  const otherUser = await prisma.user.create({
    data: {
      email: `dsr-other-${suffix}@test.local`,
      displayName: `DSR Other ${suffix}`,
    },
  });
  otherUserId = otherUser.id;

  // ArcSessionSummary
  await prisma.arcSessionSummary.create({
    data: {
      userId: otherUserId,
      templateId,
      sessionNumber: 1,
      finalTrustLevel: 0.50,
      finalOpennessLevel: 0.40,
      finalAllianceLevel: 0.45,
    },
  });

  // SupportTicket (attemptId = NULL) + linked DiagnosticLog
  const otherDiagLog = await prisma.diagnosticLog.create({
    data: { payload: { source: "dsr-live-test-other", testSuffix: suffix } },
  });
  otherDiagnosticLogId = otherDiagLog.id;

  await prisma.supportTicket.create({
    data: {
      attemptId: null,
      userId: otherUserId,
      issueCategory: "OTHER",
      metadata: {},
      diagnosticLogId: otherDiagnosticLogId,
    },
  });
  } catch (err) {
    // cleanup on seed failure to avoid orphan rows
    await prisma.$disconnect();
    throw err;
  }
});

// ---------------------------------------------------------------------------
// Outer teardown: FK-safe order (children before parents)
// Per-table try/catch so one failure does not abort the rest of teardown.
// Guards check each id before use -- may be undefined on partial-seed failure.
// ---------------------------------------------------------------------------

afterAll(async () => {
  try {
    // Other student rows (deleteStudentData did NOT touch these)
    if (otherUserId) {
      try { await prisma.arcSessionSummary.deleteMany({ where: { userId: otherUserId } }); } catch (_) {}
      try { await prisma.supportTicket.deleteMany({ where: { userId: otherUserId } }); } catch (_) {}
    }
    // DiagnosticLog after SupportTicket (SupportTicket holds FK to DiagnosticLog)
    if (otherDiagnosticLogId) {
      try { await prisma.diagnosticLog.deleteMany({ where: { id: otherDiagnosticLogId } }); } catch (_) {}
    }

    // Target student rows (safety deletes -- deleteStudentData should have removed these;
    // these are no-ops if the test passed, defensive cleanup if it failed mid-way)
    if (targetUserId) {
      try { await prisma.arcSessionSummary.deleteMany({ where: { userId: targetUserId } }); } catch (_) {}
      try { await prisma.supportTicket.deleteMany({ where: { userId: targetUserId } }); } catch (_) {}
    }
    if (seededDiagnosticLogId) {
      try { await prisma.diagnosticLog.deleteMany({ where: { id: seededDiagnosticLogId } }); } catch (_) {}
    }
    // Attempt children (FK to Attempt)
    if (seededAttemptId) {
      try { await prisma.debriefChat.deleteMany({ where: { attemptId: seededAttemptId } }); } catch (_) {}
      try { await prisma.evaluation.deleteMany({ where: { attemptId: seededAttemptId } }); } catch (_) {}
      try { await prisma.usageLog.deleteMany({ where: { attemptId: seededAttemptId } }); } catch (_) {}
      try { await prisma.patientStateLog.deleteMany({ where: { attemptId: seededAttemptId } }); } catch (_) {}
      try { await prisma.message.deleteMany({ where: { attemptId: seededAttemptId } }); } catch (_) {}
      // Attempt before Assignment and User
      try { await prisma.attempt.deleteMany({ where: { id: seededAttemptId } }); } catch (_) {}
    }

    // Hierarchy (reverse FK order -- see arc.integration.spec.ts teardown pattern)
    if (assignmentId) {
      try { await prisma.assignment.deleteMany({ where: { id: assignmentId } }); } catch (_) {}
    }
    if (rubricVersionId) {
      try { await prisma.rubricVersion.deleteMany({ where: { id: rubricVersionId } }); } catch (_) {}
    }
    if (templateId) {
      try { await prisma.simulationTemplate.deleteMany({ where: { id: templateId } }); } catch (_) {}
    }
    if (groundTruthId) {
      try { await prisma.groundTruth.deleteMany({ where: { id: groundTruthId } }); } catch (_) {}
    }
    const userIds = [targetUserId, otherUserId].filter(Boolean);
    if (userIds.length > 0) {
      try { await prisma.user.deleteMany({ where: { id: { in: userIds } } }); } catch (_) {}
    }
    if (courseId) {
      try { await prisma.course.deleteMany({ where: { id: courseId } }); } catch (_) {}
    }
    if (collegeId) {
      try { await prisma.college.deleteMany({ where: { id: collegeId } }); } catch (_) {}
    }
  } finally {
    await prisma.$disconnect();
  }
});

// ---------------------------------------------------------------------------
// Helper: SimulationService backed by live Prisma.
// deleteStudentData uses only the prisma dependency; stubs for the rest.
// ---------------------------------------------------------------------------

function makeSimulationService(): SimulationService {
  const stub = {} as never;
  return new SimulationService(asPrismaService(), stub, stub, stub, stub);
}

// ---------------------------------------------------------------------------
// Assertions
// ---------------------------------------------------------------------------

describe("S8-ADI-DSRLIVE: SimulationService.deleteStudentData (live Postgres)", () => {
  // Call deleteStudentData once; all assertions query the live DB afterward.
  let deleteError: unknown = undefined;

  beforeAll(async () => {
    const service = makeSimulationService();
    try {
      await service.deleteStudentData(targetUserId);
    } catch (err) {
      deleteError = err;
    }
  });

  // (j) -- call completes without throwing; checked first so FK failures surface here.
  it("(j) deleteStudentData resolves without throwing -- no FK error, no exception", () => {
    expect(deleteError).toBeUndefined();
  });

  it("(a) zero ArcSessionSummary rows remain for target user", async () => {
    const count = await prisma.arcSessionSummary.count({
      where: { userId: targetUserId },
    });
    expect(count).toBe(0);
  });

  it("(b) zero Attempt rows remain for target user", async () => {
    const count = await prisma.attempt.count({ where: { userId: targetUserId } });
    expect(count).toBe(0);
  });

  it("(c) zero Message rows remain for seeded attempt", async () => {
    // Messages have no userId FK; query by seeded attempt ID.
    const count = await prisma.message.count({
      where: { attemptId: seededAttemptId },
    });
    expect(count).toBe(0);
  });

  it("(d) zero PatientStateLog rows remain for seeded attempt", async () => {
    const count = await prisma.patientStateLog.count({
      where: { attemptId: seededAttemptId },
    });
    expect(count).toBe(0);
  });

  it("(e) zero Evaluation rows remain for seeded attempt", async () => {
    const count = await prisma.evaluation.count({
      where: { attemptId: seededAttemptId },
    });
    expect(count).toBe(0);
  });

  it("(f) zero DebriefChat rows remain for seeded attempt", async () => {
    const count = await prisma.debriefChat.count({
      where: { attemptId: seededAttemptId },
    });
    expect(count).toBe(0);
  });

  it("(g) zero UsageLog rows remain for seeded attempt", async () => {
    const count = await prisma.usageLog.count({
      where: { attemptId: seededAttemptId },
    });
    expect(count).toBe(0);
  });

  it("(h) zero SupportTicket rows remain for target user (covers null-attemptId ticket)", async () => {
    // userId-scoped query covers BOTH the attempt-linked ticket AND the
    // null-attemptId ticket (the MAJOR-1 regression case).
    const count = await prisma.supportTicket.count({
      where: { userId: targetUserId },
    });
    expect(count).toBe(0);
  });

  it("(i) DiagnosticLog linked to null-attemptId ticket is swept (MAJOR-1 guard)", async () => {
    // This row would survive if deleteStudentData used attemptId-scoped ticket
    // deletes only (the pre-fix behavior). userId-scoped delete + diagnosticLogId
    // sweep must remove it.
    const row = await prisma.diagnosticLog.findUnique({
      where: { id: seededDiagnosticLogId },
    });
    expect(row).toBeNull();
  });

  // Isolation assertions: other student's rows must survive
  it("(k) other student ArcSessionSummary row survives (isolation)", async () => {
    const count = await prisma.arcSessionSummary.count({
      where: { userId: otherUserId },
    });
    expect(count).toBeGreaterThanOrEqual(1);
  });

  it("(l) other student SupportTicket row survives (isolation)", async () => {
    const count = await prisma.supportTicket.count({
      where: { userId: otherUserId },
    });
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
