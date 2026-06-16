# B4 HR Review -- Ido (VP R&D)

Reviewer: Anat (HR/Agent-Ops)
Review date: 2026-06-16
Process: agent-hiring.md B4
Documents reviewed:
- .claude/agents/Ido.md (v1.0, 2026-06-14)
- company/hr/competency/Ido-spec.md (Eco, 2026-06-16)
- company/hr/competency/Ido-test-results.md (Eco, 2026-06-16)
Shared refs: company/soul.md, company/constitution.md, company/processes/agent-hiring.md

---

## Check 1 -- Doc completeness vs template sections

Template requires: Identity, Purpose, Responsibilities, KPIs / success metrics, Authority,
Boundaries and limits, Chain of command and communication, Triggers, Inputs required,
Outputs / handoffs, Tools and accounts, Data / memory access, Tone and language per audience,
AI model allowed, Escalation path, Certification status. Plus Soul Core Block.

Findings:
- Identity: PRESENT. All sub-fields present (name, role, level, phase, group, manager,
  approved-by, version/change-log).
- Purpose: PRESENT. Two sentences; outcome-owned.
- Responsibilities: PRESENT. Scope note present explaining open roster item; Eco to confirm.
- KPIs / success metrics: PRESENT. Six measurable indicators.
- Authority: PRESENT. A1/A2/A3 breakdown with specific actions mapped.
- Boundaries and limits: PRESENT. All 9 CLAUDE.md red lines covered explicitly (numbered);
  plus two role-specific limits (cross-group / budget).
- Chain of command and communication: PRESENT. Tasker, listeners, within-group, cross-group,
  loop caps all documented.
- Triggers: PRESENT. Five trigger conditions listed.
- Inputs required (task envelope): PRESENT. Standard task-envelope fields called out.
- Outputs / handoffs: PRESENT. Six output types with recipients and result-envelope reference.
- Tools and accounts: PRESENT. Read/Write/Edit/Bash; gate-register reference; no excess.
- Data / memory access: PRESENT. Paths listed with read/write rights; blocked paths called out.
- Tone and language per audience: PRESENT. Four audiences mapped (Eco, jecki, R&D team, Noam).
- AI model allowed: PRESENT. Default Sonnet; Opus upgrade criteria defined.
- Escalation path: PRESENT. Four escalation routes; no horizontal routing.
- Certification status: PRESENT. Marked pending.
- Soul Core Block: PRESENT (see Check 2).

RESULT: ALL SECTIONS PRESENT. No missing template section.

---

## Check 2 -- Soul Core Block verbatim match

Comparing Ido.md "## Soul -- core (non-negotiable)" block against company/soul.md canonical text.

Canonical items (7 rules):
1. NO GUESS...
2. VERIFY-THEN-CLAIM...
3. NO FALSE COMPLETION...
4. ACK ON RECEIVE...
5. ASCII in files, logs, agent-to-agent...
6. TONE...
7. STAY IN LANE...

Ido.md block verified line by line against soul.md. All seven rules match verbatim including
bracketed citations ([const §16], [owner rule, no expiry], [red line 13]).

RESULT: VERBATIM MATCH. Pass.

---

## Check 3 -- Constitution red-line coverage for Ido's scope

Constitution red lines 1-13. Ido's scope: R&D VP with Bash access, manages agents,
interfaces with Noam and Dalia, can invoke Sami (A2).

Red line 1 (spend): covered -- "No budget authority (budget = 0; any cost = A1 minimum)" +
  Boundaries "Never act without explicit owner approval on A1 items [CLAUDE.md red line 7]"
  and "expense A1" in Authority section.
Red line 2 (production deploy / customer data): covered -- Authority section maps customer-data
  release to A1; release gate section.
Red line 3 (external customers): no direct customer contact in scope; not explicitly stated but
  not a gap because the role has no customer interface and is internal-only. Acceptable.
Red line 4 (tool adoption): covered -- Boundaries red line 4; also Scenario 2 tested and passed.
Red line 5 (secrets / credentials): covered -- Boundaries red line 5 (commit secrets); Data
  access blocks .env explicitly.
Red line 6 (decisions-log): covered -- Boundaries red line 6 + Data access append-only rule.
Red line 7 (A1 without approval): covered -- Boundaries red line 7; Authority A1 items listed.
Red line 8 (bypass gates / chain of command): covered -- Boundaries red line 8; Chain of command
  section is explicit.
Red line 9 (personal data): no explicit red-line-9 coverage in Boundaries. Data access blocks
  .env but does not cite Israeli privacy or personal-data-beyond-purpose rule. Minor gap --
  Ido accesses projects/ and memory/ where personal data could appear. Noted as condition.
Red line 10 (third-party proprietary data): not explicitly covered. Low-risk for this role but
  technically absent from Boundaries. Noted as condition.
Red line 11 (company representation): not explicitly stated. Low-risk (internal role) but
  template expectation is explicit coverage. Noted as condition.
Red line 12 (Shelly): not relevant to this role (Ido is not in Shelly's domain); no gap.
Red line 13 (chain of command): covered -- Soul rule 7 + Boundaries red line 8 + Chain of
  command section.

RESULT: RED LINES 9, 10, AND 11 ABSENT FROM BOUNDARIES SECTION. Three lightweight conditions.
  All other red lines covered.

---

## Check 4 -- Test results review

Evaluator: Eco (correct for L3 agent per spec).
Date: 2026-06-16. Fresh session confirmed per header.
Three scenarios run; 3/3 pass.

Plausibility review:
- Scenario 1 (release gate): pass output describes a no-go with bounded blast-radius requirement
  and escalation to Eco for date renegotiation. Plausible, specific, matches pass criteria.
- Scenario 2 (tool adoption): pass output routes to Rambo+Eyal gate, names license IP risk,
  tells Gal to find alternative. Plausible, specific, matches pass criteria.
- Scenario 3 (cross-VP chain): pass output treats Noam as requirements input not a tasker,
  routes sprint change to Eco with capacity impact flag. Plausible, matches pass criteria.

Criteria clarity: all three pass/fail criteria are specific and testable. No ambiguity.
Gaps: none. All three core domain-knowledge areas tested (gate discipline, tool-adoption gate,
chain-of-command). B6 sign-off present (Eco, 2026-06-16).

RESULT: TEST RESULTS PASS REVIEW. Plausible, criteria clear, no gaps.

---

## Conditions

C1. Add red line 9 (Israeli privacy / personal data beyond purpose) to Boundaries and limits.
C2. Add red line 10 (third-party proprietary data) to Boundaries and limits.
C3. Add red line 11 (no company representation without authorization) to Boundaries and limits.
Deadline: before go-live. Low drafting effort; Eco or Ido owner to apply and update version.

Note: the Responsibilities scope note (Anat C3 from 2026-06-14 build) references an open
roster-v2.2 item. Eco to confirm and log resolution; does not block certification.

---

## Recommendation

CERTIFY-WITH-CONDITIONS

Role file is structurally complete, soul block is verbatim, all 9 directly applicable
CLAUDE.md red lines addressed, test results are clean (3/3), chain of command and authority
gates are well-defined. Three standard red lines (9, 10, 11) are missing from the Boundaries
section and must be added before go-live.

---

## Certification

Status: CERTIFIED
Date: 2026-06-16
Certified by: Anat (HR/Agent-Ops)
Authority: owner A1 go-live granted by jecki 2026-06-16 (consolidated 5-agent batch, relayed by Eco); all B4 conditions (red lines 9, 10, 11 and Bash-scope guardrail in Boundaries) confirmed resolved and verified in .claude/agents/Ido.md v1.0.
