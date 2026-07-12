/**
 * middleware.ts -- Next.js Edge Runtime route protection (APS-014 S6-NOA-MIDDLEWARE).
 * Closes: APS-014 B3/B4 (APS-REQ-145 student-visibility-NONE on authoring/admin).
 *
 * SECURITY MODEL -- state plainly for reviewers:
 * This middleware is a UI-VISIBILITY GUARD only, NOT the security boundary.
 * Authoritative RBAC is enforced server-side in the NestJS API on every request,
 * regardless of what this middleware does or what the cookie contains.
 * A tampered aps_mw_roles cookie may expose a page shell but NEVER returns
 * protected data -- the API rejects every unauthorized call independently.
 *
 * Cookie design:
 * The aps_mw_roles cookie is non-httpOnly because JavaScript must be able to
 * clear it at logout (AuthProvider.clearRoleCookie). It is written client-side
 * by AuthProvider after fetchMe() resolves, so roles are always from the API.
 * Full httpOnly-cookie session + signature verification = pre-production path (APS-004).
 *
 * Redirect semantics:
 *   No cookie AND protected path  -> /login  (treat as unauthenticated)
 *   Cookie present, wrong role    -> /403
 *   Both match existing RequireRole.tsx client-side behavior; no UX change.
 *
 * Pre-existing logged-in users (token in localStorage, no aps_mw_roles cookie):
 *   Redirected to /login on next protected-path visit. Re-login writes the cookie
 *   and restores access. This is correct and expected rollout behavior.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that never require auth or role checks.
// Checked via startsWith so /login, /403, /demo, /api, /_next, /favicon.ico all pass.
const PUBLIC_PREFIXES = [
  "/login",
  "/403",
  "/demo",
  "/_next",
  "/favicon.ico",
  "/api",
];

// Protected route matrix (APS-REQ-145).
// Checked in order; first match wins.
// Empty roles array = any authenticated user (cookie present, any value).
const ROLE_ROUTES: { prefix: string; roles: string[] }[] = [
  { prefix: "/authoring", roles: ["TEACHER", "SYSTEM_ADMIN"] },
  { prefix: "/admin",     roles: ["SYSTEM_ADMIN"] },
  { prefix: "/teacher",   roles: ["TEACHER", "SYSTEM_ADMIN"] },
  { prefix: "/student",   roles: [] },
  { prefix: "/simulation", roles: [] },
  // Oren S6 review M-1: /feedback is in the student flow (SimulationScreen
  // navigates there) -- same any-authenticated bucket as /student and /simulation.
  { prefix: "/feedback",  roles: [] },
];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // 1. Public paths: always pass through -- no auth check.
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2. Find matching protected route (first prefix match wins).
  const route = ROLE_ROUTES.find((r) => pathname.startsWith(r.prefix));
  if (!route) {
    // Unlisted path: fail-open (pass through).
    // Role enforcement on unknown paths stays with RequireRole.tsx client-side.
    return NextResponse.next();
  }

  // 3. Read role cookie -- set by AuthProvider.storeRoleCookie() at login.
  const rawRoles = request.cookies.get("aps_mw_roles")?.value ?? "";
  const userRoles = rawRoles ? rawRoles.split(",") : [];

  // 4. No cookie = treat as unauthenticated -> redirect to /login.
  if (!rawRoles) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Role-specific path: check required roles.
  //    Empty route.roles means any authenticated user is allowed.
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
  // Run on all paths except Next.js static asset internals.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
