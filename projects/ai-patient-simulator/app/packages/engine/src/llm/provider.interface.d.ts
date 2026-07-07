export interface LLMMessage {
    role: "system" | "user" | "assistant";
    content: string;
}
export interface LLMRequest {
    messages: LLMMessage[];
    maxOutputTokens: number;
    temperature: number;
    modelHint: ModelHint;
    stream?: boolean;
}
export interface LLMResponse {
    text: string;
    inputTokens: number;
    outputTokens: number;
    modelId: string;
    cached: boolean;
}
export declare enum ModelHint {
    PATIENT_RESPONSE = "PATIENT_RESPONSE",// main generation -- highest quality
    GUARD_PASS = "GUARD_PASS",// ground-truth guard -- can be lighter
    ANALYSER = "ANALYSER",// interaction analyser -- structured JSON
    SUMMARISER = "SUMMARISER",// context summarisation
    EVALUATOR = "EVALUATOR",// post-simulation eval -- high quality
    DEBRIEF = "DEBRIEF"
}
export interface LLMProvider {
    complete(req: LLMRequest): Promise<LLMResponse>;
    estimateCost(inputTokens: number, outputTokens: number, hint: ModelHint): number;
}
//# sourceMappingURL=provider.interface.d.ts.map