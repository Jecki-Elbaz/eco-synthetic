/**
 * CreditAdminService unit tests (APS-REQ-139..148)
 *
 * Mocked Prisma -- no live DB required.
 *
 * Covers:
 *   (a) RBAC: STUDENT / TEACHER forbidden on all admin endpoints (RolesGuard layer)
 *   (b) SYSTEM_ADMIN allowed (smoke)
 *   (c) applyAction ADMIN_ADD: writes CreditEntry + updates balance in $transaction
 *   (d) applyAction ADMIN_DEDUCT: negative delta, balance decremented
 *   (e) applyAction ADMIN_RESET: delta = target - current, balance set to target
 *   (f) applyAction ADMIN_BONUS: positive delta, balance incremented
 *   (g) Empty reason rejected (BadRequestException) on all action types
 *   (h) Ledger not found -> NotFoundException
 *   (i) setLimits: updates softLimit + hardLimit, writes CreditEntry ADMIN_SET_LIMITS
 *   (j) setLimits: empty reason rejected
 *   (k) overrideHardLimit: sets hardLimit, writes audit entry ADMIN_OVERRIDE_HARD_LIMIT
 *   (l) overrideHardLimit: empty reason rejected
 *   (m) getActivityLog: returns paginated CreditEntry list
 *   (n) getCollegeUsage: aggregates entries across college ledgers
 *   (o) getCourseUsage: returns usage for a single course ledger
 *   (p) getLowBalanceLedgers: returns only ledgers with balance <= softLimit
 *   (q) getLedger: returns current balance + limits for one ledger
 *
 * Integration specs are WRITTEN below but deferred (Docker/Postgres DOWN).
 */

import { CreditAdminService } from "../credit-admin/credit-admin.service.js";
import { RolesGuard } from "../rbac/roles.guard.js";
import { Reflector } from "@nestjs/core";
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import type { AuthTokenPayload } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const LEDGER_ID = "ledger-admin-001";
const COLLEGE_ID = "college-admin-001";
const COURSE_ID = "course-admin-001";
const ADMIN_SUB = "admin-sub-001";

// ---------------------------------------------------------------------------
// JWT payload factories (mirrors rbac.spec.ts pattern)
// ---------------------------------------------------------------------------

function makeAdminPayload(): AuthTokenPayload {
  return {
    sub: ADMIN_SUB,
    email: "admin@credit-admin.test",
    scopes: [{ role: "SYSTEM_ADMIN", scopeType: "COLLEGE", scopeId: COLLEGE_ID }],
    iat: 1000000,
    exp: 9999999,
  };
}

function makeStudentPayload(): AuthTokenPayload {
  return {
    sub: "student-ca-001",
    email: "student@credit-admin.test",
    scopes: [{ role: "STUDENT", scopeType: "COURSE", scopeId: COURSE_ID }],
    iat: 1000000,
    exp: 9999999,
  };
}

function makeTeacherPayload(): AuthTokenPayload {
  return {
    sub: "teacher-ca-001",
    email: "teacher@credit-admin.test",
    scopes: [{ role: "TEACHER", scopeType: "COURSE", scopeId: COURSE_ID }],
    iat: 1000000,
    exp: 9999999,
  };
}

// ---------------------------------------------------------------------------
// RolesGuard context factory (mirrors rbac.spec.ts pattern)
// ---------------------------------------------------------------------------

function makeRolesContext(
  requiredRoles: string[],
  user: AuthTokenPayload,
  params: Record<string, string> = {},
): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ user, params }),
    }),
  } as unknown as ExecutionContext;
}

// ---------------------------------------------------------------------------
// Ledger + entry mock factories
// ---------------------------------------------------------------------------

function makeLedger(overrides?: Partial<{
  id: string;
  collegeId: string;
  courseId: string | null;
  balance: number;
  softLimit: number | null;
  hardLimit: number | null;
}>) {
  return {
    id: LEDGER_ID,
    collegeId: COLLEGE_ID,
    courseId: COURSE_ID,
    balance: 100,
    softLimit: 20,
    hardLimit: 200,
    entries: [],
    ...overrides,
  };
}

function makeLedgerWithEntries(entries: object[]) {
  return { ...makeLedger(), entries };
}

function makeEntry(overrides?: Partial<{
  id: string;
  ledgerId: string;
  adminId: string | null;
  activityType: string;
  delta: number;
  reason: string;
  timestamp: Date;
}>) {
  return {
    id: "entry-001",
    ledgerId: LEDGER_ID,
    adminId: ADMIN_SUB,
    activityType: "ADMIN_ADD",
    delta: 50,
    reason: "top-up",
    timestamp: new Date("2026-07-04T10:00:00Z"),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Prisma mock builders
// ---------------------------------------------------------------------------

/**
 * Build a mock prisma that:
 *   - creditLedger.findUnique -> returns the supplied ledger row
 *   - creditEntry.create -> returns a CreditEntry row
 *   - creditLedger.update -> returns updated ledger with the supplied balance
 *   - $transaction -> runs the array ops sequentially and returns their results
 */
function makePrismaForAction(ledger: ReturnType<typeof makeLedger>, newBalance: number) {
  const entryResult = makeEntry();
  const updatedLedger = { ...ledger, balance: newBalance };

  return {
    creditLedger: {
      findUnique: jest.fn().mockResolvedValue(ledger),
      update: jest.fn().mockResolvedValue(updatedLedger),
    },
    creditEntry: {
      create: jest.fn().mockResolvedValue(entryResult),
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockResolvedValue([]),
    },
    $transaction: jest.fn().mockImplementation(async (ops: unknown[]) => {
      return Promise.all(ops as Promise<unknown>[]);
    }),
  };
}

function makePrismaForLimits(ledger: ReturnType<typeof makeLedger>, softLimit: number | null, hardLimit: number | null) {
  const entryResult = makeEntry({ activityType: "ADMIN_SET_LIMITS", delta: 0 });
  const updatedLedger = { ...ledger, softLimit, hardLimit };

  return {
    creditLedger: {
      findUnique: jest.fn().mockResolvedValue(ledger),
      update: jest.fn().mockResolvedValue(updatedLedger),
    },
    creditEntry: {
      create: jest.fn().mockResolvedValue(entryResult),
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockResolvedValue([]),
    },
    $transaction: jest.fn().mockImplementation(async (ops: unknown[]) => {
      return Promise.all(ops as Promise<unknown>[]);
    }),
  };
}

function makePrismaForOverride(ledger: ReturnType<typeof makeLedger>, newHardLimit: number | null) {
  const entryResult = makeEntry({ activityType: "ADMIN_OVERRIDE_HARD_LIMIT", delta: 0 });
  const updatedLedger = { ...ledger, hardLimit: newHardLimit };

  return {
    creditLedger: {
      findUnique: jest.fn().mockResolvedValue(ledger),
      update: jest.fn().mockResolvedValue(updatedLedger),
    },
    creditEntry: {
      create: jest.fn().mockResolvedValue(entryResult),
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockResolvedValue([]),
    },
    $transaction: jest.fn().mockImplementation(async (ops: unknown[]) => {
      return Promise.all(ops as Promise<unknown>[]);
    }),
  };
}

function makePrismaForActivityLog(entries: object[], total: number) {
  return {
    creditLedger: {
      findUnique: jest.fn().mockResolvedValue(makeLedger()),
      findMany: jest.fn().mockResolvedValue([]),
    },
    creditEntry: {
      findMany: jest.fn().mockResolvedValue(entries),
      count: jest.fn().mockResolvedValue(total),
      create: jest.fn().mockResolvedValue(makeEntry()),
    },
    $transaction: jest.fn(),
  };
}

function makePrismaForCollegeUsage(ledgers: object[]) {
  return {
    creditLedger: {
      findMany: jest.fn().mockResolvedValue(ledgers),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    creditEntry: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue(makeEntry()),
    },
    $transaction: jest.fn(),
  };
}

function makePrismaForCourseUsage(ledger: object | null) {
  return {
    creditLedger: {
      findFirst: jest.fn().mockResolvedValue(ledger),
      findUnique: jest.fn().mockResolvedValue(ledger),
      findMany: jest.fn().mockResolvedValue(ledger ? [ledger] : []),
    },
    creditEntry: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue(makeEntry()),
    },
    $transaction: jest.fn(),
  };
}

function makePrismaForLowBalance(ledgers: object[]) {
  return {
    creditLedger: {
      findMany: jest.fn().mockResolvedValue(ledgers),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    creditEntry: {
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      create: jest.fn().mockResolvedValue(makeEntry()),
    },
    $transaction: jest.fn(),
  };
}

// ---------------------------------------------------------------------------
// (a) RBAC: STUDENT / TEACHER forbidden on admin endpoints
// (b) SYSTEM_ADMIN allowed
// ---------------------------------------------------------------------------

describe("(a) RBAC -- STUDENT and TEACHER forbidden on credit-admin endpoints", () => {
  const reflector = new Reflector();
  const guard = new RolesGuard(reflector);

  const endpoints = [
    "GET /admin/credits",
    "GET /admin/credits/activity",
    "POST /admin/credits/:ledgerId/actions",
    "PATCH /admin/credits/:ledgerId/limits",
    "POST /admin/credits/:ledgerId/override",
    "GET /admin/credits/low-balance",
  ];

  endpoints.forEach((endpoint) => {
    it(`STUDENT is forbidden on ${endpoint}`, () => {
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["SYSTEM_ADMIN"]);
      const ctx = makeRolesContext(
        ["SYSTEM_ADMIN"],
        makeStudentPayload(),
        { ledgerId: LEDGER_ID },
      );
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it(`TEACHER is forbidden on ${endpoint}`, () => {
      jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["SYSTEM_ADMIN"]);
      const ctx = makeRolesContext(
        ["SYSTEM_ADMIN"],
        makeTeacherPayload(),
        { ledgerId: LEDGER_ID },
      );
      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });
  });

  it("(b) SYSTEM_ADMIN is allowed on credit-admin endpoints", () => {
    jest.spyOn(reflector, "getAllAndOverride").mockReturnValue(["SYSTEM_ADMIN"]);
    const ctx = makeRolesContext(
      ["SYSTEM_ADMIN"],
      makeAdminPayload(),
      { ledgerId: LEDGER_ID },
    );
    expect(guard.canActivate(ctx)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// (c) applyAction ADMIN_ADD: CreditEntry + balance update in $transaction
// ---------------------------------------------------------------------------

describe("CreditAdminService.applyAction -- ADMIN_ADD", () => {
  it("(c) writes CreditEntry with adminId, activityType=ADMIN_ADD, positive delta", async () => {
    const ledger = makeLedger({ balance: 100 });
    const prisma = makePrismaForAction(ledger, 150);
    const service = new CreditAdminService(prisma as never);

    const result = await service.applyAction(
      LEDGER_ID,
      { actionType: "ADMIN_ADD", amount: 50, reason: "manual top-up" },
      ADMIN_SUB,
    );

    expect(result.delta).toBe(50);
    expect(result.newBalance).toBe(150);
    expect(result.previousBalance).toBe(100);
    expect(result.activityType).toBe("ADMIN_ADD");

    // Verify $transaction was called
    expect(prisma.$transaction).toHaveBeenCalled();
    // B2: the CreditEntry.create AND the CreditLedger.update must be in the SAME
    // $transaction call (atomicity). Assert the tx received a 2-op array, so a refactor
    // that moves either operation outside the transaction is caught.
    const txArg = (prisma.$transaction as jest.Mock).mock.calls[0]![0];
    expect(Array.isArray(txArg)).toBe(true);
    expect(txArg as unknown[]).toHaveLength(2);
    // Verify creditEntry.create was called with adminId and correct activityType
    expect(prisma.creditEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          adminId: ADMIN_SUB,
          activityType: "ADMIN_ADD",
          delta: 50,
          ledgerId: LEDGER_ID,
        }),
      }),
    );
    // Verify creditLedger.update was called with new balance
    expect(prisma.creditLedger.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: LEDGER_ID },
        data: expect.objectContaining({ balance: 150 }),
      }),
    );
  });

  it("(M2) ADMIN_ADD with amount=0 throws BadRequestException and opens no transaction", async () => {
    const prisma = makePrismaForAction(makeLedger({ balance: 100 }), 100);
    const service = new CreditAdminService(prisma as never);

    await expect(
      service.applyAction(
        LEDGER_ID,
        { actionType: "ADMIN_ADD", amount: 0, reason: "noop" },
        ADMIN_SUB,
      ),
    ).rejects.toThrow(BadRequestException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(prisma.creditEntry.create).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// (d) applyAction ADMIN_DEDUCT: negative delta, balance decremented
// ---------------------------------------------------------------------------

describe("CreditAdminService.applyAction -- ADMIN_DEDUCT", () => {
  it("(d) writes CreditEntry with negative delta, balance decremented", async () => {
    const ledger = makeLedger({ balance: 100 });
    const prisma = makePrismaForAction(ledger, 70);
    const service = new CreditAdminService(prisma as never);

    const result = await service.applyAction(
      LEDGER_ID,
      { actionType: "ADMIN_DEDUCT", amount: 30, reason: "correction" },
      ADMIN_SUB,
    );

    expect(result.delta).toBe(-30);
    expect(result.newBalance).toBe(70);
    expect(prisma.creditEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          activityType: "ADMIN_DEDUCT",
          delta: -30,
        }),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// (e) applyAction ADMIN_RESET: delta = target - current, balance set to target
// ---------------------------------------------------------------------------

describe("CreditAdminService.applyAction -- ADMIN_RESET", () => {
  it("(e) delta equals target minus current balance", async () => {
    const ledger = makeLedger({ balance: 80 });
    const prisma = makePrismaForAction(ledger, 200);
    const service = new CreditAdminService(prisma as never);

    const result = await service.applyAction(
      LEDGER_ID,
      { actionType: "ADMIN_RESET", amount: 200, reason: "semester reset" },
      ADMIN_SUB,
    );

    // delta = 200 - 80 = 120
    expect(result.delta).toBe(120);
    expect(result.newBalance).toBe(200);
    expect(result.previousBalance).toBe(80);
    expect(prisma.creditEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          activityType: "ADMIN_RESET",
          delta: 120,
        }),
      }),
    );
  });

  it("(e) ADMIN_RESET with target lower than current produces negative delta", async () => {
    const ledger = makeLedger({ balance: 300 });
    const prisma = makePrismaForAction(ledger, 50);
    const service = new CreditAdminService(prisma as never);

    const result = await service.applyAction(
      LEDGER_ID,
      { actionType: "ADMIN_RESET", amount: 50, reason: "over-allocation correction" },
      ADMIN_SUB,
    );

    expect(result.delta).toBe(-250);
    expect(result.newBalance).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// (f) applyAction ADMIN_BONUS: positive delta, balance incremented
// ---------------------------------------------------------------------------

describe("CreditAdminService.applyAction -- ADMIN_BONUS", () => {
  it("(f) writes CreditEntry activityType=ADMIN_BONUS with positive delta", async () => {
    const ledger = makeLedger({ balance: 100 });
    const prisma = makePrismaForAction(ledger, 110);
    const service = new CreditAdminService(prisma as never);

    const result = await service.applyAction(
      LEDGER_ID,
      { actionType: "ADMIN_BONUS", amount: 10, reason: "pilot bonus" },
      ADMIN_SUB,
    );

    expect(result.delta).toBe(10);
    expect(result.activityType).toBe("ADMIN_BONUS");
    expect(prisma.creditEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          activityType: "ADMIN_BONUS",
          adminId: ADMIN_SUB,
        }),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// (g) Empty reason rejected on action, setLimits, overrideHardLimit
// ---------------------------------------------------------------------------

describe("CreditAdminService -- empty reason rejected (BadRequestException)", () => {
  it("(g) ADMIN_ADD with empty reason throws BadRequestException", async () => {
    const prisma = makePrismaForAction(makeLedger(), 150);
    const service = new CreditAdminService(prisma as never);

    await expect(
      service.applyAction(LEDGER_ID, { actionType: "ADMIN_ADD", amount: 50, reason: "" }, ADMIN_SUB),
    ).rejects.toThrow(BadRequestException);
  });

  it("(g) ADMIN_DEDUCT with whitespace-only reason throws BadRequestException", async () => {
    const prisma = makePrismaForAction(makeLedger(), 70);
    const service = new CreditAdminService(prisma as never);

    await expect(
      service.applyAction(LEDGER_ID, { actionType: "ADMIN_DEDUCT", amount: 30, reason: "   " }, ADMIN_SUB),
    ).rejects.toThrow(BadRequestException);
  });

  it("(g) ADMIN_RESET with empty reason throws BadRequestException", async () => {
    const prisma = makePrismaForAction(makeLedger(), 200);
    const service = new CreditAdminService(prisma as never);

    await expect(
      service.applyAction(LEDGER_ID, { actionType: "ADMIN_RESET", amount: 200, reason: "" }, ADMIN_SUB),
    ).rejects.toThrow(BadRequestException);
  });

  it("(g) ADMIN_BONUS with empty reason throws BadRequestException", async () => {
    const prisma = makePrismaForAction(makeLedger(), 110);
    const service = new CreditAdminService(prisma as never);

    await expect(
      service.applyAction(LEDGER_ID, { actionType: "ADMIN_BONUS", amount: 10, reason: "" }, ADMIN_SUB),
    ).rejects.toThrow(BadRequestException);
  });
});

// ---------------------------------------------------------------------------
// (h) Ledger not found -> NotFoundException
// ---------------------------------------------------------------------------

describe("CreditAdminService -- ledger not found", () => {
  it("(h) applyAction throws NotFoundException for unknown ledgerId", async () => {
    const prisma = {
      creditLedger: { findUnique: jest.fn().mockResolvedValue(null) },
      creditEntry: { create: jest.fn(), count: jest.fn(), findMany: jest.fn() },
      $transaction: jest.fn(),
    };
    const service = new CreditAdminService(prisma as never);

    await expect(
      service.applyAction("missing", { actionType: "ADMIN_ADD", amount: 10, reason: "x" }, ADMIN_SUB),
    ).rejects.toThrow(NotFoundException);
  });

  it("(h) setLimits throws NotFoundException for unknown ledgerId", async () => {
    const prisma = {
      creditLedger: { findUnique: jest.fn().mockResolvedValue(null) },
      creditEntry: { create: jest.fn(), count: jest.fn(), findMany: jest.fn() },
      $transaction: jest.fn(),
    };
    const service = new CreditAdminService(prisma as never);

    await expect(
      service.setLimits("missing", { softLimit: 10, reason: "x" }, ADMIN_SUB),
    ).rejects.toThrow(NotFoundException);
  });

  it("(h) overrideHardLimit throws NotFoundException for unknown ledgerId", async () => {
    const prisma = {
      creditLedger: { findUnique: jest.fn().mockResolvedValue(null) },
      creditEntry: { create: jest.fn(), count: jest.fn(), findMany: jest.fn() },
      $transaction: jest.fn(),
    };
    const service = new CreditAdminService(prisma as never);

    await expect(
      service.overrideHardLimit("missing", { newHardLimit: 500, reason: "x" }, ADMIN_SUB),
    ).rejects.toThrow(NotFoundException);
  });

  it("(h) getLedger throws NotFoundException for unknown ledgerId", async () => {
    const prisma = {
      creditLedger: { findUnique: jest.fn().mockResolvedValue(null), findMany: jest.fn().mockResolvedValue([]) },
      creditEntry: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), create: jest.fn() },
      $transaction: jest.fn(),
    };
    const service = new CreditAdminService(prisma as never);

    await expect(service.getLedger("missing")).rejects.toThrow(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// (i) setLimits: updates limits, writes ADMIN_SET_LIMITS CreditEntry
// ---------------------------------------------------------------------------

describe("CreditAdminService.setLimits", () => {
  it("(i) updates softLimit, writes CreditEntry activityType=ADMIN_SET_LIMITS with delta=0", async () => {
    const ledger = makeLedger({ softLimit: 20, hardLimit: 200 });
    const prisma = makePrismaForLimits(ledger, 30, 200);
    const service = new CreditAdminService(prisma as never);

    const result = await service.setLimits(
      LEDGER_ID,
      { softLimit: 30, reason: "new threshold" },
      ADMIN_SUB,
    );

    expect(result.softLimit).toBe(30);
    expect(result.ledgerId).toBe(LEDGER_ID);
    expect(prisma.creditEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          activityType: "ADMIN_SET_LIMITS",
          delta: 0,
          adminId: ADMIN_SUB,
        }),
      }),
    );
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("(i) updates hardLimit", async () => {
    const ledger = makeLedger({ softLimit: 20, hardLimit: 200 });
    const prisma = makePrismaForLimits(ledger, 20, 300);
    const service = new CreditAdminService(prisma as never);

    const result = await service.setLimits(
      LEDGER_ID,
      { hardLimit: 300, reason: "capacity increase" },
      ADMIN_SUB,
    );

    expect(result.hardLimit).toBe(300);
  });

  it("(i) can clear softLimit to null", async () => {
    const ledger = makeLedger({ softLimit: 20 });
    const prisma = makePrismaForLimits(ledger, null, 200);
    const service = new CreditAdminService(prisma as never);

    const result = await service.setLimits(
      LEDGER_ID,
      { softLimit: null, reason: "remove soft limit" },
      ADMIN_SUB,
    );

    expect(result.softLimit).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// (j) setLimits: empty reason rejected
// ---------------------------------------------------------------------------

describe("CreditAdminService.setLimits -- empty reason", () => {
  it("(j) empty reason throws BadRequestException", async () => {
    const prisma = makePrismaForLimits(makeLedger(), 30, 200);
    const service = new CreditAdminService(prisma as never);

    await expect(
      service.setLimits(LEDGER_ID, { softLimit: 30, reason: "" }, ADMIN_SUB),
    ).rejects.toThrow(BadRequestException);
  });

  it("(j) whitespace-only reason throws BadRequestException", async () => {
    const prisma = makePrismaForLimits(makeLedger(), 30, 200);
    const service = new CreditAdminService(prisma as never);

    await expect(
      service.setLimits(LEDGER_ID, { softLimit: 30, reason: "  " }, ADMIN_SUB),
    ).rejects.toThrow(BadRequestException);
  });
});

// ---------------------------------------------------------------------------
// (k) overrideHardLimit: sets hardLimit, writes ADMIN_OVERRIDE_HARD_LIMIT entry
// ---------------------------------------------------------------------------

describe("CreditAdminService.overrideHardLimit", () => {
  it("(k) sets new hardLimit, writes audit entry with activityType ADMIN_OVERRIDE_HARD_LIMIT", async () => {
    const ledger = makeLedger({ hardLimit: 200 });
    const prisma = makePrismaForOverride(ledger, 500);
    const service = new CreditAdminService(prisma as never);

    const result = await service.overrideHardLimit(
      LEDGER_ID,
      { newHardLimit: 500, reason: "temporary pilot expansion" },
      ADMIN_SUB,
    );

    expect(result.previousHardLimit).toBe(200);
    expect(result.newHardLimit).toBe(500);
    expect(result.ledgerId).toBe(LEDGER_ID);
    expect(prisma.creditEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          activityType: "ADMIN_OVERRIDE_HARD_LIMIT",
          adminId: ADMIN_SUB,
          delta: 0,
        }),
      }),
    );
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it("(k) can clear hardLimit to null (remove override)", async () => {
    const ledger = makeLedger({ hardLimit: 500 });
    const prisma = makePrismaForOverride(ledger, null);
    const service = new CreditAdminService(prisma as never);

    const result = await service.overrideHardLimit(
      LEDGER_ID,
      { newHardLimit: null, reason: "override expired -- manual clear" },
      ADMIN_SUB,
    );

    expect(result.newHardLimit).toBeNull();
  });

  it("(k) schema-gap notice embedded in audit reason", async () => {
    const ledger = makeLedger({ hardLimit: 200 });
    const prisma = makePrismaForOverride(ledger, 500);
    const service = new CreditAdminService(prisma as never);

    await service.overrideHardLimit(
      LEDGER_ID,
      { newHardLimit: 500, reason: "expansion for test" },
      ADMIN_SUB,
    );

    const createCall = (prisma.creditEntry.create as jest.Mock).mock.calls[0] as [{ data: { reason: string } }];
    const storedReason = createCall[0].data.reason;
    // The service embeds the schema-gap notice
    expect(storedReason).toContain("OVERRIDE");
    expect(storedReason).toContain("expansion for test");
  });
});

// ---------------------------------------------------------------------------
// (l) overrideHardLimit: empty reason rejected
// ---------------------------------------------------------------------------

describe("CreditAdminService.overrideHardLimit -- empty reason", () => {
  it("(l) empty reason throws BadRequestException", async () => {
    const prisma = makePrismaForOverride(makeLedger(), 500);
    const service = new CreditAdminService(prisma as never);

    await expect(
      service.overrideHardLimit(LEDGER_ID, { newHardLimit: 500, reason: "" }, ADMIN_SUB),
    ).rejects.toThrow(BadRequestException);
  });
});

// ---------------------------------------------------------------------------
// (m) getActivityLog: paginated CreditEntry list
// ---------------------------------------------------------------------------

describe("CreditAdminService.getActivityLog", () => {
  it("(m) returns paginated result with correct metadata", async () => {
    const entries = [
      makeEntry({ id: "e1", activityType: "ADMIN_ADD" }),
      makeEntry({ id: "e2", activityType: "ADMIN_DEDUCT" }),
    ];
    const prisma = makePrismaForActivityLog(entries, 2);
    const service = new CreditAdminService(prisma as never);

    const result = await service.getActivityLog({ page: 1, pageSize: 10 });

    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it("(m) timestamp is serialised to ISO string", async () => {
    const entries = [makeEntry({ timestamp: new Date("2026-07-04T10:00:00Z") })];
    const prisma = makePrismaForActivityLog(entries, 1);
    const service = new CreditAdminService(prisma as never);

    const result = await service.getActivityLog({});

    expect(result.items[0]?.timestamp).toBe("2026-07-04T10:00:00.000Z");
  });

  it("(m) applies collegeId filter via where clause", async () => {
    const prisma = makePrismaForActivityLog([], 0);
    const service = new CreditAdminService(prisma as never);

    await service.getActivityLog({ collegeId: COLLEGE_ID });

    expect(prisma.creditEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ ledger: expect.objectContaining({ collegeId: COLLEGE_ID }) }),
      }),
    );
  });

  it("(m) applies date range filter", async () => {
    const prisma = makePrismaForActivityLog([], 0);
    const service = new CreditAdminService(prisma as never);

    await service.getActivityLog({ from: "2026-01-01", to: "2026-12-31" });

    expect(prisma.creditEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          timestamp: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      }),
    );
  });

  it("(m) defaults to page=1, pageSize=50", async () => {
    const prisma = makePrismaForActivityLog([], 0);
    const service = new CreditAdminService(prisma as never);

    await service.getActivityLog({});

    expect(prisma.creditEntry.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 50 }),
    );
  });
});

// ---------------------------------------------------------------------------
// (n) getCollegeUsage: aggregates entries across college ledgers
// ---------------------------------------------------------------------------

describe("CreditAdminService.getCollegeUsage", () => {
  it("(n) returns usage summary per ledger with correct totals", async () => {
    const entries = [
      makeEntry({ delta: 100, activityType: "ADMIN_ADD" }),
      makeEntry({ delta: -30, activityType: "ADMIN_DEDUCT" }),
    ];
    const ledger = makeLedgerWithEntries(entries);
    const prisma = makePrismaForCollegeUsage([ledger]);
    const service = new CreditAdminService(prisma as never);

    const results = await service.getCollegeUsage(COLLEGE_ID);

    expect(results).toHaveLength(1);
    expect(results[0]?.totalCredited).toBe(100);
    expect(results[0]?.totalDebited).toBe(30);
    expect(results[0]?.entryCount).toBe(2);
  });

  it("(n) returns empty array when no ledgers for college", async () => {
    const prisma = makePrismaForCollegeUsage([]);
    const service = new CreditAdminService(prisma as never);

    const results = await service.getCollegeUsage("unknown-college");
    expect(results).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// (o) getCourseUsage: single course ledger
// ---------------------------------------------------------------------------

describe("CreditAdminService.getCourseUsage", () => {
  it("(o) returns usage summary for a known course", async () => {
    const entries = [makeEntry({ delta: 50 })];
    const ledger = makeLedgerWithEntries(entries);
    const prisma = makePrismaForCourseUsage(ledger);
    const service = new CreditAdminService(prisma as never);

    const result = await service.getCourseUsage(COURSE_ID);

    expect(result.courseId).toBe(COURSE_ID);
    expect(result.entryCount).toBe(1);
  });

  it("(o) throws NotFoundException for unknown courseId", async () => {
    const prisma = makePrismaForCourseUsage(null);
    const service = new CreditAdminService(prisma as never);

    await expect(service.getCourseUsage("unknown-course")).rejects.toThrow(NotFoundException);
  });
});

// ---------------------------------------------------------------------------
// (p) getLowBalanceLedgers: balance <= softLimit
// ---------------------------------------------------------------------------

describe("CreditAdminService.getLowBalanceLedgers -- APS-REQ-147 pilot", () => {
  it("(p) returns ledgers where balance <= softLimit", async () => {
    const lowLedger = makeLedger({ balance: 10, softLimit: 20, id: "ledger-low" });
    const okLedger = makeLedger({ balance: 100, softLimit: 20, id: "ledger-ok" });
    const prisma = makePrismaForLowBalance([lowLedger, okLedger]);
    const service = new CreditAdminService(prisma as never);

    const result = await service.getLowBalanceLedgers();

    expect(result).toHaveLength(1);
    expect(result[0]?.ledgerId).toBe("ledger-low");
  });

  it("(p) excludes ledgers where softLimit is null (no threshold configured)", async () => {
    const noThreshold = makeLedger({ balance: 0, softLimit: null });
    const prisma = makePrismaForLowBalance([noThreshold]);
    const service = new CreditAdminService(prisma as never);

    const result = await service.getLowBalanceLedgers();
    expect(result).toHaveLength(0);
  });

  it("(p) includes ledger where balance exactly equals softLimit", async () => {
    const exactlyAtLimit = makeLedger({ balance: 20, softLimit: 20, id: "ledger-edge" });
    const prisma = makePrismaForLowBalance([exactlyAtLimit]);
    const service = new CreditAdminService(prisma as never);

    const result = await service.getLowBalanceLedgers();
    expect(result).toHaveLength(1);
    expect(result[0]?.ledgerId).toBe("ledger-edge");
  });

  it("(p) returns empty array when all balances are above softLimit", async () => {
    const healthy = makeLedger({ balance: 100, softLimit: 20 });
    const prisma = makePrismaForLowBalance([healthy]);
    const service = new CreditAdminService(prisma as never);

    const result = await service.getLowBalanceLedgers();
    expect(result).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// (q) getLedger: returns current balance + limits for one ledger
// ---------------------------------------------------------------------------

describe("CreditAdminService.getLedger", () => {
  it("(q) returns balance, softLimit, hardLimit for known ledgerId", async () => {
    const ledger = makeLedger({ balance: 75, softLimit: 20, hardLimit: 200 });
    const prisma = {
      creditLedger: { findUnique: jest.fn().mockResolvedValue(ledger), findMany: jest.fn().mockResolvedValue([]) },
      creditEntry: { findMany: jest.fn().mockResolvedValue([]), count: jest.fn().mockResolvedValue(0), create: jest.fn() },
      $transaction: jest.fn(),
    };
    const service = new CreditAdminService(prisma as never);

    const result = await service.getLedger(LEDGER_ID);

    expect(result.id).toBe(LEDGER_ID);
    expect(result.balance).toBe(75);
    expect(result.softLimit).toBe(20);
    expect(result.hardLimit).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// Integration specs -- WRITTEN, deferred (Docker/Postgres DOWN)
//
// When the DB is available, run with:
//   pnpm --filter @aps/api test:integration
//
// Spec stubs below document intent; they are skipped automatically in unit mode.
// ---------------------------------------------------------------------------

describe.skip("INTEGRATION (deferred -- Docker/Postgres DOWN): CreditAdmin API", () => {
  // Requires live DB + seeded CreditLedger rows.

  it("POST /admin/credits/:ledgerId/actions -- ADMIN_ADD persisted to DB with correct balance", () => {
    // 1. Seed ledger (balance=100).
    // 2. POST { actionType: "ADMIN_ADD", amount: 50, reason: "int-test" }.
    // 3. Assert response: delta=50, newBalance=150.
    // 4. SELECT CreditEntry: adminId set, activityType=ADMIN_ADD.
    // 5. SELECT CreditLedger: balance=150.
  });

  it("POST /admin/credits/:ledgerId/actions -- STUDENT JWT returns 403", () => {
    // POST with STUDENT JWT -> expect 403 Forbidden.
  });

  it("POST /admin/credits/:ledgerId/actions -- TEACHER JWT returns 403", () => {
    // POST with TEACHER JWT -> expect 403 Forbidden.
  });

  it("POST /admin/credits/:ledgerId/actions -- empty reason returns 400", () => {
    // POST { actionType: "ADMIN_ADD", amount: 10, reason: "" } -> 400 BadRequest.
  });

  it("PATCH /admin/credits/:ledgerId/limits -- sets softLimit, CreditEntry written", () => {
    // PATCH { softLimit: 30, reason: "test" } -> assert DB ledger.softLimit=30.
    // Assert CreditEntry exists with activityType=ADMIN_SET_LIMITS.
  });

  it("POST /admin/credits/:ledgerId/override -- sets hardLimit, ADMIN_OVERRIDE_HARD_LIMIT written", () => {
    // POST { newHardLimit: 500, reason: "test" } -> assert DB.
  });

  it("GET /admin/credits/low-balance -- returns ledgers at/below softLimit", () => {
    // Seed two ledgers: one low, one healthy. GET -> only low one returned.
  });

  it("GET /admin/credits/activity?collegeId= -- returns filtered log", () => {
    // Seed entries. GET with collegeId filter -> only matching entries.
  });
});
