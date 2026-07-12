// arc-enforce.spec.ts -- S5-GAL-ARC-ENFORCE unit tests
// Tests: maxSessions template validation (2-4) + attempt-create ARC_COMPLETE guard.
//
// Test items:
//   E1: createTemplate rejects maxSessions < 2 (e.g. 1) with 400
//   E2: createTemplate rejects maxSessions > 4 (e.g. 5) with 400
//   E3: createTemplate accepts maxSessions=2 (low end)
//   E4: createTemplate accepts maxSessions=4 (high end)
//   E5: updateTemplate rejects out-of-range maxSessions with 400
//   G1: getOrCreateAttempt throws ARC_COMPLETE (403) when STUDENT has completedCount >= maxSessions
//   G2: getOrCreateAttempt assigns sessionNumber = completedCount + 1 on new arc attempt
//   G3: getOrCreateAttempt is no-op for maxSessions <= 1 (non-arc template)
//   G4: getOrCreateAttempt returns existing non-completed attempt unchanged (no double-create)

import { BadRequestException, HttpException, NotFoundException } from "@nestjs/common";
import { AuthoringService } from "../authoring/authoring.service.js";
import { OrgService } from "../org/org.service.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEMPLATE_ID = "template-arc-001";
const ASSIGNMENT_ID = "assignment-arc-001";
const USER_ID = "user-arc-001";

function makeAuthoringPrisma(overrides: Record<string, unknown> = {}) {
  return {
    groundTruth: {
      create: jest.fn().mockResolvedValue({ id: "gt-001", simulationTemplateId: "PENDING" }),
      update: jest.fn().mockResolvedValue({ id: "gt-001", simulationTemplateId: TEMPLATE_ID }),
    },
    simulationTemplate: {
      create: jest.fn().mockResolvedValue({
        id: TEMPLATE_ID,
        title: "Arc Test",
        version: 1,
        maxSessions: 3,
      }),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    $transaction: jest.fn().mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) => fn({
      groundTruth: {
        create: jest.fn().mockResolvedValue({ id: "gt-001", simulationTemplateId: "PENDING" }),
        update: jest.fn().mockResolvedValue({ id: "gt-001", simulationTemplateId: TEMPLATE_ID }),
      },
      simulationTemplate: {
        create: jest.fn().mockResolvedValue({
          id: TEMPLATE_ID,
          title: "Arc Test",
          version: 1,
          maxSessions: 3,
        }),
      },
    })),
    ...overrides,
  };
}

function makeOrgPrisma(opts: {
  assignmentMaxSessions?: number;
  completedCount?: number;
  existingAttempt?: object | null;
} = {}) {
  const {
    assignmentMaxSessions = 3,
    completedCount = 0,
    existingAttempt = null,
  } = opts;

  return {
    attempt: {
      findFirst: jest.fn().mockResolvedValue(existingAttempt),
      create: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) =>
        Promise.resolve({ id: "attempt-new-001", ...args.data }),
      ),
      count: jest.fn().mockResolvedValue(completedCount),
    },
    assignment: {
      findUnique: jest.fn().mockResolvedValue({
        id: ASSIGNMENT_ID,
        simulationTemplate: {
          id: TEMPLATE_ID,
          maxSessions: assignmentMaxSessions,
        },
      }),
    },
  };
}

// ---------------------------------------------------------------------------
// E-series: maxSessions validation in AuthoringService
// ---------------------------------------------------------------------------

describe("S5-GAL-ARC-ENFORCE: maxSessions template validation", () => {
  const VALID_BUILDER = {
    title: "Test",
    clinicalModel: "CBT",
    studentLevel: "year-2",
    primarySkill: "empathy",
    patientStyle: "avoidant",
    presentingProblem: "depression",
    riskLevel: "low",
    challengeLevel: 3,
    languages: ["he"],
    mode: "intake",
  };

  it("E1: rejects maxSessions=1 (below arc range) with 400 BadRequestException", async () => {
    const prisma = makeAuthoringPrisma();
    const service = new AuthoringService(prisma as never);
    await expect(
      service.createTemplate({ builder: { ...VALID_BUILDER, maxSessions: 1 } }),
    ).rejects.toThrow(BadRequestException);
  });

  it("E2: rejects maxSessions=5 (above arc range) with 400 BadRequestException", async () => {
    const prisma = makeAuthoringPrisma();
    const service = new AuthoringService(prisma as never);
    await expect(
      service.createTemplate({ builder: { ...VALID_BUILDER, maxSessions: 5 } }),
    ).rejects.toThrow(BadRequestException);
  });

  it("E3: accepts maxSessions=2 (valid arc minimum)", async () => {
    const prisma = makeAuthoringPrisma();
    const service = new AuthoringService(prisma as never);
    // Should not throw
    await expect(
      service.createTemplate({ builder: { ...VALID_BUILDER, maxSessions: 2 } }),
    ).resolves.toBeDefined();
  });

  it("E4: accepts maxSessions=4 (valid arc maximum)", async () => {
    const prisma = makeAuthoringPrisma();
    const service = new AuthoringService(prisma as never);
    await expect(
      service.createTemplate({ builder: { ...VALID_BUILDER, maxSessions: 4 } }),
    ).resolves.toBeDefined();
  });

  it("E5: updateTemplate rejects out-of-range maxSessions with 400 BadRequestException", async () => {
    const prisma = {
      simulationTemplate: {
        findUnique: jest.fn().mockResolvedValue({
          id: TEMPLATE_ID,
          version: 1,
          maxSessions: 3,
          assignments: [],
          personaPrompt: "test prompt",
        }),
      },
    };
    const service = new AuthoringService(prisma as never);
    await expect(
      service.updateTemplate(TEMPLATE_ID, { builder: { maxSessions: 6 } }),
    ).rejects.toThrow(BadRequestException);
  });

  it("E6: omitting maxSessions is valid (DB default applies)", async () => {
    const prisma = makeAuthoringPrisma();
    const service = new AuthoringService(prisma as never);
    // No maxSessions in builder -- should resolve without error
    await expect(
      service.createTemplate({ builder: VALID_BUILDER }),
    ).resolves.toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// G-series: ARC_COMPLETE guard in OrgService.getOrCreateAttempt
// ---------------------------------------------------------------------------

describe("S5-GAL-ARC-ENFORCE: ARC_COMPLETE guard in getOrCreateAttempt", () => {
  it("G1: throws 403 ARC_COMPLETE when student has completedCount >= maxSessions", async () => {
    // maxSessions=3, completedCount=3 -> should block
    const prisma = makeOrgPrisma({ assignmentMaxSessions: 3, completedCount: 3 });
    const service = new OrgService(prisma as never);

    await expect(
      service.getOrCreateAttempt(ASSIGNMENT_ID, USER_ID, "he", "STUDENT"),
    ).rejects.toThrow(HttpException);

    try {
      await service.getOrCreateAttempt(ASSIGNMENT_ID, USER_ID, "he", "STUDENT");
    } catch (err: unknown) {
      const ex = err as HttpException;
      expect(ex.getStatus()).toBe(403);
      const body = ex.getResponse() as Record<string, unknown>;
      expect(body["code"]).toBe("ARC_COMPLETE");
    }
  });

  it("G2: assigns sessionNumber = completedCount + 1 on new arc attempt", async () => {
    // completedCount=1, maxSessions=3 -> new attempt should get sessionNumber=2
    const prisma = makeOrgPrisma({ assignmentMaxSessions: 3, completedCount: 1 });
    const service = new OrgService(prisma as never);

    const attempt = await service.getOrCreateAttempt(ASSIGNMENT_ID, USER_ID, "he", "STUDENT");
    expect((attempt as Record<string, unknown>)["sessionNumber"]).toBe(2);
  });

  it("G2b: first session gets sessionNumber=1 (completedCount=0)", async () => {
    const prisma = makeOrgPrisma({ assignmentMaxSessions: 3, completedCount: 0 });
    const service = new OrgService(prisma as never);

    const attempt = await service.getOrCreateAttempt(ASSIGNMENT_ID, USER_ID, "he", "STUDENT");
    expect((attempt as Record<string, unknown>)["sessionNumber"]).toBe(1);
  });

  it("G3: non-arc template (maxSessions=1) skips arc guard and sets no sessionNumber", async () => {
    // maxSessions=1 -> no arc guard, no sessionNumber
    const prisma = makeOrgPrisma({ assignmentMaxSessions: 1, completedCount: 99 });
    const service = new OrgService(prisma as never);

    // Should NOT throw even with 99 completed attempts
    const attempt = await service.getOrCreateAttempt(ASSIGNMENT_ID, USER_ID, "he", "STUDENT");
    expect(attempt).toBeDefined();
    // sessionNumber should NOT be set (falls through to basic create)
    expect((attempt as Record<string, unknown>)["sessionNumber"]).toBeUndefined();
  });

  it("G4: returns existing IN_PROGRESS attempt without incrementing sessionNumber", async () => {
    const existing = {
      id: "attempt-existing-001",
      status: "IN_PROGRESS",
      sessionNumber: 1,
      userId: USER_ID,
    };
    const prisma = makeOrgPrisma({
      assignmentMaxSessions: 3,
      completedCount: 0,
      existingAttempt: existing,
    });
    const service = new OrgService(prisma as never);

    const attempt = await service.getOrCreateAttempt(ASSIGNMENT_ID, USER_ID, "he", "STUDENT");
    // Should return the existing attempt (findFirst returns it, no create called)
    expect((attempt as Record<string, unknown>)["id"]).toBe("attempt-existing-001");
    expect(prisma.attempt.create).not.toHaveBeenCalled();
  });

  it("G5: AUTHOR_PREVIEW skips arc guard entirely (always creates)", async () => {
    // Even with completedCount >= maxSessions, AUTHOR_PREVIEW should bypass
    const prisma = makeOrgPrisma({ assignmentMaxSessions: 3, completedCount: 10 });
    const service = new OrgService(prisma as never);

    // Should not throw
    const attempt = await service.getOrCreateAttempt(
      ASSIGNMENT_ID,
      USER_ID,
      "he",
      "AUTHOR_PREVIEW",
    );
    expect(attempt).toBeDefined();
    expect((attempt as Record<string, unknown>)["type"]).toBe("AUTHOR_PREVIEW");
  });
});
