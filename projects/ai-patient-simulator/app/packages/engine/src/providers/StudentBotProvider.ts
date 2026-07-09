// StudentBotProvider -- deterministic student-turn generator for author preview (TRACK-A-GAL item A).
// No randomness, no LLM, no network.
// Given (profile, turnIndex) -> same BotTurn on every call.
//
// Usage: feed getTurn(turnIndex) output as studentMessage into TurnPipeline.run() for self-sim.
//
// Three profiles: COMPETENT | WEAK | TYPICAL
// Each profile has a fixed turn sequence with >= 2 violation turns spread across it.
// Violation types: premature-diagnosis, personal-opinion, clinical-overreach.
// Violations are required so the guard fires during author preview (TRACK-A-GAL item A spec).
//
// Turn sequences (indexes 0..N-1; modulo-wrapped for turnIndex >= sequence length):
//   COMPETENT: open-question(0) -> VIOLATION premature-diagnosis(1) ->
//              rapport-attempt(2) -> targeted-clarifying-probe(3) ->
//              VIOLATION clinical-overreach(4) -> correct-diagnostic-hypothesis(5)
//
//   TYPICAL:   open-question(0) -> VIOLATION personal-opinion(1) ->
//              closed-question(2) -> rapport-attempt(3) ->
//              VIOLATION premature-diagnosis(4) -> partially-correct-hypothesis(5)
//
//   WEAK:      VIOLATION premature-diagnosis(0) -> closed-question(1) ->
//              wrong-diagnostic-hypothesis(2) -> VIOLATION clinical-overreach(3) ->
//              off-topic-tangent(4) -> closed-question(5)

export type BotProfile = "COMPETENT" | "WEAK" | "TYPICAL";

export type ViolationType =
  | "premature-diagnosis"
  | "personal-opinion"
  | "clinical-overreach"
  | null;

export interface BotTurn {
  /** Semantic label for this turn (matches envelope turn-type names). */
  turnType: string;
  /** The student message text to feed into the pipeline. */
  message: string;
  /** True if this turn is intentionally scope-inappropriate (triggers guard). */
  isViolation: boolean;
  /** Non-null when isViolation is true. Describes the category of violation. */
  violationType: ViolationType;
}

// ---------------------------------------------------------------------------
// Turn sequence tables (static -- fully deterministic)
// ---------------------------------------------------------------------------

const SEQUENCES: Record<BotProfile, ReadonlyArray<BotTurn>> = {
  COMPETENT: [
    {
      turnType: "open-question",
      message: "Can you tell me what brings you in today?",
      isViolation: false,
      violationType: null,
    },
    {
      // Violation 1 of 2 -- spread early in sequence (turn 1 of 5)
      turnType: "premature-diagnosis",
      message:
        "I think you have a major depressive disorder based on what you just said.",
      isViolation: true,
      violationType: "premature-diagnosis",
    },
    {
      turnType: "rapport-attempt",
      message:
        "That sounds really difficult to go through. I imagine it has been hard for you.",
      isViolation: false,
      violationType: null,
    },
    {
      turnType: "targeted-clarifying-probe",
      message: "When did you first start noticing these feelings?",
      isViolation: false,
      violationType: null,
    },
    {
      // Violation 2 of 2 -- spread later in sequence (turn 4 of 5)
      turnType: "clinical-overreach",
      message: "You should definitely be taking antidepressants for this.",
      isViolation: true,
      violationType: "clinical-overreach",
    },
    {
      turnType: "correct-diagnostic-hypothesis",
      message:
        "Based on everything you have shared, it sounds like your symptoms may be consistent with anxiety and depression.",
      isViolation: false,
      violationType: null,
    },
  ],

  TYPICAL: [
    {
      turnType: "open-question",
      message: "How have you been feeling lately?",
      isViolation: false,
      violationType: null,
    },
    {
      // Violation 1 of 2 -- turn 1 of 5
      turnType: "personal-opinion",
      message:
        "Personally, I think people just need to push through difficult emotions and not dwell on them.",
      isViolation: true,
      violationType: "personal-opinion",
    },
    {
      turnType: "closed-question",
      message: "Have you been sleeping well?",
      isViolation: false,
      violationType: null,
    },
    {
      turnType: "rapport-attempt",
      message: "I understand this must be really hard for you.",
      isViolation: false,
      violationType: null,
    },
    {
      // Violation 2 of 2 -- turn 4 of 5
      turnType: "premature-diagnosis",
      message: "You seem depressed to me, just looking at you.",
      isViolation: true,
      violationType: "premature-diagnosis",
    },
    {
      turnType: "partially-correct-hypothesis",
      message:
        "It seems like you are struggling with your mood and possibly some anxiety, though I am not fully sure.",
      isViolation: false,
      violationType: null,
    },
  ],

  WEAK: [
    {
      // Violation 1 of 2 -- turn 0 (first turn)
      turnType: "premature-diagnosis",
      message: "I can already tell from the way you walked in that you have anxiety disorder.",
      isViolation: true,
      violationType: "premature-diagnosis",
    },
    {
      turnType: "closed-question",
      message: "Do you feel sad most of the time?",
      isViolation: false,
      violationType: null,
    },
    {
      turnType: "wrong-diagnostic-hypothesis",
      message: "Your problem is clearly a personality disorder, that much is obvious.",
      isViolation: false,
      violationType: null,
    },
    {
      // Violation 2 of 2 -- turn 3 of 5 (spread across middle)
      turnType: "clinical-overreach",
      message: "Based on this, I recommend you be hospitalised immediately.",
      isViolation: true,
      violationType: "clinical-overreach",
    },
    {
      turnType: "off-topic-tangent",
      message: "By the way, have you seen any good films lately? That might cheer you up.",
      isViolation: false,
      violationType: null,
    },
    {
      turnType: "closed-question",
      message: "Are you eating and sleeping enough?",
      isViolation: false,
      violationType: null,
    },
  ],
};

// ---------------------------------------------------------------------------
// Provider class
// ---------------------------------------------------------------------------

export class StudentBotProvider {
  private readonly profile: BotProfile;

  constructor(profile: BotProfile) {
    this.profile = profile;
  }

  /**
   * Return the deterministic BotTurn for (profile, turnIndex).
   * turnIndex is 0-based. Wraps modulo sequence length for indexes
   * beyond the defined sequence (supports arbitrarily long simulations).
   */
  getTurn(turnIndex: number): BotTurn {
    if (turnIndex < 0) {
      throw new RangeError(`turnIndex must be >= 0, got ${turnIndex}`);
    }
    const sequence = SEQUENCES[this.profile];
    return sequence[turnIndex % sequence.length]!;
  }

  /**
   * Returns the full turn sequence for this profile (for testing / inspection).
   * The returned array is a copy -- mutations do not affect internal state.
   */
  getSequence(): ReadonlyArray<BotTurn> {
    return SEQUENCES[this.profile];
  }

  /**
   * Convenience: count of violation turns in the profile's sequence.
   * Must be >= 2 per TRACK-A-GAL item A spec.
   */
  violationCount(): number {
    return SEQUENCES[this.profile].filter((t) => t.isViolation).length;
  }
}
