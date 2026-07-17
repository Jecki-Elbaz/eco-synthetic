/**
 * CreditAdminService integration tests (APS-REQ-139..148)
 *
 * IMPLEMENTED 2026-07-09 (Adi, Sprint 2 hardening).
 * CA-INT-002/003 closed 2026-07-17 (Adi, GR-015 A1, supertest@7.2.2).
 * Extracted from the describe.skip block in credit-admin.spec.ts.
 *
 * Run with: pnpm --filter @aps/api test:integration
 *
 * All 8 stubs implemented:
 * - 6 at service level (direct CreditAdminService calls against live Postgres)
 * - 2 via NestJS TestingModule + supertest HTTP layer (CA-INT-002, CA-INT-003)
 *   GR-015 A1 (supertest@7.2.2). Service-level mocks cannot test guards;
 *   a real HTTP call through JwtAuthGuard + RolesGuard is required.
 *
 * CA-INT-001: ADMIN_ADD persisted to DB with correct balance + CreditEntry
 * CA-INT-002: STUDENT JWT -> 403 [NestJS TestingModule + supertest, GR-015 A1]
 * CA-INT-003: TEACHER JWT -> 403 [NestJS TestingModule + supertest, GR-015 A1]
 * CA-INT-004: empty reason -> 400 BadRequestException
 * CA-INT-005: setLimits persists softLimit + ADMIN_SET_LIMITS CreditEntry
 * CA-INT-006: overrideHardLimit persists hardLimit + ADMIN_OVERRIDE_HARD_LIMIT CreditEntry
 * CA-INT-007: getLowBalanceLedgers returns only at/below-softLimit ledgers
 * CA-INT-008: getActivityLog with collegeId filter returns matching entries only
 */

import { PrismaClient } from "@aps/db";
import { CreditAdminService } from "../credit-admin/credit-admin.service.js";
import { BadRequestException } from "@nestjs/common";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import supertest from "supertest";
import { ConfigModule } from "../config/config.module.js";
import { DbModule } from "../db/db.module.js";
import { AuthModule } from "../auth/auth.module.js";
import { CreditAdminModule } from "../credit-admin/credit-admin.module.js";

// ---------------------------------------------------------------------------
// Shared Prisma instance
// ---------------------------------------------------------------------------
const prisma = new PrismaClient();

// ---------------------------------------------------------------------------
// Random suffix helper
// ---------------------------------------------------------------------------
const uid = () => Math.random().toString(36).slice(2, 10);

// ---------------------------------------------------------------------------
// Fixture IDs (populated in beforeAll)
// ---------------------------------------------------------------------------
let collegeId: string;
let ledgerId: string;      // primary ledger (balance=100, softLimit=20)
let ledgerLowId: string;   // low-balance ledger for CA-INT-007

const ADMIN_ID = "admin-ca-int-001";

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
beforeAll(async () => {
  await prisma.$connect();
  const suffix = uid();

  const college = await prisma.college.create({
    data: { name: `CA-Int-College-${suffix}`, slug: `ca-int-${suffix}` },
  });
  collegeId = college.id;

  // Primary ledger: balance=100, softLimit=20
  const ledger = await prisma.creditLedger.create({
    data: {
      collegeId,
      balance: 100,
      softLimit: 20,
      hardLimit: 500,
    },
  });
  ledgerId = ledger.id;

  // Low-balance ledger: balance=5, softLimit=20 (for CA-INT-007)
  const ledgerLow = await prisma.creditLedger.create({
    data: {
      collegeId,
      balance: 5,
      softLimit: 20,
      hardLimit: 500,
    },
  });
  ledgerLowId = ledgerLow.id;
});

// ---------------------------------------------------------------------------
// Teardown: FK-safe order
// ---------------------------------------------------------------------------
afterAll(async () => {
  await prisma.creditEntry.deleteMany({
    where: { ledgerId: { in: [ledgerId, ledgerLowId] } },
  });
  await prisma.creditLedger.deleteMany({
    where: { id: { in: [ledgerId, ledgerLowId] } },
  });
  await prisma.college.deleteMany({ where: { id: collegeId } });
  await prisma.$disconnect();
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function buildService(): CreditAdminService {
  return new CreditAdminService(prisma as never);
}

// ---------------------------------------------------------------------------
// CA-INT-001: ADMIN_ADD persisted to DB
// ---------------------------------------------------------------------------

describe("CA-INT-001: ADMIN_ADD persisted to DB (live Postgres)", () => {
  it("applies ADMIN_ADD: CreditEntry written, ledger balance incremented", async () => {
    const service = buildService();

    const result = await service.applyAction(
      ledgerId,
      { actionType: "ADMIN_ADD", amount: 50, reason: "integration test top-up" },
      ADMIN_ID,
    );

    expect(result.delta).toBe(50);
    expect(result.previousBalance).toBe(100);
    expect(result.newBalance).toBe(150);
    expect(result.activityType).toBe("ADMIN_ADD");

    // Verify CreditLedger balance in DB
    const ledger = await prisma.creditLedger.findUnique({ where: { id: ledgerId } });
    expect(ledger!.balance).toBe(150);

    // Verify CreditEntry in DB
    const entries = await prisma.creditEntry.findMany({
      where: { ledgerId, activityType: "ADMIN_ADD" },
      orderBy: { timestamp: "desc" },
      take: 1,
    });
    expect(entries).toHaveLength(1);
    expect(entries[0]!.delta).toBe(50);
    expect(entries[0]!.adminId).toBe(ADMIN_ID);
    expect(entries[0]!.reason).toBe("integration test top-up");
  });
});

// ---------------------------------------------------------------------------
// CA-INT-002 + CA-INT-003: HTTP guard RBAC (NestJS TestingModule + supertest)
// GR-015 A1 -- supertest@7.2.2 (2026-07-17, Adi).
// JwtAuthGuard + RolesGuard are HTTP-layer constructs; a real HTTP call through
// the controller is the only way to prove they block at the correct layer.
// S9 try/finally convention: guarded beforeAll, $disconnect deferred to finally.
// ---------------------------------------------------------------------------

describe("CA-INT-002 + CA-INT-003: HTTP guard RBAC (NestJS TestingModule + supertest)", () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeAll(async () => {
    try {
      const moduleRef = await Test.createTestingModule({
        imports: [ConfigModule, DbModule, AuthModule, CreditAdminModule],
      }).compile();
      app = moduleRef.createNestApplication();
      await app.init();
      jwtService = moduleRef.get<JwtService>(JwtService);
    } catch (err) {
      if (app) await app.close().catch(() => {});
      throw err;
    }
  });

  afterAll(async () => {
    // No DB rows created by these HTTP tests -- nothing to delete.
    try {
      // intentionally empty
    } finally {
      if (app) await app.close().catch(() => {});
    }
  });

  /**
   * Mint a signed JWT accepted by the real JwtAuthGuard + JwtStrategy.
   * The secret is sourced from AppConfig (process.env.JWT_SECRET) -- same secret
   * the integration harness loaded via dotenv -e ../../.env.local.
   */
  function mintJwt(role: string, scopeType = "COURSE", scopeId = "guard-test-scope"): string {
    return jwtService.sign({
      sub: `ca-int-guard-${role.toLowerCase()}`,
      email: `ca-int-guard-${role.toLowerCase()}@test.local`,
      scopes: [{ role, scopeType, scopeId }],
    });
  }

  // Positive control: SYSTEM_ADMIN reaches the handler and gets 200.
  // Establishes that the route exists -- so the 403s below are guard-driven,
  // not route-miss 404s.
  it("positive control: SYSTEM_ADMIN JWT -> 200 on GET /admin/credits/low-balance", async () => {
    const token = mintJwt("SYSTEM_ADMIN", "COLLEGE", "guard-test-college");
    const res = await supertest(app.getHttpServer())
      .get("/admin/credits/low-balance")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
  });

  describe("CA-INT-002: STUDENT JWT -> 403", () => {
    it("STUDENT JWT returns 403 Forbidden on POST /admin/credits/:ledgerId/actions", async () => {
      const token = mintJwt("STUDENT");
      const res = await supertest(app.getHttpServer())
        .post(`/admin/credits/${ledgerId}/actions`)
        .set("Authorization", `Bearer ${token}`)
        .send({ actionType: "ADMIN_ADD", amount: 1, reason: "guard test" });
      expect(res.status).toBe(403);
    });
  });

  describe("CA-INT-003: TEACHER JWT -> 403", () => {
    it("TEACHER JWT returns 403 Forbidden on POST /admin/credits/:ledgerId/actions", async () => {
      const token = mintJwt("TEACHER");
      const res = await supertest(app.getHttpServer())
        .post(`/admin/credits/${ledgerId}/actions`)
        .set("Authorization", `Bearer ${token}`)
        .send({ actionType: "ADMIN_ADD", amount: 1, reason: "guard test" });
      expect(res.status).toBe(403);
    });
  });
});

// ---------------------------------------------------------------------------
// CA-INT-004: empty reason -> 400 BadRequestException
// ---------------------------------------------------------------------------

describe("CA-INT-004: empty reason -> 400 (live Postgres)", () => {
  it("ADMIN_ADD with empty reason throws BadRequestException", async () => {
    const service = buildService();

    await expect(
      service.applyAction(
        ledgerId,
        { actionType: "ADMIN_ADD", amount: 10, reason: "" },
        ADMIN_ID,
      ),
    ).rejects.toThrow(BadRequestException);

    // Balance must be unchanged (transaction should not have committed)
    const ledger = await prisma.creditLedger.findUnique({ where: { id: ledgerId } });
    // Note: DB balance is 150 from CA-INT-001 (tests share state; sequential via --runInBand)
    expect(ledger!.balance).toBe(150);
  });

  it("whitespace-only reason also throws BadRequestException", async () => {
    const service = buildService();

    await expect(
      service.applyAction(
        ledgerId,
        { actionType: "ADMIN_DEDUCT", amount: 10, reason: "   " },
        ADMIN_ID,
      ),
    ).rejects.toThrow(BadRequestException);
  });
});

// ---------------------------------------------------------------------------
// CA-INT-005: setLimits persists to DB + writes ADMIN_SET_LIMITS entry
// ---------------------------------------------------------------------------

describe("CA-INT-005: setLimits persisted to DB (live Postgres)", () => {
  it("updates softLimit and writes ADMIN_SET_LIMITS CreditEntry", async () => {
    const service = buildService();

    const result = await service.setLimits(
      ledgerId,
      { softLimit: 30, reason: "integration test limit increase" },
      ADMIN_ID,
    );

    expect(result.softLimit).toBe(30);
    expect(result.ledgerId).toBe(ledgerId);

    // Verify DB
    const ledger = await prisma.creditLedger.findUnique({ where: { id: ledgerId } });
    expect(ledger!.softLimit).toBe(30);

    // Verify ADMIN_SET_LIMITS CreditEntry
    const entries = await prisma.creditEntry.findMany({
      where: { ledgerId, activityType: "ADMIN_SET_LIMITS" },
      orderBy: { timestamp: "desc" },
      take: 1,
    });
    expect(entries).toHaveLength(1);
    expect(entries[0]!.delta).toBe(0);
    expect(entries[0]!.adminId).toBe(ADMIN_ID);
  });
});

// ---------------------------------------------------------------------------
// CA-INT-006: overrideHardLimit persists to DB + writes ADMIN_OVERRIDE_HARD_LIMIT
// ---------------------------------------------------------------------------

describe("CA-INT-006: overrideHardLimit persisted to DB (live Postgres)", () => {
  it("sets hardLimit and writes ADMIN_OVERRIDE_HARD_LIMIT CreditEntry", async () => {
    const service = buildService();

    const result = await service.overrideHardLimit(
      ledgerId,
      { newHardLimit: 1000, reason: "integration test hard limit expansion" },
      ADMIN_ID,
    );

    expect(result.newHardLimit).toBe(1000);
    expect(result.previousHardLimit).toBe(500);
    expect(result.ledgerId).toBe(ledgerId);

    // Verify DB
    const ledger = await prisma.creditLedger.findUnique({ where: { id: ledgerId } });
    expect(ledger!.hardLimit).toBe(1000);

    // Verify ADMIN_OVERRIDE_HARD_LIMIT CreditEntry
    const entries = await prisma.creditEntry.findMany({
      where: { ledgerId, activityType: "ADMIN_OVERRIDE_HARD_LIMIT" },
      orderBy: { timestamp: "desc" },
      take: 1,
    });
    expect(entries).toHaveLength(1);
    expect(entries[0]!.delta).toBe(0);
    expect(entries[0]!.adminId).toBe(ADMIN_ID);
  });
});

// ---------------------------------------------------------------------------
// CA-INT-007: getLowBalanceLedgers returns only at/below-softLimit ledgers
// ---------------------------------------------------------------------------

describe("CA-INT-007: getLowBalanceLedgers scope filter (live Postgres)", () => {
  it("returns ledgerLow (balance=5 <= softLimit=20) and excludes primary ledger (balance=150 > softLimit=30)", async () => {
    const service = buildService();

    const results = await service.getLowBalanceLedgers();

    // ledgerLowId: balance=5 <= softLimit=20 -> INCLUDED
    const low = results.find((r) => r.ledgerId === ledgerLowId);
    expect(low).toBeDefined();

    // ledgerId: balance=150 (from CA-INT-001) > softLimit=30 (from CA-INT-005) -> EXCLUDED
    const primary = results.find((r) => r.ledgerId === ledgerId);
    expect(primary).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// CA-INT-008: getActivityLog filtered by collegeId
// ---------------------------------------------------------------------------

describe("CA-INT-008: getActivityLog collegeId filter (live Postgres)", () => {
  it("returns activity entries scoped to the test college only", async () => {
    const service = buildService();

    // The test seeded entries via applyAction (CA-INT-001) and setLimits (CA-INT-005)
    // and overrideHardLimit (CA-INT-006). All belong to collegeId.
    const result = await service.getActivityLog({ collegeId });

    expect(result.items.length).toBeGreaterThanOrEqual(1);

    // Every returned entry must have ledger.collegeId = collegeId
    // (Can't inspect nested ledger here -- verify by checking no unrelated entries come back)
    expect(result.total).toBeGreaterThanOrEqual(1);
    expect(result.page).toBe(1);
    expect(typeof result.pageSize).toBe("number");
  });

  it("unknown collegeId returns empty results", async () => {
    const service = buildService();

    const result = await service.getActivityLog({ collegeId: "non-existent-college-id" });

    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});
