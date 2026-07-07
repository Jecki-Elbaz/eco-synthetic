"use client";

// /debrief/demo -- Standalone demo entry for debrief chat.
// Renders DebriefScreen with mock supervisor (no live API).
// Navigate to /debrief/demo or /debrief/demo?lang=en.

import { use } from "react";
import DebriefScreen from "@/components/debrief/DebriefScreen";

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default function DebriefDemoPage({ searchParams }: PageProps) {
  const { lang: langParam } = use(searchParams);
  const lang: "he" | "en" = langParam === "en" ? "en" : "he";

  return (
    <DebriefScreen
      attemptId="demo-attempt-001"
      lang={lang}
    />
  );
}
