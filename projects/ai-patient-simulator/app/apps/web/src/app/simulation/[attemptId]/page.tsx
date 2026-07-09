"use client";

// /simulation/[attemptId] -- Student Simulation Screen.
// Route guard: RequireAuth (client-side). Any authenticated user.
// /simulation/demo is public (no guard) and uses mock data.

import SimulationScreen from "@/components/simulation/SimulationScreen";
import RequireAuth from "@/components/auth/RequireAuth";

interface PageProps {
  params: { attemptId: string };
  searchParams: { lang?: string };
}

function SimulationContent({
  attemptId,
  langParam,
}: {
  attemptId: string;
  langParam?: string;
}) {
  const lang: "he" | "en" = langParam === "en" ? "en" : "he";
  return (
    <SimulationScreen
      attemptId={attemptId}
      title={lang === "he" ? "סימולציה: ראיון קבלה" : "Simulation: Assessment intake"}
      lang={lang}
      maxTurns={75}
      softWarnAt={60}
      minTurns={10}
      timerMode="elapsed"
      micAvailable={true}
    />
  );
}

export default function SimulationPage({ params, searchParams }: PageProps) {
  const { attemptId } = params;
  const { lang: langParam } = searchParams;
  const extraProps = langParam !== undefined ? { langParam } : {};
  return (
    <RequireAuth>
      <SimulationContent attemptId={attemptId} {...extraProps} />
    </RequireAuth>
  );
}
