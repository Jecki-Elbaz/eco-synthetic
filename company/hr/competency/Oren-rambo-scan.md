# B5 Permission Scan: Oren (Senior Developer)

Rambo | 2026-06-18 | Basis: .claude/agents/Oren.md + security-baseline.md + agent-hiring.md B5

---

## VERDICT: CLEAR-WITH-CONDITIONS

---

## Tools review

Tools granted: Read, Edit. NO Write.

Read: justified. Oren must read the codebase, project docs, review area, memory, and
company context to perform code review. Broad read is proportionate for a code reviewer
who must follow a codebase it did not write.

Edit: justified and correctly scoped. Role file states Edit is permitted only in
projects/delivery-saas/docs/review/ and own activity rows in memory/log.md. This is
the narrowest Write-equivalent scope for the function. No Write tool means Oren cannot
create new files outside the Edit scope path -- it can only modify existing files in scope.

NO Bash: correct. No code execution, no shell commands. Oren reviews and annotates;
execution belongs to Gal and Shir. No justification for Bash in this role.

NO WebFetch/WebSearch: correct.

Tool excess finding: NONE. Read + Edit at correct least-privilege for a code reviewer.

---

## Edit scope confirmation (priority check)

Task requested: confirm Edit scope is bounded to review-notes area.

Role file states in two places:
- Boundaries: "Edit permitted only in projects/delivery-saas/docs/review/ and own
  activity rows in memory/log.md. All other paths are read-only or blocked."
- Tools section: "Edit: scoped to projects/delivery-saas/docs/review/ and own activity
  rows in memory/log.md only. No Write (no file creation beyond what Edit handles in scope)."

Both statements are consistent and specific. Scope is correctly bounded.

One precision gap: role file says "own activity rows in memory/log.md." Edit tool on a
shared file (memory/log.md) means Oren could technically edit any row, not only its own.
This is a behavioral constraint, not an enforced path block. The risk is low (memory/log.md
is not a critical file and edits would be visible) but the constraint is only as strong as
Oren's soul compliance.

Finding F1: memory/log.md Edit scope relies on behavioral constraint ("own rows only"),
not path-level enforcement. Low risk. Same finding applies to other agents with log.md write.

Interim mitigation: no change needed; soul compliance + soul core block (NO FALSE COMPLETION,
STAY IN LANE) provide the behavioral guard. Log.md edits are auditable.
Permanent mitigation: future hardening -- consider a log-append-only pattern for agents
(separate per-agent log file rather than a shared log). Not required before cert.

---

## Data-access least-privilege review

Read: projects/delivery-saas/ (full), memory/board.md, memory/log.md, memory/wiki/,
company/ (need-to-know). Proportionate for a senior dev doing code review.

Edit/write: projects/delivery-saas/docs/review/ + own rows in memory/log.md. Tight.

Blocked correctly: .env, sources/ (write), dashboards/, memory/owner-office/,
.claude/agents/ (beyond own file context).

No excess data access findings.

---

## Prompt-injection exposure

No Bash, no WebFetch. Injection surface: task content from Ido via bridge, and code
artifacts/PR diffs submitted for review.

Code artifacts are the primary injection surface for a code reviewer. A maliciously
crafted comment in submitted code could attempt to instruct Oren. Oren has no Bash,
so injection cannot reach execution. Worst case: injection could attempt to alter
review notes (Edit scope is limited to review/) or produce misleading output.

This is within normal baseline risk for a no-Bash, no-network agent. Soul core block
(VERIFY-THEN-CLAIM, STAY IN LANE) provides behavioral defense.

---

## Spawn allowlist

Oren MUST remain OFF the Agent-tool permitted-spawn allowlist until T-0020 C3 resolved.
System-wide blocker. Non-blocking for certification.

---

## Conditions

C1: OFF permitted-spawn allowlist until T-0020 C3 resolved (system-wide, not Oren-specific).

C2 (informational, no cert block): memory/log.md "own rows only" is behavioral, not enforced.
    Future hardening: per-agent log files. No action required before go-live.

---

## Mitigation summary table

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|--------------|----------------|----------------|-----------------|
| F1: log.md row scope is behavioral only | Oren (behavioral) | Soul compliance; log edits are auditable | Eco + jecki (A1) | Per-agent log files in future hardening cycle |
| Spawn allowlist | Eco | Keep OFF allowlist | jecki + Shir | Resolve T-0020 C3; then A2 allowlist add per process |
