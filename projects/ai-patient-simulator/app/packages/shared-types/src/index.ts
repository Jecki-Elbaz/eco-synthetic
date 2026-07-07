// @aps/shared-types -- barrel export
// All interfaces used across apps/web and apps/api boundary.
// This package NEVER imports from @aps/db, @aps/engine, apps/web, or apps/api.

export type { PatientState, PatientStateSnapshot } from "./engine.types.js";
export { INITIAL_PATIENT_STATE } from "./engine.types.js";
export type { AnalyserResult, QuestionType, TherapeuticStance } from "./analyser.types.js";
export type { GuardVerdict, GuardResult } from "./guard.types.js";
export type { TurnRequest, TurnResponse } from "./turn.types.js";
export type { AuthTokenPayload, UserScope, RoleType, ScopeType as UserScopeType, LoginResponse, MeResponse } from "./auth.types.js";
export type { ApiError, PaginatedResponse } from "./api.types.js";
export type {
  SupportIssueCategory,
  SupportScope,
  RoutingKey,
  RoutingResult,
  GlobalDiagnosticState,
  TroubleshootingStep,
  TroubleshootingResult,
  CreateSupportTicketDto,
  SupportEmailObject,
  SupportConfirmation,
  AttemptStatusValue,
  TechnicalAffectedNotification,
  AuthoriseRetryDto,
  AuthoriseRetryResult,
} from "./support.types.js";
export { ACADEMIC_SAFETY_TRANSITIONS } from "./support.types.js";
export type {
  CreditLedgerView,
  CreditEntryView,
  CreditUsageSummary,
  AdminCreditActionType,
  AdminCreditActionDto,
  AdminCreditActionResult,
  SetLimitsDto,
  SetLimitsResult,
  OverrideHardLimitDto,
  OverrideHardLimitResult,
  LowBalanceLedger,
  ActivityLogQuery,
} from "./credit-admin.types.js";
export type {
  BuilderFields,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  TemplateResponse,
  KnownFacts,
  DisclosureAllowList,
  CreateGroundTruthRequest,
  UpdateGroundTruthRequest,
  GroundTruthResponse,
  CreateTriggerRuleRequest,
  TriggerRuleResponse,
  RubricCriterionDraft,
  GenerateRubricRequest,
  UpdateCriterionRequest,
  RubricVersionResponse,
  RubricCriterionResponse,
  CriterionLabels,
  ScoringAnchor,
} from "./authoring.types.js";
