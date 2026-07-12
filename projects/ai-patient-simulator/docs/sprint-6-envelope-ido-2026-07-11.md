# Sprint 6 Task Envelopes
# Author: Ido (VP R&D) | Date: 2026-07-11 | Requester: Eco (CEO)
# Baseline: Sprint 5 close (2026-07-11) -- all gate checks GREEN
#   nest build exit 0 | engine 212/212 | api unit 276/0-fail/8-skip
#   api tsc 0 | integration 8/8 suites 78/0-fail/2-skip
#   web tsc 0 + 28/28 | E2E 34/34

---

## Standing constraints (carry from Sprint 5 unchanged)

- StubProvider only. No real LLM.
- No new npm dependencies. Any new dep: flag to gate, do not adopt.
  CA-INT-002/003 (supertest) remains on the tool-gate track, not Sprint 6 scope.
- No agent git commits. Owner commits from terminal.
- No agent contacts Adam. Owner relays only.
- Red line 3: no destructive commands without explicit A1 in this session.

---

## Sprint 6 scope

- Item 1: APS-014 B3/B4 -- Next.js middleware.ts server-side route protection (Noa, ~1.5 eng-days)
- Item 2a: Oren S5 m6 -- ArcDeltaConfig injectable via ConfigService (Gal, ~0.5 eng-days)
- Item 2b: packages/db missing build script (Gal, trivial ~0.1 eng-days)
- Item 3: 15-Aug rehearsal plan (separate doc, docs/rehearsal-plan-15aug-ido-2026-07-11.md)

Item 2 ruling on deferred items:
- Oren S5 m5 (arc context cached at attempt start): DEFER to production hardening.
  Reason: performance only, not correctness; benign at pilot scale; pre-APS-004 item.
- APS-014 m7/m2/m1/m4 (audit log delta context, activity filter cast, pagination comment,
  PrismaLike.count optional): DEFER. Not rehearsal-relevant. No correctness risk at pilot scale.
- APS-013 (multi-college): explicitly out of scope per Sprint 6 tasking.
- Dictation (Eyal-blocked route): out of scope.

Total Sprint 6 load: ~2.1 eng-days (Noa 1.5 + Gal 0.6 + Adi 0.5 for gate regression).
Sprint window: 2026-07-14 to 2026-07-25. Target close well before Adam 2026-08-08 checkpoint.

---

## Item 1: APS-014 B3/B4 -- NEXT.JS MIDDLEWARE

### Architectural ruling (Ido, 2026-07-11)

Token storage: JWT lives in localStorage, key "aps_access_token" (http.ts line 6;
AuthProvider.tsx TOKEN_KEY). Next.js middleware.ts runs at Edge Runtime (server-side) and
cannot access localStorage. Verdict: token NOT middleware-readable in current architecture.
Sources read: apps/web/src/lib/http.ts, apps/web/src/lib/auth/AuthProvider.tsx,
apps/web/src/components/auth/RequireRole.tsx (comment at line 5 states this explicitly),
apps/web/src/app/authoring/[templateId]/page.tsx (comment at line 11 states this explicitly).

Minimal change ruling (client-side cookie mirror -- Noa scope, no API change):
At login, after fetchMe() resolves (user roles now known from MeResponse), write a
non-httpOnly cookie: "aps_mw_roles=<comma-separated-roles>; path=/; SameSite=Strict".
At logout and on fetchMe() returning null (expired token), clear the cookie.
Middleware.ts reads this cookie to make server-side routing decisions before page render.

Security posture (state plainly):
- The cookie is NOT httpOnly because JavaScript must be able to clear it at logout.
- This prevents the APS-REQ-145 violation of serving authoring/admin HTML to students.
- The API still enforces RBAC on every call regardless of middleware state.
- Full httpOnly-cookie session + proper signature verification = pre-production path (APS-004 gate).

Redirect semantics ruling:
- No cookie AND protected path: redirect to /login.
- Cookie present, insufficient role on role-specific path: redirect to /403.
- Both match existing RequireRole.tsx client-side behavior. No UX change.

Protected route matrix (APS-REQ-145 focus):
| Path prefix | Required roles | Reason |
|-------------|----------------|--------|
| /authoring/** | TEACHER, SYSTEM_ADMIN | APS-REQ-145 student-visibility-NONE on authoring |
| /admin/** | SYSTEM_ADMIN | APS-REQ-145 student-visibility-NONE on admin |
| /teacher/** | TEACHER, SYSTEM_ADMIN | Role-restricted surface |
| /student/** | any authenticated | Logged-in only; STUDENT is primary user |
| /simulation/** | any authenticated | Logged-in only |

Public paths (always pass through -- no check):
/login, /403, /demo, /_next, /favicon.ico, /api

---

### Envelope: Noa (S6-NOA-MIDDLEWARE)

task_id: S6-NOA-MIDDLEWARE
effort: ~1.5 eng-days
priority: P1
start: 2026-07-14 (no dependencies)

#### Permitted Bash commands (Rambo C3 -- exhaustive list, web scope only)

1. `pnpm --filter @aps/web dev` -- start dev server only
2. `pnpm --filter @aps/web build` -- production build check
3. `pnpm --filter @aps/web typecheck` -- tsc --noEmit scoped to web
4. `pnpm --filter @aps/web lint` -- eslint scoped to web
5. `pnpm --filter @aps/web test` -- jest scoped to web
6. `jest --testPathPattern apps/web` -- alternative scoped jest run

No backend filters. No migrations. No docker. No git. Any command not on this list: stop, flag to Ido.

---

#### S6-NOA-MIDDLEWARE-1 -- Cookie mirror at login/logout (AuthProvider.tsx)

File: apps/web/src/lib/auth/AuthProvider.tsx

Changes:
1. Add two helpers alongside the existing storeToken/clearToken/loadToken helpers:
   - `storeRoleCookie(roles: string[]): void`
     Body: `document.cookie = "aps_mw_roles=" + roles.join(",") + "; path=/; SameSite=Strict";`
     Guard: check `typeof document !== "undefined"` before writing (SSR safety).
   - `clearRoleCookie(): void`
     Body: `document.cookie = "aps_mw_roles=; path=/; SameSite=Strict; max-age=0";`
     Guard: same SSR check.

2. Call storeRoleCookie after fetchMe() resolves in BOTH login paths:
   - `loginWithInvite`: after `const me = await fetchMe(resp.accessToken)`, call
     `if (me) storeRoleCookie(me.roles ?? []);`
   - `loginWithEmail`: same pattern.

3. Call clearRoleCookie() in logout():
   - After `clearToken()`, add `clearRoleCookie();`.

4. On fetchMe returning null during mount hydration: also clear the cookie so a user with
   an expired localStorage token does not retain a stale role cookie:
   - In the useEffect mount block, after `fetchMe(token).then(me => { setUser(me); ... })`,
     if me is null call `clearRoleCookie();`.

No change to localStorage logic (localStorage path is unchanged; this is additive only).
No new npm deps. No behavior change to existing auth flow.

---

#### S6-NOA-MIDDLEWARE-2 -- middleware.ts (new file)

File: apps/web/src/middleware.ts (NEW)

Implementation:
```
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that never require auth or role checks.
const PUBLIC_PREFIXES = ["/login", "/403", "/demo", "/_next", "/favicon.ico", "/api"];

// Paths that require authentication (any logged-in user) and a specific role.
// Checked in order; first match wins.
// Empty roles array = any authenticated user.
const ROLE_ROUTES: { prefix: string; roles: string[] }[] = [
  { prefix: "/authoring", roles: ["TEACHER", "SYSTEM_ADMIN"] },
  { prefix: "/admin",     roles: ["SYSTEM_ADMIN"] },
  { prefix: "/teacher",   roles: ["TEACHER", "SYSTEM_ADMIN"] },
  { prefix: "/student",   roles: [] },
  { prefix: "/simulation",roles: [] },
];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // 1. Public paths: pass through.
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2. Find matching protected route.
  const route = ROLE_ROUTES.find((r) => pathname.startsWith(r.prefix));
  if (!route) {
    // Unknown path: pass through (fail-open for unlisted routes).
    return NextResponse.next();
  }

  // 3. Read role cookie (set client-side at login).
  const rawRoles = request.cookies.get("aps_mw_roles")?.value ?? "";
  const userRoles = rawRoles ? rawRoles.split(",") : [];

  // 4. No cookie = unauthenticated.
  if (!rawRoles) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Role-specific path: check required roles.
  if (route.roles.length > 0) {
    const hasRole = route.roles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      const forbiddenUrl = new URL("/403", request.url);
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Run on all paths except static assets that Next.js handles internally.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

NOTE: this is the target implementation shape. No signature verification of the role cookie
(the cookie value is informational/UX; API enforces RBAC independently). If `aps_mw_roles`
is absent for a user who has a valid token but has not yet re-logged-in after this sprint ships,
they will be redirected to /login and must log in again. This is acceptable and correct behavior
(stale session without the new cookie = treat as unauthenticated for server-side guard purposes).

---

#### S6-NOA-MIDDLEWARE-3 -- Tests

File: apps/web/src/__tests__/Middleware.spec.ts (NEW)
Jest can test middleware.ts as a function (mock NextRequest/NextResponse from "next/server").
Use jest.mock or a local mock helper to simulate `NextRequest` with cookies and URL.

Required tests:

1. Public path /login -- no cookie: NextResponse.next() (no redirect). PASS.
2. Public path /login -- with role cookie STUDENT: NextResponse.next() (no redirect). PASS.
3. Internal path /_next/static/file.js -- no cookie: NextResponse.next(). PASS.
4. Protected path /authoring/abc -- no cookie: redirect to /login. PASS.
5. Protected path /authoring/abc -- cookie STUDENT: redirect to /403. PASS.
6. Protected path /authoring/abc -- cookie TEACHER: NextResponse.next(). PASS.
7. Protected path /authoring/abc -- cookie SYSTEM_ADMIN: NextResponse.next(). PASS.
8. Protected path /admin/credits -- no cookie: redirect to /login. PASS.
9. Protected path /admin/credits -- cookie TEACHER: redirect to /403. PASS.
10. Protected path /admin/credits -- cookie SYSTEM_ADMIN: NextResponse.next(). PASS.
11. Protected path /teacher/dashboard -- cookie STUDENT: redirect to /403. PASS.
12. Protected path /student/dashboard -- cookie STUDENT: NextResponse.next(). PASS.
13. Protected path /student/dashboard -- no cookie: redirect to /login. PASS.
14. Protected path /simulation/attempt-id -- cookie STUDENT: NextResponse.next(). PASS.
15. Cookie with multiple roles (TEACHER,SYSTEM_ADMIN): authoring path -> NextResponse.next(). PASS.

Note on mock approach: next/server types are available as devDependencies (Next.js 14).
Mock NextRequest by constructing a plain object with `cookies.get()` and `nextUrl.pathname`.
Mock NextResponse.redirect and NextResponse.next as jest.fn() stubs. No new deps needed.

---

#### Acceptance criteria (Noa -- middleware)

- pnpm --filter @aps/web typecheck: 0 errors (middleware.ts + AuthProvider.tsx changes).
- pnpm --filter @aps/web test: 28+ existing PASS + 15 new Middleware.spec.ts tests PASS.
- All 15 Middleware.spec.ts tests PASS (listed above).
- AuthProvider.tsx: storeRoleCookie called after loginWithInvite and loginWithEmail fetchMe
  resolves; clearRoleCookie called in logout and on null fetchMe at mount.
- Manual check: navigate to /authoring/* without a session cookie -> browser redirects to /login.
- Manual check: log in as student, navigate to /authoring/* -> browser redirects to /403.
- No new npm dependencies added.

---

## Item 2a: ArcDeltaConfig INJECTABLE VIA ConfigService

### Background

Oren S5 m6 finding (review-sprint-5-oren.md): "ArcDeltaConfig hardcoded at construction;
Adam's 2026-08-08 calibration requires a code edit." The 2026-08-08 Adam review checkpoint
(sprint-5-envelope section "2026-08-08 Adam review checkpoint") requires Adam to confirm
delta model coherence across 3 sessions. If Adam requests calibration changes (e.g. lower
maxTrust from 0.70 to 0.60), those should be a config change not a code edit. Sprint 6
delivers that before the 2026-08-08 checkpoint.

No behavior change on StubProvider. No schema migration. No new npm deps.

---

### Envelope: Gal (S6-GAL-ARCCONFIG)

task_id: S6-GAL-ARCCONFIG
effort: ~0.5 eng-days
priority: P1 (date-driven: must be done before 2026-08-08 Adam checkpoint)
start: 2026-07-14 (no dependencies)

#### Permitted Bash commands (Rambo C3 -- exhaustive list, api/db scope only)

1.  `pnpm --filter @aps/api build` -- nest build
2.  `pnpm --filter @aps/api test` -- jest unit suite
3.  `pnpm --filter @aps/api test:integration` -- live-Postgres integration suite
4.  `pnpm --filter @aps/api exec tsc --noEmit` -- typecheck
5.  `pnpm --filter @aps/db migrate dev --name <migration_name>` -- dev migration
6.  `pnpm --filter @aps/db migrate deploy` -- apply pending migrations
7.  `pnpm --filter @aps/db generate` -- regenerate Prisma client
8.  `pnpm --filter @aps/db seed` -- re-seed
9.  `node apps/api/src/scripts/e2e-golden-path.mjs` -- E2E runner

No web filters. No docker. No git. Any command not on this list: stop, flag to Ido.

---

#### Scope

1. Read the current ArcDeltaConfig construction location (arc-delta-config.ts or equivalent).
   Identify the six hardcoded values:
   maxTrust=0.70, maxOpenness=0.65, maxAlliance=0.70
   minTrust=0.15, minOpenness=0.10, minAlliance=0.10

2. Wire each value to NestJS ConfigService (already used in the app) with env-var keys:
   ARC_MAX_TRUST    (default 0.70)
   ARC_MAX_OPENNESS (default 0.65)
   ARC_MAX_ALLIANCE (default 0.70)
   ARC_MIN_TRUST    (default 0.15)
   ARC_MIN_OPENNESS (default 0.10)
   ARC_MIN_ALLIANCE (default 0.10)
   If env vars absent: defaults are unchanged. StubProvider behavior: identical.

3. Use the ConfigService injection pattern already established in the app
   (constructor injection or forRootAsync). Do NOT add a new external config library.

4. Retain the comment "PENDING ADAM REVIEW BEFORE PRODUCTION GO-LIVE" on the default values
   in the config registration. Add a code comment listing the env var names so Adam's
   calibration operator knows what to set.

5. No migration required. No schema change. No new deps.

Unit tests:
- Default values: when no env vars set, ArcDeltaConfig values equal the engineering defaults.
  PASS.
- Override via ConfigService mock: mock ConfigService.get("ARC_MAX_TRUST") -> 0.60; assert
  ArcDeltaConfig.maxTrust = 0.60. PASS.
- Override partial: only ARC_MAX_TRUST set; other values use defaults. PASS.
- Clamp test still passes after refactor: trust at maxTrust + positive delta -> stays <= maxTrust.
  (Regression on existing ceiling-clamp unit tests -- all must still PASS.)

---

## Item 2b: packages/db BUILD SCRIPT

### Envelope: Gal (S6-GAL-DBSCRIPT)

task_id: S6-GAL-DBSCRIPT
effort: trivial (~0.1 eng-days; can do in the same session as S6-GAL-ARCCONFIG)
priority: P2

#### Scope

File: packages/db/package.json

Current state (verified by reading): scripts section has "generate", "migrate",
"migrate:deploy", "typecheck", "seed" -- but NO "build" script.

Fix: add to scripts block:
  "build": "tsc --noEmit"

This matches the existing "typecheck" script and allows CI to run
`pnpm --filter @aps/db build` without a "missing script: build" error.

NOTE: packages/db has no TypeScript source files to compile to JS (Prisma generates the
client as JS). "tsc --noEmit" is effectively a typecheck run -- correct for CI purposes.

Verify: `pnpm --filter @aps/db build` exits 0 after the change.

No unit test needed. Verification = exit code 0 on the command above.

---

## Adi (S6-ADI-GATE -- regression gate)

task_id: S6-ADI-GATE
effort: ~0.5 eng-days
priority: P1
start: after Noa S6-NOA-MIDDLEWARE and Gal S6-GAL-ARCCONFIG complete
purpose: confirm all Sprint-6 changes land cleanly with no regressions

#### Permitted Bash commands (Rambo C3 -- exhaustive list, test-run scope only)

1. `pnpm --filter @aps/engine-test-harness test` -- engine test harness
2. `pnpm --filter @aps/api test` -- api unit suite
3. `pnpm --filter @aps/api test:integration` -- integration suite
4. `pnpm --filter @aps/web test` -- web unit suite
5. `node apps/api/src/scripts/e2e-golden-path.mjs` -- E2E runner

No build commands. No migrations. No git. Any command not on this list: stop, flag to Ido.

#### Scope

1. Run all five commands above in order.
2. Confirm gate bar numbers hold (see Sprint-6 DoD below).
3. Confirm new Middleware.spec.ts tests are in the web test count and all PASS.
4. Confirm existing arc-coherence + E2E arc tests (29-34) still PASS (no regression from
   ArcDeltaConfig ConfigService refactor on StubProvider paths).
5. Deliver a short sign-off note to Ido: gate numbers, any findings.

---

## Sequencing

```
Day 0 (2026-07-14 -- no deps):
  Noa: S6-NOA-MIDDLEWARE-1 (cookie mirror in AuthProvider.tsx)
  Noa: S6-NOA-MIDDLEWARE-2 (middleware.ts -- can parallel AuthProvider changes)
  Gal: S6-GAL-ARCCONFIG (ArcDeltaConfig -> ConfigService)
  Gal: S6-GAL-DBSCRIPT (packages/db build script -- minutes)

Day 1:
  Noa: S6-NOA-MIDDLEWARE-3 (tests)

Day 1-2:
  Adi: S6-ADI-GATE (after Noa + Gal complete)
  All: sprint gate check (DoD below)
```

No coordination points between Noa and Gal items (fully independent).
Adi starts after both Noa and Gal confirm their items are done.

---

## Sprint 6 Definition of Done

Sprint closes when ALL items below are GREEN.

### Gate bar (preserve Sprint 5 close -- all must hold)

1. `pnpm --filter @aps/api build` (nest build): exit 0.
2. `pnpm --filter @aps/engine-test-harness test`: 212/212+ PASS.
3. `pnpm --filter @aps/api test`: 276+/0-fail/<=8-skip.
4. `pnpm --filter @aps/api exec tsc --noEmit`: 0 errors.
5. `pnpm --filter @aps/api test:integration`: 8/8 suites / 78+/0-fail/<=2-skip.
6. `pnpm --filter @aps/web exec tsc --noEmit` (or typecheck): 0 errors.
7. `pnpm --filter @aps/web test`: 28+ existing PASS + new Middleware.spec.ts tests PASS.
8. E2E golden path: 34/34 PASS (no regression; arc steps 29-34 unchanged).

### Feature gates (Sprint 6 additions)

9.  middleware.ts: protects /authoring/**, /admin/**, /teacher/**, /student/**,
    /simulation/** per route matrix above. Unauthenticated -> /login.
    Wrong-role (STUDENT on /authoring or /admin) -> /403. All 15 Middleware.spec.ts PASS.

10. AuthProvider.tsx: aps_mw_roles cookie written after both login paths resolve;
    cleared at logout; cleared when fetchMe returns null at mount.

11. ArcDeltaConfig: values driven by ConfigService with env-var keys (ARC_MAX_TRUST etc.);
    defaults unchanged (0.70/0.65/0.70/0.15/0.10/0.10); unit tests PASS including override.
    Existing arc ceiling-clamp tests: all PASS (regression gate).
    Comment "PENDING ADAM REVIEW BEFORE PRODUCTION GO-LIVE" retained with env-var names listed.

12. packages/db build script: "build": "tsc --noEmit" added to package.json scripts;
    `pnpm --filter @aps/db build` exits 0.

---

*Ido (VP R&D) | 2026-07-11 | Sprint 6 | Target close: 2026-07-18 (well before 2026-08-08 Adam checkpoint)*

---

## Gal delivery notes -- S6-GAL-ARCCONFIG + S6-GAL-DBSCRIPT
*Gal (Lead Developer) | 2026-07-11*

### S6-GAL-ARCCONFIG: ArcDeltaConfig injectable via AppConfig -- DONE

Design choice: the app uses a custom AppConfig class (not @nestjs/config ConfigService).
The established pattern (used in LlmModule etc.) is constructor injection of AppConfig.
I followed that pattern exactly -- no new config library added.

Key design decision: AppConfig is declared @Optional() in the ArcWriterService constructor.
This means:
- NestJS DI (real app): AppConfig is @Global() and always injected; env vars override defaults.
- Unit tests (direct new ArcWriterService(prisma)): AppConfig is undefined; falls back to
  DEFAULT_ARC_DELTA_CONFIG spread. Existing W1-W9 tests pass unchanged (no modification needed).

Files changed:
- apps/api/src/config/app.config.ts: added getFloat() private helper + 6 ARC_* fields
  (arcMaxTrust / arcMaxOpenness / arcMaxAlliance / arcMinTrust / arcMinOpenness / arcMinAlliance)
  with PENDING ADAM REVIEW comment and env var names listed.
- apps/api/src/simulation/arc/arc-writer.service.ts: import Optional + AppConfig; constructor
  now accepts @Optional() appConfig; builds ArcDeltaConfig from appConfig when present.
- apps/api/src/__tests__/arc-config.spec.ts: NEW -- 5 tests (C1, C1b, C2, C3, C4).
  C1/C1b: defaults when no AppConfig. C2: override arcMaxTrust=0.60 -> trust 0.95 clamped to 0.60.
  C3: partial override (only arcMaxTrust). C4: clamp regression on AppConfig path.

No deviations from envelope scope. No new deps. No migration.

### S6-GAL-DBSCRIPT: packages/db build script -- DONE

File changed:
- packages/db/package.json: added "build": "tsc --noEmit" to scripts block (first entry).

No deviations. pnpm --filter @aps/db build exits 0 (confirmed).

### Gate results (2026-07-11)

| Check | Result | Notes |
|-------|--------|-------|
| pnpm --filter @aps/api exec tsc --noEmit | 0 errors | |
| pnpm --filter @aps/api build (nest build) | exit 0 | |
| pnpm --filter @aps/api test | 281/0-fail/8-skip (18 suites) | +5 new arc-config tests |
| pnpm --filter @aps/api test:integration | 8/8 suites / 78/0-fail/2-skip | arc coherence + arc.integration PASS |
| pnpm --filter @aps/db build | exit 0 | new script confirmed |

Baseline preserved: 276->281 unit tests (5 new arc-config), 8-skip unchanged, 0 fail unchanged.
Arc integration tests (arc-coherence + arc.integration) all PASS -- ceiling/floor behavior identical.
Status: DONE. Ready for Adi S6-ADI-GATE when Noa S6-NOA-MIDDLEWARE is also complete.

---

## Noa delivery notes -- S6-NOA-MIDDLEWARE
*Noa (Senior Developer 2) | 2026-07-11*

### S6-NOA-MIDDLEWARE: Next.js middleware route protection -- DONE

Status: all acceptance criteria met. APS-014 B3/B4 closed.

### Files changed

- apps/web/src/middleware.ts (NEW): Edge Runtime route guard per route matrix.
  Public prefixes pass through. Protected routes check aps_mw_roles cookie.
  No cookie -> redirect /login. Wrong role -> redirect /403. Multi-role cookie handled.
  Security framing comment in header: middleware is UI-visibility guard only;
  API enforces authoritative RBAC independently on every call.

- apps/web/src/lib/auth/AuthProvider.tsx (UPDATED): added storeRoleCookie() and
  clearRoleCookie() helpers (document guard for SSR safety). Wired as follows:
  loginWithInvite: storeRoleCookie(me.roles ?? []) after fetchMe resolves, if me non-null.
  loginWithEmail: same.
  logout: clearRoleCookie() after clearToken().
  mount useEffect: clearRoleCookie() when fetchMe returns null (expired token cleanup).
  All changes are additive; existing localStorage token logic is unchanged.

- apps/web/src/__tests__/Middleware.spec.ts (NEW): 15 tests per envelope spec.
  All 15 PASS.

- apps/web/jest.config.cjs (UPDATED): added *.spec.ts and *.spec.tsx patterns to
  testMatch so Middleware.spec.ts is picked up. See off-envelope note below.

### Gate results (2026-07-11)

| Check | Result | Notes |
|-------|--------|-------|
| pnpm --filter @aps/web typecheck (tsc --noEmit) | 0 errors | middleware.ts clean |
| pnpm --filter @aps/web test | 43/43 PASS (8 suites) | 28 existing + 15 new |
| Middleware.spec.ts (all 15 tests) | PASS | |
| E2E (34/34) | unaffected | E2E talks to :3001 directly, never through Next.js |

### Rollout note (confirmed behavior)

Pre-existing logged-in users who have a valid JWT in localStorage but no
aps_mw_roles cookie (anyone logged in before this sprint ships) will be redirected
to /login on their first protected-path navigation after deployment.
Re-login writes the cookie and restores access immediately.
This is correct behavior: no cookie = treat as unauthenticated for server-side guard.
The client-side RequireRole.tsx continues to work independently if the cookie is
missing for any reason (defense in depth at the UI layer).

### Off-envelope notes (deviations to flag)

1. jest.config.cjs testMatch: the envelope specified Middleware.spec.ts but the
   existing testMatch only caught *.test.ts / *.test.tsx -- no spec pattern.
   Fix: added *.spec.ts and *.spec.tsx to testMatch. Minimal config change,
   no new deps, no behavior change for existing test files. Named the file
   Middleware.spec.ts exactly as the envelope specified.

No other deviations. No new npm deps. No changes outside apps/web. No migration.
StubProvider unaffected. Hebrew RTL unaffected. E2E unaffected.

---

## Adi S6-ADI-GATE -- QA sign-off
*Adi (QA Engineer) | 2026-07-11*

**Verdict: CONDITIONAL -- suites 1-4 PASS, E2E blocked by stale seed (environment, not code)**

### Suite results

| Suite | Command | Expected | Actual | Result |
|-------|---------|----------|--------|--------|
| Engine harness | pnpm --filter @aps/engine-test-harness test | 212/212 | 212/212 (11 suites) | PASS |
| API unit | pnpm --filter @aps/api test | 281+/0-fail/8-skip | 281/0-fail/8-skip (18 suites) | PASS |
| API integration | pnpm --filter @aps/api test:integration | 8/8 suites 78+/0-fail/2-skip | 8/8 suites 78/0-fail/2-skip | PASS |
| Web unit | pnpm --filter @aps/web test | 43/43 | 43/43 (8 suites) | PASS |
| E2E golden path | node apps/api/src/scripts/e2e-golden-path.mjs | 34/34 | 8/34 | FAIL (env) |

### E2E root cause -- stale seed (FLAGGED TO ECO)

Step 2 (create attempt) returns HTTP 404 "Assignment not found".
Assignment seed-asgn--0001-0000-0000-000000000001 is not present in the database.
Student login (step 1) passes -- user accounts exist. The assignment record does not.
Diagnosis: environment issue (stale seed), not a code regression.
Evidence: curl probe returned {"message":"Assignment not found","error":"Not Found","statusCode":404}.
Sprint 6 code changes (middleware.ts, ArcWriterService AppConfig injection, db package.json)
do not touch the assignment table or attempt-creation path.
Per envelope constraint: re-seed is needed; I may not run it. Flagged to Eco for action.

### Acceptance criteria spot-checks

- Middleware test 4: /authoring/abc no cookie -> redirect /login. VERIFIED in source + run.
- Middleware test 5: /authoring/abc STUDENT cookie -> redirect /403. VERIFIED in source + run.
- Middleware tests 8-9: /admin/** no-cookie -> /login, TEACHER -> /403. VERIFIED.
- All 15 Middleware.spec.ts tests present and match envelope spec exactly. PASS.
- Arc-config C1b: default identity -- maxTrust 0.70 enforced without AppConfig. VERIFIED.
- Arc-config C2: override arcMaxTrust=0.60 -> clamp to 0.60. VERIFIED.
- Arc-config C3: partial override -- openness and alliance fall back to defaults. VERIFIED.
- Arc-config C4: clamp regression on AppConfig path. VERIFIED.
- Arc integration tests (arc-coherence + arc.integration): all PASS. ArcDeltaConfig refactor
  introduces no regression on StubProvider path.
- Web suite total: 43 = 28 existing + 15 new Middleware.spec.ts. Count confirmed.

### Gate summary

Suites 1-4 are clean. All Sprint 6 code changes are regression-free at the unit and
integration level. E2E cannot close until the database is re-seeded.
Action required from Eco/Ido: authorize and run pnpm --filter @aps/db seed, then re-run
node apps/api/src/scripts/e2e-golden-path.mjs to close the gate.

*Adi (QA Engineer) | S6-ADI-GATE | 2026-07-11*
