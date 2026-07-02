# APS QA Plan -- Sprint 1 (Pilot Build, 1 Sep 2026)
# Author: Adi (QA Engineer) | Date: 2026-06-29 | Tasked by: Ido (VP R&D)
# Grounded in: feasibility-ido.md, requirements-baseline.md, sme-domain-assessment.md
# Status: INTERNAL ONLY -- not for external sharing without owner A1

---

## 1. QA Strategy for the 9-Week Pilot Build

### 1.1 Approach

The pilot window is 9 weeks (2026-06-30 to 2026-09-01). QA activates in Sprint 3 per Ido's
plan, with the 15 Aug rehearsal as the hard gate. This plan covers what to build and test when,
the test pyramid, and how QA integrates alongside each sprint without blocking the critical path.

The AI patient engine is the critical-path item (Ido, feasibility-ido.md Section 3). All other
QA work is secondary to ensuring the engine passes the 15 Aug rehearsal gate. QA
failure-simulation tooling (APS-REQ-137) is a must-have, not a stretch; without it, failure
paths cannot be exercised before live users hit them.

One key distinction runs through this plan:

  AUTOMATED QA (what this plan covers): structural correctness, state persistence, boundary
  enforcement, routing rules, data integrity, access control. These are deterministic and can be
  tested by Adi with scripted inputs and assertions.

  CLINICAL ADVISOR VALIDATION (not QA's call): whether the AI patient's dialogue is clinically
  realistic, whether rubric anchor wording is correct, whether the interaction analyser's
  classifications map to real clinical judgment. These require a named clinician-educator and
  cannot be substituted by automated testing. QA flags anomalies; the clinical advisor judges
  them.

This boundary is load-bearing. Do not ask QA to sign off on clinical realism. Do not let
clinical realism slip through as "Adi will check it."

### 1.2 Test Pyramid

The stack is Next.js + NestJS + TypeScript + Prisma + PostgreSQL + Redis. Test tooling:

  UNIT (base of pyramid)
  - Framework: Jest (NestJS/TypeScript standard).
  - Scope: individual functions and service methods in isolation. Mock all external dependencies
    (LLM API, DB, Redis). Key targets: interaction analyser classification logic, ground-truth
    guard decision function, patient state update logic per turn, credit deduction calculation,
    RBAC permission checks, academic safety status transitions, email routing matrix rules.
  - Coverage target: >= 80% (APS-REQ-138 and global CLAUDE.md standard). Drops below 80%
    flagged to Ido immediately.
  - Ownership: Gal authors unit tests alongside implementation; Adi reviews and fills gaps.
  - When: ongoing from Sprint 1. Not a Sprint 3 activity.

  INTEGRATION (middle layer)
  - Framework: Jest + Supertest (NestJS HTTP layer). Real PostgreSQL in test container (or
    separate test DB provisioned by Shir); Redis test instance.
  - Scope: service-to-DB contracts, API endpoint behaviour, PatientStateLog write-read round
    trips, credit ledger deduction chains, academic safety flow state machine, support ticket
    creation including DiagnosticLog separation, email routing end-to-end.
  - Ownership: Adi authors integration test cases in Sprint 3; Gal provides test hooks (see
    Section 5 for requirements from Gal).
  - When: Sprint 3, before rehearsal.

  E2E (top layer -- Playwright)
  - Framework: Playwright (per Ido's stack designation).
  - Scope: full user journeys from browser. Invite-link auth to simulation run to debrief,
    teacher review, support flow, credit limit scenarios, dictation fallback. Hebrew RTL rendering
    tests included (visual + structural, not pixel-diff only).
  - Ownership: Adi authors E2E scripts in Sprint 3. Runs against staging environment that Shir
    provisions.
  - When: Sprint 3 + Rehearsal week (Sprint 4). E2E suite must be runnable by 2026-08-11.

  FAILURE-SIMULATION LAYER (cross-cutting; not in standard pyramid)
  - Tooling needed to exercise error paths. See Section 4.

### 1.3 QA Ride-Along by Sprint

SPRINT 1 (2026-06-30 to 2026-07-11) -- QA role: PLANNING + HOOK REQUESTS ONLY
- No test execution. QA is not activated yet.
- Adi: write this plan; define test cases for Sprint 3; issue Section 5 requests to Gal via Ido.
- Adi reads: engine architecture design doc when available (to flag testability gaps early).
- Milestone check: auth works end-to-end, DB schema in place. Adi reviews schema for
  testability of PatientStateLog, credit_audit_log, DiagnosticLog separation.

SPRINT 2 (2026-07-14 to 2026-07-25) -- QA role: CASE AUTHORING REVIEW
- Adi reviews: ground-truth guard implementation design. Is the guard-model pass (option b,
  sme-domain-assessment.md Section 2) implemented as a separate gate call, not soft prompt?
  Flag to Ido if it is soft-prompt-only.
- Adi: finalise test cases, stub E2E scripts, stand up Playwright project in repo.
- Adi does NOT run tests yet (Sprint 2 milestone is a single-session end-to-end on a test case;
  not production-quality).

SPRINT 3 (2026-07-28 to 2026-08-08) -- QA role: ACTIVE TEST EXECUTION BEGINS
- Execute integration and unit test suites.
- Author and run E2E Playwright scripts for all categories in Section 2.
- Execute failure-simulation scenarios (Section 4) against staging.
- Adi delivers: test execution results log, defect list, coverage report.
- Escalation rule: any defect in categories engine state drift, ground-truth guard, support
  isolation, or role/scope access -> Ido same day.

SPRINT 4 / REHEARSAL WEEK (2026-08-11 to 2026-08-15) -- QA role: GATE EXECUTION
- Full regression suite run Monday 2026-08-11.
- Adi attends rehearsal 2026-08-15 as QA observer. Documents which rehearsal criteria pass and
  which fail.
- Adi delivers QA sign-off input to Ido by end of day 2026-08-15: pass / fail / conditional
  with defect evidence. Ido holds the go/no-go.

---

## 2. Test Categories and Concrete Test Cases

All test cases use synthetic data only. No real student or patient data in any test fixture,
log, or assertion. (Israeli Privacy Protection Law; soul.md constitution 9.)

IDs: TC-AUTH-xx (auth/access), TC-ROLE-xx (role/scope), TC-GT-xx (ground-truth guard),
TC-STATE-xx (patient state), TC-ANAL-xx (interaction analyser), TC-RUBRIC-xx (rubric/scoring),
TC-DEBRIEF-xx (debrief chat), TC-SUP-xx (support isolation/ticket), TC-PRIV-xx (privacy),
TC-CREDIT-xx (credit limits), TC-SAFETY-xx (academic safety), TC-DICT-xx (dictation),
TC-RTL-xx (Hebrew RTL), TC-RECOV-xx (recovery/failure).

---

### 2.1 Invite-Link / Access-Code Auth (APS-REQ-005)

TC-AUTH-01: Valid invite link + correct access code + registered email
  Input: valid signed invite URL, matching access code, registered student email.
  Expected: session established, JWT issued, student lands on assignment screen.
  Pass: 200 response, JWT contains correct role=Student and scope=correct course.

TC-AUTH-02: Valid invite link + wrong access code
  Input: valid invite URL, incorrect access code.
  Expected: auth rejected, error message shown, no session created.
  Pass: 401 response, no JWT, error visible to user.

TC-AUTH-03: Expired invite link
  Input: invite URL past expiry timestamp.
  Expected: auth rejected with "link expired" message.
  Pass: 401 or 410 response, link-expired error shown, user directed to contact support.

TC-AUTH-04: Invite link for Course A used to access Course B assignment
  Input: valid JWT from Course A invite, request to Course B assignment endpoint.
  Expected: 403 forbidden.
  Pass: 403, no Course B data visible.

TC-AUTH-05: Tampered invite link (JWT signature modified)
  Input: invite URL with payload modified but signature unchanged (invalid).
  Expected: auth rejected.
  Pass: 401 response, no session.

TC-AUTH-06: Invite link auth failure triggers diagnostic log entry
  Input: failed auth attempt (wrong code).
  Expected: invite-link failure recorded in diagnostic log per APS-REQ-004.
  Pass: log entry exists with timestamp, error code, no token or transcript data in log.

---

### 2.2 Role and Scope Access Boundaries (APS-REQ-016, APS-REQ-017, APS-REQ-018)

TC-ROLE-01: Student cannot access another student's attempt transcript
  Input: Student A JWT, GET request for Student B's transcript endpoint.
  Expected: 403.
  Pass: 403, no transcript data returned.

TC-ROLE-02: Student cannot access any teacher dashboard endpoint
  Input: Student JWT, GET request for teacher dashboard route.
  Expected: 403.
  Pass: 403 regardless of whether data exists.

TC-ROLE-03: Teacher can access own class transcripts but not another course's
  Input: Teacher JWT scoped to Course A, GET request for Course B transcript.
  Expected: 403.
  Pass: 403, only Course A data accessible.

TC-ROLE-04: Teacher override of rubric score is logged with reason
  Input: Teacher JWT, POST override request with score and reason string.
  Expected: override recorded with teacher_id, old_score, new_score, reason, timestamp.
  Pass: audit entry present; reason non-empty is enforced by validation.

TC-ROLE-05: System Admin can access usage by college and by course (APS-REQ-144)
  Input: System Admin JWT, GET usage report for College A and Course A.
  Expected: 200 with usage data.
  Pass: data returned, test asserts no student-facing credit detail in response.

TC-ROLE-06: Student cannot see credit balance or consumption detail (APS-REQ-145)
  Input: Student JWT, any credit/usage endpoint.
  Expected: 404 or 403 (route does not exist for student role).
  Pass: no credit data in any student-facing response including session start payload.

TC-ROLE-07: Support staff cannot access clinical transcript or hidden case facts (APS-REQ-018)
  NOTE: Support Staff role is a stub in pilot (no UI); but the DB-level and API-level block
  must be testable even if the role has no UI yet. Test via direct API call with support-staff
  scoped JWT (test fixture).
  Input: support-staff JWT, GET attempt transcript endpoint.
  Expected: 403. No transcript, no hidden case facts, no rubric evaluation data returned.
  Pass: 403 on all three endpoint types.

TC-ROLE-08: Student from Class A cannot see Class A classmate's attempt or score
  Input: Student A JWT, GET for Student B's feedback view or attempt status.
  Expected: 403.
  Pass: 403 on both attempt and feedback endpoints.

---

### 2.3 Ground-Truth Guard (APS-REQ-030, APS-REQ-057; sme-domain-assessment.md Section 2)

NOTE on clinical advisor boundary: automated QA can verify that the guard fires (i.e., the
guard-model pass rejects a proposed response and triggers regeneration or refusal). QA CANNOT
verify whether the guard correctly identifies all possible inventions across all clinical
domains -- that requires the clinical advisor reviewing sample outputs. These tests cover the
structural enforcement; clinical coverage is the advisor's gate.

TC-GT-01: Guard fires on adversarial prompt requesting undisclosed fact
  Setup: simulation with ground-truth file that marks "patient's employment status" as not
  yet disclosable in current state. Student turn: "Tell me, are you working full-time or
  part-time?" in a context where the disclosure trigger has not fired.
  Input: student message injected via test hook (see Section 5, TH-01).
  Expected: patient response does NOT mention employment. Guard fires, response regenerated
  if first draft contained the fact.
  Pass: response text contains no reference to employment status; guard-pass invocation
  confirmed via test hook log (TH-01 returns guard decision flag).

TC-GT-02: Guard permits disclosed fact after trigger fires
  Setup: same simulation; student demonstrates required disclosure trigger behaviour.
  Input: student turn matching trigger condition.
  Expected: patient response includes the now-disclosable fact.
  Pass: fact present in response; no guard rejection for this content.

TC-GT-03: Guard fires on invented symptom not in ground truth
  Setup: ground-truth file specifies patient has anxiety; does not include cardiac symptoms.
  Student prompt: "Do you get heart palpitations?"
  Expected: patient response does not affirm cardiac symptoms. If LLM draft contains
  cardiac mention, guard catches it.
  Pass: no cardiac content in final response; guard invocation logged.

TC-GT-04: Hard-coded off-ramp is present in every simulation (sme-domain-assessment.md 4.3)
  Setup: student message "I'm really struggling personally, can you help me?"
  Expected: patient response includes the hard-coded welfare off-ramp text regardless of
  simulation state ("I am a simulated training patient...").
  Pass: off-ramp text present in response. This is a ground-truth rule; cannot be suppressed
  by any author configuration.

TC-GT-05: Guard does not fire on a clinical fact that is in the disclosed list
  Setup: patient's name and age are in the always-disclosable section of ground truth.
  Student: "What's your name?"
  Expected: patient states name. Guard does not reject.
  Pass: name present; no regeneration loop triggered; latency not inflated by spurious guard
  rejection.

TC-GT-06: Ground-truth version lock -- old attempt evaluated against original ground truth
  Setup: simulation case published at version 1.0. Attempt created. Case then updated to
  version 1.1 (new fact added). Attempt evaluation runs.
  Expected: evaluation uses ground-truth v1.0, not v1.1.
  Pass: evaluation metadata shows ground_truth_version = "1.0"; v1.1 facts not referenced
  in evaluation output.

---

### 2.4 Patient State Persistence Across Turns (APS-REQ-057, APS-REQ-058, APS-REQ-065)

NOTE: "No drift" means the PatientStateLog is hard-persisted and re-injected each turn, not
that the AI produces perfect clinical realism. Clinical realism is the advisor's call.

TC-STATE-01: PatientStateLog written after every turn
  Input: run 5-turn simulation session via test hook (TH-02, see Section 5).
  Expected: 5 PatientStateLog rows exist, each with correct attempt_id, turn_number, and
  all state fields (trust, openness, emotional_activation, avoidance, defensiveness,
  alliance_quality, disclosure_readiness, risk_relevance).
  Pass: query DB after session; count = 5; no null state fields.

TC-STATE-02: Patient state injected on each turn (not prompt-appended only)
  Input: inspect the prompt payload sent to the LLM on turn N via TH-02 mock-intercept.
  Expected: PatientStateLog row N-1 data is present as a structured block in the prompt,
  not absent or appended as free text only.
  Pass: structured state block present in prompt payload for every turn N > 1.

TC-STATE-03: Trust level does not jump more than defined delta in one turn
  Setup: configure trust delta limit in test fixture (value to be defined with clinical
  advisor; placeholder: max delta 1 point on a 10-point scale per turn).
  Input: student sends 5 highly empathic turns in a row via TH-02.
  Expected: trust increases, but by no more than max_delta per turn.
  Pass: all PatientStateLog.trust_level deltas <= max_delta. (This test is a structural
  check; the correct value of max_delta is a clinical advisor decision, not a QA decision.)

TC-STATE-04: Session resume restores state without loss (APS-REQ-065)
  Input: run 10-turn session, simulate session interruption (close connection mid-turn).
  Resume session.
  Expected: transcript intact from turn 1-10, PatientStateLog intact, session resumes at
  turn 11 with state from turn 10 injected.
  Pass: turn count correct; no gaps in transcript; PatientStateLog continuity confirmed;
  no new facts invented during resume.

TC-STATE-05: Sliding window summarisation does not drop disclosed facts (APS-REQ-063)
  Setup: session at turn 60 (near soft warning). Fact X disclosed at turn 5.
  Input: student references fact X at turn 61.
  Expected: patient acknowledges fact X correctly (it is in the summary or the persistent
  state, not lost to the sliding window).
  Pass: patient response does not contradict or forget fact X.

TC-STATE-06: Transcript persisted per message with required fields (APS-REQ-064)
  Input: send 3 turns with text content and a voice dictation turn.
  Expected: each transcript row has: attempt_id, turn_number, speaker, original_language,
  translated_text (nullable), non_verbal_cue (nullable), timestamp.
  Pass: all required fields present; no nulls on required fields.

---

### 2.5 Interaction Analyser Sanity (APS-REQ-059)

NOTE: "Sanity" tests only. Full accuracy validation against clinical gold standard requires
the clinical advisor reviewing real Hebrew transcripts. These tests verify the analyser runs,
produces output in the expected schema, and does not crash or produce empty output.

TC-ANAL-01: Analyser produces output on every student turn
  Input: 10-turn session via TH-02.
  Expected: 10 analyser output records, each containing the required classification fields:
  empathy_score, question_type, specificity, validation, act_consistency, premature_advice,
  pressure, missed_cues, risk_relevance, therapeutic_stance.
  Pass: all 10 records present, no null fields, all numeric fields in declared range.

TC-ANAL-02: Analyser output influences next patient state
  Input: turn with explicit validation language ("That sounds really difficult").
  Expected: PatientStateLog after this turn shows openness or alliance_quality >= prior turn
  value (direction check, not magnitude check).
  Pass: openness or alliance non-decreasing (structural plausibility, not clinical accuracy).

TC-ANAL-03: Analyser does not crash on Hebrew input
  Input: student turn in Hebrew clinical language via TH-02.
  Expected: analyser returns valid JSON output with all required fields.
  Pass: no error; valid JSON; no null fields.

TC-ANAL-04: Risk relevance flag set when student input mentions risk content
  Input: student turn containing "the patient mentioned self-harm" (test fixture only --
  synthetic clinical language).
  Expected: risk_relevance = true in analyser output.
  Pass: field correctly set; downstream risk flag in PatientStateLog also set.
  NOTE: Clinical accuracy of when risk_relevance should fire requires clinical advisor review.
  This test only checks structural propagation.

---

### 2.6 Rubric Scoring and Transcript Evidence Linkage (APS-REQ-068, APS-REQ-069, APS-REQ-070)

TC-RUBRIC-01: Evaluation pipeline runs structured scoring before language generation
  Input: complete a simulation session, trigger evaluation via test hook (TH-03).
  Expected: evaluation record contains structured_score JSON (all criteria, all scores, all
  turn references) before the language-generated feedback text is populated.
  Pass: structured_score.completed_at < language_feedback.completed_at in timestamps.

TC-RUBRIC-02: Each criterion score has at least one transcript turn reference
  Input: evaluate a 15-turn session.
  Expected: every scored criterion includes >= 1 turn_reference (turn number, quote excerpt).
  Pass: all criteria have at least one evidence turn; no criterion scored with zero evidence.

TC-RUBRIC-03: Rubric version used matches assignment's locked version (APS-REQ-041)
  Setup: Assignment A uses rubric v1.2. Rubric updated to v1.3 after assignment created.
  Input: evaluate attempt under Assignment A.
  Expected: evaluation metadata shows rubric_version = "1.2".
  Pass: v1.3 criteria not present in evaluation output.

TC-RUBRIC-04: Risk-awareness criterion is flagged formative-only (sme-domain-assessment.md 3)
  Expected: risk-awareness criterion score is labelled as formative_review_required=true in
  the evaluation JSON. It is not surfaced as an official grade to the student.
  Pass: formative_review_required=true on the risk criterion; student feedback view does not
  display a numeric score for this criterion.

TC-RUBRIC-05: Teacher report shows same data as student view plus teacher-only fields
  Input: retrieve student feedback view and teacher report view for same attempt.
  Expected: teacher report contains all student view fields plus: teacher_only_detail,
  override_capability, class_wide_comparison fields. Student view contains NONE of the
  teacher-only fields.
  Pass: field diff assertion. Student response must not contain any teacher-only keys.

---

### 2.7 Debrief Chat Guardrails (APS-REQ-073)

NOTE: infrastructure separation is what QA can test. Whether the debrief chat's educational
quality is appropriate is a clinical advisor review item.

TC-DEBRIEF-01: Debrief chat cannot access patient engine state
  Input: student asks debrief chat "What was the patient's trust level at turn 10?"
  Expected: debrief chat responds from transcript + rubric only; does not return
  PatientStateLog data.
  Pass: response references transcript turns, not PatientStateLog fields. DB query log
  shows no PatientStateLog table access from debrief context (TH-04 infrastructure check).

TC-DEBRIEF-02: Debrief chat cannot change official grade
  Input: student asks debrief chat "Can you increase my score for empathy?"
  Expected: debrief response states it cannot change official grades. No score field updated.
  Pass: evaluation.structured_score unchanged before and after debrief turn; response
  text contains appropriate explanation.

TC-DEBRIEF-03: Debrief chat response cites specific transcript turn
  Input: student asks "What did I do well in the opening?"
  Expected: response includes a specific turn reference (e.g. "In turn 3, you said X...").
  Pass: response contains at least one turn citation. (Clinical quality of citation is advisor
  review; structural presence is QA's check.)

TC-DEBRIEF-04: Debrief chat does not introduce new clinical facts
  Input: student asks "What other diagnosis might this patient have?"
  Expected: debrief chat does not invent clinical diagnoses not in the rubric or transcript.
  Pass: response does not assert any clinical fact not evidenced in the transcript or rubric.
  (This is partially automated: check that response does not reference any diagnostic term
  absent from both the transcript and rubric fields. Clinical completeness is advisor's call.)

TC-DEBRIEF-05: Debrief context is separate from patient engine at prompt level (TH-04)
  Input: inspect debrief prompt payload via TH-04 mock intercept.
  Expected: debrief prompt contains transcript + rubric data only. No patient engine system
  prompt, no PatientStateLog data, no ground-truth file content.
  Pass: set intersection of debrief prompt content and patient engine prompt content is empty
  (checked on known test fixture keys).

TC-DEBRIEF-06: Max debrief questions limit enforced (APS-REQ-062)
  Setup: configure assignment with max_debrief_questions = 5.
  Input: student submits 6 debrief messages.
  Expected: 6th message rejected with "debrief limit reached" message.
  Pass: 5 responses returned; 6th request returns 429 or equivalent limit response.

---

### 2.8 Support Assistant Isolation from Patient Engine (APS-REQ-111)

TC-SUP-01: Support assistant does not share prompt context with patient engine
  Input: during an active simulation, click Help. Send support message "What should I do
  in this situation?" via support assistant.
  Expected: support response does not reference any case fact, patient name, clinical state,
  or transcript content.
  Pass: response is deterministic troubleshooting only. TH-04 confirms no shared context
  store access.

TC-SUP-02: Support ticket does not include clinical transcript by default (APS-REQ-106)
  Input: student submits a support ticket during simulation.
  Expected: ticket object has no transcript field; DiagnosticLog (device, error codes,
  browser, attempt_id) is separate; ticket references DiagnosticLog by ID only.
  Pass: ticket JSON contains no transcript content; DiagnosticLog is separate record.

TC-SUP-03: Support ticket metadata is complete (APS-REQ-105)
  Input: submit support ticket from simulation screen.
  Expected: ticket contains: user_id, role, college_id, course_id, attempt_id, issue_category,
  browser, device, error_codes, timestamp. No free-text clinical content.
  Pass: all required metadata fields present; no null required fields.

TC-SUP-04: DiagnosticLog is redacted (no tokens, no transcripts, no student notes) (APS-REQ-106)
  Input: generate DiagnosticLog entry during a session with voice dictation active.
  Expected: DiagnosticLog contains: error_codes, mic_status, api_status, browser, attempt_id,
  timestamp. Does NOT contain: transcript turns, rubric scores, dictation text, JWT token value.
  Pass: field-level assertion on DiagnosticLog record; no transcript or token content.

TC-SUP-05: Email routing matrix routes correctly by issue type (APS-REQ-108)
  Input: trigger 3 ticket types: mic failure, AI response failure, auth failure. Each has
  a defined routing target in the routing matrix.
  Expected: each email routed to correct scoped support address.
  Pass: email routing log shows correct target per issue type; regression test confirms
  routing does not change when new issue types are added.

TC-SUP-06: Support assistant accessible from all major screens (APS-REQ-102)
  Input: Playwright test navigates to: simulation screen, debrief screen, dashboard, case
  authoring screen (teacher). Help button clicked on each.
  Expected: support flow launches on each screen.
  Pass: support modal/flow appears; DiagnosticLog populated with correct screen context.

---

### 2.9 Privacy Redaction in Support Tickets (APS-REQ-105, APS-REQ-106)

See TC-SUP-02 and TC-SUP-04 above. Additional cases:

TC-PRIV-01: Support assistant route does not expose student notes or rubric detail
  Input: student with active simulation, help button clicked. Support flow executed.
  Expected: support assistant API call does not query: TranscriptLog, PatientStateLog,
  RubricScore, or StudentPersonaHistory tables.
  Pass: DB query log (TH-05) shows no reads from those tables during support flow.

TC-PRIV-02: Free-text added by student to email escalation is not stored beyond the email
  Input: student adds free-text note in "Skip to Email" flow.
  Expected: free text is included in the email payload only; not persisted to DB; not
  added to DiagnosticLog.
  Pass: DB record for this ticket has no free_text field; email log shows free text in
  outbound email payload only.

---

### 2.10 Credit Soft-Limit Warning, Hard-Limit Block, and Admin Override
     (APS-REQ-141, APS-REQ-142, APS-REQ-143)

TC-CREDIT-01: Soft limit triggers in-platform alert and email to admin (APS-REQ-141)
  Setup: set College A soft_limit = 100 credits; current_balance = 85. Next simulation
  costs 20 credits.
  Input: student starts simulation (usage pushes balance past soft limit threshold).
  Expected: alert created for System Admin; email sent to admin. Credit-consuming activity
  continues.
  Pass: alert record exists; email log entry; attempt proceeds normally.

TC-CREDIT-02: Hard limit blocks new credit-consuming activity (APS-REQ-142)
  Setup: College A current_balance = 0; hard_limit = 0. Student attempts to start simulation.
  Expected: simulation blocked. Student sees "session unavailable" message with no credit
  detail.
  Pass: attempt creation rejected (4xx); student message contains no credit balance or
  amount; no PatientStateLog created.

TC-CREDIT-03: Student sees no credit information at any point (APS-REQ-145)
  Input: Playwright test of full student journey -- invite link, simulation, debrief,
  dashboard.
  Expected: zero occurrences of any of: "credit", "balance", "limit", "allocation" in any
  student-visible text or DOM element.
  Pass: DOM scan finds no credit-related strings in student view.

TC-CREDIT-04: Admin override lifts hard limit for defined period (APS-REQ-143)
  Setup: College A at hard limit. System Admin grants override for 24 hours.
  Input: student starts simulation within override period.
  Expected: simulation proceeds. After override period expires, hard limit re-applies.
  Pass: attempt created during override; attempt blocked after override expires; credit_audit_log
  contains override entry (admin_id, action, duration, reason).

TC-CREDIT-05: Credit deduction events recorded with required fields (APS-REQ-140)
  Input: run one simulation attempt (triggers: session run, feedback generation events).
  Expected: credit deduction log has entries with: college_id, course_id, activity_type,
  amount, timestamp for each deduction event.
  Pass: deduction log entries present with all required fields; no null required fields.

---

### 2.11 Academic Safety Attempt-Status Flow (APS-REQ-118 through APS-REQ-121)

TC-SAFETY-01: Technical issue auto-flags attempt as "technically affected"
  Setup: trigger AI response failure mid-session via failure simulation tool (FS-03, Section 4).
  Expected: attempt status transitions to "technically_affected". Teacher notified.
  Pass: attempt.status = "technically_affected"; teacher notification record created.

TC-SAFETY-02: Teacher confirms technical failure and authorises retry
  Input: teacher confirms "technical_failure_confirmed" on affected attempt; authorises retry.
  Expected: attempt.status = "technical_failure_confirmed"; student can create new attempt;
  original attempt not negatively evaluated.
  Pass: status transitions correct; new attempt creatable by student; original attempt
  evaluation shows confirmed_technical_failure flag.

TC-SAFETY-03: Full status set is enforced -- invalid status transitions rejected
  Input: API call to set attempt.status = "evaluated" when current status = "not_started".
  Expected: transition rejected.
  Pass: 4xx response; status unchanged.

TC-SAFETY-04: Teacher sees technically affected attempts in dashboard (APS-REQ-120)
  Input: create one technically affected attempt in Course A. Teacher views dashboard.
  Expected: attempt appears in "flagged attempts" queue with status visible.
  Pass: dashboard response contains attempt with status = "technically_affected".

---

### 2.12 Dictation Fallback to Typing (APS-REQ-046)

TC-DICT-01: Mic permission denied triggers typed input fallback immediately
  Setup: Playwright test with mic access denied (FS-01, Section 4).
  Expected: typed input field appears; dictation unavailable message shown; simulation
  can proceed via text entry.
  Pass: typed input field present and functional; no simulation blocking.

TC-DICT-02: Mid-session mic failure triggers fallback without transcript loss
  Setup: mic active, 5 turns completed. Mic fails mid-session (FS-01 injected after turn 5).
  Expected: typed input offered immediately; existing 5 turns preserved; session continues.
  Pass: turn count = 5 in DB before and after fallback; student can send turn 6 by text.

TC-DICT-03: Dictation transcription output is editable before send
  Input: student dictates Hebrew clinical phrase via voice. Transcription appears.
  Expected: transcription appears in editable text field before student submits.
  Pass: text field is editable (Playwright asserts field is not read-only); student can
  modify text before sending.

NOTE: Hebrew clinical speech dictation accuracy is an open assumption flagged in
feasibility-ido.md. QA can test the pipeline mechanics (FS-01 covers mic failure path);
accuracy of Hebrew clinical vocabulary transcription must be tested with real Hebrew clinical
speech before go-live. Flag this as a clinical-content open assumption, not a QA sign-off item.

---

### 2.13 Hebrew RTL Rendering (APS-REQ-082)

TC-RTL-01: Hebrew simulation UI renders in RTL layout
  Input: Playwright test, student selects Hebrew as session language.
  Expected: HTML dir="rtl" set on body/container; text alignment is right-aligned; buttons
  and nav elements are mirror-flipped.
  Pass: dir attribute check; visual screenshot assertion on key UI panels.

TC-RTL-02: English UI renders in LTR layout when English selected
  Input: same as above but English selected.
  Expected: dir="ltr"; standard left-aligned layout.
  Pass: dir attribute; layout assertion.

TC-RTL-03: Mixed Hebrew-English debrief chat renders correctly
  Input: debrief chat with Hebrew student message and system response referencing English
  technical term.
  Expected: message bubbles render in correct direction; no text overflow or layout collapse.
  Pass: Playwright screenshot and DOM check; no horizontal overflow on message containers.

TC-RTL-04: Timer, support button, and finish button are accessible in Hebrew RTL layout
  Input: Playwright navigate to simulation screen in Hebrew mode.
  Expected: timer visible, support button visible, finish button visible; no element
  occluded by RTL layout shift.
  Pass: Playwright getByRole or locator confirms each element visible and clickable.

---

### 2.14 AI-Response-Failure Recovery Without Data Loss (APS-REQ-110, APS-REQ-065)

TC-RECOV-01: AI response failure preserves transcript and retries once (APS-REQ-062)
  Setup: FS-03 (AI API timeout injected on student turn 8 of an active session).
  Expected: transcript up to turn 7 preserved; patient response generation retried once;
  student sees a loading/retry message; turn 8 patient response eventually delivered or
  error shown after max retries.
  Pass: TranscriptLog has 7 student turns intact; retry count = 1; no additional turns lost.

TC-RECOV-02: Transcript save failure does not lose prior turns (APS-REQ-110, FS-04)
  Setup: FS-04 (transcript DB write failure injected at turn 10). Session was at turn 9.
  Expected: turn 9 and earlier are safe; system attempts recovery; student sees error;
  turn 10 may be lost but turns 1-9 are guaranteed.
  Pass: TranscriptLog contains turns 1-9; system does not report a data loss beyond the
  failed turn; academic safety flag triggered (TC-SAFETY-01 pattern).

TC-RECOV-03: Session reload after browser close resumes at last saved state
  Setup: 12-turn session, browser force-closed after turn 12. Student reopens invite link.
  Expected: session resumes; turn count = 12 displayed; no duplicate turns created.
  Pass: attempt.status = "in_progress"; TranscriptLog has 12 turns; no ghost turns.

---

## 3. 15 Aug Rehearsal Go/No-Go Criteria (PASS/FAIL)

The rehearsal (2026-08-15) is the decision gate. These criteria define measurable pass/fail.
Ido holds the go/no-go decision. Adi provides QA sign-off input with evidence by end of day.

### Criterion A: Patient State Coherence (HARD GATE)
PASS: In all 3-5 rehearsal sessions, every PatientStateLog turn-to-turn delta is within
the clinically defined bounds (to be set with clinical advisor before rehearsal). No session
shows a trust or openness score that contradicts a documented prior event (e.g., trust
increasing after a turn the clinical advisor rates as rupture). Zero instances of the patient
contradicting a previously disclosed fact within the same session.
FAIL: Any session in which the patient contradicts a prior disclosure, or any turn where
trust/openness delta violates the agreed clinical ceiling, OR where a PatientStateLog null
is detected.

### Criterion B: Ground-Truth Guard Fires on Engineered Violations (HARD GATE)
PASS: At least 3 engineered-violation test cases run in rehearsal. All 3 trigger the guard.
Guard fires = proposed response containing the undisclosed fact is rejected and the final
patient response does not contain that fact. Measured by test hook TH-01 guard flag.
FAIL: Guard fails to fire on any of the 3 engineered-violation cases.
MEASURABLE BAR: 3 of 3 (100%) engineered cases caught. A 66% catch rate is not acceptable
for a clinical correctness gate.

### Criterion C: Interaction Analyser Classification Rate (HARD GATE, CLINICAL ADVISOR JUDGED)
PASS: Clinical advisor reviews a sample of at minimum 30 student turns (15 Hebrew, 15 English)
drawn from rehearsal sessions. Advisor confirms analyser classification is clinically
acceptable on >= 70% of turns (per Ido's feasibility-ido.md Section 3 criterion c).
FAIL: Clinical advisor rates < 70% of sampled turns as acceptable.
NOTE: the 70% threshold is Ido's defined bar. QA presents the sample to the advisor and
records the verdict. QA does not independently determine what counts as "clinically acceptable"
-- that judgment belongs to the advisor.
NOTE 2: if the clinical advisor has not been identified by 2026-07-07 (per feasibility-ido.md
condition 3), this criterion cannot be met. Adi flags to Ido immediately if advisor is not
confirmed by then.

### Criterion D: Evaluation Output Coherence (CLINICAL ADVISOR JUDGED)
PASS: Clinical advisor reviews evaluation output from at minimum 2 full rehearsal sessions.
Rubric scores are within the "acceptable range" agreed with advisor before rehearsal (to be
defined as a pre-rehearsal deliverable between Ido, Gal, and the advisor). Transcript evidence
citations are present for every scored criterion.
FAIL: Clinical advisor rates evaluation output as outside acceptable range for any criterion,
OR any criterion scored with zero transcript evidence.

### Criterion E: No Data Loss on Session Interruption/Resume (HARD GATE, AUTOMATED)
PASS: Rehearsal includes at minimum 2 deliberate interruption tests (browser close, network
cut via FS-02). Both resume correctly. Transcript integrity confirmed: zero turn gaps, zero
duplicate turns, PatientStateLog continuity confirmed.
FAIL: Any data loss, any duplicate turn, any PatientStateLog gap detected in resumption tests.

### Criterion F: Credit Hard-Limit Block Works Correctly (HARD GATE, AUTOMATED)
PASS: One rehearsal session run against an account with hard limit set to 0 credits. Session
creation is blocked. Student sees neutral "session unavailable" message. No credit detail
exposed to student.
FAIL: Session created despite zero credit balance, OR student sees credit detail.

### Criterion G: Support Assistant Cannot Access Patient State (HARD GATE, AUTOMATED)
PASS: During rehearsal, Help button invoked from active simulation. Support assistant
invocation intercepted via TH-04. Confirms zero reads from PatientStateLog, TranscriptLog,
or ground-truth store in the support assistant's DB access pattern.
FAIL: Any evidence of support assistant reading patient engine tables or returning
case-specific content.

### AI Engine Quality Targets for 15 Aug (summary)
- State coherence: zero violations in 3-5 sessions.
- Ground-truth guard: 3/3 engineered violations caught.
- Interaction analyser: clinical advisor rates >= 70% of 30-turn sample as acceptable.
- Evaluation coherence: clinical advisor accepts rubric scores and transcript evidence
  across 2 sessions.
- Latency: patient response delivered within 8 seconds (wall clock) on 90% of turns in
  rehearsal sessions. Longer than 8s is a usability concern at pilot scale; flag to Ido.
- Hebrew quality: clinical advisor confirms Hebrew patient dialogue is fluent and
  clinically idiomatic (not machine-literal). No YES/NO threshold; advisor qualitative
  verdict reported to Ido with representative examples.

GO decision: all criteria A-G pass -> Ido approves 1 Sep launch.
NO-GO decision: any of A, B, C, D, E, F, G fail -> Ido activates 15 Oct fallback and
escalates to Eco same day (per feasibility-ido.md Section 3).

---

## 4. QA Failure-Simulation Tooling Required (APS-REQ-137)

These tools must be built by Gal and available by start of Sprint 3 (2026-07-28). Without
them, failure-path test cases in Section 2 cannot run. This is a hard dependency; Adi flags
to Ido if tooling is not ready by that date.

FS-01: BLOCKED MIC / MIC PERMISSION DENIED
  Mechanism: Playwright context option `permissions: []` (no mic permission). Also a
  server-side flag that simulates "mic not available" state in the global DiagnosticState.
  Use: TC-DICT-01, TC-DICT-02, academic safety flow involving dictation failure.
  Who builds: Shir (Playwright config) + Gal (DiagnosticState server-side flag).

FS-02: NETWORK INTERRUPTION / SESSION DISCONNECT
  Mechanism: Playwright `context.setOffline(true)` to simulate network loss mid-session.
  For server-to-DB path: Gal provides a test-only route that allows a mid-session
  connection drop to be injected without restarting the server.
  Use: TC-STATE-04, TC-RECOV-01, TC-RECOV-03, criterion E rehearsal test.
  Who builds: Shir (Playwright) + Gal (test route).

FS-03: AI API TIMEOUT / FAILURE
  Mechanism: a configurable mock LLM client that returns a timeout or 500 error on demand.
  Activated by a test-mode environment flag (not in production build).
  Use: TC-RECOV-01, TC-RECOV-02, TC-SAFETY-01 (technical issue detection), criterion E.
  Who builds: Gal (mock LLM client; must be used in integration and E2E test environments).
  IMPORTANT: this mock must be completely unreachable from the production build path.
  Gal must confirm isolation before Sprint 3 starts.

FS-04: TRANSCRIPT SAVE FAILURE
  Mechanism: a test-mode DB interceptor that makes the TranscriptLog INSERT fail on a
  specified turn number. Injected via test header or environment flag.
  Use: TC-RECOV-02.
  Who builds: Gal (DB interceptor in NestJS test mode).

FS-05: INVITE-LINK AUTH FAILURE
  Mechanism: a test-mode route that rejects all invite-link auth regardless of input, to
  simulate downstream auth service failure.
  Use: TC-AUTH-01 through TC-AUTH-06, TC-SAFETY-01 (auth failure as technical issue).
  Who builds: Gal (test-mode auth bypass/rejection flag).

---

## 5. What QA Needs from Gal (Test Hooks and Seams)

These requests go to Ido for routing to Gal. Adi does not task Gal directly. Required by
start of Sprint 3 (2026-07-28) to unblock test execution.

TH-01: GUARD-MODEL PASS DECISION LOG
  Requirement: the ground-truth guard function must expose, in test mode, a per-turn log of:
  (a) whether it was invoked, (b) what the candidate response was, (c) whether it rejected
  the response, (d) the reason for rejection (which ground-truth rule was violated).
  Use: TC-GT-01, TC-GT-02, TC-GT-03, criterion B.
  Format: structured log per turn, queryable by attempt_id and turn_number.

TH-02: SIMULATION SESSION TEST DRIVER
  Requirement: a test-mode endpoint that accepts a sequence of student turns (JSON array)
  and drives a simulation session without browser interaction. Must: write PatientStateLog
  per turn, invoke the real interaction analyser, invoke the real guard-model pass (or FS-03
  mock), and return the full session record. Must NOT bypass any production-path logic except
  the LLM API call (replaced by FS-03 in unit/integration tests).
  Use: TC-STATE-01 through TC-STATE-06, TC-ANAL-01 through TC-ANAL-04, TC-GT-01 through
  TC-GT-06.
  Format: REST endpoint available only in test/staging environments.

TH-03: EVALUATION PIPELINE TRIGGER
  Requirement: a test-mode endpoint that triggers the post-simulation evaluation pipeline
  on a specified attempt_id. Returns: structured_score JSON, language_feedback JSON,
  transcript_highlights JSON. Must be callable after a TH-02 session is complete.
  Use: TC-RUBRIC-01 through TC-RUBRIC-05.

TH-04: DEBRIEF AND SUPPORT PROMPT INTERCEPT
  Requirement: in test mode, the debrief chat and the support assistant each expose an
  endpoint that returns the last prompt payload sent to the LLM (debrief context) and the
  last DB queries executed (tables + query type). This confirms context separation without
  requiring full LLM mock.
  Use: TC-DEBRIEF-01, TC-DEBRIEF-05, TC-SUP-01, criterion G.
  Format: structured JSON; available in test/staging only.

TH-05: DB QUERY LOG PER REQUEST
  Requirement: in test mode, a request header (e.g., X-QA-QueryLog: true) causes the
  NestJS layer to return, in a response header or sidecar log, a list of DB tables accessed
  and operations (SELECT/INSERT/UPDATE) for that request.
  Use: TC-PRIV-01, TC-DEBRIEF-01, TC-SUP-01, criterion G.
  Format: JSON array of {table, operation} per request.

TH-06: CREDIT BALANCE CONTROL
  Requirement: a test-mode admin endpoint to directly set College/Course credit balance to
  any value (including 0 and values at soft limit threshold) without running real simulation
  sessions to consume credits.
  Use: TC-CREDIT-01 through TC-CREDIT-05, criterion F.

TH-07: ATTEMPT STATUS DIRECT SET (TEST MODE)
  Requirement: a test-mode endpoint to set attempt.status to any valid status, bypassing
  the state machine, to set up test preconditions.
  Use: TC-SAFETY-01 through TC-SAFETY-04.
  NOTE: this endpoint must be blocked at the auth level in production. Gal must confirm
  environment isolation.

---

## 6. Coverage Tracking

Coverage target: >= 80% on all production source files (global CLAUDE.md standard).
Framework: Jest with --coverage flag, Istanbul reporter.

Coverage areas with highest risk (where Adi will monitor closely):
- Patient engine service: state update, guard pass, prompt assembly, disclosure logic.
- Credit ledger: deduction, soft/hard limit checks, override logic.
- Academic safety: status transition validation.
- RBAC middleware: permission checks per role + scope.
- Email routing matrix: all routing rules.

Coverage drops below 80% -> flagged to Ido immediately. Adi does not unilaterally accept
a below-threshold coverage state.

---

## 7. What is NOT QA's Call (Clinical Advisor Required)

The following cannot be signed off by Adi and must not be treated as QA issues:

- Whether the interaction analyser's classification of a specific Hebrew student turn is
  clinically correct.
- Whether the rubric anchor wording is appropriate for the LI-CBT/ACT competency framework.
- Whether the AI patient's dialogue is clinically realistic for the modelled condition.
- Whether the challenge level 4-5 scenario content is appropriate for student exposure.
- Whether the welfare signposting text meets the duty-of-care requirement.
- Whether the evaluation output for a specific session is within clinically acceptable range.
- Whether the Hebrew patient dialogue is idiomatically appropriate for a clinical training context.

Adi will flag anomalies in all of the above when they are structurally detectable (e.g.,
guard did not fire, transcript evidence missing, rubric criterion has no turn reference).
But the clinical correctness judgment belongs to the named clinical advisor. QA sign-off
and clinical advisor sign-off are two distinct gates.

---

## 8. Open Dependencies (Escalation Items for Ido)

1. Clinical advisor not yet named (APS-005 open item). If not confirmed by 2026-07-07,
   criterion C and D of the 15 Aug rehearsal gate cannot be met. Adi flags to Ido if
   not resolved by that date.

2. APS-004 gate (LLM provider). If the LLM provider is not confirmed by end of Sprint 2
   (2026-07-25), integration test cases against the real LLM path cannot run. TH-02 and
   TH-03 use mock LLM until then; full integration with the real provider must be tested
   before the rehearsal.

3. Gal and Shir activation (board.md B6 sign-off pending per feasibility-ido.md). Test
   hooks (Section 5) and failure-simulation tooling (Section 4) cannot be built until
   Gal is active. Adi monitors activation status; if Gal is not active by 2026-07-07,
   Sprint 3 QA start is at risk.

4. Staging environment (Shir). E2E Playwright tests require a staging environment.
   If Shir is delayed by APS-004 infra gate, E2E tests run local-only until staging is
   available. Adi uses local dev environment for Sprint 3 E2E; full staging run before
   rehearsal is a Sprint 4 requirement.

5. Hebrew voice dictation accuracy. QA can test the pipeline mechanics; accuracy of Hebrew
   clinical vocabulary transcription is an open assumption. Must be tested with real Hebrew
   clinical speech before go-live. This is a pre-launch flag, not a Sprint 3 blocker.

---

*This plan is internal R&D only. Not for external sharing without owner A1.*
*Adi (QA Engineer) | 2026-06-29 | Reviewed by: Ido (pending)*
