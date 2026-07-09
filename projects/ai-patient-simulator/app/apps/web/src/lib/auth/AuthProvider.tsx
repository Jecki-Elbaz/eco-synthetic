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
  useEffect(() => {
    const token = loadToken();
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe(token).then((me) => {
      setUser(me);
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
    },
    [],
  );

  const loginWithEmail = useCallback(
    async (email: string, password: string): Promise<void> => {
      const resp = await postLogin("auth/email-login", { email, password });
      storeToken(resp.accessToken);
      const me = await fetchMe(resp.accessToken);
      setUser(me);
    },
    [],
  );

  const logout = useCallback((): void => {
    clearToken();
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
