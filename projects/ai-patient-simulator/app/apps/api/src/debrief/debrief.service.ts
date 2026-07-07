// DebriefService -- manages debrief chat interactions.
// APS-REQ-073
//
// Rules enforced:
//   - Student must have an existing PUBLISHED evaluation before debrief can start.
//   - Max debrief questions per attempt = maxDebriefQuestions (default 10 from InputGate budget).
//   - Debrief context EXCLUDES persona prompt, ground truth, and PatientStateLog analyserOutput.
//   - Cannot change the official grade.
//   - Supervisor response cites specific transcript turn numbers (citedTurns).
//
// Student can only debrief their own attempt.

import {
  Injectable,
  Inject,
  Optional,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../db/prisma.service.js";
import { DebriefSupervisor } from "@aps/engine";
import type {
  DebriefSupervisorInput,
  DebriefTranscriptMessage,
  DebriefRubricCriteria,
  DebriefEvaluationContext,
} from "@aps/engine";
import type { StructuredScores, TranscriptHighlight } from "@aps/engine";
import { DEFAULT_TURN_BUDGET } from "@aps/engine";
import type { UserScope } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Injection token for max debrief questions (optional; lets tests override it
// without emitting a bare `Number` as design:paramtype, which crashes NestJS DI).
// [fix: DebriefService DI boot defect, RE-3]
// ---------------------------------------------------------------------------
export const DEBRIEF_MAX_QUESTIONS = Symbol("DEBRIEF_MAX_QUESTIONS");

// ---------------------------------------------------------------------------
// DTO
// ---------------------------------------------------------------------------

export interface DebriefMessageDto {
  message: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable()
export class DebriefService {
  private readonly maxDebriefQuestions: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly supervisor: DebriefSupervisor,
    @Optional() @Inject(DEBRIEF_MAX_QUESTIONS) maxDebriefQuestions?: number,
  ) {
    // Default from InputGate budget spec (pilot: 5-10, defaulting to 10)
    this.maxDebriefQuestions = maxDebriefQuestions ?? DEFAULT_TURN_BUDGET.maxDebriefQuestions;
  }

  /**
   * Post a student debrief message and get a supervisor response.
   *
   * Enforces:
   *   - Student owns the attempt.
   *   - PUBLISHED evaluation exists.
   *   - Prior STUDENT debrief turns for this attempt <= maxDebriefQuestions.
   *   - Context isolation (persona/ground-truth never sent to supervisor).
   */
  async postMessage(
    attemptId: string,
    dto: DebriefMessageDto,
    actorId: string,
    actorScopes: UserScope[],
  ) {
    // Load attempt with everything needed
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
        // NOTE: patientStateLogs intentionally NOT included -- debrief isolation rule
        evaluation: true,
        debriefMessages: { orderBy: { turnNumber: "asc" } },
      },
    });

    if (!attempt) throw new NotFoundException("Attempt not found");

    // Guard: empty message must not reach the LLM.
    // The controller DTO also has @IsNotEmpty() -- this is defense-in-depth.
    if (!dto.message || dto.message.trim().length === 0) {
      throw new BadRequestException("Debrief message must not be empty");
    }

    // Must be own attempt
    if (attempt.userId !== actorId) {
      throw new ForbiddenException("Not your attempt");
    }

    // Must have a PUBLISHED evaluation
    if (!attempt.evaluation || attempt.evaluation.status !== "PUBLISHED") {
      throw new UnprocessableEntityException(
        "No published evaluation found. Debrief is only available after evaluation is published.",
      );
    }

    // Count prior STUDENT debrief messages for this attempt
    const priorStudentTurns = (attempt.debriefMessages as Array<Record<string, unknown>>).filter(
      (m) => m["role"] === "STUDENT",
    ).length;

    if (priorStudentTurns >= this.maxDebriefQuestions) {
      // Return neutral cap message without calling LLM
      const capMessage =
        "You have reached the maximum number of debrief questions for this session. " +
        "Please contact your instructor if you need further guidance.";

      return {
        supervisorText: capMessage,
        citedTurns: [] as number[],
        capped: true,
      };
    }

    // Build isolated debrief context (NO persona prompt, NO ground truth, NO analyserOutput)
    const transcript: DebriefTranscriptMessage[] = (attempt.messages as Array<Record<string, unknown>>).map((m) => ({
      role: m["role"] as "STUDENT" | "PATIENT",
      turnNumber: m["turnNumber"] as number,
      text: m["originalText"] as string,
    }));

    const rubricCriteria: DebriefRubricCriteria[] = (attempt.assignment.rubricVersion.criteria as Array<Record<string, unknown>>).map(
      (c) => ({
        id: c["id"] as string,
        labelKey: c["labelKey"] as string,
        weight: c["weight"] as number,
      }),
    );

    const ev = attempt.evaluation;
    const evaluationContext: DebriefEvaluationContext = {
      overallSummary: ev.overallSummary ?? "",
      structuredScores: ev.structuredScores as unknown as StructuredScores,
      transcriptHighlights: ev.transcriptHighlights as unknown as TranscriptHighlight[],
    };

    const priorDebriefTurns = (attempt.debriefMessages as Array<Record<string, unknown>>).map((m) => ({
      role: m["role"] as "STUDENT" | "SUPERVISOR",
      text: m["text"] as string,
    }));

    const supervisorInput: DebriefSupervisorInput = {
      studentMessage: dto.message,
      transcript,
      rubricCriteria,
      evaluationContext,
      priorDebriefTurns,
    };

    const supervisorResult = await this.supervisor.respond(supervisorInput);

    // Determine next turn number for debrief messages.
    // Guard against absent/empty debriefMessages (defensive -- Prisma include may
    // return undefined in mocked or edge contexts).
    const msgs = (attempt.debriefMessages as Array<Record<string, unknown>>) ?? [];
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : undefined;
    const nextTurnNumber = lastMsg !== undefined
      ? (lastMsg["turnNumber"] as number) + 1
      : 1;

    // Persist STUDENT message + SUPERVISOR response
    await this.prisma.debriefChat.createMany({
      data: [
        {
          attemptId,
          role: "STUDENT",
          turnNumber: nextTurnNumber,
          text: dto.message,
          citedTurns: [],
          sentAt: new Date(),
        },
        {
          attemptId,
          role: "SUPERVISOR",
          turnNumber: nextTurnNumber + 1,
          text: supervisorResult.supervisorText,
          citedTurns: supervisorResult.citedTurns,
          sentAt: new Date(),
        },
      ],
    });

    return {
      supervisorText: supervisorResult.supervisorText,
      citedTurns: supervisorResult.citedTurns,
      capped: false,
    };
  }
}
