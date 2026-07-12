# Sprint 6 Independent Review -- Oren
# Round 1 | 2026-07-11 | Requester: Eco (CEO), standing quality gate
# Scope: Sprint-6 changes (S6-NOA-MIDDLEWARE, S6-GAL-ARCCONFIG, S6-GAL-DBSCRIPT)
#        + Sprint-5 four-fix spot-check + rehearsal-plan review
# PROVENANCE: Oren delivered in-session (Write scope excludes this path);
# Eco persisted as review of record. Fix status appended at bottom.

## VERDICT: APPROVE-WITH-CONDITIONS
0 BLOCKER | 0 MAJOR | 1 MINOR | 5 INFO

Core delivery sound. ArcDeltaConfig injection correctly wired through the @Global()
ConfigModule DI graph (AppConfig IS provided in production; @Optional() is test
ergonomics only). Middleware trust model correctly framed and implemented; route
matrix satisfies APS-REQ-145. All four S5 conditions confirmed applied.

## MINOR

M-1 -- apps/web/src/middleware.ts ROLE_ROUTES -- /feedback/** unmatched. It is in the
normal student flow (SimulationScreen navigates to /feedback/<attemptId>) and uses
RequireAuth client-side; middleware fails-open for it. Not an APS-REQ-145 violation
(that covers authoring/admin) but inconsistent with including /student and /simulation.
No data exposure (API enforces auth). FIX Option A (preferred): add
{ prefix: "/feedback", roles: [] } to ROLE_ROUTES. No re-review required.

## INFO

i-1 -- AuthProvider.storeRoleCookie omits the Secure attribute with no comment.
Necessary for HTTP pilot; APS-004 hardening replaces the cookie mechanism (httpOnly +
signed session). Add an intent comment so the production team knows it was deliberate.
i-2 -- Middleware.spec.ts Test 3 exercises /_next/static/*, which config.matcher
already excludes at runtime; defense-in-depth still fires so the test passes. A more
runtime-realistic public-prefix test would use /_next/data/*. Coverage of real routes
unaffected.
i-3 -- AppConfig.getFloat THROWS on a non-numeric env value at bootstrap (rather than
silent fallback). Valid -- safer than NaN propagation; a misconfigured ARC_* var fails
loud at startup.
i-4 -- Rehearsal plan: criterion (g) strongest evidence (support prompt log contains
no PatientStateLog/ground-truth fields) requires dev/debug logging; add to
prerequisites.
i-5 -- Rehearsal plan: criterion (i) needs a stated role-switch protocol
(logout/login single tab; confirm session before evidence screenshot).
Plus a time-risk flag: (h) 3-contiguous-session block at 11:30-13:00 compresses if the
10:00 block overruns; shift whole, never split.

## PRIORITY-AREA RESULTS

middleware.ts: route matrix covers /authoring (TEACHER/SYSTEM_ADMIN), /admin
(SYSTEM_ADMIN), /teacher (TEACHER/SYSTEM_ADMIN), /student + /simulation (any auth);
verified against the real route tree. Redirects: no cookie -> /login; wrong role ->
/403. PUBLIC_PREFIXES (login/403/demo/_next/favicon/api) block nothing that should be
open (invite flow is a /login query param, no separate route). Cookie parsing: absent/
empty -> /login; malformed value -> /403; multi-role CSV round-trips; no crash path.
Edge Runtime clean (no Node-only APIs).
AuthProvider.tsx: cookie written on BOTH login paths (only when /auth/me returns a
user), cleared on logout AND expired-token mount cleanup; SSR guards present;
roles.join(",")/split(",") round-trip correct; SameSite=Strict.
Middleware.spec.ts: 15/15 tests assert the actual matrix incl. no-cookie redirect,
STUDENT blocked from /authoring and /admin, TEACHER blocked from /admin, multi-role.
Mock infra correct, no new deps.
AppConfig/ArcWriterService: DI verified end-to-end (ConfigModule @Global() + exported;
AppModule imports it); all 6 ARC_* env keys map correctly; defaults exactly match
DEFAULT_ARC_DELTA_CONFIG (0.70/0.65/0.70, 0.15/0.10/0.10); pending-Adam-review comment
present in both files with env var names.
arc-config.spec.ts: 5 tests (envelope asked 4; +1 regression) -- default identity,
override, partial override, at-ceiling regression. Clean.
packages/db build script: present; tsc --noEmit intentional (no JS emit needed; CI
wants the script name). Clean.
jest.config.cjs: spec-pattern addition is additive; existing 28 tests still matched.

## REHEARSAL PLAN REVIEW

Nine criteria (a)-(i) complete vs cited sources; nothing missing or mischaracterized.
Pass/fail bars concrete; StubProvider caveat table accurate (FULLY TESTABLE e,f,g,h,i;
STRUCTURAL ONLY a,b,c,d; NOT TESTABLE: the 70% accuracy bar in c). NO-GO triggers
explicit and correct. Gaps: i-4, i-5, and the (h) schedule time-risk -- all
non-invalidating. Overall: SOLID; the 4-invariant checklist for (h) is rigorous.

## SPRINT-5 SPOT-CHECK: ALL FOUR CONFIRMED APPLIED

M1 guard-runner parenthesization + violations/suggestion defaults: CONFIRMED.
M2 org.service.ts arc-scope comment: CONFIRMED.
m3 SimulationScreen welfare-ack re-fire comment: CONFIRMED.
m4 handleSend welfare gate + dep array: CONFIRMED.

## FIX STATUS (Eco, 2026-07-11, same session)

- M-1: FIXED -- { prefix: "/feedback", roles: [] } added to ROLE_ROUTES with comment.
- i-1: FIXED -- Secure-omission intent comment added to storeRoleCookie.
- i-4/i-5/time-risk: FOLDED into rehearsal-plan-15aug-ido-2026-07-11.md as an addendum.
- i-2, i-3: accepted as-is (no change needed).
- Post-fix web gate re-run: see Sprint-6 close record on board APS-023.
