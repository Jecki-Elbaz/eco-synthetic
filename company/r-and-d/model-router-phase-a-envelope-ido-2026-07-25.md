# T-0004 Model Router Phase A -- Scope Envelope
ido 2026-07-25 | source: company/model-router-design.md (FINAL 2026-06-10)

---

## Summary

Phase A = thin selection-and-logging skeleton, Claude-only, zero cost, zero egress.
Approved. No gate required. No third-party data touch.

---

## Assignee

Gal (Lead Dev).

Rationale: Phase A is a code-layer task (routing module + audit-log hook), not infra.
Gal is the right owner. Noa available as reviewer if Gal needs a second pair of eyes.
Shir not needed -- no infra change in Phase A.

---

## Scope (from design doc, Phase A only)

1. Router module: receives task context, reads model policy (role file + model-matrix),
   returns selected model. Phase A always returns Claude. Interface must be extensible
   for Phase B (local model) without breaking existing callers.

2. Audit-log hook: per task invocation, appends one structured record to the audit log.
   Required fields (per design doc section 1.2): model, task_id, tokens, cost, latency,
   outcome. Cost = 0 in Phase A (Claude primary, already in use). Latency = wall-clock.

3. Integration: hook called at the agent/runner dispatch point. Must not break any
   existing agent flow. Regression check required before close.

Out of scope (Phase A): second-opinion logic, failover, any non-Claude model, gate work.

---

## Eng-Days Estimate

4 eng-days (Gal):
- Day 1: module skeleton + interface spec; Ido review of interface before coding
- Day 2: selection logic (model-matrix read, policy apply, Claude-default path)
- Day 3: audit-log hook (structured append, all required fields)
- Day 4: runner integration + unit tests; Adi QA sign-off

No Roman invocation needed -- no hard algorithmic problem here.

---

## Done Criteria (release gate)

1. router.py (or equivalent module) callable from runner dispatch; returns model identifier.
2. Phase A always returns "claude" (claude-sonnet-4-6 or role-specified variant).
3. Audit log receives one structured entry per task: model, task_id, tokens, cost,
   latency, outcome. Log path confirmed and readable by Dalia quality runs.
4. All existing agent flows pass regression (Adi sign-off).
5. No new secrets, no new external calls, no gate required (confirmed Claude-only).
6. Ido release-gate sign-off before merge to master.

---

## Sprint Slot

Sprint 10 (next sprint after Sprint 9 close).
Start: pending Eco/Gal sprint kickoff. No blockers on R&D side.

---

## Risks and Notes

- design-doc ownership note: Assaf (OpEx) + Dalia (Q&G) own the router spec.
  R&D owns the build. Ido to confirm Assaf alignment on interface spec at Day 1 review
  (cross-group via Eco, per chain-of-command rule).
- Runner integration point needs Shir awareness (read-only -- no infra change needed,
  but Shir should know the dispatch-point is being instrumented).

---

## DASH-001 Verification

DASH-001 VERIFIED HEALTHY 2026-07-25: dashboard last refreshed 2026-07-25 02:09
(owner-dashboard.md header), runner-state last-run 2026-07-25T01:57:17Z
(key: "Ido:DASH-001 Dashboard Refresh (daily, fold into Eco 2h)"). Both timestamps
are from today, well within 48h. Auto-refresh pipeline is functioning.
Recommend close.
