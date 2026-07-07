"use strict";
// Persona Composer -- APS-REQ-029
// Pure deterministic function: no LLM call, no network.
// Composes a structured personaPrompt string from BuilderFields.
// Deterministic: same inputs always produce the same output.
// Decision: deterministic composer chosen over provider.complete because:
//   (a) testable without stub -- output is fully predictable
//   (b) no token cost
//   (c) the persona template structure is well-defined for pilot
Object.defineProperty(exports, "__esModule", { value: true });
exports.composePersonaPrompt = void 0;
// Mapping tables for human-readable labels
const STUDENT_LEVEL_LABELS = {
    year1: "first-year social work students",
    year2: "second-year social work students",
    year3: "third-year social work students",
    year4: "fourth-year social work students",
    intern: "interns",
    practitioner: "qualified practitioners",
};
const CHALLENGE_LEVEL_DESCRIPTORS = {
    1: "low challenge -- patient is open and cooperative",
    2: "moderate-low challenge -- patient shows mild resistance",
    3: "moderate challenge -- patient is ambivalent and may deflect",
    4: "moderate-high challenge -- patient is guarded with significant resistance",
    5: "high challenge -- patient is highly defensive and avoidant",
};
const RISK_LEVEL_DESCRIPTORS = {
    low: "no acute risk indicators in this scenario",
    medium: "potential risk cues may emerge; disclose only on appropriate clinical probing",
    high: "significant risk content is present; respond to explicit, sensitive inquiry",
};
/**
 * Compose a deterministic persona prompt from builder fields.
 * Returns a plain-text system prompt string suitable for SimulationTemplate.personaPrompt.
 */
function composePersonaPrompt(fields) {
    const { clinicalModel, studentLevel, primarySkill, secondarySkill, patientStyle, presentingProblem, hiddenIssue, riskLevel, challengeLevel, languages, mode, } = fields;
    const levelLabel = STUDENT_LEVEL_LABELS[studentLevel] ?? studentLevel;
    const challengeDesc = CHALLENGE_LEVEL_DESCRIPTORS[challengeLevel] ??
        `challenge level ${challengeLevel}`;
    const riskDesc = RISK_LEVEL_DESCRIPTORS[riskLevel] ?? `risk level: ${riskLevel}`;
    const skillLine = secondarySkill
        ? `Primary focus: ${primarySkill}. Secondary focus: ${secondarySkill}.`
        : `Primary focus: ${primarySkill}.`;
    const hiddenLine = hiddenIssue
        ? `\nHidden issue (do NOT volunteer; disclose only if appropriately probed): ${hiddenIssue}`
        : "";
    const langList = languages.join(", ");
    const lines = [
        `You are a simulated training patient in a ${clinicalModel} clinical scenario.`,
        `This session is a ${mode} encounter designed for ${levelLabel}.`,
        ``,
        `PRESENTING PROBLEM: ${presentingProblem}`,
        `${hiddenLine}`,
        ``,
        `INTERACTION STYLE: ${patientStyle}`,
        `CHALLENGE LEVEL: ${challengeDesc}`,
        `RISK PROFILE: ${riskDesc}`,
        ``,
        `${skillLine}`,
        `Respond only in the following languages: ${langList}.`,
        ``,
        `HARD RULES:`,
        `- Never invent clinical facts not established in your ground truth.`,
        `- Never escalate risk beyond the scenario boundaries.`,
        `- Respond in character at all times during the simulation.`,
        `- If asked directly whether you are real, redirect with character-appropriate deflection.`,
        `  Do NOT break character unless the hard off-ramp condition is triggered.`,
    ];
    // Filter blank lines caused by empty hiddenLine, normalise
    return lines.filter((l) => l !== undefined).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
exports.composePersonaPrompt = composePersonaPrompt;
//# sourceMappingURL=persona-composer.js.map