# Sprint 8 Task Envelopes -- APS-022 REMAINDER
# Author: Ido (VP R&D) | Date: 2026-07-13 | Requester: Eco (CEO)
# Board source: APS-022 items (a)(b)(c) -- remaining after Sprint 7 close 2026-07-13
# Sprint 7 close baseline (source: review-sprint-7-oren.md FIX STATUS + Adi sign-off):
#   api tsc 0 | nest build 0 | api unit 305/0-fail/8-skip (22 suites)
#   integration 8/8 78/0-fail/2-skip | E2E 34/34 | engine 212/212 | web 43/43 + tsc 0
# Sprint scale: ~1.5 eng-days total (Adi ~0.5 + Gal ~0.75 + Shir ~0.25)

---

## Standing constraints (carry from Sprint 7 unchanged)

- StubProvider only. No real LLM.
- No new npm dependencies. Any new dep: flag to gate, do not adopt.
- No agent git commits. Owner commits from terminal.
- No agent contacts Adam. Owner relays only.
- Red line 3: no destructive commands without explicit A1 in this session.

---

## Sprint 8 scope

- S8-ADI-DSRLIVE: live-Postgres DSR integration test (MAJOR-1 regression guard +
  FK-order proof; additive spec, no existing suite modified)
- S8-GAL-PURGE: ArcSessionSummary retention purge script (dry-run default, --apply
  gate, unit tests for WHERE-clause scoping)
- S8-SHIR-PURGEJOB: weekly runner job registration in DISABLED_JOBS (owner A1 to
  enable at pilot go-live when real student data exists)

OUT OF SCOPE -- Item 3 ruling (see full ruling section below):
  ABANDONED-status cache eviction (Oren S7 INFO-1): OPTION (iii), accept for pilot.
  No S8-GAL-EVICT task. No Gal implementation for this item this sprint.

Sequencing:
  Day 0: Adi starts S8-ADI-DSRLIVE (no dependency). Gal starts S8-GAL-PURGE (no
    dependency). Both run in parallel.
  Day 0-1: Gal delivers CP-DONE with script file path. Shir starts S8-SHIR-PURGEJOB.
  Day 1: Shir delivers. Adi delivers integration test result. Sprint complete when all
    three delivered and gate baseline confirmed.

---

## Ido design ruling -- Item 3 (ABANDONED-status cache eviction)

RULING: OPTION (iii). Accept for pilot. Defer to production hardening.
Authority: A3 (intra-R&D). Dated: 2026-07-13.

Background: Oren S7 INFO-1 notes that arcContextCache evicts on COMPLETED only.
ABANDONED / TECHNICALLY_AFFECTED / TECHNICAL_FAILURE_CONFIRMED / RETRY_AUTHORISED
never evict, creating unbounded-growth potential in a long-lived production process.

Why (iii) for pilot:
  (a) Oren rated INFO -- not MINOR, not MAJOR. Risk is memory growth in a long-lived
      process, not data corruption. The pilot process lifetime is short.
  (b) The non-COMPLETED statuses likely originate in admin endpoints or error-recovery
      handlers outside SimulationService. Option (i) requires verifying those code sites
      before adding cache.delete calls; that investigation is pre-production scope.
  (c) Option (ii) LRU / max-entries guard adds dependency or complexity; on a pilot
      with synthetic data and a short-lived process it does not earn its keep.
  (d) Sprint budget is ~1.5 eng-days. Items 1 and 2 exhaust the meaningful pilot work.

Pre-production mandate (Gal, before first multi-session production deploy):
  1. Read simulation.service.ts and every endpoint or handler that sets ABANDONED,
     TECHNICALLY_AFFECTED, TECHNICAL_FAILURE_CONFIRMED, or RETRY_AUTHORISED.
  2. If all four flow through SimulationService: add this.arcContextCache.delete(attemptId)
     at each terminal-status code site + unit test for each eviction path.
  3. If any do NOT flow through SimulationService: implement a max-entries guard on the
     arcContextCache Map (size > N -> delete oldest or clear); unit test that the guard
     fires before the bound is exceeded.
  4. Update APS-022 with the chosen approach and close the pre-production note.
Reference: Oren S7 INFO-1, review-sprint-7-oren.md. Tracked in APS-022.

---

## Envelope: Adi

task_ids: S8-ADI-DSRLIVE
effort: ~0.5 eng-days
priority: P1
start: 2026-07-13 (no code dependency -- deleteStudentData is live in codebase)

#### Permitted Bash commands (Rambo C3 -- exhaustive list, test-run scope only)

1. `pnpm --filter @aps/engine-test-harness test` -- engine test harness
2. `pnpm --filter @aps/api test` -- api unit suite
3. `pnpm --filter @aps/api test:integration` -- integration suite
4. `pnpm --filter @aps/web test` -- web unit suite
5. `node apps/api/src/scripts/e2e-golden-path.mjs` -- E2E runner

No build commands. No migrations. No git. Any command not on this list: stop, flag to Ido.

---

### S8-ADI-DSRLIVE -- Live-DB DSR integration test

Context: dsr.spec.ts is fully mocked (Adi FLAG-2 / Oren MINOR-3). It cannot prove
FK ordering, catch the MAJOR-1 class of gap (null-attemptId SupportTickets), or
confirm DiagnosticLog rows are swept. This spec is the live-DB proof and regression
guard for all three.

File: one new spec using the .integration pattern; do NOT modify any existing spec.
  Suggested path: apps/api/src/__tests__/dsr-live.integration.spec.ts
  Follow the directory and import conventions of arc.integration.spec.ts or
  arc-coherence.integration.spec.ts.

SEED -- target student (targetUserId):
  Create a User row for targetUserId. Then create all of the following:
  - One Attempt linked to targetUserId (use the seeded template/course, or create a
    minimal valid Attempt following the pattern of existing integration seeds).
  - All six non-cascading Attempt children (one row each, all linked to that Attempt):
      Message | PatientStateLog | Evaluation | DebriefChat | UsageLog
      SupportTicket (attemptId = Attempt.id, userId = targetUserId)
  - One SupportTicket with attemptId = NULL and userId = targetUserId.
    THIS IS THE MAJOR-1 REGRESSION CASE. It must be in the seed.
  - One DiagnosticLog row. Link it to the null-attemptId SupportTicket via
    diagnosticLogId on that SupportTicket. Capture the DiagnosticLog ID for assertion (i).
  - One ArcSessionSummary row with userId = targetUserId.

SEED -- second student (otherUserId):
  Create a second User row for otherUserId. Seed at minimum:
  - One ArcSessionSummary (userId = otherUserId).
  - One SupportTicket with attemptId = NULL and userId = otherUserId.
  - One DiagnosticLog linked to that ticket.
  Adding the full six-child Attempt set for otherUserId is optional; if low effort, do it.

ACTION:
  Obtain or instantiate SimulationService following the pattern of existing integration
  specs that call services directly against the live DB (check how arc.integration.spec.ts
  bootstraps NestJS or accesses services; replicate that pattern).
  Call: await simulationService.deleteStudentData(targetUserId)

ASSERTIONS (query the live DB after the call):
  (a) prisma.arcSessionSummary.count({ where: { userId: targetUserId } }) === 0
  (b) prisma.attempt.count({ where: { userId: targetUserId } }) === 0
  (c) prisma.message.count({ where: { attemptId: seededAttemptId } }) === 0
      (Messages have no userId; query by the seeded attempt's ID)
  (d) prisma.patientStateLog.count({ where: { attemptId: seededAttemptId } }) === 0
  (e) prisma.evaluation.count({ where: { attemptId: seededAttemptId } }) === 0
  (f) prisma.debriefChat.count({ where: { attemptId: seededAttemptId } }) === 0
  (g) prisma.usageLog.count({ where: { attemptId: seededAttemptId } }) === 0
  (h) prisma.supportTicket.count({ where: { userId: targetUserId } }) === 0
      (covers both the FK-linked ticket AND the null-attemptId ticket in one query)
  (i) prisma.diagnosticLog.findUnique({ where: { id: seededDiagnosticLogId } }) === null
      (the DiagnosticLog linked to the null-attemptId ticket must be swept)
  (j) the deleteStudentData call completes without throwing -- no FK error, no exception

ISOLATION ASSERTIONS (otherUserId rows must survive):
  (k) prisma.arcSessionSummary.count({ where: { userId: otherUserId } }) >= 1
  (l) prisma.supportTicket.count({ where: { userId: otherUserId } }) >= 1

TEARDOWN:
  Delete all seeded rows (target + other student). Use FK-safe order: children before
  parent (same order as deleteStudentData itself). If the integration suite uses
  beforeAll/afterAll with a dedicated test schema or transaction rollback, follow that
  pattern.

Report to Eco/Ido:
  - Spec file path.
  - Pass/fail per assertion (a)-(l) individually.
  - Full integration suite gate result (suites / count / fail / skip).
  - Any FK error or test failure: report immediately; do NOT patch code yourself.

---

## Envelope: Gal

task_ids: S8-GAL-PURGE
effort: ~0.75 eng-days
priority: P1
start: 2026-07-13 (no dependency)

#### Permitted Bash commands (Rambo C3 -- exhaustive list, api/db scope only)

1.  `pnpm --filter @aps/api build` -- nest build
2.  `pnpm --filter @aps/api test` -- jest unit suite
3.  `pnpm --filter @aps/api test:integration` -- live-Postgres integration suite
4.  `pnpm --filter @aps/api exec tsc --noEmit` -- typecheck
5.  `pnpm --filter @aps/db migrate dev --name <migration_name>` -- create + apply dev migration
6.  `pnpm --filter @aps/db migrate:deploy` -- apply pending migrations
7.  `pnpm --filter @aps/db generate` -- regenerate Prisma client after schema change
8.  `pnpm --filter @aps/db seed` -- re-seed development/test data
9.  `node apps/api/src/scripts/e2e-golden-path.mjs` -- E2E runner
10. `node apps/api/src/scripts/purge-expired-arc-summaries.mjs` -- purge script DRY-RUN only

Command 10 is dry-run only (no --apply). The --apply flag is NOT permitted in Gal's
Bash scope; apply is invoked only by the runner job (Shir). No web filters. No docker.
No git. Any command not on this list: stop, flag to Ido.

---

### S8-GAL-PURGE -- Retention purge script

NO schema change. NO migration. Code-only item.

FILE LOCATION (Gal's call -- document the choice in the delivery addendum):
  Primary: apps/api/src/scripts/purge-expired-arc-summaries.mjs
    (pattern: e2e-golden-path.mjs -- standalone Node ESM, imports Prisma client)
  Alternate: a script under packages/db/ if the @aps/db package's Prisma client entry
    is cleaner for a standalone script context.

SAFETY DESIGN (Eco constraint, non-negotiable -- ref Red Line 3):
  Default behavior = DRY-RUN: print count + row identifiers, delete NOTHING.
  Deletion only when --apply is passed explicitly on the command line.
  Every --apply run appends one JSON line to the log file (see below). Never truncates.
  The log file is never written on a dry-run.

WHERE clause (non-negotiable):
  WHERE retainUntil IS NOT NULL AND retainUntil < NOW()
  Prisma form: { retainUntil: { not: null, lt: new Date() } }

LOG FILE:
  Path: logs/purge-arc-summaries.jsonl relative to the project root
    (projects/ai-patient-simulator/logs/purge-arc-summaries.jsonl or equivalent).
  If logs/ does not exist: create logs/.gitkeep and add logs/*.jsonl to .gitignore
    so purge logs are never committed (they contain row IDs + counts). The .gitkeep
    and .gitignore change go into the owner's terminal commit with the rest of the sprint.
  Entry format per apply run (JSON, one line):
    { "run": "<ISO-timestamp>", "mode": "apply", "deleted": <count>, "dryRun": false }

EXPORTED FUNCTION (required for unit testing):
  Extract the core logic into an exported async function so the unit test can import and
  call it with a mocked Prisma client. Suggested signature:

    export async function runPurge(
      prisma: PrismaClient,
      applyMode: boolean,
      logFilePath?: string,
    ): Promise<{ count: number; rows: Array<{ id: string; userId: string; retainUntil: Date }> }>

  The top-level script invocation calls runPurge(new PrismaClient(), applyMode, LOG_FILE).

SCRIPT PSEUDOCODE (adapt imports to match e2e-golden-path.mjs bootstrap):

  #!/usr/bin/env node
  // purge-expired-arc-summaries.mjs
  // APS-022 retention purge. Default: DRY-RUN. Pass --apply to delete.
  // Safety: WHERE retainUntil IS NOT NULL AND retainUntil < NOW() only.
  // Zero-token (script, not LLM). Per company policy: company/memory/zero-token.

  import { PrismaClient } from '@prisma/client'; // adjust to codebase import
  import fs from 'node:fs';
  import path from 'node:path';

  const applyMode = process.argv.includes('--apply');
  const LOG_FILE = path.resolve(process.cwd(), 'logs/purge-arc-summaries.jsonl');

  export async function runPurge(prisma, applyMode, logFilePath) {
    const where = { retainUntil: { not: null, lt: new Date() } };
    const rows = await prisma.arcSessionSummary.findMany({
      where,
      select: { id: true, userId: true, retainUntil: true },
    });

    console.log(`[purge-arc] mode=${applyMode ? 'APPLY' : 'DRY-RUN'} count=${rows.length}`);
    for (const row of rows) {
      console.log(`  id=${row.id} userId=${row.userId} retainUntil=${row.retainUntil}`);
    }

    if (!applyMode) {
      console.log('[purge-arc] DRY-RUN: no rows deleted. Pass --apply to delete.');
      return { count: 0, rows };
    }

    const result = await prisma.arcSessionSummary.deleteMany({ where });
    const entry = {
      run: new Date().toISOString(),
      mode: 'apply',
      deleted: result.count,
      dryRun: false,
    };
    if (logFilePath) {
      fs.mkdirSync(path.dirname(logFilePath), { recursive: true });
      fs.appendFileSync(logFilePath, JSON.stringify(entry) + '\n');
    }
    console.log(`[purge-arc] DELETED ${result.count} rows. Logged to ${logFilePath}`);
    return { count: result.count, rows };
  }

  // main
  const prisma = new PrismaClient();
  try {
    await runPurge(prisma, applyMode, LOG_FILE);
  } finally {
    await prisma.$disconnect();
  }

UNIT TESTS (test runPurge with mocked Prisma; file in existing __tests__/ directory):
  File: apps/api/src/__tests__/purge-arc-summaries.spec.ts

  Mock setup for apply-mode tests -- mock findMany returns three rows:
    Row A: retainUntil = 2 days ago. Should be included in delete.
    Row B: retainUntil = tomorrow. Must survive (not in where clause).
    Row C: retainUntil = null. Must survive.
  Mock deleteMany returns { count: 1 } (Row A only).

  Test P1 -- dry-run does not delete:
    Call runPurge(mockPrisma, false).
    Assert: deleteMany NOT called (or called 0 times).
    Assert: findMany called once with { retainUntil: { not: null, lt: expect.any(Date) } }.
    Assert: log file NOT written.
    Assert: return count === 0.

  Test P2 -- apply-mode deletes via correct WHERE:
    Call runPurge(mockPrisma, true, tmpLogPath).
    Assert: deleteMany called once with { where: { retainUntil: { not: null, lt: expect.any(Date) } } }.
    Assert: log file written; entry parses as valid JSON with mode="apply", deleted=1, dryRun=false.
    Assert: return count === 1.

  Test P3 -- not-yet-expired row (Row B) not in the where clause:
    Verify findMany is called with lt: new Date()-ish (the where clause does not include
    tomorrow's date). Row B is not in the delete scope by definition of the where clause.
    Assert: no deleteMany call includes Row B's ID explicitly.

  Test P4 -- null-retainUntil row (Row C) excluded:
    Same findMany where clause has `not: null` -- Row C cannot match.
    Assert: no deleteMany call includes Row C's ID.

  PASS condition: P1-P4 pass; tsc 0 on test file; api unit count >= 305 with new tests.

SELF-VERIFY before CP-DONE signal:
  - pnpm --filter @aps/api build: exit 0.
  - pnpm --filter @aps/api exec tsc --noEmit: 0 errors.
  - pnpm --filter @aps/api test: >= 305 / 0-fail / <= 8-skip (new purge tests included).
  - node apps/api/src/scripts/purge-expired-arc-summaries.mjs: exits clean, prints
    count (likely 0 on dev seed), does NOT write log (dry-run default). Confirm.
  - pnpm --filter @aps/api test:integration: 8/8 / >= 78 / 0-fail / <= 2-skip.
  - node apps/api/src/scripts/e2e-golden-path.mjs: 34/34.

CP-DONE signal to Eco/Ido must include: script file path (absolute or project-relative)
  so Shir can register the runner job with the correct invocation command.

---

## Envelope: Shir

task_ids: S8-SHIR-PURGEJOB
effort: ~0.25 eng-days
priority: P2
start: after Gal CP-DONE (needs the confirmed script file path)

#### Permitted Bash commands (Rambo C3 -- exhaustive list, python/runner-scope only)

1. `python -m py_compile integrations/runner/runner.py` -- verify runner.py compiles
2. `python integrations/runner/runner.py --dry-run` -- runner dry-run validation

No live runner invocation. No node. No pnpm. No git. Any command not on this list:
stop, flag to Ido.

---

### S8-SHIR-PURGEJOB -- Weekly runner job registration

SUMMARY: add a weekly job to the runner that invokes the purge script with --apply.
The job MUST ship in DISABLED_JOBS (or the runner's equivalent disabled-state mechanism).
It MUST NOT fire on any runner cycle until the owner explicitly activates it.
Enabling the job is an owner A1 action at pilot go-live when real student data exists.
This is a ZERO-TOKEN script job per company policy (script, not LLM; no Claude invocation).

Step 1 -- read the runner:
  Read integrations/runner/runner.py.
  Identify: (a) how DISABLED_JOBS are declared and checked; (b) how non-LLM/script jobs
    are invoked (subprocess, os.system, or equivalent); (c) the weekly cadence pattern
    (look at existing weekly jobs -- day-of-week key, interval, or cron-style config).

Step 2 -- add the job entry using the pattern from Step 1:
  job_key: "purge_expired_arc_summaries"
  cadence: weekly (match the pattern of other weekly jobs in the runner)
  invocation: node <script path from Gal CP-DONE> --apply
    Use an absolute or project-relative path that is stable across runner restarts.
    Verify the node binary is reachable from the runner's PATH (check other script
    invocations in runner.py for the pattern).
  status: DISABLED -- must be in DISABLED_JOBS or equivalent; must not appear in the
    active job list or fire on any run cycle.
  description comment (add inline in runner.py or the job config):
    # APS-022 retention purge. Deletes ArcSessionSummary rows WHERE
    # retainUntil IS NOT NULL AND retainUntil < NOW(). DISABLED: enable
    # only at pilot go-live (owner A1) when real student data exists.
    # Zero-token (node script, not LLM). Ref: Sprint 8 envelope 2026-07-13.

Step 3 -- verify:
  python -m py_compile integrations/runner/runner.py -- must pass (0 errors).
  python integrations/runner/runner.py --dry-run -- must output the new job as DISABLED
    (not as a candidate for this cycle). If the dry-run output does not surface DISABLED
    jobs, confirm by code inspection that the job key is NOT in the active execution list,
    and document this in the delivery report.

Step 4 -- deliver to Eco/Ido:
  - Exact file(s) changed.
  - The job key + full invocation command as registered.
  - dry-run output (or code excerpt) confirming the job is DISABLED and will not fire.
  - Explicit statement: "enabling this job requires owner A1 in the runner config."

---

## Acceptance criteria -- per agent

Adi (S8-ADI-DSRLIVE):
  [ ] dsr-live.integration.spec.ts (or equivalent) exists and runs in integration suite.
  [ ] Seed includes a null-attemptId SupportTicket AND a linked DiagnosticLog.
  [ ] All assertions (a)-(j) pass (zero rows remain for target, no FK error).
  [ ] All assertions (k)-(l) pass (other student rows survive).
  [ ] Integration suite: all suites pass / 0-fail / the new test(s) pass / <= 2-skip.
  [ ] No existing integration test regressed.

Gal (S8-GAL-PURGE):
  [ ] purge-expired-arc-summaries.mjs exists; dry-run default confirmed.
  [ ] runPurge exported function; WHERE clause is NOT NULL AND < NOW().
  [ ] Unit tests P1-P4 pass; api unit >= 305 / 0-fail / <= 8-skip.
  [ ] node .../purge-expired-arc-summaries.mjs exits clean (dry-run, no --apply).
  [ ] Log written on --apply, NOT written on dry-run.
  [ ] logs/.gitkeep + logs/*.jsonl .gitignore entry present (or logs/ already exists).
  [ ] tsc 0; nest build exit 0; integration 8/8 >= 78 / 0-fail; E2E 34/34.
  [ ] CP-DONE signal includes confirmed script file path.

Shir (S8-SHIR-PURGEJOB):
  [ ] Job "purge_expired_arc_summaries" in DISABLED_JOBS or equivalent.
  [ ] Job invokes purge script with --apply at weekly cadence.
  [ ] py_compile pass; dry-run confirms job is DISABLED / does not fire.
  [ ] Delivery includes statement that owner A1 is required to enable.

---

## DoD -- Sprint 8 definition of done

Gate baseline preserved or exceeded:
  nest build 0
  engine 212/212 / 0-fail
  api unit >= 305 / 0-fail / <= 8-skip
  api tsc 0
  integration: all suites pass / 0-fail / <= 2-skip; the S8-ADI-DSRLIVE spec
    assertions (a)-(l) all pass and add to the pass count; existing 78 do not regress
  web tsc 0 + 43/43
  E2E 34/34

Feature gates:
  [ ] Live-DB DSR integration test written + passing (assertions a-l per S8-ADI-DSRLIVE)
  [ ] Seed covers null-attemptId SupportTicket + linked DiagnosticLog (MAJOR-1 guard)
  [ ] Purge script exists; default dry-run verified; WHERE clause correct
  [ ] Unit tests verify: expired row deleted; not-yet-expired row survives; null row survives
  [ ] Log file appended on --apply; not written on dry-run
  [ ] Runner job registered in DISABLED_JOBS with --apply; not firing; owner A1 to enable
  [ ] Item 3 (ABANDONED eviction) documented as pre-production mandate with date 2026-07-13

Any unchecked box at sprint close = sprint not done. Escalate to Ido before declaring close.

---

## S8-GAL-PURGE Delivery -- Gal | 2026-07-13

VERDICT: CP-DONE

### Files created

- apps/api/src/scripts/purge-arc-summaries.ts -- TypeScript core module; exports runPurge; imported by unit tests
- apps/api/src/scripts/purge-expired-arc-summaries.mjs -- standalone Node ESM entry-point; default dry-run; --apply gate
- apps/api/src/__tests__/purge-arc-summaries.spec.ts -- unit tests P1-P4
- app/logs/.gitkeep -- creates logs/ directory
- app/.gitignore updated -- added `logs/*.jsonl` (purge logs never committed)

### Design note (file location choice)

Primary path chosen: apps/api/src/scripts/purge-expired-arc-summaries.mjs (standalone Node ESM, mirrors e2e-golden-path.mjs convention).

The exported runPurge function lives in a separate TypeScript companion file (purge-arc-summaries.ts) so unit tests can import it via ts-jest without ESM/CJS boundary issues. The .mjs entry-point is self-contained (logic inlined, PrismaClient loaded from packages/db/src/generated/index.js via createRequire). Both files implement the same WHERE clause.

### Gate results

- pnpm --filter @aps/api build: exit 0
- pnpm --filter @aps/api exec tsc --noEmit: 0 errors
- pnpm --filter @aps/api test: 23 suites / 316 passed / 0 fail / 8 skip (baseline 305; +11 new P-tests)
- pnpm --filter @aps/api test:integration: 9/9 suites / 90 passed / 0 fail / 2 skip

### Dry-run output (dev DB, no --apply)

  [purge-arc] mode=DRY-RUN count=0
  [purge-arc] DRY-RUN: no rows deleted. Pass --apply to delete.
  EXIT:0

Count=0 is correct: dev seed data has null or future retainUntil values; no rows match the WHERE clause. Log file NOT written (confirmed: logs/ contains only .gitkeep).

### Shir handoff -- script file path for runner job

  node apps/api/src/scripts/purge-expired-arc-summaries.mjs --apply

Run from: projects/ai-patient-simulator/app/ (CWD must be app/ so logs/ resolves correctly).
Requires: DATABASE_URL in runner environment.

---

## S8-ADI-DSRLIVE Sign-off -- Adi | 2026-07-13
## (delivered in-session; appended by Eco -- Adi's Write scope excludes this path)

VERDICT: PASS

Spec: apps/api/src/__tests__/dsr-live.integration.spec.ts

Assertion results (all against live Postgres):
  (j) no FK error / no exception thrown -- PASS
  (a) arcSessionSummary count for targetUser == 0 -- PASS
  (b) attempt count for targetUser == 0 -- PASS
  (c) message count for seededAttempt == 0 -- PASS
  (d) patientStateLog count for seededAttempt == 0 -- PASS
  (e) evaluation count for seededAttempt == 0 -- PASS
  (f) debriefChat count for seededAttempt == 0 -- PASS
  (g) usageLog count for seededAttempt == 0 -- PASS
  (h) supportTicket count for targetUser == 0 (null-attemptId ticket swept) -- PASS
  (i) diagnosticLog seededDiagnosticLogId == null (MAJOR-1 guard) -- PASS
  (k) arcSessionSummary count for otherUser >= 1 -- PASS
  (l) supportTicket count for otherUser >= 1 -- PASS

Integration suite: 9/9 suites | 90 passed | 0 fail | 2 skip
Prior baseline (78 existing): 0 regressions.
Flags: none.
