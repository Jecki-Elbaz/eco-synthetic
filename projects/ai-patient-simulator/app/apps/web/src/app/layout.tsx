// Root layout -- RE-2: AuthProvider wraps the entire app.
// lang="he" and dir="rtl" set at html level; simulation pages
// override dir locally via the SimulationScreen component's own dir prop.
// Individual pages that run in English pass dir="ltr" on their root element.
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "AI Patient Simulator",
  description: "Clinical simulation training platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="he" dir="rtl">
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: "-apple-system, Arial, sans-serif",
          background: "#f7f7f8",
        }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
