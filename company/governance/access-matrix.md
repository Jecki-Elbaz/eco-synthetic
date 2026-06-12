# Eco-Synthetic: Access Matrix v1.0

**Owned by:** Dalia (Quality & Governance) — defines structure; Rambo (Security) — enforces.
Per constitution §9: access is need-to-know with read / write / archive rights.
This matrix is enforced by `CLAUDE.md` deny-list and `.claude/settings.json` tool permissions.

---

## Path-level ACL

| Path | Access tier | Who may read | Who may write | Notes |
|------|-------------|--------------|---------------|-------|
| `.env` | **Blocked** | Runtime only (no agent reads this directly) | Never (jecki only, manually) | Red line 5; gitignored |
| `sources/` | **Read-only** | Any agent (context) | Nobody | Archived originals; gitignored; never edit |
| `company/decisions/decisions-log.md` | **Append-only** | All agents | Append: all agents logging decisions | Never retroactively edit; immutable audit trail |
| `company/` (other) | **Restricted** | Eco, Dalia (Q&G), Anat (HR), Rambo (Security), Eyal (Legal), Lital (CFO) + role-relevant reads | Eco (A2), Dalia, Anat, Rambo, Eyal, Lital in their domains | All other agents: read-only, need-to-know context |
| `company/governance/` | **Restricted** | Eco, Dalia, Rambo, Eyal | Dalia (access-matrix), Eyal (gate-register), Rambo (security baseline) | |
| `memory/global/` | **Restricted** | Need-to-know only; Eco + relevant staff | Eco, relevant VP or staff with context | Never shared broadly without Eco approval |
| `memory/owner-office/` | **Owner-only** | Shelly, jecki | Shelly only | Personal-task data; gitignored; all company agents (incl. Eco) denied read -- A3 hardening 2026-06-12 |
| `memory/board.md` | **Company-shared** | All agents | Each agent writes to its own task rows | Cross-company task board |
| `memory/log.md` | **Company-shared** | All agents | Each agent appends its own entries | Running activity log; append-only in practice |
| `memory/wiki/` | **Company-shared** | All agents (need-to-know) | Eco (read/write, A3 autonomous -- no owner trigger for routine updates), Dalia, designated knowledge owners | Knowledge base; Obsidian-compatible |
| `memory/wiki/raw/` | **Ingest staging** | Eco | jecki (owner), Claude Code | Staging area for /ingest; working copies only -- originals stay in sources/ |
| `projects/<name>/` | **Partitioned** | That project's assigned agents + on-demand SME (Sami) | That project's assigned agents | Eco and relevant VPs may read any project |
| `projects/<name>/memory/` | **Partitioned** | Project agents | Project agents | Project-scoped working memory |
| `marketing/` | **Sales group** | Hila, Tim, Eco (narrative posts), Eyal (clearance reads) | Hila (assets), Tim (direction) | Eco for company-narrative posts only |
| `marketing/brand/` | **Sales group** | Hila, Tim; A1 publish gate | Hila (drafts, A3); publish = A1 | |
| `marketing/avatars/` | **Sales group** | Hila, Tim; A1 publish gate | Hila (drafts, A3); publish = A1 | |
| `.claude/agents/` | **Owner/CEO only** | Eco (operational reads), jecki | jecki (A1 for any change) | Agent role files are A1 to create/change/retire |
| `integrations/` | **Partitioned** | Shir (DevOps), Eco | Shir (DevOps), under VP R&D approval | Telegram bridge and future integrations |
| `dashboards/` | **Restricted** | Lital (CFO), jecki | Assaf (OE templates), Lital (financial views) | Owner-facing views only |
| Google Drive (read-only) | External | Eco, Shelly, Claude Code | read via MCP; no write |
| Gmail (read-only) | External | Shelly (monitoring), Eco (on explicit task) | search+read only; no draft/send |
| Google Calendar (read-only) | External | Eco (context), Shelly (scheduling) | read only; no create/edit |

---

## Per-agent working memory

Each agent's working memory (scratch space, drafts) is private to that agent by default — not shared unless the agent explicitly writes to a shared space.

---

## Cross-group communication rule

Per constitution §5: agents coordinate through the CEO orchestrator and shared files. Within a group: through the manager or VP. Across groups: only via the two VPs, only when required. CEO may reach anyone directly but defaults to the chain of command.

---

## Scan policy (Rambo)

Rambo (Security) scans for excess permissions:
- On every existing agent at go-live.
- On every new agent before certification.
- On every R&R change.
- After any external tool is added.

Output: a permission-scope report to Eco. Overages are corrected before the agent goes live.

---

## Change process

Any change to this matrix is A2 (Eco decides, jecki notified), reviewed by Dalia (Q&G) and Rambo (Security), and logged in `company/decisions/decisions-log.md`.
