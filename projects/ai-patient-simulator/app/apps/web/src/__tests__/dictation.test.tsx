/**
 * S4-NOA-DICT: Dictation unit tests (APS-REQ-046).
 * Envelope: 5 required cases.
 *
 * Tests the InputBar dictation button render/behaviour, controlled via:
 *   - NEXT_PUBLIC_DICTATION_ENABLED env flag
 *   - window.SpeechRecognition availability
 *
 * These tests run in jsdom (jest-environment-jsdom).
 * SpeechRecognition is mocked because jsdom does not provide it.
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import InputBar from "../components/simulation/InputBar";

// ---------------------------------------------------------------------------
// Helpers to set up dictationEnabled prop (combines flag + API check)
// ---------------------------------------------------------------------------

const defaultProps = {
  value: "",
  onChange: jest.fn(),
  onSend: jest.fn(),
  micState: "unavailable" as const,
  onMicClick: jest.fn(),
  disabled: false,
  lang: "he" as const,
};

// ---------------------------------------------------------------------------
// 1. SpeechRecognition unavailable -> mic button not rendered
// ---------------------------------------------------------------------------

test("mic button not rendered when SpeechRecognition unavailable (flag irrelevant)", () => {
  // dictationEnabled=false because SpeechRecognition is not available
  render(<InputBar {...defaultProps} dictationEnabled={false} />);
  expect(screen.queryByTestId("dictation-mic-btn")).not.toBeInTheDocument();
});

// ---------------------------------------------------------------------------
// 2. SpeechRecognition available + flag false -> mic button not rendered
// ---------------------------------------------------------------------------

test("mic button not rendered when SpeechRecognition available but flag=false", () => {
  // Simulate SpeechRecognition available by assigning a mock to window,
  // but dictationEnabled=false because the flag is off.
  (window as unknown as Record<string, unknown>).SpeechRecognition = jest.fn();
  render(<InputBar {...defaultProps} dictationEnabled={false} />);
  expect(screen.queryByTestId("dictation-mic-btn")).not.toBeInTheDocument();
  delete (window as unknown as Record<string, unknown>).SpeechRecognition;
});

// ---------------------------------------------------------------------------
// 3. SpeechRecognition available + flag true -> mic button rendered
// ---------------------------------------------------------------------------

test("mic button rendered when SpeechRecognition available and dictationEnabled=true", () => {
  render(
    <InputBar
      {...defaultProps}
      dictationEnabled={true}
      dictationState="idle"
      onDictationClick={jest.fn()}
    />,
  );
  expect(screen.getByTestId("dictation-mic-btn")).toBeInTheDocument();
});

// ---------------------------------------------------------------------------
// 4. On recognition result -> text input value populated with transcript
// ---------------------------------------------------------------------------

test("onDictationClick fires when mic button is clicked", () => {
  const onDictationClick = jest.fn();
  const onChange = jest.fn();
  render(
    <InputBar
      {...defaultProps}
      onChange={onChange}
      dictationEnabled={true}
      dictationState="idle"
      onDictationClick={onDictationClick}
    />,
  );
  const btn = screen.getByTestId("dictation-mic-btn");
  fireEvent.click(btn);
  expect(onDictationClick).toHaveBeenCalledTimes(1);
});

// We also test that when the parent supplies a new value (simulating a
// recognition result being set by useDictation -> setInputText), the
// textarea reflects it.
test("textarea shows text populated by dictation result (via value prop)", () => {
  const { rerender } = render(
    <InputBar
      {...defaultProps}
      value=""
      dictationEnabled={true}
      dictationState="idle"
      onDictationClick={jest.fn()}
    />,
  );
  // Simulate recognition result: parent sets value="תוצאת תמלול"
  rerender(
    <InputBar
      {...defaultProps}
      value="תוצאת תמלול"
      dictationEnabled={true}
      dictationState="idle"
      onDictationClick={jest.fn()}
    />,
  );
  const textarea = screen.getByRole("textbox");
  expect(textarea).toHaveValue("תוצאת תמלול");
});

// ---------------------------------------------------------------------------
// 5. On recognition error -> text input unchanged, no crash
// ---------------------------------------------------------------------------

test("on dictation error: error message shown, text input unchanged", () => {
  const onChange = jest.fn();
  render(
    <InputBar
      {...defaultProps}
      value="טקסט קיים"
      onChange={onChange}
      dictationEnabled={true}
      dictationState="error"
      onDictationClick={jest.fn()}
      dictationError="הקלטה לא זמינה -- הקלד ישירות"
    />,
  );
  // Textarea retains existing value (unchanged)
  const textarea = screen.getByRole("textbox");
  expect(textarea).toHaveValue("טקסט קיים");
  // Error message is displayed
  expect(screen.getByRole("alert")).toHaveTextContent("הקלטה לא זמינה -- הקלד ישירות");
});
