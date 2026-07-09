# APS Product Scope Delta -- Adam Pilot Readiness Answers 2026-07-08
# author: Perry (VP Product) | task: APS scope update | date: 2026-07-08
# source: Adam Eyal answers received 2026-07-08 (verbatim-normalized via Eco)
# baseline ref: projects/ai-patient-simulator/docs/requirements-baseline.md
# status: DRAFT -- awaiting Eco review and Ido feasibility signal before baseline update

---

## Context

Adam Eyal (APS design partner, Gome Gevim College) answered pilot readiness questions on 2026-07-08.
His answers affect three open items from the requirements baseline:

1. Session format -- Continuing Persona (Section 17 / PM table): previously DEFERRED to Phase 1b
   pending Adam's answer. Adam now confirms he wants both formats in September.
2. Clinical oversight / self-simulation: new product ask not previously in the baseline.
3. Welfare-contact UI: Adam de-scoped for pilot. Baseline entry to update.

---

## 1. SESSION FORMAT: Single-Encounter + Multi-Session Continuing Persona

### Adam's answer (verbatim-normalized)

He wants BOTH available for September:
(a) a single clinical encounter per session, AND
(b) multiple sessions with the SAME simulated patient over time.
Multi-session continuity is his stated competitive differentiator.

### Decision impact

The requirements baseline (Section 17 Perry note) explicitly deferred multi-session continuing
persona to Phase 1b on the grounds that Adam's preference was unknown. That uncertainty is now
resolved. Adam's answer reverses the deferral trigger -- Perry's counter-argument (Section 17,
fourth bullet) applies: the call must be reconsidered.

Perry's position on this reversal is stated in Section 1c below (Recommendation).

### Product requirement: APS-REQ-165-DELTA (Session Format -- Dual Mode)

Status: PROPOSED -- pending Eco + Ido feasibility confirmation

User stories:
- As a teacher, I can configure a simulation assignment as either (a) single-encounter or
  (b) continuing-persona, at the course-assignment level.
- As a student in single-encounter mode, each session starts the patient at the base persona
  state regardless of any prior sessions.
- As a student in continuing-persona mode, each session continues from the patient state as
  it was left at the end of the previous session with that patient.
- As a teacher in continuing-persona mode, I can see the full session-by-session history of
  any student-patient pair and inspect how the patient state evolved.

State that must persist across continuing-persona sessions:
- Trust level (numeric, 0-100 or equivalent scale)
- Openness / disclosure readiness
- Emotional activation state
- Alliance quality
- Avoidance / resistance markers
- Symptom state summary (JSONB free-structured, author-defined fields)
- Session summary per session (what happened, key student moves, patient reactions)
- Homework given or discussed (if applicable to clinical model)
- Significant moments log (notable mistakes, breakthroughs, disclosure events)
- Therapeutic goals state (if set by student during session and stored in clinical-notes panel)

All state stored in the StudentPersonaHistory JSONB structure per APS-REQ-153 and APS-REQ-154.
These schema stubs were already flagged as "design now, implement in 1b" in the PM table.
They must now be elevated to pilot runtime.

Student/teacher UX requirements (additions to existing baseline):
- Mode selector at assignment creation: "Single session" vs "Continuing patient (multi-session)"
  Teacher-only; student cannot change mode.
- Session start (continuing mode): patient greets student with implicit continuity (references
  prior session context naturally, without breaking the simulation frame). System injects
  structured history into patient-persona prompt context (APS-REQ-155).
- Session end (continuing mode): system auto-generates a session summary and updates
  StudentPersonaHistory before the student exits. This is not optional -- summary must complete
  before session close or be queued for async completion (with retry).
- Teacher dashboard addition: per-student, per-persona history panel. Shows session list,
  session summaries, patient-state evolution over time. Read-only for teacher in pilot.
- Reset and fork (APS-REQ-158, APS-REQ-159): in scope for pilot given continuing persona is in.
  Reset = restore to base state; fork = branch from prior session. Audit log required.
- Educational labeling (APS-REQ-161): ALL history views labeled "Simulated educational patient
  -- not a clinical record." Enforced on every surface.

### MoSCoW for 15-Aug rehearsal vs 1-Sep pilot

15-Aug rehearsal (internal check -- ~5 weeks from today):
- Must: single-encounter mode working end-to-end. Continuing-persona schema in place (can
  exist as a switch that routes to single-encounter as fallback). Student can start, complete,
  get evaluation.
- Should: continuing-persona mode functional for at least one test persona with one student
  (happy path only). Session summary generated and stored.
- Could: teacher history panel visible (read-only, raw data acceptable at rehearsal).
- Won't (at rehearsal): reset/fork UI, full teacher history panel with formatting.

1-Sep pilot:
- Must: both modes fully available. Teacher can select mode per assignment. Student flow
  works in both modes. Continuing-persona session summary stored and visible to teacher.
  Reset available. Patient-state injection into prompt context tested and clinically reviewed
  by Adam before go-live.
- Should: fork option available. Teacher history panel with formatted session timeline.
- Could: automated low-credit alert when continuing-persona mode drives higher session costs.
- Won't (1-Sep): cross-student persona-path comparison (APS-REQ-163 -- Phase 1b).

### 1c. Perry recommendation: is multi-session realistic for 1-Sep?

Honest assessment: it is high risk, not impossible.

Arguments for keeping it in:
- Adam has explicitly named it his competitive differentiator. Excluding it may reduce his
  willingness to run the pilot at all.
- The schema design (JSONB, StudentPersonaHistory) was already called out in the baseline as
  something to design now regardless. The data model work was already on the critical path.
- The session-summary generation is a bounded AI call at session end -- not a new real-time
  engine component. It can be parallelised from the core patient engine.
- Pilot cohort is small (20-25 students, 3-5 sessions each). Scale is not the risk.

Arguments against (or conditions that must be met):
- The AI patient engine (single-encounter, dynamic state, ground-truth enforcement) is still
  the hardest item. It was already the single biggest schedule risk as of 2026-06-28.
  Adding continuing-persona prompt injection and session-summary generation to that engine
  in the same 9 weeks (now ~8 weeks) is additive load on the most constrained part.
- Quality risk: a badly functioning continuing-persona (patient inconsistencies, broken history
  injection) will be more visible and more damaging than a missing feature. If Ido signals
  that the patient engine is not stable by early August, continuing persona should be cut.
- Ido has not signed off on feasibility. This entire item is conditional on Ido's input.

Perry position: CONDITIONAL INCLUDE for 1-Sep.
Condition: Ido confirms by 2026-07-14 that the patient engine core (single-encounter, stable
ground-truth enforcement, state tracking) can be production-ready by 15-Aug rehearsal AND
that session-summary generation and history injection can be layered in the same window.
If Ido cannot confirm both, continuing persona reverts to Phase 1b and Eco must tell Adam
immediately, before R&D scoping is locked.

Recommendation to Eco: do not commit multi-session to Adam until Ido feasibility is in hand.
Frame to Adam as: "We are building it for Sep; we will confirm by [date] that it is stable
enough to be in the pilot, vs defer to the fast-follow 4-6 weeks later."

---

## 2. SELF-SIMULATION / AUTHOR-PREVIEW MODE

### Adam's answer (verbatim-normalized)

Two related asks:
(A) Self-simulation: a bot plays the student, runs through the FULL simulation including the
    final review/debrief, and Adam (or any teacher) examines the results.
(B) Author preview: when a teacher builds a new simulation/persona, allow them to run checks
    and see whether the simulation works well (lighter, author-facing test mode).

### Product requirement: APS-REQ-166-DELTA (Self-Simulation / Author-Preview Mode)

Status: PROPOSED -- new requirement, not in baseline. Pending Eco + Ido feasibility.

#### 2a. Self-Simulation (bot-plays-student, full run)

User story:
As a teacher or simulation author (Adam), I can trigger a self-simulation run in which an AI
bot plays the role of a student and runs the full simulation -- including the patient interaction,
all turns, and the post-session evaluation/debrief -- without a real student present.
After the run completes, I inspect the full output: transcript, patient state log, evaluation
results, debrief Q&A.

Purpose: (1) validate that a newly authored simulation produces clinically coherent patient
behaviour and meaningful evaluation output before exposing it to students; (2) check that the
ground-truth file and disclosure logic function as intended; (3) identify prompt or rubric
problems before a cohort runs the simulation.

Acceptance criteria:
- Author/teacher can launch a self-simulation run from within the simulation management screen.
  No student account required; run is flagged as type = "self_simulation."
- An AI student-bot runs the simulation. The bot must simulate plausible student behaviour:
  a mix of good and poor therapeutic moves (not just perfect moves), so the patient's dynamic
  state and disclosure logic are meaningfully exercised.
  Bot persona quality: sufficient to surface ground-truth and rubric issues; not required to
  be clinically realistic. (This is a QA tool, not a training tool for the bot itself.)
- The bot runs the complete session including triggering the finish/submit action.
- The evaluation pipeline runs on the self-simulation transcript, producing rubric scores,
  highlights, and student feedback view.
- The debrief chat is available for the author to explore post-run (author can ask questions
  about the simulated session as if they were the student).
- Full output visible to the run's author and to System Admin. Hidden from real students.
- Self-simulation runs are logged separately from real student attempts. They are excluded from
  all student analytics, class dashboards, and credit consumption is flagged as "author use"
  in the credit audit log (not charged against the course student credit pool; instead charged
  against a separate author/admin allocation or at a discounted rate -- to be confirmed with Adam).
- A run that completes is marked "self_simulation -- complete." A run that fails or is aborted
  is marked "self_simulation -- failed" with error detail.
- No student data is created or modified by a self-simulation run.

Out of scope for pilot:
- Configurable bot difficulty or bot persona style (single bot behaviour is sufficient for pilot).
- Multiple simultaneous self-simulation runs (serial is acceptable at pilot scale).
- Automated regression: trigger self-simulation on every rubric or ground-truth edit
  (would require a job queue; Phase 1b).

#### 2b. Author Preview (lightweight run-check)

User story:
As a simulation author building or editing a persona, I can run a quick preview check to see
how the patient behaves in the first few turns, without running a full session or triggering
evaluation.

Acceptance criteria:
- Available from within the simulation builder / authoring screen ("Preview" or "Test run" button).
- Author enters up to [3-5] student messages; patient responds using the authored persona and
  ground-truth file. No time limit, no turn limit enforced in preview.
- Session does not generate a formal transcript record, rubric score, or evaluation. It is a
  scratchpad -- not logged as a real attempt.
- Patient state is shown in a side panel (trust, openness, disclosure readiness as numeric
  values or brief labels) so the author can see whether the patient is responding to inputs
  as intended.
- Author can modify the persona or ground-truth file and re-run preview immediately.
- Preview runs are not visible to students. Not counted against student credit pool.
  Credit consumption flagged as "author preview" in the credit audit log.
- Preview state does not persist after the author closes the preview panel.

Note: APS-REQ-034 (simulation preview, "Should" in Case Authoring module) was already in the
baseline as a "Should." This new requirement elevates the function based on Adam's explicit
ask and adds the patient-state visibility panel. The author-preview item now moves to Must
for pilot, bounded to the lightweight version described here. The full self-simulation (2a)
is the richer version.

MoSCoW placement:

15-Aug rehearsal:
- Must: author-preview (2b) functional at basic level (bot enters messages, patient responds,
  author can see transcript). State panel is Could at rehearsal.
- Could: self-simulation full run (2a) -- if patient engine is stable by then.

1-Sep pilot:
- Must: author-preview (2b) with patient-state panel.
- Should: self-simulation full run (2a) including evaluation pipeline.
  Rationale for "Should" not "Must": Adam's explicit ask elevates it, but the bot-plays-student
  AI is additional engineering. If the patient engine is not stable by rehearsal, self-simulation
  is the first thing to cut. Author-preview is the load-bearing version of this requirement.

Feasibility flag: the student-bot AI (self-simulation, 2a) requires a second AI prompt chain
running concurrently with the patient engine. This is the non-trivial part. Flag to Ido for
feasibility and effort estimate before committing as Must for Sep.

---

## 3. WELFARE-CONTACT UI: DE-SCOPE

### Adam's answer

NOT needed at this stage. Keep AI disclosure and off-ramp. Remove the welfare-contact UI.

### Baseline entry to update

Requirements baseline Section 7 (Student Interface) and any welfare-contact requirement in
Section 14 (Academic Safety) or elsewhere.

Specific change: any requirement for a dedicated welfare-contact UI (a button or modal that
connects a distressed student to a named welfare officer, counsellor, or support service) is
removed from pilot scope. It is NOT Phase 1b -- it is removed pending Adam confirming whether
his institution requires it for a later phase.

What stays in:
- AI disclosure: the platform must clearly disclose to students at session start that they are
  interacting with an AI simulated patient, not a real person. Required. Non-negotiable.
  (APS-REQ-045 adjacent; to be explicitly called out as a Must requirement in the Student
  Interface module if not already labeled as such.)
- Off-ramp: if a student indicates personal distress during a session (not simulated distress --
  real personal distress), the system must surface a clear off-ramp: "If you are experiencing
  real distress, stop this session. Contact your institution's support service."
  The off-ramp is a text display / modal with a generic message. No named welfare officer UI,
  no direct contact link, no ticket-to-welfare routing. Plain message only.
  The off-ramp trigger: either explicit student action (e.g., "I need help" button) or optional
  keyword detection by the patient engine (flag to author, not a real-time intervention system).

Baseline amendment instruction:
- Add to Student Interface module, Must: "APS-REQ-167: AI disclosure at session start (plain
  text label visible before first patient message). Content: 'You are speaking with an AI
  simulated patient. This is not a real person.'"
- Add to Student Interface module, Must: "APS-REQ-168: Off-ramp message if student indicates
  real personal distress during session. Text only. No welfare-officer routing UI."
- Mark any prior welfare-contact requirement (if any) as REMOVED (2026-07-08, Adam direction).

Note: if a future Adam ask or a regulatory requirement reintroduces welfare-contact UI, this
decision must be revisited at that time. Not a permanent won't -- an explicit pilot de-scope.

---

## 4. PILOT COHORT FACTS (updated)

From Adam's 2026-07-08 answer:
- Cohort: approximately 20-25 students, approximately 2 staff.
- Sessions per student: 3-5 sessions each.
- Implied run volume: 60-125 student runs (20-25 x 3-5); with 2 staff author-preview/self-sim
  runs per simulation built: total pilot volume approximately 60-175 events.

Baseline note: Section 0 storage recommendation (PostgreSQL + JSONB at pilot scale) remains
valid. 60-175 runs do not challenge the stack. No re-evaluation needed.
Credit governance (APS-REQ-139 through APS-REQ-146): pilot volume confirms that credit hard
limits and admin UI are sufficient for this cohort. No changes needed.

---

## 5. REQUIREMENTS BASELINE UPDATE INSTRUCTIONS

The following changes to requirements-baseline.md should be applied after Eco reviews this doc:

| Item | Change |
|------|--------|
| Section 17 (Continuing Persona) | Elevate APS-REQ-152 through APS-REQ-162 from Phase 1b to pilot-Must/Should per Section 1 above, conditional on Ido feasibility by 2026-07-14. Update Perry note at top of Section 17. |
| PM table | Move PersonaBranch + StudentPersonaHistory from "data model only" to "runtime in" conditional on Ido signal. Add continuing-persona UX items to IN column with condition note. |
| Section 5 (Case Authoring) | APS-REQ-034: promote from Should to Must (bounded to author-preview 2b). Add APS-REQ-166 (self-simulation, Should for Sep). |
| Section 7 (Student Interface) | Add APS-REQ-167 (AI disclosure) and APS-REQ-168 (off-ramp). Remove any welfare-contact UI requirement. |
| LOCKED PILOT FACTS | Add 2026-07-08 answers: session format, cohort size (20-25 students, 2 staff, 60-175 runs), welfare de-scope confirmed. |

Perry does not update requirements-baseline.md directly until Eco confirms direction.
These are instructions, not a done action.

---

## 6. ESCALATIONS AND FLAGS

- FLAG TO ECO: multi-session continuing persona is conditional on Ido feasibility by 2026-07-14.
  If Ido cannot confirm, Eco must tell Adam before any R&D scope is locked. Do not absorb
  silently.
- FLAG TO IDO (via Eco): self-simulation student-bot (2a) is a second AI prompt chain; need
  effort estimate and feasibility signal before committing as Sep Must.
- FLAG TO ECO: author-preview (2b) credit consumption classification (charged to author
  allocation vs student pool vs discounted) needs Adam confirmation before billing model
  is finalised.
- FLAG TO ECO: APS-REQ-161 educational boundary enforcement -- Eyal must confirm that
  labeling "simulated educational patient -- not a clinical record" on all history surfaces
  satisfies Israeli Privacy Protection Law requirements before any continuing-persona data
  is stored. Legal must clear before Phase 1b (or Sep if multi-session is in).
