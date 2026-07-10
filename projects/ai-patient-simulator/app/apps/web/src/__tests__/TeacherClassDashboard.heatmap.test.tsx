/**
 * S4-NOA-HEATMAP: Heatmap column header Hebrew label test.
 * Envelope: render heatmap with mock rubric that has Hebrew labels;
 * assert rendered header text matches Hebrew label, not the labelKey.
 *
 * The backend fix (dashboard.service.ts shortLabel = criterionLabelHe(...))
 * means shortLabel now carries Hebrew text. The mock data was updated to
 * match (shortLabel = label = Hebrew string). This test verifies the
 * component renders shortLabel, not a raw key like "C-001" or "empathy".
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import TeacherClassDashboard from "../components/dashboard/TeacherClassDashboard";
import type { ClassDashboardVM } from "../lib/dashboard-types";

// Minimal mock ClassDashboardVM with Hebrew shortLabels in criteria
const MOCK_DATA: ClassDashboardVM = {
  collegeName: "מכללת בדיקה",
  courseName: "קורס בדיקה",
  courseId: "course-test-001",
  teacherName: "מרצה בדיקה",
  lastUpdated: "2026-07-10T09:00:00Z",
  assignments: [{ id: "asgn-001", title: "מטלה 1" }],
  selectedAssignmentId: "asgn-001",
  criteria: [
    { id: "C-001", shortLabel: "אמפתיה", label: "ברית טיפולית ואמפתיה", maxScore: 10 },
    { id: "C-002", shortLabel: "שאלות פתוחות", label: "שאלות פתוחות", maxScore: 10 },
  ],
  students: [
    {
      userId: "u-001",
      displayName: "סטודנט בדיקה",
      status: "COMPLETED",
      overallScore: 8,
      criterionScores: [
        { criterionId: "C-001", label: "ברית טיפולית ואמפתיה", score: 8, maxScore: 10 },
        { criterionId: "C-002", label: "שאלות פתוחות", score: 8, maxScore: 10 },
      ],
      flagType: null,
      flagDescription: null,
      attemptId: "attempt-001",
    },
  ],
};

test("heatmap column headers display Hebrew shortLabel, not raw key", () => {
  render(<TeacherClassDashboard data={MOCK_DATA} />);

  // The sort button aria-label uses crit.label ("מיין לפי " + label).
  expect(
    screen.getByRole("button", { name: /מיין לפי ברית טיפולית ואמפתיה/ }),
  ).toBeInTheDocument();

  // The visible column header text uses crit.shortLabel -- must be Hebrew, not a raw key.
  expect(screen.getByText("אמפתיה")).toBeInTheDocument();

  // Must NOT render raw key forms.
  expect(screen.queryByRole("button", { name: /מיין לפי C-001/ })).not.toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /מיין לפי empathy/ })).not.toBeInTheDocument();
  expect(screen.queryByText("C-001")).not.toBeInTheDocument();

  // Second criterion (getByRole is unambiguous; shortLabel may also appear in dist chart)
  expect(screen.getByRole("button", { name: /מיין לפי שאלות פתוחות/ })).toBeInTheDocument();
});
