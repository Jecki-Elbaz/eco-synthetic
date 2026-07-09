# APS -- Product Signals from Adam (2026-07-08)
# Author: Perry (VP Product) | Date: 2026-07-08
# Triggered by: Eco (CEO) relaying Adam signals received by owner today
# Status: INTERNAL ONLY -- not for external sharing without owner A1
# Inputs: requirements-baseline.md, feasibility-ido.md, board.md (APS-005/006/007),
#         engine-architecture-gal.md, adam-pilot-readiness-answers.md (2026-06-28),
#         adam-appendix-credit-and-continuing-personas.md (2026-06-28)

---

## Context and Scope of This Assessment

Two product signals arrived from Adam on 2026-07-08:
1. SESSION FORMAT: Adam wants BOTH single-encounter AND multi-session-same-patient for Sep,
   and names multi-session a competitive differentiator.
2. SELF-SIMULATION / AUTHOR-PREVIEW MODE: Adam wants (a) a bot-simulates-student mode that
   runs the full simulation including final review so he can examine results, and (b) teachers
   running checks on a new persona/simulation before deploying it.

Current build state (per APS-007, done 2026-07-06): pilot-minimal scope complete on
StubProvider. PersonaBranch + StudentPersonaHistory schema stubs ARE built. Continuing
persona runtime was explicitly deferred to Phase 1b. Simulation preview (APS-REQ-034) is
currently a Should in Phase 1b.

Perry's role here: frame the requirements and placement. Engineering effort is Ido/Gal's
call; Perry does not estimate it.

---

## Signal 1 -- Session Format: Multi-Session-Same-Patient for September

### What the requirement is

Adam is asking for continuing-persona runtime to be available at Sep launch, not deferred to
Phase 1b. The product requirement is:

- A student can interact with the same AI patient across more than one session within a course.
- The patient carries forward structured history: trust, symptom state, formulation, therapy
  goals, notable moments, alliance effects. (This is APS-REQ-152 through APS-REQ-161 as
  currently defined in requirements-baseline.md Section 17.)
- Each student gets their own branched version of a shared base persona (APS-REQ-153).
- The teacher controls whether a simulation assignment uses single-session or continuing-persona
  mode (APS-REQ-162, currently a Should-Phase-1b).
- Session history is read at the start of each subsequent session and injected into the patient
  engine prompt context (APS-REQ-155).
- The student-persona state is updated and persisted at the end of each session based on
  interaction quality (APS-REQ-156).

Adam also names this a competitive differentiator. That is a product positioning signal, not
just a feature ask -- it implies this is not cosmetic and should be treated seriously in
scope discussions.

### What the signal implies for the current build

The schema stubs (PersonaBranch, StudentPersonaHistory JSONB) ARE already in the codebase
per APS-007. That part is done and does not need to be repeated.

What is NOT built and would need to be built for Sep:
(a) Runtime state persistence: reading prior StudentPersonaHistory at session start and
    injecting it into the engine context builder (APS-REQ-155). This touches the AI patient
    engine turn pipeline.
(b) State update at session end: the engine must produce a structured session summary and
    delta-update the StudentPersonaHistory JSONB record (APS-REQ-156). This is a new
    post-session pipeline step that does not exist today.
(c) Teacher-facing toggle and UI: per-assignment mode selection (single vs continuing) and
    visibility of a student's longitudinal history (APS-REQ-157, APS-REQ-162). This is a new
    authoring/teacher-dashboard surface.
(d) Reset/fork operations (APS-REQ-158, APS-REQ-159): not built; admin-facing; lower priority
    than (a)-(c) but needed for pedagogical control.

Requirements note: for the Sep pilot Adam's described use case is a course that runs across
several weeks, with each student returning to the same patient. The requirement does NOT
appear to be a 10-session arc -- the appendix context and Adam's prior HLD language suggest
2-4 sessions per student across a course module. Perry recommends capping at 4 sessions max
for a Sep v1 (matches Sami's recommendation in feasibility-ido.md Section 4). The cap should
be an author-configurable field, not a hardcoded number.

### State model and persona continuity implications

The engine architecture (engine-architecture-gal.md) is built around a per-turn PatientStateLog
and an 8-step pipeline. Adding continuing persona means:

- The context builder (Step 2 of the pipeline) must additionally load and compress prior
  session history from StudentPersonaHistory. This is a new input to the context builder,
  not a change to its core logic.
- A new post-session step must produce and persist the session delta (state changes, summary,
  key moments) back to StudentPersonaHistory. This step runs after the evaluation pipeline
  completes, not during the simulation turn.
- Sliding-window summarisation (APS-REQ-063) already exists for intra-session context. The
  inter-session history is a different, more structured artifact -- a record of educational
  outcomes and state changes, not a raw transcript excerpt. These must be kept distinct to
  avoid context-length blowup across a multi-session arc.

The state model question Perry wants routed to Ido: can the existing PatientStateLog per-turn
structure support the inter-session delta update without architectural change to the engine
package, or does the engine need a new "session close" hook? That is a feasibility question,
not a product decision.

### Teacher setup implications

Currently: teacher authors a simulation case, defines a ground-truth file, sets a rubric, and
publishes. In continuing-persona mode, the teacher also needs to:

- Designate a simulation template as "continuable" (toggle, APS-REQ-162).
- Set the max-sessions cap.
- Optionally see the longitudinal StudentPersonaHistory for a specific student-persona pair
  (APS-REQ-157) -- this is a teacher dashboard addition, not a new top-level feature.

The authoring flow already exists (built in APS-007). The continuing-persona additions are
augmentations to existing screens, not a new standalone flow. Perry assesses this as lower
build cost than the runtime changes.

### Recommended scope placement

RECOMMENDED: Move multi-session-same-patient runtime IN to the Sep pilot scope, with
conditions.

Rationale:
1. Adam has now answered Q9.1 with a clear preference. The prior deferral was contingent on
   this answer (requirements-baseline Section 17, feasibility-ido.md Section 4 Case A/B).
   Case B applies.
2. The schema is already built. The marginal build surface is the engine context-loader update,
   the post-session state-update step, and the teacher UI toggle. It is not a greenfield build.
3. Adam names it a competitive differentiator. If the Sep pilot is the reference case for
   future commercial conversations, shipping without it weakens the commercial signal.
4. The cap at 2-4 sessions limits the compounding-error risk Sami flagged. A full open-ended
   arc is NOT what Perry is recommending for Sep.

CONDITIONS on moving this in (not engineering calls -- these are product gates):
- Ido and Gal must confirm feasibility of the engine context-loader and post-session
  state-update additions within the current sprint plan before any scope change is accepted.
- If feasibility check returns that this adds more than 1.5 sprints of R&D work, the Sep
  date must be renegotiated with Adam. Do not absorb silently.
- The clinical advisor (still an open item per APS-010) must review the inter-session history
  schema and the state-update logic before multi-session goes live. This is a safety gate,
  not optional.
- Sami's recommendation (feasibility-ido.md Section 4): cap at 4 sessions, define arc-length
  constraints, and require explicit clinical calibration of state-change rate parameters.
  These become requirements, not optional guidance.

### Open question to route to Ido (feasibility)

"Does the existing engine architecture (engine-architecture-gal.md, APS-007 build) support
adding (a) inter-session history injection to the context builder and (b) a post-session
state-update pipeline step without architectural refactoring? What is the estimated sprint
cost relative to the current plan, and does it fit before the 15 Aug rehearsal gate?"

### Open question to route back to Adam (via owner)

"For the Sep pilot, how many sessions per student do you expect per course module -- is 2-4
the right cap, or does the pedagogical design require more? And will the Sep cohort be running
multi-session cases from week one, or will they start with single-session and move to
multi-session cases later in the semester?"

(This shapes the urgency and the minimum viable arc length.)

---

## Signal 2 -- Self-Simulation / Author-Preview Mode

### What the requirement is

Adam's signal has two sub-parts, which Perry reads as one cohesive feature family:

Sub-part A -- BOT-PLAYS-STUDENT: A mode where an AI agent simulates the student role, runs a
full simulation session against a configured AI patient (including all engine steps and the
final evaluation), and Adam/teacher can then examine the full output -- transcript, patient
state log, evaluation scores, debrief results. Purpose: validate a new simulation case before
exposing it to real students.

Sub-part B -- TEACHER PRE-FLIGHT CHECK: A lighter-weight version of the same idea, where a
teacher (not just Adam) can run a check on a new persona or simulation before assigning it to
students. Purpose: catch ground-truth gaps, rubric misalignment, patient behavior problems,
or clinical inaccuracies before students encounter them.

Together these constitute what the HLD calls "Simulation Preview" (APS-REQ-034, currently a
Should in Phase 1b) but materially expanded. APS-REQ-034 as written is "author can run a test
session" -- it did not specify a bot-driven student or full evaluation pipeline output. Adam's
signal makes it clear the requirement is richer: automated bot-driven execution plus full
result visibility.

Perry's reading of the full requirement:

APS-REQ-034-EX (expanded, new definition):
- Author or teacher can initiate a preview run of a simulation case before it is assigned.
- In bot-plays-student mode: the system generates a synthetic student turn sequence (not a
  real person) and runs it through the full engine pipeline -- including the interaction
  analyser, patient state updates, disclosure rule checks, evaluation scoring, and debrief.
- Output visible to the author/teacher: full transcript, PatientStateLog per turn, evaluation
  scores per rubric criterion with evidence, debrief chat output.
- The preview does NOT create a real StudentAttempt record tied to a real student. It is a
  simulation-of-a-simulation.
- The author can trigger multiple preview runs with different synthetic student behavioral
  profiles (e.g., a student who asks mostly open questions vs one who uses premature advice).
- Teachers can use this before assigning any new simulation case to a live cohort.

### Where it sits in the current product structure

This feature touches:
- Case authoring flow: "preview" button on the published simulation screen.
- The AI patient engine: must be invokable in a preview mode where the student turn is
  generated synthetically rather than received from a real user.
- The evaluation pipeline: must run normally on preview output.
- Access control: preview results visible only to the author and to teacher roles scoped to
  that simulation -- never to students.
- Credit governance: preview runs consume tokens and should be charged to credit (probably
  as a distinct deduction event type "preview_run", per APS-REQ-140 event taxonomy). Authors
  and teachers must be aware of this.

It does NOT require a new standalone module. It is an extension of:
- The case authoring flow (APS-007 build, authoring UI exists).
- The engine pipeline (already accepts a turn as input -- the source of that turn becomes
  configurable: human vs synthetic).
- The evaluation pipeline (already runs post-session).

### Pilot vs Phase 1b placement

RECOMMENDED: Defer the full bot-plays-student mode (Sub-part A) to Phase 1b. Include a
lighter teacher pre-flight check (Sub-part B) as a Sep pilot scope item, IF the authoring
team confirms it does not add sprint risk.

Rationale for the split:

Sub-part B (teacher pre-flight check) is closer to what APS-REQ-034 already described and
is educationally important for the Sep pilot: a teacher deploying a new simulation case to
real students without any ability to check it first is a clinical safety risk. The pilot will
have Adam authoring and reviewing cases, but as the pilot grows, this protection matters.
A teacher-run preview with a single manually-driven synthetic student session (even a
simplified one that does not auto-generate the student turns but lets the teacher type them
in a "preview mode" that generates full evaluation output) is a significant risk reduction
at manageable build cost.

Sub-part A (bot-plays-student -- fully automated synthetic student turn generation) is more
complex because it requires a second LLM invocation to generate realistic student behavior,
and that synthetic student must be calibrated to produce meaningful coverage of the rubric
criteria. That calibration is non-trivial and is a new design surface the engine does not
currently have. This is Phase 1b work.

For Sep, the minimum viable version of preview is:
- Author/teacher can enter a "preview mode" for a simulation case.
- Preview mode does NOT create a real attempt record.
- The teacher can type turns manually (no synthetic generation).
- The engine runs normally and produces full evaluation output at the end.
- Preview results are visible only to the author/teacher who ran it.
- Credit is consumed and recorded as a "preview_run" event.

This version reuses the entire existing engine and evaluation pipeline with minimal changes:
a mode flag that marks the session as a preview, suppresses the real StudentAttempt creation,
and scopes result visibility to the authoring role.

### What it implies for the case-authoring flow already built

APS-007 built the case-authoring UI (guided builder, ground-truth file, rubric builder,
publish/version-lock). The preview feature sits AFTER the publish step -- a teacher can only
preview a published (or draft-published) version. This is the right UX gate; previewing an
unpublished case produces unreliable results because the rubric is not locked.

The authoring flow additions needed for Sep (the lighter version):
1. "Run Preview" button on the published simulation detail screen (authoring UI).
2. Preview session interface: same student chat interface but labeled clearly as PREVIEW.
3. Preview result screen: same evaluation output screen but scoped to author/teacher role only.
4. Preview attempt flagged as preview in the DB (a boolean on the Attempt record or a
   separate PreviewAttempt record -- Perry's preference is a separate record to keep real
   attempt analytics clean).
5. Credit deduction event "preview_run" registered per APS-REQ-140.

The APS-014 minor item "rubric-before-ground-truth product Q for Perry" flagged by Ido in
the Inc-8 review is adjacent to this: the authoring flow currently allows a teacher to define
the rubric before completing the ground truth file. For a preview run, that ordering could
produce misleading results. Perry's position: the ground-truth file must be complete and locked
before a preview run is permitted. Enforce this as a gate in the "Run Preview" button --
disabled until ground truth is marked complete. This resolves the APS-014 minor item m6 in
the product direction.

### Recommended scope placement

Sep pilot: teacher-driven preview (Sub-part B, manual turns, full evaluation output, preview
flag on attempt, credit event). This is a product quality gate, not a luxury.

Phase 1b: bot-plays-student (Sub-part A, synthetic turn generation, multi-profile runs).

### Open question to route to Ido (feasibility)

"Can the engine and evaluation pipeline accept a 'preview mode' flag that suppresses
real-StudentAttempt creation and scopes result visibility to teacher/author only, without
changes to the core engine logic -- and can this be built within the current sprint plan
without delaying the 15 Aug rehearsal gate?"

### Open question to route back to Adam (via owner)

"For the Sep pilot, is a teacher-driven preview (teacher types turns, gets full evaluation
output, labeled as preview) sufficient to validate a case before assigning it to students?
Or is it important for the preview to also automatically generate student turns, so a case
can be fully QA'd without manual effort?"

(This determines whether Sub-part A is a Sep need or can wait for Phase 1b.)

---

## Requirements Decisions to Record

Perry assessment: two new product requirements result from today's signals.

APS-REQ-CONT-01 (new, Signal 1):
Continuing-persona runtime for Sep pilot -- scope in (pending Ido feasibility confirmation).
Session arc capped at teacher-configurable max (default: 4 sessions). Inter-session history
injected into engine context at session start. Post-session state delta persisted to
StudentPersonaHistory. Teacher toggle on assignment: single-session vs continuing. Requires
clinical advisor sign-off before go-live.

APS-REQ-PREV-01 (new, Signal 2, Sep scope):
Teacher-driven simulation preview. Preview mode flag suppresses real StudentAttempt; teacher
types turns; full evaluation output produced; visible to author/teacher only; credit event
"preview_run" recorded. Ground-truth file must be complete before preview enabled.
Bot-plays-student (automated synthetic turns) deferred to Phase 1b.

These requirements are DRAFT until Ido feasibility confirmation and Eco / owner A1 to change
pilot scope. Perry flags that changing pilot scope from the current pilot-minimal requires
Eco to surface to Adam any timeline implication before it is absorbed into the build plan.

---

## Summary for Eco

SIGNAL 1 (multi-session):
- Recommend: MOVE IN to Sep pilot scope, subject to Ido feasibility confirmation.
- Rationale: Adam answered Q9.1; schema is already built; deferral condition no longer applies.
- Single most important open question: Ido must confirm whether adding the inter-session
  context-loader and post-session state-update step fits within the current sprint plan before
  the 15 Aug rehearsal gate. If it does not fit, the question becomes: defer to Phase 1b and
  negotiate with Adam, or negotiate a date slip.

SIGNAL 2 (self-simulation / author-preview):
- Recommend: Sep pilot gets the lighter teacher-driven preview (Sub-part B, manual turns).
  Bot-plays-student (Sub-part A) defers to Phase 1b.
- Rationale: teacher preview before assigning to real students is a clinical safety gate, not
  cosmetic. Full synthetic-student generation is new design surface the engine does not have
  and should not be rushed.
- Single most important open question: confirm with Adam whether manual-turn preview suffices
  for Sep, or whether automated bot-plays-student is required on day one. His answer determines
  whether Sub-part A moves into Sep (high risk) or stays in Phase 1b (recommended).

Both open questions to Adam should be routed via the owner relay (APS-010 protocol --
no direct agent contact with Adam).
