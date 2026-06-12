# Eco-Synthetic: Repo Structure (for approval)

The proposed folder layout for the `eco-synthetic` repository and the access tier of each area. Claude Code (or Cowork) scaffolds from this file. Tiers follow constitution section 9 (need-to-know, read/write/archive) and are enforced by Security (Rambo).

---

## 1. Tree

```
eco-synthetic/
|-- README.md                      # project index and status
|-- .gitignore                     # MUST exclude .env and all secrets
|-- .env.example                   # token var names only, no real values
|-- .env                           # real tokens, gitignored, never committed
|
|-- .claude/
|   |-- agents/                    # live agent role files (Claude Code subagents)
|   |   |-- Eco.md
|   |   |-- Shelly.md
|   |   |-- Hila.md
|   |   |-- Designer.md
|   |   `-- ...                    # the rest, added as each agent is built
|   |-- commands/                  # reusable slash-commands (optional)
|   `-- settings.json              # Claude Code project config
|
|-- company/                       # company governance + source-of-truth docs (RESTRICTED)
|   |-- constitution.md
|   |-- roster.md                  # eco-synthetic-roster-v2.md
|   |-- org-chart.mermaid
|   |-- model-matrix.md
|   |-- role-file-template.md
|   |-- setup-guide.md
|   |-- build-log.md               # living build journal (Dalia owns)
|   |-- repo-structure.md          # this file
|   |-- backlog.md                 # idea & decision backlog
|   |-- next-session.md            # session handoff and opening tasks
|   |-- model-router-design.md     # multi-LLM router design (Phase A approved)
|   |-- claw-evaluation.md         # claw/Hermes runtime evaluation (shelved)
|   |-- decisions/
|   |   `-- decisions-log.md       # immutable audit trail
|   `-- governance/
|       |-- gate-register.md       # tool-adoption gate / tool register (Legal)
|       |-- access-matrix.md       # the ACL: who reads/writes/archives what
|       |-- schedules.md           # approved agent schedules (A1 per entry)
|       |-- security-baseline.md   # security posture and risks (Rambo)
|       `-- compliance-backlog.md  # compliance readiness (Eyal + Lital)
|
|-- memory/                        # shared memory layers (HUB: board + log + KB)
|   |-- global/                    # global company memory (RESTRICTED)
|   |-- board.md                   # cross-company task board
|   |-- log.md                     # running activity log
|   `-- kb/                        # knowledge base (Obsidian-compatible markdown)
|
|-- projects/                      # one folder per product/project (PARTITIONED)
|   `-- delivery-saas/             # first product: delivery mgmt for IL SMBs
|       |-- memory/                # project-scoped memory
|       |-- docs/                  # requirements, design, specs
|       `-- src/                   # code (R&D)
|
|-- marketing/                     # Sales-group space (brand + content)
|   |-- brand/                     # logo, palette, type (Hila, A1 to publish)
|   |-- avatars/                   # agent avatar set
|   |-- linkedin/                  # page setup spec + copy (Legal-cleared)
|   `-- content-calendar.md        # build-in-public queue (on hold)
|
|-- integrations/
|   `-- telegram-bridge/           # connects the two bots to Eco and Shelly
|
`-- dashboards/                    # owner dashboard views (CFO + OE), later
```

---

## 2. Access tiers

| Area | Tier | Who | Rights |
|------|------|-----|--------|
| `company/` (constitution, roster, governance) | Restricted | CEO + relevant staff (Dalia, Anat, Rambo, Eyal, Lital) | read; write gated by role |
| `company/decisions/decisions-log.md` | Restricted, append-only | all agents append; no edits/deletes | append (immutable) |
| `memory/global/` | Restricted | need-to-know | read/write per access-matrix |
| `memory/board.md`, `log.md`, `kb/` | Company-shared | all agents (need-to-know) | read; write to own scope |
| `projects/<name>/` | Partitioned | that project's assigned agents + on-demand SME | read/write within project |
| `marketing/` | Group (Sales) | Hila, Tim; Eco for narrative | read/write own assets |
| `dashboards/` financial views | Restricted | Lital (CFO), Owner | read |
| `.env` / secrets | Restricted | runtime only, vaulted | never in repo/outputs/logs (red line 5) |
| Owner-office items (Shelly/Luci/Erez) | Owner-office | Owner + delegated | separate from company-restricted |

Per-agent working memory is each agent's own scratch space, not shared by default.

---

## 3. Secrets and tokens

- The two Telegram bot tokens go in `/.env` at the repo root, as:
  ```
  ECO_TELEGRAM_BOT_TOKEN=...
  SHELLY_TELEGRAM_BOT_TOKEN=...
  ```
- `.env` is listed in `.gitignore` from the first commit; `.env.example` holds only the variable names. The Telegram bridge reads the tokens at runtime. Tokens are never committed, never pasted into chat, never logged (red line 5; Rambo owns the vault and policy).

---

## 4. Notes

- Agent role files are the live `.claude/agents/*.md` (older docs that reference `agents/Eco.md` map to this path).
- This is the proposed structure for owner approval; Eco assesses and refines it on go-live as part of the structure review.
- Scaffolding instruction for Claude Code: "Scaffold the repo per `company/repo-structure.md`, create `.gitignore` (excluding `.env`) and `.env.example`, then build agents Eco and Shelly from `.claude/agents/*.md`."
