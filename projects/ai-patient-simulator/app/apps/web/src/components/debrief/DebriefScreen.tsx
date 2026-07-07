"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import "./debrief.css";
import type { DebriefMessage } from "@/lib/evaluation-types";
import { postDebrief } from "@/lib/debrief-client";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_QUESTIONS = 10;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface DebriefScreenProps {
  attemptId: string;
  lang: "he" | "en";
  /** Called when user clicks "Back to feedback" or finishes debrief */
  onBackToFeedback?: () => void;
  /** Called when user clicks "Return to dashboard" */
  onReturnToDashboard?: () => void;
}

// ---------------------------------------------------------------------------
// Strings
// ---------------------------------------------------------------------------

const L = {
  he: {
    title: "שיחת דיברוף - מדריך חינוכי",
    boundary:
      "שיחה זו מבוססת על התמלול והרובריקה שלך בלבד. היא אינה יכולה לשנות את הציון שלך.",
    counterLabel: "שאלות ששומשו",
    counterOf: "מתוך",
    studentLabel: "את/ה",
    supervisorLabel: "מדריך/ה חינוכי/ת",
    placeholder: "כתוב/י שאלה על הסשן שלך...",
    sendBtn: "שלח/י",
    emptyState: "שאל/י שאלה על הסשן שלך כדי להתחיל בדיברוף.",
    turnChipPrefix: "תור",
    backToFeedback: "חזרה למשוב",
    returnToDashboard: "חזרה לדשבורד",
    capReached:
      "השתמשת בכל שאלות הדיברוף לסשן זה. פנה/י למרצה אם יש שאלות נוספות.",
    errorLabel: "שגיאה בשליחת השאלה. נסה/י שוב.",
    typing: "המדריך/ה מכין/ה תגובה...",
  },
  en: {
    title: "Debrief chat - educational supervisor",
    boundary:
      "This chat uses only your transcript and rubric. It cannot change your grade.",
    counterLabel: "Questions used",
    counterOf: "of",
    studentLabel: "You",
    supervisorLabel: "Educational supervisor",
    placeholder: "Type a question about your session...",
    sendBtn: "Send",
    emptyState: "Ask a question about your session to begin the debrief.",
    turnChipPrefix: "Turn",
    backToFeedback: "Back to feedback",
    returnToDashboard: "Return to dashboard",
    capReached:
      "You have used all debrief questions for this session. Contact your lecturer for further guidance.",
    errorLabel: "Error sending question. Please try again.",
    typing: "Supervisor is composing a response...",
  },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DebriefScreen({
  attemptId,
  lang,
  onBackToFeedback,
  onReturnToDashboard,
}: DebriefScreenProps) {
  const t = L[lang];
  const [messages, setMessages] = useState<DebriefMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const [capped, setCapped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Count ONLY student messages for the cap display
  const studentQuestionCount = messages.filter((m) => m.role === "student").length;
  const remaining = Math.max(0, MAX_QUESTIONS - studentQuestionCount);
  const isNearCap = remaining <= 3 && remaining > 0;

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || sending || capped) return;

    const studentMsg: DebriefMessage = {
      id: `s-${Date.now()}`,
      role: "student",
      text,
    };

    setMessages((prev) => [...prev, studentMsg]);
    setInputText("");
    setSending(true);
    setError(null);

    try {
      const resp = await postDebrief(attemptId, { message: text });

      const supervisorMsg: DebriefMessage = {
        id: `sv-${Date.now()}`,
        role: "supervisor",
        text: resp.supervisorText,
        citedTurns: resp.citedTurns,
      };

      setMessages((prev) => [...prev, supervisorMsg]);

      if (resp.capped) {
        setCapped(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setSending(false);
    }
  }, [inputText, sending, capped, attemptId]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  function handleTurnChipClick(turnNumber: number) {
    // In a full implementation, this would open the transcript at that turn.
    // For now, navigate to feedback screen with a hash (same-origin, no new dep).
    if (typeof window !== "undefined") {
      const feedbackUrl = `/feedback/${encodeURIComponent(attemptId)}#turn-${turnNumber}`;
      window.open(feedbackUrl, "_blank", "noopener");
    }
  }

  function handleBackToFeedback() {
    if (onBackToFeedback) {
      onBackToFeedback();
    } else if (typeof window !== "undefined") {
      window.location.href = `/feedback/${encodeURIComponent(attemptId)}`;
    }
  }

  function handleReturnToDashboard() {
    if (onReturnToDashboard) {
      onReturnToDashboard();
    } else if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  }

  return (
    <div
      className="db-screen db-root"
      dir={lang === "he" ? "rtl" : "ltr"}
      lang={lang}
    >
      {/* Header -- sticky, always visible */}
      <header className="db-header">
        <h1 className="db-header__title">{t.title}</h1>
        {/* Hard boundary notice -- non-dismissable per APS-REQ-073 */}
        <p className="db-header__boundary" role="note">
          {t.boundary}
        </p>
        <p
          className={`db-header__counter${isNearCap ? " db-header__counter--warn" : ""}`}
          aria-live="polite"
        >
          {t.counterLabel}: {studentQuestionCount} {t.counterOf} {MAX_QUESTIONS}
        </p>
      </header>

      {/* Message list */}
      <div
        className="db-messages"
        role="log"
        aria-live="polite"
        aria-label={t.title}
      >
        {messages.length === 0 && !sending && (
          <div className="db-empty">{t.emptyState}</div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`db-msg-row db-msg-row--${msg.role}`}
          >
            <span className="db-msg-row__label">
              {msg.role === "student" ? t.studentLabel : t.supervisorLabel}
            </span>
            <div className={`db-bubble db-bubble--${msg.role}`}>
              {msg.text}
              {/* Cited turn chips on supervisor messages */}
              {msg.role === "supervisor" &&
                msg.citedTurns &&
                msg.citedTurns.length > 0 && (
                  <div className="db-cited-turns">
                    {msg.citedTurns.map((turnNum) => (
                      <button
                        key={turnNum}
                        className="db-turn-chip"
                        type="button"
                        onClick={() => handleTurnChipClick(turnNum)}
                        title={`${t.turnChipPrefix} ${turnNum}`}
                      >
                        {t.turnChipPrefix} {turnNum}
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>
        ))}

        {/* Typing indicator while waiting for supervisor response */}
        {sending && (
          <div
            className="db-typing-row"
            role="status"
            aria-label={t.typing}
          >
            <span className="db-typing-dot" aria-hidden="true" />
            <span className="db-typing-dot" aria-hidden="true" />
            <span className="db-typing-dot" aria-hidden="true" />
          </div>
        )}

        {/* Cap message when questions exhausted */}
        {capped && <div className="db-cap-msg">{t.capReached}</div>}

        {/* Error message */}
        {error && (
          <div className="db-cap-msg" role="alert" style={{ background: "#fee2e2", borderColor: "#fca5a5", color: "#991b1b" }}>
            {t.errorLabel}
          </div>
        )}

        <div ref={bottomRef} aria-hidden="true" />
      </div>

      {/* Input area */}
      <div className="db-input-area">
        <textarea
          className="db-input-area__text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.placeholder}
          rows={2}
          disabled={capped || sending}
          aria-label={t.placeholder}
          aria-disabled={capped || sending}
        />
        <button
          className="db-send-btn"
          type="button"
          onClick={() => void handleSend()}
          disabled={!inputText.trim() || capped || sending}
          aria-label={t.sendBtn}
        >
          {/* Unicode arrow -- ASCII-safe for code files; Hebrew context reads fine */}
          {"->"}
        </button>
      </div>
    </div>
  );
}
