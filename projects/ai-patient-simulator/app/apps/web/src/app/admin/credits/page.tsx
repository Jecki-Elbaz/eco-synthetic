"use client";

// /admin/credits -- Credit-Admin UI.
// APS-REQ-143, 144, 147, 148.
// ADMIN-ONLY: SYSTEM_ADMIN only (pilot). COLLEGE_MANAGER is deferred (not a pilot role).
// Students never access this route (APS-REQ-145).
//
// Route guard: RequireRole (client-side). Guard redirects unauthenticated users to /login
// and non-SYSTEM_ADMIN users to /403. Guard is client-side because the token lives in
// localStorage; production hardening uses httpOnly cookie + Next.js middleware (APS-014).

import { useEffect, useState } from "react";
import CreditAdminDashboard from "@/components/admin/CreditAdminDashboard";
import { fetchCreditAdminVM } from "@/lib/credit-admin-client";
import type { CreditAdminVM } from "@/lib/credit-admin-types";
import RequireRole from "@/components/auth/RequireRole";
import AuthHeader from "@/components/auth/AuthHeader";

// Hardcoded to pilot college in Sprint 2; Sprint 3 will derive from auth context.
const PILOT_COLLEGE_ID = "college-001";

function CreditAdminContent() {
  const [data, setData] = useState<CreditAdminVM | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCreditAdminVM(PILOT_COLLEGE_ID)
      .then(setData)
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "שגיאה בטעינת נתוני קרדיטים";
        setError(msg);
      });
  }, []);

  if (error) {
    return (
      <main
        style={{
          padding: "40px",
          color: "#dc2626",
          textAlign: "center",
          fontFamily: "-apple-system, Arial, sans-serif",
        }}
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

export default function CreditAdminPage() {
  return (
    <RequireRole roles={["SYSTEM_ADMIN"]}>
      <AuthHeader />
      <CreditAdminContent />
    </RequireRole>
  );
}
