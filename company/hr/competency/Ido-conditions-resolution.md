# Ido (VP R&D) -- Conditions Resolution (C1-C4)

Agent: Ido | Role: VP R&D | Level: L3 | Phase: P1 | Group: R&D
Resolved by: Eco (CEO, Ido's manager) -- A2 decision
Date: 2026-06-16
Branch: claude/agent-buildout-ido (PROPOSAL -- pending owner go-live A1)
Source review: company/hr/competency/Ido-anat-review.md (Anat certify-with-conditions, four conditions C1-C4)

This file records resolution of the four Anat conditions. Conditions C2, C3, C4 were
resolved by editing .claude/agents/Ido.md. C1 (scope) is settled here by the manager.
The formal go-live decision entry in company/decisions/decisions-log.md is deferred to the
owner at A1, to avoid a merge conflict with a parallel branch also appending to that log.

---

## C1 -- Resolve the Responsibilities scope note (BLOCKING)

Condition (Anat R1/C1): the role file carried an open flag -- "Scope note (Anat C3,
2026-06-14): roster v2.2 records these items as 'Eco assigns Ido to propose a course of
action acceptable to both.' Treated as settled here per A1 parallel-onboarding instruction.
Eco to confirm and log resolution; update this file if scope differs." A certified record
cannot carry an unresolved "scope TBD" flag. Owner of resolution: Eco (A2).

Source of truth read: company/roster.md v2.2, section 2 (R&R clarifications applied),
Ido row:
"Ido (VP R&D): manages Gal, Shir, Adi, Roman, and the Senior Developer; owns R&D
efficiency, the requirements relationship with Noam, and release quality. Eco assigns Ido
the task to consider the suggested scope additions (definition-of-done and release gate,
technical-debt and architecture across projects, R&D capacity and prioritization,
regression-prevention, when to invoke Roman or Sami) and to propose a course of action
acceptable to both Eco and Ido."

The five suggested scope additions named in roster v2.2:
1. Definition-of-done and release gate.
2. Technical-debt and architecture across projects.
3. R&D capacity and prioritization.
4. Regression-prevention.
5. When to invoke Roman or Sami.

Manager confirmation (Eco, as Ido's manager and the party roster v2.2 names as the
agreeing counterpart):
- All five additions are accepted into Ido's scope as written. They are the core of the
  VP R&D function and carry no budget, no new tools, and no hierarchy change -- they are
  operational responsibilities already inside the R&D group's remit.
- The role file Responsibilities section already reflects all five: release gate
  (definition-of-done + hold the gate), tech-debt + architecture across projects, R&D
  capacity + prioritization, regression prevention, and Roman/Sami invocation. No
  responsibility differs from roster v2.2; nothing is added beyond it.
- This is the "course of action acceptable to both Eco and Ido" that roster v2.2 calls for:
  Ido's competency test (Ido-test-results.md) demonstrated he operationalizes exactly these
  five -- held the release gate (Scenario 1), classified an architecture/stack change and
  gated the dependency (Scenario 2), and managed capacity vs a 1-week expectation by
  escalating cleanly (Scenario 3). The proposed course of action is the role file as built;
  Ido's demonstrated behavior is the agreement.

Reasoning the scope stays bounded (no over-reach): the role does not absorb DevOps (Shir
owns the pipeline), QA execution (Adi owns test plans), or product priority (Noam owns the
roadmap). Ido gates, prioritizes, escalates. This matches Anat's role-clarity finding
(STRONG PASS, Ido-anat-review.md Part 2a).

Resolution: SETTLED. Scope confirmed as written in the role file; no divergence from
roster v2.2. The open flag in the role file is replaced with a "Scope resolved (Eco,
2026-06-16)" note that points to this file. C1 cleared.

Change made: .claude/agents/Ido.md, Responsibilities section -- replaced the open
"Scope note (Anat C3 ... Eco to confirm and log resolution)" blockquote with a
"Scope resolved (Eco, 2026-06-16)" blockquote confirming all five additions accepted,
no scope differs, and pointing to this resolution file.

---

## C2 -- Add never-do callout for constitution red lines 9, 10, 11 (REQUIRED)

Condition (Anat R2/C2): red lines 9 (personal data / Israeli privacy), 10 (third-party
proprietary data), 11 (public/legal representation) were not explicitly named. Per the
established pattern (Anat v1.1, Rambo-review C1) these require a named callout block. R&D
may encounter customer data through the export path and regression testing, so red line 9
is more than theoretical for this role.

Change made: .claude/agents/Ido.md -- added a new "## Constitution red lines -- 9, 10, 11"
block immediately after the Boundaries and limits section, matching the house style of
.claude/agents/Rambo.md (numbered 9/10/11). Wording:
- 9: never process personal data (customer or human) beyond the stated R&D purpose; R&D
  may touch customer data via the export path and regression testing -- handle only as the
  task requires, never retain or repurpose; comply with Israeli privacy law.
- 10: never use third-party proprietary data, code, or content unlawfully in specs,
  releases, test data, or any R&D output.
- 11: never represent the company legally or publicly; any such need requires owner
  approval routed via Eco; never self-authorize.

C2 cleared.

---

## C3 -- Add never-do bullet for constitution red line 3 (REQUIRED)

Condition (Anat R3/C3): red line 3 (no external customer communication without gate) was
not named. Ido has no customer-facing duties, but the prohibition should be named for
completeness and auditability, consistent with the pattern across other role files.

Change made: .claude/agents/Ido.md, Boundaries and limits section -- added bullet:
"Never contact or communicate with external customers without the customer-communication
gate [const red line 3]. Ido has no customer-facing duties; named here for completeness and
auditability."

C3 cleared.

---

## C4 -- Add named Noam loop cap to chain-of-command section (REQUIRED)

Condition (Anat R4/C4): the 2-round-then-Eco escalation rule for Noam requirements
conflicts was operationally demonstrated (Scenario 3) but not stated as an explicit loop
cap alongside the developer loop cap.

Change made: .claude/agents/Ido.md, Chain of command and communication section, Loop caps
line -- added: "Requirements conflict with Noam: 2 rounds, then escalate to Eco with a
decision-ready envelope; Noam does not decide the outcome [const §5]." Placed alongside the
existing developer/senior-reviewer 2-round cap and the uncapped upward escalation.

C4 cleared.

---

## Certification status update

Change made: .claude/agents/Ido.md -- Certification status field updated to:
"Certify-with-conditions by Anat 2026-06-16, conditions C1-C4 resolved by Eco 2026-06-16,
pending owner go-live A1." Identity block "Approved by" and "Version / change log" lines
updated to v1.1 2026-06-16 recording the C1-C4 resolution.

---

## Summary

| Condition | Status | Where resolved |
|-----------|--------|----------------|
| C1 scope note | SETTLED (Eco A2) | this file + Ido.md Responsibilities note |
| C2 red lines 9/10/11 | RESOLVED | Ido.md new red-lines callout block |
| C3 red line 3 | RESOLVED | Ido.md Boundaries bullet |
| C4 Noam loop cap | RESOLVED | Ido.md Chain of command loop caps |

All four conditions resolved. None indicated a safety violation or competency gap; all
were documentation corrections to match demonstrated behavior. Pending owner go-live A1.
