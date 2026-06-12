# Eco-Synthetic: Build Log

A living record of how Eco-Synthetic is planned, built, modified, improved, and managed. Owned by Quality & Governance (Dalia); appended by whoever makes a change. Pairs with `company/decisions/decisions-log.md` (append-only audit trail).

## How to use
Every significant decision or change gets an entry: date, author (human or agent), what changed, why, and the files affected. Append only — never edit or delete existing entries.

---

## Phase 0: Planning (planning chat, 2026-05 to 2026-06-10)

1. Mission set: an agent-run company, owner jecki, two business sides (Product/R&D and Service-Operations under VP Customer Success), multi-project, first product a delivery-management SaaS for Israeli small businesses.
2. Governance defined: approval gates A1/A2/A3; hierarchy L1-L5; chain-of-command comms (cross-group via VPs, CEO may reach anyone, red line 13); loop caps; task and result envelopes; tone as a governance standard; meetings via Telegram groups (orchestrated turns).
3. Constitution v2.1 authored: 13 approved red lines, free-first, least privilege, immutable audit, tool-adoption gate (Security + Legal, borderline A1), token governance and per-agent usage reporting, shared-memory layers with read/write/archive ACL, role-file standard, lifecycle and fitness loop, live monitoring (DevOps), owner dashboard, ISO principles, SME pool, Initiative Review Board, compliance-readiness backlog (Eyal + Lital).
4. Org and names set: CEO Eco; VPs Ido (R&D), Mike (Customer Success), Tim (Sales); staff Dalia (Quality & Governance), Anat (HR), Assaf (Operational Excellence), Rambo (Security), Eyal (Legal), Lital (CFO), Noam (Product), Zvika (Research); R&D Gal (Lead Dev), Shir (DevOps), Adi (QA), Roman (Algorithm, on-demand), Senior Developer (name TBD by Anat/Eco); Customer Success Jenny (Support), Avner (CS), Ella (Customer Training); Sales Alex, Hila (Marketing); owner office Shelly (Office Manager), Luci (Devil's Advocate), Erez (Investor); SME Sami (per project).
5. Consolidation: Version/Release Manager, Delivery, and IT folded into DevOps (Shir); Algorithm Specialist and Research made on-demand/generalist; added Senior Developer (code review, 2-round cap) and the SME pool.
6. Budget set to 0; all expenses A1 via the chain to Eco then owner.
7. Owner communication: Shelly (admin, operational, private; owns owner channels and meeting groups) and Eco (company) each communicate directly with jecki; they cooperate only when jecki asks, for a specific task or time frame.
8. Interfaces: Telegram first (free); WhatsApp deferred, Shelly to evaluate; Evolution API assessed (free software, but Baileys mode risks WhatsApp terms and needs self-hosting, Cloud mode carries Meta cost, so a borderline decision -> A1); Obsidian approved for the KB; Eyal and Lital to get Israeli law and finance access via the gate.
9. Artifacts approved: folder hierarchy and additions, role-file template, drafted role files (Eco, Shelly).
10. Setup guide produced (company account, BotFather, migration, costs, WhatsApp). Domain purchase approved as the first expense; Shelly to buy it, then email, drive, and the rest.

Open before implementation: review the two owner-provided presentations (need PDF or pasted text); confirm one Telegram bot or two.

---

## Phase 0 continuation (planning chat, 2026-06-10)

Author: planning chat (jecki + Claude)

**Hila (Marketing)**
- Logo direction, color palette/fonts, and avatar style: **deferred to Hila.** Owner declined to choose creative sight-unseen; once Hila is onboarded and certified, she presents concrete options for A1 approval. The session's brand-basics and avatar drafts become her starting material, not pre-approved choices.
- Build-in-public cadence: **on hold** — not authorized yet; owner to decide later (publishing stays A1 per post when it starts).
- LinkedIn company page admin: **the owner's own personal profile.**
- Phase: **P1-light confirmed.** Roster table reconciled — Hila changed from P3 to P1 (light track).

**Designer (Product UX/UI)**
- Role file drafted: L4, reports to Noam (Product), Phase P2, model Sonnet.
- Scope (marketing design?): **left to Eco at go-live**; product-only until Eco decides.
- Name: **assigned by Anat (HR) + Eco at build**, with owner pre-approval.

**Multi-LLM model router (constitution §17)**
- **Phase A approved:** build only the router's selection + logging skeleton; stay Claude-only. No spend, no third-party data egress, no second model added yet.
- **Hard rule set:** no customer data goes to any third-party model without explicit A1 + a privacy sign-off from Eyal (Legal).
- Adding a second model (local open-weight, or hosted/paid) is **deferred** until the owner wants it; hosted = A1.

**Claw / Hermes runtime evaluation**
- **Shelved.** OpenClaw and Hermes Agent are not adopted (broad autonomy, attack surface, overlap with Claude Code). NanoClaw is held in reserve only as a future gated, sandboxed tool, subject to a Rambo (Security) review, and only if a concrete low-risk job arises.
- **§16 correction:** the prior note's claim that OpenClaw was acquired by OpenAI is **unverified** — public sources list it as independent (OpenClaw Foundation / Peter Steinberger, MIT). Do not rely on the acquisition claim.
- **Clarification:** "Hermes" is two things — the open-weight model family (handled in the model-router workstream) and a separate agent framework, Hermes Agent (handled here, shelved).

Files affected: eco-synthetic-build-log-entry-2026-06-10.md (archived to sources/), constitution.md (§16/§17 applied), roster.md (Hila P1 reconciled), model-matrix.md (Designer model added), .claude/agents/Designer.md (drafted).

---

## Phase 1: Repo scaffold (2026-06-12)

Author: Claude Code (jecki session)

Scaffolded the `eco-synthetic` repo per `company/repo-structure.md` (v1.0 approved). Changes:

**Infrastructure created:**
- `.gitignore` — excludes `.env`, `/sources`, secrets, Python artifacts, IDE files.
- `.env.example` — token var names only (`ECO_TELEGRAM_BOT_TOKEN`, `SHELLY_TELEGRAM_BOT_TOKEN`).
- `CLAUDE.md` — project-level deny list: red lines, access tiers, security notes (backlog items 5–7 `[SCAFFOLD]`).
- `.claude/settings.json` — allow/deny tool permissions baseline (backlog items 5, AI-tips `[SCAFFOLD]`).

**Folder hierarchy created:**
`.claude/agents/`, `.claude/commands/`, `company/decisions/`, `company/governance/`, `memory/global/`, `memory/wiki/`, `projects/delivery-saas/{memory,docs,src}`, `marketing/{brand,avatars,linkedin}`, `integrations/telegram-bridge/`, `dashboards/`, `sources/`.

**Agents built into `.claude/agents/`:**
- `Eco.md` (v0.1) — CEO subagent, Sonnet default, Opus for hard decisions. Built from `agents/Eco.md`.
- `Shelly.md` (v0.2) — Office Manager subagent, Haiku default, Sonnet for drafting. Built from `agents/Shelly.md`.
- `Hila.md` (v0.1) — Marketing subagent draft, Sonnet. Built from `agents/Hila.md`.
- `Designer.md` (v0.1) — Designer subagent draft, Sonnet. Built from `agents/Designer.md`.

**Company docs moved to `company/`:**
constitution.md (v2.2), roster.md (v2.2), org-chart.mermaid, model-matrix.md (v1.0), role-file-template.md, setup-guide.md, build-log.md (this file).

**Governance stubs created:**
`company/decisions/decisions-log.md` (initialized), `company/governance/gate-register.md` (v1 stubs), `company/governance/access-matrix.md` (v1 from repo-structure tiers).

**Memory stubs created:**
`memory/board.md`, `memory/log.md`.

**Marketing:**
`marketing/content-calendar.md` (from marketing-p1-kit.md, P1 light track).

**Sources (archived originals, gitignored):**
All `eco-synthetic-*.md` planning files and original `agents/` folder moved to `sources/`.

**README.md refreshed** with new file index, version labels v2.2, next-session reference.

**next-session.md updated** to reflect scaffolded state and new opening tasks.

Still open / blockers: Telegram tokens (jecki), company account (jecki), agent certification (Anat/HR), two owner presentations (jecki to share), domain .com vs .ai decision (Shelly, after Shelly is live).

---

## Ongoing process
- **Planning**: proposals enter through the decision or Initiative flow; the Devil's Advocate challenges; the owner approves A1 items.
- **Building**: agents are created through the lifecycle (Governance defines the role to standard, HR interviews and gets acknowledgment, Training certifies, Security and Legal clear tools, then live).
- **Modifying**: any R&R or structure change is A1, re-acknowledged via HR, and logged here and in the decisions log.
- **Improving**: the Operational-Excellence-led fitness loop and tool/skill discovery survey; QA quality trends to Quality; usage reports to Owner, CEO, and Operational Excellence.
- **Managing**: Eco orchestrates; dashboards go to the owner; meetings convene as needed; the compliance backlog is tracked by Eyal and Lital.
