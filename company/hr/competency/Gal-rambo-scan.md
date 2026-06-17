# B5 Permission Scan -- Gal (Lead Developer, L4, R&D)

Scan date: 2026-06-17
Scanner: Rambo (Security)
Trigger: B5 agent-hiring.md, pre-certification
Sources read: .claude/agents/Gal.md, company/governance/access-matrix.md,
  company/governance/security-baseline.md, company/governance/agent-tool-spawn-allowlist.md,
  company/processes/agent-hiring.md

---

## Verdict: CLEAR-WITH-CONDITIONS

---

## Tools assessment

Tools declared: Read, Write, Edit, Bash

F1 -- Bash: JUSTIFIED (no excess finding)
  Role file states explicitly: "run local code execution to validate changes before handoff."
  Responsibilities list: "Implement features, fixes," "Run local code execution to validate
  changes before handoff," pytest, build validation, test runs.
  T-0020 security-baseline (Task 1) previously assessed Gal Bash as YES-required:
  "Code execution and test runs (pytest, build validation) are core to the job.
  Cannot delegate this to Shir; Gal must validate in the dev loop before handoff."
  This is unlike Ido (planning/management role with no execution responsibility)
  where Bash was found to be excess. Gal's execution responsibility is explicit and
  non-delegable at the dev stage.
  Finding: no excess. Bash is correctly granted.

F2 -- Read, Write, Edit: all required.
  Read: codebase navigation. Required.
  Write: code authoring. Required.
  Edit: code editing. Required.
  No excess tool finding on any of these.

F3 -- No WebFetch, no WebSearch, no Agent tool.
  Correct. No web-access or sub-spawn capability declared or needed for the role.
  No finding.

---

## Data access assessment

Declared in Gal.md (Tools and accounts / Data / memory access table):

| Path | Declared right | Assessment |
|------|----------------|------------|
| projects/<name>/ | Read + Write (assigned projects) | CORRECT -- core dev scope |
| projects/<name>/memory/ | Read + Write | CORRECT -- project working memory |
| memory/board.md | Read + Write (own rows) | CORRECT -- standard for all agents |
| memory/log.md | Read + Append (own entries) | CORRECT -- standard for all agents |
| memory/wiki/ | Read (need-to-know) | CORRECT -- bounded by need-to-know |
| company/ | Read (need-to-know context only) | CORRECT -- matrix says read-only for R&D |
| sources/ | Read only; never write | CORRECT -- matches red line 2 |
| .env | Blocked | CORRECT -- red line 1 |
| .claude/agents/ | Blocked (owner/CEO only) | CORRECT -- matches matrix |
| company/decisions/ | Append only | CORRECT -- red line 6 |
| dashboards/ | Blocked | CORRECT -- Lital/owner only per matrix |
| marketing/ | Blocked | CORRECT -- sales group only per matrix |

No data access excess found. All grants match the access matrix and CLAUDE.md red lines.
Least-privilege posture: PASS.

One gap noted: company/governance/ is not explicitly listed in Gal.md data table.
Matrix lists company/governance/ as Restricted (Eco, Dalia, Rambo, Eyal only).
Gal.md says company/ is "Read (need-to-know context only)" which is the correct
catch-all per the matrix for non-governance agents. However, if Gal interprets this
as including company/governance/ write access, that would be excess.
No write to company/governance/ is granted. Read-only under need-to-know is acceptable
for a developer needing to check policies. No action required; informational only.

---

## T-0020 spawn-allowlist posture

Gal holds Bash. Under the agent-tool-spawn-allowlist.md (ACTIVE, owner A1 2026-06-15):
  "DENIED (hold Bash -- shell risk): Gal (Lead Dev) -- Bash required (code execution, tests, build)."

This is correct and expected for a Bash-capable agent. The denial is not a defect
in Gal's design -- it is a system-wide architectural constraint (R2 blast-radius risk
from the Telegram bridge) documented in security-baseline.md Task 2, condition C3.

C3 is the hard blocker: until Shir confirms (via Anthropic docs or testing) that
settings.json deny rules cascade to spawned-agent subprocesses, OR Shir implements
shell-tool stripping at the bridge layer, NO Bash agent may be added to the
permitted-spawn allowlist. This applies to Gal, Shir, and Ido equally.

Gal can be certified and go-live as a directly-invoked agent (jecki or Ido
invoke Gal directly via the CLI). The spawn-allowlist denial affects only
bridge-mediated spawn via Eco's Agent tool. It does not block certification.
It does not block direct use.

Allowlist condition: Gal stays off the permitted-spawn allowlist until C3 is resolved.
This is not a Gal-specific condition -- it is inherited from the system-wide R2/C3 posture.

---

## Conditions

C1 (allowlist): Gal must remain off the agent-tool-spawn-allowlist until C3 is resolved.
  C3 = Shir confirms deny-rule cascade OR implements shell-tool stripping.
  Owner: Rambo monitors; Eco coordinates Shir delivery; jecki approves any allowlist add (A1).
  This condition does not block certification or direct-use go-live.

---

## Mitigations

C1 interim: Gal is excluded from the spawn allowlist by the existing policy (already in
  effect). Eco enforces by not spawning Gal via Agent tool. Bridge context block should
  reflect the DENIED list (A1-A4 items from security-baseline.md Task 2).
  Owner: Eco (behavioral enforcement).

C1 permanent: Shir implements shell-tool stripping at the bridge layer (B4 in the
  actionable-vs-blocked table). Once B4 is in place, Rambo re-assesses Gal for allowlist
  addition; owner A1 required to add.
  Owner: Shir (code); Rambo (re-assess); jecki (A1 allowlist add).

Mitigation summary table:

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|---------------|----------------|-----------------|------------------|
| C1 spawn allowlist | Eco | Enforce DENIED list; do not spawn Gal via Agent tool | Shir + Rambo + jecki | Shir builds shell-tool stripping (B4); Rambo re-assesses; jecki A1 adds Gal to allowlist |

---

## Summary

Gal's tool set (Read, Write, Edit, Bash) is correctly scoped for a Lead Developer
with explicit code-execution responsibilities. Bash is JUSTIFIED -- not excess.
Data access is at least-privilege. No excess permission findings.
One system-wide condition applies: spawn-allowlist denial until C3 is resolved.
That condition does not block certification or direct go-live.

Verdict: CLEAR-WITH-CONDITIONS
Condition: C1 only (spawn-allowlist -- system-wide, not Gal-specific).
Recommendation: Eco may advance Gal to Stage C. C1 is self-enforcing under
  current allowlist policy. No role-file change required.
