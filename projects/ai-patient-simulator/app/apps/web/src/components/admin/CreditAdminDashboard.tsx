"use client";

// CreditAdminDashboard.tsx -- APS-REQ-143, 144, 147, 148.
// Admin-only tool: SYSTEM_ADMIN only (pilot). COLLEGE_MANAGER is deferred -- not a pilot
// role (matches the credit-admin API RBAC; do not add COLLEGE_MANAGER without per-college
// scope filtering on every service query).
// Students NEVER see this component (APS-REQ-145).
// RTL-first per hebrew-rtl-best-practices skill v1.3.0.
// CSS logical properties throughout; no physical left/right in layout.

import { useState, useCallback } from "react";
import "./credit-admin.css";
import type {
  CreditAdminVM,
  CourseLedger,
  CreditActionType,
  ActivityLogEntry,
  AuditLogEntry,
} from "@/lib/credit-admin-types";
import {
  applyCreditAction,
  updateAlertConfig,
  exportCreditReport,
  isCreditAdminMockMode,
} from "@/lib/credit-admin-client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TabKey = "ledger" | "activity" | "audit" | "settings";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("he-IL", {
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

function activityTypeLabel(type: ActivityLogEntry["activityType"]): string {
  switch (type) {
    case "SIMULATION_TURN": return "תור סימולציה";
    case "EVALUATION_RUN": return "הערכה";
    case "DEBRIEF_TURN": return "תור שיח";
    case "EXPORT": return "ייצוא";
  }
}

function activityTypeBadgeClass(type: ActivityLogEntry["activityType"]): string {
  switch (type) {
    case "SIMULATION_TURN": return "cadmin-activity-type-badge cadmin-activity-type-badge--sim";
    case "EVALUATION_RUN": return "cadmin-activity-type-badge cadmin-activity-type-badge--eval";
    case "DEBRIEF_TURN": return "cadmin-activity-type-badge cadmin-activity-type-badge--debrief";
    case "EXPORT": return "cadmin-activity-type-badge cadmin-activity-type-badge--export";
  }
}

function actionLabel(action: AuditLogEntry["action"]): string {
  switch (action) {
    case "ADD": return "הוספה";
    case "DEDUCT": return "ניכוי";
    case "RESET": return "איפוס";
    case "GRANT_BONUS": return "בונוס";
    case "SET_SOFT_LIMIT": return "עדכון רף רך";
    case "SET_HARD_LIMIT": return "עדכון רף קשיח";
    case "OVERRIDE_HARD_LIMIT": return "עקיפת רף קשיח";
  }
}

function actionBadgeClass(action: AuditLogEntry["action"]): string {
  switch (action) {
    case "ADD": return "cadmin-action-badge cadmin-action-badge--add";
    case "DEDUCT": return "cadmin-action-badge cadmin-action-badge--deduct";
    case "RESET": return "cadmin-action-badge cadmin-action-badge--reset";
    case "GRANT_BONUS": return "cadmin-action-badge cadmin-action-badge--bonus";
    case "SET_SOFT_LIMIT":
    case "SET_HARD_LIMIT": return "cadmin-action-badge cadmin-action-badge--limit";
    case "OVERRIDE_HARD_LIMIT": return "cadmin-action-badge cadmin-action-badge--override";
  }
}

/** Balance fill colour: green if > softLimit, amber if <= softLimit, red if near 0 */
function balanceFillClass(balance: number, softLimit: number, hardLimit: number): string {
  const threshold = hardLimit > 0 ? (hardLimit * 0.2) : softLimit * 0.5;
  if (balance <= threshold) return "cadmin-balance-fill cadmin-balance-fill--critical";
  if (balance <= softLimit) return "cadmin-balance-fill cadmin-balance-fill--warn";
  return "cadmin-balance-fill cadmin-balance-fill--ok";
}

/** Whether a course is low-balance relative to alert threshold (pct of hard limit) */
function isLowBalance(course: CourseLedger, thresholdPct: number): boolean {
  if (course.hardLimit <= 0) return false;
  return course.balance / course.hardLimit <= thresholdPct / 100;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

// --- CourseLedgerTable (APS-REQ-144) ---

function CourseLedgerTable({
  courses,
  thresholdPct,
  onSelectCourse,
  selectedCourseId,
}: {
  courses: CourseLedger[];
  thresholdPct: number;
  onSelectCourse: (courseId: string) => void;
  selectedCourseId: string;
}) {
  return (
    <div className="cadmin-table-wrapper">
      <table className="cadmin-table" aria-label="יתרות קרדיטים לפי קורס">
        <thead>
          <tr>
            <th scope="col">קורס</th>
            <th scope="col">יתרה</th>
            <th scope="col">רף רך</th>
            <th scope="col">רף קשיח</th>
            <th scope="col">עדכון אחרון</th>
            <th scope="col">סטטוס עקיפה</th>
            <th scope="col">פעולות</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const low = isLowBalance(course, thresholdPct);
            const balancePct =
              course.hardLimit > 0
                ? Math.min(100, Math.round((course.balance / course.hardLimit) * 100))
                : 100;
            const rowClass = course.hardLimitOverrideActive
              ? "row--override-active"
              : low
              ? "row--low-balance"
              : "";

            return (
              <tr key={course.courseId} className={rowClass}>
                <td>{course.courseName}</td>
                <td>
                  <div className="cadmin-balance-bar">
                    <div
                      className="cadmin-balance-track"
                      role="progressbar"
                      aria-valuenow={course.balance}
                      aria-valuemin={0}
                      aria-valuemax={course.hardLimit > 0 ? course.hardLimit : course.balance}
                      aria-label={`יתרה: ${course.balance} קרדיטים`}
                    >
                      <div
                        className={balanceFillClass(course.balance, course.softLimit, course.hardLimit)}
                        style={{ inlineSize: `${balancePct}%` }}
                      />
                    </div>
                    <span className="cadmin-balance-label cadmin-numeric">
                      {course.balance.toLocaleString("he-IL")}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="cadmin-numeric">{course.softLimit.toLocaleString("he-IL")}</span>
                </td>
                <td>
                  <span className="cadmin-numeric">
                    {course.hardLimit > 0 ? course.hardLimit.toLocaleString("he-IL") : "--"}
                  </span>
                </td>
                <td>
                  {course.lastEventAt ? (
                    <span dir="ltr" style={{ unicodeBidi: "embed" }}>
                      {formatDateTime(course.lastEventAt)}
                    </span>
                  ) : "--"}
                </td>
                <td>
                  {course.hardLimitOverrideActive ? (
                    <span className="cadmin-override-badge">
                      פעיל
                      {course.hardLimitOverrideUntil
                        ? ` עד ${formatDateTime(course.hardLimitOverrideUntil)}`
                        : ""}
                    </span>
                  ) : "--"}
                </td>
                <td>
                  <button
                    type="button"
                    className={`cadmin-btn${selectedCourseId === course.courseId ? " cadmin-btn--primary" : ""}`}
                    onClick={() => onSelectCourse(course.courseId)}
                    aria-pressed={selectedCourseId === course.courseId}
                  >
                    {selectedCourseId === course.courseId ? "נבחר" : "בחר"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// --- ActionPanel (APS-REQ-143) ---

interface ActionPanelProps {
  courses: CourseLedger[];
  selectedCourseId: string;
  onSuccess: () => void;
}

function ActionPanel({ courses, selectedCourseId, onSuccess }: ActionPanelProps) {
  const [action, setAction] = useState<CreditActionType>("ADD");
  const [amount, setAmount] = useState("");
  const [softLimit, setSoftLimit] = useState("");
  const [hardLimit, setHardLimit] = useState("");
  const [overrideUntil, setOverrideUntil] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const needsAmount =
    action === "ADD" || action === "DEDUCT" || action === "GRANT_BONUS" || action === "RESET";
  const needsSoftLimit = action === "SET_SOFT_LIMIT";
  const needsHardLimit = action === "SET_HARD_LIMIT";
  const needsOverrideUntil = action === "OVERRIDE_HARD_LIMIT";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourseId) {
      setFeedback({ ok: false, msg: "יש לבחור קורס לפני ביצוע פעולה" });
      return;
    }
    if (!reason.trim()) {
      setFeedback({ ok: false, msg: "חובה להזין סיבה לפעולה" });
      return;
    }
    // Amount is required + numeric when the action consumes one; a blank amount would
    // otherwise be sent as undefined and reach the API as NaN (server 500). The >0 rule
    // for ADD/DEDUCT/BONUS is enforced server-side (returns a clean 400 surfaced below).
    if (needsAmount && (amount === "" || Number.isNaN(parseInt(amount, 10)))) {
      setFeedback({ ok: false, msg: "יש להזין סכום מספרי לפעולה זו" });
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      const payload: Parameters<typeof applyCreditAction>[2] = { reason: reason.trim() };
      if (needsAmount && amount) payload.amount = parseInt(amount, 10);
      if (needsSoftLimit && softLimit) payload.softLimit = parseInt(softLimit, 10);
      if (needsHardLimit && hardLimit) payload.hardLimit = parseInt(hardLimit, 10);
      if (needsOverrideUntil && overrideUntil) payload.overrideUntil = overrideUntil;

      await applyCreditAction(selectedCourseId, action, payload);
      setFeedback({ ok: true, msg: "הפעולה בוצעה בהצלחה ונרשמה ביומן הביקורת" });
      setAmount("");
      setSoftLimit("");
      setHardLimit("");
      setOverrideUntil("");
      setReason("");
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "שגיאה בלתי צפויה -- נסה שנית";
      setFeedback({ ok: false, msg });
    } finally {
      setBusy(false);
    }
  }

  const selectedCourse = courses.find((c) => c.courseId === selectedCourseId);

  return (
    <div className="cadmin-action-panel">
      <h2 className="cadmin-section-heading">ביצוע פעולה על קרדיטים</h2>
      {selectedCourse ? (
        <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBlockEnd: "14px" }}>
          קורס נבחר: <strong>{selectedCourse.courseName}</strong>
          {" -- "}יתרה נוכחית:{" "}
          <span className="cadmin-numeric" dir="ltr">
            {selectedCourse.balance.toLocaleString("he-IL")}
          </span>
        </p>
      ) : (
        <p style={{ fontSize: "0.875rem", color: "var(--color-muted)", marginBlockEnd: "14px" }}>
          יש לבחור קורס בטבלת הקרדיטים למעלה.
        </p>
      )}
      <form onSubmit={handleSubmit} noValidate>
        <div className="cadmin-form-grid">
          {/* Action type */}
          <div className="cadmin-field">
            <label htmlFor="action-select">סוג פעולה</label>
            <select
              id="action-select"
              value={action}
              onChange={(e) => {
                setAction(e.target.value as CreditActionType);
                setFeedback(null);
              }}
            >
              <option value="ADD">הוספת קרדיטים</option>
              <option value="DEDUCT">ניכוי קרדיטים</option>
              <option value="RESET">איפוס יתרה</option>
              <option value="GRANT_BONUS">מתן בונוס</option>
              <option value="SET_SOFT_LIMIT">עדכון רף רך</option>
              <option value="SET_HARD_LIMIT">עדכון רף קשיח</option>
              <option value="OVERRIDE_HARD_LIMIT">עקיפת רף קשיח</option>
            </select>
          </div>

          {/* Amount (for add / deduct / bonus / reset) */}
          {needsAmount && (
            <div className="cadmin-field">
              <label htmlFor="action-amount">
                {action === "RESET" ? "יתרה חדשה (אופציונלי)" : "כמות קרדיטים"}
              </label>
              <input
                id="action-amount"
                type="number"
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="לדוגמה: 100"
              />
            </div>
          )}

          {/* Soft limit */}
          {needsSoftLimit && (
            <div className="cadmin-field">
              <label htmlFor="action-soft-limit">רף רך חדש (קרדיטים)</label>
              <input
                id="action-soft-limit"
                type="number"
                min="0"
                step="1"
                value={softLimit}
                onChange={(e) => setSoftLimit(e.target.value)}
                placeholder="לדוגמה: 300"
                required
              />
            </div>
          )}

          {/* Hard limit */}
          {needsHardLimit && (
            <div className="cadmin-field">
              <label htmlFor="action-hard-limit">רף קשיח חדש (קרדיטים)</label>
              <input
                id="action-hard-limit"
                type="number"
                min="0"
                step="1"
                value={hardLimit}
                onChange={(e) => setHardLimit(e.target.value)}
                placeholder="לדוגמה: 1500"
                required
              />
            </div>
          )}

          {/* Override until (date-time) */}
          {needsOverrideUntil && (
            <div className="cadmin-field">
              <label htmlFor="action-override-until">עקיפה פעילה עד (תאריך ושעה)</label>
              <input
                id="action-override-until"
                type="datetime-local"
                value={overrideUntil}
                onChange={(e) => setOverrideUntil(e.target.value)}
                required
              />
            </div>
          )}
        </div>

        {/* Reason (required for all actions -- audit log) */}
        <div className="cadmin-field" style={{ marginBlockEnd: "16px" }}>
          <label htmlFor="action-reason">סיבה (נרשמת ביומן הביקורת) *</label>
          <textarea
            id="action-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="פרט את הסיבה לפעולה..."
            required
          />
        </div>

        <div className="cadmin-form-actions">
          <button
            type="submit"
            className="cadmin-btn cadmin-btn--primary"
            disabled={busy || !selectedCourseId}
            aria-busy={busy}
          >
            {busy ? "שולח..." : "בצע פעולה"}
          </button>
          <button
            type="button"
            className="cadmin-btn"
            disabled={busy}
            onClick={() => {
              setAmount("");
              setSoftLimit("");
              setHardLimit("");
              setOverrideUntil("");
              setReason("");
              setFeedback(null);
            }}
          >
            נקה
          </button>
        </div>

        {feedback && (
          <div
            className={`cadmin-feedback ${feedback.ok ? "cadmin-feedback--ok" : "cadmin-feedback--err"}`}
            role="alert"
            aria-live="assertive"
          >
            {feedback.msg}
          </div>
        )}
      </form>
    </div>
  );
}

// --- ActivityLog (APS-REQ-144) ---

function ActivityLogTable({ entries }: { entries: ActivityLogEntry[] }) {
  return (
    <div className="cadmin-table-wrapper">
      <table className="cadmin-activity-table" aria-label="יומן פעילות -- ניכויי קרדיטים">
        <thead>
          <tr>
            <th scope="col">תאריך ושעה</th>
            <th scope="col">קורס</th>
            <th scope="col">סוג פעילות</th>
            <th scope="col">קרדיטים</th>
            <th scope="col">מזהה ניסיון</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", color: "var(--color-muted)", padding: "24px" }}>
                אין רשומות פעילות
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <span dir="ltr" style={{ unicodeBidi: "embed" }}>
                    {formatDateTime(entry.timestamp)}
                  </span>
                </td>
                <td>{entry.courseName}</td>
                <td>
                  <span className={activityTypeBadgeClass(entry.activityType)}>
                    {activityTypeLabel(entry.activityType)}
                  </span>
                </td>
                <td>
                  <span className="cadmin-numeric">
                    -{entry.amount}
                  </span>
                </td>
                <td>
                  {entry.attemptId ? (
                    <span dir="ltr" style={{ unicodeBidi: "embed", fontSize: "0.75rem", color: "var(--color-muted)" }}>
                      {entry.attemptId}
                    </span>
                  ) : "--"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// --- AuditLog (APS-REQ-143 -- every manual change writes to audit log) ---

function AuditLogTable({ entries }: { entries: AuditLogEntry[] }) {
  return (
    <div className="cadmin-table-wrapper">
      <table className="cadmin-audit-table" aria-label="יומן ביקורת -- פעולות מנהל">
        <thead>
          <tr>
            <th scope="col">תאריך ושעה</th>
            <th scope="col">מנהל</th>
            <th scope="col">פעולה</th>
            <th scope="col">כמות</th>
            <th scope="col">קורס</th>
            <th scope="col">סיבה</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", color: "var(--color-muted)", padding: "24px" }}>
                אין רשומות ביקורת
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={entry.id}>
                <td>
                  <span dir="ltr" style={{ unicodeBidi: "embed" }}>
                    {formatDateTime(entry.timestamp)}
                  </span>
                </td>
                <td>{entry.adminName}</td>
                <td>
                  <span className={actionBadgeClass(entry.action)}>
                    {actionLabel(entry.action)}
                  </span>
                </td>
                <td>
                  {entry.amount !== null ? (
                    <span className="cadmin-numeric">
                      {entry.amount > 0 ? "+" : ""}{entry.amount.toLocaleString("he-IL")}
                    </span>
                  ) : "--"}
                </td>
                <td>{entry.courseName ?? "כלל המכללה"}</td>
                <td style={{ maxInlineSize: "220px", wordBreak: "break-word" }}>
                  {entry.reason}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// --- AlertConfig (APS-REQ-147) ---

function AlertConfigPanel({
  collegeId,
  initialPct,
  onSaved,
}: {
  collegeId: string;
  initialPct: number;
  onSaved: (pct: number) => void;
}) {
  const [pct, setPct] = useState(String(initialPct));
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const num = parseInt(pct, 10);
    if (isNaN(num) || num < 1 || num > 99) {
      setFeedback({ ok: false, msg: "ערך סף חייב להיות בין 1 ל-99" });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      await updateAlertConfig(collegeId, { thresholdPct: num });
      setFeedback({ ok: true, msg: "הגדרת ההתראה עודכנה בהצלחה" });
      onSaved(num);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "שגיאה -- נסה שנית";
      setFeedback({ ok: false, msg });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cadmin-alert-panel">
      <h2 className="cadmin-section-heading">הגדרת התראת יתרה נמוכה (APS-REQ-147)</h2>
      <p style={{ fontSize: "0.875rem", color: "var(--color-text-secondary)", marginBlockEnd: "14px" }}>
        שלח התראה כאשר יתרת קורס יורדת מתחת לאחוז מסוים מהרף הקשיח שלו.
      </p>
      <form onSubmit={handleSave} noValidate>
        <div className="cadmin-alert-row">
          <label htmlFor="alert-threshold">סף התראה (% מהרף הקשיח)</label>
          <input
            id="alert-threshold"
            type="number"
            min="1"
            max="99"
            value={pct}
            onChange={(e) => setPct(e.target.value)}
          />
          <span style={{ fontSize: "0.875rem", color: "var(--color-muted)" }}>%</span>
          <button
            type="submit"
            className="cadmin-btn cadmin-btn--primary"
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? "שומר..." : "שמור"}
          </button>
        </div>
        {feedback && (
          <div
            className={`cadmin-feedback ${feedback.ok ? "cadmin-feedback--ok" : "cadmin-feedback--err"}`}
            role="alert"
            aria-live="assertive"
            style={{ marginBlockStart: "10px" }}
          >
            {feedback.msg}
          </div>
        )}
      </form>
    </div>
  );
}

// --- ExportBar (APS-REQ-148) ---

function ExportBar({ collegeId }: { collegeId: string }) {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleExport(format: "CSV" | "PDF") {
    setBusy(true);
    setFeedback(null);
    try {
      await exportCreditReport(collegeId, format);
      setFeedback(`דוח ${format} נשלח (stub -- ראה console.log)`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "שגיאה בייצוא";
      setFeedback(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="cadmin-section-heading">ייצוא דוח קרדיטים (APS-REQ-148)</h2>
      <div className="cadmin-export-bar">
        <span className="cadmin-export-label">ייצא דוח:</span>
        <button
          type="button"
          className="cadmin-btn"
          onClick={() => handleExport("CSV")}
          disabled={busy}
          aria-busy={busy}
        >
          ייצוא CSV
        </button>
        <button
          type="button"
          className="cadmin-btn"
          onClick={() => handleExport("PDF")}
          disabled={busy}
          aria-busy={busy}
        >
          ייצוא PDF
        </button>
        {feedback && (
          <span style={{ fontSize: "0.8125rem", color: "var(--color-muted)" }}>
            {feedback}
          </span>
        )}
      </div>
      <p style={{ fontSize: "0.75rem", color: "var(--color-muted)", marginBlockStart: "8px" }}>
        הייצוא ב-mock mode רושם לקונסול בלבד. יחוּבר לקובץ אמיתי ב-Sprint 3.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface CreditAdminDashboardProps {
  data: CreditAdminVM;
}

export default function CreditAdminDashboard({ data }: CreditAdminDashboardProps) {
  const isMock = isCreditAdminMockMode();
  const [vm, setVm] = useState<CreditAdminVM>(data);
  const [activeTab, setActiveTab] = useState<TabKey>("ledger");
  const [selectedCourseId, setSelectedCourseId] = useState(
    data.college.courses[0]?.courseId ?? "",
  );

  // After a successful action we'd normally refetch -- in mock mode just no-op.
  const handleActionSuccess = useCallback(() => {
    // No-op in mock; real wiring would call fetchCreditAdminVM and setVm.
  }, []);

  const handleAlertSaved = useCallback((pct: number) => {
    setVm((prev) => ({
      ...prev,
      alertConfig: { thresholdPct: pct },
    }));
  }, []);

  const TABS: { key: TabKey; label: string }[] = [
    { key: "ledger", label: "יתרות ופעולות" },
    { key: "activity", label: "יומן פעילות" },
    { key: "audit", label: "יומן ביקורת" },
    { key: "settings", label: "הגדרות וייצוא" },
  ];

  return (
    <div className="cadmin-root">
      {/* Admin-only banner (APS-REQ-145) */}
      <div className="cadmin-banner" role="banner">
        כלי ניהול פנימי -- לשימוש מנהלי מערכת ומנהלי מכללה בלבד. סטודנטים אינם רואים
        מידע זה.
      </div>

      {/* Header */}
      <header className="cadmin-header">
        <div>
          <h1 className="cadmin-header__title">ניהול קרדיטים</h1>
          <div className="cadmin-header__sub">{vm.college.collegeName}</div>
        </div>
        <div className="cadmin-header__actions">
          {isMock && <span className="cadmin-mock-badge">MOCK MODE</span>}
        </div>
      </header>

      {/* Body */}
      <main className="cadmin-body">
        {/* College totals (APS-REQ-144) */}
        <section aria-label="סיכום מכללה">
          <div className="cadmin-college-card">
            <div className="cadmin-college-name">{vm.college.collegeName}</div>
            <div className="cadmin-college-total">
              סך יתרת קרדיטים (כלל הקורסים):{" "}
              <span className="cadmin-numeric">
                {vm.college.totalBalance.toLocaleString("he-IL")}
              </span>
              {" "}קרדיטים
            </div>
          </div>
        </section>

        {/* Tabs */}
        <div
          className="cadmin-tabs"
          role="tablist"
          aria-label="ניווט בין חלקי ממשק ניהול הקרדיטים"
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              type="button"
              className={`cadmin-tab${activeTab === tab.key ? " cadmin-tab--active" : ""}`}
              aria-selected={activeTab === tab.key}
              aria-controls={`cadmin-panel-${tab.key}`}
              id={`cadmin-tab-${tab.key}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ledger + actions tab */}
        {activeTab === "ledger" && (
          <div
            role="tabpanel"
            id="cadmin-panel-ledger"
            aria-labelledby="cadmin-tab-ledger"
          >
            {/* Course ledger table (APS-REQ-144) */}
            <section aria-label="יתרות לפי קורס">
              <h2 className="cadmin-section-heading">
                יתרות קרדיטים לפי קורס -- סף התראה:{" "}
                <span className="cadmin-numeric">{vm.alertConfig.thresholdPct}</span>%
              </h2>
              <CourseLedgerTable
                courses={vm.college.courses}
                thresholdPct={vm.alertConfig.thresholdPct}
                onSelectCourse={setSelectedCourseId}
                selectedCourseId={selectedCourseId}
              />
            </section>

            {/* Action panel (APS-REQ-143) */}
            <section aria-label="ביצוע פעולות על קרדיטים" style={{ marginBlockStart: "24px" }}>
              <ActionPanel
                courses={vm.college.courses}
                selectedCourseId={selectedCourseId}
                onSuccess={handleActionSuccess}
              />
            </section>
          </div>
        )}

        {/* Activity log tab (APS-REQ-144) */}
        {activeTab === "activity" && (
          <div
            role="tabpanel"
            id="cadmin-panel-activity"
            aria-labelledby="cadmin-tab-activity"
          >
            <h2 className="cadmin-section-heading">יומן פעילות -- ניכויי קרדיטים</h2>
            <ActivityLogTable entries={vm.activityLog} />
          </div>
        )}

        {/* Audit log tab (APS-REQ-143) */}
        {activeTab === "audit" && (
          <div
            role="tabpanel"
            id="cadmin-panel-audit"
            aria-labelledby="cadmin-tab-audit"
          >
            <h2 className="cadmin-section-heading">יומן ביקורת -- פעולות מנהל</h2>
            <AuditLogTable entries={vm.auditLog} />
          </div>
        )}

        {/* Settings + export tab (APS-REQ-147, 148) */}
        {activeTab === "settings" && (
          <div
            role="tabpanel"
            id="cadmin-panel-settings"
            aria-labelledby="cadmin-tab-settings"
          >
            <AlertConfigPanel
              collegeId={vm.college.collegeId}
              initialPct={vm.alertConfig.thresholdPct}
              onSaved={handleAlertSaved}
            />
            <div style={{ marginBlockStart: "24px" }}>
              <ExportBar collegeId={vm.college.collegeId} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
