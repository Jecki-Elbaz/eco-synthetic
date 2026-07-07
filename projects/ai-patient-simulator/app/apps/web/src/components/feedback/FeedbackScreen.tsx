"use client";

import React, { useState, useEffect, useCallback } from "react";
import "./feedback.css";
import FeedbackHeader from "./FeedbackHeader";
import SummaryCard from "./SummaryCard";
import CriterionScoresPanel from "./CriterionScoresPanel";
import TranscriptPanel from "./TranscriptPanel";
import DebriefEntryBlock from "./DebriefEntryBlock";
import type {
  EvaluationResponse,
  RubricCriterionView,
  TranscriptTurn,
} from "@/lib/evaluation-types";
import {
  fetchEvaluation,
  fetchRubricCriteria,
  fetchTranscript,
} from "@/lib/evaluation-client";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface FeedbackScreenProps {
  attemptId: string;
  sessionTitle: string;
  lang: "he" | "en";
  /** Called when student clicks "Begin debrief" */
  onBeginDebrief?: (attemptId: string) => void;
  /** Called when student clicks "Return to dashboard" */
  onReturnToDashboard?: () => void;
}

// ---------------------------------------------------------------------------
// Derived focus areas from overall summary
// ---------------------------------------------------------------------------

function extractFocusAreas(summary: string | null): string[] {
  if (!summary) return [];
  // Split on periods/semicolons and take sentences 2+ as focus areas (heuristic).
  // In production, the server would return these as structured fields.
  const sentences = summary.split(/[.;]/).map((s) => s.trim()).filter((s) => s.length > 20);
  return sentences.slice(1, 4);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FeedbackScreen({
  attemptId,
  sessionTitle,
  lang,
  onBeginDebrief,
  onReturnToDashboard,
}: FeedbackScreenProps) {
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [criteria, setCriteria] = useState<RubricCriterionView[]>([]);
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Turn number to scroll + pulse in the transcript panel (null = no active)
  const [activeTurnNumber, setActiveTurnNumber] = useState<number | null>(null);

  const L_err = {
    he: "שגיאה בטעינת המשוב. נסה/י שוב.",
    en: "Error loading feedback. Please try again.",
  };
  const L_loading = {
    he: "...טוען משוב",
    en: "Loading feedback...",
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchEvaluation(attemptId),
      fetchRubricCriteria(attemptId),
      fetchTranscript(attemptId),
    ])
      .then(([ev, crit, tx]) => {
        if (cancelled) return;
        setEvaluation(ev);
        setCriteria(crit);
        setTranscript(tx);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  const handleEvidenceClick = useCallback((turnNumber: number) => {
    setActiveTurnNumber(turnNumber);
  }, []);

  const handleActiveTurnClear = useCallback(() => {
    setActiveTurnNumber(null);
  }, []);

  function handleBeginDebrief() {
    if (onBeginDebrief) {
      onBeginDebrief(attemptId);
    } else if (typeof window !== "undefined") {
      window.location.href = `/debrief/${encodeURIComponent(attemptId)}`;
    }
  }

  function handleReturnToDashboard() {
    if (onReturnToDashboard) {
      onReturnToDashboard();
    } else if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

  const focusAreas = extractFocusAreas(evaluation?.overallSummary ?? null);

  return (
    <div
      className="fb-screen fb-root"
      dir={lang === "he" ? "rtl" : "ltr"}
      lang={lang}
    >
      <FeedbackHeader sessionTitle={sessionTitle} lang={lang} />

      {loading && (
        <div className="fb-loading" role="status" aria-live="polite">
          {L_loading[lang]}
        </div>
      )}

      {!loading && error && (
        <div className="fb-error" role="alert">
          {L_err[lang]}
        </div>
      )}

      {!loading && !error && evaluation && (
        <main className="fb-body">
          <SummaryCard
            overallSummary={evaluation.overallSummary ?? ""}
            focusAreas={focusAreas}
            lang={lang}
          />

          <div className="fb-panels">
            <CriterionScoresPanel
              scores={evaluation.structuredScores}
              criteria={criteria}
              transcript={transcript}
              lang={lang}
              onEvidenceClick={handleEvidenceClick}
            />
            <TranscriptPanel
              transcript={transcript}
              highlights={evaluation.transcriptHighlights}
              lang={lang}
              activeTurnNumber={activeTurnNumber}
              onActiveTurnClear={handleActiveTurnClear}
            />
          </div>

          <DebriefEntryBlock
            attemptId={attemptId}
            lang={lang}
            onBeginDebrief={handleBeginDebrief}
            onReturnToDashboard={handleReturnToDashboard}
          />
        </main>
      )}
    </div>
  );
}
