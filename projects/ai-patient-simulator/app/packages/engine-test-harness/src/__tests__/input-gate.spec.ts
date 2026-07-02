/**
 * InputGate unit tests
 * Coverage: TC-CREDIT-01, TC-CREDIT-02, and the turn/token hard-limit gates.
 * 15-Aug rehearsal bar covered: Criterion F (credit hard-limit block).
 *
 * No DB required. No LLM required. Runs purely in-process.
 */

import { InputGate, DEFAULT_TURN_BUDGET } from "@aps/engine";
import type { AttemptTotals, TurnBudget } from "@aps/engine";
import { buildTestAttemptTotals } from "../fixtures/attempt-totals.fixture.js";

describe("InputGate", () => {
  const gate = new InputGate();

  // --- Credit hard-limit (Criterion F) ---

  it("blocks when creditBalance is 0 (hard limit zero)", () => {
    const totals = buildTestAttemptTotals({ creditBalance: 0 });
    const result = gate.check(totals);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("CREDIT_HARD_LIMIT");
    }
  });

  it("blocks when creditBalance is negative (below zero)", () => {
    const totals = buildTestAttemptTotals({ creditBalance: -5 });
    // -1 is the sentinel for "no limit", any other negative value is below zero
    // The check is: creditBalance !== -1 && creditBalance <= 0
    const result = gate.check(totals);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("CREDIT_HARD_LIMIT");
    }
  });

  it("allows when creditBalance is -1 (no limit configured)", () => {
    const totals = buildTestAttemptTotals({ creditBalance: -1 });
    const result = gate.check(totals);
    expect(result.allowed).toBe(true);
  });

  it("allows when creditBalance is positive", () => {
    const totals = buildTestAttemptTotals({ creditBalance: 100 });
    const result = gate.check(totals);
    expect(result.allowed).toBe(true);
  });

  // --- Turn hard-limit ---

  it("blocks when turnCount equals maxTurns (75)", () => {
    const totals = buildTestAttemptTotals({ turnCount: 75 });
    const result = gate.check(totals);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("TURN_LIMIT");
    }
  });

  it("blocks when turnCount exceeds maxTurns", () => {
    const totals = buildTestAttemptTotals({ turnCount: 80 });
    const result = gate.check(totals);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("TURN_LIMIT");
    }
  });

  it("allows turn 74 (one before hard limit)", () => {
    const totals = buildTestAttemptTotals({ turnCount: 74 });
    const result = gate.check(totals);
    expect(result.allowed).toBe(true);
  });

  // --- Token budget hard-limit ---

  it("blocks when token budget exhausted", () => {
    const totals = buildTestAttemptTotals({
      tokenInputTotal: 100_000,
      tokenOutputTotal: 50_001, // total = 150_001 >= 150_000
    });
    const result = gate.check(totals);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("TOKEN_BUDGET");
    }
  });

  it("allows when token total is exactly at budget boundary (not exceeded)", () => {
    const totals = buildTestAttemptTotals({
      tokenInputTotal: 75_000,
      tokenOutputTotal: 74_999, // total = 149_999 < 150_000
    });
    const result = gate.check(totals);
    expect(result.allowed).toBe(true);
  });

  // --- Soft warning ---

  it("returns softWarn=true when turnCount >= 60", () => {
    const totals = buildTestAttemptTotals({ turnCount: 60 });
    const result = gate.check(totals);
    expect(result.allowed).toBe(true);
    if (result.allowed) {
      expect(result.softWarn).toBe(true);
    }
  });

  it("returns softWarn=false when turnCount < 60", () => {
    const totals = buildTestAttemptTotals({ turnCount: 59 });
    const result = gate.check(totals);
    expect(result.allowed).toBe(true);
    if (result.allowed) {
      expect(result.softWarn).toBe(false);
    }
  });

  it("returns softWarn=true at turn 74 (warn active, not yet hard-blocked)", () => {
    const totals = buildTestAttemptTotals({ turnCount: 74 });
    const result = gate.check(totals);
    expect(result.allowed).toBe(true);
    if (result.allowed) {
      expect(result.softWarn).toBe(true);
    }
  });

  // --- Credit check takes priority over turn check ---

  it("credit limit is checked before turn count (credit blocks even at turn 1)", () => {
    const totals = buildTestAttemptTotals({ turnCount: 1, creditBalance: 0 });
    const result = gate.check(totals);
    expect(result.allowed).toBe(false);
    if (!result.allowed) {
      expect(result.reason).toBe("CREDIT_HARD_LIMIT");
    }
  });

  // --- Custom budget ---

  it("respects a custom turn budget", () => {
    const customBudget: TurnBudget = {
      ...DEFAULT_TURN_BUDGET,
      maxTurns: 10,
      softWarnTurns: 8,
    };
    const customGate = new InputGate(customBudget);

    expect(customGate.check(buildTestAttemptTotals({ turnCount: 9 })).allowed).toBe(true);
    expect(customGate.check(buildTestAttemptTotals({ turnCount: 10 })).allowed).toBe(false);

    const warnResult = customGate.check(buildTestAttemptTotals({ turnCount: 8 }));
    expect(warnResult.allowed).toBe(true);
    if (warnResult.allowed) expect(warnResult.softWarn).toBe(true);
  });
});
