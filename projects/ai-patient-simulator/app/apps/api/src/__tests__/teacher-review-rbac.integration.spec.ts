/**
 * Teacher-review state-log RBAC integration test (APS-REQ-017, Sprint 2 Inc 3)
 *
 * Tests against LIVE Postgres (localhost:5433, via DATABASE_URL in env).
 * Uses StubProvider -- no real LLM, no network calls.
 *
 * Verifies scope-based access to GET /simulations/:attemptId/state-log:
 *   (a) The course's own teacher receives the state-log rows.
 *   (b) A teacher of a DIFFERENT course is Forbidden.
 *   (c) SYSTEM_ADMIN receives rows regardless of course scope.
 *
 * Test isolation: all data created under randomly-generated IDs and deleted in afterAll.
 */

import { PrismaClient } from "@aps/db";
import { PrismaService } from "../db/prisma.service.js";
import { SimulationService } from "../simulation/simulation.service.js";
import { EvaluationService } from "../evaluation/evaluation.service.js";
import { TurnPipeline, StubProvider, Evaluator } from "@aps/engine";
import type { UserScope } from "@aps/shared-types";
import { ForbiddenException } from "@nestjs/common";

// ---------------------------------------------------------------------------
// Shared Prisma instance
// ---------------------------------------------------------------------------
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Random fixture helper
// ---------------------------------------------------------------------------
const uid = () => Math.random().toString(36).slice(2, 10);

// ---------------------------------------------------------------------------
// Fixture IDs
// ---------------------------------------------------------------------------
let collegeId: string;

// Course A (the attempt's course)
let courseAId: string;
let teacherAId: string;        // teacher of course A

// Course B (unrelated course)
let courseBId: string;
let teacherBId: string;        // teacher of course B only -- should be Forbidden

// System admin user
let adminId: string;

// Student / attempt hierarchy
let userId: string;
let templateId: string;
let groundTruthId: string;
let rubricVersionId: string;
let assignmentId: string;
let attemptId: string;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
beforeAll(async () => {
  await prisma.$connect();
  const suffix = uid();

  // College
  const college = await prisma.college.create({
    data: { name: `RBAC Test College ${suffix}`, slug: `rbac-tc-${suffix}` },
  });
  collegeId = college.id;

  // Course A
  const courseA = await prisma.course.create({
    data: { collegeId, name: `Course A ${suffix}`, code: `CA-${suffix}` },
  });
  courseAId = courseA.id;

  // Course B
  const courseB = await prisma.course.create({
    data: { collegeId, name: `Course B ${suffix}`, code: `CB-${suffix}` },
  });
  courseBId = courseB.id;

  // Student (owns the attempt)
  const student = await prisma.user.create({
    data: {
      email: `student-rbac-${suffix}@test.local`,
      displayName: `Student RBAC ${suffix}`,
    },
  });
  userId = student.id;

  // Teacher A (belongs to Course A)
  const teacherA = await prisma.user.create({
    data: {
      email: `teacher-a-${suffix}@test.local`,
      displayName: `Teacher A ${suffix}`,
    },
  });
  teacherAId = teacherA.id;
  await prisma.userRoleAssignment.create({
    data: {
      userId: teacherAId,
      role: "TEACHER",
      scopeType: "COURSE",
      scopeId: courseAId,
    },
  });

  // Teacher B (belongs only to Course B)
  const teacherB = await prisma.user.create({
    data: {
      email: `teacher-b-${suffix}@test.local`,
      displayName: `Teacher B ${suffix}`,
    },
  });
  teacherBId = teacherB.id;
  await prisma.userRoleAssignment.create({
    data: {
      userId: teacherBId,
      role: "TEACHER",
      scopeType: "COURSE",
      scopeId: courseBId,
    },
  });

  // System admin user (no course scope -- college-level)
  const admin = await prisma.user.create({
    data: {
      email: `admin-rbac-${suffix}@test.local`,
      displayName: `Admin RBAC ${suffix}`,
    },
  });
  adminId = admin.id;

  // GroundTruth (placeholder simulationTemplateId updated after template is created)
  const gt = await prisma.groundTruth.create({
    data: {
      simulationTemplateId: "placeholder",
      knownFacts: { doNotInvent: [] },
      disclosureAllowList: { unlocked: ["Patient reports low mood"], locked: [] },
      escalationRules: {},
      hardOffRampText: "This is a simulation.",
    },
  });
  groundTruthId = gt.id;

  // SimulationTemplate
  const template = await prisma.simulationTemplate.create({
    data: {
      title: `RBAC Test Template ${suffix}`,
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

  await prisma.groundTruth.update({
    where: { id: groundTruthId },
    data: { simulationTemplateId: templateId },
  });

  // RubricVersion
  const rubric = await prisma.rubricVersion.create({
    data: {
      simulationTemplateId: templateId,
      version: 1,
      status: "PUBLISHED",
    },
  });
  rubricVersionId = rubric.id;

  // Assignment for Course A
  const assignment = await prisma.assignment.create({
    data: {
      courseId: courseAId,
      simulationTemplateId: templateId,
      rubricVersionId,
      challengeLevel: 2,
      languagesAllowed: ["en"],
      maxTurns: 10,
    },
  });
  assignmentId = assignment.id;

  // Attempt for the student
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

  // Run one turn to produce a PatientStateLog row
  const provider = new StubProvider();
  const pipeline = new TurnPipeline(provider);
  const prismaService = prisma as unknown as PrismaService;
  const evaluationService = new EvaluationService(prismaService, new Evaluator(provider));
  const service = new SimulationService(
    prismaService,
    pipeline,
    evaluationService,
    { loadArcContext: jest.fn().mockResolvedValue(null) } as any,
    { writeSessionSummary: jest.fn().mockResolvedValue(undefined) } as any,
  );

  // actorScopes for the student (used only to pass processTurn ownership check)
  await service.processTurn(
    { attemptId, studentMessage: "Hello.", language: "en" },
    userId,
  );
});

// ---------------------------------------------------------------------------
// Teardown -- FK-safe order
// ---------------------------------------------------------------------------
afterAll(async () => {
  await prisma.usageLog.deleteMany({ where: { attemptId } });
  await prisma.message.deleteMany({ where: { attemptId } });
  await prisma.patientStateLog.deleteMany({ where: { attemptId } });
  await prisma.attempt.deleteMany({ where: { id: attemptId } });
  await prisma.assignment.deleteMany({ where: { id: assignmentId } });
  await prisma.rubricVersion.deleteMany({ where: { id: rubricVersionId } });
  await prisma.simulationTemplate.deleteMany({ where: { id: templateId } });
  await prisma.groundTruth.deleteMany({ where: { id: groundTruthId } });
  await prisma.userRoleAssignment.deleteMany({ where: { userId: teacherAId } });
  await prisma.userRoleAssignment.deleteMany({ where: { userId: teacherBId } });
  await prisma.user.deleteMany({ where: { id: { in: [userId, teacherAId, teacherBId, adminId] } } });
  await prisma.course.deleteMany({ where: { id: { in: [courseAId, courseBId] } } });
  await prisma.college.deleteMany({ where: { id: collegeId } });
  await prisma.$disconnect();
});

// ---------------------------------------------------------------------------
// Helper: build a SimulationService with real Prisma + StubProvider
// ---------------------------------------------------------------------------
function buildService(): SimulationService {
  const provider = new StubProvider();
  const pipeline = new TurnPipeline(provider);
  // EvaluationService required by SimulationService constructor (Sprint 2 APS-016).
  // getPatientStateLogs and processTurn do not invoke it; safe to pass real instance.
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

function teacherAScopes(): UserScope[] {
  return [{ role: "TEACHER", scopeType: "COURSE", scopeId: courseAId }];
}

function teacherBScopes(): UserScope[] {
  return [{ role: "TEACHER", scopeType: "COURSE", scopeId: courseBId }];
}

function adminScopes(): UserScope[] {
  return [{ role: "SYSTEM_ADMIN", scopeType: "COLLEGE", scopeId: collegeId }];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("getPatientStateLogs -- teacher-review RBAC (live Postgres)", () => {
  it("(a) teacher of the attempt's course receives state-log rows", async () => {
    const service = buildService();
    const logs = await service.getPatientStateLogs(attemptId, teacherAId, teacherAScopes());

    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThanOrEqual(1);

    const firstLog = logs[0] as Record<string, unknown>;
    expect(firstLog["attemptId"]).toBe(attemptId);
    expect(typeof firstLog["trust"]).toBe("number");
  });

  it("(b) teacher of a DIFFERENT course is Forbidden", async () => {
    const service = buildService();
    await expect(
      service.getPatientStateLogs(attemptId, teacherBId, teacherBScopes()),
    ).rejects.toThrow(ForbiddenException);
  });

  it("(c) SYSTEM_ADMIN receives state-log rows regardless of course scope", async () => {
    const service = buildService();
    const logs = await service.getPatientStateLogs(attemptId, adminId, adminScopes());

    expect(Array.isArray(logs)).toBe(true);
    expect(logs.length).toBeGreaterThanOrEqual(1);
  });

  it("state-log rows contain expected turn fields", async () => {
    const service = buildService();
    const logs = await service.getPatientStateLogs(attemptId, teacherAId, teacherAScopes());

    expect(logs.length).toBeGreaterThanOrEqual(1);
    const row = logs[0] as Record<string, unknown>;
    expect(typeof row["turnNumber"]).toBe("number");
    expect(typeof row["trust"]).toBe("number");
    expect(typeof row["openness"]).toBe("number");
    expect(row["guardResult"]).toBeDefined();
  });

  it("throws NotFoundException for a non-existent attemptId", async () => {
    const { NotFoundException } = await import("@nestjs/common");
    const service = buildService();
    await expect(
      service.getPatientStateLogs("00000000-0000-0000-0000-000000000000", teacherAId, teacherAScopes()),
    ).rejects.toThrow(NotFoundException);
  });
});
