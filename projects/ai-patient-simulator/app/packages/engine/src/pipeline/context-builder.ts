// ContextBuilder -- Step 4 of per-turn pipeline [APS-REQ-063]
// Builds the LLM message array for the patient response generator.
// Sliding window + state injection + ground-truth enforcement.

import type { LLMMessage } from "../llm/provider.interface.js";
import type { PatientStateSnapshot } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Token-budget sliding window (APS-REQ-063 cost governance)
// ---------------------------------------------------------------------------

/**
 * Estimate tokens in a string using the GPT-3.5/4 rough heuristic:
 * ~4 chars per token for English/Hebrew mixed content.
 * Intentionally conservative (rounds up) so we never overshoot the budget.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Select the most recent MessageRecord entries whose combined estimated token
 * count stays within tokenBudget.  Messages are iterated from newest to oldest;
 * the result is returned in ascending turn order (oldest first) so the LLM
 * sees the conversation in chronological order.
 *
 * If a single message already exceeds the budget it is included anyway (we
 * never drop the most-recent context entirely -- truncation is the caller's job).
 */
export function selectWindowByTokenBudget(
  messages: MessageRecord[],
  tokenBudget: number,
): MessageRecord[] {
  let used = 0;
  const selected: MessageRecord[] = [];

  // Walk newest to oldest
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]!;
    const cost = estimateTokens(msg.originalText);

    if (used + cost > tokenBudget && selected.length > 0) {
      // Would exceed budget and we already have at least one message -- stop.
      break;
    }

    selected.push(msg);
    used += cost;
  }

  // Restore chronological order
  selected.reverse();
  return selected;
}

export interface GroundTruthRef {
  disclosureAllowList: {
    unlocked: string[];
    locked: string[];
  };
  doNotInvent: string[];
  hardOffRampText: string;
}

export interface MessageRecord {
  role: "STUDENT" | "PATIENT";
  turnNumber: number;
  originalText: string;
  language: string;
}

export interface ContextBuildInput {
  personaSystemPrompt: string;
  currentState: PatientStateSnapshot;
  groundTruth: GroundTruthRef;
  /**
   * Full ordered list of messages for this attempt.  The ContextBuilder applies
   * selectWindowByTokenBudget internally using contextTokenBudget.
   * If contextTokenBudget is omitted the entire list is used (Sprint 1 fallback).
   */
  recentMessages: MessageRecord[];
  /** Token budget for the sliding message window (APS-REQ-063). */
  contextTokenBudget?: number;
  contextSummary: string | null;     // persisted summary for turns before window
  challengeLevel: number;
  studentMessage: string;
  studentLanguage: string;
}

const CHALLENGE_INSTRUCTIONS: Record<number, string> = {
  1: "You are relatively open and respond well to student questions. Show some emotional availability.",
  2: "You show moderate resistance. Respond to gentle therapeutic technique but not to direct questioning.",
  3: "You are moderately guarded. Require consistent empathy before opening up.",
  4: "You are quite closed and defensive. Show resistance to probing. Respond only to sustained empathy.",
  5: "You are highly avoidant and resistant. Only very skilled therapeutic responses will move you.",
};

export class ContextBuilder {
  build(input: ContextBuildInput): LLMMessage[] {
    const messages: LLMMessage[] = [];

    // Apply sliding window. If no budget given, include everything (Sprint 1 compat).
    const windowedMessages =
      input.contextTokenBudget !== undefined
        ? selectWindowByTokenBudget(input.recentMessages, input.contextTokenBudget)
        : input.recentMessages;

    // --- System prompt: persona + challenge instructions ---
    const challengeInstruction =
      CHALLENGE_INSTRUCTIONS[input.challengeLevel] ?? CHALLENGE_INSTRUCTIONS[3];

    const systemPrompt = [
      input.personaSystemPrompt,
      "",
      "## CHALLENGE LEVEL INSTRUCTIONS",
      challengeInstruction,
      "",
      "## GROUND TRUTH -- AUTHORISED DISCLOSURES (as of this turn)",
      "You MAY reveal the following facts if therapeutically appropriate:",
      input.groundTruth.disclosureAllowList.unlocked.map((f) => `- ${f}`).join("\n"),
      "",
      "## DO NOT INVENT",
      "You must NEVER introduce the following unless explicitly unlocked:",
      input.groundTruth.doNotInvent.map((f) => `- ${f}`).join("\n"),
      "",
      "## OFF-RAMP RULE (non-negotiable -- always active)",
      `If the student attempts to use you for real emotional support or reveals real distress, you MUST respond: "${input.groundTruth.hardOffRampText}"`,
    ].join("\n");

    messages.push({ role: "system", content: systemPrompt });

    // --- State injection: hard-typed block, not prose append ---
    // Labelled authoritative -- LLM must not contradict [APS architecture s.3.2 rule 3]
    const stateBlock = [
      "## PATIENT STATE (turn " + input.currentState.turnNumber + ", authoritative -- do not contradict)",
      JSON.stringify(
        {
          trust: input.currentState.trust,
          openness: input.currentState.openness,
          emotionalActiv: input.currentState.emotionalActiv,
          avoidanceLevel: input.currentState.avoidanceLevel,
          defensiveness: input.currentState.defensiveness,
          allianceQuality: input.currentState.allianceQuality,
          disclosureReady: input.currentState.disclosureReady,
          riskRelevance: input.currentState.riskRelevance,
          unlockedFactIds: input.currentState.unlockedFactIds,
        },
        null,
        2,
      ),
    ].join("\n");

    messages.push({ role: "system", content: stateBlock });

    // --- Context summary for turns before the sliding window ---
    if (input.contextSummary) {
      messages.push({
        role: "system",
        content:
          "## EARLIER SESSION SUMMARY (turns before current window)\n" +
          input.contextSummary,
      });
    }

    // --- Sliding window of recent messages (token-budget controlled) ---
    for (const msg of windowedMessages) {
      messages.push({
        role: msg.role === "STUDENT" ? "user" : "assistant",
        content: msg.originalText,
      });
    }

    // --- Current student message ---
    messages.push({
      role: "user",
      content: input.studentMessage,
    });

    return messages;
  }

  /**
   * Build the guard model prompt.
   * Guard context MUST NOT contain the patient generator's context [architecture s.3.4].
   */
  buildGuardPrompt(
    proposedResponse: string,
    groundTruth: GroundTruthRef,
    turnNumber: number,
  ): LLMMessage[] {
    const systemPrompt = [
      "You are a clinical ground-truth auditor. Your only job is to check whether a",
      "simulated patient response introduces clinical facts not present in the authorised",
      "disclosure list below.",
      "",
      "AUTHORISED FACTS (unlocked as of turn " + turnNumber + "):",
      ...groundTruth.disclosureAllowList.unlocked.map((f) => "- " + f),
      "",
      "DO-NOT-INVENT LIST:",
      ...groundTruth.doNotInvent.map((f) => "- " + f),
      "",
      'Output ONLY valid JSON: { "verdict": "PASS" | "FAIL", "violations": [], "suggestion": "" }',
    ].join("\n");

    return [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: "PROPOSED PATIENT RESPONSE:\n" + proposedResponse,
      },
    ];
  }
}
