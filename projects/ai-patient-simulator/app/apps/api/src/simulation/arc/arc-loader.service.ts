// ArcLoaderService -- session-boundary loader (S5-GAL-ARC-LOADER).
// Reads the prior session's ArcSessionSummary and returns an ArcSessionContext
// for injection into the turn pipeline at the start of session N.
//
// LAST-SESSION-SUMMARY PATTERN:
//   Session 1: no prior history -> returns null. Fresh start.
//   Session 2: loads session-1 summary.
//   Session 3: loads session-2 summary ONLY.
//     Session 3 loads only the session-2 summary. Session-1 formulation anchors
//     not recoverable in session 3 if session-2 summary omitted them. Known pilot-1
//     limitation; accepted. Ref: feasibility Section 4 /
//     3session-arc-feasibility-ido-2026-07-11.md.
//
// DATA ISOLATION: query always scopes to (userId, templateId, sessionNumber).
// Cross-student data leakage is impossible by the WHERE clause design.

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../db/prisma.service.js";
import type { ArcSessionContext } from "@aps/shared-types";

@Injectable()
export class ArcLoaderService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Load arc context for the given session.
   * Returns null for session 1 (no prior history) or when no summary exists.
   * For session N >= 2: queries session N-1 summary for (userId, templateId).
   *
   * DATA ISOLATION: result is strictly scoped to userId + templateId.
   * A different student's summary will never be returned.
   */
  async loadArcContext(
    userId: string,
    templateId: string,
    sessionNumber: number,
  ): Promise<ArcSessionContext | null> {
    // Session 1: no prior history -> fresh start
    if (sessionNumber <= 1) {
      return null;
    }

    // Load session N-1 summary for THIS student and template only.
    // LAST-SESSION-SUMMARY PATTERN: session 3 reads session 2 ONLY (not session 1).
    const priorSessionNumber = sessionNumber - 1;
    const summary = await this.prisma.arcSessionSummary.findUnique({
      where: {
        userId_templateId_sessionNumber: {
          userId,
          templateId,
          sessionNumber: priorSessionNumber,
        },
      },
    });

    if (!summary) {
      return null;
    }

    return {
      sessionNumber: summary.sessionNumber,
      trustLevel: summary.finalTrustLevel,
      opennessLevel: summary.finalOpennessLevel,
      allianceScore: summary.finalAllianceLevel,
      symptomMarkerState: summary.symptomMarkerState as Record<string, unknown>,
      notableMomentsSummary: summary.notableMomentsSummary,
    };
  }
}
