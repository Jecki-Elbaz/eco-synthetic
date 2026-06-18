# B5 Permission Scan -- Yael (Knowledge/Documentation Manager)
Scanned by: Rambo | Date: 2026-06-18 | Basis: .claude/agents/Yael.md v0.1

## Verdict: CLEAR-WITH-CONDITIONS

---

## Tools assessed

Read, Write, Edit -- Claude Code built-ins. No Bash, no WebSearch, no WebFetch.
Tool set is at least-privilege for the Knowledge/Documentation Manager function.

---

## Findings

F1: WRITE SCOPE POLICY VS. ARCHITECTURE GAP
Role file states: "Write is scoped to company/governance/file-index.md and own activity
rows by policy." This is a behavioral constraint only. The Write tool technically permits
writing to any path within the working directory. Yael could write to company/decisions/,
company/hr/, or .claude/agents/ if instructed to.
Severity: medium. The role file explicitly blocks each of these paths by name in the
Boundaries section, so the constraint is documented. Risk is behavioral, not architectural.

F2: BROAD COMPANY/ READ ACCESS
"Read: all company/ documentation files (need-to-know for indexing and QC)." This includes
company/governance/access-matrix.md, gate-register.md, and security-baseline.md. These are
sensitive governance files. The need-to-know basis is legitimate for the indexing function.
Read-only access to these files is acceptable. PASS.

F3: .CLAUDE/AGENTS/ EXPLICITLY BLOCKED
"No access: .env, sources/, dashboards/, memory/owner-office/, .claude/agents/ (agent files
are Owner/CEO; Yael has no need-to-know exception)." Correct. PASS.

F4: DECISIONS-LOG CONSTRAINT EXPLICIT
"Append-only respect: company/decisions/decisions-log.md is never edited retroactively."
Role file states this twice (Boundaries + Data sections). Adequate. PASS.

F5: ORGANIZER-ONLY CONSTRAINT
"Yael indexes and structures. She does NOT rewrite or edit owned content." Explicitly named
categories: decisions-log (Dalia), role files (A1), constitution + soul.md (A2/A1), chronicle
(Chronicler-owned). Constraint is documented and repeated. PASS.

F6: SPAWN ALLOWLIST
No Bash, no network tools. Low blast radius. T-0020 C3 unresolved (system-wide blocker).
Yael is off the permitted-spawn allowlist until T-0020 C3 clears.

F7: PROMPT-INJECTION EXPOSURE
No network tools. Content handled is internal company documentation. No external data
ingestion path. Injection risk is low.

---

## Conditions

C1: Before activation, confirm that the Write tool is not used outside
company/governance/file-index.md and memory/log.md own rows. The behavioral constraint
should be reinforced in Yael's task envelopes by Dalia. No role-file edit required; task
envelope discipline is sufficient at this phase.
C2: Off permitted-spawn allowlist until T-0020 C3 resolved (system-wide blocker).

---

## Mitigations

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|--------------|----------------|-----------------|-----------------|
| F1 write scope behavioral only | Dalia | Task envelopes name allowed write paths explicitly | jecki (A1) | Consider file-path-restricted Write tool if architecture ever supports it |
| F6 spawn allowlist | Eco | Hold off allowlist | Shir / Eco | Resolve T-0020 C3 cascade confirmation |

Recommendation: CLEAR-WITH-CONDITIONS. No cert blockers. C1 is task-envelope discipline; C2 is system-wide.
