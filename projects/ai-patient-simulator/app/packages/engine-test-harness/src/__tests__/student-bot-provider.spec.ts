/**
 * StudentBotProvider unit tests (TRACK-A-GAL item A + Adi spec APS-018)
 *
 * Pure in-process -- no DB, no HTTP, no LLM.
 *
 * Covers (Adi QA spec):
 *   D1. COMPETENT profile, turnIndex=0 -> same output across 3 calls (determinism)
 *   D2. WEAK profile, turnIndex=0 -> same output across 3 calls (determinism)
 *   D3. TYPICAL profile, turnIndex=0 -> same output across 3 calls (determinism)
 *   D4. COMPETENT and WEAK profiles produce different output at turnIndex=0
 *   D5. COMPETENT sequence contains >=2 turns with isViolation=true
 *   D6. WEAK sequence contains >=2 turns with isViolation=true
 *
 * Additional coverage:
 *   A1. TYPICAL sequence contains >=2 violation turns
 *   A2. Violation turns are NOT all at the end (spread check)
 *   A3. turnIndex wraps modulo sequence length
 *   A4. Negative turnIndex throws RangeError
 *   A5. All profiles: turnType, message, isViolation, violationType fields present
 *   A6. COMPETENT and TYPICAL differ at turnIndex=0
 *   A7. violationType non-null when isViolation=true; null when false
 *   A8. message is a non-empty string on every turn of every profile
 */

import { StudentBotProvider } from "@aps/engine";
import type { BotProfile } from "@aps/engine";

const PROFILES: BotProfile[] = ["COMPETENT", "WEAK", "TYPICAL"];

// ---------------------------------------------------------------------------
// Adi QA spec tests (D1-D6)
// ---------------------------------------------------------------------------

describe("StudentBotProvider -- Adi QA spec (D1-D6)", () => {
  it("D1: COMPETENT profile turnIndex=0 is identical across 3 calls", () => {
    const provider = new StudentBotProvider("COMPETENT");
    const r1 = provider.getTurn(0);
    const r2 = provider.getTurn(0);
    const r3 = provider.getTurn(0);
    expect(r1).toEqual(r2);
    expect(r2).toEqual(r3);
  });

  it("D2: WEAK profile turnIndex=0 is identical across 3 calls", () => {
    const provider = new StudentBotProvider("WEAK");
    const r1 = provider.getTurn(0);
    const r2 = provider.getTurn(0);
    const r3 = provider.getTurn(0);
    expect(r1).toEqual(r2);
    expect(r2).toEqual(r3);
  });

  it("D3: TYPICAL profile turnIndex=0 is identical across 3 calls", () => {
    const provider = new StudentBotProvider("TYPICAL");
    const r1 = provider.getTurn(0);
    const r2 = provider.getTurn(0);
    const r3 = provider.getTurn(0);
    expect(r1).toEqual(r2);
    expect(r2).toEqual(r3);
  });

  it("D4: COMPETENT and WEAK produce different output at turnIndex=0", () => {
    const comp = new StudentBotProvider("COMPETENT").getTurn(0);
    const weak = new StudentBotProvider("WEAK").getTurn(0);
    // At least one field must differ
    const same =
      comp.message === weak.message &&
      comp.isViolation === weak.isViolation &&
      comp.violationType === weak.violationType;
    expect(same).toBe(false);
  });

  it("D5: COMPETENT sequence contains >=2 violation turns", () => {
    const provider = new StudentBotProvider("COMPETENT");
    expect(provider.violationCount()).toBeGreaterThanOrEqual(2);
  });

  it("D6: WEAK sequence contains >=2 violation turns", () => {
    const provider = new StudentBotProvider("WEAK");
    expect(provider.violationCount()).toBeGreaterThanOrEqual(2);
  });
});

// ---------------------------------------------------------------------------
// Additional coverage (A1-A8)
// ---------------------------------------------------------------------------

describe("StudentBotProvider -- additional coverage (A1-A8)", () => {
  it("A1: TYPICAL sequence contains >=2 violation turns", () => {
    const provider = new StudentBotProvider("TYPICAL");
    expect(provider.violationCount()).toBeGreaterThanOrEqual(2);
  });

  it("A2: violation turns are NOT all at the end of any sequence", () => {
    for (const profile of PROFILES) {
      const provider = new StudentBotProvider(profile);
      const seq = provider.getSequence();
      const lastNonViolationIdx = [...seq].reduceRight(
        (acc, t, i) => (acc === -1 && !t.isViolation ? i : acc),
        -1,
      );
      const firstViolationIdx = seq.findIndex((t) => t.isViolation);
      // There must be at least one violation BEFORE the last non-violation turn
      expect(firstViolationIdx).toBeLessThan(lastNonViolationIdx);
    }
  });

  it("A3: turnIndex wraps modulo sequence length (e.g. turnIndex=6 same as turnIndex=0 for 6-turn sequence)", () => {
    for (const profile of PROFILES) {
      const provider = new StudentBotProvider(profile);
      const seqLen = provider.getSequence().length;
      expect(provider.getTurn(0)).toEqual(provider.getTurn(seqLen));
      expect(provider.getTurn(1)).toEqual(provider.getTurn(seqLen + 1));
    }
  });

  it("A4: negative turnIndex throws RangeError", () => {
    const provider = new StudentBotProvider("COMPETENT");
    expect(() => provider.getTurn(-1)).toThrow(RangeError);
  });

  it("A5: all profiles return BotTurn with required fields on every turn", () => {
    for (const profile of PROFILES) {
      const provider = new StudentBotProvider(profile);
      const seq = provider.getSequence();
      for (let i = 0; i < seq.length; i++) {
        const turn = provider.getTurn(i);
        expect(typeof turn.turnType).toBe("string");
        expect(typeof turn.message).toBe("string");
        expect(typeof turn.isViolation).toBe("boolean");
        // violationType is string | null
        expect(
          turn.violationType === null || typeof turn.violationType === "string",
        ).toBe(true);
      }
    }
  });

  it("A6: COMPETENT and TYPICAL differ at turnIndex=0", () => {
    const comp = new StudentBotProvider("COMPETENT").getTurn(0);
    const typ = new StudentBotProvider("TYPICAL").getTurn(0);
    expect(comp).not.toEqual(typ);
  });

  it("A7: violationType non-null when isViolation=true; null when false", () => {
    for (const profile of PROFILES) {
      const provider = new StudentBotProvider(profile);
      for (const turn of provider.getSequence()) {
        if (turn.isViolation) {
          expect(turn.violationType).not.toBeNull();
        } else {
          expect(turn.violationType).toBeNull();
        }
      }
    }
  });

  it("A8: message is a non-empty string on every turn of every profile", () => {
    for (const profile of PROFILES) {
      const provider = new StudentBotProvider(profile);
      for (const turn of provider.getSequence()) {
        expect(turn.message.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
