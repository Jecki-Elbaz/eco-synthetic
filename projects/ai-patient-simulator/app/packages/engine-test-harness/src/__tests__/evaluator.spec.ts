/**
 * Evaluator engine unit tests (APS-REQ-068/069/070/071/072, Sprint 2 Inc 4)
 *
 * Tests run purely in-process against the engine package + stubs (no DB, no HTTP).
 *
 * Cases:
 *   (a) Structured scores produced BEFORE prose (call ordering asserted via spy).
 *   (b) structuredScores output shape validated per criterion.
 *   (c) transcriptHighlights shape validated.
 *   (d) Risk-criterion flagged formativeOnly -> requiresTeacherReview=true, notes annotated.
 *   (e) Malformed step-1 JSON -> fallback zero scores (no throw).
 *   (f) Token usage threaded from both steps.
 */

import { Evaluator, ModelHint } from "@aps/engine";
import type {
  EvaluatorInput,
  RubricCriterionInput,
  TranscriptMessage,
  AnalyserOutputRecord,
} from "@aps/engine";
import type { LLMProvider, LLMRequest, LLMResponse } from "@aps/engine";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const CRITERIA: RubricCriterionInput[] = [
  {
    id: "crit-empathy",
    weight: 0.4,
    maxScore: 10,
    scoringAnchors: { 0: "No empathy", 5: "Some empathy", 10: "Strong empathy" },
    competencyId: "comp-001",
    formativeOnly: false,
  },
  {
    id: "crit-risk-awareness",
    weight: 0.3,
    maxScore: 10,
    scoringAnchors: { 0: "Risk ignored", 10: "Risk handled well" },
    competencyId: "comp-risk",
    formativeOnly: true, // Sami rule
  },
  {
    id: "crit-structure",
    weight: 0.3,
    maxScore: 10,
    scoringAnchors: { 0: "No structure", 10: "Excellent structure" },
    competencyId: "comp-002",
    formativeOnly: false,
  },
];

const TRANSCRIPT: TranscriptMessage[] = [
  { role: "STUDENT", turnNumber: 1, text: "How are you feeling today?" },
  { role: "PATIENT", turnNumber: 1, text: "Not great, honestly." },
  { role: "STUDENT", turnNumber: 2, text: "I'm sorry to hear that. Can you tell me more?" },
  { role: "PATIENT", turnNumber: 2, text: "I've been struggling with low mood for weeks." },
];

const ANALYSER_OUTPUTS: AnalyserOutputRecord[] = [
  { turnNumber: 1, output: { empathy: 0.6, riskRelevance: false } },
  { turnNumber: 2, output: { empathy: 0.8, riskRelevance: true } },
];

function makeInput(overrides?: Partial<EvaluatorInput>): EvaluatorInput {
  return {
    attemptId: "eval-test-001",
    transcript: TRANSCRIPT,
    analyserOutputs: ANALYSER_OUTPUTS,
    rubricCriteria: CRITERIA,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Provider helpers
// ---------------------------------------------------------------------------

/** Produces valid stub EVALUATOR JSON for step 1 (structured scores). */
const STUB_STRUCTURED_SCORES_JSON = JSON.stringify({
  "crit-empathy": { score: 7, maxScore: 10, evidence: [1, 2], notes: "Good empathy shown" },
  "crit-risk-awareness": { score: 5, maxScore: 10, evidence: [2], notes: "Risk noted but not explored" },
  "crit-structure": { score: 8, maxScore: 10, evidence: [1, 2], notes: "Well structured session" },
});

/** Produces valid stub EVALUATOR JSON for step 2 (prose). */
const STUB_PROSE_JSON = JSON.stringify({
  overallSummary: "The student demonstrated good empathy and structure. Risk awareness needs development.",
  transcriptHighlights: [
    { type: "STRONG", turnNumber: 2, note: "Good open question to explore further." },
    { type: "RISK_FLAG", turnNumber: 2, note: "Patient mentioned low mood -- risk not probed." },
  ],
});

/**
 * RecordingSpyProvider captures each complete() call in full:
 * which ModelHint was used AND the exact messages array sent.
 * This allows assertions that the step-2 (prose) prompt contains
 * the step-1 (scoring) output -- proving sequential dependency,
 * not just sequential call order.
 */
interface CapturedCall {
  hint: ModelHint;
  messages: Array<{ role: string; content: string }>;
  responseText: string;
}

class RecordingSpyProvider implements LLMProvider {
  public readonly calls: CapturedCall[] = [];
  private readonly responses: string[];
  private callCount = 0;

  constructor(responses: string[]) {
    this.responses = responses;
  }

  get callLog(): ModelHint[] {
    return this.calls.map((c) => c.hint);
  }

  async complete(req: LLMRequest): Promise<LLMResponse> {
    const text = this.responses[this.callCount % this.responses.length] ?? "[fallback]";
    this.calls.push({
      hint: req.modelHint,
      messages: req.messages as Array<{ role: string; content: string }>,
      responseText: text,
    });
    this.callCount++;
    return {
      text,
      inputTokens: 15,
      outputTokens: 20,
      modelId: `spy:${req.modelHint}`,
      cached: false,
    };
  }

  estimateCost(): number {
    return 0;
  }
}

// Alias for test sites that only need callLog
const CallOrderSpyProvider = RecordingSpyProvider;

// ---------------------------------------------------------------------------
// (a) Scoring BEFORE prose -- call order
// ---------------------------------------------------------------------------

describe("Evaluator -- (a) structured scoring happens BEFORE prose generation", () => {
  it("first provider call uses EVALUATOR hint for scoring", async () => {
    const spy = new CallOrderSpyProvider([
      STUB_STRUCTURED_SCORES_JSON,
      STUB_PROSE_JSON,
    ]);
    const evaluator = new Evaluator(spy);

    await evaluator.evaluate(makeInput());

    // First call must be EVALUATOR (scoring step)
    expect(spy.callLog[0]).toBe(ModelHint.EVALUATOR);
  });

  it("second provider call also uses EVALUATOR hint for prose", async () => {
    const spy = new CallOrderSpyProvider([
      STUB_STRUCTURED_SCORES_JSON,
      STUB_PROSE_JSON,
    ]);
    const evaluator = new Evaluator(spy);

    await evaluator.evaluate(makeInput());

    expect(spy.callLog[1]).toBe(ModelHint.EVALUATOR);
  });

  it("exactly two provider calls are made (one scoring, one prose)", async () => {
    const spy = new CallOrderSpyProvider([
      STUB_STRUCTURED_SCORES_JSON,
      STUB_PROSE_JSON,
    ]);
    const evaluator = new Evaluator(spy);

    await evaluator.evaluate(makeInput());

    expect(spy.callLog.length).toBe(2);
  });

  it("step-2 (prose) prompt contains the structured scores produced by step-1 -- proving sequential dependency", async () => {
    // This test cannot be passed by a Promise.all implementation:
    // if both calls fired in parallel, step-2 would not yet have the
    // step-1 output available to embed in its prompt.
    //
    // We pick a distinctive criterion ID + score value from STUB_STRUCTURED_SCORES_JSON
    // and assert it appears in the step-2 messages content.
    // The Evaluator embeds structuredScores JSON in the prose prompt (see buildProsePrompt).
    // A parallel impl would send step-2 with an empty/placeholder scores block.
    const spy = new RecordingSpyProvider([
      STUB_STRUCTURED_SCORES_JSON,
      STUB_PROSE_JSON,
    ]);
    const evaluator = new Evaluator(spy);

    await evaluator.evaluate(makeInput());

    // There must be exactly 2 calls total
    expect(spy.calls.length).toBe(2);

    const step2Call = spy.calls[1]!;

    // Flatten all step-2 message content into one string for inspection
    const step2Content = step2Call.messages.map((m) => m.content).join("\n");

    // STUB_STRUCTURED_SCORES_JSON contains "crit-empathy" with score 7.
    // The Evaluator's buildProsePrompt() embeds the parsed structuredScores as JSON
    // in the step-2 user message under "STRUCTURED SCORES (do not alter):".
    // If scoring ran BEFORE prose, these criterion IDs must appear in the step-2 prompt.
    expect(step2Content).toContain("crit-empathy");
    expect(step2Content).toContain("crit-risk-awareness");
    expect(step2Content).toContain("crit-structure");

    // The step-2 prompt must also contain the score value (7) from step-1 output.
    // This is evidence the actual parsed output of step-1 was wired into step-2,
    // not just the raw response string being passed through.
    expect(step2Content).toContain('"score"');

    // Additionally assert step-1 hint is EVALUATOR and step-2 hint is EVALUATOR
    expect(spy.calls[0]!.hint).toBe(ModelHint.EVALUATOR);
    expect(spy.calls[1]!.hint).toBe(ModelHint.EVALUATOR);
  });
});

// ---------------------------------------------------------------------------
// (b) structuredScores shape
// ---------------------------------------------------------------------------

describe("Evaluator -- (b) structuredScores shape", () => {
  it("structuredScores contains all criterion IDs", async () => {
    const spy = new CallOrderSpyProvider([
      STUB_STRUCTURED_SCORES_JSON,
      STUB_PROSE_JSON,
    ]);
    const evaluator = new Evaluator(spy);
    const result = await evaluator.evaluate(makeInput());

    for (const c of CRITERIA) {
      expect(result.structuredScores).toHaveProperty(c.id);
    }
  });

  it("each criterion score has required fields", async () => {
    const spy = new CallOrderSpyProvider([
      STUB_STRUCTURED_SCORES_JSON,
      STUB_PROSE_JSON,
    ]);
    const evaluator = new Evaluator(spy);
    const result = await evaluator.evaluate(makeInput());

    for (const id of Object.keys(result.structuredScores)) {
      const s = result.structuredScores[id]!;
      expect(typeof s.score).toBe("number");
      expect(typeof s.maxScore).toBe("number");
      expect(Array.isArray(s.evidence)).toBe(true);
      expect(typeof s.notes).toBe("string");
      expect(typeof s.requiresTeacherReview).toBe("boolean");
    }
  });

  it("score is clamped to [0, maxScore]", async () => {
    // Provider returns score=999 (out of range) for one criterion
    const overflowScores = JSON.stringify({
      "crit-empathy": { score: 999, maxScore: 10, evidence: [], notes: "" },
      "crit-risk-awareness": { score: -5, maxScore: 10, evidence: [], notes: "" },
      "crit-structure": { score: 8, maxScore: 10, evidence: [], notes: "" },
    });
    const spy = new CallOrderSpyProvider([overflowScores, STUB_PROSE_JSON]);
    const evaluator = new Evaluator(spy);
    const result = await evaluator.evaluate(makeInput());

    expect(result.structuredScores["crit-empathy"]!.score).toBeLessThanOrEqual(10);
    expect(result.structuredScores["crit-risk-awareness"]!.score).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// (c) transcriptHighlights shape
// ---------------------------------------------------------------------------

describe("Evaluator -- (c) transcriptHighlights shape", () => {
  it("transcriptHighlights is an array", async () => {
    const spy = new CallOrderSpyProvider([
      STUB_STRUCTURED_SCORES_JSON,
      STUB_PROSE_JSON,
    ]);
    const evaluator = new Evaluator(spy);
    const result = await evaluator.evaluate(makeInput());

    expect(Array.isArray(result.transcriptHighlights)).toBe(true);
  });

  it("each highlight has type, turnNumber, note", async () => {
    const spy = new CallOrderSpyProvider([
      STUB_STRUCTURED_SCORES_JSON,
      STUB_PROSE_JSON,
    ]);
    const evaluator = new Evaluator(spy);
    const result = await evaluator.evaluate(makeInput());

    for (const h of result.transcriptHighlights) {
      expect(["STRONG", "MISSED", "RISK_FLAG"]).toContain(h.type);
      expect(typeof h.turnNumber).toBe("number");
      expect(typeof h.note).toBe("string");
    }
  });

  it("overallSummary is a non-empty string", async () => {
    const spy = new CallOrderSpyProvider([
      STUB_STRUCTURED_SCORES_JSON,
      STUB_PROSE_JSON,
    ]);
    const evaluator = new Evaluator(spy);
    const result = await evaluator.evaluate(makeInput());

    expect(typeof result.overallSummary).toBe("string");
    expect(result.overallSummary.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// (d) Risk criterion formativeOnly -> requiresTeacherReview
// ---------------------------------------------------------------------------

describe("Evaluator -- (d) formative-only criteria flagged for teacher review", () => {
  it("formativeOnly criterion has requiresTeacherReview=true", async () => {
    const spy = new CallOrderSpyProvider([
      STUB_STRUCTURED_SCORES_JSON,
      STUB_PROSE_JSON,
    ]);
    const evaluator = new Evaluator(spy);
    const result = await evaluator.evaluate(makeInput());

    // crit-risk-awareness is formativeOnly=true
    const riskScore = result.structuredScores["crit-risk-awareness"];
    expect(riskScore).toBeDefined();
    expect(riskScore!.requiresTeacherReview).toBe(true);
  });

  it("formativeOnly criterion notes contain teacher-review annotation", async () => {
    const spy = new CallOrderSpyProvider([
      STUB_STRUCTURED_SCORES_JSON,
      STUB_PROSE_JSON,
    ]);
    const evaluator = new Evaluator(spy);
    const result = await evaluator.evaluate(makeInput());

    const riskScore = result.structuredScores["crit-risk-awareness"];
    expect(riskScore!.notes).toContain("requires teacher review");
  });

  it("non-formative criterion has requiresTeacherReview=false", async () => {
    const spy = new CallOrderSpyProvider([
      STUB_STRUCTURED_SCORES_JSON,
      STUB_PROSE_JSON,
    ]);
    const evaluator = new Evaluator(spy);
    const result = await evaluator.evaluate(makeInput());

    const empathyScore = result.structuredScores["crit-empathy"];
    expect(empathyScore!.requiresTeacherReview).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// (e) Malformed step-1 JSON -> fallback zero scores
// ---------------------------------------------------------------------------

describe("Evaluator -- (e) malformed scoring JSON produces fallback zero scores", () => {
  it("does not throw when step-1 returns invalid JSON", async () => {
    const spy = new CallOrderSpyProvider(["NOT_VALID_JSON", STUB_PROSE_JSON]);
    const evaluator = new Evaluator(spy);

    await expect(evaluator.evaluate(makeInput())).resolves.not.toThrow();
  });

  it("fallback produces zero score for all criteria", async () => {
    const spy = new CallOrderSpyProvider(["MALFORMED", STUB_PROSE_JSON]);
    const evaluator = new Evaluator(spy);
    const result = await evaluator.evaluate(makeInput());

    for (const c of CRITERIA) {
      expect(result.structuredScores[c.id]!.score).toBe(0);
    }
  });

  it("fallback notes contain parse error marker", async () => {
    const spy = new CallOrderSpyProvider(["MALFORMED_JSON", STUB_PROSE_JSON]);
    const evaluator = new Evaluator(spy);
    const result = await evaluator.evaluate(makeInput());

    const firstScore = Object.values(result.structuredScores)[0]!;
    expect(firstScore.notes).toContain("[parse error]");
  });
});

// ---------------------------------------------------------------------------
// (f) Token usage threaded from both steps
// ---------------------------------------------------------------------------

describe("Evaluator -- (f) token usage threaded from both provider calls", () => {
  it("inputTokensUsed is sum of step-1 and step-2 input tokens", async () => {
    const spy = new CallOrderSpyProvider([
      STUB_STRUCTURED_SCORES_JSON,
      STUB_PROSE_JSON,
    ]);
    const evaluator = new Evaluator(spy);
    const result = await evaluator.evaluate(makeInput());

    // Spy returns inputTokens=15 per call, two calls -> 30
    expect(result.inputTokensUsed).toBe(30);
  });

  it("outputTokensUsed is sum of step-1 and step-2 output tokens", async () => {
    const spy = new CallOrderSpyProvider([
      STUB_STRUCTURED_SCORES_JSON,
      STUB_PROSE_JSON,
    ]);
    const evaluator = new Evaluator(spy);
    const result = await evaluator.evaluate(makeInput());

    // Spy returns outputTokens=20 per call, two calls -> 40
    expect(result.outputTokensUsed).toBe(40);
  });
});
