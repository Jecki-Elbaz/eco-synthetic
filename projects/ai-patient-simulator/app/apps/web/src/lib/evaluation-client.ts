// evaluation-client.ts -- typed client for GET /simulations/:attemptId/evaluation.
// Mock path returns deterministic Hebrew evaluation data so the feedback screen
// renders without a live API. Pattern mirrors api-client.ts.

import type {
  EvaluationResponse,
  RubricCriterionView,
  TranscriptTurn,
  ApiTranscriptTurn,
} from "./evaluation-types";
import { authedGet } from "./http";

// Mock mode: NEXT_PUBLIC_USE_MOCK === "true" only.
// When a real API URL is configured, real calls happen by default.
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// ---------------------------------------------------------------------------
// Mock data -- deterministic, Hebrew-primary
// ---------------------------------------------------------------------------

const MOCK_CRITERIA: RubricCriterionView[] = [
  {
    id: "C-001",
    labelKey: "alliance_empathy",
    label: "ברית טיפולית ואמפתיה",
    weight: 0.3,
    maxScore: 10,
    formativeOnly: false,
  },
  {
    id: "C-002",
    labelKey: "open_questions",
    label: "שאלות פתוחות",
    weight: 0.2,
    maxScore: 10,
    formativeOnly: false,
  },
  {
    id: "C-003",
    labelKey: "functional_analysis",
    label: "ניתוח תפקודי",
    weight: 0.25,
    maxScore: 10,
    formativeOnly: false,
  },
  {
    id: "C-004",
    labelKey: "risk_awareness",
    label: "מודעות לסיכון",
    weight: 0.25,
    maxScore: 10,
    formativeOnly: true,
  },
];

const MOCK_TRANSCRIPT: TranscriptTurn[] = [
  { turnNumber: 1, role: "STUDENT", text: "שלום, אני שמח/ה שהגעת. איך אתה/את מרגיש/ה היום?" },
  { turnNumber: 2, role: "PATIENT", text: "לא יודע... הרגשתי ממש מדוכא בתקופה האחרונה." },
  { turnNumber: 3, role: "STUDENT", text: "זה נשמע קשה. תוכל/י לספר לי יותר?" },
  { turnNumber: 4, role: "PATIENT", text: "קשה לי להסביר. פשוט לא רצה לצאת מהבית." },
  { turnNumber: 5, role: "STUDENT", text: "כמה זמן אתה/את חש/ה כך?" },
  { turnNumber: 6, role: "PATIENT", text: "[הסתכל הצדה] אני לא בטוח שמישהו יכול להבין אותי." },
  { turnNumber: 7, role: "STUDENT", text: "אני כאן כדי להקשיב. מה עובר עליך בימים האלה?" },
  { turnNumber: 8, role: "PATIENT", text: "אולי. אבל זה מרגיש מאוד רחוק." },
  { turnNumber: 9, role: "STUDENT", text: "האם יש מחשבות שמדאיגות אותך?" },
  { turnNumber: 10, role: "PATIENT", text: "[הפסקה ארוכה] הייתי שמח אם דברים היו שונים." },
];

const MOCK_EVALUATION: EvaluationResponse = {
  attemptId: "demo-attempt-001",
  status: "PUBLISHED",
  overallSummary:
    "הראית כישורי האזנה בסיסיים טובים ויצרת פתיחות ראשונית עם המטופל/ת. " +
    "השאלות הפתוחות שלך עזרו לפתוח את השיחה, אך ניתן לחזק את החקירה הרגשית ולהתייחס " +
    "ישירות למחשבות הדאגה שעלו בתור 9.",
  publishedAt: new Date().toISOString(),
  structuredScores: {
    "C-001": {
      score: 7,
      maxScore: 10,
      evidence: [1, 3, 7],
      notes:
        "יצרת קשר חם ואמפתי בפתיחה ובפניות החוזרות. שיפור אפשרי: שיקוף רגשי מפורש יותר בתגובה לתור 6.",
      requiresTeacherReview: false,
    },
    "C-002": {
      score: 5,
      maxScore: 10,
      evidence: [3, 5, 7],
      notes:
        "השתמשת בשאלות פתוחות בחלק מהתורות, אך תורות 5 ו-9 הכילו שאלות סגורות יחסית. " +
        "נסה/י לפתוח יותר עם 'מה', 'איך', 'ספר/י לי'.",
      requiresTeacherReview: false,
    },
    "C-003": {
      score: 8,
      maxScore: 10,
      evidence: [5, 9],
      notes:
        "בחנת את ההיסטוריה ואת ההשפעה התפקודית בצורה שיטתית. הצלחת לאסוף מידע על מגבלות " +
        "בתפקוד יומיומי. כדאי להרחיב את הניתוח להיבטים חברתיים.",
      requiresTeacherReview: false,
    },
    "C-004": {
      score: 6,
      maxScore: 10,
      evidence: [9, 10],
      notes:
        "שאלת על מחשבות מדאיגות בתור 9 -- זו פנייה חשובה. עם זאת, לא בוצע אססמנט " +
        "מלא לסיכון לאחר שהמטופל/ת רמז על קושי. [FORMATIVE-ONLY: requires teacher review before official]",
      requiresTeacherReview: true,
    },
  },
  transcriptHighlights: [
    { type: "STRONG", turnNumber: 7, note: "פנייה אמפתית ישירה שפתחה מרחב בטוח" },
    { type: "MISSED", turnNumber: 6, note: "הצהרה רגשית של המטופל/ת לא קיבלה שיקוף ישיר" },
    { type: "RISK_FLAG", turnNumber: 10, note: "רמז לייאוש -- נדרש אססמנט סיכון מלא" },
  ],
};

// ---------------------------------------------------------------------------
// Real API calls
// ---------------------------------------------------------------------------

async function fetchEvaluationReal(attemptId: string): Promise<EvaluationResponse> {
  return authedGet<EvaluationResponse>(
    `simulations/${encodeURIComponent(attemptId)}/evaluation`,
  );
}

// ---------------------------------------------------------------------------
// Public surface
// ---------------------------------------------------------------------------

export async function fetchEvaluation(attemptId: string): Promise<EvaluationResponse> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 800));
    return { ...MOCK_EVALUATION, attemptId };
  }
  return fetchEvaluationReal(attemptId);
}

/**
 * Fetch rubric criteria for display alongside structured scores.
 * In a live system these come from the rubricVersion attached to the attempt.
 * Mock returns the hard-coded pilot criteria set.
 */
export async function fetchRubricCriteria(
  _attemptId: string,
): Promise<RubricCriterionView[]> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 400));
    return MOCK_CRITERIA;
  }
  // Real: GET /simulations/:attemptId/rubric-criteria (Sprint 3+ endpoint)
  // For now, always fall through to mock -- placeholder until endpoint exists.
  return MOCK_CRITERIA;
}

// Real API call: GET /simulations/:attemptId/transcript
// Gal item F (DONE 2026-07-09). Response shape: ApiTranscriptTurn[].
// Each API element is one exchange (studentInput + patientResponse).
// Flatten to alternating TranscriptTurn entries for the panel:
//   exchange turnIndex N -> student at display turnNumber 2N-1
//                        -> patient  at display turnNumber 2N
async function fetchTranscriptReal(attemptId: string): Promise<TranscriptTurn[]> {
  const raw = await authedGet<ApiTranscriptTurn[]>(
    `simulations/${encodeURIComponent(attemptId)}/transcript`,
  );
  const turns: TranscriptTurn[] = [];
  for (const t of raw) {
    turns.push({ turnNumber: t.turnIndex * 2 - 1, role: "STUDENT", text: t.studentInput });
    turns.push({ turnNumber: t.turnIndex * 2, role: "PATIENT", text: t.patientResponse });
  }
  return turns;
}

/**
 * Fetch the attempt transcript for display in the feedback panel.
 * Real path: GET /simulations/:attemptId/transcript (Gal item F, DONE).
 * Mock (NEXT_PUBLIC_USE_MOCK === "true") returns deterministic Hebrew fixture.
 * Non-2xx from the real endpoint throws ApiError -- caller handles error state.
 */
export async function fetchTranscript(
  attemptId: string,
): Promise<TranscriptTurn[]> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 300));
    return MOCK_TRANSCRIPT;
  }
  return fetchTranscriptReal(attemptId);
}

export function isEvaluationMockMode(): boolean {
  return USE_MOCK;
}
