"use client";

import React from "react";

interface TurnCounterProps {
  current: number;
  max: number;
  softWarnAt?: number;
  lang: "he" | "en";
}

const L = {
  he: {
    turn: "תור",
    of: "/",
    warnLabel: "מתקרב/ת למגבלה",
  },
  en: {
    turn: "Turn",
    of: "/",
    warnLabel: "Approaching limit",
  },
};

export default function TurnCounter({
  current,
  max,
  softWarnAt = 60,
  lang,
}: TurnCounterProps) {
  const t = L[lang];
  const isWarn = current >= softWarnAt;

  return (
    <footer className="turn-counter" role="contentinfo" aria-label={`${t.turn} ${current} ${t.of} ${max}`}>
      <span className="turn-counter__label" dir="ltr">
        {t.turn} <bdi dir="ltr">{current} {t.of} {max}</bdi>
      </span>
      {isWarn && (
        <span className="turn-counter__badge" role="status" aria-live="polite">
          {t.warnLabel}
        </span>
      )}
    </footer>
  );
}
