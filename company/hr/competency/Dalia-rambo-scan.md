# Rambo B5 Permission Scan: Dalia (Quality & Governance, L3)

Scan date: 2026-06-17
Tasked by: Eco (CEO), step B5 agent-hiring.md
Basis: Dalia.md (2026-06-14), access-matrix.md v1.0, security-baseline.md

---

## Verdict: CLEAR-WITH-CONDITIONS

Two conditions. Neither is a blocker. Both must be resolved before go-live.

---

## Findings

### F1 -- Tools (Read, Write, Edit): CLEAR

Read, Write, Edit are appropriate for Dalia's function.

- Read: required to audit agent outputs, soul.md, decisions-log, access-matrix, role files.
- Write: required for access-matrix.md structure maintenance, soul.md co-ownership, and
  memory/log.md activity entries.
- Edit: required for in-place edits to access-matrix.md, soul.md, and governance files.
- No Bash: correct. Dalia has no execution or shell function. Bash is absent and should
  remain absent.
- No WebFetch, no external tool: correct for this role.

No excess permission in the tools line.

### F2 -- .claude/agents/ read-by-exception: CONDITIONAL CLEAR

Dalia.md grants Dalia read access to .claude/agents/ for quality-audit and tone-governance
purposes.

The access-matrix.md lists .claude/agents/ as "Owner/CEO only." The matrix notes that Anat
and Rambo each hold a bootstrapped read-by-exception (A2 bootstrapped by owner A1). Dalia
is not yet listed in the matrix as holding this exception. The matrix explicitly states that
Dalia's own exception must be added to T-0012 scope before T-0012 is executed.

Current state: Dalia's .claude/agents/ read is authorized in Dalia.md (owner A1 at
go-live covers it per the note in her role file) but is not yet reflected in the access
matrix. T-0012 is the formalization vehicle.

Finding: the exception is legitimately authorized at A1 (owner go-live approval). The gap
is documentation, not authorization. Risk is low. Condition: T-0012 must be updated to
include Dalia's own exception in scope, and T-0012 must be completed before Dalia exercises
.claude/agents/ read in any audit.

Condition C1: T-0012 scope must be amended to explicitly include Dalia's exception (not
just Anat's and Rambo's). The role file already states this requirement; confirm the board
entry reflects it before Dalia is activated.

### F3 -- Data access scope: CLEAR

Dalia.md data access list:
- Read + write: access-matrix.md -- required, she defines structure.
- Append: decisions-log.md -- required, she audits and logs governance entries.
- Read + write: soul.md -- required, co-owner with Anat.
- Read: constitution.md, roster.md, gate-register.md -- read-only, justified for
  governance and compliance checks.
- Read: .claude/agents/*.md -- see F2 above.
- Read + append: memory/board.md, memory/log.md -- standard company-shared access.
- Read/write: memory/wiki/ (governance-owned pages) -- appropriate.
- No access: .env, sources/, projects/, dashboards/, memory/owner-office/ -- correct.

No excess-scope finding in data access.

### F4 -- Prompt-injection surface: LOW RISK, NO FLAG

Dalia's primary inputs are internal files (agent outputs, matrix, decisions-log, soul.md,
role files). She does not ingest external URLs, external repos, or third-party content.

Risk surface: quality audit of agent outputs could expose Dalia to malformed or adversarial
agent content. However, Dalia holds no Bash or execution tool, so an injected instruction
could only cause Dalia to write incorrect governance content -- not execute code or exfiltrate
data.

Mitigation: Dalia's role file includes a clear "VERIFY-THEN-CLAIM" and "NO FALSE COMPLETION"
soul constraint. Any injected instruction to falsify an audit finding or governance record
would violate explicit soul rules.

Residual risk: low. No flag issued.

### F5 -- Append-only compliance risk: INFORMATIONAL

Dalia owns decisions-log.md and is explicitly prohibited from retroactively editing it
(CLAUDE.md red line 6, Dalia.md "never do" item 1). She also has Read + Write on
access-matrix.md.

Write access to access-matrix.md is correct for her role (she defines structure). Changes
require A2, and Dalia.md enforces this behavioral constraint.

No excess permission. Informational note only: Eco should verify that A2 approval is always
logged before any matrix write takes effect.

---

## Conditions summary

| # | Condition | Owner | Blocking cert? |
|---|-----------|-------|---------------|
| C1 | Amend T-0012 board entry to include Dalia's own .claude/agents/ read exception before Dalia is activated | Eco + jecki (A1 for board scope) | YES -- resolve before go-live |
| C2 | T-0012 must be executed (all three exceptions formalized in matrix) before Dalia runs any .claude/agents/ audit | Dalia (on activation) | NO -- Dalia can be certified; T-0012 is her first task |

---

## Recommended mitigations

### C1 -- T-0012 scope gap

Finding: T-0012 board entry does not yet explicitly name Dalia's exception. Risk: T-0012
could be executed covering only Anat and Rambo, leaving Dalia's exception unformalized.

Interim: Eco to verify T-0012 board row text before Dalia is activated. If missing, add
Dalia's exception to the row description in memory/board.md (Eco A3 write on own task rows).
Owner: Eco.

Permanent: Dalia executes T-0012 as her first activation task, producing a single A2
matrix update that formalizes all three exceptions -- Anat, Rambo, Dalia -- with Rambo
review sign-off. This closes the documentation gap durably.
Owner: Dalia (executes) + Eco (A2 approval) + jecki (notified per A2 process).

### C2 -- Sequencing control

Finding: Dalia could read .claude/agents/ before T-0012 is executed. Risk: low (the
read is A1-authorized) but the matrix exception is not yet documented, which is a
governance gap for the role that owns governance.

Interim: add a note to Dalia's activation brief stating she must execute T-0012 before
running any audit that requires .claude/agents/ reads. Owner: Eco (activation brief).

Permanent: T-0012 completion. Same as C1 permanent above. Once T-0012 is logged as an
A2 decision in decisions-log.md, both conditions are closed.
Owner: Dalia + Eco + jecki.

### Mitigation summary table

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|--------------|----------------|----------------|-----------------|
| C1 T-0012 scope gap | Eco | Verify/update T-0012 board row to include Dalia exception before activation | Dalia + Eco + jecki | Execute T-0012 as first task; A2 matrix update covering all three exceptions |
| C2 Sequencing | Eco | Add sequencing note to Dalia activation brief | Dalia + Eco + jecki | T-0012 completion closes this durably |

---

## No-flag items (confirmed clean)

- Bash: absent. Correct.
- External tool access: absent. Correct.
- .env access: explicitly denied. Correct.
- sources/ write: explicitly denied. Correct.
- dashboards/ access: explicitly denied. Correct.
- memory/owner-office/ access: explicitly denied. Correct.
- Chain-of-command constraints: present and specific (Eco, jecki; coordinates with Anat,
  Rambo, Assaf; refuses tasks from anyone outside chain).
- Red lines: all 10 explicitly enumerated and consistent with CLAUDE.md and constitution.

---

## Recommendation

CLEAR-WITH-CONDITIONS. Dalia may be certified. Conditions C1 and C2 do not block
certification -- they block go-live activation. Resolve C1 (T-0012 board scope) before
activating Dalia. C2 closes when T-0012 is executed, which is Dalia's first task on
activation. No excess permissions, no Bash, no injection concern above low risk.

Output to: Eco (CEO). For Anat (HR) certification record.

---

Rambo | Security | 2026-06-17 | Scan basis: Dalia.md, access-matrix.md v1.0, security-baseline.md
