/**
 * Rubric Generator -- unit tests (APS-REQ-039/040/041/042)
 * Verifies deterministic output shape, competency mapping, and formativeOnly flag.
 * No LLM calls -- generateRubricCriteria is pure TS.
 */

import { generateRubricCriteria } from "@aps/engine";

// ---------------------------------------------------------------------------
// Tests: output shape
// ---------------------------------------------------------------------------

describe("generateRubricCriteria -- output shape", () => {
  it("returns a criteria array", () => {
    const result = generateRubricCriteria({ challengeLevel: 3, riskLevel: "medium" });
    expect(Array.isArray(result.criteria)).toBe(true);
  });

  it("returns at least 6 criteria (5 summative + 1 risk formative)", () => {
    const result = generateRubricCriteria({ challengeLevel: 2, riskLevel: "low" });
    expect(result.criteria.length).toBeGreaterThanOrEqual(6);
  });

  it("is deterministic: same inputs -> same output", () => {
    const input = { challengeLevel: 3, riskLevel: "medium" } as const;
    const first = generateRubricCriteria(input);
    const second = generateRubricCriteria(input);
    expect(first).toEqual(second);
  });

  it("every criterion has required fields", () => {
    const result = generateRubricCriteria({ challengeLevel: 1, riskLevel: "low" });
    for (const c of result.criteria) {
      expect(typeof c.labelKey).toBe("string");
      expect(typeof c.labels.he).toBe("string");
      expect(typeof c.labels.en).toBe("string");
      expect(typeof c.weight).toBe("number");
      expect(typeof c.maxScore).toBe("number");
      expect(Array.isArray(c.scoringAnchors)).toBe(true);
      expect(typeof c.formativeOnly).toBe("boolean");
    }
  });

  it("every criterion has at least 2 scoring anchors", () => {
    const result = generateRubricCriteria({ challengeLevel: 3, riskLevel: "low" });
    for (const c of result.criteria) {
      expect(c.scoringAnchors.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("scoring anchors have score and label fields", () => {
    const result = generateRubricCriteria({ challengeLevel: 2, riskLevel: "low" });
    for (const c of result.criteria) {
      for (const a of c.scoringAnchors) {
        expect(typeof a.score).toBe("number");
        expect(typeof a.label).toBe("string");
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: formativeOnly risk criterion (APS-REQ-039 / Sami requirement)
// ---------------------------------------------------------------------------

describe("generateRubricCriteria -- risk_awareness formativeOnly", () => {
  it("has exactly one formativeOnly=true criterion", () => {
    const result = generateRubricCriteria({ challengeLevel: 3, riskLevel: "medium" });
    const formative = result.criteria.filter((c) => c.formativeOnly === true);
    expect(formative.length).toBe(1);
  });

  it("the formative criterion is risk_awareness", () => {
    const result = generateRubricCriteria({ challengeLevel: 2, riskLevel: "medium" });
    const formative = result.criteria.find((c) => c.formativeOnly === true);
    expect(formative).toBeDefined();
    expect(formative!.labelKey).toBe("risk_awareness");
  });

  it("non-formative criteria all have formativeOnly=false", () => {
    const result = generateRubricCriteria({ challengeLevel: 1, riskLevel: "low" });
    const nonFormative = result.criteria.filter((c) => c.labelKey !== "risk_awareness");
    for (const c of nonFormative) {
      expect(c.formativeOnly).toBe(false);
    }
  });

  it("risk_awareness criterion has weight=0 (excluded from summative grade)", () => {
    const result = generateRubricCriteria({ challengeLevel: 3, riskLevel: "low" });
    const risk = result.criteria.find((c) => c.labelKey === "risk_awareness");
    expect(risk!.weight).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: competency mapping (APS-REQ-042)
// ---------------------------------------------------------------------------

describe("generateRubricCriteria -- competency mapping", () => {
  it("each criterion has a competencyId string", () => {
    const result = generateRubricCriteria({ challengeLevel: 2, riskLevel: "low" });
    for (const c of result.criteria) {
      expect(typeof c.competencyId).toBe("string");
      expect((c.competencyId as string).length).toBeGreaterThan(0);
    }
  });

  it("empathy criterion maps to COMP-EMPATHY-001", () => {
    const result = generateRubricCriteria({ challengeLevel: 1, riskLevel: "low" });
    const empathy = result.criteria.find((c) => c.labelKey === "empathy");
    expect(empathy).toBeDefined();
    expect(empathy!.competencyId).toBe("COMP-EMPATHY-001");
  });

  it("risk_awareness criterion maps to COMP-RISK-001", () => {
    const result = generateRubricCriteria({ challengeLevel: 2, riskLevel: "low" });
    const risk = result.criteria.find((c) => c.labelKey === "risk_awareness");
    expect(risk!.competencyId).toBe("COMP-RISK-001");
  });

  it("criteria labels have both he and en keys", () => {
    const result = generateRubricCriteria({ challengeLevel: 2, riskLevel: "low" });
    for (const c of result.criteria) {
      expect(typeof c.labels.he).toBe("string");
      expect(typeof c.labels.en).toBe("string");
      expect(c.labels.he.length).toBeGreaterThan(0);
      expect(c.labels.en.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: dynamic weight adjustments
// ---------------------------------------------------------------------------

describe("generateRubricCriteria -- challenge level weight adjustment", () => {
  it("challengeLevel >= 4: clinical_reasoning weight is boosted", () => {
    const low = generateRubricCriteria({ challengeLevel: 3, riskLevel: "low" });
    const high = generateRubricCriteria({ challengeLevel: 4, riskLevel: "low" });

    const lowClinical = low.criteria.find((c) => c.labelKey === "clinical_reasoning");
    const highClinical = high.criteria.find((c) => c.labelKey === "clinical_reasoning");

    expect(highClinical!.weight).toBeGreaterThan(lowClinical!.weight);
  });

  it("challengeLevel >= 4: communication weight is reduced", () => {
    const low = generateRubricCriteria({ challengeLevel: 3, riskLevel: "low" });
    const high = generateRubricCriteria({ challengeLevel: 4, riskLevel: "low" });

    const lowComm = low.criteria.find((c) => c.labelKey === "communication");
    const highComm = high.criteria.find((c) => c.labelKey === "communication");

    expect(highComm!.weight).toBeLessThan(lowComm!.weight);
  });

  it("summative weights sum to 1.0 for challenge level <= 3", () => {
    const result = generateRubricCriteria({ challengeLevel: 3, riskLevel: "low" });
    const summative = result.criteria.filter((c) => !c.formativeOnly);
    const total = summative.reduce((acc, c) => acc + c.weight, 0);
    expect(Math.round(total * 100) / 100).toBe(1.0);
  });

  it("summative weights sum to 1.0 for high challenge level", () => {
    const result = generateRubricCriteria({ challengeLevel: 5, riskLevel: "high" });
    const summative = result.criteria.filter((c) => !c.formativeOnly);
    const total = summative.reduce((acc, c) => acc + c.weight, 0);
    expect(Math.round(total * 100) / 100).toBe(1.0);
  });
});

// ---------------------------------------------------------------------------
// Tests: high-risk scenario
// ---------------------------------------------------------------------------

describe("generateRubricCriteria -- high-risk scenario labels", () => {
  it("risk_awareness label includes high-risk annotation for riskLevel=high", () => {
    const result = generateRubricCriteria({ challengeLevel: 3, riskLevel: "high" });
    const risk = result.criteria.find((c) => c.labelKey === "risk_awareness");
    expect(risk!.labels.en).toContain("High-Risk Scenario");
  });

  it("risk_awareness label is plain for riskLevel=low", () => {
    const result = generateRubricCriteria({ challengeLevel: 2, riskLevel: "low" });
    const risk = result.criteria.find((c) => c.labelKey === "risk_awareness");
    expect(risk!.labels.en).toBe("Risk Awareness");
  });
});
