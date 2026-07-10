"use client";

// StudentDashboard.tsx -- APS-REQ-089 Student Dashboard.
// Shows completed simulations, criterion summaries, debrief history, support tickets.
// RTL-first per hebrew-rtl-best-practices skill v1.3.0.
// CSS logical properties throughout.

import "./student-dashboard.css";
import type { StudentDashboardVM, CriterionScoreVM, InProgressSimulationVM } from "@/lib/dashboard-types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function criterionPillClass(score: number | null): string {
  if (score === null) return "sd-criterion-pill__score";
  if (score >= 8) return "sd-criterion-pill__score sd-criterion-pill__score--high";
  if (score >= 5) return "sd-criterion-pill__score sd-criterion-pill__score--mid";
  return "sd-criterion-pill__score sd-criterion-pill__score--low";
}

function ticketBadgeClass(status: "OPEN" | "ESCALATED" | "RESOLVED"): string {
  switch (status) {
    case "OPEN": return "ticket-badge ticket-badge--open";
    case "ESCALATED": return "ticket-badge ticket-badge--escalated";
    case "RESOLVED": return "ticket-badge ticket-badge--resolved";
  }
}

function ticketStatusLabel(status: "OPEN" | "ESCALATED" | "RESOLVED"): string {
  switch (status) {
    case "OPEN": return "פתוח";
    case "ESCALATED": return "הועבר לטיפול";
    case "RESOLVED": return "נסגר";
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

// S4-NOA-RESUME: format elapsed seconds as MM:SS for display.
function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// S4-NOA-RESUME: build the "Continue" href with resume context.
// Passes elapsed so SimulationScreen can restore the timer (Ido A3 ruling).
function resumeHref(sim: InProgressSimulationVM): string {
  const base = `/simulation/${encodeURIComponent(sim.attemptId)}?resume=1`;
  return sim.elapsed !== null ? `${base}&elapsed=${sim.elapsed}` : base;
}

// S4-NOA-RESUME: in-progress simulation card with "Continue" button.
function InProgressCard({ sim }: { sim: InProgressSimulationVM }) {
  const elapsedLabel =
    sim.elapsed !== null
      ? `חלפו: ${formatElapsed(sim.elapsed)}`
      : null;
  const lastActiveLabel = sim.lastTurnAt
    ? `פעיל לאחרונה: ${formatDate(sim.lastTurnAt)}`
    : null;

  return (
    <article className="sd-sim-card sd-sim-card--in-progress" aria-label={`המשך סימולציה: ${sim.title}`}>
      <div className="sd-sim-card__top">
        <div>
          <h3 className="sd-sim-card__title">{sim.title}</h3>
          {lastActiveLabel && (
            <div className="sd-sim-card__date">{lastActiveLabel}</div>
          )}
          {elapsedLabel && (
            <div className="sd-sim-card__date">{elapsedLabel}</div>
          )}
        </div>
        <span className="sd-inprogress-badge" aria-label="בתהליך">בתהליך</span>
      </div>
      <div className="sd-sim-card__actions">
        <a
          href={resumeHref(sim)}
          className="sd-link-btn sd-link-btn--resume"
          aria-label={`המשך סימולציה: ${sim.title}`}
          data-testid="resume-continue-btn"
        >
          המשך
        </a>
      </div>
    </article>
  );
}

function CriterionSummaryPills({ criteria }: { criteria: CriterionScoreVM[] }) {
  return (
    <div className="sd-criterion-grid" aria-label="ציוני קריטריונים">
      {criteria.map((c) => (
        <div key={c.criterionId} className="sd-criterion-pill">
          <span className="sd-criterion-pill__id">{c.criterionId}</span>
          <span
            className={criterionPillClass(c.score)}
            aria-label={`${c.label}: ${c.score !== null ? `${c.score}/${c.maxScore}` : "אין נתונים"}`}
          >
            {c.score !== null ? `${c.score}/${c.maxScore}` : "--"}
          </span>
          <span className="sd-criterion-pill__label">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface StudentDashboardProps {
  data: StudentDashboardVM;
}

export default function StudentDashboard({ data }: StudentDashboardProps) {
  return (
    <div className="sd-root">
      {/* ---- Sticky header ---- */}
      <header className="sd-header">
        <div>
          <h1 className="sd-header__title">
            שלום, {data.displayName}
          </h1>
          <div className="sd-header__sub">לוח הבקרה שלי</div>
        </div>
        {/* Formative label always visible (APS-REQ-089 consistency with feedback screen) */}
        <div className="sd-formative-chip" aria-label="הצגה פורמטיבית בלבד -- לא ציון רשמי">
          פורמטיבי בלבד -- לא ציון רשמי
        </div>
      </header>

      {/* ---- Main body ---- */}
      <main className="sd-body">

        {/* ---- In-progress simulations (S4-NOA-RESUME) ----
            Section hidden entirely when no IN_PROGRESS attempts (envelope rule).
            Card shows: title, last-activity timestamp, elapsed time if available.
            "המשך" navigates to /simulation/:attemptId?resume=1[&elapsed=N]. */}
        {(data.inProgressSimulations ?? []).length > 0 && (
          <section aria-label="סימולציות בתהליך">
            <h2 className="sd-section-heading">סימולציות בתהליך</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.inProgressSimulations.map((sim) => (
                <InProgressCard key={sim.attemptId} sim={sim} />
              ))}
            </div>
          </section>
        )}

        {/* ---- Completed simulations ---- */}
        <section aria-label="סימולציות שהושלמו">
          <h2 className="sd-section-heading">סימולציות שהושלמו</h2>
          {data.completedSimulations.length === 0 ? (
            <p style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
              טרם הושלמו סימולציות.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.completedSimulations.map((sim) => (
                <article key={sim.attemptId} className="sd-sim-card">
                  <div className="sd-sim-card__top">
                    <div>
                      <h3 className="sd-sim-card__title">{sim.title}</h3>
                      <div className="sd-sim-card__date">
                        {formatDate(sim.completedAt)}
                      </div>
                    </div>
                    <div className="sd-sim-card__formative">
                      {sim.overallFormativeLabel}
                    </div>
                  </div>

                  {/* Criterion summary */}
                  <CriterionSummaryPills criteria={sim.criterionSummary} />

                  {/* Actions */}
                  <div className="sd-sim-card__actions">
                    {sim.hasEvaluation && (
                      <a
                        href={`/feedback/${sim.attemptId}`}
                        className="sd-link-btn"
                        aria-label={`פתח משוב עבור ${sim.title}`}
                      >
                        משוב מפורט
                      </a>
                    )}
                    {sim.hasDebrief && (
                      <a
                        href={`/debrief/${sim.attemptId}`}
                        className="sd-link-btn"
                        aria-label={`פתח דיברוף עבור ${sim.title}`}
                      >
                        דיברוף
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* ---- Debrief history ---- */}
        <section aria-label="היסטוריית דיברוף">
          <h2 className="sd-section-heading">היסטוריית דיברוף</h2>
          {data.debriefHistory.length === 0 ? (
            <p style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
              אין שיחות דיברוף.
            </p>
          ) : (
            <table className="sd-debrief-table" aria-label="היסטוריית שיחות דיברוף">
              <thead>
                <tr>
                  <th scope="col">סימולציה</th>
                  <th scope="col">הודעות</th>
                  <th scope="col">עדכון אחרון</th>
                  <th scope="col">פתיחה</th>
                </tr>
              </thead>
              <tbody>
                {data.debriefHistory.map((entry) => (
                  <tr key={entry.attemptId}>
                    <td>{entry.simulationTitle}</td>
                    <td>
                      <span dir="ltr" style={{ unicodeBidi: "embed" }}>
                        {entry.messageCount}
                      </span>
                    </td>
                    <td className="cell-date">
                      {formatDate(entry.lastMessageAt)}
                    </td>
                    <td>
                      <a
                        href={`/debrief/${entry.attemptId}`}
                        className="sd-link-btn"
                        aria-label={`פתח דיברוף עבור ${entry.simulationTitle}`}
                      >
                        פתח
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* ---- Support ticket history ---- */}
        <section aria-label="היסטוריית פניות תמיכה">
          <h2 className="sd-section-heading">פניות תמיכה</h2>
          {data.supportTickets.length === 0 ? (
            <p style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
              אין פניות תמיכה.
            </p>
          ) : (
            <div className="sd-ticket-list">
              {data.supportTickets.map((ticket) => (
                <div key={ticket.ticketId} className="sd-ticket-row">
                  <div className="sd-ticket-row__cat">{ticket.category}</div>
                  <div className="sd-ticket-row__date">
                    {formatDate(ticket.createdAt)}
                  </div>
                  <span className={ticketBadgeClass(ticket.status)}>
                    {ticketStatusLabel(ticket.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
