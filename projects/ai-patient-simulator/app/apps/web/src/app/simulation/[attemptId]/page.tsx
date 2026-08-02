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
  // S5-NOA-ARC-STUDENT (wiring fix 2026-08-02): arc session params.
  //   sessionNumber=<N> -> passed to SimulationScreen so isArcContinuation resolves
  //     true at N>=2, enabling welfare modal, gap briefing, and context panel.
  //   maxSessions=<M> -> total sessions in this arc (default 3 if absent).
  searchParams: { lang?: string; resume?: string; elapsed?: string; sessionNumber?: string; maxSessions?: string };
}

function SimulationContent({
  attemptId,
  langParam,
  isResume,
  initialElapsedSeconds,
  sessionNumber,
  maxSessions,
}: {
  attemptId: string;
  langParam?: string;
  isResume: boolean;
  initialElapsedSeconds?: number | null;
  // S5-NOA-ARC-STUDENT wiring (2026-08-02): arc session number so SimulationScreen
  // can resolve isArcContinuation and show welfare modal + gap briefing at sessions 2+.
  sessionNumber?: number | null;
  maxSessions?: number;
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
      {...(sessionNumber !== undefined
        ? { sessionNumber }
        : {})}
      {...(maxSessions !== undefined
        ? { maxSessions }
        : {})}
    />
  );
}

export default function SimulationPage({ params, searchParams }: PageProps) {
  const { attemptId } = params;
  const { lang: langParam, resume, elapsed, sessionNumber, maxSessions } = searchParams;

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

  // S5-NOA-ARC-STUDENT wiring (2026-08-02): parse arc session params so the page
  // can pass sessionNumber to SimulationScreen, enabling welfare modal + gap briefing.
  // sessionNumber=<N> (N integer >= 1) -> passed as number; absent or non-numeric -> null.
  // maxSessions=<M> -> defaults to 3 if absent (matches SimulationScreen default).
  const resolvedSessionNumber: number | null =
    sessionNumber !== undefined && sessionNumber !== "" && !isNaN(Number(sessionNumber))
      ? Number(sessionNumber)
      : null;
  const resolvedMaxSessions: number | undefined =
    maxSessions !== undefined && maxSessions !== "" && !isNaN(Number(maxSessions))
      ? Number(maxSessions)
      : undefined;

  return (
    <RequireAuth>
      <SimulationContent
        attemptId={attemptId}
        {...(langParam !== undefined ? { langParam } : {})}
        isResume={isResume}
        {...(resolvedElapsed !== undefined ? { initialElapsedSeconds: resolvedElapsed } : {})}
        sessionNumber={resolvedSessionNumber}
        {...(resolvedMaxSessions !== undefined ? { maxSessions: resolvedMaxSessions } : {})}
      />
    </RequireAuth>
  );
}
