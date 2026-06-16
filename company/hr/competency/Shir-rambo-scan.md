# Stage B5 Permission Scan -- Shir (DevOps, L4)

Scan date: 2026-06-16
Scanned by: Rambo (Security, L3)
Target: Shir (DevOps, L4, Phase P1, R&D group, reports to Ido VP R&D)
Trigger: Stage B5, owner-approved R&D wave go-live process (jecki approval confirmed)
Output to: Eco (CEO); feeds Stage C package
Risk tier: HIGH -- DevOps is the most powerful Bash holder in the org (deploy, rollback, infra, integrations write)

Verdict: CLEAR-WITH-NOTES

---

## Files read for this scan

- /home/user/eco-synthetic/.claude/agents/Shir.md
- /home/user/eco-synthetic/company/governance/access-matrix.md
- /home/user/eco-synthetic/company/processes/agent-hiring.md
- /home/user/eco-synthetic/company/hr/competency/Ido-rambo-scan.md (format/rigor template)
- /home/user/eco-synthetic/company/hr/competency/Gal-rambo-scan.md (peer template)
- /home/user/eco-synthetic/integrations/telegram-bridge/bridge.py
- /home/user/eco-synthetic/CLAUDE.md

---

## Section 1: Tool grant review

Tools declared in Shir.md frontmatter: Read, Write, Edit, Bash

### 1.1 Read -- JUSTIFIED

Shir must read infra config, pipeline files, monitoring output, integrations/,
memory/board.md, company/ governance context, and projects/ (R&D-assigned).
Read is the minimum working tool for any infra role. Justified.

### 1.2 Write -- JUSTIFIED

Shir authors config files, pipeline scripts, deployment artifacts, incident reports,
and integration files under integrations/ (the role file grants integrations/
read + write under Ido approval). Infra-as-code requires Write. Justified.

### 1.3 Edit -- JUSTIFIED

Edit (precise string replacement) is safer than full Write for modifying existing
config and pipeline files -- reduces risk of accidental full-file overwrites during
live-incident edits. For a DevOps engineer iterating on infra state, Edit is the
preferred tool for in-place modifications. Justified and preferred over Write-only.

### 1.4 Bash -- JUSTIFIED WITH NOTES (HIGHEST SCRUTINY)

Bash is the highest-risk grant in this scan. DevOps is the only L4 role whose
Bash use is not primarily for validation: Shir's Bash reaches production infra,
deploy pipelines, and rollback operations. This is the correct role to hold Bash
for this function, but the guardrail review is stricter.

Justification basis: Shir's explicit responsibilities include deploy + rollback,
release pipeline mechanics (build, tag, package, promote), live monitoring,
first-line incident response, and integrations/ ownership. All of these require
Bash. Without Bash, Shir cannot execute any of these core functions. Justified.

Peer comparison: Gal (Lead Dev) holds Bash for test runs and build validation.
Shir's Bash is broader in operational scope (infra execution vs code validation)
but narrower in creative scope. Both are L4. Bash parity is appropriate: the
function differs but the risk tier is comparable.

Red line coverage in role file -- VERIFIED:

  (a) CLAUDE.md red line 3 (destructive commands): Shir.md "What you must NEVER do"
      section item 5 states "Write to sources/ or .env. [CLAUDE.md]". However, it
      does NOT enumerate the destructive-command list from CLAUDE.md red line 3
      (rm -rf, DROP TABLE, force-push main, reset --hard on shared branches).
      Gal's role file states this red line verbatim. Shir's does not.
      FLAG -- see Finding 1 below.

  (b) CLAUDE.md red line 1/5 (secrets handling): Shir.md explicitly blocks .env
      (data access table: "Blocked") and item 8 in "What you must NEVER do" states
      "Store or expose secrets / credentials in repo, outputs, or logs. [red line 5]".
      Adequate coverage. No finding on secrets handling.

  (c) A1 gate for production deploy: Shir.md Authority section states "A1: production
      deploy, customer-data migration or deletion, new tool adoption, any expense."
      Item 1 in "What you must NEVER do" states "Deploy to production without A1."
      This is correctly documented and present. Stronger than Gal's role file on
      this specific point because the production-deploy A1 requirement is explicit.
      No finding.

  (d) Rollback gate: the role file states "Rollback of a live deploy: A2 if incident
      active; A1 if data-destructive." This is appropriate tiering and is explicit.
      No finding.

NOTE 1 (non-blocking, but remediation recommended before go-live): The destructive-
command list from CLAUDE.md red line 3 is absent from Shir's role file. Gal's scan
(Finding 1 equivalent) found this present in Gal's role file. For a DevOps agent with
production Bash access, the explicit enumeration of rm -rf, DROP TABLE, force-push
to main, and reset --hard on shared branches as A1-required commands is a material
guardrail, not a hygiene note. Recommend adding to Shir's "What you must NEVER do"
section before go-live. This is a CONDITION, not a hard block: Eco may judge whether
to require it before Stage C or log as a post-go-live R&R item.

NOTE 2 (non-blocking): Bash use for DevOps spans infra and live systems. The role
file does not distinguish between read-only inspection Bash (safe at A3) and
execution Bash that changes system state (should require A2 logging at minimum).
Gal's scan noted a similar hygiene gap for Ido. For Shir the gap is more material
given operational scope. Recommend Eco + Ido discuss whether all state-changing
Bash executions by Shir should carry an explicit A2 log requirement in the next
R&R cycle.

---

## Section 2: File / data access review

Comparing Shir.md Data/memory access block against access-matrix.md need-to-know tiers.
Scan instruction: DevOps must NOT have .env, dashboards, marketing, owner-office,
company-restricted write, or .claude/agents/ write.

| Path | Shir claims | Matrix permits | Finding |
|------|------------|---------------|---------|
| integrations/ | Read + Write (under Ido approval) | Shir (DevOps) + Eco; write under VP R&D approval | MATCH |
| memory/board.md | Read + Write (own rows) | All agents: each writes own rows | MATCH |
| memory/log.md | Append | All agents: append own entries | MATCH |
| memory/wiki/ | Read (need-to-know) | All agents read (need-to-know) | MATCH |
| projects/<name>/ | Read (R&D-assigned projects) | Assigned agents + on-demand SME; Eco and relevant VPs may read any | MATCH -- read-only for Shir (no write to projects/, correct) |
| company/constitution.md | Read | Restricted: all others read-only need-to-know | MATCH |
| company/governance/gate-register.md | Read | Restricted: all others read-only need-to-know | MATCH |
| company/governance/access-matrix.md | Read | Restricted: all others read-only need-to-know | MATCH |
| sources/ | Read only; never write | Read-only (any agent for context) | MATCH |
| .env | Blocked | Blocked | MATCH |
| company/decisions/ | Append only | Append: all agents | MATCH |
| .claude/agents/ | Blocked (owner/CEO only) | Owner/CEO only (Rambo and Anat by exception only) | MATCH |

Paths NOT claimed but checked against matrix for residual risk:

| Path | Shir claims | Matrix | Finding |
|------|------------|--------|---------|
| dashboards/ | Not claimed | Lital + jecki only | MATCH -- not claimed; no over-grant |
| marketing/ | Not claimed | Sales group only | MATCH -- not claimed; no over-grant |
| memory/owner-office/ | Not claimed | Owner-only (Shelly + jecki) | MATCH -- not claimed; no over-grant |
| memory/global/ | Not claimed | Need-to-know; Eco + relevant staff | MATCH -- not claimed; no over-grant |
| company/ (broader write) | Not claimed | Restricted; governance agents write | MATCH -- Shir claims only 3 specific read paths, no broad company/ write |

No over-grant found. Shir's data access is tightly scoped to infra function:
integrations/ (write, gated by Ido), memory/ (own rows and append), projects/
(read only), and three specific company/ governance files (read only). All
blocked paths (dashboards, .env, marketing, owner-office, .claude/agents/) are
explicitly documented and match the matrix deny list.

One observation: Shir's data access block does not enumerate memory/owner-office/
explicitly as blocked. Gal's scan noted the same absence as acceptable (no claim
for a blocked path is acceptable). Same finding applies here. No residual risk.

---

## Section 3: Prompt-injection and privilege-escalation exposure

### 3.1 Bridge tool scope

bridge.py _AGENT_TOOLS does not include a "shir" key. Shir is not wired into the
Telegram bridge at this time. No bridge-session risk present.

CRITICAL BRIDGE FLAG: If Shir is ever added to the bridge, Bash MUST be excluded
from the _AGENT_TOOLS entry. Shir's Bash reaches production infra and deploy
pipelines. A Telegram session carries Shir's full operational authority if Bash
is included -- this is an unacceptable surface for a chatbot channel. The bridge
team (Shir himself, once live, plus Eco) must enforce Bash exclusion for any
bridge entry. Flag for Eco and Ido at that time. This is a future configuration
risk, not a current finding.

### 3.2 External content handling and Bash injection risk

Shir's injection surface is high. Inputs to Shir can include:

  - Task descriptions from Ido (trusted, in chain)
  - Alert and monitoring events (semi-automated; content can include external strings
    from monitored services, Sentry payloads, uptime data)
  - Build artifacts and release signals from Gal or Ido (trusted, in chain, but content
    can include externally-sourced strings if builds contain external dependencies)
  - IT requests routed through Ido (indirect external origin possible)

Shir's Bash interacts with live infra, not just code validation. If adversarial
content in a monitoring alert or build artifact causes Shir to run a malicious Bash
command, the blast radius is the highest in the R&D group: production infra, deploy
pipeline, and integrations/ write access are all reachable.

The role file does not contain an explicit prompt-injection defense clause. This is
the same gap flagged in both the Ido scan and the Gal scan. For Shir, the risk
level is MEDIUM (vs LOW-MEDIUM for Gal and Ido) because:
  - Monitoring and alert inputs are semi-automated and carry external-origin content
  - Bash operations are state-changing (deploy, rollback, config write), not just
    read-and-validate

Existing mitigations: soul rule 7 (stay in lane), red lines 3, 5, 8, chain-of-command
requirement (all tasks via Ido), A1 gate on production deploy and A2 gate on emergency
hotfix. These materially reduce the risk. No go-live blocker. However, the prompt-
injection clause recommendation is elevated from "hygiene" to "recommended addition in
next R&R cycle" for Shir given the higher blast radius.

### 3.3 External repo and script handling

Per CLAUDE.md and security-baseline.md: before any external repo or script is used
by Shir, Rambo must scan for .claude/, CLAUDE.md, .cursorrules, and install scripts.
Shir's role file correctly requires the Security + Legal gate before any external tool
adoption ("Adopt a tool, accept terms, or grant permissions without gate + A2/A1" is
item 3 in "What you must NEVER do"). The scan requirement is covered by process gate,
not a role-file deficiency.

For Shir specifically: infra scripts and pipeline tooling are a common vector for
supply-chain injection. Shir should route all external script adoption through the
gate, and the gate should apply extra scrutiny to scripts that will run in a Bash
context with infra access. This is a process note, not a role-file finding.

### 3.4 Privilege escalation via agent routing

Shir communicates within R&D group only (Ido, Gal, Adi, Roman, Senior Dev). He
cannot contact Eco directly except when Ido explicitly delegates a specific task and
time frame. He cannot go lateral to Sales, CS, or CEO staff. None of the in-group
agents represent a privilege escalation path: Shir is the highest-Bash agent in the
group (deploy scope) but his lateral peers (Gal) do not receive instructions from him.

No agent-routing privilege escalation risk found.

### 3.5 .claude/agents/ access

Shir's role file explicitly blocks .claude/agents/ ("Blocked (owner/CEO only)"). This
is the correct posture and matches the matrix. No elevation risk.

### 3.6 integrations/ write scope -- unique to Shir

Shir is the only L4 agent with write access to integrations/, which includes the
Telegram bridge. The access-matrix.md explicitly lists this path as "Shir (DevOps),
under VP R&D approval." This is correct and gated. However, integrations/ contains
bridge.py, which handles authentication tokens (loaded from .env), chat history,
and the Claude CLI subprocess. A compromised or adversarially-influenced Shir writing
to bridge.py is the highest single-point-of-failure risk in the current security
posture.

Mitigation: write to integrations/ is gated on "Ido approval" per the role file.
This is an A2-level gate in practice. As long as that gate is enforced, the risk is
managed. Recommend Eco and Ido treat any bridge.py modification as requiring an
explicit written approval record in company/decisions/decisions-log.md, not just
informal Ido sign-off. Raising as FLAG -- see Finding 3 below.

---

## Section 4: Peer consistency check

| Agent | Level | Tools | Bash scope | A1 gate explicit? | Destructive cmds listed? |
|-------|-------|-------|-----------|------------------|--------------------------|
| Gal | L4 (Lead Dev) | Read, Write, Edit, Bash | Code execution, test runs, build validation | Yes | Yes (red line 3 verbatim) |
| Shir | L4 (DevOps) | Read, Write, Edit, Bash | Deploy, rollback, pipeline, infra, incident response | Yes (deploy A1 explicit) | NO -- absent from role file |
| Ido | L3 (VP R&D) | Read, Write, Edit, Bash | Release gate validation, architecture inspection | Not applicable (VP gate) | Present (inherited) |

Shir's tools are identical to Gal and Ido, consistent with L4 R&D group norms.
Shir's A1 gate for production deploy is MORE explicit than Gal's, which is correct
given DevOps function. However, Gal's role file lists CLAUDE.md red line 3 verbatim
(destructive command list) and Shir's does not. This is the only material inconsistency
between the two L4 peers. It is a gap that matters more for Shir than for Gal given
operational scope -- Shir's Bash is more likely to be pointed at destructive operations
than Gal's.

Access scope is appropriately differentiated: Shir has integrations/ write (Gal does
not), while Gal has projects/ write (Shir has projects/ read only). This matches
their respective functions. No unexplained elevation.

---

## Section 5: Findings summary

| # | Finding | Severity | Blocking? | Remediation |
|---|---------|----------|-----------|-------------|
| 1 | CLAUDE.md red line 3 destructive-command list (rm -rf, DROP TABLE, force-push main, reset --hard on shared branches) is absent from Shir's "What you must NEVER do" section. Gal's role file has it verbatim. Shir's Bash scope makes this gap more material than it would be for a non-infra role. | Medium | CONDITION -- Eco to decide: require before Stage C, or log as immediate post-go-live R&R | Add verbatim red line 3 enumeration to Shir.md "What you must NEVER do" section |
| 2 | Prompt-injection defense clause absent from role file. Risk is MEDIUM for Shir (not LOW-MEDIUM as for Gal/Ido) because monitoring/alert inputs carry semi-automated external-origin content and Bash operations are state-changing. | Medium | No -- process mitigations exist | Add prompt-injection awareness clause in next R&R cycle (Dalia + Rambo item; elevated priority vs Gal/Ido) |
| 3 | integrations/bridge.py modification lacks an explicit written approval requirement. "Ido approval" for integrations/ write is stated in role file but no record format is required. Bridge.py is a high-value target (auth, tokens, subprocess). | Medium | No -- gate exists; format gap only | Eco + Ido to confirm: any bridge.py write requires a logged entry in company/decisions/decisions-log.md, not just informal sign-off |
| 4 | Bridge entry for Shir not present in bridge.py _AGENT_TOOLS; if bridge is ever extended to Shir, Bash MUST be excluded from the bridge tool grant. Shir's Bash has production-deploy scope -- unacceptable in a Telegram session channel. | Low (future risk) | No -- Shir not in bridge at this time | Enforce Bash exclusion if Shir is ever added to _AGENT_TOOLS; flag this note to Eco and Ido at that time |

No excess permission grants found. No path over-grants found. All blocked paths are
correctly documented in the role file and match the access matrix.

---

## Section 6: DevOps-specific additional guardrail assessment

Task instruction asked whether DevOps warrants ADDITIONAL guardrails vs Gal and Ido.
Assessment: YES, on two points.

Point A: Explicit production-deploy A1 -- ALREADY PRESENT in Shir.md.
Shir's role file has "Deploy to production without A1" as item 1 in "What you must
NEVER do" and the Authority section states "A1: production deploy." This is more
explicit than Gal's role file on this point. No gap here.

Point B: Destructive-command enumeration -- NOT PRESENT in Shir.md (Finding 1 above).
Gal has it verbatim from CLAUDE.md red line 3. Shir does not. For a DevOps role with
rm-level and pipeline-reset Bash access, this enumeration is a material guardrail,
not a formatting preference. This is the one concrete gap vs peers.

Point C: State-changing Bash logging -- NOT ADDRESSED in role file.
Recommend Eco + Ido discuss an A2-log requirement for any Bash command that changes
infra state (deploy, rollback, config push). Gal's Bash is mostly read-validate;
Shir's Bash executes changes. The existing A1/A2 gate in the Authority section covers
the decision gates but does not require a log entry for every Bash execution that
changes state at A3 level. This is a process-design question, not a role-file defect.

---

## Recommendation

CLEAR-WITH-NOTES. No excess permissions. No path over-grants. Tool grants (Read,
Write, Edit, Bash) are all justified by Shir's explicit DevOps responsibilities and
are consistent with peer L4 agents Gal and Ido.

One CONDITION (Finding 1): Eco to decide whether the missing destructive-command
enumeration must be added to Shir.md before Stage C package is submitted, or whether
it is logged as an immediate post-go-live R&R item. Given Shir's Bash scope, Rambo
recommends requiring it before Stage C. This is Eco's call.

All other findings are non-blocking notes for the next R&R cycle or future
configuration events (bridge addition). Eco may include this scan in the Stage C
package alongside the condition decision.

Go-live remains owner A1.

Rambo
2026-06-16
