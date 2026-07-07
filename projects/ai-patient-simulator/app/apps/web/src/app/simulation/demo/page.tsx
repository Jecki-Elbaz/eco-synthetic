// /simulation/demo -- Standalone demo entry that renders without a live API.
// NEXT_PUBLIC_USE_MOCK=true is implied at build time when NEXT_PUBLIC_API_URL
// is absent. This page passes a fixed demo attemptId.
// Navigate to /simulation/demo or /simulation/demo?lang=en to see both locales.

"use client";

import { use } from "react";
import SimulationScreen from "@/components/simulation/SimulationScreen";

interface PageProps {
  searchParams: Promise<{ lang?: string }>;
}

export default function SimulationDemoPage({ searchParams }: PageProps) {
  const { lang: langParam } = use(searchParams);
  const lang: "he" | "en" = langParam === "en" ? "en" : "he";

  return (
    <SimulationScreen
      attemptId="demo-attempt-001"
      title={
        lang === "he"
          ? "הדגמה: ראיון קבלה - מטופל סימולציה"
          : "Demo: Assessment intake - simulated patient"
      }
      lang={lang}
      maxTurns={75}
      softWarnAt={60}
      minTurns={5}
      timerMode="elapsed"
      micAvailable={true}
      welfareResource={
        lang === "he" ? "גורם הרווחה של המוסד" : "institutional welfare resource"
      }
    />
  );
}
