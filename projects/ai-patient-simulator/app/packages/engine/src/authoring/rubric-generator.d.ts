import type { BuilderFields } from "@aps/shared-types";
import type { RubricCriterionDraft } from "@aps/shared-types";
export declare const COMPETENCY_EXTERNAL_KEYS: Record<string, string>;
export interface GeneratedRubric {
    criteria: RubricCriterionDraft[];
}
/**
 * Generate a deterministic DRAFT rubric criteria set from builder fields.
 * The result is a list of RubricCriterionDraft objects ready to be persisted.
 *
 * Note on weights: if challengeLevel >= 4, clinical_reasoning weight increases by 0.05
 * taken from communication, reflecting higher-order skill emphasis for advanced cases.
 * This is the only dynamic adjustment; all other criteria are static.
 */
export declare function generateRubricCriteria(fields: Pick<BuilderFields, "challengeLevel" | "riskLevel">): GeneratedRubric;
//# sourceMappingURL=rubric-generator.d.ts.map