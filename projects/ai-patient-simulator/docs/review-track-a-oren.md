# Track A Code Review -- Oren (Senior Developer, independent reviewer)

Reviewer: Oren (Senior Developer, L4)
Date: 2026-07-09
Round: 1 of 2
Ref: track-a-task-envelopes-ido-2026-07-09.md (all addenda) + qa-track-a-signoff-adi-2026-07-09.md
Files read: all 18 in-scope source files + migration + E2E + 2 test suites

---

## OVERALL VERDICT: APPROVE-WITH-CONDITIONS

Automated gate is green (23/23 E2E, 205/213 api units, 208/208 engine, tsc clean).
No blockers. Sprint may close. Five conditions must fold into Track B before it opens.
One major finding (stale .js artifact) is carried from Gal + Adi; I confirm and escalate
the priority. One new major finding (UsageLog eventType mismatch vs spec) requires Ido
clarification before Track B audit analysis is run.

---

## Area 1: Dashboard (dashboard.service.ts + controller + module)

VERDICT: APPROVE-WITH-CONDITIONS

Finding 1
SEVERITY: major
File: apps/api/src/dashboard/dashboard.service.ts:393-399
WHY: getClassDashboard queries attempts by `assignmentId + userId IN enrolments` with no
filter on `type`. If a teacher user happens to be enrolled as a student in the same course,
their AUTHOR_PREVIEW attempt appears in the cohort map (latestByUser) and surfaces on the
teacher class view. The envelope requires AUTHOR_PREVIEW to be invisible in all
student-facing views; the class view is not filtered.
At pilot scale (2 staff, no teacher is also enrolled as student) the risk is near zero.
But the fix is one line and should land before Track B.
PATCH NOTE: in the getClassDashboard attempt query (line 393), add
`type: { not: "AUTHOR_PREVIEW" }` to the where clause, consistent with the
getStudentDashboard filter at line 249.

Finding 2
SEVERITY: minor
File: apps/api/src/dashboard/dashboard.service.ts:340-333
WHY: getStudentDashboard grants a teacher access to a student's dashboard as long as the
student is enrolled in any course the teacher teaches (lines 230-239). The returned data
includes ALL the student's completed simulations and debrief history across ALL their
courses, not just the teacher's course. A teacher of course A sees data from course B.
This may be an intentional holistic-support design choice but is not stated in the spec.
PATCH NOTE: if cross-course visibility is not intended, add a post-filter to
`completedSimulations` to include only attempts whose `assignment.courseId` is in the
teacher's own taught courses. Flag the design intent to Ido before deciding.

Finding 3
SEVERITY: minor
File: apps/api/src/dashboard/dashboard.service.ts:405
WHY: `const actor = await this.prisma.user.findUnique({ where: { id: actorId } })` fires
an extra DB round-trip per class-dashboard request to fetch the actor's displayName.
The actor displayName is already in the JWT (or can be cached). Minor perf concern only.
PATCH NOTE: either read actor.displayName from the JWT payload passed to the service, or
include the actor in the same query batch. Not urgent.

---

## Area 2: Simulation changes -- transcript, preview controller, runAuthorPreview

VERDICT: APPROVE-WITH-CONDITIONS

Finding 4
SEVERITY: major
File: apps/api/src/simulation/simulation.service.ts:93
WHY: The envelope spec (Envelope Gal, item D, and the QA unit-spec requirement) states:
  "STUDENT turn: UsageLog entry emitted with activity_type=STUDENT_TURN (regression --
   must not change)."
The code sets `usageLogEventType: "SIMULATION_TURN"` for student turns. The regression
test (STUDENT_TURN_LOG in author-preview.spec.ts:421-434) also asserts "SIMULATION_TURN",
so the test verifies the code, not the spec.
Two possible explanations:
(a) "SIMULATION_TURN" was the pre-existing value before this sprint and the spec
    description had a naming error. In that case, code is correct and spec needs correction.
(b) The value was changed from "STUDENT_TURN" to "SIMULATION_TURN" in this sprint, and
    the spec is correct. In that case, code is wrong and audit logs are mislabeled.
I cannot determine which without git history. This touches Rambo M18 audit-log semantics.
PATCH NOTE: Ido must clarify which value is canonical. If (a): update the spec/envelope
to say "SIMULATION_TURN". If (b): revert code to "STUDENT_TURN" and update the test.
Do not close this finding without Ido decision on record.

Finding 5
SEVERITY: minor
File: apps/api/src/simulation/simulation.service.ts:389-396
WHY: The envelope item C states "On all-turns-complete, triggers existing evaluation
pipeline (same path as real student finish)." The implementation does not trigger
evaluation after the preview loop completes. runAuthorPreview marks attempt COMPLETED and
returns attemptId; no evaluation call is made.
The FeedbackScreen isPreview branch (FeedbackScreen.tsx:258-284) handles this gracefully
by rendering transcript-only when evaluation is absent. Adi's E2E does not check for
evaluation presence in the preview result.
Risk: authors see only the transcript from a preview run, not the rubric scores or
highlights that would confirm the guard and evaluator are working correctly.
PATCH NOTE: Either (a) call the evaluation trigger inside runAuthorPreview after the loop,
or (b) explicitly descope auto-evaluation from preview (update spec and FeedbackScreen
help text). Requires Ido decision before Track B.

Finding 6
SEVERITY: minor
File: apps/api/src/simulation/simulation.service.ts:291-296 + 392-394
WHY: When runPipelineTurn sets hardLimitReached=true (turn count hits assignment.maxTurns),
it immediately marks the attempt COMPLETED and sets finishedAt (lines 291-296). Then the
runAuthorPreview loop breaks and unconditionally calls attempt.update(COMPLETED, finishedAt)
again (lines 392-394). The second update is idempotent but wastes a DB round-trip and is
semantically confusing.
PATCH NOTE: In runAuthorPreview, check the break condition before the final update:
  if (turnResult.hardLimitReached) { ... already marked COMPLETED in pipeline ... }
  else { await prisma.attempt.update(COMPLETED) }
Or refactor runPipelineTurn to not update status internally when bypassCreditCheck=true.

Finding 7
SEVERITY: minor
File: apps/api/src/simulation/preview.controller.ts:29-32
WHY: PreviewDto uses @IsIn(["COMPETENT", "WEAK", "TYPICAL"]) on the `profile` field.
This validation fires only if NestJS ValidationPipe is active globally or applied at the
controller/handler level. No @UsePipes is declared on PreviewController or its handler.
If ValidationPipe is not globally registered, any string value reaches the service.
In SimulationService.runAuthorPreview, StudentBotProvider uses SEQUENCES[profile]; an
unknown profile key returns undefined, and sequence[0 % undefined.length] throws a
TypeError that surfaces as an unhandled 500.
PATCH NOTE: Confirm ValidationPipe is registered globally in main.ts (useGlobalPipes).
If it is, add a comment to PreviewController pointing to that registration. If it is not,
add @UsePipes(new ValidationPipe({ whitelist: true })) to the controller or handler.

Finding 8 (Rambo M18 -- transcript no-leakage, confirmed)
SEVERITY: info
File: apps/api/src/simulation/simulation.service.ts:520-558
WHY: getTranscript fetches only the Message table (role, turnNumber, originalText, sentAt).
Response shape is { turnIndex, studentInput, patientResponse, timestamp }. No ground truth,
no persona prompt, no system prompt field is accessible from the Message model.
E2E step 21 confirms noLeak=true. CONFIRMED CLEAN.

Finding 9
SEVERITY: minor
File: apps/api/src/simulation/preview.controller.ts:48-60 (also org.controller.ts:84-89)
WHY: The RBAC check for AUTHOR_PREVIEW is role-level (TEACHER or SYSTEM_ADMIN anywhere in
the system) but not scope-limited to the assignment's course. Any teacher in the system
can run a preview for any assignment, even one they do not teach. Same pattern in
OrgController createAttempt (line 86-88).
At pilot scale (2 staff, 1 course) this is fine. At production scale it leaks preview
capability across the institution.
PATCH NOTE: For Phase 1b, add a course-scoped check: load the assignment's courseId, then
verify the actor has TEACHER role scoped to that courseId before proceeding. Not urgent
for pilot but log as a known gap.

---

## Area 3: Engine -- StudentBotProvider + input-gate

VERDICT: APPROVE

Finding 10 (tech-debt, escalated to Ido)
SEVERITY: major
File: packages/engine/src/pipeline/input-gate.js
WHY: Stale compiled .js file exists alongside input-gate.ts in src/. Jest resolves .js
before .ts (moduleFileExtensions order). The file was patched in-place for this sprint
(bypassCreditCheck logic matches the .ts). BUT any future .ts change to any
pipeline/*.ts file ALSO requires a manual sync to the .js artifact, or tests silently run
stale code. The defect is invisible -- tests appear green while executing the wrong binary.
This is the root cause of the I1/I2 test failures Gal encountered and fixed. Gal flagged
it; Adi flagged it as F2 (MEDIUM). I am escalating to MAJOR and recommending it be
required before Track B opens, not deferred.
PATCH NOTE: Run `git rm packages/engine/src/pipeline/*.js` (check for other stale .js
files in src/ beyond input-gate.js). Alternatively, add a jest `modulePathIgnorePatterns`
entry to ignore *.js in engine/src/pipeline/. Requires Ido A2 to schedule and owner
commit. Track B must NOT open with stale .js artifacts present.

StudentBotProvider: 3 profiles, 6 turns each, >= 2 violations spread per profile
confirmed by code reading. Determinism via static SEQUENCES constant confirmed.
Modulo wrap behavior is correct and safe for preview use (only 6 turns run). CLEAN.

InputGate bypassCreditCheck: flag is optional (falsy = check runs). Credit gate is first
check. Comment clearly states UsageLog is caller's responsibility. Rambo M18 comment
present. CLEAN.

input-gate.js patched version confirmed to match .ts (line 27 of .js matches line 57 of
.ts). Current sprint is safe; future sprints are at risk until .js files are removed.

---

## Area 4: OrgController + migration

VERDICT: APPROVE-WITH-CONDITIONS

Finding 11
SEVERITY: minor
File: packages/db/prisma/migrations/20260709053549.../migration.sql:3
WHY: The migration bundles an unrelated column addition:
  `ALTER TABLE "CreditEntry" ADD COLUMN "deduction_reason" TEXT;`
This column is referenced in the schema (schema.prisma:479) and appears to be a prior
audit-trail requirement (APS-REQ-139), but it is not part of the Track A envelope items
A-F. Bundling unrelated schema changes in a sprint migration increases rollback blast
radius. Not a correctness issue; the column is nullable and safe.
PATCH NOTE: For future sprints, keep migrations scoped to the envelope items. If
deduction_reason was pre-existing tech-debt, add a comment to the migration explaining
the bundling.

OrgController AUTHOR_PREVIEW guard (lines 84-98): manual role check in handler, not a
declarative guard. Pattern is consistent, logic is correct. CreateAttemptDto uses @IsIn
on the type field -- same ValidationPipe dependency as Finding 7 applies here. MINOR.

---

## Area 5: Web -- AuthProvider, preview-client, evaluation-client, AuthoringShell,
##           FeedbackScreen

VERDICT: APPROVE-WITH-CONDITIONS

Finding 12
SEVERITY: minor
File: apps/web/src/components/authoring/AuthoringShell.tsx:176-199
WHY: The "Run Preview" button (line 197, label "Harz tatzuga mkdimit") is rendered
whenever `template !== null`, with no frontend role check. Per the envelope: "Button:
only visible to TEACHER or SYSTEM_ADMIN roles. Hidden for student role." Students who
somehow reach the authoring URL would see the button. Clicking it returns a 403 from the
API (correct), but the UX is wrong and confusing.
The authoring shell is not linked from the student navigation, so the practical risk is
low. The API enforces the gate.
PATCH NOTE: Read `user.scopes` from useAuth() and conditionally render the button only
when `scopes.some(s => s.role === "TEACHER" || s.role === "SYSTEM_ADMIN")`.

Finding 13
SEVERITY: minor
File: apps/web/src/components/feedback/FeedbackScreen.tsx:35-36
WHY: FeedbackScreen receives isPreview as a prop. The prop must be derived from the
`?preview=1` URL param in the feedback page component (/app/feedback/[attemptId]/page.tsx
or equivalent). That file was not in the review scope and was not confirmed.
If isPreview is not wired from the URL, the preview banner and the graceful
evaluation-absent branch will not fire for preview runs.
PATCH NOTE: Confirm /feedback/[attemptId]/page.tsx reads `searchParams.preview` and
passes `isPreview={searchParams.preview === "1"}` to FeedbackScreen. Request Noa to
confirm or provide the page file for next-round review.

Finding 14 (logout, confirmed)
SEVERITY: info
File: apps/web/src/lib/auth/AuthProvider.tsx:162-166
WHY: logout() calls clearToken() -> setUser(null) -> router.replace("/login").
localStorage is cleared synchronously first; navigation fires before any re-render.
router.replace (not push) prevents back-button return to authenticated state.
Envelope requirement "must redirect on first click" is satisfied. CLEAN.

Finding 15 (transcript turn-number mapping, confirmed)
SEVERITY: info
File: apps/web/src/lib/evaluation-client.ts:166-176
WHY: fetchTranscriptReal maps API `turnIndex` (1-based) to display turn numbers:
STUDENT = turnIndex*2-1, PATIENT = turnIndex*2. This gives correct alternating
STUDENT/PATIENT sequence for TranscriptPanel. No mock fallback on real API error
(ApiError propagates). Envelope requirement met. CLEAN.

Finding 16 (preview-client token safety, confirmed)
SEVERITY: info
File: apps/web/src/lib/preview-client.ts
WHY: runPreview and fetchAssignmentsForTemplate use authedGet/authedPost from the
shared http helper. No token is exposed in the response type { attemptId: string }.
encodeURIComponent applied to assignmentId in URL. CLEAN.

---

## Findings Summary

| # | Severity | Area | Short description |
|---|----------|------|-------------------|
| 1 | major | Dashboard | getClassDashboard: no AUTHOR_PREVIEW filter |
| 2 | minor | Dashboard | Teacher sees student data across all courses |
| 3 | minor | Dashboard | Extra actor user query per class-dashboard request |
| 4 | major | Simulation | UsageLog eventType "SIMULATION_TURN" vs spec "STUDENT_TURN" |
| 5 | minor | Simulation | No auto-evaluation trigger after preview loop |
| 6 | minor | Simulation | Double COMPLETED update when hardLimitReached fires mid-loop |
| 7 | minor | Simulation | PreviewController validation depends on unconfirmed global ValidationPipe |
| 8 | info | Simulation | Transcript no-leakage confirmed CLEAN |
| 9 | minor | Simulation | Preview RBAC not scope-limited to assignment's course |
| 10 | major | Engine | Stale .js files in engine/src/pipeline/ (tech-debt, escalated) |
| 11 | minor | DB/Migration | Unrelated CreditEntry column bundled in Track A migration |
| 12 | minor | Web | AuthoringShell preview button shown without role check |
| 13 | minor | Web | isPreview prop wiring in feedback page not confirmed |
| 14 | info | Web | Logout CLEAN |
| 15 | info | Web | Transcript turn mapping CLEAN |
| 16 | info | Web | Preview client token safety CLEAN |

Blockers: 0
Major: 3 (findings 1, 4, 10)
Minor: 8 (findings 2, 3, 5, 6, 7, 9, 11, 12, 13)
Info: 3 (confirmed clean)

---

## Conditions for Gal/Noa -- next sprint

These must be folded into the first Track B prep sprint or handled as immediate fixes.
The sprint gate Ido must adjudicate:

C1. Ido to rule on Finding 4 (UsageLog eventType): confirm "SIMULATION_TURN" is
    canonical and update spec, OR revert code to "STUDENT_TURN" and update test.
    Rambo M18 audit compliance depends on this answer.

C2. Remove stale .js files from packages/engine/src/pipeline/ before Track B opens.
    git rm the files; owner commits. Required -- not optional. (Finding 10)

C3. Add `type: { not: "AUTHOR_PREVIEW" }` to getClassDashboard attempt query.
    One-line fix; no migration needed. (Finding 1)

C4. Confirm global ValidationPipe covers PreviewController and OrgController.
    If not, add @UsePipes at the controller level. (Finding 7)

C5. Confirm isPreview prop wiring in feedback page or provide the page file for
    round-2 review. (Finding 13)

---

## Tech-debt flags to Ido (per role mandate)

TD-001: Stale .js artifacts in engine/src/pipeline/ -- current sprint patched; systemic
  risk remains. Every future pipeline .ts change requires manual .js sync or tests run
  wrong code silently. Severity: high. Action before Track B.

TD-002: Preview RBAC not course-scoped (Findings 9 and OrgController). Acceptable at
  pilot scale; must be addressed before multi-college rollout (Phase 1b).

TD-003: No auto-evaluation trigger in runAuthorPreview (Finding 5). Authors currently
  see transcript only in preview mode. Requires design decision (auto-trigger vs manual)
  before the 15-Aug rehearsal criterion is tested end-to-end.

---

## Release gate note

Oren does not hold go/no-go authority. This review is input for Ido.
Recommendation: sprint closes green on automated gate. Conditions C1-C5 are pre-Track-B
requirements, not sprint blockers. Ido must adjudicate C1 (audit log value) before any
audit-log analysis runs against Track A data.

*Oren (Senior Developer, L4) | 2026-07-09 | Round 1*

---

## Addendum: Ido rulings | 2026-07-09

**Finding 4 -- UsageLog eventType (spec-side correction; code stands).** Eco confirmed via git that "SIMULATION_TURN" exists at HEAD pre-sprint (commit c086027) and the field was not changed this sprint. Oren's explanation (a) is correct: the envelope's "STUDENT_TURN" wording was a naming error in my spec, not a regression in the code. Ruling: "SIMULATION_TURN" is the canonical value for student turns; "SELF_SIMULATION" is canonical for bot-generated preview turns. Code stands. Test stands. Update envelope item D (both in the task envelopes file) to read "activity_type=SIMULATION_TURN for student turns, SELF_SIMULATION for bot turns." Rambo M18 is satisfied -- the audit log emits consistently under the correct label throughout.

**Finding 2 -- Teacher cross-course student visibility (defer to APS-013).** Cross-course visibility was not explicitly designed -- it is a scoping gap, not an intentional holistic-support choice. At pilot scale (2 staff, 1 course) the blast radius is zero and the fix is not worth a sprint slot. Ruling: do not fix in this sprint or in a standalone hardening item; fold the course-scoped filter on getStudentDashboard into APS-013 (which already tracks per-teacher template scope before multi-college deploy). The same multi-college gate applies to both. APS-013 owner (Gal) to note this addition.

**Finding 5 -- No auto-evaluation trigger after preview loop (option a; fix before 15-Aug rehearsal).** The feasibility doc Section 2 states the author sees "the full transcript + evaluation output." Adam's stated requirement is identical. The 15-Aug rehearsal criterion (i) explicitly reads "Author-preview completes a full run + evaluation in AUTHOR_PREVIEW mode." No auto-eval trigger means criterion (i) cannot be verified. Ruling: option (a). Gal adds a single evaluation-trigger call inside runAuthorPreview after the turn loop completes, reusing the existing evaluation pipeline path -- same call that runAttemptFinish uses. This is a one-call addition, not a sprint re-opener; tag it Track-A-fix-001 and fold into the current commit batch before the rehearsal session. FeedbackScreen already handles the evaluation-present branch; no front-end change needed.

**Finding 9 -- Preview RBAC not course-scoped (fold into APS-013; no new item).** Role-level RBAC on preview is acceptable at single-college pilot scale. The gap is structurally identical to the ownerUserId/courseId gap on SimulationTemplate that APS-013 already tracks. Ruling: no separate board item; fold course-scoped preview RBAC check (both PreviewController and OrgController createAttempt) into APS-013 scope. Gal (APS-013 owner) to note it. Blocking gate: before any multi-college deploy.

*Ido (VP R&D) | 2026-07-09 | A3 intra-R&D rulings*
