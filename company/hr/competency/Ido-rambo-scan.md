# Ido -- Rambo Permission Scan (B5)

Date: 2026-06-17
Scanned by: Rambo (Security, L3)
Tasked by: Eco (CEO)
Source files read: .claude/agents/Ido.md, company/governance/access-matrix.md,
  company/governance/security-baseline.md
Process: company/processes/agent-hiring.md B5

---

## Verdict

CLEAR-WITH-CONDITIONS

Condition 1: Remove Bash from Ido's tools line before certification and go-live.
Condition 2: Ido must not be added to the Agent tool permitted-spawn allowlist until
  C3 (deny-rule cascade verification) is resolved per security-baseline.md T-0020
  follow-up.

---

## 1. Tools review

Tools granted: Read, Write, Edit, Bash

Read -- JUSTIFIED.
Ido must read project files, board, wiki, and company context to do planning,
  release-gate decisions, and tech-debt triage. Core to role.

Write -- JUSTIFIED.
Ido produces outputs: release decisions, capacity plans, escalation envelopes,
  quality trend data. Must write to board.md and project folders. Core to role.

Edit -- JUSTIFIED.
Ido edits working documents (sprint assignments, triage lists, escalation envelopes)
  within its project folders. Core to role.

Bash -- EXCESS PERMISSION. FLAG.
Ido's responsibilities are: planning, release-gate decisions, sprint prioritization,
  tech-debt triage, architecture escalations, and managing Gal and Shir.
None of these require Ido to execute shell commands or run code directly.
Code execution is explicitly delegated to Gal (dev validation) and Shir (infra/deploy).
Ido verifies results by reading output artifacts, not by running them.
No line in Ido.md's Responsibilities section requires Bash.
This finding is consistent with the prior T-0020 follow-up assessment in
  security-baseline.md (2026-06-16), which reached the same conclusion.

---

## 2. Data / memory access review

memory/board.md -- read/write own rows: JUSTIFIED. Standard cross-company board; all
  agents write own rows.

memory/log.md -- append own entries: JUSTIFIED. Standard activity log; append-only is
  least-privilege.

memory/wiki/ -- read, need-to-know: JUSTIFIED. Reference access only; no write.

projects/<name>/ -- read/write assigned projects: JUSTIFIED. VP R&D needs full
  project-folder access for planning and gate decisions. Scope is bounded to assigned
  projects; Eco and VP R&D read-any is consistent with access-matrix.md row.

company/ -- read-only, need-to-know: JUSTIFIED. Matches access-matrix.md "Restricted"
  tier. Ido does not write company-level governance files.

company/decisions/decisions-log.md -- append-only: JUSTIFIED. Matches access-matrix.md
  append-only rule; existing entries never edited.

.claude/agents/ -- no standing access, own role file only via runtime: JUSTIFIED.
  Correct least-privilege. VP R&D is not in the access-matrix.md read list for this
  path.

sources/ -- read-only, no write: JUSTIFIED. Matches access-matrix.md read-only rule.

.env -- BLOCKED: CORRECT.

dashboards/ -- no access: CORRECT. Matches access-matrix.md Lital + jecki only.

marketing/ -- no access: CORRECT. Matches access-matrix.md Sales group restriction.

memory/owner-office/ -- BLOCKED: CORRECT. Matches access-matrix.md A3 hardening
  2026-06-12.

Data access scope assessment: no excess and no missing access found. All blocks are
  correct. Least-privilege alignment is good.

---

## 3. Prompt-injection / takeover surface

Bash access is the primary concern. With Bash granted, a compromised or injected Ido
  session can execute arbitrary shell commands: read credential files via path traversal,
  exfiltrate data, run destructive operations.

Current compensating controls (from security-baseline.md T-0020 follow-up):
- OWNER_ONLY_MODE = True on Telegram bridge (single-user input).
- Eco behavioral constraints block spawn on unverified external content.
- Ido not yet on permitted-spawn allowlist (so Eco cannot currently spawn Ido).

Residual risk: Bash in the role file means if Ido is ever spawned (or run directly),
  the tool is available. Role-file behavioral constraints (red lines) are the only
  control -- not architectural.

Removing Bash eliminates this risk class entirely for Ido. After removal, Ido's
  takeover surface drops to Write/Edit, which can modify project files and board rows
  but cannot execute code or exfiltrate via shell. This is an acceptable blast radius
  for a VP-level planning agent.

Spawn-allowlist blocker: even after Bash is removed, C3 (deny-rule cascade
  verification -- does settings.json deny apply to spawned subprocesses?) must be
  resolved before Ido can be added to the permitted-spawn allowlist. This is a hard
  constraint documented in security-baseline.md. It is not Ido-specific; it blocks all
  agents until Shir resolves B3/B4 in the T-0020 hardening plan.

No other prompt-injection surface identified specific to Ido beyond the standard
  external-content risk that applies to all agents (covered by T-0020 R1/R5 controls).

---

## 4. Findings summary

| # | Finding | Severity | Type |
|---|---------|----------|------|
| F1 | Bash granted; no role responsibility requires it | High | Excess permission |
| F2 | Ido not on permitted-spawn allowlist (C3 unresolved) -- must stay off until C3 closed | Medium | Blocker (not Ido-specific) |

No missing permissions found.
No data access overages found.

---

## 5. Recommended mitigations

### F1 -- Bash excess permission

Interim: Do not certify or go-live Ido while Bash is in the tools line. This is a
  pre-condition to certification, not a post-go-live monitor item. The certification
  gate enforces it.
  Interim owner: Eco (enforce gate).

Permanent: Remove Bash from Ido.md tools line. Change tools line from
  "Read, Write, Edit, Bash" to "Read, Write, Edit".
  This is an A1 action (agent role-file change). Owner (jecki) must approve. Eco to
  coordinate. After removal, this finding is closed.
  Permanent owner: jecki (A1 approval) + Eco (coordinate file edit).

### F2 -- Permitted-spawn allowlist block (C3)

Interim: Ido remains off the permitted-spawn allowlist. Eco does not spawn Ido via
  Agent tool until C3 is resolved. Enforce via bridge context block (A4 item in
  security-baseline.md T-0020 actionable-now list).
  Interim owner: Eco.

Permanent: Shir resolves C3 (deny-rule cascade verification or shell-tool stripping at
  bridge layer per B3/B4 in security-baseline.md T-0020 blocked-on-Shir list). Once
  C3 closed, Rambo re-assesses Ido for allowlist inclusion.
  Permanent owner: Shir (B3/B4 implementation) + Rambo (re-assessment).

### Mitigation summary table

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|--------------|----------------|-----------------|------------------|
| F1 Bash excess | Eco | Block certification until Bash removed | jecki + Eco | Remove Bash from tools line (A1) |
| F2 Spawn allowlist | Eco | Keep Ido off allowlist; enforce via bridge context | Shir + Rambo | Shir closes C3; Rambo re-assesses |

---

## 6. Certification conditions

C1: Bash must be removed from Ido.md tools line (A1 by jecki) before Anat issues
  formal certification and before Stage C go-live package is assembled.

C2: Ido must not be added to the permitted-spawn allowlist until C3 from security-
  baseline.md T-0020 is resolved (Shir B3/B4 deliverable). This condition survives
  go-live and is re-assessed at each Shir milestone.

Both conditions must be documented in the Stage C package per agent-hiring.md.

---

## 7. Scan log entry

| date | agent | scope | verdict | notes |
|------|-------|-------|---------|-------|
| 2026-06-17 | Ido (VP R&D) | B5 permission scan | CLEAR-WITH-CONDITIONS | C1: remove Bash; C2: off spawn allowlist until C3 resolved |
