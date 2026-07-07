"use client";

// AuthoringShell -- top-level orchestrator for the case-authoring flow.
// Renders the sticky header, step-nav sidebar, and the active step component.
// Steps: 1 Builder -> 2 Ground Truth -> 3 Trigger Rules -> 4 Rubric.
// APS-REQ-028/029/030/031/039/040/041

import { useState } from "react";
import "./authoring.css";
import SimulationBuilder from "./SimulationBuilder";
import GroundTruthEditor from "./GroundTruthEditor";
import TriggerRulesEditor from "./TriggerRulesEditor";
import RubricEditor from "./RubricEditor";
import type {
  TemplateResponse,
  GroundTruthResponse,
  TriggerRuleResponse,
  CreateTemplateRequest,
  CreateGroundTruthRequest,
  CreateTriggerRuleRequest,
  GenerateRubricRequest,
  RubricVersionResponse,
  UpdateCriterionRequest,
} from "@aps/shared-types";

// Step definitions
type StepKey = "builder" | "ground-truth" | "triggers" | "rubric";

const STEPS: { key: StepKey; label: string; shortLabel: string }[] = [
  { key: "builder", label: "בנאי סימולציה", shortLabel: "1. בנאי" },
  { key: "ground-truth", label: "Ground Truth", shortLabel: "2. GT" },
  { key: "triggers", label: "כללי טריגר", shortLabel: "3. טריגרים" },
  { key: "rubric", label: "רובריקה", shortLabel: "4. רובריקה" },
];

interface Clients {
  createTemplate: (req: CreateTemplateRequest) => Promise<TemplateResponse>;
  createGroundTruth: (req: CreateGroundTruthRequest) => Promise<GroundTruthResponse>;
  createTriggerRule: (req: CreateTriggerRuleRequest) => Promise<TriggerRuleResponse>;
  getTriggerRules: (templateId: string) => Promise<TriggerRuleResponse[]>;
  generateRubric: (req: GenerateRubricRequest) => Promise<RubricVersionResponse>;
  updateCriterion: (
    rubricVersionId: string,
    criterionId: string,
    req: UpdateCriterionRequest,
  ) => Promise<void>;
  publishRubric: (rubricVersionId: string) => Promise<RubricVersionResponse>;
}

interface Props {
  clients: Clients;
}

function stepIndex(key: StepKey): number {
  return STEPS.findIndex((s) => s.key === key);
}

export default function AuthoringShell({ clients }: Props) {
  const [activeStep, setActiveStep] = useState<StepKey>("builder");
  const [template, setTemplate] = useState<TemplateResponse | null>(null);
  const [groundTruth, setGroundTruth] = useState<GroundTruthResponse | null>(null);
  const [triggerRules, setTriggerRules] = useState<TriggerRuleResponse[]>([]);

  const activeIdx = stepIndex(activeStep);

  function isDone(key: StepKey): boolean {
    switch (key) {
      case "builder":
        return template !== null;
      case "ground-truth":
        return groundTruth !== null;
      case "triggers":
        // Triggers step is optional; mark done if user has navigated past it
        return activeIdx > 2;
      case "rubric":
        return false; // never "done" from nav perspective
    }
  }

  function canNavigateTo(key: StepKey): boolean {
    const idx = stepIndex(key);
    // Can always go back, or forward to next unlocked step
    if (idx <= activeIdx) return true;
    // Forward navigation: require previous steps completed
    if (idx === 1 && template !== null) return true;
    if (idx === 2 && groundTruth !== null) return true;
    if (idx === 3 && template !== null) return true; // rubric can start after builder
    return false;
  }

  const title = template ? template.title : "כלי יצירת מקרים";

  return (
    <div className="auth-root">
      {/* Sticky header */}
      <header className="auth-header">
        <span className="auth-header__wordmark">APS</span>
        <div style={{ flex: 1, minInlineSize: 0, paddingInline: "16px" }}>
          <p className="auth-header__title">{title}</p>
          <p className="auth-header__subtitle">כלי יצירת מקרים לסגל הוראה</p>
        </div>
        <div className="auth-header__actions">
          {template && (
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--color-muted)",
                direction: "ltr",
                unicodeBidi: "embed",
              }}
            >
              {template.id}
            </span>
          )}
        </div>
      </header>

      <div className="auth-layout">
        {/* Step nav */}
        <nav className="auth-step-nav" aria-label="שלבי יצירת מקרה">
          {STEPS.map((step, idx) => {
            const done = isDone(step.key);
            const active = step.key === activeStep;
            const enabled = canNavigateTo(step.key);
            return (
              <button
                key={step.key}
                type="button"
                className={
                  "auth-step-nav__item" +
                  (active ? " auth-step-nav__item--active" : "") +
                  (done && !active ? " auth-step-nav__item--done" : "")
                }
                onClick={() => enabled && setActiveStep(step.key)}
                disabled={!enabled}
                aria-current={active ? "step" : undefined}
                aria-label={`שלב ${idx + 1}: ${step.label}${done ? " (הושלם)" : ""}${!enabled ? " (נעול)" : ""}`}
              >
                <span className="auth-step-nav__dot" aria-hidden="true">
                  {done && !active ? "v" : idx + 1}
                </span>
                <span>{step.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Main content */}
        <main className="auth-content" id="authoring-main">
          {activeStep === "builder" && (
            <SimulationBuilder
              onCreated={(t) => {
                setTemplate(t);
                setActiveStep("ground-truth");
              }}
              onSubmit={clients.createTemplate}
            />
          )}

          {activeStep === "ground-truth" && template && (
            <GroundTruthEditor
              templateId={template.id}
              initial={groundTruth}
              onSaved={(gt) => {
                setGroundTruth(gt);
                setActiveStep("triggers");
              }}
              onSubmit={clients.createGroundTruth}
            />
          )}

          {activeStep === "ground-truth" && !template && (
            <div className="auth-section">
              <div className="auth-notice auth-notice--warn">
                <span className="auth-notice__title">יש להשלים תחילה את שלב 1</span>
                <span>צור תבנית סימולציה לפני שממשיכים לשלב ה-Ground Truth.</span>
              </div>
              <button
                type="button"
                className="auth-btn auth-btn--primary"
                onClick={() => setActiveStep("builder")}
              >
                חזור לשלב 1
              </button>
            </div>
          )}

          {activeStep === "triggers" && template && (
            <TriggerRulesEditor
              templateId={template.id}
              initial={triggerRules}
              onRuleAdded={(rule) => {
                setTriggerRules((prev) => {
                  const exists = prev.some((r) => r.id === rule.id);
                  return exists ? prev : [...prev, rule];
                });
              }}
              onAddRule={clients.createTriggerRule}
            />
          )}

          {activeStep === "triggers" && !template && (
            <div className="auth-section">
              <div className="auth-notice auth-notice--warn">
                <span className="auth-notice__title">יש להשלים תחילה את שלב 1</span>
                <span>צור תבנית סימולציה לפני שממשיכים לכללי הטריגר.</span>
              </div>
              <button
                type="button"
                className="auth-btn auth-btn--primary"
                onClick={() => setActiveStep("builder")}
              >
                חזור לשלב 1
              </button>
            </div>
          )}

          {activeStep === "rubric" && template && (
            <RubricEditor
              templateId={template.id}
              onGenerate={() =>
                clients.generateRubric({
                  simulationTemplateId: template.id,
                })
              }
              onUpdateCriterion={clients.updateCriterion}
              onPublish={clients.publishRubric}
            />
          )}

          {activeStep === "rubric" && !template && (
            <div className="auth-section">
              <div className="auth-notice auth-notice--warn">
                <span className="auth-notice__title">יש להשלים תחילה את שלב 1</span>
                <span>צור תבנית סימולציה לפני שממשיכים לרובריקה.</span>
              </div>
              <button
                type="button"
                className="auth-btn auth-btn--primary"
                onClick={() => setActiveStep("builder")}
              >
                חזור לשלב 1
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
