// DashboardService -- real data for Teacher Class Dashboard + Student Dashboard.
// APS-REQ-088 (teacher), APS-REQ-089 (student). Replaces the web mock-only
// placeholders ("Sprint 3+" note in apps/web/src/lib/dashboard-client.ts).
//
// Scope rules (mirrors EvaluationService pattern):
//   - student dashboard: student sees OWN only; teacher-of-a-course-the-student-
//     is-enrolled-in or SYSTEM_ADMIN may view any.
//   - teacher dashboard: TEACHER of the course OR SYSTEM_ADMIN.
//
// Students only ever see PUBLISHED evaluation data; teachers see any status.

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../db/prisma.service.js";
import type { UserScope } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// View-model types (mirror apps/web/src/lib/dashboard-types.ts)
// ---------------------------------------------------------------------------

export type AttemptStatusVM =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "TECHNICALLY_AFFECTED"
  | "FLAGGED";

export interface CriterionScoreVM {
  criterionId: string;
  label: string;
  score: number | null;
  maxScore: number;
}

export interface StudentRowVM {
  userId: string;
  displayName: string;
  status: AttemptStatusVM;
  overallScore: number | null;
  criterionScores: CriterionScoreVM[];
  flagType: "A" | "B" | null;
  flagDescription: string | null;
  attemptId: string | null;
}

export interface ClassDashboardVM {
  collegeName: string;
  courseName: string;
  courseId: string;
  teacherName: string;
  lastUpdated: string;
  assignments: Array<{ id: string; title: string }>;
  selectedAssignmentId: string;
  criteria: Array<{
    id: string;
    shortLabel: string;
    label: string;
    maxScore: number;
  }>;
  students: StudentRowVM[];
}

export interface StudentDashboardVM {
  userId: string;
  displayName: string;
  completedSimulations: Array<{
    attemptId: string;
    title: string;
    completedAt: string;
    overallFormativeLabel: string;
    criterionSummary: CriterionScoreVM[];
    hasEvaluation: boolean;
    hasDebrief: boolean;
  }>;
  debriefHistory: Array<{
    attemptId: string;
    simulationTitle: string;
    lastMessageAt: string;
    messageCount: number;
  }>;
  supportTickets: Array<{
    ticketId: string;
    attemptId: string | null;
    category: string;
    status: string;
    createdAt: string;
  }>;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isAdmin(scopes: UserScope[]): boolean {
  return scopes.some((s) => s.role === "SYSTEM_ADMIN");
}

function isTeacherOfCourse(scopes: UserScope[], courseId: string): boolean {
  return scopes.some(
    (s) =>
      s.role === "TEACHER" &&
      s.scopeType === "COURSE" &&
      s.scopeId === courseId,
  );
}

interface StoredCriterionScore {
  score: number;
  maxScore: number;
}

/** Weighted overall on a 0-10 scale from structuredScores + criterion weights. */
function weightedOverall(
  structuredScores: Record<string, StoredCriterionScore>,
  weights: Map<string, number>,
): number | null {
  let weightSum = 0;
  let acc = 0;
  for (const [criterionId, cs] of Object.entries(structuredScores)) {
    if (!cs || typeof cs.score !== "number" || !cs.maxScore) continue;
    const w = weights.get(criterionId) ?? 1;
    acc += (cs.score / cs.maxScore) * w;
    weightSum += w;
  }
  if (weightSum === 0) return null;
  return Math.round((acc / weightSum) * 100) / 10; // one decimal, 0-10
}

/** Hebrew formative label bucket -- formative-only wording (APS-REQ-069). */
function formativeLabel(overall: number | null): string {
  if (overall === null) return "טרם פורסם משוב";
  let bucket: string;
  if (overall >= 8.5) bucket = "מצוין";
  else if (overall >= 6.5) bucket = "טוב";
  else if (overall >= 4.5) bucket = "בינוני";
  else bucket = "דורש חיזוק";
  return `${bucket} (${overall.toFixed(1)}/10) -- פורמטיבי בלבד`;
}

function criterionLabelHe(labels: unknown, fallback: string): string {
  if (labels && typeof labels === "object") {
    const rec = labels as Record<string, unknown>;
    if (typeof rec["he"] === "string") return rec["he"];
    if (typeof rec["en"] === "string") return rec["en"];
  }
  return fallback;
}

interface StoredHighlight {
  type?: string;
  turnNumber?: number;
  note?: string;
}

// Structural row types for Prisma results (the shared tsconfig does not flow
// generated include-types here; same reason EvaluationService casts rows).
interface CriterionRow {
  id: string;
  labelKey: string;
  labels: unknown;
  weight: number;
  maxScore: number;
}

interface EvaluationRow {
  status: string;
  structuredScores: unknown;
  transcriptHighlights: unknown;
}

interface AttemptRow {
  id: string;
  userId: string;
  status: string;
  finishedAt: Date | null;
  updatedAt: Date;
  assignment: {
    courseId: string;
    simulationTemplate: { title: string };
    rubricVersion: { criteria: CriterionRow[] };
  };
  evaluation: EvaluationRow | null;
  debriefMessages: Array<{ sentAt: Date }>;
}

interface RoleAssignmentRow {
  role: string;
  scopeType: string;
  scopeId: string;
  userId: string;
  user: { displayName: string };
}

/** First RISK_FLAG highlight, if any (drives FLAGGED status on teacher view). */
function riskFlag(highlights: unknown): StoredHighlight | null {
  if (!Array.isArray(highlights)) return null;
  const hit = (highlights as StoredHighlight[]).find(
    (h) => h && h.type === "RISK_FLAG",
  );
  return hit ?? null;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Student dashboard. Student: own only. Teacher: only if the student is
   * enrolled (STUDENT role) in a course the actor teaches. Admin: any.
   */
  async getStudentDashboard(
    userId: string,
    actorId: string,
    actorScopes: UserScope[],
  ): Promise<StudentDashboardVM> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roleAssignments: true },
    });
    if (!user) throw new NotFoundException("User not found");
    const roleAssignments = user.roleAssignments as RoleAssignmentRow[];

    if (!isAdmin(actorScopes) && actorId !== userId) {
      const studentCourseIds = roleAssignments
        .filter((r) => r.role === "STUDENT" && r.scopeType === "COURSE")
        .map((r) => r.scopeId);
      const teaches = studentCourseIds.some((cid) =>
        isTeacherOfCourse(actorScopes, cid),
      );
      if (!teaches) {
        throw new ForbiddenException("Not authorised to view this dashboard");
      }
    }

    const studentView = actorId === userId && !isAdmin(actorScopes);

    const attempts = (await this.prisma.attempt.findMany({
      where: {
        userId,
        finishedAt: { not: null },
        // Exclude AUTHOR_PREVIEW attempts -- not visible in student-facing views (TRACK-A-GAL item B)
        type: { not: "AUTHOR_PREVIEW" },
      },
      include: {
        assignment: {
          include: {
            simulationTemplate: true,
            rubricVersion: { include: { criteria: true } },
          },
        },
        evaluation: true,
        debriefMessages: { orderBy: { sentAt: "asc" } },
      },
      orderBy: { finishedAt: "desc" },
    })) as unknown as AttemptRow[];

    const completedSimulations = attempts.map((a) => {
      const evaluation = a.evaluation;
      // Students only see PUBLISHED evaluation data.
      const visibleEval =
        evaluation && (!studentView || evaluation.status === "PUBLISHED")
          ? evaluation
          : null;

      const criteria = a.assignment.rubricVersion.criteria;
      const weights = new Map<string, number>(
        criteria.map((c) => [c.id, c.weight]),
      );
      const scores = (visibleEval?.structuredScores ?? {}) as Record<
        string,
        StoredCriterionScore
      >;
      const overall = visibleEval ? weightedOverall(scores, weights) : null;

      const criterionSummary: CriterionScoreVM[] = criteria.map((c) => ({
        criterionId: c.id,
        label: criterionLabelHe(c.labels, c.labelKey),
        score: typeof scores[c.id]?.score === "number" ? scores[c.id]!.score : null,
        maxScore: c.maxScore,
      }));

      return {
        attemptId: a.id,
        title: a.assignment.simulationTemplate.title,
        completedAt: (a.finishedAt ?? a.updatedAt).toISOString(),
        overallFormativeLabel: formativeLabel(overall),
        criterionSummary,
        hasEvaluation: visibleEval !== null,
        hasDebrief: a.debriefMessages.length > 0,
      };
    });

    const debriefHistory = attempts
      .filter((a) => a.debriefMessages.length > 0)
      .map((a) => ({
        attemptId: a.id,
        simulationTitle: a.assignment.simulationTemplate.title,
        lastMessageAt: a.debriefMessages[a.debriefMessages.length - 1]!.sentAt.toISOString(),
        messageCount: a.debriefMessages.length,
      }));

    interface TicketRow {
      id: string;
      attemptId: string | null;
      issueCategory: string;
      status: string;
      createdAt: Date;
    }
    const tickets = (await this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })) as unknown as TicketRow[];

    return {
      userId,
      displayName: user.displayName,
      completedSimulations,
      debriefHistory,
      supportTickets: tickets.map((t) => ({
        ticketId: t.id,
        attemptId: t.attemptId,
        category: t.issueCategory,
        status: t.status,
        createdAt: t.createdAt.toISOString(),
      })),
    };
  }

  /**
   * Teacher class dashboard for one course. TEACHER of course or SYSTEM_ADMIN.
   * Optional assignmentId selects which assignment's cohort matrix to build;
   * defaults to the first assignment of the course.
   */
  async getClassDashboard(
    courseId: string,
    actorId: string,
    actorScopes: UserScope[],
    assignmentId?: string,
  ): Promise<ClassDashboardVM> {
    if (!isAdmin(actorScopes) && !isTeacherOfCourse(actorScopes, courseId)) {
      throw new ForbiddenException("Not authorised to view this course dashboard");
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { college: true },
    });
    if (!course) throw new NotFoundException("Course not found");

    interface AssignmentRow {
      id: string;
      simulationTemplate: { title: string };
      rubricVersion: { criteria: CriterionRow[] };
    }
    const assignments = (await this.prisma.assignment.findMany({
      where: { courseId },
      include: {
        simulationTemplate: true,
        rubricVersion: { include: { criteria: true } },
      },
      orderBy: { createdAt: "asc" },
    })) as unknown as AssignmentRow[];
    if (assignments.length === 0) {
      throw new NotFoundException("Course has no assignments");
    }

    const selected =
      assignments.find((a) => a.id === assignmentId) ?? assignments[0]!;
    const criteria = selected.rubricVersion.criteria;
    const weights = new Map<string, number>(
      criteria.map((c) => [c.id, c.weight]),
    );

    const enrolments = (await this.prisma.userRoleAssignment.findMany({
      where: { role: "STUDENT", scopeType: "COURSE", scopeId: courseId },
      include: { user: true },
    })) as unknown as RoleAssignmentRow[];

    interface CohortAttemptRow {
      id: string;
      userId: string;
      status: string;
      evaluation: EvaluationRow | null;
    }
    const attempts = (await this.prisma.attempt.findMany({
      where: {
        assignmentId: selected.id,
        userId: { in: enrolments.map((e) => e.userId) },
        // AUTHOR_PREVIEW runs are never part of the cohort view (Oren review Finding 1)
        type: { not: "AUTHOR_PREVIEW" },
      },
      include: { evaluation: true },
      orderBy: { createdAt: "desc" },
    })) as unknown as CohortAttemptRow[];
    const latestByUser = new Map<string, CohortAttemptRow>();
    for (const a of attempts) {
      if (!latestByUser.has(a.userId)) latestByUser.set(a.userId, a);
    }

    const actor = await this.prisma.user.findUnique({ where: { id: actorId } });

    const students: StudentRowVM[] = enrolments.map((e) => {
      const attempt = latestByUser.get(e.userId) ?? null;
      const evaluation = attempt?.evaluation ?? null;

      let status: AttemptStatusVM = "NOT_STARTED";
      if (attempt) {
        switch (attempt.status) {
          case "IN_PROGRESS":
          case "ABANDONED":
            status = "IN_PROGRESS";
            break;
          case "COMPLETED":
          case "SUBMITTED":
          case "EVALUATED":
            status = "COMPLETED";
            break;
          case "TECHNICALLY_AFFECTED":
          case "TECHNICAL_FAILURE_CONFIRMED":
          case "RETRY_AUTHORISED":
            status = "TECHNICALLY_AFFECTED";
            break;
          default:
            status = "NOT_STARTED";
        }
      }

      const scores = (evaluation?.structuredScores ?? {}) as Record<
        string,
        StoredCriterionScore
      >;
      const overall = evaluation ? weightedOverall(scores, weights) : null;

      // Welfare/risk visibility (criterion C): RISK_FLAG highlight -> FLAGGED.
      const flag = evaluation ? riskFlag(evaluation.transcriptHighlights) : null;
      if (flag && status === "COMPLETED") status = "FLAGGED";

      return {
        userId: e.userId,
        displayName: e.user.displayName,
        status,
        overallScore: overall,
        criterionScores: criteria.map((c) => ({
          criterionId: c.id,
          label: criterionLabelHe(c.labels, c.labelKey),
          score: typeof scores[c.id]?.score === "number" ? scores[c.id]!.score : null,
          maxScore: c.maxScore,
        })),
        flagType: flag ? "B" : null,
        flagDescription: flag?.note ?? null,
        attemptId: attempt?.id ?? null,
      };
    });

    return {
      collegeName: course.college.name,
      courseName: course.name,
      courseId,
      teacherName: actor?.displayName ?? "",
      lastUpdated: new Date().toISOString(),
      assignments: assignments.map((a) => ({
        id: a.id,
        title: a.simulationTemplate.title,
      })),
      selectedAssignmentId: selected.id,
      criteria: criteria.map((c) => ({
        id: c.id,
        shortLabel: c.labelKey,
        label: criterionLabelHe(c.labels, c.labelKey),
        maxScore: c.maxScore,
      })),
      students,
    };
  }
}
