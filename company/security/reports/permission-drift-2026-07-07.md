# Permission-Drift Scan -- 2026-07-07

Scan type: weekly (Monday)
Scanner: runner invocation 2026-07-07T03:56:19Z
Files read: 32 role files in .claude/agents/, company/governance/gate-register.md,
  company/roster.md, company/governance/agent-tool-spawn-allowlist.md
Prior scan baseline: company/security/reports/permission-drift-2026-07-06.md

---

## BLOCKING FLAGS

Both blocking flags from the 2026-07-06 scan are STILL OPEN. No changes to company/roster.md
or any .claude/agents/ role file were recorded between the two scan dates.

### BF-1: Agent files in .claude/agents/ with no roster entry (CARRIED FORWARD, UNRESOLVED)

Five agents have certified (or stage-A) role files but are absent from company/roster.md (v2.2):

| Agent file | Status | Notes |
|---|---|---|
| Oracle.md | CERTIFIED + LIVE 2026-06-18 | HIRE-002; not in roster table or pending section |
| Yael.md | CERTIFIED + LIVE 2026-06-18 | HIRE-001; not in roster |
| RedTeam.md | CERTIFIED + LIVE 2026-06-22 | Not in roster |
| MeetingPrep.md | CERTIFIED + LIVE 2026-06-18 | Not in roster |
| Yossi.md | Stage A only, B3 pending | Roster section 6 explicitly notes row is missing |

Second consecutive scan with no remediation on record. Anat's A1 2026-06-28 mandate requires
roster update in the same workflow as any agent lifecycle change; that rule was not followed for
any of these five and has now been outstanding for at least eight days.

ACTION REQUIRED: Anat + Eco update company/roster.md to add all five. For Yossi, add a row
noting Stage A only and B3 pending (not yet live). Owner A1 required for each new roster row.
Roster must match .claude/agents/ before next weekly scan.

### BF-2: Roster entries with no matching agent file (name drift) (CARRIED FORWARD, UNRESOLVED)

Three roster rows name agents that have no matching .claude/agents/ file:

| Roster name | Active agent file | Change event |
|---|---|---|
| Tim (VP Sales) | Sally.md | Sally pulled forward per ORG-002, owner A1 2026-06-15 |
| Noam (Product) | Perry.md | Perry VP Product title, owner A1 2026-06-17 (T-0001) |
| Avner (Customer Success) | Jack.md | Renamed/re-scoped, re-certified 2026-06-18 |

Tim, Noam, and Avner have no active agent files. The roster incorrectly implies they are live.
Second consecutive scan with no remediation on record.

ACTION REQUIRED: Anat updates roster rows: Tim -> Sally, Noam -> Perry, Avner -> Jack.
Owner A1 required for each rename. Include Designer name (R-5 below) in the same batch.

---

No BLOCKING FLAGS found for:
- Tools vs. gate-register (see CLEAR section)
- Agent tool holders vs. spawn-allowlist (see CLEAR section)

---

## REVIEW ITEMS

### R-1: Adi Bash scrutiny not formally closed (CARRIED FORWARD)

Adi.md description field still reads:
"Has Bash for running test suites -- Rambo B5 must scrutinize this grant next session."

No written CLEAR or CLEAR-WITH-CONDITIONS from Rambo on this specific open action has been
recorded in the role file or gate-register. Two consecutive scans with no discharge.

ACTION REQUIRED: Rambo conducts B5 re-scrutiny of Adi's Bash grant, records the verdict
(CLEAR / CLEAR-WITH-CONDITIONS / REVOKE) in Adi.md and gate-register, and removes the deferred-
scrutiny note from the description field. Eco to schedule immediately.

### R-2: Noa provisional certification gate approaching (CARRIED FORWARD)

Noa.md is LIVE (owner A1 2026-06-30) on provisional status. Live behavioral B3 confirmatory
gate is due approximately 2026-07-21 -- 14 days from today. If gate is not passed, R&R is
triggered and go-live is suspended.

Git status shows ai-patient-simulator source files modified and new test files untracked
(authoring-rbac.spec.ts, authoring.integration.spec.ts, credit-admin.spec.ts), consistent
with Noa executing Sprint 2 work. No evaluation yet -- B3 gate is behavioral, not file-count.

ACTION REQUIRED: Eco + Anat confirm B3 date is calendared. No permission drift today --
schedule watch item. This is the second consecutive scan flagging the approaching gate.

### R-3: Yossi role file live but agent not certified (CARRIED FORWARD)

Yossi.md exists in .claude/agents/ with Stage A approval only. The agent is not yet live.
An operator not aware of Yossi's status could attempt to spawn this role. No status guard is
present in the description frontmatter.

ACTION REQUIRED: Anat confirm whether Yossi.md should remain in .claude/agents/ or be moved
to a staging path until B3 completes. At minimum, update the description frontmatter to read
"NOT YET LIVE -- Stage A only, B3 pending." Eco to decide path. Second consecutive scan.

### R-4: Agent tool (Eco bridge) -- Eyal confirmation column not closed (CARRIED FORWARD)

Gate-register row for "Agent tool (for Eco, Telegram bridge)" shows Eyal column as:
"PENDING (Eyal not yet live; scope: same subscription, no new terms -- confirm on activation)."
Eyal went live 2026-06-17. The gate-register column has not been updated.

The owner A1 (2026-06-15) is on record. The open Legal column is an audit gap.

ACTION REQUIRED: Eyal reviews the Agent tool scope and records confirmation in gate-register.md,
closing this row. Eco to task Eyal. Second consecutive scan.

### R-5: Designer persona name not in roster (CARRIED FORWARD)

Designer.md persona is "Tal" (assigned by Anat + Eco at build). Roster still shows "(unnamed)."
Lower severity -- no agent file is missing, documentation-completeness only.

ACTION REQUIRED: Include Designer row update (Tim -> Sally, Noam -> Perry, Avner -> Jack, and
"(unnamed)" -> "Tal") in the same owner A1 batch as BF-1 and BF-2 corrections.

### R-6: Role files changed since 2026-07-06 baseline

No .claude/agents/ role files appear as modified in git status since the 2026-07-06 baseline.
Zero file-change entries for this period.

NOTE: The 2026-07-06 scan report (company/security/reports/permission-drift-2026-07-06.md) is
present on disk but is untracked (not committed). This is a git hygiene observation, not a
security finding; runner commit cycle should include the daily/weekly report files.

---

## CLEAR

### Tools vs. gate-register: CLEAR (no ungated tools found)

All tools across all 32 role files map to approved entries:

- Read, Write, Edit: Claude Code built-ins. Covered by runtime, owner A1 2026-06-12.
- Bash (Eco, Gal, Shir, Adi, Noa): Claude Code built-in; Rambo B5 CLEAR-WITH-CONDITIONS in
  each role file. Adi B5 scrutiny open (R-1) but Bash grant itself has a registered entry.
- Grep, Glob (Rambo): gate-registered, bootstrapping exception A1 2026-06-14.
- Grep, Glob (RedTeam): Claude Code built-ins; Rambo B5 CLEAR-WITH-CONDITIONS 2026-06-22.
- WebFetch (Rambo): gate-registered, A1 2026-06-14.
- WebFetch (Eyal): gate-registered, A1 2026-06-23.
- WebSearch + WebFetch (Erez): gate-registered, A1 2026-06-17.
- WebSearch + WebFetch (Zvika): gate-registered, A1 2026-06-18.
- Google Drive MCP read-only (MeetingPrep): gate-registered, A1 2026-06-12.
- Google Calendar MCP read-only (MeetingPrep, Eco): gate-registered, A1 2026-06-12.
- Agent (Anat): owner A1 2026-06-15 (interim grant); T-0020 conditions on record.

No agent holds a tool not covered by the above.

### Agent files vs. roster: 24 agents CLEAR by name

The following 24 agent files have exact name matches in company/roster.md:
Eco, Ido, Mike, Lital, Eyal, Dalia, Zvika, Anat, Assaf, Rambo, Gal, Shir, Adi, Roman, Oren,
Noa, Jenny, Ella, Alex, Hila, Luci, Erez, Sami, Perry.

Note: Perry is listed in CLEAR because she appears by name in the roster (added v2.2); her
correct role/title mismatch (roster says "Noam" is Product, Perry.md says VP Product) is
captured in BF-2. Four additional agents (Sally, Jack, Designer, and the five in BF-1) have
discrepancies resolved in the BLOCKING FLAGS sections.

### Agent tool holders vs. spawn-allowlist: CLEAR

Only one agent has "Agent" in frontmatter tools: Anat.md.
Anat is on the PERMITTED list in agent-tool-spawn-allowlist.md (owner A1 2026-06-15).
No other agent holds the Agent tool explicitly.

### Oren Read+Edit (no Write): CLEAR

Oren.md correctly lists tools as "Read, Edit" only. Matches role (code-reviewer).

### RedTeam tool scope: CLEAR

RedTeam.md: Read, Grep, Glob, Write. No Bash, no Edit. Grep/Glob scoped to internal security
testing only. Rambo B5 CLEAR-WITH-CONDITIONS 2026-06-22 on record.

### Tainted-content agents: CLEAR

WebSearch/WebFetch holders (Erez, Zvika, Eyal, Rambo) all carry tainted-content handling rules
in their role files. No change since last scan.

---

## Summary counts

| Category | Count |
|---|---|
| BLOCKING FLAGS | 2 (BF-1: 5 agents off roster; BF-2: 3 stale roster names) -- both carried forward unresolved |
| REVIEW items | 6 (R-1 through R-6; R-6 shows zero changed files this cycle) |
| CLEAR items | 32/32 agents with no ungated tools; 24/32 roster name-exact match |

Escalation urgency: BF-1 and BF-2 are each in their second consecutive weekly scan with no
remediation. Eco should treat these as overdue, not merely pending.

---

ESCALATE_TO_ECO_BLOCKING
