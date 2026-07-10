# Gate: Dictation Security Leg -- APS-REQ-046 / APS-004 sub-item
# Author: Rambo (Security) | Date: 2026-07-10 | Requester: Eco (CEO)
# Target: Web Speech API dictation feature, NEXT_PUBLIC_DICTATION_ENABLED flag
# Source files reviewed: apps/web/src/components/simulation/useDictation.ts,
#   apps/web/src/components/simulation/InputBar.tsx,
#   docs/sprint-4-envelope-ido-2026-07-10.md

VERDICT: CLEAR-WITH-CONDITIONS

Flag must stay OFF (NEXT_PUBLIC_DICTATION_ENABLED=false) for any student-facing
environment until conditions below are met. No CLEAR for live use without Eyal
legal leg also passing.

---

## 1. Data-flow reality

a. When Chrome SpeechRecognition fires:
   - Browser captures mic audio locally.
   - Chrome sends raw audio stream to Google Cloud Speech (Google servers, not ours).
   - Google returns transcript text to the browser.
   - Our onresult handler receives text only. Our code NEVER touches audio.
   - Our servers NEVER receive audio. The existing text-message path handles the
     typed/transcribed result identically to a hand-typed message.

b. Firefox / older browsers:
   - SpeechRecognition not exposed in window. isDictationEnabled() returns false.
   - Mic button not rendered. Typed-only mode. No audio egress risk on these browsers.

c. Safari (macOS/iOS):
   - Implements SpeechRecognition; relays to Apple servers, not Google. Same class
     of risk -- different vendor. Pilot context is Chrome-first; assess if Safari is
     in scope before enabling there.

d. Confirmed: no on-device / zero-egress path exists in mainstream browsers without
   a new paid dependency. This was correctly flagged by Ido.

---

## 2. What Google receives -- and what it does NOT

RECEIVES:
- Raw audio stream (voice of the student).
- lang parameter: "he-IL".
- Standard browser metadata: client IP address, User-Agent header.

DOES NOT RECEIVE (confirmed by code review):
- Our JWT / session token. The SpeechRecognition API has no mechanism for custom
  HTTP headers. Our auth context is attached only to our own API calls.
- Student ID, name, email, or any PII from our application layer.
- The patient scenario text or any message content from the simulation session.
- Any data from our backend.

Net: Google receives an audio clip of student speech + he-IL + browser metadata.
Google can infer approximate location (IP) and browser. Google cannot link the
audio to a named student unless the student speaks their own name or Google
performs voice-print matching (not part of standard STT product, but unknown
contractually -- this is the key item for Eyal).

---

## 3. Risk findings

F-1 NEW SUB-PROCESSOR (HIGH). Student voice audio transits Google Cloud Speech.
    This is a new sub-processor relationship not covered by existing APS-004 clearances.
    Adam is data controller. Any processing of student personal data by a sub-processor
    requires a legal basis and (under Israeli PPL) likely a data-processing agreement
    or at minimum a written arrangement. Voice in educational context = personal data.
    Not biometric per se, but voice of a minor or student in a closed educational
    system is sensitive. Status: OPEN -- Eyal must assess.

F-2 RETENTION UNKNOWN (HIGH). Browser-native Chrome SpeechRecognition routes audio
    through Google's standard speech infrastructure. The retention and training-data
    policy for browser-native STT is opaque -- it is NOT the same product as Google
    Cloud Speech-to-Text API (GCP), which has explicit "no training on customer data"
    terms. For the browser-native path, terms are governed by Chrome's usage policies,
    not GCP. Eyal must confirm whether Google logs or trains on he-IL audio from
    browser SpeechRecognition. This is the highest unknown in the chain.

F-3 NO DISCLOSURE TO STUDENT (MEDIUM). The current UI shows a mic button with no
    indication that audio leaves the browser. A student pressing the button does not
    know their voice goes to Google. Under PPL and general data-minimization principles,
    this requires disclosure before first use. Fixable in UI -- see conditions.

F-4 FLAG OFF BY DEFAULT (MITIGATING). The feature-flag default is OFF.
    NEXT_PUBLIC_DICTATION_ENABLED is absent/false in all current environments.
    Mic button does not render. No audio egress possible in current deployment.
    This fully contains the risk while clearance is pending.

F-5 NO EXCESS PII IN CODE (MITIGATING). Code review confirms: useDictation.ts and
    InputBar.tsx contain no logic that attaches session data, user IDs, or tokens
    to the SpeechRecognition instance. The implementation is clean. Only lang is set.

F-6 GRACEFUL DEGRADATION CORRECT (MITIGATING). Non-Chrome browsers: mic button
    hidden, typed input always available. Permission-denied: Hebrew inline message,
    no crash, focus to text input. No blocking modal. Implementation is solid.

---

## 4. Conditions for CLEAR (all must be met before flag is enabled)

C-1 (BLOCKING -- Eyal leg). Eyal must confirm:
    - Google Cloud Speech browser-native STT does not retain or train on student
      audio inputs, OR a DPA / contractual arrangement is in place that covers this.
    - Google Cloud Speech qualifies as a permissible sub-processor under Israeli PPL
      for educational-context student voice data with Adam as data controller.
    - If retention is unconfirmed or sub-processor terms are inadequate: flag is
      BLOCKED until an alternative (on-device ASR, paid no-log endpoint) is gated.

C-2 (BLOCKING -- disclosure UI). Before the first SpeechRecognition.start() call
    in any student-facing session, the UI must display a one-time disclosure. Minimum:
    "ההקלטה מועברת ל-Google לצורך תמלול" (or approved i18n equivalent). Must appear
    as inline text near the mic button, or as a one-time modal with "הבנתי / OK".
    Not a blocker on the code landing (flag is OFF); blocker on setting flag=true.

C-3 (BLOCKING -- scope gate). Flag must not be set true for any environment that
    serves real students (pilot or production) until C-1 + C-2 are both met.
    Dev/local testing with flag=true is acceptable (no real students, no PPL exposure).

C-4 (RECOMMENDED). Add a browser-context note near the mic button when active:
    Chrome only is tested for he-IL. If Safari enters scope, run a separate
    sub-processor assessment for Apple's STT infrastructure (different vendor,
    different DPA landscape).

C-5 (RECOMMENDED). Coordinate with Adam (data controller) before pilot go-live:
    Adam's privacy policy / student consent flow must reference Google speech
    processing if dictation is enabled. Adam cannot unknowingly expose student
    data to a sub-processor not in their own privacy notice.

---

## 5. Items for Eyal (legal leg -- running parallel)

E-1. Google Cloud Speech browser-native audio retention policy. What terms govern
     the Chrome-native SpeechRecognition route? Is it GCP Speech API terms, Chrome
     privacy policy, or Google Workspace for Education? Each has different data
     commitments.

E-2. PPL third-party transfer: voice data of Israeli students in an educational
     pilot leaving Israel to Google servers (likely US/EU). Does Israeli PPL
     require specific cross-border transfer safeguards? Is an SCCs-equivalent
     or adequacy decision in play for Google?

E-3. Adam (data controller) obligations: does Adam need to update their own
     privacy notice and student consent to cover Google speech processing?
     Is Adam's existing agreement with Google Workspace for Education sufficient,
     or does the SpeechRecognition path fall outside that umbrella?

E-4. If Eyal determines terms are inadequate: evaluate whether a paid Google
     Cloud Speech-to-Text API endpoint (GCP, with explicit DPA) is a feasible
     alternative. That would be a new external service -- Rambo gate required
     before adoption.

---

## 6. What is NOT a risk (closed)

- JWT/PII leakage alongside audio: CLOSED. Confirmed by code review. Not possible
  with the Web Speech API architecture. Our application tokens stay in our HTTP layer.
- Code-level prompt injection via speech input: LOW. Student speaks, text populates
  an editable input box. Student reviews and sends manually. No auto-send of
  raw transcription. Standard input sanitization on our backend applies as usual.
- New npm dependency: NONE added. Browser-native API. No supply-chain risk here.
- Excess permissions in the hook: NONE. Hook only sets lang, continuous, interimResults.
  No microphone permission is pre-acquired; browser requests permission on first
  recognition.start() call (standard browser permission prompt).

---

## Summary

Code: sound. Flag control: correct. Degradation: correct. Blocking risk: the Google
sub-processor relationship for student voice data under Israeli PPL. This is a legal
assessment question (Eyal) plus a UI disclosure requirement. Rambo security leg is
CLEAR-WITH-CONDITIONS; C-1 (Eyal confirmation) and C-2 (disclosure UI) must close
before the flag goes live. Current deployment is safe: flag is OFF, no audio egress.

Rambo (Security) | 2026-07-10 | APS-004 sub-item | Paired with Eyal legal leg
