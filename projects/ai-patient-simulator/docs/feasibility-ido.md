# APS-005 -- R&D Feasibility + Sprint Scope
# Author: Ido (VP R&D) | Date: 2026-06-29 | Task: APS-005
# Owner A1 greenlight: jecki 2026-06-29
# Status: INTERNAL ONLY -- not for external sharing without owner A1
# Inputs: requirements-baseline.md, viability-assessment-erez.md,
#         sme-domain-assessment.md, discovery-brief.md,
#         intake/adam-pilot-readiness-answers.md, memory/board.md APS-005 row.

---

## 1. Storage Recommendation (scope a)

RECOMMENDATION: PostgreSQL + Prisma + JSONB for the 1-Sep pilot. Vector/RAG deferred to Phase 2.

Rationale:

The two documents gave conflicting stacks. The architecture deck pushed MongoDB + vector store +
embeddings. The HLD specified PostgreSQL + Prisma + NestJS + Redis + S3. These are not
reconcilable for the pilot window.

MongoDB + RAG is the wrong choice for 1 Sep for the following reasons:

1. The org hierarchy (College -> Programme -> Course -> Assignment -> Attempt) is relational.
   Referential integrity across those five levels is load-bearing for RBAC and access scoping.
   MongoDB does not enforce FK integrity; PostgreSQL does.

2. Rubric scoring, credit ledger, UsageLog, and competency mapping are all tabular, all
   ACID-requiring. Fitting these into a document store adds unnecessary mapping complexity.

3. The Continuing Persona history (APS-REQ-152-161, deferred to Phase 1b -- see Section 4
   below) is structured variable-depth JSON: session summaries, trust level, symptom change,
   formulation, notable mistakes. PostgreSQL JSONB handles this cleanly. No vector search is
   needed to retrieve the history of one student-persona pair at pilot scale (one college,
   1-3 courses, <200 students). A simple FK lookup on (student_id, persona_id) is sufficient.

4. The vector/RAG layer is Phase 2 work: longitudinal clustering, pattern detection across
   cohorts, embedding-based disclosure-state matching (APS-REQ-164, APS-REQ-165). None of
   these are in the pilot-minimal scope.

5. The HLD's own technology recommendation, which is where the detailed system design lives,
   specifies PostgreSQL + Prisma. Deviating from it for the pilot adds risk without benefit.

6. Our team's stack (Next.js + NestJS + TypeScript) pairs naturally with Prisma as the ORM.
   Introducing MongoDB would require a different ODM, different migration tooling, and
   different query patterns -- all added complexity in a 9-week window.

Schema note: PersonaBranch and StudentPersonaHistory tables MUST be designed into the pilot
schema even if the runtime is not built until Phase 1b. If these tables are absent from the
initial schema, Phase 1b will require a migration that touches student data -- a significantly
higher-risk operation than designing the shape now and leaving the tables empty.

Decision needed before build: Eco + owner confirm. No architecture handoff to Gal until this
is locked in writing.

APS-004 cross-dependency: Rambo/Eyal/Lital are running the tool/legal/privacy gate in parallel.
The storage decision does not need to wait for APS-004 to complete (PostgreSQL is an established
tool, not a new external service). However, the JSONB fields for StudentPersonaHistory contain
sensitive PII ("notable student mistakes," 12-month retention per APS-REQ-160). Eyal MUST
review the schema for those fields before they are implemented in Phase 1b, per the Sami flag
in sme-domain-assessment.md section 9.5.

---

## 2. Pilot-Minimal Scope (scope b)

The full v1 scope as defined in the requirements baseline before the 2026-06-28 pilot answers
update is 16-28 weeks of work for 1-2 senior engineers. The pilot window is 9 weeks from now
(2026-06-29 to 2026-09-01). There is no scenario in which the full v1 ships by 1 Sep.

The pilot-minimal scope below is Perry's cut (requirements-baseline.md Section PM), which I
confirm as credible if and only if:
- R&D starts on the AI patient engine this week (not next week, not after hiring completes).
- Scope does not expand from the list below.
- The named clinical/academic advisor (Sami's precondition from sme-domain-assessment.md
  Section 6) is identified and engaged within 2 weeks.

### IN -- 1-Sep pilot-minimal

AUTH + ACCESS
- Secure invite link + access-code + email login (APS-REQ-005). No LTI.
- RBAC: Student, Teacher, System Admin only (APS-REQ-016 subset).
- Scope-based access: each role sees only own hierarchy slice (APS-REQ-017).

ORG HIERARCHY
- College + Course + Student Attempt. Programme as a stub (data model exists; no UI).
- One institution (Gome Gevim), 1-3 courses.

CASE AUTHORING
- Guided simulation builder: structured field form (APS-REQ-028).
- Prompt-driven persona generation from builder fields (APS-REQ-029).
- Ground-truth file per simulation (APS-REQ-030). Enforcement: guard-model pattern (option b
  from sme-domain-assessment.md Section 2 -- not soft-prompt-only, not the full structured
  context pattern yet). This is a non-negotiable build requirement, not a nice-to-have.
- Hidden trigger and resistance rules (APS-REQ-031).
- Simulation versioning + rubric version lock (APS-REQ-032, APS-REQ-041).

AI PATIENT ENGINE (critical path -- see Section 3)
- Structured runtime pipeline per turn (APS-REQ-057).
- Patient state tracking per turn via PatientStateLog (APS-REQ-058). Hard-persisted,
  not soft (explicit Sami requirement, sme-domain-assessment.md Section 1).
- Interaction analyser (APS-REQ-059). Accuracy must be empirically tested with Hebrew
  transcripts before any graded use. For this formative pilot that test can be ongoing,
  but the baseline accuracy must be reviewed by the named clinical advisor before go-live.
- Hidden information release logic (APS-REQ-060).
- Challenge level 1-5 controls (APS-REQ-061).
- Cost governance at runtime: per-simulation token budget, max turns 75, soft warning 60,
  max dictation 15 min, max debrief questions 5-10, max retries 1 (APS-REQ-062).
- Sliding-window memory + transcript summarisation (APS-REQ-063).
- Transcript persisted per message (APS-REQ-064).
- Session resume on interruption (APS-REQ-065).

STUDENT INTERFACE
- Text chat (APS-REQ-045).
- Voice dictation: audio -> transcription -> editable text -> send; typed fallback on mic
  failure (APS-REQ-046). Hebrew clinical speech dictation accuracy is an open assumption --
  must be tested before go-live.
- Timer display configurable (APS-REQ-047).
- Global diagnostic state (APS-REQ-048).
- Help/Support button (APS-REQ-049).
- Simulation instructions panel (APS-REQ-050).
- Finish simulation button (APS-REQ-051).

RUBRIC + EVALUATION
- Semi-automated rubric generation (APS-REQ-039).
- Teacher review + edit + publish (APS-REQ-040).
- Competency mapping on rubric criteria (APS-REQ-042).
- Post-simulation evaluation pipeline: structured scoring first, then language (APS-REQ-068).
- Rubric scoring per criterion with transcript evidence (APS-REQ-069).
- Transcript highlighting: strong moments, missed opportunities, risk flags (APS-REQ-070).
- Student feedback view (APS-REQ-071).
- Teacher report view + override capability (APS-REQ-072, APS-REQ-076).
- Post-simulation debrief chat (guardrailed: transcript + rubric only; cannot change grade;
  cites specific turns) (APS-REQ-073).
- NOTE: risk-awareness criterion flagged FORMATIVE-ONLY in v1 (Sami, sme-domain-assessment.md
  Section 3). Auto-score is drafted; teacher review is mandatory before any risk-criterion
  grade is treated as official.

LANGUAGES
- Hebrew day one (required). English also in v1. RTL rendering for Hebrew (APS-REQ-082).
- Arabic: deferred per Adam Q4 answer and Sami recommendation.

DASHBOARDS
- Teacher dashboard: class list, completion status, class-wide rubric heatmap, score
  distribution, transcript access, AI evaluation review, teacher comments (APS-REQ-088 subset).
- Student dashboard: completed simulations, criterion feedback, debrief chat history
  (APS-REQ-089 subset).

TECH SUPPORT
- Deterministic support assistant on all major screens (APS-REQ-102).
- Deterministic troubleshooting flows for: mic failure, simulation loading failure, AI
  response failure (APS-REQ-103 subset; LTI/grade-sync flows deferred -- not in pilot).
- Skip-to-email-support escape hatch (APS-REQ-104).
- Support ticket creation with structured metadata (APS-REQ-105). NOTE: no full clinical
  transcript in default ticket (APS-REQ-106); support assistant has NO access to patient
  engine context -- enforced at infrastructure level, not prompt instruction (Sami, Section 4).
- Email escalation (APS-REQ-107).
- Support confirmation screen (APS-REQ-109).
- Frictionless recovery: dictation failure -> typed input; AI response failure -> preserve
  transcript + retry; simulation loading -> resume (APS-REQ-110).

ACADEMIC SAFETY
- Attempt status set (APS-REQ-118).
- Academic safety flow: technical issue -> ticket -> flagged -> teacher notified -> retry
  authorisation (APS-REQ-119, APS-REQ-120, APS-REQ-121).

CREDIT/TOKEN MANAGEMENT (Must -- internal governance before real usage)
- Credit unit model: College + Course allocation (APS-REQ-139).
- Credit deduction events with audit log (APS-REQ-140).
- Soft limit + hard limit + admin override (APS-REQ-141, APS-REQ-142).
- Admin capabilities (APS-REQ-143).
- Admin visibility: usage by college, by course (APS-REQ-144).
- Student visibility: NONE (APS-REQ-145).
- No payment integration (APS-REQ-146).

COST MONITORING
- UsageLog per attempt (APS-REQ-130).
- Cost alert on unusual spend (APS-REQ-132).

SCHEMA STUBS (build data model; do NOT build runtime or UI)
- PersonaBranch + StudentPersonaHistory (JSONB) -- Phase 1b runtime deferred, schema now.

QA
- Failure simulation tools: blocked mic, AI API timeout, transcript save failure, invite-link
  auth failure (APS-REQ-137 subset).
- Test categories: invite-link auth, diagnostic snapshot, support ticket creation, email
  routing, privacy redaction, academic safety flow, frontend recovery without data loss,
  dictation fallback, basic dashboard metrics, role/scope access, credit limit enforcement,
  hard-limit block (APS-REQ-138).

CLINICAL SAFETY (not in the requirements baseline as a standalone module; Sami flag)
- Student welfare safeguarding protocol must be defined before launch. This requires the
  named clinical advisor to approve. Minimum: pre-simulation briefing for high-challenge
  scenarios; mid-session welfare signpost persistent in UI ("this is a simulated patient;
  if you are in real distress, contact [resource]"); Flag Type A (performance) vs Flag
  Type B (welfare) separated in the alert routing.
- The AI patient must have a hard-coded off-ramp in every simulation: "I am a simulated
  training patient." This is a ground-truth rule, not an author setting.

### OUT -- explicitly deferred

Phase 1b (fast-follow, ~4-6 weeks after 1 Sep):
- Canvas / Moodle LTI integration.
- Grade sync to LMS.
- Continuing Persona runtime + UI (schema stubs built now).
- Arabic language support.
- Programme Manager and College Manager roles (data model stubs exist).
- Programme and College dashboards.
- Advanced authoring features: quality checker, simulation preview.
- Remediation content library.
- Longitudinal analytics.
- LLM-driven support assistant.

Phase 2+:
- Multi-institution.
- Vector/RAG layer.
- Embedding-based similarity search.
- Cross-institution analytics.
- Audio for AI patient (TTS).
- Real-time voice conversation.

---

## 3. Sprint Plan to 1 Sep 2026 (scope c)

Today: 2026-06-29. Hard target: 2026-09-01. Internal go/no-go rehearsal: 2026-08-15.
Fallback date if rehearsal fails: ~2026-10-15.

Team: Gal (Lead Dev), Senior Dev (TBD -- hiring must be confirmed this week), Shir (DevOps).
Adi (QA) activates in Sprint 3. Roman on-demand for algorithmic hard problems.

NOTE: Gal and Shir are not yet fully live (B6 sign-off pending -- board.md onboarding section).
The sprint plan below assumes Gal + Shir are activated this week. If they are not, the plan
slips immediately. Eco must confirm activation status before R&D starts.

TEAM SIZING RISK: Erez's estimate was 1-2 senior engineers for 16-28 weeks for full v1.
Pilot-minimal scope is roughly 40-50% of full v1. Two engineers for 9 weeks = ~18 engineer-
weeks. The low end of the Erez range for the full scope was 16 weeks for one engineer. Pilot-
minimal is achievable at two engineers if scope is held. A single engineer will not make 1 Sep.
Hiring the Senior Dev is not optional -- it is on the critical path.

CRITICAL PATH: AI patient engine. Everything else can be parallelised or simplified. The
engine is the single serialised dependency that cannot be compressed. It must start in Sprint 1
and must be production-quality by the 15 Aug rehearsal.

### Sprint 1 -- 2026-06-30 to 2026-07-11 (2 weeks)

THEME: Foundation + engine start. No demo yet; skeleton only.

Owner: Gal (primary) + Senior Dev (if onboarded this week).

- Monorepo scaffold: Next.js + NestJS + TypeScript + Prisma + PostgreSQL + Redis.
- DB schema v1: all pilot-minimal tables including PersonaBranch + StudentPersonaHistory stubs.
- Auth: invite-link + access-code + email login. JWT session.
- RBAC: Student, Teacher, System Admin. Scope-based access skeleton.
- Org hierarchy: College, Course, Assignment, Attempt entities. Programme as DB stub.
- AI patient engine: architecture design doc (Gal + Roman if needed). State machine design.
  Explicit decisions on: (1) PatientStateLog schema and injection pattern; (2) ground-truth
  enforcement mechanism (guard-model option b); (3) interaction analyser design.
  DO NOT start implementing the engine before the design doc is reviewed by Ido and the
  named clinical advisor. Wrong architecture here is harder to fix later than a 1-week delay.
- Shir: cloud infra provisioning (provider must be confirmed by Eco + pass APS-004 gate;
  Israel data residency assumed for pilot; Rambo/Eyal must clear provider before Shir deploys
  anything that stores student data).
- Ido action this week: confirm Senior Dev start date; confirm clinical advisor identification.

End of Sprint 1 milestone: auth works end-to-end, DB schema in place, engine architecture
doc reviewed.

### Sprint 2 -- 2026-07-14 to 2026-07-25 (2 weeks)

THEME: AI patient engine core + case authoring MVP.

Owner: Gal + Senior Dev.

- AI patient engine implementation: state machine, turn pipeline, PatientStateLog persistence,
  interaction analyser v1, disclosure trigger logic, challenge level 1-5. This is the
  highest-risk build item. Roman on-demand if classification algorithms need expert input.
- Ground-truth enforcement: guard-model pass implemented and tested with 2-3 sample cases.
  NOT soft-prompt-only.
- Case authoring: structured builder form + persona generation prompt + ground-truth file
  upload/form + resistance rules. Rubric builder: semi-auto generation + teacher edit + publish.
- Hebrew RTL rendering in the student interface.
- Credit/token management: College + Course allocation, deduction events, soft/hard limits,
  admin UI.
- UsageLog per attempt.

End of Sprint 2 milestone: a complete student simulation session (single turn to finish)
can run end-to-end on a test case. State persists. Ground-truth guard fires on test cases.

### Sprint 3 -- 2026-07-28 to 2026-08-08 (2 weeks)

THEME: Evaluation pipeline + student/teacher UI + QA starts.

Owner: Gal + Senior Dev. Adi begins QA test-case authoring.

- Post-simulation evaluation pipeline: structured scoring + transcript highlights +
  student feedback view + teacher report view + teacher override.
- Debrief chat: guardrails enforced at infrastructure (separate prompt context, no shared
  patient state).
- Teacher dashboard: class list, completion status, rubric heatmap, transcript access.
- Student dashboard: session history, feedback, debrief history.
- Technical support assistant: deterministic flows + email escalation + ticket creation.
  Support agent isolation from patient engine confirmed at infrastructure level.
- Academic safety: attempt status tracking + teacher notification.
- Voice dictation: Hebrew + English. Test with clinical vocabulary. Flag accuracy gaps.
- Adi: QA test cases for invite-link auth, diagnostic snapshot, support ticket, email
  routing, privacy redaction, dictation fallback, role/scope access, credit limit block.

End of Sprint 3 milestone: full end-to-end student session from invite link through
debrief and teacher review, including credit governance and support flow.

### Sprint 4 -- 2026-08-11 to 2026-08-15 (1 week -- REHEARSAL WEEK)

THEME: Internal rehearsal go/no-go for the AI patient engine.

This sprint is not a feature sprint. It is the gate.

- 2026-08-15: Internal rehearsal with real users (clinical advisor + internal team playing
  student role). Run 3-5 full simulation sessions end-to-end.
- Rehearsal criteria (pass/fail):
  (a) Patient state is coherent across all turns in a session. No drift, no invented facts
      outside ground truth.
  (b) Ground-truth guard fires correctly on at least 3 engineered-violation test cases.
  (c) Interaction analyser produces clinical-advisor-acceptable classifications on at least
      70% of turns (Hebrew + English sample).
  (d) Evaluation output is coherent and matches clinical advisor's expected rubric scores
      within acceptable range (to be defined with advisor before rehearsal).
  (e) No data-loss on session interruption/resume.
  (f) Credit hard-limit blocks correctly.
  (g) Support assistant cannot access patient state (structural isolation confirmed).

GO decision (2026-08-15): all criteria above pass -> proceed to 1 Sep launch.
NO-GO decision (2026-08-15): any of (a), (b), (c), (d) fail -> activate fallback.

Go/no-go is Ido's call. If NO-GO, Ido escalates to Eco immediately (same day) with:
which criterion failed, the engineering remediation estimate, and a revised date.

### Fallback -- ~2026-10-15 (if 15 Aug rehearsal fails)

If the AI patient engine does not pass the 15 Aug rehearsal gate:
- Notify Eco immediately (15 Aug). Eco relays to owner. Owner relays to Adam via the no-
  direct-contact protocol.
- Fallback target: 15 October 2026. That is 9 weeks from 15 Aug -- the same window we have
  now. The difference is that we will have a near-complete engine and will know exactly what
  failed.
- Sprint 5 + 6 (2026-08-18 to 2026-09-12, 4 weeks): fix the rehearsal failures. Do not add
  scope. Second rehearsal target: 2026-09-13.
- Sprint 7 (2026-09-14 to 2026-10-10, 4 weeks): hardening, full QA cycle, launch prep.
- Launch: 2026-10-15.

The 15 Oct fallback is a viable option for the following reason: this is a formative pilot
only. There is no grade-sync dependency, no LTI dependency, and no formal accreditation at
stake. A 6-week slip to a better engine is preferable to a 1-Sep launch with a patient that
drifts or invents clinical facts. That outcome would damage the reference customer relationship
and the product's clinical credibility, which is the core differentiator.

---

## 4. Continuing Personas -- Single vs Multi-Session (scope d)

Q9.1 from clarifying-questions-for-adam.md is not yet answered. The decision branches as follows.

CASE A: Adam confirms single-session (one-off) is acceptable for the Sep pilot.

Recommendation: defer Continuing Persona runtime to Phase 1b as Perry proposed.
- The pilot-minimal scope as listed in Section 2 applies without change.
- PersonaBranch + StudentPersonaHistory tables are in the schema (stubs). Runtime and UI build
  in Phase 1b (~4-6 weeks post-Sep).
- Timeline impact: none. 1 Sep target is unchanged.
- Phase 1b scope is well-defined and can start immediately after the Sep launch stabilises.

CASE B: Adam requires multi-session continuity from day one (Sep cohort runs across multiple
weeks and continuity is the pedagogical point).

Recommendation: the timeline must be renegotiated with Adam. Do NOT silently absorb this.

Reasons (from Sami, sme-domain-assessment.md Section 9.2):
1. Adding continuing persona runtime to the 9-week window alongside the AI patient engine
   is not credible. Sami is explicit: longitudinal continuity is harder than single-session.
   The failure modes are different and more serious (memory flattening, formulation drift,
   alliance score coherence, LLM-generated history compounding errors).
2. The development model (student behaviour -> patient state change) requires explicit
   clinical calibration of rate-of-change parameters. That calibration cannot be done
   without the named clinical advisor and cannot be rushed.
3. Sami recommends capping multi-session arcs at 2-4 sessions for v1 and building
   explicit session arc length constraints. Even a 2-session arc in 9 weeks, alongside
   the single-session engine, is a 30-40% additional build surface on the highest-risk item.

If Case B applies, the options for Eco to present to Adam are:
- Option 1: 1 Sep with single-session only. Continuing personas in Phase 1b (4-6 weeks later,
  mid-October). Students get full value from single-session formative practice on 1 Sep.
- Option 2: ~15 Oct with both single-session and 2-session arc. Requires Case B confirmation
  and 6-week negotiated slip.
- Option 3: 1 Sep with a limited continuing-persona MVP (2-session arc only, basic state
  persistence, no advanced development model). Extremely high risk; I do not recommend this
  unless Adam confirms that multi-session continuity is a hard requirement AND the clinical
  advisor can be engaged immediately to define the arc constraints.

My recommendation regardless of Adam's answer: Perry's Phase 1b deferral for continuing
personas is the right call. Present Option 1 to Adam. If he pushes back to Case B,
escalate to Eco before any scope reversal.

OPEN QUESTION for Adam (via owner relay): Q9.1 -- does the Sep cohort require multi-session
continuity from launch, or is single-session sufficient to prove the concept?

---

## 5. APS-004 Cross-Dependencies (Rambo/Eyal/Lital gate)

The following architecture decisions are BLOCKED pending APS-004 gate clearance. R&D must not
implement these items until the gate verdict is received.

BLOCKED pending APS-004:
1. Cloud provider selection and infrastructure provisioning (Shir). Israel data residency
   is assumed; Rambo + Eyal must confirm the specific provider before any student data is
   stored. Shir can build the local dev environment; production infra waits for the gate.
2. LLM/AI API provider selection (OpenAI vs Anthropic vs other). The gate must cover: what
   student data (transcript fragments, interaction summaries) goes to the LLM API; whether
   the API provider's data handling terms are compatible with Israeli privacy law and
   Gome Gevim's institutional requirements. This is the highest-surface privacy question.
3. Dictation/speech-to-text provider. Same data-handling question as LLM API.
4. Email sender service (for support ticket escalation). Rambo security review required.
5. StudentPersonaHistory "notable student mistakes" field (JSONB) -- schema can be designed
   now; Eyal must review before Phase 1b implements the runtime.

NOT BLOCKED by APS-004 (can proceed in parallel):
- DB schema design (PostgreSQL, internal).
- Monorepo scaffold and build tooling.
- Auth skeleton (invite-link, local email -- no external OAuth required in pilot).
- Case authoring UI and rubric builder (internal tooling).
- Patient engine architecture design doc.

---

## 6. Top 3 Technical Risks

RISK 1 (Critical): AI patient engine quality -- state drift + ground-truth enforcement.
Risk: the interaction analyser misclassifies student turns; the PatientStateLog-injected state
does not reliably constrain the LLM; ground-truth guard misses invented facts under
conversational pressure. If this happens, the patient is clinically incoherent and the rubric
scores are invalid.
Likelihood: HIGH without careful implementation. Manageable with hard-persisted state + guard
model.
Impact: HIGH. This is the core product differentiator. An incoherent patient at the Sep pilot
is a reputational failure with the reference customer.
Mitigation: (a) PatientStateLog hard-persisted and structured-injected each turn (not soft
prompt appended); (b) ground-truth enforcement uses the guard-model pass (option b from Sami),
not soft prompt alone; (c) clinical advisor reviews and approves the engine design and sample
outputs before the 15 Aug rehearsal; (d) 15 Aug rehearsal is specifically designed to expose
drift and invented facts.
Owner of this risk: Gal (build), Ido (gate).

RISK 2 (High): Team readiness -- Gal + Shir not live; Senior Dev not hired.
Risk: if Gal and Shir are not activated this week, and/or the Senior Dev hire is not confirmed
in Sprint 1, the sprint plan above cannot hold.
Likelihood: MEDIUM (onboarding section of board.md shows B6 sign-off pending for both).
Impact: HIGH. A 2-week delay in team activation costs roughly one full sprint on a 9-week
timeline.
Mitigation: Eco confirms Gal + Shir activation status before end of day 2026-06-29. Senior
Dev sourcing escalated to Eco as a blocking dependency.
Owner of this risk: Eco (activation), Ido (escalation if not cleared by end of day).

RISK 3 (High): APS-004 gate blocks infra + LLM provider decisions past Sprint 1.
Risk: if Rambo/Eyal/Lital take more than 2 weeks on the APS-004 gate, Shir cannot provision
production infra and Gal cannot finalise the LLM API integration. Sprint 2 stalls.
Likelihood: MEDIUM. The gate scope is well-defined (APS-004 board row) and the team is
experienced. But legal review of a new data-handling context takes time.
Impact: HIGH. Without a cleared LLM provider, the patient engine cannot make real API calls
in any environment beyond local dev stubs.
Mitigation: (a) R&D uses API stubs + mock LLM responses in Sprint 1 and early Sprint 2 to
progress without a live provider; (b) Ido pings Eco by 2026-07-07 (end of Sprint 1) if APS-004
gate is not closed by then; (c) APS-004 scope does not include LTI (deferred from pilot),
which reduces the gate surface somewhat.
Owner of this risk: Rambo/Eyal/Lital (gate execution), Ido (monitoring + escalation).

Additional risk (lower priority but worth naming):
RISK 4: Named clinical advisor not identified in time.
Risk: Sami is explicit that a named clinician-educator is a build precondition for the rubric
framework, competency validation, and student welfare safeguarding protocol. Without this
person, the engine design cannot be clinically validated and the 15 Aug rehearsal has no
external clinical check.
Likelihood: MEDIUM. Adam is the natural candidate to nominate this person, or to play the role
himself. But owner must relay the question before Sprint 1 ends.
Mitigation: Eco relays to Adam (via owner) by 2026-07-07 the ask for either a named clinical
advisor or confirmation that Adam plays that role directly.

---

## 7. Open Questions for Adam (via owner relay only)

Q9.1 (BLOCKING for continuing persona decision):
Does the Sep pilot require multi-session continuity (same patient across multiple sessions per
student), or is single-session (one simulation session per assignment) sufficient for the
formative pilot?

Q-ADVISOR (BLOCKING for engine validation):
Who is the named clinical/academic advisor for the pilot -- an LI-CBT or ACT practitioner with
training programme experience -- who will validate the competency framework, review AI-generated
evaluations, and approve the student welfare safeguarding protocol? Is this Adam himself, or a
named colleague?

Q-WELFARE (important before launch):
Does Gome Gevim College have a named student wellbeing point-of-contact who can be the welfare
escalation target for Flag Type B (student distress) alerts from the platform?

Q-ACCREDITATION (not blocking for Sep pilot; commercial risk item):
Does the LI-CBT/counselling programme at Gome Gevim operate under BABCP, BACP, or equivalent
accreditation, and has Adam checked whether use of AI-assessed simulation in that programme
requires notification to the accrediting body?

---

## 8. Feasibility Verdict

1-Sep target: CONDITIONALLY FEASIBLE.

Conditions that must hold:
1. Scope is locked to Section 2 (pilot-minimal). No additions without Ido sign-off.
2. Gal + Shir activated by 2026-06-30. Senior Dev confirmed by 2026-07-07.
3. Named clinical advisor identified by 2026-07-07.
4. APS-004 gate produces LLM + infra provider decisions by 2026-07-18 (end of Sprint 2).
5. R&D starts on the AI patient engine this week (not after team is fully assembled).
6. AI patient engine passes the 15 Aug internal rehearsal on all five engine-specific criteria.
7. Continuing Persona is deferred (Case A above) or timeline is renegotiated with Adam (Case B).

If any of conditions 1, 2, 3, 5 fail: date is at risk by at least one sprint (2 weeks).
If condition 4 fails: Sprint 2 stalls on the engine; reassess immediately.
If condition 6 fails (15 Aug rehearsal): activate the 15 Oct fallback. Do not push to 1 Sep
with a failing engine.

15 Aug go/no-go: this is the real decision point. 1 Sep is only achievable if the engine
passes on 15 Aug. Eco should present this framing to Adam now, not as a hedge but as a
commitment: we will tell you on 15 Aug whether 1 Sep holds.

---

## 9. Board Update -- APS-005

Status updated to: in-progress (this document is the deliverable; Ido has signed off).
Next board update: after Eco confirms Gal + Shir activation and Senior Dev sourcing status.

---

*All architecture decisions above are R&D recommendations pending Eco + owner confirmation.
No build has started. No external tools adopted without APS-004 gate. No contact with Adam;
owner relays all questions.*
