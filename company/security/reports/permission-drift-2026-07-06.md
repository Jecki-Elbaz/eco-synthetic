# Permission-Drift Scan -- 2026-07-06

Scan type: weekly (Monday)
Scanner: runner invocation 2026-07-06T12:05:38Z
Files read: 32 role files in .claude/agents/, company/governance/gate-register.md,
  company/roster.md, company/governance/agent-tool-spawn-allowlist.md
Prior scan baseline: company/security/reports/permission-drift-2026-06-29.md

---

## BLOCKING FLAGS

### BF-1: Agent files in .claude/agents/ with no roster entry

Five agents have certified (or stage-A) role files but are absent from company/roster.md (v2.2):

| Agent file | Status | Notes |
|---|---|---|
| Oracle.md | CERTIFIED + LIVE 2026-06-18 | HIRE-002; not in roster table or pending section |
| Yael.md | CERTIFIED + LIVE 2026-06-18 | HIRE-001; not in roster |
| RedTeam.md | CERTIFIED + LIVE 2026-06-22 | Not in roster |
| MeetingPrep.md | CERTIFIED + LIVE 2026-06-18 | Not in roster |
| Yossi.md | Stage A only, B3 pending | Roster section 6 explicitly notes row is missing |

Anat's role file (owner A1 2026-06-28) mandates: after any agent lifecycle change, update
roster.md in the same workflow, immediately after the A1. That rule was not followed for any
of these five.

ACTION REQUIRED: Anat + Eco update company/roster.md to add all five. For Yossi, add a row
that notes Stage A only and B3 pending (not yet live). Owner A1 required for each new roster
row. Roster must match .claude/agents/ before next weekly scan.

### BF-2: Roster entries with no matching agent file (name drift)

Three roster rows name agents that have no matching .claude/agents/ file:

| Roster name | Active agent file | Change event |
|---|---|---|
| Tim (VP Sales) | Sally.md | Sally pulled forward per ORG-002, owner A1 2026-06-15 |
| Noam (Product) | Perry.md | Perry VP Product title, owner A1 2026-06-17 (T-0001) |
| Avner (Customer Success) | Jack.md | Renamed/re-scoped, re-certified 2026-06-18 |

Tim, Noam, Avner no longer have active agent files. The roster must be corrected to reflect
the agents that are actually running.

NOTE: A fourth partial drift -- roster shows "(unnamed)" for Designer but agent file has
persona "Tal" (assigned at build by Anat + Eco per owner pre-approval). This is a
documentation-completeness item; it does not affect access or tool grants. Flagged as REVIEW-5
below.

ACTION REQUIRED: Anat updates roster rows: Tim -> Sally, Noam -> Perry, Avner -> Jack.
Owner A1 required for each rename.

---

No BLOCKING FLAGS found for:
- Tools vs. gate-register (see CLEAR section)
- Agent tool holders vs. spawn-allowlist (see CLEAR section)

---

## REVIEW ITEMS

### R-1: Adi Bash scrutiny not formally closed

Adi.md description field (still present as of this scan):
"Has Bash for running test suites -- Rambo B5 must scrutinize this grant next session."

This note has appeared in Adi's description since certification. No written CLEAR or
CLEAR-WITH-CONDITIONS from Rambo on this specific open action has been recorded in the
role file or gate-register. The scrutiny is described as deferred to "next session" but has
not been formally discharged.

ACTION REQUIRED: Rambo conducts B5 re-scrutiny of Adi's Bash grant, records the verdict
(CLEAR / CLEAR-WITH-CONDITIONS / REVOKE) in Adi.md and gate-register, removes the deferred-
scrutiny note from the description field. Eco to schedule.

### R-2: Noa provisional certification gate approaching

Noa.md is LIVE (owner A1 2026-06-30) on provisional status. Live behavioral B3 confirmatory
gate is due approximately 2026-07-21 (15 days from today). If gate is not passed, R&R is
triggered and go-live is suspended.

ACTION REQUIRED: Eco + Anat confirm B3 date is calendared. No permission drift today --
this is a schedule watch item for the next 2-3 weekly scans.

### R-3: Yossi role file live but agent not certified

Yossi.md exists in .claude/agents/ with Stage A approval only (B3 deferred). The agent is
not yet live. The role file's presence creates a BF-1 roster gap (above) but the more
specific issue is that a role file in .claude/agents/ for an uncertified agent can be
spawned by an operator who does not know its status.

ACTION REQUIRED: Anat confirm whether Yossi.md should remain in .claude/agents/ or be
moved to a staging path until B3 completes. At minimum, add a NOTE to the description
frontmatter that reads "NOT YET LIVE -- Stage A only, B3 pending." Eco to decide path.

### R-4: Agent tool (Eco bridge) -- Eyal confirmation column not closed

Gate-register row for "Agent tool (for Eco, Telegram bridge)" shows Eyal column as:
"PENDING (Eyal not yet live; scope: same subscription, no new terms -- confirm on activation)."
Eyal went live 2026-06-17. The gate-register column has not been updated.

The owner A1 (2026-06-15) is on record. The Eyal confirmation is not blocking the bridge
(interim grant is active). But the open Legal column in the gate-register is an audit gap.

ACTION REQUIRED: Eyal reviews the Agent tool scope (same Anthropic subscription, no new
vendor terms introduced) and records his confirmation in gate-register.md, closing this row.
Eco to task Eyal.

### R-5: Designer persona name not in roster

Designer.md has persona name "Tal" (assigned by Anat + Eco at build per owner pre-approval).
Roster still shows "(unnamed)" for the Designer row. Lower severity than BF-2 since no agent
file is missing -- this is a documentation update only.

ACTION REQUIRED: Anat updates roster Designer row to "(Tal) Designer". Include in same
owner A1 batch as BF-1 and BF-2 corrections.

### R-6: Role files changed since 2026-06-29 baseline

Files last modified on or after the prior scan date (2026-06-29):

| File | Change | Auth |
|---|---|---|
| Shir.md | Git/CI-CD hygiene function added; dotted-to-Eco chain exception; narrow git-read scope | owner A1 2026-06-30 |
| Noa.md | New file, created 2026-06-30 | owner A1 2026-06-30 |
| Assaf.md | v1.1, F-D02 stale-block correction | Dalia phase-2 audit |
| Yael.md | F-D03 stale-block correction | Dalia phase-2 audit |
| Oracle.md | Phase 2 audit correction (F-D06) | Dalia phase-2 audit |

Shir change is material: new company-wide function and narrow chain-of-command exception
(direct-to-Eco for hygiene tasks only). Change has owner A1 on record. Review confirms the
change is properly scoped in the role file (exception is explicitly NOT a general bypass, and
Ido retains solid-line for all R&D work).

Assaf, Yael, Oracle changes are Dalia phase-2 stale-block corrections -- wording cleanup,
no tool or authority changes. Low risk.

Noa is a new agent (go-live 2026-06-30). No change risk beyond what BF-1 captures.

---

## CLEAR

### Tools vs. gate-register: CLEAR (no ungated tools found)

All tools across all 32 role files map to approved entries:

- Read, Write, Edit: Claude Code built-ins. Covered by Claude Code runtime, owner A1 2026-06-12.
- Bash (Eco, Gal, Shir, Adi, Noa): Claude Code built-in. Justified per role; Rambo B5
  CLEAR-WITH-CONDITIONS recorded in each role file. Eco A1 2026-06-12 (CEO orchestration).
- Grep, Glob (Rambo): gate-registered, bootstrapping exception A1 2026-06-14.
- Grep, Glob (RedTeam): Claude Code built-ins; use is internal security testing only;
  Rambo B5 CLEAR-WITH-CONDITIONS 2026-06-22. No external/destructive scope.
- WebFetch (Rambo): gate-registered, A1 2026-06-14.
- WebFetch (Eyal): gate-registered, A1 2026-06-23.
- WebSearch + WebFetch (Erez): gate-registered, A1 2026-06-17.
- WebSearch + WebFetch (Zvika): gate-registered, A1 2026-06-18.
- Google Drive MCP read-only (MeetingPrep): gate-registered, A1 2026-06-12.
- Google Calendar MCP read-only (MeetingPrep, Eco): gate-registered, A1 2026-06-12.
  NOTE: Eco frontmatter uses "google-calendar (read-only list_events, get_event)" while
  gate-register entry says "Google Calendar MCP (read-only)." Functionally identical,
  naming inconsistency is cosmetic -- no security impact. Log as minor doc-drift for Anat.
- Agent (Anat): owner A1 2026-06-15 (interim grant); T-0020 conditions on record.

No agent holds a tool not covered by the above.

### Agent files vs. roster: 24 agents CLEAR by name

The following 24 agent files have exact name matches in company/roster.md:
Eco, Ido, Mike, Lital, Eyal, Dalia, Zvika, Anat, Assaf, Rambo, Gal, Shir, Adi, Roman, Oren,
Noa, Jenny, Ella, Alex, Hila, Luci, Erez, Sami, Perry.

Four additional agents (Sally, Jack, Designer, Perry already listed) exist in both
.claude/agents/ and the roster but under different names (BF-2 above). The roles exist on
both sides; only the name reconciliation is blocking.

### Agent tool holders vs. spawn-allowlist: CLEAR

Only one agent has "Agent" in frontmatter tools: Anat.md.
Anat is on the PERMITTED list in agent-tool-spawn-allowlist.md (owner A1 2026-06-15).
No other agent holds the Agent tool explicitly.

### Oren Read+Edit (no Write): CLEAR

Oren.md correctly lists tools as "Read, Edit" only. No Write, no Bash. Matches role
(code-reviewer, no write access to production code).

### RedTeam tool scope: CLEAR

RedTeam.md: Read, Grep, Glob, Write. No Bash, no Edit. Grep/Glob are code-scan only for
internal security testing. Write is scoped to own security-reports area. Rambo B5 CLEAR-WITH-
CONDITIONS 2026-06-22 on record.

---

## Summary counts

| Category | Count |
|---|---|
| BLOCKING FLAGS | 2 (BF-1: 5 agents off roster; BF-2: 3 stale roster names) |
| REVIEW items | 6 |
| CLEAR items | 32/32 agents with no ungated tools; 24/32 roster name-exact match |

---

ESCALATE_TO_ECO_BLOCKING
