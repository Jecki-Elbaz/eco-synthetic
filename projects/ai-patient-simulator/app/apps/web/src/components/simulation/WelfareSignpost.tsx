"use client";

import React from "react";

interface WelfareSignpostProps {
  lang: "he" | "en";
  /** Institution-specific welfare resource placeholder. */
  resourceName?: string | undefined;
}

const TEXT = {
  he: (resource: string) =>
    `זהו מטופל-סימולציה. אם את/ה חש/ה במצוקה, פנה/י ל${resource}.`,
  en: (resource: string) =>
    `Simulated training patient. Real distress? Contact ${resource}.`,
};

const HEADING = {
  he: "סימולציה בלבד",
  en: "Simulation only",
};

export default function WelfareSignpost({
  lang,
  resourceName = lang === "he"
    ? "גורם הרווחה של המוסד"
    : "institutional welfare resource",
}: WelfareSignpostProps) {
  const fullText = TEXT[lang](resourceName);

  // Single, always-rendered signpost. There is NO dismiss and NO collapse path.
  // CSS keeps it in the inline-end sidebar on wide viewports and pins it as a
  // persistent block-end banner on narrow viewports -- it is never hidden.
  // [Sami / SME non-dismissable welfare requirement -- do not add a toggle.]
  return (
    <aside
      className="welfare-signpost"
      role="complementary"
      aria-label={HEADING[lang]}
    >
      <div className="welfare-signpost__heading">{HEADING[lang]}</div>
      <p className="welfare-signpost__text">{fullText}</p>
    </aside>
  );
}
