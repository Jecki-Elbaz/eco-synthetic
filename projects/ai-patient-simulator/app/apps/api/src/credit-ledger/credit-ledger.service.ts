// CreditLedgerService -- runtime deduction layer.
// Distinct from CreditAdminService (admin governance).
// Called by SimulationService on each turn-complete event.
//
// Contract:
//   deductCredits(ledgerId, amount, deduction_reason)
//     - Rejects if amount <= 0.
//     - Loads ledger; throws NotFoundException if missing.
//     - Throws HardLimitExceededException (403) if hardLimit is set and
//       (balance - amount) would go below zero after hard limit enforcement.
//       Specifically: if hardLimit is set, the usable balance is
//       min(balance, hardLimit). Deduction that would push the effective
//       balance below 0 is rejected.
//     - Runs a $transaction:
//         (1) creates a CreditEntry with activityType SIMULATION_DEDUCT,
//             delta = -amount, deduction_reason populated.
//         (2) decrements CreditLedger.balance by amount.
//     - Returns DeductCreditsResult.
//
// APS-REQ-139..142 (audit trail + hard-limit enforcement).

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../db/prisma.service.js";

// ---------------------------------------------------------------------------
// Public result type
// ---------------------------------------------------------------------------

export interface DeductCreditsResult {
  entryId: string;
  ledgerId: string;
  previousBalance: number;
  newBalance: number;
  deduction_reason: string;
}

// ---------------------------------------------------------------------------
// Internal Prisma row shapes (only fields we select)
// ---------------------------------------------------------------------------

interface LedgerRow {
  id: string;
  balance: number;
  softLimit: number | null;
  hardLimit: number | null;
}

interface EntryRow {
  id: string;
}

// ---------------------------------------------------------------------------
// Internal Prisma client shim
// Mirrors the pattern in CreditAdminService to avoid importing generated types
// that may differ between migration states.
// ---------------------------------------------------------------------------

interface PrismaLike {
  creditLedger: {
    findUnique: (args: unknown) => Promise<unknown>;
    update: (args: unknown) => Promise<unknown>;
  };
  creditEntry: {
    create: (args: unknown) => Promise<unknown>;
  };
  $transaction: (
    ops: unknown[] | ((tx: PrismaLike) => Promise<unknown>),
  ) => Promise<unknown[]>;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class CreditLedgerService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------------------------------------------------------
  // deductCredits
  //
  // Parameters:
  //   ledgerId        -- CreditLedger PK
  //   amount          -- positive integer; credits to deduct
  //   deduction_reason -- mandatory; why this deduction occurred (e.g. "turn 12 -- simulation X")
  //
  // Throws:
  //   BadRequestException (400)  -- amount <= 0 or reason empty/whitespace
  //   NotFoundException   (404)  -- ledger not found
  //   ForbiddenException  (403)  -- hard limit would be exceeded
  // -------------------------------------------------------------------------

  async deductCredits(
    ledgerId: string,
    amount: number,
    deduction_reason: string,
  ): Promise<DeductCreditsResult> {
    if (amount <= 0) {
      throw new BadRequestException(
        `deductCredits: amount must be a positive integer, got ${amount}`,
      );
    }

    if (!deduction_reason || deduction_reason.trim().length === 0) {
      throw new BadRequestException(
        "deductCredits: deduction_reason is required and must not be empty",
      );
    }

    const prismaLike = this.prisma as unknown as PrismaLike;

    const ledger = (await prismaLike.creditLedger.findUnique({
      where: { id: ledgerId },
      select: { id: true, balance: true, softLimit: true, hardLimit: true },
    })) as LedgerRow | null;

    if (!ledger) {
      throw new NotFoundException(`CreditLedger ${ledgerId} not found`);
    }

    const previousBalance = ledger.balance;

    // Hard-limit enforcement.
    // If hardLimit is set, treat it as the ceiling on usable balance.
    // Effective available = min(balance, hardLimit).
    // Reject the deduction if it would exceed that ceiling (i.e. if
    // the effective available is less than the requested amount).
    if (ledger.hardLimit !== null) {
      const effectiveAvailable = Math.min(previousBalance, ledger.hardLimit);
      if (amount > effectiveAvailable) {
        throw new ForbiddenException(
          `deductCredits: hard limit would be exceeded. ` +
            `ledgerId=${ledgerId} hardLimit=${ledger.hardLimit} ` +
            `balance=${previousBalance} requested=${amount}`,
        );
      }
    }

    const newBalance = previousBalance - amount;
    const trimmedReason = deduction_reason.trim();

    const [entry] = (await prismaLike.$transaction([
      prismaLike.creditEntry.create({
        data: {
          ledgerId,
          activityType: "SIMULATION_DEDUCT",
          delta: -amount,
          deduction_reason: trimmedReason,
          timestamp: new Date(),
        },
      }),
      prismaLike.creditLedger.update({
        where: { id: ledgerId },
        data: { balance: newBalance },
      }),
    ])) as [EntryRow, LedgerRow];

    return {
      entryId: entry.id,
      ledgerId,
      previousBalance,
      newBalance,
      deduction_reason: trimmedReason,
    };
  }
}
