"use client";

// /login -- Login page.
// Two flows:
//   (a) Student: invite token + access code.
//       Accepts ?invite=TOKEN query param to prefill the invite token field.
//   (b) Teacher / Admin: email + password.
//
// On success: redirects by role:
//   SYSTEM_ADMIN   -> /admin/credits
//   TEACHER        -> /teacher/<firstCourseId>  (or /teacher if no scope)
//   anything else  -> /student/<userId>  (student dashboard)
//
// Hebrew RTL throughout. Accessible labelled inputs.
//
// NOTE: useSearchParams() requires a Suspense boundary in Next.js App Router.
// LoginForm (which calls useSearchParams) is wrapped in <Suspense> at the bottom.

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";

// ---------------------------------------------------------------------------
// Redirect logic by role
// ---------------------------------------------------------------------------

function redirectTarget(user: AuthUser): string {
  if (user.roles.includes("SYSTEM_ADMIN")) return "/admin/credits";
  if (user.roles.includes("TEACHER") || user.roles.includes("PROGRAMME_MANAGER")) {
    // Use the first COURSE scope to build a real teacher route.
    const courseScope = user.scopes.find(
      (s) => s.scopeType === "COURSE" && (s.role === "TEACHER" || s.role === "PROGRAMME_MANAGER"),
    );
    if (courseScope) return `/teacher/${encodeURIComponent(courseScope.scopeId)}`;
    return "/teacher/demo";
  }
  // Student or any other role -> student dashboard.
  return `/student/${encodeURIComponent(user.userId)}`;
}

// ---------------------------------------------------------------------------
// Styles (inline, no new deps)
// ---------------------------------------------------------------------------

const CONTAINER_STYLE: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f7f7f8",
  fontFamily: "-apple-system, Arial, sans-serif",
  direction: "rtl",
};

const CARD_STYLE: React.CSSProperties = {
  background: "#fff",
  borderRadius: "12px",
  padding: "40px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
  width: "100%",
  maxWidth: "420px",
};

const HEADING_STYLE: React.CSSProperties = {
  fontSize: "1.375rem",
  fontWeight: 600,
  marginBlockEnd: "4px",
  color: "#111827",
};

const SUBHEADING_STYLE: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "#6b7280",
  marginBlockEnd: "28px",
};

const TABS_STYLE: React.CSSProperties = {
  display: "flex",
  borderBlockEnd: "2px solid #e5e7eb",
  marginBlockEnd: "28px",
  gap: "0",
};

function tabStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    paddingBlock: "10px",
    paddingInline: "8px",
    background: "none",
    border: "none",
    borderBlockEnd: active ? "2px solid #2563eb" : "2px solid transparent",
    marginBlockEnd: "-2px",
    cursor: "pointer",
    fontSize: "0.9375rem",
    fontWeight: active ? 600 : 400,
    color: active ? "#2563eb" : "#6b7280",
    transition: "color 0.15s",
  };
}

const FIELD_STYLE: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
  marginBlockEnd: "18px",
};

const LABEL_STYLE: React.CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#374151",
  textAlign: "start",
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  paddingBlock: "10px",
  paddingInline: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  fontSize: "1rem",
  color: "#111827",
  background: "#fff",
  boxSizing: "border-box",
  outline: "none",
  direction: "ltr", // token fields are LTR data
  textAlign: "start",
};

const SUBMIT_STYLE: React.CSSProperties = {
  width: "100%",
  paddingBlock: "12px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "1rem",
  fontWeight: 600,
  cursor: "pointer",
  marginBlockStart: "8px",
};

const ERROR_STYLE: React.CSSProperties = {
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: "8px",
  padding: "12px",
  color: "#dc2626",
  fontSize: "0.875rem",
  marginBlockEnd: "18px",
  textAlign: "start",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Tab = "invite" | "email";

// LoginForm is the inner component that calls useSearchParams.
// It must be wrapped in <Suspense> by the page export below.
function LoginForm() {
  const [tab, setTab] = useState<Tab>("invite");

  // Invite flow fields
  const [inviteToken, setInviteToken] = useState("");
  const [accessCode, setAccessCode] = useState("");

  // Email flow fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const { user, loading, loginWithInvite, loginWithEmail } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Prefill invite token from query param (?invite=TOKEN).
  useEffect(() => {
    const inviteParam = searchParams.get("invite");
    if (inviteParam) {
      setInviteToken(inviteParam);
      setTab("invite");
    }
  }, [searchParams]);

  // If already authenticated, redirect immediately.
  useEffect(() => {
    if (!loading && user) {
      router.replace(redirectTarget(user));
    }
  }, [loading, user, router]);

  if (loading || user) {
    // Show nothing while checking existing session or redirecting.
    return (
      <div style={CONTAINER_STYLE}>
        <div style={{ color: "#6b7280" }}>...</div>
      </div>
    );
  }

  async function handleInviteSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await loginWithInvite(inviteToken.trim(), accessCode.trim());
      // useEffect above will handle the redirect once user state updates.
    } catch (err) {
      setError(err instanceof Error ? err.message : "קוד גישה או טוקן שגויים. נסה/י שנית.");
    } finally {
      setBusy(false);
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await loginWithEmail(email.trim(), password);
      // useEffect above will handle the redirect.
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "כתובת מייל או סיסמה שגויים. נסה/י שנית.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={CONTAINER_STYLE} lang="he">
      <div style={CARD_STYLE}>
        <h1 style={HEADING_STYLE}>AI Patient Simulator</h1>
        <p style={SUBHEADING_STYLE}>כניסה למערכת</p>

        {/* Tab switcher */}
        <div style={TABS_STYLE} role="tablist" aria-label="סוג כניסה">
          <button
            role="tab"
            aria-selected={tab === "invite"}
            aria-controls="panel-invite"
            id="tab-invite"
            style={tabStyle(tab === "invite")}
            onClick={() => { setTab("invite"); setError(null); }}
            type="button"
          >
            סטודנט (קישור הזמנה)
          </button>
          <button
            role="tab"
            aria-selected={tab === "email"}
            aria-controls="panel-email"
            id="tab-email"
            style={tabStyle(tab === "email")}
            onClick={() => { setTab("email"); setError(null); }}
            type="button"
          >
            מרצה / מנהל
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div style={ERROR_STYLE} role="alert" aria-live="polite">
            {error}
          </div>
        )}

        {/* Invite flow */}
        {tab === "invite" && (
          <form
            id="panel-invite"
            role="tabpanel"
            aria-labelledby="tab-invite"
            onSubmit={handleInviteSubmit}
            noValidate
          >
            <div style={FIELD_STYLE}>
              <label htmlFor="inviteToken" style={LABEL_STYLE}>
                טוקן הזמנה
              </label>
              <input
                id="inviteToken"
                type="text"
                value={inviteToken}
                onChange={(e) => setInviteToken(e.target.value)}
                style={INPUT_STYLE}
                autoComplete="off"
                placeholder="הדבק/י את הטוקן מהמייל"
                required
                aria-required="true"
                disabled={busy}
                dir="ltr"
              />
            </div>
            <div style={FIELD_STYLE}>
              <label htmlFor="accessCode" style={LABEL_STYLE}>
                קוד גישה
              </label>
              <input
                id="accessCode"
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                style={INPUT_STYLE}
                autoComplete="off"
                placeholder="4 ספרות / קוד"
                required
                aria-required="true"
                disabled={busy}
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              style={{ ...SUBMIT_STYLE, opacity: busy ? 0.7 : 1 }}
              disabled={busy}
            >
              {busy ? "מתחבר..." : "כניסה"}
            </button>
          </form>
        )}

        {/* Email / password flow */}
        {tab === "email" && (
          <form
            id="panel-email"
            role="tabpanel"
            aria-labelledby="tab-email"
            onSubmit={handleEmailSubmit}
            noValidate
          >
            <div style={FIELD_STYLE}>
              <label htmlFor="email" style={LABEL_STYLE}>
                כתובת מייל
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={INPUT_STYLE}
                autoComplete="email"
                placeholder="name@college.ac.il"
                required
                aria-required="true"
                disabled={busy}
                dir="ltr"
              />
            </div>
            <div style={FIELD_STYLE}>
              <label htmlFor="password" style={LABEL_STYLE}>
                סיסמה
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={INPUT_STYLE}
                autoComplete="current-password"
                placeholder="סיסמה (8 תווים לפחות)"
                required
                aria-required="true"
                disabled={busy}
                dir="ltr"
              />
            </div>
            <button
              type="submit"
              style={{ ...SUBMIT_STYLE, opacity: busy ? 0.7 : 1 }}
              disabled={busy}
            >
              {busy ? "מתחבר..." : "כניסה"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// Page export wraps LoginForm in Suspense so useSearchParams works in static builds.
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#f7f7f8",
            color: "#6b7280",
            fontFamily: "-apple-system, Arial, sans-serif",
          }}
        >
          ...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
