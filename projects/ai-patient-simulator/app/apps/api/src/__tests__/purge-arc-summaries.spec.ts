// purge-arc-summaries.spec.ts -- S8-GAL-PURGE unit tests
// Tests: runPurge WHERE-clause scoping and dry-run safety gate.
//
// Test items:
//   P1: dry-run does NOT call deleteMany; findMany called with correct where; no log written
//   P2: apply-mode calls deleteMany with exact WHERE clause; log written with correct JSON
//   P3: not-yet-expired row (tomorrow) is not in the delete where clause (lt = now-ish)
//   P4: null-retainUntil row is excluded by the `not: null` guard in the where clause

import { runPurge } from "../scripts/purge-arc-summaries.js";
import type { PrismaClient } from "@aps/db";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const now = new Date();
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

const ROW_A = {
  id: "arc-purge-test-row-A",
  userId: "user-purge-test-001",
  templateId: "tpl-purge-test-001",
  sessionNumber: 1,
  retainUntil: twoDaysAgo, // expired -- should be matched
};
const ROW_B = {
  id: "arc-purge-test-row-B",
  userId: "user-purge-test-001",
  templateId: "tpl-purge-test-001",
  sessionNumber: 2,
  retainUntil: tomorrow, // not yet expired -- must survive
};
const ROW_C = {
  id: "arc-purge-test-row-C",
  userId: "user-purge-test-001",
  templateId: "tpl-purge-test-001",
  sessionNumber: 3,
  retainUntil: null, // null -- must survive
};

/** Build a mock Prisma with findMany returning [A, B, C] and deleteMany returning count=1. */
function makeMockPrisma() {
  return {
    arcSessionSummary: {
      findMany: jest.fn().mockResolvedValue([ROW_A, ROW_B, ROW_C]),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
  } as unknown as PrismaClient;
}

// ---------------------------------------------------------------------------
// P1 -- dry-run does NOT delete and does NOT write log
// ---------------------------------------------------------------------------

describe("P1 -- dry-run safety", () => {
  let tmpLog: string;

  beforeEach(() => {
    tmpLog = path.join(os.tmpdir(), `purge-p1-${Date.now()}.jsonl`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpLog)) fs.unlinkSync(tmpLog);
  });

  it("does not call deleteMany on dry-run", async () => {
    const mockPrisma = makeMockPrisma();
    const result = await runPurge(mockPrisma, false, tmpLog);

    expect(mockPrisma.arcSessionSummary.deleteMany).not.toHaveBeenCalled();
  });

  it("calls findMany once with correct where clause on dry-run", async () => {
    const mockPrisma = makeMockPrisma();
    await runPurge(mockPrisma, false, tmpLog);

    expect(mockPrisma.arcSessionSummary.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.arcSessionSummary.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { retainUntil: { not: null, lt: expect.any(Date) } },
      }),
    );
  });

  it("does NOT write the log file on dry-run", async () => {
    const mockPrisma = makeMockPrisma();
    await runPurge(mockPrisma, false, tmpLog);

    expect(fs.existsSync(tmpLog)).toBe(false);
  });

  it("returns count=0 on dry-run", async () => {
    const mockPrisma = makeMockPrisma();
    const result = await runPurge(mockPrisma, false, tmpLog);

    expect(result.count).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// P2 -- apply-mode deletes via correct WHERE clause and writes log
// ---------------------------------------------------------------------------

describe("P2 -- apply-mode delete and log", () => {
  let tmpLog: string;

  beforeEach(() => {
    tmpLog = path.join(os.tmpdir(), `purge-p2-${Date.now()}.jsonl`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpLog)) fs.unlinkSync(tmpLog);
  });

  it("calls deleteMany once with correct where clause on apply", async () => {
    const mockPrisma = makeMockPrisma();
    await runPurge(mockPrisma, true, tmpLog);

    expect(mockPrisma.arcSessionSummary.deleteMany).toHaveBeenCalledTimes(1);
    expect(mockPrisma.arcSessionSummary.deleteMany).toHaveBeenCalledWith({
      where: { retainUntil: { not: null, lt: expect.any(Date) } },
    });
  });

  it("writes a valid JSON log entry on apply", async () => {
    const mockPrisma = makeMockPrisma();
    await runPurge(mockPrisma, true, tmpLog);

    expect(fs.existsSync(tmpLog)).toBe(true);
    const raw = fs.readFileSync(tmpLog, "utf-8").trim();
    const entry = JSON.parse(raw) as Record<string, unknown>;
    expect(entry.mode).toBe("apply");
    expect(entry.deleted).toBe(1);
    expect(entry.dryRun).toBe(false);
    expect(typeof entry.run).toBe("string");
  });

  it("returns count=1 (mocked deleteMany count) on apply", async () => {
    const mockPrisma = makeMockPrisma();
    const result = await runPurge(mockPrisma, true, tmpLog);

    expect(result.count).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// P3 -- not-yet-expired row (Row B, tomorrow) not in the where clause
// ---------------------------------------------------------------------------

describe("P3 -- not-yet-expired row excluded by where clause", () => {
  let tmpLog: string;

  beforeEach(() => {
    tmpLog = path.join(os.tmpdir(), `purge-p3-${Date.now()}.jsonl`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpLog)) fs.unlinkSync(tmpLog);
  });

  it("where clause lt is at or before now (not tomorrow)", async () => {
    const before = new Date();
    const mockPrisma = makeMockPrisma();
    await runPurge(mockPrisma, true, tmpLog);
    const after = new Date();

    const deleteManyArg: { where: { retainUntil: { not: null; lt: Date } } } =
      (mockPrisma.arcSessionSummary.deleteMany as jest.Mock).mock.calls[0][0];
    const ltDate = deleteManyArg.where.retainUntil.lt;

    // lt must be at or very slightly after `before` and at or before `after`
    // (a few ms of clock drift is fine -- just not tomorrow)
    expect(ltDate.getTime()).toBeGreaterThanOrEqual(before.getTime() - 100);
    expect(ltDate.getTime()).toBeLessThanOrEqual(after.getTime() + 100);
  });

  it("Row B id does not appear in any deleteMany args", async () => {
    const mockPrisma = makeMockPrisma();
    await runPurge(mockPrisma, true, tmpLog);

    const calls = (mockPrisma.arcSessionSummary.deleteMany as jest.Mock).mock.calls;
    const argsString = JSON.stringify(calls);
    // deleteMany is called with a WHERE clause, not specific IDs -- Row B's ID must not appear
    expect(argsString).not.toContain(ROW_B.id);
  });
});

// ---------------------------------------------------------------------------
// P4 -- null-retainUntil row (Row C) excluded by `not: null` in where clause
// ---------------------------------------------------------------------------

describe("P4 -- null retainUntil excluded by where clause", () => {
  let tmpLog: string;

  beforeEach(() => {
    tmpLog = path.join(os.tmpdir(), `purge-p4-${Date.now()}.jsonl`);
  });

  afterEach(() => {
    if (fs.existsSync(tmpLog)) fs.unlinkSync(tmpLog);
  });

  it("where clause has not: null guard", async () => {
    const mockPrisma = makeMockPrisma();
    await runPurge(mockPrisma, true, tmpLog);

    const deleteManyArg: { where: { retainUntil: { not: unknown; lt: Date } } } =
      (mockPrisma.arcSessionSummary.deleteMany as jest.Mock).mock.calls[0][0];

    expect(deleteManyArg.where.retainUntil.not).toBeNull();
  });

  it("Row C id does not appear in any deleteMany args", async () => {
    const mockPrisma = makeMockPrisma();
    await runPurge(mockPrisma, true, tmpLog);

    const calls = (mockPrisma.arcSessionSummary.deleteMany as jest.Mock).mock.calls;
    const argsString = JSON.stringify(calls);
    expect(argsString).not.toContain(ROW_C.id);
  });
});
