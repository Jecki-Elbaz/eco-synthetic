# T-0004 Phase A Envelope -- Model Router (Selection + Logging, Claude-only)
# Author: Ido (VP R&D) | Date: 2026-07-14 | Requester: Eco (CEO, owner push)
# Board: T-0004 | Source: company/model-router-design.md Phase A

---

## Current state as of 2026-07-14

AUD-007 FIX-07 (Shir, 2026-07-12) is a PARTIAL Phase A delivery.

Already done (per aud-007-delivery-shir-2026-07-12.md):
- model, cost_usd, input_tokens, output_tokens written to agent-runs.jsonl event=done per runner job

Still missing for full Phase A:
- No explicit select_model() function -- selection is an inline agent_model(agent) call, implicit
- No duration_sec (latency) field in event=done records
- No outcome field ("ok" / "error") in event=done records
- model-matrix.md Phase A row not marked ACTIVE; log-fields not documented there
- Interactive-session path (CLI, Telegram bridge) not logged -- Phase A scopes to runner only

Phase A build is a delta on FIX-07. Estimated effort: 1.5 eng-days.

---

## Assignee

Gal (Lead Dev) -- primary.

Rationale: Sprint 9 items (S9-GAL-GAP1 + S9-GAL-EVICT) are CP-DONE as of 2026-07-14.
Gal is available post-Sprint 9 close. Shir carries the infra sprint and must not be split.
Phase A work is concentrated in runner.py and model-matrix.md -- files Gal knows well.

No Noa involvement unless Gal flags a blocker to Ido.

---

## Effort

1.5 eng-days.

Breakdown:
- select_model() function refactor in runner.py: 0.5 days
- Add duration_sec + outcome to log() event=done call: 0.25 days
- Verify FIX-07 fields are all present and match Phase A spec: 0.25 days
- model-matrix.md update (Phase A ACTIVE + log-fields doc): 0.25 days
- py_compile + dry-run + live cycle verification: 0.25 days

---

## Interfaces Touched

### integrations/runner/runner.py

New function: select_model(agent: str, job_key: str) -> tuple[str, str]
  Returns (model_id, policy_note).
  policy_note = "role-file-default" for Phase A (no routing logic yet, just makes selection explicit).
  Called in run_job() in place of the existing inline agent_model(agent) call.

New log fields added to event=done records (additive; existing FIX-07 fields unchanged):
  duration_sec  -- float; job elapsed time from subprocess start to end (start timer before
                   _invoke_claude call; stop on return; round to 2 decimal places)
  outcome       -- "ok" if rc==0, "error" otherwise

Phase A scope: runner path ONLY. Interactive-session (CLI, bridge) logging is NOT in Phase A.
Add a code comment at the function: "# Phase A: runner-path only. Interactive-session logging deferred."

### company/model-matrix.md

In the "Planned multi-model" section:
- Add a status note: "Phase A -- ACTIVE (runner path)"
- Add a log-fields block documenting what each agent-runs.jsonl event=done record contains
  after Phase A: agent, job_key, model, cost_usd, input_tokens, output_tokens, duration_sec, outcome
- Note: runner-path only; interactive-session logging deferred to Phase B

No new gate required: Claude-only, no new tool, no cost, no data egress.

---

## Done Criteria (Ido signs off before T-0004 is closed)

1. select_model(agent, job_key) function exists in runner.py; returns (model_id, policy_note) pair;
   called from run_job() for every job; no bare agent_model() call remaining in the job-run path.

2. event=done records in agent-runs.jsonl contain ALL of: agent, job_key, model, cost_usd,
   input_tokens, output_tokens, duration_sec, outcome.
   Verified: Ido reads an actual event=done line from a live run after delivery.

3. model-matrix.md updated: Phase A status = ACTIVE (runner path); log-fields listed;
   Claude-only scope noted; runner-path-only scope noted; interactive-session deferred noted.

4. python -m py_compile integrations/runner/runner.py: PASS.

5. python integrations/runner/runner.py --dry-run: PASS (all jobs parsed, no errors).

6. One clean live runner cycle: Ido reads agent-runs.jsonl, confirms all six new fields
   (adding duration_sec + outcome to the FIX-07 four) present in at least one event=done record.
   Ido signs off and T-0004 moves to done.

---

## Sequencing and Start Condition

Start condition: Sprint 9 closed (Adi R2+R3+Sami R4 complete; DoD gates met).
Target start: 2026-07-15.
Target close: 2026-07-16 or 2026-07-17 at the latest.

---

## Out of Scope for Phase A

- Second-opinion routing: Phase B (deferred)
- Failover logic: Phase B/C (deferred)
- Local open-weight model: Phase B (deferred)
- Hosted third-party providers: Phase C (shelved; requires A1 + budget)
- Interactive-session logging (CLI, bridge): Phase B
- model-matrix.md second-opinion or redundancy columns: Phase B/C
- Any new gate, tool, or dependency

---

*Ido (VP R&D) | 2026-07-14*
*Sources: company/model-router-design.md + board T-0004 + integrations/runner/aud-007-delivery-shir-2026-07-12.md*
