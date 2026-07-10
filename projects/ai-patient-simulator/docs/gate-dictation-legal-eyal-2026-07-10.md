# APS Dictation Feature -- Legal Gate Review
# Author: Eyal (Legal, L3)
# Date: 2026-07-10
# Task: APS-004 sub-item; gate for APS-REQ-046 (dictation / Web Speech API)
# Status: ANALYSIS ONLY -- no terms accepted, no tool adopted, no flag enabled.
# Verdict: BLOCK (conditions listed; path to CLEAR-WITH-CONDITIONS exists)
# Parallel: Rambo security leg (gate-dictation-security-rambo-2026-07-10.md) -- does not yet exist;
#           this legal leg does not block on it.
# Prior docs: gate-legal-privacy-eyal.md, aps-pilot-legal-requirements-eyal.md,
#             residual-legal-checklist.md
# Internal only. Not for external sharing without owner A1.

---

## Context

Dictation is built on browser-native Web Speech API, feature-flagged OFF.
In Chrome, the browser relays student voice audio to Google Cloud Speech for recognition.
Eco-Synthetic receives only the text transcript; the raw audio transits Google's servers.

Pilot posture: handles-only / de-identified model (Option A per residual-legal-checklist.md).
Adam is data controller as representative of Gome Gevim College.
Eco-Synthetic is data processor.
Law: Israeli Privacy Protection Law (PPL) 5741-1981 + Amendment 13 (2025).

---

## Q1 -- Controller/Processor Responsibility for the Browser Speech Relay Hop

**Finding: We are responsible for initiating this data flow. The "user's browser choice"
defense does not hold.**

Reasoning:

1. Our application code calls the Web Speech API (`SpeechRecognition` /
   `webkitSpeechRecognition`). The student clicks "dictate" in OUR product; they do not
   independently elect to send audio to Google. We trigger the API call.

2. Under Israeli PPL, "processing" includes collection and transfer. By implementing the
   API call, we initiate the collection of voice audio and its transmission to a third party.
   The fact that transmission happens via the browser's own network stack does not remove
   our role as the entity that instructed the processing to begin.

3. The student cannot meaningfully consent to the Google relay by choosing to use our
   product -- they are choosing to use a dictation feature we built. We bear the disclosure
   and consent obligation, not the browser vendor.

4. Structural analogy: this is not materially different from embedding any third-party
   SDK that phones home. The transport mechanism (browser-native API vs. imported library)
   does not change the analysis. We chose to use this API in our product.

**Who is what for this hop:**

- Adam / Gome Gevim: DATA CONTROLLER. They have not approved voice/biometric-adjacent
  data in the pilot scope (see Q3 below).
- Eco-Synthetic: DATA PROCESSOR. We process student data on Adam's behalf. We trigger
  the audio relay.
- Google (via Chrome's Web Speech relay to Google Cloud Speech): THIRD-PARTY PROCESSOR
  (effectively a sub-processor of ours for this hop).

**Critical gap: no business DPA exists for this path.**

Chrome's built-in Web Speech API is a CONSUMER product. Audio sent through it goes to
Google under Google's consumer privacy policy, NOT under a Google Cloud business DPA.
This is a structural problem:

- Google Cloud Speech-to-Text (direct API): has a published Google Cloud DPA (business
  terms; no training use by default; deletion commitments). Requires a direct API key and
  different implementation.
- Chrome's Web Speech API: routed under Google consumer terms. Google may retain and use
  audio for "service improvement" (training) under standard consumer privacy policy.
  No separate business DPA is available for this path.

Under Israeli PPL Amendment 13, a data processor must have DPA coverage with each
sub-processor that handles personal data. We cannot satisfy this for the Chrome Speech
relay because Google offers no business DPA for it. This is a hard gap, not a condition
that can be waived.

**What this means:**

If the feature uses Chrome's Web Speech API, there is no legal basis under which we can
route student voice audio through Google under consumer terms as part of a business
educational platform. The sub-processor DPA requirement cannot be met via this path.

**Alternative path exists:** use a STT implementation with a business-DPA-covered service
(e.g., Whisper API via the already-assessed OpenAI track -- note OpenAI is DEFERRED in
the gate-register pending its own gate; or use a local/browser-side model that does not
relay audio to any external server). Any alternative requires its own gate.

---

## Q2 -- Voice vs. Handles-Only De-identification Posture

**Finding: YES -- voice input materially undermines the handles-only posture.
This is the most significant legal concern in this review.**

The Option A (synthetic-handle) model works because:
- Platform stores only opaque handles (e.g., "Student-7F2A")
- No mapping from handle to real student identity exists in the platform
- Session transcripts and evaluation data are attached to the handle, not to a named person
- LC-5 (residual-legal-checklist.md Item 1) pending local counsel confirmation that
  this puts the platform outside PPL processor obligations for the main data set

Voice breaks this model for the following reasons:

**Voice is biometric-adjacent personal data.** Voice can identify a real person through
voiceprint analysis and speaker identification, regardless of what account handle is in use.
A recording labeled "Student-7F2A" is NOT anonymous -- it contains data that can be
reverse-linked to the real student's identity by anyone with access to the audio,
including Google.

Under Israeli PPL, data that "makes it possible to identify a person" is personal data
(PPL section 7). Voice audio of a known speaker satisfies this definition.

Amendment 13 (in force 2025) introduced heightened obligations for sensitive categories
of personal data. Whether voice/biometric data is enumerated as a sensitive category
under the Amendment 13 implementing regulations requires confirmation (this is a flagged
unknown -- cannot confirm from knowledge base alone; local counsel query recommended
before any voice data is processed). In the meantime, the precautionary position is to
treat voice as sensitive personal data.

**The audio leaves our control entirely.**

Under the handles-only model, session transcript text stays within our system (then
flows to the LLM via Anthropic's API under the DPA track from residual-legal-checklist.md
Item 2). We have contractual coverage for that path.

Voice audio sent to Google via Chrome's Speech API:
- Leaves our system before we have any transcript
- Is governed by Google's consumer privacy policy (as noted in Q1)
- May be retained by Google for service improvement (training use) -- not contractually
  prohibited under consumer terms
- Cannot be deleted by us from Google's systems (no deletion obligation in consumer terms)

This means: a student's voiceprint, linked to their simulation session content (which is
rich and potentially re-identifiable), is held by a third party under terms we cannot
control or audit.

**Conclusion for handles-only model:** dictation with Chrome's Web Speech API is out of
scope for the handles-only pilot posture as currently designed. It introduces:
1. A new personal data type (biometric-adjacent voice) not covered by the LC-5 analysis
2. A sub-processor (Google) with no business DPA
3. Loss of control over a data type that can re-identify students despite the handle model
4. Potential sensitive-data obligations under Amendment 13 not assessed for this data type

Enabling dictation for the pilot would require either (a) a completely separate legal
framework for the voice data type, or (b) switching to a STT implementation that does
not relay audio to Google under consumer terms.

---

## Q3 -- What Enabling the Flag Would Require

Five conditions. None are minor. All require owner A1 or owner relay.

**C-1 (BLOCKING): Controller sign-off -- Adam/Gome Gevim (owner relay required)**

The pilot scope Adam confirmed (aps-pilot-legal-requirements-eyal.md Section B) covers
name, course, and descriptive evaluation (text). Voice/biometric-adjacent audio was not
in scope. Adding it is a material expansion of the data types the controller authorized.

Before dictation can be enabled for any real student:
- Owner relays to Adam (via owner -- no direct agent contact with Adam): "The dictation
  feature sends student voice audio to Google for speech recognition. Does the college
  approve this as part of the pilot data scope?"
- If Adam says no, dictation is BLOCKED for pilot regardless of other conditions.
- If Adam says yes, that approval must be documented before the flag is enabled.

A1 required: owner relay to Adam is an A1 action (represents the company to a
data controller).

**C-2 (BLOCKING): Sub-processor DPA for STT service**

If dictation proceeds via Chrome's Web Speech API: NO PATH. Consumer terms cannot satisfy
the sub-processor DPA requirement (see Q1). The implementation must switch to a business-
DPA-covered STT service before any pilot use. Each alternative requires its own gate:
- Whisper API (OpenAI): OpenAI is DEFERRED in gate-register; must run full
  Rambo+Eyal gate before any adoption; note OpenAI training-use opt-out must be
  confirmed as per APS-004 pre-read.
- Other cloud STT with business DPA: gate required.
- Local/browser-side model (no audio egress): would eliminate the sub-processor DPA
  requirement for this hop; Rambo security review required for any library used.

Eyal will fetch the current Google Chrome speech / privacy terms as part of closing this
item (WebFetch is within authorized scope for active gate reviews). That fetch should
confirm or update the consumer-terms finding before a final recommendation on alternatives.
Fetch result to be appended to this document or a follow-on note.

**C-3 (BLOCKING): Student point-of-use consent mechanism**

Voice is biometric-adjacent data. The general pilot consent framework (handles-only,
session data) does not cover it. A separate, specific, opt-in consent is required
at the point of first dictation use.

Requirements:
- Displayed BEFORE the microphone is activated (not after)
- In Hebrew for the pilot cohort
- States plainly: "Your voice will be processed by [STT service] for speech recognition.
  [Brief statement of what that service does with audio and your rights.]"
- Is opt-in (default = OFF; student actively chooses to enable dictation)
- Text input must always remain as an available alternative (dictation cannot be the
  only input method; opting out must not degrade the simulation experience)
- Consent must be revocable (student can disable dictation mid-pilot)

This mechanism must be built and tested before any real student uses the feature.
Owner review of the consent text is required before it is shown to students (A1:
student-facing legal-adjacent text).

**C-4 (BLOCKING): Privacy notice update (A1)**

The pilot student privacy notice (Item 3, residual-legal-checklist.md; outline at
docs/draft-student-privacy-notice-outline.md) does not cover voice processing or
third-party audio relay.

Update required before dictation is enabled:
- Add: voice data collection via dictation feature
- Add: the STT service used and what it does with audio (including any data retention)
- Add: student's right to use text input as an alternative to dictation
- Add: contact point for voice-data deletion requests (if the STT service allows deletion)

Any update to the privacy notice is an A1 action. Cannot be changed without owner
review and approval. Must be in Hebrew before distribution to students.

**C-5 (BLOCKING): Biometric data classification confirm (local counsel)**

Whether voice/audio data constitutes "sensitive personal data" under Amendment 13's
enumerated categories requires confirmation from current PPA guidance or local counsel.
This is a flagged unknown -- Eyal cannot confirm the exact Amendment 13 enumeration
from knowledge base alone. If voice is a sensitive category, higher consent and security
obligations apply (and must be reflected in C-3 consent text and the privacy notice).

Owner A1 required to authorize the local counsel query (cost item; budget = 0).
This can be combined with the existing LC-5 query (residual-legal-checklist.md Item 1)
as a one-paragraph addendum at minimal additional cost.

---

## Q4 -- Verdict for Pilot

**BLOCK**

Dictation (APS-REQ-046) cannot be enabled for the pilot in its current implementation
without the five conditions above being met.

The BLOCK is on enabling the flag for real students. It is not a permanent rejection
of the feature. The feature-flagged OFF status is appropriate and must remain OFF until:

1. Adam (controller) explicitly approves voice data scope (C-1) -- owner relay, A1.
2. A business-DPA-covered STT implementation is gated and cleared (C-2) -- Rambo+Eyal gate.
3. Hebrew opt-in consent at point of use is built and owner-reviewed (C-3) -- A1.
4. Privacy notice updated and A1-approved (C-4) -- A1.
5. Biometric classification confirmed via local counsel / PPA guidance (C-5) -- A1 spend.

**Path to CLEAR-WITH-CONDITIONS:**

If all five conditions are met in sequence, verdict shifts to CLEAR-WITH-CONDITIONS with:
- Rambo security leg CLEAR (parallel; not yet issued -- Rambo to complete)
- Eyal legal leg: CLEAR-WITH-CONDITIONS (C-1 through C-5 above)
- Owner A1 to enable the flag (enabling a new data-collection capability for students
  is an A1 action regardless of the other conditions)

The most practical near-term path:

Step 1 (owner, this week): relay C-1 to Adam and get a yes/no on voice scope.
If no: close this review as BLOCK (no appeal path without controller consent).
If yes: proceed to step 2.

Step 2 (Eyal + Rambo, parallel): Eyal fetches Google speech/Chrome terms to confirm
consumer-terms finding; Eyal assesses alternative STT options for C-2; Rambo assesses
security for the chosen STT. Run as a mini gate on the STT service specifically.

Step 3 (Ido / R&D): build opt-in consent mechanism (C-3) in parallel with step 2.

Step 4 (Eyal drafts, owner A1): update privacy notice (C-4).

Step 5 (owner A1 spend): add C-5 biometric question to the LC-5 counsel query.

Step 6 (owner A1): enable the flag only after all steps complete.

**Items requiring owner A1:**

| Item | Why A1 |
|------|--------|
| C-1: relay to Adam re voice scope | A1: external representation of company |
| C-2: STT alternative gate | A2/A1: tool adoption gate |
| C-3: review consent text | A1: student-facing legal-adjacent text |
| C-4: privacy notice update | A1: public-facing legal document |
| C-5: biometric counsel query | A1: spend (budget = 0) |
| Flag enable | A1: new data-collection capability for students |

---

## Coordination Notes

**Rambo:** security leg (gate-dictation-security-rambo-2026-07-10.md) does not exist yet.
Rambo should review: (a) audio capture security; (b) any STT alternative that replaces the
Chrome/Google path; (c) any local STT library. Eyal does not block on Rambo for this verdict
-- both BLOCK findings should be reviewed together before any flag-enable decision.

**Gate-register:** no row exists for APS-REQ-046 dictation / Web Speech API / Google Cloud
Speech. This document serves as the Eyal legal input for a new gate-register row.
Row should be added with status `pending-review` pending Rambo and full conditions close.
Eyal cannot add a new gate-register row unilaterally for a surface this significant;
Eco to request owner A1 to open the row.

**Anthropic DPA track:** the existing CLEAR-WITH-CONFIG verdict for Anthropic
(residual-legal-checklist.md Item 2) covers text transcript data flowing through the LLM.
It does NOT cover voice audio. Voice audio is a separate data type on a different path;
Anthropic DPA status is irrelevant to the Q1/Q2 findings above.

**No action by this document:** this is analysis only. No terms are accepted, no flag is
enabled, no sub-processor is engaged. All action items require owner A1 as noted above.

---

## Document Control

Author: Eyal (Legal, L3). Date: 2026-07-10.
Status: BLOCK verdict. Path to CLEAR-WITH-CONDITIONS if 5 conditions met.
Coordinate with: Rambo (security leg, parallel).
Eco relays to owner. Not for external sharing without owner A1.
No legal commitment is made by this document.
