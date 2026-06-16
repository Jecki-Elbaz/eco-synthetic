# Stage B5 Permission Scan -- Ido (VP R&D)

Scan date: 2026-06-16
Scanned by: Rambo (Security, L3)
Target: Ido (VP R&D, L3, Phase P1)
Trigger: Stage B5, owner-approved P1 agent batch go-live process
Output to: Eco (CEO); feeds Stage C package

Verdict: CLEAR-WITH-NOTES

---

## Files read for this scan

- /home/user/eco-synthetic/.claude/agents/Ido.md
- /home/user/eco-synthetic/company/governance/access-matrix.md
- /home/user/eco-synthetic/company/processes/agent-hiring.md
- /home/user/eco-synthetic/integrations/telegram-bridge/bridge.py
- /home/user/eco-synthetic/CLAUDE.md
- /home/user/eco-synthetic/company/governance/gate-register.md
- /home/user/eco-synthetic/company/governance/security-baseline.md
- /home/user/eco-synthetic/.claude/agents/Gal.md (peer comparison)
- /home/user/eco-synthetic/.claude/agents/Shir.md (peer comparison)

---

## Section 1: Tool grant review

Tools declared in Ido.md frontmatter: Read, Write, Edit, Bash

### 1.1 Read -- JUSTIFIED

Read is required for any agent that must inspect project files, access memory/board.md,
read company/ context, and load role files. Ido explicitly needs read on projects/<name>/,
memory/, and company/ (need-to-know). Justified.

### 1.2 Write -- JUSTIFIED

Ido writes to memory/board.md (own task rows), memory/log.md (append), and
projects/<name>/ (R&D management artifacts: capacity plans, triage lists, gate decisions,
result envelopes). VP-level output generation requires Write. Justified.

### 1.3 Edit -- JUSTIFIED

Edit is the precise-replacement complement to Write. For a VP managing R&D artifacts
across multiple projects, Edit is less risky than repeated Write-whole-file operations.
Justified.

### 1.4 Bash -- JUSTIFIED WITH NOTE

Bash is in Ido's frontmatter, and this requires the most scrutiny.

Justification basis: Ido's role includes release gate decisions, regression-prevention
ownership, and architecture oversight. He may need to run validation checks, inspect
build artifacts, query project state, or reproduce issues reported by Gal or Adi before
making a gate call. Without Bash he would be forced to route every such check through
Gal, adding latency and a chain-of-command hop for routine gate work.

Peer consistency: Bash is granted to both Gal (Lead Dev) and Shir (DevOps) with
identical justification in their role files ("code execution, test runs, build
validation"). A VP R&D who manages these agents and owns the release gate decision
has at least as strong a case for Bash as the L4s he oversees.

CLAUDE.md red line 3 applies directly: Ido's role file lists red line 3 verbatim
("Never run destructive commands without explicit A1"). This is documented and inherited.

NOTE (non-blocking): Ido is a manager and strategist first. Day-to-day code execution
belongs to Gal and Shir. Ido's Bash use should be scoped to release gate validation
and inspection commands, not routine development work. The role file does not call
this out explicitly. Recommend Eco confirm with Ido that Bash use is confined to
gate-relevant tasks. No remediation required before go-live; this is a hygiene note.

---

## Section 2: File / data access review

Comparing Ido.md Data/memory access block against access-matrix.md need-to-know.

| Path | Ido claims | Matrix permits | Finding |
|------|-----------|---------------|---------|
| memory/board.md | read/write (own rows) | All agents: each writes own rows | MATCH |
| memory/log.md | append (own entries) | All agents: append own entries | MATCH |
| memory/wiki/ | read (need-to-know) | All agents read (need-to-know) | MATCH |
| projects/<name>/ | read/write (assigned projects; Eco and VP R&D may read any) | Assigned agents + on-demand SME; Eco and relevant VPs may read any | MATCH |
| company/ | read-only, need-to-know context | Restricted: Eco, governance agents; all others read-only need-to-know | MATCH |
| company/decisions/decisions-log.md | append-only | Append: all agents | MATCH |
| .claude/agents/ | no standing access; read own role file only via runtime context | Owner/CEO only (Rambo and Anat by exception) | MATCH -- correctly blocked |
| sources/ | read-only | Read-only (any agent for context) | MATCH |
| .env | BLOCKED | Blocked | MATCH |
| dashboards/ | no access | Lital + jecki only | MATCH |
| marketing/ | no access | Sales group only | MATCH |
| memory/owner-office/ | BLOCKED | Owner-only (Shelly + jecki) | MATCH |

No over-grant found. No path claimed by Ido exceeds his legitimate need-to-know
for a VP R&D managing an R&D group and interfacing with Eco.

---

## Section 3: Prompt-injection and privilege-escalation exposure

### 3.1 Bridge tool scope

bridge.py _AGENT_TOOLS does not include an "ido" key. The bridge currently serves
only "eco" and "shelly". Ido is not in the Telegram bridge at this time.
When Ido is added to the bridge (if ever), his tool list MUST be restricted to
what is safe for a Telegram session (likely Read-only, not Bash). This is
a bridge configuration risk, not a role-file risk. Flag for Shir/Eco at that time.

### 3.2 External content handling

Ido receives requirements from Noam (Product) and may receive bug reports, spec docs,
and release candidate content from Gal and Adi. Any of these could carry adversarial
content if those upstream sources were compromised. Ido's role file does not contain
an explicit prompt-injection defense clause.

Risk level: LOW-MEDIUM. Ido is L3 with Bash. If adversarial content in an upstream
spec caused Ido to run a malicious Bash command, the blast radius is meaningful
(write access to projects/, Bash on the host). Mitigations already in place:
- Soul rule 7 (stay in lane) and red line 8 (chain of command) limit what Ido acts on.
- Red line 3 bars destructive Bash without A1.
- Ido's chain is CEO-only; he will not act on instructions from external content.

No blocking finding. Recommend Eco consider adding a standard prompt-injection
awareness clause to L3 VP role files in the next R&R cycle (Dalia + Rambo item).

### 3.3 Privilege escalation via agent routing

Ido can invoke Sami (SME, A2) and can propose Roman (Algorithm) invocation to Eco.
Neither represents a privilege escalation path; both require Eco awareness or A2 gate.
No finding.

### 3.4 .claude/agents/ access

Ido's role file correctly states no standing access to .claude/agents/ and limits
himself to reading his own role file via Claude Code runtime context. This is the
right posture for an L3 agent. Confirmed MATCH with matrix.

---

## Section 4: Peer consistency check

| Agent | Level | Tools | Bash justified? |
|-------|-------|-------|----------------|
| Gal | L4 (Lead Dev) | Read, Write, Edit, Bash | Yes -- code execution, test runs |
| Shir | L4 (DevOps) | Read, Write, Edit, Bash | Yes -- deploy, pipeline, incident |
| Ido | L3 (VP R&D) | Read, Write, Edit, Bash | Yes -- release gate validation, architecture inspection |

Ido's tool set is identical to his direct reports and is consistent with the VP R&D
function. No inconsistency or unexplained elevation vs peers.

---

## Section 5: Findings summary

| # | Finding | Severity | Blocking? |
|---|---------|----------|-----------|
| 1 | Bash use scope not explicitly bounded in role file (gate validation vs routine dev) | Low | No |
| 2 | Prompt-injection clause absent from role file for external-content inputs | Low | No |
| 3 | Bridge entry for Ido not present; if bridge is extended to Ido, Bash must be excluded from bridge tool grant | Low (future risk) | No -- not live yet |

---

## Recommendation

CLEAR-WITH-NOTES. No blocking findings. No excess permissions. Tool grants are
justified and consistent with peer L4 agents. Data access matches the access matrix.
Notes 1 and 2 are hygiene items for the next R&R cycle, not go-live blockers.
Note 3 is a configuration flag for Shir and Eco if bridge scope ever expands to Ido.
Eco may include this scan in the Stage C package as-is.

Rambo
2026-06-16
