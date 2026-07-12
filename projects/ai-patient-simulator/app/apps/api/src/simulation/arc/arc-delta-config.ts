// ArcDeltaConfig -- ceiling/floor values for cross-session arc state accumulation.
// S5-GAL-ARC-WRITER (Sami C4 requirement).
//
// PURPOSE: Prevent two sequential positive-delta sessions from producing an
// implausibly cooperative patient in session 3. The patient must retain some
// resistance (clinical pedagogical requirement -- Sami C4).
//
// SCALE: All values use the same 0.0-1.0 scale as PatientState dimensions.
//
// NOTE: These defaults are "PENDING ADAM REVIEW BEFORE PRODUCTION GO-LIVE" (Sami C1).
// Adam must review ceiling values for trust/openness/alliance at the 2026-08-08
// checkpoint. Engineering picked conservative starting values based on Sami's guidance:
// "trust and openness must have a floor on difficulty regardless of student performance."
//
// DO NOT hard-code these values elsewhere -- always import from this module.

export interface ArcDeltaConfig {
  /** Maximum cumulative trust after any number of sessions. Patient retains difficulty. */
  maxTrust: number;
  /** Maximum cumulative openness after any number of sessions. */
  maxOpenness: number;
  /** Maximum cumulative therapeutic alliance after any number of sessions. */
  maxAlliance: number;
  /** Minimum trust (floor on difficulty -- patient never becomes fully distrustful). */
  minTrust: number;
  /** Minimum openness. */
  minOpenness: number;
  /** Minimum alliance. */
  minAlliance: number;
}

/**
 * Default arc delta config.
 * PENDING ADAM REVIEW BEFORE PRODUCTION GO-LIVE (Sami C1 condition).
 * Ref: sprint-5-envelope-ido-2026-07-11.md, sme-clinical-note-3v2-session-arc-2026-07-11.md C4.
 */
export const DEFAULT_ARC_DELTA_CONFIG: ArcDeltaConfig = {
  // Ceilings -- prevent implausibly cooperative patient after two positive-delta sessions
  maxTrust: 0.70,
  maxOpenness: 0.65,
  maxAlliance: 0.70,
  // Floors -- patient retains irreducible difficulty regardless of student performance
  minTrust: 0.15,
  minOpenness: 0.10,
  minAlliance: 0.10,
};

/**
 * Clamp a value to [min, max].
 * Used by ArcWriterService for ceiling/floor enforcement (Sami C4).
 */
export function arcClamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
