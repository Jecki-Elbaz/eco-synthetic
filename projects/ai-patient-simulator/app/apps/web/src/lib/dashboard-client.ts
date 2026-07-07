// dashboard-client.ts -- typed clients for Teacher Class Dashboard and Student Dashboard.
// Mock path returns deterministic Hebrew data (small cohort with mixed statuses).
// Pattern mirrors api-client.ts and evaluation-client.ts.

import type {
  ClassDashboardVM,
  StudentDashboardVM,
} from "./dashboard-types";
import { authedGet, authedPost } from "./http";

// Mock mode: NEXT_PUBLIC_USE_MOCK === "true" only.
// When a real API URL is configured, real calls happen by default.
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// ---------------------------------------------------------------------------
// Mock data -- Teacher Class Dashboard
// ---------------------------------------------------------------------------

const MOCK_CLASS_DASHBOARD: ClassDashboardVM = {
  collegeName: "המכללה האקדמית למדעי הבריאות",
  courseName: "ראיון קליני I",
  courseId: "course-demo-001",
  teacherName: "ד\"ר יעל כהן",
  lastUpdated: "2026-07-03T14:30:00Z",
  assignments: [
    { id: "asgn-001", title: "סימולציה 1 -- קבלה ראשונית" },
    { id: "asgn-002", title: "סימולציה 2 -- הערכת סיכון" },
  ],
  selectedAssignmentId: "asgn-001",
  criteria: [
    { id: "C-001", shortLabel: "C-001", label: "ברית טיפולית ואמפתיה", maxScore: 10 },
    { id: "C-002", shortLabel: "C-002", label: "שאלות פתוחות", maxScore: 10 },
    { id: "C-003", shortLabel: "C-003", label: "ניתוח תפקודי", maxScore: 10 },
    { id: "C-004", shortLabel: "C-004", label: "מודעות לסיכון", maxScore: 10 },
  ],
  students: [
    {
      userId: "u-001",
      displayName: "אורי לוי",
      status: "COMPLETED",
      overallScore: 7.5,
      criterionScores: [
        { criterionId: "C-001", label: "ברית טיפולית ואמפתיה", score: 8, maxScore: 10 },
        { criterionId: "C-002", label: "שאלות פתוחות", score: 7, maxScore: 10 },
        { criterionId: "C-003", label: "ניתוח תפקודי", score: 8, maxScore: 10 },
        { criterionId: "C-004", label: "מודעות לסיכון", score: 7, maxScore: 10 },
      ],
      flagType: null,
      flagDescription: null,
      attemptId: "attempt-u001-asgn001",
    },
    {
      userId: "u-002",
      displayName: "מיכל גרין",
      status: "COMPLETED",
      overallScore: 5.5,
      criterionScores: [
        { criterionId: "C-001", label: "ברית טיפולית ואמפתיה", score: 6, maxScore: 10 },
        { criterionId: "C-002", label: "שאלות פתוחות", score: 5, maxScore: 10 },
        { criterionId: "C-003", label: "ניתוח תפקודי", score: 6, maxScore: 10 },
        { criterionId: "C-004", label: "מודעות לסיכון", score: 5, maxScore: 10 },
      ],
      flagType: null,
      flagDescription: null,
      attemptId: "attempt-u002-asgn001",
    },
    {
      userId: "u-003",
      displayName: "דניאל שמיר",
      status: "COMPLETED",
      overallScore: 3.5,
      criterionScores: [
        { criterionId: "C-001", label: "ברית טיפולית ואמפתיה", score: 4, maxScore: 10 },
        { criterionId: "C-002", label: "שאלות פתוחות", score: 3, maxScore: 10 },
        { criterionId: "C-003", label: "ניתוח תפקודי", score: 3, maxScore: 10 },
        { criterionId: "C-004", label: "מודעות לסיכון", score: 4, maxScore: 10 },
      ],
      flagType: null,
      flagDescription: null,
      attemptId: "attempt-u003-asgn001",
    },
    {
      userId: "u-004",
      displayName: "נועה אברהם",
      status: "TECHNICALLY_AFFECTED",
      overallScore: null,
      criterionScores: [
        { criterionId: "C-001", label: "ברית טיפולית ואמפתיה", score: null, maxScore: 10 },
        { criterionId: "C-002", label: "שאלות פתוחות", score: null, maxScore: 10 },
        { criterionId: "C-003", label: "ניתוח תפקודי", score: null, maxScore: 10 },
        { criterionId: "C-004", label: "מודעות לסיכון", score: null, maxScore: 10 },
      ],
      flagType: "A",
      flagDescription: "הפסקת חשמל באמצע הסימולציה -- 18 תורות אבדו",
      attemptId: "attempt-u004-asgn001",
    },
    {
      userId: "u-005",
      displayName: "יהונתן ביטון",
      status: "FLAGGED",
      overallScore: 6.0,
      criterionScores: [
        { criterionId: "C-001", label: "ברית טיפולית ואמפתיה", score: 7, maxScore: 10 },
        { criterionId: "C-002", label: "שאלות פתוחות", score: 6, maxScore: 10 },
        { criterionId: "C-003", label: "ניתוח תפקודי", score: 5, maxScore: 10 },
        { criterionId: "C-004", label: "מודעות לסיכון", score: 6, maxScore: 10 },
      ],
      flagType: "B",
      flagDescription: "תגובה רגשית עזה בסיום הסימולציה -- מומלץ לפנות לתלמיד",
      attemptId: "attempt-u005-asgn001",
    },
    {
      userId: "u-006",
      displayName: "שירה מנדל",
      status: "IN_PROGRESS",
      overallScore: null,
      criterionScores: [
        { criterionId: "C-001", label: "ברית טיפולית ואמפתיה", score: null, maxScore: 10 },
        { criterionId: "C-002", label: "שאלות פתוחות", score: null, maxScore: 10 },
        { criterionId: "C-003", label: "ניתוח תפקודי", score: null, maxScore: 10 },
        { criterionId: "C-004", label: "מודעות לסיכון", score: null, maxScore: 10 },
      ],
      flagType: null,
      flagDescription: null,
      attemptId: "attempt-u006-asgn001",
    },
    {
      userId: "u-007",
      displayName: "אמיר כץ",
      status: "NOT_STARTED",
      overallScore: null,
      criterionScores: [
        { criterionId: "C-001", label: "ברית טיפולית ואמפתיה", score: null, maxScore: 10 },
        { criterionId: "C-002", label: "שאלות פתוחות", score: null, maxScore: 10 },
        { criterionId: "C-003", label: "ניתוח תפקודי", score: null, maxScore: 10 },
        { criterionId: "C-004", label: "מודעות לסיכון", score: null, maxScore: 10 },
      ],
      flagType: null,
      flagDescription: null,
      attemptId: null,
    },
    {
      userId: "u-008",
      displayName: "ליאת פרץ",
      status: "COMPLETED",
      overallScore: 9.0,
      criterionScores: [
        { criterionId: "C-001", label: "ברית טיפולית ואמפתיה", score: 9, maxScore: 10 },
        { criterionId: "C-002", label: "שאלות פתוחות", score: 9, maxScore: 10 },
        { criterionId: "C-003", label: "ניתוח תפקודי", score: 9, maxScore: 10 },
        { criterionId: "C-004", label: "מודעות לסיכון", score: 9, maxScore: 10 },
      ],
      flagType: null,
      flagDescription: null,
      attemptId: "attempt-u008-asgn001",
    },
  ],
};

// ---------------------------------------------------------------------------
// Mock data -- Student Dashboard
// ---------------------------------------------------------------------------

const MOCK_STUDENT_DASHBOARD: StudentDashboardVM = {
  userId: "student-demo-001",
  displayName: "מיכל גרין",
  completedSimulations: [
    {
      attemptId: "attempt-u002-asgn001",
      title: "ראיון קבלה ראשוני -- יוסי כהן",
      completedAt: "2026-07-01T11:20:00Z",
      overallFormativeLabel: "בינוני (5.5/10) -- פורמטיבי בלבד",
      criterionSummary: [
        { criterionId: "C-001", label: "ברית טיפולית ואמפתיה", score: 6, maxScore: 10 },
        { criterionId: "C-002", label: "שאלות פתוחות", score: 5, maxScore: 10 },
        { criterionId: "C-003", label: "ניתוח תפקודי", score: 6, maxScore: 10 },
        { criterionId: "C-004", label: "מודעות לסיכון", score: 5, maxScore: 10 },
      ],
      hasEvaluation: true,
      hasDebrief: true,
    },
    {
      attemptId: "attempt-u002-asgn002",
      title: "הערכת סיכון -- מיה לוי",
      completedAt: "2026-06-25T09:45:00Z",
      overallFormativeLabel: "טוב (7.0/10) -- פורמטיבי בלבד",
      criterionSummary: [
        { criterionId: "C-001", label: "ברית טיפולית ואמפתיה", score: 7, maxScore: 10 },
        { criterionId: "C-002", label: "שאלות פתוחות", score: 7, maxScore: 10 },
        { criterionId: "C-003", label: "ניתוח תפקודי", score: 7, maxScore: 10 },
        { criterionId: "C-004", label: "מודעות לסיכון", score: 7, maxScore: 10 },
      ],
      hasEvaluation: true,
      hasDebrief: false,
    },
  ],
  debriefHistory: [
    {
      attemptId: "attempt-u002-asgn001",
      simulationTitle: "ראיון קבלה ראשוני -- יוסי כהן",
      lastMessageAt: "2026-07-01T13:10:00Z",
      messageCount: 6,
    },
  ],
  supportTickets: [
    {
      ticketId: "ticket-001",
      attemptId: null,
      category: "בעיית כניסה למערכת",
      status: "RESOLVED",
      createdAt: "2026-06-20T08:00:00Z",
    },
  ],
};

// ---------------------------------------------------------------------------
// Real API calls (placeholders for Sprint 3+)
// ---------------------------------------------------------------------------

async function fetchClassDashboardReal(courseId: string): Promise<ClassDashboardVM> {
  return authedGet<ClassDashboardVM>(
    `dashboard/teacher/${encodeURIComponent(courseId)}`,
  );
}

async function fetchStudentDashboardReal(userId: string): Promise<StudentDashboardVM> {
  return authedGet<StudentDashboardVM>(
    `dashboard/student/${encodeURIComponent(userId)}`,
  );
}

// ---------------------------------------------------------------------------
// Public surface
// ---------------------------------------------------------------------------

export async function fetchClassDashboard(courseId: string): Promise<ClassDashboardVM> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 600));
    return { ...MOCK_CLASS_DASHBOARD, courseId };
  }
  return fetchClassDashboardReal(courseId);
}

export async function fetchStudentDashboard(userId: string): Promise<StudentDashboardVM> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 500));
    return { ...MOCK_STUDENT_DASHBOARD, userId };
  }
  return fetchStudentDashboardReal(userId);
}

/** Stub: authorise a retry for a technically-affected attempt. */
export async function authoriseRetry(
  _attemptId: string,
): Promise<{ ok: boolean }> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 800));
    return { ok: true };
  }
  return authedPost<{ ok: boolean }>(
    `attempts/${encodeURIComponent(_attemptId)}/authorise-retry`,
    {},
  );
}

export function isDashboardMockMode(): boolean {
  return USE_MOCK;
}
