# Permission-Drift Scan Report
Date: 2026-06-29 (Monday, weekly cadence)
Scanner: Rambo (Security, L3 staff)
Baseline: 2026-06-22 (first scan -- no prior report found; using last Monday as comparison window)
Scope: .claude/agents/*.md (31 files) vs gate-register, roster v2.2, spawn-allowlist

---

## BLOCKING FLAGS

Nine agents exist in .claude/agents/ that do not match the canonical roster (company/roster.md v2.2).
These must be resolved before the next scan. Root cause: Anat's org-chart/roster update duty was
added owner A1 2026-06-28 -- prior hires (2026-06-14 to 2026-06-22) predate that mandate, leaving
roster stale.

BL-01: ROSTER NAME MISMATCH -- Sally vs Tim (VP Sales)
  Agent file: .claude/agents/Sally.md (LIVE, certified 2026-06-15)
  Roster entry: "Tim" as VP Sales
  Risk: audit trail is broken; access-matrix and spawn-allowlist reference "Tim" for runner-spawn.
  Resolution: update roster.md row for VP Sales from "Tim" to "Sally"; update spawn-allowlist runner-spawn section to match.

BL-02: ROSTER NAME MISMATCH -- Perry vs Noam (VP Product)
  Agent file: .claude/agents/Perry.md (LIVE, A1 T-0001 granted 2026-06-17)
  Roster entry: "Noam" for Product role
  Risk: same as BL-01; runner-spawn section still references "Noam."
  Resolution: update roster.md VP Product row from "Noam" to "Perry"; update spawn-allowlist.

BL-03: ROSTER NAME MISMATCH -- Jack vs Avner (Customer Success Manager)
  Agent file: .claude/agents/Jack.md (LIVE)
  Roster entry: "Avner" for Customer Success role
  Risk: CSM chain of command not reflected in canonical roster.
  Resolution: update roster.md CSM row from "Avner" to "Jack."

BL-04: ROSTER ENTRY UNNAMED -- Oren (Senior Developer)
  Agent file: .claude/agents/Oren.md (LIVE, L4 R&D)
  Roster entry: "(unnamed) Senior Developer / Code Reviewer" -- no name assigned
  Risk: named agent operating without a matching named roster entry; Anat is responsible for
  assigning names (responsibility stated in Anat.md).
  Resolution: update roster.md Senior Developer row to "Oren"; update spawn-allowlist runner-spawn
  from "Senior Dev" to "Oren."

BL-05: AGENT NOT ON ROSTER -- Oracle (Build-historian)
  Agent file: .claude/agents/Oracle.md (LIVE, L3 staff, Phase pulled-forward)
  No roster entry found.
  Risk: agent operating outside roster visibility; cannot be audited via roster.
  Resolution: add Oracle row to roster.md with role, level, phase, and reporting line (Eco CEO,
  dotted to Dalia and Hila).

BL-06: AGENT NOT ON ROSTER -- Yael (Knowledge/Documentation Manager)
  Agent file: .claude/agents/Yael.md (LIVE, L4, P2, sub-agent under Dalia)
  No roster entry found.
  Risk: same as BL-05.
  Resolution: add Yael row to roster.md.

BL-07: AGENT NOT ON ROSTER -- Yossi (Training & Enablement)
  Agent file: .claude/agents/Yossi.md (STAGED -- Stage B pending; B3 not yet cleared)
  No roster entry found.
  Note: Yossi is in Stage A (A1 granted 2026-06-18) but has not passed B3 certification.
  A staged agent not yet go-live still requires a roster entry to be auditable.
  Resolution: add Yossi row to roster.md with status "staged / pre-certification."

BL-08: AGENT NOT ON ROSTER -- MeetingPrep (Meeting Preparation Specialist)
  Agent file: .claude/agents/MeetingPrep.md (LIVE, L4, Sales group, P3, on-demand)
  No roster entry found.
  Risk: agent holds Google Drive MCP + Google Calendar MCP (approved, gate-register) but has no
  roster row for audit trail.
  Resolution: add MeetingPrep row to roster.md.

BL-09: AGENT NOT ON ROSTER -- RedTeam (Red-Team Security Tester)
  Agent file: .claude/agents/RedTeam.md (LIVE, L4, Security group, P1, v0.2 2026-06-20)
  No roster entry found.
  Risk: security-team agent with adversarial testing capability operating without roster entry.
  Resolution: add RedTeam row to roster.md.

---

## REVIEW ITEMS

RV-01: Gal.md changed 2026-06-27 (after baseline 2026-06-22)
  Change: RL9/10/11 added to Boundaries section (DAL-004 back-merge, owner A1).
  Tools: unchanged (Read, Write, Edit, Bash). No permission change detected.
  Gate-register: Bash was already JUSTIFIED (Rambo B5 clear-with-conditions, pre-existing).
  Action: confirm RL9/10/11 text in Gal.md matches soul.md v1.0 canonical source (Dalia owns
  propagation check). No security gap; documentation quality review only.

RV-02: Eyal.md changed 2026-06-23 (after baseline 2026-06-22)
  Change: WebFetch tool added. Rambo CLEAR-WITH-CONDITIONS; owner A1 granted 2026-06-23.
  Gate-register: row confirmed present (approved 2026-06-23).
  Tainted-content rule: present in role file (section confirmed read).
  Scope limit: public legal/terms pages and Israeli law sources only; confirmed in role file.
  Action: no permission gap found. Tainted-content condition is enforced in role file. Mark
  as compliant at next scan if no incidents reported.

RV-03: Adi.md -- stale description in frontmatter
  Current text: "Has Bash for running test suites -- Rambo B5 must scrutinize this grant next session."
  Actual status: Rambo B5 has been completed; certification records show Bash JUSTIFIED (clear-
  with-conditions). The "must scrutinize" note is stale and misleading.
  Risk: low -- no tool was changed; documentation only. However, stale conditions text creates
  confusion in future scans.
  Action: Anat to update Adi.md frontmatter description to remove stale "Rambo B5 must scrutinize"
  clause and replace with current certification status. Owner A1 required for role-file edits.

RV-04: Eco.md -- missing Identity/version block
  Impact: no version or last-updated field in Eco's role file means file-modification tracking
  is unreliable for Eco in future scans. This scan cannot establish a last-changed date for Eco.
  Risk: scan infrastructure gap, not a security gap (Eco's certification is confirmed).
  Action: add Identity/version block to Eco.md. Owner A1 required. Flag to Anat.

RV-05: spawn-allowlist runner-spawn section uses old agent names
  File: company/governance/agent-tool-spawn-allowlist.md, runner-spawn section
  Old names: "Tim," "Noam" (superseded by Sally, Perry).
  Risk: runner-spawn list may silently fail to launch Sally/Perry, or the old names may map
  to no agent file, causing launch errors. Not a security escalation risk (these are non-Bash
  agents on the stripped runner path), but an operational correctness issue.
  Action: update spawn-allowlist runner-spawn section names from "Tim" -> "Sally" and
  "Noam" -> "Perry." Also add "Oren" for "Senior Dev" once BL-04 is resolved. A1 required
  (spawn-allowlist is A1 per its own header).

---

## CLEAR

Check (a) -- Tools vs gate-register: ALL CLEAR
  All tools in all 31 role files are either on the gate-register or covered by the general
  Claude Code runtime approval (A1 2026-06-12, which covers Read, Write, Edit, Bash, Grep,
  Glob, Agent, WebSearch, WebFetch, and all other built-in Claude Code tools).
  Specific cross-checks:
  - Rambo: Grep, Glob, WebFetch -- gate-register rows present (bootstrapping exception,
    Rambo A1 2026-06-14).
  - Erez: WebSearch, WebFetch -- gate-register row present (A1 2026-06-17).
  - Zvika: WebSearch, WebFetch -- gate-register row present (A1 2026-06-18).
  - Eyal: WebFetch -- gate-register row present (A1 2026-06-23).
  - MeetingPrep: Google Drive MCP (read-only) + Google Calendar MCP (read-only) --
    gate-register rows present (A1 2026-06-12).
  - Eco: google-calendar (list_events, get_event read-only) -- covered by Google Calendar
    MCP gate-register approval (A1 2026-06-12).
  - RedTeam: Read, Grep, Glob, Write -- Grep/Glob covered by Claude Code runtime A1; Read/Write
    are built-ins. No unexplained tool. CLEAR.
  - All other agents: Read, Write, Edit only -- fully covered by Claude Code runtime A1.

Check (d) -- Agent tool vs spawn-allowlist: ALL CLEAR
  Only ONE agent holds the Agent tool in frontmatter: Anat.md (HR and Agent-Ops).
  Anat IS on the spawn-allowlist PERMITTED list (confirmed: line reads "Anat (HR) -- Read,
  Write, Edit, Agent"). Caveat in allowlist confirmed: "Anat must not be used to reach Bash
  agents indirectly." Role file and allowlist are consistent. CLEAR.

Bash agents:
  - Eco.md: Bash -- Claude Code built-in, A1 runtime approval (2026-06-12). CLEAR.
  - Gal.md: Bash -- Rambo B5 JUSTIFIED (dev/test/build). CLEAR.
  - Shir.md: Bash -- Rambo B5 JUSTIFIED (pipeline/deploy/infra). CLEAR.
  - Adi.md: Bash -- Rambo B5 JUSTIFIED (test execution). See RV-03 for documentation gap.
    No security issue. CLEAR.

Anat.md -- Agent tool:
  Agent tool is justified for HR interview methodology (live interview mode via Agent tool).
  Anat IS on spawn-allowlist PERMITTED section. Caveat enforced in role file. CLEAR.

Oren.md -- Reduced tool set (no Write):
  Oren has Read + Edit only (no Write by role design -- reviewer, not author). This is a
  more restrictive grant than standard, not an overage. CLEAR.

---

## Summary

BLOCKING: 9 flags -- all are roster maintenance gaps (agent names and entries not updated
after hires). No tool-gate violations found. No unauthorized Agent-tool holders found.

REVIEW: 5 items -- 2 post-scan role-file changes (both owner A1 approved, both compliant),
1 stale documentation note in Adi.md, 1 missing version block in Eco.md, 1 stale runner-spawn
name list. No security gaps in any REVIEW item.

Required actions before next scan (2026-07-06):
1. Anat + Eco: update roster.md for BL-01 through BL-09 (9 name/entry corrections).
2. Eco: update spawn-allowlist runner-spawn section for stale names (RV-05, A1).
3. Anat: clean up Adi.md description text (RV-03, A1 for role-file edit).
4. Anat: add Identity/version block to Eco.md (RV-04, A1 for role-file edit).

---

ESCALATE_TO_ECO_BLOCKING
