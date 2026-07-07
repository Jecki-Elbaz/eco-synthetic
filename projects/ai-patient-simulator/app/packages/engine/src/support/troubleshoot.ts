// Deterministic tech-support troubleshooting flows (APS-REQ-102/103/104/110)
//
// STRUCTURAL ISOLATION (APS-REQ-111):
//   This module MUST NOT import from patient engine / persona / ground-truth /
//   PatientStateLog. It is a pure-TS deterministic module. No LLM, no DB.
//
// Inputs: a GlobalDiagnosticState passed by the caller.
// Outputs: TroubleshootingResult (steps + recovery guidance + email escape hatch).

import type {
  GlobalDiagnosticState,
  SupportIssueCategory,
  TroubleshootingResult,
  TroubleshootingStep,
} from "@aps/shared-types";

// ---------------------------------------------------------------------------
// Email escape hatch label (always available per APS-REQ-104)
// ---------------------------------------------------------------------------

const EMAIL_ESCAPE_LABEL = "Skip steps and contact support by email";

// ---------------------------------------------------------------------------
// Mic / dictation failure flow (APS-REQ-102)
// ---------------------------------------------------------------------------

function troubleshootMic(state: GlobalDiagnosticState): TroubleshootingResult {
  const steps: TroubleshootingStep[] = [];
  let n = 1;

  if (state.micPermission === "denied") {
    steps.push({
      stepNumber: n++,
      instruction:
        "Your browser has blocked microphone access. Open your browser Settings > Privacy > Microphone and allow this site, then refresh the page.",
      userActionable: true,
    });
  } else if (state.micPermission === "prompt" || state.micPermission === "unknown") {
    steps.push({
      stepNumber: n++,
      instruction:
        "When prompted by the browser, click 'Allow' to grant microphone access. If no prompt appears, check your browser address bar for a blocked microphone icon and click it.",
      userActionable: true,
    });
  } else {
    // Permission granted but still failing
    steps.push({
      stepNumber: n++,
      instruction:
        "Microphone permission is granted. Check that no other application (Teams, Zoom, etc.) is exclusively holding the microphone. Close other apps if needed.",
      userActionable: true,
    });
  }

  steps.push({
    stepNumber: n++,
    instruction:
      "Ensure your physical microphone or headset is properly connected. If using a USB device, try unplugging and replugging it.",
    userActionable: true,
  });

  steps.push({
    stepNumber: n++,
    instruction:
      "Try a different browser (Chrome or Edge are recommended). If dictation still fails, your device microphone may need a driver update.",
    userActionable: true,
  });

  steps.push({
    stepNumber: n++,
    instruction:
      "If none of the above steps resolve the issue, use the 'Contact support' button to send a support ticket.",
    userActionable: true,
  });

  return {
    issueCategory: "MIC_DICTATION_FAILURE",
    steps,
    canContinueNow: false,
    recoveryGuidance:
      "You cannot use dictation until the microphone issue is resolved. If dictation is optional for your assignment, you may be able to type responses instead -- check with your instructor.",
    emailEscapeAvailable: true,
    emailEscapeLabel: EMAIL_ESCAPE_LABEL,
  };
}

// ---------------------------------------------------------------------------
// Simulation loading failure flow (APS-REQ-103)
// ---------------------------------------------------------------------------

function troubleshootSimulationLoading(
  state: GlobalDiagnosticState,
): TroubleshootingResult {
  const steps: TroubleshootingStep[] = [];
  let n = 1;

  // Track whether this is a server-side-only issue so we can give the right
  // recoveryGuidance below. The flag is set here, at the conditional push point,
  // NOT derived from steps.length after further unconditional pushes (which would
  // always be > 2 and make the branch permanently dead).
  let isServerSideIssue = false;
  if (state.lastApiStatus !== null && state.lastApiStatus >= 500) {
    isServerSideIssue = true;
    steps.push({
      stepNumber: n++,
      instruction: `The server returned an error (HTTP ${state.lastApiStatus}). This is a server-side issue, not a browser issue. Wait 2-3 minutes and try reloading the page.`,
      userActionable: false,
    });
  }

  steps.push({
    stepNumber: n++,
    instruction:
      "Clear your browser cache and cookies for this site (Ctrl+Shift+Del on Windows, Cmd+Shift+Del on Mac), then reload.",
    userActionable: true,
  });

  steps.push({
    stepNumber: n++,
    instruction:
      "Check your internet connection. Open another website to confirm you are online. If using VPN or a college network, try disconnecting and reconnecting.",
    userActionable: true,
  });

  steps.push({
    stepNumber: n++,
    instruction:
      "Disable browser extensions one at a time (ad blockers, privacy tools) and reload. Some extensions block simulation assets.",
    userActionable: true,
  });

  steps.push({
    stepNumber: n++,
    instruction:
      "Try an incognito / private window or a different browser. If the simulation loads there, a browser profile setting is the cause.",
    userActionable: true,
  });

  if (state.assignmentId) {
    steps.push({
      stepNumber: n++,
      instruction: `If the simulation still does not load after all steps above, note your assignment ID (${state.assignmentId}) and contact support.`,
      userActionable: false,
    });
  }

  const serverSideOnly = isServerSideIssue;

  return {
    issueCategory: "SIMULATION_LOADING_FAILURE",
    steps,
    canContinueNow: false,
    recoveryGuidance:
      serverSideOnly
        ? "This appears to be a temporary server issue. Please wait a few minutes and try again. Your progress is saved -- you will not lose work."
        : "After following the steps, reload the page. If you recently started the simulation, your progress up to the last saved turn is preserved.",
    emailEscapeAvailable: true,
    emailEscapeLabel: EMAIL_ESCAPE_LABEL,
  };
}

// ---------------------------------------------------------------------------
// AI response failure flow (APS-REQ-104)
// ---------------------------------------------------------------------------

function troubleshootAiResponse(
  state: GlobalDiagnosticState,
): TroubleshootingResult {
  const steps: TroubleshootingStep[] = [];
  let n = 1;

  if (state.lastApiStatus === 429) {
    steps.push({
      stepNumber: n++,
      instruction:
        "The system is currently at capacity (rate limit reached). Please wait 2-3 minutes before sending another message.",
      userActionable: false,
    });
    return {
      issueCategory: "AI_RESPONSE_FAILURE",
      steps,
      canContinueNow: false,
      recoveryGuidance:
        "This is a temporary capacity limit. Wait a few minutes and try again. No action is needed on your end.",
      emailEscapeAvailable: true,
      emailEscapeLabel: EMAIL_ESCAPE_LABEL,
    };
  }

  if (state.lastApiStatus !== null && state.lastApiStatus >= 500) {
    steps.push({
      stepNumber: n++,
      instruction: `The AI service returned a server error (HTTP ${state.lastApiStatus}). This is not a browser issue. Wait 2-3 minutes and try resending your last message.`,
      userActionable: false,
    });
  }

  steps.push({
    stepNumber: n++,
    instruction:
      "Reload the page. If you were in the middle of a turn, your previous turns are saved. Retype your last message and submit again.",
    userActionable: true,
  });

  steps.push({
    stepNumber: n++,
    instruction:
      "Check your internet connection. Intermittent connectivity can cause AI response timeouts.",
    userActionable: true,
  });

  if (state.clientErrorCodes.length > 0) {
    steps.push({
      stepNumber: n++,
      instruction: `Note these error codes for the support team: ${state.clientErrorCodes.join(", ")}. Include them in your support ticket if the issue persists.`,
      userActionable: false,
    });
  }

  steps.push({
    stepNumber: n++,
    instruction:
      "If the AI does not respond after two or more retries, use the 'Contact support' button. Your attempt will be reviewed by your instructor.",
    userActionable: true,
  });

  return {
    issueCategory: "AI_RESPONSE_FAILURE",
    steps,
    canContinueNow: false,
    recoveryGuidance:
      "Your simulation progress up to the last successful turn is preserved. Once the issue is resolved you can continue from where you left off.",
    emailEscapeAvailable: true,
    emailEscapeLabel: EMAIL_ESCAPE_LABEL,
  };
}

// ---------------------------------------------------------------------------
// Other / generic fallback
// ---------------------------------------------------------------------------

function troubleshootOther(_state: GlobalDiagnosticState): TroubleshootingResult {
  return {
    issueCategory: "OTHER",
    steps: [
      {
        stepNumber: 1,
        instruction:
          "Reload the page and try again. If the issue persists, note any error messages you see on screen.",
        userActionable: true,
      },
      {
        stepNumber: 2,
        instruction:
          "Try a different browser or an incognito window to rule out browser-specific issues.",
        userActionable: true,
      },
      {
        stepNumber: 3,
        instruction:
          "If the issue still occurs, use the 'Contact support' button below to send a support ticket.",
        userActionable: true,
      },
    ],
    canContinueNow: false,
    recoveryGuidance:
      "If you cannot continue, contact support and your instructor will be notified.",
    emailEscapeAvailable: true,
    emailEscapeLabel: EMAIL_ESCAPE_LABEL,
  };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

/**
 * Deterministic troubleshooting flow dispatcher.
 * No LLM. No DB access. No imports from patient engine / persona / ground-truth.
 */
export function runTroubleshootingFlow(
  category: SupportIssueCategory,
  diagnosticState: GlobalDiagnosticState,
): TroubleshootingResult {
  switch (category) {
    case "MIC_DICTATION_FAILURE":
      return troubleshootMic(diagnosticState);
    case "SIMULATION_LOADING_FAILURE":
      return troubleshootSimulationLoading(diagnosticState);
    case "AI_RESPONSE_FAILURE":
      return troubleshootAiResponse(diagnosticState);
    default:
      return troubleshootOther(diagnosticState);
  }
}
