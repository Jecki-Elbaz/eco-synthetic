# T-0042 OAuth Client Migration Runbook (folds in SHIR-008)
Eco | 2026-07-25 | T-0042 + SHIR-008 | P1 (deadline ~2026-07-31)

WHY NOW: the current Gmail token was minted 2026-07-24 under the shared "Shelly"
GCP OAuth app, which is in TESTING status -> Google force-expires the refresh
token 7 days after consent (~2026-07-31). Without action, Gmail breaks again.
Per the T-0042 sequencing note (board, 2026-07-24), doing the SHIR-008 switch on
the Shelly app and then migrating anyway is throwaway work -- so this runbook
does T-0042 (new dedicated client) WITH the production switch built in as step 1b.

ALL steps below are OWNER actions (GCP console + browser consent + env vars).
No agent touches credentials at any point (red line 1).

## Step 1 -- Create the Eco-Synthetic OAuth client (GCP console)
1. Log in to https://console.cloud.google.com/ AS eco.synthetic.org@gmail.com.
2. Create a new GCP project (suggested name: eco-synthetic) owned by that account.
3. APIs & Services -> Library: enable Gmail API, Google Calendar API, Google Drive API.
4. APIs & Services -> OAuth consent screen: configure; app name "Eco-Synthetic";
   user type External is fine (single-account internal use).

## Step 1b -- PUBLISH TO PRODUCTION BEFORE CONSENTING (critical, from SHIR-008)
On the OAuth consent screen page, click "Publish app" / "Move to production" and
confirm. Status must read "In production" BEFORE any consent, otherwise the new
client mints another 7-day Testing token and silently re-creates the outage
(this is the exact trap the sequencing note warns about). The unverified-app
warning appears once at consent time only; no verification submission is needed
for a single-account tool (details: gmail-oauth-durability-shir-2026-07-18.md,
Step 2 notes).

## Step 2 -- Create the Desktop-app client + set env vars
1. APIs & Services -> Credentials -> Create credentials -> OAuth client ID ->
   Application type: Desktop app; name "Eco-Synthetic".
2. Copy the client ID and secret INTO THE COMMANDS BELOW YOURSELF (owner
   keystrokes only; never paste them into an agent chat or tracked file):

   setx ECO_GOOGLE_OAUTH_CLIENT_ID "<new client id>"
   setx ECO_GOOGLE_OAUTH_CLIENT_SECRET "<new client secret>"

3. Also add both to the eco-synthetic .env (gitignored) for processes that read it.

## Step 3 -- Rewire .mcp.json (owner or Eco in-session AFTER step 2)
In C:\Users\Jecki\DEV\projects\eco-synthetic\.mcp.json change the two env
references (currently the machine-wide Shelly vars):
   "GOOGLE_OAUTH_CLIENT_ID": "${ECO_GOOGLE_OAUTH_CLIENT_ID}",
   "GOOGLE_OAUTH_CLIENT_SECRET": "${ECO_GOOGLE_OAUTH_CLIENT_SECRET}",
Pin stays workspace-mcp==1.21.3; WORKSPACE_MCP_CREDENTIALS_DIR unchanged
(eco-creds). No version bump, no new gate (naming/governance hygiene only;
security boundary unchanged -- isolation is per credential store).

## Step 4 -- Re-consent as eco.synthetic.org (browser)
Open a NEW Claude Code interactive session in this repo (new session so the env
vars load), trigger any bounded Gmail call (e.g. list Gmail labels for
eco.synthetic.org@gmail.com), complete the browser consent AS
eco.synthetic.org@gmail.com. Token lands in eco-creds automatically, replacing
the old Shelly-app token. Because the app is In production, this token has NO
7-day expiry.

## Step 5 -- Revoke the old grant
In Google Account security settings for eco.synthetic.org@gmail.com
(Security -> Third-party access), remove the "Shelly" app's access. Shelly's own
repo/token is unaffected (separate credential store + her own consent).

## Step 6 -- Verify + record
1. Interactive check: bounded list-Gmail-labels call succeeds, no auth error.
2. Runner check: python integrations/runner/runner.py --mode act --only Rambo
   -> last "Adam Inbox Screen" entry in memory/agent-runs.jsonl has rc=0.
3. Record in company/decisions/decisions-log.md (append-only) + GR-009 addendum
   in company/governance/gate-register.md: new client name, project, In-production
   status, consent date. Update the CLAUDE.md SHIR-008 EXPIRY WARNING paragraph
   to resolved.

FALLBACK (if you cannot do T-0042 before ~2026-07-31): do ONLY the SHIR-008
standalone switch -- publish the existing "Shelly" app to In production
(gmail-oauth-durability-shir-2026-07-18.md steps 1-3) and re-consent once. That
stops the weekly breakage; T-0042 can then happen any time without a deadline.
