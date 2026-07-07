// /403 -- Forbidden page.
// Shown by RequireRole when a user is authenticated but lacks the required role.
// Hebrew RTL.

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "403 -- אין הרשאה",
};

export default function ForbiddenPage() {
  return (
    <main
      dir="rtl"
      lang="he"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "40px",
        fontFamily: "-apple-system, Arial, sans-serif",
        textAlign: "center",
        color: "#374151",
      }}
    >
      <h1 style={{ fontSize: "3rem", fontWeight: 700, color: "#dc2626", marginBlockEnd: "8px" }}>
        403
      </h1>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginBlockEnd: "16px" }}>
        אין הרשאה לגשת לדף זה
      </h2>
      <p style={{ color: "#6b7280", marginBlockEnd: "32px", maxInlineSize: "400px" }}>
        אין לך הרשאה לצפות בדף זה. אם לדעתך מדובר בטעות, פנה/י למנהל המערכת.
      </p>
      <a
        href="/"
        style={{
          display: "inline-block",
          paddingBlock: "10px",
          paddingInline: "24px",
          background: "#2563eb",
          color: "#fff",
          borderRadius: "8px",
          textDecoration: "none",
          fontSize: "0.9375rem",
        }}
      >
        חזרה לדף הראשי
      </a>
    </main>
  );
}
