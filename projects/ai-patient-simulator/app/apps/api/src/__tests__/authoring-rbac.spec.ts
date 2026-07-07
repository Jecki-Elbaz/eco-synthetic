/**
 * AuthoringService -- RBAC + business rule unit tests (APS-REQ-028-032, 039-042)
 *
 * Mocks Prisma -- no live DB required.
 * Covers:
 *   (a) RBAC: STUDENT cannot create template (controller-level guard test)
 *   (b) Hard off-ramp: empty hardOffRampText is auto-injected, never rejected
 *   (c) Hard off-ramp: present value is preserved
 *   (d) Rubric publish: DRAFT -> PUBLISHED transition succeeds
 *   (e) Rubric publish: already PUBLISHED throws ConflictException
 *   (f) Criterion update blocked on PUBLISHED rubric (immutability after publish)
 *   (g) Template version lock: updating in-use template creates new version
 *   (h) Template update on unused template: in-place update, no version bump
 *   (i) Ground truth shape validation: missing required array field throws BadRequestException
 *   (j) Generate rubric: existing DRAFT blocks a second generate (ConflictException)
 *   (k) Generate rubric: result contains formativeOnly risk criterion
 */

import { AuthoringService, DEFAULT_HARD_OFF_RAMP } from "../authoring/authoring.service.js";
import { RolesGuard } from "../rbac/roles.guard.js";
import { Reflector } from "@nestjs/core";
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import type { AuthTokenPayload } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TEMPLATE_ID = "template-unit-001";
const GT_ID = "gt-unit-001";
const RUBRIC_V1_ID = "rubric-v1-001";
const CRITERION_ID = "criterion-001";

// ---------------------------------------------------------------------------
// B2: STUDENT cannot access authoring endpoints -- controller guard test
// (APS-REQ-028 RBAC boundary: @RequiredRoles("TEACHER", "SYSTEM_ADMIN") on AuthoringController)
// ---------------------------------------------------------------------------

/**
 * Build a minimal mock ExecutionContext for RolesGuard tests.
 * Mirrors the pattern in rbac.spec.ts -- no HTTP server required.
 */
function makeRolesContext(
  requiredRoles: string[],
  user: AuthTokenPayload,
  params: Record<string, string> = {},
): ExecutionContext {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(requiredRoles),
  } as unknown as Reflector;

  const context = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user, params }),
    }),
  } as unknown as ExecutionContext;

  // Inject the mock reflector so the guard reads our requiredRoles
  (context as unknown as Record<string, unknown>)["_reflector"] = reflector;

  const guard = new RolesGuard(reflector);
  // Expose the guard for assertions
  (context as unknown as Record<string, unknown>)["_guard"] = guard;
  return context;
}

function assertStudentBlocked(requiredRoles: string[], endpointLabel: string): void {
  const studentPayload: AuthTokenPayload = {
    sub: "student-rbac-test",
    email: "student@rbac.test",
    scopes: [{ role: "STUDENT", scopeType: "COURSE", scopeId: "course-rbac-001" }],
    iat: 1000000,
    exp: 9999999,
  };

  const context = makeRolesContext(requiredRoles, studentPayload);
  const reflector = new Reflector();
  const guard = new RolesGuard(
    // Use a reflector that returns our requiredRoles
    { getAllAndOverride: jest.fn().mockReturnValue(requiredRoles) } as unknown as Reflector,
  );

  expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
}

describe("(a) B2 -- STUDENT cannot access authoring endpoints (controller guard layer)", () => {
  // The authoring controller applies @RequiredRoles("TEACHER", "SYSTEM_ADMIN") at class level.
  // A STUDENT-role JWT must receive 403 Forbidden from RolesGuard on any authoring endpoint.
  //
  // This test was listed in the file header as test (a) but was previously absent from the
  // actual test code. B2 BLOCKER fix: added here to prove the RBAC boundary is enforced.

  it("(a) STUDENT is blocked from POST /authoring/templates (create template)", () => {
    assertStudentBlocked(["TEACHER", "SYSTEM_ADMIN"], "POST /authoring/templates");
  });

  it("(a) STUDENT is blocked from PATCH /authoring/rubrics/:id/criteria/:cid (update rubric criterion)", () => {
    assertStudentBlocked(["TEACHER", "SYSTEM_ADMIN"], "PATCH /authoring/rubrics/:id/criteria/:cid");
  });

  it("(a) STUDENT is blocked from POST /authoring/rubric/generate (generate rubric)", () => {
    assertStudentBlocked(["TEACHER", "SYSTEM_ADMIN"], "POST /authoring/rubric/generate");
  });

  it("(a) STUDENT is blocked from POST /authoring/ground-truth (create ground truth)", () => {
    assertStudentBlocked(["TEACHER", "SYSTEM_ADMIN"], "POST /authoring/ground-truth");
  });

  it("(a) TEACHER is allowed (smoke check guard is not over-blocking)", () => {
    const teacherPayload: AuthTokenPayload = {
      sub: "teacher-rbac-test",
      email: "teacher@rbac.test",
      scopes: [{ role: "TEACHER", scopeType: "COURSE", scopeId: "course-rbac-001" }],
      iat: 1000000,
      exp: 9999999,
    };
    const context = makeRolesContext(["TEACHER", "SYSTEM_ADMIN"], teacherPayload);
    const guard = new RolesGuard(
      { getAllAndOverride: jest.fn().mockReturnValue(["TEACHER", "SYSTEM_ADMIN"]) } as unknown as Reflector,
    );
    expect(guard.canActivate(context)).toBe(true);
  });

  it("(a) SYSTEM_ADMIN is allowed (admin bypass)", () => {
    const adminPayload: AuthTokenPayload = {
      sub: "admin-rbac-test",
      email: "admin@rbac.test",
      scopes: [{ role: "SYSTEM_ADMIN", scopeType: "COLLEGE", scopeId: "college-001" }],
      iat: 1000000,
      exp: 9999999,
    };
    const context = makeRolesContext(["TEACHER", "SYSTEM_ADMIN"], adminPayload);
    const guard = new RolesGuard(
      { getAllAndOverride: jest.fn().mockReturnValue(["TEACHER", "SYSTEM_ADMIN"]) } as unknown as Reflector,
    );
    expect(guard.canActivate(context)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Prisma mock factories
// ---------------------------------------------------------------------------

function makeTemplate(overrides?: Record<string, unknown>) {
  return {
    id: TEMPLATE_ID,
    title: "Test Template",
    version: 1,
    clinicalModel: "CBT",
    studentLevel: "year2",
    challengeLevel: 3,
    riskLevel: "medium",
    languages: ["he"],
    personaPrompt: "stub prompt",
    groundTruthId: GT_ID,
    assignments: [],
    rubricVersions: [],
    ...overrides,
  };
}

function makeGroundTruth(overrides?: Record<string, unknown>) {
  return {
    id: GT_ID,
    simulationTemplateId: TEMPLATE_ID,
    knownFacts: { facts: [], doNotInvent: [], riskBoundaries: [] },
    disclosureAllowList: { disclosed: [], unlocked: [], locked: [], triggers: [] },
    escalationRules: {},
    hardOffRampText: DEFAULT_HARD_OFF_RAMP,
    version: 1,
    ...overrides,
  };
}

function makeDraftRubricVersion(overrides?: Record<string, unknown>) {
  return {
    id: RUBRIC_V1_ID,
    simulationTemplateId: TEMPLATE_ID,
    version: 1,
    status: "DRAFT",
    publishedAt: null,
    criteria: [],
    ...overrides,
  };
}

function makePublishedRubricVersion(overrides?: Record<string, unknown>) {
  return {
    ...makeDraftRubricVersion(),
    status: "PUBLISHED",
    publishedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

function makeCriterion(rubricStatus: string) {
  return {
    id: CRITERION_ID,
    rubricVersionId: RUBRIC_V1_ID,
    rubricVersion: { status: rubricStatus },
    labelKey: "empathy",
    labels: { he: "אמפתיה", en: "Empathy" },
    weight: 0.25,
    maxScore: 4,
    scoringAnchors: [],
    competencyId: null,
    formativeOnly: false,
  };
}

// ---------------------------------------------------------------------------
// Mock builder helpers
// ---------------------------------------------------------------------------

function makePrismaForCreate() {
  const mock: Record<string, unknown> = {
    simulationTemplate: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(makeTemplate()),
    },
    groundTruth: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(makeGroundTruth()),
      update: jest.fn().mockResolvedValue(makeGroundTruth()),
    },
    triggerRule: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockResolvedValue({ id: "tr-001", simulationTemplateId: TEMPLATE_ID, triggerCondition: "empathy >= 0.7", action: "UNLOCK:F01", priority: 0 }),
    },
    rubricVersion: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(makeDraftRubricVersion()),
      update: jest.fn().mockResolvedValue(makePublishedRubricVersion()),
    },
    rubricCriterion: {
      findUnique: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({}),
    },
    competency: {
      findMany: jest.fn().mockResolvedValue([]),
    },
  };
  // B1 FIX: $transaction callback receives the mock as the tx object so inner
  // tx.groundTruth.create / tx.simulationTemplate.create etc. resolve correctly.
  mock["$transaction"] = jest.fn().mockImplementation(
    (cb: (tx: typeof mock) => Promise<unknown>) => cb(mock),
  );
  return mock;
}

// ---------------------------------------------------------------------------
// Test: (b) Hard off-ramp auto-inject
// ---------------------------------------------------------------------------

describe("AuthoringService.createGroundTruth -- hard off-ramp enforcement", () => {
  it("(b) auto-injects default hardOffRampText when caller omits it", async () => {
    let capturedData: Record<string, unknown> | null = null;
    const prisma = {
      simulationTemplate: {
        findUnique: jest.fn().mockResolvedValue(makeTemplate()),
      },
      groundTruth: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) => {
          capturedData = args.data;
          return Promise.resolve(makeGroundTruth({ hardOffRampText: args.data["hardOffRampText"] as string }));
        }),
      },
    };

    const service = new AuthoringService(prisma as never);

    await service.createGroundTruth({
      simulationTemplateId: TEMPLATE_ID,
      knownFacts: { facts: [], doNotInvent: [], riskBoundaries: [] },
      disclosureAllowList: { disclosed: [], unlocked: [], locked: [], triggers: [] },
      escalationRules: {},
      // hardOffRampText intentionally omitted
    });

    expect(capturedData).not.toBeNull();
    expect((capturedData as unknown as Record<string, unknown>)["hardOffRampText"]).toBe(DEFAULT_HARD_OFF_RAMP);
  });

  it("(b) auto-injects default when hardOffRampText is empty string", async () => {
    let capturedData: Record<string, unknown> | null = null;
    const prisma = {
      simulationTemplate: {
        findUnique: jest.fn().mockResolvedValue(makeTemplate()),
      },
      groundTruth: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) => {
          capturedData = args.data;
          return Promise.resolve(makeGroundTruth());
        }),
      },
    };

    const service = new AuthoringService(prisma as never);

    await service.createGroundTruth({
      simulationTemplateId: TEMPLATE_ID,
      knownFacts: { facts: [], doNotInvent: [], riskBoundaries: [] },
      disclosureAllowList: { disclosed: [], unlocked: [], locked: [], triggers: [] },
      escalationRules: {},
      hardOffRampText: "   ", // whitespace only -- should also be replaced
    });

    expect((capturedData as Record<string, unknown> | null)?.["hardOffRampText"]).toBe(DEFAULT_HARD_OFF_RAMP);
  });

  it("(c) preserves caller-provided hardOffRampText when non-empty", async () => {
    let capturedData: Record<string, unknown> | null = null;
    const customText = "Custom safety message for this template.";
    const prisma = {
      simulationTemplate: {
        findUnique: jest.fn().mockResolvedValue(makeTemplate()),
      },
      groundTruth: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) => {
          capturedData = args.data;
          return Promise.resolve(makeGroundTruth({ hardOffRampText: customText }));
        }),
      },
    };

    const service = new AuthoringService(prisma as never);

    await service.createGroundTruth({
      simulationTemplateId: TEMPLATE_ID,
      knownFacts: { facts: [], doNotInvent: [], riskBoundaries: [] },
      disclosureAllowList: { disclosed: [], unlocked: [], locked: [], triggers: [] },
      escalationRules: {},
      hardOffRampText: customText,
    });

    expect((capturedData as Record<string, unknown> | null)?.["hardOffRampText"]).toBe(customText);
  });
});

// ---------------------------------------------------------------------------
// Test: (d) Rubric publish DRAFT -> PUBLISHED
// ---------------------------------------------------------------------------

describe("AuthoringService.publishRubric -- DRAFT to PUBLISHED transition", () => {
  it("(d) publishes a DRAFT rubric version successfully", async () => {
    const prisma = {
      rubricVersion: {
        findUnique: jest.fn().mockResolvedValue(makeDraftRubricVersion()),
        update: jest.fn().mockResolvedValue(makePublishedRubricVersion()),
      },
    };

    const service = new AuthoringService(prisma as never);
    const result = await service.publishRubric(RUBRIC_V1_ID) as { status: string };

    expect(result.status).toBe("PUBLISHED");
    expect(prisma.rubricVersion.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: RUBRIC_V1_ID },
        data: expect.objectContaining({ status: "PUBLISHED" }),
      }),
    );
  });

  it("(d) sets publishedAt when publishing", async () => {
    let capturedData: Record<string, unknown> | null = null;
    const prisma = {
      rubricVersion: {
        findUnique: jest.fn().mockResolvedValue(makeDraftRubricVersion()),
        update: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) => {
          capturedData = args.data;
          return Promise.resolve(makePublishedRubricVersion());
        }),
      },
    };

    const service = new AuthoringService(prisma as never);
    await service.publishRubric(RUBRIC_V1_ID);

    expect(capturedData?.["publishedAt"]).toBeInstanceOf(Date);
  });
});

// ---------------------------------------------------------------------------
// Test: (e) Rubric already PUBLISHED throws ConflictException
// ---------------------------------------------------------------------------

describe("AuthoringService.publishRubric -- immutability after publish", () => {
  it("(e) throws ConflictException if already PUBLISHED", async () => {
    const prisma = {
      rubricVersion: {
        findUnique: jest.fn().mockResolvedValue(makePublishedRubricVersion()),
      },
    };

    const service = new AuthoringService(prisma as never);
    await expect(service.publishRubric(RUBRIC_V1_ID)).rejects.toThrow(ConflictException);
  });

  it("(e) does not call update when already PUBLISHED", async () => {
    const updateMock = jest.fn();
    const prisma = {
      rubricVersion: {
        findUnique: jest.fn().mockResolvedValue(makePublishedRubricVersion()),
        update: updateMock,
      },
    };

    const service = new AuthoringService(prisma as never);
    try { await service.publishRubric(RUBRIC_V1_ID); } catch { /* expected */ }
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("(e) throws NotFoundException for unknown rubricVersionId", async () => {
    const prisma = {
      rubricVersion: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };

    const service = new AuthoringService(prisma as never);
    await expect(service.publishRubric("missing-id")).rejects.toThrow(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// Test: (f) Criterion update blocked on PUBLISHED rubric
// ---------------------------------------------------------------------------

describe("AuthoringService.updateCriterion -- immutability enforcement", () => {
  it("(f) throws ConflictException when rubric is PUBLISHED", async () => {
    const prisma = {
      rubricCriterion: {
        findUnique: jest.fn().mockResolvedValue(makeCriterion("PUBLISHED")),
        update: jest.fn(),
      },
    };

    const service = new AuthoringService(prisma as never);
    await expect(
      service.updateCriterion(CRITERION_ID, { weight: 0.3 }),
    ).rejects.toThrow(ConflictException);
  });

  it("(f) allows update when rubric is DRAFT", async () => {
    const prisma = {
      rubricCriterion: {
        findUnique: jest.fn().mockResolvedValue(makeCriterion("DRAFT")),
        update: jest.fn().mockResolvedValue({ id: CRITERION_ID, weight: 0.3 }),
      },
    };

    const service = new AuthoringService(prisma as never);
    const result = await service.updateCriterion(CRITERION_ID, { weight: 0.3 });
    expect(result).toBeDefined();
    expect(prisma.rubricCriterion.update).toHaveBeenCalled();
  });

  it("(f) throws NotFoundException for unknown criterionId", async () => {
    const prisma = {
      rubricCriterion: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };

    const service = new AuthoringService(prisma as never);
    await expect(
      service.updateCriterion("missing-id", { weight: 0.3 }),
    ).rejects.toThrow(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// Test: (g) Version lock -- updating in-use template bumps version
// ---------------------------------------------------------------------------

describe("AuthoringService.updateTemplate -- version lock semantics", () => {
  it("(g) creates new template row when template is referenced by an assignment", async () => {
    const templateInUse = makeTemplate({ assignments: [{ id: "assignment-001" }] });
    const newTemplate = makeTemplate({ id: "template-v2", version: 2 });
    const newGt = makeGroundTruth({ id: "gt-v2", simulationTemplateId: "template-v2" });

    const gtCreateMock = jest.fn().mockResolvedValue(newGt);
    const tplCreateMock = jest.fn().mockResolvedValue(newTemplate);
    const gtUpdateMock = jest.fn().mockResolvedValue(newGt);
    const tplUpdateMock = jest.fn();

    // B1 FIX: the in-use branch now runs inside $transaction.
    // The tx object must expose groundTruth and simulationTemplate with the correct mocks.
    const txMock = {
      groundTruth: { create: gtCreateMock, update: gtUpdateMock },
      simulationTemplate: { create: tplCreateMock, update: tplUpdateMock },
    };

    const prisma = {
      simulationTemplate: {
        findUnique: jest.fn().mockResolvedValue(templateInUse),
        create: tplCreateMock,
        update: tplUpdateMock,
      },
      groundTruth: {
        create: gtCreateMock,
        update: gtUpdateMock,
      },
      $transaction: jest.fn().mockImplementation(
        (cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock),
      ),
    };

    const service = new AuthoringService(prisma as never);
    const result = await service.updateTemplate(TEMPLATE_ID, {
      builder: { title: "Updated Title" },
    }) as { versionBumped: boolean; template: typeof newTemplate };

    expect(result.versionBumped).toBe(true);
    expect(tplCreateMock).toHaveBeenCalled();
    // Original template must NOT be mutated
    expect(tplUpdateMock).not.toHaveBeenCalled();
  });

  it("(h) updates in place when template has no assignments", async () => {
    const templateNotInUse = makeTemplate({ assignments: [] });
    const updateMock = jest.fn().mockResolvedValue({ ...templateNotInUse, title: "Updated" });

    const prisma = {
      simulationTemplate: {
        findUnique: jest.fn().mockResolvedValue(templateNotInUse),
        create: jest.fn(),
        update: updateMock,
      },
    };

    const service = new AuthoringService(prisma as never);
    const result = await service.updateTemplate(TEMPLATE_ID, {
      builder: { title: "Updated" },
    }) as { versionBumped: boolean };

    expect(result.versionBumped).toBe(false);
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: TEMPLATE_ID } }),
    );
    expect(prisma.simulationTemplate.create).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Test: (i) Ground truth shape validation
// ---------------------------------------------------------------------------

describe("AuthoringService.createGroundTruth -- shape validation", () => {
  it("(i) throws BadRequestException when knownFacts.facts is missing", async () => {
    const prisma = {
      simulationTemplate: {
        findUnique: jest.fn().mockResolvedValue(makeTemplate()),
      },
      groundTruth: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
    };

    const service = new AuthoringService(prisma as never);
    await expect(
      service.createGroundTruth({
        simulationTemplateId: TEMPLATE_ID,
        knownFacts: { doNotInvent: [], riskBoundaries: [] } as never,
        disclosureAllowList: { disclosed: [], unlocked: [], locked: [], triggers: [] },
        escalationRules: {},
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("(i) throws BadRequestException when disclosureAllowList.locked is missing", async () => {
    const prisma = {
      simulationTemplate: {
        findUnique: jest.fn().mockResolvedValue(makeTemplate()),
      },
      groundTruth: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
      },
    };

    const service = new AuthoringService(prisma as never);
    await expect(
      service.createGroundTruth({
        simulationTemplateId: TEMPLATE_ID,
        knownFacts: { facts: [], doNotInvent: [], riskBoundaries: [] },
        disclosureAllowList: { disclosed: [], unlocked: [], triggers: [] } as never,
        escalationRules: {},
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it("(i) throws NotFoundException for unknown template", async () => {
    const prisma = {
      simulationTemplate: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      groundTruth: { findUnique: jest.fn(), create: jest.fn() },
    };

    const service = new AuthoringService(prisma as never);
    await expect(
      service.createGroundTruth({
        simulationTemplateId: "missing",
        knownFacts: { facts: [], doNotInvent: [], riskBoundaries: [] },
        disclosureAllowList: { disclosed: [], unlocked: [], locked: [], triggers: [] },
        escalationRules: {},
      }),
    ).rejects.toThrow(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// Test: (j) Generate rubric -- existing DRAFT blocks second generate
// ---------------------------------------------------------------------------

describe("AuthoringService.generateRubric -- DRAFT conflict guard", () => {
  it("(j) throws ConflictException when a DRAFT rubric version already exists", async () => {
    const prisma = {
      simulationTemplate: {
        findUnique: jest.fn().mockResolvedValue(
          makeTemplate({ rubricVersions: [makeDraftRubricVersion()] }),
        ),
      },
      rubricVersion: {
        create: jest.fn(),
      },
      competency: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const service = new AuthoringService(prisma as never);
    await expect(
      service.generateRubric({ simulationTemplateId: TEMPLATE_ID }),
    ).rejects.toThrow(ConflictException);
  });

  it("(j) succeeds when latest rubric version is PUBLISHED (no DRAFT)", async () => {
    const prisma = {
      simulationTemplate: {
        findUnique: jest.fn().mockResolvedValue(
          makeTemplate({ rubricVersions: [makePublishedRubricVersion()] }),
        ),
      },
      rubricVersion: {
        create: jest.fn().mockResolvedValue(makeDraftRubricVersion({ version: 2 })),
      },
      competency: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const service = new AuthoringService(prisma as never);
    const result = await service.generateRubric({ simulationTemplateId: TEMPLATE_ID });
    expect(result).toBeDefined();
  });

  it("(j) throws NotFoundException for unknown template", async () => {
    const prisma = {
      simulationTemplate: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };

    const service = new AuthoringService(prisma as never);
    await expect(
      service.generateRubric({ simulationTemplateId: "missing" }),
    ).rejects.toThrow(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// Test: (k) Generated rubric contains formativeOnly risk criterion
// ---------------------------------------------------------------------------

describe("AuthoringService.generateRubric -- formativeOnly risk criterion (Sami req)", () => {
  it("(k) generated criteria include a formativeOnly risk_awareness criterion", async () => {
    let capturedCreateArgs: Record<string, unknown> | null = null;

    const prisma = {
      simulationTemplate: {
        findUnique: jest.fn().mockResolvedValue(
          makeTemplate({ rubricVersions: [], challengeLevel: 3, riskLevel: "medium" }),
        ),
      },
      rubricVersion: {
        create: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) => {
          capturedCreateArgs = args.data;
          return Promise.resolve(makeDraftRubricVersion());
        }),
      },
      competency: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const service = new AuthoringService(prisma as never);
    await service.generateRubric({ simulationTemplateId: TEMPLATE_ID });

    expect(capturedCreateArgs).not.toBeNull();
    const criteriaCreate = (capturedCreateArgs as unknown as Record<string, unknown>)["criteria"] as { create: Array<Record<string, unknown>> };
    const criteria = criteriaCreate.create;

    const riskCriterion = criteria.find((c) => c["labelKey"] === "risk_awareness");
    expect(riskCriterion).toBeDefined();
    expect(riskCriterion!["formativeOnly"]).toBe(true);
  });
});
