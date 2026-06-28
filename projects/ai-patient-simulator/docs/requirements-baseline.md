# APS Requirements Baseline
# task APS-001 | owner: Perry (VP Product) | date: 2026-06-28 | status: DRAFT (internal discovery)
# Updated: 2026-06-28 -- folded in adam-pilot-readiness-answers + adam-appendix-credit-and-continuing-personas

Source: adam-hld-text-extract.txt (71pp) + adam-architecture-deck.pdf (RAG/storage deck)
        + adam-pilot-readiness-answers.md (2026-06-28) + adam-appendix-credit-and-continuing-personas.md (2026-06-28).
Not for external sharing. All requirements prefixed with APS-REQ.

---

## LOCKED PILOT FACTS (from adam-pilot-readiness-answers.md, 2026-06-28)

- Site: Gome Gevim College (Israel). CONFIRMED.
- Pilot start: 1 September 2026. HARD TARGET (treat as real, not speculative).
- Access model v1: secure invite link only. Canvas/Moodle NOT required day one.
- Assessment mode v1: FORMATIVE only. No formal grading, no grade sync required for pilot.
- Languages: Hebrew REQUIRED day one; English desirable; Arabic later phase.
- Students: Israel-based. Privacy baseline: Israeli Privacy Protection Law.

---

## TIMELINE WARNING (Perry assessment, 2026-06-28)

Today is 2026-06-28. Pilot start is 1 September 2026. That is approximately 9 weeks.

Earlier internal estimate for a full pilot build was 16-28 weeks. There is NO scenario in which
the full v1 scope (as defined in this baseline before today) ships by 1 Sep. This must be
confronted directly.

Perry's position:
- A credible formative pilot CAN ship by 1 Sep if -- and only if -- scope is cut to
  "pilot-minimal" (see Section PM below) and R&D starts this week.
- If R&D does not start immediately or if any Must item below proves infeasible, the 1 Sep date
  is at risk. The single biggest schedule risk is AI patient engine quality: it requires careful
  prompt engineering + ground-truth enforcement + state tracking. That work cannot be parallelised
  away.
- Recommend Eco present Adam with options (a) pilot-minimal scope at 1 Sep, (b) phased launch
  (teacher authoring + first 2-3 live sessions by 1 Sep, full evaluation engine 4-6 weeks later),
  or (c) negotiate date to 15 October for fuller scope. Do NOT silently absorb the 9-week
  constraint without surfacing it.

---

## 0. Storage Architecture Decision (REVISED 2026-06-28 -- RESOLVE BEFORE BUILD)

Two documents, two conflicting stacks.

| Source | DB | ORM | Infra |
|--------|----|-----|-------|
| HLD (pp 68-71) | PostgreSQL | Prisma | NestJS + Next.js + Redis + S3 |
| Architecture deck | MongoDB | -- | Vector store + embeddings + clustering |

These are not reconcilable as-is. The appendix (Continuing Persona) now CONFIRMS that
per-student longitudinal history is a real requirement. This changes the storage calculus.

### Revised Recommendation: PostgreSQL/JSONB for pilot; vector layer deferred

Reasoning:
- Org hierarchy (College->Programme->Course->Attempt) is relational; FK integrity is load-bearing.
- Rubric scoring, credit ledger, competency mapping: all tabular, all ACID.
- Continuing Persona history (Section 18 below) is structured but variable-depth JSON:
  session summaries, trust level, symptom change, notable mistakes, etc. PostgreSQL JSONB
  handles this cleanly for pilot scale (one college, 1-3 courses, likely <200 students).
  No vector search is needed to retrieve the structured history of one student-persona pair --
  a simple FK lookup suffices.
- Vector/RAG layer is appropriate for Phase 2 (longitudinal clustering, pattern detection across
  cohorts, embedding-based disclosure state matching). NOT required for pilot.
- Risk: if Adam expects hundreds of concurrent sessions from day one, revisit. Pilot scale does
  not justify a vector store on day one.

UPDATED RECOMMENDATION: PostgreSQL + Prisma + JSONB for 1-Sep pilot.
Vector/RAG layer: Phase 2 (deferred). Flag for Ido feasibility sign-off.

Decision needed: Eco/Ido confirm stack before any architecture handoff.

---

## 1. Module: Integration / LTI
# UPDATED 2026-06-28: Adam confirmed secure invite link is acceptable day one. LTI is NOT a
# pilot-minimal requirement. Reclassified below.

### Must (v1 pilot)
- APS-REQ-005: Secure standalone link mode (invitation link + access code + email login). CONFIRMED required day one (adam-pilot-readiness-answers Q2).

### Should (post-pilot v1 / Phase 1b)
- APS-REQ-001: LTI 1.3 launch from Canvas self-hosted. Desirable later; does NOT block pilot.
- APS-REQ-002: LMS context extraction on launch (user, course, assignment, role). Tied to LTI.
- APS-REQ-003: Fallback LTI error page (backend-served, pre-React-boot) with support ticket creation. Tied to LTI.
- APS-REQ-004: Diagnostic launch logging (launch success/failure, error codes). Partial: log invite-link failures in pilot.
- APS-REQ-006: Canvas Assignment and Grade Services (grade return). Formative pilot does not require grade sync.
- APS-REQ-007: Canvas Deep Linking (select simulation from within Canvas).

### Could (v1 stretch)
- APS-REQ-008: Canvas Names and Role Provisioning Service (roster sync).

### Won't (v1)
- APS-REQ-009: Moodle LTI full integration -> Phase 2.
- APS-REQ-010: Blackboard / additional LMS -> Phase 3.

---

## 2. Module: Org Hierarchy

### Must
- APS-REQ-011: Five-level hierarchy: College -> Programme -> Course -> Simulation Assignment -> Student Attempt.
- APS-REQ-012: Simulation Template layer (reusable) above Assignment (course-specific instance).
- APS-REQ-013: Per-assignment configuration: dates, teachers, students, challenge level, permitted languages, attempt limits, grading policy, LMS link, credit allocation, retry policy, rubric version.

### Should
- APS-REQ-014: College and Programme as real entities (not stubs). Required for scoped access control even in pilot.

### Won't (v1)
- APS-REQ-015: Multi-college / cross-college analytics -> Phase 2 (College Dashboard).

---

## 3. Module: Access Control

### Must
- APS-REQ-016: Role-based access: Student, Teacher, Programme Manager, College Manager, Simulation Author, Support Staff, System Admin.
- APS-REQ-017: Scope-based access: each role sees only own hierarchy slice.
- APS-REQ-018: Support staff blocked from clinical transcripts, hidden case facts, rubric evaluations by default; explicit elevated permission + audit log required.
- APS-REQ-019: Permission matrix enforced per HLD section 5.3 (run, view, create, edit, assign, override, export).

### Should
- APS-REQ-020: Role overlap support (teacher who is also programme manager).

### Won't (v1)
- APS-REQ-021: Fine-grained simulation-author sub-roles -> Phase 2.

---

## 4. Module: Competency Library

### Must
- APS-REQ-022: Hierarchical competency library: Core (platform) -> College -> Programme -> Course -> Simulation-specific.
- APS-REQ-023: Language-independent competency IDs. Labels stored per language; scores and IDs are language-neutral.
- APS-REQ-024: Mapped vs unmapped distinction: mapped competencies appear in aggregate analytics; unmapped stay local.

### Should
- APS-REQ-025: Teacher workflow to submit local competency to programme library for approval.
- APS-REQ-026: Competency statuses: Draft / Local / Submitted / Approved-Programme / Approved-College / Core / Deprecated.

### Won't (v1)
- APS-REQ-027: Competency governance approval workflow (programme manager approves/rejects teacher submissions) -> Phase 2. Stub the data model; build the workflow in Phase 2.

---

## 5. Module: Case Authoring

### Must
- APS-REQ-028: Guided simulation builder (structured field form): title, clinical model, student level, primary/secondary skill, patient style, presenting problem, hidden issue, risk level, challenge level 1-5, languages, mode (practice/formative/graded), turns, time limit.
- APS-REQ-029: Prompt-driven persona generation from builder fields. Output: demographic profile, communication style, emotional presentation, avoidance patterns, disclosure pattern.
- APS-REQ-030: Ground-truth file per simulation (known facts, what may/must-not be invented, risk/safeguarding boundaries, escalation rules). AI patient cannot invent outside this file.
- APS-REQ-031: Hidden trigger and resistance rules: programmable disclosure logic tied to student behavior.
- APS-REQ-032: Simulation versioning: published rubric version locked per assignment.

### Should
- APS-REQ-033: Authoring quality checker: flags rubric-goal misalignment, difficulty-level inconsistencies, missing triggers, bias/stereotype warnings.
- APS-REQ-034: Simulation preview (author can run a test session).
- APS-REQ-035: Diversity/context engine: culturally sensitive persona variation without stereotype-driven pathology.

### Could
- APS-REQ-036: Supplementary clinical information module (referral letter, questionnaire results) optionally available to students during simulation.

### Won't (v1)
- APS-REQ-037: Batch case import -> not in HLD scope, explicitly excluded.
- APS-REQ-038: Advanced authoring studio (drag-drop scenario tree) -> Phase 2.

---

## 6. Module: Rubric

### Must
- APS-REQ-039: Semi-automated rubric generation from simulation goals, clinical model, student level, challenge level, and competency library.
- APS-REQ-040: Teacher review and edit before publish: criteria, weights, scoring anchors.
- APS-REQ-041: Rubric version locked at assignment creation; locked version used for all attempts in that assignment.
- APS-REQ-042: Competency mapping on rubric criteria (links rubric to competency library for analytics).

### Should
- APS-REQ-043: Scoring anchor generation (AI-assisted descriptions of what each score level looks like for each criterion).

### Won't (v1)
- APS-REQ-044: Rubric marketplace / shared rubric library across institutions -> Phase 3.

---

## 7. Module: Student Interface

### Must
- APS-REQ-045: Text chat interface (primary input mode).
- APS-REQ-046: Voice dictation: audio -> transcription -> editable text box -> student sends. Fallback to typed input if mic fails.
- APS-REQ-047: Timer display (configurable: none / 15 / 30 / 50 min / custom). Hard stop in assessment mode.
- APS-REQ-048: Global diagnostic state maintained in frontend (role, LMS source, attempt ID, browser, mic status, API status, last error). Sent on Help click.
- APS-REQ-049: Help / Support button accessible from simulation screen.
- APS-REQ-050: Simulation instructions panel.
- APS-REQ-051: Finish simulation button.

### Should
- APS-REQ-052: Pause and reflect mode (practice and formative modes; graded = teacher setting).
- APS-REQ-053: Clinical notes / formulation side panel (ACT/LI-CBT workspace: problem, thoughts, emotions, behaviour, values, hypotheses). Visibility in evaluation is teacher-controlled.

### Could
- APS-REQ-054: Non-verbal cue display (text markers: [Looks away], [Long pause] etc.) in chat UI. Cues visible in transcript and available to evaluation engine.

### Won't (v1)
- APS-REQ-055: AI patient audio (text-to-speech) -> Phase 2. HLD explicitly calls this Level 2/3.
- APS-REQ-056: Real-time voice conversation -> Phase 3.

---

## 8. Module: Simulation Runtime / State

### Must
- APS-REQ-057: Structured runtime pipeline per turn: student message -> interaction analyser -> update patient state -> check ground-truth / disclosure rules -> check resistance rules -> generate patient response -> store transcript + state changes.
- APS-REQ-058: Patient state tracking per turn: trust, openness, emotional activation, avoidance level, defensiveness, alliance quality, disclosure readiness, risk/safety relevance. Stored in PatientStateLog.
- APS-REQ-059: Interaction analyser: evaluates empathy, question type, specificity, validation, ACT consistency, premature advice, pressure, missed cues, risk/ethics relevance, therapeutic stance. Influences patient next response.
- APS-REQ-060: Hidden information release logic: specified information unlocks only on specified student behaviours.
- APS-REQ-061: Challenge level (1-5) controls: openness, emotional intensity, complexity, insight, alliance quality, risk ambiguity, disclosure speed, structure.
- APS-REQ-062: Cost governance enforced at runtime: per-simulation token budget, max turns (default 75, soft warning at 60), max dictation minutes (15), max debrief questions (5-10), max failed-response retries (1). Configurable per assignment.
- APS-REQ-063: Sliding-window memory + transcript summarisation to manage context length and cost.
- APS-REQ-064: Transcript persisted per message with original language, translated text field, non-verbal cue field, timestamp.
- APS-REQ-065: Resume attempt without losing transcript if session interrupted.

### Should
- APS-REQ-066: Model routing (cheaper model for lower-complexity turns) to manage cost.
- APS-REQ-067: Prompt caching where supported by AI provider.

---

## 9. Module: Evaluation / Debrief

### Must
- APS-REQ-068: Post-simulation evaluation pipeline: structured scoring first (JSON), then language generation. Prevents score drift from prose generation.
- APS-REQ-069: Rubric scoring per criterion with evidence extracted from transcript (turn references).
- APS-REQ-070: Transcript highlighting: strong moments, missed opportunities, risk/ethics flags -- each linked to specific turn.
- APS-REQ-071: Student feedback view: overall grade, criterion scores, strengths, growth areas, transcript examples, suggested alternative phrasing, recommended next focus.
- APS-REQ-072: Teacher report view: same as student + teacher-only detail, override capability, class-wide comparison.
- APS-REQ-073: Post-simulation debrief chat (AI educational supervisor, not patient). Guardrails: uses only transcript + rubric + evaluation; no new clinical facts; cannot change official grade; cites specific transcript moments.
- APS-REQ-074: Evaluation visible to teacher in graded mode (including debrief chat if configured).

### Should
- APS-REQ-075: Basic remediation suggestions tied to weak competency scores. Text-based (no content library in v1). Examples: "review functional analysis concepts," "practise open questions."
- APS-REQ-076: Teacher grade override with reason recorded.

### Won't (v1)
- APS-REQ-077: Remediation content library (flashcards, micro-learning modules) -> Phase 2.
- APS-REQ-078: Longitudinal automated insight generation ("Dana improving in alliance...") -> Phase 2.

---

## 10. Module: Multilingual

### Must
- APS-REQ-079: Language-independent data model: competency IDs, rubric IDs, scores stored as language-neutral keys. Labels stored separately per language.
- APS-REQ-080: Per-simulation permitted language configuration (set at assignment level).
- APS-REQ-081: Student language selection at session start (from permitted languages).
- APS-REQ-082: Hebrew and English at minimum for v1 pilot. RTL rendering for Hebrew required.

### Should
- APS-REQ-083: Teacher display language selection (view dashboards, rubrics, evaluation in their language).
- APS-REQ-084: Translated transcript view for teacher (auto-translated; original preserved).

### Could
- APS-REQ-085: Arabic (RTL) support. Strong Eco-Synthetic competency here; confirm with Adam whether Arabic is pilot scope or Phase 2.

### Won't (v1)
- APS-REQ-086: Deeper multilingual translation workflow (human review, translation QA pipeline) -> Phase 2.
- APS-REQ-087: Additional languages beyond Hebrew / English / Arabic -> Phase 2+.

---

## 11. Module: Dashboards / Analytics

Perry's cut: Adam's MVP list includes teacher dashboard as Must and programme + college dashboards as optional-if-feasible. Perry recommends restricting v1 to teacher + student dashboard only. Programme and college dashboards are Phase 2.

### Must
- APS-REQ-088: Teacher (course) dashboard: class list, assignment completion status, class-wide rubric heatmap, score distribution, transcript access, AI evaluation review, teacher comments, grade-sync status, support issues affecting class, retry requests.
- APS-REQ-089: Student dashboard: completed simulations, grades, criterion feedback, debrief chat history, support ticket history.

### Should
- APS-REQ-090: Student longitudinal view within teacher dashboard (per-student scores across simulations within the course).

### Won't (v1)
- APS-REQ-091: Programme dashboard -> Phase 2.
- APS-REQ-092: College dashboard -> Phase 2.
- APS-REQ-093: Advanced graph suite (radar charts, cohort benchmarking, difficulty vs performance) -> Phase 2. Basic bar/heatmap in v1.
- APS-REQ-094: Cross-cohort or cross-institution analytics -> Phase 2/3.

---

## 12. Module: Automated Support (Learning)

### Must
- APS-REQ-095: Basic automated student support: simulation instructions, technical readiness check, mic test, language selector, post-simulation debrief (covered in Evaluation module).
- APS-REQ-096: Basic teacher support insights: class weakness detection (auto-summary of rubric scores), flagged attempts queue (attempts needing teacher review).

### Should
- APS-REQ-097: Suggested lesson focus based on class-wide weakness pattern.

### Won't (v1)
- APS-REQ-098: Programme manager support tools -> Phase 2 (requires programme dashboard).
- APS-REQ-099: College manager support tools -> Phase 2.
- APS-REQ-100: Authoring support assistant (case-quality checker beyond basic) -> Phase 2 stretch.
- APS-REQ-101: Automated management reports -> Phase 2.

---

## 13. Module: Technical Support (Deterministic)

### Must
- APS-REQ-102: Context-aware deterministic support assistant on all major screens. Context loaded from global diagnostic state (no separate data fetch needed on Help click).
- APS-REQ-103: Deterministic troubleshooting flows for: mic/dictation failure, LTI launch failure, grade sync failure, simulation loading failure. Rule-based; no LLM in v1.
- APS-REQ-104: "Skip to Email Support" escape hatch visible on every support screen. User never forced through full flow.
- APS-REQ-105: Support ticket creation: structured metadata (user, role, scope IDs, LMS source, issue category, browser/device, error codes). No full clinical transcript attached by default.
- APS-REQ-106: Separate DiagnosticLog storage (not embedded in ticket). Reference only in ticket. Raw logs redacted (no tokens, no transcripts, no student notes).
- APS-REQ-107: Email escalation: system assembles structured email with all diagnostic context; user may add free-text; sent to scoped support email per routing matrix.
- APS-REQ-108: Support email routing matrix: deterministic routing by issue type and scope. Regression tests required for each routing rule.
- APS-REQ-109: Support confirmation screen: ticket ID, who notified, expected response time, whether student can continue.
- APS-REQ-110: Frictionless recovery: dictation failure -> typed input immediately; AI response failure -> preserve transcript + retry; grade sync failure -> save internally + retry later; simulation loading -> resume without transcript loss.
- APS-REQ-111: Technical support assistant fully separated from AI patient engine. No shared prompt context, no access to case facts or clinical state.

### Should
- APS-REQ-112: Support dashboard for system admin (ticket queue, issue category breakdown, routing audit log).
- APS-REQ-113: Automated alerts: repeated LMS launch failures, grade-sync failures, unusual cost spike, low credit balance.

### Won't (v1)
- APS-REQ-114: LLM-driven support assistant -> Phase 2 with strict boundaries.
- APS-REQ-115: Support analytics by college/programme/course -> Phase 2.
- APS-REQ-116: SLA management -> Phase 2.
- APS-REQ-117: Human support team dashboard -> Phase 3.

---

## 14. Module: Academic Safety

### Must
- APS-REQ-118: Attempt status set: Not started / In progress / Completed / Abandoned / Submitted / Evaluated / Technically affected / Technical failure confirmed / Retry authorised.
- APS-REQ-119: Academic safety flow: technical issue detected -> support ticket -> attempt flagged "technically affected" -> teacher notified -> if confirmed: "technical failure confirmed" -> student may retry -> LMS grade not negatively affected.
- APS-REQ-120: Teacher visibility of technically affected attempts in dashboard.
- APS-REQ-121: Retry authorisation by teacher (within scope).

---

## 15. Module: Grade Sync
# STATUS 2026-06-28: DEFERRED TO PHASE 1b. Pilot is FORMATIVE only; no grade return needed
# at 1 Sep. All REQs below are Phase 1b; data model stubs should exist in pilot schema.

### Won't (1-Sep pilot -- formative only; confirmed adam-pilot-readiness-answers Q3)
- APS-REQ-122: Canvas grade return via Assignment and Grade Services -> Phase 1b.
- APS-REQ-123: Idempotent grade sync -> Phase 1b.
- APS-REQ-124: Grade sync status tracking -> Phase 1b.
- APS-REQ-125: Manual + automated retry -> Phase 1b.
- APS-REQ-126: LMS-safe behaviour on technical failure -> Phase 1b.
- APS-REQ-127: Grade sync failure logging -> Phase 1b.
- APS-REQ-128: Full Moodle grade return -> Phase 2.

---

## 16. Module: Credit / Token Management (NEW -- from adam-appendix 2026-06-28)
# Replaces and supersedes APS-REQ-135 and APS-REQ-136 (old Cost Governance "Won't" items).
# Reconciliation with Cost Governance (Section old-16, now Section 16b below):
#   - Cost Governance layer (REQ-129 through REQ-134) = internal PLATFORM visibility (usage logs,
#     cost alerts, token budget per simulation). That layer stays.
#   - Credit/Token Management (this module) = ADMIN-FACING GOVERNANCE at college/course level.
#     These are additive, not duplicate. Credit balance informs the hard-limit enforcement;
#     UsageLog feeds the credit deduction. They share the same underlying event stream.
#   - Implementation: credit ledger is a thin wrapper over UsageLog aggregates.
#     No separate billing system. Admin UI only.

### Must (pilot -- internal admin governance required before real usage begins)
- APS-REQ-139: Credit unit model: internal allocation at College level and Course level.
  Course allocation associated to its College. No student-facing credit concept.
- APS-REQ-140: Credit deduction events: simulation run, continuing-persona session, session
  summary generation, persona state update, feedback generation, other external API calls.
  Each deduction recorded with college_id, course_id, activity_type, amount, timestamp.
- APS-REQ-141: Soft limit: admin-configured threshold per College and per Course. When usage
  approaches or exceeds threshold, notify authorised admin (in-platform alert + email).
  Credit-consuming activity continues until hard limit.
- APS-REQ-142: Hard limit: when hard limit reached, block credit-consuming activity until
  authorised admin grants override or adds credits. Student sees neutral "session unavailable"
  message; no credit detail exposed.
- APS-REQ-143: Admin capabilities: add / deduct / reset / grant bonus credits; set/edit
  soft + hard limits; override hard limit for a defined period. All manual changes recorded
  in credit_audit_log (admin_id, action, amount, reason, timestamp).
- APS-REQ-144: Admin visibility: usage by college; usage by course; credit-consuming activity
  log; current balance. Roles: System Admin and College Manager only.
- APS-REQ-145: Student visibility: NONE. Credit balances and consumption details hidden from
  all student-facing UI.
- APS-REQ-146: No payment / billing integration. Internal allocation and control only.

### Should
- APS-REQ-147: Low-balance automated alert at configurable threshold (e.g., 20% remaining)
  sent to College Manager and System Admin.
- APS-REQ-148: Credit usage report exportable (CSV or PDF) per College / Course / date range.

### Won't (pilot)
- APS-REQ-149: Student personal-practice credit purchase -> Phase 3.
- APS-REQ-150: Automated credit top-up / payment gateway -> Phase 3.
- APS-REQ-151: Cross-institution credit pooling -> Phase 2.

---

## 16b. Module: Cost Governance (unchanged; now explicitly separate from Credit module above)

### Must
- APS-REQ-129: Per-simulation-assignment token budget (configurable; default limits per HLD: 75 turns, 60-turn soft warning, 15 min audio, 1 final evaluation, 1 retry, 5-10 debrief questions).
- APS-REQ-130: UsageLog per attempt: model used, input/output tokens, transcription minutes, estimated cost, timestamp. NOTE: UsageLog events also feed credit deduction (APS-REQ-140).
- APS-REQ-131: Cost visible to System Admin and College Manager.
- APS-REQ-132: Cost alert: unusual spend per simulation (configurable threshold).
- APS-REQ-133: SupportAIUsageLog separate from simulation UsageLog (when AI support added in Phase 2).

### Should
- APS-REQ-134: Per-course and per-programme cost rollup views for admin.

---

## 17. Module: Continuing Persona / Therapeutic History (NEW -- from adam-appendix 2026-06-28)
# CRITICAL decision: IN the 1-Sep pilot or deferred?
#
# Perry recommendation: DEFERRED to Phase 1b (first fast-follow after pilot, ~4-6 weeks post-Sep).
# Rationale:
#   1. TIMELINE: 9 weeks. The AI patient engine (dynamic state, ground-truth, eval pipeline) is
#      already the hardest item in pilot-minimal scope. Adding longitudinal history branching,
#      per-student-persona state persistence, and reset/fork UI in the same 9 weeks is not
#      credible. One of the two will be under-built.
#   2. FORMATIVE context: a formative pilot's value is in the per-session feedback loop, not
#      multi-session continuity. A single well-designed session is sufficient to prove the
#      concept. Continuing persona adds pedagogical richness but is not what makes or breaks
#      the Sep pilot.
#   3. ARCHITECTURE: if continuing persona is in scope, the schema must include PersonaBranch,
#      StudentPersonaHistory, and all the JSONB history fields from day one. That is buildable
#      (JSONB recommendation above), but adds R&D surface area. Design it now; implement in 1b.
#   4. COUNTER-ARGUMENT: if Adam specifically requires multi-session continuity for the Sep
#      pilot, this decision must be reversed. Perry does not know Adam's exact session plan.
#      OPEN QUESTION: see clarifying-questions-for-adam.md Q9.1.
#
# Schema note: even if deferred from the UI/runtime, the data model stubs MUST be designed now
# so the schema is not broken when 1b is built. Flag to Ido.

### Must (Phase 1b -- fast-follow)
- APS-REQ-152: Shared base persona per course: teacher defines/selects a base persona; multiple
  students begin from the same starting state.
- APS-REQ-153: Student-specific branching: first interaction creates a unique StudentPersona
  record (student_id x persona_id). Subsequent sessions continue from that branch.
- APS-REQ-154: Structured history per StudentPersona (JSONB in PostgreSQL): session summaries;
  evolving formulation; therapy goals; homework given/discussed; symptom change; patient internal
  process change; alliance/trust level; notable student mistakes; patient avoidance/resistance;
  important therapeutic themes; significant engagement shifts.
- APS-REQ-155: History used at session start: simulation runtime reads StudentPersona history
  and passes it into the patient-persona prompt context to ensure coherent continuity.
- APS-REQ-156: Persona development driven by student behaviour: trust, openness, resistance,
  symptom state updated per session based on interaction quality (strong work -> more openness;
  avoidance -> material unprocessed; poor attunement -> alliance effects). Preserved as
  structured state, not free text only.
- APS-REQ-157: Lecturer/admin visibility: authorised staff can inspect full longitudinal history
  of any student-persona pair. Supports supervision and assessment.
- APS-REQ-158: Reset option: course staff can reset a student-persona history to base state
  (session 1 restart). Audit log entry required.
- APS-REQ-159: Fork option: course staff can branch from any prior session point; creates
  an alternative StudentPersona branch. Original preserved.
- APS-REQ-160: Data retention: StudentPersona history retained 12 months, then delete or
  archive per platform data-retention policy. Retention period configurable by System Admin.
- APS-REQ-161: Educational boundary enforcement: all UI surfaces label continuing personas as
  "simulated educational patient." History must NOT be treated or displayed as a clinical record.
  System must not output anything suggesting real clinical status.

### Should (Phase 1b)
- APS-REQ-162: Teacher control of continuation: course-level toggle (one-off session vs
  continuing persona). Students cannot set this.
- APS-REQ-163: Compare therapeutic paths: view two StudentPersona branches side by side
  (teaching / remediation use case).

### Won't (Phase 1b; Phase 2+)
- APS-REQ-164: Automated cross-student pattern analysis on persona history -> Phase 2
  (vector/RAG layer).
- APS-REQ-165: Embedding-based similarity search across StudentPersona histories -> Phase 2.

---

## 18. Additional Items: QA

### Must
- APS-REQ-137: QA failure simulation tools: blocked/denied mic, lost network, AI API timeout/failure, failed transcript save, invite-link auth failure, AI response failure. (LTI/grade-sync QA items move to Phase 1b.)
- APS-REQ-138: QA test categories: invite-link auth, diagnostic snapshot, support ticket creation, email routing, privacy redaction, academic safety flow, frontend recovery without data loss, dictation fallback, dashboard metrics, role/scope access, credit limit enforcement, hard-limit block.

---

## Internal Inconsistencies and Flags

### Flag 1: Storage stack -- REVISED 2026-06-28
See Section 0. PostgreSQL + Prisma + JSONB recommended for 1-Sep pilot. JSONB covers
Continuing Persona history at pilot scale without vector store. Vector/RAG deferred to Phase 2.
Flag to Ido for feasibility confirmation.

### Flag 2: Adam's MVP list scope
The HLD's own "MVP Must" list is 6-9 months of R&D. Pilot-minimal scope (Section PM below)
is Perry's cut for 9 weeks. Eco must present this trade-off to Adam explicitly.

### Flag 3: Grade return complexity -- RESOLVED 2026-06-28
Formative pilot; grade sync deferred to Phase 1b. See Section 15.

### Flag 4: Multilingual scope -- RESOLVED 2026-06-28
Hebrew day one; English also; Arabic later. See APS-REQ-082.

### Flag 5: Hosting and infrastructure
Pilot is Israel-based (confirmed). Platform cloud provider, data residency, and whether Adam's
institution has its own infra requirements: still open. Eyal + Rambo must clear before infra
selection. Flagged to Eco.

### Flag 6: Clinical scope and safety review
Clinical-adjacent training data + student PII (Israel-based) = Israeli Privacy Protection Law
minimum. Continuing Persona history (12-month retention) amplifies this. Eyal must review
before any data is stored. Flag to Eco for Legal engagement.

### Flag 7: Continuing Persona -- pilot inclusion decision is OPEN
Perry recommends Phase 1b (not 1-Sep). But if Adam requires multi-session continuity from
day one (e.g., Sep cohort runs across multiple weeks, continuity is the point), the call
reverses and timeline risk escalates. Eco must clarify with Adam before R&D scoping.

---

## PM. Pilot-Minimal Scope (1 September 2026 credible target -- Perry assessment 2026-06-28)

9-week window. Concrete and opinionated. This is what can ship if R&D starts this week.

| IN (pilot-minimal) | OUT (Phase 1b or later) |
|--------------------|-------------------------|
| Secure invite link auth (no LTI) | Canvas/Moodle LTI |
| Email/access-code login | Grade sync |
| Org hierarchy: College, Course, Student Attempt (stubs for Programme) | Programme / College dashboards |
| RBAC: Student, Teacher, System Admin | Programme Manager, College Manager, Support Staff UI |
| One institution (Gome Gevim), 1-3 courses | Multi-institution |
| Hebrew + English (RTL rendering for Hebrew) | Arabic |
| Guided case authoring: structured builder + ground-truth file | Advanced authoring studio, quality checker, preview |
| Core competency library (platform-seeded, no governance workflow) | Competency approval workflow |
| AI patient engine: text, dynamic state, ground-truth enforcement, disclosure rules | Patient audio, continuing persona (Phase 1b) |
| Rubric builder: semi-auto + teacher edit + version lock | Rubric marketplace |
| Evaluation engine: structured scoring + transcript highlights + student feedback view | Remediation content library |
| Debrief chat (guardrailed, transcript-only) | Longitudinal analytics |
| Teacher dashboard: completion status, rubric heatmap, transcript access | Programme + college dashboards |
| Student dashboard: session history, feedback, debrief history | Advanced charts |
| Deterministic tech support + email escalation + ticket | LLM support, SLA management |
| Academic safety: attempt status + teacher notification | Full audit reporting |
| Credit/token management: college + course allocation, soft/hard limits, admin UI, audit log | Student credits, billing, cross-institution pooling |
| Cost monitoring: UsageLog per attempt, basic cost alert | Full credit ledger UI (beyond admin controls above) |
| PostgreSQL + Prisma + JSONB + Redis + S3 | MongoDB / vector store |
| PersonaBranch + StudentPersonaHistory SCHEMA (data model only, no runtime) | Continuing persona runtime + UI (Phase 1b) |

SCHEDULE RISK: AI patient engine quality is the single biggest risk. Prompt engineering,
ground-truth enforcement, and state tracking cannot be parallelised. If this is not production-
quality by mid-August, the Sep pilot will be embarrassing. Mitigation: R&D must start on the
patient engine this week; everything else is secondary. Perry recommends Eco agree with Ido on
a mid-August internal rehearsal with real users as the checkpoint. If that rehearsal fails,
advise Adam of a 4-6 week slip to Phase 1b parity.
