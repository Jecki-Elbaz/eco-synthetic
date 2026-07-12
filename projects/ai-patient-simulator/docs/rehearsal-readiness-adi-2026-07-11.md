# Rehearsal Readiness Evidence Map -- 15-Aug Go/No-Go
# Author: Adi (QA Engineer) | Date: 2026-07-11 | Sprint: 6 close
# References: rehearsal-plan-15aug-ido-2026-07-11.md (criteria a-i)
# Test totals (Eco final gate 2026-07-11, all green):
#   engine 212/212 | api unit 281/0-fail/8-skip | integration 8/8 suites 78/0-fail/2-skip
#   web 43/43 | E2E 34/34

---

## How to read this document

READY: structural evidence covers the pass bar; only human-interaction steps remain.
READY-WITH-GAPS: most structural evidence present; a specific assertion is absent or a code
  path is untested. Gap is named. Risk is low but worth noting.
NOT-READY: no structural evidence found for the pass bar. (None in this map.)

All file paths are relative to projects/ai-patient-simulator/app/.

---

## Criterion (a) -- Patient state coherence (single session)

Pass bar (StubProvider): Turn pipeline runs, PatientStateLog written per turn, no crash.

| Evidence type | Suite / step | What it asserts |
|---|---|---|
| Engine unit | packages/engine-test-harness/src/__tests__/turn-pipeline.spec.ts -- "returns a nextStateSnapshot with all required state fields"; "all state values in [0.0, 1.0] after one turn" (TC-STATE-01); "no state dimension changes by more than maxDeltaPerTurn" (TC-STATE-03); "pipeline processes prior state without error" (TC-STATE-02) | nextStateSnapshot populated; delta cap enforced; prior state re-injected across turns |
| API integration | apps/api/src/__tests__/simulation-turn.integration.spec.ts -- "PatientStateLog row written for turn 1"; "Message rows: STUDENT + PATIENT written" | PatientStateLog row exists with trust values in [0,1]; message rows persisted |
| E2E | e2e-golden-path.mjs steps 1-4 | student login, create attempt, 2 turns, finish -- pipeline runs without crash over real HTTP |

Live testing remaining (human only):
- Complete 5+ turns manually; query PatientStateLog row count from DB and confirm it matches turn count.
- Inspect server console for no uncaught exception (log evidence package).
- Screenshot: completed simulation screen.

Rating: READY

---

## Criterion (b) -- Ground-truth guard fires (Oren M1 fix)

Pass bar (StubProvider): Guard runs without crash; guardVerdict populated; no TypeError.

| Evidence type | Suite / step | What it asserts |
|---|---|---|
| Engine unit -- engineered violations | guard-runner.spec.ts: "[Criterion B / TC-GT-01] guard fires on invented employment status"; "[TC-GT-03] guard fires on invented cardiac symptom" -- both BLOCKED | Guard structural enforcement: safe fallback returned, no crash |
| Engine unit -- Oren M1 regression | guard-runner.spec.ts: "[Oren S5 M1] FAIL verdict without violations array does not throw (FAIL then PASS)"; "[Oren S5 M1] FAIL verdict without violations array does not throw (FAIL both attempts)" | Operator-precedence fix live; violations.join on undefined does not crash |
| Engine unit -- malformed output | guard-runner.spec.ts: "malformed guard JSON does not throw and defaults to PASS" | JSON parse failure does not propagate |
| Engine unit -- pipeline integration | turn-pipeline.spec.ts: "guardOutcome REGENERATE when guard fails first attempt"; "guardOutcome BLOCKED when guard fails both attempts" (TC-GT-01/02) | Guard outcome propagated from GuardRunner into TurnPipeline result |
| Engine unit -- clean path | guard-runner.spec.ts: "[TC-GT-05] guard does NOT fire on fact in authorised unlock list" (PASS) | Guard does not over-fire on authorised disclosures |
| E2E | steps 3-4 | Turn pipeline (including guard) ran without crash over real HTTP |

Live testing remaining (human only):
- Confirm guardVerdict field in PatientStateLog is non-null for a guard-checked turn (DB query).
- API log: no guard-runner exception visible.
- NOTE: guard ACCURACY (whether the real guard model correctly identifies clinical violations) is NOT testable on StubProvider; deferred to real-model rehearsal.

Rating: READY

---

## Criterion (c) -- Interaction analyser accuracy (structural check only)

Pass bar (StubProvider): Analyser call does not crash; PatientStateLog.interactionAnalysis populated.

| Evidence type | Suite / step | What it asserts |
|---|---|---|
| Engine unit | turn-pipeline.spec.ts: "analyserResult contains all required fields"; "analyserResult numeric fields are in [0.0, 1.0]" (TC-ANAL-01); "handles malformed analyser JSON by returning safe defaults"; "riskRelevance in state increases when analyser flags risk" (TC-ANAL-04) | Analyser output schema correct; safe defaults on bad JSON; risk propagated |
| API integration | simulation-turn.integration.spec.ts: "UsageLog row written with real (non-placeholder) token counts" -- asserts inputTokens is a multiple of 10; comment states "analyser(10in) + patient(10in) + guard(10in) = 3 calls" | Analyser LLM call confirmed made (token count proves call chain ran) |

GAP: No test explicitly asserts PatientStateLog.analyserOutput (the rehearsal plan calls it
interactionAnalysis) is non-null after a live processTurn call. The integration test confirms
the PatientStateLog row is written and trust values are correct, but does not check the
analyserOutput JSON field directly. The arc-coherence test seeds analyserOutput: {} as fixture
data (manual insert), which does not prove processTurn writes it. Structural evidence for the
analyser call itself is strong; persistence to the specific PatientStateLog column is the gap.

Live testing remaining:
- After (a) session: query PatientStateLog rows; confirm analyserOutput (interactionAnalysis) column is non-null on each row.
- NOTE: 70% accuracy bar cannot be evaluated on StubProvider; deferred to real-model rehearsal.

Rating: READY-WITH-GAPS (gap: analyserOutput persistence to PatientStateLog.analyserOutput not
explicitly asserted in any test for the processTurn code path)

---

## Criterion (d) -- Evaluation output coherence

Pass bar (StubProvider): Eval pipeline completes; student/teacher views render; override works;
debrief returns response. 0/10 scores are cosmetic.

| Evidence type | Suite / step | What it asserts |
|---|---|---|
| API integration | apps/api/src/__tests__/evaluation-debrief.integration.spec.ts (8 live tests, runs when DATABASE_URL set): "generateEvaluation creates DRAFT Evaluation row in DB"; "student cannot read DRAFT evaluation (ForbiddenException)"; "teacher can read DRAFT evaluation"; "overrideEvaluation with publish=true sets status=PUBLISHED"; "student can read PUBLISHED evaluation" (no teacherNotes in student view); "postMessage persists STUDENT + SUPERVISOR DebriefChat rows"; "formativeOnly criterion has requiresTeacherReview flag" | Full eval pipeline: DRAFT created, teacher override publishes, student unblocked post-publish, debrief rows persisted |
| E2E | steps 6-9: teacher evaluate -> publish -> student reads published feedback -> student debrief | End-to-end eval + debrief over real HTTP; 34/34 passing |
| Author-preview unit | author-preview.spec.ts Ev1: "evaluation auto-triggered after runAuthorPreview, no CreditEntry" | Eval pipeline triggered after bot run |

Live testing remaining (human only):
- Browser: student feedback view renders with rubric criteria listed (0/10 OK).
- Browser: teacher override -- change one score, save, no error.
- Browser: debrief chat opens and returns a response (stub text acceptable).
- Screenshot evidence: student view + teacher override confirmation.

Rating: READY

---

## Criterion (e) -- No data loss on session interruption/resume

Pass bar: Resume card appears on dashboard; transcript shows prior turns; can send more turns.

| Evidence type | Suite / step | What it asserts |
|---|---|---|
| Web unit | apps/web/src/__tests__/StudentDashboard.resume.test.tsx (S4-NOA-RESUME): "dashboard renders Continue card for IN_PROGRESS attempt" -- href contains resume=1 and elapsed=900; "in-progress section hidden when no IN_PROGRESS attempts" | Resume card UI rendered with correct href params |
| E2E | steps 25a-25d: create IN_PROGRESS attempt -> send 1 turn -> do NOT finish -> dashboard shows in-progress -> transcript has prior turn | Full interrupt-and-find flow over real HTTP; 34/34 passing |
| API integration | simulation-turn.integration.spec.ts: STUDENT + PATIENT message rows written per turn | Turn data persisted to DB, survives between requests |

Live testing remaining (human only):
- Close browser tab (actual interrupt); reopen/navigate to student dashboard.
- Confirm IN_PROGRESS card visible with correct title and "המשך" button.
- Resume: confirm 3 prior turns visible in transcript.
- Timer: confirm "--:--" or resumed time shown (both acceptable per Sprint 4 ruling).
- Send 1 more turn to confirm session is functional post-resume.
- Screenshot: resumed session with prior turns + timer display.

Rating: READY

---

## Criterion (f) -- Credit hard-limit blocks correctly

Pass bar: Attempt-create or first turn blocked at hard limit; 402 or "credit limit exceeded"
surfaced; no successful session starts when credit = 0.

| Evidence type | Suite / step | What it asserts |
|---|---|---|
| Engine unit (turn-level gate) | turn-pipeline.spec.ts: "gate blocks on zero credit balance and returns CREDIT_HARD_LIMIT reason"; "blocked result has zero token usage" (TC-CREDIT-02) | At turn time, pipeline gate blocks with CREDIT_HARD_LIMIT; no LLM calls made; no state snapshot written |
| Engine unit (bypass flag) | input-gate.spec.ts (referenced in author-preview.spec.ts comment as I1/I2): bypassCreditCheck=true allows turn when creditBalance=0; bypassCreditCheck=false blocks | Credit bypass correctly gates author-preview vs student turns |
| API integration (credit admin) | credit-admin.integration.spec.ts CA-INT-006: overrideHardLimit persists hardLimit to DB | Admin can set credit hard limit; value persisted |
| E2E | step 20b: credit balance unchanged after AUTHOR_PREVIEW run | Credit exclusion for preview confirmed over real HTTP |

GAP: No integration or E2E test asserts that POST /assignments/:id/attempts returns 402 when
the course credit balance is 0. The turn-pipeline gate (engine level) blocks at turn time with
CREDIT_HARD_LIMIT, but whether the API returns 402 at that point, or whether attempt-create
itself checks credit and returns 402 before the first turn, is untested end-to-end. The
rehearsal scenario ("admin sets hard-limit to 0 -> student tries to start new simulation ->
confirm 402") depends on this specific API path. Architecture review (not a test file) would
confirm where the 402 fires; I cannot verify this without reading simulation or org service
source code, which was not in scope for this map.

Live testing remaining (human only):
- Admin sets credit hard-limit to 0 for rehearsal course.
- Student attempts to start new simulation.
- Confirm 402 or "credit limit exceeded" response (or equivalent error in UI).
- Screenshot: blocked session-start error shown.

Rating: READY-WITH-GAPS (gap: no end-to-end test of the 402 response path; engine-level
CREDIT_HARD_LIMIT gate is well-evidenced but the specific HTTP status code and whether it
fires at attempt-create or first-turn is not tested)

---

## Criterion (g) -- Support assistant structural isolation

Pass bar: Support responds with support content only; no patient clinical details echoed;
dev-mode log shows support prompt contains no PatientStateLog or ground-truth fields.

| Evidence type | Suite / step | What it asserts |
|---|---|---|
| Engine unit -- import isolation | packages/engine-test-harness/src/__tests__/support.spec.ts section (c): "troubleshoot module has no import of PatientState or PatientStateLog"; "runTroubleshootingFlow does not expose PatientStateSnapshot in its result"; "redactDiagnosticPayload does not require GroundTruthRef or TurnPipeline" | Support module does not import or expose any patient engine types at the module level |
| Engine unit -- deterministic output | support.spec.ts section (d): runTroubleshootingFlow returns deterministic scripted steps per issue category; no LLM call is made by the support module | Support responses are deterministic (no LLM prompt exists to contaminate) |

NOTE on support isolation: the support module (runTroubleshootingFlow + routing) is
DETERMINISTIC -- it does not make an LLM call. There is no "support prompt" to inspect in the
traditional sense. The structural isolation confirmed above means the support module cannot
echo patient context because it has no access to PatientStateLog, GroundTruth, or TurnPipeline
types. The Oren P2 and JC-3 guard (DebriefModule/EngineModule separation) is asserted at the
module-import level in the support.spec.ts section (c) tests.

If the rehearsal's "support assistant" refers to a separate LLM-based chat module distinct
from the deterministic troubleshooter tested above, that module's prompt isolation is NOT
explicitly tested in the files read. Clarification from Gal/Ido needed before rehearsal day.
Oren i-4 (dev-mode logging) is required to verify the live behavior at rehearsal time.

Live testing remaining (human only):
- Open support assistant in student interface during simulation.
- Send a message referencing clinical simulation content (e.g., "the patient mentioned a sister").
- Confirm response is support/troubleshooting content only; no patient details echoed.
- Dev-mode API log: confirm support prompt (if any) contains no PatientStateLog or ground-truth fields. (Per Oren i-4: API must run in dev/debug mode during rehearsal.)
- Screenshot: support chat response showing no patient data.

Rating: READY (support module is deterministic + structurally isolated; behavioral confirmation
is inherently live. Caveat: if a separate LLM-based support chat exists, its isolation is not
yet explicitly tested -- flag to Ido before 15-Aug.)

---

## Criterion (h) -- 3-session continuing-persona arc coherence

Pass bar (FULLY TESTABLE): All 4 invariants + arc cap. NO-GO if any invariant fails.

| Evidence type | Suite / step | What it asserts |
|---|---|---|
| INVARIANT 1 (trust continuity) | arc-coherence.integration.spec.ts C1-T2: session 2 ArcSessionSummary has correct finalTrustLevel (0.58, within ceiling); C1-T3: session 3 arc context loads from session 2 (not session 1) trust value 0.58; C1-T4: accumulated state values correct across sessions 1+2 | Trust/openness/alliance carry forward correctly; session N+1 loads from session N, not N-1 |
| INVARIANT 1 (also) | arc.integration.spec.ts A1: ArcWriterService persists ArcSessionSummary; A2: ArcLoaderService returns session-1 context for session-2 attempt | Write then load cycle verified on live Postgres |
| INVARIANT 2 (no invented facts through guard -- NO-GO if fail) | arc-coherence.integration.spec.ts C2-T3: "false fact does NOT appear in guard prompt or guard ground-truth input"; C2-T1: seeded false fact IS present in arc context; C2-T2: false fact in arc context is labeled 'context only, not ground truth'; C2-T4: authored ground truth has no mention of seeded false fact | Arc summary can appear in PATIENT context only; guard model receives authored truth exclusively |
| INVARIANT 3 (welfare modal fires + blocks) | apps/web/src/__tests__/ArcStudent.test.tsx test 4: "welfare modal: chat input (textarea) disabled until [ack] clicked"; test 5: "welfare modal: both identity reminder and welfare signpost present" -- exact Hebrew strings asserted; ack button present | Modal blocks input; both required text components present |
| INVARIANT 4 (gap briefing fires after ack) | ArcStudent.test.tsx test 2 (session 2): briefing shown after modal ack, not before; briefing absent before ack; test 3 (session 3): same | Briefing fires post-ack, pre-first-send; sequencing correct |
| Session-context panel | ArcStudent.test.tsx tests 2+3: arc-context-panel shows "פגישה 2 מתוך 3" and "פגישה 3 מתוך 3" respectively; test 1: panel absent at session 1 | N/max text correct; panel shown only at sessions 2+ |
| ARC CAP (session 4 -> 403) | arc.integration.spec.ts A4: getOrCreateAttempt throws 403 ARC_COMPLETE when 3 sessions completed; E2E step 34: POST /attempts -> 403 code=ARC_COMPLETE after 3 sessions | Cap enforced at API level over real HTTP |
| Ceiling enforcement | arc-coherence.integration.spec.ts C3-T2/T3/T4: trust/openness/alliance all clamped to maxTrust=0.70/maxOpenness=0.65/maxAlliance=0.70 when raw values exceed ceiling; C3-T6: clamped values stored in DB | ArcWriterService applies ceiling before persisting |
| E2E arc flow | steps 29-34: session 1 (sessionNumber=1, COMPLETED) -> session 2 (sessionNumber=2) -> session 3 (sessionNumber=3) -> session 4 blocked 403 ARC_COMPLETE | Full 3-session arc over real HTTP; all 6 steps passing |
| Session numbering | arc.integration.spec.ts A5: getOrCreateAttempt assigns sessionNumber=1 for first arc attempt; A6: ArcSessionSummary isolation per (userId, templateId, sessionNumber) | Session numbering correct; data isolated per student |

Live testing remaining (human only) -- MANDATORY:
- Run all 3 sessions CONTIGUOUSLY, SAME DAY, SAME TESTER (per rehearsal plan). Do not split.
- Sessions 1, 2, 3: complete 3+ turns each.
- After each of sessions 2 and 3: query ArcSessionSummary via DB; record trust/openness/alliance.
- At session 2 start: confirm arc-context-panel visible; confirm welfare modal fires and blocks input; ack; confirm gap briefing appears.
- At session 3 start: same checks.
- Session 4 attempt: confirm 403 ARC_COMPLETE on network tab.
- Dev-mode API log: inspect guard prompt for a session-2/3 turn; confirm no arc-summary content (Oren i-4).
- Timing: Oren i-5 clock check at 11:15 -- if slipping, shift the h-block whole; never split.

Rating: READY

---

## Criterion (i) -- Author-preview run

Pass bar: Preview completes; invisible to student; credit unchanged; eval auto-triggered.

| Evidence type | Suite / step | What it asserts |
|---|---|---|
| Service unit | author-preview.spec.ts C1: attempt created with type=AUTHOR_PREVIEW; C2: returns {attemptId}; C3: runs all 6 COMPETENT bot turns (pipeline.run called 6 times); C4: marks attempt COMPLETED | Bot run lifecycle correct |
| Credit exclusion | author-preview.spec.ts E1: CreditEntry.create NOT called for AUTHOR_PREVIEW even when ledger exists; E2: CreditLedger.update NOT called | Credit untouched for preview runs |
| UsageLog | author-preview.spec.ts D1: UsageLog emitted with eventType=SELF_SIMULATION for every turn; D2: UsageLog count = 6 | Audit trail correct; event type distinct from student turns |
| Evaluation auto-trigger | author-preview.spec.ts Ev1: evaluation auto-triggered after runAuthorPreview; generateEvaluation called once; no CreditEntry | Track-A-fix-001: author sees rubric scores after preview |
| Student visibility | E2E step 20e: student dashboard excludes AUTHOR_PREVIEW attempt | Preview not visible to students |
| Credit balance | E2E step 20b: credit balance unchanged before/after preview | Credit exclusion confirmed over real HTTP |
| Evaluation in preview | E2E step 20d: preview has DRAFT Evaluation auto-triggered | Eval pipeline runs for preview attempt |
| Transcript | E2E step 21: transcript >= 1 item; correct fields; no system-prompt leak (systemPrompt/groundTruth/personaPrompt undefined on items) | Transcript shape correct; no prompt exposure |
| RBAC | author-preview.spec.ts R1: student role throws ForbiddenException; R1b: teacher role passes | Only TEACHER/SYSTEM_ADMIN may trigger preview |

Live testing remaining (human only):
- Teacher UI: trigger "Run Preview" button from authoring UI (browser action).
- Wait for completion; view transcript + evaluation structure in teacher/authoring review view.
- Login as student: confirm preview attempt NOT in student dashboard.
- Login as admin: confirm credit balance unchanged (screenshot before + after).
- Role-switch protocol per Oren i-5: logout/login in single browser tab; confirm each role session established before screenshot.
- Screenshot evidence package: preview result view, student dashboard (no preview), admin credit balance.

Rating: READY

---

## Gap list (all criteria -- items where structural evidence is absent or incomplete)

1. (c) PatientStateLog.analyserOutput persistence: no test explicitly asserts that
   processTurn() writes a non-null analyserOutput (interactionAnalysis) to the
   PatientStateLog row. Engine-level analyserResult is confirmed populated;
   DB-column persistence is not explicitly tested for the processTurn code path.
   Risk: LOW (very likely written alongside trust fields; check live at rehearsal day step (a)).

2. (f) API 402 at zero-credit session start: no integration or E2E test confirms the
   specific 402 status code and whether credit blocking fires at attempt-create or at
   the first turn. The engine-level CREDIT_HARD_LIMIT gate is well-evidenced.
   Risk: MEDIUM for rehearsal (wrong assumption about when 402 fires could confuse the
   tester). Recommend Gal or Ido confirm before 15-Aug: does POST /attempts return 402
   immediately when credit=0, or does it succeed and the first turn returns a blocked result?

3. (g) LLM-based support chat prompt isolation (IF such a module exists): the structural
   isolation evidence covers the deterministic troubleshooter (runTroubleshootingFlow).
   If the product also has an LLM-based support chat distinct from the deterministic flow,
   that module's prompt isolation has not been explicitly tested. Flag to Gal before 15-Aug.

---

## Pre-rehearsal environment checklist

Seed and configuration (must be done BEFORE 09:00 on 2026-08-15):

- [ ] Run pnpm --filter @aps/db seed (or rehearsal-variant seed if Gal provides one)
- [ ] Confirm seeded records:
      - College: "Gome Gevim Rehearsal"
      - Course: one course with 50 credits seeded
      - TEACHER role account: rehearsal-teacher
      - STUDENT role account: rehearsal-student
      - SYSTEM_ADMIN role account: rehearsal-admin
      - Template: published, maxSessions=3, groundTruth fully populated,
        rubric generated and reviewed (rubricProvisional=false), challengeLevel 2-3
      - CreditLedger: 50 credits for the course
      - Arc seed: CLEAN (zero ArcSessionSummary rows for rehearsal-student on this template)
- [ ] API server: start in dev/debug mode (arc-context + guard-prompt logging enabled) -- Oren i-4
- [ ] Confirm DATABASE_URL points to rehearsal DB (not production)
- [ ] Role-switch protocol ready: logout/login in single browser tab per Oren i-5
- [ ] Criterion (h) timing: schedule 3 contiguous arc sessions from 11:30; clock check at 11:15
      per Oren i-5 -- if session-1 + criterion-(d) block overruns past 11:15, shift (h) whole,
      never split arc sessions across a break
- [ ] Rehearsal evidence package folder ready (for screenshots + log excerpts)

---

*Adi (QA Engineer) | 2026-07-11 | Sprint 6 close*
*Supersedes: no prior version. First edition.*
*All test file evidence verified by direct file read 2026-07-11 (Adi, this session).*

---

## Addendum: gap resolutions (Eco, 2026-07-11, code-verified same session)

GAP 2 (criterion f) -- RESOLVED. Verified in code: credit enforcement is at the TURN
level, not attempt-create. simulation.service.ts processTurn() loads the course ledger
and passes it into runPipelineTurn with bypassCreditCheck=false; the engine InputGate
applies the CREDIT_HARD_LIMIT gate per turn (credit-ledger.service.ts throws
HardLimitExceededException 403 on deduction past min(balance, hardLimit)).
getOrCreateAttempt (org.service.ts) contains NO credit logic -- only the arc cap guard.
REHEARSAL EXPECTATION for (f): attempt-create SUCCEEDS even at exhausted credit; the
first TURN returns the blocked result. Testers must not read a successful
attempt-create as a criterion failure. There is no 402 path anywhere; the rehearsal
plan wording "402 immediately at attempt-create" does not match the build and the
turn-level block is the correct pass bar.

GAP 3 (criterion g) -- RESOLVED. Verified in code: apps/api/src/support contains no
LLM provider import or complete() call anywhere -- the support assistant is the
deterministic troubleshooter only (runTroubleshootingFlow). There is no LLM-based
support chat surface in the product. The structural isolation evidence in
support.spec.ts section (c) is therefore complete for criterion (g).

GAP 1 (criterion c) -- STANDS as a pre-rehearsal check: one DB query on rehearsal day
confirming PatientStateLog.analyserOutput is non-null after a live turn. LOW risk;
engine-level population is already asserted in turn-pipeline.spec.ts.

LIVE MIDDLEWARE SMOKE (Eco, same session, running web server :3000): 9/9 probes
correct -- /admin/credits: no-cookie 307->/login, STUDENT 307->/403, SYSTEM_ADMIN 200;
/authoring TEACHER 200; /login 200 public; /feedback no-cookie 307->/login (Oren M-1
fix live); /student/<id>: STUDENT 200, no-cookie 307->/login. (Bare /student 404s --
no index route exists; routing artifact, not a guard failure.)
