// Deterministic routing matrix (APS-REQ-107/108)
// Pure function: issueCategory x scope -> support email address + response SLA.
// No LLM. No DB. Regression-tested in engine-test-harness.

import type { SupportIssueCategory, SupportScope, RoutingResult } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Routing table (all rules enumerated for regression testing)
// ---------------------------------------------------------------------------

// Key format: `${issueCategory}:${scope}`
const ROUTING_TABLE: Record<string, RoutingResult> = {
  // Mic / dictation issues
  "MIC_DICTATION_FAILURE:COURSE":  { toEmail: "it-support@aps.pilot", expectedResponseHours: 4 },
  "MIC_DICTATION_FAILURE:COLLEGE": { toEmail: "it-support@aps.pilot", expectedResponseHours: 4 },
  "MIC_DICTATION_FAILURE:GLOBAL":  { toEmail: "it-support@aps.pilot", expectedResponseHours: 8 },

  // Simulation loading
  "SIMULATION_LOADING_FAILURE:COURSE":  { toEmail: "tech-support@aps.pilot", expectedResponseHours: 2 },
  "SIMULATION_LOADING_FAILURE:COLLEGE": { toEmail: "tech-support@aps.pilot", expectedResponseHours: 2 },
  "SIMULATION_LOADING_FAILURE:GLOBAL":  { toEmail: "platform@aps.pilot",     expectedResponseHours: 4 },

  // AI response failures (potentially academic-impact; escalate faster)
  "AI_RESPONSE_FAILURE:COURSE":  { toEmail: "academic-support@aps.pilot", expectedResponseHours: 1 },
  "AI_RESPONSE_FAILURE:COLLEGE": { toEmail: "academic-support@aps.pilot", expectedResponseHours: 2 },
  "AI_RESPONSE_FAILURE:GLOBAL":  { toEmail: "platform@aps.pilot",         expectedResponseHours: 4 },

  // Other / generic
  "OTHER:COURSE":  { toEmail: "support@aps.pilot", expectedResponseHours: 8 },
  "OTHER:COLLEGE": { toEmail: "support@aps.pilot", expectedResponseHours: 8 },
  "OTHER:GLOBAL":  { toEmail: "support@aps.pilot", expectedResponseHours: 24 },
};

// Fallback when a key is not in the table (should not happen in production)
const FALLBACK_ROUTING: RoutingResult = {
  toEmail: "support@aps.pilot",
  expectedResponseHours: 24,
};

// ---------------------------------------------------------------------------
// Public pure function
// ---------------------------------------------------------------------------

/**
 * Deterministic routing: given an issue category and the narrowest available scope,
 * return the support email address and expected response SLA.
 *
 * Scope resolution (caller decides the narrowest scope):
 *   COURSE  -> student has a known courseId
 *   COLLEGE -> student has a collegeId but no courseId
 *   GLOBAL  -> no institutional context available
 */
export function resolveRoutingTarget(
  issueCategory: SupportIssueCategory,
  scope: SupportScope,
): RoutingResult {
  const key = `${issueCategory}:${scope}`;
  return ROUTING_TABLE[key] ?? FALLBACK_ROUTING;
}

/**
 * Export the full table for regression tests -- each entry asserts
 * exactly one rule, so adding a new rule forces a new test.
 */
export { ROUTING_TABLE };
