// SimulationService -- coordinates DB reads/writes around TurnPipeline.
// This is the service-layer boundary between the engine (pure TS) and the DB.
// The engine never imports @aps/db; all DB access is here.
//
// S5-GAL-ARC-LOADER / S5-GAL-ARC-WRITER:
//   processTurn loads ArcSessionContext for session N from ArcLoaderService.
//   runPipelineTurn (hardLimitReached) and finishAttempt both call ArcWriterService
//   to persist per-session summary on COMPLETED.

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
import type { ArcSessionContext } from "@aps/shared-types";
import type { GroundTruthRef } from "@aps/engine";
import type { AttemptTotals } from "@aps/engine";
import { EvaluationService } from "../evaluation/evaluation.service.js";
import { ArcLoaderService } from "./arc/arc-loader.service.js";
import { ArcWriterService } from "./arc/arc-writer.service.js";

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
  /**
   * S5-GAL-ARC-LOADER: arc context from prior session, passed to TurnPipeline.
   * null for session 1, AUTHOR_PREVIEW, or non-arc templates.
   */
  arcContext?: ArcSessionContext | null;
}

@Injectable()
export class SimulationService {
  /**
   * S7-GAL-M5: arc context cache keyed by attemptId.
   * SimulationService is DEFAULT scope (singleton); Map class field is correct.
   * Arc context is static within a session (loader reads prior summary once at session start).
   * Evicted on attempt COMPLETED to prevent memory growth.
   */
  private readonly arcContextCache = new Map<string, ArcSessionContext | null>();

  /**
   * S9-GAL-EVICT / Oren S7 INFO-1 / Ido S9 H1 ruling:
   * Hard upper bound on arcContextCache size. Prevents unbounded growth when
   * terminal transitions (ABANDONED, TECHNICALLY_AFFECTED, etc.) are applied via
   * SupportService rather than SimulationService -- those paths never call the
   * COMPLETED eviction above. Value 500 is far above any expected pilot concurrency
   * (< 50 concurrent attempts). On .set(), if size exceeds this bound, the oldest
   * entry (Map insertion order = first key) is evicted before the next read.
   * FIFO, not LRU (Oren S9 F3): Map.get() does not refresh insertion order, so a
   * frequently-accessed entry is still evicted if it was oldest-inserted. Acceptable
   * because a hot entry re-loads from DB on the next miss (one extra findUnique).
   */
  private readonly MAX_ARC_CACHE_ENTRIES = 500;

  constructor(
    private readonly prisma: PrismaService,
    private readonly pipeline: TurnPipeline,
    private readonly evaluationService: EvaluationService,
    private readonly arcLoaderService: ArcLoaderService,
    private readonly arcWriterService: ArcWriterService,
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

    // S5-GAL-ARC-LOADER / S7-GAL-M5: load prior session context for arc-enabled STUDENT attempts.
    // attempt.sessionNumber is null for non-arc templates (maxSessions <= 1); skip in that case.
    // S7-GAL-M5: getCachedArcContext memoizes per attemptId (arc context is static within a session).
    let arcContext: ArcSessionContext | null = null;
    if (attempt.type === "STUDENT" && attempt.sessionNumber != null && template.maxSessions > 1) {
      arcContext = await this.getCachedArcContext(
        dto.attemptId,
        actorId,
        template.id,
        attempt.sessionNumber,
      );
    }

    return this.runPipelineTurn(dto.attemptId, dto.studentMessage, dto.language, dto.nonVerbalCues, {
      challengeLevel: assignment.challengeLevel,
      maxTurns: assignment.maxTurns,
      personaSystemPrompt: template.personaPrompt,
      groundTruth,
      ledger: ledger as { id: string; balance: number; hardLimit: number | null } | null,
      bypassCreditCheck: false,
      usageLogEventType: "SIMULATION_TURN",
      arcContext,
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
      arcContext: ctx.arcContext ?? null,
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
      // S7-GAL-M5: evict arc context cache on COMPLETED (prevent memory growth).
      this.arcContextCache.delete(attemptId);
      // S5-GAL-ARC-WRITER: persist per-session arc summary on auto-complete (turn limit).
      await this.arcWriterService.writeSessionSummary(attemptId);
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
   * S5-GAL-ARC-WRITER: after marking COMPLETED, persist per-session arc summary.
   */
  async finishAttempt(attemptId: string, actorId: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
    });
    if (!attempt) throw new NotFoundException("Attempt not found");
    if (attempt.userId !== actorId) throw new ForbiddenException("Not your attempt");

    const updated = await this.prisma.attempt.update({
      where: { id: attemptId },
      data: { status: "COMPLETED", finishedAt: new Date() },
    });

    // S7-GAL-M5: evict arc context cache on COMPLETED (prevent memory growth).
    this.arcContextCache.delete(attemptId);
    // Persist arc session summary (no-op for AUTHOR_PREVIEW or non-arc attempts)
    await this.arcWriterService.writeSessionSummary(attemptId);

    return updated;
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

  /**
   * S7-GAL-M5: load arc context with per-attemptId memoization.
   * Arc context is static within a session; the loader reads the prior-session summary
   * exactly once at session start. Cached in arcContextCache (Map) for the attempt lifetime.
   * Evicted when attempt transitions to COMPLETED.
   * Transparent to callers -- behaviour is identical to calling arcLoaderService directly.
   */
  private async getCachedArcContext(
    attemptId: string,
    userId: string,
    templateId: string,
    sessionNumber: number,
  ): Promise<ArcSessionContext | null> {
    if (!this.arcContextCache.has(attemptId)) {
      const ctx = await this.arcLoaderService.loadArcContext(userId, templateId, sessionNumber);
      this.arcContextCache.set(attemptId, ctx);
      // S9-GAL-EVICT: evict oldest entry when size bound is exceeded.
      // Map iteration order = insertion order; first key = oldest entry.
      // Ref: Oren S7 INFO-1 + Ido S9 H1 ruling.
      if (this.arcContextCache.size > this.MAX_ARC_CACHE_ENTRIES) {
        const oldestKey = this.arcContextCache.keys().next().value;
        this.arcContextCache.delete(oldestKey);
      }
    }
    return this.arcContextCache.get(attemptId) ?? null;
  }

  /**
   * S7-GAL-DSR: delete all simulation data for a student.
   * Runs in a single Prisma transaction for atomicity.
   *
   * Cascade analysis (schema.prisma, verified 2026-07-12):
   *   ArcSessionSummary -- keyed by userId directly; no FK to Attempt.
   *   Attempt children with FK to Attempt -- NONE have onDelete: Cascade:
   *     Message, PatientStateLog, Evaluation, DebriefChat, UsageLog, SupportTicket.
   *   All non-cascading children are deleted explicitly before Attempt rows.
   *
   * NOTE: Prisma deleteMany does not support nested relation filters; attempt IDs are
   * resolved first within the transaction, then used for child deletes.
   *
   * NOTE: User account, invite tokens, and org enrollment are NOT deleted here.
   * Full DSR tooling (export, access-request, account deletion) = pre-production item.
   * Ref: APS-022 / Eyal item 4 / APS-004 residual checklist.
   */
  async deleteStudentData(userId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      // 1. Delete ArcSessionSummary rows (keyed by userId directly; no FK to Attempt).
      //    Key pillar of APS-022 privacy readiness.
      await tx.arcSessionSummary.deleteMany({ where: { userId } });

      // 2. Resolve attempt IDs for this student (needed for child deletes).
      //    Prisma deleteMany does not support nested relation filters.
      const attempts = await tx.attempt.findMany({
        where: { userId },
        select: { id: true },
      });
      const attemptIds = attempts.map((a: { id: string }) => a.id);

      if (attemptIds.length > 0) {
        // 3. Explicit deleteMany for every non-cascading Attempt child.
        //    Order: leaf tables first to avoid FK violations.
        await tx.debriefChat.deleteMany({ where: { attemptId: { in: attemptIds } } });
        await tx.evaluation.deleteMany({ where: { attemptId: { in: attemptIds } } });
        await tx.usageLog.deleteMany({ where: { attemptId: { in: attemptIds } } });
        await tx.patientStateLog.deleteMany({ where: { attemptId: { in: attemptIds } } });
        await tx.message.deleteMany({ where: { attemptId: { in: attemptIds } } });
      }

      // 3b. SupportTicket keyed by userId, not attemptId (Oren S7 MAJOR-1):
      //     attemptId is a nullable FK, so a student's general tickets
      //     (attemptId = null) would survive an attempt-scoped delete.
      //     userId-scoped delete is a strict superset of the attempt-scoped one.
      //     DiagnosticLog rows linked to those tickets are swept too (they have
      //     no user/attempt FK of their own and would otherwise orphan).
      const tickets = await tx.supportTicket.findMany({
        where: { userId },
        select: { diagnosticLogId: true },
      });
      const diagnosticLogIds = tickets
        .map((t: { diagnosticLogId: string | null }) => t.diagnosticLogId)
        .filter((x: string | null): x is string => x != null);
      await tx.supportTicket.deleteMany({ where: { userId } });
      if (diagnosticLogIds.length > 0) {
        await tx.diagnosticLog.deleteMany({ where: { id: { in: diagnosticLogIds } } });
      }

      // 4. Delete Attempt rows last.
      await tx.attempt.deleteMany({ where: { userId } });
    });
  }
}
