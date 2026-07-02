// Ground-truth guard model types [APS-REQ-030]

export type GuardVerdict = "PASS" | "FAIL";

export interface GuardResult {
  verdict: GuardVerdict;
  violations: string[];
  suggestion: string;
}
