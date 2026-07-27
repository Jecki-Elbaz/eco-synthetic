# T-0042 Browser-Driven OAuth Migration -- Prompt to run in Claude Code (Chrome extension)
# Paste everything between the lines below into a Claude Code session that has the
# "Claude in Chrome" extension connected and signed into eco.synthetic.org@gmail.com.

------------------------------------------------------------------------------------
GOAL: Help me (the owner) create a new dedicated Google OAuth client named "Eco-Synthetic",
publish it to production, wire it into this repo, consent, and revoke the old grant -- driving
my real Chrome via the Claude-in-Chrome extension for console navigation while I do the
sensitive clicks. Then set up a long-lived Claude MAX token for the scheduled runner. This is
my own Google Cloud project and my own machine; I authorize browser navigation, reading, and
non-secret field entry only.

HARD RULES for you (the running session) -- do not violate:
- Use the Claude-in-Chrome extension (mcp__claude-in-chrome__*) driving my real, logged-in
  Chrome. Do NOT use the in-app Browser pane for any Google account page.
- NEVER type my password, NEVER click a final "Allow"/consent grant, NEVER click
  "Publish"/"Move to production", NEVER click "Create" on a project or credential, and NEVER
  solve a CAPTCHA. For each, navigate to the exact control, STOP, tell me precisely what to
  click, and wait for me to confirm before continuing.
- NEVER read, capture, screenshot-to-store, print, log, or write to any file the OAuth client
  secret, any access/refresh token, or any credential value. When we reach the client secret,
  tell me to copy it straight into my terminal myself; you never handle the value.
- After each manual click I do, re-read the page to confirm the new state before proceeding.
- If anything is ambiguous or a page looks unexpected, STOP and ask me rather than guessing.

STEP 0 -- Extension + account check:
- Confirm the Claude-in-Chrome extension is connected (list connected browsers / tabs). If it
  is NOT connected, STOP and give me the steps to install/connect the "Claude in Chrome"
  extension, then wait.
- Navigate to https://console.cloud.google.com/ and read back which Google account is active.
  If it is NOT eco.synthetic.org@gmail.com, STOP and tell me to switch accounts (or sign in)
  myself; wait. Do not attempt to log in for me.

STEP 1 -- Create GCP project:
- Navigate to the New Project page. Fill the project name "eco-synthetic". STOP; tell me to
  click Create; wait; then read back the created/selected project.

STEP 2 -- Enable APIs:
- For each of Gmail API, Google Calendar API, Google Drive API: navigate to its API Library
  page for this project. STOP at the Enable button; tell me to click Enable; wait; confirm
  it shows enabled before moving to the next.

STEP 3 -- OAuth consent screen:
- Navigate to APIs & Services -> OAuth consent screen. Help me fill the app name "Eco-Synthetic"
  and the required non-sensitive fields (keep scopes minimal / default). STOP at every
  Save/Submit; tell me to click; wait.

STEP 4 -- PUBLISH TO PRODUCTION (critical -- must happen BEFORE any consent):
- Navigate to the Publishing status / "Publish app" control on the OAuth consent screen. STOP.
  Tell me exactly which button to click to move it to "In production" and to confirm the
  unverified-app warning. Wait. Then re-read and confirm the status shows "In production".
  Do NOT proceed to consent until it does. (Why: a Testing-status app expires its token in 7
  days; publishing removes that.)

STEP 5 -- Create Desktop OAuth client:
- Navigate to APIs & Services -> Credentials -> Create credentials -> OAuth client ID ->
  Application type: Desktop app, name "Eco-Synthetic". Fill the name. STOP at Create; tell me
  to click. When the client id + secret dialog appears, do NOT read or capture the secret.
  Tell me to copy BOTH values myself and run these two commands in a terminal (I paste the
  real values; you never see them):
      setx ECO_GOOGLE_OAUTH_CLIENT_ID "<client id>"
      setx ECO_GOOGLE_OAUTH_CLIENT_SECRET "<client secret>"
  Wait for me to confirm done.

STEP 6 -- Rewire .mcp.json (you do this file edit yourself):
- Edit C:\Users\Jecki\DEV\projects\eco-synthetic\.mcp.json: change the env references
  GOOGLE_OAUTH_CLIENT_ID -> ${ECO_GOOGLE_OAUTH_CLIENT_ID} and
  GOOGLE_OAUTH_CLIENT_SECRET -> ${ECO_GOOGLE_OAUTH_CLIENT_SECRET}. Keep the pin
  workspace-mcp==1.21.3 and WORKSPACE_MCP_CREDENTIALS_DIR unchanged. Show me the diff.

STEP 7 -- Re-consent (new session; the browser "Allow" is mine):
- Tell me to open a NEW Claude Code session in this repo (so the new env vars load) and trigger
  a bounded Gmail call (list labels for eco.synthetic.org@gmail.com). When the Google consent
  tab opens, I click Allow -- you do not. Confirm success by a bounded label-list call with no
  auth error. Never read the token files under the credentials dir.

STEP 8 -- Revoke the old grant:
- Navigate my Chrome to https://myaccount.google.com/permissions (Third-party access) for
  eco.synthetic.org. Find the old "Shelly" app grant. STOP; tell me to click Remove access;
  wait; confirm removed.

STEP 9 -- Auth B (Claude MAX runner token; terminal, fixes the :57 runner failures):
- Tell me to run `claude setup-token` in a terminal. When it opens a browser to authorize with
  Anthropic, I click Allow -- you do not, and you do not read the token. Then tell me to run
  `setx CLAUDE_CODE_OAUTH_TOKEN "<token>"` pasting the value myself. Briefly explain this makes
  the scheduled runner's Anthropic auth durable (uses my MAX plan) and stops the intermittent
  "OAuth session expired" failures on the first job of each cycle.

STEP 10 -- Record (file edits you can do; I commit later from my terminal):
- Update memory/board.md T-0042 row and append a decisions-log entry (append-only, at the
  bottom) noting the migration completed: new "Eco-Synthetic" client, In production, consent
  date. Update the CLAUDE.md SHIR-008 EXPIRY WARNING paragraph to resolved. Do not commit
  (agents can't commit here); list for me the exact `git add`/`commit`/`push` I should run.

At the end, give me a short summary: what is done, what state each auth is in, and any terminal
commands still left for me to run.
------------------------------------------------------------------------------------
