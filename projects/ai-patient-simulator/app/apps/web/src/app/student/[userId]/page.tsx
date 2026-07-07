"use client";

// /student/[userId] -- Student Dashboard route.
// Fetches student dashboard data (mock or live) and renders the dashboard.
// APS-REQ-089.
//
// Route guard: RequireAuth (client-side) -- any authenticated user.
// Students see only their own dashboard (userId in URL). A future enforcement
// layer should verify userId === session.userId for students; teacher/admin
// can view any student. Tracked as hardening work for Sprint 3+.
// Production hardening: httpOnly cookie + Next.js middleware (APS-014).

import { use, useEffect, useState } from "react";
import StudentDashboard from "@/components/student/StudentDashboard";
import { fetchStudentDashboard } from "@/lib/dashboard-client";
import type { StudentDashboardVM } from "@/lib/dashboard-types";
import RequireAuth from "@/components/auth/RequireAuth";
import AuthHeader from "@/components/auth/AuthHeader";

interface PageProps {
  params: Promise<{ userId: string }>;
}

function StudentDashboardContent({ userId }: { userId: string }) {
  const [data, setData] = useState<StudentDashboardVM | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudentDashboard(userId)
      .then(setData)
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "שגיאה בטעינת הנתונים");
      });
  }, [userId]);

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
        style={{ padding: "40px", color: "#6b7280", textAlign: "center" }}
        aria-busy="true"
        aria-label="טוען נתוני סטודנט..."
      >
        טוען...
      </main>
    );
  }

  return <StudentDashboard data={data} />;
}

export default function StudentDashboardPage({ params }: PageProps) {
  const { userId } = use(params);
  return (
    <RequireAuth>
      <AuthHeader />
      <StudentDashboardContent userId={userId} />
    </RequireAuth>
  );
}
