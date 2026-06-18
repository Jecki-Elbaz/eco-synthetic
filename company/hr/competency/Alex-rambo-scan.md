# B5 Permission Scan -- Alex (Sales Execution)
Scanned by: Rambo | Date: 2026-06-18 | Basis: .claude/agents/Alex.md v1.0

## Verdict: CLEAR-WITH-CONDITIONS

---

## Tools assessed

Read, Write, Edit -- Claude Code built-ins. No Bash, no WebSearch, no WebFetch.
Tool set is at least-privilege for the Sales Execution function.
WebSearch/WebFetch are explicitly NOT granted; role file states "flag need to Tim via
Security + Legal gate -- do not self-adopt." Correct.

---

## Findings

F1: NO PROSPECT/CUSTOMER CONTACT PATH REACHABLE PRE-GATE
Hard boundary stated: "never send outreach, proposals, or any prospect/customer-facing
communication without: (a) product in existence, (b) Tim-approved pricing, (c) explicit
Tim + owner A1 for that specific send. Draft-only until all three conditions are met."
Three-condition gate is clear and correctly escalated to A1. PASS.

F2: PROJECTS/ READ ACCESS
Role file grants "projects/<name>/ -- read (product context for selling)." This is broad --
no specific project partition is named. In practice, Alex could read any projects/ subfolder.
Severity: low (P1 phase; no live projects with sensitive data yet). Flag for scoping when
a specific project becomes the sales target.

F3: MARKETING/ READ ACCESS
Role file grants "marketing/ -- read (for context; coordinate with Hila via Tim)." Marketing
folder is Sales-group accessible per access matrix. PASS.

F4: COMPANY/ READ ACCESS
"company/ -- read-only, need-to-know." Broad but not write-access. Matches access matrix
(company/ restricted, role-gated; Alex as Sales group member gets read for context).
Acceptable; no excess. PASS.

F5: PROSPECT/CUSTOMER PERSONAL DATA CONSTRAINT PRESENT
"No verbatim personal data into tracked files or logs -- structured summaries only. No broad
scraping of personal data." Israeli privacy law cited. PASS.

F6: NO EXTERNAL SEND WITHOUT A1
Role file is explicit: external sends (proposal, quote, outreach) require Tim + owner A1,
product confirmed, pricing confirmed. Three-layer gate. PASS.

F7: SPAWN ALLOWLIST
No Bash, no network tools. Low blast radius. T-0020 C3 unresolved (system-wide blocker).
Alex is off the permitted-spawn allowlist until T-0020 C3 clears.

F8: PROMPT-INJECTION EXPOSURE
No WebSearch/WebFetch. Any prospect research material would be supplied by Tim or via
approved channels. No direct external content ingestion. Low risk.

---

## Conditions

C1: projects/ read scope should be narrowed to the specific project(s) Alex is supporting
at go-live. Informational now (no live projects); must be resolved before Alex is activated
against any real deal. Tim or Eco to scope at activation.
C2: Off permitted-spawn allowlist until T-0020 C3 resolved (system-wide blocker).

---

## Mitigations

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|--------------|----------------|-----------------|-----------------|
| F2 broad projects/ read | Tim / Eco | Scope Alex to specific project at activation briefing | jecki (A1) | Named project path in role file or task envelope at go-live |
| F7 spawn allowlist | Eco | Hold off allowlist | Shir / Eco | Resolve T-0020 C3 cascade confirmation |

Recommendation: CLEAR-WITH-CONDITIONS. C1 is informational (no blocker); C2 is system-wide. No cert blocker today.
