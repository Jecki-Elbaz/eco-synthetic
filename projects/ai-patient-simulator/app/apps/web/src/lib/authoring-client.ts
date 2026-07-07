// authoring-client.ts -- typed client for Case Authoring endpoints.
// Routes match AuthoringController (apps/api/src/authoring/authoring.controller.ts).
// Mock path returns deterministic Hebrew data so the full author flow renders
// without a live API. Pattern mirrors api-client.ts / dashboard-client.ts.
// APS-REQ-028/029/030/031/039/040/041

import type {
  CreateTemplateRequest,
  TemplateResponse,
  CreateGroundTruthRequest,
  GroundTruthResponse,
  CreateTriggerRuleRequest,
  TriggerRuleResponse,
  GenerateRubricRequest,
  RubricVersionResponse,
  UpdateCriterionRequest,
  UpdateGroundTruthRequest,
} from "@aps/shared-types";
import { authedGet, authedPost, authedPatch } from "./http";

// Mock mode: NEXT_PUBLIC_USE_MOCK === "true" only.
// When a real API URL is configured, real calls happen by default.
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// ---------------------------------------------------------------------------
// Mock data -- deterministic, Hebrew-primary
// ---------------------------------------------------------------------------

const DEFAULT_HARD_OFF_RAMP =
  "אני חייב להפסיק את הסימולציה כאן. אם אתה/את חווה מחשבות לפגיעה עצמית " +
  "או נמצא/ת במצוקה, אנא פנה/י מיד לגורם מקצועי או התקשר/י לקו החירום 1201.";

const MOCK_TEMPLATE: TemplateResponse = {
  id: "tpl-demo-001",
  title: "ראיון קבלה ראשוני -- דיכאון קל",
  version: 1,
  clinicalModel: "CBT",
  studentLevel: "שנה ב",
  challengeLevel: 3,
  riskLevel: "LOW",
  languages: ["he", "en"],
  personaPrompt:
    "אתה/את משחק/ת את יוסי כהן, גבר בן 34, שפונה לטיפול בגלל תחושות דיכאון מתמשכות. " +
    "אתה/את מהסס/ת לשתף ומגלה מידע בהדרגה בלבד כשמרגיש/ה שהסטודנט/ית אמפתי/ת. " +
    "[generated server-side -- read-only]",
  groundTruthId: "gt-demo-001",
};

const MOCK_GROUND_TRUTH: GroundTruthResponse = {
  id: "gt-demo-001",
  simulationTemplateId: "tpl-demo-001",
  knownFacts: {
    facts: [
      "יוסי, גבר בן 34, נשוי + 2 ילדים",
      "עובד בהייטק, לחץ תעסוקתי גבוה",
      "תחושות דיכאון כ-3 חודשים, שינה מופרעת",
      "לא מטופל בעבר",
    ],
    doNotInvent: [
      "אל תציג היסטוריה פסיכיאטרית שלא צוינה",
      "אל תציג ניסיון אובדני בעבר",
      "אל תציג תרופות קיימות",
    ],
    riskBoundaries: [
      "אין מחשבות אובדניות פעילות -- ייאוש בלבד",
      "אין תכנית פגיעה עצמית",
      "אם נשאל ישירות -- השב שאין",
    ],
  },
  disclosureAllowList: {
    disclosed: ["שם", "גיל", "מצב משפחתי"],
    unlocked: ["FACT_WORK_STRESS", "FACT_SLEEP_ISSUES"],
    locked: ["FACT_CHILDHOOD_TRAUMA", "FACT_PREV_RELATIONSHIP"],
    triggers: ["empathy >= 0.7 -> UNLOCK:FACT_CHILDHOOD_TRAUMA"],
  },
  escalationRules: {
    "risk_score > 0.8": "TRIGGER_HARD_OFF_RAMP",
    "student_turns >= maxTurns": "TRIGGER_SOFT_WARN",
  },
  hardOffRampText: DEFAULT_HARD_OFF_RAMP,
  version: 1,
};

const MOCK_TRIGGER_RULES: TriggerRuleResponse[] = [
  {
    id: "tr-001",
    simulationTemplateId: "tpl-demo-001",
    triggerCondition: "empathy >= 0.7",
    action: "UNLOCK:FACT_CHILDHOOD_TRAUMA",
    priority: 1,
  },
  {
    id: "tr-002",
    simulationTemplateId: "tpl-demo-001",
    triggerCondition: "open_questions_ratio >= 0.6",
    action: "UNLOCK:FACT_WORK_CRISIS",
    priority: 2,
  },
];

const MOCK_RUBRIC: RubricVersionResponse = {
  id: "rubric-demo-001",
  simulationTemplateId: "tpl-demo-001",
  version: 1,
  status: "DRAFT",
  publishedAt: null,
  criteria: [
    {
      id: "C-001",
      rubricVersionId: "rubric-demo-001",
      labelKey: "alliance_empathy",
      labels: { he: "ברית טיפולית ואמפתיה", en: "Therapeutic Alliance & Empathy" },
      weight: 0.3,
      maxScore: 10,
      scoringAnchors: [
        { score: 10, label: "אמפתיה עמוקה, ברית טיפולית חזקה לאורך כל השיחה" },
        { score: 7, label: "אמפתיה ברורה, ברית טובה עם קצת מקום לשיפור" },
        { score: 4, label: "אמפתיה חלקית, ברית מוגבלת" },
        { score: 1, label: "היעדר אמפתיה מורגש" },
      ],
      competencyId: "COMP_ALLIANCE",
      formativeOnly: false,
    },
    {
      id: "C-002",
      rubricVersionId: "rubric-demo-001",
      labelKey: "open_questions",
      labels: { he: "שאלות פתוחות", en: "Open Questions" },
      weight: 0.2,
      maxScore: 10,
      scoringAnchors: [
        { score: 10, label: "שאלות פתוחות עקביות, מגוונות ומותאמות להקשר" },
        { score: 6, label: "שימוש טוב בשאלות פתוחות עם קצת שאלות סגורות" },
        { score: 3, label: "רוב השאלות סגורות" },
        { score: 1, label: "שאלות סגורות בלבד" },
      ],
      competencyId: "COMP_INTERVIEWING",
      formativeOnly: false,
    },
    {
      id: "C-003",
      rubricVersionId: "rubric-demo-001",
      labelKey: "functional_analysis",
      labels: { he: "ניתוח תפקודי", en: "Functional Analysis" },
      weight: 0.25,
      maxScore: 10,
      scoringAnchors: [
        { score: 10, label: "ניתוח תפקודי מקיף ומובנה" },
        { score: 7, label: "ניתוח חלקי עם כיסוי של עיקר התחומים" },
        { score: 4, label: "ניתוח שטחי" },
        { score: 1, label: "לא בוצע ניתוח תפקודי" },
      ],
      competencyId: "COMP_ASSESSMENT",
      formativeOnly: false,
    },
    {
      id: "C-004",
      rubricVersionId: "rubric-demo-001",
      labelKey: "risk_awareness",
      labels: { he: "מודעות לסיכון", en: "Risk Awareness" },
      weight: 0,
      maxScore: 10,
      scoringAnchors: [
        { score: 10, label: "אססמנט סיכון מלא ומובנה" },
        { score: 6, label: "שאל על סיכון, לא הושלם" },
        { score: 3, label: "רמז לסיכון לא קיבל מענה" },
        { score: 1, label: "סיכון לא הוזכר כלל" },
      ],
      competencyId: "COMP_RISK",
      formativeOnly: true,
    },
  ],
};

// ---------------------------------------------------------------------------
// Real API calls -- delegate to authed helpers from http.ts
// ---------------------------------------------------------------------------

const apiPost = authedPost;
const apiPatch = authedPatch;
const apiGet = authedGet;

// ---------------------------------------------------------------------------
// Public surface -- Templates
// ---------------------------------------------------------------------------

export async function createTemplate(
  req: CreateTemplateRequest,
): Promise<TemplateResponse> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 900));
    return {
      ...MOCK_TEMPLATE,
      title: req.builder.title || MOCK_TEMPLATE.title,
      clinicalModel: req.builder.clinicalModel,
      studentLevel: req.builder.studentLevel,
      challengeLevel: req.builder.challengeLevel,
      riskLevel: req.builder.riskLevel,
      languages: req.builder.languages,
    };
  }
  return apiPost<TemplateResponse>("authoring/templates", req);
}

export async function getTemplate(templateId: string): Promise<TemplateResponse> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 400));
    return { ...MOCK_TEMPLATE, id: templateId };
  }
  return apiGet<TemplateResponse>(`authoring/templates/${encodeURIComponent(templateId)}`);
}

// ---------------------------------------------------------------------------
// Public surface -- Ground Truth
// ---------------------------------------------------------------------------

export async function createGroundTruth(
  req: CreateGroundTruthRequest,
): Promise<GroundTruthResponse> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 600));
    return {
      ...MOCK_GROUND_TRUTH,
      simulationTemplateId: req.simulationTemplateId,
      knownFacts: req.knownFacts,
      disclosureAllowList: req.disclosureAllowList,
      escalationRules: req.escalationRules,
      hardOffRampText: req.hardOffRampText || DEFAULT_HARD_OFF_RAMP,
    };
  }
  return apiPost<GroundTruthResponse>("authoring/ground-truth", req);
}

export async function getGroundTruth(templateId: string): Promise<GroundTruthResponse> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 400));
    return { ...MOCK_GROUND_TRUTH, simulationTemplateId: templateId };
  }
  return apiGet<GroundTruthResponse>(`authoring/ground-truth/${encodeURIComponent(templateId)}`);
}

export async function updateGroundTruth(
  templateId: string,
  req: UpdateGroundTruthRequest,
): Promise<GroundTruthResponse> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 500));
    return {
      ...MOCK_GROUND_TRUTH,
      simulationTemplateId: templateId,
      ...req,
    } as GroundTruthResponse;
  }
  return apiPatch<GroundTruthResponse>(
    `authoring/ground-truth/${encodeURIComponent(templateId)}`,
    req,
  );
}

// ---------------------------------------------------------------------------
// Public surface -- Trigger Rules
// ---------------------------------------------------------------------------

export async function createTriggerRule(
  req: CreateTriggerRuleRequest,
): Promise<TriggerRuleResponse> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 400));
    return {
      id: `tr-${Date.now()}`,
      simulationTemplateId: req.simulationTemplateId,
      triggerCondition: req.triggerCondition,
      action: req.action,
      priority: req.priority ?? 10,
    };
  }
  return apiPost<TriggerRuleResponse>("authoring/triggers", req);
}

export async function getTriggerRules(
  templateId: string,
): Promise<TriggerRuleResponse[]> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 400));
    return MOCK_TRIGGER_RULES.map((r) => ({
      ...r,
      simulationTemplateId: templateId,
    }));
  }
  return apiGet<TriggerRuleResponse[]>(
    `authoring/triggers/${encodeURIComponent(templateId)}`,
  );
}

// ---------------------------------------------------------------------------
// Public surface -- Rubric
// ---------------------------------------------------------------------------

export async function generateRubric(
  req: GenerateRubricRequest,
): Promise<RubricVersionResponse> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 1200));
    return {
      ...MOCK_RUBRIC,
      simulationTemplateId: req.simulationTemplateId,
    };
  }
  return apiPost<RubricVersionResponse>("authoring/rubric/generate", req);
}

export async function getRubricVersion(
  rubricVersionId: string,
): Promise<RubricVersionResponse> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 400));
    return { ...MOCK_RUBRIC, id: rubricVersionId };
  }
  return apiGet<RubricVersionResponse>(
    `authoring/rubrics/${encodeURIComponent(rubricVersionId)}`,
  );
}

export async function updateCriterion(
  rubricVersionId: string,
  criterionId: string,
  req: UpdateCriterionRequest,
): Promise<void> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 400));
    return;
  }
  await apiPatch<unknown>(
    `authoring/rubrics/${encodeURIComponent(rubricVersionId)}/criteria/${encodeURIComponent(criterionId)}`,
    req,
  );
}

export async function publishRubric(
  rubricVersionId: string,
): Promise<RubricVersionResponse> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 700));
    return {
      ...MOCK_RUBRIC,
      id: rubricVersionId,
      status: "PUBLISHED",
      publishedAt: new Date(),
    };
  }
  return apiPost<RubricVersionResponse>(
    `authoring/rubrics/${encodeURIComponent(rubricVersionId)}/publish`,
    {},
  );
}

export function isAuthoringMockMode(): boolean {
  return USE_MOCK;
}
