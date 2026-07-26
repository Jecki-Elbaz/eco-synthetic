# Eco-Synthetic: Access Matrix v1.1

Revision 1.1 applied 2026-07-26 (owner A1 in session; AUD-006 cycle): Dalia revision draft
access-matrix-revision-draft-2026-07-14.md (Eco A2 2026-07-15) changes A/C/D/E/F/G applied --
Oracle chronicle row, runner output paths, Designer marketing gate notes, Dalia/Eyal/11-agent
PATH_SCOPE mirror rows. Change D notes updated to reflect the Rambo AUD-011 scan delivered
2026-07-25 (CLEAR-WITH-CONDITIONS).

**Owned by:** Dalia (Quality & Governance) — defines structure; Rambo (Security) — enforces.
Per constitution §9: access is need-to-know with read / write / archive rights.
This matrix is enforced by `CLAUDE.md` deny-list and `.claude/settings.json` tool permissions.

---

## Path-level ACL

| Path | Access tier | Who may read | Who may write | Notes |
|------|-------------|--------------|---------------|-------|
| `.env` | **Blocked** | Runtime only (no agent reads this directly) | Never (jecki only, manually) | Red line 5; gitignored |
| `sources/` | **Read-only** | Any agent (context) | Nobody | Archived originals; gitignored; never edit. Curated by Yossi (Training) + Assaf (OE): they own the tool-library index and train agents on its tools. Adopted tools are tracked in `gate-register.md`; no tool is used until gated. |
| `company/decisions/decisions-log.md` | **Append-only** | All agents | Append: all agents logging decisions | Never retroactively edit; immutable audit trail. Eyal (Legal) is a confirmed appender (gate verdicts, legal confirmations) -- covered by "all agents", made explicit to align with guard PATH_SCOPE (F-S806); append-only rule applies to Eyal identically. |
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
| `marketing/` | **Sales group** | Hila, Tim, Eco (narrative posts), Eyal (clearance reads) | Hila (assets), Tim (direction), Sally (VP Sales, per role file + guard F-S807) | Eco for company-narrative posts only. Alex: no write access to marketing/. Designer (Tal): visual-design write is GATED on AUD-011 -- Rambo scan DELIVERED 2026-07-25 (CLEAR-WITH-CONDITIONS): C1 restricts Tal to marketing/brand/ + marketing/avatars/ ONLY (never full marketing/); activation still requires the Eco/Dalia confirmation of the C1-scoped grant + a SEPARATE guard.py PATH_SCOPE edit (owner A1 + Shir apply, per scan C2). Until then Tal hands assets to Hila. After activation: Hila keeps strategy/voice/content; Tal owns visual design files; brand-guidelines edits need Hila editorial review (scan C4). |
| `marketing/brand/` | **Sales group** | Hila, Tim; A1 publish gate | Hila (drafts, A3); publish = A1 | Designer (Tal): write access GATED on AUD-011 (see marketing/ parent row; within Rambo C1 scope once activated). |
| `marketing/avatars/` | **Sales group** | Hila, Tim; A1 publish gate | Hila (drafts, A3); publish = A1 | Designer (Tal): write access GATED on AUD-011 (see marketing/ parent row; within Rambo C1 scope once activated). |
| `.claude/agents/` | **Owner/CEO only** | Eco (operational reads), jecki; READ also granted to: Anat (HR -- certification interviews and R&R competency review), Rambo (Security -- permission-scope scans per scan policy), Dalia (Q&G -- quality audits and tone governance), Assaf (OE -- agent fitness loop and model-matrix sync), RedTeam/Red (Red-Team Security Tester -- target-accurate adversarial probe design; same operational read basis as Rambo/Anat, no write; Phase 1 audit F-R03, owner A1 2026-06-23) | jecki (A1 for any change) | Agent role files are A1 to create/change/retire. Read access for Anat, Rambo, Dalia, Assaf is a formalized matrix grant, not a special exception: these are legitimate business-need reads with no write. T-0012 reconciliation: A2 (Eco decides, jecki notified, Dalia + Rambo reviewed, logged 2026-06-16). Write remains owner A1 only. |
| `integrations/` | **Partitioned** | Shir (DevOps), Eco | Shir (DevOps), under VP R&D approval | Telegram bridge and future integrations |
| `reports/daily-summaries/` | **Owner + CEO only** | jecki (owner), Eco | Eco (writes on each summary run) | Daily end-of-day summaries; filename format daily-summary-YYYY-MM-DD-HHMM.md; A1 required to grant any other agent read access |
| `dashboards/` | **Restricted** | Lital (CFO), jecki | Assaf (OE templates), Lital (financial views) | Owner-facing views only |
| `company/security/` | **Restricted** | Rambo, jecki | Rambo (A3 operational), jecki (A1) | Security reports and scan output. All other access A1. |
| `company/security/reports/` | **Restricted** | Rambo, jecki | Rambo (write), jecki (A1) | Gated security findings. Never shared without Eco + owner approval. |
| `company/customers/` | **Restricted** | Eco, Lital (CFO), Mike (VP CS, when active), jecki | Eco, Mike (VP CS) in domain; Lital (financial fields) | Customer records + interface logs; serving agents read the specific record on demand to fulfil a logged request. Shelly is the first/reference customer (owner-office spinout). Added owner A1 2026-06-17 via the approved Shelly-separation plan. |
| `company/` and `memory/` (Oracle chronicle read) | Broad-read, scoped-write | Oracle (broad read of company/ and memory/ for chronicle context; same read basis as Eco) | Oracle (company/chronicle/ + own activity rows in memory/log.md ONLY -- verified vs Oracle.md 2026-07-26; no write to company/governance/, company/security/reports/, or .claude/agents/) | Broad read required to chronicle company state. Eco authorizes each chronicle task. Rambo confirms write scope on next Oracle permission scan. (AUD-006 Change A) |
| `memory/runner-state.json` | Operational | Assaf (OE), Eco, jecki | Runner (integrations/runner/runner.py, atomic write after each job; owner: Shir) | Per-trigger last-run health state; single source of truth for per-trigger health (schedules.md "Last run" column is not authoritative). (AUD-006 Change C) |
| `memory/agent-runs.jsonl` | Operational | Assaf (OE), Eco, Lital (CFO, financial aggregation), jecki | Runner (append per job via --output-format json; owner: Shir) | Per-run cost + token log. Assaf owns operational token/run reporting; Lital owns financial-$ aggregation + owner-dashboard finance view (AUD-010 canonical split). Append-only in practice. (AUD-006 Change C) |
| `company/policies/` | **Restricted** | All agents (need-to-know policy read), Eco, Anat (HR), jecki | Dalia (policy framework ownership, DAL-001); A2 (Eco) for company-wide policy activation; A1 (owner) for binding policies | Policy index + approved policy files. Superseded policies archived, never deleted. (AUD-006 Change E / guard F-S805) |
| `company/post-mortems/` | **Restricted** | Eco, Anat (HR), Rambo, Dalia, jecki; relevant VPs per incident on Eco approval | Dalia (lessons-learned post-incident reports) | Read gated to relevant parties per incident scope. (AUD-006 Change E / guard F-S805) |
| `company/governance/quality-audit-log.md` | **Restricted** | Eco, Rambo, Anat (HR), jecki | Dalia (append per audit cycle) | Append-only in practice; no retroactive edits (same rule as decisions-log). (AUD-006 Change E / guard F-S805) |
| `company/legal/` | **Restricted** | Eco, Dalia (governance cross-reference), Lital (CFO, financial cross-references), jecki | Eyal (DPA drafts, legal memos, ToS analyses, PPL compliance documents) | Sole write authority: Eyal. Directory created 2026-07-26 with .gitkeep. (AUD-006 Change F / guard F-S806) |
| `company/cs/` | **Restricted** | Mike (VP CS), Jenny, Jack, Ella, Eco, Lital (financial fields), jecki | Mike (VP CS domain -- policy files, SOPs, CS-0001 and future CS policies) | CS group working area; reps write to sub-paths below. (AUD-006 Change G / guard F-S807) |
| `company/cs/tickets/` | **Restricted** | Mike, Jack, Eco, jecki | Jenny (tier-1 CS; ticket summaries only) | PPL retention: 2 years from close, then delete/anonymize (AUD-004 / Eyal CS retention). |
| `company/cs/accounts/` | **Restricted** | Mike, Jenny, Eco, jecki | Jack (CSM + Account Manager) | Mike reviews. |
| `company/cs/training/` | **Restricted** | Mike, Jenny, Jack, Eco, jecki | Ella (Customer Trainer) | Mike reviews. |
| `company/research/` | **Restricted** | Eco, relevant VPs (on Eco designation), jecki | Zvika (research analyst; write when explicitly designated by Eco per task) | Eco designates exact path per task; directory created on first designated task. (AUD-006 Change G) |
| Google Drive (read-only) | External | Eco, Claude Code | read via MCP; no write |
| Google Calendar (read-only) | External | Eco (context) | read only; no create/edit |

Per-agent projects/ scope notes (AUD-006 Change G, mirrors guard F-S807): Sami -- assigned
project ONLY per task envelope (behavioral hard-partition; guard prefix is projects/);
Roman -- projects/delivery-saas/docs/algorithms/; Zvika -- projects/ when Eco designates
(T-0043 precedent); Designer (Tal) -- projects/delivery-saas/docs/; MeetingPrep -- no write
tools, no matrix write entry (guard ALLOWED_AGENTS membership is for spawn permission only).

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
