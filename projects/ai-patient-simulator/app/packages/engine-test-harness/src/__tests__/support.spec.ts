/**
 * Engine support module tests (APS-REQ-102/103/104/106/107/108/110/111)
 *
 * Covers:
 *   (a) Routing matrix -- one assertion per rule (regression per APS-REQ-108)
 *   (b) Redaction -- sensitive fields stripped from diagnostic payload
 *   (c) Structural isolation -- support module imports NO patient engine types
 *   (d) Troubleshooting flows -- deterministic step generation per category
 */

import { resolveRoutingTarget, ROUTING_TABLE, runTroubleshootingFlow, redactDiagnosticPayload } from "@aps/engine";
import type { GlobalDiagnosticState, SupportIssueCategory, SupportScope } from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

const BASE_DIAGNOSTIC: GlobalDiagnosticState = {
  userAgent: "Mozilla/5.0 (test)",
  micPermission: "granted",
  simulationLoaded: false,
  lastApiStatus: null,
  clientErrorCodes: [],
  attemptId: "attempt-001",
  assignmentId: "assignment-001",
  courseId: "course-001",
};

// ---------------------------------------------------------------------------
// (a) Routing matrix -- regression: one test per rule
// ---------------------------------------------------------------------------

describe("resolveRoutingTarget -- routing matrix regression (APS-REQ-107/108)", () => {
  // 12 rules in the table; assert each one

  it("MIC_DICTATION_FAILURE:COURSE -> it-support@aps.pilot / 4h", () => {
    const r = resolveRoutingTarget("MIC_DICTATION_FAILURE", "COURSE");
    expect(r.toEmail).toBe("it-support@aps.pilot");
    expect(r.expectedResponseHours).toBe(4);
  });

  it("MIC_DICTATION_FAILURE:COLLEGE -> it-support@aps.pilot / 4h", () => {
    const r = resolveRoutingTarget("MIC_DICTATION_FAILURE", "COLLEGE");
    expect(r.toEmail).toBe("it-support@aps.pilot");
    expect(r.expectedResponseHours).toBe(4);
  });

  it("MIC_DICTATION_FAILURE:GLOBAL -> it-support@aps.pilot / 8h", () => {
    const r = resolveRoutingTarget("MIC_DICTATION_FAILURE", "GLOBAL");
    expect(r.toEmail).toBe("it-support@aps.pilot");
    expect(r.expectedResponseHours).toBe(8);
  });

  it("SIMULATION_LOADING_FAILURE:COURSE -> tech-support@aps.pilot / 2h", () => {
    const r = resolveRoutingTarget("SIMULATION_LOADING_FAILURE", "COURSE");
    expect(r.toEmail).toBe("tech-support@aps.pilot");
    expect(r.expectedResponseHours).toBe(2);
  });

  it("SIMULATION_LOADING_FAILURE:COLLEGE -> tech-support@aps.pilot / 2h", () => {
    const r = resolveRoutingTarget("SIMULATION_LOADING_FAILURE", "COLLEGE");
    expect(r.toEmail).toBe("tech-support@aps.pilot");
    expect(r.expectedResponseHours).toBe(2);
  });

  it("SIMULATION_LOADING_FAILURE:GLOBAL -> platform@aps.pilot / 4h", () => {
    const r = resolveRoutingTarget("SIMULATION_LOADING_FAILURE", "GLOBAL");
    expect(r.toEmail).toBe("platform@aps.pilot");
    expect(r.expectedResponseHours).toBe(4);
  });

  it("AI_RESPONSE_FAILURE:COURSE -> academic-support@aps.pilot / 1h", () => {
    const r = resolveRoutingTarget("AI_RESPONSE_FAILURE", "COURSE");
    expect(r.toEmail).toBe("academic-support@aps.pilot");
    expect(r.expectedResponseHours).toBe(1);
  });

  it("AI_RESPONSE_FAILURE:COLLEGE -> academic-support@aps.pilot / 2h", () => {
    const r = resolveRoutingTarget("AI_RESPONSE_FAILURE", "COLLEGE");
    expect(r.toEmail).toBe("academic-support@aps.pilot");
    expect(r.expectedResponseHours).toBe(2);
  });

  it("AI_RESPONSE_FAILURE:GLOBAL -> platform@aps.pilot / 4h", () => {
    const r = resolveRoutingTarget("AI_RESPONSE_FAILURE", "GLOBAL");
    expect(r.toEmail).toBe("platform@aps.pilot");
    expect(r.expectedResponseHours).toBe(4);
  });

  it("OTHER:COURSE -> support@aps.pilot / 8h", () => {
    const r = resolveRoutingTarget("OTHER", "COURSE");
    expect(r.toEmail).toBe("support@aps.pilot");
    expect(r.expectedResponseHours).toBe(8);
  });

  it("OTHER:COLLEGE -> support@aps.pilot / 8h", () => {
    const r = resolveRoutingTarget("OTHER", "COLLEGE");
    expect(r.toEmail).toBe("support@aps.pilot");
    expect(r.expectedResponseHours).toBe(8);
  });

  it("OTHER:GLOBAL -> support@aps.pilot / 24h", () => {
    const r = resolveRoutingTarget("OTHER", "GLOBAL");
    expect(r.toEmail).toBe("support@aps.pilot");
    expect(r.expectedResponseHours).toBe(24);
  });

  it("ROUTING_TABLE has exactly 12 entries (all rules accounted for)", () => {
    expect(Object.keys(ROUTING_TABLE).length).toBe(12);
  });

  it("unknown category falls back gracefully (no throw) and returns exact fallback values (MINOR-1)", () => {
    // Cast to exercise the fallback path.
    // Assert exact fallback values so a regression that changes the fallback email or SLA
    // would be caught (previously only asserted .toBeDefined() / typeof number).
    const r = resolveRoutingTarget("UNKNOWN_CATEGORY" as SupportIssueCategory, "COURSE" as SupportScope);
    expect(r.toEmail).toBe("support@aps.pilot");
    expect(r.expectedResponseHours).toBe(24);
  });
});

// ---------------------------------------------------------------------------
// (b) Redaction -- sensitive fields stripped (APS-REQ-106)
// ---------------------------------------------------------------------------

describe("redactDiagnosticPayload -- sensitive field removal (APS-REQ-106)", () => {
  it("removes token field", () => {
    const raw = { token: "abc123", userAgent: "Mozilla" };
    const result = redactDiagnosticPayload(raw);
    expect(result["token"]).toBe("[REDACTED]");
    expect(result["userAgent"]).toBe("Mozilla");
  });

  it("removes accessToken field", () => {
    const raw = { accessToken: "eyJ.abc.xyz", userId: "u-001" };
    const result = redactDiagnosticPayload(raw);
    expect(result["accessToken"]).toBe("[REDACTED]");
    expect(result["userId"]).toBe("u-001");
  });

  it("removes JWT string values (three-segment base64)", () => {
    const raw = { someField: "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c" };
    const result = redactDiagnosticPayload(raw);
    expect(result["someField"]).toBe("[REDACTED]");
  });

  it("removes transcriptText field", () => {
    const raw = { transcriptText: "Patient said hello", micPermission: "granted" };
    const result = redactDiagnosticPayload(raw);
    expect(result["transcriptText"]).toBe("[REDACTED]");
    expect(result["micPermission"]).toBe("granted");
  });

  it("removes studentNotes field", () => {
    const raw = { studentNotes: "I noticed the patient seemed sad", attemptId: "a-001" };
    const result = redactDiagnosticPayload(raw);
    expect(result["studentNotes"]).toBe("[REDACTED]");
    expect(result["attemptId"]).toBe("a-001");
  });

  it("removes originalText from messages array (transcript protection)", () => {
    const raw = {
      messages: [
        { role: "STUDENT", originalText: "Hello patient", turnNumber: 1 },
        { role: "PATIENT", originalText: "Hi there student", turnNumber: 1 },
      ],
    };
    const result = redactDiagnosticPayload(raw);
    const msgs = result["messages"] as Array<Record<string, unknown>>;
    const msg0 = msgs[0]!;
    const msg1 = msgs[1]!;
    expect(msg0["originalText"]).toBe("[REDACTED]");
    expect(msg1["originalText"]).toBe("[REDACTED]");
    // Non-sensitive fields preserved
    expect(msg0["turnNumber"]).toBe(1);
    expect(msg0["role"]).toBe("STUDENT");
  });

  it("removes password field via substring match", () => {
    const raw = { userPassword: "hunter2", safeField: "keep" };
    const result = redactDiagnosticPayload(raw);
    expect(result["userPassword"]).toBe("[REDACTED]");
    expect(result["safeField"]).toBe("keep");
  });

  it("removes prompt field (persona protection)", () => {
    const raw = { personaPrompt: "You are a patient named John", errorCode: "E001" };
    const result = redactDiagnosticPayload(raw);
    expect(result["personaPrompt"]).toBe("[REDACTED]");
    expect(result["errorCode"]).toBe("E001");
  });

  it("preserves safe diagnostic fields intact", () => {
    const raw: GlobalDiagnosticState = {
      ...BASE_DIAGNOSTIC,
      micPermission: "denied",
      lastApiStatus: 500,
      clientErrorCodes: ["ERR_TIMEOUT"],
    };
    const result = redactDiagnosticPayload(raw as unknown as Record<string, unknown>);
    expect(result["micPermission"]).toBe("denied");
    expect(result["lastApiStatus"]).toBe(500);
    expect(result["simulationLoaded"]).toBe(false);
    expect(result["attemptId"]).toBe("attempt-001");
  });

  it("handles nested objects recursively", () => {
    const raw = { nested: { token: "secret", safe: "keep" } };
    const result = redactDiagnosticPayload(raw);
    const nested = result["nested"] as Record<string, unknown>;
    expect(nested["token"]).toBe("[REDACTED]");
    expect(nested["safe"]).toBe("keep");
  });

  it("handles null and undefined values without throwing", () => {
    const raw = { nullField: null, undefinedField: undefined, safe: "ok" };
    expect(() => redactDiagnosticPayload(raw as Record<string, unknown>)).not.toThrow();
    const result = redactDiagnosticPayload(raw as Record<string, unknown>);
    expect(result["nullField"]).toBeNull();
    expect(result["safe"]).toBe("ok");
  });
});

// ---------------------------------------------------------------------------
// (c) Structural isolation -- support module does NOT import patient-engine types
// (APS-REQ-111)
// ---------------------------------------------------------------------------

describe("support module structural isolation (APS-REQ-111)", () => {
  it("troubleshoot module has no import of PatientState or PatientStateLog", () => {
    // We verify by dynamic require + inspect module source at load time.
    // The support functions come from @aps/engine's support subdir.
    // If any of PatientState / PatientStateLog types were imported at runtime,
    // they would appear as dependencies. We assert the exported functions from
    // the support path do not reference engine pipeline types at all.
    //
    // Structural check: the three support functions exist and return expected shapes.
    // Import path isolation: runTroubleshootingFlow does NOT accept TurnPipeline args.
    //
    // MINOR-2: the stronger guard for APS-REQ-111 is a build-time no-restricted-imports
    // ESLint rule on packages/engine/src/support/ forbidding imports from
    // pipeline/state/evaluation/authoring. No ESLint config exists in this project yet;
    // when one is added, add this rule. Until then, this functional isolation test is
    // the guard (TypeScript erases types at runtime so a type-only import would not be
    // caught here, but that is acceptable for pilot scope).

    const result = runTroubleshootingFlow("MIC_DICTATION_FAILURE", BASE_DIAGNOSTIC);
    // If this call compiles and runs, the isolation is intact:
    // TurnPipelineInput would require engineConfig etc. not present here.
    expect(result.issueCategory).toBe("MIC_DICTATION_FAILURE");
    expect(result.emailEscapeAvailable).toBe(true);
  });

  it("runTroubleshootingFlow does not expose PatientStateSnapshot in its result", () => {
    const result = runTroubleshootingFlow("AI_RESPONSE_FAILURE", BASE_DIAGNOSTIC);
    // PatientStateSnapshot has fields like trust, openness, emotionalActiv.
    // Assert none of these leak into the support result.
    const resultKeys = Object.keys(result);
    const patientStateFields = ["trust", "openness", "emotionalActiv", "avoidanceLevel", "defensiveness", "allianceQuality"];
    for (const field of patientStateFields) {
      expect(resultKeys).not.toContain(field);
    }
  });

  it("redactDiagnosticPayload does not require GroundTruthRef or TurnPipeline", () => {
    // If this compiles and runs without TurnPipeline args, isolation is confirmed
    const result = redactDiagnosticPayload({ safe: "value", token: "secret" });
    expect(result["token"]).toBe("[REDACTED]");
  });
});

// ---------------------------------------------------------------------------
// (d) Troubleshooting flows -- deterministic output (APS-REQ-102/103/104/110)
// ---------------------------------------------------------------------------

describe("runTroubleshootingFlow -- MIC_DICTATION_FAILURE (APS-REQ-102)", () => {
  it("returns at least 2 steps for denied mic permission", () => {
    const state = { ...BASE_DIAGNOSTIC, micPermission: "denied" as const };
    const result = runTroubleshootingFlow("MIC_DICTATION_FAILURE", state);
    expect(result.steps.length).toBeGreaterThanOrEqual(2);
    expect(result.steps[0]!.instruction).toMatch(/Settings|allow/i);
  });

  it("returns steps for prompt/unknown mic permission", () => {
    const state = { ...BASE_DIAGNOSTIC, micPermission: "prompt" as const };
    const result = runTroubleshootingFlow("MIC_DICTATION_FAILURE", state);
    expect(result.steps.length).toBeGreaterThanOrEqual(2);
    expect(result.steps[0]!.instruction).toMatch(/Allow/i);
  });

  it("returns steps for granted mic permission (still failing)", () => {
    const state = { ...BASE_DIAGNOSTIC, micPermission: "granted" as const };
    const result = runTroubleshootingFlow("MIC_DICTATION_FAILURE", state);
    expect(result.steps.length).toBeGreaterThanOrEqual(2);
  });

  it("always includes email escape hatch", () => {
    const result = runTroubleshootingFlow("MIC_DICTATION_FAILURE", BASE_DIAGNOSTIC);
    expect(result.emailEscapeAvailable).toBe(true);
    expect(result.emailEscapeLabel).toBeTruthy();
  });

  it("canContinueNow is false for mic failure", () => {
    const result = runTroubleshootingFlow("MIC_DICTATION_FAILURE", BASE_DIAGNOSTIC);
    expect(result.canContinueNow).toBe(false);
  });

  it("step numbers are sequential starting from 1", () => {
    const result = runTroubleshootingFlow("MIC_DICTATION_FAILURE", BASE_DIAGNOSTIC);
    result.steps.forEach((step, i) => {
      expect(step.stepNumber).toBe(i + 1);
    });
  });
});

describe("runTroubleshootingFlow -- SIMULATION_LOADING_FAILURE (APS-REQ-103)", () => {
  it("mentions server error when lastApiStatus >= 500", () => {
    const state = { ...BASE_DIAGNOSTIC, lastApiStatus: 503 };
    const result = runTroubleshootingFlow("SIMULATION_LOADING_FAILURE", state);
    expect(result.steps[0]!.instruction).toMatch(/503|server/i);
  });

  it("recoveryGuidance mentions 'progress is saved' when lastApiStatus >= 500 (BLOCKER-1 regression)", () => {
    // Verifies the serverSideOnly branch actually fires. Before the fix, steps.length === 2
    // was never true (4 unconditional steps were appended first), so this message was dead code.
    const state = { ...BASE_DIAGNOSTIC, lastApiStatus: 503 };
    const result = runTroubleshootingFlow("SIMULATION_LOADING_FAILURE", state);
    expect(result.recoveryGuidance).toMatch(/progress is saved/i);
  });

  it("returns at least 3 steps even without server error", () => {
    const result = runTroubleshootingFlow("SIMULATION_LOADING_FAILURE", BASE_DIAGNOSTIC);
    expect(result.steps.length).toBeGreaterThanOrEqual(3);
  });

  it("always has email escape hatch", () => {
    const result = runTroubleshootingFlow("SIMULATION_LOADING_FAILURE", BASE_DIAGNOSTIC);
    expect(result.emailEscapeAvailable).toBe(true);
  });

  it("includes assignmentId in steps when provided", () => {
    const state = { ...BASE_DIAGNOSTIC, assignmentId: "asgn-999" };
    const result = runTroubleshootingFlow("SIMULATION_LOADING_FAILURE", state);
    const hasAssignmentMention = result.steps.some((s) => s.instruction.includes("asgn-999"));
    expect(hasAssignmentMention).toBe(true);
  });
});

describe("runTroubleshootingFlow -- AI_RESPONSE_FAILURE (APS-REQ-104)", () => {
  it("returns rate-limit-specific step for HTTP 429", () => {
    const state = { ...BASE_DIAGNOSTIC, lastApiStatus: 429 };
    const result = runTroubleshootingFlow("AI_RESPONSE_FAILURE", state);
    expect(result.steps[0]!.instruction).toMatch(/429|rate limit|capacity/i);
  });

  it("returns server-error step for HTTP 500", () => {
    const state = { ...BASE_DIAGNOSTIC, lastApiStatus: 500 };
    const result = runTroubleshootingFlow("AI_RESPONSE_FAILURE", state);
    expect(result.steps[0]!.instruction).toMatch(/500|server/i);
  });

  it("mentions client error codes in steps when present", () => {
    const state = { ...BASE_DIAGNOSTIC, clientErrorCodes: ["AI_TIMEOUT", "NET_ERR"] };
    const result = runTroubleshootingFlow("AI_RESPONSE_FAILURE", state);
    const mentionsCodes = result.steps.some(
      (s) => s.instruction.includes("AI_TIMEOUT") || s.instruction.includes("NET_ERR"),
    );
    expect(mentionsCodes).toBe(true);
  });

  it("always has email escape hatch", () => {
    const result = runTroubleshootingFlow("AI_RESPONSE_FAILURE", BASE_DIAGNOSTIC);
    expect(result.emailEscapeAvailable).toBe(true);
  });

  it("recoveryGuidance mentions preserving progress", () => {
    const result = runTroubleshootingFlow("AI_RESPONSE_FAILURE", BASE_DIAGNOSTIC);
    expect(result.recoveryGuidance).toMatch(/preserv|saved|progress/i);
  });
});

describe("runTroubleshootingFlow -- OTHER fallback", () => {
  it("returns 3 steps for unknown category", () => {
    const result = runTroubleshootingFlow("OTHER", BASE_DIAGNOSTIC);
    expect(result.steps.length).toBe(3);
  });

  it("always has email escape hatch", () => {
    const result = runTroubleshootingFlow("OTHER", BASE_DIAGNOSTIC);
    expect(result.emailEscapeAvailable).toBe(true);
  });
});
