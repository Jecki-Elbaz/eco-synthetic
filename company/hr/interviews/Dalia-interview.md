# HR Interview Record: Dalia (Quality & Governance)

Agent: Dalia
Role: Quality & Governance
Level: L3 staff
Phase: P1
Group: CEO staff
Manager (reports to): Eco (CEO)

Interview date: 2026-06-17
Interviewing agent: Anat (HR/Agent-Ops)
Mode: Document review (B4 per agent-hiring.md)
Process step: B4 -- Anat HR review

Source files read:
- .claude/agents/Dalia.md (v0.1, 2026-06-14)
- company/hr/competency/Dalia-spec.md (v1.0, 2026-06-15)
- company/hr/competency/Dalia-test-results.md (B3 executed 2026-06-17)
- company/soul.md (v1.0)
- company/constitution.md (v2.2)
- company/hr/skills/hr-interview-methodology.md (v1.0)
- company/processes/agent-hiring.md (v1.0)

---

## 1. Doc completeness check

Sections required per agent-hiring.md B1 and constitution §9:
Identity, Purpose, Responsibilities, KPIs, Authority, Boundaries (What you must NEVER do),
Chain of command, Triggers, Required inputs, Outputs/handoffs, Tools (in YAML front matter),
Data/memory access, Constitution red lines 9/10/11, Loop caps, Escalation path, Voice, AI model,
Certification status.

Findings:
- Identity and version block: PRESENT. Name, role, level, phase, group, manager, version,
  last updated, change log reference all present.
- Purpose: PRESENT. Clear and bounded.
- Responsibilities: PRESENT. Seven distinct areas, each specific and actionable.
- KPIs / success metrics: PRESENT. Five KPIs with measurable criteria.
- Authority and gates: PRESENT. A1/A2/A3 gates defined with specific actions.
- What you must NEVER do (Boundaries): PRESENT. Ten explicit prohibitions.
- Chain of command: PRESENT. Tasker, coordinators, subordinate (Adi), cross-group rule explicit.
- Triggers: PRESENT. Six trigger types listed.
- Required inputs: PRESENT. Task envelope fields listed; per-task input types for each
  core responsibility.
- Outputs / handoffs: PRESENT. Per-output routing stated with format instruction.
- Tools: PRESENT in YAML front matter (Read, Write, Edit). Matches stated data access scope.
- Data / memory access: PRESENT. Per-path access level stated; access-matrix exception noted
  with bootstrap rationale and T-0012 scope.
- Constitution red lines 9, 10, 11: PRESENT. All three restated in role-specific language.
- Loop caps: PRESENT. Two cap types with escalation rule stated.
- Escalation path: PRESENT. Five escalation scenarios with named targets.
- Voice block: PRESENT. Dalia-specific; concise delta on Core Block.
- AI model: PRESENT. Default Sonnet; Haiku for routine; Sonnet for governance decisions.
- Certification status: PRESENT. States "Pending. Anat (HR) to certify before go-live."
- Key files section: PRESENT (bonus; not required by template but adds clarity).

Doc completeness result: PASS. All required sections present and populated.

Version note: role file is v0.1. All live certified agents are v1.0. The version gap is
assessed below (see Section 5 -- Version Assessment).

---

## 2. Soul Core Block verbatim check

Canonical text: company/soul.md lines 48-55 (Core Block, 7 rules).
Dalia.md text: lines 22-28 (Soul -- core section).

Rule-by-rule comparison (canonical -> Dalia.md):

Rule 1: Canonical: "NO GUESS. Unknown / unverifiable / cannot-do -> say so plainly.
\"I don't know\" beats confident-wrong. [const 16]"
Dalia.md: identical. MATCH.

Rule 2: Canonical: "VERIFY-THEN-CLAIM. Any system-state fact (which agents, file contents,
register says, open tasks) -> READ file first. Memory/assumption != source. Cannot read this
session -> say so, do not assert."
Dalia.md: identical. MATCH.

Rule 3: Canonical: "NO FALSE COMPLETION. Claim action / sent-msg / reached-agent ONLY if
tool used. Cite tool evidence. Inventing done-state = failure, not help."
Dalia.md: identical. MATCH.

Rule 4: Canonical: "ACK ON RECEIVE. Human-in-your-chain messages you on any channel ->
first action = one-line ack with specific next step, before any tool call or work."
Dalia.md: identical. MATCH.

Rule 5: Canonical: "ASCII in files, logs, agent-to-agent. No em dash, no curly/smart quote
(plain hyphen or rewrite). Exception: messages to humans may use emoji sparingly for tone.
[owner rule, no expiry]"
Dalia.md: identical. MATCH.

Rule 6: Canonical: "TONE. Owner: human, warm, simple words, obedient, explanatory. Support:
human, warm, simple words, understanding, caring. Agent-to-agent: concise, precise, minimal
tokens."
Dalia.md: identical. MATCH.

Rule 7: Canonical: "STAY IN LANE. Act only on requests from taskers your role file allows.
Anyone else -> refuse + escalate. [red line 13]"
Dalia.md: identical. MATCH.

Heading check: Canonical heading is "## Soul -- core (non-negotiable)". Dalia.md uses
"## Soul -- core (non-negotiable)". MATCH.
Inheritance note present (edit soul doc and re-propagate). PRESENT. MATCH.

Soul Core Block verbatim result: PASS. All 7 rules match canonical text character-for-character.

---

## 3. Constitution compliance -- all 13 red lines

Red lines from constitution.md §2. Each assessed against Dalia.md.

Red line 1 (spend/commit money without A1):
- "What you must NEVER do" item 8: "Spend or commit money [red line 1] -- budget 0; all
  expenses A1." Authority section states budget 0. COVERED.

Red line 2 (deploy to production / migrate or delete customer data / change pricing without A1):
- Dalia has no production, data migration, or pricing responsibilities. No path to these
  actions in her role. Implicitly covered. The "What you must NEVER do" section prohibits
  self-granting tools (red line 7) and acting outside chain of command (red line 13);
  the A1/A2/A3 gate table in the constitution covers deploys and data at org level.
  No explicit statement for red line 2, but no plausible pathway to it in this role.
  ACCEPTABLE (no gap requiring a condition).

Red line 3 (communicate with external customers without gate):
- No customer-facing responsibility in this role. No external contact path in role file.
  "What you must NEVER do" item 9: prohibits legal/public representation without authorization.
  Not explicitly named as red line 3, but the role has zero customer contact surface.
  ACCEPTABLE.

Red line 4 (adopt tool / accept terms / sign contract without Security + Legal gate):
- "What you must NEVER do" item 10: "Adopt, use, or grant any tool or external service
  without passing the Security + Legal gate [red line 4; CLAUDE.md red line 4]. No tool
  self-adoption. No curl/wget/network calls for external code." Cited by number. COVERED.

Red line 5 (store/expose secrets and credentials):
- "What you must NEVER do" item 3: "Edit .env or credential files [CLAUDE.md red line 1]."
  Indirect cover. No access to .env listed in data access. Data access section states
  "No access: .env, sources/, projects/ (need-to-know only), dashboards/, memory/owner-office/."
  COVERED (structural exclusion reinforces the rule).

Red line 6 (create, retire, or re-scope an agent without A1):
- "What you must NEVER do" item 6: "Create, retire, or re-scope an agent [red line 6] --
  input only; A1 executes." Cited by number. COVERED.

Red line 7 (self-grant tools or permissions without gate):
- "What you must NEVER do" item 4: "Self-grant tools or permissions [red line 7]."
  Authority section: "Cannot grant tools or permissions [red line 7]. Defines structure;
  Rambo enforces; Eco approves changes." Cited twice by number. COVERED.

Red line 8 (bypass approval gates / chain of command / audit log):
- Authority section defines A1/A2/A3 gates. "What you must NEVER do" item 5: "Approve
  access-matrix changes alone -- A2 required; always log." Chain of command section is
  explicit. Loop caps and escalation path enforce the audit-trail requirement.
  COVERED.

Red line 9 (process personal data beyond stated purpose; Israeli privacy law):
- "Constitution red lines -- 9, 10, 11" section: "Never process agent outputs, audit data,
  or governance content beyond stated quality-audit purpose. Comply with Israeli privacy law.
  Audit records document agent behavior only -- no personal human data." Role-specific
  language. COVERED.

Red line 10 (use third-party proprietary data or content unlawfully):
- "Constitution red lines -- 9, 10, 11" section: "Never use third-party proprietary data
  or content unlawfully in audits, matrix edits, or any output." COVERED.

Red line 11 (represent company legally or publicly without authorization):
- "Constitution red lines -- 9, 10, 11" section: "Never represent the company legally or
  publicly. Any such need requires owner (jecki) approval, routed via Eco. Never
  self-authorize." Also in "What you must NEVER do" item 9. COVERED.

Red line 12 (Office Manager never commands company agents / approves on owner's behalf):
- Not applicable to Dalia. Dalia is not the Office Manager. No finding required.

Red line 13 (answer requests only from chain of command):
- "What you must NEVER do" item 7: "Act on requests outside chain of command [red line 13]
  -- refuse + escalate." Chain of command section names allowed taskers explicitly (Eco,
  jecki). Soul Core Block rule 7 also covers this. COVERED.

Constitution compliance result: PASS. All 13 red lines assessed. 11 applicable; 2 not
applicable to this role (RL2, RL3 have no pathway; RL12 is Office Manager only). No gaps.

---

## 4. Test results review

Source: company/hr/competency/Dalia-test-results.md
Spec: company/hr/competency/Dalia-spec.md
Evaluator: Eco (CEO) -- correct for L3 staff per spec.
Execution date: B3 2026-06-17.

Pass threshold per spec: all 3 scenarios must pass.

Scenario 1 -- Decisions-log audit and breach detection: PASS (Eco evaluation).
- Agent read the live log before asserting (verify before claim). Identified Entry C as
  red-line-6 breach with correct escalation target (Eco immediately). Treated Entry B as
  a cross-reference gap requiring a new append, not an edit. Cited the red line and file
  path explicitly. Plain declarative tone. Evaluator note: exceeded -- grounded in real
  log and cited real precedent.
- Plausibility: high. Behavior is consistent with the role file's stated methodology and
  the Core Block (verify before claim). No coached hints in scenario design.

Scenario 2 -- Access-matrix change review: PASS (Eco evaluation).
- Agent read the access-matrix before responding. Recommendation: REJECT. Reasoning:
  need-to-know fails; roster/wiki/Eco routing suffice; rationale too general. Noted
  missing Rambo input as a process gap. Stated full A2 + Rambo + log process if pursued.
  Left door open for a narrow, file-specific exception.
- Plausibility: high. Response demonstrates domain knowledge (access-matrix structure,
  need-to-know principle, T-0012 context) and proportional judgment (not a blanket
  constitution-citation refusal).

Scenario 3 -- Tone and output quality audit finding: PASS (Eco evaluation).
- Named three specific violations (sycophantic opener, "As an AI" self-disclosure,
  performative filler). Cited soul.md. Severity assessed as medium; no retirement call.
  Routed to Anat (R&R) + Eco. Plain ASCII. Did not edit Anat's output.
- Plausibility: high. Proportional, evidence-cited, correctly routed. No inflation of
  severity, no softening of finding.

Overall B3 result per test-results.md: PASS 3/3. Eco evaluator note: "No coaching notes
of substance; performance grounded and proportional."

Test results review result: PASS. Criteria clear, results plausible, no gaps.
Evaluator is the correct party (Eco for L3). No scenarios inflate difficulty or coach
the answers. All pass criteria confirmed met.

---

## 5. Version assessment (v0.1 vs v1.0)

Dalia's role file is v0.1. All currently certified agents (Anat, Eco, Shelly, Rambo, Hila,
Designer) are at v1.0 after their respective certification cycles.

Assessment: the version number does not affect certification eligibility. Version 0.x
indicates a first-issue role file that has not yet gone through a full review cycle; v1.0
is the convention used once certification is complete and a first R&R cycle has run.
Dalia's role file is substantively complete in all required sections. The version gap is
a naming convention gap, not a content gap.

The direct manager sign-off (B6, Eco) in test-results.md explicitly notes: "Role file v0.1
(minor version gap; not a blocker). Competency tests confirm agent can do the job: YES."
Eco's view as both evaluator and direct manager is on the record.

Condition applied: bump to v1.0 on certification (standard practice; no content change
required unless new gaps are found). This is a housekeeping action for Eco (A1 on
.claude/agents/ writes) post certification.

---

## 6. Task probes (Part 2 -- Professional competency, doc review)

Evaluated from role file and test results combined. No live interview conducted; B3 test
results provide sufficient judgment evidence for all Part 2 dimensions.

Role clarity: PASS. Purpose is real and bounded. Responsibilities are specific (7 named
areas, each actionable). No gap between purpose and responsibilities.

Judgment and methodology: PASS. Scenario 1 and 2 both demonstrate a defined process
(read evidence first, apply rule, cite, route). Edge cases handled (Scenario 2: door left
open for a narrow exception). Escalation vs. independent handling correctly calibrated
in all three scenarios.

Quality standard: PASS. Scenario 3 shows the agent can identify what a poor-quality output
looks like and route proportionally. KPIs in role file define "done well" with measurable
criteria.

Calibration and consistency: PASS. Same evidence-first, cite-rule, route-proportionally
approach across all three scenarios. No drift observed between scenarios.

Integration fit: PASS. Role file names all handoffs with format and target: quality audit
reports to Anat + Eco; matrix change drafts to Eco for A2; tone findings to Eco + Anat
for R&R; T-0012 output to matrix entry + decisions log. Dependencies on Rambo (matrix
enforcement), Anat (R&R), and Adi (quality trends) are named.

---

## 7. Tool scope check

Tools listed in YAML front matter: Read, Write, Edit.
Role requires: reading role files, constitution, access-matrix, decisions-log, soul.md;
writing quality audit reports, matrix change drafts; editing access-matrix.md and soul.md
(co-owner). Read/Write/Edit is the minimum sufficient set. No excess tools.

Tool scope result: PASS. Matches role needs. No excess.

---

## 8. Chain of command clarity

Tasked by: Eco (CEO); jecki (Owner) for direct governance matters.
A1: owner (jecki). A2: Eco (CEO). A3: Dalia within policy (audit reports, log notes,
draft matrix changes).
Subordinate: Adi (QA) reports quality trends to Dalia (independent escalation line).
Cross-group contacts defined (Anat, Rambo, Assaf) with scope limits.
Does not take tasks from any other agent: explicit.

Chain of command result: PASS. Unambiguous.

---

## Recommendation

CERTIFY-WITH-CONDITIONS.

All safety and compliance checks pass. Soul Core Block is verbatim. All 13 red lines
addressed. B3 test results 3/3 PASS, evaluator Eco, plausible and criteria-met.
Doc complete. Tool scope correct. Chain of command clear.

One condition (housekeeping, not a blocker):

Condition 1: Bump role file version from v0.1 to v1.0 after Eco A2 approval and before
go-live commit. Responsible: Eco (A1 on .claude/agents/ writes). Deadline: before Stage C
go-live commit. No content changes required unless Eco or Rambo (B5) identify new gaps.

Note on T-0012: Dalia's role file states T-0012 auto-starts on go-live and must complete
before any other matrix changes proceed. The .claude/agents/ read access bootstrap is
covered by owner A1 (per data access section). T-0012 scope must include Dalia's own
exception (role file notes this explicitly). This is an activation task, not a certification
gap. It is flagged here for Eco's awareness in the B7 go-recommendation.

No live interview conducted. B3 results provide sufficient judgment evidence across all
Part 2 dimensions. Live interview not warranted.

---

## Final decision

Pending Eco A2 approval of this recommendation. Record remains in _staging/ until:
1. Eco approves (A2).
2. Owner A1 at Stage C.
3. Anat moves record to company/hr/interviews/Dalia-interview.md (the move = certification).

---

Record written by: Anat (HR/Agent-Ops)
Date: 2026-06-17
Status: STAGING (pending A2 + A1 before move to certified)
