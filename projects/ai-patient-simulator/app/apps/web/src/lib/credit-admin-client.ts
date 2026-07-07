// credit-admin-client.ts -- typed client for Credit-Admin UI.
// APS-REQ-143, 144, 147, 148.
// ADMIN-ONLY -- students never call or see this module (APS-REQ-145).
// Pattern mirrors dashboard-client.ts and api-client.ts:
//   NEXT_PUBLIC_USE_MOCK="true" -> canned Hebrew mock data.
//   Otherwise: real API calls to /admin/credits/*.

import type {
  CreditAdminVM,
  CreditActionType,
  LowBalanceAlertConfig,
  CourseLedger,
} from "./credit-admin-types";
import { authedGet, authedPost, authedPatch } from "./http";

// Mock mode: NEXT_PUBLIC_USE_MOCK === "true" only.
// When a real API URL is configured, real calls happen by default.
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// ---------------------------------------------------------------------------
// Mock data -- one College, three Courses (APS pilot scope)
// ---------------------------------------------------------------------------

const MOCK_VM: CreditAdminVM = {
  college: {
    collegeId: "college-001",
    collegeName: "המכללה האקדמית למדעי הבריאות",
    totalBalance: 2_850,
    courses: [
      {
        courseId: "course-001",
        courseName: "ראיון קליני I",
        balance: 1_200,
        softLimit: 300,
        hardLimit: 1_500,
        lastEventAt: "2026-07-03T14:30:00Z",
        hardLimitOverrideActive: false,
        hardLimitOverrideUntil: null,
      },
      {
        courseId: "course-002",
        courseName: "הערכת סיכון -- מתקדם",
        balance: 950,
        softLimit: 250,
        hardLimit: 1_200,
        lastEventAt: "2026-07-02T11:15:00Z",
        hardLimitOverrideActive: true,
        hardLimitOverrideUntil: "2026-07-10T23:59:59Z",
      },
      {
        courseId: "course-003",
        courseName: "כישורים תקשורתיים -- בסיסי",
        balance: 700,
        softLimit: 200,
        hardLimit: 900,
        lastEventAt: "2026-07-01T09:00:00Z",
        hardLimitOverrideActive: false,
        hardLimitOverrideUntil: null,
      },
    ],
  },
  activityLog: [
    {
      id: "act-001",
      courseId: "course-001",
      courseName: "ראיון קליני I",
      activityType: "SIMULATION_TURN",
      amount: 3,
      timestamp: "2026-07-03T14:30:00Z",
      attemptId: "attempt-u001-asgn001",
    },
    {
      id: "act-002",
      courseId: "course-001",
      courseName: "ראיון קליני I",
      activityType: "EVALUATION_RUN",
      amount: 10,
      timestamp: "2026-07-03T14:28:00Z",
      attemptId: "attempt-u001-asgn001",
    },
    {
      id: "act-003",
      courseId: "course-002",
      courseName: "הערכת סיכון -- מתקדם",
      activityType: "DEBRIEF_TURN",
      amount: 2,
      timestamp: "2026-07-02T11:15:00Z",
      attemptId: "attempt-u002-asgn002",
    },
    {
      id: "act-004",
      courseId: "course-003",
      courseName: "כישורים תקשורתיים -- בסיסי",
      activityType: "SIMULATION_TURN",
      amount: 3,
      timestamp: "2026-07-01T09:00:00Z",
      attemptId: "attempt-u003-asgn003",
    },
    {
      id: "act-005",
      courseId: "course-001",
      courseName: "ראיון קליני I",
      activityType: "SIMULATION_TURN",
      amount: 3,
      timestamp: "2026-07-01T08:45:00Z",
      attemptId: "attempt-u004-asgn001",
    },
    {
      id: "act-006",
      courseId: "course-002",
      courseName: "הערכת סיכון -- מתקדם",
      activityType: "EXPORT",
      amount: 1,
      timestamp: "2026-06-30T16:00:00Z",
      attemptId: null,
    },
  ],
  auditLog: [
    {
      id: "aud-001",
      adminId: "admin-001",
      adminName: "מנהל המערכת",
      action: "OVERRIDE_HARD_LIMIT",
      amount: null,
      reason: "בקשת מרצה -- סיום מחזור לפני הקיץ",
      timestamp: "2026-07-02T10:00:00Z",
      courseId: "course-002",
      courseName: "הערכת סיכון -- מתקדם",
    },
    {
      id: "aud-002",
      adminId: "admin-001",
      adminName: "מנהל המערכת",
      action: "GRANT_BONUS",
      amount: 200,
      reason: "הזרמת קרדיטים לכיסוי תקלה טכנית (FS-02)",
      timestamp: "2026-06-28T09:00:00Z",
      courseId: "course-001",
      courseName: "ראיון קליני I",
    },
    {
      id: "aud-003",
      adminId: "admin-002",
      adminName: "מנהל מכללה",
      action: "SET_SOFT_LIMIT",
      amount: 300,
      reason: "עדכון ריף בהתאם לתכנית הלימודים החדשה",
      timestamp: "2026-06-25T14:00:00Z",
      courseId: "course-001",
      courseName: "ראיון קליני I",
    },
    {
      id: "aud-004",
      adminId: "admin-002",
      adminName: "מנהל מכללה",
      action: "ADD",
      amount: 500,
      reason: "רכישת חבילת קרדיטים -- Q3 2026",
      timestamp: "2026-06-20T12:00:00Z",
      courseId: null,
      courseName: null,
    },
  ],
  alertConfig: {
    thresholdPct: 20,
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deepCloneMock(): CreditAdminVM {
  return JSON.parse(JSON.stringify(MOCK_VM)) as CreditAdminVM;
}

// ---------------------------------------------------------------------------
// Real API stubs (Sprint 3+ -- wired to /admin/credits endpoints)
// ---------------------------------------------------------------------------

async function fetchAdminVMReal(collegeId: string): Promise<CreditAdminVM> {
  return authedGet<CreditAdminVM>(
    `admin/credits/${encodeURIComponent(collegeId)}`,
  );
}

async function postCreditActionReal(
  courseId: string,
  action: CreditActionType,
  payload: {
    amount?: number;
    reason: string;
    softLimit?: number;
    hardLimit?: number;
    overrideUntil?: string;
  },
): Promise<{ ok: boolean }> {
  return authedPost<{ ok: boolean }>(
    `admin/credits/${encodeURIComponent(courseId)}/action`,
    { action, ...payload },
  );
}

async function patchAlertConfigReal(
  collegeId: string,
  config: LowBalanceAlertConfig,
): Promise<{ ok: boolean }> {
  return authedPatch<{ ok: boolean }>(
    `admin/credits/${encodeURIComponent(collegeId)}/alert-config`,
    config,
  );
}

// ---------------------------------------------------------------------------
// Public surface
// ---------------------------------------------------------------------------

export async function fetchCreditAdminVM(collegeId: string): Promise<CreditAdminVM> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 500));
    return deepCloneMock();
  }
  return fetchAdminVMReal(collegeId);
}

/** Apply a credit action (add / deduct / reset / grant-bonus / set limits / override). */
export async function applyCreditAction(
  courseId: string,
  action: CreditActionType,
  payload: {
    amount?: number;
    reason: string;
    softLimit?: number;
    hardLimit?: number;
    overrideUntil?: string;
  },
): Promise<{ ok: boolean }> {
  if (USE_MOCK) {
    console.log("[credit-admin mock] applyCreditAction", courseId, action, payload);
    await new Promise<void>((r) => setTimeout(r, 400));
    return { ok: true };
  }
  return postCreditActionReal(courseId, action, payload);
}

/** Update low-balance alert threshold for the college. */
export async function updateAlertConfig(
  collegeId: string,
  config: LowBalanceAlertConfig,
): Promise<{ ok: boolean }> {
  if (USE_MOCK) {
    console.log("[credit-admin mock] updateAlertConfig", collegeId, config);
    await new Promise<void>((r) => setTimeout(r, 300));
    return { ok: true };
  }
  return patchAlertConfigReal(collegeId, config);
}

/**
 * Stub export action (APS-REQ-148).
 * In mock mode: logs to console (no file produced).
 * In real mode: POST to /admin/credits/:collegeId/export triggers a download.
 */
export async function exportCreditReport(
  collegeId: string,
  format: "CSV" | "PDF",
): Promise<void> {
  if (USE_MOCK) {
    console.log(
      `[credit-admin mock] exportCreditReport collegeId=${collegeId} format=${format}`,
    );
    await new Promise<void>((r) => setTimeout(r, 300));
    return;
  }
  await authedPost<unknown>(
    `admin/credits/${encodeURIComponent(collegeId)}/export?format=${format}`,
    {},
  );
  // Real implementation would trigger a file download via a blob URL.
}

/** Convenience: is mock mode active? */
export function isCreditAdminMockMode(): boolean {
  return USE_MOCK;
}

// Re-export ledger type so pages can import from one place.
export type { CourseLedger, CreditAdminVM };
