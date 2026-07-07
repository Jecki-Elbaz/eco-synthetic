import type { LLMMessage } from "../llm/provider.interface.js";
import type { PatientStateSnapshot } from "@aps/shared-types";
/**
 * Estimate tokens in a string using the GPT-3.5/4 rough heuristic:
 * ~4 chars per token for English/Hebrew mixed content.
 * Intentionally conservative (rounds up) so we never overshoot the budget.
 */
export declare function estimateTokens(text: string): number;
/**
 * Select the most recent MessageRecord entries whose combined estimated token
 * count stays within tokenBudget.  Messages are iterated from newest to oldest;
 * the result is returned in ascending turn order (oldest first) so the LLM
 * sees the conversation in chronological order.
 *
 * If a single message already exceeds the budget it is included anyway (we
 * never drop the most-recent context entirely -- truncation is the caller's job).
 */
export declare function selectWindowByTokenBudget(messages: MessageRecord[], tokenBudget: number): MessageRecord[];
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
    contextSummary: string | null;
    challengeLevel: number;
    studentMessage: string;
    studentLanguage: string;
}
export declare class ContextBuilder {
    build(input: ContextBuildInput): LLMMessage[];
    /**
     * Build the guard model prompt.
     * Guard context MUST NOT contain the patient generator's context [architecture s.3.4].
     */
    buildGuardPrompt(proposedResponse: string, groundTruth: GroundTruthRef, turnNumber: number): LLMMessage[];
}
//# sourceMappingURL=context-builder.d.ts.map