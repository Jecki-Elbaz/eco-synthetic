// m6-publish.spec.ts -- S5-GAL-M6 unit tests
// Tests: publishRubric M6 gate checks (GROUND_TRUTH_REQUIRED, RUBRIC_PROVISIONAL)
// and markRubricReviewed.
//
// Test items:
//   P1: empty GT (doNotInvent=[]) blocks publish with 422 GROUND_TRUTH_REQUIRED
//   P2: GT without facts AND doNotInvent blocks publish with 422 GROUND_TRUTH_REQUIRED
//   P3: null rubricLastReviewedAt blocks publish with 422 RUBRIC_PROVISIONAL
//   P4: GT updated after rubricLastReviewedAt blocks publish with 422 RUBRIC_PROVISIONAL
//   P5: GT updated BEFORE rubricLastReviewedAt -- publish succeeds (rubric is current)
//   P6: getTemplate returns rubricProvisional=true when rubricLastReviewedAt is null
//   P7: getTemplate returns rubricProvisional=true when GT.updatedAt > rubricLastReviewedAt
//   P8: getTemplate returns rubricProvisional=false when rubricLastReviewedAt >= GT.updatedAt
//   P9: markRubricReviewed sets rubricLastReviewedAt to now
//   P10: already-PUBLISHED rubricVersion throws ConflictException before M6 checks

import { ConflictException, HttpException, NotFoundException } from "@nestjs/common";
import { AuthoringService } from "../authoring/authoring.service.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TEMPLATE_ID = "template-m6-001";
const RUBRIC_V1_ID = "rubric-m6-001";

const GT_UPDATED_AT = new Date("2026-07-01T10:00:00Z");
const REVIEWED_BEFORE_GT = new Date("2026-07-01T09:00:00Z"); // before GT update
const REVIEWED_AFTER_GT = new Date("2026-07-01T11:00:00Z");  // after GT update

function makeDraftRubric(templateOverrides: Record<string, unknown> = {}) {
  return {
    id: RUBRIC_V1_ID,
    status: "DRAFT",
    simulationTemplateId: TEMPLATE_ID,
    simulationTemplate: {
      rubricLastReviewedAt: REVIEWED_AFTER_GT,
      groundTruth: {
        updatedAt: GT_UPDATED_AT,
        knownFacts: {
          facts: ["fact-1"],
          doNotInvent: ["do-not-invent-1"],
          riskBoundaries: [],
        },
      },
      ...templateOverrides,
    },
  };
}

// ---------------------------------------------------------------------------
// P-series: publishRubric M6 gate checks
// ---------------------------------------------------------------------------

describe("S5-GAL-M6: publishRubric gate checks", () => {
  it("P1: empty GT (doNotInvent=[], facts=[]) blocks publish with 422 GROUND_TRUTH_REQUIRED", async () => {
    const prisma = {
      rubricVersion: {
        findUnique: jest.fn().mockResolvedValue(
          makeDraftRubric({
            groundTruth: {
              updatedAt: GT_UPDATED_AT,
              knownFacts: { facts: [], doNotInvent: [], riskBoundaries: [] },
            },
          }),
        ),
      },
    };
    const service = new AuthoringService(prisma as never);

    try {
      await service.publishRubric(RUBRIC_V1_ID);
      fail("Should have thrown");
    } catch (err: unknown) {
      const ex = err as HttpException;
      expect(ex.getStatus()).toBe(422);
      const body = ex.getResponse() as Record<string, unknown>;
      expect(body["code"]).toBe("GROUND_TRUTH_REQUIRED");
    }
  });

  it("P2: null GT blocks publish with 422 GROUND_TRUTH_REQUIRED", async () => {
    const prisma = {
      rubricVersion: {
        findUnique: jest.fn().mockResolvedValue(
          makeDraftRubric({ groundTruth: null }),
        ),
      },
    };
    const service = new AuthoringService(prisma as never);

    try {
      await service.publishRubric(RUBRIC_V1_ID);
      fail("Should have thrown");
    } catch (err: unknown) {
      const ex = err as HttpException;
      expect(ex.getStatus()).toBe(422);
      expect((ex.getResponse() as Record<string, unknown>)["code"]).toBe("GROUND_TRUTH_REQUIRED");
    }
  });

  it("P3: null rubricLastReviewedAt blocks publish with 422 RUBRIC_PROVISIONAL", async () => {
    const prisma = {
      rubricVersion: {
        findUnique: jest.fn().mockResolvedValue(
          makeDraftRubric({ rubricLastReviewedAt: null }),
        ),
      },
    };
    const service = new AuthoringService(prisma as never);

    try {
      await service.publishRubric(RUBRIC_V1_ID);
      fail("Should have thrown");
    } catch (err: unknown) {
      const ex = err as HttpException;
      expect(ex.getStatus()).toBe(422);
      const body = ex.getResponse() as Record<string, unknown>;
      expect(body["code"]).toBe("RUBRIC_PROVISIONAL");
    }
  });

  it("P4: GT updated AFTER rubricLastReviewedAt blocks publish with 422 RUBRIC_PROVISIONAL", async () => {
    const prisma = {
      rubricVersion: {
        findUnique: jest.fn().mockResolvedValue(
          makeDraftRubric({ rubricLastReviewedAt: REVIEWED_BEFORE_GT }),
        ),
      },
    };
    const service = new AuthoringService(prisma as never);

    try {
      await service.publishRubric(RUBRIC_V1_ID);
      fail("Should have thrown");
    } catch (err: unknown) {
      const ex = err as HttpException;
      expect(ex.getStatus()).toBe(422);
      expect((ex.getResponse() as Record<string, unknown>)["code"]).toBe("RUBRIC_PROVISIONAL");
    }
  });

  it("P5: GT updated BEFORE rubricLastReviewedAt -- publish succeeds", async () => {
    const updateMock = jest.fn().mockResolvedValue({
      id: RUBRIC_V1_ID,
      status: "PUBLISHED",
      publishedAt: new Date(),
    });
    const prisma = {
      rubricVersion: {
        findUnique: jest.fn().mockResolvedValue(
          makeDraftRubric({ rubricLastReviewedAt: REVIEWED_AFTER_GT }),
        ),
        update: updateMock,
      },
    };
    const service = new AuthoringService(prisma as never);
    const result = await service.publishRubric(RUBRIC_V1_ID) as { status: string };
    expect(result.status).toBe("PUBLISHED");
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: "PUBLISHED" }),
      }),
    );
  });

  it("P10: already-PUBLISHED rubricVersion throws ConflictException before M6 checks", async () => {
    // ConflictException must be thrown even if GT/rubricLastReviewedAt would block
    const prisma = {
      rubricVersion: {
        findUnique: jest.fn().mockResolvedValue({
          id: RUBRIC_V1_ID,
          status: "PUBLISHED",
          simulationTemplate: { rubricLastReviewedAt: null, groundTruth: null },
        }),
      },
    };
    const service = new AuthoringService(prisma as never);
    await expect(service.publishRubric(RUBRIC_V1_ID)).rejects.toThrow(ConflictException);
  });

  it("P11: not found throws NotFoundException", async () => {
    const prisma = {
      rubricVersion: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    const service = new AuthoringService(prisma as never);
    await expect(service.publishRubric(RUBRIC_V1_ID)).rejects.toThrow(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// P-series: getTemplate rubricProvisional derivation
// ---------------------------------------------------------------------------

describe("S5-GAL-M6: getTemplate rubricProvisional field", () => {
  it("P6: rubricProvisional=true when rubricLastReviewedAt is null", async () => {
    const prisma = {
      simulationTemplate: {
        findUnique: jest.fn().mockResolvedValue({
          id: TEMPLATE_ID,
          rubricLastReviewedAt: null,
          groundTruth: { updatedAt: GT_UPDATED_AT },
          rubricVersions: [],
        }),
      },
    };
    const service = new AuthoringService(prisma as never);
    const result = await service.getTemplate(TEMPLATE_ID) as { rubricProvisional: boolean };
    expect(result.rubricProvisional).toBe(true);
  });

  it("P7: rubricProvisional=true when GT.updatedAt > rubricLastReviewedAt", async () => {
    const prisma = {
      simulationTemplate: {
        findUnique: jest.fn().mockResolvedValue({
          id: TEMPLATE_ID,
          rubricLastReviewedAt: REVIEWED_BEFORE_GT, // before GT update
          groundTruth: { updatedAt: GT_UPDATED_AT },
          rubricVersions: [],
        }),
      },
    };
    const service = new AuthoringService(prisma as never);
    const result = await service.getTemplate(TEMPLATE_ID) as { rubricProvisional: boolean };
    expect(result.rubricProvisional).toBe(true);
  });

  it("P8: rubricProvisional=false when rubricLastReviewedAt >= GT.updatedAt", async () => {
    const prisma = {
      simulationTemplate: {
        findUnique: jest.fn().mockResolvedValue({
          id: TEMPLATE_ID,
          rubricLastReviewedAt: REVIEWED_AFTER_GT, // after GT update
          groundTruth: { updatedAt: GT_UPDATED_AT },
          rubricVersions: [],
        }),
      },
    };
    const service = new AuthoringService(prisma as never);
    const result = await service.getTemplate(TEMPLATE_ID) as { rubricProvisional: boolean };
    expect(result.rubricProvisional).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// P-series: markRubricReviewed
// ---------------------------------------------------------------------------

describe("S5-GAL-M6: markRubricReviewed", () => {
  it("P9: sets rubricLastReviewedAt to now on the template", async () => {
    let capturedData: Record<string, unknown> | null = null;
    const prisma = {
      simulationTemplate: {
        findUnique: jest.fn().mockResolvedValue({ id: TEMPLATE_ID }),
        update: jest.fn().mockImplementation((args: { data: Record<string, unknown> }) => {
          capturedData = args.data;
          return Promise.resolve({ id: TEMPLATE_ID, rubricLastReviewedAt: args.data["rubricLastReviewedAt"] });
        }),
      },
    };
    const service = new AuthoringService(prisma as never);
    const before = new Date();
    await service.markRubricReviewed(TEMPLATE_ID);
    const after = new Date();

    expect(capturedData).not.toBeNull();
    const reviewedAt = capturedData!["rubricLastReviewedAt"] as Date;
    expect(reviewedAt).toBeInstanceOf(Date);
    expect(reviewedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(reviewedAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("P9b: markRubricReviewed throws NotFoundException for unknown template", async () => {
    const prisma = {
      simulationTemplate: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    const service = new AuthoringService(prisma as never);
    await expect(service.markRubricReviewed("nonexistent-id")).rejects.toThrow(NotFoundException);
  });
});
