// @aps/shared-types -- Authoring contract types
// APS-REQ-028/029/030/031/032/039/040/041/042

// ---------------------------------------------------------------------------
// Simulation Builder
// ---------------------------------------------------------------------------

export interface BuilderFields {
  title: string;
  clinicalModel: string;
  studentLevel: string;
  primarySkill: string;
  secondarySkill?: string | undefined;
  patientStyle: string;
  presentingProblem: string;
  hiddenIssue?: string | undefined;
  riskLevel: string;
  challengeLevel: number;         // 1-5
  languages: string[];            // e.g. ["he", "en"]
  mode: string;                   // e.g. "intake", "ongoing", "crisis"
  maxTurns?: number | undefined;
  timeLimitMinutes?: number | undefined;
  /** S5-GAL-ARC-ENFORCE: number of sessions in the arc. Must be in [2,4]. Defaults to 3 (DB default). */
  maxSessions?: number | undefined;
}

export interface CreateTemplateRequest {
  builder: BuilderFields;
}

export interface UpdateTemplateRequest {
  builder: Partial<BuilderFields>;
}

export interface TemplateResponse {
  id: string;
  title: string;
  version: number;
  clinicalModel: string;
  studentLevel: string;
  challengeLevel: number;
  riskLevel: string;
  languages: string[];
  personaPrompt: string;
  groundTruthId: string;
  /** S5-GAL-ARC-ENFORCE: session arc cap (2-4 for arc, 3 default). */
  maxSessions: number;
  /**
   * S5-GAL-M6: true when the rubric has not been reviewed after the last GT update.
   * Derived: rubricLastReviewedAt IS NULL OR groundTruth.updatedAt > rubricLastReviewedAt.
   */
  rubricProvisional: boolean;
}

// ---------------------------------------------------------------------------
// Ground Truth
// ---------------------------------------------------------------------------

export interface KnownFacts {
  facts: string[];
  doNotInvent: string[];
  riskBoundaries: string[];
}

export interface DisclosureAllowList {
  disclosed: string[];
  unlocked: string[];
  locked: string[];
  triggers: string[];
}

export interface CreateGroundTruthRequest {
  simulationTemplateId: string;
  knownFacts: KnownFacts;
  disclosureAllowList: DisclosureAllowList;
  escalationRules: Record<string, unknown>;
  hardOffRampText?: string;       // optional -- default injected if absent/empty
  version?: number;
}

export interface UpdateGroundTruthRequest {
  knownFacts?: KnownFacts;
  disclosureAllowList?: DisclosureAllowList;
  escalationRules?: Record<string, unknown>;
  hardOffRampText?: string;
}

export interface GroundTruthResponse {
  id: string;
  simulationTemplateId: string;
  knownFacts: KnownFacts;
  disclosureAllowList: DisclosureAllowList;
  escalationRules: Record<string, unknown>;
  hardOffRampText: string;
  version: number;
}

// ---------------------------------------------------------------------------
// Trigger Rules
// ---------------------------------------------------------------------------

export interface CreateTriggerRuleRequest {
  simulationTemplateId: string;
  triggerCondition: string;       // e.g. "empathy >= 0.7"
  action: string;                 // e.g. "UNLOCK:FACT_ID_07"
  priority?: number;
}

export interface TriggerRuleResponse {
  id: string;
  simulationTemplateId: string;
  triggerCondition: string;
  action: string;
  priority: number;
}

// ---------------------------------------------------------------------------
// Rubric
// ---------------------------------------------------------------------------

export interface CriterionLabels {
  he: string;
  en: string;
}

export interface ScoringAnchor {
  score: number;
  label: string;
}

export interface RubricCriterionDraft {
  labelKey: string;
  labels: CriterionLabels;
  weight: number;
  maxScore: number;
  scoringAnchors: ScoringAnchor[];
  competencyId: string | undefined;
  formativeOnly: boolean;
}

export interface GenerateRubricRequest {
  simulationTemplateId: string;
}

export interface UpdateCriterionRequest {
  labels?: CriterionLabels;
  weight?: number;
  maxScore?: number;
  scoringAnchors?: ScoringAnchor[];
  competencyId?: string | undefined;
  formativeOnly?: boolean;
}

export interface RubricVersionResponse {
  id: string;
  simulationTemplateId: string;
  version: number;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: Date | null;
  criteria: RubricCriterionResponse[];
}

export interface RubricCriterionResponse {
  id: string;
  rubricVersionId: string;
  labelKey: string;
  labels: CriterionLabels;
  weight: number;
  maxScore: number;
  scoringAnchors: ScoringAnchor[];
  competencyId: string | null;
  formativeOnly: boolean;
}
