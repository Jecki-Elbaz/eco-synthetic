# APS Engine Architecture Review
# Author: Ido (VP R&D) | Date: 2026-06-29 | Task: Sprint 1 gate before Sprint 2 build
# Input: engine-architecture-gal.md, feasibility-ido.md, sme-domain-assessment.md,
#        qa-plan-adi.md, ux-flows-designer.md, devops-infra-shir.md
# Status: INTERNAL ONLY -- not for external sharing without owner A1
# Audience: Gal (Lead Dev), Eco (CEO), escalation to owner as noted

---

## 1. Verdict

APPROVED-WITH-CONDITIONS.

The design is substantively correct on the hard requirements. Gal has nailed the three
non-negotiable items Sami specified: hard-persist PatientStateLog, separate-call guard model,
and LLMProvider abstraction with StubProvider. The schema is thorough, the pipeline sequencing
is right, and the package boundaries are clean. This is not a rework -- the conditions below
are scoped decisions Gal needs from me to proceed, not gaps in the design.

Sprint 2 build is APPROVED to start, subject to the conditions in Section 2 and the
escalations in Section 5 landing before their stated deadlines.

---

## 2. Guard-Model Latency -- Ido's Call (RISK-1)

DECISION: option (a) -- stream the patient response, gate delivery on a parallel guard pass.

Rationale:

Clinical safety is the constraint that dominates here. The guard model exists precisely to
prevent an invented clinical fact from reaching the student. If we accept latency and deliver
the unguarded response first, we have no guard -- we have a post-delivery audit. That is not
option (b) from Sami; it is option (a) (soft). "Accept latency" is not a valid clinical safety
posture for this product.

The streaming architecture:
- Initiate the patient response LLM call (streaming).
- In parallel, buffer the stream and run the guard call against the buffered output.
- If guard returns PASS before the stream ends: release the buffer to the client.
  Perceived latency = guard latency (fast, light model), not generator latency + guard latency.
- If guard returns FAIL before stream ends: cancel stream, run one retry with guard feedback
  injected, run guard again. If FAIL after retry: deliver safe fallback.
- If guard returns PASS after stream already ended (worst case): release complete buffered
  response. Still faster-feeling than sequential because the guard ran in parallel.

This is more complex to implement than sequential, but the latency budget works: Adi's
UX spec sets 8 seconds as the "patient is thinking" threshold before the UI changes label,
and 45 seconds before error recovery triggers. Guard latency on a lighter model variant is
typically 500 ms-1.5 s. Even at 2 s guard latency on a slow provider, we have margin.

The LLMProvider interface already has ModelHint.GUARD_PASS and stream: boolean on LLMRequest.
Gal needs to add buffered-stream support on the generator call and a parallel executor that
wires the two calls. This is Sprint 2 scope.

On Gal's open question (single vs dual provider): SINGLE provider for Sprint 2. The ModelHint
abstraction already maps GUARD_PASS to a lighter/cheaper model within the same provider
(provider's own model tiers). A second separate provider adds APS-004 surface -- we would need
a second legal/security gate. Not worth it for Sprint 2. Revisit if provider A/B testing becomes
a business need in Phase 2. Gal does NOT need to extend to dual-provider config now.

---

## 3. Confirmed Architecture Decisions

### 3.1 PatientStateLog -- hard-persist + structured re-injection

CONFIRMED as designed. No change.

Gal's spec (Section 3.2) correctly implements all four Sami requirements:
- Row written to DB before response delivered; turn fails safe if write fails.
- Context builder reads from DB, not in-memory -- enables session resume automatically.
- State injected as a fixed structured block labelled "authoritative," not prose-appended.
- Quantitative dimensions updated by rule table, not LLM inference.

The delta-cap placeholder (0.10 per-turn max on any dimension) is acceptable as a build
scaffold. It must be replaced by clinician-calibrated values before the 15 Aug rehearsal.
This is a named dependency, not an architecture risk. See Section 5.

### 3.2 Deterministic delta-cap state updater (not LLM inference)

CONFIRMED. Rule-table approach is correct.

Sami is explicit (sme-domain-assessment.md s. 9.3): the rate of change on alliance,
symptom, and openness must be clinically bounded. LLM inference of "how much did this
student's empathy move the patient" is not calibratable and will produce unrealistic
fast-change or arbitrary patterns. The rule table (analyser dimension + threshold ->
state delta) is the right model. The delta-cap enforcement in the state updater is the
right enforcement point.

Gal: the rule table is the primary clinical advisor deliverable. Design it as a
data-driven config (JSON or DB table), not hardcoded constants. That way the advisor
can iterate values without a code deploy.

### 3.3 Ground-truth guard model -- separate LLM call

CONFIRMED. Separate call is mandatory. Gal's reasoning in Section 3.4 is correct:
a model cannot reliably critique its own output in the same context. Do not regress
this to a prompt modifier under any timeline pressure.

The guard prompt structure (Section 3.4) is clean. One clarification: the off-ramp text
(hardOffRampText) must be injected into every context build unconditionally (Section 3.4
confirms this), AND the guard must NOT be able to block the off-ramp. The guard's FAIL
logic gates on clinical fact invention against groundTruth.knownFacts. It does not gate
on the off-ramp. Confirm this is the implementation intent -- the off-ramp is outside
the guard's scope of rejection.

### 3.4 LLMProvider abstraction with StubProvider default for CI

CONFIRMED. This is the right architecture for the APS-004 constraint.

StubProvider in dev/CI, concrete provider wired only after gate clears. The ModelHint
enum covers all six call types (PATIENT_RESPONSE, GUARD_PASS, ANALYSER, SUMMARISER,
EVALUATOR, DEBRIEF). No concrete provider import outside the providers/ directory.

One addition Gal needs to build: the StubProvider must return deterministic guard
verdicts (not random PASS/FAIL). For CI test cases, Adi needs TH-01 (guard decision log)
to return predictable outcomes against engineered-violation fixtures. Stub must support
a test-mode config that maps specific input patterns to specific guard outcomes.

---

## 4. Cross-Consistency Check

### Gal (engine) vs Adi (QA): CONSISTENT with one gap

Gal's pipeline and Adi's test cases are well-aligned. Every engine pipeline step has a
corresponding QA category. The test hooks Adi needs (TH-01 through TH-07) are all
derivable from the engine design -- no fundamental testability gap.

The one gap: TC-STATE-03 (trust delta max per turn) references a "placeholder" value and
notes "value to be defined with clinical advisor." This test will be structurally present
but the assertion value (max_delta) is the same clinical advisor dependency as the state
updater calibration. This is fine -- the test must be written with a named constant, not
a magic number, so the advisor can change it without touching test logic.

Adi's 15 Aug pass/fail bar is correctly separated into: automated structural gates (A, B,
E, F, G) and clinical-advisor-judged gates (C, D). This split is the right model. QA
signs off on structure; the advisor signs off on clinical correctness. Do not blur these.

The 8-second response latency target in Adi's plan (QA quality targets) is consistent
with the UX spec (Tal's 8s typing-indicator threshold). The parallel guard architecture
(Section 2 above) makes this achievable. Sequential guard would likely breach it at
challenge level 4-5.

### Shir (infra) vs Gal (engine): CONSISTENT

Shir's isolation requirement (APS-REQ-111: support assistant has NO access to patient
engine routes at infra level) matches Gal's Section 4.3 (SupportModule has no LLMProvider
access in pilot; separate NestJS modules with separate prompt contexts). No conflict.

Shir's local-dev Docker Compose (Postgres + Redis) matches Gal's tech versions (PG 15.x,
Redis 7.x). Versions are consistent.

Object storage: Shir specifies DiagnosticLogs ONLY in S3-compatible bucket, not transcripts
and not student notes. Gal's schema stores transcripts in PostgreSQL (Message table) and
DiagnosticLog as a separate model. Consistent.

The APS-004 block on cloud + LLM provider means Shir cannot provision staging until the
gate clears. Gal builds with StubProvider in local dev until then. This dependency is
correctly named in both plans and does not create a design inconsistency -- just a
schedule constraint already known.

### UX (Tal) vs engine (Gal): CONSISTENT with one flag

The UX spec (Section 2A, AI response delay states) shows: 8 s -> "Patient is thinking...",
45 s -> error recovery. The parallel guard architecture should produce patient responses
well within 8 s on a healthy provider. Good.

The welfare signpost (fixed sidebar, non-dismissable) is a UX enforcement of Sami s. 4.3
and Gal's hardOffRampText ground-truth rule. These are complementary, not redundant: the
hardOffRampText fires in the LLM output when the student attempts real-support seeking; the
welfare signpost is a persistent UI label. Both are required; neither replaces the other.

Flag for Gal: Tal's UX spec (Section 2D, teacher review screen) shows a "Patient state strip"
under each patient bubble in the teacher view -- displaying trust/openness/etc per turn.
This is correct and is exactly what PatientStateLog enables. But it means the teacher review
API endpoint must return PatientStateLog data alongside the transcript. Confirm Gal's
teacher-review API scope includes PatientStateLog reads scoped to TEACHER role.
This is not in the engine-architecture-gal.md API section explicitly; needs to be added to
Sprint 2 scope.

---

## 5. Hard Dependencies Escalated to Eco / Owner -- with Dates

### DEP-1: Named clinical advisor -- deadline 2026-07-11 (end Sprint 1)

Owner: Eco to relay to jecki (owner), who relays to Adam for nomination.

Why this date is hard: Gal's state updater rule table (delta-cap calibration, Section 3.2)
cannot be finalised without the advisor. If the rule table is wrong, the 15 Aug rehearsal
criterion A (state coherence) cannot pass. The advisor also needs time to review the
table and provide calibrated values before Gal implements them in Sprint 2. End of Sprint 1
(2026-07-11) is the last moment a named advisor can be confirmed and still participate
meaningfully in Sprint 2 design. After that date, the 15 Aug rehearsal criterion C
(interaction analyser, 70% Hebrew turns acceptable) and criterion D (evaluation coherence)
also cannot be prepared.

If the advisor is not confirmed by 2026-07-11, Ido will call NO-GO on the 15 Aug rehearsal
date and activate the 15 Oct fallback immediately -- not on 15 Aug when it is too late to do
anything about it.

### DEP-2: APS-004 gate verdict -- deadline 2026-07-11 (end Sprint 1)

Owner: Rambo + Eyal + Lital (gate owners). Eco monitors.

Why this date: Gal cannot run real LLM API calls in Sprint 2 (starts 2026-07-14) without a
cleared provider. The stub works for structural build but the interaction analyser accuracy
test (criterion C) requires real LLM calls against Hebrew clinical content. If APS-004 clears
by 2026-07-11, Gal can wire the real provider on Sprint 2 day 1 and have 2 full weeks of
real-call testing before Sprint 2 ends. If APS-004 slips to Sprint 2 mid-point, criterion C
has at most 1 week of real-call data -- not enough to prepare a meaningful 30-turn clinical
advisor sample for 15 Aug.

Shir also cannot provision staging without the cloud provider decision. Adi needs staging for
E2E tests in Sprint 3. Every week APS-004 slips compresses the QA window.

### DEP-3: Gal + Shir B6 activation -- deadline 2026-06-30 (today)

Owner: Eco confirms activation. If not confirmed by end of day 2026-06-30, Ido escalates to
jecki (owner) directly per RISK-2 in feasibility-ido.md.

Why this is in the escalation list: if Gal is not active, Sprint 1 monorepo scaffold does
not start this week. Each day of slip on a 2-week sprint is 10% of the sprint. There is no
recovery mechanism within the 9-week plan for a week-one delay in the critical-path resource.

### DEP-4: Senior Dev hire confirmed -- deadline 2026-07-07 (Sprint 1, week 2)

Owner: Eco (sourcing). Ido flags if not confirmed by that date.

Why this date: Erez's sizing estimate requires 2 engineers for the 9-week window. Without
the Senior Dev, Gal is the only R&D resource on the critical path. The Sprint 2 scope
(full turn pipeline + guard model + interaction analyser + case authoring) is not a
1-person sprint. If the hire is not confirmed by 2026-07-07, Perry must be told that Sprint 2
scope will be reduced and the 15 Aug rehearsal date is at risk.

---

## 6. Items for Gal to Action in Sprint 2

1. Implement parallel guard architecture (Section 2). Use ModelHint.GUARD_PASS with a
   lighter model hint; buffer the generator stream; gate release on guard PASS.

2. Confirm the off-ramp text (hardOffRampText) is outside the guard's rejection scope.
   Guard evaluates clinical facts vs disclosureAllowList -- not welfare copy. Document
   in implementation notes.

3. Design the delta-cap rule table as a data-driven config (JSON or DB seed), not hardcoded
   constants. Leave placeholder values in place until the clinical advisor provides calibration.

4. Add teacher-review API scope for PatientStateLog reads (TEACHER role, scoped to own
   courses). Required for Tal's patient-state-strip in the teacher review screen.

5. StubProvider deterministic guard config: TH-01 must support input-pattern-to-verdict
   mapping for Adi's engineered-violation test cases.

6. Failure-simulation tooling (FS-01 through FS-05) and test hooks (TH-01 through TH-07)
   must be built into the Sprint 2 implementation, not deferred to Sprint 3. Adi cannot
   author test cases in Sprint 3 without them ready at Sprint 3 start.

---

## 7. What I Am NOT Changing

- Stack and version pins (Section 1.3): confirmed, do not float.
- Package boundaries (Section 1.2): confirmed, enforce with ESLint import rules from day 1.
- DB schema v1 (Section 2): confirmed as designed. PersonaBranch + StudentPersonaHistory
  stubs included now (correct -- avoids Phase 1b migration over live data).
- Phase 1b schema stubs (Section 2.10): confirmed as stubs only. Runtime NOT built.
  "notable_mistakes" field access is blocked until Eyal reviews (Shir's Section 6 item 6
  in devops plan; Ido enforces at gate).
- SupportModule isolation: deterministic only in pilot, no LLMProvider access. Enforced at
  NestJS module boundary, not just prompt instruction.

---

*Internal only. No secrets referenced. Not for external sharing without owner A1.*
*Ido (VP R&D) | 2026-06-29 | Approved for Sprint 2 start: YES, conditions above*
