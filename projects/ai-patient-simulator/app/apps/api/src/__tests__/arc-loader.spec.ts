// arc-loader.spec.ts -- S5-GAL-ARC-LOADER unit tests
// Tests: ArcLoaderService.loadArcContext behavior for all session positions.
//
// Test items:
//   L1: session 1 returns null (no prior history -- fresh start)
//   L2: session 2 returns the session-1 summary fields mapped to ArcSessionContext
//   L3: session 3 returns session-2 summary ONLY (last-session-summary pattern)
//   L4: session 2 when no session-1 summary exists returns null (graceful fallback)
//   L5: data isolation -- query is always scoped to (userId, templateId, sessionNumber)

import { ArcLoaderService } from "../simulation/arc/arc-loader.service.js";
import type { ArcSessionContext } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const USER_ID = "user-arc-loader-001";
const TEMPLATE_ID = "template-arc-loader-001";
const OTHER_USER_ID = "user-arc-loader-OTHER";
const OTHER_TEMPLATE_ID = "template-arc-loader-OTHER";

function makeSession1Summary() {
  return {
    id: "sum-001",
    userId: USER_ID,
    templateId: TEMPLATE_ID,
    sessionNumber: 1,
    finalTrustLevel: 0.45,
    finalOpennessLevel: 0.38,
    finalAllianceLevel: 0.52,
    symptomMarkerState: { unlockedFactIds: ["fact-01", "fact-02"] },
    notableMomentsSummary: "Student showed empathy in turn 4.",
  };
}

function makeSession2Summary() {
  return {
    id: "sum-002",
    userId: USER_ID,
    templateId: TEMPLATE_ID,
    sessionNumber: 2,
    finalTrustLevel: 0.60,
    finalOpennessLevel: 0.50,
    finalAllianceLevel: 0.65,
    symptomMarkerState: { unlockedFactIds: ["fact-01", "fact-02", "fact-03"] },
    notableMomentsSummary: "Rapport building in turn 2. Avoidance cue at turn 7.",
  };
}

// ---------------------------------------------------------------------------
// L-series: ArcLoaderService unit tests
// ---------------------------------------------------------------------------

describe("S5-GAL-ARC-LOADER: ArcLoaderService.loadArcContext", () => {
  it("L1: session 1 returns null immediately (no DB query needed)", async () => {
    const prisma = {
      arcSessionSummary: {
        findUnique: jest.fn(),
      },
    };
    const service = new ArcLoaderService(prisma as never);
    const result = await service.loadArcContext(USER_ID, TEMPLATE_ID, 1);
    expect(result).toBeNull();
    // Must not query DB for session 1
    expect(prisma.arcSessionSummary.findUnique).not.toHaveBeenCalled();
  });

  it("L2: session 2 returns session-1 summary mapped to ArcSessionContext", async () => {
    const summary = makeSession1Summary();
    const prisma = {
      arcSessionSummary: {
        findUnique: jest.fn().mockResolvedValue(summary),
      },
    };
    const service = new ArcLoaderService(prisma as never);
    const result = await service.loadArcContext(USER_ID, TEMPLATE_ID, 2) as ArcSessionContext;

    expect(result).not.toBeNull();
    expect(result.sessionNumber).toBe(1);
    expect(result.trustLevel).toBe(summary.finalTrustLevel);
    expect(result.opennessLevel).toBe(summary.finalOpennessLevel);
    expect(result.allianceScore).toBe(summary.finalAllianceLevel);
    expect(result.symptomMarkerState).toEqual(summary.symptomMarkerState);
    expect(result.notableMomentsSummary).toBe(summary.notableMomentsSummary);

    // Must query session N-1 = 1
    expect(prisma.arcSessionSummary.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId_templateId_sessionNumber: expect.objectContaining({
            userId: USER_ID,
            templateId: TEMPLATE_ID,
            sessionNumber: 1,
          }),
        }),
      }),
    );
  });

  it("L3: session 3 queries session-2 ONLY (last-session-summary pattern)", async () => {
    const summary = makeSession2Summary();
    const prisma = {
      arcSessionSummary: {
        findUnique: jest.fn().mockResolvedValue(summary),
      },
    };
    const service = new ArcLoaderService(prisma as never);
    const result = await service.loadArcContext(USER_ID, TEMPLATE_ID, 3) as ArcSessionContext;

    expect(result).not.toBeNull();
    expect(result.sessionNumber).toBe(2);
    expect(result.trustLevel).toBe(summary.finalTrustLevel);

    // Must query session N-1 = 2, NOT session 1
    expect(prisma.arcSessionSummary.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.arcSessionSummary.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId_templateId_sessionNumber: expect.objectContaining({
            sessionNumber: 2, // NOT 1 -- last-session-summary pattern
          }),
        }),
      }),
    );
  });

  it("L4: session 2 when no prior summary exists returns null (graceful fallback)", async () => {
    const prisma = {
      arcSessionSummary: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    };
    const service = new ArcLoaderService(prisma as never);
    const result = await service.loadArcContext(USER_ID, TEMPLATE_ID, 2);
    expect(result).toBeNull();
  });

  it("L5: data isolation -- query includes userId AND templateId to prevent cross-student leak", async () => {
    const summary = makeSession1Summary();
    const prisma = {
      arcSessionSummary: {
        findUnique: jest.fn().mockResolvedValue(summary),
      },
    };
    const service = new ArcLoaderService(prisma as never);
    await service.loadArcContext(USER_ID, TEMPLATE_ID, 2);

    const callArgs = (prisma.arcSessionSummary.findUnique as jest.Mock).mock.calls[0][0];
    const whereClause = callArgs.where.userId_templateId_sessionNumber;

    // Both userId AND templateId must be in the WHERE clause
    expect(whereClause.userId).toBe(USER_ID);
    expect(whereClause.templateId).toBe(TEMPLATE_ID);
    // Must NOT include OTHER_USER_ID or OTHER_TEMPLATE_ID
    expect(whereClause.userId).not.toBe(OTHER_USER_ID);
    expect(whereClause.templateId).not.toBe(OTHER_TEMPLATE_ID);
  });
});
