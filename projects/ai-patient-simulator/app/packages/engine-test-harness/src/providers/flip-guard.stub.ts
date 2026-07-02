// FlipGuardStubProvider -- returns FAIL on the first guard call, PASS on subsequent.
// Used to test the retry-and-regenerate path and the BLOCKED fallback path.
import type { LLMProvider, LLMRequest, LLMResponse } from "@aps/engine";
import { ModelHint } from "@aps/engine";

export class FlipGuardStubProvider implements LLMProvider {
  private guardCallCount = 0;
  private readonly failCount: number;

  constructor(failCount = 1) {
    this.failCount = failCount;
  }

  async complete(req: LLMRequest): Promise<LLMResponse> {
    if (req.modelHint === ModelHint.GUARD_PASS) {
      this.guardCallCount++;
      const verdict = this.guardCallCount <= this.failCount ? "FAIL" : "PASS";
      const body =
        verdict === "FAIL"
          ? JSON.stringify({
              verdict: "FAIL",
              violations: ["test-violation: invented fact XYZ"],
              suggestion: "Remove mention of XYZ",
            })
          : JSON.stringify({ verdict: "PASS", violations: [], suggestion: "" });

      return {
        text: body,
        inputTokens: 5,
        outputTokens: 5,
        modelId: `flip-guard-stub:${verdict}`,
        cached: false,
      };
    }

    return {
      text: `Stub ${req.modelHint} response`,
      inputTokens: 5,
      outputTokens: 5,
      modelId: `flip-guard-stub:${req.modelHint}`,
      cached: false,
    };
  }

  estimateCost(): number {
    return 0;
  }
}
