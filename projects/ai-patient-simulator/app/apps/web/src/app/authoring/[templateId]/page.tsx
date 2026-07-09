"use client";

// /authoring/[templateId] -- live authoring for an existing template.
// Loads the authoring shell wired to the real API client.
// When NEXT_PUBLIC_USE_MOCK is true, the mock path fires instead.
// APS-REQ-028/029/030/031/039/040/041
//
// Route guard: RequireRole (client-side). Guard redirects unauthenticated users to /login
// and non-TEACHER/non-SYSTEM_ADMIN users to /403. Guard is client-side because the token
// lives in localStorage; production hardening uses httpOnly cookie + Next.js middleware (APS-014).

import AuthoringShell from "@/components/authoring/AuthoringShell";
import {
  createTemplate,
  createGroundTruth,
  createTriggerRule,
  getTriggerRules,
  generateRubric,
  updateCriterion,
  publishRubric,
} from "@/lib/authoring-client";
import RequireRole from "@/components/auth/RequireRole";
import AuthHeader from "@/components/auth/AuthHeader";

interface PageProps {
  params: { templateId: string };
}

function AuthoringContent({ initialTemplateId }: { initialTemplateId: string }) {
  return (
    <AuthoringShell
      initialTemplateId={initialTemplateId}
      clients={{
        createTemplate,
        createGroundTruth,
        createTriggerRule,
        getTriggerRules,
        generateRubric: (req) => generateRubric(req),
        updateCriterion,
        publishRubric,
      }}
    />
  );
}

export default function AuthoringTemplatePage({ params }: PageProps) {
  return (
    <RequireRole roles={["TEACHER", "SYSTEM_ADMIN"]}>
      <AuthHeader />
      <AuthoringContent initialTemplateId={params.templateId} />
    </RequireRole>
  );
}
