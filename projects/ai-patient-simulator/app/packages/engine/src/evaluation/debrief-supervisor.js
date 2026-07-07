"use strict";
// DebriefSupervisor -- guardrailed educational supervisor for post-simulation debrief.
// APS-REQ-073
//
// ISOLATION RULE (enforced structurally):
// The debrief supervisor receives ONLY:
//   - transcript messages
//   - rubric criteria (no scoring anchors detail -- just labels + weights)
//   - evaluation summary (overallSummary + transcriptHighlights + structuredScores)
//
// It MUST NOT receive:
//   - patient persona prompt (personaSystemPrompt)
//   - ground truth (knownFacts, disclosureAllowList, hardOffRampText)
//   - PatientStateLog / analyserOutput entries
//
// The buildDebriefContext() method is the structural enforcement point.
// Tests assert the context messages do not contain persona/ground-truth strings.
//
// Engine is pure TS -- no @aps/db imports.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebriefSupervisor = void 0;
const provider_interface_js_1 = require("../llm/provider.interface.js");
// ---------------------------------------------------------------------------
// DebriefSupervisor class
// ---------------------------------------------------------------------------
class DebriefSupervisor {
    provider;
    constructor(provider) {
        this.provider = provider;
    }
    /**
     * Generate one supervisor response.
     * Context is built via buildDebriefContext() which structurally EXCLUDES
     * persona prompt, ground truth, and PatientStateLog.
     */
    async respond(input) {
        const messages = this.buildDebriefContext(input);
        const response = await this.provider.complete({
            messages,
            maxOutputTokens: 400,
            temperature: 0.3,
            modelHint: provider_interface_js_1.ModelHint.DEBRIEF,
        });
        const { supervisorText, citedTurns } = this.parseDebriefResponse(response.text, input.transcript);
        return {
            supervisorText,
            citedTurns,
            inputTokensUsed: response.inputTokens,
            outputTokensUsed: response.outputTokens,
        };
    }
    /**
     * Build the prompt context for the debrief supervisor.
     *
     * STRUCTURAL ISOLATION: this method only incorporates:
     *   - transcript text
     *   - rubric criteria labels/weights (NOT scoringAnchors which contain clinical ground-truth detail)
     *   - evaluation summary (scores + highlights + overallSummary)
     *   - prior debrief conversation
     *   - the student's current message
     *
     * Persona prompt, ground-truth disclosure lists, and PatientStateLog analyserOutput
     * are NOT parameters here and are never passed in -- isolation is enforced by type.
     *
     * Note: this method is intentionally exported-accessible so tests can invoke it
     * directly and assert the returned messages contain no persona/ground-truth content.
     */
    buildDebriefContext(input) {
        const rubricBlock = input.rubricCriteria
            .map((c) => `  ${c.labelKey} (weight: ${c.weight})`)
            .join("\n");
        const transcriptBlock = input.transcript
            .map((m) => `[Turn ${m.turnNumber} ${m.role}]: ${m.text}`)
            .join("\n");
        const scoresBlock = Object.entries(input.evaluationContext.structuredScores)
            .map(([id, s]) => `  ${id}: ${s.score}/${s.maxScore}` +
            (s.requiresTeacherReview ? " [formative-only]" : ""))
            .join("\n");
        const highlightsBlock = input.evaluationContext.transcriptHighlights
            .map((h) => `  [Turn ${h.turnNumber}] ${h.type}: ${h.note}`)
            .join("\n");
        const historyBlock = input.priorDebriefTurns
            .map((t) => `${t.role}: ${t.text}`)
            .join("\n");
        const systemPrompt = [
            "You are an educational supervisor providing formative feedback on a simulated therapy session.",
            "You are NOT the patient and you CANNOT change any official grade.",
            "Your role is purely educational: help the student reflect on their practice.",
            "Respond with JSON: { \"supervisorText\": string, \"citedTurns\": number[] }",
            "citedTurns must reference actual turn numbers from the transcript.",
            "Do not invent clinical details not present in the transcript or evaluation.",
            "Do not reveal any internal rubric scoring anchors or ground-truth information beyond what is in the evaluation summary.",
        ].join(" ");
        const userContent = [
            "RUBRIC CRITERIA:",
            rubricBlock,
            "",
            "OVERALL EVALUATION SUMMARY:",
            input.evaluationContext.overallSummary,
            "",
            "STRUCTURED SCORES:",
            scoresBlock,
            "",
            "TRANSCRIPT HIGHLIGHTS:",
            highlightsBlock,
            "",
            "SESSION TRANSCRIPT:",
            transcriptBlock,
            "",
            "PRIOR DEBRIEF CONVERSATION:",
            historyBlock || "(no prior turns)",
            "",
            "STUDENT QUESTION:",
            input.studentMessage,
        ].join("\n");
        return [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
        ];
    }
    // ---------------------------------------------------------------------------
    // Parser
    // ---------------------------------------------------------------------------
    parseDebriefResponse(rawText, transcript) {
        const validTurnNumbers = new Set(transcript.map((m) => m.turnNumber));
        let parsed = {};
        try {
            parsed = JSON.parse(rawText);
        }
        catch {
            // Graceful fallback -- treat entire response as supervisor text
            return {
                supervisorText: rawText || "[No response generated]",
                citedTurns: [],
            };
        }
        const supervisorText = typeof parsed.supervisorText === "string" && parsed.supervisorText
            ? parsed.supervisorText
            : "[No response generated]";
        const rawCited = Array.isArray(parsed.citedTurns) ? parsed.citedTurns : [];
        const citedTurns = rawCited
            .filter((v) => typeof v === "number" && validTurnNumbers.has(v));
        return { supervisorText, citedTurns };
    }
}
exports.DebriefSupervisor = DebriefSupervisor;
//# sourceMappingURL=debrief-supervisor.js.map