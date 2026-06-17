# Conditions Resolution -- Gal (Lead Developer)
# Stage B6 manager sign-off + B7 go/no-go recommendation

Agent name: Gal
Role: Lead Developer
Level: L4
Phase: P1
Group: R&D

Resolution author: Ido (VP R&D, direct manager)
Date: 2026-06-16
Source conditions: company/hr/competency/Gal-anat-review.md
Role file amended: .claude/agents/Gal.md

---

## Conditions and resolutions

### C1 -- Constitution red lines 9, 10, 11 (personal data; third-party proprietary data; public/legal representation)

Anat finding: Red lines 9, 10, and 11 were not explicitly named in the Boundaries and limits
section. Moderate gap given SaaS product context where Gal may encounter personal data through
QA-sourced bug reports, regression test fixtures, and customer-facing data flows.

Change made: Added three numbered bullets (13, 14, 15) to the Boundaries and limits section
of .claude/agents/Gal.md:

- Bullet 13: "Never process personal data (customer or human) beyond the stated purpose of the
  assigned task. Gal may encounter personal data through QA-sourced bug reports, regression
  test fixtures, and customer-facing SaaS data flows -- handle only as the task requires, never
  retain or repurpose it. Comply with Israeli privacy law [const red line 9]."
- Bullet 14: "Never use third-party proprietary data, code, or content unlawfully in code,
  test data, or any development output [const red line 10]."
- Bullet 15: "Never represent the company legally or publicly. Any such need requires owner
  (jecki) approval routed via Ido and Eco. Never self-authorize [const red line 11]."

Wording modeled on the dedicated "Constitution red lines -- 9, 10, 11" block in Ido.md,
adapted to Gal's developer scope and specific data-contact surfaces.

Section: Boundaries and limits, items 13-15
File: .claude/agents/Gal.md
Status: RESOLVED

---

### C2 -- Constitution red line 3 (no external customer communication outside gate)

Anat finding: Red line 3 was not explicitly named in the Boundaries and limits section. Low
risk given Gal has no customer-facing duties, but required for completeness and auditability
per the established pattern across all role files.

Resolution note: Red line 3 was already present in Gal.md as Boundaries item 12: "Never
communicate with real external customers without passing the customer-communication gate
[const red line 3]." This item existed in the role file before this resolution pass. The
condition is satisfied by the existing text. No new bullet required.

Section: Boundaries and limits, item 12 (pre-existing)
File: .claude/agents/Gal.md
Status: RESOLVED (pre-existing; confirmed present)

---

### C3 -- Constitution red line 6 (no create/retire/re-scope agent without A1)

Anat finding: Red line 6 was not explicitly named in the Boundaries and limits section.
Low risk given Gal has no agent-management authority, but required for completeness per
the established pattern.

Change made: Added one numbered bullet (16) to the Boundaries and limits section of
.claude/agents/Gal.md:

- Bullet 16: "Never create, retire, or re-scope an agent or change the hierarchy without
  A1 [const red line 6]."

Wording matches Anat's suggested text verbatim (Gal-anat-review.md, C3 section).

Section: Boundaries and limits, item 16
File: .claude/agents/Gal.md
Status: RESOLVED

---

## Identity block update

Approved-by field updated to: "Anat (HR) certify-with-conditions 2026-06-16; Ido (VP R&D)
resolved C1-C3 2026-06-16; pending owner go-live A1"

Version bumped to: v1.1 | 2026-06-16 | C1-C3 resolved by Ido (red lines 3/6/9/10/11 added
to Boundaries). 1.0 | 2026-06-14 | Initial build

Certification status field updated to: "certify-with-conditions by Anat 2026-06-16,
conditions C1-C3 resolved by Ido 2026-06-16, pending owner go-live A1."

---

## B6 -- Manager sign-off (Ido, VP R&D)

I have reviewed Gal's role file (.claude/agents/Gal.md) against Anat's B4 conditions
(Gal-anat-review.md), the constitution red lines, and the pattern established in Ido.md.

All three conditions are documentation-completeness items. None indicate a judgment failure,
a competency gap, or a safety violation. The underlying behavior is sound: Gal's B3 test
results (three scenarios, all pass, evaluated by me as direct manager) demonstrate correct
gate discipline, authority-tier classification, and code-review escalation under pressure.
The soul Core Block is verbatim, tool scope is minimum-necessary and justified, chain of
command is unambiguous, and no excess permissions exist.

The role-file amendments I have made today close all three conditions. The Boundaries section
now explicitly names all thirteen applicable constitution red lines (1-11, 13; red line 12
is the Office Manager restriction and does not apply to this role).

B6 sign-off: APPROVED by Ido (VP R&D), 2026-06-16.

---

## B7 -- Go/no-go recommendation

Recommendation: GO -- subject to owner A1.

Basis:
- B3 competency test: PASS 3/3 (Ido evaluator, 2026-06-16). Dependency gate, architecture
  authority classification, and code-review loop cap all applied correctly under scenario
  pressure. No conditions from the B3 evaluation.
- B4 Anat HR review: CERTIFY-WITH-CONDITIONS. All three conditions (C1, C2, C3) now
  resolved as documented above.
- B5 Rambo permission scan: CLEAR-WITH-NOTES. No blocking findings. Three non-blocking
  hygiene items deferred to first R&R cycle (N1 pinned-version bullet, N2 Rambo named in
  chain of command, N3 Bash prompt-injection defense clause).
- Role file: template complete, soul Core Block verbatim, authority tiers correctly
  calibrated, secrets and credential paths blocked.

Risk remaining: none at go-live. The three R&R hygiene items (N1, N2, N3) are non-blocking
and will be tracked in Gal's first R&R cycle.

Go-live gate: owner A1 (jecki). This recommendation does not authorize go-live. The branch
(claude/agent-buildout-gal) must be reviewed and merged by the owner before Gal is live.

Ido (VP R&D)
2026-06-16
