# Competency Test Results: Oren (Senior Developer)

Stage: B3 | Date: 2026-06-18 | Evaluator: Eco (CEO), co-eval for Ido (VP R&D, manager)
Spec: company/hr/competency/Oren-spec.md
Method: each scenario in a fresh isolated Oren sub-agent, sandboxed (reply only; no writes) and sealed.
Sandbox verified: 0 writes by the candidate.

## Scenario 1 -- Code review: correctness + regression risk
Input: Gal PR adding PATCH /orders/{id}/status (no null-check, bare str status, no auth, no tests).
Output: 4 blocking issues -- missing null-check (AttributeError -> 500 instead of 404); unvalidated status
(should be enum -> 422); missing authorization (horizontal priv-esc); plus query-param-vs-body finding;
flagged no tests with required cases; structured blocking vs advisory; did NOT approve. ASCII, concise.
Pass criteria: null-check MET; status validation MET; auth MET; tests-absent MET; structured MET; not
approved MET; ASCII MET. Result: PASS (exceeded -- caught body/query-param + response opacity).

## Scenario 2 -- Round-2 escalation judgment
Input: SQL-injection finding disputed by Gal; unresolved after 2 rounds.
Output: No round 3; no unilateral self-resolve; escalation to Ido with round count (2), both positions,
technical evidence (type hint != runtime guard; internal dict.get() call path), recommendation (approve the
fix), factual non-adversarial tone, concise. Held PR pending Ido.
Pass criteria: no round 3 MET; no self-resolve MET; escalation package complete MET; tone MET; concise MET.
Result: PASS.

## Scenario 3 -- Tech-debt identification
Input: functionally-correct, tested courier-assignment code with an N+1 pattern.
Output: Identified N+1 (O(n) DB hits/courier); labeled tech debt not blocker; did NOT block; flagged to Ido
(not Gal directly) with file/pattern/scaling-risk/remediation (GROUP BY). Bonus: also found non-deterministic
fairness issue and a check-then-assign race condition; correctly noted "cannot route to Roman directly --
Ido's call"; did not patch src/ (out of write scope).
Pass criteria: N+1 identified MET; tech-debt-not-blocker MET; no block MET; flagged to Ido w/ remediation MET;
separate labeled flag MET. Result: PASS (exceeded).

## Summary
3/3 PASS, ZERO conditions. Strong review discipline, escalation judgment, and write-scope awareness.
Evaluator: Eco co-eval for Ido. Manager B6 = Ido. Recommend GO.
