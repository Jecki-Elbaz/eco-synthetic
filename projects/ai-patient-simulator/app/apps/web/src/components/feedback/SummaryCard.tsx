"use client";

import React from "react";

interface SummaryCardProps {
  overallSummary: string;
  /** Bullet-point focus areas extracted from the summary (1-3 items) */
  focusAreas: string[];
  lang: "he" | "en";
}

const L = {
  he: {
    heading: "סיכום פורמטיבי",
    focusHeading: "תחומים מוצעים לחיזוק",
  },
  en: {
    heading: "Formative summary",
    focusHeading: "Suggested focus areas",
  },
};

export default function SummaryCard({ overallSummary, focusAreas, lang }: SummaryCardProps) {
  const t = L[lang];
  return (
    <section className="fb-summary-card" aria-label={t.heading}>
      <p className="fb-summary-card__heading">{t.heading}</p>
      <p className="fb-summary-card__text">{overallSummary}</p>
      {focusAreas.length > 0 && (
        <>
          <p className="fb-summary-card__focus-heading">{t.focusHeading}</p>
          <ul className="fb-summary-card__focus-list">
            {focusAreas.map((area, i) => (
              <li key={i}>{area}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
