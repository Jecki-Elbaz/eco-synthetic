# Privacy Note: ArcSessionSummary Table
# Author: Eyal (Legal, L3)
# Date: 2026-07-11
# Scope: Sprint 5 schema addition -- ArcSessionSummary (per-student arc state)
# Prior ruling context: docs/gate-legal-privacy-eyal.md (APS-004, 2026-06-29)
# Status: NOTE -- not a gate clearance; no new tool adopted

---

## Context

Sprint 5 added model ArcSessionSummary to packages/db/prisma/schema.prisma. Fields
confirmed by direct read of the file:

  userId, templateId, sessionNumber (unique triplet)
  trustDeltaApplied, finalTrustLevel, finalOpennessLevel, finalAllianceLevel (Float)
  symptomMarkerState (Json -- unlockedFactIds from last PatientStateLog, pilot proxy)
  notableMomentsSummary (String -- contextSummary from last PatientStateLog, default "")
  sessionCompletedAt, createdAt, updatedAt

The schema comment notes that this table is "scope-equivalent to StudentPersonaHistory
(per-student arc state)" and was created separately to avoid activating the Eyal-gated
Phase 1b stub. The comment also states that Eyal review scope should cover both tables
before Phase 1b goes live.

Current exposure: NIL-to-LOW. StubProvider synthetic data only; no real student identifiers.

---

## Q1 -- Does notableMomentsSummary attract the same PPL concerns as
## StudentPersonaHistory.notableStudentMistakes?

YES, the same PPL regime applies. The field is tied to a real userId and contains free text
derived from the LLM-generated contextSummary at session end. Under Israeli PPL
(5741-1981 + Amendment 13), any free text that is linked to an identified individual and
describes their behavior in a context that bears on their professional training is personal
data. The "notable moments" label is neutral in intent; the actual content, however, may
include student behavioral descriptions, errors, or patient-state changes triggered by
student actions -- equivalent in substance to what the StudentPersonaHistory fields capture.

The distinction from notableStudentMistakes is one of framing, not legal category. The
schema defines notableMomentsSummary as contextSummary from the last PatientStateLog -- this
is an LLM-generated session narrative, not a curated mistakes log. That makes the
sensitivity level SIMILAR but the content less targeted than an explicit "mistakes" record.

Practical consequence: notableMomentsSummary must be treated under the same PPL data
minimization, access control, and retention rules as StudentPersonaHistory. It is not a
lower-sensitivity field merely because it is labeled "moments" rather than "mistakes."

One additional flag: the schema has no access-control annotation on ArcSessionSummary
(unlike StudentPersonaHistory, which carries the PII-HIGH comment and TEACHER + SYSTEM_ADMIN
restriction). This gap must be closed before real student data is written to this table.

---

## Q2 -- Retention recommendation

No retention policy is defined on ArcSessionSummary. The table has no retainUntil field
and no equivalent of the StudentPersonaHistory pattern.

Recommendation: align to the APS-004 ruling. Retention = end of course (or arc completion,
whichever is earlier) + 90 days. Rationale:

- The functional purpose of ArcSessionSummary is to carry arc state from session N to
  session N+1. That purpose expires when the arc completes (all sessions done).
- 90 days post-completion allows grade finalization, evaluation review, and exercise of
  student data-subject rights (access, correction, deletion under Israeli PPL).
- Retaining beyond end-of-course + 90 days requires a documented legitimate purpose and is
  not supported by the current requirements baseline.

Implementation note: the table currently has no retainUntil column. A retainUntil DateTime
field (nullable; set at arc completion) should be added in the next schema revision, or a
service-layer purge job scoped to this table should be designed before real students onboard.
This is not a current blocker (synthetic data only) but must be resolved before go-live.

---

## Q3 -- Blocking now vs required before real students

BLOCKING NOW: NO.

Current data in ArcSessionSummary is synthetic (StubProvider). No real userId values, no
real student behavioral content. The table can be used in the current synthetic pilot
without a legal stop.

REQUIRED BEFORE REAL STUDENTS (ordered by urgency):

1. Retention policy: define retainUntil logic (end-of-course + 90d) and implement at the
   service or schema layer. This is a schema/service design task, not an A1 item.

2. Access controls: add explicit access restriction annotation to ArcSessionSummary
   (TEACHER + SYSTEM_ADMIN only; not student-raw-accessible; not cross-institution).
   Mirror the StudentPersonaHistory PII-HIGH designation. Application-layer enforcement
   required (same as existing AuthService scope checks).

3. Consent mechanism: the APS-004 ruling requires informed consent before any real student
   data is collected. ArcSessionSummary rows are covered by that requirement. The consent
   mechanism must reference what arc-session data is retained and for how long.

4. Data-subject rights: the student deletion pathway (APS-004 Section 2.6) must cover
   ArcSessionSummary rows. If a student exercises deletion rights, rows keyed to their
   userId in this table must be deletable.

5. notableMomentsSummary content scope: before real students, the product team should
   confirm whether ArcWriterService populates this field with session-level narrative only
   (patient state changes, arc progression) or whether student behavioral annotations are
   included. If the latter, data minimization requires either: (a) stripping identifiable
   student-behavior content from the summary, or (b) applying the same access-control and
   retention treatment as notableStudentMistakes in StudentPersonaHistory.

None of items 1-5 require owner A1. They are engineering and schema decisions within the
existing APS design scope. No new tool adoption, no external commitment.

---

## Connection to prior rulings

This note extends APS-004. The APS-004 BLOCKING finding on StudentPersonaHistory was
triggered by the "notable mistakes" field + 12-month retention. ArcSessionSummary
introduces equivalent per-student arc state through a different code path. The schema
comment acknowledges this ("scope-equivalent"). This note confirms that the APS-004 PPL
regime covers ArcSessionSummary and sets the same pre-go-live conditions.

When Phase 1b activates StudentPersonaHistory, Eyal review must cover both tables jointly
as the combined per-student state model.

---

## Document control

Internal only. Not for external sharing without owner A1.
Next step: share with Gal (schema owner) and Ido (R&D lead) via Eco; items 1-5 above are
implementation tasks. No owner A1 action triggered by this note.
