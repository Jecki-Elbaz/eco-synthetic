"use client";

import React from "react";

interface DebriefEntryBlockProps {
  attemptId: string;
  lang: "he" | "en";
  onBeginDebrief: () => void;
  onReturnToDashboard: () => void;
}

const L = {
  he: {
    heading: "רוצה לחקור את הסשן לעומק?",
    subtitle: "התחל/י שיחת דיברוף עם המדריך החינוכי",
    beginBtn: "פתח/י שיחת דיברוף",
    dashboardBtn: "חזרה לדשבורד",
  },
  en: {
    heading: "Want to explore your session further?",
    subtitle: "Start debrief chat - educational supervisor",
    beginBtn: "Begin debrief",
    dashboardBtn: "Return to dashboard",
  },
};

export default function DebriefEntryBlock({
  lang,
  onBeginDebrief,
  onReturnToDashboard,
}: DebriefEntryBlockProps) {
  const t = L[lang];
  return (
    <section className="fb-debrief-entry" aria-label={t.heading}>
      <h2 className="fb-debrief-entry__heading">{t.heading}</h2>
      <p className="fb-debrief-entry__subtitle">{t.subtitle}</p>
      <div className="fb-debrief-entry__actions">
        <button
          className="fb-btn fb-btn--primary"
          type="button"
          onClick={onBeginDebrief}
        >
          {t.beginBtn}
        </button>
        <button
          className="fb-btn fb-btn--ghost"
          type="button"
          onClick={onReturnToDashboard}
        >
          {t.dashboardBtn}
        </button>
      </div>
    </section>
  );
}
