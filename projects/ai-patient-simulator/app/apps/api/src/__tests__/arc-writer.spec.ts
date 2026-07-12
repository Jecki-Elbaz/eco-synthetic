// arc-writer.spec.ts -- S5-GAL-ARC-WRITER unit tests
// Tests: ArcWriterService.writeSessionSummary behavior and ceiling/floor clamping.
//
// Test items:
//   W1: single-session delta -- writes correct trust/openness/alliance for session 1
//   W2: two-session cumulative -- session 2 uses session-1 summary as initial state
//   W3: ceiling clamp UP -- trust above maxTrust is clamped to maxTrust
//   W4: floor clamp DOWN -- trust below minTrust is clamped to minTrust
//   W5: data isolation -- upsert uses correct (userId, templateId, sessionNumber)
//   W6: AUTHOR_PREVIEW attempts are skipped (no sessionNumber)
//   W7: correct sessionNumber from attempt is persisted

import { ArcWriterService } from "../simulation/arc/arc-writer.service.js";
import { DEFAULT_ARC_DELTA_CONFIG } from "../simulation/arc/arc-delta-config.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const USER_ID = "user-arc-writer-001";
const TEMPLATE_ID = "template-arc-writer-001";
const ATTEMPT_ID = "attempt-arc-writer-001";

function makeAttempt(overrides: Record<string, unknown> = {}) {
  return {
    id: ATTEMPT_ID,
    userId: USER_ID,
    type: "STUDENT",
    sessionNumber: 1,
    finishedAt: new Date("2026-07-11T12:00:00Z"),
    assignment: {
      simulationTemplate: {
        id: TEMPLATE_ID,
      },
    },
    ...overrides,
  };
}

function makeLastLog(trust: number, openness: number, allianceQuality: number) {
  return {
    trust,
    openness,
    allianceQuality,
    emotionalActiv: 0.4,
    avoidanceLevel: 0.5,
    defensiveness: 0.4,
    disclosureReady: 0.2,
    riskRelevance: 0.0,
    unlockedFactIds: ["fact-01"],
    contextSummary: "Good progress in session.",
    turnNumber: 8,
  };
}

function makePrisma(opts: {
  attempt?: object | null;
  lastLog?: object | null;
  priorSummary?: object | null;
} = {}) {
  // Use explicit undefined check (not ??) so that passing null yields null to the mock,
  // not the default. This correctly simulates "attempt not found" / "no log rows".
  const attempt = opts.attempt !== undefined ? opts.attempt : makeAttempt();
  const lastLog = opts.lastLog !== undefined ? opts.lastLog : makeLastLog(0.45, 0.38, 0.52);
  const priorSummary = opts.priorSummary !== undefined ? opts.priorSummary : null;

  return {
    attempt: {
      findUnique: jest.fn().mockResolvedValue(attempt),
    },
    patientStateLog: {
      findFirst: jest.fn().mockResolvedValue(lastLog),
    },
    arcSessionSummary: {
      findUnique: jest.fn().mockResolvedValue(priorSummary),
      upsert: jest.fn().mockResolvedValue({}),
    },
  };
}

// ---------------------------------------------------------------------------
// W-series: ArcWriterService unit tests
// ---------------------------------------------------------------------------

describe("S5-GAL-ARC-WRITER: ArcWriterService.writeSessionSummary", () => {
  it("W1: session 1 writes trust/openness/alliance from last PatientStateLog", async () => {
    const trust = 0.48;
    const openness = 0.35;
    const alliance = 0.50;
    const prisma = makePrisma({
      attempt: makeAttempt({ sessionNumber: 1 }),
      lastLog: makeLastLog(trust, openness, alliance),
    });
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    expect(prisma.arcSessionSummary.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          finalTrustLevel: trust,
          finalOpennessLevel: openness,
          finalAllianceLevel: alliance,
          sessionNumber: 1,
        }),
      }),
    );
  });

  it("W2: session 2 uses session-1 finalTrustLevel as initial state (cumulative delta)", async () => {
    const priorSummary = {
      finalTrustLevel: 0.45,
      finalOpennessLevel: 0.38,
      finalAllianceLevel: 0.52,
    };
    const newTrust = 0.55; // higher than prior -> trustDeltaApplied > 0
    const prisma = makePrisma({
      attempt: makeAttempt({ sessionNumber: 2 }),
      lastLog: makeLastLog(newTrust, 0.45, 0.60),
      priorSummary,
    });
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const upsertCall = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    // trustDeltaApplied = newTrust - priorTrust (before clamp)
    const expectedDelta = newTrust - priorSummary.finalTrustLevel;
    expect(upsertCall.create.trustDeltaApplied).toBeCloseTo(expectedDelta, 5);
    // Session number should be 2
    expect(upsertCall.create.sessionNumber).toBe(2);
  });

  it("W3: ceiling clamp UP -- trust above maxTrust is clamped to maxTrust", async () => {
    // DEFAULT_ARC_DELTA_CONFIG.maxTrust = 0.70
    const overLimit = 0.95; // above ceiling
    const prisma = makePrisma({
      lastLog: makeLastLog(overLimit, 0.30, 0.40),
    });
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const upsertCall = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(upsertCall.create.finalTrustLevel).toBe(DEFAULT_ARC_DELTA_CONFIG.maxTrust);
  });

  it("W4: floor clamp DOWN -- trust below minTrust is clamped to minTrust", async () => {
    // DEFAULT_ARC_DELTA_CONFIG.minTrust = 0.15
    const belowFloor = 0.02; // below floor
    const prisma = makePrisma({
      lastLog: makeLastLog(belowFloor, 0.30, 0.40),
    });
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const upsertCall = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(upsertCall.create.finalTrustLevel).toBe(DEFAULT_ARC_DELTA_CONFIG.minTrust);
  });

  it("W5: data isolation -- upsert where clause includes correct (userId, templateId, sessionNumber)", async () => {
    const prisma = makePrisma({ attempt: makeAttempt({ sessionNumber: 2 }) });
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const upsertCall = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    const whereClause = upsertCall.where.userId_templateId_sessionNumber;
    expect(whereClause.userId).toBe(USER_ID);
    expect(whereClause.templateId).toBe(TEMPLATE_ID);
    expect(whereClause.sessionNumber).toBe(2);
  });

  it("W6: AUTHOR_PREVIEW attempt is silently skipped (no upsert)", async () => {
    const prisma = makePrisma({
      attempt: makeAttempt({ type: "AUTHOR_PREVIEW", sessionNumber: null }),
    });
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);
    expect(prisma.arcSessionSummary.upsert).not.toHaveBeenCalled();
  });

  it("W7: attempt not found -- silently skips (no throw)", async () => {
    const prisma = makePrisma({ attempt: null });
    const service = new ArcWriterService(prisma as never);
    // Should not throw
    await expect(service.writeSessionSummary(ATTEMPT_ID)).resolves.toBeUndefined();
    expect(prisma.arcSessionSummary.upsert).not.toHaveBeenCalled();
  });

  it("W8: no PatientStateLog rows -- silently skips (no turns ran)", async () => {
    const prisma = makePrisma({ lastLog: null });
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);
    expect(prisma.arcSessionSummary.upsert).not.toHaveBeenCalled();
  });

  it("W9: openness ceiling clamp enforced independently of trust", async () => {
    // maxOpenness = 0.65, maxAlliance = 0.70
    const prisma = makePrisma({
      lastLog: makeLastLog(0.50, 0.99, 0.99),
    });
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const upsertCall = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(upsertCall.create.finalOpennessLevel).toBe(DEFAULT_ARC_DELTA_CONFIG.maxOpenness);
    expect(upsertCall.create.finalAllianceLevel).toBe(DEFAULT_ARC_DELTA_CONFIG.maxAlliance);
  });
});
