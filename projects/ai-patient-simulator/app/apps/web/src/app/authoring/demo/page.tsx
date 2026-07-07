"use client";

// /authoring/demo -- standalone demo for the Case Authoring UI.
// Renders the full 4-step authoring flow using the mock path (no live API).
// Teacher/author tool; not student-facing.
// APS-REQ-028/029/030/031/039/040/041

import AuthoringShell from "@/components/authoring/AuthoringShell";
import {
  createTemplate,
  createGroundTruth,
  createTriggerRule,
  generateRubric,
  updateCriterion,
  publishRubric,
} from "@/lib/authoring-client";

export default function AuthoringDemoPage() {
  return (
    <AuthoringShell
      clients={{
        createTemplate,
        createGroundTruth,
        createTriggerRule,
        getTriggerRules: async () => [],
        generateRubric: (req) => generateRubric(req),
        updateCriterion,
        publishRubric,
      }}
    />
  );
}
