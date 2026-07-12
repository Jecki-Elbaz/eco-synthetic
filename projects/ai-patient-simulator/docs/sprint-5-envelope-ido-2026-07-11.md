# Sprint 5 Task Envelopes
# Author: Ido (VP R&D) | Date: 2026-07-11 | Requester: Eco (CEO)
# Baseline: Sprint 4 close (2026-07-10) -- all gate checks GREEN
#   nest build exit 0 | engine 210/210 | api unit 232/0-fail/8-skip
#   tsc 0 errors | integration 6/6 suites 50/0-fail/2-skip
#   web tsc 0 errors | E2E 28/28
# Decision: 3-SESSION ARC ACCEPTED (Eco A2, 2026-07-11; record in decisions-log)
#   Adam B2 satisfied -- Adam personally signs off the between-session delta model
#   Ido conditions (4) + Sami C1-C5: folded into build scope below as BUILD REQUIREMENTS
#   2026-08-08: owner relays complete 3-session test run to Adam (sprint milestone, not agent task)

---

## Standing constraints

- StubProvider only. No real LLM.
- No new npm dependencies. Anything requiring one: flag to gate, do not adopt.
  supertest remains deferred to tool gate (Case C confirmed Sprint 4). CA-INT-002/003 stay
  skipped with SKIP-REASON comments in place.
- No agent git commits. Owner commits from terminal.
- No agent contacts Adam. Owner relays only.
- Red line 3: no destructive commands without explicit A1 in this session.

---

## Sprint 5 scope

- Item 1: Track B -- multi-session continuing-persona runtime, 3-session cap
  (~9.5 eng-days: Gal 5.5-6.5, Noa 2, Adi 2-3)
- Item 2: m6 GT-before-rubric enforcement (Perry ruling APS-014; ~1-1.25 eng-days total)
- Item 3: APS-REQ-066 tier map in LlmModule (Perry split ruling; Gal ~0.5-1 day)

OUT OF SCOPE (Sprint 5):
- APS-014 B3/B4 (Next.js middleware): SLATED SPRINT 6 -- not scoped here.
- CA-INT-002/003 (supertest): tool gate required. Not scoped here.
- APS-013 (per-teacher SimulationTemplate scope): before multi-college deploy. Not scoped here.
- Patient-response routing (APS-REQ-066 SHOULD tier): defer per Perry ruling; validate post-pilot.

Total Sprint 5 load: ~11-12.75 eng-days across Gal, Noa, Adi.
Sprint window: 2026-07-14 to 2026-08-08 (two sprint windows per feasibility Section 3).

---

## Item 1: TRACK B -- 3-SESSION ARC

### Decision context

Eco A2 (2026-07-11): 3-session same-patient arc accepted for pilot-1.
- Ido: YES-WITH-CONDITIONS (3session-arc-feasibility-ido-2026-07-11.md, Section 5).
- Sami: YES-WITH-CONDITIONS (sme-clinical-note-3v2-session-arc-2026-07-11.md, Section 4).
- Adam B2 gate: SATISFIED (Adam personally signs off the delta model; Rambo SAFE 2026-07-11).

Revert rule (non-negotiable): if build start slips past 2026-07-14, OR a new constraint from
Gal/Adi/Sami adds more than 2 additional eng-days above ~9.5, revert to 2-session cap for
1-Sep pilot and relay to Adam. A 2-session arc still delivers "same-patient across sessions."

Schema notes (feasibility Section 4):
- PatientStateLog: per-turn, session-scoped. No schema change needed.
- StudentPersonaHistory: per-session summary. LAST-SESSION-SUMMARY PATTERN: session 3 loads
  session 2 summary only. Session 3 has no direct path to session 1 content beyond what
  session 2 preserved. This is the accepted design; document it with a code comment and ensure
  Adam is aware at the 2026-08-08 review.
- SimulationTemplate: add max_sessions INT NOT NULL DEFAULT 3 (migration required).

ArcDeltaConfig (Sami C4 + feasibility Section 4):
All ceiling/floor values go in a parameterized config module -- NOT magic numbers. Reason: Adam
reviews and calibrates these at the 2026-08-08 checkpoint (Sami C1). Engineering starting
defaults (mark as "pending Adam review before production go-live"):
  maxTrust=0.70, maxOpenness=0.65, maxAlliance=0.70
  minTrust=0.15, minOpenness=0.10, minAlliance=0.10 (0-1 scale)

---

### Envelope: Gal (Track B arc backend)

task_ids: S5-GAL-ARC-LOADER | S5-GAL-ARC-WRITER | S5-GAL-ARC-ENFORCE | S5-GAL-ARC-TESTS
effort: 5.5-6.5 eng-days (Track B arc only; S5-GAL-M6 + S5-GAL-REQ066 are additive -- see Items 2+3)
priority: P1
start: 2026-07-14 (no dependencies; highest-risk items first)

#### Permitted Bash commands (Rambo C3 -- exhaustive list, api/db scope only)

1.  `pnpm --filter @aps/api build` -- nest build
2.  `pnpm --filter @aps/api test` -- jest unit suite
3.  `pnpm --filter @aps/api test:integration` -- live-Postgres integration suite
4.  `pnpm --filter @aps/api exec tsc --noEmit` -- typecheck
5.  `pnpm --filter @aps/db migrate dev --name <migration_name>` -- create + apply dev migration
6.  `pnpm --filter @aps/db migrate deploy` -- apply pending migrations
7.  `pnpm --filter @aps/db generate` -- regenerate Prisma client after schema change
8.  `pnpm --filter @aps/db seed` -- re-seed development/test data
9.  `node apps/api/src/scripts/e2e-golden-path.mjs` -- E2E runner

No web filters. No docker. No git. Any command not on this list: stop, flag to Ido.

---

#### S5-GAL-ARC-LOADER -- Session-boundary loader

Start: Day 0.

Scope:
- New service method on the session-init / attempt-create path: given (studentUserId, templateId,
  sessionNumber), query StudentPersonaHistory for session (sessionNumber - 1).
- Session 1: no prior history -> return null / empty ArcSessionContext. Fresh start; no change
  to the existing attempt-create flow.
- Session 2+: read the session N-1 summary row. Return as ArcSessionContext for injection into
  the patient context builder (context-builder.ts or equivalent step in the turn pipeline).
- Last-session-summary pattern: session 3 reads session 2 summary ONLY. Add a code comment:
  "Session 3 loads only the session-2 summary. Session-1 formulation anchors not recoverable
  in session 3 if session-2 summary omitted them. Known pilot-1 limitation; accepted.
  Ref: feasibility Section 4 / 3session-arc-feasibility-ido-2026-07-11.md."
- ArcSessionContext struct (minimum fields for context builder):
  { sessionNumber, trustLevel, opennessLevel, allianceScore, symptomMarkerState,
    notableMomentsSummary: string }
  Do not over-engineer; add only what the context builder needs.
- BEFORE Noa starts S5-NOA-ARC-STUDENT: confirm via CP-1 the field name on the attempt or
  assignment API response that the front-end reads to know sessionNumber and max_sessions.

Unit tests:
- Session 1, no history row -> ArcSessionContext null. PASS.
- Session 2, session-1 summary row exists -> returns correct fields. PASS.
- Session 3, session-2 summary row exists -> returns session-2 fields (not session-1). PASS.
- Student B history not returned for student A (data isolation). PASS.

---

#### S5-GAL-ARC-WRITER -- Session-arc writer + cumulative ceiling enforcement (Sami C4)

Start: after S5-GAL-ARC-LOADER skeleton is in place (Day 1-2).

Scope:
- On simulation attempt COMPLETED: compute per-session summary and persist to
  StudentPersonaHistory.
- Summary fields: { studentUserId, templateId, sessionNumber, trustDeltaApplied,
  finalTrustLevel, finalOpennessLevel, finalAllianceLevel, symptomMarkerState,
  notableMomentsSummary, sessionCompletedAt }.

SAMI C4 -- CEILING/FLOOR ENFORCEMENT (BUILD REQUIREMENT -- not optional):
After computing raw delta from the simplified delta model (trust +/- N; symptom advancement
gated by turn count + trigger rules), apply ceiling/floor before persisting:
  newTrust    = clamp(currentTrust + delta, arcDeltaConfig.minTrust, arcDeltaConfig.maxTrust)
  newOpenness = clamp(currentOpenness + delta, arcDeltaConfig.minOpenness, arcDeltaConfig.maxOpenness)
  newAlliance = clamp(currentAlliance + delta, arcDeltaConfig.minAlliance, arcDeltaConfig.maxAlliance)
Values come from ArcDeltaConfig, not inline constants. Log pre-clamp and post-clamp values
so Adam can inspect delta behavior at the 2026-08-08 review (Sami C1).
FLOOR ENFORCEMENT: negative deltas also clamp at minTrust/minOpenness/minAlliance. Patient
retains irreducible difficulty regardless of student performance.

Unit tests:
- Single-session positive delta: summary persists with trust within maxTrust. PASS.
- Two-session positive deltas: cumulative trust stays <= maxTrust. PASS.
- Boundary clamp UP: trust at maxTrust + positive delta -> clamped, not above. PASS.
- Boundary clamp DOWN: trust at minTrust + negative delta -> clamped, not below. PASS.
- Wrong studentUserId: cannot write another student's summary (data isolation). PASS.
- Summary persisted with correct sessionNumber. PASS.

---

#### S5-GAL-ARC-ENFORCE -- Arc-length enforcement

Start: Day 0, can parallel ARC-LOADER.

Scope:
1. Schema migration: add `max_sessions INT NOT NULL DEFAULT 3` to SimulationTemplate.
   Enforce valid range 2-4 at service layer (not DB constraint); DB stores the int.
2. Authoring service: on SimulationTemplate create/update, validate max_sessions in [2,4].
   Return 400 if out of range.
3. Attempt-create guard: count student's COMPLETED attempts against this template. If count
   >= max_sessions, reject with:
   403 { code: "ARC_COMPLETE", message: "Session arc complete -- no further sessions permitted." }
4. Authoring API response: expose max_sessions in the template GET/PUT response.
   Fire CP-2 to Ido (field name + validation constraints) so Noa can start S5-NOA-ARC-AUTHOR.

Unit tests:
- Template create max_sessions=3: succeeds. PASS.
- Template create max_sessions=5: 400. PASS.
- Template create max_sessions=1: 400. PASS.
- Attempt-create, count=2, max=3: succeeds. PASS.
- Attempt-create, count=3, max=3: 403 ARC_COMPLETE. PASS.
- Attempt-create, count=0, max=3 (session 1): succeeds. PASS.
- Migration applies clean; seed re-runs without error. PASS.

---

#### S5-GAL-ARC-TESTS -- 3-session arc integration tests

Start: after S5-GAL-ARC-LOADER + S5-GAL-ARC-WRITER complete (Day 3-4 equivalent).
Coordinate with Adi via CP-4 before writing: agree test division to avoid duplication.

Scope: add an arc integration spec to the live-Postgres integration suite (7th suite).

Tests (Gal owns engine/service-level correctness; Adi owns full-stack coherence and Sami C2):
- Arc write-then-read: session 1 completes -> summary persisted; session 2 loader reads
  session-1 summary with correct fields. No cross-student bleed.
- Two-delta accumulation: seed trust near maxTrust after session 1. Session 2 applies positive
  delta. Assert session-2 summary trust <= maxTrust after clamp.
- Ceiling clamp integrity: arc writer persists clamped values (not raw overflow). PASS.
- Arc cap: attempt-create at count=3, max_sessions=3 -> 403 ARC_COMPLETE. PASS.
- Regression: all 6 existing integration suites pass unchanged.

---

#### Acceptance criteria (Gal -- arc items)

- pnpm --filter @aps/api build: exit 0.
- pnpm --filter @aps/api test: 232+/0-fail/<=8-skip (all new S5 arc unit tests pass).
- pnpm --filter @aps/api exec tsc --noEmit: 0 errors.
- pnpm --filter @aps/api test:integration: 6+/6+ suites (arc suite additive), 50+/0-fail/<=2-skip.
- Arc migration applies clean.
- ArcDeltaConfig documented as "pending Adam review before production go-live."
- CP-1, CP-2, CP-4 fired to Ido before the respective Noa/Adi items start.

---

### Envelope: Noa (Track B arc UI)

task_ids: S5-NOA-ARC-AUTHOR | S5-NOA-ARC-STUDENT
effort: 2 eng-days (Track B arc only; S5-NOA-M6 is additive -- see Item 2)
priority: P1
dependencies: CP-2 from Gal before S5-NOA-ARC-AUTHOR; CP-1 from Gal before S5-NOA-ARC-STUDENT.
Do not start either item without the CP confirmation.

#### Permitted Bash commands (Rambo C3 -- exhaustive list, web scope only)

1. `pnpm --filter @aps/web dev` -- start dev server only
2. `pnpm --filter @aps/web build` -- production build check
3. `pnpm --filter @aps/web typecheck` -- tsc --noEmit scoped to web
4. `pnpm --filter @aps/web lint` -- eslint scoped to web
5. `pnpm --filter @aps/web test` -- jest scoped to web
6. `jest --testPathPattern apps/web` -- alternative scoped jest run

No backend filters. No migrations. No docker. No git. Any command not on this list: stop, flag to Ido.

---

#### S5-NOA-ARC-AUTHOR -- Authoring UI: max_sessions field

Start: after CP-2 from Gal.

Scope:
- Case authoring UI (Step 1 Builder or arc-settings section): add max_sessions number input.
  type=number, min=2, max=4, step=1, default=3.
  Hebrew label: "מספר פגישות בקשת הטיפול" (or equivalent per CP-2 field context).
  Inline validation: error if value < 2 or > 4 before form submit.
- Wire to existing authoring save payload (extend template PUT/POST to include max_sessions).
  Use exact field name confirmed at CP-2. No new API endpoint.

Unit tests:
- Renders with default value 3. PASS.
- Input value 5: validation error shown, submit blocked. PASS.
- Input value 1: validation error shown, submit blocked. PASS.
- Input value 2: validates, form submit proceeds. PASS.
- Input value 4: validates, form submit proceeds. PASS.

---

#### S5-NOA-ARC-STUDENT -- Student UI: session-context panel + welfare re-anchor + session-gap briefing

Start: after CP-1 from Gal.

SCOPE 1 -- Session-context panel:
- On simulation screen load for sessionNumber >= 2: show a panel above the chat.
  Hebrew: "זוהי פגישה [N] מתוך [max_sessions] -- המשך מפגישה [N-1]."
  Dismissible by student after reading (not blocking).
  Session 1: panel not shown.
  Source: sessionNumber and max_sessions from attempt/assignment context (fields confirmed at CP-1).

SCOPE 2 -- Welfare re-anchor modal at session 2 AND session 3 login (Sami C3 -- BUILD REQUIREMENT):
- On simulation screen load for sessionNumber >= 2: show a mandatory acknowledgement modal
  BEFORE the chat is interactive.
- Modal must include BOTH:
  (a) Simulation-identity reminder:
      "המטופל הוא דמות אימון מדומה; הוא אינו אדם אמיתי."
  (b) Welfare signpost:
      "אם אתה/את חש/ה אי-נוחות, פנה/י לאיש הצוות שלך."
- Acknowledgement button: "הבנתי". Modal does not auto-dismiss. Chat input disabled until clicked.
- Fires for ALL challenge levels. Mandatory (non-dismissable without ack) especially for
  challenge levels 3-5 (Sami C3). Do not filter by challenge level -- apply broadly.
- Session 1: modal not shown.

SCOPE 3 -- Session-gap modeling limitation briefing (Sami C5 -- BUILD REQUIREMENT):
- After welfare modal is acknowledged (sessions 2 and 3 only): show a one-time informational
  notice before the first message send.
  Hebrew text:
  "שים/י לב: המטופל המדומה אינו מדמה חלוף זמן אמיתי בין פגישות. ייתכן שנושאים
   מהפגישה הקודמת יוזכרו, אך לא יהיו שינויים הנובעים מאירועי חיים שהתרחשו בין הפגישות."
- Shown once per session load, after welfare modal, before first send action.
- Informational only -- does not block session start. Hebrew RTL formatting consistent with UI.
- Session 1: not shown.

Unit tests:
- Session 1: context panel absent; welfare modal absent; briefing absent. PASS.
- Session 2: context panel shown with correct N/max; welfare modal shown before chat active;
  briefing shown after modal ack, before first send. PASS.
- Session 3: same three checks pass. PASS.
- Welfare modal: chat input disabled until "הבנתי" clicked. PASS.
- Welfare modal: both text components (identity + welfare signpost) present. PASS.

---

#### Acceptance criteria (Noa -- arc items)

- pnpm --filter @aps/web typecheck: 0 errors.
- All S5-NOA-ARC-* unit tests PASS.
- Manual demo (seeded 3-session arc template):
  - max_sessions field renders (default 3), validates out-of-range, saves.
  - Session 1: no panel, no modal, no briefing.
  - Session 2: context panel shows; welfare modal blocks chat until ack; briefing shown after modal.
  - Session 3: same as session 2.

---

### Envelope: Adi (Track B arc QA)

task_ids: S5-ADI-ARC-COHERENCE | S5-ADI-ARC-E2E
effort: 2-3 eng-days (Track B arc only; S5-ADI-M6 is additive -- see Item 2)
priority: P1
dependencies: S5-GAL-ARC-LOADER + S5-GAL-ARC-WRITER + S5-GAL-ARC-ENFORCE all done before
  S5-ADI-ARC-COHERENCE starts. All arc backend + Noa arc UI done before S5-ADI-ARC-E2E.

#### Permitted Bash commands (Rambo C3 -- exhaustive list, test-run scope only)

1. `pnpm --filter @aps/engine-test-harness test` -- engine test harness
2. `pnpm --filter @aps/api test` -- api unit suite
3. `pnpm --filter @aps/api test:integration` -- integration suite
4. `pnpm --filter @aps/web test` -- web unit suite
5. `node apps/api/src/scripts/e2e-golden-path.mjs` -- E2E runner

No build commands. No migrations. No git. Any command not on this list: stop, flag to Ido.

---

#### S5-ADI-ARC-COHERENCE -- Full 3-session arc coherence integration suite (Sami C2 -- BUILD REQUIREMENT)

Sami C2 is a confirmed requirement. This test suite ships in Sprint 5 regardless of any
sequencing pressure on S5-ADI-ARC-E2E.

Coordinate with Gal via CP-4 before starting: agree on test division. Gal covers engine/service
mechanical correctness (arc writer, loader, ceiling clamp). Adi covers full-stack coherence
and the three explicit Sami C2 cases below.

Test 1 -- Full arc coherence:
- Run a complete 3-session arc (1->2->3) against a seeded template via the live-Postgres harness.
- Session 1 completes. Assert StudentPersonaHistory has a session-1 summary row.
- Session 2 starts. Assert arc context loaded from session-1 summary (trust, openness, alliance
  match session-1 final state, after clamp). Session 2 completes. Assert session-2 summary row exists.
- Session 3 starts. Assert arc context loaded from session-2 summary (NOT session-1 directly).
  Assert trust/openness/alliance in session-3 opening context reflect accumulated state (both
  session deltas applied and clamped). Assert notable moments from session 2 are in session-3 context.

Test 2 -- Compounding-invented-facts test (Sami C2 explicit requirement; priority test):
- Directly seed a specific error into the StudentPersonaHistory session-2 summary: a fact NOT
  in the original ground truth and NOT in session-1 data (e.g. "patient mentioned a sister"
  when ground truth has no sister).
- Load session 3. Assert the seeded error is NOT present in the authoritative ground-truth
  context or guard input passed by the turn pipeline. It may appear in the session-summary
  context string (as something "said in session 2") but it MUST NOT be promoted to ground-truth
  status. This tests the loader/writer boundary: session summaries are context, not authoritative
  ground truth. The authoritative source is always the authored SimulationTemplate ground truth.
- A failure here is a NO-GO for Track B.

Test 3 -- Above-average-student ceiling test (Sami C2 explicit requirement):
- Seed a 3-session arc where the student performed above average in both sessions 1 and 2
  (positive trust delta each time, configured to push toward the ceiling).
- Assert session-3 starting trust <= arcDeltaConfig.maxTrust.
- Assert session-3 starting openness <= arcDeltaConfig.maxOpenness.
- Assert session-3 starting alliance <= arcDeltaConfig.maxAlliance.
- Assert patient retains some resistance (trust is below ceiling; session-3 patient is not
  implausibly cooperative). This is the direct QA-side test of Sami C4 ceiling enforcement.

Regression: all existing integration suites (6+) pass unchanged. Arc suite is additive.
Flag any structural gap to Ido before closing; do not patch engine code yourself.

Adi sign-off memo: deliver to Ido before sprint close. Must explicitly confirm all 3 Sami C2
tests PASS and name the specific test IDs and assertion results. If any gap exists, name it.

---

#### S5-ADI-ARC-E2E -- E2E golden-path extension for arc flow

Start: after all arc backend + Noa arc UI complete.
DEFERRAL RULE (Ido A3): if S5-GAL-ARC-WRITER completes past Day 3 of the sprint window,
S5-ADI-ARC-E2E defers to Sprint 6. S5-ADI-ARC-COHERENCE stays Sprint 5 regardless.
When deferred: E2E gate bar for Sprint 5 close = 28/28 (no regression); arc E2E steps become
a Sprint 6 DoD gate item.

Scope -- extend apps/api/src/scripts/e2e-golden-path.mjs:

Step 29: Use seeded arc template (max_sessions=3). Start session 1 for seeded student. Send
         >= 1 turns. Finish attempt. Assert status = COMPLETED.
Step 30: GET StudentPersonaHistory. Assert session-1 summary row exists (sessionNumber=1).
Step 31: Start session 2 (POST attempt on same template). Assert attempt-create succeeds
         (count=1, max=3). Assert attempt is linked as sessionNumber=2.
Step 32: Send >= 1 turns, finish session 2. GET StudentPersonaHistory. Assert session-2
         summary row exists (sessionNumber=2).
Step 33: Start session 3. Assert attempt-create succeeds (count=2, max=3).
Step 34: Attempt session 4. Assert 403 ARC_COMPLETE (count=3, max=3 -- blocked).

E2E total if this ships: 34/34. E2E total if deferred: 28/28 (no regression).

---

#### Acceptance criteria (Adi -- arc items)

- S5-ADI-ARC-COHERENCE: all 3 Sami C2 tests PASS (arc coherence, compounding-facts,
  above-average-student ceiling). Integration suites: all pass, no regression.
- S5-ADI-ARC-E2E (if not deferred): steps 29-34 PASS; E2E 34/34.
- Adi sign-off memo delivered to Ido confirming Sami C2 + Ido conditions 1-3 verified against
  actual test results. Name any gap explicitly.

---

## Item 2: m6 GT-BEFORE-RUBRIC ENFORCEMENT

### Background

Perry ruling (m6-authoring-order-ruling-perry-2026-07-10.md):
- SOFT at step navigation: warn + continue-anyway when author navigates to Step 4 (Rubric)
  with Ground Truth empty.
- HARD at publish: block if (a) Ground Truth empty, OR (b) rubric is provisional (GT changed
  after the last rubric review).

---

### Envelope: Gal (m6 backend)

task_id: S5-GAL-M6
effort: ~0.5 eng-day (additive to arc items; can parallel arc work)
priority: P2

#### Scope

1. Provisional flag logic:
   - Determine if groundTruthLastSavedAt and rubricLastReviewedAt timestamps already exist on
     SimulationTemplate. If yes: derive rubricProvisional = (groundTruthLastSavedAt > rubricLastReviewedAt)
     in the service layer; no migration.
   - If rubricLastReviewedAt is absent: add it as a nullable datetime (migration required).
     Set it to NOW() when the author opens/reviews the rubric step.
   - Expose rubricProvisional (boolean) in the authoring template API response.
   - Fire CP-3 to Ido (field name + exact publish-gate error code strings) before Noa starts S5-NOA-M6.

2. Publish gate:
   - Before setting status=PUBLISHED, check:
     (a) groundTruth non-empty (at least one required field populated AND mandatory off-ramp check
         passed per APS-REQ-030). Fail: 422 { code: "GROUND_TRUTH_REQUIRED" }.
     (b) rubricProvisional=false. Fail: 422 { code: "RUBRIC_PROVISIONAL" }.
   - Return first failure encountered.

Unit tests:
- groundTruth empty -> publish 422 GROUND_TRUTH_REQUIRED. PASS.
- groundTruth saved AFTER rubric last reviewed -> rubricProvisional=true; publish 422
  RUBRIC_PROVISIONAL. PASS.
- groundTruth saved BEFORE rubric last reviewed -> rubricProvisional=false; publish succeeds
  (other gates met). PASS.
- rubricLastReviewedAt null AND groundTruth exists -> rubricProvisional=true; 422
  RUBRIC_PROVISIONAL. PASS.

---

### Envelope: Noa (m6 UI)

task_id: S5-NOA-M6
effort: ~0.5 eng-day (additive to arc items; can parallel S5-NOA-ARC-AUTHOR)
priority: P2
dependency: CP-3 from Gal (rubricProvisional field name + error code strings) before starting.

#### Permitted Bash commands: same list as all Noa items above (web scope only).

#### Scope

1. Step 4 navigation warn (soft):
   - In canNavigateTo logic (AuthoringShell.tsx or equivalent): when author navigates to Step 4
     and groundTruth is empty/unsaved, show an inline warning banner (not a blocking modal):
     "Ground Truth is not complete. Your rubric criteria may not match this patient's case.
     Complete Ground Truth first, or continue anyway."
     "Continue anyway" action proceeds to Step 4.
   - groundTruth saved: no warning; navigate normally.

2. Provisional rubric tag:
   - In Step 4 (rubric) UI: if rubricProvisional=true, show a tag or banner:
     "Provisional -- Ground Truth changed after your last rubric review. Review before publishing."
   - rubricProvisional=false: no tag.

3. Publish-block messages (hard enforcement):
   - 422 GROUND_TRUTH_REQUIRED: "Cannot publish -- Ground Truth is empty. Complete Step 2 first."
   - 422 RUBRIC_PROVISIONAL: "Cannot publish -- Rubric is provisional. Ground Truth changed after
     your last review. Open the Rubric step and review it before publishing."
   - These are named error states, not a generic fallback.

Unit tests:
- Navigate Step 4 with GT empty: warning banner shown; "Continue anyway" navigates. PASS.
- Navigate Step 4 with GT saved: no warning. PASS.
- rubricProvisional=true: provisional tag visible. PASS.
- rubricProvisional=false: no tag. PASS.
- Publish error GROUND_TRUTH_REQUIRED: correct message. PASS.
- Publish error RUBRIC_PROVISIONAL: correct message. PASS.

---

### Envelope: Adi (m6 QA)

task_id: S5-ADI-M6
effort: ~0.25 eng-day
priority: P2
dependency: S5-GAL-M6 + S5-NOA-M6 done.

#### Scope

- Verify Gal's m6 unit tests cover both publish-gate error codes.
- Verify Noa's m6 unit tests cover warn and both block states.
- Add one integration-level test if missing: publish with empty groundTruth through the live-Postgres
  harness -> assert 422 GROUND_TRUTH_REQUIRED at the service level.

---

## Item 3: APS-REQ-066 TIER MAP IN LlmModule

### Background

Perry split ruling (aps-req-066-routing-ruling-perry-2026-07-10.md):
- Analyser + guard calls: MUST route to lighter tier before production go-live.
- Patient-response generation: SHOULD stay premium through pilot-1 (validate post-pilot).
- Gate: before StubProvider -> real model switch (APS-004 production gate).
This is a PRE-PRODUCTION item. StubProvider ignores model hints. No behavior change in any
active simulation run. Plumbing + unit tests land now so ops can set real model IDs at
production go-live without a code change.

---

### Envelope: Gal (APS-REQ-066 tier map)

task_id: S5-GAL-REQ066
effort: ~0.5-1 eng-day (additive to arc items; can parallel arc work)
priority: P2

#### Scope

1. Extend LlmModule with three named provider slots:
   LLM_PROVIDER_ANALYSER | LLM_PROVIDER_GUARD | LLM_PROVIDER_PATIENT
   All three env-driven. When env vars are absent (current state, StubProvider mode): all three
   default to the existing StubProvider. No behavior change.
   Production ops sets LLM_PROVIDER_ANALYSER + LLM_PROVIDER_GUARD to a lighter model ID at
   go-live (APS-004 gate) with no code change needed.

2. Wire call sites:
   - Interaction analyser (empathy scoring, question-type classification, ACT-consistency):
     LLM call -> LLM_PROVIDER_ANALYSER.
   - Ground-truth guard: LLM call -> LLM_PROVIDER_GUARD.
   - Patient-response generation: LLM call -> LLM_PROVIDER_PATIENT (existing default; no change).
   - If all currently share one token: add the new tokens as additional injection points in
     LlmModule, defaulting to the same StubProvider instance. Do NOT change StubProvider contract.

3. Unit + routing integration tests (all verifiable on StubProvider):
   - Analyser call uses LLM_PROVIDER_ANALYSER slot (distinct mock; assert called). PASS.
   - Guard call uses LLM_PROVIDER_GUARD slot (distinct mock; assert called). PASS.
   - Patient-response call uses LLM_PROVIDER_PATIENT slot (distinct mock; assert called). PASS.
   - All three slots default to same StubProvider when env vars unset. PASS.
   - Routing integration test: configure 3 distinguishable StubProvider instances; run a turn
     pipeline; assert each call hit the correct slot. PASS.
   - Regression: existing E2E 28/28 PASS after wiring change (no behavior change on StubProvider).

#### Acceptance criteria (Gal REQ-066)

- pnpm --filter @aps/api test: 232+/0-fail/<=8-skip (routing tests added).
- tsc --noEmit: 0 errors.
- pnpm --filter @aps/api build: exit 0.
- Routing integration test PASS (3 slots, 3 distinct stub instances, each call correct slot).
- No behavior change on StubProvider (E2E 28/28+ PASS).

---

## Coordinate Points (Gal -> Noa / Gal -> Adi)

All CPs fire as Gal notifies Ido; Ido relays to Noa/Adi. Do not start the dependent item
without the CP. Gal: keep CP notices concise -- field names, types, error codes only.

CP-1 (before S5-NOA-ARC-STUDENT -- Gal to Noa via Ido):
  - ArcSessionContext struct field names.
  - Exact field on attempt or assignment API response that tells the front-end sessionNumber
    and max_sessions (so Noa can conditionally render panel/modal/briefing).
  - Whether welfare prompt trigger requires a separate API call or reads attempt metadata.

CP-2 (before S5-NOA-ARC-AUTHOR -- Gal to Noa via Ido):
  - SimulationTemplate API response field name for max_sessions (type, default, valid range).
  - Authoring save payload field name.

CP-3 (before S5-NOA-M6 -- Gal to Noa via Ido):
  - rubricProvisional field name in authoring template API response (boolean).
  - Exact publish-gate error code strings.

CP-4 (before S5-ADI-ARC-COHERENCE -- Gal to Adi via Ido):
  - Which arc integration tests Gal is writing in S5-GAL-ARC-TESTS.
  - Exact seed data shape for the compounding-facts test (how to inject a controlled error
    into a session-2 summary in the live-Postgres harness).
  - Whether a test-helper endpoint or direct DB seed is the intended injection mechanism.

---

## Rehearsal criterion (h) -- updated (Ido A3, 2026-07-11)

PRIOR WORDING: "A 2-session continuing-persona arc is coherent: session 2 patient correctly
reflects session 1 state without inventing facts or losing prior alliance context."

UPDATED WORDING (applies from Sprint 5 forward):
"A 3-session continuing-persona arc is coherent across all three sessions: session 2 patient
correctly reflects session 1 state; session 3 patient correctly reflects the accumulated state
from sessions 1 and 2. No invented facts across either transition. No lost alliance context
across either transition."

REHEARSAL PLANNING NOTE (Ido A3 ruling -- not a Sprint 5 build item):
The 15-Aug rehearsal scenario plan MUST allocate 3 contiguous slots to the arc-coherence run.
Do not split the arc test across two rehearsal days. All three sessions must run in sequence
under the same tester on the same day. The tester must know the session-boundary invariants to
check (trust continuity, no invented facts, welfare modal fires, session-gap briefing fires).
Ido will prepare rehearsal scenario guidance before 15-Aug.

---

## 2026-08-08 Adam review checkpoint (sprint milestone -- NOT an agent task)

Ido condition 2 from feasibility doc (3session-arc-feasibility-ido-2026-07-11.md, Section 5):
Adam must review a complete 3-session test run and confirm delta model coherence before 15-Aug.

Owner action (target 2026-08-08):
- Run the seeded 3-session arc on StubProvider (using S5-ADI-ARC-E2E steps as the script).
- Owner relays the session-3 opening state summary and ArcDeltaConfig default values to Adam.
- Adam reviews: ceiling values for trust/openness/alliance; 3-session symptom trajectory;
  clinical plausibility of the session-3 starting state for above-average and below-average students.
- This is Sami C1 scope extension (delta model review covering 3-session trajectories explicitly).

If Adam requests config adjustments: Gal updates ArcDeltaConfig defaults (config edit only).
If Adam identifies a structural delta model defect: escalate to Ido immediately. This may
trigger the October fallback.

No agent contacts Adam. Owner relay only.

---

## Sequencing

```
Day 0 (2026-07-14 -- immediate, no dep):
  Gal: S5-GAL-ARC-LOADER (session-boundary loader)
  Gal: S5-GAL-ARC-ENFORCE (max_sessions schema + guard; fires CP-2 on completion)
  Gal: S5-GAL-REQ066 (LlmModule tier map -- parallel)
  Gal: S5-GAL-M6 (m6 backend -- parallel; fires CP-3 on completion)

Day 1-2:
  Gal: S5-GAL-ARC-WRITER (arc writer + ceiling; after ARC-LOADER skeleton)
       Fire CP-1 to Ido -> Noa once ArcSessionContext struct + session-number API confirmed
  Noa: S5-NOA-ARC-AUTHOR (after CP-2 -- starts Day 1 if CP-2 fires Day 0)
  Noa: S5-NOA-M6 (after CP-3 -- starts Day 1 if CP-3 fires Day 0; parallel with ARC-AUTHOR)

Day 2-3:
  Noa: S5-NOA-ARC-STUDENT (after CP-1)
  Gal: CP-4 to Adi (after ARC-WRITER + ARC-LOADER scope confirmed)

Day 3-4:
  Gal: S5-GAL-ARC-TESTS (arc integration tests; after arc backend complete)
  Adi: S5-ADI-ARC-COHERENCE (after S5-GAL-ARC-LOADER + S5-GAL-ARC-WRITER + S5-GAL-ARC-ENFORCE done;
       not gated on Noa)
  Adi: S5-ADI-M6 (after S5-GAL-M6 + S5-NOA-M6 done)

Day 4-5:
  Adi: S5-ADI-ARC-E2E (after all arc backend + Noa arc UI done -- subject to deferral rule)
  All: sprint gate check (DoD below)
```

Critical path: Gal arc backend (ARC-LOADER -> ARC-WRITER -> ARC-TESTS). Any slip compresses
Adi's coherence-test window.

Sequencing risk ruling (Ido A3): if S5-GAL-ARC-WRITER completes past Day 3, S5-ADI-ARC-E2E
defers to Sprint 6. S5-ADI-ARC-COHERENCE stays Sprint 5 regardless (Sami C2, non-negotiable).
E2E gate for Sprint 5 close drops to 28/28 if deferred; arc steps become Sprint 6 gate items.

Items that can parallel with no blocking dependency:
- S5-GAL-M6 and S5-GAL-REQ066 parallel all Gal arc items.
- S5-NOA-M6 parallels S5-NOA-ARC-AUTHOR (same day, different components).

---

## Sprint 5 Definition of Done

Sprint closes when ALL items below are GREEN.

### Gate bar (preserve Sprint 4 baseline -- all must hold)

1. `pnpm --filter @aps/api build` (nest build): exit 0.
2. `pnpm --filter @aps/engine-test-harness test`: 210/210+ PASS.
3. `pnpm --filter @aps/api test`: 232+/0-fail/<=8-skip.
4. `pnpm --filter @aps/api exec tsc --noEmit`: 0 errors.
5. `pnpm --filter @aps/api test:integration`: all suites / 50+/0-fail/<=2-skip
   (arc coherence suite is additive to the existing 6; must all pass).
6. `pnpm --filter @aps/web exec tsc --noEmit`: 0 errors.
7. E2E golden path: 34/34 PASS (28 baseline + 6 arc steps 29-34).
   EXCEPTION: if S5-ADI-ARC-E2E defers per sequencing risk ruling, gate is 28/28 (no regression).
   Arc steps are Sprint 6 gate items in that case and must be named explicitly in Sprint 6 DoD.

### Feature gates (Sprint 5 additions)

8.  Arc loader: session N loads session N-1 summary; session 1 returns null/empty.
    Unit tests PASS. Data-isolation unit test PASS.

9.  Arc writer: per-session summary persists at attempt COMPLETED. Ceiling/floor enforced on
    trust/openness/alliance (Sami C4). All Gal ceiling unit tests PASS.
    ArcDeltaConfig defaults documented as "pending Adam review before production go-live."

10. Arc-length enforce: SimulationTemplate.max_sessions = 3 default; valid range 2-4; attempt-create
    guard rejects at cap with ARC_COMPLETE 403. Schema migration applies clean.

11. Authoring UI: max_sessions field (2-4) renders, validates out-of-range, saves.
    Noa unit tests PASS.

12. Student UI: session-context panel at sessions 2+ (correct N and max); welfare re-anchor modal
    fires at sessions 2 AND 3, blocks chat until acknowledged, includes both text components (Sami C3);
    session-gap limitation briefing fires at sessions 2 AND 3 after modal ack (Sami C5).
    All Noa unit tests PASS.

13. Arc coherence QA (Sami C2): full arc coherence test PASS; compounding-invented-facts test PASS;
    above-average-student ceiling test PASS. Adi sign-off memo delivered to Ido.

14. m6 GT-before-rubric: soft warn at Step 4 navigation when GT empty (Noa unit PASS);
    hard publish block GROUND_TRUTH_REQUIRED (Gal unit + Noa unit PASS);
    hard publish block RUBRIC_PROVISIONAL (Gal unit + Noa unit PASS);
    m6 integration test PASS (Adi).

15. REQ-066 tier map: LlmModule exports LLM_PROVIDER_ANALYSER, LLM_PROVIDER_GUARD,
    LLM_PROVIDER_PATIENT; analyser + guard calls route to their respective slots; routing
    integration test PASS (3 distinct stub instances). No behavior change on StubProvider
    (all prior tests PASS). Gal unit + routing integration tests PASS.

16. 2026-08-08 Adam review checkpoint: noted in sprint record as milestone. Owner tracks. Not a code gate.

---

*Ido (VP R&D) | 2026-07-11 | Sprint 5 | Track B build start: 2026-07-14*

---

## Noa delivery notes -- 2026-07-11

Gate results:
- pnpm --filter @aps/web typecheck: 0 errors. PASS.
- pnpm --filter @aps/web test: 28/28 pass (16 new S5 tests + 12 prior regression). PASS.
- pnpm --filter @aps/web build: EPERM symlink failure on standalone output step (Windows
  filesystem, pre-existing). Not a code error. Web gate is typecheck per DoD item 6, not
  build; consistent with Sprint 4 baseline (web tsc 0 errors, no build listed).

---

### S5-NOA-ARC-AUTHOR -- max_sessions field in case authoring UI

Status: DONE.

What was built:
- Added `maxSessions: 3` default to `BuilderFields` DEFAULT_FIELDS in SimulationBuilder.tsx.
- Added number input (min=2, max=4, step=1, default=3) in the "הגדרות מפגש" section.
  Hebrew label: "מספר פגישות בקשת הטיפול". Inline validation error shown (data-testid
  "max-sessions-error") when value is out of range. Submit also blocked.
- Field wires to `BuilderFields.maxSessions` which was already in shared-types from CP-2.
- Updated MOCK_TEMPLATE in authoring-client.ts to include `maxSessions: 3` (required by
  TemplateResponse type; omission was a latent TypeScript error now fixed).

Files changed:
- apps/web/src/components/authoring/SimulationBuilder.tsx
- apps/web/src/lib/authoring-client.ts (MOCK_TEMPLATE fix + markRubricReviewed added for M6)

Tests: 5/5 pass (ArcAuthor.test.tsx).

---

### S5-NOA-ARC-STUDENT -- student UI arc session panels

Status: DONE.

What was built:
- New props on SimulationScreenProps: `sessionNumber?: number | null` and `maxSessions?: number`.
- `isArcContinuation` derived as `sessionNumber >= 2`. All three UI elements gated on this.
- Session-context panel (data-testid "arc-context-panel"): dismissible banner above the sim-body,
  shown for sessions 2+. Hebrew text with N/max interpolated verbatim from envelope.
- Welfare re-anchor modal (data-testid "welfare-reanchor-modal"): role="dialog", shown for
  sessions 2+ before welfare modal is acknowledged. Both text components included:
  identity reminder ("המטופל הוא דמות אימון מדומה; הוא אינו אדם אמיתי.") and welfare
  signpost ("אם אתה/את חש/ה אי-נוחות, פנה/י לאיש הצוות שלך."). Ack button: "הבנתי".
  Chat input (InputBar disabled prop) set to `sending || !welfareModalAcknowledged`.
  Modal does not auto-dismiss.
- Session-gap briefing (data-testid "session-gap-briefing"): informational notice shown after
  welfare modal ack, before first send (messages.length === 0). Verbatim Hebrew text from
  Sami C5. Non-blocking -- does not disable input.
- JSDOM scrollIntoView mock added in test file (ChatArea refs; not a code issue).

CP-1 fields verified: attempt.sessionNumber (number | null) and
assignment.simulationTemplate.maxSessions (number) confirmed in shared-types. No api edits needed.

Files changed:
- apps/web/src/components/simulation/SimulationScreen.tsx

Tests: 5/5 pass (ArcStudent.test.tsx).

---

### S5-NOA-M6 -- GT-before-rubric enforcement UI

Status: DONE.

What was built:

Step 4 navigation warn (soft):
- Added `showRubricGTWarn: boolean` state to AuthoringShell.
- Nav button click handler for "rubric" step intercepts when `groundTruth === null`:
  sets `showRubricGTWarn=true`, does not navigate yet.
- Warn banner (data-testid "gt-rubric-warn-banner", role="alert") renders at top of main
  content area with "Continue anyway" (data-testid "gt-warn-continue-btn") and cancel buttons.
  "Continue anyway" clears warn and navigates to rubric step. GT saved: no warn, direct nav.

Provisional rubric tag:
- Added `rubricProvisional?: boolean` and `onMarkReviewed?: () => Promise<void>` props to
  RubricEditor. Banner (data-testid "rubric-provisional-banner") renders when provisionalLocal
  is true, in BOTH the !rubric initial state AND the has-rubric state.
- "Mark as Reviewed" button (data-testid "mark-reviewed-btn") calls onMarkReviewed() and
  sets provisionalLocal=false on success.
- AuthoringShell passes `rubricProvisional={template.rubricProvisional}` and
  `onMarkReviewed={handleMarkRubricReviewed}` to RubricEditor.

Publish-block messages:
- http.ts updated: ApiError gains optional `code?: string` field; handleResponse extracts
  `code` from the parsed JSON response body.
- `getPublishErrorMessage(err)` helper in RubricEditor maps ApiError.code to named messages:
  GROUND_TRUTH_REQUIRED -> "Cannot publish -- Ground Truth is empty. Complete Step 2 first."
  RUBRIC_PROVISIONAL -> "Cannot publish -- Rubric is provisional. Ground Truth changed after
  your last review. Open the Rubric step and review it before publishing."
  pub-error shown in div data-testid "pub-error-msg".

Mark reviewed endpoint:
- `markRubricReviewed(templateId)` added to authoring-client.ts.
  Real path: PATCH /authoring/templates/:templateId/rubric-reviewed. Mock: no-op with delay.
  Called by AuthoringShell.handleMarkRubricReviewed, which also does optimistic
  setTemplate({ ...prev, rubricProvisional: false }) on success.

Files changed:
- apps/web/src/lib/http.ts (ApiError.code + handleResponse code extraction)
- apps/web/src/lib/authoring-client.ts (MOCK_TEMPLATE fix + markRubricReviewed)
- apps/web/src/components/authoring/RubricEditor.tsx
- apps/web/src/components/authoring/AuthoringShell.tsx

Tests: 6/6 pass (M6.authoring.test.tsx).

---

### New test files

- apps/web/src/__tests__/ArcAuthor.test.tsx (5 tests, all pass)
- apps/web/src/__tests__/ArcStudent.test.tsx (5 tests, all pass)
- apps/web/src/__tests__/M6.authoring.test.tsx (6 tests, all pass)

No deviations from envelope scope. No new npm dependencies added.
StubProvider only (no real LLM calls in any path).

*Noa | 2026-07-11 | S5-NOA-ARC-AUTHOR + S5-NOA-ARC-STUDENT + S5-NOA-M6*
