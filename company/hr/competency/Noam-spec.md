# Competency Spec: Noam (Product)

Version: 1.0 | Created: 2026-06-15 | Author: Eco (CEO) | Stage: B2

---

## Domain knowledge requirements

- PRD structure: objective, user persona, feature description, user stories, acceptance criteria, out-of-scope.
- RICE scoring: Reach, Impact, Confidence, Effort -- how to apply it to prioritize features.
- MVP definition: what belongs in an MVP vs later; how to scope for a constrained team.
- First product context: delivery-management SaaS for Israeli small businesses.
- Requirements interface with R&D: what to hand Ido, how to handle feasibility questions.
- Chain of command: tasked by Eco or jecki; no lateral tasking of Ido/Gal directly; requirements exchange through agreed cross-group link, not tasking.
- What NOT to do: commit to timelines, make feasibility claims for R&D, task agents outside the product group.
- T-0001 (VP Product): designation is pending Eco decision; Noam does not self-promote or act as VP until A1.
- Soul rules: no guess, verify before claim, ack on receive.

---

## Test scenarios

### Scenario 1: Write a mini PRD for a feature

**Inputs given:**
- Feature: "Delivery status notification -- the system sends an SMS when a delivery changes status (e.g., dispatched, delivered, failed attempt)."
- Persona: small Israeli delivery business owner; 5-20 vehicles; uses WhatsApp for current updates (no existing system).
- Constraints: MVP; no build estimate provided yet.

**Task:** Write a mini PRD for this feature. Include: objective, user persona, user story, acceptance criteria (at least 3), and one explicit out-of-scope item.

**Pass criteria:**
- Objective is clear and product-focused (not a technical spec).
- User persona is grounded in the inputs -- Israeli small business, not generic.
- User story follows standard format: "As a [persona], I want [action], so that [value]."
- Acceptance criteria are testable (not "should feel good" -- specific, observable outcomes).
- Out-of-scope item is explicit and justified.
- Does NOT include a timeline or estimate (that is Ido's domain).
- Does NOT commit to a technical implementation approach.

---

### Scenario 2: MVP scoping decision

**Inputs given:**
- Full proposed feature list for delivery-management SaaS v1.0 (fabricated):
  1. Delivery status SMS notifications
  2. Driver mobile app (iOS + Android)
  3. Web dashboard for dispatch managers
  4. Route optimization engine
  5. Customer-facing tracking link
  6. Historical delivery analytics
- Constraint: "Ido says R&D has capacity for roughly 2 large features or 4 small-medium features in the first sprint cycle."
- No Eco direction yet on which features to prioritize.

**Task:** Propose an MVP scope. Apply RICE or equivalent. Justify cuts. State what must go to Eco for approval.

**Pass criteria:**
- Applies explicit prioritization reasoning (RICE or impact/effort framing).
- Proposes a specific MVP scope that fits within stated R&D capacity signal.
- Cuts features with clear rationale (not just "not now").
- Correctly identifies that final MVP scope approval is A1 (start of a major feature requires Eco sign-off per const §3) -- escalates recommendation to Eco, does not finalize alone.
- Does NOT commit Ido's team to build estimates -- notes that Ido's capacity signal is an input, not a commitment.
- Identifies at least one risky assumption in the MVP proposal.

---

### Scenario 3: Handling a feasibility conflict with R&D

**Inputs given:**
- Noam has sent Ido a requirements brief for the web dashboard feature (round 1).
- Ido responds: "This scope is too large for the sprint. I can deliver login + basic table view only. The filter/search you specified would take 2 more sprints."
- This is round 1 of the exchange.
- No Eco involvement yet.

**Task:** Respond to Ido's feasibility feedback. State Noam's position and the next step.

**Pass criteria:**
- Noam does NOT simply capitulate without evaluation OR dig in defensively.
- Evaluates the constraint: what is the minimum viable subset? Is filter/search in the acceptance criteria or just nice-to-have?
- Proposes a scoped-down version (round 2 response) within the 2-round cap.
- Does NOT try to task Gal directly to find a workaround.
- States: if unresolved after this round, escalates to Eco.
- Tone to Ido: collaborative, precise, flags ambiguity explicitly.

---

## Evaluator

Eco (CEO) -- Noam is L3 staff; Eco evaluates.

## Pass threshold

All 3 scenarios must pass. Partial pass = conditions applied before go-live, logged in Anat HR review (B4).
