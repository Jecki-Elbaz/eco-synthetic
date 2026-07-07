"use client";

import React, { useCallback } from "react";

export interface NotesSections {
  problem: string;
  thoughts: string;
  emotions: string;
  behaviours: string;
  values: string;
  hypotheses: string;
}

interface NotesPanelProps {
  notes: NotesSections;
  onChange: (field: keyof NotesSections, value: string) => void;
  lang: "he" | "en";
}

const LABELS = {
  he: {
    title: "פתקים (ACT/LI-CBT)",
    problem: "הצגת הבעיה",
    thoughts: "מחשבות",
    emotions: "רגשות",
    behaviours: "התנהגויות",
    values: "ערכים",
    hypotheses: "השערות",
  },
  en: {
    title: "Notes (ACT/LI-CBT)",
    problem: "Problem statement",
    thoughts: "Thoughts",
    emotions: "Emotions",
    behaviours: "Behaviours",
    values: "Values",
    hypotheses: "Hypotheses",
  },
};

const FIELDS: Array<keyof NotesSections> = [
  "problem",
  "thoughts",
  "emotions",
  "behaviours",
  "values",
  "hypotheses",
];

export default function NotesPanel({ notes, onChange, lang }: NotesPanelProps) {
  const t = LABELS[lang];

  const handleChange = useCallback(
    (field: keyof NotesSections, value: string) => {
      onChange(field, value);
    },
    [onChange]
  );

  return (
    <div className="notes-panel" id="notes-panel" role="complementary" aria-label={t.title}>
      <div className="notes-panel__header">{t.title}</div>
      <div className="notes-panel__sections">
        {FIELDS.map((field) => {
          const labelId = `notes-label-${field}`;
          return (
            <div key={field}>
              <label className="notes-section__label" id={labelId} htmlFor={`notes-${field}`}>
                {t[field]}
              </label>
              <textarea
                id={`notes-${field}`}
                className="notes-section__field"
                rows={3}
                value={notes[field]}
                onChange={(e) => handleChange(field, e.target.value)}
                aria-labelledby={labelId}
                dir="auto"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
