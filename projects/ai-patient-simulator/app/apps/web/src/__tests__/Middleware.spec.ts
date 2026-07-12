/**
 * Middleware.spec.ts -- Unit tests for src/middleware.ts (APS-014 S6-NOA-MIDDLEWARE).
 *
 * Tests the middleware() function directly by mocking next/server.
 * NextRequest is replaced by a plain object with the minimal shape the
 * middleware accesses: { nextUrl.pathname, url, cookies.get }.
 * NextResponse.next and NextResponse.redirect are jest.fn() stubs so we
 * can assert which branch was taken and what URL was passed.
 *
 * 15 required tests per envelope (S6-NOA-MIDDLEWARE-3).
 */

// ---------------------------------------------------------------------------
// Mock next/server -- must appear before any import that transitively uses it.
// jest.mock() is hoisted to the top of the compiled output by babel-jest / ts-jest.
// ---------------------------------------------------------------------------

jest.mock("next/server", () => ({
  NextResponse: {
    next: jest.fn(() => ({ __sentinel: "next" })),
    redirect: jest.fn((url: URL) => ({ __sentinel: "redirect", to: url.pathname })),
  },
}));

// ---------------------------------------------------------------------------
// Imports (executed after jest.mock setup due to hoisting).
// ---------------------------------------------------------------------------

import { middleware } from "../middleware";
import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Helper -- build a minimal mock request object.
// The middleware only reads: nextUrl.pathname, url, cookies.get("aps_mw_roles").
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeRequest(pathname: string, cookieValue: string | null): any {
  return {
    nextUrl: { pathname },
    url: `http://localhost${pathname}`,
    cookies: {
      get(name: string): { value: string } | undefined {
        if (name === "aps_mw_roles" && cookieValue !== null) {
          return { value: cookieValue };
        }
        return undefined;
      },
    },
  };
}

// Helper: get the pathname the last redirect was sent to.
function lastRedirectTo(): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calls = (NextResponse.redirect as jest.Mock).mock.calls as Array<[URL]>;
  // Non-null assertion: helper is only called after asserting redirect was called.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return calls[calls.length - 1]![0]!.pathname;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("middleware -- APS-014 route protection (APS-REQ-145)", () => {
  const MockNext = NextResponse.next as jest.Mock;
  const MockRedirect = NextResponse.redirect as jest.Mock;

  beforeEach(() => {
    MockNext.mockClear();
    MockRedirect.mockClear();
  });

  // -------------------------------------------------------------------------
  // Public paths -- always pass through regardless of cookie state.
  // -------------------------------------------------------------------------

  it("1. /login with no cookie: NextResponse.next() (public path, no redirect)", () => {
    middleware(makeRequest("/login", null));
    expect(MockNext).toHaveBeenCalledTimes(1);
    expect(MockRedirect).not.toHaveBeenCalled();
  });

  it("2. /login with STUDENT cookie: NextResponse.next() (public path, no redirect)", () => {
    middleware(makeRequest("/login", "STUDENT"));
    expect(MockNext).toHaveBeenCalledTimes(1);
    expect(MockRedirect).not.toHaveBeenCalled();
  });

  it("3. /_next/static/file.js with no cookie: NextResponse.next() (internal asset path)", () => {
    middleware(makeRequest("/_next/static/file.js", null));
    expect(MockNext).toHaveBeenCalledTimes(1);
    expect(MockRedirect).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // /authoring/** -- requires TEACHER or SYSTEM_ADMIN.
  // -------------------------------------------------------------------------

  it("4. /authoring/abc with no cookie: redirect to /login (unauthenticated)", () => {
    middleware(makeRequest("/authoring/abc", null));
    expect(MockRedirect).toHaveBeenCalledTimes(1);
    expect(lastRedirectTo()).toBe("/login");
  });

  it("5. /authoring/abc with STUDENT cookie: redirect to /403 (insufficient role)", () => {
    middleware(makeRequest("/authoring/abc", "STUDENT"));
    expect(MockRedirect).toHaveBeenCalledTimes(1);
    expect(lastRedirectTo()).toBe("/403");
  });

  it("6. /authoring/abc with TEACHER cookie: NextResponse.next() (authorized)", () => {
    middleware(makeRequest("/authoring/abc", "TEACHER"));
    expect(MockNext).toHaveBeenCalledTimes(1);
    expect(MockRedirect).not.toHaveBeenCalled();
  });

  it("7. /authoring/abc with SYSTEM_ADMIN cookie: NextResponse.next() (authorized)", () => {
    middleware(makeRequest("/authoring/abc", "SYSTEM_ADMIN"));
    expect(MockNext).toHaveBeenCalledTimes(1);
    expect(MockRedirect).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // /admin/** -- requires SYSTEM_ADMIN only.
  // -------------------------------------------------------------------------

  it("8. /admin/credits with no cookie: redirect to /login (unauthenticated)", () => {
    middleware(makeRequest("/admin/credits", null));
    expect(MockRedirect).toHaveBeenCalledTimes(1);
    expect(lastRedirectTo()).toBe("/login");
  });

  it("9. /admin/credits with TEACHER cookie: redirect to /403 (insufficient role)", () => {
    middleware(makeRequest("/admin/credits", "TEACHER"));
    expect(MockRedirect).toHaveBeenCalledTimes(1);
    expect(lastRedirectTo()).toBe("/403");
  });

  it("10. /admin/credits with SYSTEM_ADMIN cookie: NextResponse.next() (authorized)", () => {
    middleware(makeRequest("/admin/credits", "SYSTEM_ADMIN"));
    expect(MockNext).toHaveBeenCalledTimes(1);
    expect(MockRedirect).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // /teacher/** -- requires TEACHER or SYSTEM_ADMIN.
  // -------------------------------------------------------------------------

  it("11. /teacher/dashboard with STUDENT cookie: redirect to /403 (insufficient role)", () => {
    middleware(makeRequest("/teacher/dashboard", "STUDENT"));
    expect(MockRedirect).toHaveBeenCalledTimes(1);
    expect(lastRedirectTo()).toBe("/403");
  });

  // -------------------------------------------------------------------------
  // /student/** -- any authenticated user (cookie present).
  // -------------------------------------------------------------------------

  it("12. /student/dashboard with STUDENT cookie: NextResponse.next() (any auth user allowed)", () => {
    middleware(makeRequest("/student/dashboard", "STUDENT"));
    expect(MockNext).toHaveBeenCalledTimes(1);
    expect(MockRedirect).not.toHaveBeenCalled();
  });

  it("13. /student/dashboard with no cookie: redirect to /login (unauthenticated)", () => {
    middleware(makeRequest("/student/dashboard", null));
    expect(MockRedirect).toHaveBeenCalledTimes(1);
    expect(lastRedirectTo()).toBe("/login");
  });

  // -------------------------------------------------------------------------
  // /simulation/** -- any authenticated user (cookie present).
  // -------------------------------------------------------------------------

  it("14. /simulation/attempt-id with STUDENT cookie: NextResponse.next() (any auth user allowed)", () => {
    middleware(makeRequest("/simulation/attempt-id", "STUDENT"));
    expect(MockNext).toHaveBeenCalledTimes(1);
    expect(MockRedirect).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Multi-role cookie.
  // -------------------------------------------------------------------------

  it("15. /authoring/abc with TEACHER,SYSTEM_ADMIN cookie: NextResponse.next() (multi-role authorized)", () => {
    middleware(makeRequest("/authoring/abc", "TEACHER,SYSTEM_ADMIN"));
    expect(MockNext).toHaveBeenCalledTimes(1);
    expect(MockRedirect).not.toHaveBeenCalled();
  });
});
