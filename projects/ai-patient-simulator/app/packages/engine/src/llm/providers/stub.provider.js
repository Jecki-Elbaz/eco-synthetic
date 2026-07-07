"use strict";
// StubProvider -- deterministic, no API calls, no network.
// Default provider for dev + CI. No API key needed.
// Selected when LLM_PROVIDER=stub (or absent).
// APS-004 gate must clear before any real provider is wired in.
Object.defineProperty(exports, "__esModule", { value: true });
exports.StubProvider = void 0;
const provider_interface_js_1 = require("../provider.interface.js");
// Deterministic guard stub -- always returns PASS for well-formed requests.
// In engine-test-harness, a FlipGuardStubProvider can return FAIL for testing.
const STUB_GUARD_PASS = {
    verdict: "PASS",
    violations: [],
    suggestion: "",
};
const STUB_RESPONSES = {
    [provider_interface_js_1.ModelHint.PATIENT_RESPONSE]: "Stub patient response: I'm not sure what to say. [STUB]",
    [provider_interface_js_1.ModelHint.GUARD_PASS]: JSON.stringify(STUB_GUARD_PASS),
    [provider_interface_js_1.ModelHint.ANALYSER]: JSON.stringify({
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
    [provider_interface_js_1.ModelHint.SUMMARISER]: "Stub summary: student and patient exchanged several turns. [STUB]",
    [provider_interface_js_1.ModelHint.EVALUATOR]: JSON.stringify({
        structuredScores: {},
        transcriptHighlights: [],
        overallSummary: "Stub evaluation. [STUB]",
    }),
    [provider_interface_js_1.ModelHint.DEBRIEF]: "Stub debrief response. [STUB]",
};
const STUB_TOKEN_COUNT = 10; // minimal token count for budget accounting in stubs
class StubProvider {
    async complete(req) {
        const text = STUB_RESPONSES[req.modelHint] ?? "[STUB fallback]";
        return {
            text,
            inputTokens: STUB_TOKEN_COUNT,
            outputTokens: STUB_TOKEN_COUNT,
            modelId: `stub:${req.modelHint}`,
            cached: false,
        };
    }
    estimateCost(_inputTokens, _outputTokens, _hint) {
        return 0; // stub has no cost
    }
}
exports.StubProvider = StubProvider;
//# sourceMappingURL=stub.provider.js.map