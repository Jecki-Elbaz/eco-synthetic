// dashboard-types.ts -- client-side view-model types for Teacher + Student dashboards.
// NOT imported from @aps/shared-types or @aps/db -- those are backend packages.
// Shape is derived from the Prisma schema (Attempt, Evaluation, User, etc.) and
// the dashboard UX spec (APS-REQ-088, APS-REQ-089).

// ---------------------------------------------------------------------------
// Shared
// ---------------------------------------------------------------------------

// Mirrors AttemptStatus enum from schema.prisma (pilot-relevant subset).
export type AttemptStatusVM =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "TECHNICALLY_AFFECTED"
  | "FLAGGED";

// Flag type -- A = technical/academic, B = welfare.
export type FlagType = "A" | "B";

export interface CriterionScoreVM {
  criterionId: string;
  /** Short label (localised Hebrew) */
  label: string;
  score: number | null; // null = no data
  maxScore: number;
}

// ---------------------------------------------------------------------------
// Teacher Class Dashboard (APS-REQ-088)
// ---------------------------------------------------------------------------

export interface StudentRow {
  userId: string;
  displayName: string;
  status: AttemptStatusVM;
  /** null when not COMPLETED */
  overallScore: number | null;
  /** null when not COMPLETED */
  criterionScores: CriterionScoreVM[];
  flagType: FlagType | null;
  flagDescription: string | null;
  /** attemptId for navigation; null if not started */
  attemptId: string | null;
}

export interface RubricCriterionMeta {
  id: string;
  /** Short code shown in heatmap column header */
  shortLabel: string;
  /** Full Hebrew label shown in tooltip */
  label: string;
  maxScore: number;
}

export interface ClassDashboardVM {
  collegeName: string;
  courseName: string;
  courseId: string;
  teacherName: string;
  lastUpdated: string; // ISO timestamp
  assignments: AssignmentOption[];
  selectedAssignmentId: string;
  criteria: RubricCriterionMeta[];
  students: StudentRow[];
}

export interface AssignmentOption {
  id: string;
  title: string;
}

// ---------------------------------------------------------------------------
// Student Dashboard (APS-REQ-089)
// ---------------------------------------------------------------------------

export interface CompletedSimulationVM {
  attemptId: string;
  title: string;
  completedAt: string; // ISO timestamp
  overallFormativeLabel: string; // localised text indicator
  criterionSummary: CriterionScoreVM[];
  hasEvaluation: boolean;
  hasDebrief: boolean;
}

export interface DebriefHistoryEntryVM {
  attemptId: string;
  simulationTitle: string;
  lastMessageAt: string; // ISO timestamp
  messageCount: number;
}

export interface SupportTicketVM {
  ticketId: string;
  attemptId: string | null;
  category: string;
  status: "OPEN" | "ESCALATED" | "RESOLVED";
  createdAt: string; // ISO timestamp
}

// S4-NOA-RESUME: in-progress attempt shown in student dashboard.
// Shape mirrors Gal's S4-GAL-RESUME API contract (envelope 2026-07-10).
export interface InProgressSimulationVM {
  attemptId: string;
  title: string;
  status: "IN_PROGRESS";
  /** ISO timestamp of last turn; null if no turns yet */
  lastTurnAt: string | null;
  /**
   * Elapsed seconds (first to last turn). null if server cannot compute it.
   * Timer shows remaining = (timeLimitSeconds - elapsed) when not null.
   * Shows "-- : --" when null (Ido A3 ruling -- do not reset to zero).
   */
  elapsed: number | null;
  /** Assignment time limit in seconds; null if not configured */
  timeLimitSeconds: number | null;
}

export interface StudentDashboardVM {
  userId: string;
  displayName: string;
  /** IN_PROGRESS attempts (S4-NOA-RESUME). Empty array when none. */
  inProgressSimulations: InProgressSimulationVM[];
  completedSimulations: CompletedSimulationVM[];
  debriefHistory: DebriefHistoryEntryVM[];
  supportTickets: SupportTicketVM[];
}
