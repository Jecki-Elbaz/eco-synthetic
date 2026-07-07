"use client";

import React from "react";

interface FinishModalProps {
  turnsUsed: number;
  maxTurns: number;
  minTurns?: number | undefined;
  elapsedSeconds: number;
  lang: "he" | "en";
  onContinue: () => void;
  onEnd: () => void;
}

function formatElapsed(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

const L = {
  he: {
    title: "האם לסיים את הסשן?",
    turns: "תורות שנוצלו",
    elapsed: "זמן שחלף",
    warnLow: (min: number, n: number) =>
      `השלמת רק ${n} תורות. שקול/י להמשיך לתרגל (מינימום מומלץ: ${min}).`,
    continue: "המשך/י את הסשן",
    end: "סיים/י את הסשן",
    of: "/",
  },
  en: {
    title: "Are you sure you want to end the session?",
    turns: "Turns used",
    elapsed: "Time elapsed",
    warnLow: (min: number, n: number) =>
      `You have only completed ${n} turns. Consider continuing to practice (recommended minimum: ${min}).`,
    continue: "Continue session",
    end: "End session",
    of: "/",
  },
};

export default function FinishModal({
  turnsUsed,
  maxTurns,
  minTurns,
  elapsedSeconds,
  lang,
  onContinue,
  onEnd,
}: FinishModalProps) {
  const t = L[lang];
  const belowMin = minTurns !== undefined && turnsUsed < minTurns;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="finish-modal-title">
      <div className="modal-box">
        <h2 className="modal-box__title" id="finish-modal-title">
          {t.title}
        </h2>

        <p className="modal-box__meta" dir="ltr">
          {t.turns}: <bdi dir="ltr">{turnsUsed} {t.of} {maxTurns}</bdi>
        </p>
        <p className="modal-box__meta" dir="ltr">
          {t.elapsed}: <bdi dir="ltr">{formatElapsed(elapsedSeconds)}</bdi>
        </p>

        {belowMin && minTurns !== undefined && (
          <div className="modal-box__warn" role="alert">
            {t.warnLow(minTurns, turnsUsed)}
          </div>
        )}

        <div className="modal-box__actions">
          <button className="btn btn--ghost" type="button" onClick={onContinue}>
            {t.continue}
          </button>
          <button className="btn btn--danger" type="button" onClick={onEnd}>
            {t.end}
          </button>
        </div>
      </div>
    </div>
  );
}
