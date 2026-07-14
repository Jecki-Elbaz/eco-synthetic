# Sprint 8 Delta Review -- Oren
# Round 1 | 2026-07-13 | Requester: Eco (CEO), standing quality gate
# Scope: S8-GAL-PURGE (retention purge script) + S8-ADI-DSRLIVE (live-DB DSR spec)
# PROVENANCE: Oren delivered in-session; Eco persisted as review of record.
# Fix status appended at bottom.

## VERDICT: APPROVE-WITH-CONDITIONS
0 BLOCKER | 0 MAJOR | 2 MINOR | 1 INFO

## Q-RESULTS

Q1 PURGE SAFETY: CLEAN. WHERE clause verified character-identical in both copies:
{ retainUntil: { not: null, lt: new Date() } } -- null-retainUntil rows cannot match
`not: null`; future rows cannot match `lt`. --apply parsing uses
process.argv.includes("--apply") (exact element equality; "--apply-all" cannot
false-positive). Dry-run path early-returns before deleteMany/appendFileSync --
zero write calls; only findMany (read-only).

Q2 DRIFT RISK: MINOR-1. runPurge exists twice (.mjs inlined + .ts companion);
unit tests exercise only the .ts copy; the .ts header falsely claimed the .mjs
imports from compiled dist. Preferred fix: .mjs requires runPurge from compiled
dist via createRequire (tests then cover both). Minimum-for-pilot: explicit
MUST-STAY-IN-SYNC comments on both files; unification to APS-022 pre-production.

Q3 APPLY-LOG: CLEAN. { run, mode, deleted, dryRun } JSON line, appendFileSync
(append-only), never written on dry-run; logs/*.jsonl confirmed gitignored.

Q4 DSR-LIVE SPEC: PASS with MINOR-2. MAJOR-1 seed genuinely constructed
(SupportTicket attemptId: null + linked DiagnosticLog, ids captured for
assertions). All 12 assertions are real live-Prisma queries, no mocks; assertion
(j) (no FK error) correctly ordered first. afterAll teardown FK-ordered correctly
throughout (tickets before DiagnosticLog; children before Attempt; shared
hierarchy last). MINOR-2: no try/finally in beforeAll/afterAll -- a mid-seed
failure orphans partial rows in the TEST DB. Pattern-level (inherited from
arc.integration.spec.ts conventions), not Adi's deviation; test-hygiene tech-debt
note to Ido, no sprint-close action.

Q5 RED LINES: CLEAN. Zero new dependencies (Node built-ins + existing generated
client); deletion not enabled by default anywhere (dry-run default; runner job in
DISABLED_JOBS).

INFO-1: .mjs comment claimed runPurge is "Exported" -- it is not (subprocess
invocation unaffected). Documentation inaccuracy only.

## GATE CONFIRMATION (as reviewed)
Gal: api unit 316/0-fail/8-skip (23 suites, +11); Adi: integration 9/9 suites
90/0-fail/2-skip (+12, zero regressions). Both above DoD thresholds.

## FIX STATUS (Eco, 2026-07-13, same session)

- MINOR-1: RESOLVED via the sync-comment path -- Eco ruling: the .mjs stays a
  deliberate self-contained copy BECAUSE the runner invokes it as a standalone
  subprocess and must not depend on a fresh nest build of dist/ (robustness on
  runner cycles outweighs single-source elegance for the pilot). Strong
  MUST-STAY-IN-SYNC warnings added to BOTH files; the false dist-import claim in
  the .ts header corrected; unification recorded as an APS-022 pre-production
  mandate item.
- INFO-1: FIXED -- the false "Exported" comment removed in the same rewrite.
- MINOR-2: accepted as pattern-level tech debt; noted to Ido with the integration
  test baseline (try/finally posture for beforeAll/afterAll seeding).
- Post-fix gate (Eco, independently run): api tsc 0; nest build 0; api unit
  316/0-fail/8-skip; integration 9/9 90/0-fail/2-skip; engine 212/212; web 43/43
  + tsc 0; E2E 34/34 (fresh seed).
