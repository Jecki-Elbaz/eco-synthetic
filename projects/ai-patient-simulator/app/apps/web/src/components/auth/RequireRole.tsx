"use client";

// RequireRole -- client-side route guard.
//
// Because the access token lives in localStorage (not an httpOnly cookie),
// Next.js middleware cannot read it and enforce guards at the edge.
// This component implements CLIENT-SIDE guards as a result:
//   - Unauthenticated users -> redirect to /login
//   - Authenticated but missing required role -> redirect to /403
//
// SECURITY NOTE: this is the pilot SPA pattern. The production-hardening path
// is to move the token to an httpOnly cookie and add Next.js middleware that
// reads the cookie and redirects server-side, before the page is ever served.
// Tracked: APS-014.
//
// /demo routes are kept PUBLIC -- they do not use this guard.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { RoleType } from "@aps/shared-types";

interface RequireRoleProps {
  roles: RoleType[];
  children: React.ReactNode;
}

export default function RequireRole({ roles, children }: RequireRoleProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    const hasRole = roles.some((r) => user.roles.includes(r));
    if (!hasRole) {
      router.replace("/403");
    }
  }, [loading, user, roles, router]);

  // While checking auth state, render nothing (avoids flash of protected content).
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

  const hasRole = roles.some((r) => user.roles.includes(r));
  if (!hasRole) return null;

  return <>{children}</>;
}
