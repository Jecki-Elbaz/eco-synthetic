"use client";

import React from "react";

interface HelpOverlayProps {
  lang: "he" | "en";
  onClose: () => void;
  onEmailSupport: () => void;
}

const L = {
  he: {
    title: "עזרה",
    skip: "דלג/י לתמיכה בדוא\"ל",
    close: "סגור",
    items: [
      {
        q: "כיצד לשלוח הודעה?",
        a: 'הקלד/י את תגובתך ולחץ/י "שלח" או Enter.',
      },
      {
        q: "האם ניתן להפסיק ולהמשיך?",
        a: "הסשן נשמר אוטומטית. ניתן לחזור ולהמשיך מאותה נקודה.",
      },
      {
        q: "מה קורה כשהזמן נגמר?",
        a: "במצב ממשב - תופיע הודעה רכה. אין הפסקה כפויה.",
      },
      {
        q: "האם פתקי תרגול גלויים למרצה?",
        a: "בהתאם להגדרות הקורס. ראה/י הנחיות המשימה.",
      },
    ],
  },
  en: {
    title: "Help",
    skip: 'Skip to email support',
    close: "Close",
    items: [
      {
        q: "How do I send a message?",
        a: 'Type your response and press "Send" or Enter.',
      },
      {
        q: "Can I pause and continue?",
        a: "The session auto-saves. You can return and continue from the same point.",
      },
      {
        q: "What happens when time runs out?",
        a: "In formative mode, a soft prompt appears. There is no hard cut.",
      },
      {
        q: "Are my notes visible to the lecturer?",
        a: "Depends on course settings. See your assignment instructions.",
      },
    ],
  },
};

export default function HelpOverlay({ lang, onClose, onEmailSupport }: HelpOverlayProps) {
  const t = L[lang];

  return (
    <div
      className="help-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t.title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="help-panel">
        {/* Skip to email escape hatch at block-start per spec */}
        <button className="help-panel__skip" type="button" onClick={onEmailSupport}>
          {t.skip}
        </button>

        <h2 className="help-panel__title">{t.title}</h2>

        {t.items.map((item, i) => (
          <div key={i} className="help-panel__item">
            <div className="help-panel__item-q">{item.q}</div>
            <div className="help-panel__item-a">{item.a}</div>
          </div>
        ))}

        <button className="btn btn--ghost help-panel__close" type="button" onClick={onClose}>
          {t.close}
        </button>
      </div>
    </div>
  );
}
