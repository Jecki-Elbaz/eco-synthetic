# Eco-Synthetic: Access Matrix v1.0

**Owned by:** Dalia (Quality & Governance) — defines structure; Rambo (Security) — enforces.
Per constitution §9: access is need-to-know with read / write / archive rights.
This matrix is enforced by `CLAUDE.md` deny-list and `.claude/settings.json` tool permissions.

---

## Path-level ACL

| Path | Access tier | Who may read | Who may write | Notes |
|------|-------------|--------------|---------------|-------|
| `.env` | **Blocked** | Runtime only (no agent reads this directly) | Never (jecki only, manually) | Red line 5; gitignored |
| `sources/` | **Read-only** | Any agent (context) | Nobody | Archived originals; gitignored; never edit. Curated by Yossi (Training) + Assaf (OE): they own the tool-library index and train agents on its tools. Adopted tools are tracked in `gate-register.md`; no tool is used until gated. |
| `company/decisions/decisions-log.md` | **Append-only** | All agents | Append: all agents logging decisions | Never retroactively edit; immutable audit trail |
| `company/` (other) | **Restricted** | Eco, Dalia (Q&G), Anat (HR), Rambo (Security), Eyal (Legal), Lital (CFO) + role-relevant reads | Eco (A2), Dalia, Anat, Rambo, Eyal, Lital in their domains | All other agents: read-only, need-to-know context |
| `company/governance/` | **Restricted** | Eco, Dalia, Rambo, Eyal | Dalia (access-matrix), Eyal (gate-register), Rambo (security baseline) | |
| `memory/global/` | **Restricted** | Need-to-know only; Eco + relevant staff | Eco, relevant VP or staff with context | Never shared broadly without Eco approval |
| `memory/owner-office/` | **Retired** | jecki | -- | Migrated to Shelly's standalone project on her separation (2026-06-20); no longer used in this repo |
| `memory/board.md` | **Company-shared** | All agents | Each agent writes to its own task rows | Cross-company task board |
| `memory/log.md` | **Company-shared** | All agents | Each agent appends its own entries | Running activity log; append-only in practice |
| `memory/wiki/` | **Company-shared** | All agents (need-to-know) | Eco (read/write, A3 autonomous -- no owner trigger for routine updates), Dalia, designated knowledge owners | Knowledge base; Obsidian-compatible |
| `memory/wiki/raw/` | **Ingest staging** | Eco | jecki (owner), Claude Code | Staging area for /ingest; working copies only -- originals stay in sources/ |
| `projects/<name>/` | **Partitioned** | That project's assigned agents + on-demand SME (Sami) | That project's assigned agents | Eco and relevant VPs may read any project |
| `projects/<name>/memory/` | **Partitioned** | Project agents | Project agents | Project-scoped working memory |
| `marketing/` | **Sales group** | Hila, Tim, Eco (narrative posts), Eyal (clearance reads) | Hila (assets), Tim (direction) | Eco for company-narrative posts only |
| `marketing/brand/` | **Sales group** | Hila, Tim; A1 publish gate | Hila (drafts, A3); publish = A1 | |
| `marketing/avatars/` | **Sales group** | Hila, Tim; A1 publish gate | Hila (drafts, A3); publish = A1 | |
| `.claude/agents/` | **Owner/CEO only** | Eco (operational reads), jecki; READ also granted to: Anat (HR -- certification interviews and R&R competency review), Rambo (Security -- permission-scope scans per scan policy), Dalia (Q&G -- quality audits and tone governance), Assaf (OE -- agent fitness loop and model-matrix sync), RedTeam/Red (Red-Team Security Tester -- target-accurate adversarial probe design; same operational read basis as Rambo/Anat, no write; Phase 1 audit F-R03, owner A1 2026-06-23) | jecki (A1 for any change) | Agent role files are A1 to create/change/retire. Read access for Anat, Rambo, Dalia, Assaf is a formalized matrix grant, not a special exception: these are legitimate business-need reads with no write. T-0012 reconciliation: A2 (Eco decides, jecki notified, Dalia + Rambo reviewed, logged 2026-06-16). Write remains owner A1 only. |
| `integrations/` | **Partitioned** | Shir (DevOps), Eco | Shir (DevOps), under VP R&D approval | Telegram bridge and future integrations |
| `reports/daily-summaries/` | **Owner + CEO only** | jecki (owner), Eco | Eco (writes on each summary run) | Daily end-of-day summaries; filename format daily-summary-YYYY-MM-DD-HHMM.md; A1 required to grant any other agent read access |
| `dashboards/` | **Restricted** | Lital (CFO), jecki | Assaf (OE templates), Lital (financial views) | Owner-facing views only |
| `company/security/` | **Restricted** | Rambo, jecki | Rambo (A3 operational), jecki (A1) | Security reports and scan output. All other access A1. |
| `company/security/reports/` | **Restricted** | Rambo, jecki | Rambo (write), jecki (A1) | Gated security findings. Never shared without Eco + owner approval. |
| `company/customers/` | **Restricted** | Eco, Lital (CFO), Mike (VP CS, when active), jecki | Eco, Mike (VP CS) in domain; Lital (financial fields) | Customer records + interface logs; serving agents read the specific record on demand to fulfil a logged request. Shelly is the first/reference customer (owner-office spinout). Added owner A1 2026-06-17 via the approved Shelly-separation plan. |
| Google Drive (read-only) | External | Eco, Claude Code | read via MCP; no write |
| Google Calendar (read-only) | External | Eco (context) | read only; no create/edit |

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
