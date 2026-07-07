// debrief-client.ts -- typed client for POST /simulations/:attemptId/debrief.
// Mock returns a deterministic Hebrew supervisor reply with cited turns.
// Cap simulation at 10 questions matches DebriefService.maxDebriefQuestions.
// Pattern mirrors api-client.ts.

import type { DebriefRequest, DebriefResponse } from "./evaluation-types";
import { authedPost } from "./http";

// Mock mode: NEXT_PUBLIC_USE_MOCK === "true" only.
// When a real API URL is configured, real calls happen by default.
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

const MAX_DEBRIEF_QUESTIONS = 10;

// ---------------------------------------------------------------------------
// Mock state (per session -- resets on page reload)
// ---------------------------------------------------------------------------

let mockQuestionCount = 0;

const MOCK_SUPERVISOR_REPLIES: Array<{ text: string; citedTurns: number[] }> = [
  {
    text:
      "שאלה טובה. בתור 7 השתמשת בפנייה ישירה ואמפתית -- זה פתח מרחב בטוח למטופל/ת. " +
      "כדאי לשים לב לרגע בתור 6 שבו הייתה הזדמנות לשיקוף רגשי שלא נוצלה. " +
      "מה דעתך -- מה היית אומר/ת אחרת?",
    citedTurns: [6, 7],
  },
  {
    text:
      "בתור 9 שאלת על מחשבות מדאיגות -- זו פנייה חשובה מאוד. " +
      "עם זאת, כשהמטופל/ת רמז על קושי בתור 10, לא בוצע המשך ישיר של אססמנט סיכון. " +
      "בפועל הקליני, חשוב להמשיך לחקור את הרמזים האלה.",
    citedTurns: [9, 10],
  },
  {
    text:
      "השאלות הפתוחות שלך בתורות 3 ו-7 היו אפקטיביות. " +
      "הן אפשרו למטופל/ת לספר בקצב שלו/שלה. " +
      "בתור 5 השאלה הייתה סגורה יחסית -- נסה/י להרחיב עם 'ספר/י לי עוד על...'.",
    citedTurns: [3, 5, 7],
  },
  {
    text:
      "הפתיחה בתור 1 יצרה אווירה חמה. המטופל/ת נפתח/ה בהדרגה. " +
      "שים/י לב שלא חיפשת מידע על פעילויות שנזנחו -- זה יכול להיות מידע תפקודי חשוב.",
    citedTurns: [1, 4],
  },
  {
    text:
      "כשמטופל/ת מביע/ה תחושה ש'אף אחד לא יכול להבין' (תור 6), " +
      "זו לעיתים פנייה לבדיקת הברית. אפשר להגיב ישירות: 'אני כאן ואני רוצה להבין'. " +
      "מה היית מרגיש/ה בסיטואציה כזו?",
    citedTurns: [6],
  },
];

function getMockReply(questionIndex: number): { text: string; citedTurns: number[] } {
  const reply = MOCK_SUPERVISOR_REPLIES[questionIndex % MOCK_SUPERVISOR_REPLIES.length];
  return reply ?? { text: "תגובת מדריך (סטאב)", citedTurns: [] };
}

const CAP_MESSAGE =
  "השתמשת בכל 10 שאלות הדיברוף לסשן זה. " +
  "אם יש לך שאלות נוספות, פנה/י למרצה שלך.";

// ---------------------------------------------------------------------------
// Real API call
// ---------------------------------------------------------------------------

async function postDebriefReal(
  attemptId: string,
  req: DebriefRequest,
): Promise<DebriefResponse> {
  return authedPost<DebriefResponse>(
    `simulations/${encodeURIComponent(attemptId)}/debrief`,
    { message: req.message },
  );
}

// ---------------------------------------------------------------------------
// Public surface
// ---------------------------------------------------------------------------

/**
 * Post a student debrief message and receive a supervisor response.
 * In mock mode: returns deterministic Hebrew replies; enforces 10-question cap.
 */
export async function postDebrief(
  attemptId: string,
  req: DebriefRequest,
): Promise<DebriefResponse> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 1000));

    if (mockQuestionCount >= MAX_DEBRIEF_QUESTIONS) {
      return {
        supervisorText: CAP_MESSAGE,
        citedTurns: [],
        capped: true,
      };
    }

    const reply = getMockReply(mockQuestionCount);
    mockQuestionCount += 1;

    return {
      supervisorText: reply.text,
      citedTurns: reply.citedTurns,
      capped: false,
    };
  }

  return postDebriefReal(attemptId, req);
}

/** Reset mock question counter (for demo page re-use without page reload) */
export function resetDebriefMock(): void {
  mockQuestionCount = 0;
}

export function isDebriefMockMode(): boolean {
  return USE_MOCK;
}
