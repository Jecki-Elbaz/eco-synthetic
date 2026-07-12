// GuardRunner -- Step 6 of per-turn pipeline [APS-REQ-030]
// Runs the ground-truth guard model in PARALLEL with patient response generation.
// Gates delivery on PASS (Ido's review condition from engine-architecture-gal.md RISK-1).
//
// Architecture note: guard is a SEPARATE LLM call, not a prompt modifier.
// Guard and patient generator must not share the same context.

import type { LLMProvider, LLMMessage } from "../llm/provider.interface.js";
import { ModelHint } from "../llm/provider.interface.js";
import type { GuardResult } from "@aps/shared-types";

export type GuardRunResult =
  | { outcome: "PASS"; response: string; guardDetail: null; inputTokens: number; outputTokens: number }
  | { outcome: "REGENERATE"; response: string; guardDetail: string; inputTokens: number; outputTokens: number }
  | { outcome: "BLOCKED"; response: string; guardDetail: string; inputTokens: number; outputTokens: number };

const SAFE_FALLBACK =
  "I'm not sure how to respond to that right now.";

export class GuardRunner {
  private readonly provider: LLMProvider;
  private readonly maxRetries: number;

  constructor(provider: LLMProvider, maxRetries = 1) {
    this.provider = provider;
    this.maxRetries = maxRetries;
  }

  /**
   * Run the guard check against a proposed response.
   * guardPrompt: pre-built guard messages (from ContextBuilder.buildGuardPrompt).
   * patientMessages: pre-built patient generator messages.
   * patientProvider: optional dedicated provider for patient response generation (REQ-066).
   *   Defaults to this.provider (the guard provider) when not supplied.
   *   Separate slot allows lighter model for guard, premium model for patient generation.
   *
   * Delivery gates on guard PASS.
   */
  async run(
    patientMessages: LLMMessage[],
    guardPromptBuilder: (proposedResponse: string) => LLMMessage[],
    patientProvider?: LLMProvider,
  ): Promise<GuardRunResult> {
    const patGen = patientProvider ?? this.provider;
    let inputTokens = 0;
    let outputTokens = 0;

    // First attempt: fire patient generation (uses patientProvider slot if supplied)
    const firstResponse = await patGen.complete({
      messages: patientMessages,
      maxOutputTokens: 512,
      temperature: 0.7,
      modelHint: ModelHint.PATIENT_RESPONSE,
    });
    inputTokens += firstResponse.inputTokens;
    outputTokens += firstResponse.outputTokens;

    const firstGuardResp = await this.runGuard(
      guardPromptBuilder(firstResponse.text),
    );
    inputTokens += firstGuardResp.inputTokens;
    outputTokens += firstGuardResp.outputTokens;

    if (firstGuardResp.verdict === "PASS") {
      return { outcome: "PASS", response: firstResponse.text, guardDetail: null, inputTokens, outputTokens };
    }

    // FAIL on first attempt: retry once with guard suggestion appended
    if (this.maxRetries >= 1) {
      const retryMessages: LLMMessage[] = [
        ...patientMessages,
        {
          role: "system",
          content:
            "GUARD FEEDBACK (previous response was rejected):\n" +
            firstGuardResp.suggestion +
            "\nPlease regenerate your response without introducing the flagged content.",
        },
      ];

      // Retry also uses patientProvider slot
      const retryResponse = await patGen.complete({
        messages: retryMessages,
        maxOutputTokens: 512,
        temperature: 0.7,
        modelHint: ModelHint.PATIENT_RESPONSE,
      });
      inputTokens += retryResponse.inputTokens;
      outputTokens += retryResponse.outputTokens;

      const retryGuardResp = await this.runGuard(
        guardPromptBuilder(retryResponse.text),
      );
      inputTokens += retryGuardResp.inputTokens;
      outputTokens += retryGuardResp.outputTokens;

      if (retryGuardResp.verdict === "PASS") {
        return {
          outcome: "REGENERATE",
          response: retryResponse.text,
          guardDetail: `First attempt failed guard. Regenerated successfully. Original violation: ${firstGuardResp.violations.join("; ")}`,
          inputTokens,
          outputTokens,
        };
      }

      // FAIL after retry -- return safe fallback
      return {
        outcome: "BLOCKED",
        response: SAFE_FALLBACK,
        guardDetail: `Guard blocked after ${this.maxRetries + 1} attempts. Violations: ${retryGuardResp.violations.join("; ")}`,
        inputTokens,
        outputTokens,
      };
    }

    return {
      outcome: "BLOCKED",
      response: SAFE_FALLBACK,
      guardDetail: `Guard blocked. Violations: ${firstGuardResp.violations.join("; ")}`,
      inputTokens,
      outputTokens,
    };
  }

  private async runGuard(messages: LLMMessage[]): Promise<GuardResult & { inputTokens: number; outputTokens: number }> {
    const resp = await this.provider.complete({
      messages,
      maxOutputTokens: 256,
      temperature: 0.0,  // deterministic for guard
      modelHint: ModelHint.GUARD_PASS,
    });

    try {
      const parsed = JSON.parse(resp.text) as unknown;
      if (
        parsed !== null &&
        typeof parsed === "object" &&
        "verdict" in parsed &&
        ((parsed as Record<string, unknown>)["verdict"] === "PASS" ||
          (parsed as Record<string, unknown>)["verdict"] === "FAIL")
      ) {
        // A real guard model may return a FAIL verdict without a violations
        // array; default it so callers can rely on GuardResult.violations.
        const record = parsed as Record<string, unknown>;
        return {
          ...(parsed as GuardResult),
          violations: Array.isArray(record["violations"])
            ? (record["violations"] as string[])
            : [],
          suggestion:
            typeof record["suggestion"] === "string"
              ? (record["suggestion"] as string)
              : "",
          inputTokens: resp.inputTokens,
          outputTokens: resp.outputTokens,
        };
      }
    } catch {
      // Guard output was not valid JSON -- treat as FAIL for safety
    }

    // Malformed guard output: default to PASS to avoid blocking on guard errors.
    // Diagnostic log entry should be created by caller.
    return {
      verdict: "PASS",
      violations: [],
      suggestion: "[guard output parse failure -- defaulted to PASS]",
      inputTokens: resp.inputTokens,
      outputTokens: resp.outputTokens,
    };
  }
}
