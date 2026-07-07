"use strict";
// Evaluator -- post-simulation structured scoring + language generation.
// APS-REQ-068/069/070/071/072
//
// Two-step ordering enforced structurally:
//   Step 1: EVALUATOR call -> structuredScores (JSON)
//   Step 2: EVALUATOR call -> prose (overallSummary + transcriptHighlights)
// Step 2 never starts before step 1 resolves (sequential awaits).
// Engine is pure TS -- no @aps/db imports.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Evaluator = void 0;
const provider_interface_js_1 = require("../llm/provider.interface.js");
// ---------------------------------------------------------------------------
// Evaluator class
// ---------------------------------------------------------------------------
class Evaluator {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    /**
     * Run two-step evaluation.
     * Step 1 MUST complete before step 2 begins -- sequential awaits enforce this.
     * Callers can assert ordering via a spy that records call sequence.
     */
    async evaluate(input) {
        let inputTokensUsed = 0;
        let outputTokensUsed = 0;
        // ---------------------------------------------------------------------------
        // STEP 1: Structured scoring (JSON)
        // Produces per-criterion scores BEFORE any language generation.
        // ---------------------------------------------------------------------------
        const step1Messages = this.buildScoringPrompt(input);
        const step1Response = await this.provider.complete({
            messages: step1Messages,
            maxOutputTokens: 800,
            temperature: 0.0,
            modelHint: provider_interface_js_1.ModelHint.EVALUATOR,
        });
        inputTokensUsed += step1Response.inputTokens;
        outputTokensUsed += step1Response.outputTokens;
        // Parse step 1 output
        const structuredScores = this.parseStructuredScores(step1Response.text, input.rubricCriteria);
        // ---------------------------------------------------------------------------
        // STEP 2: Language / prose generation
        // Uses step 1 scores as context -- score drift prevented because scores are
        // already fixed before this call executes.
        // ---------------------------------------------------------------------------
        const step2Messages = this.buildProsePrompt(input, structuredScores);
        const step2Response = await this.provider.complete({
            messages: step2Messages,
            maxOutputTokens: 600,
            temperature: 0.2,
            modelHint: provider_interface_js_1.ModelHint.EVALUATOR,
        });
        inputTokensUsed += step2Response.inputTokens;
        outputTokensUsed += step2Response.outputTokens;
        // Parse step 2 output
        const { overallSummary, transcriptHighlights } = this.parseProseOutput(step2Response.text, input.transcript);
        return {
            structuredScores,
            transcriptHighlights,
            overallSummary,
            inputTokensUsed,
            outputTokensUsed,
        };
    }
    // ---------------------------------------------------------------------------
    // Prompt builders
    // ---------------------------------------------------------------------------
    buildScoringPrompt(input) {
        const criteriaBlock = input.rubricCriteria
            .map((c) => `  criterionId: ${c.id}\n` +
            `  weight: ${c.weight}\n` +
            `  maxScore: ${c.maxScore}\n` +
            `  formativeOnly: ${c.formativeOnly}\n` +
            `  scoringAnchors: ${JSON.stringify(c.scoringAnchors)}`)
            .join("\n\n");
        const transcriptBlock = input.transcript
            .map((m) => `[Turn ${m.turnNumber} ${m.role}]: ${m.text}`)
            .join("\n");
        const analyserBlock = input.analyserOutputs
            .map((a) => `[Turn ${a.turnNumber}]: ${JSON.stringify(a.output)}`)
            .join("\n");
        return [
            {
                role: "system",
                content: [
                    "You are a clinical simulation evaluator. Your task is ONLY to produce structured scores.",
                    "Return ONLY valid JSON matching this schema, no prose:",
                    '{ "criterionId": { "score": number, "maxScore": number, "evidence": number[], "notes": string } }',
                    "score must be between 0 and maxScore. evidence is a list of turn numbers.",
                    "Do not generate summaries or highlight text in this step.",
                ].join(" "),
            },
            {
                role: "user",
                content: [
                    "RUBRIC CRITERIA:",
                    criteriaBlock,
                    "",
                    "TRANSCRIPT:",
                    transcriptBlock,
                    "",
                    "PER-TURN ANALYSER OUTPUTS:",
                    analyserBlock,
                ].join("\n"),
            },
        ];
    }
    buildProsePrompt(input, scores) {
        const scoresBlock = JSON.stringify(scores, null, 2);
        const transcriptBlock = input.transcript
            .map((m) => `[Turn ${m.turnNumber} ${m.role}]: ${m.text}`)
            .join("\n");
        return [
            {
                role: "system",
                content: [
                    "You are a clinical simulation evaluator. The structured scores are already fixed (provided below).",
                    "Your task is ONLY to produce the narrative summary and transcript highlights.",
                    "Do NOT change any scores. Return ONLY valid JSON:",
                    '{',
                    '  "overallSummary": string,',
                    '  "transcriptHighlights": [{ "type": "STRONG"|"MISSED"|"RISK_FLAG", "turnNumber": number, "note": string }]',
                    '}',
                    "RISK_FLAG highlights must be cited with specific turn numbers.",
                ].join(" "),
            },
            {
                role: "user",
                content: [
                    "STRUCTURED SCORES (do not alter):",
                    scoresBlock,
                    "",
                    "TRANSCRIPT:",
                    transcriptBlock,
                ].join("\n"),
            },
        ];
    }
    // ---------------------------------------------------------------------------
    // Parsers
    // ---------------------------------------------------------------------------
    parseStructuredScores(rawText, criteria) {
        const formativeIds = new Set(criteria.filter((c) => c.formativeOnly).map((c) => c.id));
        const maxScoreById = new Map(criteria.map((c) => [c.id, c.maxScore]));
        let parsed = {};
        try {
            parsed = JSON.parse(rawText);
        }
        catch {
            // Malformed -- return zero scores for all criteria
            const fallback = {};
            for (const c of criteria) {
                fallback[c.id] = {
                    score: 0,
                    maxScore: c.maxScore,
                    evidence: [],
                    notes: "[parse error] " + rawText.slice(0, 120),
                    requiresTeacherReview: c.formativeOnly,
                };
            }
            return fallback;
        }
        const scores = {};
        for (const c of criteria) {
            const raw = parsed[c.id] ?? {};
            const maxScore = maxScoreById.get(c.id) ?? c.maxScore;
            const score = typeof raw.score === "number"
                ? Math.min(Math.max(raw.score, 0), maxScore)
                : 0;
            const evidence = Array.isArray(raw.evidence)
                ? raw.evidence.filter((v) => typeof v === "number")
                : [];
            const notes = typeof raw.notes === "string" ? raw.notes : "";
            const isFormative = formativeIds.has(c.id);
            scores[c.id] = {
                score,
                maxScore,
                evidence,
                notes: isFormative
                    ? notes + (notes ? " " : "") + "[FORMATIVE-ONLY: requires teacher review before official]"
                    : notes,
                requiresTeacherReview: isFormative,
            };
        }
        return scores;
    }
    parseProseOutput(rawText, transcript) {
        const validTurnNumbers = new Set(transcript.map((m) => m.turnNumber));
        let parsed = {};
        try {
            parsed = JSON.parse(rawText);
        }
        catch {
            // Graceful fallback
            return {
                overallSummary: rawText.slice(0, 500) || "[evaluation summary unavailable]",
                transcriptHighlights: [],
            };
        }
        const overallSummary = typeof parsed.overallSummary === "string" && parsed.overallSummary
            ? parsed.overallSummary
            : "[evaluation summary unavailable]";
        const rawHighlights = Array.isArray(parsed.transcriptHighlights)
            ? parsed.transcriptHighlights
            : [];
        const transcriptHighlights = rawHighlights
            .filter((h) => h !== null && typeof h === "object")
            .map((h) => {
            const type = h.type === "STRONG" || h.type === "MISSED" || h.type === "RISK_FLAG"
                ? h.type
                : "MISSED";
            const turnNumber = typeof h.turnNumber === "number" && validTurnNumbers.has(h.turnNumber)
                ? h.turnNumber
                : (transcript[0]?.turnNumber ?? 1);
            const note = typeof h.note === "string" ? h.note : "";
            return { type, turnNumber, note };
        });
        return { overallSummary, transcriptHighlights };
    }
}
exports.Evaluator = Evaluator;
//# sourceMappingURL=evaluator.js.map