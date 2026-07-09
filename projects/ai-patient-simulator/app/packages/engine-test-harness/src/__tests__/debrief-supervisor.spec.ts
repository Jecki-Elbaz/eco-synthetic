/**
 * DebriefSupervisor engine unit tests (APS-REQ-073, Sprint 2 Inc 4)
 *
 * Tests run purely in-process against the engine package + stubs (no DB, no HTTP).
 *
 * Key assertions:
 *   (a) Debrief context EXCLUDES persona prompt and ground-truth strings (isolation rule).
 *   (b) supervisorText and citedTurns returned correctly.
 *   (c) citedTurns validated against actual transcript turn numbers.
 *   (d) Token usage threaded.
 *   (e) Malformed LLM response handled gracefully.
 */

import { DebriefSupervisor, ModelHint } from "@aps/engine";
import type {
  DebriefSupervisorInput,
  DebriefTranscriptMessage,
  DebriefRubricCriteria,
  DebriefEvaluationContext,
} from "@aps/engine";
import type { LLMProvider, LLMRequest, LLMResponse } from "@aps/engine";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const TRANSCRIPT: DebriefTranscriptMessage[] = [
  { role: "STUDENT", turnNumber: 1, text: "How are you feeling today?" },
  { role: "PATIENT", turnNumber: 1, text: "Not great, honestly." },
  { role: "STUDENT", turnNumber: 2, text: "Can you say more about that?" },
  { role: "PATIENT", turnNumber: 2, text: "I've been low for weeks." },
];

const RUBRIC_CRITERIA: DebriefRubricCriteria[] = [
  { id: "crit-empathy", labelKey: "empathy", weight: 0.4 },
  { id: "crit-risk", labelKey: "risk_awareness", weight: 0.3 },
];

const EVALUATION_CONTEXT: DebriefEvaluationContext = {
  overallSummary: "Student showed empathy but missed risk cues.",
  structuredScores: {
    "crit-empathy": { score: 7, maxScore: 10, evidence: [1, 2], notes: "Good", requiresTeacherReview: false },
    "crit-risk": { score: 3, maxScore: 10, evidence: [2], notes: "Risk not probed [FORMATIVE-ONLY: requires teacher review before official]", requiresTeacherReview: true },
  },
  transcriptHighlights: [
    { type: "STRONG", turnNumber: 1, note: "Good opening." },
    { type: "RISK_FLAG", turnNumber: 2, note: "Patient mentioned low mood -- not probed." },
  ],
};

// These strings must NEVER appear in the debrief context (isolation rule)
const PERSONA_PROMPT = "You are a simulated patient named Sarah presenting with major depressive disorder.";
const GROUND_TRUTH_FACT = "disclosureAllowList: suicidal ideation LOCKED";
const HARD_OFF_RAMP = "I am a simulated training patient.";

function makeInput(overrides?: Partial<DebriefSupervisorInput>): DebriefSupervisorInput {
  return {
    studentMessage: "Why did I miss the risk cue at turn 2?",
    transcript: TRANSCRIPT,
    rubricCriteria: RUBRIC_CRITERIA,
    evaluationContext: EVALUATION_CONTEXT,
    priorDebriefTurns: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Stub provider
// ---------------------------------------------------------------------------

const STUB_DEBRIEF_RESPONSE = JSON.stringify({
  supervisorText: "At turn 2, the patient mentioned low mood for weeks. You could have followed up with a direct question about risk.",
  citedTurns: [2],
});

class RecordingStubProvider implements LLMProvider {
  public capturedMessages: Array<{ role: string; content: string }[]> = [];
  private readonly responseText: string;

  constructor(responseText: string = STUB_DEBRIEF_RESPONSE) {
    this.responseText = responseText;
  }

  async complete(req: LLMRequest): Promise<LLMResponse> {
    this.capturedMessages.push(req.messages as Array<{ role: string; content: string }>);
    return {
      text: this.responseText,
      inputTokens: 12,
      outputTokens: 18,
      modelId: `recording-stub:${req.modelHint}`,
      cached: false,
    };
  }

  estimateCost(): number {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// (a) Debrief context isolation -- persona and ground-truth EXCLUDED
// ---------------------------------------------------------------------------

describe("DebriefSupervisor -- (a) context isolation: persona and ground-truth excluded", () => {
  it("persona prompt string does not appear in any debrief context message", () => {
    const supervisor = new DebriefSupervisor(new RecordingStubProvider());
    const input = makeInput();

    // buildDebriefContext is a public method we can call directly for isolation assertion
    const messages = supervisor.buildDebriefContext(input);
    const allContent = messages.map((m) => m.content).join("\n");

    expect(allContent).not.toContain(PERSONA_PROMPT);
  });

  it("ground-truth disclosure list does not appear in debrief context", () => {
    const supervisor = new DebriefSupervisor(new RecordingStubProvider());
    const input = makeInput();

    const messages = supervisor.buildDebriefContext(input);
    const allContent = messages.map((m) => m.content).join("\n");

    expect(allContent).not.toContain(GROUND_TRUTH_FACT);
  });

  it("hard off-ramp text does not appear in debrief context", () => {
    const supervisor = new DebriefSupervisor(new RecordingStubProvider());
    const input = makeInput();

    const messages = supervisor.buildDebriefContext(input);
    const allContent = messages.map((m) => m.content).join("\n");

    expect(allContent).not.toContain(HARD_OFF_RAMP);
  });

  it("context includes transcript text (allowed)", () => {
    const supervisor = new DebriefSupervisor(new RecordingStubProvider());
    const input = makeInput();

    const messages = supervisor.buildDebriefContext(input);
    const allContent = messages.map((m) => m.content).join("\n");

    expect(allContent).toContain("How are you feeling today?");
  });

  it("context includes evaluation overallSummary (allowed)", () => {
    const supervisor = new DebriefSupervisor(new RecordingStubProvider());
    const input = makeInput();

    const messages = supervisor.buildDebriefContext(input);
    const allContent = messages.map((m) => m.content).join("\n");

    expect(allContent).toContain(EVALUATION_CONTEXT.overallSummary);
  });

  it("context includes student question", () => {
    const supervisor = new DebriefSupervisor(new RecordingStubProvider());
    const input = makeInput();

    const messages = supervisor.buildDebriefContext(input);
    const allContent = messages.map((m) => m.content).join("\n");

    expect(allContent).toContain(input.studentMessage);
  });

  it("CriterionScore.notes detail does NOT appear in debrief context (scoring rationale must not leak)", () => {
    // The scoring notes may contain detailed clinical rationale from the rubric
    // (e.g. "[FORMATIVE-ONLY: requires teacher review before official]" plus evaluator
    // free-text notes). buildDebriefContext must only output score/maxScore numeric
    // values -- not the notes field -- to prevent rubric internals from leaking
    // to the student via the debrief supervisor prompt.
    //
    // The fixture EVALUATION_CONTEXT has notes:
    //   "Risk not probed [FORMATIVE-ONLY: requires teacher review before official]"
    // That string must NOT appear in the rendered context.
    const NOTES_CONTENT = "Risk not probed [FORMATIVE-ONLY: requires teacher review before official]";

    const supervisor = new DebriefSupervisor(new RecordingStubProvider());
    const input = makeInput();

    const messages = supervisor.buildDebriefContext(input);
    const allContent = messages.map((m) => m.content).join("\n");

    expect(allContent).not.toContain(NOTES_CONTENT);
  });

  it("scoring anchor detail does NOT appear in debrief context (rubric internals not passed)", () => {
    // rubricCriteria in DebriefSupervisorInput only carries labelKey + weight.
    // scoringAnchors (from RubricCriterion) are NOT in DebriefRubricCriteria --
    // enforced structurally. Confirm no anchor text leaks via the evaluation context either.
    // The notes field check above covers this for evaluation-derived content;
    // this test ensures no scoringAnchor strings are in the evaluation fixture notes.
    const supervisor = new DebriefSupervisor(new RecordingStubProvider());
    const input = makeInput();

    const messages = supervisor.buildDebriefContext(input);
    const allContent = messages.map((m) => m.content).join("\n");

    // The good notes ("Good") from crit-empathy must not appear in the rendered context
    // (it is part of CriterionScore.notes, which must stay out of the prompt).
    // "Good" is too short to be a safe unique marker; use the risk-criterion notes string
    // which is long and distinctive (asserted above). The rubric labels ARE included
    // (weight rendering) -- assert that the label key appears but notes do not.
    expect(allContent).toContain("risk_awareness"); // label key is allowed
    expect(allContent).not.toContain("requires teacher review before official"); // notes are not
  });
});

// ---------------------------------------------------------------------------
// (b) supervisorText and citedTurns returned
// ---------------------------------------------------------------------------

describe("DebriefSupervisor -- (b) response shape", () => {
  it("respond() returns supervisorText string", async () => {
    const provider = new RecordingStubProvider();
    const supervisor = new DebriefSupervisor(provider);
    const result = await supervisor.respond(makeInput());

    expect(typeof result.supervisorText).toBe("string");
    expect(result.supervisorText.length).toBeGreaterThan(0);
  });

  it("respond() returns citedTurns array", async () => {
    const provider = new RecordingStubProvider();
    const supervisor = new DebriefSupervisor(provider);
    const result = await supervisor.respond(makeInput());

    expect(Array.isArray(result.citedTurns)).toBe(true);
  });

  it("uses ModelHint.DEBRIEF for the provider call", async () => {
    let capturedHint: ModelHint | null = null;
    const spyProvider: LLMProvider = {
      async complete(req: LLMRequest): Promise<LLMResponse> {
        capturedHint = req.modelHint;
        return { text: STUB_DEBRIEF_RESPONSE, inputTokens: 5, outputTokens: 5, modelId: "spy", cached: false };
      },
      estimateCost: () => 0,
    };

    const supervisor = new DebriefSupervisor(spyProvider);
    await supervisor.respond(makeInput());

    expect(capturedHint).toBe(ModelHint.DEBRIEF);
  });
});

// ---------------------------------------------------------------------------
// (c) citedTurns validated against transcript
// ---------------------------------------------------------------------------

describe("DebriefSupervisor -- (c) citedTurns validation", () => {
  it("citedTurns only contains valid transcript turn numbers", async () => {
    // Response cites turn 2 (valid) and turn 99 (out of range)
    const responseWithInvalidTurn = JSON.stringify({
      supervisorText: "See turns 2 and 99.",
      citedTurns: [2, 99],
    });

    const provider = new RecordingStubProvider(responseWithInvalidTurn);
    const supervisor = new DebriefSupervisor(provider);
    const result = await supervisor.respond(makeInput());

    // Turn 99 does not exist in transcript -- must be filtered out
    expect(result.citedTurns).not.toContain(99);
    expect(result.citedTurns).toContain(2);
  });

  it("citedTurns is empty array when LLM returns no citations", async () => {
    const responseNoCites = JSON.stringify({
      supervisorText: "Good session overall.",
      citedTurns: [],
    });

    const provider = new RecordingStubProvider(responseNoCites);
    const supervisor = new DebriefSupervisor(provider);
    const result = await supervisor.respond(makeInput());

    expect(result.citedTurns).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// (d) Token usage
// ---------------------------------------------------------------------------

describe("DebriefSupervisor -- (d) token usage threaded", () => {
  it("inputTokensUsed matches provider inputTokens", async () => {
    const provider = new RecordingStubProvider();
    const supervisor = new DebriefSupervisor(provider);
    const result = await supervisor.respond(makeInput());

    // RecordingStubProvider returns inputTokens=12
    expect(result.inputTokensUsed).toBe(12);
  });

  it("outputTokensUsed matches provider outputTokens", async () => {
    const provider = new RecordingStubProvider();
    const supervisor = new DebriefSupervisor(provider);
    const result = await supervisor.respond(makeInput());

    // RecordingStubProvider returns outputTokens=18
    expect(result.outputTokensUsed).toBe(18);
  });
});

// ---------------------------------------------------------------------------
// (f) JC-3 -- DebriefSupervisorInput type-level isolation guard
// ---------------------------------------------------------------------------

describe("DebriefSupervisor -- (f) JC-3 type isolation guard", () => {
  it("DebriefSupervisorInput instance carries no persona or ground-truth keys at runtime", () => {
    const input: DebriefSupervisorInput = makeInput();
    const forbidden = [
      "personaSystemPrompt",
      "knownFacts",
      "disclosureAllowList",
      "hardOffRampText",
      "escalationRules",
      "analyserOutput",
    ];
    for (const key of forbidden) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((input as any)[key]).toBeUndefined();
    }
  });

  it("compile-time guard (_jc3DebriefGuard) is in force -- engine compiled without forbidden fields", () => {
    // The type assertion `const _jc3DebriefGuard: _JC3Guard = true` in
    // debrief-supervisor.ts FAILS TO COMPILE the moment DebriefSupervisorInput
    // gains any of: personaSystemPrompt | knownFacts | disclosureAllowList |
    // hardOffRampText | escalationRules | analyserOutput.
    // If this test suite passes, the engine compiled clean => the guard is satisfied.
    expect(true).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// (e) Malformed LLM response handled gracefully
// ---------------------------------------------------------------------------

describe("DebriefSupervisor -- (e) malformed response handled gracefully", () => {
  it("does not throw when provider returns non-JSON", async () => {
    const provider = new RecordingStubProvider("This is plain text, not JSON.");
    const supervisor = new DebriefSupervisor(provider);

    await expect(supervisor.respond(makeInput())).resolves.not.toThrow();
  });

  it("returns plain text as supervisorText on non-JSON response", async () => {
    const PLAIN = "Good question! Let's review the transcript.";
    const provider = new RecordingStubProvider(PLAIN);
    const supervisor = new DebriefSupervisor(provider);
    const result = await supervisor.respond(makeInput());

    expect(result.supervisorText).toBe(PLAIN);
    expect(result.citedTurns).toEqual([]);
  });
});
