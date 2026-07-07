/**
 * AuthService unit tests
 * Coverage: TC-AUTH-01 (valid invite + code), TC-AUTH-02 (wrong code -> 401),
 *           TC-AUTH-04 (wrong scope cross-course check in JWT payload),
 *           TC-AUTH-05 (invalid token -> 401), TC-AUTH-06 (diagnostic log note).
 * 15-Aug rehearsal bar covered: Criterion E is partly validated (session established
 *   with correct role/scope in JWT), plus auth failure paths.
 *
 * Prisma and JWT are fully mocked. No DB required. No network.
 *
 * NOTE: TC-AUTH-03 (expired invite link expiry timestamp) requires a DB column for
 * invite link expiry that is not yet in the Sprint 1 schema -- deferred to Sprint 2.
 */

import { AuthService } from "../auth/auth.service.js";
import { AuthController } from "../auth/auth.controller.js";
import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";

// Synthetic user data -- no real user data anywhere
const SYNTHETIC_USER = {
  id: "user-test-001",
  email: "testuser@synthetic.test",
  inviteToken: "valid-invite-token-abc",
  passwordHash: null as string | null,
  accessCode: null as string | null,
  roleAssignments: [
    { role: "STUDENT", scopeType: "COURSE", scopeId: "course-test-a" },
  ],
};

const SYNTHETIC_TEACHER = {
  id: "teacher-test-001",
  email: "teacher@synthetic.test",
  inviteToken: null,
  passwordHash: null as string | null,
  accessCode: null,
  roleAssignments: [
    { role: "TEACHER", scopeType: "COURSE", scopeId: "course-test-a" },
  ],
};

function makeJwtService() {
  return {
    sign: jest.fn().mockReturnValue("stub.jwt.token"),
  };
}

function makePrismaService(userRow: typeof SYNTHETIC_USER | typeof SYNTHETIC_TEACHER | null) {
  return {
    user: {
      findUnique: jest.fn().mockResolvedValue(userRow),
    },
  };
}

describe("AuthService.loginWithInvite", () => {
  const ACCESS_CODE_PLAIN = "test-code-1234";
  let service: AuthService;
  let userWithHashedCode: typeof SYNTHETIC_USER;

  beforeAll(async () => {
    const hash = await bcrypt.hash(ACCESS_CODE_PLAIN, 12);
    userWithHashedCode = { ...SYNTHETIC_USER, accessCode: hash };
  });

  it("TC-AUTH-01: valid invite token + correct access code returns accessToken", async () => {
    const prisma = makePrismaService(userWithHashedCode) as any;
    const jwt = makeJwtService() as any;
    service = new AuthService(prisma, jwt);

    const result = await service.loginWithInvite({
      inviteToken: "valid-invite-token-abc",
      accessCode: ACCESS_CODE_PLAIN,
    });

    expect(result.accessToken).toBe("stub.jwt.token");
    expect(result.user.id).toBe("user-test-001");
    expect(Array.isArray(result.user.scopes)).toBe(true);
    expect(Array.isArray(result.user.roles)).toBe(true);
  });

  it("TC-AUTH-01: JWT contains correct sub and email scope fields", async () => {
    const prisma = makePrismaService(userWithHashedCode) as any;
    const jwt = makeJwtService() as any;
    service = new AuthService(prisma, jwt);

    await service.loginWithInvite({
      inviteToken: "valid-invite-token-abc",
      accessCode: ACCESS_CODE_PLAIN,
    });

    expect(jwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: "user-test-001",
        email: "testuser@synthetic.test",
        scopes: expect.arrayContaining([
          expect.objectContaining({ role: "STUDENT", scopeId: "course-test-a" }),
        ]),
      }),
    );
  });

  it("TC-AUTH-02: wrong access code throws UnauthorizedException", async () => {
    const prisma = makePrismaService(userWithHashedCode) as any;
    const jwt = makeJwtService() as any;
    service = new AuthService(prisma, jwt);

    await expect(
      service.loginWithInvite({
        inviteToken: "valid-invite-token-abc",
        accessCode: "wrong-code-9999",
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("TC-AUTH-05: invalid (non-existent) invite token throws UnauthorizedException", async () => {
    const prisma = makePrismaService(null) as any; // no user found
    const jwt = makeJwtService() as any;
    service = new AuthService(prisma, jwt);

    await expect(
      service.loginWithInvite({
        inviteToken: "tampered-or-nonexistent",
        accessCode: ACCESS_CODE_PLAIN,
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("TC-AUTH-02 / TC-AUTH-06: wrong code does NOT issue a token", async () => {
    const prisma = makePrismaService(userWithHashedCode) as any;
    const jwt = makeJwtService() as any;
    service = new AuthService(prisma, jwt);

    try {
      await service.loginWithInvite({
        inviteToken: "valid-invite-token-abc",
        accessCode: "wrong-code",
      });
    } catch {
      // expected
    }

    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it("TC-AUTH-05: user with no access code configured throws UnauthorizedException", async () => {
    const noCodeUser = { ...userWithHashedCode, accessCode: null };
    const prisma = makePrismaService(noCodeUser) as any;
    const jwt = makeJwtService() as any;
    service = new AuthService(prisma, jwt);

    await expect(
      service.loginWithInvite({
        inviteToken: "valid-invite-token-abc",
        accessCode: ACCESS_CODE_PLAIN,
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

describe("AuthService.loginWithEmail (teacher / admin)", () => {
  const PASSWORD_PLAIN = "SecurePassword123!";
  let teacherWithHash: typeof SYNTHETIC_TEACHER;

  beforeAll(async () => {
    const hash = await bcrypt.hash(PASSWORD_PLAIN, 12);
    teacherWithHash = { ...SYNTHETIC_TEACHER, passwordHash: hash };
  });

  it("valid email + password returns accessToken for teacher", async () => {
    const prisma = makePrismaService(teacherWithHash) as any;
    const jwt = makeJwtService() as any;
    const service = new AuthService(prisma, jwt);

    const result = await service.loginWithEmail({
      email: "teacher@synthetic.test",
      password: PASSWORD_PLAIN,
    });

    expect(result.accessToken).toBe("stub.jwt.token");
    expect(result.user.id).toBe("teacher-test-001");
    expect(Array.isArray(result.user.roles)).toBe(true);
  });

  it("wrong password throws UnauthorizedException", async () => {
    const prisma = makePrismaService(teacherWithHash) as any;
    const jwt = makeJwtService() as any;
    const service = new AuthService(prisma, jwt);

    await expect(
      service.loginWithEmail({
        email: "teacher@synthetic.test",
        password: "wrong-password",
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("unknown email throws UnauthorizedException", async () => {
    const prisma = makePrismaService(null) as any;
    const jwt = makeJwtService() as any;
    const service = new AuthService(prisma, jwt);

    await expect(
      service.loginWithEmail({
        email: "nonexistent@synthetic.test",
        password: PASSWORD_PLAIN,
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it("user with no passwordHash throws UnauthorizedException (invite-only user)", async () => {
    const inviteOnlyUser = { ...SYNTHETIC_USER, passwordHash: null };
    const prisma = makePrismaService(inviteOnlyUser) as any;
    const jwt = makeJwtService() as any;
    const service = new AuthService(prisma, jwt);

    await expect(
      service.loginWithEmail({
        email: "testuser@synthetic.test",
        password: PASSWORD_PLAIN,
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});

describe("AuthService -- JWT payload scope integrity (TC-AUTH-04)", () => {
  it("JWT scopes reflect only the user's actual role assignments (no scope inflation)", async () => {
    // This verifies that issueToken maps role assignments to scopes 1:1
    // A student with course-a scope cannot get a TEACHER role injected into the JWT
    const accessCode = await bcrypt.hash("code-abc", 12);
    const studentUser = {
      ...SYNTHETIC_USER,
      accessCode,
      roleAssignments: [
        { role: "STUDENT", scopeType: "COURSE", scopeId: "course-test-a" },
      ],
    };

    const prisma = makePrismaService(studentUser) as any;
    const jwt = makeJwtService() as any;
    const service = new AuthService(prisma, jwt);

    await service.loginWithInvite({
      inviteToken: "valid-invite-token-abc",
      accessCode: "code-abc",
    });

    const payload = jwt.sign.mock.calls[0][0] as { scopes: Array<{ role: string }> };
    expect(payload.scopes).toHaveLength(1);
    expect(payload.scopes[0]!.role).toBe("STUDENT");
    // No TEACHER, no SYSTEM_ADMIN in the scopes
    expect(payload.scopes.some((s) => s.role === "TEACHER")).toBe(false);
    expect(payload.scopes.some((s) => s.role === "SYSTEM_ADMIN")).toBe(false);
  });
});

describe("AuthService -- hashPassword and hashAccessCode utilities", () => {
  it("hashPassword produces a bcrypt hash that verifies against original", async () => {
    const prisma = makePrismaService(null) as any;
    const jwt = makeJwtService() as any;
    const service = new AuthService(prisma, jwt);

    const plain = "TestPassword!99";
    const hash = await service.hashPassword(plain);

    expect(hash).not.toBe(plain);
    const matches = await bcrypt.compare(plain, hash);
    expect(matches).toBe(true);
  });

  it("hashAccessCode produces a bcrypt hash that verifies against original", async () => {
    const prisma = makePrismaService(null) as any;
    const jwt = makeJwtService() as any;
    const service = new AuthService(prisma, jwt);

    const plain = "code-5678";
    const hash = await service.hashAccessCode(plain);

    expect(hash).not.toBe(plain);
    const matches = await bcrypt.compare(plain, hash);
    expect(matches).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GET /auth/me -- controller maps the validated JWT (req.user) to MeResponse.
// (RE-1: front-end session hydration + role-based route guards.)
// ---------------------------------------------------------------------------
describe("AuthController.getMe (RE-1)", () => {
  const controller = new AuthController(null as never);

  it("maps req.user to MeResponse and de-duplicates roles", () => {
    const req = {
      user: {
        sub: "user-me-001",
        email: "me@synthetic.test",
        scopes: [
          { role: "TEACHER", scopeType: "COURSE", scopeId: "course-a" },
          { role: "TEACHER", scopeType: "COURSE", scopeId: "course-b" },
        ],
      },
    };
    const me = controller.getMe(req as never);
    expect(me.userId).toBe("user-me-001");
    expect(me.email).toBe("me@synthetic.test");
    expect(me.scopes).toHaveLength(2);
    expect(me.roles).toEqual(["TEACHER"]);
  });

  it("SYSTEM_ADMIN scope surfaces as a role", () => {
    const req = {
      user: {
        sub: "admin-001",
        email: "admin@synthetic.test",
        scopes: [{ role: "SYSTEM_ADMIN", scopeType: "COLLEGE", scopeId: "college-a" }],
      },
    };
    const me = controller.getMe(req as never);
    expect(me.roles).toContain("SYSTEM_ADMIN");
  });
});
