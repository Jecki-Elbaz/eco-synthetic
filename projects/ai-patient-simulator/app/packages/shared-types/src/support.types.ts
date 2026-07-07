// @aps/shared-types -- support + academic-safety types
// APS-REQ-102/103/104/105/106/107/108/109/110/111/118/119/120/121

// ---------------------------------------------------------------------------
// Issue categories (pilot subset)
// ---------------------------------------------------------------------------

export type SupportIssueCategory =
  | "MIC_DICTATION_FAILURE"
  | "SIMULATION_LOADING_FAILURE"
  | "AI_RESPONSE_FAILURE"
  | "OTHER";

// ---------------------------------------------------------------------------
// Diagnostic state (passed in from the caller -- no separate fetch)
// ---------------------------------------------------------------------------

export interface GlobalDiagnosticState {
  /** Browser/device info (UA string or parsed fields) */
  userAgent: string;
  /** Whether mic permission is granted */
  micPermission: "granted" | "denied" | "prompt" | "unknown";
  /** Whether the simulation loaded at all this session */
  simulationLoaded: boolean;
  /** Last HTTP status received from API (null if no call yet) */
  lastApiStatus: number | null;
  /** Any client-side error codes collected before opening ticket */
  clientErrorCodes: string[];
  /** Attempt ID in scope (null if simulation never started) */
  attemptId: string | null;
  /** Assignment ID in scope */
  assignmentId: string | null;
  /** Course ID in scope */
  courseId: string | null;
}

// ---------------------------------------------------------------------------
// Deterministic troubleshooting result (APS-REQ-102/103/104)
// ---------------------------------------------------------------------------

export interface TroubleshootingStep {
  stepNumber: number;
  instruction: string;
  /** True if this step is user-actionable (false = info-only) */
  userActionable: boolean;
}

export interface TroubleshootingResult {
  issueCategory: SupportIssueCategory;
  /** Ordered steps to follow */
  steps: TroubleshootingStep[];
  /** Frictionless-recovery guidance: can the student continue or must they wait? */
  canContinueNow: boolean;
  recoveryGuidance: string;
  /** Escape hatch always available */
  emailEscapeAvailable: true;
  emailEscapeLabel: string;
}

// ---------------------------------------------------------------------------
// Routing matrix (APS-REQ-107/108)
// ---------------------------------------------------------------------------

export type SupportScope = "COURSE" | "COLLEGE" | "GLOBAL";

export interface RoutingKey {
  issueCategory: SupportIssueCategory;
  scope: SupportScope;
}

export interface RoutingResult {
  toEmail: string;
  expectedResponseHours: number;
}

// ---------------------------------------------------------------------------
// Ticket creation DTO
// ---------------------------------------------------------------------------

export interface CreateSupportTicketDto {
  userId: string;
  userRole: string;
  issueCategory: SupportIssueCategory;
  /** Browser/device string */
  browserDevice: string;
  /** Client-side error codes */
  errorCodes: string[];
  attemptId?: string;
  courseId?: string;
  /** College ID -- used for COLLEGE scope routing when no courseId is present.
   *  Populated from the caller's JWT scopes by the controller (never caller-supplied). */
  collegeId?: string;
  assignmentId?: string;
  /** Optional free-text from the student */
  userFreeText?: string;
  diagnosticState: GlobalDiagnosticState;
}

// ---------------------------------------------------------------------------
// Escalation email (assembled, never sent) (APS-REQ-107/108/109)
// ---------------------------------------------------------------------------

export interface SupportEmailObject {
  to: string;
  from: string;
  subject: string;
  bodyText: string;
  /** Structured context attached to the email record */
  context: {
    ticketId: string;
    userId: string;
    userRole: string;
    issueCategory: SupportIssueCategory;
    courseId: string | null;
    assignmentId: string | null;
    attemptId: string | null;
    browserDevice: string;
    errorCodes: string[];
    userFreeText: string | null;
    diagnosticSummary: Record<string, unknown>;
    issuedAt: string; // ISO timestamp
  };
}

// ---------------------------------------------------------------------------
// Confirmation returned to the caller after ticket + email assembled
// ---------------------------------------------------------------------------

export interface SupportConfirmation {
  ticketId: string;
  notifiedEmail: string;
  expectedResponseHours: number;
  /** Whether the student can continue their simulation now */
  canContinueNow: boolean;
  recoveryGuidance: string;
}

// ---------------------------------------------------------------------------
// Academic safety -- attempt status (mirrors DB enum)
// ---------------------------------------------------------------------------

export type AttemptStatusValue =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ABANDONED"
  | "SUBMITTED"
  | "EVALUATED"
  | "TECHNICALLY_AFFECTED"
  | "TECHNICAL_FAILURE_CONFIRMED"
  | "RETRY_AUTHORISED";

// Valid status transitions for academic-safety flow (APS-REQ-118/119/120/121)
//
// JC-2 (re-entry): RETRY_AUTHORISED -> IN_PROGRESS is the re-entry edge.
// The student re-launches the simulation via the existing simulation-start/turn path
// (SimulationService.processTurn). That path rejects only COMPLETED and ABANDONED;
// RETRY_AUTHORISED is not in the rejection list, so re-entry works correctly.
// Verified 2026-07-04 (Gal, code review fix pass): no change to processTurn needed.
//
// JC-2 missing edges (documented per Ido review):
//
// TECHNICALLY_AFFECTED -> ABANDONED: no path exists for a teacher to abandon an attempt
// that is in the tech-safety chain. If the teacher decides the attempt should not be
// retried, there is no supported transition. This is a spec gap; accept for pilot
// (teacher cannot do this via the API; requires direct DB intervention or a future
// admin endpoint). Track before beta.
//
// SUBMITTED -> TECHNICALLY_AFFECTED: SUBMITTED has no inbound from tech-safety states.
// A student who submits and then realises there was a technical failure cannot enter
// the tech-safety chain. Whether this is intentional (submission = assessment complete,
// handled via grade appeal) or an omission is undocumented. Current design: intentional
// (submitted work is assessed; a tech-fault claim after submission goes through appeal,
// not the retry path). Document explicitly here to prevent accidental edge additions.
// MINOR-5: add SUBMITTED -> TECHNICALLY_AFFECTED if product decides otherwise.
export const ACADEMIC_SAFETY_TRANSITIONS: Record<AttemptStatusValue, AttemptStatusValue[]> = {
  NOT_STARTED: ["IN_PROGRESS", "TECHNICALLY_AFFECTED"],
  IN_PROGRESS: ["COMPLETED", "ABANDONED", "TECHNICALLY_AFFECTED"],
  COMPLETED: ["EVALUATED", "TECHNICALLY_AFFECTED"],
  ABANDONED: [],
  // SUBMITTED -> TECHNICALLY_AFFECTED is intentionally absent (see comment above).
  SUBMITTED: ["EVALUATED"],
  EVALUATED: [],
  TECHNICALLY_AFFECTED: ["TECHNICAL_FAILURE_CONFIRMED"],
  // TECHNICALLY_AFFECTED -> ABANDONED is intentionally absent (see comment above).
  TECHNICAL_FAILURE_CONFIRMED: ["RETRY_AUTHORISED"],
  // RETRY_AUTHORISED -> IN_PROGRESS: student re-launches via simulation-start/turn path.
  // SimulationService.processTurn allows RETRY_AUTHORISED (only rejects COMPLETED/ABANDONED).
  RETRY_AUTHORISED: ["IN_PROGRESS"],
};

// ---------------------------------------------------------------------------
// Teacher notification stub (APS-REQ-118/119)
// ---------------------------------------------------------------------------

export interface TechnicalAffectedNotification {
  attemptId: string;
  studentId: string;
  courseId: string;
  assignmentId: string;
  ticketId: string;
  issuedAt: string; // ISO timestamp
  /** True = visible to teacher dashboard queries */
  teacherVisible: true;
}

// ---------------------------------------------------------------------------
// Retry authorisation DTO + result
// ---------------------------------------------------------------------------

export interface AuthoriseRetryDto {
  teacherNote?: string;
}

export interface AuthoriseRetryResult {
  attemptId: string;
  previousStatus: AttemptStatusValue;
  newStatus: "RETRY_AUTHORISED";
  authorisedBy: string;
  authorisedAt: string;
}
