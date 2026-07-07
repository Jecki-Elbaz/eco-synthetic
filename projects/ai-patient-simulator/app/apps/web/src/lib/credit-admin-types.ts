// credit-admin-types.ts -- client-side view-model types for the Credit-Admin UI.
// APS-REQ-143, 144, 147, 148.
// Admin-only tool (System Admin + College Manager roles).
// Students NEVER see these types or this data (APS-REQ-145).

// ---------------------------------------------------------------------------
// Enums / unions
// ---------------------------------------------------------------------------

export type CreditActionType =
  | "ADD"
  | "DEDUCT"
  | "RESET"
  | "GRANT_BONUS"
  | "SET_SOFT_LIMIT"
  | "SET_HARD_LIMIT"
  | "OVERRIDE_HARD_LIMIT";

export type ActivityType =
  | "SIMULATION_TURN"
  | "EVALUATION_RUN"
  | "DEBRIEF_TURN"
  | "EXPORT";

// ---------------------------------------------------------------------------
// Ledger and balance
// ---------------------------------------------------------------------------

export interface CourseLedger {
  courseId: string;
  courseName: string;
  /** Current credit balance (whole number) */
  balance: number;
  /** Soft-limit threshold (number of credits) */
  softLimit: number;
  /** Hard-limit threshold (credits); 0 = no hard limit set */
  hardLimit: number;
  /** ISO timestamp of last credit event */
  lastEventAt: string | null;
  /** Is the hard limit currently overridden? */
  hardLimitOverrideActive: boolean;
  /** ISO timestamp when the override expires; null if no active override */
  hardLimitOverrideUntil: string | null;
}

export interface CollegeSummary {
  collegeId: string;
  collegeName: string;
  totalBalance: number;
  courses: CourseLedger[];
}

// ---------------------------------------------------------------------------
// Activity log (deduction events)
// ---------------------------------------------------------------------------

export interface ActivityLogEntry {
  id: string;
  courseId: string;
  courseName: string;
  activityType: ActivityType;
  /** Credits consumed (positive integer) */
  amount: number;
  timestamp: string; // ISO
  /** Optional: which student attempt triggered this */
  attemptId: string | null;
}

// ---------------------------------------------------------------------------
// Audit log (admin manual changes)
// ---------------------------------------------------------------------------

export interface AuditLogEntry {
  id: string;
  adminId: string;
  adminName: string;
  action: CreditActionType;
  /** Credits added or removed; negative for deductions */
  amount: number | null;
  reason: string;
  timestamp: string; // ISO
  courseId: string | null;
  courseName: string | null;
}

// ---------------------------------------------------------------------------
// Alert config
// ---------------------------------------------------------------------------

export interface LowBalanceAlertConfig {
  /** Threshold as a percentage of hard limit (0-100) */
  thresholdPct: number;
}

// ---------------------------------------------------------------------------
// Top-level view-model returned by credit-admin-client
// ---------------------------------------------------------------------------

export interface CreditAdminVM {
  college: CollegeSummary;
  activityLog: ActivityLogEntry[];
  auditLog: AuditLogEntry[];
  alertConfig: LowBalanceAlertConfig;
}
