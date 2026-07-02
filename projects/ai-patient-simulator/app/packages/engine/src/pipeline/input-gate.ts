// InputGate -- Step 1 of per-turn pipeline [APS-REQ-062]
// Validates limits before any LLM call is made.
// All checks are stateless per-call: fresh from DB totals, no in-memory accumulation.

export interface TurnBudget {
  maxTurns: number;           // default 75
  softWarnTurns: number;      // default 60
  tokenBudgetPerSimulation: number;
  maxDictationSeconds: number;
  maxDebriefQuestions: number;
  maxGuardRetries: number;
  /** Token budget for the sliding context window passed to ContextBuilder (APS-REQ-063). */
  contextWindowTokenBudget: number;
}

export const DEFAULT_TURN_BUDGET: TurnBudget = {
  maxTurns: 75,
  softWarnTurns: 60,
  tokenBudgetPerSimulation: 150_000,
  maxDictationSeconds: 900,   // 15 * 60
  maxDebriefQuestions: 10,
  maxGuardRetries: 1,
  contextWindowTokenBudget: 4_000,  // ~4k tokens of conversation history per turn
};

export type GateResult =
  | { allowed: true; softWarn: boolean }
  | { allowed: false; reason: "TURN_LIMIT" | "TOKEN_BUDGET" | "CREDIT_HARD_LIMIT" };

export interface AttemptTotals {
  turnCount: number;
  tokenInputTotal: number;
  tokenOutputTotal: number;
  creditBalance: number;      // -1 = no credit limit configured
}

export class InputGate {
  private readonly budget: TurnBudget;

  constructor(budget: TurnBudget = DEFAULT_TURN_BUDGET) {
    this.budget = budget;
  }

  get contextWindowTokenBudget(): number {
    return this.budget.contextWindowTokenBudget;
  }

  check(totals: AttemptTotals): GateResult {
    // Credit hard limit -- checked first; student never sees credit detail
    if (totals.creditBalance !== -1 && totals.creditBalance <= 0) {
      return { allowed: false, reason: "CREDIT_HARD_LIMIT" };
    }

    // Turn count hard limit
    if (totals.turnCount >= this.budget.maxTurns) {
      return { allowed: false, reason: "TURN_LIMIT" };
    }

    // Token budget hard limit
    const usedTokens = totals.tokenInputTotal + totals.tokenOutputTotal;
    if (usedTokens >= this.budget.tokenBudgetPerSimulation) {
      return { allowed: false, reason: "TOKEN_BUDGET" };
    }

    // Soft warning (informational -- turn still allowed)
    const softWarn = totals.turnCount >= this.budget.softWarnTurns;

    return { allowed: true, softWarn };
  }
}
