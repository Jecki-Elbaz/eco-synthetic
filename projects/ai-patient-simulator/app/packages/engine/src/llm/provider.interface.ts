// LLM Provider abstraction [Section 4 of engine-architecture-gal.md]
// Concrete provider is NOT chosen here -- blocked on APS-004 gate.
// All engine code uses this interface only.
// The active provider is selected at startup via DI (NestJS) using LLM_PROVIDER env var.

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
  modelId: string;   // actual model used; recorded in UsageLog
  cached: boolean;   // prompt-cache hit if provider supports it
}

// Intent-based hint -- NOT provider-specific.
// Provider maps to cheapest model that fits the intent.
export enum ModelHint {
  PATIENT_RESPONSE = "PATIENT_RESPONSE", // main generation -- highest quality
  GUARD_PASS = "GUARD_PASS",             // ground-truth guard -- can be lighter
  ANALYSER = "ANALYSER",                 // interaction analyser -- structured JSON
  SUMMARISER = "SUMMARISER",             // context summarisation
  EVALUATOR = "EVALUATOR",               // post-simulation eval -- high quality
  DEBRIEF = "DEBRIEF",                   // debrief chat -- moderate quality
}

export interface LLMProvider {
  complete(req: LLMRequest): Promise<LLMResponse>;
  estimateCost(inputTokens: number, outputTokens: number, hint: ModelHint): number;
}
