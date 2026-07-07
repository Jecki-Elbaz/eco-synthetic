# Code Review: APS Sprint 2 Increment 3
# Reviewer: Ido (VP R&D)
# Date: 2026-07-03
# Scope: Context-summariser trigger, soft-warn annotation, teacher-review RBAC,
#        Noa's Student Simulation Screen front-end.
# Build context: StubProvider-only. No real LLM. No deploy.
# Integration tests (11) BLOCKED by Docker/Postgres env issue -- deferred, not a code defect.

---

## VERDICT: APPROVE WITH CONDITIONS

Three conditions must be resolved before the increment ships:
  C1 -- Welfare signpost dismiss path exists on narrow viewport (Blocker, SME red line).
  C2 -- api-client.ts /api/turn URL mismatch (Blocker, would break live mode).
  C3 -- TypeScript typecheck red on @aps/api is unacceptable to carry silently (Major, must be logged).

All other findings are Minor or informational and can follow in a cleanup task.

---

## FINDINGS

### BLOCKER

---

**B1 -- Welfare signpost is DISMISSABLE on narrow viewport**
File: apps/web/src/components/simulation/WelfareSignpost.tsx:34 / simulation.css:736
Sami/SME requirement: welfare signpost is persistent, always-visible, and NON-DISMISSABLE.

On narrow viewport (<= 700px) the sidebar is hidden via CSS (`display: none` on .sim-sidebar,
line 749 of simulation.css). The signpost falls back to a fixed icon button (welfare-icon-btn).
That button has `onClick={() => setExpanded((prev) => !prev)}` -- so tapping it a second time
sets `expanded = false`, collapsing the expanded panel and leaving only the icon. The icon alone
does not satisfy "always-visible welfare content"; a student can tap-dismiss the expanded text
and be left with an opaque "!" button whose content is hidden.

The requirement is non-dismissable. The fix is to remove the toggle-collapse path:
either make the expanded panel always-visible on narrow viewport without a dismiss action, or
render the content inline inside the icon button so it is always readable without expansion.
The simplest safe fix: remove the `onClick` collapse handler and keep the expanded panel
permanently open when the signpost fires, or always render the expanded aside on narrow viewport.

This is a SME/Sami condition and blocks the increment.

---

**B2 -- api-client.ts live-mode URL is wrong**
File: apps/web/src/lib/api-client.ts:52
`postTurn` calls `${BASE_URL}/api/turn`. The actual NestJS route is
`POST /simulations/:attemptId/turn` (simulation.controller.ts:42-43). The `attemptId` is also
not included in the URL -- it is currently constructed from `TurnRequest.attemptId` in the body,
but the real endpoint expects it as a path param. Mock mode masks this completely.

In live mode every turn call will 404. Fix: build the URL as
`${BASE_URL}/simulations/${req.attemptId}/turn` and strip `attemptId` from the request body
(or keep it in body if the controller accepts it there -- but confirm controller expectation).

This only bites in live mode; the mock path is correct for demo. Still a blocker because the
real integration cannot function as-is and this is not a test environment issue -- it is a
wrong constant in production code.

---

### MAJOR

---

**M1 -- TypeScript typecheck red on @aps/api is not acceptable to carry silently**
Gal reports 29 pre-existing errors (down from 36 baseline) in integration-test DB-stub typing
(deleteMany/count/$transaction on the Prisma delegate cast). The errors do not block jest
(ts-jest transpiles), but `pnpm typecheck` is red on @aps/api.

Carrying a red typecheck silently is unacceptable for these reasons:
  1. Any new real type error introduced in @aps/api will be invisible -- lost in the pre-existing
     noise.
  2. CI cannot use typecheck as a gate, which is part of our definition of done.

Assessment: acceptable to carry temporarily ONLY if a tracked cleanup task is created before
this increment closes and typecheck is added to the CI gate for all other packages. The 29 errors
are in test stubs, not production code, which is why they do not block jest. But they must have
a named owner and a sprint target.

Recommend: create a cleanup task "Fix Prisma delegate cast typing in integration-test stubs"
targeting Sprint 2 Inc 4. Until then the typecheck gate on @aps/api must be documented as
intentionally suppressed for test files only, with a comment in the CI config referencing the
task ID.

---

**M2 -- Soft-warn badge fires at turnCount >= softWarnAt client-side, ignoring server signal**
Files: apps/web/src/components/simulation/SimulationScreen.tsx:147-151 /
       apps/web/src/components/simulation/TurnCounter.tsx:32

The front-end computes `isWarn = current >= softWarnAt` (TurnCounter.tsx:32) and
`if (turnCount >= softWarnAt) setSoftWarnShown(true)` (SimulationScreen.tsx:148) using only
the client-side turnCount state. The server returns `softWarnTriggered` and `softWarnAnnotation`
in TurnResponse, but the front-end never reads those fields -- it uses its own client computation.

In mock mode this does not matter (mock returns `softWarn = tc >= 60` independently). In live
mode the client recomputes independently of the server gate. If the server and client disagree
on the threshold (e.g., per-assignment override), the banner and badge will be out of sync.

This is not a blocker at StubProvider stage but is a correctness gap before live mode. The server
already sends the right data. The front-end should use `resp.softWarnTriggered` from handleSend
to drive `setSoftWarnShown`, not recompute it. The TurnCounter badge can remain client-computed
since it is purely cosmetic, but the soft-warn banner in ChatArea should be server-driven.

---

**M3 -- softWarnTriggered uses pre-turn turnCount, not post-turn**
File: packages/engine/src/pipeline/input-gate.ts:66
File: apps/api/src/simulation/simulation.service.ts:131,143

`InputGate.check` receives `totals.turnCount` which is the count BEFORE this turn executes
(loaded from DB at line 125 of service, used at line 143). `softWarnTurns` defaults to 60.
So softWarn fires at `totals.turnCount >= 60`, meaning the warning appears on the response
to turn 61 (when turnCount in DB = 60 going in).

The TurnCounter client-side fires at `current >= softWarnAt` where `current = resp.turnCount`
= newTurnCount = attempt.turnCount + 1 (post-turn). So the server warn fires one turn earlier
than the client badge. They are measuring different things: server uses pre-turn count, client
uses post-turn count. The off-by-one is consistent with "approaching 60" semantics, but it
should be documented explicitly. If the intended UX is "warn from turn 60 onward", the server
should fire at `totals.turnCount >= this.budget.softWarnTurns - 1` or the gate should receive
the post-turn count. Currently the warning first appears on turn 61 in the server response.
Not a blocker but should be decided intentionally and documented.

---

### MINOR

---

**m1 -- Context-summariser test case (b) assertion is >= 1, not == 1 (weak)**
File: packages/engine-test-harness/src/__tests__/context-summariser.spec.ts:183
`expect(spy.summariserCallCount.value).toBeGreaterThanOrEqual(1)` is too loose. For a
4-message, 1-slot window the summariser should fire exactly once per turn. The test proves
invocation but would not catch a double-invocation bug. Should be `.toBe(1)`.

---

**m2 -- Summariser prompt uses `m.originalText` for both student and patient turns**
File: packages/engine/src/pipeline/turn-pipeline.ts:129
The summariser prompt builds `[Turn N STUDENT]: <originalText>` and `[Turn N PATIENT]: <originalText>`.
This is fine for content, but the STUDENT role in the Message model maps to the student's
message. The summariser will see raw student text without the NV-cue prefix that was attached
in dto.nonVerbalCues. The NV cue is stored separately and is not merged into originalText before
persisting (service.ts:195-208). Low priority at pilot scale but means the summary may lose
NV-cue context. Tracked item for Sprint 3.

---

**m3 -- Summariser: droppedMessages filter logic is correct but subtle -- document it**
File: packages/engine/src/pipeline/turn-pipeline.ts:112-116
The filter correctly excludes:
  (a) messages in the window (in windowedSet), and
  (b) messages with turnNumber <= priorSummarisedUpTo.

The subtlety: `windowedSet` is built from windowedMessages which are a subset of recentMessages.
The filter `!windowedSet.has(m.turnNumber)` only works correctly if turnNumbers in recentMessages
are unique per role. If two messages share a turnNumber (student + patient on the same turn),
both will have the same turnNumber and the windowedSet check will drop both if either is in the
window or include both if neither is. This is correct by design (both sides of a turn should
always be treated together), but it is non-obvious. A comment explaining this invariant would
prevent a future bug introduction.

No code change required. Add a comment.

---

**m4 -- selectWindowByTokenBudget: off-by-one at exact budget boundary is safe but asymmetric**
File: packages/engine/src/pipeline/context-builder.ts:42-44
The condition is `if (used + cost > tokenBudget && selected.length > 0)`. A message that lands
exactly ON the budget (used + cost == tokenBudget) IS included. This is correct and intentional
(the comment "never drop the most-recent context entirely" applies). The boundary is inclusive.
The summariser trigger calls the same function, so dropped messages are exactly those where
`used + cost > tokenBudget` at the point they are evaluated. Consistent. No change needed, but
this should be noted in the spec for future maintainers.

---

**m5 -- RBAC: stale-JWT-scope trade-off is acceptable for formative pilot; must be logged**
File: apps/api/src/simulation/simulation.service.ts:291-317
Gal's trade-off: RBAC enforcement reads actorScopes from the JWT payload (passed by controller
from req.user.scopes), not by querying UserRoleAssignment live per request. If a teacher's
scope changes (removed from course) their existing JWT still grants access until it expires.

Assessment: acceptable for a formative pilot where JWT lifetime is short (verify expiry < 1h)
and the access pattern is low-stakes (state logs, not PII). Must be logged as a known limitation
in the architecture decision log before production. Add a TODO comment at the method citing
the trade-off and the expected resolution (live DB scope query before production).

---

**m6 -- Integration test teardown: UserRoleAssignment deleted before User, but User has no FK**
File: apps/api/src/__tests__/teacher-review-rbac.integration.spec.ts:223-225
Teardown order:
  1. usageLog, message, patientStateLog, attempt, assignment, rubricVersion, simulationTemplate,
     groundTruth
  2. userRoleAssignment (teacherA, teacherB)
  3. user (userId, teacherAId, teacherBId, adminId)
  4. course (courseAId, courseBId)
  5. college (collegeId)

This order is FK-safe assuming:
  - userRoleAssignment.userId FK -> user (ON DELETE CASCADE or RESTRICT). If CASCADE, deleting
    the user first would auto-drop the role assignment, but the explicit deletion at step 2 is
    safe either way.
  - No remaining FK from college to course after courses are deleted. Check: course is deleted
    before college. Correct.
  - Attempt.assignmentId FK deleted before assignment. Correct.

No structural defect found. Order is correct.

---

**m7 -- Non-verbal cue tags: inline render is correct; aria-label duplicates visible text**
File: apps/web/src/components/simulation/NonVerbalCueTag.tsx:12
`aria-label={cue}` on a `<span>` that already renders `{cue}` as text means screen readers
will announce the cue text twice (once from the visible text content, once from aria-label).
`aria-label` should be removed; the visible text is sufficient. Or use `aria-hidden="true"` on
the bracket characters if the intent is to expose only the inner description. Low impact in
a simulation context but a real a11y defect.

---

**m8 -- Modal box actions use `justify-content: flex-end` (physical alignment in LTR only)**
File: apps/web/src/components/simulation/simulation.css:649
`.modal-box__actions { justify-content: flex-end; }` uses flex-end which IS direction-aware
in flexbox (it means end of the main axis, which is logical for row direction). In RTL the
end of the row is the left side visually, so `flex-end` correctly places buttons at the
physical right in LTR and physical left in RTL -- correct behaviour. This is fine.
No change needed; it was flagged during analysis but confirmed correct.

---

**m9 -- help-overlay panel uses `justify-content: flex-end` for the slide-in panel**
File: apps/web/src/components/simulation/simulation.css:661-662
`.help-overlay { justify-content: flex-end }` positions the panel at the inline-end of the
overlay. In LTR this is the right side; in RTL this is the left side. This is the correct
logical behaviour for a contextual panel. No defect.

---

**m10 -- soft-warn test does not assert softWarnAnnotation text when annotation is provided**
File: apps/api/src/__tests__/simulation-soft-warn.spec.ts:159-174
Test "softWarnAnnotation contains a human-readable turn-warning message" passes a regex
`/turn|simulation/i`. The actual annotation is
"You are approaching the maximum number of turns for this simulation." which matches.
Fine, but the test would also pass for any string containing "turn" or "simulation". Consider
a tighter assertion in a follow-up: exact string equality or at least a regex that captures
the intent more precisely ("approaching" + "turns").

---

**m11 -- api-client mock postTurn uses stubTurnCount module-level variable -- no reset between renders**
File: apps/web/src/lib/api-client.ts:18
`let stubTurnCount = 0` is module-level state. In a test harness or HMR dev environment
multiple SimulationScreen mounts within the same module lifetime share this counter. In
production (Next.js, SSR) this is server-side module state shared across requests if the
module is not re-evaluated. Low risk for demo-only mock use, but it is a latent bug.
Recommend: move stubTurnCount inside mockTurnResponse closure or accept a turn seed in the
function signature.

---

## SUMMARY TABLE

| ID  | Severity | File(s)                                      | Issue                                             | Blocks? |
|-----|----------|----------------------------------------------|---------------------------------------------------|---------|
| B1  | BLOCKER  | WelfareSignpost.tsx:34, simulation.css:729   | Welfare signpost dismissable on narrow viewport   | YES     |
| B2  | BLOCKER  | api-client.ts:52                             | Live-mode URL wrong (404 in prod)                 | YES     |
| M1  | MAJOR    | @aps/api typecheck                           | 29 TS errors must be tracked, not silently carried| YES*    |
| M2  | MAJOR    | SimulationScreen.tsx:147, TurnCounter.tsx:32 | Soft-warn fires client-side, ignores server signal| NO      |
| M3  | MAJOR    | input-gate.ts:66, simulation.service.ts:131  | Off-by-one: warn fires on pre-turn count          | NO      |
| m1  | Minor    | context-summariser.spec.ts:183               | Summariser call count assertion too loose         | NO      |
| m2  | Minor    | turn-pipeline.ts:129                         | NV cue lost from summariser prompt                | NO      |
| m3  | Minor    | turn-pipeline.ts:112-116                     | Shared-turnNumber invariant undocumented          | NO      |
| m4  | Minor    | context-builder.ts:42                        | Inclusive boundary undocumented                   | NO      |
| m5  | Minor    | simulation.service.ts:291                    | Stale-JWT trade-off needs ADR entry               | NO      |
| m6  | Minor    | teacher-review-rbac.integration.spec.ts:215  | Teardown order correct; confirmed safe            | NO      |
| m7  | Minor    | NonVerbalCueTag.tsx:12                       | aria-label duplicates visible text                | NO      |
| m8  | Minor    | simulation.css:649                           | flex-end alignment -- confirmed correct for RTL   | NO      |
| m9  | Minor    | simulation.css:661                           | flex-end on overlay -- confirmed correct for RTL  | NO      |
| m10 | Minor    | simulation-soft-warn.spec.ts:170             | Annotation regex assertion too loose              | NO      |
| m11 | Minor    | api-client.ts:18                             | Module-level stub counter not reset between mounts| NO      |

*M1 YES with conditions: must create a tracked cleanup task; not a gate-block if task is logged.

---

## WHAT IS SOLID

- Summariser ordering is correct: step 1b fires before step 4, so the fresh summary is
  available in the same turn's context build. (turn-pipeline.ts:99 vs :241)
- Re-summarisation guard is correct: `m.turnNumber > priorSummarisedUpTo` filters already-
  covered turns. (turn-pipeline.ts:114-115)
- Rolling summary construction (prior summary + dropped messages) is correct. (turn-pipeline.ts:123-130)
- Summariser tokens are correctly threaded into inputTokensUsed/outputTokensUsed before gate.
  (turn-pipeline.ts:150-151)
- contextSummary and summarisedUpTo are correctly returned in nextStateSnapshot and persisted.
  (turn-pipeline.ts:235-236, service.ts:183-184)
- selectWindowByTokenBudget returns messages in ascending turn order (reversed after walk) --
  correct for chronological LLM consumption. (context-builder.ts:51-53)
- RBAC service check: the TEACHER-must-teach-this-course check via actorScopes is correct as
  defense-in-depth behind RolesGuard. SYSTEM_ADMIN bypass is correctly unconditional.
  (simulation.service.ts:299-312)
- Controller passes req.user.scopes correctly to getPatientStateLogs. (simulation.controller.ts:87)
- Integration test structure mirrors the existing pattern, creates real fixtures, and teardown
  order is FK-safe.
- CSS uses logical properties throughout: padding-inline, padding-block, inset-block-start,
  inset-inline-end, border-block-end, border-inline-start. No physical left/right in layout.
  (simulation.css verified globally)
- RTL dir="rtl" set at component root in SimulationScreen. (SimulationScreen.tsx:284)
- Non-verbal cue tags render inline inside the patient bubble with distinct styling.
  (PatientBubble.tsx:141-146, simulation.css:261-271)
- Soft-warn annotation is null on gate-blocked path (service.ts:153-158). Both return paths
  (gate-blocked and normal) handle annotation correctly.
- All-messages query (changed from take:20) is safe at the 75-turn pilot cap: worst case is
  150 message rows (75 student + 75 patient). Ordering is ascending by turnNumber, correct
  for the window function. (service.ts:112-115)
- 10 summariser spec tests cover all four required cases (a-d). Cases (a) and (c) are
  particularly strong with two sub-tests each.
