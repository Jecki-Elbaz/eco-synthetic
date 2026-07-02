// Root layout -- Sprint 1 stub.
// RTL support for Hebrew added in Sprint 2 [APS-REQ-082].
import type { Metadata } from "next";

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
    <html lang="he">
      <body>{children}</body>
    </html>
  );
}
