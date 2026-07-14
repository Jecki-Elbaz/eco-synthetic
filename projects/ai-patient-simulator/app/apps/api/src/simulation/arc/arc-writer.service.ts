// ArcWriterService -- session-arc writer + cumulative ceiling enforcement (S5-GAL-ARC-WRITER).
// Called when a STUDENT attempt is COMPLETED.
// Computes the per-session arc summary from PatientStateLog data and persists
// to ArcSessionSummary with ceiling/floor clamping (Sami C4).
//
// CEILING/FLOOR ENFORCEMENT (Sami C4 -- BUILD REQUIREMENT):
//   After computing raw delta from the per-turn state, apply ceiling/floor from
//   ArcDeltaConfig before persisting. Prevents implausibly cooperative patient
//   in session 3 after two positive-delta sessions.
//   Logs pre-clamp and post-clamp values so Adam can inspect delta behavior
//   at the 2026-08-08 review (Sami C1).
//
// DATA ISOLATION: writes only for (userId, templateId, sessionNumber) of the attempt.
// AUTHOR_PREVIEW attempts are excluded (caller must check attempt.type).

import { Injectable, Logger, Optional } from "@nestjs/common";
import { PrismaService } from "../../db/prisma.service.js";
import { DEFAULT_ARC_DELTA_CONFIG, arcClamp } from "./arc-delta-config.js";
import type { ArcDeltaConfig } from "./arc-delta-config.js";
import { AppConfig } from "../../config/app.config.js";

// Default initial state values for session 1 (matches turn-pipeline.ts defaults)
const SESSION_1_INITIAL_TRUST = 0.3;
const SESSION_1_INITIAL_OPENNESS = 0.2;
const SESSION_1_INITIAL_ALLIANCE = 0.2;

@Injectable()
export class ArcWriterService {
  private readonly logger = new Logger(ArcWriterService.name);
  private readonly config: ArcDeltaConfig;

  constructor(
    private readonly prisma: PrismaService,
    // S6-GAL-ARCCONFIG: AppConfig is optional so unit tests can call
    // new ArcWriterService(prisma) directly and get engineering defaults.
    // In the NestJS DI container AppConfig is @Global() and always injected.
    @Optional() appConfig?: AppConfig,
  ) {
    // Build ArcDeltaConfig from AppConfig (env vars) when available;
    // fall back to engineering defaults when AppConfig is not injected.
    // PENDING ADAM REVIEW BEFORE PRODUCTION GO-LIVE (Sami C1).
    // Set ARC_MAX_TRUST / ARC_MAX_OPENNESS / ARC_MAX_ALLIANCE /
    //     ARC_MIN_TRUST / ARC_MIN_OPENNESS / ARC_MIN_ALLIANCE
    // in the environment to calibrate without a code edit.
    this.config = appConfig
      ? {
          maxTrust: appConfig.arcMaxTrust,
          maxOpenness: appConfig.arcMaxOpenness,
          maxAlliance: appConfig.arcMaxAlliance,
          minTrust: appConfig.arcMinTrust,
          minOpenness: appConfig.arcMinOpenness,
          minAlliance: appConfig.arcMinAlliance,
        }
      : { ...DEFAULT_ARC_DELTA_CONFIG };
  }

  /**
   * Compute and persist the arc session summary for a completed STUDENT attempt.
   * Should only be called for attempts with type=STUDENT and a sessionNumber.
   * Silently does nothing if:
   *   - The attempt has no PatientStateLog rows (no turns ran)
   *   - sessionNumber is null (non-arc attempt)
   *   - templateId cannot be resolved
   */
  async writeSessionSummary(attemptId: string): Promise<void> {
    // Load the attempt with its assignment -> template
    const attempt = await this.prisma.attempt.findUnique({
      where: { id: attemptId },
      include: {
        assignment: {
          include: { simulationTemplate: { select: { id: true } } },
        },
      },
    });

    if (!attempt) {
      this.logger.warn(`ArcWriter: attempt ${attemptId} not found`);
      return;
    }

    // Only write summaries for STUDENT type attempts with a sessionNumber
    if (attempt.type !== "STUDENT" || attempt.sessionNumber == null) {
      return;
    }

    const userId = attempt.userId;
    const templateId = attempt.assignment.simulationTemplate.id;
    const sessionNumber = attempt.sessionNumber;

    // Load the final (last-turn) PatientStateLog for this attempt
    const lastLog = await this.prisma.patientStateLog.findFirst({
      where: { attemptId },
      orderBy: { turnNumber: "desc" },
    });

    if (!lastLog) {
      // No turns ran -- nothing to summarise
      this.logger.warn(
        `ArcWriter: no PatientStateLog rows for attempt ${attemptId}, skipping summary`,
      );
      return;
    }

    // Determine the initial state for this session (for delta computation):
    //   Session 1: use hardcoded defaults (same as pipeline turn-1 defaults)
    //   Session 2+: load the prior session's finalTrustLevel etc. from ArcSessionSummary
    let initialTrust = SESSION_1_INITIAL_TRUST;
    let initialOpenness = SESSION_1_INITIAL_OPENNESS;
    let initialAlliance = SESSION_1_INITIAL_ALLIANCE;

    if (sessionNumber >= 2) {
      const priorSummary = await this.prisma.arcSessionSummary.findUnique({
        where: {
          userId_templateId_sessionNumber: {
            userId,
            templateId,
            sessionNumber: sessionNumber - 1,
          },
        },
      });
      if (priorSummary) {
        initialTrust = priorSummary.finalTrustLevel;
        initialOpenness = priorSummary.finalOpennessLevel;
        initialAlliance = priorSummary.finalAllianceLevel;
      }
    }

    // Raw values from the last PatientStateLog turn
    const rawTrust = lastLog.trust;
    const rawOpenness = lastLog.openness;
    const rawAlliance = lastLog.allianceQuality;

    // Raw delta (for logging -- not used in the clamped values)
    const rawTrustDelta = rawTrust - initialTrust;

    // CEILING/FLOOR ENFORCEMENT (Sami C4):
    // Apply ceilings and floors from ArcDeltaConfig before persisting.
    const cfg = this.config;
    const clampedTrust = arcClamp(rawTrust, cfg.minTrust, cfg.maxTrust);
    const clampedOpenness = arcClamp(rawOpenness, cfg.minOpenness, cfg.maxOpenness);
    const clampedAlliance = arcClamp(rawAlliance, cfg.minAlliance, cfg.maxAlliance);

    // Log pre-clamp and post-clamp values for Adam's 2026-08-08 review (Sami C1)
    this.logger.log(
      `ArcWriter session ${sessionNumber} attempt ${attemptId}: ` +
        `pre-clamp trust=${rawTrust.toFixed(3)} openness=${rawOpenness.toFixed(3)} alliance=${rawAlliance.toFixed(3)} | ` +
        `post-clamp trust=${clampedTrust.toFixed(3)} openness=${clampedOpenness.toFixed(3)} alliance=${clampedAlliance.toFixed(3)}`,
    );

    const trustDeltaApplied = clampedTrust - initialTrust;

    // symptomMarkerState: unlockedFactIds from last log (pilot-1 proxy for symptom progression)
    const symptomMarkerState: Record<string, unknown> = {
      unlockedFactIds: lastLog.unlockedFactIds,
    };

    // notableMomentsSummary: contextSummary from last log (or empty if no summarisation ran).
    // S7-GAL-CONTENT: sanitize before every write (2000-char cap, no student PII beyond userId).
    const notableMomentsSummary = this.sanitizeNotableMoments(lastLog.contextSummary ?? "");

    // S7-GAL-RETAIN: retainUntil = sessionCompletedAt + 90 days.
    const sessionCompletedAt = attempt.finishedAt ?? new Date();
    const retainUntil = new Date(sessionCompletedAt.getTime() + 90 * 24 * 60 * 60 * 1000);

    // Upsert: if a summary for this (userId, templateId, sessionNumber) exists,
    // update it. This handles the edge case where the attempt completes twice (rare).
    await this.prisma.arcSessionSummary.upsert({
      where: {
        userId_templateId_sessionNumber: { userId, templateId, sessionNumber },
      },
      create: {
        userId,
        templateId,
        sessionNumber,
        trustDeltaApplied,
        finalTrustLevel: clampedTrust,
        finalOpennessLevel: clampedOpenness,
        finalAllianceLevel: clampedAlliance,
        symptomMarkerState,
        notableMomentsSummary,
        sessionCompletedAt,
        retainUntil,
      },
      update: {
        trustDeltaApplied,
        finalTrustLevel: clampedTrust,
        finalOpennessLevel: clampedOpenness,
        finalAllianceLevel: clampedAlliance,
        symptomMarkerState,
        notableMomentsSummary,
        sessionCompletedAt,
        retainUntil,
      },
    });

    this.logger.log(
      `ArcWriter: persisted session-${sessionNumber} summary for user ${userId} template ${templateId}`,
    );
  }

  /**
   * S7-GAL-CONTENT: sanitize notableMomentsSummary before every Prisma write.
   * Content-scope rule (APS-022 / Eyal item 5 / 2026-07-11):
   *   Source: contextSummary from PatientStateLog only (patient/clinical narrative).
   *   No student PII beyond the userId DB key (no names, emails, handles, or
   *     student-identifying text added by the writer).
   *   Max 2000 characters enforced here before every Prisma write.
   * HONESTY NOTE (Oren S7 MINOR-1): this method enforces LENGTH ONLY. The
   * no-student-PII guarantee is a source-restriction claim (contextSummary
   * provenance from PatientStateLog), NOT a content-inspection guarantee --
   * nothing here scans or filters the text.
   */
  private sanitizeNotableMoments(raw: string): string {
    const trimmed = raw.trim();
    if (trimmed.length > 2000) {
      this.logger.warn(
        `[ArcWriter] notableMomentsSummary truncated from ${trimmed.length} to 2000 chars`,
      );
      return trimmed.substring(0, 2000);
    }
    return trimmed;
  }
}
