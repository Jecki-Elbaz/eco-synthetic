# B5 Permission Scan: Roman (Algorithm Specialist)

Rambo | 2026-06-18 | Basis: .claude/agents/Roman.md + security-baseline.md + agent-hiring.md B5

---

## VERDICT: CLEAR-WITH-CONDITIONS

---

## Tools review

Tools granted: Read, Write, Edit. NO Bash.

Read: justified. Roman must read the codebase, project docs, and company context to
design algorithms and produce prototypes. Full read of projects/delivery-saas/ is
proportionate for an on-demand algorithm specialist who must understand existing code.

Write: justified for the stated scope. Roman writes algorithm design docs and prototype
code to projects/delivery-saas/docs/algorithms/ and own rows in memory/log.md. Prototype
code output is a core deliverable of the role.

Edit: justified as companion to Write for iterating on prototype files and design docs.

NO Bash: correct and important. Roman writes prototype code but does NOT execute it.
Execution is Gal's responsibility after handoff. This is the right separation: Roman
designs and proves algorithmically; Gal validates in execution. Bash absence here is
intentional and correct.

NO WebFetch/WebSearch: correct. Algorithm research should reference internal problem
descriptions and docs. External algorithm/library research would require a gate.

Tool excess finding: NONE.

---

## Write scope review

Write scope: projects/delivery-saas/docs/algorithms/ and own rows in memory/log.md.

This is well-bounded. Algorithm docs and prototypes live in a dedicated subdirectory
of the project docs area. Roman cannot write to production code paths, company/ governance
files, or any other area.

One structural note: prototype code written by Roman lands in docs/algorithms/prototypes/.
This is a docs-area path, not a src/ or executable path. That is the correct location --
prototype code that has not been through Gal's implementation review should not be in
executable paths. Confirm at go-live that projects/delivery-saas/docs/algorithms/ is
not on any auto-execution or import path. If it is, flag to Ido before Roman's first
invocation.

Finding F1: prototype code path (docs/algorithms/prototypes/) must not be on an
auto-execution or import path. If it is, Roman's Write access creates an indirect
code-execution surface without Bash.

Interim mitigation: Ido to confirm path is docs-only (not executable/imported) before
first Roman invocation.
Permanent mitigation: directory structure convention enforced in project layout (Shir/Gal
to confirm). No role-file change needed if path is confirmed safe.

---

## On-demand activation gate

Role file is clear: Roman is NOT a standing active agent. Ido must invoke via A2.
Roman cannot self-activate and cannot accept tasks from any agent other than Ido.

This is a correct and important security property for a high-capability (Write + prototype
code) agent. On-demand + A2 gate limits blast radius from any misconfiguration or injection
to sessions where Ido has explicitly activated Roman.

No issues with activation gate.

---

## Data-access least-privilege review

Read: projects/delivery-saas/ (full), memory/board.md, memory/log.md, memory/wiki/,
company/ (need-to-know). Proportionate.

Write/Edit: projects/delivery-saas/docs/algorithms/ + own rows in memory/log.md. Tight.

Blocked correctly: .env, sources/ (write), dashboards/, memory/owner-office/,
.claude/agents/ (beyond own file context).

No excess data access findings beyond F1 above.

---

## Prompt-injection exposure

No Bash, no WebFetch. On-demand activation limits surface to sessions where Ido invokes.
Primary injection surface: algorithmic problem descriptions passed by Ido, and code
context read from codebase. Roman has Write to docs/algorithms/ -- injection could
attempt to alter prototype files. Risk is bounded because:
(a) Ido is the only tasker, and
(b) Write scope is limited to docs/algorithms/ (not production code).

Within normal baseline risk for a no-Bash, no-network on-demand agent.

Prototype code risk: if Roman is ever prompted to write code that does something harmful
and that code is later executed by Gal without review, the harm could propagate. This is
mitigated by Gal's code-review obligation and Oren's QA gate -- Roman's output is input
to Gal, not directly to production.

---

## Spawn allowlist

Roman MUST remain OFF the Agent-tool permitted-spawn allowlist until T-0020 C3 resolved.
System-wide blocker. On-demand invocation model is an additional natural limit.
Non-blocking for certification.

---

## Conditions

C1: Ido to confirm projects/delivery-saas/docs/algorithms/prototypes/ is not on any
    auto-execution or import path before Roman's first invocation. Document confirmation
    in memory/log.md or task output.

C2: OFF permitted-spawn allowlist until T-0020 C3 resolved (system-wide, not Roman-specific).

---

## Mitigation summary table

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|--------------|----------------|----------------|-----------------|
| F1: prototype path may be executable | Ido | Confirm path is docs-only before first Roman invocation | Gal + Shir | Enforce docs/ vs src/ separation in project layout |
| Spawn allowlist | Eco | Keep OFF allowlist | jecki + Shir | Resolve T-0020 C3; then A2 allowlist add per process |
