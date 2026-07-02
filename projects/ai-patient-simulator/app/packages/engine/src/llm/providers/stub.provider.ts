// StubProvider -- deterministic, no API calls, no network.
// Default provider for dev + CI. No API key needed.
// Selected when LLM_PROVIDER=stub (or absent).
// APS-004 gate must clear before any real provider is wired in.

import type { LLMProvider, LLMRequest, LLMResponse } from "../provider.interface.js";
import { ModelHint } from "../provider.interface.js";
import type { GuardResult } from "@aps/shared-types";

// Deterministic guard stub -- always returns PASS for well-formed requests.
// In engine-test-harness, a FlipGuardStubProvider can return FAIL for testing.
const STUB_GUARD_PASS: GuardResult = {
  verdict: "PASS",
  violations: [],
  suggestion: "",
};

const STUB_RESPONSES: Record<ModelHint, string> = {
  [ModelHint.PATIENT_RESPONSE]: "Stub patient response: I'm not sure what to say. [STUB]",
  [ModelHint.GUARD_PASS]: JSON.stringify(STUB_GUARD_PASS),
  [ModelHint.ANALYSER]: JSON.stringify({
    empathy: 0.5,
    questionType: "open",
    specificity: 0.5,
    validation: 0.4,
    actConsistency: 0.5,
    prematureAdvice: false,
    pressure: 0.2,
    missedCues: [],
    riskRelevance: false,
    therapeuticStance: "exploratory",
    turnLanguage: "he",
    rawClassification: "[STUB analyser output]",
  }),
  [ModelHint.SUMMARISER]: "Stub summary: student and patient exchanged several turns. [STUB]",
  [ModelHint.EVALUATOR]: JSON.stringify({
    structuredScores: {},
    transcriptHighlights: [],
    overallSummary: "Stub evaluation. [STUB]",
  }),
  [ModelHint.DEBRIEF]: "Stub debrief response. [STUB]",
};

const STUB_TOKEN_COUNT = 10; // minimal token count for budget accounting in stubs

export class StubProvider implements LLMProvider {
  async complete(req: LLMRequest): Promise<LLMResponse> {
    const text = STUB_RESPONSES[req.modelHint] ?? "[STUB fallback]";
    return {
      text,
      inputTokens: STUB_TOKEN_COUNT,
      outputTokens: STUB_TOKEN_COUNT,
      modelId: `stub:${req.modelHint}`,
      cached: false,
    };
  }

  estimateCost(_inputTokens: number, _outputTokens: number, _hint: ModelHint): number {
    return 0; // stub has no cost
  }
}
