# APS-031-LEGAL: Hosted Demo Legal Gate
# Author: Eyal (Legal, L3)
# Date: 2026-08-02
# Task: APS-031-LEGAL (Eco, owner A1 2026-08-02)
# Scope: fast legal check -- APS demo from stub-only to real Anthropic API + external user (Adam)
# Internal only. Not for external sharing without owner A1.
# Sources: anthropic-dpa-review-eyal.md (live-fetched 2026-06-30); compliance-backlog.md
#          (re-keyed owner A1 2026-08-02); @anthropic-ai/sdk license (live-fetched 2026-08-02)
# NOTE: referenced file company/legal/anthropic-dpa-item6-path-a-2026-08-01.md does not
#       exist on disk. Not cited. Analysis proceeds from the above confirmed sources.
# Security risk is Rambo's leg (APS-031-SEC) -- not duplicated here.

---

## VERDICT: CLEAR-WITH-CONDITIONS

No blocking legal term identified. Five conditions must be satisfied before Adam gets a credential.
Three of the five conditions are owner A1 actions (new commercial API account = spend + legal
commitment). Two are implementation conditions (UI + credential hygiene).

---

## Q1 -- Anthropic API commercial account vs Max

CLEAR-WITH-CONDITIONS.

Source: anthropic-dpa-review-eyal.md (Eyal live-fetch 2026-06-30, confirmed from
anthropic.com/legal/commercial-terms and anthropic.com/legal/data-processing-addendum).

Key terms on a commercial/API-billed account:
- DPA incorporated by reference into Commercial Terms on account acceptance.
  No separate execution required; DPA is in force the moment the account accepts commercial terms.
- No-training on API inputs: contractual prohibition on Anthropic's side (confirmed from
  commercial terms source). Not an opt-in the customer must activate; it is always on.
- Serving an external design partner a synthetic demo is permitted use under the Commercial
  Terms. No restriction on who uses an application built on the API.
- Acceptable Use Policy (AUP): for healthcare/education high-risk categories, AI disclosure
  at session start is required. This is a demo for product evaluation by a domain expert, not
  a formal clinical or assessment context, so the "qualified professional review before formal
  dissemination" clause does not apply to Adam's self-exploration session. The AI disclosure
  obligation DOES apply (condition C-4 below).

Owner A1 required: the new commercial API account itself is a spend commitment and accepts
Commercial Terms legally. That is an A1 action (jecki). Do not open or configure the account
without owner A1.

---

## Q2 -- DPA / C-E4: does external user + real API change the analysis?

C-E4 STAYS N/A.

Owner A1 standing position (compliance-backlog re-key 2026-08-02): C-E4 re-arms ONLY when
"a real project goes LIVE, AT SCALE, with REAL CUSTOMER personal data flowing through the LLM."

This demo: synthetic data only, one design partner, no real student/clinical/patient data.
That is not the re-arm trigger. C-E4 = N/A.

External user (Adam) does not change this. The trigger is about real personal data of third
parties (students, customers) flowing through the model, not about who is operating the UI.

Separate but reinforcing point: a commercial API account carries DPA incorporation on
acceptance (see Q1). So even if C-E4 were re-armed, the DPA would be satisfied by the
account's own terms. No gap either way.

C-E3 HARD STOP stands independently: no real student names, health data, or clinical case
content in any model call. Synthetic data only in this demo = C-E3 not triggered. If the demo
ever receives real personal data, stop immediately and flag to owner before continuing.

---

## Q3 -- External user (Adam): terms and privacy obligations

CLEAR-WITH-CONDITIONS.

Anthropic AUP:
- AI disclosure at session start = required (confirmed from live AUP fetch 2026-06-30).
  The demo UI must show that the patient is AI-powered before the first interaction.
  One sentence at session start is sufficient. This is condition C-4 below.
- No other AUP obligation is triggered by giving a design partner access to a synthetic demo.

Israeli PPL (Privacy Protection Law 5741-1981 + Amendment 13):
- Adam's own identity data (login credential) and session activity logs are minimal personal
  data under Israeli PPL.
- Processing basis: design partnership / legitimate interest. No formal consent form required
  at one-person design-partner scale.
- Transparency obligation (PPL general principle): Adam should know his session may be logged
  for product improvement purposes. The AI disclosure notice (C-4) covers this if it includes
  a one-line logging note. No separate privacy policy document required for a single design
  partner evaluating a synthetic demo.
- No database registration obligation at this scale (one external user, synthetic data).
- No DPA between Eco-Synthetic and Adam is required at this stage. He is a design partner,
  not a customer under contract, and he is not a data controller sending third-party personal
  data to us for processing.
- C-E3 hard stop applies here too: if Adam inputs any real personal information into the demo
  (e.g., a real patient name), that content must not reach the model. Out-of-scope for this
  gate; flag as an implementation constraint to Ido/R&D.

No Israeli PPL blocker. The condition is transparency at session start (C-4, same notice).

---

## Q4 -- @anthropic-ai/sdk license

CLEAR. No flag.

License: MIT (confirmed live from github.com/anthropics/anthropic-sdk-typescript/blob/main/LICENSE,
2026-08-02). Permissive. Commercial use fully permitted. No data handling obligation created by
the license. No restriction on external-facing use. No royalty, no copyleft. Standard.

---

## Conditions (numbered; 5 total)

C-1 (owner A1): Confirm new Anthropic API account is opened on a commercial/API-billed plan
    and has accepted the Anthropic Commercial Terms of Service. DPA is in force by incorporation
    at that moment. Do not configure or use the account before owner A1 in-session.

C-2 (owner A1): In console.anthropic.com, check whether a zero-retention or prompt-logging-off
    option is available for the demo API key. If available, enable it before Adam gets access.
    If not available on the plan tier, flag to owner -- may require a plan upgrade (additional A1).

C-3 (owner A1): Confirm the Anthropic Development Partner Program is NOT active on this account
    (or on the owner's Max subscription if any API key is shared). Enrollment is the only
    contractual pathway by which API inputs could be used for model training. Non-enrollment is
    the default; this is a verify-and-confirm step, not an expected remediation.

C-4 (implementation): Demo UI must display an AI disclosure notice at session start before
    the first patient interaction. Minimum content: "This patient is simulated by an AI. Your
    session activity may be logged for product improvement." One sentence or two. Must appear
    before Adam can begin. Satisfies Anthropic AUP (AI disclosure) and Israeli PPL transparency.

C-5 (implementation): Adam's temporary credential must be time-limited and revoked after the
    demo engagement ends. Do not leave an open credential to an internet-reachable endpoint
    longer than needed. This is a security hygiene item; Rambo's leg (APS-031-SEC) should
    address the technical implementation. Flagged here as a legal-hygiene condition: an
    open credential with no expiry creates unnecessary personal-data-access risk under PPL.

---

## What needs owner before go-live

C-1, C-2, C-3 are owner A1 actions. None can be delegated.
C-4 and C-5 are implementation conditions -- Ido/R&D implement; no separate A1 required.

No other A1 legal item identified for this specific demo scope.

---

## Items not in scope / carry-forward

- Company registration (compliance-backlog Item 1): cancelled by owner 2026-06-29. No
  formal contract with Adam = registration not triggered by this demo. If a term sheet or
  commercial agreement with Adam follows the demo, registration and DPA (with Adam, in that
  capacity) become required. Flag at that time.
- Anthropic sub-processor list (compliance-backlog Item 6, original backlog note): owner
  to visit trust.anthropic.com/subprocessors directly. This is a documentation step, not
  a blocker for the synthetic demo.
- Formal DPA with Adam: not required for a design partner evaluating a synthetic demo.
  Required if and when a commercial arrangement is formalized. Eyal drafts at that stage;
  owner A1 before sending.
