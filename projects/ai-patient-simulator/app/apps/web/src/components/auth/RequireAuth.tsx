"use client";

// RequireAuth -- client-side guard for routes that require any authenticated user.
// Unauthenticated users are redirected to /login.
// No role check -- any logged-in user passes.
// See RequireRole for role-restricted routes.
//
// Guard is client-side because the token lives in localStorage.
// Production hardening: httpOnly cookie + Next.js middleware. Tracked: APS-014.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <main
        style={{
          padding: "40px",
          color: "#6b7280",
          textAlign: "center",
          fontFamily: "-apple-system, Arial, sans-serif",
        }}
        aria-busy="true"
        aria-label="..."
      >
        ...
      </main>
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
