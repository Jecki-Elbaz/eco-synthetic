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
  /**
   * When true, shows a preview-run banner at the top of the screen.
   * Set by the authoring UI after POST /assignments/:id/preview succeeds.
   * AUTHOR_PREVIEW attempts are not visible to students; this banner reminds
   * the author they are viewing an author-preview run, not a real student attempt.
   */
  isPreview?: boolean;
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

// Preview banner strings
const L_preview = {
  he: {
    label: "תצוגה מקדימה לסגל",
    note: "הרצת בוט לבדיקת הסימולציה. תצוגה זו אינה גלויה לסטודנטים ואינה נכנסת לחישוב קרדיטים.",
  },
  en: {
    label: "Author preview run",
    note: "Bot-driven preview. This run is not visible to students and does not consume credits.",
  },
};

export default function FeedbackScreen({
  attemptId,
  sessionTitle,
  lang,
  isPreview = false,
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
    // Reset state from previous attempt
    setEvaluation(null);
    setCriteria([]);
    setTranscript([]);

    async function load() {
      if (isPreview) {
        // Preview: transcript is required; evaluation is optional (may be absent
        // if the pipeline did not complete evaluation synchronously).
        const tx = await fetchTranscript(attemptId);
        if (cancelled) return;
        setTranscript(tx);

        try {
          const [ev, crit] = await Promise.all([
            fetchEvaluation(attemptId),
            fetchRubricCriteria(attemptId),
          ]);
          if (!cancelled) {
            setEvaluation(ev);
            setCriteria(crit);
          }
        } catch {
          // Evaluation not yet available for this preview attempt; show transcript only.
          // Not an error -- caller will render transcript-only branch.
        }

        if (!cancelled) setLoading(false);
      } else {
        // Normal student path: all three are required.
        const [ev, crit, tx] = await Promise.all([
          fetchEvaluation(attemptId),
          fetchRubricCriteria(attemptId),
          fetchTranscript(attemptId),
        ]);
        if (cancelled) return;
        setEvaluation(ev);
        setCriteria(crit);
        setTranscript(tx);
        setLoading(false);
      }
    }

    load().catch((err: unknown) => {
      if (cancelled) return;
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [attemptId, isPreview]);

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

      {isPreview && (
        <div
          role="note"
          aria-label={L_preview[lang].label}
          style={{
            background: "#eff6ff",
            borderBottom: "1px solid #bfdbfe",
            padding: "10px 20px",
            display: "flex",
            gap: "8px",
            alignItems: "baseline",
            fontSize: "0.875rem",
            color: "#1e40af",
          }}
        >
          <span style={{ fontWeight: 700, flexShrink: 0 }}>
            {L_preview[lang].label}
          </span>
          <span>{L_preview[lang].note}</span>
        </div>
      )}

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

      {/* Full view: evaluation + transcript (standard student flow or preview with eval) */}
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

      {/* Preview transcript-only view: evaluation not yet available for this run */}
      {!loading && !error && !evaluation && isPreview && transcript.length > 0 && (
        <main className="fb-body">
          <div
            role="note"
            style={{
              background: "#fefce8",
              border: "1px solid #fde68a",
              borderRadius: "8px",
              padding: "12px 16px",
              fontSize: "0.875rem",
              color: "#78350f",
              marginBlockEnd: "16px",
            }}
          >
            {lang === "he"
              ? "הערכה טרם זמינה לריצה זו. מוצג תמלול הסשן בלבד."
              : "Evaluation not yet available for this run. Showing session transcript only."}
          </div>
          <TranscriptPanel
            transcript={transcript}
            highlights={[]}
            lang={lang}
            activeTurnNumber={activeTurnNumber}
            onActiveTurnClear={handleActiveTurnClear}
          />
        </main>
      )}
    </div>
  );
}
