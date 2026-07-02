# APS Sprint 1 Test Execution Results
# Author: Adi (QA Engineer) | Date: 2026-06-30 | Tasked by: Ido (VP R&D) via Eco
# Status: INTERNAL ONLY

---

## Verdict: CONDITIONAL PASS (stub-only engine layer)

86 tests written and executed. 86/86 PASS. Zero failures.
Coverage on tested units: auth.service.ts 100%, roles.guard.ts 97%, engine packages 88%.
All above the 80% floor.

The conditional is: the simulation service, org service, JWT strategy, and HTTP controller
layers have zero integration coverage. These require Postgres (Shir's DB) and are deferred
to Sprint 3 per the QA plan.

---

## Files Written

packages/engine-test-harness/src/__tests__/input-gate.spec.ts     (13 tests)
packages/engine-test-harness/src/__tests__/state-updater.spec.ts  (17 tests)
packages/engine-test-harness/src/__tests__/guard-runner.spec.ts   (13 tests)
packages/engine-test-harness/src/__tests__/turn-pipeline.spec.ts  (17 tests)
apps/api/src/__tests__/auth.spec.ts                                (12 tests)
apps/api/src/__tests__/rbac.spec.ts                                (11 tests)

Jest config added:
packages/engine-test-harness/jest.config.cjs
apps/api/jest.config.cjs

---

## Test Run Summary

Suite                          | Tests | Result  | Coverage (lines)
-------------------------------|-------|---------|------------------
input-gate.spec.ts             |    13 | PASS    | engine 88.46%
state-updater.spec.ts          |    17 | PASS    | (same run)
guard-runner.spec.ts           |    13 | PASS    | (same run)
turn-pipeline.spec.ts          |    17 | PASS    | (same run)
auth.spec.ts                   |    12 | PASS    | auth 100%
rbac.spec.ts                   |    11 | PASS    | rbac 97%
TOTAL                          |    86 | 86 PASS |

---

## 15-Aug Rehearsal Criteria Coverage

Criterion A (patient state coherence / delta bounds): COVERED by stub tests.
  - state-updater: 17 tests verify delta cap, direction rules, clamp, all dimensions.
  - turn-pipeline: delta-cap and state-snapshot-per-turn tests.
  - NOT yet covered: DB persistence of PatientStateLog (needs Postgres -- Sprint 3).

Criterion B (guard fires on 3 engineered violations): COVERED structurally by stub tests.
  - guard-runner: FlipGuardStubProvider exercises FAIL-then-PASS (REGENERATE) and
    FAIL-FAIL (BLOCKED) paths. Three Criterion B scenario tests present.
  - NOT yet covered: real LLM guard model evaluating actual clinical text -- out of scope
    until go-live (owner directive: no real LLM until production go-live).

Criterion C (analyser classification rate >= 70%, clinical advisor judged): NOT COVERED.
  - Requires real LLM + clinical advisor. Explicitly deferred to go-live.

Criterion D (evaluation output coherence, clinical advisor judged): NOT COVERED.
  - No evaluator endpoint implemented in Sprint 1. Sprint 3 item.

Criterion E (no data loss on interruption/resume): PARTIAL.
  - State snapshot per turn tested structurally (turn-pipeline). DB persistence (the actual
    write-read round trip) needs Postgres. Sprint 3.

Criterion F (credit hard-limit block): COVERED.
  - input-gate: zero credit blocks with CREDIT_HARD_LIMIT reason.
  - turn-pipeline: gate-blocked path returns no state, no response, zero tokens.

Criterion G (support assistant cannot access patient state): COVERED at RBAC layer.
  - rbac: PROGRAMME_MANAGER role rejected on TEACHER/SYSTEM_ADMIN endpoints.
  - TH-04 DB query log check (support prompt intercept) requires Gal's test hook -- deferred.

---

## Open Blockers (DB-gated -- require Postgres)

B1: SimulationService.processTurn end-to-end (PatientStateLog write + Message write +
    UsageLog + Attempt update). Full TC-STATE-01, TC-STATE-04, TC-STATE-06, TC-RECOV-01.

B2: Auth HTTP layer (JWT strategy, invite expiry TC-AUTH-03). JwtStrategy.validate
    has zero coverage -- needs live NestJS test app.

B3: Credit deduction chain (TC-CREDIT-04, TC-CREDIT-05): CreditLedger DB interaction.

B4: Teacher state-log read endpoint (TC-ROLE-03 full HTTP path).

B5: All Playwright E2E (TC-RTL, TC-DICT, TC-DEBRIEF, TC-SUP). Requires Shir's staging env.

All B1-B5 are Sprint 3 items per the QA plan. No blockers to Sprint 1 milestone.

---

## Note on Test Infrastructure

ts-jest deprecation warnings (globals config style) are cosmetic. Tests run and pass.
Sprint 2 task: migrate jest.config.cjs to the modern transform syntax to silence warnings.

---

*Adi (QA Engineer) | 2026-06-30 | Results verified by running the suite*
