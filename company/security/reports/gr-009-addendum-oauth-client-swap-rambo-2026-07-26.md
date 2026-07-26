# GR-009 addendum -- OAuth client swap (T-0042) -- Rambo security leg -- 2026-07-26

Verdict: CLEAR-WITH-CONDITIONS

Target: GR-009 (google_workspace MCP server, eco-synthetic project, account
eco.synthetic.org@gmail.com). Change under review: OAuth client swap from the shared
"Shelly" client (GCP project shelly-pa, different Google account) to a new dedicated
Desktop-app client "Eco-Synthetic" (GCP project EcoSynthetic, id ecosynthetic, owned by
eco.synthetic.org@gmail.com), published to "In production" before consent.

Files read this session: company/governance/gate-register.md (GR-009 base row + both prior
addenda, 2026-07-09 and 2026-07-10, plus GR-012/GR-014), company/governance/security-baseline.md,
CLAUDE.md (project), .mcp.json, .claude/settings.json, .claude/hooks/guard.py,
integrations/runner/t-0042-browser-prompt-2026-07-26.md, company/decisions/decisions-log.md
(2026-07-26 T-0042 entry). No new tool, no version bump: workspace-mcp stays pinned at 1.21.3.

## Findings

F1. Credential-store isolation -- CONFIRMED UNCHANGED, no gap opened.
.mcp.json still pins WORKSPACE_MCP_CREDENTIALS_DIR to
C:\Users\Jecki\.google_workspace_mcp\eco-creds. guard.py's account-boundary hard-pin
(ECO_GOOGLE_ACCOUNT = eco.synthetic.org@gmail.com, guard.py lines 221-226 and 310-325) keys
off user_google_email at call time, not off which OAuth client minted the token. The swap is
therefore invisible to that control and does not weaken it. Verified by reading guard.py
directly this session -- no client-ID reference exists anywhere in the guard logic.

F2. Blast-radius reduction (net positive). The old "Shelly" client was a machine-wide shared
OAuth client registration living in a different GCP project under a different Google account --
shared client-level infrastructure, not just a shared token. A compromise or misconfiguration of
that client registration (e.g. someone widening its scopes or redirect URIs in the Shelly
project) could have affected every identity consenting through it. The new client is dedicated:
one GCP project, one owning account, one purpose. This closes a cross-identity blast-radius path
that existed structurally, not just operationally.

F3. "In production" publish -- resolves SHIR-008 as claimed, with one tradeoff to record.
Testing-status apps cap refresh tokens at ~7 days; that forced re-consent was the SHIR-008
breakage. Production status removes that expiry, so a stolen/leaked token now has a longer
usable window before Google would force re-auth (there is no more automatic 7-day cutoff).
Given credential-store isolation (F1) and the account hard-pin are still the controlling
mitigations regardless of token lifetime, this tradeoff is acceptable for a single-owner
internal app. Record for the file: the app is published but NOT Google-verified (publish and
verification are different processes) -- an unverified production app requesting
sensitive/restricted scopes (gmail, calendar, drive) can show an "unverified app" warning and,
at higher usage volumes or if Google's abuse detection flags automated-looking traffic, can be
throttled or require verification. Low likelihood at current single-account internal use; not a
blocker, but a standing watch item.

F4. Old machine-wide GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET env vars still exist,
still pointed at the Shelly client -- confirmed no live reference risk to eco-synthetic today.
Read .mcp.json in full this session: the eco-synthetic google_workspace server entry now
resolves ONLY ${ECO_GOOGLE_OAUTH_CLIENT_ID} / ${ECO_GOOGLE_OAUTH_CLIENT_SECRET}. Grepped the
project for GOOGLE_OAUTH_CLIENT_ID / _SECRET: the only hits are the ECO_-prefixed strings in
.mcp.json, the T-0042 runbook/prompt docs and decisions-log describing this change, and
company/customers/shelly/standalone-setup-B2.md -- that last file is the separate Shelly repo's
own setup doc and correctly still names the bare vars for its own (different) server; it is out
of this project's scope and unaffected. Residual risk: nothing today ENFORCES that .mcp.json
keeps using the ECO_-prefixed names -- a future edit, revert, or copy-paste from an older doc
could silently reintroduce the bare names, which would silently authenticate through the old
shared Shelly client with no error surfaced. This is a silent-regression risk, not a live gap.

F5. Old grant revocation -- risk reduction, record positively. The revoked "Shelly" app grant on
the eco account carried Gmail send scopes ("read, compose and send emails", "manage drafts and
send emails", +10 more). Nothing in the current architecture needed send capability on that
grant (send_gmail_message is prompt-only / runner-denied by design). Revoking it closed a
standing send-capable path that was pure unused risk.

F6. eco-synthetic-audit-mid-summary.pptx sitting inside the credential-store directory
(eco-creds/) is a hygiene finding, not a credential leak by itself, and I have NOT independently
verified it -- per red line 4 (never access .env or credential files), I did not list, open, or
otherwise access the eco-creds directory this session. This finding is taken as reported fact
from Eco's decisions-log entry, not confirmed first-hand by Rambo. Risk if true: a
credential-store directory is a privileged, isolated location by design; any non-credential
material inside it invites future mishandling -- e.g. someone backs up or shares "that pptx from
eco-creds" and inadvertently carries the token file along in the same operation, or a future
write into that directory collides with the token filename. The mechanism (a Drive download
apparently landing in the token folder) also suggests something is treating that path as a
general-purpose download target, which should not happen.

## Recommended mitigation / solution

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|---------------|-----------------|------------------|-------------------|
| F3: unverified production app, no more 7-day token cutoff | Rambo | No new action needed now -- F1's credential isolation + account hard-pin remain the controlling mitigations regardless of token lifetime. | jecki (A1) | If usage ever needs Google's verification bar (scope expansion, higher volume, or a Google warning appears), submit the app for Google OAuth verification review. Rambo to re-flag at next weekly drift scan if the "unverified app" state persists past a growth trigger. |
| F4: silent fallback to bare/old client env vars if .mcp.json regresses | Rambo (documented here) | This addendum records the exact required var names (ECO_GOOGLE_OAUTH_CLIENT_ID / ECO_GOOGLE_OAUTH_CLIENT_SECRET) as the only correct reference for eco-synthetic's .mcp.json. | Shir (DevOps) | Add a loud pre-flight/guard check that fails if the resolved google_workspace env vars are the bare (un-prefixed) names instead of the ECO_-prefixed ones. Rambo's weekly permission-drift scan to cover this going forward (extends the existing .mcp.json pin check from the 2026-07-10 GR-009 addendum). |
| F6: non-credential file (.pptx) inside eco-creds/ | Shir or jecki | Move the file out of eco-creds/ to its correct location; do not delete without confirming it is not needed elsewhere. Rambo will not touch the credential directory (red line 4). | Rambo | Extend the weekly permission-drift scan's existing credential-store-directory check (GR-009 2026-07-10 addendum: "unexpected token files = drift") to also flag ANY non-token file found in a credential-store directory, not only unexpected token files. |
| F2, F5: blast-radius reduction, send-grant revocation | -- | No mitigation needed -- these are risk reductions. Recorded for the register only. | -- | -- |

## Conditions (Rambo, binding on this addendum)

- C1: Owner/Shir confirm no other eco-synthetic config or script references the bare
  GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET names; implement the F4 permanent
  guard-rail check at Shir's next availability.
- C2: Move eco-synthetic-audit-mid-summary.pptx out of eco-creds/ (owner or Shir). Rambo does
  not access the credential directory to verify this directly (red line 4) -- confirm by Shir
  or owner statement, or by the file's absence from a future decisions-log/board note.
- C3: Rambo's weekly permission-drift scan (security-baseline.md scan log) to add the
  non-credential-file check described in F6's permanent mitigation.
- C4: Standing no-auto-update rule continues to apply: workspace-mcp stays pinned at 1.21.3;
  no version bump or client-credential change ships without Rambo advance review.
- C5 (informational, not blocking): guard.py's Google-boundary block (ECO_GOOGLE_ACCOUNT pin,
  RUNNER_CONTEXT send-deny) was read and confirmed unmodified by this swap. guard.py itself is
  not on the RED_EXACT protected-path list in its own logic -- unlike .claude/settings.json,
  an edit to guard.py's Google-boundary constants is not structurally blocked pending owner
  review. This is a pre-existing gap outside T-0042's scope; flagging for a future guard-hardening
  pass, not a condition on this addendum.

None of C1-C5 block the change already in production use (per decisions-log, the new client is
live and verified working via a fresh token file). This is CLEAR-WITH-CONDITIONS, not FLAG-BLOCKED:
every finding above has a viable mitigation (security-baseline.md standing standard, effective
2026-06-15).

## Proposed gate-register.md text (Rambo leg -- do not apply; Eyal leg pending, Eco/owner to merge)

Proposed new section, appended after the existing "GR-009 addendum -- 2026-07-10" entry (line
~432 of gate-register.md at time of writing), in the same append-only addendum style:

```
## GR-009 addendum -- 2026-07-26 (T-0042: dedicated OAuth client swap, Shelly -> Eco-Synthetic)

Appended, not edited. Same pinned server (workspace-mcp==1.21.3); NO version bump; this
addendum records an OAuth-client identity change plus a publishing-status change on the
existing eco-synthetic google_workspace gate.

**What changed.** Eco's google_workspace server (eco.synthetic.org@gmail.com) now
authenticates via a new dedicated Desktop-app OAuth client "Eco-Synthetic" (GCP project
EcoSynthetic, id ecosynthetic, owned by eco.synthetic.org@gmail.com), replacing the prior
shared "Shelly" client (GCP project shelly-pa, different Google account). Credentials come
from ECO_GOOGLE_OAUTH_CLIENT_ID / ECO_GOOGLE_OAUTH_CLIENT_SECRET (.mcp.json rewired
accordingly). The new client was published to "In production" in the GCP console BEFORE
consent, closing SHIR-008 (the ~7-day Testing-status refresh-token expiry). The eco account's
third-party grant to the old "Shelly" app was revoked (that grant had carried Gmail send
scopes nothing in this architecture needed).

**Unchanged.** workspace-mcp pin (1.21.3), WORKSPACE_MCP_CREDENTIALS_DIR (eco-creds,
per-identity isolated per the 2026-07-10 addendum), guard.py's ECO_GOOGLE_ACCOUNT hard-pin
and runner-path send-deny (both key off account email, not client identity, so unaffected),
send_gmail_message posture (prompt-only interactive, auto-denied on runner/bridge paths).

**Rambo verdict:** CLEAR-WITH-CONDITIONS. Net risk reduction (dedicated single-project client
replaces a cross-identity shared client; unneeded send-capable grant revoked). Conditions
C1-C5: (C1) confirm/guard against any config regressing to the bare GOOGLE_OAUTH_CLIENT_ID/
SECRET names (Shir); (C2) move the misplaced eco-synthetic-audit-mid-summary.pptx out of
eco-creds/ (Shir/owner; Rambo does not access the credential directory, red line 4); (C3)
weekly permission-drift scan extended to flag any non-token file in a credential-store
directory; (C4) standing no-auto-update / re-pin-on-change rule continues to apply; (C5)
informational -- guard.py's Google-boundary block is not itself Red-path protected, flagged
for a future hardening pass, not blocking. Full findings:
company/security/reports/gr-009-addendum-oauth-client-swap-rambo-2026-07-26.md.

**Eyal verdict:** [PENDING -- Eyal's parallel legal leg, company/legal/inbox-triage-rescope-
privacy-eyal-2026-07-26.md naming convention expected at
company/legal/gr-009-oauth-client-swap-eyal-2026-07-26.md or similar -- insert Eyal's exact
verdict text here before this addendum is applied.]

**Opened by:** Eco/owner (T-0042) | **Date:** 2026-07-26 | **Applied by:** [pending -- Eco to
apply once both legs land]
```

Do not apply this text to gate-register.md yet -- Eyal's legal leg is running in parallel and
the combined addendum should be applied once, after both verdicts are in hand (owner
instruction, this task).
