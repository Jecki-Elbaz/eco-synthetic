# Sprint 7 Independent Review -- Oren
# Round 1 | 2026-07-13 | Requester: Eco (CEO), standing quality gate
# Scope: Sprint-7 changes (retention, access posture, DSR delete, content sanitizer,
#        arc-context cache) vs envelope + Eyal privacy-note requirements
# PROVENANCE: Oren delivered in-session (Write scope excludes this path); Eco
# persisted as review of record. Fix status appended at bottom. NOTE: this review
# took three runs to land (session-limit kill, then a stall, then a tight-scope
# retry with a fixed 9-file reading list) -- content below is from the third run.

## VERDICT: APPROVE-WITH-CONDITIONS
0 BLOCKER | 1 MAJOR | 4 MINOR | 2 INFO

## MAJOR

MAJOR-1 -- simulation.service.ts deleteStudentData -- SupportTicket rows with
attemptId = null survive the DSR delete. SupportTicket carries BOTH attemptId
(nullable FK) and userId (plain string); the delete was attemptId-scoped only, so a
student's general tickets (filed with no attempt) persist -- a DSR-audit data
completeness defect. No runtime crash (userId has no FK to User). Not
pilot-blocking (synthetic data); must fix before real students. FIX: userId-scoped
supportTicket delete (strict superset). dsr.spec D3 does NOT catch this class of gap
(it checks no OTHER-user contamination, not full coverage of the target user's rows
across every FK path).

## MINOR

MINOR-1 -- sanitizer comments imply PII inspection; code enforces length only. The
"no student PII beyond userId" guarantee is a source-restriction claim (contextSummary
provenance), not content inspection. Comments (method + schema) must say so before
real students (Eyal item 5 asked for content-scope confirmation).
MINOR-2 -- arc-writer-s7.spec C1-C7 assert the CREATE arm only for the 2000-char
cap; UPDATE arm unasserted (code correct: single variable both arms). = Adi FLAG-1.
MINOR-3 -- dsr.spec is fully mocked; FK ordering + real transaction behavior untested.
One live-DB integration test needed before real students; its seed should include a
SupportTicket with attemptId = null to regression-guard MAJOR-1. = Adi FLAG-2.
MINOR-4 -- cache eviction lines (finishAttempt + hardLimitReached) have zero direct
test coverage; M3 evicts by hand. Rated MINOR (vs Adi MODERATE): risk is silent
memory growth in a long-lived process, not data corruption; negligible for pilot.
= Adi FLAG-3.

## INFO

INFO-1 -- arcContextCache evicts on COMPLETED only; ABANDONED / TECHNICALLY_AFFECTED /
TECHNICAL_FAILURE_CONFIRMED / RETRY_AUTHORISED never evict -> unbounded-growth
potential in a long-running production process. Acceptable for pilot per envelope
ruling; pre-production cache design review item.
INFO-2 -- runAuthorPreview sets COMPLETED without cache.delete -- benign no-op
(preview never populates the cache); documentation-consistency note only.

## Q-RESULTS (envelope-required)

Q1 DSR FK safety: order correct; all six Attempt children (Message, PatientStateLog,
Evaluation, DebriefChat, UsageLog, SupportTicket) confirmed in schema, none cascade,
all deleted before Attempt. Zero-attempt user safe. Where clauses fully isolated to
the target userId. Gap = MAJOR-1 (null-attemptId tickets).
Q2 CreditEntry: NO attempt/user FK exists on CreditEntry (only ledgerId ->
CreditLedger; "attempt:<id>" appears only as plain text in reason). No dangling FK,
no constraint violation possible; audit-trail survival is correct. NOT a blocker.
(Independently pre-verified by Eco from the schema, same conclusion.)
Q3 Retention: retainUntil = sessionCompletedAt + 90*24*60*60*1000 ms (exactly 90
days); finishedAt ?? now() fallback valid; both upsert arms use the same variable
(R1/R3 cover both). Migration TIMESTAMP(3) consistent. Sound.
Q4 Cache: eviction present at BOTH completion sites (hardLimitReached + finishAttempt).
Cross-session staleness impossible (key = attemptId UUID; new session = new attempt).
Growth bound: pilot-acceptable; ABANDONED gap = INFO-1.
Q5 Sanitizer: applied on both upsert arms via one computed variable; length-only --
honesty gap = MINOR-1.
Q6 Adi flags: FLAG-1 concur (non-blocking); FLAG-2 concur + extend (seed must cover
MAJOR-1 case); FLAG-3 concur at MINOR severity; gate call to Ido.

## CONDITIONS FOR CLOSE
1. Track MAJOR-1 + FLAG-2 as pre-real-student blockers (one integration test seed
   covers both). 2. MINOR-1 comment before real students. 3. MINOR-2/-4 carry as
   follow-up.

## FIX STATUS (Eco, 2026-07-13, same session -- all conditions closed at close, not carried)

- MAJOR-1: FIXED in code -- supportTicket delete now userId-scoped (strict superset),
  PLUS the linked DiagnosticLog rows are swept (Eco extension: tickets' diagnosticLogId
  rows have no user/attempt FK of their own and would orphan). Tests D6 + D7 added.
- MINOR-1: FIXED -- honesty note added to sanitizeNotableMoments docblock AND the
  schema.prisma field comment (length-only enforcement; PII claim = source restriction).
- MINOR-2: FIXED -- test C8 asserts the UPDATE arm cap + create/update parity.
- MINOR-4: FIXED -- test M5 exercises the REAL eviction path (finishAttempt with mock
  Prisma -> cache.has() false -> re-query proves re-load).
- MINOR-3 (live-DB DSR integration test): REMAINS OPEN as the pre-real-students item,
  tracked on board APS-022 (seed must include an attemptId=null SupportTicket).
- INFO-1: tracked as pre-production cache review (with Oren S5 m5 family).
- Post-fix gate (Eco, independently run): api tsc 0; nest build 0; api unit 305/0-fail/
  8-skip (22 suites, +4 new tests); integration 8/8 78/0-fail/2-skip; E2E 34/34 on
  restarted post-fix dist + fresh seed; engine 212/212; web 43/43 + tsc 0.
