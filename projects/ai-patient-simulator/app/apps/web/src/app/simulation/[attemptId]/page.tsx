"use client";

// /simulation/[attemptId] -- Student Simulation Screen.
// Route guard: RequireAuth (client-side). Any authenticated user.
// /simulation/demo is public (no guard) and uses mock data.

import SimulationScreen from "@/components/simulation/SimulationScreen";
import RequireAuth from "@/components/auth/RequireAuth";

interface PageProps {
  params: { attemptId: string };
  // S4-NOA-RESUME: resume params from student dashboard "Continue" link.
  //   resume=1 -> attempt is IN_PROGRESS; fetch transcript on mount.
  //   elapsed=<N> -> seconds elapsed before interruption (for timer display).
  //   elapsed absent -> null (show "-- : --" per Ido A3 ruling).
  searchParams: { lang?: string; resume?: string; elapsed?: string };
}

function SimulationContent({
  attemptId,
  langParam,
  isResume,
  initialElapsedSeconds,
}: {
  attemptId: string;
  langParam?: string;
  isResume: boolean;
  initialElapsedSeconds?: number | null;
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
      isResume={isResume}
      {...(initialElapsedSeconds !== undefined
        ? { initialElapsedSeconds }
        : {})}
    />
  );
}

export default function SimulationPage({ params, searchParams }: PageProps) {
  const { attemptId } = params;
  const { lang: langParam, resume, elapsed } = searchParams;

  // Parse resume context from search params.
  const isResume = resume === "1";

  // elapsed is seconds (integer string from the URL).
  // undefined or non-numeric -> null (SessionHeader shows "-- : --", Ido A3).
  // Only used when isResume=true; omitted for new attempts.
  let resolvedElapsed: number | null | undefined;
  if (isResume) {
    if (elapsed !== undefined && elapsed !== "" && !isNaN(Number(elapsed))) {
      resolvedElapsed = Number(elapsed);
    } else {
      resolvedElapsed = null;
    }
  }
  // When !isResume, resolvedElapsed stays undefined (omitted from spread below)

  return (
    <RequireAuth>
      <SimulationContent
        attemptId={attemptId}
        {...(langParam !== undefined ? { langParam } : {})}
        isResume={isResume}
        {...(resolvedElapsed !== undefined ? { initialElapsedSeconds: resolvedElapsed } : {})}
      />
    </RequireAuth>
  );
}
