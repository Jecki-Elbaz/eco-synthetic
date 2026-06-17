# Shir -- Rambo Permission Scan (B5)

Date: 2026-06-17
Scanned by: Rambo (Security, L3)
Tasked by: Eco (CEO)
Source files read: .claude/agents/Shir.md, company/governance/access-matrix.md,
  company/governance/security-baseline.md,
  company/governance/agent-tool-spawn-allowlist.md,
  company/processes/agent-hiring.md B5
Process: company/processes/agent-hiring.md B5

---

## Verdict

CLEAR-WITH-CONDITIONS

Condition 1: Bash is JUSTIFIED for Shir's role. No removal required.
Condition 2: Shir must not be added to the Agent tool permitted-spawn allowlist until
  C3 (deny-rule cascade verification / shell-tool stripping) is resolved. This is a
  system-wide blocker documented in security-baseline.md T-0020 follow-up. It applies
  to Shir specifically because Shir holds Bash -- the binding constraint on the
  permitted-spawn allowlist per owner A1 ruling 2026-06-15.
Condition 3: Production deploy = A1 gate. Role file states this correctly. Before
  go-live, Eco must confirm the A1 production-deploy gate is enforced in bridge
  context and that Shir cannot self-authorize any deploy flagged as production.
Condition 4: integrations/ write scope must stay under Ido approval as stated in
  role file. No silent scope expansion. Any change to integrations/ without a logged
  Ido task envelope is a red-line violation.

---

## 1. Tools review

Tools granted: Read, Write, Edit, Bash

Read -- JUSTIFIED.
Shir must read infra configs, project files, board, gate-register, and access-matrix
  to perform environment config, release pipeline management, monitoring, and incident
  triage. Core to role.

Write -- JUSTIFIED.
Shir produces run logs, incident reports, config diffs, and integration file updates.
  Must write to memory/board.md (own rows), memory/log.md (append), integrations/,
  and project folders. Core to role.

Edit -- JUSTIFIED.
Shir edits pipeline config, environment variables, alert thresholds, and integration
  files within approved scope. Core to role.

Bash -- JUSTIFIED. (Note: this is the primary question for this scan.)
Shir owns: release pipeline execution, deploy, rollback, environment config, first-line
  incident response, and uptime monitoring. All of these require shell-level execution.

Specific Bash dependencies in Shir.md:
  - "Release pipeline: mechanics of build, tag, package, promote." -- requires
    shell commands to invoke CI/CD tooling, run build scripts, tag releases.
  - "Deploy + rollback: execute deploys; own rollback decision up to A2 threshold."
    -- deploy and rollback are shell-level operations; cannot be done with Read/Write
    alone.
  - "Live monitoring: uptime, errors (Sentry), performance, alerts." -- alert
    threshold changes and monitoring config require env-level execution.
  - "First-line fix: triage + fix; escalate when beyond scope or gate." -- incident
    first-line response (restart services, run diagnostics, apply hotfixes) is
    inherently shell-level.
  - "R&D backend infra: config, availability, tooling, environment alternatives."
    -- infra configuration requires Bash.
  - "Internal IT: dev tooling, access provisioning (within approved scope)." --
    provisioning requires shell-level commands.

This is the opposite of Ido's situation. Ido held Bash with no role dependency on it;
  Shir's role is entirely built on Bash execution. Removing Bash would make the DevOps
  function inoperable. Bash is confirmed necessary and proportionate.

Prior T-0020 follow-up assessment in security-baseline.md (2026-06-16) reached the same
  conclusion: "Shir (DevOps, L4): YES -- Bash required."

---

## 2. Data / memory access review

integrations/ -- Read + Write under Ido approval: JUSTIFIED.
  Shir owns Telegram bridge and future integrations. Read + Write is necessary for this
  function. "Under Ido approval" is the correct constraint and matches the access-matrix.
  No overage. Consistent with access-matrix.md: "Shir (DevOps), Eco."

memory/board.md -- Read + Write own rows: JUSTIFIED.
  Standard cross-company board; all agents write own rows. No overage.

memory/log.md -- Append: JUSTIFIED.
  Append-only is least-privilege for activity logging. No overage.

memory/wiki/ -- Read, need-to-know: JUSTIFIED.
  Reference access only; no write granted. Correct least-privilege.

projects/<name>/ -- Read (R&D-assigned projects): JUSTIFIED.
  Shir needs project context to execute releases and configure environments for assigned
  projects. Scope is bounded to R&D-assigned projects. Consistent with access-matrix.md
  partitioned tier.

company/constitution.md -- Read: JUSTIFIED.
  All agents reference constitution. No overage.

company/governance/gate-register.md -- Read: JUSTIFIED.
  DevOps must know which tools are gate-cleared before using them. Read-only is
  correct; no write.

company/governance/access-matrix.md -- Read: JUSTIFIED.
  Permission reference. Read-only correct; no write.

sources/ -- Read only, no write: JUSTIFIED.
  Matches access-matrix.md read-only rule and CLAUDE.md red line 2. Correct.

company/decisions/ -- Append-only: JUSTIFIED.
  Matches access-matrix.md append-only rule. Existing entries never edited.

.claude/agents/ -- BLOCKED: CORRECT.
  Access-matrix.md: Owner/CEO only for writes. Shir has no business need for agent
  role files. Correct block.

.env -- BLOCKED: CORRECT.
  Access-matrix.md and CLAUDE.md red line 1. No agent reads .env directly. Correct.

Paths NOT granted and correctly absent:
  - company/ governance writes (other than gate-register read already covered): correct.
  - dashboards/: correct (Lital + jecki only per access-matrix.md).
  - marketing/: correct (Sales group only).
  - memory/owner-office/: correct (A3 hardening 2026-06-12).
  - memory/global/: no grant stated, correct.

Data access scope assessment: no excess and no missing access found. All blocks are
  correct. Least-privilege alignment is strong.

---

## 3. Deploy authority and production gate

Role file states explicitly under Authority and gates:
  "A1: production deploy, customer-data migration or deletion, new tool adoption,
   any expense."

Role file states explicitly under What you must NEVER do:
  "1. Deploy to production without A1. [red line 2 / const §3]"

This is correctly documented. No role-file deficiency on the deploy-authority gate.

Risk: A1 production deploy gate is a behavioral constraint only. With Bash, Shir
  could technically execute a shell deploy command. The gate is enforced by:
  (a) red lines in the role file (behavioral),
  (b) A1 requirement stated in Authority section (behavioral),
  (c) soul Core Block -- NO FALSE COMPLETION + NO GUESS (behavioral).

No architectural deploy guard exists yet (no locked deploy pipeline, no code-level
  prod-environment key that only jecki holds). This is a P1 accepted risk, consistent
  with the general posture of the project at this stage. It must be reviewed at P2.

This risk is not a certification blocker -- it is the same posture all A1-gated actions
  hold across the company. Documented as F2 below.

---

## 4. T-0020 spawn-allowlist posture

Per company/governance/agent-tool-spawn-allowlist.md (active, A1 jecki 2026-06-15):
  Shir is in the DENIED list: "Shir (DevOps) -- Bash required (pipeline, deploy/rollback,
  infra)."

This is correct. The owner ruling is: non-Bash agents may be on the allowlist; Bash
  agents are denied until Shir builds code-level guardrails (C3: deny-rule cascade
  verification or shell-tool stripping at bridge layer, per security-baseline.md
  T-0020 B3/B4).

Shir's position is uniquely recursive here: Shir is both the agent held off the
  allowlist because it holds Bash AND the agent responsible for building the
  guardrails (B3/B4) that would eventually allow Bash agents onto the allowlist.

This means:
  - Shir cannot be added to the permitted-spawn allowlist before building B3/B4.
  - Shir building B3/B4 is the prerequisite for any Bash agent (including Shir itself,
    Gal, and Ido if Bash is retained) to be added to the allowlist.
  - Until B3/B4 are implemented and C3 is resolved, Shir can be used directly
    (owner-invoked via Claude Code) but not via Eco Agent tool spawn from Telegram.

This is an expected condition, not a deficiency in Shir's role file or a new finding.
  The allowlist block is a system-wide architecture posture, not a Shir-specific
  excess.

Implication for go-live: Shir can go live (A1 Stage C) and be used for DevOps tasks
  directly. Shir's spawn via Eco Agent tool is blocked by system architecture until
  Shir delivers B3/B4. Both states are acceptable at P1.

---

## 5. Findings summary

| # | Finding | Severity | Type |
|---|---------|----------|------|
| F1 | Bash granted; DevOps role fully depends on it | -- | JUSTIFIED (no action) |
| F2 | Production deploy = behavioral gate only; no architectural lock | Low | Accepted P1 risk |
| F3 | Shir not on permitted-spawn allowlist; cannot be Eco-spawned via Telegram | Medium | System-wide blocker (C3 unresolved); expected state |
| F4 | integrations/ write scope requires Ido task-envelope discipline | Low | Process control; no role-file deficiency |

No excess permission found.
No missing permission found.
No data access overage found.

---

## 6. Recommended mitigations

### F1 -- Bash justified

No mitigation required. Finding is closed at assessment. Shir's role cannot function
  without Bash. This is the correct tool grant.

### F2 -- Production deploy behavioral gate only

Interim: Eco must include A1 production-deploy gate in the bridge context block
  (agent must request A1 before any production deploy; Eco does not self-authorize on
  Shir's behalf). This is actionable now without code.
  Interim owner: Eco (bridge context block update per T-0020 A1-A9 list).

Permanent: At P2, introduce architecture-level deploy lock -- production environment
  credentials accessible only to jecki (not in .env that Shir reads), so Shir cannot
  complete a production deploy without a jecki-held secret. This is a P2 infra
  design item.
  Permanent owner: Shir (build) + jecki (credential design) at P2.

### F3 -- Spawn allowlist block (C3)

Interim: Shir remains off permitted-spawn allowlist. Eco does not attempt to spawn
  Shir via Agent tool until C3 is resolved. Enforce via bridge context block (A4 item
  in security-baseline.md T-0020 actionable-now list).
  Interim owner: Eco.

Permanent: Shir implements B3 (deny-rule cascade verification) and B4 (shell-tool
  stripping at bridge layer). Once B3/B4 are delivered and Rambo re-assesses, Shir
  (and other Bash agents) can be reconsidered for allowlist inclusion.
  Permanent owner: Shir (B3/B4 implementation) + Rambo (re-assessment post-delivery).

### F4 -- integrations/ task-envelope discipline

Interim: Role file already requires Ido approval for integrations/ writes. Eco and
  Ido must enforce: every integrations/ write task Shir runs must have a logged task
  envelope (task_id, Ido requester, objective). No silent writes.
  Interim owner: Ido (task routing) + Eco (audit on log.md).

Permanent: When integrations/ scope grows (P2), formalize a write-approval log within
  integrations/ itself or in memory/log.md. Review whether Shir's integrations/ scope
  needs a tighter sub-path grant.
  Permanent owner: Dalia (access-matrix revision at P2) + Rambo (next permission scan).

### Mitigation summary table

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|--------------|----------------|-----------------|------------------|
| F2 prod-deploy gate | Eco | Add A1 prod-deploy gate to bridge context block | Shir + jecki | P2 architecture: prod creds jecki-only |
| F3 spawn allowlist | Eco | Keep Shir off allowlist; enforce via bridge context | Shir + Rambo | Shir delivers B3/B4; Rambo re-assesses |
| F4 integrations/ discipline | Ido + Eco | Require task envelope for every integrations/ write | Dalia + Rambo | P2 matrix revision; sub-path audit |

---

## 7. Certification conditions

C1: No tool change required. Bash is justified. Shir may proceed to certification
  with current tools (Read, Write, Edit, Bash).

C2: Shir must not be added to the permitted-spawn allowlist until C3 from
  security-baseline.md T-0020 is resolved (Shir's own B3/B4 deliverable). This
  condition survives go-live. Shir may be used directly (owner-invoked) immediately
  on go-live.

C3: Eco must confirm A1 production-deploy gate is present in the bridge context block
  before Shir is used for any deploy task via the bridge. Owner-invoked direct sessions
  are gated by role-file A1 requirement; bridge-session gate must be explicitly
  stated in the context block.

C4: Every integrations/ write Shir performs must have a logged Ido-authorized task
  envelope. Ido enforces routing; Eco audits via log.md.

All four conditions must be documented in the Stage C go-live package per
  agent-hiring.md.

---

## 8. Scan log entry

| date | agent | scope | verdict | notes |
|------|-------|-------|---------|-------|
| 2026-06-17 | Shir (DevOps) | B5 permission scan | CLEAR-WITH-CONDITIONS | C1: Bash justified (no change). C2: off spawn allowlist until C3 resolved (system-wide blocker; Shir must deliver B3/B4). C3: prod-deploy A1 gate in bridge context before deploy use. C4: integrations/ writes require Ido task envelope. Full report: company/hr/competency/Shir-rambo-scan.md |
