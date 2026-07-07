"use client";

import React from "react";

interface FeedbackHeaderProps {
  sessionTitle: string;
  lang: "he" | "en";
}

const L = {
  he: {
    feedbackLabel: "משוב לסשן",
    formativeLabel: "אינדיקטור פורמטיבי - לא ציון רשמי",
    boundaryLabel: "מטופל/ת הדמיה לאימון - משוב חינוכי",
  },
  en: {
    feedbackLabel: "Session feedback",
    formativeLabel: "Formative indicator - not an official grade",
    boundaryLabel: "Simulated training patient - educational feedback",
  },
};

export default function FeedbackHeader({ sessionTitle, lang }: FeedbackHeaderProps) {
  const t = L[lang];
  return (
    <header className="fb-header" role="banner">
      <h1 className="fb-header__title">
        {t.feedbackLabel} - {sessionTitle}
      </h1>
      {/* ALWAYS visible -- Sami/SME requirement: formative label is non-dismissable */}
      <span className="fb-header__formative-label" role="note">
        {t.formativeLabel}
      </span>
      <p className="fb-header__boundary-label">{t.boundaryLabel}</p>
    </header>
  );
}
