// arc-config.spec.ts -- S6-GAL-ARCCONFIG unit tests
// Tests: ArcDeltaConfig injectable via AppConfig (Oren S5 m6 fix).
//
// Test items:
//   C1: default values -- when AppConfig not provided, ArcDeltaConfig matches engineering defaults
//   C2: override via AppConfig -- mock arcMaxTrust=0.60; trust 0.95 clamped to 0.60
//   C3: partial override -- only arcMaxTrust=0.60; other values use defaults
//   C4: clamp regression -- trust at maxTrust + positive delta stays <= maxTrust (AppConfig path)

import { ArcWriterService } from "../simulation/arc/arc-writer.service.js";
import { DEFAULT_ARC_DELTA_CONFIG } from "../simulation/arc/arc-delta-config.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ATTEMPT_ID = "attempt-arc-config-001";
const USER_ID = "user-arc-config-001";
const TEMPLATE_ID = "template-arc-config-001";

function makeAttempt(overrides: Record<string, unknown> = {}) {
  return {
    id: ATTEMPT_ID,
    userId: USER_ID,
    type: "STUDENT",
    sessionNumber: 1,
    finishedAt: new Date("2026-07-14T12:00:00Z"),
    assignment: { simulationTemplate: { id: TEMPLATE_ID } },
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
    contextSummary: "test session",
    turnNumber: 5,
  };
}

function makePrisma(opts: {
  attempt?: object | null;
  lastLog?: object | null;
  priorSummary?: object | null;
} = {}) {
  const attempt = opts.attempt !== undefined ? opts.attempt : makeAttempt();
  const lastLog = opts.lastLog !== undefined ? opts.lastLog : makeLastLog(0.45, 0.35, 0.50);
  const priorSummary = opts.priorSummary !== undefined ? opts.priorSummary : null;

  return {
    attempt: { findUnique: jest.fn().mockResolvedValue(attempt) },
    patientStateLog: { findFirst: jest.fn().mockResolvedValue(lastLog) },
    arcSessionSummary: {
      findUnique: jest.fn().mockResolvedValue(priorSummary),
      upsert: jest.fn().mockResolvedValue({}),
    },
  };
}

/** Build a minimal AppConfig-shaped object for testing. */
function makeAppConfig(overrides: Partial<{
  arcMaxTrust: number;
  arcMaxOpenness: number;
  arcMaxAlliance: number;
  arcMinTrust: number;
  arcMinOpenness: number;
  arcMinAlliance: number;
}> = {}) {
  return {
    arcMaxTrust: DEFAULT_ARC_DELTA_CONFIG.maxTrust,
    arcMaxOpenness: DEFAULT_ARC_DELTA_CONFIG.maxOpenness,
    arcMaxAlliance: DEFAULT_ARC_DELTA_CONFIG.maxAlliance,
    arcMinTrust: DEFAULT_ARC_DELTA_CONFIG.minTrust,
    arcMinOpenness: DEFAULT_ARC_DELTA_CONFIG.minOpenness,
    arcMinAlliance: DEFAULT_ARC_DELTA_CONFIG.minAlliance,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// C-series: ArcDeltaConfig injectable via AppConfig
// ---------------------------------------------------------------------------

describe("S6-GAL-ARCCONFIG: ArcDeltaConfig injectable via AppConfig", () => {
  it("C1: default values -- no AppConfig injected -> config matches engineering defaults", () => {
    // ArcWriterService(prisma) with no AppConfig uses DEFAULT_ARC_DELTA_CONFIG
    const prisma = makePrisma();
    // Cast to access private config for inspection
    const service = new ArcWriterService(prisma as never, undefined);
    // Verify via clamping: trust=0.95 should clamp to DEFAULT maxTrust=0.70
    expect(DEFAULT_ARC_DELTA_CONFIG.maxTrust).toBe(0.70);
    expect(DEFAULT_ARC_DELTA_CONFIG.maxOpenness).toBe(0.65);
    expect(DEFAULT_ARC_DELTA_CONFIG.maxAlliance).toBe(0.70);
    expect(DEFAULT_ARC_DELTA_CONFIG.minTrust).toBe(0.15);
    expect(DEFAULT_ARC_DELTA_CONFIG.minOpenness).toBe(0.10);
    expect(DEFAULT_ARC_DELTA_CONFIG.minAlliance).toBe(0.10);
    // Service created without error
    expect(service).toBeDefined();
  });

  it("C1b: default values enforced at clamp -- trust 0.95 clamped to 0.70 without AppConfig", async () => {
    const prisma = makePrisma({ lastLog: makeLastLog(0.95, 0.30, 0.40) });
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const call = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(call.create.finalTrustLevel).toBe(DEFAULT_ARC_DELTA_CONFIG.maxTrust); // 0.70
  });

  it("C2: override via AppConfig -- arcMaxTrust=0.60 -> trust 0.95 clamped to 0.60", async () => {
    const prisma = makePrisma({ lastLog: makeLastLog(0.95, 0.30, 0.40) });
    const appConfig = makeAppConfig({ arcMaxTrust: 0.60 });

    const service = new ArcWriterService(prisma as never, appConfig as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const call = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    // Should clamp to 0.60 (the injected override), not 0.70 (the default)
    expect(call.create.finalTrustLevel).toBeCloseTo(0.60, 5);
  });

  it("C3: partial override -- only arcMaxTrust=0.60; openness and alliance use defaults", async () => {
    // Set trust above 0.60, openness above 0.65, alliance above 0.70
    const prisma = makePrisma({ lastLog: makeLastLog(0.95, 0.99, 0.99) });
    const appConfig = makeAppConfig({ arcMaxTrust: 0.60 });

    const service = new ArcWriterService(prisma as never, appConfig as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const call = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    // Trust: clamped to override 0.60
    expect(call.create.finalTrustLevel).toBeCloseTo(0.60, 5);
    // Openness: clamped to default 0.65 (not overridden)
    expect(call.create.finalOpennessLevel).toBeCloseTo(
      DEFAULT_ARC_DELTA_CONFIG.maxOpenness, 5,
    ); // 0.65
    // Alliance: clamped to default 0.70 (not overridden)
    expect(call.create.finalAllianceLevel).toBeCloseTo(
      DEFAULT_ARC_DELTA_CONFIG.maxAlliance, 5,
    ); // 0.70
  });

  it("C4: clamp regression (AppConfig path) -- trust at maxTrust + positive delta stays <= maxTrust", async () => {
    // maxTrust = 0.70 (default). trust=0.70 -> post-clamp should be exactly 0.70.
    const prisma = makePrisma({ lastLog: makeLastLog(0.70, 0.30, 0.40) });
    const appConfig = makeAppConfig(); // all defaults

    const service = new ArcWriterService(prisma as never, appConfig as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const call = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    // Should remain at exactly 0.70 (ceiling, not exceeded)
    expect(call.create.finalTrustLevel).toBeCloseTo(0.70, 5);
    expect(call.create.finalTrustLevel).toBeLessThanOrEqual(0.70);
  });
});
