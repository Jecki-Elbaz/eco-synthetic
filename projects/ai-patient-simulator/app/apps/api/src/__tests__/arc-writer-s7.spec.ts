// arc-writer-s7.spec.ts -- Sprint 7 unit tests for ArcWriterService
// S7-GAL-RETAIN: retainUntil set to sessionCompletedAt + 90 days on every write.
// S7-GAL-CONTENT: sanitizeNotableMoments -- 2000-char cap, trim, empty-safe.
//
// Test items:
//   R1: retainUntil is set in upsert create (not null after session write)
//   R2: retainUntil = sessionCompletedAt + 90 days (within 1s tolerance)
//   R3: retainUntil is set in upsert update (not just create)
//   C1: sanitize -- empty input returns empty string
//   C2: sanitize -- short string preserved unchanged
//   C3: sanitize -- leading/trailing whitespace trimmed
//   C4: sanitize -- exactly 2000 chars: returned unchanged (length === 2000)
//   C5: sanitize -- 2001 chars: truncated to 2000
//   C6: sanitize -- 5000 chars: truncated to 2000
//   C7: sanitizeNotableMoments result is what lands in notableMomentsSummary upsert

import { ArcWriterService } from "../simulation/arc/arc-writer.service.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const USER_ID = "user-s7-retain-001";
const TEMPLATE_ID = "template-s7-retain-001";
const ATTEMPT_ID = "attempt-s7-retain-001";

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

function makeAttempt(overrides: Record<string, unknown> = {}) {
  return {
    id: ATTEMPT_ID,
    userId: USER_ID,
    type: "STUDENT",
    sessionNumber: 1,
    finishedAt: new Date("2026-07-12T10:00:00Z"),
    assignment: {
      simulationTemplate: { id: TEMPLATE_ID },
    },
    ...overrides,
  };
}

function makeLastLog(contextSummary: string | null = "Good progress.") {
  return {
    trust: 0.50,
    openness: 0.40,
    allianceQuality: 0.55,
    emotionalActiv: 0.4,
    avoidanceLevel: 0.5,
    defensiveness: 0.4,
    disclosureReady: 0.2,
    riskRelevance: 0.0,
    unlockedFactIds: ["fact-01"],
    contextSummary,
    turnNumber: 5,
  };
}

function makePrisma(opts: {
  attempt?: object | null;
  lastLog?: object | null;
  priorSummary?: object | null;
} = {}) {
  const attempt = opts.attempt !== undefined ? opts.attempt : makeAttempt();
  const lastLog = opts.lastLog !== undefined ? opts.lastLog : makeLastLog();
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
// R-series: S7-GAL-RETAIN -- retainUntil field
// ---------------------------------------------------------------------------

describe("S7-GAL-RETAIN: ArcWriterService retainUntil", () => {
  it("R1: retainUntil is set (not null) in upsert create payload", async () => {
    const prisma = makePrisma();
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const call = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(call.create.retainUntil).not.toBeNull();
    expect(call.create.retainUntil).toBeInstanceOf(Date);
  });

  it("R2: retainUntil = sessionCompletedAt + 90 days (within 1000ms tolerance)", async () => {
    const finishedAt = new Date("2026-07-12T10:00:00Z");
    const prisma = makePrisma({ attempt: makeAttempt({ finishedAt }) });
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const call = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    const expectedRetainUntil = new Date(finishedAt.getTime() + NINETY_DAYS_MS);
    const actualRetainUntil: Date = call.create.retainUntil;

    expect(Math.abs(actualRetainUntil.getTime() - expectedRetainUntil.getTime())).toBeLessThanOrEqual(1000);
  });

  it("R3: retainUntil is set in upsert update payload (not just create)", async () => {
    const prisma = makePrisma();
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const call = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(call.update.retainUntil).not.toBeNull();
    expect(call.update.retainUntil).toBeInstanceOf(Date);
  });
});

// ---------------------------------------------------------------------------
// C-series: S7-GAL-CONTENT -- sanitizeNotableMoments (tested via write path)
// ---------------------------------------------------------------------------

describe("S7-GAL-CONTENT: ArcWriterService.sanitizeNotableMoments", () => {
  it("C1: empty input string -> empty string in notableMomentsSummary", async () => {
    const prisma = makePrisma({ lastLog: makeLastLog("") });
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const call = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(call.create.notableMomentsSummary).toBe("");
  });

  it("C2: short string is preserved unchanged", async () => {
    const prisma = makePrisma({ lastLog: makeLastLog("hello world") });
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const call = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(call.create.notableMomentsSummary).toBe("hello world");
  });

  it("C3: leading/trailing whitespace is trimmed", async () => {
    const prisma = makePrisma({ lastLog: makeLastLog("  hello  ") });
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const call = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(call.create.notableMomentsSummary).toBe("hello");
  });

  it("C4: exactly 2000 chars: returned unchanged (length === 2000)", async () => {
    const input = "x".repeat(2000);
    const prisma = makePrisma({ lastLog: makeLastLog(input) });
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const call = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(call.create.notableMomentsSummary.length).toBe(2000);
  });

  it("C5: 2001 chars: truncated to 2000", async () => {
    const input = "x".repeat(2001);
    const prisma = makePrisma({ lastLog: makeLastLog(input) });
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const call = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(call.create.notableMomentsSummary.length).toBe(2000);
  });

  it("C6: 5000 chars: truncated to 2000", async () => {
    const input = "x".repeat(5000);
    const prisma = makePrisma({ lastLog: makeLastLog(input) });
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const call = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(call.create.notableMomentsSummary.length).toBe(2000);
  });

  it("C7: null contextSummary treated as empty string (sanitize-safe)", async () => {
    const prisma = makePrisma({ lastLog: makeLastLog(null) });
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const call = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(call.create.notableMomentsSummary).toBe("");
  });

  it("C8 (Oren S7 MINOR-2 / Adi FLAG-1): 2000-char cap enforced on the UPDATE arm of the upsert", async () => {
    const input = "x".repeat(5000);
    const prisma = makePrisma({ lastLog: makeLastLog(input) });
    const service = new ArcWriterService(prisma as never);
    await service.writeSessionSummary(ATTEMPT_ID);

    const call = (prisma.arcSessionSummary.upsert as jest.Mock).mock.calls[0][0];
    expect(call.update.notableMomentsSummary.length).toBe(2000);
    // Both arms must carry the same sanitized value
    expect(call.update.notableMomentsSummary).toBe(call.create.notableMomentsSummary);
  });
});
