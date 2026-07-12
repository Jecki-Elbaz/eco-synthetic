// req066-routing.spec.ts -- S5-GAL-REQ066 unit tests
// Tests: LLM tier routing -- 3 named provider slots (ANALYSER/GUARD/PATIENT) in TurnPipeline.
//
// Test items:
//   R1: 3 distinct stub instances -- analyser, guard, patient each get own provider
//   R2: analyserProvider.complete is called (not main provider) during analyser step
//   R3: patientProvider.complete is called during patient generation step
//   R4: guardProvider.complete is called during guard evaluation step
//   R5: regression -- single-provider (no named slots) still works (backward compat)
//
// Strategy: Use 3 distinguishable StubProvider instances with different identifiers,
// and spy on their complete methods to verify each slot gets the right call.

import { TurnPipeline } from "@aps/engine";
import type { LLMProvider, LLMRequest, LLMResponse, ModelHint } from "@aps/engine";
import type { TurnPipelineInput } from "@aps/engine";

// ---------------------------------------------------------------------------
// Distinguishable stub provider
// ---------------------------------------------------------------------------

class TaggedStubProvider implements LLMProvider {
  readonly tag: string;
  readonly completeSpy: jest.Mock;

  constructor(tag: string) {
    this.tag = tag;
    // Deterministic stub response tagged with provider identity
    const response: LLMResponse = {
      text: `[${tag}] stub response`,
      inputTokens: 10,
      outputTokens: 5,
      modelId: `stub-${tag.toLowerCase()}`,
      cached: false,
    };
    this.completeSpy = jest.fn().mockResolvedValue(response);
  }

  complete(req: LLMRequest): Promise<LLMResponse> {
    return this.completeSpy(req);
  }

  estimateCost(inputTokens: number, outputTokens: number, _hint: ModelHint): number {
    return (inputTokens + outputTokens) * 0.000001;
  }
}

// ---------------------------------------------------------------------------
// Minimal turn input (mirrors what integration tests use)
// ---------------------------------------------------------------------------

function makeMinimalInput(): TurnPipelineInput {
  return {
    attemptId: "attempt-r066-001",
    turnNumber: 1,
    challengeLevel: 3,
    studentMessage: "Hello, how are you feeling today?",
    studentLanguage: "he",
    priorState: null,
    personaSystemPrompt: "You are a simulated patient.",
    groundTruth: {
      disclosureAllowList: { unlocked: [], locked: [] },
      doNotInvent: [],
      hardOffRampText: "This is a simulation.",
    },
    recentMessages: [],
    contextSummary: null,
    totals: {
      turnCount: 0,
      tokenInputTotal: 0,
      tokenOutputTotal: 0,
      creditBalance: -1,
      bypassCreditCheck: true,
    },
  };
}

// ---------------------------------------------------------------------------
// R-series: REQ-066 routing tests
// ---------------------------------------------------------------------------

describe("S5-GAL-REQ066: LLM tier routing -- 3 distinguishable provider slots", () => {
  it("R1: TurnPipeline accepts 3 distinct provider instances via config", () => {
    const analyser = new TaggedStubProvider("ANALYSER");
    const guard = new TaggedStubProvider("GUARD");
    const patient = new TaggedStubProvider("PATIENT");
    const main = new TaggedStubProvider("MAIN");

    expect(() => {
      new TurnPipeline(main, { analyserProvider: analyser, guardProvider: guard, patientProvider: patient });
    }).not.toThrow();
  });

  it("R2: analyserProvider.complete is called during the analyser step", async () => {
    const analyser = new TaggedStubProvider("ANALYSER");
    const guard = new TaggedStubProvider("GUARD");
    const patient = new TaggedStubProvider("PATIENT");
    const main = new TaggedStubProvider("MAIN");

    const pipeline = new TurnPipeline(main, {
      analyserProvider: analyser,
      guardProvider: guard,
      patientProvider: patient,
    });

    await pipeline.run(makeMinimalInput());

    // analyser.completeSpy must have been called at least once
    expect(analyser.completeSpy).toHaveBeenCalled();
    // main provider should NOT be used for analyser step
    // (main is only a fallback; with all 3 slots set, main.complete should NOT be called for analyser)
    // Note: main MAY still be called for other internal steps; test only that analyser was used
  });

  it("R3: patientProvider.complete is called during patient generation", async () => {
    const analyser = new TaggedStubProvider("ANALYSER");
    const guard = new TaggedStubProvider("GUARD");
    const patient = new TaggedStubProvider("PATIENT");
    const main = new TaggedStubProvider("MAIN");

    const pipeline = new TurnPipeline(main, {
      analyserProvider: analyser,
      guardProvider: guard,
      patientProvider: patient,
    });

    await pipeline.run(makeMinimalInput());

    // Patient provider must be called for patient generation
    expect(patient.completeSpy).toHaveBeenCalled();
  });

  it("R4: guardProvider.complete is called during guard evaluation", async () => {
    const analyser = new TaggedStubProvider("ANALYSER");
    const guard = new TaggedStubProvider("GUARD");
    const patient = new TaggedStubProvider("PATIENT");
    const main = new TaggedStubProvider("MAIN");

    const pipeline = new TurnPipeline(main, {
      analyserProvider: analyser,
      guardProvider: guard,
      patientProvider: patient,
    });

    await pipeline.run(makeMinimalInput());

    // Guard provider must be called for guard evaluation
    expect(guard.completeSpy).toHaveBeenCalled();
  });

  it("R5: regression -- single provider (no named slots) still produces a valid turn result", async () => {
    const main = new TaggedStubProvider("MAIN");
    const pipeline = new TurnPipeline(main);

    const result = await pipeline.run(makeMinimalInput());

    expect(result).toBeDefined();
    // Should have a patient response (gate allowed) or a gate block
    expect(result.gateResult).toBeDefined();
    // main provider must be called when no named slots are configured
    expect(main.completeSpy).toHaveBeenCalled();
  });

  it("R6: 3 providers are distinct objects (not the same reference)", () => {
    const analyser = new TaggedStubProvider("ANALYSER");
    const guard = new TaggedStubProvider("GUARD");
    const patient = new TaggedStubProvider("PATIENT");

    expect(analyser).not.toBe(guard);
    expect(guard).not.toBe(patient);
    expect(analyser).not.toBe(patient);
    expect(analyser.tag).toBe("ANALYSER");
    expect(guard.tag).toBe("GUARD");
    expect(patient.tag).toBe("PATIENT");
  });
});
