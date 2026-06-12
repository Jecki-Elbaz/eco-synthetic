# Eco-Synthetic

A company fully operated by AI agents, owned by jecki. Governance is at v2.2 (approved). Repo scaffolded 2026-06-12.

---

## A. Status

| Area | Status |
|------|--------|
| Design and governance | Done — v2.2 approved |
| Repo scaffolded | Done — 2026-06-12 |
| Eco and Shelly agents built | Done — `.claude/agents/` |
| Telegram tokens | **Blocking** — jecki to paste into `.env` |
| Company account | **Blocking** — jecki to create |
| Agent certification (HR/Anat) | Pending — after agents are live |
| Domain (.com vs .ai) | Pending — Shelly decides after go-live |
| Two owner presentations | Pending — jecki to share |

**Immediate next steps:** see `next-session.md`.

---

## B. What is urgent now

Three things needed to switch on Eco and Shelly:
1. **Telegram bot tokens** — create via BotFather; see `company/setup-guide.md` §2. Paste into `.env`.
2. **Company account** — a dedicated email/Google account for Eco-Synthetic. See `company/setup-guide.md` §1.
3. **Activate Eco** — once tokens and account are in place, open this project in Claude Code and task Eco to run his go-live assessment.

Everything else Eco manages after that.

---

## C. File index

### Root
| File | Version | Description |
|------|---------|-------------|
| `README.md` | current | This file — project index and status |
| `.gitignore` | 1.0 | Excludes `.env`, `/sources`, secrets, Python artifacts |
| `.env.example` | 1.0 | Token variable names only — copy to `.env` and fill in |
| `CLAUDE.md` | 1.0 | Project security baseline and deny-list |
| `next-session.md` | current | Opening tasks and handoff for the next session |

### `.claude/`
| File | Version | Description |
|------|---------|-------------|
| `.claude/settings.json` | 1.0 | Claude Code project config — allow/deny tool permissions |
| `.claude/agents/Eco.md` | 0.1 | CEO subagent — Sonnet/Opus |
| `.claude/agents/Shelly.md` | 0.2 | Office Manager subagent — Haiku/Sonnet |
| `.claude/agents/Hila.md` | 0.1 | Marketing subagent draft — Sonnet |
| `.claude/agents/Designer.md` | 0.1 | Product UX/UI subagent draft — Sonnet |

### `company/` (Restricted)
| File | Version | Description |
|------|---------|-------------|
| `company/constitution.md` | v2.2 | Single source of truth — governance, gates, red lines |
| `company/roster.md` | v2.2 | Org structure, names, R&R clarifications |
| `company/org-chart.mermaid` | v2.1 | Visual org chart (Mermaid) |
| `company/model-matrix.md` | v1.0 | Per-agent LLM permissions |
| `company/role-file-template.md` | 1.0 | Standard template for all agent role files |
| `company/setup-guide.md` | 1.0 | Owner setup steps (account, BotFather, costs, WhatsApp) |
| `company/build-log.md` | current | Living build journal — Phase 0 + Phase 1 entries |
| `company/decisions/decisions-log.md` | current | Append-only audit trail of decisions |
| `company/governance/gate-register.md` | v1.0 | Tool and source register (Legal owns) |
| `company/governance/access-matrix.md` | v1.0 | ACL — who reads/writes/archives what (Q&G + Security) |

### `memory/`
| File | Description |
|------|-------------|
| `memory/board.md` | Cross-company task board |
| `memory/log.md` | Running activity log (append-only) |
| `memory/global/` | Restricted global memory |
| `memory/wiki/` | Knowledge base (Obsidian-compatible markdown) |

### `projects/`
| Path | Description |
|------|-------------|
| `projects/delivery-saas/` | First product: delivery management for IL SMBs |

### `marketing/`
| File | Description |
|------|-------------|
| `marketing/content-calendar.md` | Phase-1 marketing kit and build-in-public queue |
| `marketing/brand/` | Brand assets (to be created by Hila) |
| `marketing/avatars/` | Agent avatar set (to be created by Hila) |
| `marketing/linkedin/` | LinkedIn setup assets |

### `integrations/`
| File | Description |
|------|-------------|
| `integrations/telegram-bridge/README.md` | Telegram bridge stub (Phase 1 implementation) |

### `sources/` (gitignored — read-only archived originals)
All `eco-synthetic-*.md` planning files and original `agents/` role files archived here.

---

## D. Activation plan

1. ~~Scaffold the repo~~ — Done 2026-06-12.
2. Provide Telegram tokens + company account (jecki only). Paste tokens into `.env`.
3. Activate Eco: task him to run his go-live assessment, decide the VP Product question, and assess R&R gaps.
4. Activate Shelly: she operates jecki's Telegram channel and starts the domain check.
5. HR (Anat) runs the R&R acknowledgment with Eco and Shelly.
6. Build the rest of Phase 1 under Eco, then Phase 2 and Phase 3 through the lifecycle.

---

## E. Security baseline

- `.env` is **gitignored** — never commit it. Real tokens go there only.
- `sources/` is **gitignored** — read-only archived originals.
- `CLAUDE.md` encodes the deny-list (red lines 1–10, access tiers, security notes).
- `.claude/settings.json` enforces tool-level allow/deny.
- See `company/governance/access-matrix.md` for the full ACL.
- See `company/governance/gate-register.md` for the tool register (Eyal/Rambo owns).
