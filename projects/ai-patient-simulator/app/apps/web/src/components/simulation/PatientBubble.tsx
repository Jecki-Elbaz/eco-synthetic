"use client";

import React from "react";
import NonVerbalCueTag from "./NonVerbalCueTag";

export type TypingStage = "dots" | "thinking" | "waiting" | "error";

interface PatientBubbleProps {
  message: string;
  lang: "he" | "en";
}

interface TypingIndicatorProps {
  stage: TypingStage;
  lang: "he" | "en";
  onWaitLonger?: (() => void) | undefined;
  onRetry?: (() => void) | undefined;
  onEndSession?: (() => void) | undefined;
}

const TYPING_LABELS = {
  he: {
    dots: "המטופל מקליד...",
    thinking: "המטופל חושב...",
    waiting: "לוקח רגע - אנא המתן/י.",
    error: "המטופל לוקח זמן רב. השיחה שמורה.",
    waitLonger: "המתן/י עוד",
    retry: "נסה/י שוב",
    endSession: "סיים/י וצפה/י במשוב",
  },
  en: {
    dots: "Patient is typing...",
    thinking: "Patient is thinking...",
    waiting: "Taking a moment - please wait.",
    error:
      "The patient is taking too long to respond. Your conversation is saved.",
    waitLonger: "Wait longer",
    retry: "Retry this message",
    endSession: "End session and review feedback",
  },
};

/**
 * Splits a patient message string into text segments and NV cue tags.
 * NV cues are bracketed sequences e.g. "[Long pause]".
 */
function splitMessageParts(
  msg: string
): Array<{ type: "text" | "cue"; value: string }> {
  const parts: Array<{ type: "text" | "cue"; value: string }> = [];
  const re = /(\[[^\]]+\])/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(msg)) !== null) {
    if (match.index > last) {
      parts.push({ type: "text", value: msg.slice(last, match.index) });
    }
    parts.push({ type: "cue", value: match[1] ?? "" });
    last = match.index + (match[1]?.length ?? 0);
  }
  if (last < msg.length) {
    parts.push({ type: "text", value: msg.slice(last) });
  }
  return parts;
}

export function PatientTypingIndicator({
  stage,
  lang,
  onWaitLonger,
  onRetry,
  onEndSession,
}: TypingIndicatorProps) {
  const t = TYPING_LABELS[lang];

  if (stage === "error") {
    return (
      <div
        className="msg-row msg-row--patient"
        role="alert"
        aria-live="assertive"
      >
        <span className="msg-row__label">{lang === "he" ? "מטופל" : "Patient"}</span>
        <div className="msg-bubble msg-bubble--patient">
          <p style={{ marginBlock: "0 8px" }}>{t.error}</p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {onWaitLonger && (
              <button className="btn btn--ghost" type="button" onClick={onWaitLonger} style={{ fontSize: "0.8125rem" }}>
                {t.waitLonger}
              </button>
            )}
            {onRetry && (
              <button className="btn btn--ghost" type="button" onClick={onRetry} style={{ fontSize: "0.8125rem" }}>
                {t.retry}
              </button>
            )}
            {onEndSession && (
              <button className="btn btn--primary" type="button" onClick={onEndSession} style={{ fontSize: "0.8125rem" }}>
                {t.endSession}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="msg-row msg-row--patient"
      aria-live="polite"
      aria-label={lang === "he" ? "המטופל מכין תגובה" : "Patient is composing a response"}
    >
      <span className="msg-row__label">{lang === "he" ? "מטופל" : "Patient"}</span>
      <div className="typing-indicator">
        {stage === "dots" ? (
          <div className="typing-dots" aria-hidden="true">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        ) : null}
        {stage !== "dots" && (
          <span className="typing-label">{t[stage]}</span>
        )}
        {stage === "dots" && (
          <span className="typing-label">{t.dots}</span>
        )}
      </div>
    </div>
  );
}

export default function PatientBubble({ message, lang }: PatientBubbleProps) {
  const parts = splitMessageParts(message);

  return (
    <div className="msg-row msg-row--patient">
      <span className="msg-row__label">{lang === "he" ? "מטופל" : "Patient"}</span>
      <div className="msg-bubble msg-bubble--patient">
        {parts.map((p, i) =>
          p.type === "cue" ? (
            <NonVerbalCueTag key={i} cue={p.value} />
          ) : (
            <span key={i}>{p.value}</span>
          )
        )}
      </div>
    </div>
  );
}
