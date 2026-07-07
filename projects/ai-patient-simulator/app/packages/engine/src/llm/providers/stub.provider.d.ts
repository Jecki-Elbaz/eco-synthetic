import type { LLMProvider, LLMRequest, LLMResponse } from "../provider.interface.js";
import { ModelHint } from "../provider.interface.js";
export declare class StubProvider implements LLMProvider {
    complete(req: LLMRequest): Promise<LLMResponse>;
    estimateCost(_inputTokens: number, _outputTokens: number, _hint: ModelHint): number;
}
//# sourceMappingURL=stub.provider.d.ts.map