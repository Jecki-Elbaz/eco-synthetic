// ScriptedStubProvider -- returns pre-defined responses in sequence per ModelHint.
// Useful for deterministic test scenarios where specific patient text must be verified.
import type { LLMProvider, LLMRequest, LLMResponse } from "@aps/engine";
import { ModelHint } from "@aps/engine";

type Script = Partial<Record<ModelHint, string[]>>;

export class ScriptedStubProvider implements LLMProvider {
  private readonly script: Script;
  private readonly counters: Partial<Record<ModelHint, number>> = {};

  constructor(script: Script) {
    this.script = script;
  }

  async complete(req: LLMRequest): Promise<LLMResponse> {
    const lines = this.script[req.modelHint];
    if (!lines || lines.length === 0) {
      return {
        text: `[ScriptedStub: no script for ${req.modelHint}]`,
        inputTokens: 5,
        outputTokens: 5,
        modelId: `scripted-stub:${req.modelHint}`,
        cached: false,
      };
    }

    const idx = this.counters[req.modelHint] ?? 0;
    const text = lines[idx % lines.length] ?? "[ScriptedStub: out of script]";
    this.counters[req.modelHint] = idx + 1;

    return {
      text,
      inputTokens: 5,
      outputTokens: 5,
      modelId: `scripted-stub:${req.modelHint}`,
      cached: false,
    };
  }

  estimateCost(): number {
    return 0;
  }
}
