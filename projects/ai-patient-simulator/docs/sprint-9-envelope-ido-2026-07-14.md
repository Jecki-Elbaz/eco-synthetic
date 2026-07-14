# Sprint 9 Task Envelopes -- REHEARSAL PREP + PRODUCTION HARDENING
# Author: Ido (VP R&D) | Date: 2026-07-14 | Requester: Eco (CEO)
# Board: APS-026 (Sprint 9; two parallel tracks)
# Sprint 8 close baseline (source: review-sprint-8-oren.md FIX STATUS + APS-025 close):
#   api tsc 0 | nest build 0 | api unit 316/0-fail/8-skip (23 suites)
#   integration 9/9 90/0-fail/2-skip | engine 212/212 | web 43/43 + tsc 0 | E2E 34/34
# Scale: Gal ~1.0 eng-days | Adi ~2.0-2.5 eng-days | Sami on-demand (small) | Track H <= ~1.0 eng-days

---

## Standing constraints (carry from Sprint 8 unchanged)

- StubProvider only. No real LLM.
- No new npm dependencies. Any new dep: flag to gate, do not adopt.
- No agent git commits. Owner commits from terminal.
- No agent contacts Adam. Owner relays only.
- Red line 3: no destructive commands without explicit A1 in this session.

---

## Two-track structure

TRACK R (Rehearsal Prep) and TRACK H (Production Hardening) run FULLY IN PARALLEL.
No code dependencies exist across tracks. Only constraint is test-suite file ownership.

COORDINATION RULE (only shared surface between tracks):
  Gal owns simulation-turn.integration.spec.ts this sprint (R1 assertion).
  Adi's H3 exemplar (S9-ADI-TRYFIN) MUST use arc.integration.spec.ts or
  dsr-live.integration.spec.ts -- NOT simulation-turn.integration.spec.ts.
  No two agents modify the same spec file concurrently.
  On any unexpected file overlap: stop, flag to Ido before proceeding.

---

## H1-H5 rulings (Ido, 2026-07-14, A3)

H1 -- ABANDONED-status cache eviction (Oren S7 INFO-1): IN.
  Mechanism: max-entries size bound on the arcContextCache Map in SimulationService.
  Rationale: Eco confirmed terminal transitions live in SupportService (lines ~229/233/365),
  NOT SimulationService. Wiring eviction hooks cross-service is an unnecessary coupling seam
  for a pilot where nothing sets ABANDONED today. A size bound prevents unbounded growth
  regardless of which code path fires the terminal status later. Clean, no coupling, low
  effort. Task S9-GAL-EVICT.

H2 -- Purge dual-copy unification (Oren S8 MINOR-1): DEFER through pilot.
  Rationale: Eco's Sprint-8 ruling (runner independence from dist builds) is a considered
  technical decision. MUST-STAY-IN-SYNC comments are in place. Purge job is DISABLED_JOBS
  until go-live. Unification via createRequire-from-dist adds a build-precondition
  dependency that contradicts the isolation goal. Revisit at go-live when the job is
  enabled. Pre-production mandate already recorded in APS-022.

H3 -- Integration-test try/finally baseline (Oren S8 MINOR-2): IN.
  Scope: one exemplar retrofit + new-specs-only convention going forward.
  Rationale: retrofitting all 9 existing suites risks destabilizing passing tests for a
  pattern-only change. One retrofit with a convention comment is proportionate; every new
  spec from Sprint 9 onward follows it. Task S9-ADI-TRYFIN.

H4 -- DSR export (access-request) workflow: DEFER to APS-004 go-live gate.
  Rationale: no real students means no DSR requests in flight. This item belongs with the
  APS-004 legal/data-handling gate bundle, not in a rehearsal-prep sprint.

H5 -- Teacher arc-history RBAC view: DEFER pending Perry product requirement.
  Rationale: no requirement defined. Not building schema-touching features without a spec.
  Perry to define; fold into a future envelope.

R4 ruling -- Sami pre-rehearsal read: IN.
  Sami set the original C1-C5 clinical conditions. A pre-rehearsal read of the (h)
  4-invariant checklist in the runbook is low cost and guards against clinical framing
  gaps the QA + engineering layers cannot catch. On-demand invoke after R2 CP-DONE.

---

## TRACK R -- REHEARSAL-PREP WEEK

Objective: prepare all agent-executable evidence and tester scripts for the 2026-08-15
owner-run rehearsal. Owner runs the rehearsal (browser + DB). Agents prepare the
environment, close Gap-1, write the runbook, and dress-run the automatable evidence paths.

---

### Envelope: Gal -- Track R

task_id: S9-GAL-GAP1
effort: ~0.5 eng-days
priority: P1
start: 2026-07-14 (no dependency; parallel with Adi R2 and Track H)
note: Gal does S9-GAL-GAP1 (R1, P1) before S9-GAL-EVICT (H1, P2); both in same session.

#### Permitted Bash commands -- Gal (Rambo C3; exhaustive; applies to all Gal S9 tasks)

1.  `pnpm --filter @aps/api build` -- nest build
2.  `pnpm --filter @aps/api test` -- api unit suite
3.  `pnpm --filter @aps/api test:integration` -- live-Postgres integration suite
4.  `pnpm --filter @aps/api exec tsc --noEmit` -- typecheck
5.  `pnpm --filter @aps/engine-test-harness test` -- engine test harness
6.  `pnpm --filter @aps/web test` -- web unit suite
7.  `node apps/api/src/scripts/e2e-golden-path.mjs` -- E2E runner

No migration commands. No seed. No docker. No git.
Any command not on this list: stop, flag to Ido.

---

#### S9-GAL-GAP1 -- Close readiness Gap-1: analyserOutput persistence assertion

Context: rehearsal-readiness-adi-2026-07-11.md Gap-1 (STANDS per addendum).
  No test asserts PatientStateLog.analyserOutput is non-null after a live processTurn
  call. Engine-level analyserResult population is confirmed in turn-pipeline.spec.ts.
  This gap is the DB-column persistence leg. Required to close rehearsal READY-WITH-GAPS
  status on criterion (c).

File to modify: apps/api/src/__tests__/simulation-turn.integration.spec.ts
  Add ONE new assertion to the existing processTurn test block. Do NOT create a new spec
  file. Do NOT modify any existing assertion.

Pre-work: read the Prisma schema (schema.prisma) to confirm the exact column name on
  PatientStateLog for the analyser output field. It is likely analyserOutput or
  interactionAnalysis. Use the actual schema name in the assertion.

New assertion (add after the existing PatientStateLog trust-value assertions):
  Query the PatientStateLog row for the tested turn after a live processTurn call:
    expect(stateLogRow.<columnName>).not.toBeNull();
  where <columnName> is the confirmed schema field name.

STOP condition: if analyserOutput IS null after processTurn, do NOT patch service code.
  Flag to Ido immediately with: column name, actual value, Prisma query used.
  This is a rehearsal NO-GO signal, not a Gal fix item.

Self-verify before CP-DONE:
  - `pnpm --filter @aps/api test:integration`: 9/9 suites / >= 91 / 0-fail / <= 2-skip
    (+1 from the new assertion; baseline 90)
  - `pnpm --filter @aps/api test`: >= 316 / 0-fail / <= 8-skip (no regression)
  - `pnpm --filter @aps/api exec tsc --noEmit`: 0 errors
  - `pnpm --filter @aps/api build`: exit 0
  - `node apps/api/src/scripts/e2e-golden-path.mjs`: 34/34

CP-DONE signal to Eco/Ido:
  - Exact column name used and assertion text.
  - Full integration suite result (suites / count / fail / skip).
  - PASS or STOP.

---

### Envelope: Adi -- Track R

task_ids: S9-ADI-RUNBOOK (R2), S9-ADI-DRESSRUN (R3)
effort: R2 ~1.0 eng-day | R3 ~0.5-1.0 eng-day
priority: P1
sequencing: R2 first; R3 starts ONLY after S9-ADI-RUNBOOK CP-DONE.

#### Permitted Bash commands -- Adi (Rambo C3; exhaustive; applies to all Adi S9 tasks)

1. `pnpm --filter @aps/engine-test-harness test` -- engine test harness
2. `pnpm --filter @aps/api test` -- api unit suite
3. `pnpm --filter @aps/api test:integration` -- integration suite
4. `pnpm --filter @aps/web test` -- web unit suite
5. `node apps/api/src/scripts/e2e-golden-path.mjs` -- E2E runner

ENVELOPE-SCOPED RAMBO-C3 ADDITION -- R3 (S9-ADI-DRESSRUN) ONLY:
  6. `pnpm --filter @aps/db seed` -- re-seed development environment (dress-run reset only)
  7. `pnpm --filter @aps/api dev:boot` -- boot API server in dev mode on :3001 (dress-run only)

Commands 6 and 7 are PERMITTED for S9-ADI-DRESSRUN ONLY. They are NOT permitted for
S9-ADI-RUNBOOK (R2) or S9-ADI-TRYFIN (H3). This addition is scoped to this sprint
envelope only; it does not carry to future sprints without a new envelope grant.
No build commands. No migrations. No git.
Any command not on this list: stop, flag to Ido.

---

#### S9-ADI-RUNBOOK (R2) -- 15-Aug rehearsal runbook

Output file: projects/ai-patient-simulator/docs/rehearsal-runbook-15aug.md

Primary sources (read both before writing; they supersede each other on corrections):
  - docs/rehearsal-plan-15aug-ido-2026-07-11.md (incl. Eco addendum at bottom)
  - docs/rehearsal-readiness-adi-2026-07-11.md (incl. Eco gap-resolutions addendum)

The runbook is the tester's exact operating script for 2026-08-15. It is structured
per-criterion (a)-(i) and must be self-contained: a tester follows it without needing
to cross-reference the rehearsal plan or readiness map.

REQUIRED SECTIONS (in order):

1. ENVIRONMENT RESET PROCEDURE
   Must be the first section. Steps:
   a. Boot API in dev/debug mode on :3001 (arc-context + guard-prompt logging on):
        `pnpm --filter @aps/api dev:boot`
   b. Confirm API responding: `curl -s http://localhost:3001/auth/me` returns 401
      (or equivalent health check -- use the pattern from E2E runner bootstrap).
   c. Re-seed: `pnpm --filter @aps/db seed`
   d. Verify seed state (query DB or use the E2E runner's own verification pattern):
        - College "Gome Gevim Rehearsal" exists
        - Accounts: rehearsal-teacher (TEACHER), rehearsal-student (STUDENT),
          rehearsal-admin (SYSTEM_ADMIN)
        - Template: published, maxSessions=3, rubricProvisional=false, challengeLevel 2-3,
          groundTruth fully populated
        - CreditLedger: 50 credits for rehearsal course
        - ArcSessionSummary count for rehearsal-student on seeded template = 0 (clean arc)
   Note: this is the same recipe used in E2E golden-path; mirror that bootstrap pattern.

2. DEV-LOGGING PREREQUISITE CHECK (Oren i-4)
   Before criterion (g): confirm API running with arc-context + guard-prompt logging enabled.
   Verification step: send one test turn in any session; look for guard-prompt log line in
   the API console (look for the string "buildGuardPrompt" or equivalent guard-logger prefix).
   If no log line visible: STOP -- flag to Ido before proceeding with criterion (g).
   Criterion (g)'s evidence path (support prompt contains no patient fields) requires
   dev-mode logging. Without it, the (g) evidence is behavioral-only and weaker.

3. PER-CRITERION TESTER SCRIPT (a)-(i)
   Each criterion section must contain ALL five of:
     CREDENTIALS: exact account (rehearsal-teacher / rehearsal-student / rehearsal-admin)
                  + how to obtain the invite token from the seed output or DB.
     CLICKS/COMMANDS: exact URL path, button labels, sequence of actions (step by step).
     EXPECTED OBSERVATIONS: what a passing system shows (not what to do -- what to see).
     EVIDENCE-CAPTURE TEMPLATE: exact filename pattern + destination folder.
     PASS BAR: verbatim from rehearsal plan, with corrections applied below.

   === CRITERION (f) -- PASS-BAR CORRECTION (Eco addendum 2026-07-11, code-verified) ===
   The rehearsal plan's original wording ("confirm 402") does NOT match the build.
   Credit enforcement fires at the TURN level (engine InputGate CREDIT_HARD_LIMIT via
   HardLimitExceededException in credit-ledger.service.ts). There is NO 402 path anywhere.
   getOrCreateAttempt (org.service.ts) contains no credit logic.
   CORRECT EXPECTATION: at exhausted credit, attempt-create SUCCEEDS (HTTP 201 is CORRECT,
   not a failure). The first TURN returns the blocked result in the UI.
   The runbook (f) section MUST state: "attempt-create returning 201 = CORRECT, not a
   failure of criterion (f)."
   The pass bar for (f): attempt-create 201 + first-turn blocked result visible in UI.
   Do NOT write "confirm 402" anywhere in the (f) section of the runbook.
   Tester action for (f): use rehearsal-admin to set course hardLimit to 0 via credit-admin
   UI (or API equivalent), then login as rehearsal-student and start a new session.
   Observe: attempt-create succeeds; first turn shows blocked/credit-limit UI response.

   === CRITERION (h) -- 4-INVARIANT CHECKLIST at 3-SESSION DEPTH ===
   All 3 sessions run CONTIGUOUSLY, SAME TESTER, SAME BROWSER, SAME DAY.
   Do not split arc sessions across a break.

   For each of the 4 invariants, the runbook section must include:

   INVARIANT 1 (Trust continuity):
     After session 2: run DB query to get ArcSessionSummary.finalTrustLevel for session 1.
       Query pattern (adapt to actual Prisma schema field names):
         SELECT "finalTrustLevel" FROM "ArcSessionSummary"
         WHERE "userId" = '<rehearsal-student-id>' AND "sessionNumber" = 1;
     After session 3: same query for sessionNumber = 2.
     Cross-check: the trust value loaded at session N+1 start (in API log:
       look for "ArcLoaderService" + "arc context loaded" log line at session start)
       MUST equal finalTrustLevel from session N's ArcSessionSummary row.
     Evidence: screenshot or copy of DB query output after each session.

   INVARIANT 2 (No invented facts through guard):
     During a session-2 or session-3 turn: search the API console for the guard prompt
     log line. Confirm the guard prompt text does NOT contain content from
     notableMomentsSummary (arc context). The guard model receives only authored
     SimulationTemplate ground truth.
     Exact check: any arc-summary content (distinctive phrases from the session summary)
     must NOT appear in the guard prompt log. The arc block goes to the patient-context
     builder only (labeled "PRIOR SESSION CONTEXT -- context only, not ground truth").
     Evidence: API log excerpt of guard prompt for one session-2 or session-3 turn.

   INVARIANT 3 (Welfare modal fires + blocks):
     At session 2 start (before any turn sent):
       Confirm modal fires automatically.
       Confirm both Hebrew text components present:
         "המטופל הוא דמות אימון מדומה; הוא אינו אדם אמיתי."
         "אם אתה/את חש/ה אי-נוחות, פנה/י לאיש הצוות שלך."
       Confirm textarea/chat input is DISABLED (cannot type until "הבנתי" clicked).
       Confirm modal does NOT auto-dismiss (must wait for tester to click "הבנתי").
     Repeat at session 3 start.
     Evidence: screenshot of modal at each of sessions 2 and 3.

   INVARIANT 4 (Session-gap briefing fires after ack):
     After clicking "הבנתי" and before sending any message:
       Confirm Hebrew briefing text visible (states the session gap limitation
       per Sami C5; messages.length === 0 at this point).
       Confirm briefing is non-blocking (textarea is now enabled; tester can type).
     Repeat at session 3.
     Evidence: screenshot of briefing text visible, chat input enabled, no messages yet.

   ARC CAP (session 4 blocked):
     After completing session 3: attempt to create session 4 for the same student + template.
     Confirm: 403 with code="ARC_COMPLETE" in network tab.
     Evidence: screenshot of browser network tab showing 403 ARC_COMPLETE on attempt-create.

4. 3-CONTIGUOUS-SLOT SCHEDULE
   Include the following schedule verbatim in the runbook (from rehearsal plan):
     09:00 -- Environment reset, seed, verify prerequisites
     09:30 -- (g) support isolation check (quick)
     10:00 -- (a)/(b)/(c)/(d) in one session (arc session 1; also covers single-session criteria)
     11:15 -- TIME CHECKPOINT (Oren i-5): if 10:00 block not finished, shift (h) block WHOLE;
              never split arc sessions across a break
     11:30 -- (h) arc sessions 2 and 3 (contiguous; both same morning block)
     13:30 -- (e) interrupt-and-resume
     14:00 -- (f) credit hard-limit
     14:30 -- (i) author-preview
     15:30 -- Ido reviews all evidence packages
     17:00 -- GO/NO-GO ruling delivered to Eco

5. ROLE-SWITCH PROTOCOL (Oren i-5)
   Use a SINGLE browser tab for all role switches.
   Procedure for each role switch:
     a. Logout (clear session cookie + local storage if needed).
     b. Login with the target role's credentials.
     c. Confirm the correct role's landing page loads (student dashboard / teacher authoring /
        admin panel) before taking any evidence screenshot.
     d. Only then take the evidence screenshot.
   Criterion (i) requires 3 role switches (teacher -> student -> admin). Apply this protocol
   at each switch. Document the switching order in the (i) section of the runbook.

6. EVIDENCE-CAPTURE TEMPLATES
   Naming convention: rehearsal-evidence-<criterion>-<type>-<detail>.png (or .txt for logs)
   Examples:
     rehearsal-evidence-h-welfare-modal-session2.png
     rehearsal-evidence-h-arc-cap-403.png
     rehearsal-evidence-f-first-turn-blocked.png
     rehearsal-evidence-g-support-prompt-log.txt
     rehearsal-evidence-i-student-dashboard-no-preview.png
   Destination folder: projects/ai-patient-simulator/docs/rehearsal-evidence-15aug/
   Adi creates the folder on disk during R3 dress run. Owner populates the evidence
   package with real screenshots on 2026-08-15.

Self-verify before CP-DONE (R2):
  - The runbook is self-contained (no cross-reference required to follow it).
  - Every criterion (a)-(i) has all five required elements.
  - Criterion (f): "attempt-create 201 = CORRECT" stated; no "402" wording present.
  - Criterion (h): all 4 invariants with exact DB query patterns and log search strings.
  - 11:15 time-checkpoint and contiguous-arc rule documented.
  - Role-switch protocol documented.
  - Dev-logging prereq check (Oren i-4) in section 2.
  - Evidence-capture templates and destination folder named.

CP-DONE signal (R2): file path docs/rehearsal-runbook-15aug.md.

---

#### S9-ADI-DRESSRUN (R3) -- Dress run of automatable evidence paths

START CONDITION: S9-ADI-RUNBOOK CP-DONE.

Purpose: execute the scripted/API-verifiable portions of the runbook once end-to-end
and record results. Browser-judgment steps (d teacher override UI, reading modal text live,
visual confirmation of briefing content) are owner-day items, not dress-run items.
Dress run covers the API/automation evidence paths for criteria (e), (f), (g), (h), (i).

SETUP (R3-only commands):
  Run the environment reset from the runbook:
  1. `pnpm --filter @aps/api dev:boot` -- boot API on :3001 in dev mode
  2. `pnpm --filter @aps/db seed` -- re-seed
  3. Verify: ArcSessionSummary count for rehearsal-student on seeded template = 0
     (DB query or E2E runner bootstrap check)
  4. Confirm server responding on :3001 (first E2E step or targeted probe)
  Create evidence folder: projects/ai-patient-simulator/docs/rehearsal-evidence-15aug/

DRESS-RUN PATHS:

(e) Session resume -- use E2E runner:
  `node apps/api/src/scripts/e2e-golden-path.mjs`
  Confirm steps 25a-25d pass (in-progress session created, resume card present in
  dashboard response, prior turns visible on resume, new turn succeeds post-resume).
  Record: step 25a-25d result (PASS / FAIL per step).

(f) Credit hard-limit -- API path:
  Use the credit-admin endpoint to set rehearsal course hardLimit to 0 (rehearsal-admin
  creds; POST to /admin/credits or equivalent endpoint per CA-INT-006 seed pattern).
  Then: POST /assignments/:id/attempts as rehearsal-student (expect HTTP 201 -- CORRECT).
  Then: POST first turn for that attempt (expect blocked result; CREDIT_HARD_LIMIT).
  Use node fetch (same pattern as e2e-golden-path.mjs bootstrap) or targeted API call.
  If the admin endpoint path is unclear from the E2E runner, document "PATH UNCLEAR" and
  escalate to Ido/Gal; do NOT guess endpoint paths.
  Record: attempt-create HTTP status (201 = PASS) + first-turn response body (blocked
  result = PASS; error or crash = FLAG).

(g) Support isolation -- API path:
  The support module is DETERMINISTIC (Gap-3 resolved; no LLM call; no prompt to inspect).
  Verify: POST to the support endpoint with rehearsal-student creds + a message referencing
  clinical content. Confirm response body contains no groundTruth / patientState /
  analyserOutput / PatientStateLog fields.
  If the support endpoint path is not in the E2E runner, check the runbook (from docs) or
  the API route list. Do NOT guess paths.
  Record: response body excerpt (confirm no patient-state fields present).
  Note in report: "support module is deterministic; structural isolation confirmed in
  Sprint-6 support.spec.ts; behavioral confirmation is the only rehearsal-day live check."

(h) Arc structure -- E2E runner + DB queries:
  Run E2E arc steps 29-34 (session 1 COMPLETED -> session 2 -> session 3 -> arc-cap 403).
  `node apps/api/src/scripts/e2e-golden-path.mjs`
  Confirm all 6 arc steps pass.
  After the E2E arc run: query ArcSessionSummary for rehearsal-student; record
  finalTrustLevel for each of sessions 1, 2, 3 (confirm non-null; within ceiling 0.70).
  Record: E2E steps 29-34 pass/fail per step; DB query output (session numbers + trust values).
  Note in report: "full browser arc run (welfare modal visual check, gap briefing text) is
  owner-day only -- E2E steps confirm the underlying DB transitions and arc cap."

(i) Author-preview -- E2E runner:
  Run E2E steps 20b and 20e (credit balance unchanged after preview; student dashboard
  excludes AUTHOR_PREVIEW attempt).
  `node apps/api/src/scripts/e2e-golden-path.mjs`
  Record: steps 20b + 20e result (PASS / FAIL).

FULL GATE RE-CONFIRM after dress run (before writing report):
  `node apps/api/src/scripts/e2e-golden-path.mjs` -- 34/34 expected.
  (The seed was re-run; confirm the full E2E suite still passes against the fresh seed.)

FAILURE PROTOCOL:
  Any path that does not meet expected result: record actual output; flag to Ido/Eco.
  Do NOT attempt to fix code. Do NOT re-run to mask a failure. One flag-and-stop per issue.

DRESS-RUN REPORT:
  File: docs/dress-run-report-adi-2026-07-14.md (use actual date if different)
  Structure: per-path table with columns: criterion | expected result | actual result | verdict
  Verdict values: PASS | FLAG
  For each FLAG: append a brief failure description (endpoint called, actual HTTP status /
  response, deviation from expected, Ido action needed).
  Summary line: N paths run / N PASS / N FLAG.

Self-verify before R3 complete:
  - Full E2E 34/34 confirmed on fresh seed post-dress-run.
  - Dress-run report written with all 5 paths documented.
  - rehearsal-evidence-15aug/ folder created on disk.
  - Any FLAG flagged to Ido same session.

---

## TRACK H -- PRODUCTION HARDENING

Objective: close pre-production mandates from Sprints 7 and 8 that are in scope this
sprint. Budget: <= ~2 eng-days combined (Gal H1 + Adi H3).

---

### Envelope: Gal -- Track H

task_id: S9-GAL-EVICT (H1)
effort: ~0.5 eng-days
priority: P2
start: 2026-07-14 (no dependency; after S9-GAL-GAP1 is CP-DONE or interleaved)
note: Gal's Track R task (S9-GAL-GAP1, P1) takes precedence. Start H1 after R1 CP-DONE
  or while waiting for integration suite run to complete.

Permitted Bash commands: same exhaustive list as S9-GAL-GAP1 above. No additions.

---

#### S9-GAL-EVICT (H1) -- arcContextCache max-entries size bound

Context: Oren S7 INFO-1 + Sprint-8 pre-production mandate.
  arcContextCache in SimulationService evicts on COMPLETED only. Terminal transitions
  to ABANDONED / TECHNICALLY_AFFECTED / TECHNICAL_FAILURE_CONFIRMED / RETRY_AUTHORISED
  live in SupportService (not SimulationService). Nothing sets ABANDONED today.
  Sprint-8 mandate: if terminal statuses do NOT flow through SimulationService ->
  implement a max-entries guard on the Map.
  Ruling (H1 above): max-entries size bound. No cross-service hooks.

Pre-work: read simulation.service.ts to confirm:
  - Exact field name of the arcContextCache Map.
  - All call sites where .set() is used (arc context written).
  - Approximate max concurrency at pilot scale (expected < 50 concurrent attempts).

DESIGN (adapt to actual field name and .set() sites found):
  After every this.arcContextCache.set(attemptId, context) call:
    if (this.arcContextCache.size > MAX_ARC_CACHE_ENTRIES) {
      const oldestKey = this.arcContextCache.keys().next().value;
      this.arcContextCache.delete(oldestKey);
    }
  Define MAX_ARC_CACHE_ENTRIES as a private readonly constant in the class.
  Suggested value: 500 (far above any expected pilot concurrency; document the choice).
  Map insertion order is guaranteed by the JS spec; first key = oldest entry.

  If .set() is called in multiple places, apply the guard at each .set() site.
  If the guard logic would be repeated: extract a private setWithBound(key, value)
  helper method. Gal's judgment call.

UNIT TEST (required; add to the existing SimulationService unit test file):
  Test name: "arcContextCache evicts oldest entry when size exceeds MAX_ARC_CACHE_ENTRIES"
  Setup: seed the service's arcContextCache Map with MAX_ARC_CACHE_ENTRIES entries
    (access the private cache directly in the test via (service as any).arcContextCache,
    or by the pattern used in existing service unit tests for private fields).
  Action: trigger the code path that calls .set() on a new entry.
  Assertions:
    - cache.size === MAX_ARC_CACHE_ENTRIES (bound holds; did not grow beyond)
    - cache.has(oldestKeyFromSetup) === false (oldest evicted)
    - cache.has(newKey) === true (new entry present)
  Do NOT write an integration test for this; unit-level Map behavior only.

Self-verify before CP-DONE:
  - `pnpm --filter @aps/api build`: exit 0
  - `pnpm --filter @aps/api exec tsc --noEmit`: 0 errors
  - `pnpm --filter @aps/api test`: >= 317 / 0-fail / <= 8-skip (new eviction test passes;
    +1 from H1 over the 316 baseline)
  - `pnpm --filter @aps/api test:integration`: 9/9 / >= 90 / 0-fail / <= 2-skip (no regression;
    note R1 may have already moved integration to >= 91 -- no regression from H1 is the bar)
  - `node apps/api/src/scripts/e2e-golden-path.mjs`: 34/34

CP-DONE signal:
  - MAX_ARC_CACHE_ENTRIES value chosen and rationale.
  - Number of .set() sites patched.
  - Unit test name + result.
  - Full api unit suite count (suites / total / fail / skip).

---

### Envelope: Adi -- Track H

task_id: S9-ADI-TRYFIN (H3)
effort: ~0.5 eng-days
priority: P2
start: after S9-ADI-DRESSRUN (R3) is reported to Eco/Ido. Adi prioritizes Track R first.
  H3 is independent of R1/H1 in code (different files); it is sequenced after R3 to keep
  Adi's sessions focused.

Permitted Bash commands: same exhaustive list as for S9-ADI-RUNBOOK/DRESSRUN above.
  R3-only additions (commands 6 and 7) are NOT permitted for H3.

---

#### S9-ADI-TRYFIN (H3) -- Integration-test try/finally exemplar + convention

Context: Oren S8 MINOR-2 (pattern-level tech debt; no try/finally in beforeAll/afterAll
  across integration specs; mid-seed failure orphans partial rows in the test DB).

SCOPE: one exemplar retrofit + convention comment. No mass-retrofit of existing suites.

EXEMPLAR FILE: choose one of:
  - apps/api/src/__tests__/arc.integration.spec.ts
  - apps/api/src/__tests__/dsr-live.integration.spec.ts
  NOT simulation-turn.integration.spec.ts (coordination rule; Gal owns it this sprint).

RETROFIT (adapt to the actual structure of the chosen spec):
  Wrap the existing beforeAll seeding logic in try/catch:
    beforeAll(async () => {
      try {
        // existing seed logic (unchanged)
      } catch (err) {
        // cleanup on seed failure to avoid orphan rows
        await prisma.$disconnect();
        throw err;
      }
    });
  Wrap the existing afterAll teardown logic in try/finally:
    afterAll(async () => {
      try {
        // existing teardown logic (unchanged)
      } finally {
        await prisma.$disconnect(); // disconnect even if teardown fails mid-way
      }
    });
  Do not change any test assertions or seed data values.
  Observable test results must be identical before and after the retrofit.

CONVENTION COMMENT (required; add at the top of the chosen spec file, below the
  existing file-header comment block):
  // CONVENTION (Sprint 9, S9-ADI-TRYFIN): all integration specs MUST wrap
  // beforeAll/afterAll seed+teardown in try/finally (afterAll) and try/catch (beforeAll)
  // to prevent partial-seed orphan rows on test failure.
  // Exemplar: this file. Pattern applies to all new integration specs from Sprint 9 onward.
  // Ref: Oren S8 MINOR-2, review-sprint-8-oren.md.

Self-verify before CP-DONE:
  - `pnpm --filter @aps/api test:integration`: 9/9 / >= 90 / 0-fail / <= 2-skip
    (no regression; pass count must not decrease)
  - `pnpm --filter @aps/api test`: >= 316 / 0-fail / <= 8-skip (no regression)

CP-DONE signal: file retrofitted, convention comment added, integration suite result,
  confirmation that pass count is unchanged.

---

## R4 -- Sami pre-rehearsal clinical read (Ido A2 invoke)

trigger: Ido invokes Sami after S9-ADI-RUNBOOK (R2) CP-DONE.
authority: A2 (Ido invokes Sami on-demand for domain expertise).
effort: small, one session.

Scope of Sami's read:
  File: docs/rehearsal-runbook-15aug.md, criterion (h) section only.
  Sami reads the 4-invariant checklist (Invariants 1-4) plus the ARC CAP check.
  Specifically: confirm the clinical framing of each invariant is sound against the
  conditions he set (C1-C5 from sme-clinical-note-3v2-session-arc-2026-07-11.md).

Sami flags:
  - Any invariant whose pass bar would accept a clinically unsound behavior.
  - Any trust/openness/alliance value range in the evidence-capture templates that
    falls outside the expected pilot range given C4 ceilings (0.70/0.65/0.70).
  - Any wording in the welfare modal check that misrepresents the C3 requirement.
  Read-and-flag only. No code changes. No test changes.

Output: Sami's notes to Ido directly (A2 channel). If Sami flags an issue: Ido rules
  same day whether an R2 runbook revision is needed. If no flags: Sami closes with
  "no clinical framing gaps found" -- equally valid.

---

## Acceptance criteria -- per agent

Gal (S9-GAL-GAP1 / R1):
  [ ] One new assertion added to simulation-turn.integration.spec.ts.
  [ ] Assertion: PatientStateLog.<analyserField> is not null after processTurn.
  [ ] Schema field name confirmed before writing (no guess on column name).
  [ ] Integration suite: 9/9 / >= 91 / 0-fail / <= 2-skip.
  [ ] api unit >= 316 / 0-fail / <= 8-skip (no regression).
  [ ] tsc 0; nest build exit 0; E2E 34/34.
  [ ] CP-DONE includes PASS or STOP result with actual value if STOP.

Gal (S9-GAL-EVICT / H1):
  [ ] arcContextCache size bound added (post-set eviction of oldest; Map insertion order).
  [ ] MAX_ARC_CACHE_ENTRIES defined as a constant; value documented.
  [ ] Unit test confirms: size === MAX after adding entry at bound; oldest evicted; new present.
  [ ] api unit >= 317 / 0-fail / <= 8-skip (R1 + H1 together add >= 1 to unit suite or
      integration suite; both tracks combined must not regress the 316 baseline).
  [ ] tsc 0; nest build exit 0; integration >= 90 no regression; E2E 34/34.

Adi (S9-ADI-RUNBOOK / R2):
  [ ] docs/rehearsal-runbook-15aug.md written.
  [ ] Section 1: environment reset procedure (dev:boot + seed + verify).
  [ ] Section 2: dev-logging prereq check (Oren i-4) with stop condition if no log line.
  [ ] Per-criterion (a)-(i): credentials, clicks/commands, expected obs, evidence template, pass bar.
  [ ] Criterion (f): "attempt-create 201 = CORRECT" stated; no "402" wording.
  [ ] Criterion (h): all 4 invariants with exact DB query patterns + API log search strings.
  [ ] 3-contiguous-slot schedule + 11:15 checkpoint + never-split rule documented.
  [ ] Role-switch protocol (Oren i-5) documented with 3-role sequence for (i).
  [ ] Evidence file naming convention + rehearsal-evidence-15aug/ folder named.

Adi (S9-ADI-DRESSRUN / R3):
  [ ] Environment reset executed (dev:boot + seed; arc count = 0 confirmed).
  [ ] rehearsal-evidence-15aug/ folder created on disk.
  [ ] All 5 dress-run paths executed: (e)(f)(g)(h)(i).
  [ ] dress-run-report-adi-*.md written with expected/actual/PASS-or-FLAG per path.
  [ ] Any FLAG: flagged to Ido same session; not papered over.
  [ ] E2E 34/34 confirmed post-dress-run on fresh seed.

Adi (S9-ADI-TRYFIN / H3):
  [ ] try/finally added to afterAll + try/catch to beforeAll in chosen spec.
  [ ] Chosen file is arc.integration.spec.ts or dsr-live.integration.spec.ts (NOT simulation-turn).
  [ ] Convention comment added at top of chosen spec.
  [ ] Integration suite: 9/9 / >= 90 / 0-fail / <= 2-skip (no regression; pass count unchanged).
  [ ] api unit >= 316 / 0-fail / <= 8-skip (no regression).

Sami (R4):
  [ ] Criterion (h) section of rehearsal-runbook-15aug.md read.
  [ ] Result: FLAGS (with specific invariant + clinical concern) OR "no clinical framing gaps."
  [ ] No code or test changes made.

---

## Sequencing

ACROSS TRACKS: Track R and Track H run fully in parallel. No code dependency between them.
Coordination rule applies only to test-suite file ownership (see top of this doc).

WITHIN TRACK R:
  Day 1: S9-GAL-GAP1 (R1, Gal) + S9-ADI-RUNBOOK (R2, Adi) start simultaneously.
  After R2 CP-DONE: S9-ADI-DRESSRUN (R3, Adi) starts; Ido invokes Sami (R4).
  R3 and R4 run in parallel (different agents, no shared files).

WITHIN TRACK H:
  Day 1: S9-GAL-EVICT (H1, Gal) starts after S9-GAL-GAP1 CP-DONE (or interleaved).
  After R3 CP-DONE: S9-ADI-TRYFIN (H3, Adi) starts.

GAL sequence: S9-GAL-GAP1 (P1) -> S9-GAL-EVICT (P2). Different files; run to CP-DONE
  on each before moving to the next. If both happen to be in the same session, Gal may
  interleave the integration-suite wait time -- judgment call.

ADI sequence (fully sequential within Adi's work):
  S9-ADI-RUNBOOK (R2) -> S9-ADI-DRESSRUN (R3) -> S9-ADI-TRYFIN (H3)

---

## DoD -- Sprint 9 definition of done

Gate baseline preserved or exceeded:
  nest build 0
  engine 212/212 / 0-fail
  api unit >= 317 / 0-fail / <= 8-skip
    (R1 adds to integration; H1 adds >= 1 unit test; H3 adds 0 new tests;
     316 baseline must not regress)
  api tsc 0
  integration: 9/9 / >= 91 / 0-fail / <= 2-skip
    (R1 adds >= 1; H3 try/finally retrofit must not reduce pass count)
  web tsc 0 + 43/43
  E2E 34/34

Track R feature gates:
  [ ] Gap-1 closed: analyserOutput non-null assertion in integration suite; result PASS
  [ ] docs/rehearsal-runbook-15aug.md written, self-contained, all 5 required elements
      per criterion, corrected (f) expectation, 4-invariant (h) checklist with exact queries
  [ ] Dress run executed; dress-run-report-adi-*.md written; all paths PASS or FLAGS reported
  [ ] rehearsal-evidence-15aug/ folder created on disk
  [ ] Sami R4 complete: no clinical gaps OR gaps flagged and Ido ruled same day

Track H feature gates:
  [ ] H1: arcContextCache size bound + unit test passing; MAX_ARC_CACHE_ENTRIES documented
  [ ] H2: DEFER recorded (this document); no code change
  [ ] H3: try/finally exemplar + convention comment in one integration spec; no regression
  [ ] H4: DEFER recorded (this document); no code change
  [ ] H5: DEFER recorded (this document); no code change

Any unchecked box at sprint close = sprint not done. Escalate to Ido before declaring close.

---

*Ido (VP R&D) | 2026-07-14 | Sprint 9 envelope*
*Sources: rehearsal-plan-15aug-ido-2026-07-11.md + rehearsal-readiness-adi-2026-07-11.md*
*+ review-sprint-7-oren.md + review-sprint-8-oren.md + board APS-022/024/025*
*Supersedes: Sprint 8 envelope (2026-07-13) for all Sprint 9 scope items*

---

## Gal delivery notes -- 2026-07-14

### S9-GAL-GAP1 (R1, Track R) -- CP-DONE

Column name confirmed from schema.prisma: `analyserOutput` (Json, PatientStateLog line 361).
Service writes it at simulation.service.ts line 259: `analyserOutput: result.analyserResult as object`.

Assertion added: new `it()` block in simulation-turn.integration.spec.ts after the existing
PatientStateLog trust-value assertions. Text:
  `expect((log as any)["analyserOutput"]).not.toBeNull();`

Result: PASS. analyserOutput is non-null after processTurn with StubProvider. Gap-1 is closed.

Gate results:
  api tsc: 0 errors
  nest build: exit 0
  integration: 9/9 suites / 91 passed / 0 fail / 2 skip (+1 from new assertion; was 90)
  api unit: 23 suites / 317 passed / 0 fail / 8 skip (no regression)
  engine: 212/212
  E2E: pre-existing degraded state (8/34) confirmed identical before and after my changes
    (stash test 2026-07-14); stale seed, not caused by these changes. Flag to Ido.

File changed:
  apps/api/src/__tests__/simulation-turn.integration.spec.ts

---

### S9-GAL-EVICT (H1, Track H) -- CP-DONE

Confirmed: one .set() call site in getCachedArcContext() (simulation.service.ts ~line 647).
arcContextCache field name: `arcContextCache` (Map<string, ArcSessionContext | null>).

Changes made:
  - Added private readonly MAX_ARC_CACHE_ENTRIES = 500 (with rationale comment)
    referencing Oren S7 INFO-1 + Ido S9 H1 ruling.
  - After the single .set() call: size-bound guard evicts oldest key when size > 500.
    Uses Map insertion order (JS spec guaranteed); first key = oldest entry.
  - .set() site count patched: 1
  - Existing COMPLETED eviction (cache.delete) untouched.

Unit test added to arc-cache.spec.ts:
  Name: "arcContextCache evicts oldest entry when size exceeds MAX_ARC_CACHE_ENTRIES"
  Setup: seeds MAX entries directly; calls getCachedArcContext on a new key.
  Assertions: size === MAX; oldest evicted; new entry present.
  Result: PASS

Gate results:
  api tsc: 0 errors
  nest build: exit 0
  api unit: 23 suites / 317 passed / 0 fail / 8 skip (includes new eviction test; +1 total)
  integration: 9/9 / 91 / 0 fail / 2 skip (no regression)
  engine: 212/212
  E2E: pre-existing degraded state (same as noted in GAP1 above).

Files changed:
  apps/api/src/simulation/simulation.service.ts
  apps/api/src/__tests__/arc-cache.spec.ts

*Gal (Lead Developer) | 2026-07-14 | S9-GAL-GAP1 CP-DONE + S9-GAL-EVICT CP-DONE*

---

## Adi delivery notes -- 2026-07-14

### S9-ADI-TRYFIN (H3, Track H) -- CP-DONE

Exemplar file: apps/api/src/__tests__/dsr-live.integration.spec.ts
(Chosen per envelope: seeds the most tables; best exemplar for the pattern.)

Changes made (no assertion changes; all 12 assertions and seed data values unchanged):

1. Convention comment added immediately after the closing */ of the file-header block:
   // CONVENTION (Sprint 9, S9-ADI-TRYFIN): all integration specs MUST wrap
   // beforeAll/afterAll seed+teardown in try/finally (afterAll) and try/catch (beforeAll)
   // to prevent partial-seed orphan rows on test failure.
   // Exemplar: this file. Pattern applies to all new integration specs from Sprint 9 onward.
   // Ref: Oren S8 MINOR-2, review-sprint-8-oren.md.

2. Outer beforeAll wrapped in try/catch:
   - Existing seed logic unchanged inside try block.
   - catch(err): calls prisma.$disconnect() then re-throws, preventing orphan rows
     from any partial-seed failure.

3. Outer afterAll replaced with per-table guarded teardown inside try/finally:
   - Each table's deleteMany in its own try/catch so one delete failure does not
     abort the rest of teardown.
   - Every id variable guarded before use (if (collegeId) { ... } etc.) to handle
     the case where beforeAll failed mid-seed and some ids remain undefined.
   - prisma.$disconnect() moved to the finally block -- runs regardless of any
     teardown failure.
   - FK order unchanged from original (children before parents).

Gate results:
  integration: 9/9 suites / 91 passed / 0 fail / 2 skip (no regression; count unchanged)
  api unit: not re-run this pass (H3 adds 0 new unit tests; no unit-file changes)

File changed:
  apps/api/src/__tests__/dsr-live.integration.spec.ts

---

### Integration spec seeding convention (S9-H3, from Sprint 9 onward)

Ruling: Ido H3 (2026-07-14). New-specs-only scope; existing 8 legacy suites retrofit-on-touch only (no mass-retrofit).

CONVENTION -- applies to all new integration specs written from Sprint 9 onward:

1. beforeAll (seeding) MUST be wrapped in try/catch:
   beforeAll(async () => {
     try {
       // seed logic -- track each created id to module-scope let variable as it is created
     } catch (err) {
       await prisma.$disconnect();
       throw err;
     }
   });
   Rationale: mid-seed failure leaves partial rows in the test DB. The catch block
   must disconnect and re-throw; callers see the real error and orphan rows are bounded.

2. afterAll (teardown) MUST use per-table try/catch inside an outer try/finally:
   afterAll(async () => {
     try {
       // each table's deleteMany in its own try/catch -- one failure must not abort the rest
       if (someId) {
         try { await prisma.someTable.deleteMany({ where: { id: someId } }); } catch (_) {}
       }
       // ... repeat per table in FK-safe order (children before parents) ...
     } finally {
       await prisma.$disconnect(); // runs even if teardown fails mid-way
     }
   });
   Rationale: a single unawaited delete failure in a chain of awaits aborts the rest,
   orphaning rows in later tables. Per-table isolation + the finally disconnect are the fix.

3. Id guard pattern: every module-scope id variable used in afterAll MUST be guarded
   (if (id) { ... }) because a mid-seed failure in beforeAll leaves those variables
   undefined.

Exemplar file: apps/api/src/__tests__/dsr-live.integration.spec.ts (S9-ADI-TRYFIN)
Legacy suites: arc, authoring, credit-admin, dsr-live (this file), evaluation-debrief,
  simulation-turn, support, teacher-review-rbac, arc-coherence -- retrofit-on-touch per
  Ido H3 ruling. Not mass-retrofitted this sprint.

*Adi (QA Engineer) | 2026-07-14 | S9-ADI-TRYFIN CP-DONE*
