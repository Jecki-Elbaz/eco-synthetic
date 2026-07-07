"use strict";
// Rubric Generator -- APS-REQ-039/040/041/042
// Deterministic: generates a DRAFT RubricVersion criteria set from BuilderFields.
// No LLM call. Criteria set is pilot-minimal and covers the standard competency
// dimensions; competencyId is mapped via the COMPETENCY_MAP constant.
//
// Design notes:
//   - formativeOnly=true is set on the risk-awareness criterion (Sami req, APS-REQ-039).
//   - scoringAnchors follow a 0/1/2/3/4 scale (maxScore=4) for most criteria.
//   - weights sum to 1.0 across the standard set; risk criterion weight is 0 in summative
//     scoring because formativeOnly=true means it is excluded from grade computation.
//   - competencyId values are placeholder IDs matching the seed competency externalKeys
//     expected in the pilot competency library. If the competency does not exist in the
//     DB at runtime, Prisma will reject the FK -- the service layer handles this by
//     setting competencyId=null when no matching competency record is found.
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRubricCriteria = exports.COMPETENCY_EXTERNAL_KEYS = void 0;
// Competency external-key -> placeholder competencyId token
// These are matched at the service layer against live Competency rows.
exports.COMPETENCY_EXTERNAL_KEYS = {
    empathy: "COMP-EMPATHY-001",
    active_listening: "COMP-LISTEN-001",
    risk_assessment: "COMP-RISK-001",
    clinical_reasoning: "COMP-CLINICAL-001",
    therapeutic_alliance: "COMP-ALLIANCE-001",
    communication: "COMP-COMM-001",
};
// Base criterion set for all templates.
// Weights on summative criteria sum to 1.0 (risk criterion excluded from sum, formativeOnly).
const BASE_CRITERIA = [
    {
        labelKey: "empathy",
        labelsHe: "אמפתיה",
        labelsEn: "Empathy",
        weight: 0.25,
        maxScore: 4,
        scoringAnchors: [
            { score: 0, label: "No empathic response observed" },
            { score: 1, label: "Minimal acknowledgement; mostly procedural" },
            { score: 2, label: "Some empathic statements; inconsistent" },
            { score: 3, label: "Consistent empathic presence; patient feels heard" },
            { score: 4, label: "Skilled empathic attunement throughout the session" },
        ],
        competencyKey: "empathy",
        formativeOnly: false,
    },
    {
        labelKey: "active_listening",
        labelsHe: "הקשבה פעילה",
        labelsEn: "Active Listening",
        weight: 0.20,
        maxScore: 4,
        scoringAnchors: [
            { score: 0, label: "Interrupts or ignores patient narrative" },
            { score: 1, label: "Listens passively; rarely reflects back" },
            { score: 2, label: "Reflects content but misses affect" },
            { score: 3, label: "Reflects content and affect accurately" },
            { score: 4, label: "Deep reflective listening; tracks implicit meanings" },
        ],
        competencyKey: "active_listening",
        formativeOnly: false,
    },
    {
        labelKey: "therapeutic_alliance",
        labelsHe: "ברית טיפולית",
        labelsEn: "Therapeutic Alliance",
        weight: 0.20,
        maxScore: 4,
        scoringAnchors: [
            { score: 0, label: "Patient disengages; no rapport established" },
            { score: 1, label: "Weak rapport; patient remains guarded" },
            { score: 2, label: "Moderate rapport; patient opens partially" },
            { score: 3, label: "Good working alliance; patient engaged" },
            { score: 4, label: "Strong collaborative alliance maintained throughout" },
        ],
        competencyKey: "therapeutic_alliance",
        formativeOnly: false,
    },
    {
        labelKey: "clinical_reasoning",
        labelsHe: "חשיבה קלינית",
        labelsEn: "Clinical Reasoning",
        weight: 0.20,
        maxScore: 4,
        scoringAnchors: [
            { score: 0, label: "Formulaic; no clinical hypothesis evident" },
            { score: 1, label: "Basic hypothesis; not adjusted to patient cues" },
            { score: 2, label: "Working hypothesis; some adjustment to new information" },
            { score: 3, label: "Dynamic reasoning; formulation updated appropriately" },
            { score: 4, label: "Sophisticated, flexible clinical reasoning throughout" },
        ],
        competencyKey: "clinical_reasoning",
        formativeOnly: false,
    },
    {
        labelKey: "communication",
        labelsHe: "תקשורת מקצועית",
        labelsEn: "Professional Communication",
        weight: 0.15,
        maxScore: 4,
        scoringAnchors: [
            { score: 0, label: "Jargon-heavy or unclear language" },
            { score: 1, label: "Mostly clear; occasional jargon or confusion" },
            { score: 2, label: "Clear language; appropriate pacing" },
            { score: 3, label: "Consistently clear, warm, professional tone" },
            { score: 4, label: "Exemplary professional communication throughout" },
        ],
        competencyKey: "communication",
        formativeOnly: false,
    },
    // Risk-awareness criterion: formativeOnly=true per Sami (APS-REQ-039).
    // Weight is non-zero in terms of feedback but excluded from summative grade by formativeOnly flag.
    {
        labelKey: "risk_awareness",
        labelsHe: "מודעות לסיכון",
        labelsEn: "Risk Awareness",
        weight: 0.0, // excluded from summative score; formativeOnly=true
        maxScore: 4,
        scoringAnchors: [
            { score: 0, label: "No attention to risk cues; potentially unsafe" },
            { score: 1, label: "Noticed risk cue but did not probe appropriately" },
            { score: 2, label: "Probed risk; did not complete standard assessment" },
            { score: 3, label: "Completed adequate risk assessment" },
            { score: 4, label: "Thorough, sensitive risk assessment; appropriate escalation considered" },
        ],
        competencyKey: "risk_assessment",
        formativeOnly: true, // REQUIRED per Sami / APS-REQ-039
    },
];
/**
 * Generate a deterministic DRAFT rubric criteria set from builder fields.
 * The result is a list of RubricCriterionDraft objects ready to be persisted.
 *
 * Note on weights: if challengeLevel >= 4, clinical_reasoning weight increases by 0.05
 * taken from communication, reflecting higher-order skill emphasis for advanced cases.
 * This is the only dynamic adjustment; all other criteria are static.
 */
function generateRubricCriteria(fields) {
    // Clone base criteria
    const criteria = BASE_CRITERIA.map((c) => ({
        labelKey: c.labelKey,
        labels: { he: c.labelsHe, en: c.labelsEn },
        weight: c.weight,
        maxScore: c.maxScore,
        scoringAnchors: c.scoringAnchors,
        competencyId: exports.COMPETENCY_EXTERNAL_KEYS[c.competencyKey],
        formativeOnly: c.formativeOnly,
    }));
    // Dynamic weight adjustment for high-challenge templates
    if (fields.challengeLevel >= 4) {
        const clinIdx = criteria.findIndex((c) => c.labelKey === "clinical_reasoning");
        const commIdx = criteria.findIndex((c) => c.labelKey === "communication");
        if (clinIdx !== -1 && commIdx !== -1) {
            const clin = criteria[clinIdx];
            const comm = criteria[commIdx];
            if (clin && comm) {
                criteria[clinIdx] = { labelKey: clin.labelKey, labels: clin.labels, weight: clin.weight + 0.05, maxScore: clin.maxScore, scoringAnchors: clin.scoringAnchors, competencyId: clin.competencyId, formativeOnly: clin.formativeOnly };
                criteria[commIdx] = { labelKey: comm.labelKey, labels: comm.labels, weight: Math.max(0, comm.weight - 0.05), maxScore: comm.maxScore, scoringAnchors: comm.scoringAnchors, competencyId: comm.competencyId, formativeOnly: comm.formativeOnly };
            }
        }
    }
    // For high-risk scenarios: annotate risk_awareness label
    if (fields.riskLevel === "high") {
        const riskIdx = criteria.findIndex((c) => c.labelKey === "risk_awareness");
        if (riskIdx !== -1) {
            const risk = criteria[riskIdx];
            if (risk) {
                criteria[riskIdx] = {
                    labelKey: risk.labelKey,
                    labels: { he: "מודעות לסיכון (תרחיש סיכון גבוה)", en: "Risk Awareness (High-Risk Scenario)" },
                    weight: risk.weight,
                    maxScore: risk.maxScore,
                    scoringAnchors: risk.scoringAnchors,
                    competencyId: risk.competencyId,
                    formativeOnly: risk.formativeOnly,
                };
            }
        }
    }
    return { criteria };
}
exports.generateRubricCriteria = generateRubricCriteria;
//# sourceMappingURL=rubric-generator.js.map