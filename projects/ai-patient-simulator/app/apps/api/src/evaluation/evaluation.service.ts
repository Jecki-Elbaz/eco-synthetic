// EvaluationService -- orchestrates evaluation generation, read, and teacher override.
// APS-REQ-068/069/070/071/072/076
//
// Scope rules (mirrors SimulationService pattern from Inc-3):
//   - generate (POST):  TEACHER of attempt's course OR SYSTEM_ADMIN
//   - read (GET):       student sees own attempt ONLY when PUBLISHED
//                       teacher-of-course / admin sees full detail at any status
//   - override (PATCH): TEACHER of attempt's course OR SYSTEM_ADMIN

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../db/prisma.service.js";
import { Evaluator } from "@aps/engine";
import type {
  EvaluatorInput,
  RubricCriterionInput,
  TranscriptMessage,
  AnalyserOutputRecord,
} from "@aps/engine";
import type { UserScope } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

export interface TeacherOverrideDto {
  teacherNotes?: string;
  publish?: boolean; // true -> set status PUBLISHED, publishedAt = now()
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isTeacherOfCourse(scopes: UserScope[], courseId: string): boolean {
  return scopes.some(
    (s) =>
      s.role === "TEACHER" &&
      s.scopeType === "COURSE" &&
      s.scopeId === courseId,
  );
}

function isAdmin(scopes: UserScope[]): boolean {
  return scopes.some((s) => s.role === "SYSTEM_ADMIN");
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class EvaluationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly evaluator: Evaluator,
  ) {}

  /**
   * Generate (or regenerate) an Evaluation for a completed attempt.
   * Allowed: TEACHER of the attempt's course OR SYSTEM_ADMIN.
   * Creates a new Evaluation row (status DRAFT) or updates existing one.
   * generatedAt is set on every generation.
   */
  async generateEvaluation(
    attemptId: string,
    actorId: string,
    actorScopes: UserScope[],
  ) {
    // Load attempt with full context needed for evaluation
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        assignment: {
          include: {
            rubricVersion: {
              include: { criteria: true },
            },
          },
        },
        messages: { orderBy: { turnNumber: "asc" } },
        patientStateLogs: { orderBy: { turnNumber: "asc" } },
      },
    });

    if (!attempt) throw new NotFoundException("Attempt not found");

    const courseId = attempt.assignment.courseId;

    if (!isAdmin(actorScopes) && !isTeacherOfCourse(actorScopes, courseId)) {
      throw new ForbiddenException("Not authorised to generate evaluation for this attempt");
    }

    const rubricVersion = attempt.assignment.rubricVersion;

    // Build engine inputs
    const transcript: TranscriptMessage[] = (attempt.messages as Array<Record<string, unknown>>).map((m) => ({
      role: m["role"] as "STUDENT" | "PATIENT",
      turnNumber: m["turnNumber"] as number,
      text: m["originalText"] as string,
    }));

    const analyserOutputs: AnalyserOutputRecord[] = (attempt.patientStateLogs as Array<Record<string, unknown>>).map(
      (log) => ({
        turnNumber: log["turnNumber"] as number,
        output: log["analyserOutput"] as Record<string, unknown>,
      }),
    );

    const rubricCriteria: RubricCriterionInput[] = (rubricVersion.criteria as Array<Record<string, unknown>>).map(
      (c) => ({
        id: c["id"] as string,
        weight: c["weight"] as number,
        maxScore: c["maxScore"] as number,
        scoringAnchors: c["scoringAnchors"],
        competencyId: c["competencyId"] as string | null,
        formativeOnly: c["formativeOnly"] as boolean,
      }),
    );

    const engineInput: EvaluatorInput = {
      attemptId,
      transcript,
      analyserOutputs,
      rubricCriteria,
    };

    const result = await this.evaluator.evaluate(engineInput);

    // Upsert Evaluation row (idempotent -- regeneration overwrites DRAFT)
    const now = new Date();
    const existing = await this.prisma.evaluation.findUnique({
      where: { attemptId },
    });

    if (existing) {
      // Only allow regeneration if not yet PUBLISHED (teacher can always re-generate DRAFT)
      if (existing.status === "PUBLISHED") {
        throw new ConflictException(
          "Evaluation is already PUBLISHED. Use the override endpoint to update.",
        );
      }

      return this.prisma.evaluation.update({
        where: { attemptId },
        data: {
          rubricVersionId: rubricVersion.id,
          status: "DRAFT",
          structuredScores: result.structuredScores as object,
          transcriptHighlights: result.transcriptHighlights as object,
          overallSummary: result.overallSummary,
          generatedAt: now,
        },
      });
    }

    return this.prisma.evaluation.create({
      data: {
        attemptId,
        rubricVersionId: rubricVersion.id,
        status: "DRAFT",
        structuredScores: result.structuredScores as object,
        transcriptHighlights: result.transcriptHighlights as object,
        overallSummary: result.overallSummary,
        generatedAt: now,
      },
    });
  }

  /**
   * Get evaluation for an attempt.
   * Student (own attempt): only sees PUBLISHED evaluation, student-facing fields.
   * Teacher-of-course / admin: sees full detail at any status.
   */
  async getEvaluation(
    attemptId: string,
    actorId: string,
    actorScopes: UserScope[],
  ) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { assignment: true },
    });

    if (!attempt) throw new NotFoundException("Attempt not found");

    const courseId = attempt.assignment.courseId;
    const actorIsAdmin = isAdmin(actorScopes);
    const actorIsTeacher = isTeacherOfCourse(actorScopes, courseId);
    const actorIsStudent = actorScopes.some((s) => s.role === "STUDENT");
    const isOwnAttempt = attempt.userId === actorId;

    // Permission tiers:
    //   elevated = admin or teacher-of-course -> full view
    //   student own attempt -> PUBLISHED only, student view
    //   anything else -> forbidden
    if (!actorIsAdmin && !actorIsTeacher) {
      if (!actorIsStudent || !isOwnAttempt) {
        throw new ForbiddenException("Not authorised to view this evaluation");
      }
    }

    const evaluation = await this.prisma.evaluation.findUnique({
      where: { attemptId },
    });

    if (!evaluation) throw new NotFoundException("Evaluation not found");

    const isElevated = actorIsAdmin || actorIsTeacher;

    // Students MUST NOT see unpublished evaluations
    if (!isElevated && evaluation.status !== "PUBLISHED") {
      throw new ForbiddenException("Evaluation is not yet published");
    }

    // Return full detail for elevated actors; student-friendly subset otherwise
    if (isElevated) {
      return evaluation;
    }

    // Student view: return criterion scores, strengths, growth areas, transcript examples
    // Exclude teacher-only fields (teacherNotes, teacherOverride internal detail)
    return {
      attemptId: evaluation.attemptId,
      status: evaluation.status,
      structuredScores: evaluation.structuredScores,
      transcriptHighlights: evaluation.transcriptHighlights,
      overallSummary: evaluation.overallSummary,
      publishedAt: evaluation.publishedAt,
    };
  }

  /**
   * Teacher override: set teacherNotes, and optionally publish.
   * Allowed: TEACHER of attempt's course OR SYSTEM_ADMIN.
   */
  async overrideEvaluation(
    attemptId: string,
    dto: TeacherOverrideDto,
    actorId: string,
    actorScopes: UserScope[],
  ) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { assignment: true },
    });

    if (!attempt) throw new NotFoundException("Attempt not found");

    const courseId = attempt.assignment.courseId;

    if (!isAdmin(actorScopes) && !isTeacherOfCourse(actorScopes, courseId)) {
      throw new ForbiddenException("Not authorised to override this evaluation");
    }

    const evaluation = await this.prisma.evaluation.findUnique({
      where: { attemptId },
    });

    if (!evaluation) throw new NotFoundException("Evaluation not found -- generate first");

    const updateData: Record<string, unknown> = {
      teacherOverride: true,
    };

    if (dto.teacherNotes !== undefined) {
      updateData["teacherNotes"] = dto.teacherNotes;
    }

    if (dto.publish === true) {
      updateData["status"] = "PUBLISHED";
      updateData["publishedAt"] = new Date();
    }

    return this.prisma.evaluation.update({
      where: { attemptId },
      data: updateData,
    });
  }
}
