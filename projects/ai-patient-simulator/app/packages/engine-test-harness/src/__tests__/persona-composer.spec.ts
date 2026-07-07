/**
 * Persona Composer -- unit tests (APS-REQ-029)
 * Verifies deterministic output shape and content correctness.
 * No LLM calls -- composePersonaPrompt is pure TS.
 */

import { composePersonaPrompt } from "@aps/engine";
import type { BuilderFields } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

function baseFields(overrides?: Partial<BuilderFields>): BuilderFields {
  return {
    title: "Test Case",
    clinicalModel: "CBT",
    studentLevel: "year2",
    primarySkill: "empathy",
    patientStyle: "withdrawn and reluctant",
    presentingProblem: "Low mood for 3 months",
    riskLevel: "medium",
    challengeLevel: 3,
    languages: ["he", "en"],
    mode: "intake",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests: output shape
// ---------------------------------------------------------------------------

describe("composePersonaPrompt -- deterministic shape", () => {
  it("returns a non-empty string", () => {
    const result = composePersonaPrompt(baseFields());
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(50);
  });

  it("is deterministic: same inputs -> same output", () => {
    const fields = baseFields();
    const first = composePersonaPrompt(fields);
    const second = composePersonaPrompt(fields);
    expect(first).toBe(second);
  });

  it("contains the clinical model", () => {
    const result = composePersonaPrompt(baseFields({ clinicalModel: "DBT" }));
    expect(result).toContain("DBT");
  });

  it("contains the presenting problem", () => {
    const result = composePersonaPrompt(baseFields({ presentingProblem: "Panic attacks at work" }));
    expect(result).toContain("Panic attacks at work");
  });

  it("contains the patient style", () => {
    const result = composePersonaPrompt(baseFields({ patientStyle: "hostile and dismissive" }));
    expect(result).toContain("hostile and dismissive");
  });

  it("contains the language list", () => {
    const result = composePersonaPrompt(baseFields({ languages: ["he"] }));
    expect(result).toContain("he");
  });

  it("contains the mode", () => {
    const result = composePersonaPrompt(baseFields({ mode: "crisis" }));
    expect(result).toContain("crisis");
  });
});

// ---------------------------------------------------------------------------
// Tests: optional fields
// ---------------------------------------------------------------------------

describe("composePersonaPrompt -- optional fields", () => {
  it("includes hidden issue when provided", () => {
    const result = composePersonaPrompt(
      baseFields({ hiddenIssue: "Suicidal ideation" })
    );
    expect(result).toContain("Suicidal ideation");
  });

  it("omits hidden issue section when not provided", () => {
    const result = composePersonaPrompt(baseFields({ hiddenIssue: undefined }));
    // Should not contain the hidden issue label at all
    expect(result).not.toContain("Hidden issue");
  });

  it("includes secondary skill when provided", () => {
    const result = composePersonaPrompt(
      baseFields({ primarySkill: "empathy", secondarySkill: "active listening" })
    );
    expect(result).toContain("active listening");
  });

  it("omits secondary skill line when not provided", () => {
    const result = composePersonaPrompt(
      baseFields({ secondarySkill: undefined })
    );
    expect(result).toContain("Primary focus: empathy");
    expect(result).not.toContain("Secondary focus");
  });
});

// ---------------------------------------------------------------------------
// Tests: challenge and risk levels
// ---------------------------------------------------------------------------

describe("composePersonaPrompt -- challenge and risk descriptors", () => {
  it("reflects high challenge level in output", () => {
    const result = composePersonaPrompt(baseFields({ challengeLevel: 5 }));
    expect(result).toContain("highly defensive");
  });

  it("reflects low challenge level in output", () => {
    const result = composePersonaPrompt(baseFields({ challengeLevel: 1 }));
    expect(result).toContain("open and cooperative");
  });

  it("reflects high risk level", () => {
    const result = composePersonaPrompt(baseFields({ riskLevel: "high" }));
    expect(result).toContain("significant risk content");
  });

  it("reflects low risk level", () => {
    const result = composePersonaPrompt(baseFields({ riskLevel: "low" }));
    expect(result).toContain("no acute risk indicators");
  });
});

// ---------------------------------------------------------------------------
// Tests: hard rules block
// ---------------------------------------------------------------------------

describe("composePersonaPrompt -- hard rules section", () => {
  it("contains hard rules block", () => {
    const result = composePersonaPrompt(baseFields());
    expect(result).toContain("HARD RULES");
  });

  it("instructs not to invent clinical facts", () => {
    const result = composePersonaPrompt(baseFields());
    expect(result).toContain("Never invent clinical facts");
  });

  it("mentions hard off-ramp", () => {
    const result = composePersonaPrompt(baseFields());
    expect(result).toContain("hard off-ramp");
  });
});

// ---------------------------------------------------------------------------
// Tests: student level mapping
// ---------------------------------------------------------------------------

describe("composePersonaPrompt -- student level mapping", () => {
  it("maps year1 to first-year social work students", () => {
    const result = composePersonaPrompt(baseFields({ studentLevel: "year1" }));
    expect(result).toContain("first-year social work students");
  });

  it("falls back to raw key for unknown level", () => {
    const result = composePersonaPrompt(baseFields({ studentLevel: "phd" }));
    expect(result).toContain("phd");
  });
});
