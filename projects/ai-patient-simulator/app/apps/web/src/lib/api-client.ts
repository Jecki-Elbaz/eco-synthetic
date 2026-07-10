// APS API client -- typed against @aps/shared-types
// Reads base URL from process.env.NEXT_PUBLIC_API_URL.
// Mock mode: NEXT_PUBLIC_USE_MOCK === "true" only.
//   When a real API URL is configured, real calls happen by default.
//   /simulation/demo always uses mock regardless (no-auth showcase).

import type { TurnRequest, TurnResponse } from "@aps/shared-types";
import { authedPost, authedGet } from "./http";

// ---------------------------------------------------------------------------
// Transcript types (S4-NOA-RESUME)
// ---------------------------------------------------------------------------

export interface TranscriptTurn {
  turnIndex: number;
  studentInput: string;
  patientResponse: string;
  timestamp: string; // ISO
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// ---------------------------------------------------------------------------
// Stub data
// ---------------------------------------------------------------------------

let stubTurnCount = 0;

function mockTurnResponse(req: TurnRequest): TurnResponse {
  stubTurnCount += 1;
  const tc = stubTurnCount;
  const messages: string[] = [
    "לא יודע... הרגשתי ממש מדוכא בתקופה האחרונה.",
    "קשה לי להסביר. פשוט לא רצה לצאת מהבית.",
    "[הסתכל הצדה] אני לא בטוח שמישהו יכול להבין אותי.",
    "אולי. אבל זה מרגיש מאוד רחוק.",
    "[הפסקה ארוכה] הייתי שמח אם דברים היו שונים.",
  ];
  const idx = (tc - 1) % messages.length;
  const msg = messages[idx] ?? "...";
  const softWarn = tc >= 60;
  return {
    patientMessage: msg,
    turnNumber: tc,
    guardResult: "PASS",
    turnCount: tc,
    softWarnTriggered: softWarn,
    softWarnAnnotation: softWarn
      ? "את/ה מתקרב/ת למספר המרבי של תורות בסימולציה זו."
      : null,
    hardLimitReached: false,
  };
}

// ---------------------------------------------------------------------------
// Real API call
// ---------------------------------------------------------------------------

async function postTurn(req: TurnRequest): Promise<TurnResponse> {
  // Route matches the NestJS controller: POST /simulations/:attemptId/turn.
  // attemptId travels in the path; the body carries only the turn fields.
  return authedPost<TurnResponse>(
    `simulations/${encodeURIComponent(req.attemptId)}/turn`,
    {
      studentMessage: req.studentMessage,
      language: req.language,
      nonVerbalCues: req.nonVerbalCues,
    },
  );
}

// ---------------------------------------------------------------------------
// Public surface
// ---------------------------------------------------------------------------

export async function sendTurn(req: TurnRequest): Promise<TurnResponse> {
  if (USE_MOCK) {
    // Simulate realistic latency in mock mode
    await new Promise<void>((r) => setTimeout(r, 1200));
    return mockTurnResponse(req);
  }
  return postTurn(req);
}

export function isMockMode(): boolean {
  return USE_MOCK;
}

// ---------------------------------------------------------------------------
// Transcript (S4-NOA-RESUME)
// ---------------------------------------------------------------------------

/**
 * Fetch the turn-by-turn transcript for an attempt.
 * Used by SimulationScreen on resume to rehydrate the chat history.
 * Real endpoint: GET /simulations/:attemptId/transcript.
 * Mock mode: returns empty array (fresh start appearance for demo).
 */
export async function fetchTranscript(attemptId: string): Promise<TranscriptTurn[]> {
  if (USE_MOCK) {
    await new Promise<void>((r) => setTimeout(r, 300));
    return [];
  }
  return authedGet<TranscriptTurn[]>(
    `simulations/${encodeURIComponent(attemptId)}/transcript`,
  );
}
