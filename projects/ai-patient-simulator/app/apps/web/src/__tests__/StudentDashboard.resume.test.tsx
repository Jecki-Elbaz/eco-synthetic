/**
 * S4-NOA-RESUME: StudentDashboard resume-on-interrupt tests.
 * Envelope tests:
 *   - Dashboard renders "Continue" card for IN_PROGRESS attempt.
 *   - Completed attempts unchanged (regression).
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import StudentDashboard from "../components/student/StudentDashboard";
import type { StudentDashboardVM } from "../lib/dashboard-types";

const MOCK_DATA: StudentDashboardVM = {
  userId: "u-001",
  displayName: "מיכל בדיקה",
  inProgressSimulations: [
    {
      attemptId: "attempt-inprog-001",
      title: "סימולציה שטרם הושלמה",
      status: "IN_PROGRESS",
      lastTurnAt: "2026-07-10T10:00:00Z",
      elapsed: 900,       // 15 minutes
      timeLimitSeconds: 1800,
    },
  ],
  completedSimulations: [
    {
      attemptId: "attempt-comp-001",
      title: "סימולציה שהושלמה",
      completedAt: "2026-07-09T14:00:00Z",
      overallFormativeLabel: "טוב (7.0/10) -- פורמטיבי בלבד",
      criterionSummary: [],
      hasEvaluation: false,
      hasDebrief: false,
    },
  ],
  debriefHistory: [],
  supportTickets: [],
};

test("dashboard renders Continue card for IN_PROGRESS attempt", () => {
  render(<StudentDashboard data={MOCK_DATA} />);
  // Section heading for in-progress
  expect(screen.getByText("סימולציות בתהליך")).toBeInTheDocument();
  // The in-progress card title
  expect(screen.getByText("סימולציה שטרם הושלמה")).toBeInTheDocument();
  // "המשך" link rendered
  const continueBtn = screen.getByTestId("resume-continue-btn");
  expect(continueBtn).toBeInTheDocument();
  // href includes resume=1 and elapsed=900
  expect(continueBtn).toHaveAttribute("href", expect.stringContaining("resume=1"));
  expect(continueBtn).toHaveAttribute("href", expect.stringContaining("elapsed=900"));
});

test("completed simulations still render unchanged (regression)", () => {
  render(<StudentDashboard data={MOCK_DATA} />);
  expect(screen.getByText("סימולציות שהושלמו")).toBeInTheDocument();
  expect(screen.getByText("סימולציה שהושלמה")).toBeInTheDocument();
});

test("in-progress section hidden when no IN_PROGRESS attempts", () => {
  const dataNoInProgress: StudentDashboardVM = {
    ...MOCK_DATA,
    inProgressSimulations: [],
  };
  render(<StudentDashboard data={dataNoInProgress} />);
  // Section heading must NOT appear
  expect(screen.queryByText("סימולציות בתהליך")).not.toBeInTheDocument();
});
