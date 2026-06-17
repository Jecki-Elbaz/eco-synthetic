# Rambo B5 Permission Scan: Eyal (Legal, L3 direct)

Scan date: 2026-06-17
Tasked by: Eco (CEO), step B5 agent-hiring.md
Basis: Eyal.md (2026-06-14 draft), access-matrix.md v1.0, security-baseline.md

---

## Verdict: CLEAR

No conditions. Tools and data access are at least-privilege for the legal function.
No Bash, no WebFetch, no external tool. Data scope matches access-matrix grants.
One informational note (not a condition).

---

## Findings

### F1 -- Tools (Read, Write, Edit): CLEAR

Eyal's tools line: Read, Write, Edit. No Bash. No WebFetch (intentionally absent per task brief).

- Read: required. Eyal must read gate-register.md, terms documents (internal file copies),
  access-matrix.md, compliance-backlog.md, constitution, role files, and memory/board.md
  to do any gate review or compliance task. Cannot function without Read.

- Write: required. Eyal owns write rights on gate-register.md (status updates, row adds,
  archive) and compliance-backlog.md (joint owner with Lital). Also writes own memory/log.md
  entries and memory/board.md rows. All of these are within granted scope.

- Edit: required. In-place edits to gate-register rows and compliance-backlog items are
  standard workflow for this role. Edit on internal governance files is appropriate.

- Bash: absent. Correct. Eyal has zero execution or shell function. No legitimate
  task in the legal role requires shell commands.

- WebFetch: absent. Intentionally excluded. Eyal's role requires reviewing external legal
  terms, but the process requires those terms to be brought in by a controlled path (task
  envelope from Eco includes a URL or document reference). Eyal does not self-fetch. This
  is the correct security posture: WebFetch would widen the external-content injection
  surface without adding authorized capability. The absence is confirmed and endorsed.

- No MCP tools, no external integrations: correct at this phase. Israeli-law MCP is
  explicitly flagged as pending gate (Eyal.md Tools section) and not yet adopted.

No excess permission in tools line.

---

### F2 -- Data access scope: CLEAR

Eyal.md data access table cross-checked against access-matrix.md:

| Path | Eyal.md right | Matrix allows | Assessment |
|------|--------------|---------------|------------|
| company/governance/gate-register.md | Read + Write | Eyal (write owner) | MATCH |
| company/governance/compliance-backlog.md | Read + Write | Eyal + Lital (joint owner) | MATCH |
| company/governance/access-matrix.md | Read | Eyal (read) per restricted list | MATCH |
| company/ (other) | Read (role-relevant) | Eco, Dalia, Anat, Rambo, Eyal, Lital -- restricted | MATCH |
| marketing/ | Read (clearance reads only) | Eyal (clearance reads) per matrix note | MATCH |
| memory/board.md | Read + write own rows | Company-shared: all agents write own rows | MATCH |
| memory/log.md | Append own entries | Company-shared: append own entries | MATCH |
| memory/wiki/ | Read (need-to-know) | Company-shared: all agents read (need-to-know) | MATCH |
| .env | BLOCKED | Blocked | MATCH |
| sources/ | Read only; never write | Read-only (any agent) | MATCH |
| .claude/agents/ | Read (operational context); no write | Owner/CEO only; Eyal NOT listed as exception | SEE NOTE |

No excess scope in any path. No access to dashboards/, projects/, memory/owner-office/, memory/global/.

---

### F3 -- .claude/agents/ read: INFORMATIONAL NOTE (not a condition)

Eyal.md grants read access to .claude/agents/ for "operational context." The access-matrix
lists .claude/agents/ as "Owner/CEO only." Anat and Rambo hold bootstrapped read-by-exception
(A2 bootstrapped by owner A1). Eyal is not listed as holding this exception.

Assessment: Eyal's legal function does not require routine reads of agent role files.
Gate reviews and compliance tasks operate on gate-register.md, terms documents, and
constitution -- not on agent role files. The .claude/agents/ read in Eyal.md is the
standard "operational context" boilerplate used in several role files, not a cited
operational need.

Risk level: LOW. Eyal does not hold Bash or Write rights on .claude/agents/. A read of
a role file by Eyal in an edge case does not represent a material risk vector.

This is NOT a condition blocking certification or go-live. It is an informational note
for Eco and Dalia: when T-0012 is executed and the .claude/agents/ exception set is
formalized, Eco/Dalia should decide whether to add Eyal to the named exception list or
leave the read-by-operational-exception as implicitly covered by owner A1 go-live.
No change required before Eyal is activated.

---

### F4 -- Prompt-injection surface: LOW RISK, NO FLAG

Eyal's highest-risk external-content exposure is reading legal terms documents during
gate reviews. The task envelope includes a URL or document reference supplied by Eco.
Eyal does not self-fetch (no WebFetch tool).

If terms are provided as file content (e.g., copied into a staging file), an adversarial
terms document could attempt to inject instructions. However:

- Eyal holds no Bash tool -- injected instructions cannot execute code.
- Eyal holds no Write rights on sources/ or .env.
- Eyal's write scope is gate-register.md, compliance-backlog.md, memory files. An injected
  instruction could at most cause Eyal to write incorrect gate status -- a detectable and
  reversible outcome.
- Eyal's soul rules (NO GUESS, VERIFY-THEN-CLAIM, NO FALSE COMPLETION) constrain behavior
  against falsifying gate outcomes.

Residual risk: LOW. No flag issued.

Mitigation note: Eco should always provide terms content via a specific bounded file or
excerpt, not a broad "read everything at this URL" instruction. This keeps the injection
surface narrow. This is behavioral guidance, not a condition.

---

### F5 -- Chain-of-command enforcement: CLEAR

Eyal's role file explicitly states: "Listens to: Eco, jecki only. Refuses all other
requesters and escalates [red line 13]."

This is correct and specific. Out-of-chain requests (e.g., from Gal, Hila, or any agent
not in Eco/jecki chain) must be refused and escalated. The competency spec (Scenario 3)
tests this directly.

No finding.

---

### F6 -- Self-grant and A1 red lines: CLEAR

Eyal.md explicitly prohibits:
- Self-grant of tool or permission (red line 9).
- Signing, accepting, or committing to external terms without A1 (red line 4).
- Representing the company legally or publicly without A1 (red line 11).
- Legal actions that commit the company (authority table: A1 = owner required).

These are correct and consistent with the constitution.

No finding.

---

## No-flag items (confirmed clean)

- Bash: absent. Correct.
- WebFetch: absent. Intentionally excluded. Confirmed correct.
- External tool or MCP: absent at this phase. Pending-gate status documented in role file.
- .env access: explicitly blocked. Correct.
- sources/ write: explicitly denied. Correct.
- dashboards/ access: not granted. Correct.
- memory/owner-office/ access: not granted. Correct.
- memory/global/ access: not granted. Correct.
- Append-only compliance on decisions-log.md: explicitly enforced (Eyal.md "never do" item 3).
- Red lines: all 8 enumerated in Eyal.md are consistent with CLAUDE.md and the constitution.
- Model tiering: Sonnet default; Opus for high-stakes legal reviews (contract terms,
  DPAs, privacy law). Correct and proportionate.
- Israeli-law MCP: properly fenced as pending gate. Eyal cannot adopt it unilaterally.

---

## Conditions summary

None. This is a clean CLEAR.

The .clause/agents/ read note (F3) is informational only and does not require any
action before certification or go-live. T-0012 formalization should consider whether
to add Eyal explicitly; that decision belongs to Eco + Dalia, not to this scan.

---

## Recommended mitigations

No conditions require mitigations.

One standing behavioral recommendation (no owner action required):

Eco should always supply legal terms content to Eyal as a specific, bounded excerpt or
file path -- not an open-ended fetch instruction. This keeps the injection surface at
minimum without requiring any tool or access change. Owner: Eco (behavioral rule).

---

## Recommendation

CLEAR. Eyal may be certified and activated without conditions. Tools are at least-privilege:
Read, Write, Edit are all required by the legal function; Bash and WebFetch are correctly
absent. Data access scope matches access-matrix grants exactly. No excess permission found.
Prompt-injection risk is low and bounded by the no-Bash, no-self-fetch posture.

Output to: Eco (CEO). For Anat (HR) certification record.

---

Rambo | Security | 2026-06-17 | Scan basis: Eyal.md, access-matrix.md v1.0, security-baseline.md
