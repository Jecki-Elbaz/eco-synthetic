# B5 Permission Scan: Mike (VP Customer Success)

Rambo | 2026-06-18 | Basis: .claude/agents/Mike.md + security-baseline.md + agent-hiring.md B5

---

## VERDICT: CLEAR-WITH-CONDITIONS

---

## Tools review

Tools granted: Read, Write, Edit.

Read: justified. Mike must read company docs, memory, board, log, and CS-related files.

Write: justified for the stated scope. Mike writes to memory/log.md (own rows) and
company/hr/cs/ (CS workflow docs, policy drafts). Both are proportionate to VP CS function.

Edit: justified as companion to Write for updating draft policy documents.

No Bash. No WebFetch/WebSearch. Correct -- no justification exists for shell or web access.

Tool excess finding: NONE.

---

## Data-access least-privilege review

Stated read scope: company/constitution.md, company/soul.md, company/roster.md,
company/governance/access-matrix.md, own competency spec, CS-rep-spec, memory/board.md,
memory/log.md.

Write scope: memory/log.md (own rows), company/hr/cs/ (CS workflow + policy drafts),
company/decisions/decisions-log.md (append-only, CS decisions only).

Blocked correctly: .env, sources/, dashboards/, memory/owner-office/, projects/ (unless
scoped by Eco).

Finding F1: Write path "company/hr/cs/" is not a current path in the repo or access matrix.
The role file says "path to be confirmed at go-live." This is an open ambiguity --
Mike has Write capability and an unresolved target path. Until the path is confirmed and
bounded, Write scope for CS docs is imprecise.

Interim mitigation: Eco confirms or creates the write path before Mike goes live; path
must be added explicitly to the role file.
Permanent mitigation: role-file update (A1 jecki) to name the exact path before Stage C.

Finding F2: Mike manages Jenny, Avner, Ella (CS reps -- not yet built). Role file says
Mike assigns tasks and reviews quality. No read scope for CS-rep output files is listed.
When reps are built their output paths must be added to Mike's read scope via A2 process.

Interim mitigation: no action required until reps are built. Flag for next R&R review.
Permanent mitigation: update Mike's Data/memory access when rep role files + output paths
are defined (A2 Eco + A1 jecki at R&R change).

No paths exist where Mike can write that it clearly should not given the stated function.
The company/hr/cs/ ambiguity is a precision gap, not an excess.

---

## Prompt-injection exposure

No WebFetch, no Bash, no external tool access. Injection surface is limited to:
- Incoming task content from Eco or jecki via bridge.
- Customer escalation content passed through rep chain (future).

Both surfaces are bounded by chain-of-command rules and the no-external-content
pipeline controls described in T-0020. No elevated injection risk above baseline.

When CS reps are live, escalation content (customer-sourced text) will enter Mike's
context. At that point, tainted-content handling must be confirmed in Mike's Boundaries.
This is a future-state flag, not a current blocker.

---

## Spawn allowlist

Mike MUST remain OFF the Agent-tool permitted-spawn allowlist until T-0020 C3 is resolved
(deny-rule cascade verification / shell-tool stripping by Shir). This is the system-wide
blocker. Non-blocking for certification itself.

---

## Conditions

C1: Resolve "company/hr/cs/" write path before Stage C. Eco confirms or creates path;
    jecki A1 role-file update to name exact path. Non-blocking for B5 itself but blocks Stage C.

C2: OFF permitted-spawn allowlist until T-0020 C3 resolved (system-wide, not Mike-specific).

C3 (future): when CS reps go live, update Mike data-access scope to include rep output
    read paths (A2 Eco, then A1 at R&R change).

---

## Mitigation summary table

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|--------------|----------------|----------------|-----------------|
| F1: write path unresolved | Eco | Confirm/create company/hr/cs/ path | jecki (A1) | Update role file with exact path before Stage C |
| F2: rep output read scope gap | Eco | No action until reps built; flag for R&R | jecki (A1) + Eco (A2) | Add rep output paths at R&R change when reps live |
| Spawn allowlist | Eco | Keep OFF allowlist | jecki + Shir | Resolve T-0020 C3; then A2 allowlist add per process |
