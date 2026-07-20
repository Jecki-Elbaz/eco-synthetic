# Permission-Drift Scan -- 2026-07-20

Scan type: weekly (Sunday)
Scanner: runner invocation 2026-07-20
Files read: 32 role files in .claude/agents/, company/governance/gate-register.md,
  company/roster.md, company/governance/agent-tool-spawn-allowlist.md,
  .mcp.json, .claude/hooks/guard.py
Prior scan baseline: company/security/reports/permission-drift-2026-07-18.md
GR-009 addendum coverage:
  .mcp.json pin: CONFIRMED (see below)
  guard.py google-boundary constants: CONFIRMED (see below)
  credential-store directory scan: INCOMPLETE (R-9, same persistent limitation --
    Bash disabled on runner path; Glob for paths outside project root denied)

---

## BLOCKING FLAGS

BF-1 and BF-2 from all prior scans are STILL OPEN. SIXTH consecutive scan unresolved.
First flagged 2026-07-06. Now 14 days overdue without remediation.

### BF-1: Agent files in .claude/agents/ with no roster entry (SIXTH CONSECUTIVE SCAN)

Five agents have certified role files but are absent from company/roster.md (v2.2).
All five are LIVE. No remediation since first flag (2026-07-06).

| Agent file | Status | Notes |
|---|---|---|
| Oracle.md | CERTIFIED + LIVE 2026-06-18 | HIRE-002; no roster row or pending-section entry |
| Yael.md | CERTIFIED + LIVE 2026-06-18 | HIRE-001; no roster row |
| RedTeam.md | CERTIFIED + LIVE 2026-06-22 | No roster row |
| MeetingPrep.md | CERTIFIED + LIVE 2026-06-18 | No roster row |
| Yossi.md | FULLY CERTIFIED 2026-07-14 | Roster section 6 notes gap; no row; AUD-009 open |

Yossi is the highest-urgency gap: fully certified + LIVE for six days with no roster entry.
Roster does not reflect any of these five agents. Anat's mandate (owner A1 2026-06-28)
requires roster update in the same workflow as any agent lifecycle change.

ACTION REQUIRED: Anat + Eco update company/roster.md to add all five rows. Owner A1
required. Deadline was 2026-07-25 (set at 2026-07-18 scan). No change this scan.

### BF-2: Roster entries with no matching agent file (name drift) (SIXTH CONSECUTIVE SCAN)

Three roster rows name agents with no matching .claude/agents/ file:

| Roster name | Active agent file | Change event |
|---|---|---|
| Tim (VP Sales) | Sally.md | Sally pulled forward per ORG-002, owner A1 2026-06-15 |
| Noam (Product) | Perry.md | Perry VP Product title, owner A1 2026-06-17 (T-0001) |
| Avner (Customer Success) | Jack.md | Renamed and re-scoped v2.0, certified LIVE 2026-06-18 |

Tim, Noam, and Avner have no active agent files. The roster incorrectly implies these are
live agents. Sixth consecutive scan with no remediation.

ACTION REQUIRED: Anat updates roster rows: Tim -> Sally, Noam -> Perry, Avner -> Jack.
Owner A1 required for each rename. Include Designer name (R-5 below) in the same batch.
Deadline: before next weekly scan (2026-07-25).

---

No BLOCKING FLAGS found for:
- Tools vs. gate-register (all 32 role file tool grants verified against approved entries)
- Agent tool holders vs. spawn-allowlist

---

## REVIEW ITEMS

### R-1: Adi Bash scrutiny not formally closed (SIXTH CONSECUTIVE SCAN -- OVERDUE)

Adi.md description frontmatter still reads:
"Has Bash for running test suites -- Rambo B5 must scrutinize this grant next session."
Confirmed by direct read this scan. No written CLEAR or CLEAR-WITH-CONDITIONS verdict
from Rambo has been recorded in Adi.md or gate-register. Sixth consecutive scan.
Now 14 days overdue from first flag (2026-07-06). Escalation urgency: URGENT.

ACTION REQUIRED: Rambo conducts B5 scrutiny of Adi's Bash grant, records verdict in
Adi.md certification block and gate-register, removes the deferred-scrutiny note from
the description frontmatter. Eco to assign as URGENT immediately.

### R-3: Yossi guard.py ALLOWED_AGENTS -- AUD-009 STILL OPEN

Yossi is FULLY CERTIFIED + LIVE (2026-07-14) but guard.py ALLOWED_AGENTS does NOT include
"yossi" (confirmed by direct read this scan). agent-tool-spawn-allowlist.md runner-spawn
section does not name Yossi explicitly (says "all roster agents" -- Yossi is not on roster
per BF-1, so he is not runner-spawnable by that rule either).

In shadow mode (current GUARD_MODE), governed Write/Edit from Yossi as a sub-agent would
log a would-DENY but pass. In enforce mode, his governed actions would be blocked.

ACTION REQUIRED: Add "yossi" to guard.py ALLOWED_AGENTS and PATH_SCOPE with write containment
(company/training/, company/governance/skills-register.md, memory/log.md). Also resolve BF-1
roster update to make him runner-spawnable. Coordinate together as AUD-009 closure.

### R-4: Eyal gate-register confirmation for Agent tool (SIXTH CONSECUTIVE SCAN)

Gate-register row for "Agent tool (for Eco, Telegram bridge)" Eyal column still reads:
"PENDING (Eyal not yet live; scope: same subscription, no new terms -- confirm on activation)"
Eyal went live 2026-06-17. Column has not been updated. Confirmed by direct read this scan.
Sixth consecutive scan with no discharge. Simple one-session confirmation task.

ACTION REQUIRED: Eyal reviews Agent tool scope (same Anthropic subscription, no new vendor
terms, no new data pipeline) and records confirmation in gate-register.md. Eco to task Eyal.

### R-5: Designer persona name "Tal" not in roster (SIXTH CONSECUTIVE SCAN)

Designer.md persona name "Tal" confirmed by direct read. Roster row still shows "(unnamed)"
for Designer, and manager field still shows "Noam" (stale -- should be Perry per BF-2).
Documentation gap; no live security issue.

ACTION REQUIRED: Include Designer row update in the same owner A1 batch as BF-1/BF-2:
(a) update Designer name from "(unnamed)" to "Tal"; (b) update manager from "Noam" to "Perry."

### R-8: guard.py allows Noa to be spawned -- policy/enforcement gap (CARRIED FORWARD)

guard.py ALLOWED_AGENTS includes "noa" (confirmed this scan). Noa is NOT in SPAWN_DENY,
NOT in OWNER_SPAWN_ONLY. Noa is FULLY CERTIFIED (2026-07-08). T-0020 C3 resolved 2026-06-28.
However, agent-tool-spawn-allowlist.md PERMITTED list does not include Noa, and Noa.md
description still reads "OFF the auto-spawn allowlist until T-0020 C3" (stale condition).
Policy (allowlist doc + Noa.md description) and enforcement (guard.py) disagree.

Net effect: guard.py would allow a sub-agent (e.g. Anat) to spawn Noa on the bridge path,
but the allowlist document does not formally permit this. T-0020 C3 note in Noa.md is stale.

ACTION REQUIRED: Rambo + Anat determine Noa's bridge-path spawn status (PERMITTED vs
OWNER_SPAWN_ONLY vs DENIED). Update both agent-tool-spawn-allowlist.md and guard.py to
match. Remove stale "until T-0020 C3" note from Noa.md description. Owner A1 if PERMITTED.

### R-9: Credential-store directory scan incomplete (PERSISTENT SCAN LIMITATION)

GR-009 addendum (2026-07-10) requires the weekly scan to cover the three credential-store
directories for unexpected token files. On the runner path, Bash is disabled and Glob for
C:\Users\Jecki\.google_workspace_mcp\ is outside the project root (permission denied by
sandbox). Directory contents could not be verified this scan. Same limitation as all prior scans.

What WAS confirmed this scan (direct reads):
- .mcp.json WORKSPACE_MCP_CREDENTIALS_DIR: C:\Users\Jecki\.google_workspace_mcp\eco-creds CONFIRMED
- .mcp.json workspace-mcp version: workspace-mcp==1.21.3 -- matches gate-register CONFIRMED
- guard.py ECO_GOOGLE_ACCOUNT: eco.synthetic.org@gmail.com CONFIRMED
- guard.py runner-path send denial: send_gmail_message denied when RUNNER_CONTEXT=1 CONFIRMED
- guard.py google-boundary: hard-enforced regardless of GUARD_MODE CONFIRMED

What could NOT be confirmed: credential-store directory contents (unexpected token files).

ACTION REQUIRED: Owner or Rambo manually verify C:\Users\Jecki\.google_workspace_mcp\
contents in an interactive session. Confirm: (a) only expected subdirectories (eco-creds;
no unexpected stores); (b) eco-creds contains only the eco.synthetic.org token or is empty
(OAuth pending per CLAUDE.md); (c) no unexpected credential files in any directory.

### R-11: Oracle and Yael in PATH_SCOPE but absent from ALLOWED_AGENTS (CARRIED FORWARD)

guard.py PATH_SCOPE defines allowed write paths for "oracle" (company/chronicle/, memory/log.md)
and "yael" (company/governance/file-index.md, memory/log.md). Both agents are expected to
perform governed Write/Edit actions. However, neither "oracle" nor "yael" appears in guard.py
ALLOWED_AGENTS (confirmed by direct read this scan).

Consequence: in shadow mode (current), governed writes by Oracle or Yael as sub-agents log
a would-DENY but pass. In enforce mode, governed writes from these agents would be DENIED
before PATH_SCOPE is evaluated. Both agents have been LIVE since 2026-06-18. Enforce-mode
readiness is blocked.

No change since R-11 was first raised (2026-07-18 scan).

ACTION REQUIRED: Rambo review Oracle and Yael for ALLOWED_AGENTS inclusion. Confirm governed
write scope is appropriate, then add "oracle" and "yael" to guard.py ALLOWED_AGENTS. Owner A1.
Coordinate with AUD-009 (Yossi) in the same enforcement hardening pass.

### R-12: Runner files modified since 2026-07-13 -- STATUS UPDATE

Prior scan (2026-07-18) identified runner.py, agent-prompts.md as modified (M) and
oracle-oneshot.md as untracked (??). Action required: Rambo review before next weekly scan.

STATUS THIS SCAN: integrations/runner/ files do NOT appear in current git status as
modified or untracked. Commit b920e8f "fix(runner): silent job failures root-caused +
fixed -- cmd.exe 8191-char limit" is the most recent relevant commit. The prior R-12
files appear to have been committed. This scan did not read runner.py or agent-prompts.md
(outside original scope; runner file contents not preserved from prior session).

OUTSTANDING: Rambo's security review of the committed runner changes was required before
this scan. That review is NOT confirmed in this session. Item cannot be formally closed
without Rambo's explicit confirmation of the runner content review.

ACTION REQUIRED: Rambo confirm in writing (in gate-register or security-baseline.md) that
runner.py, agent-prompts.md, and oracle-oneshot.md (as committed in b920e8f and related
commits) have been reviewed. Confirm: no RUNNER_CONTEXT guard bypass; no tainted-input
rule weakening; oracle-oneshot.md purpose and content are appropriate. Close R-12 on confirmation.

---

## GR-009 Addendum Verification (2026-07-10 scope)

| Check | Result |
|---|---|
| .mcp.json workspace-mcp version | workspace-mcp==1.21.3 -- MATCHES gate-register pin |
| .mcp.json WORKSPACE_MCP_CREDENTIALS_DIR | C:\Users\Jecki\.google_workspace_mcp\eco-creds -- CORRECT |
| .mcp.json tools scope | gmail calendar drive -- CORRECT |
| guard.py ECO_GOOGLE_ACCOUNT | eco.synthetic.org@gmail.com -- CORRECT |
| guard.py runner-path send denial | send_gmail_message denied when RUNNER_CONTEXT=1 -- CORRECT |
| guard.py google-boundary enforcement | hard-enforced regardless of GUARD_MODE -- CORRECT |
| Credential-store directory contents | NOT CHECKED (runner path limitation; see R-9) |

---

## CLEAR

### Tools vs. gate-register: CLEAR (no ungated tools found)

All tools across all 32 role files map to approved gate-register entries:

- Read, Write, Edit: Claude Code built-ins. Covered by runtime, owner A1 2026-06-12.
- Bash (Eco, Gal, Shir, Adi, Noa): Claude Code built-in; Rambo B5 CLEAR-WITH-CONDITIONS
  in each role file. Adi B5 scrutiny open (R-1) but Bash grant itself has a registered entry.
- Grep, Glob (Rambo): gate-registered, bootstrapping exception A1 2026-06-14; T-0013 closed.
- Grep, Glob (RedTeam): Claude Code built-ins; internal security testing only;
  Rambo B5 CLEAR-WITH-CONDITIONS 2026-06-22 on record.
- WebFetch (Rambo): gate-registered explicit row (A1 2026-06-14; T-0013 closed 2026-06-16).
- WebFetch (Eyal): gate-registered explicit row (A1 2026-06-23). Scope: public legal/terms.
- WebSearch + WebFetch (Erez): gate-registered explicit row (A1 2026-06-17).
- WebSearch + WebFetch (Zvika): gate-registered explicit row (A1 2026-06-18).
- Google Drive MCP read-only (MeetingPrep): gate-registered A1 2026-06-12 (GR-005).
- Google Calendar MCP read-only (MeetingPrep, Eco): gate-registered A1 2026-06-12 (GR-006).
- Agent (Anat): owner A1 2026-06-15 (interim grant); T-0020 conditions on record.

No agent holds a tool not covered by an approved gate-register entry.

### Agent files vs. roster: 24 agents CLEAR by name (unchanged from prior scan)

The following 24 agent files have exact name matches in company/roster.md:
Eco, Ido, Mike, Lital, Eyal, Dalia, Zvika, Anat, Assaf, Rambo, Gal, Shir, Adi, Roman,
Oren, Noa, Jenny, Ella, Alex, Hila, Luci, Erez, Sami, Perry.

Five agents have no roster match (BF-1). Three roster rows have no agent file match (BF-2).
Both carry forward as BLOCKING FLAGS. No change from 2026-07-18 scan.

### Agent tool holders vs. spawn-allowlist: CLEAR

Only one agent has "Agent" in frontmatter tools: Anat.md (confirmed by direct read this scan).
Anat is on the PERMITTED list in agent-tool-spawn-allowlist.md (owner A1 2026-06-15).
No other agent holds the Agent tool explicitly in frontmatter.

### GR-009 addendum (verifiable items): CLEAR

.mcp.json pin, WORKSPACE_MCP_CREDENTIALS_DIR, guard.py ECO_GOOGLE_ACCOUNT, and runner-path
send denial all confirmed correct by direct reads this scan. Credential-store directory
contents remain unverifiable on the runner path (R-9).

### Role files changed since 2026-07-18 baseline: NO CHANGES DETECTED

No .claude/agents/*.md files appear as modified or untracked in git status at scan start.
Commits since the 2026-07-18 scan (b920e8f, and the commits visible in git log) do not
reference agent role file changes. Category (c) drift: none detected.
Note: full git diff not runnable on runner path (Bash disabled); conclusion based on git
status and commit message review only.

---

## Summary counts

| Category | Count |
|---|---|
| BLOCKING FLAGS | 2 (BF-1: 5 agents off roster -- all LIVE; BF-2: 3 stale roster names) -- SIXTH CONSECUTIVE SCAN |
| REVIEW items open | 8 (R-1, R-3/AUD-009, R-4, R-5, R-8, R-9, R-11, R-12) |
| REVIEW items closed this scan | 0 |
| New REVIEW items this scan | 0 |
| CLEAR | 32/32 agents no ungated tools; 24/32 roster name-exact match; GR-009 verifiable items |

Escalation urgency summary:
- BF-1 + BF-2: SIXTH consecutive scan, 14 days overdue. Yossi is fully certified and LIVE
  without a roster row -- highest urgency. Anat must open a batch roster-update task with
  owner A1. Deadline 2026-07-25 (next weekly scan).
- R-1 (Adi Bash scrutiny): SIXTH scan, URGENT. Assign to Rambo immediately.
- R-3/AUD-009 (Yossi guard.py): Not resolved. Coordinate with BF-1 roster update.
- R-4 (Eyal gate-register Agent tool): SIXTH scan. Simple one-session close. Assign to Eyal.
- R-11 (Oracle + Yael ALLOWED_AGENTS): Not resolved. Blocks enforce-mode readiness.
- R-12 (runner file review): Rambo confirmation of b920e8f review required to close.
- R-8 (guard.py Noa spawn gap): Policy/enforcement mismatch. Rambo + Anat resolution needed.
- R-9 (credential-store): Owner interactive-session manual check still pending.
- R-5 (Designer name): Include in BF-1/BF-2 batch.

---

ESCALATE_TO_ECO_BLOCKING
