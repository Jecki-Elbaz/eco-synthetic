# B5 Permission Scan -- Jenny (CS Rep)
Scanned by: Rambo | Date: 2026-06-18 | Basis: .claude/agents/Jenny.md v1.0

## Verdict: CLEAR-WITH-CONDITIONS

---

## Tools assessed

Read, Write, Edit -- Claude Code built-ins. No Bash, no WebSearch, no WebFetch.
Tool set is at least-privilege for the CS rep function.

---

## Findings

F1: WRITE PATH UNDEFINED
Write target for CS ticket log is "path confirmed at go-live by Mike." No concrete path is
named in the role file. Until the path is defined and bounded, Write scope is effectively
unbounded within the Claude Code working directory.
Severity: medium (not a blocker for cert; must be resolved before Stage C go-live).

F2: NO CUSTOMER CONTACT PATH REACHABLE PRE-GATE
Role file states the hard gate explicitly: "NO customer contact until CS-0001 is
owner-approved AND a product is live." Refuse + escalate behavior is required twice
(Mike; Eco if Mike unreachable). Customer contact gate is adequately hardened in the
role file. PASS.

F3: CUSTOMER PERSONAL DATA CONSTRAINT PRESENT
"Summaries only; no verbatim personal data in any tracked file" is stated. Israeli
privacy law cited. PASS.

F4: SPAWN ALLOWLIST
Jenny has no Bash, no network tools. Low blast radius. However system-wide blocker
T-0020 C3 is unresolved. Jenny is off the permitted-spawn allowlist until T-0020 C3
clears (same condition as all Wave-2 agents).

F5: PROJECTS/ EXCLUSION PRESENT
"No access: .env, sources/, dashboards/, memory/owner-office/, company/decisions/,
projects/ unless scoped by Mike or Eco." Correctly blocked. PASS.

F6: PROMPT-INJECTION EXPOSURE
No network tools; no external content ingestion path in this role. Injection surface
limited to ticket content submitted by customers (future; gated on CS-0001). That
surface is not active in P1/P3 phase. Low risk in current phase.

---

## Conditions

C1: CS ticket log write path must be named (bounded folder path) before Stage C
go-live. Owner or Mike to define; Rambo to confirm at Stage C scan.
C2: Off permitted-spawn allowlist until T-0020 C3 resolved (system-wide blocker).

---

## Mitigations

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|--------------|----------------|-----------------|-----------------|
| F1 write path undefined | Mike / Eco | Do not activate Jenny for ticket logging until path is named | jecki (A1) | Named write path in role file before Stage C go-live |
| F4 spawn allowlist | Eco | Hold off allowlist | Shir / Eco | Resolve T-0020 C3 cascade confirmation |

Recommendation: CLEAR-WITH-CONDITIONS. Resolve F1 (write path) before Stage C. No cert blocker today.
