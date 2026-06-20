# Eco-Synthetic: Next Session Agenda

**State as of 2026-06-12:** Repo scaffolded. Eco built as a Claude Code subagent. Ready to go live pending Telegram tokens and company account from jecki. (Shelly was also built then but separated 2026-06-20; now an external customer -- see company/customers/shelly/profile.md.)

---

## What to do first (in order)

### Step 1 — jecki (you): provide the two Telegram bot tokens
1. Create two Telegram bots via BotFather: one for Eco, one for Shelly.
   Full instructions: `company/setup-guide.md` §2.
2. Paste the tokens into `.env` at the repo root:
   ```
   ECO_TELEGRAM_BOT_TOKEN=your_eco_token_here
   SHELLY_TELEGRAM_BOT_TOKEN=your_shelly_token_here
   ```
3. `.env` is gitignored — never commit it.

### Step 2 — jecki (you): create the company account
A free dedicated email/Google account for Eco-Synthetic. See `company/setup-guide.md` §1.
Security (Rambo) vaults its credentials when Rambo is live.

### Step 3 — Claude Code: wire the Telegram bridge
Once tokens are in `.env`, implement `integrations/telegram-bridge/` so Eco and Shelly receive messages from their respective bots and can respond.

### Step 4 — Activate Eco
Open this repo in Claude Code and use the `Eco` subagent (`.claude/agents/Eco.md`). Task him:
> "Eco — you are live. Run your go-live assessment: review the company structure and R&R, identify any gaps, and decide the VP Product question. Report back."

### Step 5 — Activate Shelly
Use the `Shelly` subagent (`.claude/agents/Shelly.md`). Task her:
> "Shelly — you are live. Start managing my Telegram channel. Begin the domain availability check: eco-synthetic.com vs eco-synthetic.ai (and the non-hyphen variants). Present me the comparison before doing anything."

### Step 6 — HR acknowledgment (Anat, when live)
Once Anat (HR) is built: she runs the R&R acknowledgment with Eco and Shelly — each agent confirms its role file is clear and achievable.

---

## Open items (not blocking go-live but track them)

| Item | Owner | Status |
|------|-------|--------|
| Two owner presentations (PDF or pasted text) | jecki | Pending — jecki to share when ready |
| Domain .com vs .ai pick | jecki → Shelly | Waiting for Shelly to present comparison |
| Hila creative options (logo, palette, avatars) | Hila | Waiting for Hila certification |
| Build-in-public track authorization | jecki | On hold — owner decides later |
| LinkedIn page (requires domain + company email) | Hila, blocked on Shelly | Blocked |
| Multi-model router Phase A build | Ido/Gal | Deferred until R&D team is active |
| Compliance backlog (Eyal + Lital) | Eyal, Lital | Tracking; will surface to Eco at appropriate time |

---

## Files to know for this session

| File | Why |
|------|-----|
| `company/constitution.md` (v2.2) | Governance rules |
| `company/roster.md` (v2.2) | Who does what |
| `.claude/agents/Eco.md` | Eco's role and limits |
| `.claude/agents/Shelly.md` | Shelly's role and limits |
| `memory/board.md` | Open task queue |
| `company/build-log.md` | Full history |
| `company/decisions/decisions-log.md` | Audit trail |

---

## What the previous session produced

All scaffolding completed 2026-06-12 by Claude Code:
- Folder hierarchy per `company/repo-structure.md`
- `.gitignore`, `.env.example`, `CLAUDE.md`, `.claude/settings.json`
- Four agent files in `.claude/agents/` (Eco, Shelly, Hila, Designer)
- All company docs in `company/` (constitution v2.2, roster v2.2, org chart, model matrix, role-file template, setup guide, build log)
- Governance stubs: decisions-log, gate-register v1, access-matrix v1
- Memory stubs: board.md, log.md
- Marketing content calendar (P1 light track)
- Delivery-saas project space stub
- Telegram bridge stub
- All original planning files archived to `sources/` (gitignored)
