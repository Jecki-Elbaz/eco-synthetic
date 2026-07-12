# 15-Aug Rehearsal Plan -- APS Internal Go/No-Go
# Author: Ido (VP R&D) | Date: 2026-07-11 | Requester: Eco (CEO)
# Rehearsal date: 2026-08-15
# Fallback target if NO-GO: ~2026-10-15

---

## Purpose

Internal rehearsal against the full pilot criterion set before committing to 1-Sep launch.
Decision: GO -> proceed to production hardening + 1-Sep; NO-GO -> activate October fallback.

This rehearsal runs entirely on StubProvider. Clinical quality criteria (c) and (d) are
structurally testable only -- score accuracy validation requires real model and runs as a
second rehearsal after APS-004 gate clears (pre-production, not planned here).

---

## Prerequisites (must be met BEFORE rehearsal can run)

1. Sprint 5 + Sprint 6 fully closed GREEN (DoD gate bars all met).
2. Adam 2026-08-08 checkpoint complete: owner relays 3-session arc test run output to Adam;
   Adam confirms delta model is coherent across 3 sessions (B2 at 3-session depth).
   If Adam requests config adjustments: Gal applies (ArcDeltaConfig env-var change, Sprint 6
   Item 2a; no code edit required after Sprint 6 ships). If Adam identifies a structural
   delta model defect: escalate to Ido immediately -- may pre-trigger October fallback.
3. Seeded rehearsal environment ready (see Scenario Set below).
4. All four session-boundary invariants confirmed passing in integration tests (Adi S5
   sign-off already covers these; confirm no regression from Sprint 6 changes).

---

## StubProvider caveats (state plainly)

The rehearsal runs on StubProvider. Consequences per criterion:

| Criterion | Testable on StubProvider? | Notes |
|-----------|--------------------------|-------|
| (a) patient state coherence | STRUCTURAL ONLY | PatientStateLog persisted, pipeline runs. Patient "quality" not evaluable -- responses are canned stubs. |
| (b) ground-truth guard fires | STRUCTURAL ONLY | Guard code path runs; Oren M1 crash fix is live. Verdict accuracy NOT testable -- stub returns fixed output. |
| (c) analyser accuracy 70% | NOT TESTABLE | Structural check only: call runs, scores recorded. 70% accuracy bar deferred to real-model rehearsal. |
| (d) evaluation coherence | STRUCTURAL ONLY | Pipeline completes; scores are 0/10 (cosmetic, known since APS-019). Structure verifiable. |
| (e) session resume | FULLY TESTABLE | DB-level state persistence, not model-dependent. |
| (f) credit hard-limit | FULLY TESTABLE | DB-level credit logic, not model-dependent. |
| (g) support isolation | FULLY TESTABLE | Architectural property (support prompt contains no patient context). |
| (h) 3-session arc coherence | FULLY TESTABLE | Arc state values in DB; boundary invariants verifiable regardless of model. |
| (i) author-preview | FULLY TESTABLE | AUTHOR_PREVIEW attempt type, credit exclusion, student visibility -- all pipeline/DB. |

0/10 stub scores for criteria (a)(c)(d) are COSMETIC -- they do not indicate a pipeline failure.
Clinical quality rehearsal (real LLM) is a SEPARATE gate, not in this plan.

---

## Scenario set (prepare before rehearsal day)

Seed the development environment (or a dedicated rehearsal env) with:
- College: "Gome Gevim Rehearsal"
- Course: one course
- Teacher account: rehearsal teacher (TEACHER role)
- Student account: rehearsal-student (STUDENT role)
- Admin account: rehearsal-admin (SYSTEM_ADMIN role)
- Template: published, max_sessions=3, with ground truth fully populated, rubric generated
  and reviewed (rubricProvisional=false), challenge level 2-3
- Credit seed: 50 credits for the course (enough for all rehearsal sessions)
- Arc seed: clean (no prior ArcSessionSummary rows for rehearsal-student on this template)

Use `pnpm --filter @aps/db seed` (or a rehearsal-specific seed script if Gal creates one).
Owner runs the seed; Gal may assist if seed script needs a rehearsal variant.

---

## Criterion-by-criterion run plan

### (a) Patient state coherence -- single session

What is run:
- Login as rehearsal-student
- Start a new simulation on the seeded template (session 1)
- Complete 5+ turns of chat (type messages manually or use scripted inputs)
- Finish the attempt
- Query PatientStateLog: confirm N rows (one per turn, matching turn count)

By whom: Owner (browser session)

Pass bar (StubProvider-adjusted):
- Turn pipeline completes all 5+ turns without error
- PatientStateLog has correct row count
- No uncaught exception in API logs (check console/server logs)
- STRUCTURAL PASS. Clinical coherence not evaluated on StubProvider.

Evidence captured:
- Server log snippet (no exceptions)
- PatientStateLog row count (DB query or from Adi's earlier integration-test output)
- Screenshot: completed simulation screen showing all turns

Ido note: (a) STRUCTURAL PASS does not substitute for a real-model (c)/(d) rehearsal.
Both must pass before 1-Sep production go-live.

---

### (b) Ground-truth guard fires

What is run:
- Within a simulation session, include at least 1 turn that proposes something outside
  ground truth (e.g. student references a clinical detail not in the authored case)
- After the session, confirm the guard pipeline ran (PatientStateLog.guardVerdict populated)
- Confirm no crash at the guard stage (Oren M1 operator-precedence fix is live as of Sprint 5)

By whom: Owner (same browser session as (a), or a second session)

Pass bar (StubProvider-adjusted):
- Guard code path runs without crash on the engineered-violation turn
- guardVerdict field in PatientStateLog is populated (not null) for the guard-checked turn
- No TypeError or crash in API log related to guard-runner
NOTE: guard accuracy (does it detect the violation?) is NOT testable on StubProvider.
The stub returns a fixed verdict. The pass bar is structural (runs, does not crash).

Evidence captured:
- PatientStateLog row: guardVerdict value (whatever the stub returns -- any non-null value PASS)
- API log: no guard-runner exception

---

### (c) Interaction analyser accuracy

What is run (structural check only):
- Same session as (a)/(b)
- After session: confirm PatientStateLog rows have a non-null interactionAnalysis field

By whom: Owner (no extra action beyond (a))

Pass bar (StubProvider-adjusted):
- Analyser call does not crash
- PatientStateLog.interactionAnalysis populated for each turn
FAIL on this structural bar = real crash (NoGo trigger).
NOTE: the 70% accuracy bar from feasibility-ido.md Section 3 CANNOT be evaluated on
StubProvider. This bar is deferred to the real-model rehearsal (APS-004 gate, pre-1-Sep).

Evidence captured:
- PatientStateLog.interactionAnalysis field non-null (any value on StubProvider is cosmetic)

---

### (d) Evaluation output coherence

What is run:
- After (a) session COMPLETED, trigger evaluation pipeline (auto-triggers on COMPLETED)
- Inspect: student feedback view renders; rubric criteria listed; scores shown (will be 0/10 cosmetic)
- Teacher review view: renders; all criteria visible; teacher override: change one score, save
- Debrief: debrief chat accessible; debrief response references the transcript structurally

By whom: Owner (browser -- student view then teacher view)

Pass bar (StubProvider-adjusted):
- Student feedback view renders without error
- Rubric criteria are all listed (count matches authored rubric)
- 0/10 scores are displayed (cosmetic; NOT a failure)
- Teacher override: can change one score and save without error
- Debrief chat: opens and returns a response (stub response is acceptable)

Evidence captured:
- Screenshot: student feedback view showing criteria (0/10 scores OK)
- Screenshot: teacher override save confirmation

---

### (e) No data loss on session interruption/resume

What is run:
- Login as rehearsal-student, start a new simulation, send 3 turns
- Close the browser tab (interrupt)
- Reopen browser, login again (if session cookie cleared) or navigate to student dashboard
- Find the in-progress simulation in "Resume" list
- Resume and confirm: prior 3 turns visible in transcript, timer resumes at correct
  elapsed time (or "--:--" if unknown -- both are acceptable per Sprint 4 ruling)
- Send 1 more turn to confirm resume is functional

By whom: Owner

Pass bar:
- Resume card appears on student dashboard for the interrupted session
- Transcript shows all 3 prior turns on resume
- 4th turn succeeds; session can continue

Evidence: screenshot of resumed session with prior turns + timer display

---

### (f) Credit hard-limit blocks correctly

What is run:
- Use rehearsal-admin to set credit hard-limit to 0 for the rehearsal course (or verify an
  existing seeded scenario where a student's credit is at 0)
- Attempt to start a new simulation session as rehearsal-student
- Confirm 402 or "credit limit exceeded" response (not a successful attempt-create)

By whom: Owner (admin action then student action)

Pass bar:
- Attempt-create blocked at hard limit
- Error response surfaces correctly in the UI (appropriate error message shown)

Evidence: screenshot of blocked session-start; or E2E step that already covers this (step
from golden path can be re-run as a rehearsal check)

---

### (g) Support assistant structural isolation

What is run:
- Open the support assistant in the student interface
- Send a message referencing clinical content from the simulation (e.g. "the patient said
  they have no sister, but I think..." -- a reference to session content)
- Inspect the support assistant response
- If dev-mode context logging available: inspect the support prompt to confirm no
  PatientStateLog or ground-truth data appears in it

By whom: Owner

Pass bar:
- Support assistant responds with deterministic troubleshooting/support content
- Support assistant does NOT echo back any clinical patient details from the simulation
  (it should have no access to patient engine context -- structural isolation enforced
  at the DebriefModule/EngineModule level, confirmed by Oren P2 and JC-3 guard)
- Dev mode: support prompt in API log contains no PatientStateLog or ground-truth fields

Evidence: screenshot of support chat response; dev-mode log excerpt showing support prompt
contains no patient data

---

### (h) 3-session continuing-persona arc coherence

MANDATORY: run all 3 sessions CONTIGUOUSLY, SAME TESTER (owner), SAME DAY.
Do not split across days. Session 3 coherence depends on session 2 state. All three
must run in sequence or the invariant checks are invalid.

What is run:
- Confirm arc seed is clean (no prior ArcSessionSummary for rehearsal-student on the seeded template)
- SESSION 1: login as rehearsal-student; create new simulation session (session 1 of 3);
  complete 3+ turns; finish the attempt (status -> COMPLETED).
  After session 1: query ArcSessionSummary for session 1 -> record trust/openness/alliance values.
  Confirm session-context panel NOT shown (session 1; no prior arc history).
  Confirm welfare modal NOT shown (session 1; Sami C3 fires at sessions 2+3 only).
- SESSION 2: login as rehearsal-student (same student, same template);
  create new simulation session (sessionNumber should be 2);
  BEFORE SENDING: confirm session-context panel visible ("פגישה 2 מתוך 3" in Hebrew);
  CONFIRM: welfare re-anchor modal fires before chat is interactive -- cannot type until "הבנתי" clicked;
  CONFIRM: session-gap briefing appears after modal ack, before first send;
  complete 3+ turns; finish the attempt (status -> COMPLETED).
  After session 2: query ArcSessionSummary for session 2 -> record trust/openness/alliance.
- SESSION 3: same pattern as session 2; confirm panel shows "פגישה 3 מתוך 3";
  confirm welfare modal fires; confirm gap briefing fires; complete + finish.
- ARC CAP: attempt to create session 4 for the same student/template.
  Confirm 403 ARC_COMPLETE.

Session-boundary invariants checklist (tester verifies each after session 2 and 3):

INVARIANT 1 -- Trust continuity:
Session 2 starting arc context trust MUST equal session 1 final trust (post-clamp).
Session 3 starting arc context trust MUST equal session 2 final trust (post-clamp).
Check: ArcSessionSummary.finalTrustLevel for session N == arc context loaded at session N+1.
Evidence: DB query on ArcSessionSummary rows for sessions 1 and 2; match against API log
line "arc context loaded" at sessions 2 and 3 start (ArcLoaderService log).

INVARIANT 2 -- No invented facts through the guard:
The guard input for sessions 2 and 3 must contain ONLY the authored SimulationTemplate
ground truth -- NOT the notableMomentsSummary from the arc context block.
Confirmed structurally by Adi C2-T3 (buildGuardPrompt never receives arcContext; arc block
goes to patient context builder only as a labeled "PRIOR SESSION CONTEXT -- context only,
not ground truth" system message). Rehearsal confirms live: check API log for guard prompt;
confirm "sister" or any arc-summary content does NOT appear in guard prompt text.
Evidence: API debug log of guard prompt for a session-2/3 turn.

INVARIANT 3 -- Welfare modal fires at sessions 2 AND 3:
Both text components present: "המטופל הוא דמות אימון מדומה; הוא אינו אדם אמיתי." AND
"אם אתה/את חש/ה אי-נוחות, פנה/י לאיש הצוות שלך."
Modal blocks chat input until "הבנתי" clicked (chat input disabled prop confirmed live).
Modal does not auto-dismiss.
Evidence: screenshots of modal at session 2 start and session 3 start.

INVARIANT 4 -- Session-gap briefing fires at sessions 2 AND 3:
Hebrew text visible after modal ack, before first send (messages.length === 0).
Non-blocking (does not prevent typing).
Evidence: screenshot of briefing text visible after modal dismissed, before first message sent.

ARC CAP -- session 4 blocked:
Attempt-create for session 4 returns 403 with code="ARC_COMPLETE".
Evidence: browser network tab showing 403 ARC_COMPLETE on attempt-create.

By whom: Owner (all 3 sessions; same browser; same day)
Estimated time: ~60-90 minutes for all 3 sessions

Pass bar (FULL testability -- no StubProvider caveat on arc state):
- All 4 invariants confirmed
- Session-context panel shows correct N/max text at sessions 2 and 3
- Welfare modal fires + blocks chat at sessions 2 and 3
- Gap briefing fires at sessions 2 and 3
- Arc cap blocks session 4 with 403 ARC_COMPLETE
- No crash in any of the 3 sessions

FAIL on ANY invariant or arc cap = NO-GO (automatic October fallback trigger).
This criterion is the unique pilot differentiator. A broken arc at rehearsal means the
product cannot be demonstrated to Adam as promised.

Evidence package:
- ArcSessionSummary DB rows (screenshot or query output) for sessions 1 and 2 after each session
- ArcLoaderService log lines showing arc context loaded at sessions 2 and 3 start
- Screenshots: session-context panel (sessions 2+3), welfare modal (sessions 2+3), gap briefing (sessions 2+3)
- 403 ARC_COMPLETE network response (session 4 attempt blocked)
- API log excerpt: guard prompt for a session-2/3 turn (confirm no arc-summary content in guard input)

---

### (i) Author-preview run

What is run:
- Login as rehearsal teacher (TEACHER role)
- Navigate to the seeded template in authoring UI
- Trigger "Run Preview" (AUTHOR_PREVIEW bot run)
- Wait for completion (server-side; bot completes all turns via StudentBotProvider)
- View completed preview result (transcript + evaluation output in teacher/author view)
- Check student dashboard (login as rehearsal-student): preview attempt NOT visible
- Check credit-admin (login as rehearsal-admin): credit usage unchanged by preview run

By whom: Owner (3 role-switches: teacher for preview, student for visibility check, admin for credit check)

Pass bar:
- Author-preview bot run completes without crash
- Preview transcript and evaluation output accessible in teacher/authoring review view
- Preview attempt: NOT visible in student-facing dashboard (rehearsal-student sees no preview)
- Preview attempt: NOT counted in credit usage (rehearsal course credit balance unchanged)
- AUTHOR_PREVIEW activity_type=SELF_SIMULATION in UsageLog (not STUDENT) -- cosmetic check

Evidence:
- Screenshot: preview result view (transcript + evaluation structure, 0/10 scores OK)
- Screenshot: student dashboard (no preview entry visible)
- Screenshot: credit-admin usage before vs after preview run (balance unchanged)

---

## Go/no-go decision mechanics

Decision maker: Ido (VP R&D). Per feasibility-ido.md Section 3: "Go/no-go is Ido's call."
Same-day ruling required: Ido rules by end of 2026-08-15. No overnight delay.

Evidence deadline: all criterion runs complete by 14:00 on 2026-08-15; Ido reviews by 17:00.

### GO criteria (ALL must be true)

- (a) STRUCTURAL PASS: pipeline runs, PatientStateLog populated, no crash.
- (b) STRUCTURAL PASS: guard runs, verdict recorded, no crash.
- (c) STRUCTURAL PASS: analyser runs, scores recorded (any value), no crash.
- (d) STRUCTURAL PASS: evaluation pipeline completes, student/teacher views render, override works.
- (e) PASS: session resume works, no data loss.
- (f) PASS: credit hard-limit blocks.
- (g) PASS: support assistant contains no patient context data.
- (h) PASS: all 4 arc invariants confirmed, arc cap fires on session 4 (see above).
- (i) PASS: author-preview completes, invisible to student, credit unchanged.

### NO-GO triggers (October fallback, ~2026-10-15)

Automatic NO-GO if any of the following:
1. (a) structural failure: turn pipeline crashes mid-session or PatientStateLog not written.
2. (b) structural failure: guard-runner crashes (TypeError, uncaught exception in guard path).
3. (d) structural failure: evaluation pipeline does not complete for a COMPLETED attempt.
4. (h) ANY invariant fails: trust values wrong across session boundary; invented-fact content
   appears in guard prompt; welfare modal missing at sessions 2 or 3; arc cap does not fire.

Judgment call (not automatic -- Ido rules same-day):
- (e) failure with a same-day hotfix path: Ido may hold GO if fix can be applied before 18:00.
- (f) failure with a same-day hotfix: same.
- (g) failure (support leaks patient data): automatic NO-GO (clinical safety concern).
- (i) failure where preview attempt appears in student dashboard: automatic NO-GO (data isolation
  violation).

### Escalation path (if NO-GO)

Ido -> Eco same day (2026-08-15) with envelope:
  - Which criterion(ia) failed
  - Engineering root cause (brief)
  - Remediation estimate (days)
  - Revised rehearsal target date
  - Revised pilot launch date (~2026-10-15)

Eco -> owner (jecki) -> Adam relay (no agent contacts Adam; owner delivers via Eco account email).

### October fallback trigger conditions (for completeness)

From feasibility-ido.md Section 3 + 3session-arc-feasibility-ido-2026-07-11.md Section 3:
If 15-Aug rehearsal fails on any automatic NO-GO trigger:
- Target fallback launch: ~2026-10-15 (9 weeks from 15-Aug; same window as original plan).
- Sprint 5+6 (2026-08-18 to 2026-09-12): fix specific rehearsal failures, no scope add.
- Second rehearsal target: 2026-09-13.
- Sprint 7 (2026-09-14 to 2026-10-10): hardening + QA + launch prep.
- Launch: 2026-10-15.

Pre-trigger condition: if Adam's 2026-08-08 checkpoint identifies a STRUCTURAL delta model
defect (not a config tweak), Ido escalates to Eco immediately (2026-08-08). October
fallback may be called before 2026-08-15 in this case.

---

## What the rehearsal does NOT validate (and what does)

NOT validated at 15-Aug rehearsal (StubProvider limit):
- Clinical accuracy of the interaction analyser (criterion c, 70% bar) -- DEFERRED to real-model rehearsal
- Rubric score accuracy against clinical-advisor expectations (criterion d score fidelity) -- DEFERRED
- Real patient response quality (LLM outputs) -- DEFERRED

Validated by the 2026-08-08 Adam checkpoint (pre-rehearsal):
- Delta model coherence across 3 sessions (trust/openness/alliance trajectories at
  engineering defaults 0.70/0.65/0.70 ceilings) -- Adam confirms or requests config adjustments

Validated pre-production (APS-004 gate, after 15-Aug if GO):
- LLM provider selected + data-handling gate (Rambo/Eyal/Lital)
- Real model plugged in: patient response quality, analyser accuracy, guard verdict accuracy
- Second rehearsal on real model before actual student usage

---

## Rehearsal day schedule (suggested)

2026-08-15:
09:00 -- Seed environment, confirm prerequisites
09:30 -- Criterion (g) support isolation check (quick)
10:00 -- Criterion (a)/(b)/(c)/(d) in one session: run session 1 of the arc (covers all single-session criteria too)
11:30 -- Criterion (h) arc sessions 2 and 3 (contiguous; do not break)
13:30 -- Criterion (e) interrupt/resume test (separate student session)
14:00 -- Criterion (f) credit hard-limit test
14:30 -- Criterion (i) author-preview run
15:30 -- Ido reviews all evidence packages
17:00 -- GO/NO-GO ruling delivered to Eco

Note: arc sessions (h) are the longest block. Schedule them contiguously mid-morning when
focus is highest. Do not leave them for the end of day.

---

*Ido (VP R&D) | 2026-07-11 | Rehearsal plan for 2026-08-15*
*Supersedes: feasibility-ido.md Section 3 (Sprint 4 criteria) and adam-answers-feasibility-ido-2026-07-08.md Section 3 criteria (h)+(i)*
*Updated criterion (h): 3-session arc (per sprint-5-envelope-ido-2026-07-11.md + 3session-arc-feasibility-ido-2026-07-11.md)*

---

## Addendum: Oren S6 review notes folded in (Eco, 2026-07-11)

From review-sprint-6-oren.md (i-4, i-5, time-risk INFO). Rehearsal coordinator must apply:

1. PREREQUISITE ADDITION (criterion g evidence path): API server runs in dev/debug mode
   (or with arc-context + guard-prompt logging enabled) during the rehearsal, so the
   "support prompt contains no PatientStateLog / ground-truth fields" check is
   verifiable from logs, not only from behavioral observation.
2. ROLE-SWITCH PROTOCOL (criterion i): switch roles via logout/login in a single
   browser tab; confirm each role's session is established before taking the evidence
   screenshot, so the whole evidence chain is from one rehearsal environment.
3. TIME RISK (criterion h): the 3-contiguous-session arc run at 11:30-13:00 compresses
   if the 10:00 block (arc session 1 + criterion d teacher-override) runs past 11:15.
   Coordinator watches the clock at 11:15; if slipping, shift the (h) block whole --
   never split the arc run across a break.
4. CRITERION (f) PASS-BAR CORRECTION (Eco, code-verified 2026-07-11, detail in
   rehearsal-readiness-adi-2026-07-11.md addendum): credit enforcement fires at the
   TURN level (engine InputGate CREDIT_HARD_LIMIT), NOT at attempt-create, and there
   is no 402 path in the build. Correct expectation: at exhausted credit,
   attempt-create SUCCEEDS and the first TURN returns the blocked result. Testers
   must not read a successful attempt-create as a failure of (f).
