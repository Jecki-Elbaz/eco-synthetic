"use client";

// AuthHeader -- minimal auth bar shown on authenticated pages.
// Shows the logged-in user's display name and a logout button.
// Hebrew RTL: uses CSS logical properties throughout.

import { useAuth } from "@/lib/auth";

export default function AuthHeader() {
  const { user, logout } = useAuth();

  if (!user) return null;

  function handleLogout() {
    logout();
  }

  const displayName = user.displayName ?? user.email ?? user.userId;

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBlock: "8px",
        paddingInline: "20px",
        background: "#fff",
        borderBlockEnd: "1px solid #e5e7eb",
        fontFamily: "-apple-system, Arial, sans-serif",
        fontSize: "0.875rem",
        color: "#374151",
      }}
    >
      <span style={{ color: "#6b7280" }}>{displayName}</span>
      <button
        onClick={handleLogout}
        style={{
          background: "none",
          border: "1px solid #d1d5db",
          borderRadius: "6px",
          paddingBlock: "4px",
          paddingInline: "12px",
          cursor: "pointer",
          color: "#374151",
          fontSize: "0.8125rem",
        }}
        type="button"
      >
        התנתקות
      </button>
    </header>
  );
}
