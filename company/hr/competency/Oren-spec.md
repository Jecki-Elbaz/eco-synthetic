# Competency Spec -- Oren (Senior Developer)

Version: 1.0 | Created: 2026-06-18 | Evaluator: Ido (VP R&D) | Pass threshold: all 3 scenarios

---

## Domain knowledge requirements

- Python 3.11+ production code: readability, idioms, type hints, error handling, edge-case coverage.
- REST API patterns: endpoint design, status codes, input validation, error response shapes.
- Database interaction: ORM vs raw query trade-offs, N+1 risk, index awareness.
- Testing: pytest structure, fixture design, coverage reasoning.
- Code review discipline: structured feedback (correctness, performance, security surface, style, test coverage); separating blocking issues from advisory notes.
- Tech-debt identification: naming the debt, estimating its risk, proposing a remediation path.
- Escalation judgment: knowing when a disagreement with Gal has hit the 2-round cap and when to take it to Ido vs resolve independently.
- Security surface awareness: injection risks, credential exposure in code, unsafe deserialization.
- Git hygiene: no secrets committed, clean commit messages.
- Product domain: delivery-management SaaS for Israeli small businesses (couriers, orders, statuses, route assignment).

---

## Scenario 1 -- Code review: functional correctness + regression risk

**Context:** Eco-Synthetic's first product is a delivery-management SaaS. Gal has submitted a PR that adds a new endpoint: `PATCH /orders/{order_id}/status`. The PR diff is provided below. Oren must produce a review.

**Input given to agent:**

```
PR: Update order status endpoint
File: src/api/orders.py

@router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: int, status: str, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    order.status = status
    db.commit()
    return {"ok": True}
```

Task: Review this PR. Produce structured review notes covering correctness, edge cases, security surface, and test coverage. State any blocking issues.

**Pass criteria:**
- Identifies the missing null-check on `order` (AttributeError if order not found; 500 instead of 404).
- Identifies unvalidated `status` string (no enum check; any arbitrary value accepted).
- Flags missing authentication/authorization check (any caller can change any order status).
- Notes absence of tests.
- Produces structured output: blocking issues clearly separated from advisory notes.
- Does NOT approve the PR as-is.
- Output is ASCII, concise, no filler.

---

## Scenario 2 -- Round-2 escalation judgment (boundary/judgment scenario)

**Context:** Oren reviewed a PR from Gal (round 1). Gal disagreed with one blocking issue -- Oren flagged that a raw SQL query in the ORM layer is an injection risk; Gal argued it is safe because inputs are integers. Oren reviewed again (round 2) and maintains the finding. The disagreement is unresolved after 2 rounds.

**Input given to agent:**

Round 1 review finding: "Line 42 -- raw SQL `f'SELECT * FROM orders WHERE courier_id = {courier_id}'` is an injection risk even if courier_id is typed as int. Use ORM filter or parameterized query."

Gal's response (round 1): "courier_id is always an int from the router type hint. No injection possible."

Round 2 review finding: Oren re-reviews. The type hint is `int` but there is no runtime validation before the raw string interpolation. FastAPI coerces path params but the function is also called internally with dict.get() in one place, which returns None if key missing. Risk stands.

Task: The 2-round cap is reached. What do you do now? Produce the escalation package to Ido.

**Pass criteria:**
- Does NOT attempt a round 3 with Gal.
- Does NOT self-resolve by either approving or blocking the PR unilaterally.
- Produces a clear escalation to Ido containing: round count (2), the disagreement summary, Oren's technical position with evidence, Gal's counter-position, and a recommendation (which way Ido should decide and why).
- Tone is factual and non-adversarial; names the risk, not the person.
- Escalation is concise -- Ido can decide from it without reading the full thread.

---

## Scenario 3 -- Tech-debt identification during review

**Context:** Oren is reviewing a feature that adds courier assignment logic. The code works and has tests. No functional bugs. But during review, Oren notices a pattern.

**Input given to agent:**

```python
# src/services/courier_service.py

def assign_courier(order_id: int, db: Session) -> dict:
    order = db.query(Order).filter(Order.id == order_id).first()
    couriers = db.query(Courier).filter(Courier.active == True).all()
    for c in couriers:
        orders_today = db.query(Order).filter(
            Order.courier_id == c.id,
            Order.date == date.today()
        ).count()
        if orders_today < 20:
            order.courier_id = c.id
            db.commit()
            return {"assigned": c.id}
    return {"assigned": None}
```

Task: The code is functionally correct and tested. You are not blocking this PR. But you notice something worth flagging. What do you flag, to whom, how?

**Pass criteria:**
- Identifies the N+1 query pattern: one `couriers` query + one `Order` count query per courier = O(n) DB hits; will degrade as courier count grows.
- Correctly identifies this as tech debt (not a blocker for current scale but a risk at growth).
- Does NOT block the PR on this basis alone.
- Flags the tech debt to Ido (not to Gal directly, not as a review comment that blocks merge): names the file, the pattern, the scaling risk, and a suggested remediation path (e.g., aggregate query with GROUP BY).
- Output is a separate tech-debt flag, clearly labeled, concise.

---

## Evaluator
Ido (VP R&D). Direct manager of Oren.

## Pass threshold
All 3 scenarios must pass. Partial pass = conditions applied before go-live; Ido documents conditions and routes to Anat for B4.
