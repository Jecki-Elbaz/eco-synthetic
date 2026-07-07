// Root page -- Sprint 2: links to simulation + dashboard demo routes.
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "APS -- AI Patient Simulator",
};

export default function HomePage() {
  return (
    <main
      style={{
        maxInlineSize: "640px",
        margin: "0 auto",
        paddingBlock: "40px",
        paddingInline: "20px",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ fontSize: "1.5rem", marginBlockEnd: "8px" }}>
        AI Patient Simulator
      </h1>
      <p style={{ color: "#6b7280", marginBlockEnd: "24px" }}>
        Sprint 2 -- Demo routes
      </p>

      <section style={{ marginBlockEnd: "24px" }}>
        <h2 style={{ fontSize: "1rem", marginBlockEnd: "12px" }}>Simulation</h2>
        <ul style={{ paddingInlineStart: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <li>
            <a href="/simulation/demo" style={{ color: "#2563eb" }}>
              /simulation/demo -- Hebrew (RTL, mock API)
            </a>
          </li>
          <li>
            <a href="/simulation/demo?lang=en" style={{ color: "#2563eb" }}>
              /simulation/demo?lang=en -- English (LTR, mock API)
            </a>
          </li>
        </ul>
      </section>

      <section style={{ marginBlockEnd: "24px" }}>
        <h2 style={{ fontSize: "1rem", marginBlockEnd: "12px" }}>Teacher Dashboard (APS-REQ-088)</h2>
        <ul style={{ paddingInlineStart: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <li>
            <a href="/teacher/demo" style={{ color: "#2563eb" }}>
              /teacher/demo -- Hebrew RTL, mock cohort data
            </a>
          </li>
          <li>
            <a href="/teacher/course-demo-001" style={{ color: "#2563eb" }}>
              /teacher/course-demo-001 -- dynamic route (mock)
            </a>
          </li>
        </ul>
      </section>

      <section>
        <h2 style={{ fontSize: "1rem", marginBlockEnd: "12px" }}>Student Dashboard (APS-REQ-089)</h2>
        <ul style={{ paddingInlineStart: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <li>
            <a href="/student/demo" style={{ color: "#2563eb" }}>
              /student/demo -- Hebrew RTL, mock student history
            </a>
          </li>
          <li>
            <a href="/student/student-demo-001" style={{ color: "#2563eb" }}>
              /student/student-demo-001 -- dynamic route (mock)
            </a>
          </li>
        </ul>
      </section>
    </main>
  );
}
