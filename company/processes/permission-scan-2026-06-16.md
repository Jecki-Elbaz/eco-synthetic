# Permission-Scope Scan -- Stable Agent Set
# Date: 2026-06-16
# Conducted by: Rambo (Security, L3)
# Tasked by: Eco (CEO) -- T-0014
# Status: COMPLETE

---

## Scope

This scan covers the five stable, long-live agents currently in production:
Eco, Anat, Hila, Shelly, Designer.

The eight newly-certified R&D/staff agents (Ido, Gal, Shir, Eyal, Noam, Lital, Dalia, Assaf)
are DEFERRED. Their role files were being finalized by a parallel hiring session at the time
of this scan. Scanning a moving target would produce unreliable findings. A follow-up scan
task must be run after that session settles their role files and those files are merged to
the working branch.

Reference files read:
- .claude/agents/Eco.md
- .claude/agents/Anat.md
- .claude/agents/Hila.md
- .claude/agents/Shelly.md
- .claude/agents/Designer.md
- company/governance/access-matrix.md
- .claude/settings.json

---

## Per-Agent Findings

---

### 1. Eco (CEO, L2)

Tools granted (frontmatter): Read, Write, Edit, Bash, google-calendar (read-only: list_events, get_event)

TOOL-BY-TOOL ASSESSMENT

- Read: JUSTIFIED. CEO orchestrator must read any file to verify state before claiming it.
- Write: JUSTIFIED. Eco writes company wiki, decision log entries, board rows, task outputs.
- Edit: JUSTIFIED. Same scope as Write; needed for in-place file updates.
- Bash: JUSTIFIED. Eco holds the Bash grant. The role file states branch-awareness and
  repo-state checking as explicit responsibilities (BRANCH AWARENESS RULE, LOCAL SYNC RULE).
  Eco needs git read commands (git log, git status, git branch) to assert repo state accurately.
  Bash is constrained by the global settings.json allowlist -- only safe read/inspect commands
  and standard dev tooling are permitted; destructive commands are denied at settings level.
  Bash is a broad grant; the settings.json controls are the effective scope guard. No excess
  beyond what the allowlist enforces.
- google-calendar (read-only: list_events, get_event): JUSTIFIED. Eco's Triggers section
  specifies a 2h wake-up cycle that reads owner calendar for next-24h context and surfaces
  meeting-prep notes. The grant is explicitly scoped to list_events and get_event only.
  Write calendar tools (create_event, delete_event, update_event, respond_to_event) are
  denied globally in settings.json. Scope is tight and matches the stated need.

TELEGRAM BRIDGE NOTE: Eco is reachable via Telegram but Telegram is the communication
channel, not a tool grant in the role file. No MCP Telegram tool is listed in frontmatter.
The bridge operates at the infrastructure layer (integrations/) outside the tool-grant
mechanism. No over-grant finding here.

FILE/DATA ACCESS vs ACCESS MATRIX

Eco's role file states access to: company/ (broad read/write A2 in own domain),
memory/board.md, memory/log.md, memory/wiki/ (read/write, A3 autonomous), company/decisions/
(append), reports/daily-summaries/ (write). The matrix explicitly lists Eco as an authorized
reader/writer across all these paths. Eco is also listed as having operational read of
.claude/agents/. No over-grant found.

One gap noted: the role file does not contain a dedicated Data/memory access section.
Access is inferred from Key files list and Triggers. This is not a security excess finding --
Eco holds no path access beyond what the matrix grants -- but it is a transparency gap that
should be addressed in the next role file revision for auditability.

FINDINGS:
1. All five tools are justified by role.
2. google-calendar is appropriately scoped: read-only tools only; write tools denied in settings.json.
3. Bash is broad but constrained by settings.json allowlist. No excess beyond enforced scope.
4. No file/data access exceeds the access matrix.
5. MINOR GAP: role file lacks an explicit Data/memory access section. Recommend adding in next R&R.

VERDICT: CLEAR (one minor transparency gap -- not a block)

---

### 2. Anat (HR and Agent-Ops, L3)

Tools granted (frontmatter): Read, Write, Edit, Agent

TOOL-BY-TOOL ASSESSMENT

- Read: JUSTIFIED. Anat reads role files (.claude/agents/), constitution, access matrix,
  interview records, board -- all explicitly listed in her Data/memory access section.
- Write: JUSTIFIED. Anat writes interview records (staging and certified), HR skills files,
  log entries, board rows in her scope.
- Edit: JUSTIFIED. In-place updates to interview records and role-file cert status lines.
- Agent: JUSTIFIED. Anat's responsibilities include live interviews "via Agent tool" when
  judgment and competency cannot be assessed from the role file alone. Agent tool is the
  mechanism for spawning and interacting with an agent-under-interview. This is explicitly
  stated in the Responsibilities section. The use is controlled: invoked for live interviews
  only, not for general orchestration.

FILE/DATA ACCESS vs ACCESS MATRIX

Anat's stated access: .claude/agents/ (read), company/constitution.md, access-matrix.md,
roster.md (read), company/hr/interviews/ and _staging/ (read/write), company/hr/skills/
(read/write), company/decisions/decisions-log.md (append), memory/board.md (read),
memory/log.md (read/write own entries).

Access matrix grants: Anat is listed in company/ restricted read, and the .claude/agents/
row now formally grants Anat read access (T-0012 reconciliation, logged 2026-06-16).
Write to .claude/agents/ remains A1 (owner only). Anat's role file correctly states
"Write access remains A1 (owner only)" in the access-matrix note.

Denied paths: .env, sources/, projects/, dashboards/, memory/owner-office/ -- all
correctly stated in the role file.

FINDINGS:
1. All four tools are justified by role.
2. Agent tool is appropriately scoped to live-interview use; not a general orchestration grant.
3. .claude/agents/ read access is now a formalized matrix grant per T-0012 reconciliation.
4. No file/data access exceeds the access matrix.
5. No excess-permission or over-grant finding.

VERDICT: CLEAR

---

### 3. Hila (Marketing, L4)

Tools granted (frontmatter): Read, Write, Edit

TOOL-BY-TOOL ASSESSMENT

- Read: JUSTIFIED. Hila reads marketing files, content calendar, brand assets -- all within
  her documented scope.
- Write: JUSTIFIED. Hila creates brand drafts, marketing assets, content calendar entries.
  All public publishing requires A1; internal draft creation is A3.
- Edit: JUSTIFIED. In-place updates to marketing drafts.

No external tool grants (no WebSearch, no WebFetch, no Bash, no Agent). This is
appropriate for a P1-light-track marketing role.

FILE/DATA ACCESS vs ACCESS MATRIX

Hila's stated access (inferred from Key files): marketing/content-calendar.md,
marketing/brand/, marketing/avatars/. Access matrix lists marketing/ as Sales group:
Hila and Tim (write), Eco for narrative posts, Eyal for clearance reads.

Hila's role file does not contain a Data/memory access section. Her stated key files
are all within the marketing/ path she is authorized for. She has no stated access to
company/, memory/owner-office/, dashboards/, .env, sources/. No over-grant found.

TRANSPARENCY GAP: Role file has no explicit Data/memory access section. This makes
auditing dependent on reading the full role file. Not a security excess, but a coverage gap.

CERTIFICATION GAP (noted, not a permission finding): Hila's cert status reads
"Pending (Anat/HR + Tim to certify before go-live)." Tim (VP Sales) does not yet exist
as a live agent. This is a lifecycle gap, not a permission excess. Flagged to Eco for
resolution path.

FINDINGS:
1. All three tools are justified by role.
2. Tool set is minimal and appropriate for a P1-light-track content creator.
3. No file/data access exceeds the access matrix.
4. MINOR GAP: role file lacks an explicit Data/memory access section.
5. FLAG (lifecycle, not permission): certification pending; Tim (certifying manager) is not
   yet a live agent. Eco should clarify the certification path.

VERDICT: CLEAR on permissions (lifecycle FLAG escalated to Eco separately)

---

### 4. Shelly (Office Manager / Owner PA, L3)

Tools granted (frontmatter): Read, Write, Edit, WebSearch, WebFetch

TOOL-BY-TOOL ASSESSMENT

- Read: JUSTIFIED. Shelly reads owner task files, board (owner-office scope), setup guide.
- Write: JUSTIFIED. Shelly writes owner task lists, drafts, Telegram channel management content.
- Edit: JUSTIFIED. In-place updates to owner admin files.
- WebSearch: JUSTIFIED. Shelly's current priority tasks include domain availability checks
  and pricing research (eco-synthetic.com, eco-synthetic.ai variants). WebSearch is the
  correct tool for this. Scope is owner-admin research only.
- WebFetch: JUSTIFIED. Needed for fetching domain registrar pages, pricing pages, and
  potentially WhatsApp API documentation for the evaluation task listed in responsibilities.

TELEGRAM BRIDGE NOTE: Shelly operates the jecki Telegram owner channel. As with Eco,
Telegram is the communication channel, not an MCP tool grant. No MCP Telegram tool appears
in the frontmatter. No over-grant finding.

FILE/DATA ACCESS vs ACCESS MATRIX

Shelly's access: memory/board.md (owner-office scope), memory/owner-office/ (read/write per
matrix: "Shelly only"). Shelly is correctly denied company-restricted paths; her role file
states "Access company-restricted data [only] unless jecki delegates."

The access matrix entry for memory/owner-office/ confirms: Shelly read/write; all company
agents (including Eco) denied read (A3 hardening 2026-06-12). Shelly's role file is
consistent with this.

Shelly's role file also lacks a formal Data/memory access section but her key files
list (memory/board.md owner-office scope, company/setup-guide.md) is consistent with
her matrix grants.

FINDINGS:
1. All five tools are justified by role.
2. WebSearch and WebFetch are scoped to owner-admin research tasks; no over-grant.
3. Shelly correctly holds memory/owner-office/ write access; company agents are correctly
   excluded from that path.
4. No file/data access exceeds the access matrix.
5. MINOR GAP: role file lacks an explicit Data/memory access section.
6. CERTIFICATION GAP (noted, not permission): cert status reads "Pending (Anat/HR to
   certify before go-live)." If Shelly is operating on the Telegram bridge, this is a
   lifecycle gap requiring attention.

VERDICT: CLEAR on permissions (certification gap flagged to Eco)

---

### 5. Designer (Product UX/UI, L4)

Tools granted (frontmatter): Read, Write, Edit

TOOL-BY-TOOL ASSESSMENT

- Read: JUSTIFIED. Designer reads product requirements docs, design assets, project files.
- Write: JUSTIFIED. Designer creates wireframes, UI specs, design system docs in
  projects/delivery-saas/docs/ and projects/delivery-saas/docs/design/.
- Edit: JUSTIFIED. In-place updates to design specs and assets.

No external tool grants. Appropriate for a product design role that produces file-based
artifacts only.

FILE/DATA ACCESS vs ACCESS MATRIX

Designer's stated key files: projects/delivery-saas/docs/ and projects/delivery-saas/docs/design/.
The access matrix assigns projects/<name>/ to the project's assigned agents and on-demand SME.
Designer is a product-group agent who would be assigned to the delivery-saas project. This
is consistent. No access claimed to company/, dashboards/, memory/owner-office/, .env,
sources/.

Designer's role file has no explicit Data/memory access section. This is a recurring
transparency gap pattern across L4 agents.

CERTIFICATION GAP (noted, not permission): cert status reads "Pending (Anat/HR + Noam
to certify before go-live)." Noam is one of the newly-certified agents being finalized
in the parallel session. If Designer is not yet live, this is fine. If Designer is
operating, certification must be completed.

FINDINGS:
1. All three tools are justified by role.
2. Tool set is minimal and appropriate for a file-based design role.
3. No file/data access exceeds the access matrix.
4. MINOR GAP: role file lacks an explicit Data/memory access section.
5. CERTIFICATION GAP (not permission): cert pending on Noam's availability as certifying manager.

VERDICT: CLEAR on permissions (certification gap flagged to Eco)

---

## Cross-Cutting Findings

1. NO EXCESS-PERMISSION FINDING on any of the five agents. All tool grants are justified
   by documented role responsibilities. All stated file/data access is within access-matrix
   grants.

2. DATA/MEMORY ACCESS SECTION MISSING across multiple agents. Eco, Hila, Shelly, and
   Designer have no dedicated Data/memory access section in their role files. Anat has one.
   This pattern creates an audit burden -- access must be inferred from Key files lists and
   Triggers rather than read from a single declared section. Recommend Eco and Anat add this
   section to all four role files in the next R&R cycle. This is a transparency gap, not a
   permission excess.

3. CERTIFICATION STATUS GAPS on three agents. Hila, Shelly, and Designer carry "Pending"
   certification status. If any of these agents are operating in production without
   certification, that violates KPI #1 (100% of agents certified before go-live). Eco
   must confirm operational status and, if live, immediately trigger Anat to complete
   certification.

4. SETTINGS.JSON CONFIRMS WRITE-TOOL BLOCK for Google Calendar and Google Drive. The deny
   list in settings.json correctly blocks all calendar write tools and Drive create/copy.
   Eco's google-calendar grant is effectively read-only as enforced at the settings level.
   This is correctly configured.

5. BASH SCOPE (Eco only). Bash is granted only to Eco. The settings.json allowlist limits
   Bash to safe read/inspect operations and standard dev tooling. No other agent holds Bash.
   This is appropriately contained.

6. WEBSEARCH / WEBFETCH (Shelly only among stable agents). Shelly holds both for
   owner-admin research. No other stable agent holds these tools. Appropriate.

---

## Overall Verdict

CLEAR -- no excess-permission or over-grant findings on any of the five stable agents.

Two categories of non-permission findings require follow-up:

A. TRANSPARENCY GAPS (minor, not blocking): four agents missing a Data/memory access
   section in their role files. Address in next R&R cycle.

B. CERTIFICATION GAPS (lifecycle, potentially blocking): Hila, Shelly, and Designer
   are listed as certification-pending. Eco must confirm whether any of these agents
   are currently operating live and, if so, trigger Anat to complete certification
   immediately.

---

## Deferred Scope

The following eight newly-certified R&D/staff agents are NOT covered by this scan.
Their role files were in active development during a parallel hiring session at the time
this scan ran. Scanning them would risk findings against incomplete or in-flux role files.

Deferred agents: Ido, Gal, Shir, Eyal, Noam, Lital, Dalia, Assaf.

A follow-up permission-scope scan task must be triggered by Eco after the hiring session
settles their role files and those files are stable on the working branch (or merged to
master). The follow-up scan should also re-check the access-matrix .claude/agents/ row
to confirm it reflects T-0012 reconciliation for all relevant agents.

---

## Sign-off

Rambo (Security, L3)
Scan date: 2026-06-16
Task: T-0014
Report to: Eco (CEO)
