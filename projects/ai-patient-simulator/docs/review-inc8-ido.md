# Code Review -- Increment 8 (Credit-Admin Backend + Both UIs)
# Reviewer: Ido (VP R&D) | Date: 2026-07-06

---

## Overall Verdicts

| Piece | Verdict |
|---|---|
| Credit-Admin Backend (service + controller + tests) | APPROVE-WITH-CONDITIONS |
| Case-Authoring UI (4-step flow) | APPROVE-WITH-CONDITIONS |
| Credit-Admin UI (dashboard + client + CSS) | APPROVE-WITH-CONDITIONS |

No piece is fully blocked, but each carries at least one condition that must close before
Sprint-3 integration wiring begins.

---

## PIECE 1 -- Credit-Admin Backend

### Verdict: APPROVE-WITH-CONDITIONS

Core contract (RBAC, $transaction, audit trail, reason enforcement) is sound and tests
cover it well. Two conditions must close; four minors are follow-up items.

---

### Finding B1 -- BLOCKER
**RBAC: COLLEGE_MANAGER leak between comment and code**

File: `apps/api/src/credit-admin/credit-admin.controller.ts` lines 14-17 and
`apps/web/src/components/admin/CreditAdminDashboard.tsx` line 7.

The controller comment says "COLLEGE_MANAGER deferred" and the @RequiredRoles decorator
correctly restricts to SYSTEM_ADMIN. But the CreditAdminDashboard.tsx component
comment on line 7 states "Admin-only tool: System Admin + College Manager roles."
This is a contradictory statement visible to any developer who reads both files.
More critically, `roles.guard.ts` lines 41 shows SYSTEM_ADMIN is given a bypass:
  "if (user.scopes.some((s) => s.role === 'SYSTEM_ADMIN')) return true;"
If a COLLEGE_MANAGER JWT were ever issued and this comment were treated as a spec by
Sprint-3 wiring, a developer could add COLLEGE_MANAGER to @RequiredRoles and the guard
would accept it without requiring a scope match against a specific resource (the guard
only scope-checks non-SYSTEM_ADMIN paths). This would give college managers visibility
into OTHER colleges' ledgers unless scope filtering is added to every service query.

The backend itself is fine today. The condition: update CreditAdminDashboard.tsx line 7
comment to accurately say "SYSTEM_ADMIN only (pilot); COLLEGE_MANAGER deferred" so the
comments across all files agree. No code logic change required -- documentation fix only.

Severity: Blocker because a contradictory spec comment in the UI file against a planned
future role is exactly the kind of thing that causes a security regression in the next
sprint if someone "finishes the task" by adding the role without adding scope filtering.

---

### Finding B2 -- BLOCKER
**Transaction mock does not enforce atomicity -- tests pass even if $transaction is bypassed**

File: `apps/api/src/__tests__/credit-admin.spec.ts` lines 174-177.

The mock $transaction implementation:
```
$transaction: jest.fn().mockImplementation(async (ops: unknown[]) => {
  return Promise.all(ops as Promise<unknown>[]);
}),
```
This resolves the operations in parallel, not as a real atomic batch. More importantly,
the service code at `credit-admin.service.ts` lines 243-258 passes an ARRAY of Prisma
operations to $transaction -- this is the "interactive transaction" pattern. But Prisma's
array-form $transaction expects operations to be Prisma promises (the client calls
creditEntry.create(...) which returns a Prisma operation), NOT arbitrary Promise<unknown>.

The test mock blindly calls Promise.all() on whatever it receives. If the service were
changed to use a callback-form transaction (the correct robust form), these tests would
silently continue to pass because the mock does not differentiate.

More concretely: the tests check that $transaction was called (line 354, 605, 689), but
they do NOT verify that BOTH the creditEntry.create AND the creditLedger.update calls
happen within the SAME $transaction call. A refactoring that accidentally moves one
operation outside the transaction would not be caught.

Condition: Add at least one test per mutating action that verifies the create and update
calls are included in the same $transaction invocation -- i.e., inspect the arguments
passed to $transaction and confirm both operations are present. The mock does not need to
be a real DB; it just needs to assert on call-args.

Example fix (applies to the ADMIN_ADD test and should be replicated for DEDUCT/RESET/BONUS):
```typescript
const txCall = (prisma.$transaction as jest.Mock).mock.calls[0];
const ops = txCall[0] as unknown[];
expect(ops).toHaveLength(2);
// ops[0] is the create promise, ops[1] is the update promise
```

---

### Finding M1 -- MAJOR
**getCollegeUsage fetches ALL entries for ALL ledgers in memory**

File: `apps/api/src/credit-admin/credit-admin.service.ts` lines 110-115.

```typescript
const ledgers = await (...).creditLedger.findMany({
  where: { collegeId },
  include: { entries: true },
});
```
No pagination, no limit on entries. A college with 20 courses each with 50,000 entries
(plausible in production after a year of use) would load 1,000,000 rows into memory to
compute totalDebited and totalCredited. getCourseUsage (lines 124-127) has the same
problem.

Fix: push the aggregation to the DB with a Prisma groupBy or raw query. This is a pilot
and the dataset is small today, but it should be flagged for Sprint-3 scaling work before
the pilot goes live.

---

### Finding M2 -- MAJOR
**AdminCreditActionBodyDto: @Min(0) allows amount=0 for non-RESET actions**

File: `apps/api/src/credit-admin/credit-admin.controller.ts` lines 61-63.

The validator applies @Min(0) to amount. For ADMIN_ADD, ADMIN_DEDUCT, and ADMIN_BONUS,
an amount of 0 produces a delta of 0, writes a CreditEntry with delta=0, and updates
the balance with no actual change. This is audit noise and creates misleading entries.

For ADMIN_RESET, amount=0 is meaningful (reset to 0). For the others it is a no-op that
should be rejected.

The service uses Math.abs(dto.amount) so a negative amount is converted to positive, but
0 passes through as 0. The @Min(0) on the DTO level means the controller accepts 0.
There is no service-level guard.

Fix: change @Min(0) to @Min(1) OR add a service-level check:
  if (dto.actionType !== "ADMIN_RESET" && dto.amount === 0) throw BadRequest.

---

### Finding m1 -- MINOR
**getLowBalanceLedgers fetches all ledgers with a softLimit set -- no pagination**

File: `apps/api/src/credit-admin/credit-admin.service.ts` lines 387-407.

The code comment acknowledges the JS-side filter is a pilot compromise, but there is
no comment noting the missing pagination. For a large system this could be a heavy
query. Acceptable for pilot; flag as a Sprint-3 tech-debt item.

---

### Finding m2 -- MINOR
**getActivityLog: collegeId + courseId filter is built with object spread that can
clobber the courseId onto the wrong key if both are present**

File: `apps/api/src/credit-admin/credit-admin.service.ts` lines 163-168.

```typescript
if (query.collegeId) {
  where["ledger"] = { collegeId: query.collegeId };
}
if (query.courseId) {
  where["ledger"] = { ...(where["ledger"] as object ?? {}), courseId: query.courseId };
}
```
If both are passed, the second assignment spreads the first object in correctly, so
this actually works. But the cast `as object ?? {}` is unnecessary (??  on a cast
always evaluates the cast, not the null check) and the pattern will confuse future
maintainers. Minor refactor recommended for clarity.

---

### Finding m3 -- MINOR
**Integration spec stubs are describe.skip blocks -- they will never run until someone
actively removes the skip**

File: `apps/api/src/__tests__/credit-admin.spec.ts` lines 948-987.

This is intentional (Docker down) and documented, but there is no tracking task to
ensure these are activated. Recommend creating a backlog item explicitly.

---

### Finding m4 -- MINOR
**PrismaLike shim lacks count on creditLedger -- could cause runtime failure**

File: `apps/api/src/credit-admin/credit-admin.service.ts` line 422.

```typescript
creditLedger: {
  ...
  count?: (args: unknown) => Promise<number>;   // optional
```
If a query path ever calls creditLedger.count() the optional field means it could be
undefined at runtime and throw "not a function". Not exercised today, but leaving it
optional is fragile. Should be required or removed.

---

## PIECE 2 -- Case-Authoring UI

### Verdict: APPROVE-WITH-CONDITIONS

The 4-step flow is correctly implemented. personaPrompt is read-only. hardOffRamp is
mandatory with a clinical safety notice. Rubric publish/lock UX is correct. RTL
logical properties are used throughout. One condition and two minors.

---

### Finding B3 -- BLOCKER (Authoring UI)
**Authoring route has no route-level access guard**

File: `apps/web/src/app/authoring/[templateId]/page.tsx`

The page component renders AuthoringShell with no auth check whatsoever. There is no
middleware, no role check, no redirect to login. The page comment says
"TEACHER/AUTHOR tool" but nothing enforces that. A student who navigates to
/authoring/any-id gets the full authoring UI.

This is a client-side-only finding -- the API endpoints presumably have their own
guards. But APS-REQ-145 demands student-visibility-NONE on admin/author surfaces, and
serving the authoring UI HTML to a student violates the spirit of that requirement.

Condition: Add a session/auth check in the page component (or in Next.js middleware) that
redirects unauthenticated or non-TEACHER/ADMIN users to /403 or /login before rendering
AuthoringShell.

Note: the credit-admin page (/admin/credits/page.tsx) has the same gap. Both pages are
"use client" and load data client-side, but there is no auth gate on the route itself.
This is captured here for the authoring page; see Finding B4 for the admin page.

---

### Finding M3 -- MAJOR (Authoring UI)
**Rubric: window.confirm used for unsaved-edits warning before publish**

File: `apps/web/src/components/authoring/RubricEditor.tsx` lines 454-458.

```typescript
const confirmed = window.confirm(
  "יש שינויים שלא נשמרו בחלק מהקריטריונים. להמשיך לפרסום בכל זאת?",
);
```
window.confirm is a browser dialog that:
(a) blocks the main thread
(b) is not styled -- looks out-of-place and unprofessional in RTL Hebrew context
(c) cannot be properly tested in Jest/JSDOM environments
(d) is not accessible by design (browser chrome, not part of the page's a11y tree)

Replace with an inline confirmation state rendered in the component (a styled
confirmation dialog or a two-step publish button with a "are you sure?" inline notice).

---

### Finding m5 -- MINOR (Authoring UI)
**TriggerRulesEditor: local "remove" does not call the API -- silently out of sync**

File: `apps/web/src/components/authoring/TriggerRulesEditor.tsx` lines 94-97.

The removeLocalRule function removes a rule from local state only. The component comment
documents this ("Local removal only -- the API has no DELETE on trigger rules in this
sprint"), which is honest. But the remove button has no visual indication that the rule
is still persisted on the server. A teacher who clicks "remove" sees the rule disappear
but it will reappear on next page load.

Fix: either disable the remove button with a tooltip explaining it is not yet wired, or
add an inline notice next to the button: "הסרה מקומית בלבד -- לא נמחק בשרת".
The current UX is misleading without explanation.

---

### Finding m6 -- MINOR (Authoring UI)
**AuthoringShell: rubric step can be reached without completing ground truth (canNavigateTo logic)**

File: `apps/web/src/components/authoring/AuthoringShell.tsx` lines 85-88.

```typescript
if (idx === 3 && template !== null) return true; // rubric can start after builder
```
Step 4 (rubric) is unlocked as soon as Step 1 (builder) is done, skipping Step 2
(ground truth). The comment says "rubric can start after builder" which is intentional.
However, the rubric is generated from the templateId, not from the ground truth, so
technically this is valid from an API perspective. But from a pedagogical/authoring
workflow perspective, generating a rubric without ground truth means the AI has no
patient facts to anchor criteria on.

This is a product decision, not a bug. Flag to Perry for review before Sprint-3.

---

## PIECE 3 -- Credit-Admin UI

### Verdict: APPROVE-WITH-CONDITIONS

The dashboard, action panel, audit log, activity log, alert config, and export stub are
all correctly implemented. RTL logical properties are used throughout. Numeric fields use
dir="ltr" with unicodeBidi: embed correctly. a11y is solid: table has aria-label,
progressbar has aria-valuenow/min/max, tablist/tab/tabpanel pattern is correct. One
condition (shared with authoring UI) and two minors.

---

### Finding B4 -- BLOCKER (Admin UI)
**Credit-admin route has no route-level access guard**

File: `apps/web/src/app/admin/credits/page.tsx`

Same issue as Finding B3. The page renders CreditAdminDashboard with no auth gate.
A student navigating to /admin/credits gets the full admin UI HTML and the mock data.
APS-REQ-145 student-visibility-NONE is not enforced at the route level.

Condition: same fix as B3 -- add session/auth middleware or a page-level redirect for
non-admin users.

---

### Finding M4 -- MAJOR (Admin UI)
**ActionPanel: amount field is optional for ADD/DEDUCT/BONUS actions**

File: `apps/web/src/components/admin/CreditAdminDashboard.tsx` lines 255-256.

```typescript
if (needsAmount && amount) payload.amount = parseInt(amount, 10);
```
If the user selects ADD, enters a reason, and submits with amount left blank, the
payload is sent with no amount field. The backend service uses Math.abs(dto.amount)
which will receive undefined and produce NaN, which Prisma will likely reject with a
500 error rather than a clean 400.

Additionally, the amount input has min="1" in the JSX (line 326) but no HTML required
attribute, so the browser's own validation does not fire.

Fix: validate amount is required and > 0 in handleSubmit before calling applyCreditAction,
OR add required attribute to the input.

---

### Finding m7 -- MINOR (Admin UI)
**Audit log: OVERRIDE_HARD_LIMIT shows amount as null ("--")**

File: `apps/web/src/components/admin/CreditAdminDashboard.tsx` lines 530-534.

The mock audit entry for OVERRIDE_HARD_LIMIT has amount: null (line 125 in client).
The UI renders "--" for null amounts, which is correct. But the audit trail for an
override is much more informative if the previous and new hard limit values are
displayed. The current UI loses this context.

This is minor because the reason field does capture intent, and the backend stores
previousHardLimit/newHardLimit in the OverrideHardLimitResult. The view model does
not currently surface these fields. Flag for Sprint-3 audit log enrichment.

---

### Finding m8 -- MINOR (Admin UI)
**The cadmin-college-total CSS class sets direction: ltr on the entire cell**

File: `apps/web/src/components/admin/credit-admin.css` lines 207-209.

```css
.cadmin-college-total {
  direction: ltr;
  unicode-bidi: embed;
}
```
This applies LTR direction to the full sentence, not just the numeric value. In RTL
context the Hebrew label text wraps awkwardly. The numeric span inside already applies
the cadmin-numeric class with ltr direction (CreditAdminDashboard.tsx lines 748-750).
Remove direction/unicode-bidi from .cadmin-college-total and rely on the inner
cadmin-numeric span only.

---

## Summary Table

| ID | Severity | Piece | File | Issue |
|---|---|---|---|---|
| B1 | Blocker | Backend | controller.ts + Dashboard.tsx | COLLEGE_MANAGER comment contradicts backend RBAC |
| B2 | Blocker | Backend | credit-admin.spec.ts | $transaction mock does not verify atomicity |
| B3 | Blocker | Authoring UI | authoring/[templateId]/page.tsx | No route-level auth guard |
| B4 | Blocker | Admin UI | admin/credits/page.tsx | No route-level auth guard |
| M1 | Major | Backend | credit-admin.service.ts | getCollegeUsage loads all entries in memory |
| M2 | Major | Backend | credit-admin.controller.ts | amount=0 allowed for ADD/DEDUCT/BONUS |
| M3 | Major | Authoring UI | RubricEditor.tsx | window.confirm for publish confirmation |
| M4 | Major | Admin UI | CreditAdminDashboard.tsx | amount blank sends undefined to API |
| m1 | Minor | Backend | credit-admin.service.ts | getLowBalanceLedgers no pagination flag |
| m2 | Minor | Backend | credit-admin.service.ts | activity filter pattern: redundant cast |
| m3 | Minor | Backend | credit-admin.spec.ts | integration skips lack a backlog ticket |
| m4 | Minor | Backend | credit-admin.service.ts | PrismaLike.creditLedger.count optional |
| m5 | Minor | Authoring UI | TriggerRulesEditor.tsx | local-only remove gives false impression |
| m6 | Minor | Authoring UI | AuthoringShell.tsx | rubric unlocked before ground truth -- product question |
| m7 | Minor | Admin UI | credit-admin-client.ts | override amount null loses limit delta context |
| m8 | Minor | Admin UI | credit-admin.css | ltr direction on parent cell, not just numeric |

---

## Conditions to Close Before Sprint-3 Wiring

1. B1: Fix COLLEGE_MANAGER comment in CreditAdminDashboard.tsx line 7.
2. B2: Add $transaction argument-inspection assertions to spec tests.
3. B3 + B4: Add route-level auth gate (middleware or page guard) to /authoring/[templateId]
   and /admin/credits before those routes are connected to real data.
4. M2: Reject amount=0 for non-RESET actions.
5. M4: Validate amount required for ADD/DEDUCT/BONUS in ActionPanel before submit.

M1 and M3 are pre-production scale items; they can be tracked as Sprint-3 backlog.
All other minors are follow-up with no Sprint-3 gate dependency.
