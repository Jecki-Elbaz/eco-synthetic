# Code Review -- APS Sprint 2 Increment 4
# Evaluation + Debrief Engine
# Reviewer: Ido (VP R&D) | Date: 2026-07-04

---

## Verdict

APPROVE-WITH-CONDITIONS

Two conditions must close before this increment can be called done:
1. Fix the ordering proof gap in the evaluator test (Major-1).
2. Add a null-guard on `attempt.debriefMessages` before accessing `.length` and element `[length-1]` (Major-2).

Everything else is Minor or a noted acceptance. No Blockers found.

---

## Findings

### MAJOR-1 -- evaluator.spec.ts ordering test proves nothing
File: `packages/engine-test-harness/src/__tests__/evaluator.spec.ts` lines 170-186

Problem: The fourth ordering test (scoring call precedes prose call in log index) does not
actually prove sequential ordering. Both calls use ModelHint.EVALUATOR, so
`indexOf(EVALUATOR) == 0` and `lastIndexOf(EVALUATOR) == 1` is trivially true if both calls
happened at all -- even if they ran in parallel. The assertion `expect(0).toBeLessThan(1)` is
a literal constant comparison; it always passes regardless of what the code does. A Promise.all
across both steps would pass this suite unchanged.

Fix: Replace the fourth test with one that verifies the `step2Messages` prompt content
contains the structured scores from step 1 -- which can only be true if step 1 completed first.
Inspect the second captured `LLMRequest.messages` from a `RecordingStubProvider` and assert
that the user content contains the known step-1 score output. That is structural evidence of
sequencing that no parallel implementation can fake. The existing three tests (call count,
both hints are EVALUATOR, exactly 2 calls) are fine and should stay.

Severity: Major. The two-step ordering is a design requirement (APS-REQ-068). The test
claiming to prove it does not prove it.

---

### MAJOR-2 -- debrief.service.ts unsafe array access before persistence
File: `apps/api/src/debrief/debrief.service.ts` lines 159-162

Problem: Turn number for new debrief rows is computed as:
```
const nextTurnNumber =
  attempt.debriefMessages.length > 0
    ? attempt.debriefMessages[attempt.debriefMessages.length - 1]!.turnNumber + 1
    : 1;
```
`attempt.debriefMessages` is typed as `Array<Record<string, unknown>>` after the cast on
line 104. The `!.` non-null assertion on `attempt.debriefMessages[length - 1]` bypasses the
type check. If the Prisma query returns the field but as an empty array the guard works, but
if `debriefMessages` is ever undefined (schema mismatch, Prisma select change, future query
refactor) this throws at runtime with no error boundary. The cap path returns early so it is
fine, but the happy path has no safety net here.

Additionally: the `nextTurnNumber` derivation reads `attempt.debriefMessages.length` from the
data loaded BEFORE the cap check writes any new rows. That is correct for the current single-
request model, but only because there is no concurrent write guard. Note this for when
concurrency risk is assessed (not a fix required now, just flag it).

Fix: Add a null-coalesce guard:
```
const msgs = attempt.debriefMessages ?? [];
const nextTurnNumber =
  msgs.length > 0
    ? (msgs[msgs.length - 1] as Record<string, unknown>)["turnNumber"] as number + 1
    : 1;
```
And remove the non-null assertion.

Severity: Major. Runtime exception if the field is ever absent; no test covers this path.

---

### MINOR-1 -- RBAC gap: student with TEACHER role-also can read any status
File: `apps/api/src/evaluation/evaluation.service.ts` lines 192-217

Problem: `getEvaluation` checks `actorIsTeacher` via `isTeacherOfCourse(actorScopes, courseId)`.
A user who holds BOTH a STUDENT scope and a TEACHER scope on the same course (unlikely but not
impossible in the schema) would fall into the elevated path and see DRAFT evaluations and
teacherNotes. The roles guard at the controller level (`@RequiredRoles("STUDENT", "TEACHER",
"SYSTEM_ADMIN")`) is an OR, not an exclusive check, so this dual-role user gets through.

For the pilot this is not a live risk (no dual-role users), but the service-level logic should
treat elevation as `isAdmin || isTeacherOfCourse`, and student path should be explicitly
`!isElevated && isOwnAttempt`. That logic is already there; the issue is purely that
`isTeacherOfCourse` wins over `isStudent` when both are present, which is correct behavior.
Actually reviewing again: the current code is defensively correct (elevated wins, student-path
only fires when NOT elevated, teacherNotes are excluded from student view). The dual-role
scenario gives teacher-level access, which is acceptable -- a teacher-of-course should see
their own DRAFT. Flag as minor to confirm this is intentional, not an oversight.

Severity: Minor / informational. No fix required; confirm intent is explicit in a comment.

---

### MINOR-2 -- debrief.service.ts does not guard against empty `message` string
File: `apps/api/src/debrief/debrief.service.ts` line 148

Problem: `dto.message` is passed directly to `supervisorInput.studentMessage` with no
emptiness check. The controller validates `@IsString()` but not `@IsNotEmpty()`. An empty
string passes validation and fires an LLM call with a blank student question.

Fix: Add `@IsNotEmpty()` to `DebriefMessageBodyDto.message` in `debrief.controller.ts`.
One-line change, no logic impact.

Severity: Minor.

---

### MINOR-3 -- integration spec has a placeholder test that always passes
File: `apps/api/src/__tests__/evaluation-debrief.integration.spec.ts` lines 378-383

Problem: "debrief blocked before PUBLISHED evaluation (if run without prior publish)" contains
`expect(true).toBe(true)` and is marked "placeholder -- tested fully in unit spec". This will
show as a green test in CI even though it exercises nothing. When the integration suite is
activated (Docker available) this test will give a false confidence signal.

Fix: Either delete the placeholder test entirely, or replace it with a real assertion using an
isolated attempt fixture that has no evaluation. The unit spec coverage is sufficient for now;
a passing-always test is noise.

Severity: Minor.

---

### MINOR-4 -- isolation test coverage gap: scoringAnchors reach into debrief context via notes
File: `packages/engine-test-harness/src/__tests__/debrief-supervisor.spec.ts` lines 104-165

Problem: The isolation tests assert that `PERSONA_PROMPT`, `GROUND_TRUTH_FACT`, and
`HARD_OFF_RAMP` strings do not appear in the debrief context. This is correct and passes.
However, `scoringAnchors` (which can contain clinical ground-truth detail per the code
comment in `buildScoringPrompt`) flow into `CriterionScore.notes` via the evaluator, and
`notes` is inside `structuredScores` which IS included in the debrief context. The debrief
context renders `s.score/s.maxScore` and `requiresTeacherReview` but NOT `notes` directly
(check `buildDebriefContext` lines 138-143: only score, maxScore, requiresTeacherReview are
rendered). So this is safe as coded. But the test does not assert that `notes` content is
absent from the rendered debrief block -- it only checks the three fixture strings. If
someone later adds `notes` to the scoresBlock render, the leak would be invisible to tests.

Fix (recommended, not blocking): Add an assertion that the debrief context does not contain
the literal notes string from the fixture evaluation context (e.g., "Risk not probed
[FORMATIVE-ONLY"). This would catch a future accidental notes-leak.

Severity: Minor.

---

## Positive notes (no action needed)

Engine:
- Two-step ordering is structurally enforced by sequential awaits. Step 2 receives step-1
  scores as input, making score drift impossible by construction.
- `StructuredScores` shape is correct: `{ [criterionId]: { score, maxScore, evidence, notes,
  requiresTeacherReview } }`. Evidence is `number[]` (turn numbers). All correct.
- `formativeOnly` -> `requiresTeacherReview=true` + notes annotation is wired correctly in
  the happy path AND the fallback/parse-error path. Both are tested.
- Malformed-JSON fallbacks are safe: step 1 fallback gives zero scores for all criteria with
  a `[parse error]` note; step 2 fallback returns raw text as summary with empty highlights.
  Neither throws; neither loses criterion coverage.
- Token accumulation from both steps is correct: `inputTokensUsed += step1 + step2`, same for
  output. Tested explicitly.

DebriefSupervisor:
- `buildDebriefContext` is structurally isolated. The method signature accepts only
  `DebriefSupervisorInput`, which has no `personaSystemPrompt`, no `groundTruth`, no
  `analyserOutput` fields. This is type-level enforcement, not convention.
- `PatientStateLog` is explicitly excluded from the Prisma include in `debrief.service.ts`
  (line 83 comment confirms this is intentional).
- `citedTurns` are validated against actual transcript turn numbers using a Set. Out-of-range
  citations are filtered, not silently accepted.
- The system prompt explicitly states the supervisor cannot change official grades.

API:
- RBAC on all three evaluation paths (generate, read, override) is correct. Each path does a
  fresh Prisma lookup of the attempt to get `courseId`, then applies `isTeacherOfCourse` or
  `isAdmin`. No RBAC decision is based solely on what the caller claims.
- Student DRAFT leak is blocked: `getEvaluation` checks `!isElevated && evaluation.status !==
  "PUBLISHED"` and throws ForbiddenException.
- Cross-student leak is blocked: `isOwnAttempt = attempt.userId === actorId` is checked before
  returning data.
- `teacherNotes` is absent from the student view (lines 226-234).
- Regeneration of PUBLISHED evaluation throws ConflictException.
- Debrief cap returns a neutral message and does NOT call the LLM. Both assertions are tested.
- `patientStateLogs` is not included in the debrief Prisma query (confirmed by absence from
  include block and explicit code comment on line 83).
- `debriefMessages` Prisma query does NOT include `personaPrompt` or `groundTruth` -- these
  live on `SimulationTemplate`, which is not joined in the debrief query.

Integration spec:
- Structure is correct and matches the simulation-turn pattern. FK-safe teardown order is
  correct (children deleted before parents).
- `SKIP` guard on `DATABASE_URL` is appropriate for CI-without-DB environments.
- Seeding of formative criterion with `formativeOnly: true` is correct and the spec asserts
  `requiresTeacherReview` appears in the stored evaluation.

---

## Judgment call rulings

### JC-1: Evaluation not auto-generated on finishAttempt
ACCEPTED for pilot.

Gal's reasoning holds: running the evaluator in the student request path adds LLM latency to
finishAttempt, and abandoned attempts would generate orphan evaluation rows. The explicit
teacher-trigger model is also pedagogically correct -- teacher reviews before publishing is
a feature, not a gap. The ConflictException on regenerate-published is the right idempotency
guard for the current model.

Condition on future work: when auto-evaluation is ever needed (e.g., instant feedback for
low-stakes practice mode), implement it as a background job triggered by finishAttempt, not
inline in the request. Note this in the tech-debt register under APS-004.

### JC-2: EvaluationModule and DebriefModule each instantiate their own StubProvider
ACCEPTED as interim, with one condition.

At StubProvider-only scale this has no runtime consequence. The two instances are isolated
and stateless, so there is no cross-contamination risk. The note in both module files that
this should be refactored at APS-004 LLM gate is correct and sufficient.

Condition: the refactor to a shared LlmModule (with a single provider token injected into
both EvaluationModule and DebriefModule) MUST happen before a live LLM provider is gated in.
Add this as a hard prerequisite to the APS-004 gate checklist now, not as a follow-up. If a
real provider is wired before the refactor, both modules will create independent API
connections, potentially with different rate-limit counters and no shared token tracking.

### JC-3: Debrief isolation relies on type structure + Prisma query omission
ACCEPTED for pilot. Explicit guard layer is NOT required now but IS recommended before
production.

The two-layer defense (DebriefSupervisorInput type has no persona/ground-truth fields, AND
the Prisma query never joins SimulationTemplate) is structurally sound. The engine test suite
asserts the built context does not contain the fixture persona/ground-truth strings.

The weakness: both defenses are passive. If a developer adds a field to `DebriefSupervisorInput`
or expands the Prisma include, there is no active guardrail to catch the leak. The test
coverage for isolation is good but only as strong as the test fixture strings.

Recommendation for production readiness: add a unit assertion that `DebriefSupervisorInput`
type does NOT have the properties `personaSystemPrompt`, `groundTruth`, or `analyserOutput`
(this can be done as a TypeScript compile-time check using a `Expect<Not<HasProperty<...>>>`
utility, or simply as a lint rule). Also add the `notes` leak assertion noted in MINOR-4.
Track as a pre-production task, not a pilot blocker.

---

## Conditions to close before increment is marked done

1. Fix Major-1 (evaluator ordering test): replace the constant-comparison ordering test with
   a content-based assertion proving step 2 received step 1 output.
2. Fix Major-2 (debrief service null guard): replace the non-null assertion on
   `attempt.debriefMessages[length-1]` with a null-coalesce guard.

Minor findings (1-4) are follow-up items, not blockers. Track under APS-011 or as new items.

---

End of review.
