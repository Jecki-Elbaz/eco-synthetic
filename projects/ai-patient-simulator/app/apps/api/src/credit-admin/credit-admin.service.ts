// CreditAdminService -- admin governance layer for credit ledgers.
// APS-REQ-139..148 (pilot: SYSTEM_ADMIN only; COLLEGE_MANAGER deferred).
//
// Design notes:
//   - Every mutating action runs inside a Prisma $transaction:
//       (1) writes a CreditEntry (audit record)
//       (2) updates CreditLedger.balance / limits
//   - adminId is always sourced from the caller's JWT sub (never from the body).
//   - Empty/whitespace-only reason is rejected with BadRequestException (400).
//
// SCHEMA GAP 1 (APS-REQ-143 hard-limit override expiry):
//   CreditLedger has no hardLimitOverrideUntil DateTime? column.
//   override() sets/clears hardLimit permanently and records the gap in the
//   audit entry reason. A migration must add hardLimitOverrideUntil before
//   time-boxed auto-expiry can be implemented.
//
// SCHEMA GAP 2 (APS-REQ-147 configurable alert threshold):
//   CreditLedger has no lowBalanceThresholdPct (or equivalent) column.
//   getLowBalanceLedgers() uses softLimit as the threshold for the pilot.
//   A migration must add a dedicated threshold field for configurable % logic.

import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../db/prisma.service.js";
import type {
  CreditLedgerView,
  CreditEntryView,
  CreditUsageSummary,
  AdminCreditActionDto,
  AdminCreditActionResult,
  SetLimitsDto,
  SetLimitsResult,
  OverrideHardLimitDto,
  OverrideHardLimitResult,
  LowBalanceLedger,
  ActivityLogQuery,
} from "@aps/shared-types";
import type { PaginatedResponse } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Internal Prisma row shapes (only fields we select)
// ---------------------------------------------------------------------------

interface LedgerRow {
  id: string;
  collegeId: string;
  courseId: string | null;
  balance: number;
  softLimit: number | null;
  hardLimit: number | null;
}

interface EntryRow {
  id: string;
  ledgerId: string;
  adminId: string | null;
  activityType: string;
  delta: number;
  reason: string | null;
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function requireReason(reason: string | undefined | null, context: string): void {
  if (!reason || reason.trim().length === 0) {
    throw new BadRequestException(`reason is required for ${context}`);
  }
}

function ledgerToView(row: LedgerRow): CreditLedgerView {
  return {
    id: row.id,
    collegeId: row.collegeId,
    courseId: row.courseId,
    balance: row.balance,
    softLimit: row.softLimit,
    hardLimit: row.hardLimit,
  };
}

function entryToView(row: EntryRow): CreditEntryView {
  return {
    id: row.id,
    ledgerId: row.ledgerId,
    adminId: row.adminId,
    activityType: row.activityType,
    delta: row.delta,
    reason: row.reason,
    timestamp: row.timestamp.toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class CreditAdminService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------------------
  // VISIBILITY: usage by college
  // APS-REQ-144
  // -------------------------------------------------------------------------

  async getCollegeUsage(collegeId: string): Promise<CreditUsageSummary[]> {
    // All ledgers for the college (college-level + course-level)
    const ledgers = await (this.prisma as unknown as PrismaLike).creditLedger.findMany({
      where: { collegeId },
      include: { entries: true },
    }) as Array<LedgerRow & { entries: EntryRow[] }>;

    return ledgers.map((l) => buildUsageSummary(l));
  }

  // -------------------------------------------------------------------------
  // VISIBILITY: usage by course
  // APS-REQ-144
  // -------------------------------------------------------------------------

  async getCourseUsage(courseId: string): Promise<CreditUsageSummary> {
    const ledger = await (this.prisma as unknown as PrismaLike).creditLedger.findFirst({
      where: { courseId },
      include: { entries: true },
    }) as (LedgerRow & { entries: EntryRow[] }) | null;

    if (!ledger) {
      throw new NotFoundException(`CreditLedger for courseId=${courseId} not found`);
    }
    return buildUsageSummary(ledger);
  }

  // -------------------------------------------------------------------------
  // VISIBILITY: current balance + limits per ledger
  // APS-REQ-144
  // -------------------------------------------------------------------------

  async getLedger(ledgerId: string): Promise<CreditLedgerView> {
    const ledger = await (this.prisma as unknown as PrismaLike).creditLedger.findUnique({
      where: { id: ledgerId },
    }) as LedgerRow | null;

    if (!ledger) {
      throw new NotFoundException(`CreditLedger ${ledgerId} not found`);
    }
    return ledgerToView(ledger);
  }

  // -------------------------------------------------------------------------
  // VISIBILITY: activity log (CreditEntry list, filterable)
  // APS-REQ-144
  // -------------------------------------------------------------------------

  async getActivityLog(query: ActivityLogQuery): Promise<PaginatedResponse<CreditEntryView>> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {};

    if (query.collegeId) {
      where["ledger"] = { collegeId: query.collegeId };
    }
    if (query.courseId) {
      where["ledger"] = { ...(where["ledger"] as object ?? {}), courseId: query.courseId };
    }
    if (query.from || query.to) {
      const timestampFilter: Record<string, Date> = {};
      if (query.from) timestampFilter["gte"] = new Date(query.from);
      if (query.to) timestampFilter["lte"] = new Date(query.to);
      where["timestamp"] = timestampFilter;
    }

    const [entries, total] = await Promise.all([
      (this.prisma as unknown as PrismaLike).creditEntry.findMany({
        where,
        orderBy: { timestamp: "desc" },
        skip,
        take: pageSize,
      }) as Promise<EntryRow[]>,
      (this.prisma as unknown as PrismaLike).creditEntry.count({ where }) as Promise<number>,
    ]);

    return {
      items: (entries as EntryRow[]).map(entryToView),
      total,
      page,
      pageSize,
    };
  }

  // -------------------------------------------------------------------------
  // CAPABILITIES: add / deduct / reset / grant-bonus
  // APS-REQ-143
  // Each runs in a $transaction: CreditEntry write + CreditLedger.balance update.
  // -------------------------------------------------------------------------

  async applyAction(
    ledgerId: string,
    dto: AdminCreditActionDto,
    adminId: string,
  ): Promise<AdminCreditActionResult> {
    requireReason(dto.reason, `action ${dto.actionType}`);

    // amount=0 is meaningful only for ADMIN_RESET (reset balance to 0). For ADD/DEDUCT/BONUS
    // a zero amount is a no-op that writes a misleading delta=0 audit row -- reject it.
    if (dto.actionType !== "ADMIN_RESET" && dto.amount === 0) {
      throw new BadRequestException(
        `amount must be non-zero for ${dto.actionType}`,
      );
    }

    const ledger = await (this.prisma as unknown as PrismaLike).creditLedger.findUnique({
      where: { id: ledgerId },
    }) as LedgerRow | null;

    if (!ledger) {
      throw new NotFoundException(`CreditLedger ${ledgerId} not found`);
    }

    const previousBalance = ledger.balance;
    let delta: number;
    let newBalance: number;

    switch (dto.actionType) {
      case "ADMIN_ADD":
        delta = Math.abs(dto.amount);
        newBalance = previousBalance + delta;
        break;
      case "ADMIN_DEDUCT":
        delta = -Math.abs(dto.amount);
        newBalance = previousBalance + delta;
        break;
      case "ADMIN_BONUS":
        delta = Math.abs(dto.amount);
        newBalance = previousBalance + delta;
        break;
      case "ADMIN_RESET":
        // amount = target balance; delta = target - current
        newBalance = dto.amount;
        delta = newBalance - previousBalance;
        break;
      default: {
        const _exhaustive: never = dto.actionType;
        throw new BadRequestException(`Unknown actionType: ${String(_exhaustive)}`);
      }
    }

    const [entry] = await (this.prisma as unknown as PrismaLike).$transaction([
      (this.prisma as unknown as PrismaLike).creditEntry.create({
        data: {
          ledgerId,
          adminId,
          activityType: dto.actionType,
          delta,
          reason: dto.reason.trim(),
          timestamp: new Date(),
        },
      }),
      (this.prisma as unknown as PrismaLike).creditLedger.update({
        where: { id: ledgerId },
        data: { balance: newBalance },
      }),
    ]) as [EntryRow, LedgerRow];

    return {
      ledgerId,
      previousBalance,
      newBalance,
      delta,
      activityType: dto.actionType,
      entryId: entry.id,
    };
  }

  // -------------------------------------------------------------------------
  // LIMITS: set/edit softLimit + hardLimit
  // APS-REQ-141/142
  // Audited via a CreditEntry with activityType ADMIN_SET_LIMITS.
  // -------------------------------------------------------------------------

  async setLimits(
    ledgerId: string,
    dto: SetLimitsDto,
    adminId: string,
  ): Promise<SetLimitsResult> {
    requireReason(dto.reason, "setLimits");

    const ledger = await (this.prisma as unknown as PrismaLike).creditLedger.findUnique({
      where: { id: ledgerId },
    }) as LedgerRow | null;

    if (!ledger) {
      throw new NotFoundException(`CreditLedger ${ledgerId} not found`);
    }

    const limitUpdate: Record<string, number | null> = {};
    if (dto.softLimit !== undefined) limitUpdate["softLimit"] = dto.softLimit;
    if (dto.hardLimit !== undefined) limitUpdate["hardLimit"] = dto.hardLimit;

    const reasonText = dto.reason.trim();
    const [entry, updated] = await (this.prisma as unknown as PrismaLike).$transaction([
      (this.prisma as unknown as PrismaLike).creditEntry.create({
        data: {
          ledgerId,
          adminId,
          activityType: "ADMIN_SET_LIMITS",
          // delta 0 -- no balance change, purely an audit record
          delta: 0,
          reason: reasonText,
          timestamp: new Date(),
        },
      }),
      (this.prisma as unknown as PrismaLike).creditLedger.update({
        where: { id: ledgerId },
        data: limitUpdate,
      }),
    ]) as [EntryRow, LedgerRow];

    return {
      ledgerId,
      softLimit: updated.softLimit,
      hardLimit: updated.hardLimit,
      entryId: entry.id,
    };
  }

  // -------------------------------------------------------------------------
  // HARD-LIMIT OVERRIDE
  // APS-REQ-143 (manual override -- raise or clear hardLimit)
  //
  // SCHEMA GAP: no hardLimitOverrideUntil column on CreditLedger.
  // The override is permanent until manually cleared by another admin action.
  // The audit entry reason should document the intended expiry if applicable.
  // -------------------------------------------------------------------------

  async overrideHardLimit(
    ledgerId: string,
    dto: OverrideHardLimitDto,
    adminId: string,
  ): Promise<OverrideHardLimitResult> {
    requireReason(dto.reason, "overrideHardLimit");

    const ledger = await (this.prisma as unknown as PrismaLike).creditLedger.findUnique({
      where: { id: ledgerId },
    }) as LedgerRow | null;

    if (!ledger) {
      throw new NotFoundException(`CreditLedger ${ledgerId} not found`);
    }

    const previousHardLimit = ledger.hardLimit;
    // Embed the schema-gap notice in the stored reason so operators know
    // the override has no auto-expiry until hardLimitOverrideUntil is added.
    const auditReason =
      `[OVERRIDE -- no auto-expiry; schema gap APS-REQ-143] ${dto.reason.trim()}`;

    const [entry, updated] = await (this.prisma as unknown as PrismaLike).$transaction([
      (this.prisma as unknown as PrismaLike).creditEntry.create({
        data: {
          ledgerId,
          adminId,
          activityType: "ADMIN_OVERRIDE_HARD_LIMIT",
          delta: 0,
          reason: auditReason,
          timestamp: new Date(),
        },
      }),
      (this.prisma as unknown as PrismaLike).creditLedger.update({
        where: { id: ledgerId },
        data: { hardLimit: dto.newHardLimit },
      }),
    ]) as [EntryRow, LedgerRow];

    return {
      ledgerId,
      previousHardLimit,
      newHardLimit: updated.hardLimit,
      entryId: entry.id,
    };
  }

  // -------------------------------------------------------------------------
  // LOW-BALANCE ALERT
  // APS-REQ-147 (pilot: balance <= softLimit treated as low-balance threshold)
  //
  // SCHEMA GAP: no configurable threshold field on CreditLedger.
  // Using softLimit as the pilot threshold. A future migration must add
  // lowBalanceThresholdPct (or similar) for configurable % logic.
  // -------------------------------------------------------------------------

  async getLowBalanceLedgers(): Promise<LowBalanceLedger[]> {
    // balance <= softLimit AND softLimit is not null
    const ledgers = await (this.prisma as unknown as PrismaLike).creditLedger.findMany({
      where: {
        softLimit: { not: null },
        // Prisma can't do column-to-column comparison directly;
        // we fetch all with softLimit set and filter in JS.
        // For the pilot dataset this is acceptable; a raw query would be
        // more efficient at scale.
      },
    }) as LedgerRow[];

    return ledgers
      .filter((l) => l.softLimit !== null && l.balance <= l.softLimit)
      .map((l) => ({
        ledgerId: l.id,
        collegeId: l.collegeId,
        courseId: l.courseId,
        balance: l.balance,
        softLimit: l.softLimit,
      }));
  }
}

// ---------------------------------------------------------------------------
// Internal type shim -- Prisma models are code-generated; we access via
// unknown cast to avoid importing @aps/db types that may differ per migration.
// The mocked-Prisma pattern (used in tests) matches this interface.
// ---------------------------------------------------------------------------

interface PrismaLike {
  creditLedger: {
    findUnique: (args: unknown) => Promise<unknown>;
    findFirst: (args: unknown) => Promise<unknown>;
    findMany: (args: unknown) => Promise<unknown[]>;
    update: (args: unknown) => Promise<unknown>;
    count?: (args: unknown) => Promise<number>;
  };
  creditEntry: {
    findMany: (args: unknown) => Promise<unknown[]>;
    create: (args: unknown) => Promise<unknown>;
    count: (args: unknown) => Promise<number>;
  };
  $transaction: (ops: unknown[] | ((tx: PrismaLike) => Promise<unknown>)) => Promise<unknown[]>;
}

// Re-export for usage summary helper (below service class)
function buildUsageSummary(l: LedgerRow & { entries: EntryRow[] }): CreditUsageSummary {
  let totalDebited = 0;
  let totalCredited = 0;

  for (const e of l.entries) {
    if (e.delta < 0) totalDebited += Math.abs(e.delta);
    else if (e.delta > 0) totalCredited += e.delta;
  }

  return {
    ledgerId: l.id,
    collegeId: l.collegeId,
    courseId: l.courseId,
    balance: l.balance,
    softLimit: l.softLimit,
    hardLimit: l.hardLimit,
    totalDebited,
    totalCredited,
    entryCount: l.entries.length,
  };
}
