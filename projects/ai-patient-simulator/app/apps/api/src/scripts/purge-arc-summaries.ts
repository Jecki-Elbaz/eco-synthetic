// purge-arc-summaries.ts
// APS-022 ArcSessionSummary retention purge -- exported core logic.
// Imported by unit tests (purge-arc-summaries.spec.ts). NOTE: the standalone
// entry-point script (purge-expired-arc-summaries.mjs) does NOT import this --
// it carries a deliberate INLINED COPY of runPurge so the runner can invoke it
// without a fresh dist build (Oren S8 MINOR-1, Eco ruling 2026-07-13).
// THIS FUNCTION MUST STAY IN SYNC WITH the .mjs copy -- ANY CHANGE TO ONE
// REQUIRES THE SAME CHANGE TO THE OTHER. Unification -> APS-022 pre-prod.
//
// Safety: WHERE retainUntil IS NOT NULL AND retainUntil < NOW() only.
// Default behaviour is DRY-RUN (applyMode = false). Deletion requires explicit
// applyMode = true. Log is written only on apply, never on dry-run.
// Zero-token (script, not LLM). Ref: Sprint 8 envelope 2026-07-13 S8-GAL-PURGE.

import type { PrismaClient } from "@aps/db";
import fs from "node:fs";
import path from "node:path";

export interface PurgeRow {
  id: string;
  userId: string;
  templateId: string;
  sessionNumber: number;
  retainUntil: Date;
}

export interface PurgeResult {
  count: number;
  rows: PurgeRow[];
}

/**
 * Run the ArcSessionSummary retention purge.
 *
 * @param prisma     - Prisma client (real or mock).
 * @param applyMode  - true = delete expired rows; false = dry-run, print only.
 * @param logFilePath - Path to append the JSON log line on apply. Skipped on dry-run.
 * @returns count of deleted rows (0 on dry-run) and the matched row metadata.
 */
export async function runPurge(
  prisma: PrismaClient,
  applyMode: boolean,
  logFilePath?: string,
): Promise<PurgeResult> {
  // Non-negotiable WHERE clause per S8-GAL-PURGE envelope.
  const where = { retainUntil: { not: null, lt: new Date() } };

  const rows: PurgeRow[] = await prisma.arcSessionSummary.findMany({
    where,
    select: {
      id: true,
      userId: true,
      templateId: true,
      sessionNumber: true,
      retainUntil: true,
    },
  });

  console.log(
    `[purge-arc] mode=${applyMode ? "APPLY" : "DRY-RUN"} count=${rows.length}`,
  );
  for (const row of rows) {
    console.log(
      `  id=${row.id} userId=${row.userId} templateId=${row.templateId}` +
        ` sessionNumber=${row.sessionNumber} retainUntil=${row.retainUntil}`,
    );
  }

  if (!applyMode) {
    console.log("[purge-arc] DRY-RUN: no rows deleted. Pass --apply to delete.");
    return { count: 0, rows };
  }

  // --- apply path ---
  const result = await prisma.arcSessionSummary.deleteMany({ where });
  const deleted: number = result.count;

  const entry = {
    run: new Date().toISOString(),
    mode: "apply",
    deleted,
    dryRun: false,
  };

  if (logFilePath) {
    fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
    fs.appendFileSync(logFilePath, JSON.stringify(entry) + "\n");
    console.log(`[purge-arc] DELETED ${deleted} rows. Logged to ${logFilePath}`);
  } else {
    console.log(`[purge-arc] DELETED ${deleted} rows.`);
  }

  return { count: deleted, rows };
}
