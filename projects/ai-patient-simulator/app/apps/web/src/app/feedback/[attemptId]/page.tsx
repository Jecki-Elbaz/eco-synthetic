"use client";

// /feedback/[attemptId] -- Student Feedback Screen.
// Route guard: RequireAuth (client-side). Any authenticated user.
// /feedback/demo is public (no guard) and uses mock data.

import FeedbackScreen from "@/components/feedback/FeedbackScreen";
import RequireAuth from "@/components/auth/RequireAuth";

interface PageProps {
  params: { attemptId: string };
  searchParams: { lang?: string; preview?: string };
}

function FeedbackContent({
  attemptId,
  langParam,
  isPreview,
}: {
  attemptId: string;
  langParam?: string;
  isPreview?: true;
}) {
  const lang: "he" | "en" = langParam === "en" ? "en" : "he";
  const previewProp = isPreview === true ? { isPreview: true as const } : {};
  return (
    <FeedbackScreen
      attemptId={attemptId}
      sessionTitle={
        lang === "he" ? "ראיון קבלה - מטופל סימולציה" : "Assessment intake - simulated patient"
      }
      lang={lang}
      {...previewProp}
    />
  );
}

export default function FeedbackPage({ params, searchParams }: PageProps) {
  const { attemptId } = params;
  const { lang: langParam, preview } = searchParams;
  const extraProps = langParam !== undefined ? { langParam } : {};
  // Only pass isPreview when true to satisfy exactOptionalPropertyTypes
  const previewProp = preview === "1" ? { isPreview: true as const } : {};
  return (
    <RequireAuth>
      <FeedbackContent attemptId={attemptId} {...previewProp} {...extraProps} />
    </RequireAuth>
  );
}
