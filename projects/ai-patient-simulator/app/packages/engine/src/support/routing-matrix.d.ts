import type { SupportIssueCategory, SupportScope, RoutingResult } from "@aps/shared-types";
declare const ROUTING_TABLE: Record<string, RoutingResult>;
/**
 * Deterministic routing: given an issue category and the narrowest available scope,
 * return the support email address and expected response SLA.
 *
 * Scope resolution (caller decides the narrowest scope):
 *   COURSE  -> student has a known courseId
 *   COLLEGE -> student has a collegeId but no courseId
 *   GLOBAL  -> no institutional context available
 */
export declare function resolveRoutingTarget(issueCategory: SupportIssueCategory, scope: SupportScope): RoutingResult;
/**
 * Export the full table for regression tests -- each entry asserts
 * exactly one rule, so adding a new rule forces a new test.
 */
export { ROUTING_TABLE };
//# sourceMappingURL=routing-matrix.d.ts.map