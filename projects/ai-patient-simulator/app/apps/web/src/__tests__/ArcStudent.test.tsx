/**
 * S5-NOA-ARC-STUDENT: session-context panel, welfare re-anchor modal,
 * and session-gap briefing unit tests.
 *
 * Envelope acceptance tests (5 cases):
 *   1. Session 1: context panel absent; welfare modal absent; briefing absent. PASS.
 *   2. Session 2: context panel shown with correct N/max; welfare modal shown before
 *      chat active; briefing shown after modal ack, before first send. PASS.
 *   3. Session 3: same three checks pass. PASS.
 *   4. Welfare modal: chat input disabled until "הבנתי" clicked. PASS.
 *   5. Welfare modal: both text components (identity + welfare signpost) present. PASS.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// ---------------------------------------------------------------------------
// Module mocks -- must appear before component imports.
// ---------------------------------------------------------------------------

jest.mock("@/lib/api-client", () => ({
  sendTurn: jest.fn().mockResolvedValue({
    patientMessage: "ok",
    turnCount: 1,
    guardResult: "PASS",
    turnNumber: 1,
    softWarnTriggered: false,
    softWarnAnnotation: null,
    hardLimitReached: false,
  }),
  fetchTranscript: jest.fn().mockResolvedValue([]),
  isMockMode: jest.fn().mockReturnValue(false),
}));

jest.mock("../components/simulation/useDictation", () => ({
  useDictation: jest.fn().mockReturnValue({
    dictationState: "idle",
    errorMessage: null,
    startListening: jest.fn(),
    stopListening: jest.fn(),
  }),
  isDictationEnabled: jest.fn().mockReturnValue(false),
  isDictationFlagEnabled: jest.fn().mockReturnValue(false),
  isSpeechRecognitionAvailable: jest.fn().mockReturnValue(false),
}));

import SimulationScreen from "../components/simulation/SimulationScreen";

// JSDOM does not implement scrollIntoView. ChatArea uses it to scroll to the
// bottom on new messages. Suppress the TypeError so test assertions are clean.
beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = jest.fn();
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderSession(sessionNumber: number | null, maxSessions = 3) {
  return render(
    <SimulationScreen
      attemptId="attempt-arc-001"
      title="Test Simulation"
      lang="he"
      maxTurns={75}
      softWarnAt={60}
      sessionNumber={sessionNumber}
      maxSessions={maxSessions}
    />,
  );
}

// ---------------------------------------------------------------------------
// 1. Session 1: no arc UI shown
// ---------------------------------------------------------------------------

test("session 1: context panel absent, welfare modal absent, briefing absent", () => {
  renderSession(1, 3);
  expect(screen.queryByTestId("arc-context-panel")).not.toBeInTheDocument();
  expect(screen.queryByTestId("welfare-reanchor-modal")).not.toBeInTheDocument();
  expect(screen.queryByTestId("session-gap-briefing")).not.toBeInTheDocument();
});

// ---------------------------------------------------------------------------
// 2. Session 2: context panel shown with N/max; welfare modal before chat active;
//    briefing shown after modal ack
// ---------------------------------------------------------------------------

test("session 2: context panel with correct N/max, welfare modal blocks chat, briefing after ack", () => {
  renderSession(2, 3);

  // (a) Context panel shown with correct session text
  const panel = screen.getByTestId("arc-context-panel");
  expect(panel).toBeInTheDocument();
  // "פגישה 2 מתוך 3" in the panel text
  expect(panel).toHaveTextContent("פגישה 2 מתוך 3");

  // (b) Welfare modal shown before chat is active
  expect(screen.getByTestId("welfare-reanchor-modal")).toBeInTheDocument();

  // (c) Briefing NOT shown yet (modal not acked)
  expect(screen.queryByTestId("session-gap-briefing")).not.toBeInTheDocument();

  // (d) Ack the modal
  fireEvent.click(screen.getByRole("button", { name: "הבנתי" }));

  // Modal gone
  expect(screen.queryByTestId("welfare-reanchor-modal")).not.toBeInTheDocument();

  // (e) Briefing now shown after ack (no messages sent yet)
  expect(screen.getByTestId("session-gap-briefing")).toBeInTheDocument();
});

// ---------------------------------------------------------------------------
// 3. Session 3: same three checks pass
// ---------------------------------------------------------------------------

test("session 3: context panel with correct N/max, welfare modal, briefing after ack", () => {
  renderSession(3, 3);

  const panel = screen.getByTestId("arc-context-panel");
  expect(panel).toBeInTheDocument();
  // "פגישה 3 מתוך 3" in the panel text
  expect(panel).toHaveTextContent("פגישה 3 מתוך 3");

  expect(screen.getByTestId("welfare-reanchor-modal")).toBeInTheDocument();
  expect(screen.queryByTestId("session-gap-briefing")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "הבנתי" }));

  expect(screen.queryByTestId("welfare-reanchor-modal")).not.toBeInTheDocument();
  expect(screen.getByTestId("session-gap-briefing")).toBeInTheDocument();
});

// ---------------------------------------------------------------------------
// 4. Welfare modal: chat input disabled until "הבנתי" clicked
// ---------------------------------------------------------------------------

test("welfare modal: chat input (textarea) disabled until הבנתי clicked", () => {
  renderSession(2, 3);

  // Textarea should be disabled while welfare modal is pending
  const textarea = screen.getByRole("textbox");
  expect(textarea).toBeDisabled();

  // Click ack
  fireEvent.click(screen.getByRole("button", { name: "הבנתי" }));

  // Now enabled
  expect(screen.getByRole("textbox")).not.toBeDisabled();
});

// ---------------------------------------------------------------------------
// 5. Welfare modal: both text components (identity + welfare signpost) present
// ---------------------------------------------------------------------------

test("welfare modal: both identity reminder and welfare signpost present", () => {
  renderSession(2, 3);

  const modal = screen.getByTestId("welfare-reanchor-modal");

  // (a) Simulation-identity reminder (Sami C3)
  expect(modal).toHaveTextContent(
    "המטופל הוא דמות אימון מדומה; הוא אינו אדם אמיתי.",
  );

  // (b) Welfare signpost (Sami C3)
  expect(modal).toHaveTextContent(
    "אם אתה/את חש/ה אי-נוחות, פנה/י לאיש הצוות שלך.",
  );

  // (c) Ack button present
  expect(screen.getByRole("button", { name: "הבנתי" })).toBeInTheDocument();
});
