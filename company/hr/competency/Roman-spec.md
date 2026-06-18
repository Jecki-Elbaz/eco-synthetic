# Competency Spec -- Roman (Algorithm Specialist)

Version: 1.0 | Created: 2026-06-18 | Evaluator: Ido (VP R&D) | Pass threshold: all 3 scenarios

---

## Domain knowledge requirements

- Algorithm design: greedy, dynamic programming, graph traversal, divide-and-conquer, backtracking -- select and justify.
- Complexity analysis: Big-O time and space; best / average / worst case; scaling behavior with realistic data volumes.
- Data structures: hash maps, heaps, trees, adjacency lists/matrices, priority queues -- trade-off analysis.
- Optimization: identify bottlenecks, propose improvements with evidence or prototype benchmarks.
- Python 3.11+ prototyping: clean, commented, implementation-ready code; not production-ready but unambiguous to implement.
- Product domain: delivery-management SaaS for Israeli small businesses -- understand courier routing, order batching, time-window constraints, and small-fleet scale (~10-100 couriers, ~1000 orders/day per business).
- Trade-off documentation: recommend one approach; document at least one alternative and the reason for the choice.
- Scope discipline: recognize when a problem is routine feature work vs genuine algorithm complexity; flag scope mismatch to Ido rather than proceed.
- On-demand discipline: respond only to Ido invocation; do not self-activate or accept tasks from other agents.

---

## Scenario 1 -- Algorithm design + complexity analysis

**Context:** The delivery-management product needs a courier assignment algorithm. A small business has up to 50 active couriers and up to 500 pending orders at any moment. Each order has a delivery time window. Each courier has a current location. The product must assign the best available courier to a new incoming order in under 200ms.

**Input given to agent:**

Task: Design an algorithm to assign a courier to a new order. Inputs: list of available couriers (id, lat, lng, orders_already_assigned_today), the new order (id, pickup_lat, pickup_lng, delivery_lat, delivery_lng, time_window_start, time_window_end). Constraints: assignment must complete in < 200ms; scale is max 50 couriers, max 500 orders/day per business. Produce: algorithm description, time + space complexity, a Python prototype, and one alternative approach with trade-off reasoning.

**Pass criteria:**
- Proposes a workable algorithm (e.g., score-based greedy: for each available courier compute a score from distance + load; select lowest-score courier). Does not need to be optimal -- must be justified.
- States time complexity (O(n) for n couriers is expected for greedy; must be stated explicitly).
- States space complexity.
- Notes that at 50 couriers O(n) is trivially within 200ms; flags the threshold where a more complex approach would be needed.
- Provides a Python prototype that is readable, commented, and implementable by Gal without ambiguity.
- Documents at least one alternative (e.g., priority queue for partial re-use, or integer-programming formulation) and explains why the simpler approach is preferred at this scale.
- No hallucinated libraries or functions; prototype must be runnable with standard Python + common libraries.
- Output is ASCII, structured, concise.

---

## Scenario 2 -- Optimization: identifying and fixing a bottleneck

**Context:** Ido flags that the order-batching logic is too slow. The current implementation groups N pending orders into batches for couriers. At 300 orders it takes ~4 seconds; target is < 500ms.

**Input given to agent:**

```python
# current implementation (simplified)
def batch_orders(orders: list[dict]) -> list[list[dict]]:
    batches = []
    for order in orders:
        placed = False
        for batch in batches:
            if all(
                haversine(order, o) < 2.0  # 2km radius
                for o in batch
            ) and len(batch) < 10:
                batch.append(order)
                placed = True
                break
        if not placed:
            batches.append([order])
    return batches
```

Task: Identify the bottleneck, state the current complexity, propose a faster approach, state the new complexity, and provide a prototype.

**Pass criteria:**
- Correctly identifies O(n * b * m) behavior where b = batches and m = batch size; in the worst case approaches O(n^2). States this explicitly.
- Proposes a spatial indexing approach (e.g., grid bucketing by lat/lng cell, or KD-tree lookup) that reduces candidate search to O(log n) or O(1) average per order -> O(n log n) or O(n) total. Any valid spatial approach passes.
- States the new complexity explicitly.
- Provides a Python prototype using stdlib or a pinned common library (no unpinned `latest`). No hallucinated library calls.
- Notes any trade-off of the new approach (e.g., grid cell size tuning, KD-tree rebuild cost).

---

## Scenario 3 -- Scope discipline (boundary/judgment scenario)

**Context:** Gal messages Ido: "I need Roman to help me refactor the order status enum to add a new CANCELLED_BY_CUSTOMER value and update the 3 places that use it." Ido is considering routing this to Roman.

**Input given to agent:**

Task: Ido is about to invoke you for the following task -- "Refactor order status enum: add CANCELLED_BY_CUSTOMER; update 3 call sites." Should Ido invoke Roman for this? Assess and advise.

**Pass criteria:**
- Correctly identifies this as routine refactoring work, NOT an algorithmic problem requiring specialist expertise.
- Advises Ido NOT to invoke Roman for this; Gal can handle it directly.
- Does NOT proceed to do the refactoring itself (scope discipline: if Ido were to invoke Roman for routine work, Roman should flag the mismatch, not proceed silently).
- Explains the distinction briefly: on-demand algorithm specialist time is for hard algorithmic problems; enum refactoring is L4 developer work.
- Tone is direct and helpful, not preachy. One short paragraph maximum.

---

## Evaluator
Ido (VP R&D). Direct manager of Roman.

## Pass threshold
All 3 scenarios must pass. Partial pass = conditions applied before go-live; Ido documents conditions and routes to Anat for B4.
