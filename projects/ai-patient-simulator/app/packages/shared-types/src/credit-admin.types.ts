// Credit-admin shared types (APS-REQ-139..148)
// Used across apps/api and apps/web (read-only from web side).
//
// SCHEMA GAP 1 (APS-REQ-143 override-expiry):
//   CreditLedger has no hardLimitOverrideUntil DateTime? field.
//   The current override endpoint raises or clears hardLimit with a mandatory
//   reason + audit entry but cannot enforce a time-boxed auto-expiry.
//   A future migration must add: hardLimitOverrideUntil DateTime? to CreditLedger.
//
// SCHEMA GAP 2 (APS-REQ-147 alert-threshold):
//   CreditLedger has no configurable low-balance threshold field.
//   Pilot implementation uses softLimit as the threshold (balance <= softLimit).
//   A future migration must add: lowBalanceThresholdPct Float? (or similar) to CreditLedger.

// ---------------------------------------------------------------------------
// Ledger + entry view types
// ---------------------------------------------------------------------------

export interface CreditLedgerView {
  id: string;
  collegeId: string;
  courseId: string | null;
  balance: number;
  softLimit: number | null;
  hardLimit: number | null;
}

export interface CreditEntryView {
  id: string;
  ledgerId: string;
  adminId: string | null;
  activityType: string;
  delta: number;
  reason: string | null;
  timestamp: string; // ISO-8601
}

// ---------------------------------------------------------------------------
// Aggregate usage response
// ---------------------------------------------------------------------------

export interface CreditUsageSummary {
  ledgerId: string;
  collegeId: string;
  courseId: string | null;
  balance: number;
  softLimit: number | null;
  hardLimit: number | null;
  totalDebited: number;  // sum of negative deltas
  totalCredited: number; // sum of positive deltas
  entryCount: number;
}

// ---------------------------------------------------------------------------
// Admin action DTOs
// ---------------------------------------------------------------------------

export type AdminCreditActionType =
  | "ADMIN_ADD"
  | "ADMIN_DEDUCT"
  | "ADMIN_RESET"
  | "ADMIN_BONUS";

export interface AdminCreditActionDto {
  actionType: AdminCreditActionType;
  /** Absolute value used as delta magnitude (always positive from caller).
   *  For ADMIN_RESET this is the target balance; for others it is the amount. */
  amount: number;
  /** Mandatory -- empty/whitespace-only is rejected (400). */
  reason: string;
}

export interface AdminCreditActionResult {
  ledgerId: string;
  previousBalance: number;
  newBalance: number;
  delta: number;
  activityType: AdminCreditActionType;
  entryId: string;
}

// ---------------------------------------------------------------------------
// Limit edit DTO
// ---------------------------------------------------------------------------

export interface SetLimitsDto {
  softLimit?: number | null;
  hardLimit?: number | null;
  /** Mandatory for any limit change -- empty/whitespace-only is rejected (400). */
  reason: string;
}

export interface SetLimitsResult {
  ledgerId: string;
  softLimit: number | null;
  hardLimit: number | null;
  entryId: string;
}

// ---------------------------------------------------------------------------
// Hard-limit override DTO
// ---------------------------------------------------------------------------

export interface OverrideHardLimitDto {
  /** New hardLimit value, or null to clear the override and restore the prior limit. */
  newHardLimit: number | null;
  /** Mandatory reason -- empty/whitespace-only is rejected (400).
   *
   *  SCHEMA GAP: no hardLimitOverrideUntil field exists on CreditLedger.
   *  Until the migration is applied, the override is permanent (admin must
   *  manually clear it). Document this in the audit entry reason. */
  reason: string;
}

export interface OverrideHardLimitResult {
  ledgerId: string;
  previousHardLimit: number | null;
  newHardLimit: number | null;
  entryId: string;
}

// ---------------------------------------------------------------------------
// Low-balance alert response
// ---------------------------------------------------------------------------

export interface LowBalanceLedger {
  ledgerId: string;
  collegeId: string;
  courseId: string | null;
  balance: number;
  softLimit: number | null;
  // NOTE: softLimit is used as threshold (pilot behaviour -- APS-REQ-147 gap).
}

// ---------------------------------------------------------------------------
// Activity log filter params
// ---------------------------------------------------------------------------

export interface ActivityLogQuery {
  collegeId?: string;
  courseId?: string;
  from?: string; // ISO-8601 date
  to?: string;   // ISO-8601 date
  page?: number;
  pageSize?: number;
}
