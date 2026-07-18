# Permission-Drift Scan -- 2026-07-18

Scan type: weekly (Monday)
Scanner: runner invocation 2026-07-18T16:08:21Z
Files read: 32 role files in .claude/agents/, company/governance/gate-register.md,
  company/roster.md, company/governance/agent-tool-spawn-allowlist.md,
  .mcp.json, .claude/hooks/guard.py
Prior scan baseline: company/security/reports/permission-drift-2026-07-13.md
GR-009 addendum coverage:
  .mcp.json pin: CONFIRMED (see below)
  guard.py google-boundary constants: CONFIRMED (see below)
  credential-store directory scan: INCOMPLETE (R-9, same limitation as prior scans --
    Bash disabled on runner path; Glob for paths outside project root denied)

---

## BLOCKING FLAGS

BF-1 and BF-2 from all prior scans are STILL OPEN. FIFTH consecutive scan unresolved.

### BF-1: Agent files in .claude/agents/ with no roster entry (FIFTH CONSECUTIVE SCAN)

Five agents have certified role files but are absent from company/roster.md (v2.2).
STATUS CHANGE THIS SCAN: Yossi.md is now FULLY CERTIFIED + LIVE (2026-07-14), upgrading
from "Stage A, not yet live" at the 2026-07-13 scan. All five are now LIVE agents without
roster rows -- urgency is elevated.

| Agent file | Status | Notes |
|---|---|---|
| Oracle.md | CERTIFIED + LIVE 2026-06-18 | HIRE-002; no roster row or pending-section entry |
| Yael.md | CERTIFIED + LIVE 2026-06-18 | HIRE-001; no roster row |
| RedTeam.md | CERTIFIED + LIVE 2026-06-22 | No roster row |
| MeetingPrep.md | CERTIFIED + LIVE 2026-06-18 | No roster row |
| Yossi.md | **FULLY CERTIFIED 2026-07-14** (NEW this scan; was Stage A / not live in 07-13) | Roster section 6 notes gap; no row; AUD-009 open |

All five are LIVE. Roster does not reflect them. No remediation in five consecutive scans
(first flagged 2026-07-06; now 12 days overdue). Anat's mandate (owner A1 2026-06-28)
requires roster update in the same workflow as any agent lifecycle change. Yossi's full
certification without a roster row is a direct governance breach.

ACTION REQUIRED: Anat + Eco update company/roster.md to add all five rows with owner A1.
Yossi must be added immediately given full certification. Must be resolved before the next
weekly scan (2026-07-25).

### BF-2: Roster entries with no matching agent file (name drift) (FIFTH CONSECUTIVE SCAN)

Three roster rows name agents that have no matching .claude/agents/ file:

| Roster name | Active agent file | Change event |
|---|---|---|
| Tim (VP Sales) | Sally.md | Sally pulled forward per ORG-002, owner A1 2026-06-15 |
| Noam (Product) | Perry.md | Perry VP Product title, owner A1 2026-06-17 (T-0001) |
| Avner (Customer Success) | Jack.md | Renamed and re-scoped, v2.0 on record 2026-06-18 |

Tim, Noam, and Avner have no active agent files. The roster incorrectly implies these are
live agents. Fifth consecutive scan with no remediation.

ACTION REQUIRED: Anat updates roster rows: Tim -> Sally, Noam -> Perry, Avner -> Jack.
Owner A1 required for each rename. Include Designer name update (R-5 below) in the same
owner A1 batch. Deadline: before next weekly scan.

---

No BLOCKING FLAGS found for:
- Tools vs. gate-register (all 32 role file tool grants verified against approved entries)
- Agent tool holders vs. spawn-allowlist

---

## REVIEW ITEMS

### R-1: Adi Bash scrutiny not formally closed (FIFTH CONSECUTIVE SCAN -- OVERDUE)

Adi.md description frontmatter reads:
"Has Bash for running test suites -- Rambo B5 must scrutinize this grant next session."
Confirmed by agent registry this scan. No written CLEAR or CLEAR-WITH-CONDITIONS verdict
from Rambo has been recorded in Adi.md or gate-register. Fifth consecutive scan with no
discharge. Now 12 days overdue from first flag (2026-07-06).

ACTION REQUIRED: Rambo conducts B5 scrutiny of Adi's Bash grant this week, records verdict
in Adi.md certification block and gate-register, and removes the deferred-scrutiny note
from the description frontmatter. Eco to assign as URGENT in next board session.

### R-2: Noa B3 gate -- RESOLVED (carry-forward closed)

Noa.md is now FULLY CERTIFIED: live behavioral B3 PASS 2026-07-08 (all 4 scenarios).
The 2026-07-13 estimate of a 2026-07-21 B3 deadline is no longer relevant -- B3 was
completed before the last scan. This item is closed.

### R-3: Yossi certification -- PARTIALLY RESOLVED (see BF-1)

Yossi.md is now FULLY CERTIFIED 2026-07-14. The prior R-3 concern (role file present but
agent not certified) is resolved. However, Yossi has no roster entry (BF-1 above). The
AUD-009 open item (spawn-allowlist + guard.py update for Yossi) is NOT resolved:
- guard.py ALLOWED_AGENTS does not include "yossi"
- agent-tool-spawn-allowlist.md runner-spawn section does not name Yossi
- Per allowlist, "all roster agents" are runner-spawnable, but Yossi is NOT on roster

Until Yossi is added to roster and guard.py ALLOWED_AGENTS, his governed Write/Edit
actions from a sub-agent context would fail in enforce mode. AUD-009 must be closed
alongside the BF-1 roster update.

### R-4: Eyal gate-register confirmation for Agent tool (FIFTH CONSECUTIVE SCAN)

Gate-register row for "Agent tool (for Eco, Telegram bridge)" shows Eyal column:
"PENDING (Eyal not yet live; scope: same subscription, no new terms -- confirm on
activation)." Eyal went live 2026-06-17. Column has not been updated.
Fifth consecutive scan. The owner A1 (2026-06-15) is on record; the open Legal column
is an audit gap.

ACTION REQUIRED: Eyal reviews Agent tool scope (same Anthropic subscription, no new
vendor terms, no new data pipeline) and records confirmation in gate-register.md.
Eco to task Eyal with this as a quick close. Overdue.

### R-5: Designer persona name "Tal" not in roster (FIFTH CONSECUTIVE SCAN)

Designer.md (confirmed in agent registry) has persona name "Tal" assigned by Anat + Eco
at build (owner pre-approved). Roster still shows "(unnamed)" for the Designer row, and
the manager field still reads "Noam" (stale -- should be Perry following BF-2 correction).
Documentation gap only; no live security issue.

ACTION REQUIRED: Include Designer row update in same owner A1 batch as BF-1/BF-2:
(a) update Designer row from "(unnamed)" to "Tal"; (b) update manager from "Noam" to "Perry."

### R-6: Role files changed since 2026-07-13 scan

One confirmed role file change since the 2026-07-13 scan baseline:

| File | Version | Change |
|---|---|---|
| Yossi.md | Full certification | B3 PASS + B4-B7 completed, certified 2026-07-14 (owner A1) |

Change is authorized: certification lifecycle event, owner A1 on record. No new tool
grants. No permission-drift issue from this change itself. Noted here for baseline
continuity. AUD-009 consequence: Yossi's now-live status requires guard.py + spawn-
allowlist update (see R-3 above).

### R-7: GR-016 APS Hosted Demo DEMO-C10 verdicts -- RESOLVED (carry-forward closed)

GR-016 addendum DEMO-C10 verdicts (Rambo, 2026-07-14) are now in gate-register. Three
hosting platforms cleared: Vercel, Render, Supabase -- all with conditions. No new agent
tool grants were introduced by this gate action. This review item is closed.

### R-8: guard.py allows Noa to be spawned -- policy/enforcement gap (CARRIED FORWARD)

guard.py ALLOWED_AGENTS includes "noa". Noa is NOT in SPAWN_DENY, NOT in OWNER_SPAWN_ONLY.
Noa is now FULLY CERTIFIED (2026-07-08) but agent-tool-spawn-allowlist.md does not add her
to the PERMITTED bridge-path list. Agent description still reads "OFF the auto-spawn
allowlist until T-0020 C3."

T-0020 C3 was resolved 2026-06-28. The "until T-0020 C3" condition in Noa.md is now stale.
But the allowlist document has not been updated to reflect Noa's bridge-path spawn status.
Net result: guard.py would allow Anat to spawn Noa on the bridge path, but the allowlist
document implies she should still be off the permitted list. Policy and enforcement disagree.

ACTION REQUIRED: Rambo + Anat determine whether Noa should now be formally added to the
bridge-path PERMITTED list (given T-0020 C3 is resolved and B3 is complete), or added to
OWNER_SPAWN_ONLY, or kept DENIED. Update both agent-tool-spawn-allowlist.md and guard.py
to match the decision. Remove the stale "until T-0020 C3" note from Noa.md.

### R-9: Credential-store directory scan incomplete (PERSISTENT SCAN LIMITATION)

GR-009 addendum (2026-07-10) requires the weekly scan to cover the three credential-store
directories for unexpected token files. On the runner path, Bash is disabled and Glob for
C:\Users\Jecki\.google_workspace_mcp\ is outside the project root (permission denied).
Directory contents could not be verified this scan. Same limitation as all prior scans.

What WAS confirmed this scan (direct reads):
- .mcp.json WORKSPACE_MCP_CREDENTIALS_DIR correctly pins to eco-creds directory. CONFIRMED.
- guard.py ECO_GOOGLE_ACCOUNT = "eco.synthetic.org@gmail.com". CONFIRMED.
- guard.py send_gmail_message denial on RUNNER_CONTEXT=1. CONFIRMED.
- guard.py google-boundary enforcement is HARD (not affected by GUARD_MODE shadow). CONFIRMED.
- workspace-mcp version pin: workspace-mcp==1.21.3 (matches gate-register). CONFIRMED.
- .mcp.json tools scope: gmail calendar drive. CONFIRMED.

What could NOT be confirmed: no unexpected token files in the eco-creds directory.

ACTION REQUIRED: Owner or Rambo manually verify C:\Users\Jecki\.google_workspace_mcp\
contents in an interactive session to confirm (a) only expected subdirectories present,
(b) eco-creds contains only the eco.synthetic.org token (if OAuth consent was completed),
(c) no unexpected credential files in any directory. Report result to Eco.

### R-10: GR-015 supertest@7.2.2 -- RESOLVED (carry-forward closed)

Gate-register records "ADOPTION RECORD 2026-07-15: owner A1 given in-session; installed
by Eco at apps/api devDependencies, exact pins supertest@7.2.2 + @types/supertest@7.2.1."
Git commit 05501e9 confirms. GR-015 is adopted. This item is closed.

MINOR NOTE: The gate-register GR-015 section retains a stale "STATUS: DRAFT -- PENDING
owner A1" line at the bottom (artifact of prepending the adoption record). The adoption
record supersedes it. Eyal or Eco may clean up this stale line at next gate-register edit.

### R-11: Oracle and Yael in guard.py PATH_SCOPE but absent from ALLOWED_AGENTS (NEW)

guard.py PATH_SCOPE defines allowed write paths for Oracle (company/chronicle/, memory/log.md)
and Yael (company/governance/file-index.md, memory/log.md). PATH_SCOPE implies these agents
are expected to perform governed Write/Edit actions. However, neither "oracle" nor "yael"
appear in guard.py ALLOWED_AGENTS.

Consequence: in shadow mode (current), Oracle and Yael writes pass through (shadow converts
DENY to would-DENY + ALLOW). In enforce mode, any governed Write/Edit from Oracle or Yael
as a sub-agent would hit the ALLOWED_AGENTS check first and be DENIED before PATH_SCOPE
is reached. PATH_SCOPE would never be evaluated. Both agents would be non-functional as
sub-agents in enforce mode.

This gap was not flagged in prior scans. Both agents have been LIVE since 2026-06-18.
The ALLOWED_AGENTS comment says it was "synced to agent-tool-spawn-allowlist.md (Phase 1
audit F-R01, owner A1 2026-06-22)" -- Oracle and Yael were certified before that date but
not included. A concurrent certification / ALLOWED_AGENTS update gap.

ACTION REQUIRED: Rambo review Oracle and Yael for ALLOWED_AGENTS inclusion. Confirm their
governed write scope is appropriate, then add "oracle" and "yael" to ALLOWED_AGENTS in
guard.py with owner A1. PATH_SCOPE entries already define their write containment. Coordinate
with BF-1 roster update and AUD-009 (Yossi) in the same enforcement pass.

### R-12: Runner files modified since last scan (flag for Rambo)

git status shows the following integrations/runner/ files modified or untracked since the
last committed state:

| File | Status | Note |
|---|---|---|
| integrations/runner/runner.py | Modified (M) | Core runner -- changes need Rambo review |
| integrations/runner/agent-prompts.md | Modified (M) | Agent prompt definitions -- tainted-input rules may be affected |
| integrations/runner/oracle-oneshot.md | Untracked (??) | New file, not yet committed |

These changes are in Shir's scope (dotted line for git hygiene). Runner modifications can
affect the RUNNER_CONTEXT enforcement boundary, agent prompt posture, and tainted-input
handling. This scan did not read the new/modified content (scanner stays lean on runner
path; reading runner.py was not part of the original scope definition).

ACTION REQUIRED: Rambo reviews runner.py changes and agent-prompts.md changes since the
2026-07-13 baseline before the next weekly scan. Confirm no RUNNER_CONTEXT guard bypass,
no tainted-input rule weakening. Flag oracle-oneshot.md for review: if it contains a
runner prompt, it should be committed and reviewed per normal cadence.

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
  in each role file. Adi B5 scrutiny open (R-1) but Bash grant has a registered entry.
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

### Agent files vs. roster: 24 agents CLEAR by name

The following 24 agent files have exact name matches in company/roster.md:
Eco, Ido, Mike, Lital, Eyal, Dalia, Zvika, Anat, Assaf, Rambo, Gal, Shir, Adi, Roman,
Oren, Noa, Jenny, Ella, Alex, Hila, Luci, Erez, Sami, Perry.

Five agents have no roster match (BF-1). Three roster rows have no agent file match (BF-2).
Both carry forward as BLOCKING FLAGS.

### Agent tool holders vs. spawn-allowlist: CLEAR

Only one agent has "Agent" in frontmatter tools: Anat.md (confirmed by direct read).
Anat is on the PERMITTED list in agent-tool-spawn-allowlist.md (owner A1 2026-06-15).
No other agent holds the Agent tool explicitly in frontmatter.

### GR-009 addendum (verifiable items): CLEAR

.mcp.json pin, WORKSPACE_MCP_CREDENTIALS_DIR, guard.py ECO_GOOGLE_ACCOUNT, and runner-path
send denial all confirmed correct by direct reads this scan. Credential-store directory
contents remain unverifiable on the runner path (R-9).

### Oren, RedTeam tool scope: CLEAR

Oren.md: Read, Edit, Write. No Bash. Write scoped to projects/delivery-saas/docs/review/.
RedTeam.md: Read, Grep, Glob, Write. No Bash, no Edit -- deliberate containment.
Both confirmed by direct read in this scan. No change since prior scan.

### Tainted-content agents: CLEAR

WebSearch/WebFetch holders (Erez, Zvika, Eyal, Rambo) carry tainted-content handling rules
in their role files. No change since last scan.

### Noa B3 certification: CLEAR

Noa fully certified 2026-07-08 (B3 PASS, all 4 scenarios). Prior R-2 closed.
Spawn-allowlist / guard.py consistency gap carried forward as R-8.

### GR-015 supertest adoption: CLEAR

Adopted 2026-07-15 (owner A1 in-session). Pinned at supertest@7.2.2 + @types/supertest@7.2.1.
Installed in apps/api devDependencies only. Prior R-10 closed.

---

## Summary counts

| Category | Count |
|---|---|
| BLOCKING FLAGS | 2 (BF-1: 5 agents off roster -- all now LIVE; BF-2: 3 stale roster names) -- FIFTH CONSECUTIVE SCAN |
| REVIEW items open | 7 (R-1, R-3/AUD-009, R-4, R-5, R-8, R-9, R-11, R-12) |
| REVIEW items closed this scan | 4 (R-2, R-7, R-10 resolved; R-3 partially) |
| New REVIEW items | 2 (R-11, R-12) |
| CLEAR | 32/32 agents no ungated tools; 24/32 roster name-exact match |

Escalation urgency:
- BF-1 and BF-2: FIFTH consecutive scan without remediation. 12 days overdue.
  Yossi is now FULLY CERTIFIED + LIVE without a roster entry -- the highest-urgency gap.
  Anat must open a batch roster-update task with owner A1 before 2026-07-25.
- R-1 (Adi Bash scrutiny): FIFTH scan without Rambo discharge. URGENT -- assign this week.
- R-4 (Eyal gate-register Agent tool): FIFTH scan. Simple one-session confirmation task.
- R-11 (Oracle + Yael ALLOWED_AGENTS): new finding; guard is in shadow mode so no immediate
  operational impact, but enforce-mode readiness is blocked until these are added.
- R-12 (runner files modified): Rambo review required before next scan.
- R-8 (guard.py Noa spawn gap): Rambo + Anat resolution needed.
- R-9 (credential-store): interactive-session manual check by owner or Rambo pending.
- R-3/AUD-009 (Yossi guard.py): coordinate with BF-1 roster update.
- R-5 (Designer name): include in BF-1/BF-2 roster update batch.

---

ESCALATE_TO_ECO_BLOCKING
