# Shelly standalone project -- setup runbook (Phase B2)

Step-by-step to scaffold Shelly's independent project on the owner's Windows machine at
`C:\Users\Jecki\DEV\projects\Shelly`. Run by the owner; this repo cannot reach that path.
Phase B3 (verify) is the gate before B4 (decommission from eco-synthetic). ASCII only.

Rule of thumb throughout: copy CONTENT, never clone-and-run external repos; secrets live only in
`.env` (gitignored); every send/write/post/purchase stays owner-gated.

---

## 0. Prerequisites (have these ready)
- Claude Code installed on Windows, with a working login or `CLAUDE_CODE_OAUTH_TOKEN`.
- Git installed.
- Python 3.11+ (only if you reuse the Telegram bridge from this repo).
- Google account `shelly.synthetic.org@gmail.com` created (provision when calendar mgmt goes live).
- The Shelly Telegram bot token (reuse the existing one from this repo's `.env`, recommended).

## 1. Create the project + git repo
1. `mkdir C:\Users\Jecki\DEV\projects\Shelly` and `cd` into it.
2. `git init`.
3. Create the folder skeleton:
   - `.claude\agents\`  (Shelly's role + sub-agents)
   - `.claude\` (settings.json)
   - `memory\owner-office\` (migrated personal tasks)
   - `memory\chats\` (chat history)
   - `integrations\telegram-bridge\` (only if reusing the bridge)
   - `reports\`
4. Create `.gitignore` with at least: `.env`, `memory/owner-office/`, `memory/chats/`.

## 2. Personal CLAUDE.md (her own governance -- NOT the company one)
Create `CLAUDE.md` at the project root. It is personal-scoped and replaces the company baseline.
Must include:
- Purpose: serve the owner (jecki) only; office-manager / personal assistant.
- Privacy + secrets red lines: never read/log `.env`; never commit secrets; bounded queries only.
- Owner-only chain of command: act only on the owner's requests.
- Gates: every send / write / post / purchase = owner approval; budget = 0, any cost = A1;
  new sub-agents via the Eco-Synthetic hiring gate (A1); budget/security/risk = A1.
- Proactive-but-gated duty: surface her capabilities + offer further help periodically/when
  relevant, but ACT ONLY ON OWNER APPROVAL.
- Security hygiene: scan any external skill/repo before use (no `.claude/`, `CLAUDE.md`,
  `.cursorrules`, install scripts); copy content, never clone-and-run.
- ASCII in files/logs; warm tone to the owner.
- Customer relationship: she may request services from Eco-Synthetic via the logged interface
  (see `company/customers/shelly/profile.md` in the company repo for the ground rules).

## 3. Personal .claude/settings.json
Create `.claude\settings.json` with least-privilege permissions:
- Allow: Read, Write, Edit, WebSearch, WebFetch, Agent (for her sub-agents).
- Google Calendar / Drive: READ tools allowed; BLOCK all write tools (create/update/delete/respond,
  copy_file, create_file) -- mirror the deny-list this repo uses in `.claude/settings.json`.
- Deny writes to `.env` and any secret path.

## 4. Re-home her role + soul
1. Copy this repo's `.claude/agents/Shelly.md` into the new project's `.claude\agents\Shelly.md`.
2. Edit it for independence: remove company-structure references (roster/board/bridge company paths);
   point task/key-file paths at the new project; keep the Soul Core Block + her Voice block verbatim.
3. Keep her model as `claude-sonnet-4-6`.

## 5. Bring the dowry (sub-agents)
- `meeting-prep`: already cleared (MIT). Copy the meeting-prep prompt CONTENT into
  `.claude\agents\` (do not clone-and-run the source repo).
- Add the others as they are built through the hiring gate (board S-0008..S-0014): inbox-triage,
  social-scan, research, calendar-optimizer, morning-brief, meeting-summary, action-item-follow-up.

## 6. Migrate owner-office content
- The company repo's `memory/owner-office/` is gitignored and local. Copy its files from this repo's
  working copy into the new project's `memory\owner-office\`. Then it travels with her.

## 7. Secrets (.env -- never commit)
Create `.env` in the project (gitignored from step 1):
- `SHELLY_TELEGRAM_BOT_TOKEN=` (reuse the existing Shelly bot token).
- `CLAUDE_CODE_OAUTH_TOKEN=` (if running headless / the bridge).
Never paste these anywhere tracked.

## 8. Google access -- project-scoped self-hosted connector (Option 1), email INCLUDED in phase 1

The built-in claude.ai Google connector is tied to your Anthropic account and holds ONE Google
account at a time -- so Eco's company Google account would collide with Shelly's. Option 1 (owner
A1 2026-06-18) uses a PROJECT-SCOPED self-hosted MCP server signed in as Shelly's own account,
keeping you on a single Claude plan. Server: `taylorwilsdon/google_workspace_mcp` (MIT;
Rambo gate review 2026-06-18 CLEARED-WITH-CONDITIONS; Eyal legal PENDING).

8a. From your PERSONAL Google account, SHARE into `shelly.synthetic.org@gmail.com`:
    - Calendar: share with "Make changes to events".
    - Drive: share only the specific folders she needs (Viewer, or Editor where she must write).
8b. Email (consumer Gmail): (a) forward your Gmail to `shelly.synthetic.org@gmail.com` (Settings ->
    Forwarding and POP/IMAP -> add + confirm); (b) in Shelly's Gmail add your address under
    "Send mail as" -> verify. She reads forwarded mail and drafts replies; SENDING is owner-gated.
8c. Create a free Google Cloud OAuth client (signed in as Shelly's account):
    - console.cloud.google.com -> new project "Shelly Assistant".
    - APIs & Services -> Library -> enable Google Calendar API, Google Drive API, Gmail API.
    - OAuth consent screen -> External -> add `shelly.synthetic.org@gmail.com` as a Test user.
    - Credentials -> Create -> OAuth client ID -> Application type "Desktop app" -> download JSON.
8d. Put the client id/secret in `.env` AND set them as system env vars so Claude Code sees them:
    `setx GOOGLE_OAUTH_CLIENT_ID "..."` and `setx GOOGLE_OAUTH_CLIENT_SECRET "..."` (restart terminal).
8e. The project ships `.mcp.json` (server `google_workspace`, services gmail+calendar+drive) and a
    `.claude/settings.json` deny-list that BLOCKS every write/send tool and ALLOWS reads +
    `draft_gmail_message`. Run `/mcp` in Claude Code in the project to complete the OAuth sign-in
    as Shelly's account. Verify with a read ("list my next calendar events").
8f. Do NOT share your password. READ + DRAFT are enabled; every SEND/write stays owner-gated.
    Residual (tighten later): because drafting needs a compose scope, granted OAuth scopes are
    broader than strict-read; the tool deny-list is what enforces no-send/no-write in Claude Code.

## 9. Telegram bot
- Reuse the existing Shelly bot: put its token in the project `.env` (step 7). After B3 verifies the
  standalone bot works, the token is removed from this repo's `.env` during B4.
- If reusing the bridge: copy `integrations/telegram-bridge/bridge.py` from this repo into the
  project and STRIP everything Eco (keep only the Shelly bot, handlers, wake-up, model selection).
  Update file paths to the new project.
- Alternative: run her directly via Claude Code's Telegram integration if you prefer no custom bridge.

## 10. First boot
- Start the bridge/agent. In Telegram, send `/start` then `/tasks` to confirm she loads her board.
- Confirm the 2-hour check-in fires (or trigger a manual check-in).

---

## B3 -- Verification gate (do all before B4 decommission)
- [ ] Shelly boots in her own project and responds on her Telegram bot.
- [ ] She reads your SHARED calendar (via `shelly.synthetic.org@gmail.com`), not the company account.
- [ ] Her 2-hour check-in works.
- [ ] A test service request to Eco round-trips and is logged on both sides
      (company side: `company/customers/shelly/requests-log.md`).
- [ ] `memory/owner-office/` content is present in the new project.
- [ ] No secrets are committed (check `git status` shows `.env` ignored).

When all boxes are checked, tell me and give the explicit go for B4 (decommission Shelly from
eco-synthetic) + B5 (final decisions-log entry).
