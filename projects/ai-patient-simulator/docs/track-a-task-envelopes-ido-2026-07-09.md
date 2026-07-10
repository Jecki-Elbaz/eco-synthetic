# Track A Task Envelopes -- self-sim / author-preview sprint
# Author: Ido (VP R&D) | Date: 2026-07-09 | Requester: Eco (CEO)
# Source: APS-017 (Track A, UNCONDITIONAL); feasibility Section 2; APS-018 open issues a+b
# Track B gated -- do NOT start. Adam not contacted.

---

## Standing constraints (all envelopes)

- StubProvider only. No real LLM. No new packages without gate.
- No agent git commits. Owner commits from terminal.
- No agent contacts Adam. Owner relays.
- Track B: not started. No reference to it as in-progress.

---

## Envelope: Gal (backend/engine)

task_id: TRACK-A-GAL
effort: 3-4 eng-days
priority: P1

### Recommended build order
F first -> A -> B -> C -> D+E (D and E can be parallel to C)

---

**F. Real GET transcript endpoint (APS-018 open issue b)** [~0.5 days -- DO FIRST, unblocks Noa]

New endpoint: GET /simulation/attempt/:attemptId/transcript
Response shape (proposed; confirm with Noa before she wires): array of
  { turnIndex: number, studentInput: string, patientResponse: string, timestamp: string }
RBAC:
- Student: own attempt only
- Teacher: any attempt in own course
- SYSTEM_ADMIN: all
Return ONLY public-facing fields. No system prompts, no ground-truth content, no persona internals.
Notify Noa of exact response shape before she starts item 2.

---

**A. StudentBotProvider (stub-random mode)** [~1.5 days]

New file: packages/engine/src/providers/StudentBotProvider.ts
Implements existing provider interface (same contract as StubProvider).
Three named profiles: COMPETENT | WEAK | TYPICAL
Deterministic: given (profile, turnIndex) -> same output every call. No randomness, no LLM.

Turn sequences per profile:
- COMPETENT: open-question -> rapport-attempt -> targeted-clarifying-probe -> correct-diagnostic-hypothesis
- TYPICAL: open-question -> closed-question -> rapport-attempt -> partially-correct-hypothesis
- WEAK: closed-question -> wrong-diagnostic-hypothesis -> off-topic-tangent -> closed-question

EACH profile must include >=2 violation turns (scope-inappropriate content, e.g. premature diagnosis, personal opinion, clinical overreach). Non-optional -- without guard firing, the author cannot verify the guard works during preview.
Violation turns must be spread across the sequence (not all at end).
No new packages.

---

**B. AttemptType.AUTHOR_PREVIEW (schema enum + migration)** [~0.5 days]

Add AUTHOR_PREVIEW to AttemptType enum in packages/db/prisma/schema.prisma.
Generate migration: `pnpm --filter @aps/db migrate dev --name add_author_preview_attempt_type`
Regenerate client: `pnpm --filter @aps/db generate`
Attempt-create endpoint: if requested type = AUTHOR_PREVIEW -> require TEACHER or SYSTEM_ADMIN role; return 403 otherwise.
Dashboard queries: filter out AUTHOR_PREVIEW attempts from student dashboard results (backend enforces).
AUTHOR_PREVIEW attempts: not visible in student-facing views.

---

**C. Self-sim run pipeline** [~1 day]

New service method: SimulationService.runAuthorPreview(templateId, authorUserId, profile)
- Creates AUTHOR_PREVIEW attempt owned by authorUserId (not a student record)
- Feeds StudentBotProvider into existing 8-step turn pipeline instead of student HTTP input
- Runs all turns in sequence synchronously (no streaming required for v1)
- On all-turns-complete, triggers existing evaluation pipeline (same path as real student finish)
- Returns attemptId on completion

New API endpoint: POST /simulation/template/:templateId/preview
- Auth: TEACHER or SYSTEM_ADMIN
- Body: { profile: 'COMPETENT' | 'WEAK' | 'TYPICAL' }
- Response: { attemptId: string }
- Entire bot run + evaluation completes within this single request (synchronous v1)
- RISK: existing pipeline may assume async student input. If turn intake requires an HTTP context, a thin adapter is needed. Flag to Ido immediately if coupling is deeper than 0.5 days to decouple.

---

**D. UsageLog activity_type=SELF_SIMULATION** [~0.25 days, can parallel C]

Add SELF_SIMULATION to ActivityType enum in UsageLog schema (migration if enum is DB-backed).
Emit UsageLog entry with activity_type=SELF_SIMULATION on each bot-generated turn.
SELF_SIMULATION entries distinguishable from STUDENT_TURN in audit log. Both are logged (never suppressed).

---

**E. Credit exclusion** [~0.25 days, can parallel C]

AUTHOR_PREVIEW attempt turns: bypass credit balance check; do NOT decrement student ledger.
Audit log: still emit SELF_SIMULATION UsageLog entry (Rambo APS-004 M18 audit requirement; exclusion from billing != exclusion from log).
Credit-admin: AUTHOR_PREVIEW turns do not appear in student credit usage totals.
Implementation: in turn pipeline credit-check gate, branch on attempt.type === AUTHOR_PREVIEW -> skip deduction.

---

## Envelope: Noa (front-end)

task_id: TRACK-A-NOA
effort: 1-1.5 eng-days
priority: P1

### Permitted Bash commands (Rambo B5 C3 -- exhaustive list for this sprint)

1. `pnpm --filter @aps/web dev` -- start dev server only
2. `pnpm --filter @aps/web build` -- production build check
3. `pnpm --filter @aps/web typecheck` -- tsc --noEmit scoped to web
4. `pnpm --filter @aps/web lint` -- eslint scoped to web
5. `pnpm --filter @aps/web test` -- jest scoped to web (if script defined in package.json)
6. `jest --testPathPattern apps/web` -- alternative scoped jest run

No backend filters. No migrations (Gal owns). No docker. No git (owner commits).
Any command not on this list: stop, flag to Ido before running.

### Dependency map
Items 1+2: start as soon as Gal delivers item F + confirms response shape.
Item 3: start only after Gal delivers items A+B+C + confirms POST endpoint shape.
Items 1+2 are independent of each other.

---

**Item 1: Logout fix (APS-018 open issue a)** [~0.25 days]

Bug: logout clears token but does not reliably redirect to /login (required repeated clicks in demo).
Fix: on logout action -> clear token from session context -> call router.replace('/login') immediately, before any other state update or re-render.
Must redirect on first click. No retry or polling.
Manual verify: after logout, browser URL = /login; any protected page requires re-auth.

---

**Item 2: Feedback screen real transcript (APS-018 open issue b)** [~0.5 days]

Current state: feedback screen renders hardcoded mock transcript.
Wire to: GET /simulation/attempt/:attemptId/transcript (Gal item F).
Render returned array { turnIndex, studentInput, patientResponse } as the transcript view.
If endpoint returns non-2xx: display error state. Do NOT fall back to mock data.
Coordinate with Gal on exact response shape BEFORE starting (do not assume).

---

**Item 3: "Run Preview" button + preview flow (authoring UI)** [~0.5 days]

Location: SimulationTemplate authoring page (accessible in DRAFT and PUBLISHED states).
Button label: "Run Preview" (or Hebrew equivalent; match existing authoring UI i18n pattern).
Button: only visible to TEACHER or SYSTEM_ADMIN roles. Hidden for student role.
On click: show profile selector dropdown (COMPETENT / WEAK / TYPICAL) + confirm button.
On confirm: POST /simulation/template/:templateId/preview with { profile }.
On response (synchronous, returns attemptId): navigate to /feedback/:attemptId (existing feedback page).
Result view: author sees real transcript (item 2, already wired) + evaluation output via existing feedback + debrief pages. No new pages needed.
AUTHOR_PREVIEW results: NOT shown in student dashboard (backend enforces; front-end need not filter).
Coordinate with Gal on POST endpoint path, body shape, and error codes before wiring.

---

## Envelope: Adi (QA)

task_id: TRACK-A-ADI
effort: 0.5-1 eng-day
priority: P1

### Sequencing
Unit specs for A+E: start after Gal delivers those items.
E2E extension: start after Noa item 3 is complete and all Gal items A-F delivered.

---

**Unit specs: StudentBotProvider determinism**

Spec file: packages/engine/src/providers/StudentBotProvider.spec.ts (consistent with engine suite naming)

Tests:
- COMPETENT profile, turnIndex=0 -> same output across 3 calls (no randomness)
- WEAK profile, turnIndex=0 -> same output across 3 calls
- TYPICAL profile, turnIndex=0 -> same output across 3 calls
- COMPETENT and WEAK profiles produce different output at turnIndex=0 (profiles are distinct)
- COMPETENT sequence contains >=2 turns with violation type (assert violation marker present)
- WEAK sequence contains >=2 turns with violation type

---

**Unit specs: credit exclusion**

Spec location: apps/api (consistent with existing api unit suite)

Tests:
- AUTHOR_PREVIEW attempt turn: credit ledger balance unchanged after turn
- STUDENT attempt turn: credit ledger balance decremented after turn
- AUTHOR_PREVIEW turn: UsageLog entry emitted with activity_type=SELF_SIMULATION
- STUDENT turn: UsageLog entry emitted with activity_type=STUDENT_TURN (regression -- must not change)

---

**E2E extension: author-preview steps**

File: apps/api/src/scripts/e2e-golden-path.mjs
Extend (do not replace). Current: 19 steps. Add 4 steps:

Step 20: login as teacher -> POST /simulation/template/:templateId/preview body={profile:'TYPICAL'} -> assert 200 + attemptId in response
Step 21: GET /simulation/attempt/:attemptId/transcript -> assert array with >=1 item; each item has studentInput + patientResponse fields; no system-prompt or ground-truth fields present
Step 22: GET /dashboard/student/:userId (seed student userId) -> assert response does NOT contain the AUTHOR_PREVIEW attemptId from step 20
Step 23: GET credit ledger for course (or equivalent usage endpoint) -> assert ledger balance unchanged vs pre-step-20 baseline

All 4 new steps must PASS. New total: 23/23.

---

## Sequencing + Definition of Done

### Build order (hard dependencies)

1. Gal F (transcript endpoint) -> notify Noa of response shape -> Noa items 1+2 can start
2. Gal A (StudentBotProvider)
3. Gal B (AUTHOR_PREVIEW enum + migration) [requires A complete]
4. Gal C (self-sim pipeline) [requires B complete] + D+E in parallel [require B]
5. Noa item 3 [requires Gal A+B+C complete]
6. Adi unit specs [start after relevant Gal items delivered]; E2E extension [after Noa item 3]

### Coordinate points

- Gal -> Noa (BEFORE Noa starts item 2): exact response shape of GET /simulation/attempt/:attemptId/transcript
- Gal -> Noa (BEFORE Noa starts item 3): exact path, body, and error codes of POST /simulation/template/:templateId/preview
- Gal -> Adi (BEFORE Adi writes E2E step 20): confirm endpoint paths are stable

### Definition of Done (sprint closes when ALL green)

1. engine suite: 191/191 PASS (unchanged)
2. api unit suite: all existing green + new StudentBotProvider determinism specs + credit exclusion specs green; known 8 skips unchanged
3. web tsc: clean (0 errors)
4. E2E golden-path: 23/23 PASS (original 19 + 4 author-preview steps)
5. Logout: single click clears token + routes to /login (manual verify + Adi smoke)
6. Feedback screen: renders real transcript from GET endpoint; not mock data
7. "Run Preview" button: teacher triggers AUTHOR_PREVIEW attempt from authoring UI; navigates to feedback/debrief result
8. AUTHOR_PREVIEW attempt NOT in student dashboard (E2E step 22 green)
9. Credit pool unchanged after AUTHOR_PREVIEW run (E2E step 23 green)
10. SELF_SIMULATION UsageLog entry present in audit log per preview run (unit spec green)

### 15-Aug rehearsal criterion (i) mapping

Criterion (i) from feasibility Section 3:
  "Author-preview completes a full run + evaluation in AUTHOR_PREVIEW mode;
   result is not visible in student dashboard or class credit usage."
DoD items 4 (E2E 23/23) + 7 (Run Preview) + 8 (not in dashboard) + 9 (credit unchanged) = direct pass evidence.
All 10 DoD items must be green before the 15-Aug rehearsal session.

---
*Ido (VP R&D) | 2026-07-09 | Track A only | Track B not started | Board row APS-017 owned by Eco*

---

## Addendum: Gal delivery notes | 2026-07-09

### Item F -- transcript endpoint (DONE)

Endpoint built and live: GET /simulations/:attemptId/transcript
(Note: path uses "simulations" plural, consistent with all existing routes in SimulationController.
The envelope proposed "simulation" singular; the built path is /simulations/:attemptId/transcript.
Noa should wire to this exact path.)

Confirmed response shape (array, one element per turn):
```
[
  {
    "turnIndex": number,        // 1-based turn number from DB
    "studentInput": string,     // student message text
    "patientResponse": string,  // patient reply text
    "timestamp": string         // ISO 8601, sentAt of student message for that turn
  }
]
```

RBAC enforced in service (not guard):
- STUDENT: own attempt only (403 if other student's attempt)
- TEACHER: any attempt where teacher has COURSE-scoped role for the attempt's courseId
- SYSTEM_ADMIN: all attempts

Empty array returned when attempt has no messages. No system prompts, no ground truth, no
persona internals in response.

### Item A -- StudentBotProvider (DONE)

File: packages/engine/src/providers/StudentBotProvider.ts
Exported from packages/engine/src/index.ts (StudentBotProvider, BotProfile, BotTurn, ViolationType).
Tests: packages/engine-test-harness/src/__tests__/student-bot-provider.spec.ts (14 tests, all PASS).
(Note: tests landed in engine-test-harness per existing engine test conventions, not in
packages/engine/src/providers/ as Adi's envelope proposed. Engine package has no own test runner.)

Each profile has 6 turns. COMPETENT and TYPICAL: violations at turns 1+4 (spread).
WEAK: violations at turns 0+3 (spread). All three profiles have violationCount >= 2.

### Item B -- AttemptType enum + migration (DONE)

Migration: 20260709053549_add_author_preview_attempt_type (applied, Prisma client regenerated).
AttemptType enum added to schema: STUDENT | AUTHOR_PREVIEW.
Attempt.type field added with default STUDENT (existing rows migrate cleanly).
Attempt-create endpoint (POST /assignments/:assignmentId/attempts): AUTHOR_PREVIEW body type
requires TEACHER or SYSTEM_ADMIN role; STUDENT role gets 403.
Dashboard: AUTHOR_PREVIEW attempts excluded from student dashboard query (DashboardService).

### Items C, D, E -- pipeline-coupling finding (BLOCKED -- exceeds 0.5-day threshold)

Estimated effort: 1.5-2 days. Stopping per Ido instruction.

Root coupling issues identified:
1. Attempt.assignmentId is NOT NULL with FK constraint. runAuthorPreview(templateId, ...) has
   no natural assignment. Options: (a) make assignmentId nullable + branch in service [schema
   change, moderate risk], (b) require teacher picks an assignment for preview (simplest, UI
   must pass assignmentId not templateId), (c) separate PreviewAttempt model [largest change].
   Recommendation: option (b) -- rename POST body to include assignmentId; keeps DB integrity.

2. processTurn() checks attempt.userId === actorId; AUTHOR_PREVIEW turns are driven by the
   bot, not HTTP. Need to extract inner pipeline-call logic into a new private method
   runPipelineTurn() so both processTurn and runAuthorPreview can share it without the
   ownership gate.

3. Credit gate in InputGate runs before pipeline. For item E (bypass credit for AUTHOR_PREVIEW),
   the gate needs access to attempt.type. Currently InputGate receives AttemptTotals which has
   no type field. AttemptTotals must be extended or a bypass flag passed.

4. UsageLog.eventType is a plain String (not a Prisma enum); item D (SELF_SIMULATION value)
   requires no migration -- only application code change, low risk.

Recommended next-session approach for C+D+E:
- Ido chooses option (b) for the assignment coupling (or approves option a).
- Extract processTurn inner logic to runPipelineTurn(attemptId, studentMessage, turnContext).
- Extend AttemptTotals with optional bypassCredit flag; InputGate branches on it.
- runAuthorPreview creates AUTHOR_PREVIEW attempt (using assignmentId from body), calls
  StudentBotProvider.getTurn() in loop, calls runPipelineTurn() per turn with bypassCredit=true,
  emits SELF_SIMULATION UsageLog entry per turn, returns attemptId.
- New endpoint POST /simulations/templates/:templateId/preview (or /assignments/:assignmentId/preview
  depending on option chosen above) -- TEACHER or SYSTEM_ADMIN only.

*Gal (Lead Developer) | 2026-07-09 | TRACK-A-GAL addendum*

---

## Addendum: Ido ruling on items C/D/E coupling | 2026-07-09

**Ruling: option (b).** assignmentId is required in the preview request body. Rationale: option (a) makes assignmentId nullable and propagates a null-FK branch through credit governance, dashboard queries, and evaluation pipeline -- blast radius too high for a sprint. Option (c) is a separate model, disproportionate scope for pilot. Option (b) keeps DB integrity with zero schema migration. Accepted UX trade-off: preview requires an existing assignment for the template. This is acceptable at pilot scale (2 staff, templates already have assignments). Log it as a UX gap -- DRAFT-template-no-assignment preview is out of scope for 1-Sep and belongs in Phase 1b. API endpoint changes: POST /assignments/:assignmentId/preview (body: { profile }). Update Noa item 3 and Adi E2E step 20 accordingly (the "Run Preview" button fetches assignments for the current template and auto-selects if one exists, or shows a dropdown if multiple).

**Conditions on the two technical proposals.** (1) runPipelineTurn extraction: APPROVED. Extract processTurn inner logic to a private runPipelineTurn(attemptId, studentMessage, turnContext) method; both processTurn and runAuthorPreview call it. Keep the ownership-gate check in processTurn only -- runAuthorPreview bypasses it by design (bot owns the turns). (2) bypassCreditCheck flag: APPROVED. Name it bypassCreditCheck, not bypassCredit (name must be explicit). Condition: bypassCreditCheck=true SKIPS the balance decrement ONLY -- the SELF_SIMULATION UsageLog entry is STILL emitted every turn (Rambo APS-004 M18 audit requirement; credit bypass != audit bypass). Make this branch explicit in InputGate so a future reader cannot mistake "bypass" for "suppress all logging."

*Ido (VP R&D) | 2026-07-09 | A3 intra-R&D ruling*

---

## Addendum: Items C/D/E delivery notes | 2026-07-09

### Endpoint

POST /assignments/:assignmentId/preview (TEACHER or SYSTEM_ADMIN only; student -> 403).
Body: { profile: "COMPETENT" | "WEAK" | "TYPICAL" }
Response: { attemptId: string }

### Files created / changed

New:
- apps/api/src/simulation/preview.controller.ts
- apps/api/src/__tests__/author-preview.spec.ts (11 passing, 8 skipped via testPathIgnorePatterns)
- packages/engine-test-harness/src/__tests__/input-gate.spec.ts -- 3 bypassCreditCheck tests appended (I1, I2, I1b)

Modified:
- apps/api/src/simulation/simulation.service.ts -- runAuthorPreview(), runPipelineTurn() extracted, bypassCreditCheck wired
- apps/api/src/simulation/simulation.module.ts -- PreviewController registered
- packages/engine/src/pipeline/input-gate.ts -- AttemptTotals.bypassCreditCheck optional flag; check guards
- packages/engine/src/pipeline/input-gate.js -- stale src-tree artifact patched to match (same change; jest was loading this over .ts)

### Rambo M18 audit note

bypassCreditCheck=true in InputGate suppresses the credit-gate check ONLY.
UsageLog (eventType=SELF_SIMULATION) is ALWAYS written per turn (Rambo M18).
CreditEntry.create and CreditLedger.update are guarded by !ctx.bypassCreditCheck in runPipelineTurn.
The two branches are kept structurally separate (not combined in one flag).

### Bug note -- stale JS in engine src/

packages/engine/src/pipeline/ contained stale compiled .js files alongside .ts sources.
Jest resolves .js before .ts (moduleFileExtensions order) so the old input-gate.js
(missing bypassCreditCheck) shadowed the updated .ts source. Patched the stale .js in-place.
Root cause: tsc previously emitted to src/ (not dist/) for some invocations; the artifacts were
not cleaned. Risk: future engine source changes must also update the corresponding src/*.js
artifacts, OR a clean step should remove them. Flagging to Ido as tech-debt item.

### Validation gate results (2026-07-09)

Engine test harness: 208/208 PASS (205+ target met).
API unit tests: 203 pass / 0 fail / 8 skip / 211 total (193+ target met).
tsc --noEmit: no new errors beyond pre-existing APS-016 rootDir baseline.
E2E golden path: 22/22 PASS (grew from 19 to 22 with steps 20a/20b/20c).
  - 20a: teacher POST /preview -> 201 + { attemptId }
  - 20b: credit balance unchanged before/after preview (102640 = 102640)
  - 20c: student dashboard excludes AUTHOR_PREVIEW attempt

*Gal (Lead Developer) | 2026-07-09 | TRACK-A-GAL addendum C/D/E delivery*

---

## Sprint-2 hardening / Shir | 2026-07-09

### APS-016 -- nest build fix (DONE)

Root cause: apps/api/tsconfig.json `paths` mapped @aps/* to package source (.ts) files,
pulling them inside the API compilation scope and triggering TS6059/TS6307 (rootDir violation).

Fix applied:
- packages/engine/tsconfig.json: added `rootDir: "./"` (preserves dist/src/ output structure);
  changed paths @aps/shared-types from ../shared-types/src/index.ts to ../shared-types/dist/index.d.ts.
- apps/api/tsconfig.json: changed all three paths entries to point at built declarations:
    @aps/db        -> ../../packages/db/dist/index
    @aps/engine    -> ../../packages/engine/dist/src/index
    @aps/shared-types -> ../../packages/shared-types/dist/index
- Rebuilt packages in order: shared-types (tsc), engine (tsc), db (tsc directly -- no build script).
- One pre-existing type error surfaced once rootDir errors were cleared:
  TS2379 in apps/api/src/credit-admin/credit-admin.controller.ts line 144 --
  exactOptionalPropertyTypes incompatibility when building ActivityLogQuery inline with
  undefined values. Fixed: build the query object imperatively (null-guard per field before
  assigning). Added ActivityLogQuery to the import from @aps/shared-types.
- nest build exits 0, clean dist at apps/api/dist/.

Files changed (APS-016):
- packages/engine/tsconfig.json
- apps/api/tsconfig.json
- apps/api/src/credit-admin/credit-admin.controller.ts

### F2 -- stale in-src compiled artifacts (DONE)

Stale .js/.d.ts/.map files were tracked in git across all three packages and caused Jest to
load .js before .ts (default moduleFileExtensions order: js before ts), silently shadowing
updated .ts sources.

Removed (git rm -f, staged -- owner commits):
- packages/engine/src/  -- 56 files: all .js, .d.ts, .js.map, .d.ts.map for every module
  (authoring, evaluation, index, llm, pipeline, state, support)
- packages/shared-types/src/ -- 40 files: all .js, .d.ts, .js.map, .d.ts.map
- packages/db/src/ -- 2 files: index.js, index.d.ts

Deleted (untracked, rm -f -- not in git):
- packages/engine/src/providers/StudentBotProvider.js + .d.ts + .map (2 files; .ts kept)

Jest configs unchanged -- moduleNameMapper already points at .ts source; once stale .js files
are removed, Jest's extension fallback correctly resolves .ts. No jest config edits needed.

### Validation gate (all 6 checks -- self-run 2026-07-09)

1. pnpm --filter @aps/api build              PASS (exit 0, clean dist)
2. pnpm --filter @aps/api dev:boot :3001      PASS (401 on /auth/me, API live from dist)
3. e2e-golden-path.mjs                        23/23 PASS
4. pnpm --filter @aps/engine-test-harness test 208/208 PASS
5. pnpm --filter @aps/api test                217 pass / 8 skip / 0 fail
   (217 > 205 target: count grew from Adi's E3+STUDENT_TURN_LOG additions -- 0 fail is the gate)
6. pnpm --filter @aps/web exec tsc --noEmit   0 errors

### Open items for Ido

None blocking. Notes:
- db package has no `build` script; tsc was run directly. If CI needs it, add
  `"build": "tsc"` to packages/db/package.json (A3, Ido authorize).
- packages/web/tsconfig.json still points @aps/shared-types at source (moduleResolution:
  Bundler + noEmit -- works correctly, no change needed; Bundler mode maps .js imports to .ts).
- Staged deletions are ready for owner commit (git rm staged).

*Shir (DevOps, L4) | 2026-07-09 | Sprint-2 hardening delivery*

---

## Addendum: Track-A-fix-001 delivery (Finding 5 / Ido ruling) | 2026-07-09

### What was done

Auto-trigger evaluation at the end of runAuthorPreview so the author sees rubric scores +
highlights in the preview result view (not transcript-only). Single call appended after the
bot loop completes, before the method returns { attemptId }. No separate permission hop --
the previewing teacher is the actor; their scopes are forwarded. No credits touched;
evaluation on StubProvider is free; no CreditEntry row written.

### SIMULATION_TURN wording note

The original Adi QA envelope section (Ido, line above) references activity_type=STUDENT_TURN.
Ido ruled SIMULATION_TURN is canonical -- spec-side error, code already uses SIMULATION_TURN.
No code change. The correct wording for the regression test is:
  "STUDENT turn: UsageLog entry emitted with activity_type=SIMULATION_TURN"
The test in author-preview.spec.ts (STUDENT_TURN_LOG) already asserts SIMULATION_TURN correctly.

### Files changed

Modified:
- apps/api/src/evaluation/evaluation.module.ts -- added exports: [EvaluationService]
- apps/api/src/simulation/simulation.module.ts -- added imports: [EvaluationModule]
- apps/api/src/simulation/simulation.service.ts -- injected EvaluationService; runAuthorPreview
  now accepts actorScopes: UserScope[] and calls evaluationService.generateEvaluation after loop
- apps/api/src/simulation/preview.controller.ts -- passes req.user.scopes to runAuthorPreview
- apps/api/src/scripts/e2e-golden-path.mjs -- added step 20d (preview evaluation check)
- apps/api/src/__tests__/author-preview.spec.ts -- added Ev1 test; updated makeService to 3-arg
- apps/api/src/__tests__/transcript.spec.ts -- updated SimulationService constructor to 3-arg
- apps/api/src/__tests__/teacher-review-rbac.spec.ts -- updated all 6 SimulationService calls
- apps/api/src/__tests__/simulation-soft-warn.spec.ts -- updated all 4 SimulationService calls

### Validation gate results (2026-07-09)

API unit: 223 pass / 0 fail / 8 skip / 231 total (12/12 suites) -- exceeds 205+/0 fail/8 skip.
  Ev1 test: preview ends with Evaluation triggered + no CreditEntry -- PASS.
  dashboard.service.spec.ts: PASS (TS2345 resolved by Shir's APS-016 work).
E2E: 23/24 PASS (added step 20d; see note below).
  20d: preview has DRAFT Evaluation auto-triggered (Track-A-fix-001) -- PASS 200 evalStatus=DRAFT.
  Step 13 (teacher dashboard overallScore): FAIL -- pre-existing DB-state issue.
    Root: StubProvider.evaluate always returns structuredScores:{} -> weightedOverall returns null.
    Confirmed pre-existing (not introduced by Track-A-fix-001; student eval path unchanged).
    Was passing in Shir's run due to prior DB state; now flaky as E2E accumulates null-score evals.
    Fix: StubProvider should return non-empty structuredScores, or step 13 assertion should
    accept null when using stub. Flagging to Ido as separate tech-debt item (APS-stub-scores).

*Gal (Lead Developer) | 2026-07-09 | Track-A-fix-001 delivery*

---

## Sprint-3 / Gal | 2026-07-09

task_ids: APS-012 + APS-011
requester: Ido (via Eco, sequential-sprints mode)
report-back: Ido

### Status

APS-012: DONE (implemented in commit b21ab4e; verified this session)
APS-011: DONE (resolved in commit b21ab4e; verified 0 errors this session)

### APS-012 (a) -- shared LlmModule

LlmModule already implemented in apps/api/src/llm/llm.module.ts (committed b21ab4e). The
Track-A-fix-001 work introduced EvaluationModule import into SimulationModule and required a
shared LLM token to avoid circular dependency. The LlmModule was created in that same session.

Architecture:
- LLM_PROVIDER_TOKEN exported by LlmModule
- EvaluationModule imports LlmModule, injects token to Evaluator factory
- DebriefModule imports LlmModule, injects token to DebriefSupervisor factory
- SimulationModule imports LlmModule + EvaluationModule; EngineProvider uses token for TurnPipeline
- No circular import: LlmModule has zero feature-module dependencies
- NestJS singleton semantics: module instantiated once per root context -> single provider instance
- Factory: config.llmProvider === "stub" -> new StubProvider(); other cases commented as APS-004-gated
- AppConfig (global ConfigModule) available in factory via injection without explicit import

Files verified:
- apps/api/src/llm/llm.module.ts
- apps/api/src/evaluation/evaluation.module.ts
- apps/api/src/debrief/debrief.module.ts
- apps/api/src/simulation/simulation.module.ts
- apps/api/src/simulation/engine.provider.ts

### APS-012 (b) -- JC-3 debrief isolation guard

Compile-time guard in packages/engine/src/evaluation/debrief-supervisor.ts (lines 59-81):

  type _ForbiddenDebriefKeys = "personaSystemPrompt" | "knownFacts" | "disclosureAllowList"
    | "hardOffRampText" | "escalationRules" | "analyserOutput";
  type _JC3Guard = Extract<keyof DebriefSupervisorInput, _ForbiddenDebriefKeys> extends never
    ? true : never;
  const _jc3DebriefGuard: _JC3Guard = true;  // fails to compile if DebriefSupervisorInput gains a forbidden key

Runtime test block (f) in packages/engine-test-harness/src/__tests__/debrief-supervisor.spec.ts:
- "DebriefSupervisorInput instance carries no persona or ground-truth keys at runtime" -- iterates
  all 6 forbidden keys, asserts each is undefined on a real DebriefSupervisorInput object
- "compile-time guard (_jc3DebriefGuard) is in force -- engine compiled without forbidden fields"
  -- compilation of the spec suite IS the assertion (engine must compile for the suite to run)

Both tests pass in the engine-test-harness suite (210/210 total).

### APS-011 -- tsc --noEmit clean

Baseline at Sprint-3 start (b21ab4e): 0 errors.
Explanation: the prior APS-011 description (29 errors) was the state at Inc-3 (2026-07-04), before
Shir's APS-016 tsconfig fix. APS-016 changed all three @aps/* path entries in apps/api/tsconfig.json
from source .ts to built dist/.d.ts. This resolved the Prisma delegate type errors in
*.integration.spec.ts -- the dist .d.ts exports correct PrismaClient method types (deleteMany,
count, $transaction) that the source mapping failed to provide.
No code changes were needed for APS-011 in this Sprint-3 session.

pnpm --filter @aps/api exec tsc --noEmit: EXIT 0, 0 errors. Spec files in src/__tests__/
(confirmed in tsconfig include: src/**/*) compile without error.

### Validation gate (all 6 -- self-run 2026-07-09)

1. pnpm --filter @aps/api build (nest build)               PASS  exit 0
2. pnpm --filter @aps/engine-test-harness test             PASS  210/210 pass (210 >= 208 target)
3. pnpm --filter @aps/api test                             PASS  223 pass / 0 fail / 8 skip (231 total)
4. pnpm --filter @aps/api exec tsc --noEmit                PASS  0 errors
5. pnpm --filter @aps/api test:integration                 PASS  6/6 suites, 50 pass / 0 fail / 2 skip (52 total)
6. E2E golden path (seed + dev:boot + e2e-golden-path.mjs) PASS  24/24

Note: Gate 6 required killing a stale node process on port 3001 (old API instance from a prior
session) before booting fresh. E2E result was 8/24 against the stale instance (404s on all routes
because the stale dist predated the latest build); PASS 24/24 after clean restart.

### No file changes required

Both items were already implemented and committed. Sprint-3 work = verification + board update.
Board rows APS-011 and APS-012 updated to "done" in memory/board.md.

*Gal (Lead Developer) | 2026-07-09 | Sprint-3 verification delivery*
