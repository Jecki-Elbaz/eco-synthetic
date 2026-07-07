"use client";

import React from "react";

/**
 * Inline non-verbal cue tag rendered inside a patient message bubble.
 * Visually distinct: italic + muted background.
 * Content is the raw bracketed string e.g. "[Long pause]".
 */
export default function NonVerbalCueTag({ cue }: { cue: string }) {
  // No aria-label: the cue text is already the visible content, so an aria-label
  // would make screen readers announce it twice.
  return <span className="nv-cue">{cue}</span>;
}
