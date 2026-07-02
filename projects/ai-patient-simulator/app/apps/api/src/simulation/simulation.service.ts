// SimulationService -- coordinates DB reads/writes around TurnPipeline.
// This is the service-layer boundary between the engine (pure TS) and the DB.
// The engine never imports @aps/db; all DB access is here.

import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { PrismaService } from "../db/prisma.service.js";
import { TurnPipeline } from "@aps/engine";
import type { TurnRequest, TurnResponse, PatientStateSnapshot } from "@aps/shared-types";
import type { GroundTruthRef } from "@aps/engine";
import type { AttemptTotals } from "@aps/engine";

@Injectable()
export class SimulationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pipeline: TurnPipeline,
  ) {}

  /**
   * Process one student turn.
   * Steps:
   *   1. Load attempt + assignment + simulation template + ground truth from DB.
   *   2. Load credit balance for the course.
   *   3. Load prior PatientStateLog (hard-persisted state pattern).
   *   4. Load recent messages (sliding window -- Sprint 2 will compute proper window size).
   *   5. Call TurnPipeline.run().
   *   6. Persist PatientStateLog, Message, UsageLog. Update Attempt totals.
   *   7. Return TurnResponse.
   */
  async processTurn(dto: TurnRequest, actorId: string): Promise<TurnResponse> {
    // Load attempt
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: dto.attemptId },
      include: {
        assignment: {
          include: {
            simulationTemplate: {
              include: { groundTruth: true },
            },
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

    const groundTruth: GroundTruthRef = {
      disclosureAllowList: {
        unlocked: (groundTruthRow.disclosureAllowList as { unlocked?: string[] }).unlocked ?? [],
        locked: (groundTruthRow.disclosureAllowList as { locked?: string[] }).locked ?? [],
      },
      doNotInvent: (groundTruthRow.knownFacts as { doNotInvent?: string[] }).doNotInvent ?? [],
      hardOffRampText: groundTruthRow.hardOffRampText,
    };

    // Load credit balance (hard limit check in InputGate)
    const ledger = await this.prisma.creditLedger.findFirst({
      where: { courseId: assignment.courseId },
    });
    const creditBalance = ledger?.hardLimit != null
      ? ledger.balance - (ledger.hardLimit ?? 0)
      : -1; // -1 = no credit limit configured

    // Load prior state (hard-persisted pattern -- reads DB, not in-memory)
    const priorStateRow = await this.prisma.patientStateLog.findFirst({
      where: { attemptId: dto.attemptId },
      orderBy: { turnNumber: "desc" },
    });

    const priorState: PatientStateSnapshot | null = priorStateRow
      ? {
          attemptId: dto.attemptId,
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

    // Load recent messages (Sprint 2: compute proper window; Sprint 1: last 20)
    const recentMsgRows = await this.prisma.message.findMany({
      where: { attemptId: dto.attemptId },
      orderBy: { turnNumber: "asc" },
      take: 20,
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
    };

    const thisTurnNumber = attempt.turnCount + 1;

    // Call engine pipeline
    const result = await this.pipeline.run({
      attemptId: dto.attemptId,
      turnNumber: thisTurnNumber,
      challengeLevel: assignment.challengeLevel,
      studentMessage: dto.studentMessage,
      studentLanguage: dto.language,
      nonVerbalCues: dto.nonVerbalCues,
      priorState,
      personaSystemPrompt: template.personaPrompt,
      groundTruth,
      recentMessages,
      contextSummary: priorState?.contextSummary ?? null,
      totals,
    });

    // Gate blocked -- return without persisting anything
    if (!result.gateResult.allowed) {
      return {
        patientMessage: this.gateBlockedMessage(result.gateResult.reason),
        turnNumber: thisTurnNumber,
        guardResult: "BLOCKED",
        turnCount: attempt.turnCount,
        softWarnTriggered: false,
        hardLimitReached: true,
      };
    }

    const snapshot = result.nextStateSnapshot!;
    const patientResponse = result.patientResponse!;

    // Persist PatientStateLog BEFORE response delivery [APS architecture rule 1 of s.3.2]
    await this.prisma.patientStateLog.create({
      data: {
        attemptId: dto.attemptId,
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

    // Persist student message + patient response
    await this.prisma.message.createMany({
      data: [
        {
          attemptId: dto.attemptId,
          role: "STUDENT",
          turnNumber: thisTurnNumber,
          originalText: dto.studentMessage,
          nonVerbalCues: dto.nonVerbalCues ?? null,
          language: dto.language,
        },
        {
          attemptId: dto.attemptId,
          role: "PATIENT",
          turnNumber: thisTurnNumber,
          originalText: patientResponse,
          language: dto.language,
        },
      ],
    });

    // Persist usage log
    await this.prisma.usageLog.create({
      data: {
        attemptId: dto.attemptId,
        eventType: "SIMULATION_TURN",
        modelId: `${snapshot.guardResult}:stub`,
        inputTokens: result.inputTokensUsed,
        outputTokens: result.outputTokensUsed,
      },
    });

    // Write CreditEntry deduction (one per credit-consuming turn) [APS-REQ-063]
    // Only when a CreditLedger is configured for this course.
    if (ledger) {
      const tokenTotal = result.inputTokensUsed + result.outputTokensUsed;
      await this.prisma.$transaction([
        this.prisma.creditEntry.create({
          data: {
            ledgerId: ledger.id,
            activityType: "SIMULATION_TURN",
            delta: -tokenTotal,
            reason: `attempt:${dto.attemptId} turn:${thisTurnNumber}`,
          },
        }),
        this.prisma.creditLedger.update({
          where: { id: ledger.id },
          data: { balance: { decrement: tokenTotal } },
        }),
      ]);
    }

    // Update attempt totals
    const newTurnCount = attempt.turnCount + 1;
    const updatedAttempt = await this.prisma.attempt.update({
      where: { id: dto.attemptId },
      data: {
        turnCount: newTurnCount,
        tokenInputTotal: { increment: result.inputTokensUsed },
        tokenOutputTotal: { increment: result.outputTokensUsed },
        status: "IN_PROGRESS",
      },
    });

    // Auto-close if hard limit reached on this turn
    const hardLimitReached = newTurnCount >= assignment.maxTurns;
    if (hardLimitReached) {
      await this.prisma.attempt.update({
        where: { id: dto.attemptId },
        data: { status: "COMPLETED", finishedAt: new Date() },
      });
    }

    return {
      patientMessage: patientResponse,
      turnNumber: thisTurnNumber,
      guardResult: result.guardOutcome ?? "PASS",
      turnCount: newTurnCount,
      softWarnTriggered: result.softWarnTriggered,
      hardLimitReached,
    };
  }

  /**
   * Teacher review: returns all PatientStateLog rows for an attempt.
   * Teacher-review API reads PatientStateLog as specified in Ido's APPROVED-WITH-CONDITIONS.
   */
  async getPatientStateLogs(attemptId: string, actorId: string) {
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: { assignment: { include: { course: true } } },
    });
    if (!attempt) throw new NotFoundException("Attempt not found");

    // Access: owner or teacher of course or system admin
    // (simplified check -- full scope check in RolesGuard for the endpoint)
    if (attempt.userId !== actorId) {
      // Teacher access -- RolesGuard handles the role check; here we just fetch
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
