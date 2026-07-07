import type { LLMProvider, LLMMessage } from "../llm/provider.interface.js";
export type GuardRunResult = {
    outcome: "PASS";
    response: string;
    guardDetail: null;
    inputTokens: number;
    outputTokens: number;
} | {
    outcome: "REGENERATE";
    response: string;
    guardDetail: string;
    inputTokens: number;
    outputTokens: number;
} | {
    outcome: "BLOCKED";
    response: string;
    guardDetail: string;
    inputTokens: number;
    outputTokens: number;
};
export declare class GuardRunner {
    private readonly provider;
    private readonly maxRetries;
    constructor(provider: LLMProvider, maxRetries?: number);
    /**
     * Run the guard check against a proposed response.
     * guardPrompt: pre-built guard messages (from ContextBuilder.buildGuardPrompt).
     * patientMessages: pre-built patient generator messages.
     *
     * Parallel execution: both LLM calls fire simultaneously.
     * Delivery gates on guard PASS.
     */
    run(patientMessages: LLMMessage[], guardPromptBuilder: (proposedResponse: string) => LLMMessage[]): Promise<GuardRunResult>;
    private runGuard;
}
//# sourceMappingURL=guard-runner.d.ts.map