/**
 * RolesGuard unit tests (RBAC scope boundaries)
 * Coverage: TC-ROLE-01 through TC-ROLE-08 (scope enforcement).
 * 15-Aug rehearsal bar covered: Criterion G (support assistant cannot access patient state
 *   at the RBAC layer -- no TEACHER/SYSTEM_ADMIN role on support endpoints).
 *
 * Tests the RolesGuard in isolation using mocked ExecutionContext.
 * No DB required. No HTTP server required.
 */

import { RolesGuard } from "../rbac/roles.guard.js";
import { Reflector } from "@nestjs/core";
import { ForbiddenException } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import type { AuthTokenPayload } from "@aps/shared-types";

// Synthetic user payloads -- no real user data

function makeStudentPayload(courseId: string): AuthTokenPayload {
  return {
    sub: "student-test-001",
    email: "student-test@synthetic.test",
    scopes: [{ role: "STUDENT", scopeType: "COURSE", scopeId: courseId }],
    iat: 1000000,
    exp: 9999999,
  };
}

function makeTeacherPayload(courseId: string): AuthTokenPayload {
  return {
    sub: "teacher-test-001",
    email: "teacher-test@synthetic.test",
    scopes: [{ role: "TEACHER", scopeType: "COURSE", scopeId: courseId }],
    iat: 1000000,
    exp: 9999999,
  };
}

function makeAdminPayload(): AuthTokenPayload {
  return {
    sub: "admin-test-001",
    email: "admin-test@synthetic.test",
    scopes: [{ role: "SYSTEM_ADMIN", scopeType: "COLLEGE", scopeId: "college-001" }],
    iat: 1000000,
    exp: 9999999,
  };
}

function makeSupportStaffPayload(courseId: string): AuthTokenPayload {
  return {
    sub: "support-test-001",
    email: "support-test@synthetic.test",
    scopes: [{ role: "PROGRAMME_MANAGER", scopeType: "COURSE", scopeId: courseId }],
    iat: 1000000,
    exp: 9999999,
  };
}

/**
 * Build a minimal mock ExecutionContext that RolesGuard reads.
 * requiredRoles: what @RequiredRoles declared on the handler.
 * user: the JWT payload attached by JwtAuthGuard.
 * params: route params (courseId / collegeId extracted by guard).
 */
function makeContext(
  requiredRoles: string[],
  user: AuthTokenPayload,
  params: Record<string, string> = {},
): ExecutionContext {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(requiredRoles),
  } as unknown as Reflector;

  const context = {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user, params }),
    }),
  } as unknown as ExecutionContext;

  return context;
}

describe("RolesGuard -- student scope boundaries", () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  it("TC-ROLE-01: student is forbidden from TEACHER-only endpoints", () => {
    // TEACHER or SYSTEM_ADMIN required; student has neither
    const ctx = makeContext(
      ["TEACHER", "SYSTEM_ADMIN"],
      makeStudentPayload("course-a"),
      { courseId: "course-a" },
    );
    // Reflector is mocked inside makeContext; the guard reads requiredRoles from it
    // We need to patch the reflector on the guard instance
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["TEACHER", "SYSTEM_ADMIN"]);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("TC-ROLE-02: student JWT rejected on state-log endpoint (TEACHER / SYSTEM_ADMIN route)", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["TEACHER", "SYSTEM_ADMIN"]);
    const ctx = makeContext(
      ["TEACHER", "SYSTEM_ADMIN"],
      makeStudentPayload("course-a"),
      {},
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("TC-ROLE-08: student from Course A cannot access Course B scope", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["STUDENT"]);
    // Student has scope for course-a but request params say course-b
    const ctx = makeContext(
      ["STUDENT"],
      makeStudentPayload("course-a"),
      { courseId: "course-b" },
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("student can access own course scope endpoint", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["STUDENT"]);
    const ctx = makeContext(
      ["STUDENT"],
      makeStudentPayload("course-a"),
      { courseId: "course-a" },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });
});

describe("RolesGuard -- teacher scope boundaries", () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  it("TC-ROLE-03: teacher scoped to Course A cannot access Course B endpoint", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["TEACHER"]);
    const ctx = makeContext(
      ["TEACHER"],
      makeTeacherPayload("course-a"),
      { courseId: "course-b" },
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it("teacher can access own course endpoint", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["TEACHER"]);
    const ctx = makeContext(
      ["TEACHER"],
      makeTeacherPayload("course-a"),
      { courseId: "course-a" },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("TC-ROLE-05: teacher cannot access SYSTEM_ADMIN-only usage report", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["SYSTEM_ADMIN"]);
    const ctx = makeContext(
      ["SYSTEM_ADMIN"],
      makeTeacherPayload("course-a"),
      { collegeId: "college-001" },
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});

describe("RolesGuard -- SYSTEM_ADMIN bypass", () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  it("TC-ROLE-05: SYSTEM_ADMIN bypasses scope check and accesses any resource", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["TEACHER"]);
    // Admin has SYSTEM_ADMIN scope; scope check is bypassed regardless of params
    const ctx = makeContext(
      ["TEACHER"],
      makeAdminPayload(),
      { courseId: "any-course" },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("SYSTEM_ADMIN can access teacher-only state-log endpoint", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["TEACHER", "SYSTEM_ADMIN"]);
    const ctx = makeContext(
      ["TEACHER", "SYSTEM_ADMIN"],
      makeAdminPayload(),
      {},
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });
});

describe("RolesGuard -- no role requirement (public endpoints)", () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  it("allows request when no roles are required (open endpoint)", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue([]);
    const ctx = makeContext([], makeStudentPayload("course-a"), {});
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it("allows request when requiredRoles is undefined", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(undefined as any);
    const ctx = makeContext([], makeStudentPayload("course-a"), {});
    expect(guard.canActivate(ctx)).toBe(true);
  });
});

describe("RolesGuard -- TC-ROLE-07: support staff cannot access clinical endpoint", () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  it("PROGRAMME_MANAGER (support-like role) cannot access TEACHER-required transcript endpoint", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["TEACHER", "SYSTEM_ADMIN"]);
    const ctx = makeContext(
      ["TEACHER", "SYSTEM_ADMIN"],
      makeSupportStaffPayload("course-a"),
      { courseId: "course-a" },
    );
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});

describe("RolesGuard -- missing user payload throws ForbiddenException", () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  it("throws ForbiddenException if user is missing from request (no JWT)", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["STUDENT"]);
    const ctx = {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => ({ user: undefined, params: {} }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
