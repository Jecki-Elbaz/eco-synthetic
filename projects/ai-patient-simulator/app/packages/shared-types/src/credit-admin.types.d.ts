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
    timestamp: string;
}
export interface CreditUsageSummary {
    ledgerId: string;
    collegeId: string;
    courseId: string | null;
    balance: number;
    softLimit: number | null;
    hardLimit: number | null;
    totalDebited: number;
    totalCredited: number;
    entryCount: number;
}
export type AdminCreditActionType = "ADMIN_ADD" | "ADMIN_DEDUCT" | "ADMIN_RESET" | "ADMIN_BONUS";
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
export interface LowBalanceLedger {
    ledgerId: string;
    collegeId: string;
    courseId: string | null;
    balance: number;
    softLimit: number | null;
}
export interface ActivityLogQuery {
    collegeId?: string;
    courseId?: string;
    from?: string;
    to?: string;
    page?: number;
    pageSize?: number;
}
//# sourceMappingURL=credit-admin.types.d.ts.map