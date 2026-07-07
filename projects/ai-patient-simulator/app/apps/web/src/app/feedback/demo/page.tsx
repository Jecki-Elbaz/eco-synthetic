"use client";

// /feedback/demo -- Standalone demo entry.
// Renders FeedbackScreen with mock data (no live API needed).
// Navigate to /feedback/demo or /feedback/demo?lang=en.

import { use } from "react";
import FeedbackScreen from "@/components/feedback/FeedbackScreen";

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default function FeedbackDemoPage({ searchParams }: PageProps) {
  const { lang: langParam } = use(searchParams);
  const lang: "he" | "en" = langParam === "en" ? "en" : "he";

  return (
    <FeedbackScreen
      attemptId="demo-attempt-001"
      sessionTitle={
        lang === "he"
          ? "הדגמה: ראיון קבלה - מטופל סימולציה"
          : "Demo: Assessment intake - simulated patient"
      }
      lang={lang}
    />
  );
}
