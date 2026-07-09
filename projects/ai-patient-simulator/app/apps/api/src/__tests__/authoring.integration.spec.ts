/**
 * Authoring -- integration tests (DEFERRED: requires live Postgres)
 * APS-REQ-028/029/030/031/032/039/040/041/042
 *
 * Status: WRITTEN; NOT RUN this session (Docker/Postgres DOWN -- WSL engine won't start).
 * These tests exercise the full AuthoringService + PrismaService stack against a real DB.
 *
 * Run when Postgres is available:
 *   pnpm --filter @aps/api test:integration
 *
 * Prerequisites:
 *   - DATABASE_URL in .env.local points to a running Postgres instance
 *   - prisma db push (or migrate dev) has been run
 *
 * Each test block seeds its own data and cleans up in afterAll.
 */

import { Test, TestingModule } from "@nestjs/testing";
import { AuthoringModule } from "../authoring/authoring.module.js";
import { AuthoringService } from "../authoring/authoring.service.js";
import { DbModule } from "../db/db.module.js";
import { PrismaService } from "../db/prisma.service.js";
import { ConflictException, NotFoundException } from "@nestjs/common";
import { DEFAULT_HARD_OFF_RAMP } from "../authoring/authoring.service.js";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TEMPLATE_TITLE = "Integration Test Template";

let app: TestingModule;
let service: AuthoringService;
let prisma: PrismaService;

// ---------------------------------------------------------------------------
// Setup / Teardown
// ---------------------------------------------------------------------------

beforeAll(async () => {
  app = await Test.createTestingModule({
    imports: [DbModule, AuthoringModule],
  }).compile();

  service = app.get<AuthoringService>(AuthoringService);
  prisma = app.get<PrismaService>(PrismaService);
});

afterAll(async () => {
  // Clean up all rows created in this test run.
  // FK-safe delete order: children before parents.
  // M2 FIX: College and Course rows created by the in-use-template test (~line 334)
  // were previously not deleted here, causing unique-constraint failures on re-run
  // (slug column has a @unique constraint on College).
  await prisma.triggerRule.deleteMany({});
  await prisma.rubricCriterion.deleteMany({});
  // Attempt children first, then Attempt, then Assignment (FK: Attempt_assignmentId_fkey).
  // Needed since the support/credit-admin integration suites went live 2026-07-09 and
  // leave attempts behind; previously they were describe.skip so no attempts existed here.
  await prisma.supportTicket.deleteMany({});
  await prisma.diagnosticLog.deleteMany({});
  await prisma.usageLog.deleteMany({});
  await prisma.debriefChat.deleteMany({});
  await prisma.evaluation.deleteMany({});
  await prisma.patientStateLog.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.attempt.deleteMany({});
  // Assignment references rubricVersionId + simulationTemplateId, so it must be deleted
  // BEFORE RubricVersion and SimulationTemplate (FK: Assignment_rubricVersionId_fkey).
  await prisma.assignment.deleteMany({});
  await prisma.rubricVersion.deleteMany({});
  await prisma.simulationTemplate.deleteMany({});
  await prisma.groundTruth.deleteMany({});
  // CreditEntry -> CreditLedger -> College/Course (FK: CreditLedger_collegeId_fkey);
  // ledgers left behind by the credit-admin integration suite (live since 2026-07-09).
  await prisma.creditEntry.deleteMany({});
  await prisma.creditLedger.deleteMany({});
  // M2: Course before College (FK: Course.collegeId references College)
  await prisma.course.deleteMany({});
  await prisma.college.deleteMany({});
  await app.close();
});

// ---------------------------------------------------------------------------
// Template lifecycle (APS-REQ-028/029)
// ---------------------------------------------------------------------------

describe("[integration] AuthoringService -- template lifecycle", () => {
  let createdTemplateId: string;

  it("creates a SimulationTemplate with composited personaPrompt", async () => {
    const result = await service.createTemplate({
      builder: {
        title: TEMPLATE_TITLE,
        clinicalModel: "CBT",
        studentLevel: "year2",
        primarySkill: "empathy",
        patientStyle: "withdrawn",
        presentingProblem: "Persistent low mood",
        riskLevel: "medium",
        challengeLevel: 3,
        languages: ["he", "en"],
        mode: "intake",
      },
    });

    createdTemplateId = result.id;
    expect(result.title).toBe(TEMPLATE_TITLE);
    expect(result.personaPrompt).toContain("CBT");
    expect(result.personaPrompt).toContain("Persistent low mood");
    expect(result.version).toBe(1);
  });

  it("getTemplate returns the created template", async () => {
    const result = await service.getTemplate(createdTemplateId);
    expect(result.id).toBe(createdTemplateId);
    expect(result.groundTruth).toBeDefined();
  });

  it("updateTemplate on unused template updates in place", async () => {
    const result = await service.updateTemplate(createdTemplateId, {
      builder: { title: "Updated Title" },
    });
    expect(result.versionBumped).toBe(false);
    expect(result.template.title).toBe("Updated Title");
    expect(result.template.id).toBe(createdTemplateId);
  });
});

// ---------------------------------------------------------------------------
// Ground truth (APS-REQ-030)
// ---------------------------------------------------------------------------

describe("[integration] AuthoringService -- ground truth", () => {
  let templateId: string;

  beforeAll(async () => {
    const t = await service.createTemplate({
      builder: {
        title: "GT Integration Test",
        clinicalModel: "DBT",
        studentLevel: "year3",
        primarySkill: "active_listening",
        patientStyle: "anxious",
        presentingProblem: "Anxiety attacks",
        riskLevel: "low",
        challengeLevel: 2,
        languages: ["he"],
        mode: "ongoing",
      },
    });
    templateId = t.id;
  });

  it("createGroundTruth populates knownFacts and disclosureAllowList", async () => {
    const result = await service.createGroundTruth({
      simulationTemplateId: templateId,
      knownFacts: {
        facts: ["Patient reports anxiety for 6 months"],
        doNotInvent: ["Medication history"],
        riskBoundaries: ["No suicidal ideation in this scenario"],
      },
      disclosureAllowList: {
        disclosed: ["Anxiety at work"],
        unlocked: [],
        locked: ["Childhood trauma"],
        triggers: [],
      },
      escalationRules: { threshold: "high" },
    });

    expect(result.simulationTemplateId).toBe(templateId);
    expect((result.knownFacts as Record<string, unknown>)["facts"]).toHaveLength(1);
  });

  it("auto-injects default hardOffRampText when caller omits it", async () => {
    // Create a new template for this specific test
    const t2 = await service.createTemplate({
      builder: {
        title: "Off-Ramp Integration Test",
        clinicalModel: "CBT",
        studentLevel: "year1",
        primarySkill: "empathy",
        patientStyle: "neutral",
        presentingProblem: "Test case",
        riskLevel: "low",
        challengeLevel: 1,
        languages: ["he"],
        mode: "intake",
      },
    });

    const result = await service.createGroundTruth({
      simulationTemplateId: t2.id,
      knownFacts: { facts: [], doNotInvent: [], riskBoundaries: [] },
      disclosureAllowList: { disclosed: [], unlocked: [], locked: [], triggers: [] },
      escalationRules: {},
      // hardOffRampText omitted
    });

    expect(result.hardOffRampText).toBe(DEFAULT_HARD_OFF_RAMP);
  });
});

// ---------------------------------------------------------------------------
// Trigger rules (APS-REQ-031)
// ---------------------------------------------------------------------------

describe("[integration] AuthoringService -- trigger rules", () => {
  let templateId: string;

  beforeAll(async () => {
    const t = await service.createTemplate({
      builder: {
        title: "Trigger Integration Test",
        clinicalModel: "CBT",
        studentLevel: "year2",
        primarySkill: "empathy",
        patientStyle: "resistant",
        presentingProblem: "Depression",
        riskLevel: "medium",
        challengeLevel: 3,
        languages: ["he"],
        mode: "intake",
      },
    });
    templateId = t.id;
  });

  it("creates a trigger rule for a template", async () => {
    const result = await service.createTriggerRule({
      simulationTemplateId: templateId,
      triggerCondition: "empathy >= 0.7",
      action: "UNLOCK:FACT_ID_01",
      priority: 1,
    });

    expect(result.simulationTemplateId).toBe(templateId);
    expect(result.triggerCondition).toBe("empathy >= 0.7");
    expect(result.action).toBe("UNLOCK:FACT_ID_01");
    expect(result.priority).toBe(1);
  });

  it("getTriggerRules returns all rules ordered by priority", async () => {
    // Create a second rule with lower priority
    await service.createTriggerRule({
      simulationTemplateId: templateId,
      triggerCondition: "trust >= 0.8",
      action: "UNLOCK:FACT_ID_02",
      priority: 0,
    });

    const rules = await service.getTriggerRules(templateId);
    expect(rules.length).toBe(2);
    // Ordered by priority asc: priority 0 first
    expect(rules[0].priority).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Rubric versioning (APS-REQ-032/039/040/041/042)
// ---------------------------------------------------------------------------

describe("[integration] AuthoringService -- rubric versioning", () => {
  let templateId: string;
  let rubricVersionId: string;

  beforeAll(async () => {
    const t = await service.createTemplate({
      builder: {
        title: "Rubric Integration Test",
        clinicalModel: "CBT",
        studentLevel: "year2",
        primarySkill: "clinical_reasoning",
        patientStyle: "guarded",
        presentingProblem: "Trauma history",
        riskLevel: "high",
        challengeLevel: 4,
        languages: ["he", "en"],
        mode: "intake",
      },
    });
    templateId = t.id;
  });

  it("generateRubric creates a DRAFT rubric version with criteria", async () => {
    const result = await service.generateRubric({ simulationTemplateId: templateId });

    rubricVersionId = result.id;
    expect(result.status).toBe("DRAFT");
    expect(result.criteria.length).toBeGreaterThanOrEqual(6);

    const riskCriterion = result.criteria.find((c: Record<string, unknown>) => c["labelKey"] === "risk_awareness");
    expect(riskCriterion).toBeDefined();
    expect(riskCriterion!["formativeOnly"]).toBe(true);
  });

  it("generateRubric throws ConflictException when DRAFT exists", async () => {
    await expect(
      service.generateRubric({ simulationTemplateId: templateId }),
    ).rejects.toThrow(ConflictException);
  });

  it("updateCriterion updates a criterion on the DRAFT rubric", async () => {
    const rv = await service.getRubricVersion(rubricVersionId);
    const firstCriterionId = rv.criteria[0].id;

    const updated = await service.updateCriterion(firstCriterionId, {
      labels: { he: "עדכון", en: "Updated" },
    });

    expect(updated).toBeDefined();
  });

  it("publishRubric transitions DRAFT to PUBLISHED with publishedAt set", async () => {
    const result = await service.publishRubric(rubricVersionId);

    expect(result.status).toBe("PUBLISHED");
    expect(result.publishedAt).toBeInstanceOf(Date);
  });

  it("publishRubric throws ConflictException when already PUBLISHED", async () => {
    await expect(service.publishRubric(rubricVersionId)).rejects.toThrow(ConflictException);
  });

  it("updateCriterion throws ConflictException after rubric is published", async () => {
    const rv = await service.getRubricVersion(rubricVersionId);
    const criterionId = rv.criteria[0].id;

    await expect(
      service.updateCriterion(criterionId, { weight: 0.99 }),
    ).rejects.toThrow(ConflictException);
  });

  it("can generate a new rubric version after first is PUBLISHED", async () => {
    const result = await service.generateRubric({ simulationTemplateId: templateId });
    expect(result.version).toBe(2);
    expect(result.status).toBe("DRAFT");
  });
});

// ---------------------------------------------------------------------------
// Template versioning -- in-use bump (APS-REQ-032)
// ---------------------------------------------------------------------------

describe("[integration] AuthoringService -- template version bump when in use", () => {
  it("updating an in-use template creates a new template record", async () => {
    // This test requires seeding an Assignment row which requires a Course, College, RubricVersion.
    // Full seed is complex -- simplified: we manually insert a stub assignment via Prisma directly.
    // This test is marked as complex-seed and is the most important integration case to run
    // when Postgres is available.
    //
    // Simplified path: create a College, Course, RubricVersion, Assignment to make template in-use.
    // Then call updateTemplate and verify versionBumped=true and a new template row is created.
    //
    // IMPLEMENTATION: see full seed below.

    const college = await prisma.college.create({
      data: { name: "Test College", slug: `test-coll-${Date.now()}` },
    });
    const course = await prisma.course.create({
      data: { collegeId: college.id, name: "Test Course", code: "TC101" },
    });
    const template = await service.createTemplate({
      builder: {
        title: "In-Use Template",
        clinicalModel: "CBT",
        studentLevel: "year1",
        primarySkill: "empathy",
        patientStyle: "neutral",
        presentingProblem: "Test",
        riskLevel: "low",
        challengeLevel: 1,
        languages: ["he"],
        mode: "intake",
      },
    });

    // Create a rubric version so we can create an assignment
    const rv = await service.generateRubric({ simulationTemplateId: template.id });
    const publishedRv = await service.publishRubric(rv.id);

    await prisma.assignment.create({
      data: {
        courseId: course.id,
        simulationTemplateId: template.id,
        rubricVersionId: publishedRv.id,
        challengeLevel: 1,
        languagesAllowed: ["he"],
      },
    });

    // Now update -- should bump version
    const result = await service.updateTemplate(template.id, {
      builder: { title: "Updated In-Use Template" },
    });

    expect(result.versionBumped).toBe(true);
    expect(result.template.id).not.toBe(template.id);
    expect(result.template.version).toBe(2);

    // Original template must still exist with version 1
    const original = await service.getTemplate(template.id);
    expect(original.version).toBe(1);
  });
});
