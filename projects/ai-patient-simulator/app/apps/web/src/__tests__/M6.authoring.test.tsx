/**
 * S5-NOA-M6: GT-before-rubric enforcement UI unit tests.
 *
 * Envelope acceptance tests (6 cases):
 *   1. Navigate Step 4 with GT empty: warning banner shown; "Continue anyway" navigates. PASS.
 *   2. Navigate Step 4 with GT saved: no warning. PASS.
 *   3. rubricProvisional=true: provisional tag visible. PASS.
 *   4. rubricProvisional=false: no tag. PASS.
 *   5. Publish error GROUND_TRUTH_REQUIRED: correct message. PASS.
 *   6. Publish error RUBRIC_PROVISIONAL: correct message. PASS.
 */

import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";

// ---------------------------------------------------------------------------
// Module mocks
// ---------------------------------------------------------------------------

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn() })),
}));

jest.mock("@/lib/authoring-client", () => ({
  getTemplate: jest.fn(),
  markRubricReviewed: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/lib/preview-client", () => ({
  fetchAssignmentsForTemplate: jest.fn().mockResolvedValue([]),
  runPreview: jest.fn(),
}));

import { getTemplate } from "@/lib/authoring-client";
import AuthoringShell from "../components/authoring/AuthoringShell";
import RubricEditor from "../components/authoring/RubricEditor";
import { ApiError } from "../lib/http";
import type { RubricVersionResponse, TemplateResponse, GroundTruthResponse } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_TEMPLATE: TemplateResponse = {
  id: "tpl-m6-001",
  title: "M6 Test Template",
  version: 1,
  clinicalModel: "CBT",
  studentLevel: "שנה ב",
  challengeLevel: 3,
  riskLevel: "LOW",
  languages: ["he"],
  personaPrompt: "[generated]",
  groundTruthId: "gt-m6-001",
  maxSessions: 3,
  rubricProvisional: false,
};

const MOCK_GT: GroundTruthResponse = {
  id: "gt-m6-001",
  simulationTemplateId: "tpl-m6-001",
  knownFacts: { facts: ["test fact"], doNotInvent: [], riskBoundaries: [] },
  disclosureAllowList: { disclosed: [], unlocked: [], locked: [], triggers: [] },
  escalationRules: {},
  hardOffRampText: "safety text",
  version: 1,
};

const DRAFT_RUBRIC: RubricVersionResponse = {
  id: "rubric-m6-001",
  simulationTemplateId: "tpl-m6-001",
  version: 1,
  status: "DRAFT",
  publishedAt: null,
  criteria: [],
};

// Minimal clients for AuthoringShell
function makeClients(overrides: Record<string, jest.Mock> = {}) {
  return {
    createTemplate: jest.fn().mockResolvedValue(MOCK_TEMPLATE),
    createGroundTruth: jest.fn().mockResolvedValue(MOCK_GT),
    createTriggerRule: jest.fn(),
    getTriggerRules: jest.fn().mockResolvedValue([]),
    generateRubric: jest.fn().mockResolvedValue(DRAFT_RUBRIC),
    updateCriterion: jest.fn(),
    publishRubric: jest.fn().mockResolvedValue({ ...DRAFT_RUBRIC, status: "PUBLISHED" as const }),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests 1-2: AuthoringShell navigation warn
// ---------------------------------------------------------------------------

test("1. Navigate Step 4 with GT empty: warning banner shown; Continue anyway navigates", async () => {
  // Load template via initialTemplateId; groundTruth stays null (not saved yet).
  (getTemplate as jest.Mock).mockResolvedValue(MOCK_TEMPLATE);
  render(<AuthoringShell clients={makeClients()} initialTemplateId="tpl-m6-001" />);

  // Wait for template to load (useEffect with getTemplate)
  await waitFor(() => expect(getTemplate).toHaveBeenCalledWith("tpl-m6-001"));

  // Click the "4. רובריקה" nav button (step index 3 -- enabled when template set)
  const rubricNavBtn = await screen.findByRole("button", {
    name: /שלב 4/,
  });
  fireEvent.click(rubricNavBtn);

  // GT-empty warn banner should appear
  expect(await screen.findByTestId("gt-rubric-warn-banner")).toBeInTheDocument();
  expect(screen.getByText(/Ground Truth is not complete/)).toBeInTheDocument();

  // Click "Continue anyway" -> navigates to rubric step
  fireEvent.click(screen.getByTestId("gt-warn-continue-btn"));

  // Warn banner gone; rubric step content rendered
  expect(screen.queryByTestId("gt-rubric-warn-banner")).not.toBeInTheDocument();
  // RubricEditor initial state shows "צור טיוטת רובריקה" button
  expect(screen.getByRole("button", { name: /צור טיוטת רובריקה/ })).toBeInTheDocument();
});

test("2. Navigate Step 4 with GT saved: no warning", async () => {
  // Go through builder -> GT flow to get groundTruth state set in AuthoringShell.
  const clients = makeClients();
  render(<AuthoringShell clients={clients} />);

  // Step 1: fill builder required fields and submit
  fireEvent.change(screen.getByLabelText(/כותרת הסימולציה/), {
    target: { value: "Test title" },
  });
  fireEvent.change(screen.getByPlaceholderText(/מה המטופל/), {
    target: { value: "Presenting problem" },
  });
  fireEvent.click(screen.getByRole("button", { name: /צור תבנית/ }));

  // Wait for GT step (template set -> step changes to ground-truth)
  await waitFor(() =>
    expect(screen.getByRole("heading", { name: /Ground Truth/ })).toBeInTheDocument(),
  );

  // Step 2: fill facts and submit GT
  const factsInput = screen.getByPlaceholderText(/לדוגמה: יוסי/);
  fireEvent.change(factsInput, { target: { value: "Test fact" } });
  fireEvent.click(screen.getByRole("button", { name: /שמור Ground Truth/ }));

  // Wait for triggers step (groundTruth set -> step changes to triggers)
  await waitFor(() =>
    expect(screen.getByRole("heading", { name: /כללי טריגר/ })).toBeInTheDocument(),
  );

  // Step 3: click rubric nav -> no warn (groundTruth is now set)
  const rubricNavBtn = screen.getByRole("button", { name: /שלב 4/ });
  fireEvent.click(rubricNavBtn);

  // No warn banner
  expect(screen.queryByTestId("gt-rubric-warn-banner")).not.toBeInTheDocument();
  // Rubric step renders immediately
  expect(screen.getByRole("button", { name: /צור טיוטת רובריקה/ })).toBeInTheDocument();
});

// ---------------------------------------------------------------------------
// Tests 3-6: RubricEditor directly (no AuthoringShell needed)
// ---------------------------------------------------------------------------

function renderRubricEditor(rubricProvisional: boolean, onPublish: jest.Mock) {
  return render(
    <RubricEditor
      templateId="tpl-m6-001"
      onGenerate={jest.fn().mockResolvedValue(DRAFT_RUBRIC)}
      onUpdateCriterion={jest.fn()}
      onPublish={onPublish}
      rubricProvisional={rubricProvisional}
      onMarkReviewed={jest.fn().mockResolvedValue(undefined)}
    />,
  );
}

// Generate a rubric draft so the editor enters its "has rubric" render path
async function generateDraft() {
  const btn = screen.getByRole("button", { name: /צור טיוטת רובריקה/ });
  fireEvent.click(btn);
  await waitFor(() =>
    expect(screen.queryByRole("button", { name: /מייצר טיוטה/ })).not.toBeInTheDocument(),
  );
}

test("3. rubricProvisional=true: provisional banner visible", () => {
  renderRubricEditor(true, jest.fn());
  expect(screen.getByTestId("rubric-provisional-banner")).toBeInTheDocument();
  expect(screen.getByText(/Provisional/)).toBeInTheDocument();
  expect(screen.getByTestId("mark-reviewed-btn")).toBeInTheDocument();
});

test("4. rubricProvisional=false: no provisional banner", () => {
  renderRubricEditor(false, jest.fn());
  expect(screen.queryByTestId("rubric-provisional-banner")).not.toBeInTheDocument();
});

test("5. Publish error GROUND_TRUTH_REQUIRED: correct message", async () => {
  const onPublish = jest.fn().mockRejectedValue(
    new ApiError(422, "API error 422: Ground Truth required", "GROUND_TRUTH_REQUIRED"),
  );
  renderRubricEditor(false, onPublish);
  await generateDraft();

  // Click publish
  fireEvent.click(screen.getByRole("button", { name: /פרסם רובריקה/ }));

  await waitFor(() =>
    expect(screen.getByTestId("pub-error-msg")).toBeInTheDocument(),
  );
  expect(screen.getByTestId("pub-error-msg")).toHaveTextContent(
    "Cannot publish -- Ground Truth is empty. Complete Step 2 first.",
  );
});

test("6. Publish error RUBRIC_PROVISIONAL: correct message", async () => {
  const onPublish = jest.fn().mockRejectedValue(
    new ApiError(422, "API error 422: Rubric provisional", "RUBRIC_PROVISIONAL"),
  );
  renderRubricEditor(false, onPublish);
  await generateDraft();

  fireEvent.click(screen.getByRole("button", { name: /פרסם רובריקה/ }));

  await waitFor(() =>
    expect(screen.getByTestId("pub-error-msg")).toBeInTheDocument(),
  );
  expect(screen.getByTestId("pub-error-msg")).toHaveTextContent(
    "Cannot publish -- Rubric is provisional",
  );
});
