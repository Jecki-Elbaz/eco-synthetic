export type GuardVerdict = "PASS" | "FAIL";
export interface GuardResult {
    verdict: GuardVerdict;
    violations: string[];
    suggestion: string;
}
//# sourceMappingURL=guard.types.d.ts.map