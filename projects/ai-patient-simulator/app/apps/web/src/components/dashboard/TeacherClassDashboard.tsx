"use client";

// TeacherClassDashboard.tsx -- APS-REQ-088 Teacher Class Dashboard.
// Pilot-minimal: heatmap, horizontal bar chart (SVG/CSS), class list, flagged queue.
// RTL-first per hebrew-rtl-best-practices skill v1.3.0.
// CSS logical properties used throughout; no physical left/right in layout.

import { useState, useCallback } from "react";
import "./dashboard.css";
import type {
  ClassDashboardVM,
  StudentRow,
  AttemptStatusVM,
  FlagType,
} from "@/lib/dashboard-types";
import { authoriseRetry } from "@/lib/dashboard-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type FilterKey = "ALL" | "COMPLETED" | "NOT_STARTED" | "FLAGGED";
type DistMode = "overall" | "per-criterion";
type SortConfig = { criterionId: string | null; dir: "asc" | "desc" };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function cellClass(score: number | null): string {
  if (score === null) return "heatmap-cell heatmap-cell--grey";
  if (score >= 8) return "heatmap-cell heatmap-cell--green";
  if (score >= 5) return "heatmap-cell heatmap-cell--amber";
  return "heatmap-cell heatmap-cell--red";
}

function cellA11yBand(score: number | null): string {
  if (score === null) return "אין נתונים";
  if (score >= 8) return "גבוה";
  if (score >= 5) return "בינוני";
  return "נמוך";
}

function statusLabel(status: AttemptStatusVM): string {
  switch (status) {
    case "COMPLETED": return "הושלם";
    case "IN_PROGRESS": return "בתהליך";
    case "NOT_STARTED": return "טרם התחיל";
    case "TECHNICALLY_AFFECTED": return "הושפע טכנית";
    case "FLAGGED": return "מסומן לבדיקה";
  }
}

function statusBadgeClass(status: AttemptStatusVM): string {
  switch (status) {
    case "COMPLETED": return "status-badge status-badge--completed";
    case "IN_PROGRESS": return "status-badge status-badge--in-progress";
    case "NOT_STARTED": return "status-badge status-badge--not-started";
    case "TECHNICALLY_AFFECTED": return "status-badge status-badge--tech";
    case "FLAGGED": return "status-badge status-badge--flagged";
  }
}

function flagTypeLabel(type: FlagType): string {
  return type === "B" ? "סוג ב -- רווחה" : "סוג א -- טכני / אקדמי";
}

function filterStudents(students: StudentRow[], filter: FilterKey): StudentRow[] {
  if (filter === "ALL") return students;
  if (filter === "COMPLETED") return students.filter((s) => s.status === "COMPLETED");
  if (filter === "NOT_STARTED") return students.filter((s) => s.status === "NOT_STARTED");
  if (filter === "FLAGGED") return students.filter((s) => s.flagType !== null);
  return students;
}

function sortStudents(students: StudentRow[], sort: SortConfig): StudentRow[] {
  if (!sort.criterionId) return students;
  return [...students].sort((a, b) => {
    const scoreA =
      a.criterionScores.find((c) => c.criterionId === sort.criterionId)?.score ?? -1;
    const scoreB =
      b.criterionScores.find((c) => c.criterionId === sort.criterionId)?.score ?? -1;
    return sort.dir === "asc" ? scoreA - scoreB : scoreB - scoreA;
  });
}

// Score distribution: for each criterion, compute count of students with score
// in each 0-10 band (per-criterion mode) or overall band (overall mode).
type BucketLabel = "0-4" | "5-7" | "8-10";
interface DistRow {
  label: string;
  buckets: { label: BucketLabel; count: number }[];
  maxCount: number;
}

function bucket(score: number | null): BucketLabel | null {
  if (score === null) return null;
  if (score <= 4) return "0-4";
  if (score <= 7) return "5-7";
  return "8-10";
}

function buildDistRows(data: ClassDashboardVM, mode: DistMode): DistRow[] {
  const BUCKETS: BucketLabel[] = ["8-10", "5-7", "0-4"];
  const completed = data.students.filter((s) => s.status === "COMPLETED");

  if (mode === "overall") {
    const counts: Record<BucketLabel, number> = { "0-4": 0, "5-7": 0, "8-10": 0 };
    for (const s of completed) {
      const b = bucket(s.overallScore);
      if (b) counts[b]++;
    }
    const maxCount = Math.max(...Object.values(counts), 1);
    return [
      {
        label: "ציון כולל",
        buckets: BUCKETS.map((l) => ({ label: l, count: counts[l] })),
        maxCount,
      },
    ];
  }

  return data.criteria.map((crit) => {
    const counts: Record<BucketLabel, number> = { "0-4": 0, "5-7": 0, "8-10": 0 };
    for (const s of completed) {
      const cs = s.criterionScores.find((c) => c.criterionId === crit.id);
      const b = bucket(cs?.score ?? null);
      if (b) counts[b]++;
    }
    const maxCount = Math.max(...Object.values(counts), 1);
    return {
      label: crit.label,
      buckets: BUCKETS.map((l) => ({ label: l, count: counts[l] })),
      maxCount,
    };
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface HeatmapTooltipState {
  studentName: string;
  criterionLabel: string;
  score: number | null;
  maxScore: number;
  top: number;
  left: number;
}

function HeatmapCell({
  studentName,
  criterionLabel,
  score,
  maxScore,
  onCellClick,
}: {
  studentName: string;
  criterionLabel: string;
  score: number | null;
  maxScore: number;
  onCellClick: () => void;
}) {
  const [tooltip, setTooltip] = useState(false);
  const displayValue = score !== null ? String(score) : "--";
  const a11yBand = cellA11yBand(score);

  return (
    <div className="heatmap-cell-wrapper">
      <button
        type="button"
        className={cellClass(score)}
        aria-label={`${studentName}, ${criterionLabel}: ${displayValue}/${maxScore} (${a11yBand})`}
        title={`${studentName}, ${criterionLabel}: ${displayValue}/${maxScore}`}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        onFocus={() => setTooltip(true)}
        onBlur={() => setTooltip(false)}
        onClick={onCellClick}
      >
        {displayValue}
        <span className="heatmap-cell__a11y-label">
          {a11yBand}
        </span>
      </button>
      {tooltip && (
        <div role="tooltip" className="heatmap-tooltip">
          {studentName}, {criterionLabel}: {displayValue}/{maxScore}
        </div>
      )}
    </div>
  );
}

function RetryConfirmModal({
  studentName,
  attemptId,
  onClose,
}: {
  studentName: string;
  attemptId: string;
  onClose: (authorised: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleConfirm() {
    setBusy(true);
    setErrorMsg(null);
    try {
      await authoriseRetry(attemptId);
      setDone(true);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "שגיאה בלתי צפויה -- נסה שנית";
      setErrorMsg(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="retry-modal-title">
      <div className="modal-box">
        <h2 id="retry-modal-title" className="modal-box__title">
          אישור ניסיון חוזר
        </h2>
        {done ? (
          <>
            <p className="modal-box__body">
              אישור ניסיון חוזר עבור {studentName} נשלח בהצלחה.
            </p>
            <div className="modal-box__actions">
              <button className="dash-btn" onClick={() => onClose(true)}>
                סגור
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="modal-box__body">
              אישור זה יאפשר ל{studentName} לבצע ניסיון חוזר לסימולציה שהושפעה טכנית.
              פעולה זו נרשמת ביומן הביקורת.
            </p>
            <div className="modal-box__warn">
              פעולה זו אינה ניתנת לביטול לאחר האישור.
            </div>
            {errorMsg && (
              <div
                className="modal-box__error"
                role="alert"
                aria-live="assertive"
              >
                {errorMsg}
              </div>
            )}
            <div className="modal-box__actions">
              <button
                className="dash-btn"
                onClick={() => onClose(false)}
                disabled={busy}
              >
                ביטול
              </button>
              <button
                className="dash-btn"
                style={{
                  background: busy ? "#9ca3af" : "#2563eb",
                  color: "#fff",
                  borderColor: busy ? "#9ca3af" : "#2563eb",
                }}
                onClick={handleConfirm}
                disabled={busy}
                aria-busy={busy}
              >
                {busy ? "שולח..." : "אשר ניסיון חוזר"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface TeacherClassDashboardProps {
  data: ClassDashboardVM;
}

export default function TeacherClassDashboard({ data }: TeacherClassDashboardProps) {
  const [selectedAssignment, setSelectedAssignment] = useState(data.selectedAssignmentId);
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [sort, setSort] = useState<SortConfig>({ criterionId: null, dir: "desc" });
  const [distMode, setDistMode] = useState<DistMode>("per-criterion");
  const [flaggedOpen, setFlaggedOpen] = useState(true);
  const [retryModal, setRetryModal] = useState<{
    studentName: string;
    attemptId: string;
  } | null>(null);

  // Stats
  const enrolled = data.students.length;
  const completed = data.students.filter((s) => s.status === "COMPLETED").length;
  const completedPct = enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;
  const flaggedTypeA = data.students.filter((s) => s.flagType === "A").length;
  const flaggedTypeB = data.students.filter((s) => s.flagType === "B").length;
  const totalFlagged = flaggedTypeA + flaggedTypeB;
  const flaggedStudents = data.students.filter((s) => s.flagType !== null);

  // Filtered + sorted student list
  const displayStudents = sortStudents(filterStudents(data.students, filter), sort);

  const handleCriterionHeaderClick = useCallback(
    (criterionId: string) => {
      setSort((prev) => {
        if (prev.criterionId === criterionId) {
          return { criterionId, dir: prev.dir === "asc" ? "desc" : "asc" };
        }
        return { criterionId, dir: "desc" };
      });
    },
    [],
  );

  const distRows = buildDistRows(data, distMode);

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "ALL", label: "הכל" },
    { key: "COMPLETED", label: "הושלם" },
    { key: "NOT_STARTED", label: "טרם התחיל" },
    { key: "FLAGGED", label: "מסומן" },
  ];

  return (
    <div className="dash-root">
      {/* ---- Sticky header ---- */}
      <header className="dash-header">
        <div className="dash-header__left">
          <div className="dash-header__breadcrumb">
            {data.collegeName} &gt; {data.courseName}
          </div>
          <h1 className="dash-header__title">לוח שליטה -- מרצה</h1>
          <div className="dash-header__meta">
            {data.teacherName} &nbsp;|&nbsp; עדכון אחרון:{" "}
            <span dir="ltr" style={{ unicodeBidi: "embed" }}>
              {formatDate(data.lastUpdated)}
            </span>
          </div>
        </div>
        <div className="dash-header__right">
          <label htmlFor="assignment-select" className="visually-hidden">
            בחר מטלה
          </label>
          <select
            id="assignment-select"
            className="dash-assignment-select"
            value={selectedAssignment}
            onChange={(e) => setSelectedAssignment(e.target.value)}
          >
            {data.assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title}
              </option>
            ))}
          </select>
          <button type="button" className="dash-btn" aria-label="ייצא נתונים">
            ייצוא
          </button>
          <button type="button" className="dash-btn" aria-label="עזרה">
            עזרה
          </button>
        </div>
      </header>

      {/* ---- Main body ---- */}
      <main className="dash-body">

        {/* ---- Stat cards ---- */}
        <section aria-label="סיכום כיתה">
          <div className="dash-stats">
            {/* Enrolled */}
            <div className="stat-card">
              <div className="stat-card__label">סטודנטים רשומים</div>
              <div className="stat-card__value">{enrolled}</div>
            </div>
            {/* Completed */}
            <div className="stat-card">
              <div className="stat-card__label">השלימו</div>
              <div className="stat-card__value">
                {completed}/{enrolled}
              </div>
              <div className="stat-card__sub">{completedPct}% מהכיתה</div>
              <div
                className="stat-progress-bar"
                role="progressbar"
                aria-valuenow={completedPct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${completedPct}% השלימו`}
              >
                <div
                  className="stat-progress-fill"
                  style={{ inlineSize: `${completedPct}%` }}
                />
              </div>
            </div>
            {/* Flagged */}
            <div className="stat-card">
              <div className="stat-card__label">מסומנים לבדיקה</div>
              <div className="stat-card__value">{totalFlagged}</div>
              <div className="stat-flag-split">
                <span className="stat-flag-split__a">
                  טכני: {flaggedTypeA}
                </span>
                <span className="stat-flag-split__b">
                  רווחה: {flaggedTypeB}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ---- Rubric heatmap ---- */}
        <section aria-label="מפת חום -- ציוני קריטריונים">
          <h2 className="dash-section-heading">מפת חום -- קריטריונים</h2>
          <div className="heatmap-wrapper">
            {completed === 0 ? (
              <div className="heatmap-empty" role="status">
                טרם הושלמו ניסיונות
              </div>
            ) : (
              <table className="heatmap-table" aria-label="ציוני קריטריונים לפי סטודנט">
                <thead>
                  <tr>
                    <th className="heatmap-th-name" scope="col">
                      סטודנט
                    </th>
                    {data.criteria.map((crit) => {
                      const isActive = sort.criterionId === crit.id;
                      return (
                        <th
                          key={crit.id}
                          className="heatmap-th-criterion"
                          scope="col"
                          aria-sort={
                            isActive
                              ? sort.dir === "asc"
                                ? "ascending"
                                : "descending"
                              : "none"
                          }
                          title={crit.label}
                        >
                          <button
                            type="button"
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              font: "inherit",
                              padding: 0,
                              color: "inherit",
                            }}
                            onClick={() => handleCriterionHeaderClick(crit.id)}
                            aria-label={`מיין לפי ${crit.label}`}
                          >
                            {crit.shortLabel}
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {displayStudents
                    .filter(
                      (s) =>
                        s.status === "COMPLETED" ||
                        s.status === "TECHNICALLY_AFFECTED" ||
                        s.criterionScores.some((c) => c.score !== null),
                    )
                    .map((student) => (
                      <tr key={student.userId}>
                        <td className="heatmap-td-name">{student.displayName}</td>
                        {data.criteria.map((crit) => {
                          const cs = student.criterionScores.find(
                            (c) => c.criterionId === crit.id,
                          );
                          return (
                            <td key={crit.id} style={{ padding: "4px" }}>
                              <HeatmapCell
                                studentName={student.displayName}
                                criterionLabel={crit.label}
                                score={cs?.score ?? null}
                                maxScore={crit.maxScore}
                                onCellClick={() => {
                                  // Stub: navigate to attempt review
                                  if (student.attemptId) {
                                    console.log(
                                      `[stub] open attempt review: ${student.attemptId}`,
                                    );
                                  }
                                }}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* ---- Score distribution ---- */}
        <section aria-label="התפלגות ציונים">
          <h2 className="dash-section-heading">התפלגות ציונים</h2>
          <div className="dist-panel">
            <div className="dist-toggle" role="group" aria-label="מצב תצוגה">
              <button
                type="button"
                className={`dist-toggle-btn${distMode === "per-criterion" ? " dist-toggle-btn--active" : ""}`}
                onClick={() => setDistMode("per-criterion")}
                aria-pressed={distMode === "per-criterion"}
              >
                לפי קריטריון
              </button>
              <button
                type="button"
                className={`dist-toggle-btn${distMode === "overall" ? " dist-toggle-btn--active" : ""}`}
                onClick={() => setDistMode("overall")}
                aria-pressed={distMode === "overall"}
              >
                כולל
              </button>
            </div>

            <div className="dist-chart" role="list" aria-label="גרף התפלגות ציונים">
              {distRows.map((row) => (
                <div key={row.label} role="listitem">
                  <div
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      marginBlockEnd: "6px",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {row.label}
                  </div>
                  {row.buckets.map((bkt) => {
                    const pct =
                      row.maxCount > 0
                        ? Math.round((bkt.count / row.maxCount) * 100)
                        : 0;
                    const barColor =
                      bkt.label === "8-10"
                        ? "#16a34a"
                        : bkt.label === "5-7"
                        ? "#f59e0b"
                        : "#dc2626";
                    return (
                      <div key={bkt.label} className="dist-row">
                        <div className="dist-row__label">{bkt.label}</div>
                        <div
                          className="dist-row__bar-track"
                          aria-label={`${row.label}, ${bkt.label}: ${bkt.count} סטודנטים`}
                        >
                          <div
                            className="dist-row__bar-fill"
                            style={{
                              inlineSize: `${pct}%`,
                              background: barColor,
                            }}
                          >
                            {bkt.count > 0 && (
                              <span className="dist-row__bar-value">
                                {bkt.count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="dist-axis-labels" aria-hidden="true">
              <span>0</span>
              <span>סטודנטים</span>
            </div>
          </div>
        </section>

        {/* ---- Class list ---- */}
        <section aria-label="רשימת כיתה">
          <h2 className="dash-section-heading">רשימת סטודנטים</h2>
          {/* Filter bar */}
          <div className="filter-bar" role="group" aria-label="סינון לפי סטטוס">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                className={`filter-btn${filter === f.key ? " filter-btn--active" : ""}`}
                onClick={() => setFilter(f.key)}
                aria-pressed={filter === f.key}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="class-list-wrapper">
            <table className="class-table" aria-label="טבלת סטודנטים">
              <thead>
                <tr>
                  <th scope="col">סטודנט</th>
                  <th scope="col">סטטוס</th>
                  <th scope="col">ציון כולל</th>
                  <th scope="col">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {displayStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", color: "var(--color-muted)", padding: "24px" }}>
                      אין תוצאות עבור הסינון הנוכחי
                    </td>
                  </tr>
                ) : (
                  displayStudents.map((student) => (
                    <tr
                      key={student.userId}
                      className={
                        student.status === "TECHNICALLY_AFFECTED"
                          ? "row--tech-affected"
                          : student.flagType === "B"
                          ? "row--flagged-welfare"
                          : ""
                      }
                    >
                      <td>{student.displayName}</td>
                      <td>
                        <span className={statusBadgeClass(student.status)}>
                          {statusLabel(student.status)}
                        </span>
                      </td>
                      <td>
                        <span className="score-cell">
                          {student.overallScore !== null
                            ? `${student.overallScore}/10`
                            : "--"}
                        </span>
                      </td>
                      <td>
                        <div className="row-actions">
                          {student.attemptId && (
                            <button
                              type="button"
                              className="dash-btn"
                              onClick={() =>
                                console.log(
                                  `[stub] review attempt: ${student.attemptId}`,
                                )
                              }
                            >
                              סקירה
                            </button>
                          )}
                          {student.status === "TECHNICALLY_AFFECTED" &&
                            student.attemptId && (
                              <button
                                type="button"
                                className="dash-btn"
                                style={{
                                  background: "#fffbeb",
                                  borderColor: "#f59e0b",
                                  color: "#78350f",
                                }}
                                onClick={() =>
                                  setRetryModal({
                                    studentName: student.displayName,
                                    attemptId: student.attemptId!,
                                  })
                                }
                              >
                                אשר ניסיון חוזר
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---- Flagged attempts queue ---- */}
        {flaggedStudents.length > 0 && (
          <section aria-label="תור ניסיונות מסומנים">
            <div className="flagged-queue">
              <button
                type="button"
                className="flagged-queue__toggle"
                onClick={() => setFlaggedOpen((v) => !v)}
                aria-expanded={flaggedOpen}
                aria-controls="flagged-queue-body"
              >
                <span>
                  ניסיונות מסומנים לבדיקה ({flaggedStudents.length})
                </span>
                <span
                  className={`flagged-queue__chevron${flaggedOpen ? " flagged-queue__chevron--open" : ""}`}
                  aria-hidden="true"
                >
                  &#9660;
                </span>
              </button>
              {flaggedOpen && (
                <div id="flagged-queue-body" className="flagged-queue__body">
                  {flaggedStudents.map((student) => (
                    <div
                      key={student.userId}
                      className={`flagged-queue-row${
                        student.flagType === "B"
                          ? " flagged-queue-row--type-b"
                          : " flagged-queue-row--type-a"
                      }`}
                    >
                      <div className="flagged-queue-row__info">
                        <div className="flagged-queue-row__name">
                          {student.displayName}
                        </div>
                        <div className="flagged-queue-row__type">
                          {student.flagType && flagTypeLabel(student.flagType)}
                        </div>
                        {student.flagDescription && (
                          <div className="flagged-queue-row__desc">
                            {student.flagDescription}
                          </div>
                        )}
                      </div>
                      {student.attemptId && (
                        <button
                          type="button"
                          className="dash-btn"
                          onClick={() =>
                            console.log(
                              `[stub] review flagged: ${student.attemptId}`,
                            )
                          }
                        >
                          סקירה
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* ---- Retry confirm modal ---- */}
      {retryModal && (
        <RetryConfirmModal
          studentName={retryModal.studentName}
          attemptId={retryModal.attemptId}
          onClose={() => setRetryModal(null)}
        />
      )}
    </div>
  );
}
