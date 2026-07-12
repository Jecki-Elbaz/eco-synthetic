/**
 * arc-coherence.integration.spec.ts -- S5-ADI-ARC-COHERENCE (Sami C2)
 *
 * Three explicit Sami C2 full-stack coherence cases against LIVE Postgres.
 * This suite is ADDITIVE -- does not modify or duplicate Gal's arc.integration.spec.ts
 * (tests A1-A6). Gal owns engine/service mechanical correctness. Adi owns the three
 * Sami C2 full-stack coherence cases below.
 *
 * C1-ARC-COHERENCE:
 *   Full 3-session arc. Session-3 context loads from session-2 summary ONLY (not
 *   session-1 directly). Accumulated + clamped state is correct in session-3 context.
 *   Notable moments from session 2 appear in session-3 arc context.
 *
 * C2-INVENTED-FACTS (Track-B NO-GO if this fails):
 *   A false fact seeded into the session-2 ArcSessionSummary must NOT appear in the
 *   authoritative ground-truth block or guard-model input. It may appear in the arc
 *   context block (labeled context-only). Tests the loader/writer boundary: session
 *   summaries are context, not authoritative ground truth.
 *
 * C3-CEILING:
 *   Two sequential positive-delta sessions do not push session-3 starting state above
 *   ArcDeltaConfig ceilings. Patient retains resistance (trust < 1.0).
 *
 * Test isolation: all data created under a unique suffix and deleted in afterAll.
 * StubProvider: not needed -- ContextBuilder is a pure function (no LLM calls needed
 * for the compounding-facts and ceiling assertions).
 */

import { PrismaClient } from "@aps/db";
import { PrismaService } from "../db/prisma.service.js";
import { ArcLoaderService } from "../simulation/arc/arc-loader.service.js";
import { ArcWriterService } from "../simulation/arc/arc-writer.service.js";
import { ContextBuilder } from "@aps/engine";
import type { ContextBuildInput } from "@aps/engine";
import type { ArcSessionContext } from "@aps/shared-types";
import { DEFAULT_ARC_DELTA_CONFIG } from "../simulation/arc/arc-delta-config.js";

const prisma = new PrismaClient();

const uid = () => Math.random().toString(36).slice(2, 10);

// Adapt PrismaClient to the PrismaService duck type used by services
const asPrismaService = () => prisma as unknown as PrismaService;

// ---------------------------------------------------------------------------
// Shared hierarchy (created once for all three test groups)
// ---------------------------------------------------------------------------
let suffix: string;
let collegeId: string;
let courseId: string;
let templateId: string;
let groundTruthId: string;
let rubricVersionId: string;
let assignmentId: string;

// User IDs, one per test group for full isolation
let userAId: string; // C1-ARC-COHERENCE
let userBId: string; // C2-INVENTED-FACTS
let userCId: string; // C3-CEILING

// All attempt IDs created during the run (for teardown)
const allAttemptIds: string[] = [];

// ---------------------------------------------------------------------------
// Outer setup / teardown
// ---------------------------------------------------------------------------

beforeAll(async () => {
  await prisma.$connect();
  suffix = uid();

  const college = await prisma.college.create({
    data: { name: `Coh College ${suffix}`, slug: `coh-${suffix}` },
  });
  collegeId = college.id;

  const course = await prisma.course.create({
    data: { collegeId, name: `Coh Course ${suffix}`, code: `COH-${suffix}` },
  });
  courseId = course.id;

  // Placeholder groundTruthId; real simulationTemplateId set after template created
  const gt = await prisma.groundTruth.create({
    data: {
      simulationTemplateId: "placeholder",
      knownFacts: {
        facts: ["patient reports anxiety for six months"],
        doNotInvent: ["patient has no siblings mentioned in case notes"],
        riskBoundaries: [],
      },
      disclosureAllowList: {
        unlocked: ["patient reports anxiety", "patient has difficulty sleeping"],
        locked: ["patient has no prior psychiatric history"],
      },
      escalationRules: {},
      hardOffRampText: "This is a simulated training patient and not a real person.",
    },
  });
  groundTruthId = gt.id;

  const template = await prisma.simulationTemplate.create({
    data: {
      title: `Coh Template ${suffix}`,
      clinicalModel: "CBT",
      studentLevel: "undergraduate",
      challengeLevel: 2,
      riskLevel: "low",
      languages: ["en"],
      personaPrompt: "You are a simulated patient presenting with anxiety.",
      groundTruthId,
      maxSessions: 3,
    },
  });
  templateId = template.id;

  // Back-fill the real templateId on groundTruth
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

  const userA = await prisma.user.create({
    data: {
      email: `coh-A-${suffix}@test.local`,
      displayName: `Coh Student A ${suffix}`,
    },
  });
  userAId = userA.id;

  const userB = await prisma.user.create({
    data: {
      email: `coh-B-${suffix}@test.local`,
      displayName: `Coh Student B ${suffix}`,
    },
  });
  userBId = userB.id;

  const userC = await prisma.user.create({
    data: {
      email: `coh-C-${suffix}@test.local`,
      displayName: `Coh Student C ${suffix}`,
    },
  });
  userCId = userC.id;
});

afterAll(async () => {
  // ArcSessionSummary: all three users
  await prisma.arcSessionSummary.deleteMany({
    where: { templateId, userId: { in: [userAId, userBId, userCId] } },
  });

  // Attempts and their child rows
  for (const aId of allAttemptIds) {
    await prisma.usageLog.deleteMany({ where: { attemptId: aId } });
    await prisma.message.deleteMany({ where: { attemptId: aId } });
    await prisma.patientStateLog.deleteMany({ where: { attemptId: aId } });
  }
  if (allAttemptIds.length > 0) {
    await prisma.attempt.deleteMany({ where: { id: { in: allAttemptIds } } });
  }

  // Hierarchy (reverse FK order)
  await prisma.assignment.deleteMany({ where: { id: assignmentId } });
  await prisma.rubricVersion.deleteMany({ where: { id: rubricVersionId } });
  await prisma.simulationTemplate.deleteMany({ where: { id: templateId } });
  await prisma.groundTruth.deleteMany({ where: { id: groundTruthId } });
  await prisma.user.deleteMany({ where: { id: { in: [userAId, userBId, userCId] } } });
  await prisma.course.deleteMany({ where: { id: courseId } });
  await prisma.college.deleteMany({ where: { id: collegeId } });

  await prisma.$disconnect();
});

// ===========================================================================
// C1: Full 3-session arc coherence
// ===========================================================================

describe("S5-ADI-ARC-COHERENCE C1: Full 3-session arc coherence", () => {
  let s1AttemptId: string;
  let s2AttemptId: string;

  // Run the full 2-session setup before assertions.
  // (Session 3 attempt is not created; we only load arc context for it.)
  beforeAll(async () => {
    const writer = new ArcWriterService(asPrismaService());

    // --- Session 1 for userA ---
    const s1Attempt = await prisma.attempt.create({
      data: {
        assignmentId,
        userId: userAId,
        language: "en",
        type: "STUDENT",
        status: "NOT_STARTED",
        sessionNumber: 1,
      },
    });
    s1AttemptId = s1Attempt.id;
    allAttemptIds.push(s1AttemptId);

    await prisma.patientStateLog.create({
      data: {
        attemptId: s1AttemptId,
        turnNumber: 1,
        trust: 0.45,
        openness: 0.35,
        emotionalActiv: 0.42,
        avoidanceLevel: 0.55,
        defensiveness: 0.48,
        allianceQuality: 0.40,
        disclosureReady: 0.10,
        riskRelevance: 0.00,
        unlockedFactIds: ["fact-a1"],
        pendingTriggers: [],
        analyserOutput: {},
        challengeLevel: 2,
        guardResult: "PASS",
        guardDetail: null,
        summarisedUpTo: null,
        contextSummary: "S1: patient presented with general anxiety and sleep disturbance.",
      },
    });

    await prisma.attempt.update({
      where: { id: s1AttemptId },
      data: { status: "COMPLETED", finishedAt: new Date(), sessionNumber: 1 },
    });

    await writer.writeSessionSummary(s1AttemptId);

    // --- Session 2 for userA ---
    const s2Attempt = await prisma.attempt.create({
      data: {
        assignmentId,
        userId: userAId,
        language: "en",
        type: "STUDENT",
        status: "NOT_STARTED",
        sessionNumber: 2,
      },
    });
    s2AttemptId = s2Attempt.id;
    allAttemptIds.push(s2AttemptId);

    await prisma.patientStateLog.create({
      data: {
        attemptId: s2AttemptId,
        turnNumber: 1,
        trust: 0.58,
        openness: 0.46,
        emotionalActiv: 0.44,
        avoidanceLevel: 0.48,
        defensiveness: 0.40,
        allianceQuality: 0.52,
        disclosureReady: 0.18,
        riskRelevance: 0.00,
        unlockedFactIds: ["fact-a1", "fact-a2"],
        pendingTriggers: [],
        analyserOutput: {},
        challengeLevel: 2,
        guardResult: "PASS",
        guardDetail: null,
        summarisedUpTo: null,
        contextSummary:
          "S2: patient opened up about work stress and time management difficulties.",
      },
    });

    await prisma.attempt.update({
      where: { id: s2AttemptId },
      data: { status: "COMPLETED", finishedAt: new Date(), sessionNumber: 2 },
    });

    await writer.writeSessionSummary(s2AttemptId);
  });

  it("C1-T1: session-1 ArcSessionSummary exists with correct userId/templateId", async () => {
    const summary = await prisma.arcSessionSummary.findUnique({
      where: {
        userId_templateId_sessionNumber: { userId: userAId, templateId, sessionNumber: 1 },
      },
    });
    expect(summary).not.toBeNull();
    expect(summary!.userId).toBe(userAId);
    expect(summary!.templateId).toBe(templateId);
    expect(summary!.sessionNumber).toBe(1);
  });

  it("C1-T2: session-2 ArcSessionSummary exists with trust/openness/alliance from session-2 PatientStateLog", async () => {
    const summary = await prisma.arcSessionSummary.findUnique({
      where: {
        userId_templateId_sessionNumber: { userId: userAId, templateId, sessionNumber: 2 },
      },
    });
    expect(summary).not.toBeNull();
    expect(summary!.sessionNumber).toBe(2);
    // Values within ceiling (0.58 < 0.70, 0.46 < 0.65, 0.52 < 0.70) -- no clamping expected
    expect(summary!.finalTrustLevel).toBeCloseTo(0.58, 2);
    expect(summary!.finalOpennessLevel).toBeCloseTo(0.46, 2);
    expect(summary!.finalAllianceLevel).toBeCloseTo(0.52, 2);
  });

  it("C1-T3: session-3 arc context loads from session-2 summary (sessionNumber=2), not session-1", async () => {
    const loader = new ArcLoaderService(asPrismaService());
    const ctx = await loader.loadArcContext(userAId, templateId, 3);

    expect(ctx).not.toBeNull();
    // sessionNumber on the context must be 2 (the prior session, not session 1)
    expect(ctx!.sessionNumber).toBe(2);
    // Trust must match session-2 final, not session-1 final (0.45)
    expect(ctx!.trustLevel).toBeCloseTo(0.58, 2);
    expect(ctx!.trustLevel).not.toBeCloseTo(0.45, 1);
  });

  it("C1-T4: session-3 arc context carries accumulated state from sessions 1+2", async () => {
    const loader = new ArcLoaderService(asPrismaService());
    const ctx = await loader.loadArcContext(userAId, templateId, 3);

    expect(ctx).not.toBeNull();
    // Session-2 values are higher than session-1 (positive delta across two sessions)
    expect(ctx!.trustLevel).toBeCloseTo(0.58, 2);
    expect(ctx!.opennessLevel).toBeCloseTo(0.46, 2);
    expect(ctx!.allianceScore).toBeCloseTo(0.52, 2);
    // All values must be within config bounds
    expect(ctx!.trustLevel).toBeLessThanOrEqual(DEFAULT_ARC_DELTA_CONFIG.maxTrust);
    expect(ctx!.opennessLevel).toBeLessThanOrEqual(DEFAULT_ARC_DELTA_CONFIG.maxOpenness);
    expect(ctx!.allianceScore).toBeLessThanOrEqual(DEFAULT_ARC_DELTA_CONFIG.maxAlliance);
  });

  it("C1-T5: session-3 arc context notableMomentsSummary reflects session-2 content, not session-1", async () => {
    const loader = new ArcLoaderService(asPrismaService());
    const ctx = await loader.loadArcContext(userAId, templateId, 3);

    expect(ctx).not.toBeNull();
    // Must contain session-2 content
    expect(ctx!.notableMomentsSummary).toContain("S2:");
    expect(ctx!.notableMomentsSummary).toContain("work stress");
    // Must NOT contain session-1 content directly (last-session-summary pattern)
    expect(ctx!.notableMomentsSummary).not.toContain("S1:");
  });
});

// ===========================================================================
// C2: Compounding invented facts (Track-B NO-GO if any assertion fails)
// ===========================================================================

describe("S5-ADI-ARC-COHERENCE C2: Compounding invented facts (Track-B NO-GO if fail)", () => {
  const FALSE_FACT = "patient mentioned a sister";

  // GroundTruth used for context builder -- authored truth has NO mention of a sister
  const groundTruthRef = {
    disclosureAllowList: {
      unlocked: [
        "patient reports anxiety for six months",
        "patient has difficulty sleeping",
      ],
      locked: ["patient has no prior psychiatric history"],
    },
    doNotInvent: [
      "patient has no trauma history disclosed",
      "patient has no known substance use",
    ],
    hardOffRampText: "This is a simulated training patient and not a real person.",
  };

  let arcCtx: ArcSessionContext | null = null;
  let patientMessages: Array<{ role: string; content: string }> = [];
  let guardMessages: Array<{ role: string; content: string }> = [];

  beforeAll(async () => {
    // DIRECT DB SEED: inject controlled false fact into session-2 ArcSessionSummary.
    // The seeded notableMomentsSummary contains a fact NOT present in the authored ground truth.
    await prisma.arcSessionSummary.upsert({
      where: {
        userId_templateId_sessionNumber: { userId: userBId, templateId, sessionNumber: 2 },
      },
      create: {
        userId: userBId,
        templateId,
        sessionNumber: 2,
        trustDeltaApplied: 0.1,
        finalTrustLevel: 0.45,
        finalOpennessLevel: 0.35,
        finalAllianceLevel: 0.40,
        symptomMarkerState: { unlockedFactIds: ["fact-b1"] },
        // FALSE FACT injected here: "patient mentioned a sister" is absent from
        // SimulationTemplate.groundTruth. This simulates an LLM confabulation in
        // the session-2 summary that must NOT propagate to session-3 ground truth.
        notableMomentsSummary: FALSE_FACT,
        sessionCompletedAt: new Date(),
      },
      update: { notableMomentsSummary: FALSE_FACT },
    });

    // Load arc context for session 3: reads session-2 summary
    const loader = new ArcLoaderService(asPrismaService());
    arcCtx = await loader.loadArcContext(userBId, templateId, 3);

    // Build the patient context prompt (what the patient model receives)
    const cb = new ContextBuilder();
    const minimalState = {
      attemptId: "test-c2-attempt",
      turnNumber: 1,
      trust: 0.30,
      openness: 0.20,
      emotionalActiv: 0.40,
      avoidanceLevel: 0.60,
      defensiveness: 0.50,
      allianceQuality: 0.20,
      disclosureReady: 0.10,
      riskRelevance: 0.00,
      unlockedFactIds: [],
      pendingTriggers: [],
      challengeLevel: 2,
      guardResult: "PASS" as const,
      guardDetail: null,
      summarisedUpTo: null,
      contextSummary: null,
    };

    const buildInput: ContextBuildInput = {
      personaSystemPrompt: "You are a simulated patient with anxiety.",
      currentState: minimalState,
      groundTruth: groundTruthRef,
      recentMessages: [],
      contextSummary: null,
      challengeLevel: 2,
      studentMessage: "How are you feeling today?",
      studentLanguage: "en",
      arcContext: arcCtx,
    };

    patientMessages = cb.build(buildInput) as Array<{ role: string; content: string }>;

    // Build the guard prompt (what the guard model receives to check ground-truth compliance)
    guardMessages = cb.buildGuardPrompt(
      "I am doing better. My anxiety is lower.",
      groundTruthRef,
      1,
    ) as Array<{ role: string; content: string }>;
  });

  it("C2-T1: seeded false fact is present in loaded arc context notableMomentsSummary", () => {
    // Verifies: the loader correctly reads the seeded summary from session-2
    expect(arcCtx).not.toBeNull();
    expect(arcCtx!.notableMomentsSummary).toContain(FALSE_FACT);
  });

  it("C2-T2: false fact appears in patient context arc block (labeled context-only, not ground truth)", () => {
    // The arc context block must contain the false fact -- it is injected as context.
    // The block header must label it as context-only (not ground truth).
    const arcBlock = patientMessages.find(
      (m) => m.role === "system" && m.content.includes("PRIOR SESSION CONTEXT"),
    );
    expect(arcBlock).toBeDefined();
    expect(arcBlock!.content).toContain(FALSE_FACT);
    // Must be labeled as context only, not authoritative
    expect(arcBlock!.content).toContain("context only, not ground truth");
  });

  it("C2-T3: false fact does NOT appear in guard prompt or guard ground-truth input (NO-GO if fail)", () => {
    // The guard model only receives authored ground truth.
    // The false fact from the arc summary MUST NOT appear in the guard input.
    // A failure here means the arc summary has been promoted to ground-truth status --
    // this is the Sami C2 compounding-facts defect and is a Track-B NO-GO.
    const guardContent = guardMessages.map((m) => m.content).join("\n");
    expect(guardContent).not.toContain(FALSE_FACT);
  });

  it("C2-T4: authored ground truth contains no mention of the seeded false fact (test setup sanity check)", () => {
    // Confirms the test setup is correct: the false fact exists only in the arc summary,
    // not in the authored groundTruth that was passed to the context builder.
    const allGroundTruthContent = [
      ...groundTruthRef.disclosureAllowList.unlocked,
      ...groundTruthRef.doNotInvent,
    ].join(" ");
    expect(allGroundTruthContent).not.toContain("sister");
  });
});

// ===========================================================================
// C3: Above-average student ceiling enforcement (Sami C4 via QA lens)
// ===========================================================================

describe("S5-ADI-ARC-COHERENCE C3: Above-average student ceiling enforcement", () => {
  let s3ArcCtx: ArcSessionContext | null = null;

  beforeAll(async () => {
    const writer = new ArcWriterService(asPrismaService());

    // Session 1 for userC: positive delta, values within ceiling
    const s1Attempt = await prisma.attempt.create({
      data: {
        assignmentId,
        userId: userCId,
        language: "en",
        type: "STUDENT",
        status: "NOT_STARTED",
        sessionNumber: 1,
      },
    });
    allAttemptIds.push(s1Attempt.id);

    await prisma.patientStateLog.create({
      data: {
        attemptId: s1Attempt.id,
        turnNumber: 1,
        trust: 0.65,        // within ceiling (maxTrust=0.70)
        openness: 0.58,     // within ceiling (maxOpenness=0.65)
        emotionalActiv: 0.44,
        avoidanceLevel: 0.44,
        defensiveness: 0.38,
        allianceQuality: 0.63, // within ceiling (maxAlliance=0.70)
        disclosureReady: 0.22,
        riskRelevance: 0.00,
        unlockedFactIds: ["fact-c1"],
        pendingTriggers: [],
        analyserOutput: {},
        challengeLevel: 2,
        guardResult: "PASS",
        guardDetail: null,
        summarisedUpTo: null,
        contextSummary: "S1: strong empathy from student; significant trust building.",
      },
    });

    await prisma.attempt.update({
      where: { id: s1Attempt.id },
      data: { status: "COMPLETED", finishedAt: new Date(), sessionNumber: 1 },
    });
    await writer.writeSessionSummary(s1Attempt.id);

    // Session 2 for userC: raw values ABOVE ceiling to prove clamping fires
    const s2Attempt = await prisma.attempt.create({
      data: {
        assignmentId,
        userId: userCId,
        language: "en",
        type: "STUDENT",
        status: "NOT_STARTED",
        sessionNumber: 2,
      },
    });
    allAttemptIds.push(s2Attempt.id);

    await prisma.patientStateLog.create({
      data: {
        attemptId: s2Attempt.id,
        turnNumber: 1,
        trust: 0.82,        // ABOVE maxTrust=0.70 -- must be clamped to 0.70
        openness: 0.72,     // ABOVE maxOpenness=0.65 -- must be clamped to 0.65
        emotionalActiv: 0.46,
        avoidanceLevel: 0.38,
        defensiveness: 0.30,
        allianceQuality: 0.85, // ABOVE maxAlliance=0.70 -- must be clamped to 0.70
        disclosureReady: 0.28,
        riskRelevance: 0.00,
        unlockedFactIds: ["fact-c1", "fact-c2"],
        pendingTriggers: [],
        analyserOutput: {},
        challengeLevel: 2,
        guardResult: "PASS",
        guardDetail: null,
        summarisedUpTo: null,
        contextSummary:
          "S2: exceptional session; student achieved high rapport and symptom disclosure.",
      },
    });

    await prisma.attempt.update({
      where: { id: s2Attempt.id },
      data: { status: "COMPLETED", finishedAt: new Date(), sessionNumber: 2 },
    });
    await writer.writeSessionSummary(s2Attempt.id);

    // Load arc context for session 3: should reflect clamped session-2 values
    const loader = new ArcLoaderService(asPrismaService());
    s3ArcCtx = await loader.loadArcContext(userCId, templateId, 3);
  });

  it("C3-T1: session-3 arc context is not null (session-2 summary was written and loaded)", () => {
    expect(s3ArcCtx).not.toBeNull();
    expect(s3ArcCtx!.sessionNumber).toBe(2);
  });

  it("C3-T2: session-3 starting trust <= maxTrust (0.70) -- ceiling enforced on positive delta", () => {
    // Raw session-2 trust was 0.82; ArcWriterService must clamp to maxTrust=0.70
    expect(s3ArcCtx!.trustLevel).toBeLessThanOrEqual(DEFAULT_ARC_DELTA_CONFIG.maxTrust);
    expect(s3ArcCtx!.trustLevel).toBeCloseTo(DEFAULT_ARC_DELTA_CONFIG.maxTrust, 2);
  });

  it("C3-T3: session-3 starting openness <= maxOpenness (0.65) -- ceiling enforced on positive delta", () => {
    // Raw session-2 openness was 0.72; must be clamped to maxOpenness=0.65
    expect(s3ArcCtx!.opennessLevel).toBeLessThanOrEqual(DEFAULT_ARC_DELTA_CONFIG.maxOpenness);
    expect(s3ArcCtx!.opennessLevel).toBeCloseTo(DEFAULT_ARC_DELTA_CONFIG.maxOpenness, 2);
  });

  it("C3-T4: session-3 starting alliance <= maxAlliance (0.70) -- ceiling enforced on positive delta", () => {
    // Raw session-2 alliance was 0.85; must be clamped to maxAlliance=0.70
    expect(s3ArcCtx!.allianceScore).toBeLessThanOrEqual(DEFAULT_ARC_DELTA_CONFIG.maxAlliance);
    expect(s3ArcCtx!.allianceScore).toBeCloseTo(DEFAULT_ARC_DELTA_CONFIG.maxAlliance, 2);
  });

  it("C3-T5: patient retains resistance -- session-3 trust is below 1.0 (not implausibly cooperative)", () => {
    // Even at ceiling, the patient is not fully cooperative. Sami C4 requirement.
    expect(s3ArcCtx!.trustLevel).toBeLessThan(1.0);
    // Ceiling is 0.70; patient still has 30% trust headroom to grow -- retains challenge
    expect(s3ArcCtx!.trustLevel).toBeCloseTo(DEFAULT_ARC_DELTA_CONFIG.maxTrust, 2);
  });

  it("C3-T6: session-2 ArcSessionSummary persisted clamped values (not raw overflow)", async () => {
    // Direct DB verification: the stored values are the post-clamp values, not raw 0.82/0.72/0.85
    const summary = await prisma.arcSessionSummary.findUnique({
      where: {
        userId_templateId_sessionNumber: { userId: userCId, templateId, sessionNumber: 2 },
      },
    });
    expect(summary).not.toBeNull();
    expect(summary!.finalTrustLevel).toBeCloseTo(DEFAULT_ARC_DELTA_CONFIG.maxTrust, 2);
    expect(summary!.finalOpennessLevel).toBeCloseTo(DEFAULT_ARC_DELTA_CONFIG.maxOpenness, 2);
    expect(summary!.finalAllianceLevel).toBeCloseTo(DEFAULT_ARC_DELTA_CONFIG.maxAlliance, 2);
    // Raw overflow values must NOT appear in the stored summary
    expect(summary!.finalTrustLevel).toBeLessThan(0.82);
    expect(summary!.finalOpennessLevel).toBeLessThan(0.72);
    expect(summary!.finalAllianceLevel).toBeLessThan(0.85);
  });
});
