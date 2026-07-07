"use strict";
// InputGate -- Step 1 of per-turn pipeline [APS-REQ-062]
// Validates limits before any LLM call is made.
// All checks are stateless per-call: fresh from DB totals, no in-memory accumulation.
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputGate = exports.DEFAULT_TURN_BUDGET = void 0;
exports.DEFAULT_TURN_BUDGET = {
    maxTurns: 75,
    softWarnTurns: 60,
    tokenBudgetPerSimulation: 150_000,
    maxDictationSeconds: 900, // 15 * 60
    maxDebriefQuestions: 10,
    maxGuardRetries: 1,
    contextWindowTokenBudget: 4_000, // ~4k tokens of conversation history per turn
};
class InputGate {
    budget;
    constructor(budget = exports.DEFAULT_TURN_BUDGET) {
        this.budget = budget;
    }
    get contextWindowTokenBudget() {
        return this.budget.contextWindowTokenBudget;
    }
    check(totals) {
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
exports.InputGate = InputGate;
//# sourceMappingURL=input-gate.js.map