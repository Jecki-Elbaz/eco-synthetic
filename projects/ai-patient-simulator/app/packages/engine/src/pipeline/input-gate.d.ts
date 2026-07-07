export interface TurnBudget {
    maxTurns: number;
    softWarnTurns: number;
    tokenBudgetPerSimulation: number;
    maxDictationSeconds: number;
    maxDebriefQuestions: number;
    maxGuardRetries: number;
    /** Token budget for the sliding context window passed to ContextBuilder (APS-REQ-063). */
    contextWindowTokenBudget: number;
}
export declare const DEFAULT_TURN_BUDGET: TurnBudget;
export type GateResult = {
    allowed: true;
    softWarn: boolean;
} | {
    allowed: false;
    reason: "TURN_LIMIT" | "TOKEN_BUDGET" | "CREDIT_HARD_LIMIT";
};
export interface AttemptTotals {
    turnCount: number;
    tokenInputTotal: number;
    tokenOutputTotal: number;
    creditBalance: number;
}
export declare class InputGate {
    private readonly budget;
    constructor(budget?: TurnBudget);
    get contextWindowTokenBudget(): number;
    check(totals: AttemptTotals): GateResult;
}
//# sourceMappingURL=input-gate.d.ts.map