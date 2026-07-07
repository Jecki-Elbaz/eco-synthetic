"use client";

import React, { useEffect, useRef } from "react";
import PatientBubble, { PatientTypingIndicator } from "./PatientBubble";
import StudentBubble from "./StudentBubble";
import type { TypingStage } from "./PatientBubble";

export interface ChatMessage {
  id: string;
  role: "patient" | "student";
  content: string;
}

interface ChatAreaProps {
  messages: ChatMessage[];
  typingStage: TypingStage | null;
  softWarnMessage?: string | null;
  lang: "he" | "en";
  onWaitLonger?: () => void;
  onRetry?: () => void;
  onEndSession?: () => void;
}

export default function ChatArea({
  messages,
  typingStage,
  softWarnMessage,
  lang,
  onWaitLonger,
  onRetry,
  onEndSession,
}: ChatAreaProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Anchor to block-end on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingStage]);

  return (
    <div className="chat-area" role="log" aria-live="polite" aria-label={lang === "he" ? "שיחת סימולציה" : "Simulation conversation"}>
      {softWarnMessage && (
        <div className="soft-warn-banner" role="status">
          {softWarnMessage}
        </div>
      )}

      {messages.map((msg) =>
        msg.role === "patient" ? (
          <PatientBubble key={msg.id} message={msg.content} lang={lang} />
        ) : (
          <StudentBubble key={msg.id} message={msg.content} lang={lang} />
        )
      )}

      {typingStage !== null && (
        <PatientTypingIndicator
          stage={typingStage}
          lang={lang}
          onWaitLonger={onWaitLonger}
          onRetry={onRetry}
          onEndSession={onEndSession}
        />
      )}

      {/* Block-end anchor for auto-scroll */}
      <div ref={bottomRef} aria-hidden="true" />
    </div>
  );
}
