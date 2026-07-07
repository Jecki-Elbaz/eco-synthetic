"use client";

// /teacher/demo -- standalone demo entry for Teacher Class Dashboard.
// Renders without a live API using mock data.
// Navigate to /teacher/demo to see the full teacher dashboard.

import { useEffect, useState } from "react";
import TeacherClassDashboard from "@/components/dashboard/TeacherClassDashboard";
import { fetchClassDashboard } from "@/lib/dashboard-client";
import type { ClassDashboardVM } from "@/lib/dashboard-types";

export default function TeacherDemoPage() {
  const [data, setData] = useState<ClassDashboardVM | null>(null);

  useEffect(() => {
    fetchClassDashboard("course-demo-001").then(setData).catch(console.error);
  }, []);

  if (!data) {
    return (
      <main
        style={{ padding: "40px", color: "#6b7280", textAlign: "center" }}
        aria-busy="true"
        aria-label="טוען..."
      >
        טוען...
      </main>
    );
  }

  return <TeacherClassDashboard data={data} />;
}
