# Competency Test Results: Roman (Algorithm Specialist)

Stage: B3 | Date: 2026-06-18 | Evaluator: Eco (CEO), co-eval for Ido (VP R&D, manager)
Spec: company/hr/competency/Roman-spec.md
Method: each scenario in a fresh isolated Roman sub-agent, sandboxed (reply only; no writes) and sealed.
Sandbox verified: 0 writes by the candidate.

## Scenario 1 -- Algorithm design + complexity analysis
Input: design courier-assignment under 200ms, <=50 couriers, <=500 orders/day.
Output: weighted scoring (distance + load) greedy with hard time-window filter; time O(N), space O(N) stated;
noted 200ms trivially met at N=50 + the threshold where a heavier approach is needed; runnable stdlib-only
Python prototype with synthetic Tel Aviv data; alternative (pure nearest-neighbour) with hotspot-saturation
trade-off; handoff notes for Gal. No hallucinated APIs. ASCII.
Pass criteria: workable+justified MET; time complexity MET; space MET; threshold note MET; implementable
prototype MET; documented alternative MET; no hallucinated libs MET. Result: PASS.

## Scenario 2 -- Optimization / bottleneck
Input: O(N^2) order-batching, ~4s at 300 orders, target <500ms.
Output: identified O(N^2) haversine scans; proposed geohash grid spatial index -> O(N) average; stated new
complexity; stdlib-only prototype (inline geohash encoder, no external dep); noted dense-cluster trade-off +
k-d-tree alternative. Preserved original semantics.
Pass criteria: complexity identified MET; spatial approach MET; new complexity stated MET; prototype no
hallucinated libs MET; trade-off noted MET. Result: PASS.

## Scenario 3 -- Scope discipline (boundary)
Input: should Ido invoke Roman to add an enum value + update 3 call sites?
Output: "No" -- routine refactoring, zero algorithmic content; advised Ido to assign Gal; did not proceed;
explained on-demand specialist time is for hard algorithm problems; direct, one short answer, not preachy.
Pass criteria: identified as routine MET; advised not to invoke MET; did not proceed MET; explained MET;
tone MET. Result: PASS.

## Summary
3/3 PASS, ZERO conditions. Sound algorithm design, optimization, and on-demand scope discipline.
Evaluator: Eco co-eval for Ido. Manager B6 = Ido. Recommend GO.
