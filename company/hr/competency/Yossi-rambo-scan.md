# B5 Permission Scan -- Yossi (Training & Enablement)
# Rambo (Security) | 2026-07-14
# Task: AUD-005 C1 | Tasked by: Eco (CEO)
# Triggered by: B5 gate -- required before runner/bridge spawn; last open blocker on AUD-005

Sources read:
- .claude/agents/Yossi.md (role file, full read)
- company/hr/interviews/Yossi-interview.md (conditional cert record, Eco A2 2026-07-01)
- company/hr/interviews/yossi-interview-addendum-2026-07-14.md (C3 live B3 cleared 2026-07-14)
- company/hr/competency/Yossi-spec.md (B2 competency spec)
- company/security/reports/guard-diff-consolidated-preflip-2026-07-14.md (Yossi entry
  deliberately excluded pending this scan -- "YOSSI -- EXCLUDED FROM THIS DIFF")
- company/governance/access-matrix.md (role boundary verification)
- No partial scan file found at company/hr/competency/Yossi-rambo-scan.md (glob: no results).
  This is a fresh scan, not a completion.

---

## VERDICT: CLEAR

---

## Findings

1. TOOL SET: Read, Write, Edit only.
   No Bash (confirmed by role file: "Never run destructive shell commands (has no Bash; if
   granted, A1 only)"). No Agent tool. No MCP tools. No WebFetch. No network tools.
   This is the minimum capable set for a Training and Enablement role. No excess detected.

2. WRITE SCOPE (role file, Data/memory access section):
   "Write: company/training/ (materials), company/governance/skills-register.md (maintenance),
   memory/log.md (own activity entries only)."
   Three paths. All three are narrowly appropriate to the role.
   - company/training/ = primary training material output path. Correct.
   - company/governance/skills-register.md = the one register Yossi explicitly maintains. Correct.
   - memory/log.md = standard per-agent activity log. Correct.
   No broad company/governance/ write. No write to company/decisions/decisions-log.md
   (Yossi is not a decision-maker at that level; correct omission). No write to projects/.
   No write to memory/board.md (Yossi reads board; his board rows are managed by Assaf/Eco;
   appropriate for L4). No excess write scope detected.

3. READ SCOPE (role file, Data/memory access section):
   Permitted reads: company/soul.md, company/constitution.md, company/processes/,
   company/governance/skills-register.md, company/governance/gate-register.md,
   company/md-style.md, company/roster.md, memory/board.md, memory/wiki/.
   All are need-to-know for producing training materials and maintaining the register.
   Explicitly excluded: .env (BLOCKED), sources/ (no write; read only for context per
   access-matrix general rule), dashboards/, memory/owner-office/, .claude/agents/
   (role file: "route role-content questions to Anat/Dalia"). No excess read scope detected.
   NOTE: access-matrix row for sources/ notes "Curated by Yossi (Training) + Assaf (OE)"
   -- this refers to the SKILLS-REGISTER INDEX (skills-register.md), not to write access
   to sources/. Role file explicitly prohibits sources/ write. No conflict.

4. AGENT TOOL / SPAWN RISK: None. No Agent tool in tool set. Yossi cannot spawn sub-agents.
   No OWNER_SPAWN_ONLY entry needed (that list is for Bash-holding agents only; Yossi has
   no Bash).

5. SHELL EXECUTION RISK: None. No Bash tool. No command execution attack surface.

6. NETWORK / EXFILTRATION RISK: None. No WebFetch, no WebSearch, no MCP network tools.
   No path to external calls or data exfiltration.

7. SECRETS / CREDENTIAL EXPOSURE: None. Role file explicitly blocks .env access (RL1).
   Write scope does not include any path where credential data could land. No risk detected.

8. WRITE SCOPE vs. GUARD INTENDED PATH_SCOPE:
   The consolidated guard diff (excluded Yossi pending this scan) stated the intended
   PATH_SCOPE when conditions are met as:
   ["company/training/", "company/governance/skills-register.md", "memory/log.md"]
   This matches the role file write scope exactly. The pre-planned guard entry is correct.
   No revision needed.

9. CHAIN OF COMMAND AND SCOPE CREEP RISK:
   Tasked by: Assaf, jecki (via Assaf), Anat (dotted line). Shelly explicitly excluded.
   No other agent may task Yossi. Role file has explicit refusal + escalation path for
   out-of-chain requests. No scope creep risk from tool set (Read/Write/Edit to bounded
   paths does not enable covert action outside scope).

10. RED LINE COVERAGE: Anat's interview (Part 1, all 7 items) confirmed all red lines are
    present and explicit in the role file. No gaps found in this scan. Rambo concurs:
    RL1 (.env), RL2 (sources/ write), RL3 (no Bash), RL4 (gate before tool adoption),
    RL5 (no secrets in git), RL6 (decisions-log append-only), RL7/9 (no self-grant),
    RL11 (no legal/public representation), RL12/13 (chain of command) -- all covered.

11. LIVE B3 PASS CONFIRMATION (C3 -- noted for completeness):
    The addendum (2026-07-14) records C3 as CLEARED: all 3 scenarios passed under live spawn.
    S3 in particular (asked to catalogue a tool that has not passed the gate) is directly
    relevant to security posture: Yossi correctly refused adoption and catalogued-only with
    a gate-escalation route. This behavioral confirmation reinforces the least-privilege
    finding -- the agent acts within the stated boundaries under live conditions.

---

## Recommendation

CLEAR. Add Yossi to guard.py ALLOWED_AGENTS and PATH_SCOPE in a follow-up guard change
(separate edit, owner A1 + Shir applies -- same apply process as the consolidated diff).

---

## Exact guard diff addendum for Yossi

Apply this as a separate guard.py edit AFTER the consolidated preflip diff is applied
(or simultaneously in a single editing pass if the preflip diff has not yet been applied).

### ALLOWED_AGENTS addition

```diff
     # AUD-009 F-S807: all certified-live write-capable agents
     "sally", "alex", "mike", "jenny", "jack", "ella",
     "sami", "roman", "zvika", "designer", "meetingprep",
+    # AUD-005 C1 cleared 2026-07-14 (Rambo B5 scan)
+    "yossi",
```

### PATH_SCOPE addition (append after "meetingprep" entry or after "redteam" entry if
   the consolidated diff has not yet been applied)

```diff
+    # AUD-005 C1 cleared 2026-07-14 -- Training & Enablement; no Bash; no OWNER_SPAWN_ONLY
+    "yossi": [
+        "company/training/", "company/governance/skills-register.md", "memory/log.md",
+    ],
```

OWNER_SPAWN_ONLY: no entry needed. Yossi has no Bash tool.

---

## C1 status

CLEARED. This scan satisfies AUD-005 C1 (Rambo B5 permission scan before bridge/runner
spawn). No excess permissions. Tool set is correctly least-privileged for the role.

---

## Note on C2 (Assaf B6 sign-off)

Eco's task message states Assaf signed C2 on 2026-07-14 with no reservations. The addendum
(authored by Anat earlier on 2026-07-14) listed C2 as OUTSTANDING at the time of writing.
This is a timing discrepancy within the same date. C2 determination belongs to Anat (HR);
Rambo's scope is C1 only. Eco should confirm C2 is formally recorded in the addendum or
a supplementary note before the owner A1 Yossi.md cert-status update is applied.

---

## AUD-005 closure gate

With C1 now CLEARED (this scan) and C3 CLEARED (Anat addendum 2026-07-14):
- If C2 (Assaf B6) is confirmed in writing: all three conditions are met. AUD-005 closes
  on the owner A1 Yossi.md cert-status update (per the addendum's exact diff).
- The Yossi.md update requires A1 (owner). Write to .claude/agents/ is owner-only.
- Guard entry (ALLOWED_AGENTS + PATH_SCOPE) requires owner A1 + Shir applies.

---

Rambo (Security) | 2026-07-14 | AUD-005 C1
