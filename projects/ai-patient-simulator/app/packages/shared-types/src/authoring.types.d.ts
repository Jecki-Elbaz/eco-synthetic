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
    challengeLevel: number;
    languages: string[];
    mode: string;
    maxTurns?: number | undefined;
    timeLimitMinutes?: number | undefined;
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
}
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
    hardOffRampText?: string;
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
export interface CreateTriggerRuleRequest {
    simulationTemplateId: string;
    triggerCondition: string;
    action: string;
    priority?: number;
}
export interface TriggerRuleResponse {
    id: string;
    simulationTemplateId: string;
    triggerCondition: string;
    action: string;
    priority: number;
}
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
//# sourceMappingURL=authoring.types.d.ts.map