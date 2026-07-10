/**
 * S4-NOA-RESUME: Timer restoration tests (Noa-R3).
 * Envelope:
 *   - Timer on resume with elapsed: displays (limit - elapsed).
 *   - Timer on resume with elapsed=null: displays "-- : --".
 *
 * Tests are on SessionHeader (renders the timer label) since that is
 * where the display logic lives (timerUnavailable prop).
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SessionHeader from "../components/simulation/SessionHeader";

const baseProps = {
  title: "בדיקת טיימר",
  notesOpen: false,
  lang: "he" as const,
  onHelp: jest.fn(),
  onFinish: jest.fn(),
  onToggleNotes: jest.fn(),
};

test("timer on resume with elapsed: displays remaining time (limit - elapsed)", () => {
  // timerDurationSeconds=1800, elapsed=600 -> remaining=1200 -> 20:00
  render(
    <SessionHeader
      {...baseProps}
      timerMode="countdown"
      timerSeconds={1200} // parent computes: 1800 - 600 = 1200
      timerUnavailable={false}
    />,
  );
  // Should show 20:00 remaining
  expect(screen.getByText(/20:00/)).toBeInTheDocument();
});

test("timer on resume with elapsed=null: displays -- : --", () => {
  render(
    <SessionHeader
      {...baseProps}
      timerMode="countdown"
      timerSeconds={0} // irrelevant; timerUnavailable overrides display
      timerUnavailable={true}
    />,
  );
  // Must show "-- : --" (Ido A3: do not show 00:00)
  expect(screen.getByText(/-- : --/)).toBeInTheDocument();
  // Must NOT show "00:00"
  expect(screen.queryByText(/00:00/)).not.toBeInTheDocument();
});
