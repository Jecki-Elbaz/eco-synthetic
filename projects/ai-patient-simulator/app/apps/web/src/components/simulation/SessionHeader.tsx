"use client";

import React from "react";

export type TimerMode = "none" | "countdown" | "elapsed";

export interface SessionHeaderProps {
  title: string;
  timerMode: TimerMode;
  /** Seconds remaining (countdown) or seconds elapsed (elapsed). Ignored when mode is "none". */
  timerSeconds: number;
  timerExpired?: boolean;
  notesOpen: boolean;
  lang: "he" | "en";
  onHelp: () => void;
  onFinish: () => void;
  onToggleNotes: () => void;
  /**
   * S4-NOA-RESUME: When true, elapsed data was unavailable on resume.
   * Shows "-- : --" in the timer slot instead of a formatted time.
   * Ido A3 ruling: do NOT show 00:00 (would imply full time available).
   */
  timerUnavailable?: boolean;
}

function formatSeconds(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

const L = {
  he: {
    subtitle: "מטופל-סימולציה - מפגש ממשב",
    help: "עזרה",
    finish: "סיום",
    remaining: "נותר",
    elapsed: "חלף",
    notes: "פתקים",
    notesClose: "סגור פתקים",
    timeUp: "הזמן המוצע נגמר - המשך/י או סיים/י",
  },
  en: {
    subtitle: "Simulated training patient - formative session",
    help: "Help",
    finish: "Finish",
    remaining: "remaining",
    elapsed: "elapsed",
    notes: "Notes",
    notesClose: "Close notes",
    timeUp: "Suggested time reached - continue or end session",
  },
};

export default function SessionHeader({
  title,
  timerMode,
  timerSeconds,
  timerExpired = false,
  notesOpen,
  lang,
  onHelp,
  onFinish,
  onToggleNotes,
  timerUnavailable = false,
}: SessionHeaderProps) {
  const t = L[lang];
  // S4-NOA-RESUME: when elapsed was unavailable on resume, show "-- : --"
  // instead of any computed value (Ido A3: do not reset or show 00:00).
  const timerLabel =
    timerMode === "none"
      ? null
      : timerUnavailable
      ? "-- : --"
      : timerMode === "countdown"
      ? `${formatSeconds(timerSeconds)} ${t.remaining}`
      : `${formatSeconds(timerSeconds)} ${t.elapsed}`;

  return (
    <header className="sim-header" role="banner">
      <div className="sim-header__titles">
        <h1 className="sim-header__title">{title}</h1>
        <p className="sim-header__subtitle">{t.subtitle}</p>
      </div>

      <div className="sim-header__controls">
        {timerLabel !== null && (
          <span
            className={`sim-header__timer${timerExpired ? " sim-header__timer--warning" : ""}`}
            aria-live="off"
            aria-label={timerLabel}
            dir="ltr"
          >
            {timerLabel}
          </span>
        )}
        {timerExpired && (
          <span className="soft-warn-banner" role="alert">
            {t.timeUp}
          </span>
        )}
        <button
          className="btn btn--notes-toggle"
          type="button"
          onClick={onToggleNotes}
          aria-expanded={notesOpen}
          aria-controls="notes-panel"
        >
          {notesOpen ? t.notesClose : t.notes}
        </button>
        <button
          className="btn btn--ghost"
          type="button"
          onClick={onHelp}
          aria-label={t.help}
        >
          {t.help}
        </button>
        <button
          className="btn btn--danger"
          type="button"
          onClick={onFinish}
          aria-label={t.finish}
        >
          {t.finish}
        </button>
      </div>
    </header>
  );
}
