// Attempt totals fixture for InputGate tests.
import type { AttemptTotals } from "@aps/engine";

export function buildTestAttemptTotals(overrides?: Partial<AttemptTotals>): AttemptTotals {
  return {
    turnCount: 0,
    tokenInputTotal: 0,
    tokenOutputTotal: 0,
    creditBalance: -1, // -1 = no limit
    ...overrides,
  };
}
