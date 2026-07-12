/**
 * S5-NOA-ARC-AUTHOR: max_sessions field unit tests.
 * Envelope acceptance tests (5 cases):
 *   1. Renders with default value 3. PASS.
 *   2. Input value 5: validation error shown, submit blocked. PASS.
 *   3. Input value 1: validation error shown, submit blocked. PASS.
 *   4. Input value 2: validates, form submit proceeds. PASS.
 *   5. Input value 4: validates, form submit proceeds. PASS.
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SimulationBuilder from "../components/authoring/SimulationBuilder";
import type { TemplateResponse } from "@aps/shared-types";

const MOCK_TEMPLATE: TemplateResponse = {
  id: "tpl-001",
  title: "Test",
  version: 1,
  clinicalModel: "CBT",
  studentLevel: "שנה ב",
  challengeLevel: 3,
  riskLevel: "LOW",
  languages: ["he"],
  personaPrompt: "[generated]",
  groundTruthId: "gt-001",
  maxSessions: 3,
  rubricProvisional: false,
};

function makeOnSubmit(maxSessions = 3) {
  return jest.fn().mockResolvedValue({ ...MOCK_TEMPLATE, maxSessions });
}

// ---------------------------------------------------------------------------
// 1. Default value 3
// ---------------------------------------------------------------------------

test("renders max-sessions field with default value 3", () => {
  render(
    <SimulationBuilder onCreated={jest.fn()} onSubmit={makeOnSubmit()} />,
  );
  const input = screen.getByLabelText(
    /מספר פגישות בקשת הטיפול/,
  ) as HTMLInputElement;
  expect(input).toBeInTheDocument();
  expect(Number(input.value)).toBe(3);
});

// ---------------------------------------------------------------------------
// Helper: fill required fields so maxSessions validation is reachable
// ---------------------------------------------------------------------------

function fillRequired() {
  fireEvent.change(screen.getByLabelText(/כותרת הסימולציה/), {
    target: { value: "Test Title" },
  });
  // presentingProblem textarea: find by placeholder
  fireEvent.change(
    screen.getByPlaceholderText(/מה המטופל/),
    { target: { value: "Presenting problem text" } },
  );
}

// ---------------------------------------------------------------------------
// 2. Input value 5: inline error shown, submit blocked
// ---------------------------------------------------------------------------

test("input value 5: validation error shown, submit blocked", async () => {
  const onSubmit = makeOnSubmit(5);
  const onCreated = jest.fn();
  render(<SimulationBuilder onCreated={onCreated} onSubmit={onSubmit} />);

  fillRequired();

  const sessionsInput = screen.getByLabelText(/מספר פגישות בקשת הטיפול/);
  fireEvent.change(sessionsInput, { target: { value: "5" } });

  // Inline error visible
  expect(screen.getByTestId("max-sessions-error")).toBeInTheDocument();

  // Submit blocked
  fireEvent.click(screen.getByRole("button", { name: /צור תבנית/ }));
  expect(onSubmit).not.toHaveBeenCalled();
});

// ---------------------------------------------------------------------------
// 3. Input value 1: inline error shown, submit blocked
// ---------------------------------------------------------------------------

test("input value 1: validation error shown, submit blocked", async () => {
  const onSubmit = makeOnSubmit(1);
  render(
    <SimulationBuilder onCreated={jest.fn()} onSubmit={onSubmit} />,
  );

  fillRequired();

  const sessionsInput = screen.getByLabelText(/מספר פגישות בקשת הטיפול/);
  fireEvent.change(sessionsInput, { target: { value: "1" } });

  expect(screen.getByTestId("max-sessions-error")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /צור תבנית/ }));
  expect(onSubmit).not.toHaveBeenCalled();
});

// ---------------------------------------------------------------------------
// 4. Input value 2: no error, form submit proceeds
// ---------------------------------------------------------------------------

test("input value 2: validates, form submit proceeds", async () => {
  const onSubmit = makeOnSubmit(2);
  const onCreated = jest.fn();
  render(<SimulationBuilder onCreated={onCreated} onSubmit={onSubmit} />);

  fillRequired();

  const sessionsInput = screen.getByLabelText(/מספר פגישות בקשת הטיפול/);
  fireEvent.change(sessionsInput, { target: { value: "2" } });

  // No inline error
  expect(screen.queryByTestId("max-sessions-error")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /צור תבנית/ }));

  // onSubmit called with maxSessions=2 in builder
  await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  const [req] = onSubmit.mock.calls[0] as [{ builder: { maxSessions: number } }];
  expect(req.builder.maxSessions).toBe(2);
});

// ---------------------------------------------------------------------------
// 5. Input value 4: no error, form submit proceeds
// ---------------------------------------------------------------------------

test("input value 4: validates, form submit proceeds", async () => {
  const onSubmit = makeOnSubmit(4);
  const onCreated = jest.fn();
  render(<SimulationBuilder onCreated={onCreated} onSubmit={onSubmit} />);

  fillRequired();

  const sessionsInput = screen.getByLabelText(/מספר פגישות בקשת הטיפול/);
  fireEvent.change(sessionsInput, { target: { value: "4" } });

  expect(screen.queryByTestId("max-sessions-error")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: /צור תבנית/ }));

  await waitFor(() => expect(onSubmit).toHaveBeenCalled());
  const [req] = onSubmit.mock.calls[0] as [{ builder: { maxSessions: number } }];
  expect(req.builder.maxSessions).toBe(4);
});
