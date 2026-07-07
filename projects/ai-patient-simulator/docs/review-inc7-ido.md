# Code Review -- APS Sprint 2 Increment 7
# Reviewer: Ido (VP R&D)
# Date: 2026-07-04
# Scope: academic-safety attempt-status flow + deterministic tech-support + email-escalation stub

## Verdict: APPROVE-WITH-CONDITIONS

Three issues must be fixed before the next increment ships. One is a dead-code
logic bug in production code (never a risk in tests but wrong in prod). One is a
scope-coverage gap that makes the COLLEGE routing tier permanently unreachable from
the API. One is a redaction gap on a specific nested-object path. All others are
minors or follow-up items.

---

## Findings

### BLOCKER-1: `serverSideOnly` condition is always false
File: packages/engine/src/support/troubleshoot.ts, lines 141-144

Problem: The guard `steps.length === 2` is supposed to detect "only server-error
step + one more". But the function unconditionally pushes 4 steps (cache, network,
extensions, incognito) BEFORE reaching the `serverSideOnly` check. When
`lastApiStatus >= 500` is true, `steps.length` is already 5 (or 6 with
`assignmentId`), never 2. The `serverSideOnly` branch in `recoveryGuidance` is dead
code; the server-only message ("Your progress is saved") never reaches the user.

Fix: Replace the magic-number check with a flag set at the point where the
500-step is conditionally pushed:

```
let isServerSideIssue = false;
if (state.lastApiStatus !== null && state.lastApiStatus >= 500) {
  isServerSideIssue = true;
  steps.push({ ... });
}
// ... unconditional steps ...
const serverSideOnly = isServerSideIssue;
```

Or simply inline `isServerSideIssue` into the return. Remove the `steps.length`
comparison entirely.

Test gap: The test at support.spec.ts line 309 checks that step[0] mentions "503|server"
but does NOT assert which `recoveryGuidance` string is returned, so the dead branch
passes silently. Add an assertion:
  `expect(result.recoveryGuidance).toMatch(/progress is saved/i);`

---

### BLOCKER-2: COLLEGE scope is unreachable from the API layer
File: apps/api/src/support/support.service.ts, line 80

Problem:
```
const scope = dto.courseId ? "COURSE" : "GLOBAL";
```
There is no `COLLEGE` path. A ticket submitted by a student who has a `collegeId`
but no `courseId` will route via GLOBAL SLA (8-24h) instead of COLLEGE SLA (2-8h
depending on category). For AI_RESPONSE_FAILURE, the gap is GLOBAL=4h vs COLLEGE=2h
-- it matters for academic safety.

The routing matrix and type definitions correctly enumerate COLLEGE. The API-layer
scope resolution simply never emits it.

Fix: `CreateSupportTicketDto` already has `courseId` as optional. Add `collegeId`
as an optional field (or take it from the JWT `scopes` in the controller), then:
```
const scope = dto.courseId ? "COURSE" : dto.collegeId ? "COLLEGE" : "GLOBAL";
```

If `collegeId` is not available in the current DTO, the minimal fix is to add it
to `CreateSupportTicketDto` in shared-types and populate it from the controller via
`req.user.scopes`. Do not merge this increment without resolving -- COLLEGE routing
is a dead rule in the live system.

---

### BLOCKER-3: Redaction does not cover `diagnosticSummary` in the email object
File: apps/api/src/support/support.service.ts, lines 139-140

Problem:
```
diagnosticSummary: redactedPayload,
```
This is correct -- the redacted payload is attached to the email context. BUT the
`emailObj` itself is only logged via `console.log` at lines 160-165, and the log
call uses a narrowed subset (to/subject/ticketId/issuedAt). The full `emailObj`
with `diagnosticSummary` is not persisted to the DB.

The actual Blocker is subtler: line 103 comment says "Intentionally NO transcript
text in the raw payload", but `dto.diagnosticState` is spread into `rawPayload` at
line 100. If `diagnosticState` ever includes fields beyond what `GlobalDiagnosticState`
declares (which is possible if callers pass extra properties through the `IsObject()`
validated DTO), those extra fields bypass the key-based redaction unless they happen
to match a sensitive keyword. The `IsObject()` decorator in the controller does NOT
strip unknown keys -- it only checks that the field is an object. A caller could
include `transcriptMessages: [...]` in `diagnosticState` and it would flow through
unredacted into `redactedPayload`.

Fix (required): Change `IsObject()` on `diagnosticState` to a proper nested DTO
class with `@ValidateNested()` + `whitelist: true` in the global ValidationPipe, so
unknown keys on `diagnosticState` are stripped at the controller boundary before
they reach the service. This is a controller-level input guard, not a redaction
logic change.

Note: The redaction function itself (diagnostic-redact.ts) is correct and handles
known-sensitive keys. The gap is that unrecognised extra keys pass through if
`whitelist` stripping is not in place. Classify as Blocker because it is an
APS-REQ-106 privacy control.

---

### MAJOR-1: `flagAffected` allows TEACHER role but the service rejects non-owners
File: apps/api/src/support/support.controller.ts, line 126
File: apps/api/src/support/support.service.ts, line 192

The controller restricts `flag-affected` to `@RequiredRoles("STUDENT")` only.
That is correct per spec (only a student flags their own attempt). However, this
means a teacher who discovers a student's technical issue cannot flag on the
student's behalf without logging in as the student. This may or may not be
intentional for pilot. The spec says "student flags" -- accept that as written.

The actual gap: the service check `attempt.userId !== actorId` correctly blocks
foreign students, but the controller `@RequiredRoles("STUDENT")` would also block
a SYSTEM_ADMIN from calling this endpoint on a student's behalf. If an admin needs
to manually trigger the flag (e.g., bulk remediation), they cannot. Recommend
adding "SYSTEM_ADMIN" to `@RequiredRoles` on `flag-affected` as a follow-up, not a
blocker for pilot.

---

### MAJOR-2: `listTechnicallyAffectedAttempts` has a double-filter race condition
File: apps/api/src/support/support.service.ts, lines 236-276

When `courseId` is provided and the actor is a teacher-of-course, the service:
1. Authorizes the actor at lines 236-239 (checks teacher has that courseId in scopes)
2. Passes `assignmentFilter` to Prisma at line 252 (DB-level courseId filter)
3. Then at line 263-274 runs IN-MEMORY filter again over the DB result

The in-memory re-filter at step 3 is redundant when `courseId` is provided, because
the DB already filters to that course. This is not a security bug (the in-memory
filter is at least as restrictive), but it is wasted work and the double-computation
of `teacherCourseIds` (once at line 243-244, once at line 264-267) makes the intent
unclear. It could also hide a real scope leak if the DB filter were ever removed.

Fix: Collapse into one path: if authorized for a courseId, let the DB do the
filtering and skip the in-memory pass. If no courseId, do in-memory filter on the
broader DB result. Add a comment explaining the two-step is intentional depth-in-
defence if you keep both.

This is a Major (not Blocker) because the current behaviour is correct and over-
filters, not under-filters.

---

### MAJOR-3: `flagTechnicallyAffected` does not check that `ticketId` belongs to this `attemptId`
File: apps/api/src/support/support.service.ts, lines 182-223

The service verifies the actor owns the attempt and that the transition is valid.
It does NOT verify that the supplied `ticketId` is the ticket for this attempt.
A student could pass any valid ticketId (e.g., another student's open ticket) and
the `supportTicket.update` at line 207 would stamp `teacherVisible=true` and
`attemptId` onto a ticket they do not own.

For pilot (StubProvider only, no production data), the blast radius is low. But this
is a data-integrity gap that must be fixed before live data. Recommend adding a
pre-check:
```
const ticket = await this.prisma.supportTicket.findUnique({ where: { id: ticketId } });
if (!ticket || ticket.userId !== actorId) throw new ForbiddenException("Ticket does not belong to you");
```

Classify as Major (not Blocker) because no production data is at risk in pilot.

---

### MAJOR-4: `userFreeText` from the student is echoed verbatim into the email body without sanitisation
File: apps/api/src/support/support.service.ts, lines 126-127

```
(dto.userFreeText ? `\nStudent message:\n${dto.userFreeText}\n` : "")
```

The email is a stub (never sent), so no injection risk right now. But the pattern
must not be promoted to a real email sender without output sanitisation. Add a
`// TODO: sanitise userFreeText before including in real email body` comment now, or
add a `sanitiseForEmail()` helper that strips CRLF-injection characters. The stub
stage is the right time to establish the contract.

---

### MINOR-1: Routing test asserts fallback exists but does not assert it is the FALLBACK value
File: packages/engine-test-harness/src/__tests__/support.spec.ts, lines 112-117

The fallback test asserts `toEmail` is defined and `expectedResponseHours` is a
number. It does not assert the actual fallback values (`support@aps.pilot`, 24h).
A regression that changed the fallback to an empty string would still pass.
Fix: Assert exact values.

---

### MINOR-2: Isolation test is a structural assertion, not an import graph assertion
File: packages/engine-test-harness/src/__tests__/support.spec.ts, lines 228-261

The isolation check works by calling the support functions and asserting the result
shape does not contain patient-state keys. This is a functional proxy for isolation,
not a true import-graph check. A developer could accidentally import
`PatientStateSnapshot` for a type annotation and the test would still pass (TypeScript
erases types; no runtime trace). For APS-REQ-111, the stronger guard is a build-time
check: a lint rule (no-restricted-imports or a custom ESLint rule) on the
`packages/engine/src/support/` directory. Recommend adding this in a follow-up.

---

### MINOR-3: `emailSent=true` is set unconditionally; semantics are misleading
File: apps/api/src/support/support.service.ts, lines 144-155

The comment says "(stub: never actually sent)" but `emailSent=true` is the persisted
value. When the stub is replaced with a real sender, this field will need to flip to
`false` first and be set `true` only on confirmed delivery. The current design
conflates "email assembled" with "email sent". Recommend renaming to `emailAssembled`
for the stub period, or storing `emailSent=false` now and documenting that the real
sender must update it.

---

### MINOR-4: `teacherNote` from authorise-retry is logged to console but not persisted
File: apps/api/src/support/support.service.ts, lines 346-348

```
console.log(`[RETRY-AUTH] attempt=${attemptId} teacher=${actorId} note=${dto.teacherNote}`);
```

For an audit trail (a teacher explicitly authorising a student retry is a
significant event), a console log is insufficient even in pilot. The `attempt`
update at line 337-344 silently discards the note. A structured log entry (or at
minimum a `SupportTicket` comment) should carry this forward. Follow-up, not a
blocker for pilot.

---

### MINOR-5: `SUBMITTED` status in ACADEMIC_SAFETY_TRANSITIONS has no path from tech-safety states
File: packages/shared-types/src/support.types.ts, line 156

```
SUBMITTED: ["EVALUATED"],
```

`SUBMITTED` has an outbound transition but no inbound from `TECHNICALLY_AFFECTED` or
`RETRY_AUTHORISED`. This means a student who submits and then realises there was a
technical failure cannot enter the tech-safety chain at all (no `SUBMITTED ->
TECHNICALLY_AFFECTED` edge). Whether this is intentional (submission = assessment
complete, handled via grade appeal) or an omission is not clear from the spec.
Recommend explicit documentation in the transition table comment.

---

## Judgment Call Rulings

### JC-1: Teacher notification via metadata.teacherVisible=true + ticket ESCALATED -- accept for pilot?

ACCEPTED for pilot with one condition: the current model is a read-pull design
(teacher polls GET /technically-affected). That is fine for a teacher dashboard
that auto-refreshes. The condition is that `metadata->>'teacherVisible'` must be
indexed (or the query must filter on `status=ESCALATED` first, which is cheap) to
avoid a full-table scan as ticket volume grows. This is a query-performance
obligation before beta, not pilot. Accept now; add a Postgres index on
`(status, (metadata->>'teacherVisible'))` to the beta database migration.

No separate notification table is the right call for pilot -- fewer moving parts,
no foreign-key overhead, and the read path is clear. Revisit at beta if teacher
needs push notifications.

### JC-2: State machine IN_PROGRESS -> TECHNICALLY_AFFECTED -> TECHNICAL_FAILURE_CONFIRMED -> RETRY_AUTHORISED -> IN_PROGRESS -- sound?

Mostly sound. Two observations:

(a) COMPLETED -> TECHNICALLY_AFFECTED is permitted by the transition table. The
test at support.spec.ts line 305 asserts this succeeds. This is intentional and
correct -- a student may finish a simulation and then discover the AI was giving
garbage responses due to a server fault. EVALUATED -> TECHNICALLY_AFFECTED is
correctly blocked (line 157: `EVALUATED: []`). This is the right design.

(b) RETRY_AUTHORISED -> IN_PROGRESS is the re-entry edge. Who triggers this
transition? The service has no `startRetry` endpoint. The student must presumably
re-launch the simulation, which would hit the existing simulation-start endpoint
and transition the attempt from RETRY_AUTHORISED to IN_PROGRESS. Verify the
simulation-start endpoint's transition guard allows `RETRY_AUTHORISED -> IN_PROGRESS`
-- it must be in the table that endpoint uses, not just in ACADEMIC_SAFETY_TRANSITIONS
(which is the support module's copy). If simulation-start has its own transition
guard that does not know about RETRY_AUTHORISED, the student will be blocked.
This is a cross-module integration risk; flag to Gal to verify simulation-start
handles RETRY_AUTHORISED as a valid from-state.

(c) Missing edges to document: there is no TECHNICALLY_AFFECTED -> ABANDONED path.
If a student flags an issue and then the teacher decides the attempt should be
abandoned (not retried), there is no path. This is an edge case but worth a spec
note.

### JC-3: Email routing SLAs + AI_RESPONSE_FAILURE -> academic-support -- sound?

SLAs are reasonable for pilot: 1h COURSE, 2h COLLEGE, 4h GLOBAL for AI_RESPONSE_FAILURE.

The decision to route AI_RESPONSE_FAILURE to `academic-support@aps.pilot` (not
`tech-support@aps.pilot`) is correct. An AI failure that interrupted a student mid-
simulation has direct academic impact; it needs someone who can both assess technical
root cause and authorise a retry, not just a pure IT queue. The SLA of 1h for
COURSE scope is aggressive -- flag to operations that this SLA is what the student
will be told in the confirmation message, so it must be staffed accordingly.

One gap: MIC_DICTATION_FAILURE routes to `it-support@aps.pilot` with 4h SLA even at
COURSE scope. If dictation is the ONLY input method for the simulation, a 4h SLA is
effectively blocking the student from their assignment. Recommend the routing matrix
documentation note that MIC_DICTATION_FAILURE at COURSE should be treated as
assignment-blocking and the 4h SLA should be communicated as a worst-case, not a
target. Not a code change -- a product + operations note.

---

## Summary for Gal (implementation lead)

Must-fix before next increment:
1. BLOCKER-1: Fix `serverSideOnly` dead-code in troubleshoot.ts -- replace
   `steps.length === 2` with a boolean flag set at the conditional push point.
   Add a `recoveryGuidance` assertion in the test.
2. BLOCKER-2: Add `collegeId` to `CreateSupportTicketDto` + resolve COLLEGE scope in
   `createTicket`. The routing table has 12 rules; 4 of them (COLLEGE row) are
   currently unreachable.
3. BLOCKER-3: Change `diagnosticState` in `CreateTicketBodyDto` from bare `@IsObject()`
   to a `@ValidateNested()` typed DTO with the global ValidationPipe running
   `whitelist: true`. This prevents unknown keys from flowing through redaction.

Follow-up (next sprint):
- MAJOR-2: Collapse double-filter in listTechnicallyAffectedAttempts.
- MAJOR-3: Ticket ownership check in flagTechnicallyAffected.
- MAJOR-4: Sanitise userFreeText contract comment before real-email promotion.
- MINOR-1: Strengthen fallback routing test assertions.
- MINOR-2: Add ESLint no-restricted-imports on support/ directory for APS-REQ-111.
- MINOR-4: Persist teacherNote in attempt metadata, not just console.log.
- JC-2(b): Verify simulation-start transition guard handles RETRY_AUTHORISED.
