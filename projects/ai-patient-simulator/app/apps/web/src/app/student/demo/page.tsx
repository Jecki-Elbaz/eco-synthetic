"use client";

// /student/demo -- standalone demo entry for Student Dashboard.
// Renders without a live API using mock data.
// Navigate to /student/demo to see the full student dashboard.

import { useEffect, useState } from "react";
import StudentDashboard from "@/components/student/StudentDashboard";
import { fetchStudentDashboard } from "@/lib/dashboard-client";
import type { StudentDashboardVM } from "@/lib/dashboard-types";

export default function StudentDemoPage() {
  const [data, setData] = useState<StudentDashboardVM | null>(null);

  useEffect(() => {
    fetchStudentDashboard("student-demo-001").then(setData).catch(console.error);
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

  return <StudentDashboard data={data} />;
}
