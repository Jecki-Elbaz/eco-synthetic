"use client";

// useDictation.ts -- Web Speech API hook for APS-REQ-046 Hebrew dictation.
//
// PRIVACY GATE (BLOCKING for live use with real students):
//   Chrome's SpeechRecognition routes audio to Google Cloud Speech (he-IL).
//   Student voice leaves the browser -- this is a new APS-004 sub-processor.
//   Eyal (PPL/Israeli privacy) + Rambo (APS-004 M-item) must clear before
//   NEXT_PUBLIC_DICTATION_ENABLED is set to "true" in any student-facing env.
//
// Default: NEXT_PUBLIC_DICTATION_ENABLED is absent or "false" -> hook is inert.
// Enable only after Eyal/Rambo APS-004 privacy clearance.
//
// Graceful degradation:
//   - SpeechRecognition unavailable (Firefox, older browsers): mic not shown.
//   - Permission denied: inline Hebrew message; cursor to text input.
//   - Partial result: populate editable text box; student edits before send.
//   - No blocking modal; typed input always available.

import { useState, useRef, useCallback } from "react";

// ---------------------------------------------------------------------------
// Minimal Web Speech API type declarations.
// TypeScript 5.4 lib.dom.d.ts does not include the Web Speech API types.
// These local declarations replicate only the subset useDictation needs.
// ---------------------------------------------------------------------------

interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionResultItem | undefined;
  length: number;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: SpeechRecognitionResult | undefined;
}

interface SpeechRecognitionEventLocal extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

type SpeechRecognitionErrorCode =
  | "aborted"
  | "audio-capture"
  | "bad-grammar"
  | "language-not-supported"
  | "network"
  | "no-speech"
  | "not-allowed"
  | "service-not-allowed";

interface SpeechRecognitionErrorEventLocal extends Event {
  error: SpeechRecognitionErrorCode;
}

interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEventLocal) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLocal) => void) | null;
  onend: ((event: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

// ---------------------------------------------------------------------------
// Feature flag check
// ---------------------------------------------------------------------------

/**
 * True only when NEXT_PUBLIC_DICTATION_ENABLED === "true".
 * Enable ONLY after Eyal/Rambo APS-004 privacy clearance.
 */
export function isDictationFlagEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DICTATION_ENABLED === "true";
}

// ---------------------------------------------------------------------------
// API availability check
// ---------------------------------------------------------------------------

/**
 * True when the browser exposes SpeechRecognition or webkitSpeechRecognition.
 * Call only in browser context (after mount); SSR always returns false.
 */
export function isSpeechRecognitionAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "SpeechRecognition" in window ||
    "webkitSpeechRecognition" in window
  );
}

// ---------------------------------------------------------------------------
// Combined availability for UI decisions
// ---------------------------------------------------------------------------

/** True only when flag is ON and the API is present. Both conditions required. */
export function isDictationEnabled(): boolean {
  return isDictationFlagEnabled() && isSpeechRecognitionAvailable();
}

// ---------------------------------------------------------------------------
// Internal: get the constructor
// ---------------------------------------------------------------------------

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window &
    typeof globalThis & {
      SpeechRecognition?: SpeechRecognitionCtor;
      webkitSpeechRecognition?: SpeechRecognitionCtor;
    };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// ---------------------------------------------------------------------------
// Hook state types
// ---------------------------------------------------------------------------

export type DictationState =
  | "idle"       // not listening
  | "listening"  // actively recording
  | "error";     // permission denied or API error

export interface UseDictationResult {
  /** Current dictation state. */
  dictationState: DictationState;
  /** Inline error message to show (Hebrew). null when no error. */
  errorMessage: string | null;
  /** Start listening. No-op if already listening. */
  startListening: () => void;
  /** Stop listening manually. */
  stopListening: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useDictation(lang, onResult)
 *
 * Wraps window.SpeechRecognition for he-IL dictation.
 * onResult is called with the interim/final transcript text.
 * The caller should put the text into the input box for editing before send.
 *
 * @param lang - "he" sets lang="he-IL"; "en" sets lang="en-US"
 * @param onResult - callback with recognised text
 */
export function useDictation(
  lang: "he" | "en",
  onResult: (text: string) => void,
): UseDictationResult {
  const [dictationState, setDictationState] = useState<DictationState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const startListening = useCallback(() => {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) return;

    // Stop any existing session first
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new Ctor();
    recognition.lang = lang === "he" ? "he-IL" : "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setDictationState("listening");
      setErrorMessage(null);
    };

    recognition.onresult = (event: SpeechRecognitionEventLocal) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result) {
          transcript += result[0]?.transcript ?? "";
        }
      }
      if (transcript) {
        onResult(transcript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLocal) => {
      setDictationState("error");
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        // Permission denied -- Hebrew inline message (APS-REQ-046 graceful degradation)
        setErrorMessage(
          lang === "he"
            ? "הקלטה לא זמינה -- הקלד ישירות"
            : "Recording unavailable -- type directly",
        );
      } else {
        setErrorMessage(null);
      }
    };

    recognition.onend = () => {
      setDictationState("idle");
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [lang, onResult]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setDictationState("idle");
  }, []);

  return { dictationState, errorMessage, startListening, stopListening };
}
