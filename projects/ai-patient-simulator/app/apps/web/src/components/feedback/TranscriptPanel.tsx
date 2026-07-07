"use client";

import React, { useEffect, useRef } from "react";
import type { TranscriptTurn, TranscriptHighlight, HighlightType } from "@/lib/evaluation-types";

interface TranscriptPanelProps {
  transcript: TranscriptTurn[];
  highlights: TranscriptHighlight[];
  lang: "he" | "en";
  /** The turn number currently selected from the criterion evidence links */
  activeTurnNumber: number | null;
  onActiveTurnClear: () => void;
}

const L = {
  he: {
    heading: "תמלול הסשן",
    student: "סטודנט/ית",
    patient: "מטופל/ת (הדמיה)",
    turnPrefix: "תור",
    strongLabel: "רגע חזק",
    missedLabel: "הזדמנות שהוחמצה",
    riskLabel: "דגל סיכון",
    criterionNote: "קריטריון קשור",
  },
  en: {
    heading: "Session transcript",
    student: "Student",
    patient: "Simulated patient",
    turnPrefix: "Turn",
    strongLabel: "Strong moment",
    missedLabel: "Missed opportunity",
    riskLabel: "Risk flag",
    criterionNote: "Related criterion",
  },
};

function highlightClass(type: HighlightType): string {
  switch (type) {
    case "STRONG":
      return "tr-turn--strong";
    case "MISSED":
      return "tr-turn--missed";
    case "RISK_FLAG":
      return "tr-turn--risk-flag";
  }
}

function badgeClass(type: HighlightType): string {
  return `hl-tooltip__badge hl-tooltip__badge--${type}`;
}

function badgeLabel(type: HighlightType, lang: "he" | "en"): string {
  const t = L[lang];
  switch (type) {
    case "STRONG":
      return t.strongLabel;
    case "MISSED":
      return t.missedLabel;
    case "RISK_FLAG":
      return t.riskLabel;
  }
}

export default function TranscriptPanel({
  transcript,
  highlights,
  lang,
  activeTurnNumber,
  onActiveTurnClear,
}: TranscriptPanelProps) {
  const t = L[lang];

  // Build a map: turnNumber -> highlight info
  const highlightMap = new Map<number, TranscriptHighlight>();
  for (const h of highlights) {
    highlightMap.set(h.turnNumber, h);
  }

  // Refs map for scrolling
  const turnRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  useEffect(() => {
    if (activeTurnNumber === null) return;
    const el = turnRefs.current.get(activeTurnNumber);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // Add pulse class then remove after animation
    el.classList.add("tr-turn--pulsing");
    const timer = setTimeout(() => {
      el.classList.remove("tr-turn--pulsing");
      onActiveTurnClear();
    }, 700);

    return () => clearTimeout(timer);
  }, [activeTurnNumber, onActiveTurnClear]);

  return (
    <section className="fb-transcript-panel" aria-label={t.heading}>
      <p className="fb-transcript-panel__heading">{t.heading}</p>
      {transcript.map((turn) => {
        const highlight = highlightMap.get(turn.turnNumber);
        const isStudent = turn.role === "STUDENT";

        const classes = [
          "tr-turn",
          isStudent ? "tr-turn--student" : "tr-turn--patient",
          highlight ? highlightClass(highlight.type) : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <div
            key={turn.turnNumber}
            className={classes}
            ref={(el) => {
              if (el) {
                turnRefs.current.set(turn.turnNumber, el);
              } else {
                turnRefs.current.delete(turn.turnNumber);
              }
            }}
            id={`turn-${turn.turnNumber}`}
            tabIndex={highlight ? 0 : -1}
          >
            <p className="tr-turn__meta" dir="ltr">
              {t.turnPrefix} {turn.turnNumber} --{" "}
              {isStudent ? t.student : t.patient}
            </p>
            <p style={{ margin: 0 }}>{turn.text}</p>

            {highlight && (
              <div className="hl-tooltip" aria-label={`${badgeLabel(highlight.type, lang)}: ${highlight.note}`}>
                <span className={badgeClass(highlight.type)}>
                  {badgeLabel(highlight.type, lang)}
                </span>
                <p className="hl-tooltip__note">{highlight.note}</p>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
