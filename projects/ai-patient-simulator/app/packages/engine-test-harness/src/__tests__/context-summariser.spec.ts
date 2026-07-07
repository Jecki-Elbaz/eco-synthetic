/**
 * Context-summariser trigger tests (APS-REQ-063, Sprint 2 Inc 3)
 *
 * Tests TurnPipeline summariser behaviour in isolation (no DB, no HTTP).
 *
 * Cases:
 *   (a) No summariser call when all messages fit within the token window.
 *   (b) Summariser fires when messages exceed the window -- contextSummary
 *       populated and summarisedUpTo advances.
 *   (c) Already-summarised messages (turnNumber <= prior summarisedUpTo) are
 *       not re-summarised.
 *   (d) Summariser tokens are counted into the turn totals.
 */

import { TurnPipeline, DEFAULT_TURN_BUDGET, ModelHint } from "@aps/engine";
import type { TurnPipelineInput, LLMProvider, LLMRequest, LLMResponse, TurnBudget } from "@aps/engine";
import {
  buildTestGroundTruth,
  buildTestAttemptTotals,
  ScriptedStubProvider,
} from "../index.js";
import type { PatientStateSnapshot } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STUB_ANALYSER_JSON = JSON.stringify({
  empathy: 0.6,
  questionType: "open",
  specificity: 0.5,
  validation: 0.5,
  actConsistency: 0.5,
  prematureAdvice: false,
  pressure: 0.1,
  missedCues: [],
  riskRelevance: false,
  therapeuticStance: "supportive",
  turnLanguage: "en",
  rawClassification: "[summariser-test]",
});

const PASS_GUARD_JSON = JSON.stringify({ verdict: "PASS", violations: [], suggestion: "" });
const PATIENT_RESPONSE = "I understand.";
const SUMMARY_TEXT = "Summary: student and patient had a brief exchange.";

/**
 * A SpyProvider wraps a ScriptedStubProvider and records which ModelHints
 * were called, allowing assertions on summariser invocation.
 */
class SpyProvider implements LLMProvider {
  private readonly inner: ScriptedStubProvider;
  public readonly calls: ModelHint[] = [];
  public readonly summariserCallCount = { value: 0 };

  constructor(inner: ScriptedStubProvider) {
    this.inner = inner;
  }

  async complete(req: LLMRequest): Promise<LLMResponse> {
    this.calls.push(req.modelHint);
    if (req.modelHint === ModelHint.SUMMARISER) {
      this.summariserCallCount.value += 1;
    }
    return this.inner.complete(req);
  }

  estimateCost(): number {
    return 0;
  }
}

function makeSpyProvider(summaryText = SUMMARY_TEXT): SpyProvider {
  const scripted = new ScriptedStubProvider({
    [ModelHint.PATIENT_RESPONSE]: [PATIENT_RESPONSE],
    [ModelHint.ANALYSER]: [STUB_ANALYSER_JSON],
    [ModelHint.GUARD_PASS]: [PASS_GUARD_JSON],
    [ModelHint.SUMMARISER]: [summaryText],
  });
  return new SpyProvider(scripted);
}

/** Build a TurnBudget with an artificially small context window to force summarisation. */
function tinyWindowBudget(contextWindowTokenBudget: number): TurnBudget {
  return {
    ...DEFAULT_TURN_BUDGET,
    contextWindowTokenBudget,
  };
}

/**
 * Build a MessageRecord array simulating N past turns.
 * Each message text is short enough that 1-2 fit in a small window but many do not.
 */
function makeMessages(count: number, textPerMessage = "A short message.") {
  const msgs = [];
  for (let i = 1; i <= count; i++) {
    msgs.push({
      role: (i % 2 === 1 ? "STUDENT" : "PATIENT") as "STUDENT" | "PATIENT",
      turnNumber: i,
      originalText: textPerMessage,
      language: "en",
    });
  }
  return msgs;
}

function makeInput(overrides: Partial<TurnPipelineInput> = {}): TurnPipelineInput {
  return {
    attemptId: "summariser-test-001",
    turnNumber: 1,
    challengeLevel: 2,
    studentMessage: "How are you doing today?",
    studentLanguage: "en",
    nonVerbalCues: undefined,
    priorState: null,
    personaSystemPrompt: "You are a simulated patient.",
    groundTruth: buildTestGroundTruth(),
    recentMessages: [],
    contextSummary: null,
    totals: buildTestAttemptTotals(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Case (a): No summariser call when all messages fit within the token window
// ---------------------------------------------------------------------------

describe("Context summariser -- (a) no summariser when everything fits the window", () => {
  it("does not call SUMMARISER when recentMessages is empty", async () => {
    const spy = makeSpyProvider();
    const pipeline = new TurnPipeline(spy);

    await pipeline.run(makeInput({ recentMessages: [] }));

    expect(spy.summariserCallCount.value).toBe(0);
  });

  it("does not call SUMMARISER when messages fit within the large default window", async () => {
    // DEFAULT_TURN_BUDGET.contextWindowTokenBudget = 4000 tokens; 5 short messages fit easily
    const spy = makeSpyProvider();
    const pipeline = new TurnPipeline(spy);

    const messages = makeMessages(5, "Short.");
    await pipeline.run(makeInput({ recentMessages: messages, turnNumber: 6, totals: buildTestAttemptTotals({ turnCount: 5 }) }));

    expect(spy.summariserCallCount.value).toBe(0);
  });

  it("nextStateSnapshot.contextSummary is null when no summariser fired", async () => {
    const spy = makeSpyProvider();
    const pipeline = new TurnPipeline(spy);

    const result = await pipeline.run(makeInput({ recentMessages: [] }));

    expect(result.nextStateSnapshot?.contextSummary).toBeNull();
    expect(result.nextStateSnapshot?.summarisedUpTo).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Case (b): Summariser fires when messages exceed the window
// ---------------------------------------------------------------------------

describe("Context summariser -- (b) summariser fires on overflow", () => {
  // Each message is exactly 80 chars. Token estimate = ceil(80/4) = 20 tokens per msg.
  // With a budget of 30 tokens, only 1 message fits. If we have 4 messages, 3 are dropped.
  const MESSAGE_TEXT = "A".repeat(80); // 80 chars -> 20 estimated tokens
  const BUDGET = 30;                   // fits 1 message only

  it("SUMMARISER is called when messages exceed the token window", async () => {
    const spy = makeSpyProvider();
    const pipeline = new TurnPipeline(spy, { budget: tinyWindowBudget(BUDGET) });

    const messages = makeMessages(4, MESSAGE_TEXT);
    await pipeline.run(makeInput({
      recentMessages: messages,
      turnNumber: 5,
      totals: buildTestAttemptTotals({ turnCount: 4 }),
    }));

    // Exactly one summariser call per turn -- tighter than >=1 so a
    // double-invocation regression is caught.
    expect(spy.summariserCallCount.value).toBe(1);
  });

  it("nextStateSnapshot.contextSummary is populated after summariser fires", async () => {
    const spy = makeSpyProvider(SUMMARY_TEXT);
    const pipeline = new TurnPipeline(spy, { budget: tinyWindowBudget(BUDGET) });

    const messages = makeMessages(4, MESSAGE_TEXT);
    const result = await pipeline.run(makeInput({
      recentMessages: messages,
      turnNumber: 5,
      totals: buildTestAttemptTotals({ turnCount: 4 }),
    }));

    expect(result.gateResult.allowed).toBe(true);
    expect(result.nextStateSnapshot?.contextSummary).toBe(SUMMARY_TEXT);
  });

  it("nextStateSnapshot.summarisedUpTo advances to highest dropped turnNumber", async () => {
    const spy = makeSpyProvider(SUMMARY_TEXT);
    const pipeline = new TurnPipeline(spy, { budget: tinyWindowBudget(BUDGET) });

    // 4 messages (turns 1-4). Budget fits 1. Dropped = turns 1, 2, 3.
    const messages = makeMessages(4, MESSAGE_TEXT);
    const result = await pipeline.run(makeInput({
      recentMessages: messages,
      turnNumber: 5,
      totals: buildTestAttemptTotals({ turnCount: 4 }),
    }));

    // summarisedUpTo should be 3 (the highest dropped turnNumber)
    expect(result.nextStateSnapshot?.summarisedUpTo).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Case (c): Already-summarised messages are not re-summarised
// ---------------------------------------------------------------------------

describe("Context summariser -- (c) already-summarised messages not re-processed", () => {
  const MESSAGE_TEXT = "A".repeat(80); // 20 tokens per message
  const BUDGET = 30;                   // fits 1 message

  it("SUMMARISER is not called again for turns already covered by summarisedUpTo", async () => {
    const spy = makeSpyProvider(SUMMARY_TEXT);
    const pipeline = new TurnPipeline(spy, { budget: tinyWindowBudget(BUDGET) });

    // 4 messages (turns 1-4). We tell the pipeline that turns 1-3 were already summarised.
    const priorState: PatientStateSnapshot = {
      trust: 0.3, openness: 0.2, emotionalActiv: 0.4,
      avoidanceLevel: 0.6, defensiveness: 0.5, allianceQuality: 0.2,
      disclosureReady: 0.1, riskRelevance: 0.0,
      attemptId: "summariser-test-001",
      turnNumber: 4,
      unlockedFactIds: [],
      pendingTriggers: [],
      challengeLevel: 2,
      guardResult: "PASS",
      guardDetail: null,
      summarisedUpTo: 3,  // turns 1-3 already covered
      contextSummary: "Prior summary of turns 1-3.",
    };

    const messages = makeMessages(4, MESSAGE_TEXT);
    const result = await pipeline.run(makeInput({
      recentMessages: messages,
      turnNumber: 5,
      priorState,
      contextSummary: "Prior summary of turns 1-3.",
      totals: buildTestAttemptTotals({ turnCount: 4 }),
    }));

    // Budget = 30 tokens, each msg = 20 tokens. Window holds 1 msg (turn 4).
    // Dropped = turns 1, 2, 3. BUT all of them have turnNumber <= summarisedUpTo (3).
    // So nothing new to summarise: SUMMARISER should NOT be called.
    expect(spy.summariserCallCount.value).toBe(0);

    // summarisedUpTo should remain 3 (unchanged)
    expect(result.nextStateSnapshot?.summarisedUpTo).toBe(3);
  });

  it("prior contextSummary is passed through unchanged when no new summarisation needed", async () => {
    const spy = makeSpyProvider(SUMMARY_TEXT);
    const pipeline = new TurnPipeline(spy, { budget: tinyWindowBudget(BUDGET) });

    const PRIOR_SUMMARY = "Pre-existing summary from before.";
    const priorState: PatientStateSnapshot = {
      trust: 0.3, openness: 0.2, emotionalActiv: 0.4,
      avoidanceLevel: 0.6, defensiveness: 0.5, allianceQuality: 0.2,
      disclosureReady: 0.1, riskRelevance: 0.0,
      attemptId: "summariser-test-001",
      turnNumber: 4,
      unlockedFactIds: [],
      pendingTriggers: [],
      challengeLevel: 2,
      guardResult: "PASS",
      guardDetail: null,
      summarisedUpTo: 3,
      contextSummary: PRIOR_SUMMARY,
    };

    const messages = makeMessages(4, MESSAGE_TEXT);
    const result = await pipeline.run(makeInput({
      recentMessages: messages,
      turnNumber: 5,
      priorState,
      contextSummary: PRIOR_SUMMARY,
      totals: buildTestAttemptTotals({ turnCount: 4 }),
    }));

    expect(result.nextStateSnapshot?.contextSummary).toBe(PRIOR_SUMMARY);
  });
});

// ---------------------------------------------------------------------------
// Case (d): Summariser tokens are counted into the turn totals
// ---------------------------------------------------------------------------

describe("Context summariser -- (d) summariser tokens counted in turn totals", () => {
  const MESSAGE_TEXT = "A".repeat(80); // 20 tokens per message
  const BUDGET = 30;

  it("inputTokensUsed includes summariser input tokens when SUMMARISER fires", async () => {
    const spy = makeSpyProvider(SUMMARY_TEXT);
    const pipeline = new TurnPipeline(spy, { budget: tinyWindowBudget(BUDGET) });

    // Without summariser: analyser(10in) + patient(10in) + guard(10in) = 30in
    // With summariser:    summariser(10in) + analyser(10in) + patient(10in) + guard(10in) = 40in
    const messages = makeMessages(4, MESSAGE_TEXT);
    const resultWithOverflow = await pipeline.run(makeInput({
      recentMessages: messages,
      turnNumber: 5,
      totals: buildTestAttemptTotals({ turnCount: 4 }),
    }));

    const spyNoSummarise = makeSpyProvider(SUMMARY_TEXT);
    const pipelineNoSummarise = new TurnPipeline(spyNoSummarise, { budget: tinyWindowBudget(BUDGET) });
    const resultNoOverflow = await pipelineNoSummarise.run(makeInput({
      recentMessages: [],
      turnNumber: 1,
    }));

    // With overflow (summariser fires), inputTokensUsed must be greater
    expect(resultWithOverflow.inputTokensUsed).toBeGreaterThan(resultNoOverflow.inputTokensUsed);
    expect(resultWithOverflow.outputTokensUsed).toBeGreaterThan(resultNoOverflow.outputTokensUsed);
  });

  it("inputTokensUsed equals base tokens + summariser tokens when SUMMARISER fires", async () => {
    const spy = makeSpyProvider(SUMMARY_TEXT);
    const pipeline = new TurnPipeline(spy, { budget: tinyWindowBudget(BUDGET) });

    const messages = makeMessages(4, MESSAGE_TEXT);
    const result = await pipeline.run(makeInput({
      recentMessages: messages,
      turnNumber: 5,
      totals: buildTestAttemptTotals({ turnCount: 4 }),
    }));

    expect(result.gateResult.allowed).toBe(true);
    // ScriptedStubProvider returns 5 input + 5 output tokens per call.
    // Summariser(5in+5out) + Analyser(5in+5out) + Patient(5in+5out) + Guard(5in+5out) = 20/20
    expect(result.inputTokensUsed).toBe(20);
    expect(result.outputTokensUsed).toBe(20);
  });
});
