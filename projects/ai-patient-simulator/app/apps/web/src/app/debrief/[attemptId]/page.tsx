"use client";

// /debrief/[attemptId] -- Debrief Chat Screen (APS-REQ-073).
// Route guard: RequireAuth (client-side). Any authenticated user.
// /debrief/demo is public (no guard) and uses mock data.

import DebriefScreen from "@/components/debrief/DebriefScreen";
import RequireAuth from "@/components/auth/RequireAuth";

interface PageProps {
  params: { attemptId: string };
  searchParams: { lang?: string };
}

function DebriefContent({
  attemptId,
  langParam,
}: {
  attemptId: string;
  langParam?: string;
}) {
  const lang: "he" | "en" = langParam === "en" ? "en" : "he";
  return <DebriefScreen attemptId={attemptId} lang={lang} />;
}

export default function DebriefPage({ params, searchParams }: PageProps) {
  const { attemptId } = params;
  const { lang: langParam } = searchParams;
  const extraProps = langParam !== undefined ? { langParam } : {};
  return (
    <RequireAuth>
      <DebriefContent attemptId={attemptId} {...extraProps} />
    </RequireAuth>
  );
}
