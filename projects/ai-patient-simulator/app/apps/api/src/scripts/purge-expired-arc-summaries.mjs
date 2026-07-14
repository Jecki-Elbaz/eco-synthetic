#!/usr/bin/env node
// purge-expired-arc-summaries.mjs
// APS-022 ArcSessionSummary retention purge script (standalone Node ESM).
// Default: DRY-RUN -- prints count + row identifiers, deletes NOTHING.
// Pass --apply to delete expired rows.
// Every --apply run appends one JSON line to logs/purge-arc-summaries.jsonl.
//
// Safety: WHERE retainUntil IS NOT NULL AND retainUntil < NOW() only.
// Zero-token (script, not LLM). Ref: Sprint 8 envelope 2026-07-13 S8-GAL-PURGE.
//
// Run (dry-run):  node apps/api/src/scripts/purge-expired-arc-summaries.mjs
// Run (apply):    node apps/api/src/scripts/purge-expired-arc-summaries.mjs --apply
//   Note: --apply is invoked by the runner job only; not permitted in dev scope.
//
// Prerequisite: DATABASE_URL must be set (dotenv-cli loads .env.local; runner sets it).

import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Load generated Prisma client (CJS -- real connection, not the @aps/db stub).
// Path from apps/api/src/scripts/ to packages/db/src/generated/index.js
const { PrismaClient } = require(
  path.join(__dirname, "../../../../packages/db/src/generated/index.js"),
);

const applyMode = process.argv.includes("--apply");

// Log path: resolved against CWD (should be the app/ root when invoked as documented).
const LOG_FILE = path.resolve(process.cwd(), "logs/purge-arc-summaries.jsonl");

// ---------------------------------------------------------------------------
// Core purge function -- self-contained INLINED COPY of
// purge-arc-summaries.ts:runPurge (deliberate: this script is invoked by the
// runner as a standalone subprocess and must not depend on a fresh nest build
// of dist/; Oren S8 MINOR-1, Eco ruling 2026-07-13; unification -> APS-022
// pre-production mandate).
// THIS FUNCTION MUST STAY IN SYNC WITH purge-arc-summaries.ts:runPurge --
// ANY CHANGE TO ONE REQUIRES THE SAME CHANGE TO THE OTHER. Unit tests cover
// only the .ts copy; the WHERE clause below is the safety-critical element.
// ---------------------------------------------------------------------------

async function runPurge(prisma, applyMode, logFilePath) {
  // Non-negotiable WHERE clause per S8-GAL-PURGE envelope.
  const where = { retainUntil: { not: null, lt: new Date() } };

  const rows = await prisma.arcSessionSummary.findMany({
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
  const deleted = result.count;

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

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

const prisma = new PrismaClient();
try {
  await runPurge(prisma, applyMode, LOG_FILE);
} finally {
  await prisma.$disconnect();
}
