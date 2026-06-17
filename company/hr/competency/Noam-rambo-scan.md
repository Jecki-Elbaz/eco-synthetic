# Noam -- Rambo Permission Scan (B5)

Date: 2026-06-17
Scanned by: Rambo (Security, L3)
Tasked by: Eco (CEO)
Source files read: .claude/agents/Noam.md, company/governance/access-matrix.md,
  company/governance/security-baseline.md
Process: company/processes/agent-hiring.md B5

---

## Verdict

CLEAR-WITH-CONDITIONS

Condition 1: Noam must not be added to the Agent tool permitted-spawn allowlist until
  C3 (deny-rule cascade verification) is resolved per security-baseline.md T-0020
  follow-up.

No tool excess found. No data access overages found. One condition carried forward from
  the system-wide C3 blocker -- not Noam-specific.

---

## 1. Tools review

Tools granted: Read, Write, Edit

Read -- JUSTIFIED.
Noam must read company context, access matrix, soul doc, constitution, project files,
  board, and wiki to produce PRDs, user stories, and roadmap updates. Core to role.

Write -- JUSTIFIED.
Noam produces outputs: PRDs, roadmap updates, requirements briefs, feedback synthesis,
  result envelopes. Must write to projects/<assigned-project>/, board.md, log.md, and
  decisions-log.md (append). Core to role.

Edit -- JUSTIFIED.
Noam edits working product documents (PRDs, user stories, roadmap slices) within its
  project folders. Core to role.

No Bash, no WebFetch, no Agent, no network tools. Tool set is minimal and appropriate
  for a documentation-and-planning agent. No excess permissions found.

---

## 2. Data / memory access review

company/constitution.md -- read: JUSTIFIED. Need-to-know governance reference. Standard
  for all L3 staff. Matches access-matrix.md "Restricted" read list (role-relevant reads
  permitted).

company/roster.md -- read: JUSTIFIED. Need-to-know; Noam must know cross-group contacts
  to route correctly (Ido, Mike, Eyal via Eco).

company/governance/access-matrix.md -- read: JUSTIFIED. Need-to-know; Noam must know
  what it can and cannot access. Standard reference.

company/soul.md -- read: JUSTIFIED. Canonical culture doc; all agents reference.

projects/<assigned-project>/ -- read/write: JUSTIFIED. Noam is a product-group agent.
  Full project-folder access for PRDs, specs, and requirements is the expected scope.
  Bounded to assigned projects only; not a blanket projects/ grant.

memory/board.md -- read/write own rows only: JUSTIFIED. Standard cross-company board.
  Scope is limited to own task rows. Correct least-privilege.

memory/log.md -- own activity entries only: JUSTIFIED. Append-only in practice. Correct
  least-privilege.

memory/wiki/ -- read, need-to-know: JUSTIFIED. Reference access only; no write. Matches
  access-matrix.md "Company-shared" read rule.

company/decisions/decisions-log.md -- append-only, product decisions only: JUSTIFIED.
  Matches access-matrix.md append-only rule. Scope is further restricted to product
  decisions; no retroactive edit permitted.

.env -- BLOCKED: CORRECT. Matches CLAUDE.md red line 1 and access-matrix.md.

sources/ -- read-only, no write (copy before use): CORRECT. Matches access-matrix.md
  read-only rule. Role file explicitly states the copy-before-edit rule.

dashboards/ -- no access: CORRECT. Matches access-matrix.md Lital + jecki only.

memory/owner-office/ -- no access: CORRECT. Matches access-matrix.md A3 hardening.

.claude/agents/ -- no access (except own file via Eco direction): CORRECT. Matches
  access-matrix.md Owner/CEO only rule. Noam is not in the exception list.

marketing/ -- no access: CORRECT. Matches access-matrix.md Sales group restriction.
  No product-group read required.

memory/global/ -- not listed, not claimed: CORRECT. Need-to-know access not required
  for Noam's function. Absence is appropriate.

Data access scope assessment: no excess and no missing access found. All blocks are
  correct and all grants are justified. Least-privilege alignment is good.

---

## 3. Prompt-injection / takeover surface

Tool set (Read, Write, Edit) carries no code-execution or network capability. Noam
  cannot execute shell commands, fetch external URLs, or invoke other agents directly.

Primary residual risk: Write and Edit allow modification of project files and board rows.
  If Noam were injected via an adversarial requirements brief or external content routed
  through Eco, a tainted Noam session could corrupt PRDs or roadmap files. This is a
  standard document-agent risk class; it does not require additional conditions beyond
  the system-wide controls already in place (T-0020 R1/R5, OWNER_ONLY_MODE).

No Bash means there is no shell-execution blast radius. No Agent tool means Noam cannot
  spawn sub-agents. No WebFetch means Noam cannot make outbound network calls.

Spawn-allowlist: Noam does not currently appear on the permitted-spawn allowlist (not
  listed in the T-0020 actionable-now items or the hardening plan as a target agent).
  C3 (deny-rule cascade verification) must be resolved before any agent -- including
  Noam -- is added to the allowlist. This is a hard system-wide constraint, not
  Noam-specific.

No prompt-injection surface specific to Noam beyond standard document-agent risk.
  No additional mitigation required beyond existing T-0020 controls.

---

## 4. Findings summary

| # | Finding | Severity | Type |
|---|---------|----------|------|
| F1 | Noam not on permitted-spawn allowlist; must stay off until C3 closed | Medium | Blocker (system-wide, not Noam-specific) |

No excess tools found.
No excess data access found.
No missing permissions found.
All deny-list blocks are correct.

---

## 5. Recommended mitigations

Standing rule (security-baseline.md 2026-06-15): every finding must include interim and
  permanent mitigation with named owners.

### F1 -- Permitted-spawn allowlist block (C3)

Interim: Noam remains off the permitted-spawn allowlist. Eco does not spawn Noam via
  Agent tool until C3 is resolved. Enforce via bridge context block (A4 item in
  security-baseline.md T-0020 actionable-now list). No additional action required
  for Noam's certification or go-live -- this condition does not block certification,
  only allowlist inclusion.
  Interim owner: Eco.

Permanent: Shir resolves C3 (deny-rule cascade verification or shell-tool stripping at
  bridge layer per B3/B4 in security-baseline.md T-0020 blocked-on-Shir list). Once
  C3 closed, Rambo re-assesses Noam for allowlist inclusion. Given Noam has no Bash and
  no Agent tool, Noam's blast radius is low; Noam should be a strong candidate for early
  allowlist inclusion once C3 is resolved.
  Permanent owner: Shir (B3/B4 implementation) + Rambo (re-assessment).

### Mitigation summary table

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|--------------|----------------|-----------------|------------------|
| F1 Spawn allowlist | Eco | Keep Noam off allowlist; enforce via bridge context block | Shir + Rambo | Shir closes C3; Rambo re-assesses Noam for early inclusion |

---

## 6. Certification conditions

C1: Noam must not be added to the permitted-spawn allowlist until C3 from security-
  baseline.md T-0020 is resolved (Shir B3/B4 deliverable). This condition survives
  go-live and is re-assessed at each Shir milestone.

Note: C1 does not block Noam's certification or go-live. It restricts only allowlist
  inclusion (Eco spawning Noam via Agent tool in bridge sessions). Noam can be certified
  and go-live before C3 is resolved; it simply cannot be used as a spawned sub-agent
  until C3 is closed.

No other conditions. No tool changes required.

---

## 7. Scan log entry

| date | agent | scope | verdict | notes |
|------|-------|-------|---------|-------|
| 2026-06-17 | Noam (Product) | B5 permission scan | CLEAR-WITH-CONDITIONS | C1: off spawn allowlist until C3 resolved (system-wide; no tool excess found) |
