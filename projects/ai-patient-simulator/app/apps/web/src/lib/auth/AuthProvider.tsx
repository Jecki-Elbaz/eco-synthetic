"use client";

// AuthProvider -- client-side session/auth context.
// Holds accessToken + MeResponse user; persists the token in localStorage so
// a page reload keeps the session.
//
// SECURITY NOTE (pilot SPA): localStorage-based token storage is acceptable for
// the pilot single-page-app. The production-hardening path is an httpOnly-cookie
// session + Next.js middleware that can see the token server-side and enforce
// guards at the edge. Tracked: APS-014.
//
// The token is stored under the key "aps_access_token".
//
// APS-014 S6-NOA-MIDDLEWARE: at login, a non-httpOnly cookie "aps_mw_roles" is
// written so that server-side Next.js middleware can enforce route protection
// before the page shell is served (APS-REQ-145 student-visibility-NONE).
// The cookie is NOT httpOnly because JavaScript must clear it at logout.
// SECURITY: the API enforces authoritative RBAC on every call regardless of
// cookie state. A tampered cookie may expose a page shell but never data.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { MeResponse, LoginResponse } from "@aps/shared-types";

const TOKEN_KEY = "aps_access_token";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser extends MeResponse {}

export interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  loginWithInvite: (inviteToken: string, accessCode: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function storeToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // localStorage may be blocked in sandboxed iframes; ignore silently.
  }
}

function loadToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Role cookie helpers (APS-014 S6-NOA-MIDDLEWARE)
// Writes/clears the non-httpOnly "aps_mw_roles" cookie used by middleware.ts
// to enforce server-side route protection before the page shell is served.
// SSR guard: check document availability before writing (middleware.ts runs
// server-side and never calls these functions directly).
// ---------------------------------------------------------------------------

function storeRoleCookie(roles: string[]): void {
  if (typeof document === "undefined") return;
  // Oren S6 review i-1: Secure attribute omitted intentionally for HTTP pilot
  // compatibility (Secure would suppress the cookie over HTTP). APS-004
  // production hardening replaces this cookie mechanism entirely (httpOnly +
  // signed session), at which point Secure applies.
  document.cookie =
    "aps_mw_roles=" + roles.join(",") + "; path=/; SameSite=Strict";
}

function clearRoleCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = "aps_mw_roles=; path=/; SameSite=Strict; max-age=0";
}

async function fetchMe(token: string): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    if (res.status === 401) {
      clearToken();
      return null;
    }
    if (!res.ok) return null;
    return (await res.json()) as AuthUser;
  } catch {
    return null;
  }
}

async function postLogin(
  path: string,
  body: Record<string, string>,
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let msg: string;
    try {
      const parsed = JSON.parse(text) as { message?: string };
      msg = parsed.message ?? text;
    } catch {
      msg = text || `HTTP ${res.status}`;
    }
    throw new Error(msg);
  }
  return res.json() as Promise<LoginResponse>;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // On mount: if a token exists in localStorage, call /auth/me to hydrate.
  // If fetchMe returns null (expired/invalid token), clear the role cookie so
  // middleware does not retain a stale role grant from the prior session.
  useEffect(() => {
    const token = loadToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe(token).then((me) => {
      setUser(me);
      if (!me) clearRoleCookie();
      setLoading(false);
    });
  }, []);

  const loginWithInvite = useCallback(
    async (inviteToken: string, accessCode: string): Promise<void> => {
      const resp = await postLogin("auth/invite-login", {
        inviteToken,
        accessCode,
      });
      storeToken(resp.accessToken);
      // Hydrate full user from /auth/me to get canonical MeResponse shape.
      const me = await fetchMe(resp.accessToken);
      setUser(me);
      // Write role cookie so middleware.ts can enforce route protection
      // server-side before the next page navigation renders. (APS-014)
      if (me) storeRoleCookie(me.roles ?? []);
    },
    [],
  );

  const loginWithEmail = useCallback(
    async (email: string, password: string): Promise<void> => {
      const resp = await postLogin("auth/email-login", { email, password });
      storeToken(resp.accessToken);
      const me = await fetchMe(resp.accessToken);
      setUser(me);
      // Write role cookie so middleware.ts can enforce route protection
      // server-side before the next page navigation renders. (APS-014)
      if (me) storeRoleCookie(me.roles ?? []);
    },
    [],
  );

  const logout = useCallback((): void => {
    clearToken();
    clearRoleCookie();
    setUser(null);
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithInvite, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
