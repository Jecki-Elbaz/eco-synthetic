# APS -- R&D Feasibility Update: Adam Answers 2026-07-08
# Author: Ido (VP R&D) | Date: 2026-07-08 | Inputs: feasibility-ido.md + overnight-progress.md
# Status: INTERNAL -- not for external sharing without owner A1
# Requester: Eco (CEO)

---

## Context

Adam (APS design partner) replied 2026-07-08 with two new requests:
1. CONTINUING PERSONAS (multi-session, same patient across sessions): wants IN for 1-Sep pilot.
   Previously deferred to Phase 1b in APS-005 feasibility (feasibility-ido.md Section 4).
2. SELF-SIMULATION / AUTHOR-PREVIEW MODE: a bot plays a student and runs a full simulation
   including final review so the author can inspect results before assigning to real students.

Pilot cohort confirmed: ~20-25 students, ~2 staff, 3-5 sessions each = ~60-175 sim runs.

---

## 1. Continuing Personas -- Re-assessment of Phase-1b Defer

### Current build state (from overnight-progress.md, APS-007 done)

The foundation is substantially stronger than the APS-005 feasibility assumed:
- PostgreSQL + Prisma + JSONB: fully operational. PersonaBranch and StudentPersonaHistory
  schema stubs are designed into the DB (confirmed: feasibility-ido.md Section 2, schema stubs
  IN-list). Tables exist. The schema defer/migration risk I flagged in APS-005 Section 1 is
  already resolved.
- PatientStateLog: hard-persisted per-turn. Structured injection pattern in place and proven
  by 191 engine tests + 33 live-Postgres integration tests (overnight-progress.md 2026-07-06).
- 8-step turn pipeline: fully built and E2E green (15/15 golden-path E2E, 2026-07-07).
- Session resume on interruption: in place (APS-REQ-065 in pilot-minimal IN-list).
- Evaluation pipeline + debrief: built and RBAC-enforced.

What this means for multi-session continuity: the hard infrastructure problem (durable state
per-turn, structured injection, DB persistence) is solved. The gap to multi-session is not
the storage layer -- it is the SESSION-BOUNDARY logic: loading prior session state at the
start of a new attempt, evolving it across sessions, and capping arc length.

### Incremental build required for multi-session continuity

The following is what does NOT yet exist:

A. SESSION-BOUNDARY LOADER (new service method, ~1-2 days Gal)
   - On attempt-create for a student who has a prior completed attempt against the same
     SimulationTemplate: query StudentPersonaHistory for that (student_id, template_id) pair;
     load the last session's PatientStateLog snapshot; inject it as the opening state for
     the new attempt.
   - Constraint: must handle the first-session case (no prior history) cleanly.
   - Risk: the PatientStateLog JSONB schema was designed for within-session state. Confirm it
     captures everything needed for cross-session continuity (trust level, alliance score,
     symptom progression markers, formulation anchors). If the schema is missing fields, that
     is a schema migration on seeded data -- low risk now, higher risk post-pilot.

B. SESSION-ARC WRITER (new service method, ~1-2 days Gal)
   - On simulation-finish: persist a session-summary record to StudentPersonaHistory -- the
     distilled arc state (trust level, symptom change, notable moments, alliance score). This
     is what the loader in (A) reads next session.
   - Sami's constraint (feasibility-ido.md Section 4): the development model (patient behaviour
     evolving based on student skill) requires clinical calibration of rate-of-change parameters.
     FOR THE PILOT: we can cap this at a simplified delta model (trust +/- N based on interaction
     analyser output; symptom marker advancement gated by turn count + trigger rules). Full
     development model deferred to Phase 2. The simplified delta model must be reviewed by the
     named clinical advisor before go-live.

C. ARC LENGTH ENFORCEMENT (~0.5 days Gal)
   - Sami's hard constraint: cap multi-session arcs at 2-4 sessions for v1. Need a
     max_sessions field on SimulationTemplate (or Assignment) and a guard on attempt-create
     that blocks a 5th session. This is a small authoring schema addition.

D. AUTHORING UI EXTENSION (case-authoring screen -- Noa, ~1 day)
   - Add "multi-session arc" toggle + max_sessions field to the guided builder (Step 1).
   - Add per-session arc context field to the ground-truth editor (what the patient should
     remember and what the patient should have forgotten between sessions).

E. STUDENT UI SESSION CONTEXT (Noa, ~1 day)
   - On simulation start: if this is session 2+, show the student a brief "continuing from
     your previous session" context panel (what the patient remembers). This is clinically
     correct -- the student should know the therapeutic relationship has prior history.

F. QA (Adi, ~1-2 days)
   - New test cases: session-boundary loader fires on attempt 2, arc cap blocks attempt 5,
     state is coherent (no invented facts from session 1 bleeding incorrectly into session 2).
   - These are integration tests requiring live Postgres -- cannot be mocked away.

G. CLINICAL ADVISOR REVIEW (blocks go-live, not build)
   - The simplified delta model in (B) must be reviewed and approved by the named clinical
     advisor before any graded use. This is not optional per Sami's explicit requirement
     (feasibility-ido.md Section 4, Reason 2).

TOTAL ESTIMATE: 6-8 engineer-days (Gal: 5-6 days; Noa: 2 days; Adi: 1-2 days). Call it
8 engineer-days as the working number, excluding clinical advisor review time.

### Does it break the 15-Aug rehearsal go/no-go?

No, IF AND ONLY IF:
1. Build starts in the current sprint window (by 2026-07-14).
2. Named clinical advisor is engaged to review the simplified delta model by 2026-07-25
   (end of Sprint 2 equivalent). Without the advisor sign-off, multi-session is built but
   cannot be rehearsed on 15 Aug.
3. Scope of multi-session at pilot is capped strictly at 2-session arcs (Sami's constraint).
   A 3-4 session arc at pilot cohort scale (~20-25 students x 3-5 sessions) is a much larger
   QA surface and is harder to validate before 15 Aug. Recommend capping the pilot at 2
   sessions and documenting this cap clearly in the Adam communication.
4. The Adi QA pass (F above) is completed before 2026-08-08 (end of Sprint 3) so it feeds
   into rehearsal week without a last-minute crunch.

CONSTRAINT: This uses ~8 engineer-days from Gal + Noa in Sprints 2-3. Those sprints are
already carrying the pilot-minimal load. The risk is not whether the code can be written --
it is whether the code can be written, tested, and clinically validated before 15 Aug. That
is a tight but not impossible window given the current build velocity.

MY RECOMMENDATION: Accept multi-session IN for 1-Sep with a 2-session-arc cap. Present
this cap clearly to Adam. The "2 sessions" constraint is not an arbitrary limit -- it is
Sami's clinical recommendation and is the right scope for a formative pilot. More sessions
than that in a first pilot, with a new AI patient, is a clinical QA risk we cannot absorb.

---

## 2. Self-Simulation / Author-Preview Mode

### What Adam asked for

A "self-simulation" mode: a bot plays the student role and runs a full simulation including
the final review/evaluation pipeline, so the author can inspect how the patient behaves and
how the rubric scores before assigning to real students.

### Feasibility assessment

This is feasible. The existing engine already has everything needed to run a simulation
structurally -- the turn pipeline, PatientStateLog, ground-truth guard, evaluation pipeline,
debrief. The incremental build is a STUDENT-SIDE HARNESS that generates student-turn inputs
automatically.

Components:

A. BOT-STUDENT TURN GENERATOR (~2-3 days Gal)
   - A new module (StudentBotProvider) that generates synthetic student turns. Does NOT need
     to be a sophisticated LLM agent for author-preview purposes. Three modes:
     (i) SCRIPTED: a predefined sequence of turns from a YAML/JSON script the author uploads
         or selects from a template library. Good for deterministic inspection.
     (ii) STUB-RANDOM: a simple heuristic generator that produces varied but generic student
         inputs (open question, closed question, rapport attempt, wrong diagnostic hypothesis).
         Uses no LLM -- purely deterministic. Sufficient for author-preview.
     (iii) LLM-STUDENT (Phase 2): a real LLM playing the student with a persona. Higher cost,
         higher fidelity. Deferred -- do not build for the pilot.
   - Mode (ii) is the right default for 1-Sep. It reuses the StubProvider pattern already in
     place -- zero new LLM dependency, zero new cost, zero APS-004 gate implications.

B. AUTHOR-PREVIEW ATTEMPT TYPE (~1 day Gal)
   - A new AttemptType enum value: AUTHOR_PREVIEW. When this type is set:
     (i) The attempt does not count against credit/token quotas (or counts against a separate
         author-preview budget, not the student credit pool).
     (ii) The attempt is not visible to students or in the class dashboard (TEACHER + SYSTEM_ADMIN
         only).
     (iii) The attempt CAN be evaluated + reviewed by the author immediately on finish.
   - The existing evaluation pipeline, rubric scoring, and feedback view are reused unchanged.
     The author sees exactly what a student would see, plus they can see the PatientStateLog
     turn-by-turn (which a student cannot -- teacher-review RBAC already gates this).

C. AUTHORING UI EXTENSION (~1 day Noa)
   - A "Run Preview" button on the SimulationTemplate after it is published (or in DRAFT).
   - Triggers bot-run with the author watching the transcript fill in (or just delivers the
     completed transcript + evaluation on finish).
   - The simplest implementation: fire-and-forget (run completes server-side; author refreshes
     to see the result). A live-streaming view is nice-to-have but not required for 1-Sep.

D. QA (Adi, ~0.5-1 day)
   - Test: AUTHOR_PREVIEW attempt does not appear in student dashboard or class credit usage.
   - Test: bot generates plausible enough turns to exercise the ground-truth guard (the guard
     must fire correctly even on bot-generated inputs).
   - Test: evaluation pipeline produces a coherent result from bot-generated turns.

TOTAL ESTIMATE: 4-6 engineer-days (Gal: 3-4 days; Noa: 1 day; Adi: 0.5-1 day). Call it
5 engineer-days as the working number.

### Reuse vs net-new

- REUSED (no change): 8-step turn pipeline, PatientStateLog, ground-truth guard, evaluation
  pipeline, rubric scoring, feedback view, teacher-review RBAC, credit governance structure.
- NET NEW: StudentBotProvider (stub-random mode), AttemptType.AUTHOR_PREVIEW, author UI
  trigger button, credit-exclusion logic for preview attempts.

This is a well-contained feature. The risk is low because it runs entirely on existing engine
paths and uses no real LLM (stub-random mode). The only failure mode is that the bot-generated
turns are so unrealistic that the ground-truth guard never fires (too-easy inputs). Mitigate
by including at least 2-3 scripted "violation" turns in the default stub sequence so the guard
is exercised during author-preview.

### Clinical advisor implication

Author-preview does not require clinical advisor sign-off (it is a tooling feature, not a
clinical assessment). However, the clinical advisor should know about it so they can check
that the bot-generated turns are clinically plausible enough not to mislead authors about
how real students will behave.

---

## 3. Combined Sprint Impact

Both features together: ~13 engineer-days (8 continuing personas + 5 self-simulation).

Current team sprint capacity (Gal + Noa; 2-week sprints):
- Sprint 2 remainder (2026-07-14 to 2026-07-25): approximately 10 engineer-days available
  if the pilot-minimal work is complete (which overnight-progress.md confirms: the IN-list
  is BUILT and GREEN on StubProvider as of 2026-07-04 morning; remaining work is the
  prod-image build fix for Shir and the APS-004 gate residuals).
- Sprint 3 (2026-07-28 to 2026-08-08): 10 engineer-days available for QA, hardening, and
  any remaining feature work.

13 engineer-days across Sprint 2 remainder + Sprint 3 is tight but fits. The sequencing:
- Sprint 2 (Gal): session-boundary loader + session-arc writer + arc-length enforcement +
  bot-student generator + AUTHOR_PREVIEW attempt type (highest-risk items first).
- Sprint 2-Sprint 3 (Noa): authoring UI extensions for both features.
- Sprint 3 (Adi): QA for both features.
- 15 Aug rehearsal: include at least one 2-session arc run + one author-preview run in the
  rehearsal scenario set.

The 15-Aug rehearsal go/no-go criteria (feasibility-ido.md Section 3, Sprint 4) must be
extended with two new pass criteria:
- (h) A 2-session continuing-persona arc is coherent: session 2 patient correctly reflects
  session 1 state without inventing facts or losing prior alliance context.
- (i) Author-preview completes a full run + evaluation in AUTHOR_PREVIEW mode; result is
  not visible in student dashboard or class credit usage.

---

## 4. Go/No-Go Read for Eco

DECISION: 1-Sep remains CONDITIONALLY FEASIBLE with both features added.

The conditions tighten from the original APS-005 verdict. The updated condition set:

UNCHANGED CONDITIONS (from APS-005 Section 8):
1. Scope locked to pilot-minimal IN-list plus the two features described in this document.
   No further additions without Ido sign-off.
2. Named clinical advisor identified and engaged by 2026-07-14 (one week from today). The
   multi-session delta model cannot be validated without this person, and the 15-Aug
   rehearsal cannot include the multi-session arc without clinical sign-off.
3. APS-004 gate produces LLM + infra provider decisions by 2026-07-18. The StubProvider
   is no longer a constraint for the structural build (self-simulation runs entirely on stub),
   but the continuing-persona feature must be tested with a real LLM before go-live, and
   that requires the APS-004 gate to close.
4. 15-Aug rehearsal passes all criteria (a) through (g) from APS-005 plus the new (h) and
   (i) above.

NEW CONDITIONS (specific to Adam's two requests):
5. Multi-session arc is capped at 2 sessions for the 1-Sep pilot. This is non-negotiable
   from a QA and clinical validation standpoint. Adam must confirm acceptance of this cap.
   If Adam requires 3-5 sessions per student from day one, that is a Phase 1b feature
   and the pilot runs as single-session in September.
6. Self-simulation uses stub-random mode (no real LLM playing the student) for 1-Sep.
   This is sufficient for author-preview at the pilot scale and avoids a new APS-004
   gate item.
7. The simplified multi-session delta model (trust +/- N, symptom marker advancement) is
   reviewed and approved by the named clinical advisor before 15-Aug rehearsal.

IF CONDITIONS 2 AND 5 ARE NOT MET: the multi-session feature reverts to Phase 1b (original
feasibility-ido.md recommendation). Self-simulation proceeds independently -- it has no
dependency on the clinical advisor and no dependency on multi-session.

PILOT SIZING NOTE: 60-175 sim runs at 20-25 students and 3-5 sessions each is within the
credit governance and cost envelope built into the pilot-minimal scope (feasibility-ido.md
Section 2, APS-REQ-139 through APS-REQ-146). No architecture changes required for this
scale. The author-preview runs (AUTHOR_PREVIEW type, excluded from student credit pool)
add a small additional token load that the credit model can absorb.

FALLBACK (15-Oct) TRIGGER: unchanged from APS-005. If the 15-Aug rehearsal fails criteria
(a)-(d) or (h), activate the October fallback. The multi-session and author-preview
features would then be included in the October build with a second rehearsal.

RECOMMENDATION TO ECO: present Adam with this package:
- Continuing personas: IN for 1-Sep, 2-session arc cap. Phase 1b extends to 3-5 session
  arcs based on pilot learning.
- Author-preview mode: IN for 1-Sep (stub-random student bot).
- Condition: clinical advisor must be named by 2026-07-14 or multi-session reverts to
  Phase 1b. Self-simulation is unconditional.
- Commitment: will tell Adam on 15-Aug whether 1-Sep holds. That date does not change.

---

*Architecture decisions in this document are R&D recommendations. Multi-session runtime and
author-preview are net-new scope additions. Eco confirms before Gal/Noa begin build. No
external tools adopted. No A1 actions taken. All work on StubProvider.*
