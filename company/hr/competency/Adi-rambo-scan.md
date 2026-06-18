# B5 Permission Scan: Adi (QA Engineer)

Rambo | 2026-06-18 | Basis: .claude/agents/Adi.md + security-baseline.md + agent-hiring.md B5
PRIORITY SCAN -- Adi is the only new agent in this batch with Bash.

---

## VERDICT: CLEAR-WITH-CONDITIONS

---

## Tools review

Tools granted: Read, Write, Edit, Bash.

Read: justified. QA must read the full codebase and project docs to write test plans,
verify bugs, and track coverage.

Write: justified for stated scope. Adi writes to projects/delivery-saas/docs/qa/ and
own rows in memory/log.md. Test plans, test cases, results, bug verdicts all land in qa/.
Proportionate to QA function.

Edit: justified as companion to Write for updating test plans and cases.

Bash: JUSTIFIED. This is the critical finding. Assessment below.

NO WebFetch/WebSearch: correct.

---

## Bash: detailed assessment

### Justification basis

Adi's role requires test execution (pytest runs) and inspection of test output. This
is explicit in the role file: "Test execution: run test suites (pytest or as specified)
using Bash; record results in the QA output area." This is the same justification
that cleared Gal and Shir for Bash -- direct code execution is a core job function,
not a convenience.

Unlike Ido (where Bash was found excess because Ido's function is planning and gate
decisions, not execution), Adi cannot fulfill the QA function without running tests.
Reading static code is insufficient for QA sign-off; actual test execution is required.

Verdict on Bash grant: JUSTIFIED. Remove would impair the core function.

### Destructive-command guardrails (CLAUDE.md red line 3)

Role file Boundaries state:
"Bash granted for running test suites. Aware of the following restraint -- aware != approved:
NEVER run rm -rf, DROP TABLE, git push --force to main, git reset --hard on shared branches,
or any data-deletion operation without explicit A1 in this session."

The "aware != approved" phrasing is appropriate -- it acknowledges the constraint without
claiming architectural enforcement. Red line 3 is clearly stated.

Additional escalation rule in role file:
"Bash command that is in any ambiguity about whether it is destructive -> stop, flag to
Ido, do not run."

Assessment: destructive-command language is present and strong. The soul core block
(STAY IN LANE, NO GUESS) reinforces it. However, all guardrails are behavioral, not
architectural -- there is no technical enforcement preventing Adi from running a
destructive command if prompted adversarially or confused about scope.

Finding F1: Bash destructive-command guardrails are behavioral only. No architectural
enforcement (path-restricted shell, command allowlist) is in place. This is the highest
residual risk for Adi.

Interim mitigation: behavioral constraints in role file are clear and correctly worded.
Ido as sole tasker limits injection surface. Add explicit statement to bridge context
(when Adi is spawned) reiterating red line 3. No destructive commands; any ambiguous
command = stop and flag Ido.
Permanent mitigation: T-0020 B4 (shell-tool stripping at bridge layer) is the durable
architectural fix. Until Shir delivers B4, behavioral constraints are the only control.
Also: Shir to investigate whether pytest can be invoked via a restricted shell profile
that blocks rm, DROP TABLE equivalents, and git destructive flags.

### Bash scope: test running only

Role file is clear: Bash is for "running test suites (pytest) and inspecting test output."
The scope statement is explicit. No other Bash use is authorized.

Finding F2: Bash scope is stated in the role file but is behavioral, not technically
enforced. Adi could use Bash for arbitrary shell commands if prompted.

Interim mitigation: scope statement in role file is the control. Ido task envelopes
should specify test commands explicitly (e.g., "run pytest tests/ --cov=src").
Permanent mitigation: T-0020 B4 shell-tool stripping / restricted shell profile (same
as F1 permanent path).

### Spawn allowlist -- critical

Adi has Bash. T-0020 C3 (deny-rule cascade verification) is unresolved. Whether
settings.json deny rules apply to spawned-agent subprocesses is NOT confirmed.

Adi MUST remain OFF the Agent-tool permitted-spawn allowlist until T-0020 C3 is resolved.
This is not a general system-wide blocker note -- for a Bash agent, C3 is a HARD BLOCKER
specific to Adi. If Adi were on the allowlist and C3 is not resolved, any Eco session
could spawn Adi and Bash commands would run with no architectural deny-rule protection.

This is the same hard blocker that applies to Gal and Shir per security-baseline.md.

---

## Data-access least-privilege review

Read: projects/delivery-saas/ (full), memory/board.md, memory/log.md, memory/wiki/,
company/ (need-to-know). Proportionate for QA.

Write/Edit: projects/delivery-saas/docs/qa/ + own rows in memory/log.md. Tight.
Four sub-paths stated explicitly: qa/plans/, qa/cases/, qa/results/, qa/bugs/.
This is specific and well-bounded.

Blocked correctly: .env, sources/ (write), dashboards/, memory/owner-office/,
.claude/agents/ (beyond own file context), company/, marketing/.

No excess data access findings.

Finding F3: Bash + Read(full project) combination means Adi could read any file in
projects/delivery-saas/ and then use Bash to act on that content (e.g., run a script
found in src/). Adi should only run test commands in tests/ -- not arbitrary scripts
found by browsing the codebase.

Interim mitigation: Ido task envelopes specify the exact test command. Adi soul
constraints (STAY IN LANE) apply.
Permanent mitigation: restricted shell profile scoped to tests/ directory execution
(Shir; same as F1/F2 permanent path).

---

## Prompt-injection exposure

Bash is present -- this is the highest-risk injection vector in the company after
Gal and Shir. A successful prompt injection against Adi could cause arbitrary
shell command execution.

Injection surface:
1. Task content from Ido via bridge.
2. Code artifacts and PR content read during test planning.
3. Test output itself (if Adi is prompted to process external test fixture content).

Mitigations in place:
- Ido is sole tasker. Single-user bot (jecki-only Telegram) limits R1 injection surface.
- T-0020 A8 (tainted-content rule in bridge context) applies.
- No WebFetch/WebSearch means no direct external content pull.

This is manageable but must be explicitly acknowledged: Adi is a higher-injection-risk
agent than any other in this batch because Bash execution is real.

---

## Conditions

C1: OFF permitted-spawn allowlist until T-0020 C3 resolved. For Adi (Bash agent) this is
    a HARD BLOCKER, not a general system-wide note. Adi must not be spawn-enabled before
    C3 is confirmed (deny-rule cascade verified OR shell-tool stripping deployed by Shir).

C2: Ido task envelopes for Adi must specify exact test commands (e.g., pytest tests/ --cov=src)
    not open-ended "run whatever you find." Behavioral constraint; Ido owns.

C3: Add explicit red-line-3 restatement to bridge context block when Adi is spawned
    (A1/A2 Eco + jecki; actionable now per T-0020 A1 follow-up pattern).

C4 (future / Shir dependency): investigate restricted shell profile for Adi's Bash use
    scoped to tests/ directory and pytest only. Tracks with T-0020 B4.

---

## Mitigation summary table

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|--------------|----------------|----------------|-----------------|
| F1: Bash destructive commands behavioral-only | Ido + Adi (behavioral) | Role-file constraint + bridge context red-line-3 restatement (C3 above) | Shir | T-0020 B4 shell-tool stripping; restricted shell profile for test-only commands |
| F2: Bash scope (test-only) behavioral-only | Ido | Task envelopes specify exact test command (C2 above) | Shir | Restricted shell profile scoped to tests/ and pytest only |
| F3: Read+Bash = arbitrary script risk | Ido (task envelope scoping) | Enumerate commands explicitly; Adi soul STAY IN LANE | Shir | Shell profile restricts execution to tests/ path |
| Spawn allowlist (hard blocker) | Eco | Keep OFF allowlist; do not add until C3 resolved | jecki + Shir | Resolve T-0020 C3 (cascade confirm or B4 deploy); then A2 allowlist add |
