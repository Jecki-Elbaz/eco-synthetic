# Gate Review -- T-0046: Gmail Filter Management Tool (GR-009 Scope Add)

Reviewer: Eyal (Legal)
Date: 2026-08-02
Task: T-0046
Gate type: GR-009 scope addition -- manage_gmail_filter on google_owner connector
Verdict: CLEAR-WITH-CONDITIONS

---

## What is being reviewed

Adding manage_gmail_filter (create + delete, NO forwarding rules) to the google_owner
connector (taylorwilsdon/google_workspace_mcp, pinned workspace-mcp==1.21.3,
commit f974a126d12f56af1b878b4cd3e039f0982af138) for jecki.elbaz@gmail.com via the
owner-creds credential store in the Shelly repo. This is a scope addition to the
already-gated GR-009 connector -- not a new tool, not a new vendor, not a new account.

Source: Shelly gate request 2026-07-12
(shared/handoff/shelly-outbox/gate-request-owner-gmail-filter-tool-2026-07-12.md).
Owner A1 on record 2026-07-12 (pre-gate for the tool class).
Security review: Rambo, filed separately (parallel review 2026-08-02).
See company/security/reports/ for the Rambo leg.

---

## Terms reviewed

1. Software license -- taylorwilsdon/google_workspace_mcp: MIT.
   Already cleared at GR-009 base row (Eyal, 2026-07-01). No new software, no new
   license terms. No re-review needed. CLEAR.

2. Google API Terms of Service / Google API Services User Data Policy.
   Cleared at GR-009 base row (Eyal, 2026-07-01) for "internal single-account use
   where the human account holder controls all write actions." Gmail filter management
   is a scope addition within the same ToS framework. Analyzed below.

3. Israeli Privacy Protection Law (PPL 5741-1981, Amendment 13).
   Existing GR-009 conditions (no raw content in tracked files, bounded queries,
   tainted-content rule) apply without modification. Analyzed below.

4. Compliance-backlog Item 6 / C-E4 (Anthropic DPA): assessed below.
   Does NOT block this gate for the reasons stated.

---

## Analysis

### A. Software license and connector terms

No change from GR-009 base. MIT license confirmed 2026-07-01. No new vendor, no new
account, no new terms relationship. CLEAR.

### B. Google API ToS -- filter management scope

The GR-009 base determination (Eyal, 2026-07-01) cleared Google Workspace ToS for
internal single-account use of the authenticated account holder's own data, including
write operations where the human account holder controls each action. Gmail filter
management (create/delete via the Gmail Settings API) is a write action on the
authenticated account holder's own mailbox settings.

Filter management does not expose data to third parties and does not trigger Google's
OAuth app-review requirement for internal developer single-account use. The gmail.settings
or gmail.settings.basic OAuth scope governs filter operations; this is within the same
framework cleared for the broader gmail scope in the 2026-07-01 determination.

Knowledge basis: verified Eyal knowledge of Google API Terms of Service and Google API
Services User Data Policy through August 2025. Live fetch not performed in this session.
Same caveat as the 2026-07-01 base determination applies. The filter management question
is narrower than the send scope already cleared; the determination does not change.

CLEAR.

### C. Israeli PPL and data considerations

A Gmail filter rule is a server-side account-configuration item. Creating or deleting a
filter does not cause personal data to be transmitted to a third party, does not store
data in tracked files, and does not route data through a new processing pipeline. The
existing GR-009 and GR-014 conditions (no raw content in tracked files, bounded queries,
tainted-content rule) continue to govern any email reading that precedes or informs
filter design.

One nuance: if Shelly analyzes incoming email content to propose filter criteria (for
example, identifying frequent senders from email headers or bodies), that analysis step
involves LLM processing of email data and is subject to the GR-014 conditions (and C-E4
where applicable). That is a separate gate question from the filter management API call
itself. The manage_gmail_filter tool -- the create/delete call to Gmail -- does not itself
trigger a new data processing obligation.

No new PPL obligation arises from adding this API call. CLEAR.

### D. Compliance-backlog Item 6 / C-E4 assessment

C-E4 concerns LLM processing of third-party personal data before the Anthropic DPA is
executed. Filter creation and deletion are Gmail API calls -- they do not route data
through the LLM. The LLM may be involved in proposing filter criteria if Shelly reads
email content to identify patterns, but that email-reading step is already governed by
GR-014 conditions and C-E4 as recorded there.

The filter management tool itself does not create a new C-E4 exposure beyond what GR-014
already covers.

CONCLUSION: C-E4 does NOT block this gate. The manage_gmail_filter capability is
cleared on the terms and legal dimension. Any LLM-analysis step used to derive filter
criteria remains subject to GR-014 and C-E4 as already in force.

### E. Forwarding rules -- hard exclusion

Mail forwarding to an external address creates a persistent automated data flow to a
third party without per-action owner consent on each forwarded message. This is not merely
a security concern -- it raises a direct legal issue. Under Israeli PPL 5741-1981,
automated transfer of personal data (email content may contain personal data of third
parties) to another party requires a legal basis (consent, contract, or legitimate
interest) and proportionality. An automatically-triggered forwarding rule that operates
without per-message owner approval may lack an adequate basis.

Additionally, Google API Terms of Service include obligations around how data obtained
via API is used; an automated forwarding rule to a third-party address could create
obligations that the internal-use analysis does not cover.

Forwarding-rule tools MUST remain excluded from scope. This is a legal condition, not
merely a security preference.

---

## Verdict: CLEAR-WITH-CONDITIONS

Legal terms and obligations: CLEAR, subject to the conditions below.

This is a scope addition to an already-cleared connector (GR-009, MIT license, Google API
ToS for internal single-account use). No new terms, no new vendor, no new DPA obligation.
C-E4 does not block the filter management tool itself.

IMPORTANT: This verdict covers the Eyal (Legal) leg only. It does NOT authorize
installation. Rambo security review (parallel, filed separately in company/security/reports/)
and owner A1 at install are both still required. Eyal clearing terms is one of two
gate legs; it does not constitute the full gate.

---

## Conditions (binding on Eyal leg)

C-TF1 (HARD): No forwarding-rule tools. Scope is strictly limited to filter create and
   filter delete. Permitted filter actions: apply label, mark important, mark read,
   skip inbox, archive, move to Trash. No forwarding to any external address via the
   filter tool. This exclusion is a legal requirement (third-party data transfer without
   adequate legal basis under PPL) in addition to a security control.

C-TF2: Filter creation = per-action owner approval. Shelly proposes exact filter
   criteria; owner confirms; Shelly creates. This is an application of the existing
   GR-009 C-R1 requirement (every non-read action requires explicit per-action owner
   approval in-session) to the filter management tool. No autonomous filter creation
   without owner instruction in the same session.

C-TF3: Filter deletion = per-action owner approval. Deleting a standing filter has
   persistent mailbox effects (future mail no longer routed by that rule). Same
   per-action gate as C-TF2.

C-TF4: Scope = jecki.elbaz@gmail.com via google_owner connector (owner-creds) only.
   No change to the google_workspace connector or any shelly.synthetic.org scope.
   GR-009 C-R3 stands: no action on jecki.elbaz@gmail.com without separate per-action
   owner approval. This gate IS that per-action approval for filter management; it
   does not open any other scope on the owner account.

C-TF5: Any LLM analysis step Shelly performs to propose filter criteria (using email
   content to identify candidate filter patterns) remains subject to GR-014 conditions
   and C-E4 residual as already in force. This gate does not expand email-reading or
   analysis permissions. The filter management API call and the email-analysis step
   that may precede it are legally distinct.

---

## Note on gate-register update

This verdict is being entered as a GR-009 addendum (2026-08-02) in
company/governance/gate-register.md, following the same pattern as the 2026-07-09,
2026-07-10, and 2026-07-26 addendums. The Rambo column for this scope add is noted
as "filed separately, see company/security/reports/ (parallel review, 2026-08-02)."

Full legal findings: this file.
Eyal sign-off date: 2026-08-02
