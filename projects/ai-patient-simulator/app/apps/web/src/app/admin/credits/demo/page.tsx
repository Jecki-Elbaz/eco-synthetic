"use client";

// /admin/credits/demo -- standalone demo entry for Credit-Admin UI.
// Renders without a live API using mock data (NEXT_PUBLIC_USE_MOCK implied by
// absence of NEXT_PUBLIC_API_URL in dev).
// Navigate to /admin/credits/demo to see the full credit-admin dashboard.
// APS-REQ-143, 144, 147, 148.

import { useEffect, useState } from "react";
import CreditAdminDashboard from "@/components/admin/CreditAdminDashboard";
import { fetchCreditAdminVM } from "@/lib/credit-admin-client";
import type { CreditAdminVM } from "@/lib/credit-admin-types";

export default function CreditAdminDemoPage() {
  const [data, setData] = useState<CreditAdminVM | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCreditAdminVM("college-001").then(setData).catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : "שגיאה";
      setError(msg);
    });
  }, []);

  if (error) {
    return (
      <main
        style={{ padding: "40px", color: "#dc2626", textAlign: "center", fontFamily: "-apple-system, Arial, sans-serif" }}
        role="alert"
      >
        {error}
      </main>
    );
  }

  if (!data) {
    return (
      <main
        style={{ padding: "40px", color: "#6b7280", textAlign: "center", fontFamily: "-apple-system, Arial, sans-serif" }}
        aria-busy="true"
        aria-label="טוען..."
      >
        טוען...
      </main>
    );
  }

  return <CreditAdminDashboard data={data} />;
}
