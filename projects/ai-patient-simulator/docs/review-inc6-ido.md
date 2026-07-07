# Code Review -- APS Sprint 2 Increment 6
# Reviewer: Ido (VP R&D)
# Date: 2026-07-04
# Scope: case-authoring endpoints + student/teacher dashboards

---

## VERDICT: APPROVE-WITH-CONDITIONS

All Blockers below must close before merge to main. Major items are tracked tasks,
not merge gates. Minor items are follow-up or nits.

---

## RBAC SCOPE-GAP RULING (question 5f)

ACCEPT FOR PILOT WITH A TRACKED SCHEMA TASK.

Rationale: the gap (any TEACHER can edit any template because SimulationTemplate
has no ownerUserId or courseId) is already documented in authoring.service.ts line 8.
For a single-college pilot with a small instructor cohort the blast radius is
contained. Role-level enforcement (TEACHER/SYSTEM_ADMIN only) is in place and
tested. The fix requires a schema migration and is non-trivial to retrofit without
disrupting existing template rows.

Condition: a task must be opened before this review is filed, not deferred to
"someday". Title: "APS-SCHEMA-xxx: add ownerUserId/courseId to SimulationTemplate
for per-teacher scope enforcement." Priority: P2 (before first multi-college deploy).

---

## BLOCKERS (merge gate -- must fix before merge to main)

### B1 -- Two-step GroundTruth creation has an unrecoverable orphan-GT window
Files: authoring.service.ts lines 123-153 (createTemplate), 204-231 (updateTemplate)

The three-step pattern (create GT with simulationTemplateId="PENDING", create
template, update GT with real templateId) has a failure mode at step 2 and step 3
that leaves orphaned data:

- If createTemplate fails at step 2 (simulationTemplate.create), the GT row with
  simulationTemplateId="PENDING" is committed and stays. No cleanup. The DB now has
  a dangling GroundTruth row with a permanent placeholder FK value. Repeated
  failures accumulate these rows silently.
- If the step-3 update (groundTruth.update) fails after the template was already
  created, the template exists referencing a GT whose back-reference still says
  "PENDING". The GT is in an inconsistent state: the FK from Template->GT is
  correct, but GT.simulationTemplateId is wrong. Any code that looks up GT by
  simulationTemplateId will not find it.

These are not hypothetical -- network timeouts, DB transient errors, or a crash
between steps will trigger exactly this.

Required fix: wrap all three operations in a Prisma interactive transaction
($transaction with a callback). Prisma supports nested creates with connect within
transactions. The cleanest pattern here is to create the GT and Template in a single
$transaction block. If the circular FK dependency prevents that in one statement,
use tx.groundTruth.create -> tx.simulationTemplate.create -> tx.groundTruth.update
inside a single $transaction callback so all three roll back together on any failure.

This is the same pattern needed in updateTemplate's inUse branch (lines 204-231) --
same three steps, same risk.

Severity: Blocker. The failure window is small per operation but there is no
recovery path and the "PENDING" rows will accumulate invisibly in production. The
fix is a known Prisma pattern and is not complex.

### B2 -- Student RBAC is never tested at the HTTP guard layer
File: apps/api/src/__tests__/authoring-rbac.spec.ts

The spec file title says "RBAC + business rule unit tests" and test (a) in the
header comment says "STUDENT cannot create template (controller-level guard test)".
Reading the actual test code: there is no test for (a). The spec covers (b) through
(k) -- all service-layer business rules -- but the RBAC item was not implemented.
There is no test anywhere that proves a request with a STUDENT-role JWT receives a
403 on any authoring endpoint.

The guard is in place (roles.guard.ts is correct; @RequiredRoles("TEACHER",
"SYSTEM_ADMIN") is applied at the controller class level). The gap is test
coverage, not implementation. But "RBAC tests actually prove students are blocked"
is a stated gate criterion for this review, and the answer is: they do not.

Required fix: add a test that mocks a STUDENT JWT (scopes: [{role:"STUDENT",
scopeId:"..."}]) against the controller with the guard active, and asserts 403 on
at least POST /authoring/templates and PATCH /authoring/rubrics/:id/criteria/:cid.
NestJS testing module with overrideGuard is the standard approach.

Severity: Blocker. The RBAC design is sound but unproven by test. A test gap on an
access-control boundary is not acceptable before merge.

---

## MAJOR (tracked tasks, not merge gates)

### M1 -- updateTemplate loses builder fields not present in the update DTO
File: authoring.service.ts lines 185-198

When a partial builder update arrives (e.g. only {title: "New Name"}), the service
recompose the persona prompt using fallback literals for fields not stored on the
SimulationTemplate row: primarySkill defaults to "general", patientStyle to
"neutral", presentingProblem to "", mode to "intake". These are not recovered from
the existing template because the Prisma model does not store them (they are not
columns on SimulationTemplate per the schema comments). The recomposed prompt is
therefore corrupted -- it replaces the original clinical values with generic
placeholders.

Impact: any in-place update of a template will silently degrade the persona prompt
unless the caller re-supplies all optional builder fields on every PATCH.

Fix options: (a) store primarySkill, patientStyle, presentingProblem, hiddenIssue,
mode as columns on SimulationTemplate so they can be recovered on partial update, or
(b) require the full builder payload on PATCH (breaking API change, simpler schema),
or (c) parse the existing personaPrompt to recover the fields (fragile, not
recommended). Option (a) is the right call.

Track as: APS-xxx "SimulationTemplate missing builder field columns causes prompt
corruption on partial update."

### M2 -- Integration test teardown order risks FK constraint violations
File: authoring.integration.spec.ts lines 51-57

The afterAll cleanup deletes in this order: triggerRule, rubricCriterion,
rubricVersion, assignment, simulationTemplate, groundTruth. However
SimulationTemplate has a FK to GroundTruth (groundTruthId). If the Postgres FK
relationship is enforced with ON DELETE RESTRICT (the default), deleting
simulationTemplate before groundTruth is correct. But the delete of groundTruth
should be first, or the schema must have ON DELETE CASCADE configured.

More importantly: the in-use-template integration test (lines 322-382) creates a
College and Course that are never deleted in afterAll. The cleanup does not include
prisma.course.deleteMany or prisma.college.deleteMany. When Postgres is live and
this test runs, those rows will leak between test runs (and potentially cause unique
constraint failures on the slug field on repeated runs).

Fix: add college and course cleanup to afterAll, in the correct FK order (course
before college).

### M3 -- RetryConfirmModal: no error state if authoriseRetry rejects
File: TeacherClassDashboard.tsx lines 222-229

The handleConfirm function calls authoriseRetry and sets done=true on success, but
the try/finally block has no catch. If authoriseRetry throws, the error is silently
swallowed (busy resets to false, done stays false, the modal stays open with no
feedback to the user). The teacher has no way to know the retry authorisation
failed.

This is acceptable as a stub (the endpoint is console.log in mock mode), but the
error path must be wired before Inc 7 lands and the real endpoint connects. Add an
error state and display a Hebrew error message in the modal.

Track as: APS-xxx "RetryConfirmModal: surface error state when authoriseRetry
rejects."

### M4 -- Heatmap filter and sort are inconsistent
File: TeacherClassDashboard.tsx lines 480-482

The heatmap tbody applies a second filter on top of displayStudents:
  .filter((s) => s.status === "COMPLETED" || s.criterionScores.some((c) => c.score !== null))

This filter is not applied to the class list table below. So a student who is
TECHNICALLY_AFFECTED (with all null scores) appears in the class list but is hidden
from the heatmap with no explanation. When the teacher activates the sort-by-
criterion feature and the student disappears from the heatmap, this is confusing.
The heatmap should show all students with a grey row for those with no scores, or
there should be an explicit note that the heatmap only shows students with data.

---

## MINOR (nits, follow-up, no action gate)

### N1 -- Rubric weight sum comment is misleading
File: rubric-generator.ts line 8 / line 42

The file comment says "weights sum to 1.0 across the standard set; risk criterion
excluded from sum, formativeOnly." This is correct intent. However the actual
summed weights are: 0.25 + 0.20 + 0.20 + 0.20 + 0.15 + 0.0 = 1.00. This does sum
to 1.0 including the zero-weight risk criterion, so the arithmetic is fine. No
defect, but the comment could be clearer: "summative weights (formativeOnly=false
criteria) sum to 1.0." As written it could be read as "we exclude risk from the
sum, therefore the remaining ones sum to 1.0" -- which is only coincidentally true.

### N2 -- challenge>=4 weight shift: after-adjustment weights not verified in tests
File: rubric-generator.ts lines 169-178, authoring-rbac.spec.ts

The challenge-level weight shift (clinical_reasoning +0.05, communication -0.05
when challengeLevel >= 4) is implemented but there is no unit test that verifies
the resulting weights sum to 1.0 after the shift. Current values: clinical becomes
0.25, communication becomes 0.10. Sum is still 1.00 (0.25+0.20+0.25+0.20+0.10+0.0).
Fine. But add a test asserting weight sum == 1.0 for both challengeLevel=3 and
challengeLevel=4 cases to lock this invariant.

### N3 -- Persona prompt hiddenLine handling produces an extra blank line
File: persona-composer.ts line 80 and line 98

When hiddenIssue is undefined, hiddenLine is an empty string "". The lines array at
index 4 becomes `""` (empty string), not undefined. The filter at line 98 filters
out `undefined` only, so the empty string passes through. The
`.replace(/\n{3,}/g, "\n\n")` collapses runs of 3+ newlines but a single empty
line between "PRESENTING PROBLEM" and the next block becomes a double blank line
(two consecutive newlines). This is cosmetic -- the prompt is still functional --
but could cause inconsistent whitespace in the injected system prompt.

Fix: change the lines array entry at index 4 from `${hiddenLine}` to either
omit it when empty or filter `(l) => l !== ""` alongside `l !== undefined`.

### N4 -- assignment-select in TeacherClassDashboard is cosmetic-only (no data reload)
File: TeacherClassDashboard.tsx lines 296-296 (selectedAssignment state), line 369

The assignment dropdown stores selectedAssignment state but the dashboard data
(student rows, criteria, heatmap) is passed in as a static prop and never reloaded
when the selection changes. Switching assignments via the dropdown changes the
selection highlight but shows the same data. This is expected pilot behaviour
(live reload deferred to Inc 7) but there is no comment or TODO on it. Add a
comment so the next developer does not assume the data reload is accidentally broken.

### N5 -- CriterionSummaryPills shows criterionId not label in pill header
File: StudentDashboard.tsx line 59

Each pill shows `c.criterionId` (e.g. "C-001") as the pill identifier, then
`c.label` as the label beneath. Using the raw ID is fine as a placeholder but in
production with real competency IDs (UUIDs) this will show meaningless UUIDs to
students. Ensure the VM layer maps to short display codes before this connects to
live data.

### N6 -- CSS: dist-row__bar-fill uses justify-content flex-end for bar value
File: dashboard.css line 468

The count value inside the bar uses `padding-inline-end: 6px` and
`justify-content: flex-end`. In RTL context, flex-end is the start of the line
(right side), which means the count appears at the left of the bar fill. In a
Hebrew RTL layout this may look correct visually but is semantically backwards --
the text is at the reading-end of the bar. This is a minor cosmetic inconsistency.
If the bar fills from right-to-left (as it would in RTL), the count at
inline-end is correct. Confirm with Noa that this was intentional for RTL mode.

### N7 -- Tooltip transform uses physical translateX in RTL workaround
File: dashboard.css lines 373-378

The RTL override uses `transform: translateX(50%)` for `:dir(rtl)`. This is a
known limitation (CSS logical transforms don't exist yet). The comment in the file
correctly attributes this. No change needed, just noting it was reviewed and is
intentional.

### N8 -- fetchClassDashboardReal / fetchStudentDashboardReal missing auth header
File: dashboard-client.ts lines 221-243

The real API calls do not include an Authorization header. Mock mode bypasses this,
so it does not matter today. But when USE_MOCK=false is set, the NestJS JwtAuthGuard
will reject all dashboard requests with 401. This needs to be wired before live
integration. Note as a known gap, not a defect today.

---

## SPECIFIC CHECKLIST ANSWERS

### (a) RBAC -- authoring restricted to TEACHER/SYSTEM_ADMIN, STUDENT blocked
Implementation: PASS. @UseGuards(JwtAuthGuard, RolesGuard) applied at the class
level; @RequiredRoles("TEACHER", "SYSTEM_ADMIN") applied at class level
(authoring.controller.ts lines 42-43). All 12 endpoints inherit this. RolesGuard
implementation is correct: STUDENT role is not in the allowed list and will produce
ForbiddenException.
Tests: FAIL -- see Blocker B2 above. The test file claims to cover this but the
STUDENT-blocked test case (a) is absent from the actual spec.

### (b) Hard off-ramp auto-inject
Implementation: PASS. resolveHardOffRamp (authoring.service.ts line 82) returns
DEFAULT_HARD_OFF_RAMP when text is null, undefined, or all-whitespace. Applied in
both createGroundTruth (line 284) and updateGroundTruth (line 334).
Tests: PASS. Tests (b) and (c) in authoring-rbac.spec.ts cover omitted,
whitespace-only, and present cases.
Note: the updateGroundTruth path only applies resolveHardOffRamp when
dto.hardOffRampText !== undefined (line 333). If a caller sends
hardOffRampText: "" (empty string), it is not undefined, so resolveHardOffRamp IS
called and the default is injected. Correct.

### (c) Versioning -- editing in-use template creates new version row
Implementation: PASS. updateTemplate checks assignments.length > 0 (line 169) and
branches to create a new template with version+1 (line 215). Original is not
touched.
Tests: PASS. Test (g) confirms create is called and update is NOT called on the
original. Test (h) confirms in-place update when no assignments.

### (d) Rubric publish immutability -- updateCriterion/publish on PUBLISHED throws
Implementation: PASS. updateCriterion checks rubricVersion.status !== "DRAFT" and
throws ConflictException (lines 473-475). publishRubric checks status === "PUBLISHED"
and throws ConflictException (lines 502-504).
Tests: PASS. Tests (d), (e), (f) cover both directions.

### (e) Two-step GroundTruth stub creation -- orphan/inconsistent-state risk
See Blocker B1 above. The risk is real and unmitigated.

### (f) RBAC scope gap
See ruling at top of this document: ACCEPT FOR PILOT WITH TRACKED TASK.

---

## SUMMARY TABLE

| ID  | Severity        | File(s)                         | Short description                                |
|-----|-----------------|----------------------------------|--------------------------------------------------|
| B1  | Blocker         | authoring.service.ts 123/204     | GT 3-step create not in transaction; orphan risk |
| B2  | Blocker         | authoring-rbac.spec.ts           | STUDENT-blocked test absent; RBAC not proven     |
| M1  | Major           | authoring.service.ts 185         | Partial update loses builder fields; prompt corrupted |
| M2  | Major           | authoring.integration.spec.ts 51 | College/Course rows leak in test teardown        |
| M3  | Major           | TeacherClassDashboard.tsx 222    | RetryConfirmModal swallows authoriseRetry errors |
| M4  | Major           | TeacherClassDashboard.tsx 480    | Heatmap silently hides non-completed students    |
| N1  | Minor           | rubric-generator.ts 8            | Weight sum comment imprecise                     |
| N2  | Minor           | rubric-generator.ts 169          | No test locking weight-sum invariant post-shift  |
| N3  | Minor           | persona-composer.ts 80           | Empty hiddenLine produces double blank in prompt |
| N4  | Minor           | TeacherClassDashboard.tsx 296    | Assignment dropdown does not reload data; no TODO|
| N5  | Minor           | StudentDashboard.tsx 59          | CriterionId shown raw; will be UUID in production|
| N6  | Minor           | dashboard.css 468                | Bar value position in RTL; verify intentional    |
| N7  | Noted/OK        | dashboard.css 373                | Physical translateX for RTL tooltip; intentional |
| N8  | Minor           | dashboard-client.ts 221          | Real API calls missing auth header               |

---

## DEFERRED (scope-intentional, not findings)

- Live Postgres integration tests: deferred by design, Docker down. Integration spec
  is written and well-structured. The one gap (teardown leak -- M2) is noted above.
  Run this suite before the first staging deploy.
- authoriseRetry real endpoint: console stub is correct; endpoint is Inc 7 scope.
- Assignment dropdown data reload: Inc 7 scope.
- Auth header on dashboard API client: Inc 7 scope.
- TypeScript non-test error (1 remaining, tsc): not in scope of this review --
  carry-forward from prior increment per the brief.
