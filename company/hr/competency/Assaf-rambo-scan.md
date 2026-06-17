# Rambo B5 Permission Scan: Assaf (Operational Excellence, L3)

Scan date: 2026-06-17
Tasked by: Eco (CEO), step B5 agent-hiring.md
Basis: Assaf.md (2026-06-14), access-matrix.md v1.0, security-baseline.md

---

## Verdict: CLEAR-WITH-CONDITIONS

Two conditions. Neither blocks certification. Both must be resolved before go-live.

---

## Findings

### F1 -- Tools (Read, Write, Edit): CLEAR

Read, Write, Edit are appropriate for Assaf's function.

- Read: required to review role files (fitness loop), model-matrix.md, roster.md,
  board.md, log.md, constitution.md, access-matrix.md, and gate-register.md.
- Write: required for memory/log.md (own activity entries), company/model-matrix.md
  (maintenance), dashboards/ (operational view templates), and appending to
  company/decisions/decisions-log.md.
- Edit: required for in-place edits to company/model-matrix.md.
- No Bash: correct. Assaf has no execution or shell function. Bash is absent and
  should remain absent. Assaf reviews file artifacts and logs; it does not run code.
- No WebFetch, no external network tool: correct. Role file explicitly states
  "no network tools (no curl/wget/WebFetch) -- file and log review only."
- No MCP server tools: correct. External tool adoption follows the gate.

No excess permission in the tools line.

### F2 -- .claude/agents/ read-by-exception: CONDITIONAL CLEAR

Assaf.md grants Assaf read access to .claude/agents/*.md for the fitness loop
and model-matrix sync.

The access-matrix.md lists .claude/agents/ as "Owner/CEO only." It grants
bootstrapped read-by-exception to Anat (HR, A2 bootstrapped by owner A1 2026-06-13)
and Rambo (Security, A2 bootstrapped by owner A1 2026-06-14). Assaf is not yet
listed in the matrix as holding this exception.

Assaf.md addresses this directly. The role file labels it a "matrix gap, not a
special exception" and specifies the resolution: expand T-0012 scope to include
Assaf; Dalia formalizes all four (Anat, Rambo, Dalia, Assaf) in one A2 matrix
update when she goes live.

The role file also asserts this is an A2 change only (Eco decides, owner notified)
-- not A1. That characterization is consistent with the access-matrix.md change
process (A2 with Dalia + Rambo review). The business need is legitimate and
equivalent to Anat's and Rambo's already-approved exceptions.

Current state: Assaf's .claude/agents/ read is documented in Assaf.md with a
clear resolution path (T-0012 expansion). It is not yet reflected in the access
matrix or the T-0012 board row. Risk is low. The gap is documentation, not
authorization -- but the authorization itself is also not yet formally recorded
for Assaf as it was for Anat (owner A1 2026-06-13) and Rambo (owner A1 2026-06-14).

Finding: owner A1 go-live approval will cover Assaf's .clone/agents/ read (same
mechanism as Anat and Rambo). T-0012 is the formalization vehicle for the matrix
entry. Two conditions follow.

Condition C1: T-0012 board entry must be amended before Assaf is activated to
explicitly name Assaf as a fourth exception (alongside Anat, Rambo, Dalia).

Condition C2: Assaf must not exercise .claude/agents/ read until T-0012 is
executed and the matrix update is logged as an A2 decision.

### F3 -- Data access scope: CLEAR

Assaf.md data access list:

- Read: company/roster.md, company/constitution.md, company/governance/access-matrix.md,
  company/model-matrix.md -- justified for monitoring, fitness loop, and matrix sync.
- Read: .claude/agents/*.md -- see F2 above (conditional clear).
- Read + write: company/model-matrix.md -- required, Assaf maintains it.
- Read: memory/board.md, memory/log.md -- standard company-shared access.
- Write: memory/log.md (own activity entries only) -- standard, scoped correctly.
- Write: dashboards/ (operational view templates only; financial views are Lital's
  domain) -- scoped correctly. Access-matrix.md confirms this split.
- Append: company/decisions/decisions-log.md (T-0009 review logs and decisions only)
  -- scoped correctly. Append-only; no retroactive edit.
- No access: .env, sources/, projects/<name>/ (unless explicitly scoped by Eco),
  memory/owner-office/ -- all denials correct and explicit in role file.

Note on dashboards/ write: the access-matrix.md lists dashboards/ as "Restricted --
Assaf (OE templates), Lital (financial views)." Assaf.md is consistent with this.
The write scope is correctly bounded to templates, not financial data.

No excess-scope finding in data access.

### F4 -- Prompt-injection surface: LOW RISK, NO FLAG

Assaf's primary inputs are internal files: log.md, board.md, role files, model-matrix,
roster. Assaf does not ingest external URLs, external repos, or third-party content.

Risk surface: fitness loop and usage reports process output from other agents
(log.md activity entries). A malicious or corrupted log entry could attempt to
inject instructions. However, Assaf holds no Bash or execution tool, so a successful
injection could only cause Assaf to write incorrect reports or metrics -- not execute
code or exfiltrate data. Blast radius is bounded.

Mitigation: Assaf's soul block includes "NO GUESS," "VERIFY-THEN-CLAIM," and
"NO FALSE COMPLETION." Any injected instruction to fabricate a metric or suppress
a finding would violate explicit soul rules.

Residual risk: low. No flag issued.

### F5 -- Spawn allowlist status: INFORMATIONAL

Assaf holds Read, Write, Edit only -- no Bash. The C3 blocker in security-baseline.md
(deny-rule cascade for Bash agents) does not apply to Assaf. Assaf may be added to the
permitted-spawn allowlist without waiting for C3 resolution, provided standard spawn
conditions are met (T-0012 complete, matrix exception formalized).

No finding, no condition. Informational only.

### F6 -- Append-only compliance: INFORMATIONAL

Assaf has append access to decisions-log.md (T-0009 review logs and decisions only).
Assaf.md explicitly forbids retroactive edits (red line item: "never edit
company/decisions/decisions-log.md retroactively; append-only"). This is consistent
with CLAUDE.md red line 6.

Write access to company/model-matrix.md is correct for the role (Assaf maintains it;
changes require A3 and coordination with Dalia per role file). No excess found.

No excess permission. Informational note only.

---

## Conditions summary

| # | Condition | Owner | Blocking cert? |
|---|-----------|-------|----------------|
| C1 | Amend T-0012 board entry to include Assaf as the fourth .claude/agents/ read exception before Assaf is activated | Eco + jecki (A1 go-live covers auth; A2 board row is Eco) | YES -- resolve before go-live |
| C2 | Assaf must not read .claude/agents/ until T-0012 is executed and A2 matrix update is logged | Assaf (on activation) | NO -- Assaf can be certified; T-0012 gates the specific access |

---

## Recommended mitigations

### C1 -- T-0012 scope gap (Assaf not named)

Finding: T-0012 board entry currently covers Anat, Rambo, and Dalia (per Dalia-rambo-scan.md
findings). Assaf is named in Assaf.md as the fourth exception but may not be in the board
row. Risk: T-0012 executes and formalizes only three exceptions; Assaf's .claude/agents/
read remains undocumented in the matrix.

Interim: Eco to verify T-0012 board row text in memory/board.md before Assaf is activated.
If Assaf is missing, add Assaf to the row description (Eco A3 write on own task rows).
Owner: Eco.

Permanent: Dalia executes T-0012 as her first activation task, producing a single A2 matrix
update covering all four exceptions -- Anat, Rambo, Dalia, Assaf -- with Rambo review
sign-off. This closes the documentation gap durably and aligns the matrix with all current
legitimate operational reads of .claude/agents/.
Owner: Dalia (executes) + Eco (A2 approval) + jecki (notified per A2 process).

### C2 -- Sequencing control

Finding: Assaf could attempt .claude/agents/ reads before T-0012 is executed. Risk is low
(the read will be A1-authorized at go-live), but using a role-file permission that is not
yet in the matrix is a governance gap -- especially for the role that feeds the governance
system with fitness data.

Interim: add a note to Assaf's activation brief stating he must not read .claude/agents/
until T-0012 is executed and the A2 decision is logged. Owner: Eco (activation brief).

Permanent: T-0012 completion. Same as C1 permanent above. Once T-0012 is logged as an
A2 decision in decisions-log.md, both conditions are closed.
Owner: Dalia + Eco + jecki.

### Mitigation summary table

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|--------------|----------------|-----------------|-----------------|
| C1 T-0012 scope gap (Assaf missing) | Eco | Verify/update T-0012 board row to name Assaf as fourth exception before activation | Dalia + Eco + jecki | Execute T-0012; A2 matrix update covering all four exceptions |
| C2 Sequencing | Eco | Add sequencing note to Assaf activation brief: no .claude/agents/ reads until T-0012 complete | Dalia + Eco + jecki | T-0012 completion closes this durably |

---

## No-flag items (confirmed clean)

- Bash: absent. Correct.
- WebFetch / curl / wget: absent and explicitly denied in role file. Correct.
- .env access: explicitly denied. Correct.
- sources/ write: explicitly denied. Correct.
- memory/owner-office/ access: explicitly denied. Correct.
- projects/<name>/ access: denied unless explicitly scoped by Eco. Correct.
- dashboards/ write: scoped to operational templates only; financial views denied.
  Consistent with access-matrix.md. Correct.
- decisions-log.md: append-only; retroactive edit explicitly forbidden. Correct.
- Chain-of-command constraints: present and specific (Eco, jecki; coordinates with
  Dalia, Anat, Lital, Yossi; refuses all other tasks).
- Red lines: enumerated in role file, consistent with CLAUDE.md and constitution.
- Spawn allowlist: Assaf (no Bash) is not blocked by C3 Bash cascade issue.
- No personal human data in usage reports: explicitly stated in role file.

---

## Recommendation

CLEAR-WITH-CONDITIONS. Assaf may be certified. Conditions C1 and C2 do not block
certification -- they block go-live activation. Resolve C1 (T-0012 board row naming
Assaf) before activating Assaf. C2 closes when T-0012 is executed, which is Dalia's
first activation task. No excess tools, no Bash, no external network access, no
injection concern above low risk.

Output to: Eco (CEO). For Anat (HR) certification record.

---

Rambo | Security | 2026-06-17 | Scan basis: Assaf.md, access-matrix.md v1.0, security-baseline.md
