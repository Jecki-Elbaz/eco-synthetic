// SimulationService -- coordinates DB reads/writes around TurnPipeline.
// This is the service-layer boundary between the engine (pure TS) and the DB.
// The engine never imports @aps/db; all DB access is here.

import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { PrismaService } from "../db/prisma.service.js";
import { TurnPipeline, StudentBotProvider } from "@aps/engine";
import type { BotProfile } from "@aps/engine";
import type { TurnRequest, TurnResponse, PatientStateSnapshot, UserScope } from "@aps/shared-types";
import type { GroundTruthRef } from "@aps/engine";
import type { AttemptTotals } from "@aps/engine";
import { EvaluationService } from "../evaluation/evaluation.service.js";

// Context passed to runPipelineTurn() -- separates pre-loaded template/assignment data
// from the per-turn DB state that runPipelineTurn() always reloads fresh.
interface RunPipelineContext {
  /** Assignment challenge level */
  challengeLevel: number;
  /** Assignment max turns (for auto-close check) */
  maxTurns: number;
  /** Persona system prompt from SimulationTemplate */
  personaSystemPrompt: string;
  /** Ground truth ref built from GroundTruth row */
  groundTruth: GroundTruthRef;
  /** Course credit ledger (null = no limit configured) */
  ledger: { id: string; balance: number; hardLimit: number | null } | null;
  /**
   * When true, skip the credit hard-limit gate AND skip CreditEntry/balance writes.
   * Rambo M18: UsageLog is STILL emitted regardless of this flag.
   */
  bypassCreditCheck: boolean;
  /**
   * eventType value written to UsageLog.
   * SIMULATION_TURN for student turns; SELF_SIMULATION for author-preview turns.
   */
  usageLogEventType: string;
}

@Injectable()
export class SimulationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pipeline: TurnPipeline,
    private readonly evaluationService: EvaluationService,
  ) {}

  /**
   * Process one student turn.
   * Loads attempt + context, checks ownership, then delegates to runPipelineTurn().
   */
  async processTurn(dto: TurnRequest, actorId: string): Promise<TurnResponse> {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: dto.attemptId },
      include: {
        assignment: {
          include: {
            simulationTemplate: { include: { groundTruth: true } },
          },
        },
      },
    });

    if (!attempt) throw new NotFoundException("Attempt not found");
    if (attempt.userId !== actorId) throw new ForbiddenException("Not your attempt");
    if (attempt.status === "COMPLETED" || attempt.status === "ABANDONED") {
      throw new UnprocessableEntityException("Attempt is already closed");
    }

    const assignment = attempt.assignment;
    const template = assignment.simulationTemplate;
    const groundTruthRow = template.groundTruth;

    if (!groundTruthRow) {
      throw new UnprocessableEntityException("Simulation template has no ground truth");
    }

    const groundTruth: GroundTruthRef = this.buildGroundTruth(groundTruthRow);

    const ledger = await this.prisma.creditLedger.findFirst({
      where: { courseId: assignment.courseId },
    });

    return this.runPipelineTurn(dto.attemptId, dto.studentMessage, dto.language, dto.nonVerbalCues, {
      challengeLevel: assignment.challengeLevel,
      maxTurns: assignment.maxTurns,
      personaSystemPrompt: template.personaPrompt,
      groundTruth,
      ledger: ledger as { id: string; balance: number; hardLimit: number | null } | null,
      bypassCreditCheck: false,
      usageLogEventType: "SIMULATION_TURN",
    });
  }

  /**
   * Run one turn of the pipeline: load fresh attempt state, call TurnPipeline, persist all
   * artifacts. Shared by processTurn() and runAuthorPreview().
   *
   * Credit behaviour (Rambo M18):
   *   ctx.bypassCreditCheck = false -> gate checks credit; CreditEntry + balance written.
   *   ctx.bypassCreditCheck = true  -> gate skips credit; NO CreditEntry, NO balance update.
   *   UsageLog is ALWAYS written regardless of bypassCreditCheck.
   */
  private async runPipelineTurn(
    attemptId: string,
    studentMessage: string,
    language: string,
    nonVerbalCues: string | undefined,
    ctx: RunPipelineContext,
  ): Promise<TurnResponse> {
    // Reload attempt fresh for current turnCount (important in preview loops)
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
    });
    if (!attempt) throw new NotFoundException("Attempt not found");

    const creditBalance = ctx.bypassCreditCheck
      ? -1 // no gate limit for preview turns
      : ctx.ledger?.hardLimit != null
        ? ctx.ledger.balance - ctx.ledger.hardLimit
        : -1;

    const priorStateRow = await this.prisma.patientStateLog.findFirst({
      where: { attemptId },
      orderBy: { turnNumber: "desc" },
    });

    const priorState: PatientStateSnapshot | null = priorStateRow
      ? {
          attemptId,
          turnNumber: priorStateRow.turnNumber,
          trust: priorStateRow.trust,
          openness: priorStateRow.openness,
          emotionalActiv: priorStateRow.emotionalActiv,
          avoidanceLevel: priorStateRow.avoidanceLevel,
          defensiveness: priorStateRow.defensiveness,
          allianceQuality: priorStateRow.allianceQuality,
          disclosureReady: priorStateRow.disclosureReady,
          riskRelevance: priorStateRow.riskRelevance,
          unlockedFactIds: priorStateRow.unlockedFactIds,
          pendingTriggers: priorStateRow.pendingTriggers,
          challengeLevel: priorStateRow.challengeLevel,
          guardResult: priorStateRow.guardResult as "PASS" | "REGENERATE" | "BLOCKED",
          guardDetail: priorStateRow.guardDetail,
          summarisedUpTo: priorStateRow.summarisedUpTo,
          contextSummary: priorStateRow.contextSummary,
        }
      : null;

    const recentMsgRows = await this.prisma.message.findMany({
      where: { attemptId },
      orderBy: { turnNumber: "asc" },
    });

    const recentMessages = recentMsgRows.map((m: Record<string, any>) => ({
      role: (m.role as "STUDENT" | "PATIENT"),
      turnNumber: m.turnNumber as number,
      originalText: m.originalText as string,
      language: m.language as string,
    }));

    const totals: AttemptTotals = {
      turnCount: attempt.turnCount,
      tokenInputTotal: attempt.tokenInputTotal,
      tokenOutputTotal: attempt.tokenOutputTotal,
      creditBalance,
      bypassCreditCheck: ctx.bypassCreditCheck,
    };

    const thisTurnNumber = attempt.turnCount + 1;

    const result = await this.pipeline.run({
      attemptId,
      turnNumber: thisTurnNumber,
      challengeLevel: ctx.challengeLevel,
      studentMessage,
      studentLanguage: language,
      nonVerbalCues,
      priorState,
      personaSystemPrompt: ctx.personaSystemPrompt,
      groundTruth: ctx.groundTruth,
      recentMessages,
      contextSummary: priorState?.contextSummary ?? null,
      totals,
    });

    if (!result.gateResult.allowed) {
      return {
        patientMessage: this.gateBlockedMessage(result.gateResult.reason),
        turnNumber: thisTurnNumber,
        guardResult: "BLOCKED",
        turnCount: attempt.turnCount,
        softWarnTriggered: false,
        softWarnAnnotation: null,
        hardLimitReached: true,
      };
    }

    const snapshot = result.nextStateSnapshot!;
    const patientResponse = result.patientResponse!;

    // Persist state BEFORE response delivery [APS architecture rule 1 of s.3.2]
    await this.prisma.patientStateLog.create({
      data: {
        attemptId,
        turnNumber: thisTurnNumber,
        trust: snapshot.trust,
        openness: snapshot.openness,
        emotionalActiv: snapshot.emotionalActiv,
        avoidanceLevel: snapshot.avoidanceLevel,
        defensiveness: snapshot.defensiveness,
        allianceQuality: snapshot.allianceQuality,
        disclosureReady: snapshot.disclosureReady,
        riskRelevance: snapshot.riskRelevance,
        unlockedFactIds: snapshot.unlockedFactIds,
        pendingTriggers: snapshot.pendingTriggers,
        analyserOutput: result.analyserResult as object,
        challengeLevel: snapshot.challengeLevel,
        guardResult: snapshot.guardResult,
        guardDetail: snapshot.guardDetail,
        summarisedUpTo: snapshot.summarisedUpTo,
        contextSummary: snapshot.contextSummary,
      },
    });

    await this.prisma.message.createMany({
      data: [
        {
          attemptId,
          role: "STUDENT",
          turnNumber: thisTurnNumber,
          originalText: studentMessage,
          nonVerbalCues: nonVerbalCues ?? null,
          language,
        },
        {
          attemptId,
          role: "PATIENT",
          turnNumber: thisTurnNumber,
          originalText: patientResponse,
          language,
        },
      ],
    });

    // UsageLog: ALWAYS written, even for AUTHOR_PREVIEW (Rambo M18 hard condition).
    // eventType distinguishes SIMULATION_TURN (student) from SELF_SIMULATION (preview).
    await this.prisma.usageLog.create({
      data: {
        attemptId,
        eventType: ctx.usageLogEventType,
        modelId: `${snapshot.guardResult}:stub`,
        inputTokens: result.inputTokensUsed,
        outputTokens: result.outputTokensUsed,
      },
    });

    // CreditEntry + balance update: ONLY for real student turns (bypassCreditCheck=false).
    // Rambo M18: suppressed for AUTHOR_PREVIEW -- ledger never moves.
    if (!ctx.bypassCreditCheck && ctx.ledger) {
      const tokenTotal = result.inputTokensUsed + result.outputTokensUsed;
      await this.prisma.$transaction([
        this.prisma.creditEntry.create({
          data: {
            ledgerId: ctx.ledger.id,
            activityType: ctx.usageLogEventType,
            delta: -tokenTotal,
            reason: `attempt:${attemptId} turn:${thisTurnNumber}`,
          },
        }),
        this.prisma.creditLedger.update({
          where: { id: ctx.ledger.id },
          data: { balance: { decrement: tokenTotal } },
        }),
      ]);
    }

    const newTurnCount = attempt.turnCount + 1;
    await this.prisma.attempt.update({
      where: { id: attemptId },
      data: {
        turnCount: newTurnCount,
        tokenInputTotal: { increment: result.inputTokensUsed },
        tokenOutputTotal: { increment: result.outputTokensUsed },
        status: "IN_PROGRESS",
      },
    });

    const hardLimitReached = newTurnCount >= ctx.maxTurns;
    if (hardLimitReached) {
      await this.prisma.attempt.update({
        where: { id: attemptId },
        data: { status: "COMPLETED", finishedAt: new Date() },
      });
    }

    const softWarnAnnotation = result.softWarnTriggered
      ? "You are approaching the maximum number of turns for this simulation."
      : null;

    return {
      patientMessage: patientResponse,
      turnNumber: thisTurnNumber,
      guardResult: result.guardOutcome ?? "PASS",
      turnCount: newTurnCount,
      softWarnTriggered: result.softWarnTriggered,
      softWarnAnnotation,
      hardLimitReached,
    };
  }

  /**
   * Author-preview run: create an AUTHOR_PREVIEW attempt, drive all bot turns through
   * the pipeline using StudentBotProvider, skip credit deduction, emit SELF_SIMULATION
   * UsageLog per turn. Returns { attemptId } on completion.
   *
   * RBAC: caller must be TEACHER or SYSTEM_ADMIN (checked in PreviewController).
   * Endpoint: POST /assignments/:assignmentId/preview
   *
   * Pipeline coupling note: uses existing 8-step TurnPipeline with bypassCreditCheck=true.
   * Rambo M18: UsageLog (SELF_SIMULATION) emitted per turn even though ledger is not touched.
   */
  async runAuthorPreview(
    assignmentId: string,
    actorUserId: string,
    profile: BotProfile,
    actorScopes: UserScope[] = [],
  ): Promise<{ attemptId: string }> {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        simulationTemplate: { include: { groundTruth: true } },
      },
    });
    if (!assignment) throw new NotFoundException("Assignment not found");

    const template = assignment.simulationTemplate;
    const groundTruthRow = template.groundTruth;
    if (!groundTruthRow) {
      throw new UnprocessableEntityException("Simulation template has no ground truth");
    }

    const groundTruth: GroundTruthRef = this.buildGroundTruth(groundTruthRow);

    // Ledger is loaded but NOT written to (bypassCreditCheck=true means no deduction).
    const ledger = await this.prisma.creditLedger.findFirst({
      where: { courseId: assignment.courseId },
    });

    // Create the AUTHOR_PREVIEW attempt owned by the teacher.
    const attempt = await this.prisma.attempt.create({
      data: {
        assignmentId,
        userId: actorUserId,
        type: "AUTHOR_PREVIEW",
        language: "he", // default locale; preview does not require a specific language
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    const bot = new StudentBotProvider(profile);
    const sequence = bot.getSequence();

    const pipelineCtx: RunPipelineContext = {
      challengeLevel: assignment.challengeLevel,
      maxTurns: assignment.maxTurns,
      personaSystemPrompt: template.personaPrompt,
      groundTruth,
      ledger: ledger as { id: string; balance: number; hardLimit: number | null } | null,
      bypassCreditCheck: true,    // Rambo M18: skip ledger decrement
      usageLogEventType: "SELF_SIMULATION", // Rambo M18: audit log still emitted
    };

    for (let i = 0; i < sequence.length; i++) {
      const turn = bot.getTurn(i);
      const turnResult = await this.runPipelineTurn(
        attempt.id,
        turn.message,
        "he",
        undefined,
        pipelineCtx,
      );
      // Stop early if the pipeline gate blocked (e.g. turn limit reached mid-sequence)
      if (turnResult.hardLimitReached) break;
    }

    // Mark attempt COMPLETED (not using finishAttempt to avoid the userId ownership check
    // which would pass but is not semantically correct here -- preview is teacher-owned).
    await this.prisma.attempt.update({
      where: { id: attempt.id },
      data: { status: "COMPLETED", finishedAt: new Date() },
    });

    // Track-A-fix-001 (Ido ruling, Finding 5): auto-trigger evaluation after preview loop
    // so the author sees rubric scores + highlights, not transcript-only.
    // The previewing teacher is the actor; no separate permission hop required.
    // Evaluation uses the stub evaluator -- no credits consumed.
    await this.evaluationService.generateEvaluation(attempt.id, actorUserId, actorScopes);

    return { attemptId: attempt.id };
  }

  /** Build GroundTruthRef from a raw GroundTruth DB row. */
  private buildGroundTruth(row: {
    disclosureAllowList: unknown;
    knownFacts: unknown;
    hardOffRampText: string;
  }): GroundTruthRef {
    return {
      disclosureAllowList: {
        unlocked: (row.disclosureAllowList as { unlocked?: string[] }).unlocked ?? [],
        locked: (row.disclosureAllowList as { locked?: string[] }).locked ?? [],
      },
      doNotInvent: (row.knownFacts as { doNotInvent?: string[] }).doNotInvent ?? [],
      hardOffRampText: row.hardOffRampText,
    };
  }

  /**
   * Teacher review: returns all PatientStateLog rows for an attempt.
   * Scope enforcement (APS-REQ-017):
   *   - SYSTEM_ADMIN: always allowed.
   *   - TEACHER: allowed only if they have a TEACHER role scoped to the attempt's courseId
   *     via UserRoleAssignment (scopeType=COURSE, scopeId=courseId).
   *   - Attempt owner (STUDENT): not permitted on this endpoint (RolesGuard blocks them
   *     at the HTTP layer; this method is only reachable by TEACHER/SYSTEM_ADMIN).
   *   - Anyone else: ForbiddenException.
   *
   * NOTE: The schema has no dedicated CourseTeacher join table. Teacher-course membership
   * is encoded in UserRoleAssignment (role=TEACHER, scopeType=COURSE, scopeId=courseId).
   * This method reads that table directly for the scope check (APS-REQ-017).
   */
  async getPatientStateLogs(attemptId: string, actorId: string, actorScopes: UserScope[]) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { assignment: true },
    });
    if (!attempt) throw new NotFoundException("Attempt not found");

    const courseId = attempt.assignment.courseId;
    const isAdmin = actorScopes.some((s) => s.role === "SYSTEM_ADMIN");

    if (!isAdmin) {
      // Must be a TEACHER scoped to this attempt's course.
      const isTeacherOfCourse = actorScopes.some(
        (s) =>
          s.role === "TEACHER" &&
          s.scopeType === "COURSE" &&
          s.scopeId === courseId,
      );
      if (!isTeacherOfCourse) {
        throw new ForbiddenException("Not authorised to view this attempt's state log");
      }
    }

    return this.prisma.patientStateLog.findMany({
      where: { attemptId },
      orderBy: { turnNumber: "asc" },
    });
  }

  /**
   * Student/teacher: finish a simulation explicitly.
   */
  async finishAttempt(attemptId: string, actorId: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
    });
    if (!attempt) throw new NotFoundException("Attempt not found");
    if (attempt.userId !== actorId) throw new ForbiddenException("Not your attempt");

    return this.prisma.attempt.update({
      where: { id: attemptId },
      data: { status: "COMPLETED", finishedAt: new Date() },
    });
  }

  /**
   * GET transcript for an attempt.
   * Returns public-facing turn pairs only -- no system prompts, no ground truth, no persona internals.
   *
   * RBAC (enforced here, not in guard):
   *   - Student: own attempt only.
   *   - Teacher: any attempt in a course they teach (COURSE-scoped TEACHER role).
   *   - SYSTEM_ADMIN: all attempts.
   *
   * Response shape per turn:
   *   { turnIndex: number, studentInput: string, patientResponse: string, timestamp: string }
   */
  async getTranscript(
    attemptId: string,
    actorId: string,
    actorScopes: UserScope[],
  ): Promise<
    Array<{
      turnIndex: number;
      studentInput: string;
      patientResponse: string;
      timestamp: string;
    }>
  > {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { assignment: true },
    });
    if (!attempt) throw new NotFoundException("Attempt not found");

    const courseId = attempt.assignment.courseId;
    const isAdmin = actorScopes.some((s) => s.role === "SYSTEM_ADMIN");

    if (!isAdmin) {
      const isOwner = attempt.userId === actorId;
      const isTeacherOfCourse = actorScopes.some(
        (s) =>
          s.role === "TEACHER" &&
          s.scopeType === "COURSE" &&
          s.scopeId === courseId,
      );
      if (!isOwner && !isTeacherOfCourse) {
        throw new ForbiddenException("Not authorised to view this transcript");
      }
    }

    const messages = await this.prisma.message.findMany({
      where: { attemptId },
      orderBy: { turnNumber: "asc" },
    });

    // Pair STUDENT and PATIENT messages by turnNumber
    const byTurn = new Map<
      number,
      { studentInput: string; patientResponse: string; timestamp: string }
    >();
    for (const msg of messages as Array<{
      role: string;
      turnNumber: number;
      originalText: string;
      sentAt: Date;
    }>) {
      const entry = byTurn.get(msg.turnNumber) ?? {
        studentInput: "",
        patientResponse: "",
        timestamp: "",
      };
      if (msg.role === "STUDENT") {
        entry.studentInput = msg.originalText;
        entry.timestamp = msg.sentAt.toISOString();
      } else if (msg.role === "PATIENT") {
        entry.patientResponse = msg.originalText;
      }
      byTurn.set(msg.turnNumber, entry);
    }

    return Array.from(byTurn.entries())
      .sort(([a], [b]) => a - b)
      .map(([turnNumber, entry]) => ({
        turnIndex: turnNumber,
        studentInput: entry.studentInput,
        patientResponse: entry.patientResponse,
        timestamp: entry.timestamp || new Date(0).toISOString(),
      }));
  }

  private gateBlockedMessage(reason: string): string {
    switch (reason) {
      case "CREDIT_HARD_LIMIT":
        return "This session is currently unavailable. Please contact your instructor.";
      case "TURN_LIMIT":
        return "You have reached the maximum number of turns for this simulation.";
      case "TOKEN_BUDGET":
        return "This simulation session has reached its usage limit.";
      default:
        return "Session unavailable.";
    }
  }
}
