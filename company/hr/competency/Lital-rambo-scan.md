# Rambo B5 Permission Scan: Lital (CFO / Finance, L3)

Scan date: 2026-06-17
Tasked by: Eco (CEO), step B5 agent-hiring.md
Basis: Lital.md v1.0 (2026-06-14), access-matrix.md v1.0, security-baseline.md

---

## Verdict: CLEAR-WITH-CONDITIONS

Two conditions. Neither blocks certification. Both must be resolved before go-live.

---

## Findings

### F1 -- Tools (Read, Write, Edit): CLEAR

Read, Write, Edit are appropriate for Lital's function.

- Read: required to review cost data, compliance-backlog.md, gate-register.md, usage
  data sources, and all reference governance files.
- Write: required to author usage reports, update compliance-backlog.md, and write
  financial view rows to dashboards/.
- Edit: required for in-place updates to dashboards/ financial rows and
  compliance-backlog.md status entries.
- No Bash: correct. Lital has no execution, shell, or code-run function. Bash is
  absent and must remain absent.
- No WebFetch: correct. Lital does not fetch external URLs or external data sources
  directly.
- No external MCP tool: correct. Israeli-finance MCP and GreenInvoice are both
  deferred to the Security + Legal gate. Not adopted.

No excess permission in the tools line.

### F2 -- dashboards/ access: CLEAR WITH SCOPE NOTE

Lital.md grants Lital read/write access to dashboards/ for financial views only.
The access matrix confirms: dashboards/ is restricted; Lital (CFO) has write access
(financial views); jecki has read; Assaf (OE) has write for OE templates.

Scope boundary is explicit in Lital.md: "Write financial view rows; read-only for
operational views (Assaf owns those)." This is correctly bounded least privilege.

Shelly surfacing dashboards/ to owner: Lital.md notes this is authorized by
constitution §12 but Shelly's read grant is not yet reflected in the access matrix.
This is a known gap (same as Assaf pattern; T-0012 pending). Risk to Lital's own
permission scope: none. Shelly's gap does not expand Lital's authority.

No excess permission in dashboards/ access. Shelly matrix gap is noted for T-0012;
not a Lital finding.

### F3 -- compliance-backlog.md write: CONDITIONAL CLEAR

Lital.md grants Lital read/write to company/governance/compliance-backlog.md jointly
with Eyal (Legal), per constitution §13.

The access matrix does not yet explicitly list Lital as a writer to
compliance-backlog.md. Lital.md acknowledges this gap inline: "access-matrix write
grant not yet reflected in matrix -- constitution §13 is authoritative; matrix update
pending, Dalia/Rambo, A2, T-0012."

Finding: the write access is legitimately authorized at the constitution level (§13),
which is A1 (owner). The gap is documentation, not authorization. Risk is low.

Condition C1: T-0012 scope must include Lital's compliance-backlog.md write grant
and the Shelly dashboards/ read grant. Matrix update must be executed before Lital
writes to compliance-backlog.md operationally.

### F4 -- Data access scope: CLEAR

Full data access list per Lital.md:

- Read/Write: compliance-backlog.md -- justified (joint owner with Eyal, §13).
- Read: constitution.md, roster.md, access-matrix.md, gate-register.md -- read-only,
  justified for governance and compliance context.
- Read/Write: dashboards/ -- justified, financial views only (see F2).
- Read: memory/board.md, memory/log.md; Write: memory/log.md (own entries only) --
  standard company-shared access. Correct.
- Append: company/decisions/decisions-log.md -- financial and compliance decisions
  only, append-only. Correct.
- Read: memory/wiki/ (finance and compliance context, need-to-know) -- justified.
- No access: .env, sources/, projects/, marketing/, memory/owner-office/,
  .claude/agents/ -- correct. All deny-listed paths are explicitly excluded in
  Lital.md.

No excess-scope finding in data access. All paths justified by role function.

### F5 -- Prompt-injection surface: LOW RISK, NO FLAG

Lital's inputs are internal files: usage data files, compliance-backlog.md, board.md,
log.md, dashboards/ data, and task envelopes from Eco/jecki. She does not ingest
external URLs, external repos, or third-party raw content.

Risk surface: Lital reads token/cost data that originates from Claude session logs.
An adversarial injection in a session log could attempt to influence a cost report.
However, Lital holds no Bash or execution tool; an injected instruction could only
cause Lital to write incorrect financial data -- not execute code or exfiltrate secrets.

Mitigation: Lital's soul block includes VERIFY-THEN-CLAIM and NO FALSE COMPLETION
constraints. Any injected instruction to fabricate a cost figure or compliance status
would violate explicit soul rules. Blast radius is limited to document content only.

Residual risk: low. No flag issued.

### F6 -- Spend authority: CLEAR

Lital.md is explicit: budget = 0; all spend = A1; cannot authorize any expense.
This is the correct constraint for a pure reporting/tracking CFO role at P1.
No excess authority in the spend dimension.

GreenInvoice and Israeli-finance MCP are both deferred to the Security + Legal gate.
Neither is active. Lital.md instructs Lital to flag readiness to Eco >= 30 days
before first paid customer. This is correct gate discipline.

### F7 -- Chain of command and scope: CLEAR

Lital is tasked by Eco and jecki only. Lateral command is explicitly refused per
soul block rule 7. Loop caps are defined for Eyal and Assaf disagreements (2 rounds
-> Eco). No excess authority to approve, block, or act on spend from any agent.
Flag-and-escalate pattern is correct.

---

## Conditions summary

| # | Condition | Owner | Blocking cert? |
|---|-----------|-------|----------------|
| C1 | T-0012 must be amended to include Lital compliance-backlog.md write grant and Shelly dashboards/ read grant; matrix update must execute before Lital writes compliance-backlog.md operationally | Dalia + Eco + jecki | NO -- does not block cert; blocks operational use of compliance-backlog.md write |
| C2 | Before first GreenInvoice gate review: Eco confirms gate-register entry is current and Lital's 30-day flag trigger is documented in Eco triggers | Eco | NO -- does not block cert; must be in place before first paid customer is imminent |

---

## Recommended mitigations

### C1 -- compliance-backlog.md and Shelly dashboards/ matrix gap

Finding: Lital's write access to compliance-backlog.md is authorized by constitution
§13 but not yet recorded in access-matrix.md. Shelly's dashboards/ read is authorized
by constitution §12 but also not recorded.

Risk: if T-0012 runs without including these two items, both remain undocumented
indefinitely. An auditor reading only the matrix would see no basis for the write.

Interim: Eco to verify that T-0012 board row scope explicitly names both Lital
compliance-backlog.md write and Shelly dashboards/ read before Lital is activated.
If missing, add them to the board row description (Eco A3 on own task rows).
Owner: Eco.

Permanent: T-0012 execution produces a single A2 matrix update (Dalia structure,
Rambo security review) that formalizes all outstanding exceptions including these two.
Logged in decisions-log.md. Both gaps close durably.
Owner: Dalia (executes) + Eco (A2 approval) + jecki (notified per A2 process).

### C2 -- GreenInvoice gate trigger documentation

Finding: Lital.md specifies a 30-day advance flag trigger before first paid customer,
but this trigger is not yet documented in Eco's trigger list or any standing workflow.

Risk: if the first paid customer arrives without the trigger being in Eco's active
triggers, the gate review for GreenInvoice could be missed or late.

Interim: Eco to add a trigger to its active context: "When Lital flags GreenInvoice
readiness: open gate review immediately; timeline must reach Eco >= 30 days before
first invoice." Owner: Eco.

Permanent: at P1-to-P2 transition planning, Eco and Lital jointly confirm the
GreenInvoice gate-register entry is active and the 30-day trigger is in the
scheduled-trigger list. No code required; a policy note in Eco's R&R is sufficient.
Owner: Eco + Lital.

### Mitigation summary table

| Risk | Interim owner | Interim action | Permanent owner | Permanent action |
|------|--------------|----------------|----------------|-----------------|
| C1 matrix gap (compliance-backlog.md + Shelly dashboards/) | Eco | Verify T-0012 board row includes both items before Lital activation | Dalia + Eco + jecki | T-0012 A2 matrix update; log in decisions-log.md |
| C2 GreenInvoice trigger gap | Eco | Add GreenInvoice 30-day flag trigger to Eco active context/triggers | Eco + Lital | Confirm at P1-to-P2 planning; add to Eco R&R trigger list |

---

## No-flag items (confirmed clean)

- Bash: absent. Correct.
- WebFetch: absent. Correct.
- External MCP tool: absent (GreenInvoice and Israeli-finance MCP deferred to gate). Correct.
- .env access: explicitly denied. Correct.
- sources/ write: explicitly denied. Correct.
- projects/ access: explicitly denied. Correct.
- marketing/ access: explicitly denied. Correct.
- memory/owner-office/ access: explicitly denied. Correct.
- .claude/agents/ access: explicitly denied. Correct.
- Spend authority: explicitly zeroed (budget = 0; all spend = A1). Correct.
- dashboards/ scope: financial views only; operational views read-only (Assaf owns
  operational writes). Correctly bounded.
- Chain-of-command constraints: present and specific (Eco, jecki; coordinates with
  Eyal and Assaf; refuses tasks from outside chain).
- Red lines: all explicitly enumerated in Lital.md and consistent with CLAUDE.md and
  constitution.

---

## Recommendation

CLEAR-WITH-CONDITIONS. Lital may be certified. Conditions C1 and C2 do not block
certification. C1 must be resolved before Lital writes to compliance-backlog.md
operationally (add to T-0012 scope before activation). C2 must be in place before
first paid customer is imminent. No excess permissions, no Bash, no high-injection
surface, no spend authority creep.

Output to: Eco (CEO). For Anat (HR) certification record.

---

Rambo | Security | 2026-06-17 | Scan basis: Lital.md v1.0, access-matrix.md v1.0, security-baseline.md
