# QA Sign-Off: S5-ADI-ARC-COHERENCE
# Author: Adi (QA Engineer, R&D)
# Date: 2026-07-11
# Task: S5-ADI-ARC-COHERENCE
# To: Ido (VP R&D)
# Status: PASS (all 3 Sami C2 tests PASS; regression clear)

---

## Verdict

PASS. All three Sami C2 coherence tests pass. Integration regression is clear.
This memo confirms the QA gate for S5-ADI-ARC-COHERENCE is GREEN.

---

## Sami C2 Test Results

### Test 1 -- C1-ARC-COHERENCE: Full 3-session arc coherence

Test file: apps/api/src/__tests__/arc-coherence.integration.spec.ts
Tests: C1-T1 through C1-T5

Setup: live-Postgres harness; userA; sessions 1 and 2 completed via ArcWriterService;
session-3 arc context loaded via ArcLoaderService.

- C1-T1: session-1 ArcSessionSummary written with correct userId/templateId. PASS
- C1-T2: session-2 ArcSessionSummary written; trust=0.58, openness=0.46, alliance=0.52
  (no clamping; all within ceiling). PASS
- C1-T3: session-3 arc context sessionNumber=2 (from session-2, NOT session-1 directly).
  Trust=0.58 -- confirmed not session-1 value (0.45). PASS
- C1-T4: accumulated state within arc delta config bounds; both sessions' deltas reflected. PASS
- C1-T5: session-3 context notableMomentsSummary contains session-2 content ("S2: work stress");
  does NOT contain session-1 content ("S1:"). Last-session-summary pattern confirmed. PASS

Overall Test 1: PASS

---

### Test 2 -- C2-INVENTED-FACTS: Compounding invented facts (Track-B gate)

Test file: apps/api/src/__tests__/arc-coherence.integration.spec.ts
Tests: C2-T1 through C2-T4

Setup: DIRECT DB SEED. ArcSessionSummary for sessionNumber=2 seeded with
notableMomentsSummary containing the controlled false fact "patient mentioned a sister"
-- a fact absent from the authored SimulationTemplate groundTruth.

- C2-T1: false fact present in loaded arc context notableMomentsSummary (loader reads seeded
  summary correctly). PASS
- C2-T2: false fact appears in patient context arc block, correctly labeled
  "context only, not ground truth". PASS
- C2-T3: false fact does NOT appear in guard prompt or guard ground-truth input. PASS
  This is the NO-GO assertion: the seeded confabulation is bounded to the arc context block
  and never promoted to authoritative ground-truth or guard model input.
- C2-T4: authored groundTruth has no mention of "sister" (test setup sanity). PASS

Overall Test 2: PASS. Track-B is NOT blocked on this test.

Architectural boundary confirmed: ArcSessionSummary.notableMomentsSummary is injected as
a "PRIOR SESSION CONTEXT -- context only, not ground truth" system block. It does not flow
into buildGuardPrompt(), which receives only the authored SimulationTemplate groundTruth.
The false fact appears only in the context block, not in the guard input.

---

### Test 3 -- C3-CEILING: Above-average student ceiling enforcement

Test file: apps/api/src/__tests__/arc-coherence.integration.spec.ts
Tests: C3-T1 through C3-T6

Setup: userC; session-1 PatientStateLog trust=0.65/openness=0.58/alliance=0.63 (within
ceiling); session-2 PatientStateLog trust=0.82/openness=0.72/alliance=0.85 (above ceilings).
ArcWriterService ceiling/floor log confirmed clamp:
  pre-clamp trust=0.820 openness=0.720 alliance=0.850
  post-clamp trust=0.700 openness=0.650 alliance=0.700

- C3-T1: session-3 arc context loaded; sessionNumber=2. PASS
- C3-T2: session-3 trustLevel=0.70 <= maxTrust=0.70. Clamped from 0.82. PASS
- C3-T3: session-3 opennessLevel=0.65 <= maxOpenness=0.65. Clamped from 0.72. PASS
- C3-T4: session-3 allianceScore=0.70 <= maxAlliance=0.70. Clamped from 0.85. PASS
- C3-T5: trustLevel=0.70 < 1.0. Patient retains resistance. PASS
- C3-T6: ArcSessionSummary row contains clamped values (not raw overflow). PASS

Overall Test 3: PASS. Sami C4 ceiling enforcement verified end-to-end (write -> clamp
-> persist -> load).

---

## Regression Status

All integration suites passed:

Suite                                  | Status
---------------------------------------|--------
arc-coherence.integration.spec.ts      | PASS (new, 15 tests)
arc.integration.spec.ts                | PASS (Gal's, existing)
authoring.integration.spec.ts          | PASS
simulation-turn.integration.spec.ts    | PASS
evaluation-debrief.integration.spec.ts | PASS
teacher-review-rbac.integration.spec.ts| PASS
support.integration.spec.ts            | PASS
credit-admin.integration.spec.ts       | PASS

Total: 8/8 suites | 77 PASS | 2 SKIP | 0 FAIL
(2 SKIP = CA-INT-002/003, supertest deferred per standing constraint -- no change)

Unit suite: 17/17 suites | 276 PASS | 8 SKIP | 0 FAIL
No regression on any unit test.

---

## Command used

pnpm --filter @aps/api test:integration
pnpm --filter @aps/api test

Both ran from:
C:\Users\Jecki\DEV\projects\eco-synthetic\projects\ai-patient-simulator\app

---

## Scope notes

- This run covers S5-ADI-ARC-COHERENCE only (Sami C2 suite).
- S5-ADI-ARC-E2E and S5-ADI-M6 are deferred per Ido instruction: depend on Noa UI
  work currently in flight. They run in a later pass.
- No code was patched. No engine or API files were modified. Test additions only.
- Gal's arc.integration.spec.ts (A1-A6) was not modified or duplicated.
- StubProvider not needed for the Sami C2 coherence assertions (ContextBuilder is a
  pure function; ArcLoaderService and ArcWriterService are tested against live Postgres).

---

## Gaps and flags

None. No structural gaps found. All three Sami C2 cases are covered by concrete assertions
against live Postgres. No issues to flag to Ido at this time.

ArcDeltaConfig is marked "PENDING ADAM REVIEW BEFORE PRODUCTION GO-LIVE" in the source.
Ceiling values (maxTrust=0.70, maxOpenness=0.65, maxAlliance=0.70) are engineering defaults
pending Adam's 2026-08-08 calibration review. This is a planned open item, not a QA blocker.

---

*Adi (QA Engineer) | S5-ADI-ARC-COHERENCE | 2026-07-11*

---

# QA Sign-Off Addendum: S5-ADI-ARC-E2E + S5-ADI-M6 (Pass 2)
# Author: Adi (QA Engineer, R&D)
# Date: 2026-07-11
# Status: PASS -- both items GREEN

---

## S5-ADI-ARC-E2E: E2E Arc Step Results

Script: apps/api/src/scripts/e2e-golden-path.mjs (steps 29-34 added)
Run command: node apps/api/src/scripts/e2e-golden-path.mjs

Baseline check (steps 1-28): 28/28 PASS (no regression; arc guard is live but
baseline steps unaffected -- student1 sessionNumber transitions verified clean).

Arc steps:

Step 29: arc session-1 attempt (sessionNumber=1) + finish -> COMPLETED.
  Result: PASS [login=200 create=201 sessionNumber=1 finish=COMPLETED]
  Note: student2 used (0 prior COMPLETED attempts on fresh DB). Student1 was used
  in baseline steps; using student2 avoids sessionNumber interference.

Step 30: session-1 arc summary (indirect).
  Result: PASS [arc1 finishedStatus=COMPLETED]
  Variant shipped: INDIRECT. No HTTP endpoint exposes ArcSessionSummary.
  COMPLETED confirms arc writer was triggered. sessionNumber=2 in step 31
  confirms completedCount incremented. Direct row check: arc-coherence.integration.spec.ts C1-T1.

Step 31: arc session-2 attempt-create -> 2xx, sessionNumber=2 (count=1, max=3).
  Result: PASS [201 sessionNumber=2]

Step 32: session-2 finish -> COMPLETED (summary indirect; step-33 sessionNumber=3 confirms).
  Result: PASS [201 status=COMPLETED]
  Variant shipped: INDIRECT (same reasoning as step 30). Direct row: C1-T2.

Step 33: arc session-3 attempt-create -> 2xx, sessionNumber=3 (count=2, max=3).
  Result: PASS [201 sessionNumber=3]
  Implementation note: session 3 also finished within step-33 code block so
  completedCount=3 before step 34 cap test.

Step 34: arc session-4 blocked -> 403 ARC_COMPLETE (count=3, max=3).
  Result: PASS [403 code=ARC_COMPLETE]

E2E TOTAL: 34/34 PASS.

---

## S5-ADI-M6: Coverage Verification

### Gal's m6-publish.spec.ts

Both publish-gate error codes covered:
- GROUND_TRUTH_REQUIRED: tests P1 (empty facts=[], doNotInvent=[]) and P2 (null GT). CONFIRMED.
- RUBRIC_PROVISIONAL: tests P3 (null rubricLastReviewedAt) and P4 (GT updated after review). CONFIRMED.
Additional tests P5-P11 cover success path and getTemplate/markRubricReviewed. No gaps.

### Noa's M6.authoring.test.tsx

All three envelope acceptance states covered:
- Warn state: test 1 (Navigate Step 4 with GT empty; warning banner shown; Continue anyway). CONFIRMED.
- GROUND_TRUTH_REQUIRED block: test 5 (publish error message correct). CONFIRMED.
- RUBRIC_PROVISIONAL block: test 6 (publish error message correct). CONFIRMED.
6/6 tests present per Noa's delivery note.

### Integration suite (authoring.integration.spec.ts)

Was missing: publish-with-empty-groundTruth at service level through live-Postgres.
Added: describe block "[integration] S5-ADI-M6: publishRubric blocks with GROUND_TRUTH_REQUIRED
when GT is empty" -- one test: creates template (stub GT empty), generates DRAFT rubric,
calls publishRubric, asserts 422 GROUND_TRUTH_REQUIRED. Additive only; Gal's tests untouched.
Result: PASS.

---

## Suite Totals After Pass 2

Suite                                  | Tests       | Status
---------------------------------------|-------------|--------
E2E golden path                        | 34/34       | PASS
arc-coherence.integration.spec.ts      | 15 PASS     | PASS (unchanged from pass-1)
arc.integration.spec.ts                | see below   | PASS
authoring.integration.spec.ts          | +1 new test | PASS (new M6 test green)
simulation-turn.integration.spec.ts    | unchanged   | PASS
evaluation-debrief.integration.spec.ts | unchanged   | PASS
teacher-review-rbac.integration.spec.ts| unchanged   | PASS
support.integration.spec.ts            | unchanged   | PASS
credit-admin.integration.spec.ts       | unchanged   | PASS

Integration total: 8/8 suites | 78 PASS | 2 SKIP | 0 FAIL
(+1 vs pass-1; 2 SKIP = CA-INT-002/003, supertest deferred per standing constraint)

API unit suite: 17/17 suites | 276 PASS | 8 SKIP | 0 FAIL (no change)
Web unit suite: 7/7 suites | 28 PASS | 0 SKIP | 0 FAIL (no change)

---

## Flags

None. No structural defects found in pass 2. No regressions.

Arc guard interference confirmed NOT a regression: baseline steps 1-28 unaffected.
Student1's step-25a attempt-create now gets sessionNumber=2 (new arc behavior on
arc-capable template) but step-25a check only asserts 2xx status -- no assertion
broken. Documented here for traceability.

Step 30/32 indirect variant: chosen because the E2E script is HTTP-only and
no endpoint exposes ArcSessionSummary. This is the accepted variant per envelope.

---

*Adi (QA Engineer) | S5-ADI-ARC-E2E + S5-ADI-M6 | 2026-07-11*
