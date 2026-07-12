// OrgService -- College, Course, Assignment, Attempt entity operations.
// Programme exists as DB stub only; no service methods in pilot.
// S5-GAL-ARC-ENFORCE: getOrCreateAttempt enforces arc session cap (ARC_COMPLETE 403)
// and assigns sessionNumber to new arc attempts.
import { Injectable, NotFoundException, ForbiddenException, HttpException } from "@nestjs/common";
import { PrismaService } from "../db/prisma.service.js";
import type { AuthTokenPayload } from "@aps/shared-types";

@Injectable()
export class OrgService {
  constructor(private readonly prisma: PrismaService) {}

  // --------------- College ---------------

  async getCollege(collegeId: string) {
    const college = await this.prisma.college.findUnique({
      where: { id: collegeId },
      include: { courses: true },
    });
    if (!college) throw new NotFoundException("College not found");
    return college;
  }

  // --------------- Course ---------------

  async getCourse(courseId: string, actor: AuthTokenPayload) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { assignments: true },
    });
    if (!course) throw new NotFoundException("Course not found");

    this.assertCourseAccess(actor, course.id, course.collegeId);
    return course;
  }

  async listCoursesForActor(actor: AuthTokenPayload) {
    const isAdmin = actor.scopes.some((s) => s.role === "SYSTEM_ADMIN");
    if (isAdmin) {
      return this.prisma.course.findMany({ include: { assignments: true } });
    }

    const scopeIds = actor.scopes.map((s) => s.scopeId);
    return this.prisma.course.findMany({
      where: {
        OR: [
          { id: { in: scopeIds } },
          { collegeId: { in: scopeIds } },
        ],
      },
      include: { assignments: true },
    });
  }

  // --------------- Assignment ---------------

  async getAssignment(assignmentId: string, actor: AuthTokenPayload) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        course: true,
        simulationTemplate: { include: { groundTruth: true } },
        rubricVersion: true,
      },
    });
    if (!assignment) throw new NotFoundException("Assignment not found");

    this.assertCourseAccess(actor, assignment.courseId, assignment.course.collegeId);
    return assignment;
  }

  // --------------- Attempt ---------------

  async getOrCreateAttempt(
    assignmentId: string,
    userId: string,
    language: string,
    type: "STUDENT" | "AUTHOR_PREVIEW" = "STUDENT",
  ) {
    // For STUDENT type: return existing non-completed attempt if one exists.
    // For AUTHOR_PREVIEW: always create a new attempt (each preview is independent).
    if (type === "STUDENT") {
      const existing = await this.prisma.attempt.findFirst({
        where: {
          assignmentId,
          userId,
          status: { not: "COMPLETED" },
          type: "STUDENT",
        },
      });
      if (existing) return existing;
    }

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { simulationTemplate: { select: { id: true, maxSessions: true } } },
    });
    if (!assignment) throw new NotFoundException("Assignment not found");

    // S5-GAL-ARC-ENFORCE: arc session cap check (STUDENT type only).
    // maxSessions <= 1 means no arc (non-arc templates); skip the guard.
    // ARC SCOPE (Oren S5 review M2): counts COMPLETED STUDENT attempts across ALL
    // assignments that share templateId. The arc belongs to the patient (template),
    // not the assignment. A student gets at most maxSessions contacts with a given
    // patient across their entire enrollment, regardless of which course's
    // assignment brought them there. Intentional for pilot-1. Revisit before
    // multi-assignment deployment if per-assignment arcs are required.
    if (type === "STUDENT" && assignment.simulationTemplate.maxSessions > 1) {
      const templateId = assignment.simulationTemplate.id;
      const maxSessions = assignment.simulationTemplate.maxSessions;

      const completedCount = await this.prisma.attempt.count({
        where: {
          userId,
          type: "STUDENT",
          status: "COMPLETED",
          assignment: { simulationTemplateId: templateId },
        },
      });

      if (completedCount >= maxSessions) {
        throw new HttpException(
          {
            code: "ARC_COMPLETE",
            message: "Session arc complete -- no further sessions permitted.",
          },
          403,
        );
      }

      // Assign sessionNumber = completedCount + 1 on new attempt
      const sessionNumber = completedCount + 1;
      return this.prisma.attempt.create({
        data: {
          assignmentId,
          userId,
          language,
          type,
          status: "NOT_STARTED",
          sessionNumber,
        },
      });
    }

    return this.prisma.attempt.create({
      data: {
        assignmentId,
        userId,
        language,
        type,
        status: "NOT_STARTED",
      },
    });
  }

  async getAttempt(attemptId: string, actor: AuthTokenPayload) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { assignment: { include: { course: true } } },
    });
    if (!attempt) throw new NotFoundException("Attempt not found");

    const isOwner = attempt.userId === actor.sub;
    const isAdmin = actor.scopes.some((s) => s.role === "SYSTEM_ADMIN");
    const isTeacher = actor.scopes.some(
      (s) =>
        s.role === "TEACHER" &&
        (s.scopeId === attempt.assignment.courseId ||
          s.scopeId === attempt.assignment.course.collegeId),
    );

    if (!isOwner && !isAdmin && !isTeacher) {
      throw new ForbiddenException("Access denied to this attempt");
    }

    return attempt;
  }

  // --------------- Access helpers ---------------

  private assertCourseAccess(
    actor: AuthTokenPayload,
    courseId: string,
    collegeId: string,
  ): void {
    if (actor.scopes.some((s) => s.role === "SYSTEM_ADMIN")) return;

    const hasAccess = actor.scopes.some(
      (s) => s.scopeId === courseId || s.scopeId === collegeId,
    );
    if (!hasAccess) throw new ForbiddenException("Access denied to this resource");
  }
}
