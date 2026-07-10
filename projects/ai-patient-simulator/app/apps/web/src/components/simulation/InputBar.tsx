"use client";

import React, { useRef, KeyboardEvent } from "react";
import type { DictationState } from "./useDictation";

export type MicState = "ready" | "recording" | "transcribing" | "result" | "unavailable";

interface InputBarProps {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  /** @deprecated kept for back-compat; mic button now controlled by dictationEnabled */
  micState: MicState;
  /** @deprecated kept for back-compat; use dictation props instead */
  onMicClick: () => void;
  disabled?: boolean;
  lang: "he" | "en";
  // S4-NOA-DICT: dictation props (APS-REQ-046).
  // Button renders ONLY when dictationEnabled=true.
  // Enable only after Eyal/Rambo APS-004 privacy clearance.
  /** True when flag=true AND SpeechRecognition available. */
  dictationEnabled?: boolean;
  /** Current dictation recording state from useDictation hook */
  dictationState?: DictationState;
  /** Called when user clicks the mic button */
  onDictationClick?: () => void;
  /** Inline error from dictation (Hebrew) -- shown near input when present */
  dictationError?: string | null;
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
  dictationEnabled = false,
  dictationState = "idle",
  onDictationClick,
  dictationError,
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

  // Dictation button state
  const isListening = dictationState === "listening";

  // Legacy mic button kept for non-dictation paths (micState-based)
  const showLegacyMic = !dictationEnabled && micState !== "unavailable";
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
      {/* S4-NOA-DICT: Dictation mic button.
          Renders ONLY when dictationEnabled=true (flag=true AND SpeechRecognition available).
          Enable only after Eyal/Rambo APS-004 privacy clearance.
          Default: flag=false -> button not rendered. */}
      {dictationEnabled && (
        <button
          data-testid="dictation-mic-btn"
          className={`mic-btn mic-btn--dictation${isListening ? " mic-btn--recording" : ""}`}
          type="button"
          onClick={onDictationClick}
          aria-label={
            isListening
              ? (lang === "he" ? "עצור הקלטה" : "Stop recording")
              : (lang === "he" ? "התחל הקלטה קולית" : "Start voice recording")
          }
          aria-pressed={isListening}
          disabled={disabled}
        >
          <span className="mic-btn__icon" aria-hidden="true">
            {isListening ? "[" : "("}
          </span>
          {isListening && (
            <span className="mic-btn__pulse" aria-hidden="true" />
          )}
        </button>
      )}

      {/* Legacy stub mic button (non-dictation paths, demo mode) */}
      {showLegacyMic && (
        <button
          className={`mic-btn mic-btn--${micState}`}
          type="button"
          onClick={micState !== "transcribing" ? onMicClick : undefined}
          aria-label={micLabel}
          title={micLabel}
          disabled={micState === "transcribing"}
        >
          <span className="mic-btn__icon" aria-hidden="true">
            {iconText === "mic" ? "(" : iconText === "stop_circle" ? "[" : iconText === "sync" ? "~" : iconText === "check_circle" ? "+" : "x"}
          </span>
        </button>
      )}

      <div className="input-bar__group">
        {/* Dictation error inline message (graceful degradation) */}
        {dictationError && (
          <span
            className="mic-status mic-status--error"
            role="alert"
            aria-live="assertive"
          >
            {dictationError}
          </span>
        )}
        {!dictationEnabled && micStatusText && (
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
