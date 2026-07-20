# Gmail OAuth Durability Runbook
Shir (DevOps) | 2026-07-18 | SHIR-008 | P1
Tasked by Eco (CEO, git/hygiene exception line); approved via SHIR-008 board row.

---

## Background

Google OAuth apps left in TESTING publishing status expire refresh tokens after 7 days.
The eco.synthetic.org@gmail.com consent was completed approximately 2026-07-11.
Exactly 7 days later (2026-07-18) the refresh token expired globally -- interactive AND
runner sessions both returned ACTION-REQUIRED re-auth on any workspace-mcp Gmail call.
This is a deterministic recurrence: without the production-status fix, every re-consent
produces a token that dies 7 days later.

The runner cmdline outage (ECO-CMDLINE-FIX 2026-07-18) is a separate, already-fixed issue
that had been masking auth failures as silent rc=1 exits. After that fix, auth failures now
surface as loud Telegram FAIL alerts -- so recurrence will be visible, not silent.

---

## Step 1 -- Verify publishing status (owner, GCP console)

1. Open https://console.cloud.google.com/
2. Select the GCP project that owns client ID 1059174563167-vod... (the owner knows it).
3. Left nav: APIs & Services -> OAuth consent screen.
4. Look for the Publishing status field near the top of the page.
   - Value will be "Testing" or "In production".
5. If it says "Testing", the 7-day expiry is confirmed as the root cause. Proceed to Step 2.
6. If it already says "In production", the root cause was something else (rare; escalate to
   Shir with a screenshot of the status before doing anything).

Expected result here: "Testing" -- consistent with the 07-11 consent and 07-18 expiry.

---

## Step 2 -- Durable fix: switch to In production (owner, GCP console)

While on the OAuth consent screen (same page as Step 1):

1. Click the "Publish app" button (or "Move to production", exact label varies by console
   version -- it is the primary CTA adjacent to the Testing status badge).
2. Google will show a confirmation dialog warning about the "unverified app" state.
   Read the warning, then confirm / click "Confirm".
3. The Publishing status field should now read "In production".

Notes:
- This app accesses only the owner's OWN eco.synthetic.org@gmail.com account. No external
  users will ever see the unverified-app warning. The warning is shown at consent time only;
  once the owner consents, it does not affect day-to-day operation.
- No verification submission is needed. Google's verification requirement applies to apps
  requesting sensitive/restricted scopes for external users. A single-account internal tool
  (publishing status "In production", zero external users) does not trigger that requirement.
- Existing test users listed under the Testing configuration are unaffected; the scopes do
  not change.
- WHY this fixes the recurrence: Google's 7-day refresh-token expiry applies ONLY to apps
  in Testing status. In production status, refresh tokens for single-account apps do not
  have a forced 7-day expiry (they expire only on explicit revocation, password change, or
  90 days of inactivity). Switching to In production removes the weekly expiry mechanism
  entirely.

---

## Step 3 -- Re-consent (owner, once now and once after the production switch)

Two re-consents are needed:

a. NOW (interim, while app is still in Testing): restores Gmail for the current week.
   This token will expire again in 7 days. Do this first to unblock Adam-thread monitoring
   and any other Gmail use while you schedule the production switch.

b. AFTER the production switch (Step 2): this consent produces a durable token that will
   NOT expire on a 7-day schedule.

Re-consent procedure (same each time):
1. Open any Claude Code interactive session in this repo (not the runner).
2. Run any bounded Gmail tool call -- for example, ask the session to list Gmail labels for
   eco.synthetic.org@gmail.com using the workspace-mcp tool.
3. The workspace-mcp server will open a browser tab with the Google OAuth consent flow.
4. Log in as eco.synthetic.org@gmail.com and click Allow/Accept.
5. The token is written automatically to:
   C:\Users\Jecki\.google_workspace_mcp\eco-creds\
   Do NOT open, print, or log the token files -- reference the path only.
6. The browser tab will show a success/redirect page. Close it and return to the session.

If the browser tab does not open automatically, check the terminal output of the MCP server
for a URL you can copy-paste manually.

---

## Step 4 -- Verification (owner, after Step 3b re-consent)

### 4a -- Interactive session check

1. Open a Claude Code interactive session.
2. Ask the session: "List Gmail labels for eco.synthetic.org@gmail.com" (bounded call,
   uses mcp__google_workspace__list_gmail_labels or equivalent).
3. Expected: a list of label names with no auth error.
4. If you see ACTION-REQUIRED or re-auth prompt again, the consent was not saved correctly --
   re-do Step 3 and check that the eco-creds path is writable.

### 4b -- Manual runner cycle check

1. Open a terminal in the repo root (C:\Users\Jecki\DEV\projects\eco-synthetic).
2. Run:
   python integrations/runner/runner.py --mode act --only Rambo
3. Wait for the cycle to complete (Rambo:Sonnet timeout is 300s; typically finishes faster).
4. Check the last entry in memory/agent-runs.jsonl:
   - Look for the Rambo "Adam Inbox Screen" job (key contains "Adam Inbox Screen").
   - The event=done record must have rc=0.
   - The summary field must NOT contain "ACTION-REQUIRED", "re-auth", or "auth" error text.
   To grep quickly:
   python -c "import json; lines=[json.loads(l) for l in open('memory/agent-runs.jsonl')]; [print(l) for l in lines[-5:]]"
   Or from terminal:
   grep "Adam Inbox Screen" memory/agent-runs.jsonl | tail -3
5. Expected: rc=0, no auth-error substring in summary.
6. Telegram: after a successful cycle the runner will NOT send a FAIL alert. If you see a
   "[Runner FAIL -- Rambo]" Telegram message, check the error field in agent-runs.jsonl.

---

## Step 5 -- Recurrence guard

### How to recognize this failure again

Symptom: any Gmail call (interactive or runner) returns ACTION-REQUIRED or prompts re-auth.
On the runner path (post ECO-CMDLINE-FIX 2026-07-18): a Telegram message is sent:
  [Runner FAIL -- Rambo]
  Job failed after 1 retry.
  Error: rc=1: ...

The combined stdout+stderr from the failed subprocess will include the auth-error text in
the rc=1 error tag. Check the summary field in the last Rambo done/error_final entry in
memory/agent-runs.jsonl for the exact text.

### After the production switch (Step 2 + Step 3b)

The durable fix REMOVES the weekly recurrence mechanism. You should not see this failure
again unless:
- The eco.synthetic.org password is changed (invalidates all tokens).
- The token is explicitly revoked in the GCP console or Google account settings.
- The token is inactive for 90+ days (Google standard expiry for unused tokens).
- The MCP server credentials dir is cleared or the token file is deleted.

If you see an auth failure again after the production switch, the diagnostic path is:
1. Confirm the GCP console still shows "In production" (Step 1).
2. Re-consent (Step 3).
3. If it recurs within days, something revoked the token -- check GCP console ->
   Security -> Third-party access for the eco.synthetic.org@gmail.com account.

There is no ongoing monitoring task needed for this: the runner FAIL alert (Telegram) is
already the detection mechanism. The durable fix makes it a rare/exceptional event rather
than a weekly certainty.

---

## Files referenced

- Runner: integrations/runner/runner.py (ECO-CMDLINE-FIX comments, PER_JOB_TOOLS, run_job)
- Run log: memory/agent-runs.jsonl
- Credentials dir (reference only, never open): C:\Users\Jecki\.google_workspace_mcp\eco-creds\
- Board task: memory/board.md row SHIR-008

---

## Authority

This runbook documents owner-executable steps only. No infra changes are included.
Steps 1-2 are owner GCP console actions (no agent authority needed).
Step 3 re-consent is an owner browser action.
Steps 4-5 are read-only verification.
