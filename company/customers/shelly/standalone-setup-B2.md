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

## 8. Google account + delegated access (no login sharing)
1. Confirm/create `shelly.synthetic.org@gmail.com`.
2. From your PERSONAL Google account, SHARE into Shelly's account:
   - Calendar: share with `shelly.synthetic.org@gmail.com`, permission "Make changes to events"
     (needed for calendar optimization).
   - Drive: share only the specific folders she needs (Viewer, or Editor where she must write).
3. In the project, connect the Google Calendar / Drive MCP connectors authenticating AS
   `shelly.synthetic.org@gmail.com` (OAuth) -- so she sees only what you shared.
4. Do NOT share your password or log her in as you. Sending email stays a later, separately-gated step.

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
