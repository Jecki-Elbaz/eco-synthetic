import type { GlobalDiagnosticState, SupportIssueCategory, TroubleshootingResult } from "@aps/shared-types";
/**
 * Deterministic troubleshooting flow dispatcher.
 * No LLM. No DB access. No imports from patient engine / persona / ground-truth.
 */
export declare function runTroubleshootingFlow(category: SupportIssueCategory, diagnosticState: GlobalDiagnosticState): TroubleshootingResult;
//# sourceMappingURL=troubleshoot.d.ts.map