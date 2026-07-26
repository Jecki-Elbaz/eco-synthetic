# GR-009 Addendum -- OAuth Client Swap Legal Leg
## Eco-Synthetic google_workspace connector: "Shelly" client -> dedicated "Eco-Synthetic" client

**Date:** 2026-07-26
**Reviewer:** Eyal (Legal, L3)
**Tasked by:** Eco/owner (jecki), in-session, T-0042
**Companion:** Rambo security leg (parallel; combined addendum applied to gate-register after both legs land -- I am NOT editing gate-register.md in this run per instruction)
**Sources read this session:** company/governance/gate-register.md (full file, GR-009 base row + both 2026-07-09 and 2026-07-10 addenda, GR-012, GR-014); company/governance/compliance-backlog.md (Item 6, Item 3); CLAUDE.md Google Workspace Access RESTRUCTURED section + Gmail READ rules section; company/governance/gate-gmail-readonly-eyal-2026-07-10.md; memory/board.md T-0042 row (full history); integrations/runner/t-0042-browser-prompt-2026-07-26.md; .mcp.json (current state, no secrets read).

---

## What changed (verified from board T-0042 + .mcp.json, 2026-07-26)

Same pinned server, no version bump: `workspace-mcp==1.21.3`, same `WORKSPACE_MCP_CREDENTIALS_DIR` (`C:\Users\Jecki\.google_workspace_mcp\eco-creds`), same tool scope family (`gmail calendar drive`), same send posture (no autonomous send -- unchanged). `.mcp.json` confirmed rewired to `${ECO_GOOGLE_OAUTH_CLIENT_ID}` / `${ECO_GOOGLE_OAUTH_CLIENT_SECRET}` env var names, matching the runbook.

OAuth client identity changed: from a client named "Shelly" (shared, GCP project `shelly-pa`, a different Google-account identity from eco.synthetic.org) to a new Desktop-app client "Eco-Synthetic" in GCP project `ecosynthetic`, owned by eco.synthetic.org@gmail.com. Consent screen: app name "Eco-Synthetic", user type EXTERNAL, support/contact = eco.synthetic.org@gmail.com, "Google API Services: User Data Policy" checkbox accepted. Published to "In production" (was effectively Testing before). Unverified -- shows the Google warning interstitial. Single user (the company's own account; 0/100 unverified-app cap). Old "Shelly" grant on the eco account revoked -- that grant held Gmail send scopes plus 10 more.

Per the T-0042 runbook (read in full): every sensitive click -- Create project, Enable API, Save/Submit on the consent screen, Publish to production, the final OAuth "Allow" -- was reserved for the owner's own hand ("NEVER click a final Allow/consent grant... NEVER click Publish... STOP; tell me exactly what to click; wait for me to confirm"). The agent never read or captured the client secret or any token value. This matters directly to my role: accepting Google's terms/policy checkbox and publishing the app are red-line-11-type actions (committing the company externally); the record shows the owner did them personally, not an agent on the company's behalf without A1.

---

## Q1 -- Does the self-owned OAuth client change any terms/DPA/data-processing obligation vs. the prior arrangement?

**Answer: neutral-to-positive. No new DPA. No new vendor. Genuine improvement in data-controller/accountability clarity.**

Reasoning:
- Google is the API vendor/processor of eco's Gmail/Calendar/Drive data in BOTH the old and new arrangement. An OAuth client registration is an authentication/authorization construct inside Google's ecosystem, not a separate data processor. Swapping which GCP project + client ID mediates the login does not change who processes the mail (Google, under the Google Workspace/API Terms and API Services User Data Policy already analyzed and cleared at GR-009 base row, 2026-07-01/07-08). No new DPA is created or required by this swap alone.
- What DOES change: who is the developer-of-record that accepted Google's "API Services User Data Policy" and Limited Use requirements FOR THE CLIENT touching eco's mailbox. Previously that acceptance sat under a different Google-account identity's GCP project ("shelly-pa" / client "Shelly"). That is not a new legal violation in itself (Shelly-side infrastructure is owner-adjacent, and GR-009's Eyal review already covered the underlying Google Workspace ToS for internal single-account use across this whole family of connectors), but it left an open question of exactly which identity was accountable to Google for policy compliance on eco's own data. The swap resolves that ambiguity: the developer-of-record for the client that touches eco.synthetic.org@gmail.com's mail is now a GCP project owned by that same account. This is a real improvement in data-controller clarity, not a cosmetic one.
- Scope reduction as a side effect: the revoked "Shelly" grant held Gmail send scopes plus 10 more on the eco mailbox. That was excess relative to this project's own stated posture ("FULL ACCESS EXCEPT SEND", CLAUDE.md Google Workspace Access section) and relative to Google's own least-privilege guidance (request only the scopes you need). Revoking it is a data-minimization improvement under PPL and under Google policy, not a new obligation -- it closes a standing excess-scope grant that should not have existed.
- No new PPL processing purpose is introduced. The existing CLAUDE.md rules (bounded queries, no raw content in tracked files, tainted-input treatment of inbound mail, GR-012/GR-014 conditions) all continue to apply unchanged -- this is a plumbing change to authentication, not a change to what data is read, why, or where it goes.

## Q2 -- Testing -> "In production" while UNVERIFIED: any new obligation or exposure?

**Answer: no new obligation triggered today; standing, low, and already-bounded risk; one item I could not close live (see gap below).**

What I can state with confidence:
- Google requires OAuth verification for apps requesting sensitive or restricted scopes before they can be used without restriction. I confirmed this live: "Apps that request access to scopes categorized as sensitive or restricted must complete Google's OAuth app verification before being granted access" (support.google.com/cloud/answer/13463073, fetched 2026-07-26).
- Unverified apps are not blocked outright -- they show a warning interstitial ("Google hasn't verified this app") and are subject to a cumulative cap: I confirmed live that unverified apps face "100 new users in total, after the app presents the unverified app screen" (support.google.com/cloud/answer/7454865, fetched 2026-07-26). This app has exactly one user (the company's own account) -- 1 of 100. There is no verification-submission requirement triggered by scale here, and none is triggered merely by moving publishing status from Testing to In production.
- Publishing to "In production" is what the owner needed to fix the SHIR-008 root cause (7-day forced refresh-token expiry that applies to apps left in Testing status). That specific token-expiry mechanic is this company's own confirmed engineering history (documented in CLAUDE.md's SHIR-008 note and the board T-0042 row), not something I re-derived from today's live fetch -- my fetch attempts on this specific point returned partial page excerpts that did not directly confirm the Testing-vs-Production token-expiry distinction (see gap below). I have no reason to doubt the company's own operational record, but I flag that I am relying on it rather than an independent live confirmation of that specific mechanic.
- The "Google API Services: User Data Policy" checkbox the owner accepted during setup is Google's standing developer policy (Limited Use: no advertising use of the data, no sale of user data, use limited to providing the app's own user-facing features, restrictions on human review). This is not a new, separately negotiated contract -- it is the same standing developer obligation that already applied to any OAuth client touching these APIs. Formalizing it under the company's own GCP project is consistent with, not a departure from, the GR-009 (2026-07-01) determination that internal single-account use is a permitted use under Google's terms.
- Publishing + remaining unverified, at 1 user, does not by itself create a fresh Google-policy violation or a new legal exposure today.

**Gap I could not close via live fetch (say so plainly, not a guess):** I attempted three WebFetch calls (support.google.com/cloud/answer/13463073, /9110914, /7454865) to pull Google's full "when is verification not needed" exemption-category list and the exact Testing-vs-Production token-lifetime mechanic. Each returned only partial page content (the tool summarized navigation/overview text, not the full linked sub-articles). I was able to confirm the two quoted facts above live; I could NOT independently confirm from a live source (a) the precise exemption-category list, or (b) the specific 7-day Testing-token-expiry rule. My conclusion on (b) rests on this company's own prior engineering observation (SHIR-008), not a fresh independent verification. If the owner wants this closed with a fresh independent source, a follow-up fetch of the specific linked sub-pages, or a direct read of the Google Cloud console's own verification-status messaging, would close it. I do not believe this gap changes today's determination, given the 1-user/100-cap fact I did confirm live.

**Forward-looking exposure to flag, not a current defect:** if this OAuth client is ever used for any Google account other than eco.synthetic.org@gmail.com, or if Google narrows its unverified-app tolerance, verification could become mandatory before further consents are possible. Not a live risk at 1 of 100 users; worth a standing note so a future scope-expansion request re-triggers this check rather than assuming today's clearance travels forward indefinitely.

## Q3 -- Interaction with compliance Item 6 (Anthropic DPA residual, C-E4)?

**Answer: none. This is a Google-side authentication change; Item 6 is an Anthropic-side data-processing gap. Zero overlap.**

The OAuth client swap changes how eco.synthetic.org authenticates to Google's APIs. It does not touch what mail/calendar/Drive content is read, summarized, or passed into an LLM call, and it does not touch Anthropic's processing terms in any way. Compliance-backlog Item 6 (Anthropic DPA formal execution, still OPEN per the 2026-07-20 review log) and its C-E4 residual (owner-accepted risk for the Adam business thread only, per gate-gmail-readonly-eyal-2026-07-10.md) remain exactly as they stood before this swap -- unresolved, and still the gating condition on any LLM body-content read beyond that one accepted exception. Nothing in today's change widens or narrows that gap.

---

## Verdict

**CLEAR-WITH-CONDITIONS.**

No new terms, no new DPA, no new vendor, no new data-processing purpose. Net effect on data-controller/accountability clarity is positive (developer-of-record now matches the account whose data is being accessed; an excess send-capable grant was revoked). Publishing to production while unverified, at 1 user against a 100-user cap, does not trigger a Google verification obligation today. All standing PPL/CLAUDE.md conditions on this connector (GR-009, GR-012, GR-014) carry forward unchanged and remain binding.

### Conditions

- **C-OA1 (no re-litigation needed).** This swap does not require re-opening the GR-009 base-row Google Workspace ToS / API Services User Data Policy determination (Eyal, 2026-07-01/07-08) -- that determination covers vendor, scope family, and internal-single-account-use posture, all unchanged here. Future OAuth-client-identity swaps on the SAME vendor/scope/posture do not need a fresh full legal review either; a short confirmation note (like this one) suffices.
- **C-OA2 (standing conditions unchanged).** GR-014 M1-M6/C-E1-C-E5 (bounded queries, tainted-input, no raw content in tracked files, C-E3 hard stop, C-E5 no autonomous polling), GR-012 C-G1-C-G6 (draft-only, tainted-input, no customer drafts pre-CS-0001, no raw content, no version bump without Rambo, Adam owner-relay-only), and the compliance-backlog Item 6/C-E4 residual all remain binding, unaffected by the OAuth client identity.
- **C-OA3 (privacy-policy URL -- confirm, not blocking).** Confirm whether Google's consent-screen setup required or received a privacy-policy URL for "Eco-Synthetic." If a URL was entered, confirm it does not overstate the company's current public privacy posture -- compliance-backlog Item 3's privacy notice is drafted (DPA template v0.1-DRAFT) but not yet owner-A1-approved or published. If no URL was required (plausible for an unverified single-user External app requesting Gmail/Calendar/Drive without submitting for review), no action needed -- just confirm which case applies so the record is accurate.
- **C-OA4 (verification-trigger watch, forward-looking).** No verification submission required today (1 of 100 unverified-app users, no third-party end users). Re-open this item before granting this OAuth client access to any Google account other than eco.synthetic.org@gmail.com, or if Google's own unverified-app tolerance changes.
- **C-OA5 (documented gap).** Google's full "verification not required" exemption list and the precise Testing-vs-Production refresh-token-expiry mechanic were not fully retrievable via WebFetch this session (partial page content only, three attempts, sources cited above). My Testing-token-expiry conclusion relies on this company's own SHIR-008 engineering record, not an independent live confirmation of that specific point. Flagged per NO GUESS; does not change today's verdict given the 1-user/100-cap fact I did confirm live.

### Positive compliance notes for the record

- The owner personally performed every terms-acceptance and publish action (Create, Enable, Save/Submit, Publish, final Allow) per the T-0042 runbook's hard rules; the agent never clicked a consent/terms-acceptance control and never read or logged the client secret or any token. This satisfies the A1 requirement for accepting external terms on the company's behalf (red line 11 / CLAUDE.md item 7) and the credential-access prohibition (red line 1 / CLAUDE.md item 1).
- Revoking the old "Shelly" grant's excess Gmail send scope on the eco mailbox is a data-minimization improvement, consistent with PPL proportionality and this project's own "FULL ACCESS EXCEPT SEND" posture.

---

## Exact wording to carry into the GR-009 row (for whoever applies the combined addendum after Rambo's leg lands)

> **GR-009 addendum -- 2026-07-26 (T-0042, OAuth client swap).** Eyal (Legal): CLEAR-WITH-CONDITIONS. Swapping the google_workspace connector's OAuth client from the shared "Shelly" client (GCP project shelly-pa, different Google-account identity) to a dedicated "Eco-Synthetic" client (GCP project ecosynthetic, owned by eco.synthetic.org@gmail.com) creates no new DPA, no new vendor, and no new data-processing obligation -- Google remains the processor of Gmail/Calendar/Drive data under the same Google Workspace/API Terms and User Data Policy already cleared at this row's base determination (2026-07-01/07-08). Net effect is a data-controller/accountability improvement: the developer-of-record accepting Google's User Data Policy for the client touching eco's mailbox is now the company's own account, and the swap revoked an excess Gmail-send-capable grant on the old client. Publishing the new client to "In production" while UNVERIFIED (EXTERNAL user type, 1 of 100 unverified-app users) triggers no Google verification obligation today; standing watch item C-OA4 applies if this client is ever used for any account beyond eco.synthetic.org@gmail.com. All prior binding conditions (GR-009 base, GR-012 C-G1-C-G6, GR-014 M1-M6/C-E1-C-E5, compliance-backlog Item 6/C-E4 residual) carry forward unchanged. Full analysis: company/legal/gr-009-addendum-oauth-client-swap-eyal-2026-07-26.md. Conditions C-OA1 through C-OA5 in that file are binding; C-OA3 (privacy-policy URL confirm) is the only near-term open action, non-blocking.

**Eyal (Legal) -- 2026-07-26**
