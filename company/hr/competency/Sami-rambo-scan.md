# B5 Permission Scan -- Sami (SME Advisor)
Scanned by: Rambo | Date: 2026-06-18 | Basis: .claude/agents/Sami.md v1.0

## Verdict: CLEAR-WITH-CONDITIONS

---

## PRIORITY FOCUS -- Hard partition boundary

Role file design is one-project-only. Confirming the partition boundary is adequately
enforced in the role file text (architectural enforcement is not possible via tool grants
alone; this is behavioral + task-envelope).

---

## Tools assessed

Read, Write, Edit -- Claude Code built-ins. No Bash, no WebSearch, no WebFetch.
Tool set is at least-privilege for the SME Advisor function.

---

## Findings

F1: HARD PARTITION BOUNDARY -- PRESENT AND SPECIFIC
Role file states: "HARD PARTITION -- READ/WRITE SCOPE: Sami reads and writes ONLY inside
projects/<assigned-name>/. No exceptions."
Explicitly blocked:
- Any other project folder (projects/<other>/ blocked).
- company/governance/, company/decisions/, company/hr/.
- memory/owner-office/, dashboards/, .claude/agents/, .env, sources/.
Read permitted: company/constitution.md, company/soul.md, company/roster.md (governance
reference only). This is appropriate and narrowly scoped.
The partition boundary is adequately documented in the role file. PASS on documentation.

F2: PARTITION IS BEHAVIORAL ONLY -- NO ARCHITECTURAL ENFORCEMENT
Write tool does not restrict to a folder path at the tool level. Sami could technically
write outside projects/<assigned-name>/ if given a task that requests it. The role file
explicitly requires refusal of any out-of-scope request, but this is a behavioral
constraint enforced at the agent's decision layer.
Severity: medium. Mitigated by: (a) one-project-one-instance design, (b) explicit refuse
language in role file, (c) project lead / Eco task envelopes as the activation gate.

F3: ASSIGNED PROJECT PATH SET AT INVOCATION -- UNVERIFIABLE UNTIL INVOCATION
"Project name: [SET BY ECO OR PROJECT LEAD AT INVOCATION]" -- the partition path is not
pre-filled. This means the partition boundary is only as good as the invocation task
envelope. If Eco or project lead invokes Sami with an overly broad partition (e.g.,
"all projects/"), the behavioral block in the role file is the only stop.
Severity: low (Eco + project lead are the activation gate; Sami refuses cross-project
work regardless). Requires activation-time discipline.

F4: NO CUSTOMER/PROSPECT CONTACT PATH
SME Advisor scope is entirely internal advisory within the project partition. No
customer-facing channel. PASS.

F5: PROMPT-INJECTION EXPOSURE
No WebSearch, no WebFetch. Content is internal project documents. No external data
ingestion. Injection risk is low. If a project doc were itself adversarially crafted (an
internal injection scenario), the tainted-content discipline of the soul (NO FALSE
COMPLETION, VERIFY-THEN-CLAIM) applies; no specific tainted-content rule is needed for
a no-network-tools agent. PASS.

F6: SPAWN ALLOWLIST
No Bash, no network tools. Low blast radius. T-0020 C3 unresolved (system-wide blocker).
Sami is off the permitted-spawn allowlist until T-0020 C3 clears.

---

## Conditions

C1: Task envelopes activating Sami MUST name a specific partition path
(projects/<exact-name>/) and not a wildcard or multi-project scope. Eco or project lead
owns this at activation time.
C2: Off permitted-spawn allowlist until T-0020 C3 resolved (system-wide blocker).

---

## Mitigations

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|--------------|----------------|-----------------|-----------------|
| F2 partition behavioral only | Eco / project lead | Task envelopes name exact partition path; Sami refuses any request outside it | jecki (A1) | No architectural fix available at this stack level; task-envelope discipline is permanent control |
| F3 partition at invocation | Eco | Invocation must specify exact project/<name>/ before Sami is used | Eco | Same -- permanent task-envelope standard |
| F6 spawn allowlist | Eco | Hold off allowlist | Shir / Eco | Resolve T-0020 C3 cascade confirmation |

Recommendation: CLEAR-WITH-CONDITIONS. Partition boundary is well-documented. C1 is activation discipline (no cert blocker). C2 is system-wide.
