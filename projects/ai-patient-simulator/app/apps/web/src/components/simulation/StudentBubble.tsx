"use client";

import React from "react";

interface StudentBubbleProps {
  message: string;
  lang: "he" | "en";
}

export default function StudentBubble({ message, lang }: StudentBubbleProps) {
  return (
    <div className="msg-row msg-row--student">
      <span className="msg-row__label">{lang === "he" ? "סטודנט" : "Student"}</span>
      <div className="msg-bubble msg-bubble--student">{message}</div>
    </div>
  );
}
