# Eco-Synthetic: Next Session Agenda

**State as of 2026-06-12:** Repo scaffolded. Eco built as a Claude Code subagent. Ready to go live pending Telegram tokens and company account from jecki. (Shelly was also built then but separated 2026-06-20; now an external customer -- see company/customers/shelly/profile.md.)

---

## What to do first (in order)

### Step 1 — jecki (you): provide the Telegram bot token
1. Create one Telegram bot via BotFather for Eco (Eco-only since Shelly separated 2026-06-20).
   Full instructions: `company/setup-guide.md` §2.
2. Paste the token into `.env` at the repo root:
   ```
   ECO_TELEGRAM_BOT_TOKEN=your_eco_token_here
   ```
3. `.env` is gitignored — never commit it.

### Step 2 — jecki (you): create the company account
A free dedicated email/Google account for Eco-Synthetic. See `company/setup-guide.md` §1.
Security (Rambo) vaults its credentials when Rambo is live.

### Step 3 — Claude Code: wire the Telegram bridge
Once the token is in `.env`, implement `integrations/telegram-bridge/` so Eco receives messages from its bot and can respond (Eco-only since Shelly separated 2026-06-20).

### Step 4 — Activate Eco
Open this repo in Claude Code and use the `Eco` subagent (`.claude/agents/Eco.md`). Task him:
> "Eco — you are live. Run your go-live assessment: review the company structure and R&R, identify any gaps, and decide the VP Product question. Report back."

### Step 5 — HR acknowledgment (Anat, when live)
Once Anat (HR) is built: she runs the R&R acknowledgment with Eco — each agent confirms its role file is clear and achievable.

(The former "Activate Shelly" step is removed: Shelly separated 2026-06-20 and is now an external customer -- see company/customers/shelly/profile.md. The domain availability check, formerly hers, reassigns via Eco/owner.)

---

## Open items (not blocking go-live but track them)

| Item | Owner | Status |
|------|-------|--------|
| Two owner presentations (PDF or pasted text) | jecki | Pending — jecki to share when ready |
| Domain .com vs .ai pick | jecki → Eco/owner | Reassign (was Shelly, separated 2026-06-20) |
| Hila creative options (logo, palette, avatars) | Hila | Waiting for Hila certification |
| Build-in-public track authorization | jecki | On hold — owner decides later |
| LinkedIn page (requires domain + company email) | Hila, blocked on domain/email (was Shelly, separated 2026-06-20; route via Eco/owner) | Blocked |
| Multi-model router Phase A build | Ido/Gal | Deferred until R&D team is active |
| Compliance backlog (Eyal + Lital) | Eyal, Lital | Tracking; will surface to Eco at appropriate time |

---

## Files to know for this session

| File | Why |
|------|-----|
| `company/constitution.md` (v2.2) | Governance rules |
| `company/roster.md` (v2.2) | Who does what |
| `.claude/agents/Eco.md` | Eco's role and limits |
| `memory/board.md` | Open task queue |
| `company/build-log.md` | Full history |
| `company/decisions/decisions-log.md` | Audit trail |

---

## What the previous session produced

All scaffolding completed 2026-06-12 by Claude Code:
- Folder hierarchy per `company/repo-structure.md`
- `.gitignore`, `.env.example`, `CLAUDE.md`, `.claude/settings.json`
- Agent files in `.claude/agents/` (Eco, Hila, Designer; Shelly was built then but separated 2026-06-20 -- now an external customer, see company/customers/shelly/profile.md)
- All company docs in `company/` (constitution v2.2, roster v2.2, org chart, model matrix, role-file template, setup guide, build log)
- Governance stubs: decisions-log, gate-register v1, access-matrix v1
- Memory stubs: board.md, log.md
- Marketing content calendar (P1 light track)
- Delivery-saas project space stub
- Telegram bridge stub
- All original planning files archived to `sources/` (gitignored)
