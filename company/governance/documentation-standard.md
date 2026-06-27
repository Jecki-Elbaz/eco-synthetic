# Documentation Standard -- Eco-Synthetic (v1.0)

Owner: Yael (Knowledge/Documentation Manager, L4, under Dalia Q&G). Approval: A2 (Dalia), applies to all agents. Last updated: 2026-06-27. Status: live.

How to name, version, structure, and maintain all informational files in the repo. Enforces consistency, discoverability, and governance over time.

---

## 1. File naming conventions

### General rules

- **Format**: kebab-case (hyphens), all lowercase, no underscores, no spaces.
- **Length**: max 60 chars; shorter is better. Disambiguate only when needed.
- **Purpose-first**: name tells you what the file is and why (e.g., `gate-review-agent-tool-eco-rambo.md` says gate review + tool + reviewer).

### Examples

- Policy file: `documentation-standard.md` (clear, short, general audience).
- Gate review: `gate-review-agent-tool-eco-rambo.md` (gate + tool + reviewer + date if multiple).
- Onboarding: `onboarding-runbook.md` (process name + type).
- Competency spec: `Ido-spec.md` (agent name + spec type); lives in company/hr/competency/ folder.
- Decision entry: No separate file; appended to company/decisions/decisions-log.md.

### Exceptions

- **Agent role files**: `.claude/agents/<Name>.md` — CamelCase (agent name only, no timestamp or status tag).
- **Archived files**: Mark `RETIRED-` or `SUPERSEDED-` prefix in filename when retiring; do not delete.
- **Draft files**: Mark `draft-` prefix while in-progress; rename when approved.
- **Dated files**: Use `YYYY-MM-DD` suffix only for time-series files (e.g., daily reports) or when multiple versions exist same day (e.g., `daily-summary-2026-06-27-0800.md`).

---

## 2. Folder structure and ownership

Each folder owns a domain and enforces access + write policy per access-matrix.md.

### company/ (Policy and governance)

**Content**: Constitution, soul, policy framework, approved standards, decisions-log.
**Owner**: jecki (A1 for constitution/red-lines); Dalia (Q&G) for governance standards; Eco (CEO policy).
**Write**: A1 for core policy; A2 for policy-framework changes; A3 for routine domain updates.

Subfolders:
- `company/governance/` — Access control, gate registers, compliance, schedules (Dalia + Rambo domain).
- `company/decisions/` — Append-only audit log of all company decisions (Dalia-owned, immutable).
- `company/security/` — Restricted security reports (Rambo + owner only; no agent read).
- `company/hr/` — Agent hiring, specs, test results, onboarding runbook (Anat domain).
- `company/hr/competency/` — Per-agent specs and test results (Anat + manager).
- `company/processes/` — Standard procedures, runbooks, workflows (process owner).
- `company/memos/` — Informal analysis, briefs, proposals (author-timestamped; not binding).
- `company/customers/` — Customer profiles and service records (Eco, Lital, Mike per access-matrix).

### memory/ (Shared activity and working knowledge)

**Content**: Task board, activity log, wiki (living documents, agent-maintained).
**Owner**: Eco (orchestrator); agents (own their rows/sections).
**Write**: Append-only for board.md and log.md; each agent writes to its rows. Wiki articles maintained by Eco + designated knowledge owners.

Subfolders:
- `memory/wiki/` — Knowledge base, agent roster, backlog summaries, file index (Obsidian-compatible; Eco maintains, agents contribute).
- `memory/owner-office/` — [RETIRED 2026-06-20; migrated to Shelly's standalone project].

### marketing/ (Brand, public content)

**Content**: Brand guidelines, avatars, social media, content calendar.
**Owner**: Sally (VP Sales), Hila (Marketing).
**Write**: Hila drafts (A3); publish gate is A1 + Legal (Eyal) + Security (Rambo) clearance.
**Access**: Hila, Sally, Eco (narrative posts only), Eyal (clearance read).

Subfolders:
- `marketing/brand/` — Brand identity, messaging, visual guidelines.
- `marketing/avatars/` — Product personas/avatars; publish = A1.

### integrations/ (External bridges, tools)

**Content**: Telegram bridge, API connectors, scheduled runners.
**Owner**: Shir (DevOps).
**Write**: Shir (A3 operational, A2 for major changes).
**Access**: Shir, Eco.

### reports/ (Dashboards, summaries, restricted)

**Content**: Automated owner dashboards, daily summaries, financial views.
**Owner**: Eco (summaries), Assaf (templates), Lital (financial).
**Write**: Eco (summaries A3), Lital (dashboards A3), Assaf (templates A2).
**Access**: Owner (jecki), CEO (Eco), CFO (Lital) per access-matrix.

### sources/ (Archived originals, read-only)

**Content**: External tool library, skills, MCP repos (never edit; copy to working folder first).
**Owner**: Yossi (Training) + Assaf (OE).
**Write**: Never. Copy to appropriate working folder before editing.
**Access**: Read-only for all agents (context reference).

### .claude/agents/ (Agent role files, restricted A1)

**Content**: Role file for each certified agent.
**Owner**: jecki (A1 edits), agent manager (propose R&R changes).
**Write**: jecki (A1 only). Manager + Anat propose via memo or board row, never direct edit.
**Access**: Eco (operational), jecki (owner), Anat (HR cert), Rambo (security scans), Dalia (Q&G), Assaf (fitness loop).

---

## 3. Version control conventions

### Policy and governance documents

Status values (used in file-index.md status column):

- **live vX.Y** — Active, enforced, agents must follow.
  - v1.0 = first stable release.
  - v1.1, v1.2 = incremental updates (bugs, clarifications); no major structural change.
  - v2.0 = major revision (significant new policy, structural reorganization); previous versions archived.

- **draft** — Not yet approved; not binding. Do not cite as policy.

- **SUPERSEDED (v2.0)** — Retired; replaced by v2.0. Kept for reference only. Do not follow.

- **archived** — No longer in use; kept for historical reference.

- *no version tag* — Evergreen documents (constitution, soul, roster, board, log, log). Update in-place without version bumps; tracked via git commit history.

### Example versioning timeline

- `documentation-standard.md` (v1.0, 2026-06-27) — First edition, approved, live.
- `documentation-standard-v1.1.md` — If a minor clarification is needed, increment to v1.1 (keep same filename or rename as `_v1.0-SUPERSEDED.md`).
- `documentation-standard-v2.0.md` — If a major restructure is needed (e.g., new folder scheme), create v2.0; archive v1.0 with SUPERSEDED note.

### Who can change versions

- **Policy document**: A2 (Dalia for governance std; Eco for company policy) or A1 (jecki for red-line docs).
- **Domain document** (e.g., onboarding-runbook.md owned by Anat): A3 by the domain owner; escalate to Dalia if the change affects other domains.
- **Living documents** (board.md, log.md, decisions-log.md): No version tag; agents append entries, append-only enforcement (no retroactive edits except by decision-log owner Dalia with A1).

---

## 4. What belongs in each folder

**Folder assignment logic** (route new files here):

- **Policy, constitution, red lines, decisions** → `company/` root or `company/decisions/`.
- **Access control, gate registers, compliance tracking** → `company/governance/`.
- **Security assessments and reports** → `company/security/` (restricted; Rambo + owner only).
- **Agent hiring, specs, test results, onboarding process** → `company/hr/` and `company/hr/competency/`.
- **Standard operating procedures, runbooks, workflows** → `company/processes/`.
- **Informal analysis, memos, strategy notes (not binding policy)** → `company/memos/`.
- **External customers, account records** → `company/customers/`.
- **Task board, activity log, wiki articles** → `memory/`.
- **Brand, avatars, marketing content** → `marketing/`.
- **Integrations, bridges, scheduled runners** → `integrations/`.
- **Owner dashboards, CFO views, reporting** → `reports/` or `dashboards/`.
- **Agent role files (one per agent)** → `.claude/agents/`.
- **External tools and libraries (never edit)** → `sources/`.

**Uncertain? Ask Yael.** If a file doesn't fit a clear category, flag it to Yael (Knowledge/Doc Mgr) for placement guidance. File her question as a memory/board.md row (e.g., DAL-task) and she'll advise.

---

## 5. Owner assignment and access

Every file has an owner (listed in memory/wiki/file-index.md).

**Owner responsibility**:
- Maintain accuracy and currency of the file.
- Control write access per the role's approval gate (A1/A2/A3).
- Flag the file for retirement when it becomes obsolete.
- Notify Yael (Knowledge/Doc Mgr) when a file is created, renamed, or retired (so file-index.md stays current).

**Change process**:
1. **Within domain, A3 matter**: Owner edits directly (e.g., Rambo updates security-baseline.md, Anat updates onboarding-runbook.md).
2. **A2 matter** (e.g., access-matrix change): Propose to Dalia; Dalia decides; requestor edits with A2 approval; append entry to decisions-log.md.
3. **A1 matter** (e.g., constitution edit): Propose to jecki via Dalia; jecki approves; jecki or delegated editor makes change; logged to decisions-log.md.
4. **Multi-domain impact**: Yael flags to Dalia; Dalia coordinates approval; change logged to decisions-log.md.

---

## 6. How to add a new file (checklist)

When you need to create a file:

1. **Decide the location** using the folder-assignment logic above (section 4).
2. **Choose a name**: kebab-case, lowercase, purpose-descriptive, max 60 chars. If it will be versioned, include `vX.Y` only if not the first edition (no v1.0 in filename; use status column in file-index.md instead).
3. **Create the file**: Write content following company/md-style.md (caveman style for machine-facing docs; readable prose for human-facing). Use ASCII only (no em dashes, curly quotes).
4. **Set the owner**: Your role (the one who will maintain it) or your manager/group.
5. **Add to file-index.md**: Yael (Knowledge/Doc Mgr) will update within one cycle, OR you can add the row yourself (A3 if you're the owner; check with Yael if uncertain).
   - Format: | path | owner agent | purpose (one line) | status |
6. **Log the creation**: If it's a significant policy or governance file, append an entry to company/decisions/decisions-log.md with approval gate and date. Routine files (e.g., a new competency spec) do not need a separate log entry.
7. **Notify Yael**: Send Yael a one-line message (chat or board row) so she can prioritize the file-index update.

---

## 7. Style and format rules

All tracked files must follow:

### Machine-facing (internal docs agents read)

- **Style**: Caveman/imperative per company/md-style.md. Drop articles, filler, restated context.
- **Format**: Markdown (`.md`). One instruction per line. Use symbols: `->` (then/leads-to), `!=` (is-not), `&` (and).
- **ASCII only**: No em dashes, curly quotes, decorative Unicode. Plain hyphen `-` for dashes. (Soul Core Block rule 5.)
- **Keep exact**: File paths, agent names, gate codes (A1/A2/A3), red-line refs, constitution § refs, numbers, thresholds.

### Human-facing (owner memos, customer docs, public)

- **Style**: Clear, readable prose. No unnecessary jargon. Explain the why, not just the what.
- **Tone**: Per soul.md: Owner (warm, explanatory, leading with the answer). Customer (understanding, caring). Peer-agent (concise, precise).
- **Format**: Markdown or Obsidian-compatible plaintext.
- **Emoji**: Sparingly in messages to humans for tone; none in tracked files (except soul.md carve-out for Core Block code blocks). (Soul Core Block rule 5, approved 2026-06-13.)

### Common structure

All significant documents include:

- **Title**: H1 (`# Title`), clear and unique.
- **Metadata**: Owner, version, approval gate, last updated, status (one-line, top of file).
- **Purpose**: Why this document exists (1-2 sentences).
- **Sections**: Logical headings (H2, H3), numbered if hierarchical.
- **Table of contents**: If longer than 2 screens, add a TOC.

---

## 8. Red lines: what NOT to put in tracked files

Per constitution and CLAUDE.md:

1. **Secrets and credentials**: Never commit API keys, tokens, passwords, `.env` values. `.env` is gitignored; keep it there.
2. **Personal data**: Never store raw personal information (individual financial details, private correspondence, personal medical/legal data) in tracked files unless strictly necessary for a documented business purpose and compliant with Israeli privacy law.
3. **Raw external content**: Never paste verbatim email or message content from external parties into tracked files. Summarize only, with explicit source attribution.
4. **Retroactive edits to decisions-log.md**: The log is append-only, immutable. New entries go at the bottom. If you find a mistake or conflict, append a clarification entry or flag to Dalia; never edit an existing entry.
5. **Writes to sources/**: That folder is read-only archived originals. Copy to your working folder first, then edit the copy.
6. **Edits to red-line documents** without approval: constitution.md, soul.md, and any file marked "red line" in its header are A1-gated. Propose changes to jecki via Dalia; never self-edit.

---

## 9. File maintenance and lifecycle

### New file checklist (at creation)

- [ ] Location matches folder-assignment logic (section 4).
- [ ] Filename is kebab-case, lowercase, descriptive, max 60 chars.
- [ ] Owner is assigned (yourself or delegated).
- [ ] Content follows style rules (section 7): ASCII only, machine-facing = caveman, human-facing = readable.
- [ ] If policy/governance: approval gate noted and applied.
- [ ] If significant: entry appended to decisions-log.md.
- [ ] File-index.md row added by owner or Yael within one cycle.

### Active file maintenance

- **Currency**: Owner reviews file at least annually (or per trigger in memory/board.md task).
- **Accuracy**: If you find an error or gap, fix it (A3 within domain) or flag to owner.
- **Discoverability**: Ensure file-index.md row is accurate and file is linked from relevant sections.

### File retirement

- **When**: Owner decides file is no longer needed (superseded, obsolete, or consolidated into another).
- **How**: Do NOT delete. Rename with `RETIRED-` or `SUPERSEDED-` prefix; mark status as "archived" in file-index.md; append a note to the top of the file (e.g., "SUPERSEDED 2026-06-27 by documentation-standard.md").
- **Log it**: Append a one-line entry to memory/log.md noting retirement.

### Periodic audits

Yael (Knowledge/Doc Mgr) conducts monthly audits:

- **File-index accuracy**: Spot-check 5-10 files; verify path, owner, purpose match reality.
- **Naming compliance**: Flag any non-conforming names; propose fixes to Dalia.
- **Style compliance**: Sample 2-3 machine-facing docs; verify ASCII, caveman style.
- **Near-duplicates**: If two files appear to cover the same topic, flag to Dalia with proposed resolution.

---

## 10. How to update the file index

Yael maintains memory/wiki/file-index.md as the canonical legend. If you create a new file:

**Option A (Yael updates)**: Send Yael a one-line note (chat or board row) with:
- File path
- Owner agent
- One-line purpose
- Status (live / draft / archived)

Yael will add the row within one cycle.

**Option B (you update)**: If you own the file and want to add it immediately:
- Add a row to memory/wiki/file-index.md in the appropriate section.
- Format: `| path | owner agent | purpose (one line) | status |`
- Notify Yael that you've added it (so she knows it's in the index).

Either way, the file-index.md row is added within one cycle of creation. Yael flags the row for review at the next audit.

---

## 11. Examples

### Adding a new policy document

**Scenario**: Sally (VP Sales) needs to write a customer-communication policy.

1. **Folder**: company/ or company/memos/ (decision: is it binding policy or a draft for approval?).
   - If binding: `company/governance/customer-communication-policy.md` (owned by Eco or Sally).
   - If draft: `company/memos/customer-communication-policy-draft.md` (owned by Sally, status = draft).

2. **Filename**: `customer-communication-policy.md` (kebab-case, purpose-clear).

3. **Content**: Follow company/md-style.md (caveman for internal process docs).

4. **Approval**: If it's a company policy, get Eco A2 + Dalia review (add to board as DAL task). If it's a draft for feedback, no approval needed yet.

5. **File-index**: Add row when approved.
   - `| company/governance/customer-communication-policy.md | Sally (VP Sales) | Rules for agents communicating with customers. | live v1.0 |`

6. **Log it**: Append to decisions-log.md: "2026-06-27 | Sally | Customer-communication policy approved A2 (Eco). File: company/governance/customer-communication-policy.md."

### Adding a competency test result

**Scenario**: Anat runs B3 tests for a new agent (Yael). Anat writes test results.

1. **Folder**: `company/hr/competency/` (standard location for agent tests).

2. **Filename**: `Yael-test-results.md` (agent name + test-results).

3. **Content**: Three scenarios run, outputs captured, pass/fail verdict (3/3 PASS).

4. **Approval**: Not needed (B3 is Anat's operational responsibility, A3).

5. **File-index**: Yael or Anat add the row:
   - `| company/hr/competency/Yael-test-results.md | Anat (HR) | B3 test results for Yael; scenarios, outputs, verdict. | live |`

6. **Log it**: No separate log entry needed (competency tests are routine). Board row (ONB-XXX task) updated to reflect B3 complete.

### Retiring a memo

**Scenario**: An old memo from 2026-05 is superseded by a new decision.

1. **Rename**: `company/memos/old-memo.md` → `company/memos/RETIRED-old-memo-superseded-by-decision-2026-06-27.md`.

2. **File-index**: Update status to "archived"; optionally add note in purpose column (e.g., "RETIRED; see decisions-log.md 2026-06-27").

3. **Log it**: Append to memory/log.md: "2026-06-27 | Yael | file-retirement | Retired company/memos/old-memo.md; superseded by decisions-log entry 2026-06-27."

---

## Related documents

- `memory/wiki/file-index.md` — Living legend of all files.
- `company/constitution.md` — Approval gates, red lines.
- `company/soul.md` — Tone and style standards.
- `company/md-style.md` — Machine-facing documentation style (caveman, lean).
- `company/governance/access-matrix.md` — Read/write permissions by path.
- `company/decisions/decisions-log.md` — Append-only audit log of approvals.

---

## Feedback and updates

This standard is A2-gated. Changes to structure, folder rules, or version policy require:

1. Proposal to Dalia (Q&G).
2. Dalia reviews with Yael (Knowledge/Doc Mgr).
3. Dalia A2 decision + Eco/jecki notification.
4. Appended to decisions-log.md.

Feedback: Contact Yael or Dalia via board row (e.g., DAL-task) or direct message.

---

**Last updated**: 2026-06-27 by Yael (Knowledge/Documentation Manager) under Dalia (Q&G). Approved A2 (Dalia). Status: live v1.0.
