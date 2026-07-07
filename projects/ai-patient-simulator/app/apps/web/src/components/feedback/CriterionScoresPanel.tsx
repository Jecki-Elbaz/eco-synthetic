"use client";

import React, { useState } from "react";
import type { CriterionScore, RubricCriterionView, TranscriptTurn } from "@/lib/evaluation-types";

interface CriterionScoresPanelProps {
  scores: Record<string, CriterionScore>;
  criteria: RubricCriterionView[];
  transcript: TranscriptTurn[];
  lang: "he" | "en";
  onEvidenceClick: (turnNumber: number) => void;
}

const L = {
  he: {
    heading: "ניקוד לפי קריטריון",
    formativeBadge: "פורמטיבי - המרצה יסקור לפני שיחשב רשמי",
    notesLabel: "הסבר הציון",
    evidenceLabel: "עדות מהתמלול",
    turnPrefix: "תור",
    noEvidence: "אין עדות ספציפית מהתמלול",
    phrasingSuggestion: "דוגמה לניסוח חלופי (לא התשובה היחידה הנכונה)",
  },
  en: {
    heading: "Criterion scores",
    formativeBadge: "Formative - your lecturer will review this score before it is treated as official",
    notesLabel: "Score rationale",
    evidenceLabel: "Transcript evidence",
    turnPrefix: "Turn",
    noEvidence: "No specific transcript evidence",
    phrasingSuggestion: "Example alternative phrasing (not the only valid response)",
  },
};

interface CriterionRowProps {
  criterionId: string;
  criterion: RubricCriterionView;
  score: CriterionScore;
  transcript: TranscriptTurn[];
  lang: "he" | "en";
  onEvidenceClick: (turnNumber: number) => void;
}

function CriterionRow({
  criterionId,
  criterion,
  score,
  transcript,
  lang,
  onEvidenceClick,
}: CriterionRowProps) {
  const [open, setOpen] = useState(false);
  const t = L[lang];

  const pct = score.maxScore > 0 ? (score.score / score.maxScore) * 100 : 0;
  const isFormative = score.requiresTeacherReview;

  // Build evidence excerpt map for quick lookup
  const turnTextMap = new Map<number, string>(
    transcript.map((turn) => [turn.turnNumber, turn.text]),
  );

  // Strip the internal "[FORMATIVE-ONLY: ...]" suffix from notes before display
  const displayNotes = score.notes
    .replace(/\s*\[FORMATIVE-ONLY:[^\]]*\]/g, "")
    .trim();

  return (
    <div
      className={`criterion-row${isFormative ? " criterion-row--formative" : ""}`}
      role="region"
      aria-label={`${criterionId} ${criterion.label}`}
    >
      <button
        className="criterion-row__header"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        <span className="criterion-row__id" aria-label={`ID: ${criterionId}`}>
          {criterionId}
        </span>
        <span className="criterion-row__label">{criterion.label}</span>

        {isFormative && (
          <span className="formative-badge" role="note">
            {t.formativeBadge}
          </span>
        )}

        <span className="criterion-row__score" dir="ltr">
          {score.score} / {score.maxScore}
        </span>
        <span
          className="criterion-row__bar-track"
          role="img"
          aria-label={`ציון: ${score.score} מתוך ${score.maxScore}`}
        >
          <span
            className={`criterion-row__bar-fill${isFormative ? " criterion-row__bar-fill--formative" : ""}`}
            style={{ inlineSize: `${pct}%` }}
          />
        </span>
        <span
          className={`criterion-row__chevron${open ? " criterion-row__chevron--open" : ""}`}
          aria-hidden="true"
        >
          {"▼"}
        </span>
      </button>

      {open && (
        <div className="criterion-detail">
          {/* Score rationale */}
          <div>
            <p className="criterion-detail__section-label">{t.notesLabel}</p>
            <p className="criterion-detail__notes">{displayNotes}</p>
          </div>

          {/* Transcript evidence */}
          <div>
            <p className="criterion-detail__section-label">{t.evidenceLabel}</p>
            {score.evidence.length > 0 ? (
              <ul className="criterion-detail__evidence-list">
                {score.evidence.map((turnNum) => {
                  const excerpt = turnTextMap.get(turnNum);
                  return (
                    <li key={turnNum}>
                      <button
                        className="evidence-link"
                        onClick={() => onEvidenceClick(turnNum)}
                        type="button"
                      >
                        <span className="evidence-link__turn">
                          {t.turnPrefix} {turnNum}:
                        </span>
                        {excerpt ? (
                          <span>
                            &ldquo;{excerpt.slice(0, 80)}{excerpt.length > 80 ? "..." : ""}&rdquo;
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p style={{ color: "var(--color-muted)", fontSize: "0.875rem" }}>
                {t.noEvidence}
              </p>
            )}
          </div>

          {/* Suggested phrasing -- derived from notes when available */}
          {isFormative && (
            <div className="suggested-phrasing">
              <p className="suggested-phrasing__disclaimer">{t.phrasingSuggestion}</p>
              <p className="suggested-phrasing__text">
                {lang === "he"
                  ? "\"האם יש לך מחשבות שמדאיגות אותך? אני רוצה להבין טוב יותר.\""
                  : '"Are there thoughts that worry you? I want to understand better."'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CriterionScoresPanel({
  scores,
  criteria,
  transcript,
  lang,
  onEvidenceClick,
}: CriterionScoresPanelProps) {
  const t = L[lang];

  return (
    <section className="fb-criteria-panel" aria-label={t.heading}>
      <p className="fb-criteria-panel__heading">{t.heading}</p>
      {criteria.map((criterion) => {
        const score = scores[criterion.id];
        if (!score) return null;
        return (
          <CriterionRow
            key={criterion.id}
            criterionId={criterion.id}
            criterion={criterion}
            score={score}
            transcript={transcript}
            lang={lang}
            onEvidenceClick={onEvidenceClick}
          />
        );
      })}
    </section>
  );
}
