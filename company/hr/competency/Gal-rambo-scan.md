# Stage B5 Permission Scan -- Gal (Lead Developer)

Scan date: 2026-06-16
Scanned by: Rambo (Security, L3)
Target: Gal (Lead Developer, L4, Phase P1, R&D group)
Trigger: Stage B5, owner-approved R&D go-live wave
Output to: Eco (CEO); feeds Stage C package

Verdict: CLEAR-WITH-NOTES

---

## Files read for this scan

- /home/user/eco-synthetic/.claude/agents/Gal.md
- /home/user/eco-synthetic/company/governance/access-matrix.md
- /home/user/eco-synthetic/company/processes/agent-hiring.md
- /home/user/eco-synthetic/company/hr/competency/Ido-rambo-scan.md (format/rigor template)
- /home/user/eco-synthetic/integrations/telegram-bridge/bridge.py
- /home/user/eco-synthetic/CLAUDE.md

---

## Section 1: Tool grant review

Tools declared in Gal.md frontmatter: Read, Write, Edit, Bash

### 1.1 Read -- JUSTIFIED

Gal must navigate the codebase, read project files under projects/<name>/,
read memory/board.md for task tracking, and pull company/ context as needed.
Read is the minimum working tool for any developer role. Justified.

### 1.2 Write -- JUSTIFIED

Gal authors new code files as part of feature implementation and bug fixing.
Write is required for code creation, not just editing in place. The role file
states "code authoring" explicitly. Justified.

### 1.3 Edit -- JUSTIFIED

Edit (precise string replacement) is safer than full Write for modifying
existing code files -- it reduces the risk of accidental overwrites. For a
Lead Developer iterating on an existing codebase, Edit is the preferred tool
for modifications. Justified and preferred over Write-only for edits.

### 1.4 Bash -- JUSTIFIED WITH NOTE

Bash is the tool requiring the most scrutiny for a developer role. Assessment:

Justification basis: Gal's role file states "Run local code execution to
validate changes before handoff" as an explicit responsibility. Bash is
required for running test suites, build validation, and local execution
checks before code passes to code review or Ido's release gate. Without
Bash, Gal cannot fulfill the pre-handoff validation responsibility and
would ship unvalidated code, which is a quality failure mode.

Gal's role file lists red line 3 verbatim: "Never run destructive shell
commands (rm -rf, DROP TABLE, force-push main, hard-reset shared branch)
without explicit A1." This is documented, inherited from CLAUDE.md, and
appears in the Boundaries section of the role file.

Red line 4 is also listed verbatim: "Never use curl/wget/direct network
calls to download or execute external code without the Security + Legal gate."
This is critical for a developer who may encounter external dependencies or
repos. It is correctly enumerated.

NOTE (non-blocking): Gal handles code from potentially external sources
(specs from Noam via Ido, bug reports from Adi, possible external repo
content). Bash combined with externally-sourced input is the highest
injection risk surface for this role. The role file does not contain an
explicit prompt-injection defense clause for externally-sourced content
entering a Bash execution context. This is the same gap flagged in the Ido
scan. Risk level: LOW-MEDIUM. Mitigations already in place: soul rule 7
(stay in lane), red lines 3, 4, and 8, and the chain-of-command
requirement (cross-group content via Ido only). No go-live blocker. Flag
for next R&R cycle as a standard clause addition across L4 developer roles.

---

## Section 2: File / data access review

Comparing Gal.md Data/memory access block against access-matrix.md
need-to-know tiers and the scan task note (Lead Dev must NOT have
company-restricted governance write, dashboards, .env, marketing, or
owner-office access).

| Path | Gal claims | Matrix permits | Finding |
|------|-----------|---------------|---------|
| projects/<name>/ | Read + Write (assigned projects) | Assigned agents + SME; Eco and relevant VPs may read any | MATCH |
| projects/<name>/memory/ | Read + Write | Project agents | MATCH |
| memory/board.md | Read + Write (own task rows) | All agents: each writes own rows | MATCH |
| memory/log.md | Read + Append (own entries) | All agents: append own entries | MATCH |
| memory/wiki/ | Read (need-to-know) | All agents read (need-to-know) | MATCH |
| company/ | Read (need-to-know context only) | Restricted: governance agents write; all others read-only need-to-know | MATCH -- read-only, need-to-know is the correct tier for L4 |
| sources/ | Read only; never write | Read-only (any agent for context) | MATCH |
| .env | Blocked | Blocked | MATCH |
| .claude/agents/ | Blocked (owner/CEO only) | Owner/CEO only | MATCH |
| company/decisions/ | Append only | Append: all agents | MATCH |
| dashboards/ | Blocked | Lital + jecki only | MATCH |
| marketing/ | Blocked | Sales group only | MATCH |

No over-grant found. Every path Gal claims is within or below his legitimate
need-to-know tier for an L4 Lead Developer. Sensitive paths (dashboards,
.env, marketing, owner-office, .claude/agents/) are explicitly blocked in the
role file and correctly match the matrix deny list.

Note: Gal's role file does not list memory/owner-office/ explicitly, but
it is not claimed either. The absence of a claim for a blocked path is
acceptable; no residual access risk.

---

## Section 3: Prompt-injection and privilege-escalation exposure

### 3.1 Bridge tool scope

bridge.py _AGENT_TOOLS does not include a "gal" key. Gal is not wired into
the Telegram bridge at this time. No bridge-session risk present.

If Gal is ever added to the bridge, Bash MUST be excluded from the bridge
tool grant (_AGENT_TOOLS entry must be Read only or Read+Write+Edit without
Bash). Bash over a Telegram session channel is too broad a surface for a
developer role. Flag for Shir and Eco at that time.

### 3.2 External content handling and Bash injection risk

Gal's highest injection surface is the combination of Bash + external-origin
content. Inputs to Gal can include:
- Task descriptions from Ido (trusted, in chain)
- Bug pattern reports from Adi (trusted, in chain, but content can include
  externally-sourced strings if bugs involve external data)
- Spec documents from Noam (via Ido; Noam is cross-group)
- Code or test inputs from external repos (if ever invoked pre-gate scan)

Red line 4 bars curl/wget/direct network calls without the Security + Legal
gate. This is correctly stated in Gal's role file. However, a prompt-injection
attack could attempt to use Bash to run a locally available binary that
achieves the same effect as curl (e.g., python -c "import urllib..."). The
existing red lines address the intent but not all syntactic variants.

Risk level: LOW-MEDIUM. Existing mitigations (soul rules, red lines 3, 4, 8,
chain-of-command constraints) reduce the attack surface materially. No
blocking finding. Recommend Eco consider adding an explicit prompt-injection
clause to L4 developer role files in the next R&R cycle (Dalia + Rambo item,
same recommendation as Ido scan).

### 3.3 External repo scan requirement

Per CLAUDE.md and security-baseline.md: before any external repo or script
is used by Gal, Rambo must scan it for .claude/, CLAUDE.md, .cursorrules,
and install scripts. This is an existing process gate, not a role-file
deficiency. Gal's role file correctly requires the Security + Legal gate
before any external tool adoption (red line 7 in Boundaries). The scan
requirement is covered by process, not by adding tool restrictions to the
role file.

### 3.4 Privilege escalation via agent routing

Gal communicates with Senior Developer (code review), Adi (receives reports),
and Shir (via Ido for deploy/env matters). None of these represent a
privilege escalation path: all are within-group or gated through Ido. Gal
cannot directly invoke Roman (Algorithm) -- that goes via Ido. No finding.

### 3.5 .claude/agents/ access

Gal's role file explicitly blocks .claude/agents/ (owner/CEO only). Correctly
stated. No elevation risk from agent-file reads.

---

## Section 4: Peer consistency check

| Agent | Level | Tools | Bash justified? | Access scope |
|-------|-------|-------|----------------|-------------|
| Gal | L4 (Lead Dev) | Read, Write, Edit, Bash | Yes -- code execution, test runs, build validation | projects/, memory/, company/ read, sources/ read |
| Shir | L4 (DevOps) | Read, Write, Edit, Bash | Yes -- deploy, pipeline, incident response | integrations/, projects/, memory/, company/ read |
| Ido | L3 (VP R&D) | Read, Write, Edit, Bash | Yes -- release gate validation, architecture inspection | projects/ (any), memory/, company/ read |

Gal's tool set is identical to Shir (same level, same group) and consistent
with the VP R&D (Ido) above him. No unexplained elevation vs peers. Gal's
access scope is narrower than Ido's (assigned projects only, not any project),
which is correct for an L4 vs L3.

The Ido scan (Ido-rambo-scan.md) noted Bash for Ido as "justified with note"
on the same basis: note was hygiene, not a blocker. Gal's Bash is equally
well-justified by explicit role responsibility ("local code execution to
validate changes") and is more directly the core function of a developer
than it is for a VP. Gal's Bash case is actually stronger than Ido's.

---

## Section 5: Findings summary

| # | Finding | Severity | Blocking? |
|---|---------|----------|-----------|
| 1 | Prompt-injection clause absent from role file for externally-sourced content entering Bash execution context | Low | No |
| 2 | Bridge entry for Gal not present; if bridge is ever extended to Gal, Bash must be excluded from the bridge tool grant | Low (future risk) | No -- not live |
| 3 | Red line 4 bars curl/wget but does not enumerate alternative download vectors (e.g., python urllib, requests); existing red lines cover intent but not all syntactic variants | Low | No |

No excess permissions found. No path over-grants found. All blocked paths
are explicitly blocked in the role file.

---

## Recommendation

CLEAR-WITH-NOTES. No blocking findings. Tool grants (Read, Write, Edit,
Bash) are all justified by Gal's explicit responsibilities and are consistent
with peer L4 agents Shir and Ido. Data access matches the access matrix; no
over-grants to company-restricted, dashboards, .env, marketing, or
owner-office paths. Notes 1, 2, and 3 are hygiene items for the next R&R
cycle. Eco may include this scan in the Stage C package as-is.

Rambo
2026-06-16
