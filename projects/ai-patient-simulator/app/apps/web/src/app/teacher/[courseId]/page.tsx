"use client";

// /teacher/[courseId] -- Teacher Class Dashboard route.
// Fetches class dashboard data (mock or live) and renders the dashboard.
// APS-REQ-088.
//
// Route guard: RequireRole (client-side) -- TEACHER or SYSTEM_ADMIN only.
// Guard is client-side because the token lives in localStorage.
// Production hardening: httpOnly cookie + Next.js middleware (APS-014).

import { use, useEffect, useState } from "react";
import TeacherClassDashboard from "@/components/dashboard/TeacherClassDashboard";
import { fetchClassDashboard } from "@/lib/dashboard-client";
import type { ClassDashboardVM } from "@/lib/dashboard-types";
import RequireRole from "@/components/auth/RequireRole";
import AuthHeader from "@/components/auth/AuthHeader";

interface PageProps {
  params: Promise<{ courseId: string }>;
}

function TeacherDashboardContent({ courseId }: { courseId: string }) {
  const [data, setData] = useState<ClassDashboardVM | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClassDashboard(courseId)
      .then(setData)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "שגיאה בטעינת הנתונים");
      });
  }, [courseId]);

  if (error) {
    return (
      <main style={{ padding: "40px", color: "#dc2626" }}>
        שגיאה: {error}
      </main>
    );
  }

  if (!data) {
    return (
      <main
        style={{
          padding: "40px",
          color: "#6b7280",
          textAlign: "center",
        }}
        aria-busy="true"
        aria-label="טוען נתוני כיתה..."
      >
        טוען...
      </main>
    );
  }

  return <TeacherClassDashboard data={data} />;
}

export default function TeacherCourseDashboardPage({ params }: PageProps) {
  const { courseId } = use(params);
  return (
    <RequireRole roles={["TEACHER", "SYSTEM_ADMIN"]}>
      <AuthHeader />
      <TeacherDashboardContent courseId={courseId} />
    </RequireRole>
  );
}
