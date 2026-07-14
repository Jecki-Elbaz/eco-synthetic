# Permission-Drift Scan -- 2026-07-13

Scan type: weekly (Monday)
Scanner: runner invocation 2026-07-13 (second pass; supersedes earlier same-day invocation)
Files read: 32 role files in .claude/agents/, company/governance/gate-register.md,
  company/roster.md, company/governance/agent-tool-spawn-allowlist.md
Prior scan baseline: company/security/reports/permission-drift-2026-07-07.md
GR-009 addendum coverage: .mcp.json pin noted; guard.py constants noted from prior scan;
  credential-store directory scan: INCOMPLETE (R-9, same limitation as prior scan -- no Bash
  on runner path; Glob denied for paths outside project root).

---

## BLOCKING FLAGS

Both blocking flags from 2026-07-07 are STILL OPEN. No changes to company/roster.md or any
.claude/agents/ role file were recorded between 2026-07-07 and 2026-07-13.
FOURTH consecutive scan with BF-1 and BF-2 unresolved.

### BF-1: Agent files in .claude/agents/ with no roster entry (FOURTH CONSECUTIVE SCAN)

Five agents have certified (or stage-A) role files but are absent from company/roster.md (v2.2):

| Agent file | Status | Notes |
|---|---|---|
| Oracle.md | CERTIFIED + LIVE 2026-06-18 | HIRE-002; no roster row or pending-section entry |
| Yael.md | CERTIFIED + LIVE 2026-06-18 | HIRE-001; no roster row |
| RedTeam.md | CERTIFIED + LIVE 2026-06-22 | No roster row |
| MeetingPrep.md | CERTIFIED + LIVE 2026-06-18 | No roster row |
| Yossi.md | Stage A only, B3 pending | Roster section 6 notes row is missing; not yet live |

No remediation in four consecutive scans (first flagged 2026-07-06; now 7 days overdue).
Anat's mandate (owner A1 2026-06-28) requires roster update in the same workflow as any agent
lifecycle change. Rule was not followed for any of these five.

ACTION REQUIRED: Anat + Eco update company/roster.md to add all five rows. For Yossi, add a
row noting Stage A only and B3 pending (not yet live). Owner A1 required for each new roster row.
Roster must match .claude/agents/ at the next weekly scan.

### BF-2: Roster entries with no matching agent file (name drift) (FOURTH CONSECUTIVE SCAN)

Three roster rows name agents that have no matching .claude/agents/ file:

| Roster name | Active agent file | Change event |
|---|---|---|
| Tim (VP Sales) | Sally.md | Sally pulled forward per ORG-002, owner A1 2026-06-15 |
| Noam (Product) | Perry.md | Perry VP Product title, owner A1 2026-06-17 (T-0001) |
| Avner (Customer Success) | Jack.md | Renamed/re-scoped, re-certified 2026-06-18 |

Tim, Noam, and Avner have no active agent files. Roster incorrectly implies they are live.
Fourth consecutive scan with no remediation.

ACTION REQUIRED: Anat updates roster rows: Tim -> Sally, Noam -> Perry, Avner -> Jack.
Owner A1 required for each rename. Include Designer name update (R-5 below) in the same batch.

---

No BLOCKING FLAGS found for:
- Tools vs. gate-register (see CLEAR section)
- Agent tool holders vs. spawn-allowlist (see CLEAR section)

---

## REVIEW ITEMS

### R-1: Adi Bash scrutiny not formally closed (FOURTH CONSECUTIVE SCAN)

Adi.md description frontmatter still reads:
"Has Bash for running test suites -- Rambo B5 must scrutinize this grant next session."

Confirmed by direct read of Adi.md this scan. No written CLEAR or CLEAR-WITH-CONDITIONS from
Rambo on this specific open action has been recorded in the role file or gate-register.
Four consecutive scans with no discharge. This is overdue.

ACTION REQUIRED: Rambo conducts B5 re-scrutiny of Adi's Bash grant, records verdict (CLEAR /
CLEAR-WITH-CONDITIONS / REVOKE) in Adi.md certification block and gate-register, and removes
the deferred-scrutiny note from the description frontmatter. Eco to schedule immediately.

### R-2: Noa provisional certification B3 gate -- 8 days remaining (ELEVATED)

Noa.md is LIVE (owner A1 2026-06-30) on PROVISIONAL status. Live behavioral B3 confirmatory
gate is due approximately 2026-07-21 -- 8 days from today. On B3 FAIL: Anat triggers R&R
review, go-live suspended, Eco + Ido decide next step.

Git status observation (2026-07-13): APS sprint work is visibly active -- arc-writer.service.ts
and simulation.service.ts modified; new test files (arc-access.spec.ts, arc-cache.spec.ts,
arc-writer-s7.spec.ts, dsr.spec.ts) are untracked; sprint-8-envelope-ido-2026-07-13.md and
review-sprint-7-oren.md created. Sprint 7 appears complete or closing; Sprint 8 starting.
Oren review evidence confirms the handoff chain is working. No behavioral B3 evaluation
outcome recorded yet.

ACTION REQUIRED: Eco + Anat confirm B3 evaluation is scheduled for no later than 2026-07-21.
Ido to confirm sprint deliverables will be ready for evaluation by that date. Flag to owner
if any slip risk. Gate window is now imminent.

### R-3: Yossi role file in .claude/agents/ but agent not certified (FOURTH CONSECUTIVE SCAN)

Yossi.md exists in .claude/agents/ with Stage A approval only (not live). Description
frontmatter does not include a NOT-YET-LIVE warning. An operator unaware of status could
attempt to spawn this agent. Fourth consecutive scan with no action on this item.

Confirmed by direct read: Yossi.md Version 0.1, "PENDING. Stage A owner A1 2026-06-18."
B3 deferred; B4-B7 pending.

ACTION REQUIRED: Anat decide whether Yossi.md should remain in .claude/agents/ with a
NOT-YET-LIVE flag in the description frontmatter, or be moved to a staging path until B3
completes. At minimum, update the description to read "NOT YET LIVE -- Stage A only, B3
pending." Eco to route to Anat.

### R-4: Agent tool (Eco bridge) -- Eyal gate-register confirmation not closed (FOURTH SCAN)

Gate-register row for "Agent tool (for Eco, Telegram bridge)" shows Eyal column:
"PENDING (Eyal not yet live; scope: same subscription, no new terms -- confirm on activation)."
Eyal went live 2026-06-17. This column has not been updated. Fourth consecutive scan.

The owner A1 (2026-06-15) is on record. The open Legal column is an audit gap -- the
underlying permission is in place; the register row is incomplete.

ACTION REQUIRED: Eyal reviews Agent tool scope (same Anthropic subscription, no new vendor
terms) and records confirmation in gate-register.md. Eco to task Eyal in the next session.

### R-5: Designer persona name "Tal" not in roster (FOURTH CONSECUTIVE SCAN)

Designer.md (confirmed by direct read, v1.2, 2026-07-12) has persona name "Tal" assigned by
Anat + Eco at build (owner pre-approved). Roster still shows "(unnamed)" for the Designer row.
Lower severity -- no agent file is missing. Documentation-completeness gap only.

ACTION REQUIRED: Include Designer row update in same owner A1 batch as BF-1/BF-2: update
Designer row from "(unnamed)" to "Tal (Designer)".

### R-6: Role files changed since 2026-07-07 scan (no new changes since same-day prior run)

Files changed between 2026-07-07 and 2026-07-13 (already noted in prior same-day invocation):

| File | Version | Date | Change |
|---|---|---|---|
| Eco.md | v1.1 | 2026-07-12 | Added Identity/version block, KPIs, Escalation path (Phase 6 F-RR02, owner A1) |
| Eyal.md | v1.2 | 2026-07-12 | Added Constitution red lines 9/10/11; cited RL8 (Phase 6 F-RR03, owner A1) |
| Designer.md | v1.2 | 2026-07-12 | Added 7 template sections (Phase 6 F-RR01); fixed stale Approved-by (owner A1) |
| RedTeam.md | v0.2 | 2026-07-11 | Phase 5 F-P5 stale-line correction in cert status (owner A1) |

All four: documentation-completeness fixes, owner A1 on record, no new tool grants, no
permission changes. No .claude/agents/ files appear as modified in git status since the
prior same-day invocation.

No additional role file changes detected in this pass.

### R-7: GR-016 APS Hosted Demo Surface -- no new tool grants

GR-016 was opened 2026-07-12 for the APS Hosted Demo Surface (Adam external access).
This is a surface approval, not an agent tool grant. No new agent tools were introduced.
Security conditions DEMO-C1 through DEMO-C10 are listed in gate-register.md; owner A1
required before any go-live.

APS sprint work (arc-related test files, sprint-8 envelope, Prisma migration
20260712000001_arc_session_summary_retain_until) is consistent with authorized sprint
execution. No permission-drift issue.

### R-8: guard.py allows Noa to be spawned -- policy/enforcement gap (CARRIED FORWARD)

From prior scan: guard.py ALLOWED_AGENTS includes "noa". Noa is NOT in SPAWN_DENY and NOT
in OWNER_SPAWN_ONLY. Noa.md cert status says "OFF the auto-spawn allowlist until T-0020 C3."
agent-tool-spawn-allowlist.md does not formally list Noa in DENIED or PERMITTED sections.

Result: if Anat (the only Agent-tool holder) attempted to spawn Noa, guard.py would ALLOW it
despite policy saying she is OFF the spawn allowlist.

Compensating controls: Noa does not hold the Agent tool (no recursive spawn); Anat is unlikely
to spawn Noa without an explicit task envelope naming her.

ACTION REQUIRED: Rambo determine whether Noa should be added to OWNER_SPAWN_ONLY in guard.py
(enforcing the "off auto-spawn allowlist" policy) or whether the Noa.md policy text needs
updating to match actual guard.py behavior. Resolve before Noa's B3 gate 2026-07-21.

### R-9: Credential-store directory scan incomplete (PERSISTENT SCAN LIMITATION)

GR-009 addendum (2026-07-10) requires the weekly scan to cover the three credential-store
directories for unexpected token files. On the runner path, Bash is disabled and Glob for
C:\Users\Jecki\.google_workspace_mcp\ is outside the project root (denied). Directory
contents could not be verified this scan.

What WAS confirmed (from prior scan's readable sources): .mcp.json WORKSPACE_MCP_CREDENTIALS_DIR
correctly points to eco-creds directory; guard.py ECO_GOOGLE_ACCOUNT correctly set to
eco.synthetic.org@gmail.com; send_gmail_message DENIED on runner path.

ACTION REQUIRED: Owner or Rambo manually verify C:\Users\Jecki\.google_workspace_mcp\
contains only the expected subdirectories (eco-creds, plus owner/Shelly stores in their own
paths outside this project) and no unexpected token files. Flag result to Eco.

### R-10: GR-015 supertest@7.2.2 still PENDING owner A1

Gate-register GR-015 (supertest@7.2.2, APS devDependency) status: DRAFT -- PENDING owner A1.
Both Rambo (CLEAR-WITH-CONDITIONS) and Eyal (CLEAR) legs are complete (2026-07-11).
Install blocked until owner A1. Not a permission-drift issue -- supertest is not installed.
Noting to prompt owner decision; both review legs are complete.

ACTION REQUIRED: Owner A1 decision in-session to install or defer supertest@7.2.2 (APS Sprint
4 unblock). Eco to surface to owner.

---

## CLEAR

### Tools vs. gate-register: CLEAR (no ungated tools found)

All tools across all 32 role files map to approved gate-register entries:

- Read, Write, Edit: Claude Code built-ins. Covered by runtime, owner A1 2026-06-12.
- Bash (Eco, Gal, Shir, Adi, Noa): Claude Code built-in; Rambo B5 CLEAR-WITH-CONDITIONS in
  each role file. Adi B5 scrutiny open (R-1) but Bash grant has a registered entry.
  Eco: general CEO orchestration. Gal/Shir/Adi/Noa: scoped per role file.
- Grep, Glob (Rambo): gate-registered, bootstrapping exception A1 2026-06-14.
- Grep, Glob (RedTeam): Claude Code built-ins; internal security testing only;
  Rambo B5 CLEAR-WITH-CONDITIONS 2026-06-22 on record.
- WebFetch (Rambo): gate-registered, A1 2026-06-14.
- WebFetch (Eyal): gate-registered, A1 2026-06-23. Scope: public legal/terms pages only.
- WebSearch + WebFetch (Erez): gate-registered, A1 2026-06-17.
- WebSearch + WebFetch (Zvika): gate-registered, A1 2026-06-18.
- Google Drive MCP read-only (MeetingPrep): gate-registered, A1 2026-06-12.
- Google Calendar MCP read-only (MeetingPrep, Eco): gate-registered, A1 2026-06-12.
  NOTE: Eco frontmatter uses "google-calendar (read-only list_events, get_event)"; gate-register
  says "Google Calendar MCP (read-only)." Functionally identical; naming cosmetic only.
- Agent (Anat): owner A1 2026-06-15 (interim grant); T-0020 conditions on record.

No agent holds a tool not covered by the above approved entries.

### Agent files vs. roster: 24 agents CLEAR by name

The following 24 agent files have exact name matches in company/roster.md:
Eco, Ido, Mike, Lital, Eyal, Dalia, Zvika, Anat, Assaf, Rambo, Gal, Shir, Adi, Roman, Oren,
Noa, Jenny, Ella, Alex, Hila, Luci, Erez, Sami, Perry.

Five agents have no roster match (BF-1). Three roster rows have no agent match (BF-2).
Both carry forward to BLOCKING FLAGS.

### Agent tool holders vs. spawn-allowlist: CLEAR

Only one agent has "Agent" in frontmatter tools: Anat.md (confirmed by direct read).
Anat is on the PERMITTED list in agent-tool-spawn-allowlist.md (owner A1 2026-06-15).
No other agent holds the Agent tool explicitly in frontmatter.

### Oren tool scope: CLEAR

Oren.md frontmatter: "tools: Read, Edit, Write". No Bash. Write scope per role file:
scoped to projects/delivery-saas/docs/review/ and own log rows only. Claude Code built-ins;
covered by approved runtime. No excess tool.

### RedTeam tool scope: CLEAR

RedTeam.md: Read, Grep, Glob, Write. No Bash, no Edit -- deliberate adversarial-agent
containment. Rambo B5 CLEAR-WITH-CONDITIONS 2026-06-22 on record.

### Tainted-content agents: CLEAR

WebSearch/WebFetch holders (Erez, Zvika, Eyal, Rambo) all carry tainted-content handling
rules in their role files. No change since last scan.

### Four changed role files (from prior scan): CLEAR

Eco.md v1.1, Eyal.md v1.2, Designer.md v1.2, RedTeam.md v0.2 -- documentation completeness
updates with owner A1 on record. No new tools, no permission changes, confirmed by direct read.

### GR-016 APS Hosted Demo: CLEAR (no agent tool grants)

APS Hosted Demo Surface approval creates no new agent tool grants. Conditions DEMO-C1 through
DEMO-C10 apply to the surface at go-live. No permission-drift issue.

---

## Summary counts

| Category | Count |
|---|---|
| BLOCKING FLAGS | 2 (BF-1: 5 agents off roster; BF-2: 3 stale roster names) -- FOURTH CONSECUTIVE SCAN UNRESOLVED |
| REVIEW items | 10 (R-1 through R-10) |
| CLEAR items | 32/32 agents with no ungated tools; 24/32 roster name-exact match |

Escalation urgency:
- BF-1 and BF-2: fourth consecutive scan without remediation. 7 days overdue.
  Anat must update roster.md before the next weekly scan. Owner A1 batch required.
- R-1 (Adi Bash scrutiny): fourth scan without Rambo discharge. Overdue.
- R-4 (Eyal gate-register confirmation): fourth scan. Simple confirmation task.
- R-2 (Noa B3 gate): 8 days remaining. Time-critical. Schedule now.
- R-8 (guard.py Noa gap): resolve before Noa B3 gate 2026-07-21.
- R-3, R-5, R-9, R-10: action required; not time-critical this week.

---

ESCALATE_TO_ECO_BLOCKING
