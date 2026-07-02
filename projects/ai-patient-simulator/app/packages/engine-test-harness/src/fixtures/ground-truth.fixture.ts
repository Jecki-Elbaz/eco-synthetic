// Ground truth fixture for engine tests.
import type { GroundTruthRef } from "@aps/engine";

export function buildTestGroundTruth(overrides?: Partial<GroundTruthRef>): GroundTruthRef {
  return {
    disclosureAllowList: {
      unlocked: ["Patient reports low mood for 3 months"],
      locked: ["Patient has a suicide plan"],
    },
    doNotInvent: [
      "Patient has a suicide plan",
      "Patient is currently medicated",
      "Patient has a prior diagnosis of bipolar disorder",
    ],
    hardOffRampText:
      "I am a simulated training patient. If you are experiencing real distress, please contact your student welfare service.",
    ...overrides,
  };
}
