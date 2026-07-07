"use client";

// /feedback/[attemptId] -- Student Feedback Screen.
// Route guard: RequireAuth (client-side). Any authenticated user.
// /feedback/demo is public (no guard) and uses mock data.

import { use } from "react";
import FeedbackScreen from "@/components/feedback/FeedbackScreen";
import RequireAuth from "@/components/auth/RequireAuth";

interface PageProps {
  params: Promise<{ attemptId: string }>;
  searchParams: Promise<{ lang?: string }>;
}

function FeedbackContent({
  attemptId,
  langParam,
}: {
  attemptId: string;
  langParam?: string;
}) {
  const lang: "he" | "en" = langParam === "en" ? "en" : "he";
  return (
    <FeedbackScreen
      attemptId={attemptId}
      sessionTitle={
        lang === "he" ? "ראיון קבלה - מטופל סימולציה" : "Assessment intake - simulated patient"
      }
      lang={lang}
    />
  );
}

export default function FeedbackPage({ params, searchParams }: PageProps) {
  const { attemptId } = use(params);
  const { lang: langParam } = use(searchParams);
  const extraProps = langParam !== undefined ? { langParam } : {};
  return (
    <RequireAuth>
      <FeedbackContent attemptId={attemptId} {...extraProps} />
    </RequireAuth>
  );
}
