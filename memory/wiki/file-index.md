# File Index & Legend -- Eco-Synthetic

Living index of every significant informational file in the repo. Updated as files are created, retired, or re-scoped. Owned by Yael (Knowledge/Documentation Manager). Last updated: 2026-06-27.

---

## Index by location

### company/ (Core governance and policy)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| company/constitution.md | jecki | Governance rules, approval gates, hierarchy, red lines, and agent lifecycle. | live v2.2 |
| company/soul.md | Dalia (Q&G) | Company culture, tone standards, core behavioral rules for all agents. | live v1.0 |
| company/roster.md | Eco | Current org structure, role assignments, names, hierarchy, and pending additions. | live v2.2 |
| company/md-style.md | jecki | Internal machine-facing documentation style guide (caveman, lean, ASCII). | live |
| company/role-file-template.md | Anat (HR) | Standard template for all agent role files (R&R md format). | live |
| company/model-matrix.md | Assaf (OE) + Dalia (Q&G) | AI model selection rules, defaults by agent, when to escalate models. | live |

### company/governance/ (Access control, standards, compliance)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| company/governance/access-matrix.md | Dalia (Q&G) / Rambo (Security) | Path-level ACL, who reads/writes what, per-agent working memory rules. | live v1.0 |
| company/governance/file-index.md | Yael (Knowledge/Doc Mgr) | [THIS FILE] Living legend of all informational files and their owners. | live |
| company/governance/documentation-standard.md | Yael (Knowledge/Doc Mgr) | [NEW] Naming conventions, file structure, versioning policy, file-addition checklist. | live v1.0 |
| company/governance/gate-register.md | Eyal (Legal) | Tool adoption register; every external tool, MCP, skill with gating verdict and pin. | live |
| company/governance/security-baseline.md | Rambo (Security) | Security standards, assessment templates, mitigation-solution format. | live |
| company/governance/agent-tool-spawn-allowlist.md | Eco (A2) | Permitted/denied list for Agent tool bridge spawns (non-Bash vs Bash agents). | live |
| company/governance/schedules.md | Assaf (OE) | Trigger schedule rows; cadence, owner, contact method, success metric per row. | live |
| company/governance/compliance-backlog.md | Eyal (Legal) + Lital (CFO) | Israeli registration, tax, privacy, invoicing, account-migration items and status. | live |

### company/decisions/ (Audit trail, append-only)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| company/decisions/decisions-log.md | Dalia (Q&G) | Append-only log of all company-wide decisions, approvals, policy changes, and gates. | live |

### company/governance/proposals/ (Draft and proposed changes)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| company/governance/proposals/proactivity-program-plan.md | Assaf (OE) | Full phased plan for scheduled + event triggers; Tier-1/2/3 activation roadmap. | live |
| company/governance/proposals/git-sync-autonomous-security-design.md | Rambo (Security) | Design for autonomous security review of git changes; trigger, classification, checks. | live |

### company/governance/gate-reviews/ (Security and legal assessment record)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| company/governance/gate-review-agent-tool-eco-rambo.md | Rambo (Security) | Full gate assessment for Agent tool (Telegram bridge); verdicts, conditions, mitigations. | live |
| company/governance/gate-review-whatsapp-mcp-rambo.md | Rambo (Security) | Gate assessment for whatsapp-mcp; 9 conditions, inbound-msg injection HIGH risk. | live |
| company/governance/gate-review-caveman-skill-rambo.md | Rambo (Security) | Gate assessment for caveman skill; MIT clear; 4 conditions (no curl\|bash install). | live |
| company/governance/gate-review-hebrew-rtl-rambo.md | Rambo (Security) | Gate assessment for hebrew-rtl-best-practices skill (skills-il v1.3.0); A2 sufficient. | live |
| company/governance/gate-review-shelly-shortlist-rambo.md | Rambo (Security) | Batch gate review of 8 Shelly tools (5 skills-il + 3 MCPs); verdicts and conditions. | live |
| company/governance/gate-review-shelly-flags-rambo.md | Rambo (Security) | Cross-project flag review of Shelly tool-install issues; tag fixes, SHA resolution. | live |
| company/governance/gate-review-formation-batch-rambo.md | Rambo (Security) | Gate review of 3 formation+compliance skills; verdicts (2 CLEAR, 1 PARTIAL). | live |

### company/security/ (Restricted: Rambo + owner only)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| company/security/reports/T-0020-2026-06-15.md | Rambo (Security) | [RESTRICTED] Full Agent-tool security assessment; access Rambo+owner only. | live |

### company/hr/ (Human Resources and agent onboarding)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| company/hr/onboarding-runbook.md | Anat (HR) | Standard process for agent certification: B1-B7 stages, test execution, schedules. | live v2.0 |

### company/hr/competency/ (Agent competency tests, specs, and results)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| company/hr/competency/<Name>-spec.md | Anat (HR) + agent manager | Competency spec for each agent: domain knowledge list, test scenarios, pass criteria. | live (per agent) |
| company/hr/competency/<Name>-test-results.md | agent manager | B3 test results: scenarios run, actual outputs, pass/fail verdict, timestamp. | live (per agent) |
| company/hr/competency/<Name>-rambo-scan.md | Rambo (Security) | B5 permission scan for each agent; verdict, conditions, scans appended to baseline. | live (per agent) |

### company/processes/ (Standard procedures and runbooks)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| company/processes/agent-hiring.md | Anat (HR) | Full agent hiring workflow: role drafting, competency specs, B1-B7 stages, gates. | live |
| company/processes/permission-scan-2026-06-18.md | Rambo (Security) | Full report from initial 21-agent permission scan 2026-06-18; 5 flags, 14 clear-with-notes. | live |
| company/processes/shelly-move-initial-audit.md | Eco | Initial capabilities audit for Shelly's move to standalone repo; all shortlist tools surveyed. | live |
| company/processes/shelly-handover-package.md | Eco | Content to apply in Shelly's new standalone repo; gate-register, CLAUDE.md, tools, memory. | live |
| company/processes/git-sync-phaseA-proposal.md | Ido (VP R&D) | Phase A implementation plan for autonomous git-sync security gate (per Rambo design). | live |

### company/memos/ (Informal notes, briefings, analysis)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| company/memos/design-decisions-brief-2026-06-14.md | Eco | Design decisions presented to owner for approval (file-lock, JSONL, wiki-memory, Gemini). | live |
| company/memos/eco-channel-tools-assessment-2026-06-15.md | Eco | Priority tool requests for Eco: Agent tool (P1), Bash read-only (P2), Calendar create (P3). | live |
| company/memos/eco-b7-preliminary.md | Eco | Preliminary go-recommendations for all 11 P1 agents based on role-file review. | live |

### company/customers/ (Customer records and profiles)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| company/customers/shelly/profile.md | Eco | Shelly customer profile; separation executed 2026-06-20, now external party/customer. | live |

### memory/ (Shared activity and working memory)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| memory/board.md | Eco | Cross-company task board; all task IDs, status, owners, due dates, priorities. | live |
| memory/log.md | all agents (append) | Running activity log; all agents append their actions, decisions, and findings. | live |

### memory/wiki/ (Knowledge base, living documents)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| memory/wiki/agent-roster.md | Eco | Current agent org, personas, Hebrew names, addressing registry, org-by-group. | live v3.0 |
| memory/wiki/backlog-summary.md | Eco | Open tasks by priority; owner-blocked, P1, P2, blocked, done; updated 2026-06-18. | live |
| memory/wiki/file-index.md | Yael (Knowledge/Doc Mgr) | [THIS FILE] Living index of informational files, purpose, owner, status. | live |

### memory/owner-dashboard.md (Owner-facing views, restricted)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| memory/owner-dashboard.md | Ido (R&D) + Eco | Owner-facing task summary, key blockers, tools requests, morning-brief checklist. | live (interim) |

### .claude/agents/ (Agent role files -- restricted, owner A1 to modify)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| .claude/agents/<Name>.md | jecki (A1 edits), agent manager (R&R changes) | Role file for each agent; purpose, responsibilities, authority, boundaries, data access. | live (per agent) |

Count: 29 internal agents certified + live + 1 external customer (Shelly). Total agent files: 30.

### marketing/ (Brand, content, public-facing assets)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| marketing/brand/ | Sally (VP Sales) + Hila (Marketing) | Brand foundations, messaging, visual guidelines, publishing gate. | draft/partial |
| marketing/avatars/ | Sally (VP Sales) + Hila (Marketing) | Product avatars/personas; publish gate A1 + Legal + Security clearance. | draft/partial |
| marketing/content/ | Hila (Marketing) | Content calendar, blog drafts, social media assets, campaign plans. | draft/partial |

### integrations/ (External integrations and bridges)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| integrations/runner/ | Shir (DevOps) | Telegram bridge task runner; async message handling, timeouts, error recovery. | in-progress |

### reports/ (Owner and operational reporting)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| reports/daily-summaries/ | Eco (writes) | Automated daily end-of-day summaries; filename format daily-summary-YYYY-MM-DD-HHMM.md. | live |
| dashboards/ | Assaf (OE templates), Lital (financial views) | Owner-facing financial and operational dashboards; restricted Lital+jecki. | live |

### sources/ (Read-only archived originals; owned by Yossi + Assaf)

| Path | Owner agent | Purpose (one-line) | Status |
|------|-------------|-------------------|--------|
| sources/ | Yossi (Training) + Assaf (OE) | External tool library, IL skills, MCP repos; archived originals, never edit. | archived |

---

## Naming conventions applied

Files in this index follow these conventions:

1. **File names**: kebab-case (hyphens), all lowercase, purpose-descriptive.
   - Example: `gate-review-agent-tool-eco-rambo.md` = gate review + tool name + agent + date.
   - Exception: Agent files `.claude/agents/<Name>.md` use CamelCase (agent name).

2. **Folder structure**:
   - `company/`: Policy, governance, constitution, decision log (A1-gated content).
   - `company/governance/`: Access control, standards, gate registers (Dalia/Rambo domain).
   - `company/decisions/`: Append-only audit trail (Dalia-owned).
   - `company/security/`: Restricted security reports (Rambo+owner only).
   - `company/hr/`: Agent hiring, specs, test results (Anat domain).
   - `company/processes/`: Standard procedures and runbooks.
   - `company/memos/`: Informal analysis, briefs, assessments (not binding policy).
   - `company/customers/`: Customer profiles and service records.
   - `memory/`: Shared activity, task board, working memory (append-only where noted).
   - `memory/wiki/`: Knowledge base, living documents maintained by agents.
   - `marketing/`: Brand, avatars, public content (restricted to Sales group).
   - `integrations/`: External bridges and integrations (DevOps domain).
   - `reports/`: Owner and operational reporting (restricted).
   - `sources/`: Read-only archived originals (never edit; copy first).
   - `.claude/agents/`: Agent role files (jecki A1 to edit; Anat + manager to propose changes).

3. **Versioning**:
   - Policy files: `v1.0` = active, `v2.x` = incremental updates, `SUPERSEDED` = replaced (with note to new version).
   - Draft files: `draft`, `proposal`, `interim` tags in filename or status column.
   - No version tag = evergreen or append-only (e.g., board.md, log.md, decisions-log.md).

4. **File status values**:
   - `live` = authoritative, in use, enforced.
   - `draft` = proposal, not yet approved or active.
   - `archived` = retired, not in use, preserved for reference.
   - `in-progress` = actively being built or updated.
   - `pending` = waiting on approval or completion of a gate.

---

## Ownership and write authority

Each file is owned by one agent or role (listed in the "Owner agent" column). Write authority:

- **A1 (jecki, owner)**: constitution.md, soul.md, role-file edits, any red-line document, public legal statement, Rasham registration, budget approvals.
- **A2 (Eco, CEO)**: major policy changes (e.g., access-matrix), model-matrix changes, tool adoption decisions, cross-project decisions.
- **A3 (responsible agent, usually domain owner)**: routine updates within their domain (e.g., Dalia updates governance docs within Q&G scope; Anat updates HR onboarding processes).
- **Append-only**: decisions-log.md, memory/log.md, memory/board.md (agents write to their own rows).

---

## How to add a new file to the index

1. **Create the file** in the appropriate folder per the structure above.
2. **Use a name** that follows the conventions: kebab-case, lowercase, purpose-descriptive (except agent files).
3. **Add a row to this index** with: path | owner agent | purpose (one-line) | status.
4. **Update the relevant agent's row** in memory/board.md to note the file creation (if significant).
5. **If the file is policy or governance**: append an entry to company/decisions/decisions-log.md with the approval gate and date.

---

## What NOT to put in tracked files

Per CLAUDE.md red lines and constitution:

- Never commit secrets, tokens, passwords, API keys, or personal credentials (.env is gitignored).
- Never store raw personal data (personal correspondence, private email content, financial details of individuals) in tracked files.
- Never include raw email or message content verbatim from external sources (summarize only, with permission).
- Never edit company/decisions/decisions-log.md retroactively; append only.
- Never write to sources/ (read-only archived originals).
- Never edit constitution.md, soul.md, or red-line documents without A1.

---

## Recent additions and retirements

**2026-06-27**: Yael (Knowledge/Doc Mgr) created this index (DAL-002 task) and company/governance/documentation-standard.md.

**2026-06-20**: Shelly separated to external customer; company/customers/shelly/profile.md created (migration of owner-office role).

**2026-06-18**: Rambo permission-scan report and bat-gate reviews added; agent-roster.md updated to v3.0 with renames and personas.

**2026-06-15**: Eco competency specs, test-results shells, onboarding-runbook v2.0, design-decisions brief, tools assessment memo all created.

**2026-06-12**: Repository scaffolded; constitution.md, soul.md, role-file-template.md, access-matrix.md created; company/ structure initialized.

---

## Index maintenance

This index is updated whenever:
- A new file is created (add row within one cycle).
- A file is retired or archived (mark status as archived, keep row for reference).
- A file is renamed or moved (update path, note the change in memory/log.md).
- A file's owner is reassigned (update owner-agent column, log the change).
- A significant policy change is made (update purpose if needed).

Last review: 2026-06-27 by Yael.
