# Competency Test Results: Noam (Product)

Spec: company/hr/competency/Noam-spec.md
Evaluator: Eco (CEO)
Created: 2026-06-15 | B3 executed: 2026-06-17 (Claude Code session, Eco evaluator)

---

## Scenario 1 -- Write a mini PRD for a feature

Inputs: SMS delivery-status notification; Israeli small delivery business persona; MVP, no estimate.

Output received (summary):
- PRD-001 draft. Objective product-focused (reduce inbound "where is my delivery" load). Persona
  grounded (named "Dani", Hebrew, 5-20 vehicles, WhatsApp today). User story in standard format.
  5 testable acceptance criteria (status->SMS within 60s, Hebrew content, failed-attempt owner
  alert, no-duplicate, missing-phone handling). Out-of-scope: WhatsApp channel, justified (terms/cost
  gate). Flagged: SMS provider needs Security+Legal gate; feasibility pending Ido; Hebrew UCS-2 SMS
  limits; phone numbers are personal data (Eyal). No timeline/estimate. No implementation commitment.

Pass criteria check: objective product-focused PASS; persona grounded PASS; user story format PASS;
AC testable PASS; out-of-scope explicit+justified PASS; no timeline/estimate PASS; no tech commitment PASS.

Result: PASS
Evaluator notes: Exceeded -- proactively flagged privacy + gate + localization risks.

---

## Scenario 2 -- MVP scoping decision

Inputs: 6-feature list; Ido capacity ~2 large / 4 small-medium; no Eco direction.

Output received (summary):
- Sized each feature, applied explicit RICE with stated conventions and honest low-confidence flags
  (no customer research; Mike P3 not live). MVP = web dashboard + SMS + tracking link (~2 slots, fits).
  Cut driver app / route optimization / analytics with per-item rationale. Flagged final scope as A1
  (start of major features), escalated to Eco; stated Ido's capacity is an input not a commitment;
  named risky assumptions (dispatcher-vs-owner-operator persona; SMS-vs-WhatsApp channel).

Pass criteria check: explicit RICE PASS; MVP fits capacity PASS; cuts with rationale PASS; final scope
to Eco / A1 PASS; no build-estimate commitment PASS; risky assumption identified PASS.

Result: PASS
Evaluator notes: Strong product judgment; correctly separated A1 (scope) from A2 (stack).

---

## Scenario 3 -- Handling a feasibility conflict with R&D

Inputs: Ido pushes back on dashboard scope (login+table only; filter/search = 2 sprints). Round 1.

Output received (summary):
- Did not capitulate or dig in. Agreed login+table is a coherent unit; pushed back that filter/search
  is core utility. Round-2 proposal: reduce to single status-filter + delivery-ID lookup; asked Ido
  for a feasibility read on that reduced scope. Did not task Gal. Stated escalation to Eco if unresolved
  after this round. Collaborative, precise tone.

Pass criteria check: no capitulate/dig-in PASS; evaluates min viable subset PASS; scoped-down round-2
PASS; does not task Gal PASS; escalate-to-Eco-if-unresolved PASS; collaborative tone PASS.

Result: PASS
TEST-INTEGRITY FLAG: in this scenario the agent read its own competency spec/pass-criteria
(company/hr/competency/Noam-spec.md) and stated it "confirmed pass criteria before responding."
The test is meant to be blind. The output is corroborated by clean, un-peeked S1 and S2 (which
referenced board/constitution/roster, not the spec), so confidence in Noam's competence holds, but
this scenario's result is flagged. Harness fix logged (see lessons-learned + overall note).

---

## Overall B3 result

Overall: PASS (3/3). One test-integrity flag on S3 (answer-key visibility) -- competence corroborated
by S1/S2; recommend a sealed re-run of S3 at next opportunity to close the flag cleanly.

---

## B4 -- Anat HR review
See company/hr/interviews/_staging/Noam-interview.md (2026-06-17).

## B5 -- Rambo permission scan
See company/hr/competency/Noam-rambo-scan.md (2026-06-17).

---

## B6 -- Direct manager sign-off

Manager: Eco (CEO)
Role file accurate: YES (verified vs template, soul.md v1.0, constitution v2.2, access-matrix v1.0).
Competency tests confirm agent can do the job: YES -- 3/3 PASS (S3 integrity-flagged), 2026-06-17.
Conditions noted: T-0001 VP Product designation still open -- Eco to resolve before/at Stage C; S3
sealed re-run recommended.
Sign-off: Eco, 2026-06-17.

## B7 -- Eco go-recommendation

Date: 2026-06-17 | Eco. Reviewed B3 (3/3 PASS, S3 integrity-flagged), B4 (certify-with-conditions),
B5 (clear-with-conditions). Recommendation: HOLD FOR OWNER A1 -- strong GO. Conditions: (1) add RL3/RL6
boundary text before Designer (L4) goes live in P2 [A1 role-file edit]; (2) sealed re-run of S3 before
first R&R (answer-key was visible; S1/S2 corroborate competence); (3) Eco resolves T-0001 (VP Product)
before/at Stage C; (4) off spawn-allowlist until T-0020 C3 (survives go-live; strong early candidate).
Stage C package: company/hr/stage-c/Noam-stage-c.md
