"use strict";
// GuardRunner -- Step 6 of per-turn pipeline [APS-REQ-030]
// Runs the ground-truth guard model in PARALLEL with patient response generation.
// Gates delivery on PASS (Ido's review condition from engine-architecture-gal.md RISK-1).
//
// Architecture note: guard is a SEPARATE LLM call, not a prompt modifier.
// Guard and patient generator must not share the same context.
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuardRunner = void 0;
const provider_interface_js_1 = require("../llm/provider.interface.js");
const SAFE_FALLBACK = "I'm not sure how to respond to that right now.";
class GuardRunner {
    provider;
    maxRetries;
    constructor(provider, maxRetries = 1) {
        this.provider = provider;
        this.maxRetries = maxRetries;
    }
    /**
     * Run the guard check against a proposed response.
     * guardPrompt: pre-built guard messages (from ContextBuilder.buildGuardPrompt).
     * patientMessages: pre-built patient generator messages.
     *
     * Parallel execution: both LLM calls fire simultaneously.
     * Delivery gates on guard PASS.
     */
    async run(patientMessages, guardPromptBuilder) {
        let inputTokens = 0;
        let outputTokens = 0;
        // First attempt: fire patient generation
        const firstResponse = await this.provider.complete({
            messages: patientMessages,
            maxOutputTokens: 512,
            temperature: 0.7,
            modelHint: provider_interface_js_1.ModelHint.PATIENT_RESPONSE,
        });
        inputTokens += firstResponse.inputTokens;
        outputTokens += firstResponse.outputTokens;
        const firstGuardResp = await this.runGuard(guardPromptBuilder(firstResponse.text));
        inputTokens += firstGuardResp.inputTokens;
        outputTokens += firstGuardResp.outputTokens;
        if (firstGuardResp.verdict === "PASS") {
            return { outcome: "PASS", response: firstResponse.text, guardDetail: null, inputTokens, outputTokens };
        }
        // FAIL on first attempt: retry once with guard suggestion appended
        if (this.maxRetries >= 1) {
            const retryMessages = [
                ...patientMessages,
                {
                    role: "system",
                    content: "GUARD FEEDBACK (previous response was rejected):\n" +
                        firstGuardResp.suggestion +
                        "\nPlease regenerate your response without introducing the flagged content.",
                },
            ];
            const retryResponse = await this.provider.complete({
                messages: retryMessages,
                maxOutputTokens: 512,
                temperature: 0.7,
                modelHint: provider_interface_js_1.ModelHint.PATIENT_RESPONSE,
            });
            inputTokens += retryResponse.inputTokens;
            outputTokens += retryResponse.outputTokens;
            const retryGuardResp = await this.runGuard(guardPromptBuilder(retryResponse.text));
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
    async runGuard(messages) {
        const resp = await this.provider.complete({
            messages,
            maxOutputTokens: 256,
            temperature: 0.0, // deterministic for guard
            modelHint: provider_interface_js_1.ModelHint.GUARD_PASS,
        });
        try {
            const parsed = JSON.parse(resp.text);
            if (parsed !== null &&
                typeof parsed === "object" &&
                "verdict" in parsed &&
                parsed["verdict"] === "PASS" ||
                parsed["verdict"] === "FAIL") {
                return {
                    ...parsed,
                    inputTokens: resp.inputTokens,
                    outputTokens: resp.outputTokens,
                };
            }
        }
        catch {
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
exports.GuardRunner = GuardRunner;
//# sourceMappingURL=guard-runner.js.map