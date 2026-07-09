// OrgService -- College, Course, Assignment, Attempt entity operations.
// Programme exists as DB stub only; no service methods in pilot.
import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
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
    });
    if (!assignment) throw new NotFoundException("Assignment not found");

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
