"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import "./simulation.css";
import SessionHeader from "./SessionHeader";
import ChatArea from "./ChatArea";
import type { ChatMessage } from "./ChatArea";
import InputBar from "./InputBar";
import type { MicState } from "./InputBar";
import WelfareSignpost from "./WelfareSignpost";
import NotesPanel from "./NotesPanel";
import type { NotesSections } from "./NotesPanel";
import TurnCounter from "./TurnCounter";
import FinishModal from "./FinishModal";
import HelpOverlay from "./HelpOverlay";
import type { TypingStage } from "./PatientBubble";
import { sendTurn, fetchTranscript } from "@/lib/api-client";
import { useDictation, isDictationEnabled } from "./useDictation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SimulationScreenProps {
  attemptId: string;
  title: string;
  lang: "he" | "en";
  /** Total turn limit for the session */
  maxTurns?: number;
  /** Soft warning fires at this turn count */
  softWarnAt?: number;
  /** Minimum turns -- warn if finishing below this */
  minTurns?: number;
  /** Timer mode */
  timerMode?: "none" | "countdown" | "elapsed";
  /** For countdown: total seconds. For elapsed: unused (auto-increments). */
  timerDurationSeconds?: number;
  /** Mic availability at session start (legacy; dictation now controls mic button) */
  micAvailable?: boolean;
  /** Welfare resource name */
  welfareResource?: string;
  // S4-NOA-RESUME: resume-on-interrupt support.
  /**
   * True when this is a resume of an IN_PROGRESS attempt.
   * On mount: loads prior transcript from GET /simulations/:attemptId/transcript.
   */
  isResume?: boolean;
  /**
   * Elapsed seconds before interruption (from student dashboard).
   * Null when server could not compute it (Ido A3: show "-- : --", do not reset).
   * Undefined (or absent) for new attempts -- timer starts from zero.
   */
  initialElapsedSeconds?: number | null;
  // S5-NOA-ARC-STUDENT: 3-session arc context props (CP-1 confirmed).
  /**
   * Session number for this attempt. null = non-arc/legacy attempt.
   * Session 1: no arc UI shown. Session 2+: context panel + welfare modal + gap briefing.
   */
  sessionNumber?: number | null;
  /**
   * Total number of sessions in this arc (from assignment.simulationTemplate.maxSessions).
   * Required when sessionNumber >= 2.
   */
  maxSessions?: number;
}

// ---------------------------------------------------------------------------
// Typing stage timing thresholds (ms)
// ---------------------------------------------------------------------------

const THINKING_MS = 8_000;
const WAITING_MS = 20_000;
const ERROR_MS = 45_000;

// ---------------------------------------------------------------------------
// Soft warn message per lang
// ---------------------------------------------------------------------------

const SOFT_WARN_MSG = {
  he: "הגעת/ם ל-60 תורות - שקול/י לסיים.",
  en: "You have reached 60 turns - consider finishing.",
};

// ---------------------------------------------------------------------------
// Notes auto-save key
// ---------------------------------------------------------------------------

function notesKey(attemptId: string): string {
  return `aps-notes-${attemptId}`;
}

function loadNotes(attemptId: string): NotesSections {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(notesKey(attemptId)) : null;
    if (raw) return JSON.parse(raw) as NotesSections;
  } catch {
    // ignore
  }
  return { problem: "", thoughts: "", emotions: "", behaviours: "", values: "", hypotheses: "" };
}

function saveNotes(attemptId: string, notes: NotesSections): void {
  try {
    localStorage.setItem(notesKey(attemptId), JSON.stringify(notes));
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SimulationScreen({
  attemptId,
  title,
  lang,
  maxTurns = 75,
  softWarnAt = 60,
  minTurns,
  timerMode = "elapsed",
  timerDurationSeconds = 30 * 60,
  micAvailable = true,
  welfareResource,
  isResume = false,
  initialElapsedSeconds,
  sessionNumber = null,
  maxSessions = 3,
}: SimulationScreenProps) {
  // S5-NOA-ARC-STUDENT: determine if this is session 2+ (arc continuation).
  const isArcContinuation = typeof sessionNumber === "number" && sessionNumber >= 2;

  // --- State ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [micState, setMicState] = useState<MicState>(
    micAvailable ? "ready" : "unavailable"
  );
  const [typingStage, setTypingStage] = useState<TypingStage | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  // S4-NOA-RESUME: timer starts from initialElapsedSeconds on resume (not zero).
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    if (isResume && typeof initialElapsedSeconds === "number") {
      return initialElapsedSeconds;
    }
    return 0;
  });
  // S4-NOA-RESUME: when elapsed data was unavailable, show "-- : --" (Ido A3).
  const timerUnavailable = isResume && initialElapsedSeconds === null;
  const [timerExpired, setTimerExpired] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState<NotesSections>(() => loadNotes(attemptId));
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [softWarnShown, setSoftWarnShown] = useState(false);
  // M2: server-driven soft-warn state. softWarnAnnotation from TurnResponse is rendered
  // as the banner text when present; softWarnTriggered drives the badge in TurnCounter.
  const [serverSoftWarnAnnotation, setServerSoftWarnAnnotation] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // S5-NOA-ARC-STUDENT: arc session UI state.
  // Welfare re-anchor modal (Sami C3): mandatory ack before chat is interactive.
  // Shown for sessions 2+. Chat input disabled until acknowledged.
  // Oren S5 review m3: ack state is in-memory only, so the modal re-fires on
  // resume/refresh of the same session. Intentional -- repeating the welfare
  // re-anchor is clinically harmless-to-desirable. Persist per-attempt
  // (e.g. sessionStorage) only if product later rules it should not re-fire.
  const [welfareModalAcknowledged, setWelfareModalAcknowledged] = useState(
    !isArcContinuation,
  );
  // Session-context panel: dismissible banner above chat, shown for sessions 2+.
  const [contextPanelVisible, setContextPanelVisible] = useState(isArcContinuation);

  // Refs for typing stage timer cleanup
  const typingTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lastMessageRef = useRef<string>("");

  // S4-NOA-DICT: dictation hook.
  // Enable only after Eyal/Rambo APS-004 privacy clearance.
  // isDictationEnabled() returns true only when NEXT_PUBLIC_DICTATION_ENABLED=true
  // AND window.SpeechRecognition is available. Button does NOT render otherwise.
  const dictationAvailable = isDictationEnabled();
  const { dictationState, errorMessage: dictationError, startListening, stopListening } =
    useDictation(lang, (text) => {
      // On recognition result: append to input for student review before send.
      setInputText((prev) => prev ? `${prev} ${text}` : text);
    });

  function handleDictationClick() {
    if (dictationState === "listening") {
      stopListening();
    } else {
      startListening();
    }
  }

  // --- Timer ---
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;
        if (timerMode === "countdown") {
          const remaining = timerDurationSeconds - next;
          if (remaining <= 0 && !timerExpired) {
            setTimerExpired(true);
          }
          return next;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerMode, timerDurationSeconds, timerExpired]);

  // --- Notes auto-save ---
  useEffect(() => {
    saveNotes(attemptId, notes);
  }, [attemptId, notes]);

  // S4-NOA-RESUME: transcript rehydration on re-entry.
  // Only fires when isResume=true. On success: renders prior turns in chat.
  // On error: shows inline message with retry; does NOT block typed input.
  // Guard: does NOT fire for new (non-IN_PROGRESS) attempts.
  useEffect(() => {
    if (!isResume) return;
    let cancelled = false;
    fetchTranscript(attemptId)
      .then((turns) => {
        if (cancelled) return;
        if (turns.length === 0) return; // fresh start appearance
        const hydrated: ChatMessage[] = [];
        for (const turn of turns) {
          if (turn.studentInput) {
            hydrated.push({ id: `resume-s-${turn.turnIndex}`, role: "student", content: turn.studentInput });
          }
          if (turn.patientResponse) {
            hydrated.push({ id: `resume-p-${turn.turnIndex}`, role: "patient", content: turn.patientResponse });
          }
        }
        setMessages(hydrated);
        setTurnCount(turns.length);
      })
      .catch(() => {
        if (cancelled) return;
        // Inline error -- let student continue typing; transcript may be empty
        const errMsg: ChatMessage = {
          id: `resume-err-${Date.now()}`,
          role: "patient",
          content:
            lang === "he"
              ? "לא ניתן לטעון את השיחה -- נסה שוב"
              : "Could not load transcript -- please retry",
        };
        setMessages([errMsg]);
      });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isResume, attemptId]);

  // --- Soft warn ---
  // M3: The server warns when turnCount >= softWarnTurns (evaluated PRE-turn by the
  // InputGate), so softWarnTriggered first arrives on the response AFTER the threshold
  // turn. The client reflects the server value rather than recomputing client-side.
  // The client-side fallback below is only active when the server has not yet replied
  // with a softWarnTriggered=true (i.e. before any server response arrives).
  useEffect(() => {
    if (turnCount >= softWarnAt && !softWarnShown) {
      setSoftWarnShown(true);
    }
  }, [turnCount, softWarnAt, softWarnShown]);

  // --- Helpers ---
  function clearTypingTimers() {
    typingTimersRef.current.forEach((t) => clearTimeout(t));
    typingTimersRef.current = [];
  }

  function startTypingSequence() {
    clearTypingTimers();
    setTypingStage("dots");

    const t1 = setTimeout(() => setTypingStage("thinking"), THINKING_MS);
    const t2 = setTimeout(() => setTypingStage("waiting"), WAITING_MS);
    const t3 = setTimeout(() => setTypingStage("error"), ERROR_MS);

    typingTimersRef.current = [t1, t2, t3];
  }

  function stopTypingSequence() {
    clearTypingTimers();
    setTypingStage(null);
  }

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || sending) return;
    // Oren S5 review m4: welfare ack (Sami C3) must gate sends here too, not only
    // via the InputBar disabled prop, so the block holds if the input is bypassed.
    if (!welfareModalAcknowledged) return;

    const studentMsg: ChatMessage = {
      id: `s-${Date.now()}`,
      role: "student",
      content: text,
    };

    setMessages((prev) => [...prev, studentMsg]);
    setInputText("");
    setSending(true);
    startTypingSequence();

    lastMessageRef.current = text;

    try {
      const resp = await sendTurn({
        attemptId,
        studentMessage: text,
        language: lang,
      });

      stopTypingSequence();

      const patientMsg: ChatMessage = {
        id: `p-${Date.now()}`,
        role: "patient",
        content: resp.patientMessage,
      };

      setMessages((prev) => [...prev, patientMsg]);
      setTurnCount(resp.turnCount);

      // M2: drive soft-warn state from server fields, not client computation.
      // softWarnTriggered gates the badge; softWarnAnnotation provides the banner text.
      if (resp.softWarnTriggered) {
        setSoftWarnShown(true);
        setServerSoftWarnAnnotation(resp.softWarnAnnotation ?? null);
      }

      if (resp.hardLimitReached) {
        // Hard limit -- disable further input
        setMicState("unavailable");
      }
    } catch {
      stopTypingSequence();
      // Leave typing stage as null; error shown as system message
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "patient",
        content:
          lang === "he"
            ? "[שגיאת חיבור - השיחה שמורה]"
            : "[Connection error - your conversation is saved]",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  }, [inputText, sending, attemptId, lang, welfareModalAcknowledged]);

  const handleRetry = useCallback(async () => {
    if (!lastMessageRef.current || sending) return;
    const text = lastMessageRef.current;
    setSending(true);
    startTypingSequence();

    try {
      const resp = await sendTurn({
        attemptId,
        studentMessage: text,
        language: lang,
      });
      stopTypingSequence();
      const patientMsg: ChatMessage = {
        id: `p-retry-${Date.now()}`,
        role: "patient",
        content: resp.patientMessage,
      };
      setMessages((prev) => [...prev, patientMsg]);
      setTurnCount(resp.turnCount);
    } catch {
      stopTypingSequence();
    } finally {
      setSending(false);
    }
  }, [sending, attemptId, lang]);

  function handleMicClick() {
    if (micState === "ready") {
      setMicState("recording");
    } else if (micState === "recording") {
      // Simulate transcription -- no real mic access
      setMicState("transcribing");
      setTimeout(() => {
        setMicState("result");
        setInputText((prev) => prev + (prev ? " " : "") + (lang === "he" ? "[קלט קולי]" : "[voice input]"));
      }, 1200);
    } else if (micState === "result") {
      setMicState("ready");
    }
  }

  // Computed timer value for display
  const timerDisplaySeconds =
    timerMode === "countdown"
      ? Math.max(0, timerDurationSeconds - elapsedSeconds)
      : elapsedSeconds;

  // M2: prefer server annotation text when present; fall back to static client string.
  const softWarnMessage = softWarnShown
    ? (serverSoftWarnAnnotation ?? SOFT_WARN_MSG[lang])
    : null;

  return (
    <div
      className="sim-screen"
      dir={lang === "he" ? "rtl" : "ltr"}
      lang={lang}
    >
      <SessionHeader
        title={title}
        timerMode={timerMode}
        timerSeconds={timerDisplaySeconds}
        timerExpired={timerExpired}
        timerUnavailable={timerUnavailable}
        notesOpen={notesOpen}
        lang={lang}
        onHelp={() => setShowHelp(true)}
        onFinish={() => setShowFinishModal(true)}
        onToggleNotes={() => setNotesOpen((prev) => !prev)}
      />

      {/* S5-NOA-ARC-STUDENT: session-context panel (dismissible, shown for sessions 2+). */}
      {isArcContinuation && contextPanelVisible && (
        <div
          className="sim-arc-context-panel"
          data-testid="arc-context-panel"
          dir="rtl"
          lang="he"
          style={{
            background: "#eff6ff",
            borderBottom: "1px solid #bfdbfe",
            padding: "10px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            fontSize: "0.875rem",
            color: "#1e40af",
          }}
        >
          <span>
            {/* Sami arc context text -- verbatim from envelope, N and max substituted. */}
            {`זוהי פגישה ${String(sessionNumber)} מתוך ${String(maxSessions)} -- המשך מפגישה ${String((sessionNumber as number) - 1)}.`}
          </span>
          <button
            type="button"
            aria-label={lang === "he" ? "סגור פאנל הקשר פגישה" : "Dismiss session context"}
            onClick={() => setContextPanelVisible(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#1e40af",
              flexShrink: 0,
            }}
          >
            x
          </button>
        </div>
      )}

      {/* S5-NOA-ARC-STUDENT: welfare re-anchor modal (Sami C3).
          Mandatory acknowledgement before chat is interactive for sessions 2+.
          Both components required: identity reminder + welfare signpost. */}
      {isArcContinuation && !welfareModalAcknowledged && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lang === "he" ? "הנחיית רווחה" : "Welfare reminder"}
          data-testid="welfare-reanchor-modal"
          dir="rtl"
          lang="he"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 200,
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "28px 32px",
              maxInlineSize: "480px",
              inlineSize: "90%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {/* (a) Simulation-identity reminder -- Sami C3 */}
            <p
              style={{ margin: 0, fontWeight: 600, fontSize: "1rem" }}
              data-testid="welfare-modal-identity"
            >
              {"המטופל הוא דמות אימון מדומה; הוא אינו אדם אמיתי."}
            </p>
            {/* (b) Welfare signpost -- Sami C3 */}
            <p
              style={{ margin: 0, fontSize: "0.9375rem", color: "#374151" }}
              data-testid="welfare-modal-signpost"
            >
              {"אם אתה/את חש/ה אי-נוחות, פנה/י לאיש הצוות שלך."}
            </p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setWelfareModalAcknowledged(true)}
              style={{ alignSelf: "flex-end", minInlineSize: "100px" }}
            >
              {"הבנתי"}
            </button>
          </div>
        </div>
      )}

      <div className="sim-body">
        {/* Main chat column */}
        <div className="sim-chat-column">
          <ChatArea
            messages={messages}
            typingStage={typingStage}
            softWarnMessage={softWarnMessage}
            lang={lang}
            onWaitLonger={() => {
              // Reset error timer -- keep waiting
              setTypingStage("waiting");
              clearTypingTimers();
              const t = setTimeout(() => setTypingStage("error"), ERROR_MS - WAITING_MS);
              typingTimersRef.current = [t];
            }}
            onRetry={handleRetry}
            onEndSession={() => setShowFinishModal(true)}
          />

          {/* S5-NOA-ARC-STUDENT: session-gap limitation briefing (Sami C5).
              Shown after welfare modal ack, before first message is sent. */}
          {isArcContinuation && welfareModalAcknowledged && messages.length === 0 && (
            <div
              className="sim-arc-gap-briefing"
              data-testid="session-gap-briefing"
              dir="rtl"
              lang="he"
              style={{
                padding: "10px 14px",
                background: "#f0f9ff",
                borderTop: "1px solid #bae6fd",
                fontSize: "0.875rem",
                color: "#0369a1",
                lineHeight: 1.6,
              }}
            >
              {/* Sami C5 -- verbatim text from Sprint 5 envelope */}
              <p style={{ margin: 0 }}>
                {"שים/י לב: המטופל המדומה אינו מדמה חלוף זמן אמיתי בין פגישות. ייתכן שנושאים " +
                  "מהפגישה הקודמת יוזכרו, אך לא יהיו שינויים הנובעים מאירועי חיים שהתרחשו בין הפגישות."}
              </p>
            </div>
          )}

          <InputBar
            value={inputText}
            onChange={setInputText}
            onSend={handleSend}
            micState={micState}
            onMicClick={handleMicClick}
            disabled={sending || !welfareModalAcknowledged}
            lang={lang}
            dictationEnabled={dictationAvailable}
            dictationState={dictationState}
            onDictationClick={handleDictationClick}
            dictationError={dictationError}
          />
        </div>

        {/* Inline-end sidebar */}
        <div className="sim-sidebar">
          <WelfareSignpost lang={lang} resourceName={welfareResource} />
          {notesOpen && (
            <NotesPanel
              notes={notes}
              onChange={(field, value) =>
                setNotes((prev) => ({ ...prev, [field]: value }))
              }
              lang={lang}
            />
          )}
        </div>
      </div>

      <TurnCounter
        current={turnCount}
        max={maxTurns}
        softWarnAt={softWarnAt}
        lang={lang}
      />

      {showFinishModal && (
        <FinishModal
          turnsUsed={turnCount}
          maxTurns={maxTurns}
          minTurns={minTurns}
          elapsedSeconds={elapsedSeconds}
          lang={lang}
          onContinue={() => setShowFinishModal(false)}
          onEnd={() => {
            setShowFinishModal(false);
            // Navigate to the feedback screen; mock mode is handled there.
            if (typeof window !== "undefined") {
              window.location.href = `/feedback/${encodeURIComponent(attemptId)}`;
            }
          }}
        />
      )}

      {showHelp && (
        <HelpOverlay
          lang={lang}
          onClose={() => setShowHelp(false)}
          onEmailSupport={() => {
            setShowHelp(false);
            if (typeof window !== "undefined") {
              window.location.href = "mailto:support@aps-platform.example";
            }
          }}
        />
      )}
    </div>
  );
}
