"use client";

import React, { useRef, KeyboardEvent } from "react";

export type MicState = "ready" | "recording" | "transcribing" | "result" | "unavailable";

interface InputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  micState: MicState;
  onMicClick: () => void;
  disabled?: boolean;
  lang: "he" | "en";
}

const MIC_ICONS: Record<MicState, string> = {
  ready: "mic",
  recording: "stop_circle",
  transcribing: "sync",
  result: "check_circle",
  unavailable: "mic_off",
};

const L = {
  he: {
    placeholder: "הקלד/י את תגובתך...",
    send: "שלח",
    micReady: "הפעל/י הקלטה",
    micRecording: "מקליט - לחץ/י לעצירה",
    micTranscribing: "מתמלל...",
    micResult: "תוצאת תמלול מוכנה",
    micUnavailable: "מיקרופון לא זמין - הקלד/י למטה",
    micStatus: {
      ready: "",
      recording: "מקליט... לחץ/י לעצירה",
      transcribing: "מתמלל...",
      result: "בדוק/י ושלח/י",
      unavailable: "מיקרופון לא זמין - הקלד/י",
    },
  },
  en: {
    placeholder: "Type your response...",
    send: "Send",
    micReady: "Start recording",
    micRecording: "Recording - click to stop",
    micTranscribing: "Transcribing...",
    micResult: "Transcription result ready",
    micUnavailable: "Mic unavailable - type below",
    micStatus: {
      ready: "",
      recording: "Recording... click to stop",
      transcribing: "Transcribing...",
      result: "Review and send",
      unavailable: "Mic unavailable - type below",
    },
  },
};

export default function InputBar({
  value,
  onChange,
  onSend,
  micState,
  onMicClick,
  disabled = false,
  lang,
}: InputBarProps) {
  const t = L[lang];
  const textRef = useRef<HTMLTextAreaElement>(null);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  }

  const micLabel =
    micState === "ready"
      ? t.micReady
      : micState === "recording"
      ? t.micRecording
      : micState === "transcribing"
      ? t.micTranscribing
      : micState === "result"
      ? t.micResult
      : t.micUnavailable;

  const micStatusText = t.micStatus[micState];
  const iconText = MIC_ICONS[micState];

  return (
    <div className="input-bar">
      <button
        className={`mic-btn mic-btn--${micState}`}
        type="button"
        onClick={micState !== "unavailable" && micState !== "transcribing" ? onMicClick : undefined}
        aria-label={micLabel}
        title={micLabel}
        disabled={micState === "transcribing" || micState === "unavailable"}
      >
        {/* Using text characters as icon fallbacks -- no external font */}
        <span className="mic-btn__icon" aria-hidden="true">
          {iconText === "mic" ? "(" : iconText === "stop_circle" ? "[" : iconText === "sync" ? "~" : iconText === "check_circle" ? "+" : "x"}
        </span>
      </button>

      <div className="input-bar__group">
        {micStatusText && (
          <span className="mic-status" aria-live="polite">
            {micStatusText}
          </span>
        )}
        <textarea
          ref={textRef}
          className="input-bar__text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.placeholder}
          rows={1}
          disabled={disabled}
          aria-label={t.placeholder}
          dir="auto"
        />
      </div>

      <button
        className="btn btn--primary"
        type="button"
        onClick={onSend}
        disabled={disabled || !value.trim()}
        aria-label={t.send}
      >
        {t.send}
      </button>
    </div>
  );
}
