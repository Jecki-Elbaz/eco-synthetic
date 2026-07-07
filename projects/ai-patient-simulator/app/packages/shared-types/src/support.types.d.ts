export type SupportIssueCategory = "MIC_DICTATION_FAILURE" | "SIMULATION_LOADING_FAILURE" | "AI_RESPONSE_FAILURE" | "OTHER";
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
export type SupportScope = "COURSE" | "COLLEGE" | "GLOBAL";
export interface RoutingKey {
    issueCategory: SupportIssueCategory;
    scope: SupportScope;
}
export interface RoutingResult {
    toEmail: string;
    expectedResponseHours: number;
}
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
        issuedAt: string;
    };
}
export interface SupportConfirmation {
    ticketId: string;
    notifiedEmail: string;
    expectedResponseHours: number;
    /** Whether the student can continue their simulation now */
    canContinueNow: boolean;
    recoveryGuidance: string;
}
export type AttemptStatusValue = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "ABANDONED" | "SUBMITTED" | "EVALUATED" | "TECHNICALLY_AFFECTED" | "TECHNICAL_FAILURE_CONFIRMED" | "RETRY_AUTHORISED";
export declare const ACADEMIC_SAFETY_TRANSITIONS: Record<AttemptStatusValue, AttemptStatusValue[]>;
export interface TechnicalAffectedNotification {
    attemptId: string;
    studentId: string;
    courseId: string;
    assignmentId: string;
    ticketId: string;
    issuedAt: string;
    /** True = visible to teacher dashboard queries */
    teacherVisible: true;
}
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
//# sourceMappingURL=support.types.d.ts.map