# Gate Report: T-0046 -- Gmail Filter Management (manage_gmail_filter)
# GR-009 scope addition, owner-creds connector (jecki.elbaz@gmail.com)

Prepared by: Rambo (Security)
Date: 2026-08-02
Task: T-0046
Requested by: Shelly 2026-07-12 (via board row T-0046)
Connector: GR-009 google_owner server (taylorwilsdon/google_workspace_mcp v1.21.3,
  WORKSPACE_MCP_CREDENTIALS_DIR=owner-creds, account jecki.elbaz@gmail.com)

VERDICT: CLEAR-WITH-CONDITIONS

---

## Findings

1. SCOPE CONFIRMED MINIMAL. manage_gmail_filter creates and deletes filters on the
   owner's own mailbox (jecki.elbaz@gmail.com via owner-creds). No inbox-read, no
   send, no label mutation, no contact access beyond what a filter rule itself contains
   (sender address, subject keyword -- not message bodies). Blast radius is filter-rule
   manipulation on the owner account: lower than send_gmail_message (irreversible), higher
   than read-only (rules persist and auto-apply to future mail).

2. FORWARDING EXCLUDED -- HARD. The guard already hard-denies manage_gmail_filter on the
   runner path (guard.py line 492-493: RUNNER_CONTEXT=1 -> DENY, reason "never available
   on the runner path"). On the interactive path the tool itself does not route mail off-
   platform when forwarding addresses are absent from the rule. Forwarding-rule tools are
   treat as send-equivalents in guard.py comments and in GR-009 addendum (2026-07-10).
   Condition: settings.json for the Shelly repo google_owner server MUST NOT allow
   manage_gmail_filter with an action type of "forwardTo" without per-action owner A1.
   The google_workspace_mcp v1.21.3 filter API exposes a "forwardTo" action field; the
   guard does not inspect action type on the interactive path today. See condition F-C4.

3. PINNING CONFIRMED. Connector pinned to taylorwilsdon/google_workspace_mcp v1.21.3
   (commit f974a126d12f56af1b878b4cd3e039f0982af138, GR-009 addendum 2026-07-09).
   manage_gmail_filter is a tool on this pinned version; no version bump is involved.
   No new repo, no new supply chain. C-R4 (re-pin on scope change) is satisfied:
   this is an enable within the existing pinned version, not a version change.

4. PER-ACTION OWNER APPROVAL REQUIRED -- INTERACTIVE PATH ONLY. The guard hard-denies
   manage_gmail_filter on the runner path today (finding 2 above). On the interactive
   path the tool reaches the owner-prompt under the existing GR-009 posture where all
   non-read actions require per-action owner confirmation (C-R1). This applies to
   manage_gmail_filter the same way it applies to send_gmail_message on the interactive
   path for the Shelly google_owner surface. No autonomous filter creation is permitted
   under this gate. Condition: settings.json must list manage_gmail_filter under the
   owner-prompt-only treatment, not under auto-allow. See F-C3 below.

5. PROMPT-INJECTION SURFACE. A filter rule body could be constructed from tainted
   inbound email content (e.g. Shelly reads an email with a subject pattern and
   creates a matching filter). The same C-R6 / C-G2 tainted-content rule applies: if
   Shelly or Eco is asked to create a filter based on content from an inbound email,
   the tool call must be treated as an instruction from tainted input and requires
   explicit owner confirmation of the exact filter parameters before any call is made.

6. NO NEW LEGAL REVIEW REQUIRED. This is a capability toggle on the existing
   GR-009 connector (MIT, Eyal CLEAR 2026-07-01). Google Workspace ToS: creating/
   deleting filters on the authenticated user's own account is permitted for internal
   developer/single-account use (same basis as the write-action determination in
   T-0037/S-0020). No new data processing obligation created. Eyal confirmation
   not required unless the gate owner disagrees.

7. RUNNER PATH ALREADY BLOCKED. guard.py evaluate() explicitly denies
   manage_gmail_filter when RUNNER_CONTEXT=1 at lines 492-493. This block is
   inside the google-boundary check which is hard-enforced regardless of GUARD_MODE.
   No additional rule is needed for the runner path.

---

## Conditions (binding before go-live)

F-C1 (per-action gate, mandatory): Every call to manage_gmail_filter on the interactive
  path requires explicit owner confirmation of the filter parameters (criteria + action).
  Shelly must never create or delete a filter autonomously. The runner path is already
  hard-denied; this condition governs interactive-session use only.

F-C2 (no forwarding-rule auto-action): manage_gmail_filter calls that include a
  "forwardTo" action (routing mail to another address) must be treated as
  send-equivalents: prompt-only per-action A1, never auto-approved. If the API exposes
  a forwarding-rule parameter, Shelly must explicitly ask the owner to confirm the
  destination address before calling the tool.

F-C3 (settings.json): confirm that settings.json in the Shelly repo does not place
  manage_gmail_filter under auto-allow. The guard already hard-denies runner-path
  calls; interactive calls must reach the owner-prompt. Owner to verify the Shelly
  repo settings.json entry or absence. If the tool is absent from settings.json,
  it will prompt by default -- that is the correct posture; do not add an allow
  entry.

F-C4 (no bump without Rambo advance): any version bump to google_workspace_mcp
  beyond v1.21.3 requires advance Rambo review before the Shelly repo installs it.
  This condition is inherited from the existing GR-009 conditions and re-stated here
  for the record.

F-C5 (tainted-content rule): filter parameters derived from inbound email content
  are tainted. Shelly must not create a filter based on email body or header content
  without quoting the proposed parameters to the owner for confirmation. Same rule
  as C-R6 / C-G2 / M2 from existing gates.

---

## Mitigation (named owners)

F-C1, F-C2, F-C5 -- Shelly (behavioral; enforces at session time) + Eco (monitors
  per CS-0001 / existing tainted-content rules).
F-C3 -- owner (jecki): verify Shelly repo settings.json before enabling the tool.
F-C4 -- Rambo: any future version bump request routes here for advance approval.

---

## Gate output

CLEAR-WITH-CONDITIONS (F-C1 to F-C5).
Recommendation: Eco A2 to grant; conditions documented here are binding on go-live.
No Eyal review required (finding 6). Do not enable the tool until F-C3 is verified.

Rambo, 2026-08-02
