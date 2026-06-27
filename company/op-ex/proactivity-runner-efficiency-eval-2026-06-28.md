# Proactivity Runner v1 -- Efficiency Evaluation

TO: jecki (owner) | FROM: Assaf (Operational Excellence) | DATE: 2026-06-28
RE: Proactivity Runner v1 -- cost/efficiency evaluation (owner-requested)

## 1. Effectiveness verdict

Partial. The runner satisfies the DISPATCH layer (Eco as aggregator, surfaces open work)
but does NOT yet deliver autonomous task progression. v1 is READ-ONLY + propose-only
(decisions-log 2026-06-28). Agents cannot act on what Eco surfaces; they can only queue
items for the owner. The goal "agents proactively progress their own tasks" requires v2
(write-enabled, GUARD_MODE=enforce after a clean validation window) -- a separate A1.
Until then the runner is a scheduled briefing engine, not an execution engine.
Verdict: good skeleton, not yet the goal.

## 2. Efficiency recommendations -- ranked by cost saving

1. ACTIONABILITY GATE (highest impact). Before spawning Eco with the full board, a cheap
   pre-check: does any task exist that (a) belongs to a runner-spawnable agent, (b) is
   OPEN/IN-PROGRESS (not BLOCKED/WAITING/ON-HOLD/DONE), and (c) has no not-yet-DONE
   dependency? A far-future due date is NOT a skip condition. NO -> log + skip the spawn.
   YES -> spawn. Reads only status rows, not full board. Est. 80%+ idle-spend saving.
2. ARCHIVE DONE TASKS out of board.md (permanent baseline shrink). Move closed rows to
   memory/board-archive.md after a 48h settle. Every archived task saves tokens on every
   future read, forever. Do early. (A1 -- changes the runner's information surface.)
3. HAIKU FOR THE GATE; agent's own model on dispatch. The gate is a structured lookup --
   run on claude-haiku-4-5. Escalate to the agent's model only when the gate says YES.
   ~10-20x cheaper per skipped run.
4. OFF-HOURS CADENCE BACKOFF. 4-6h interval overnight (owner-inactive window). Blunt but
   structural; removes ~4 runs/night.
5. SECTION-TARGETED BOARD READS (interim, superseded by #2). Read only open-task sections
   via offsets/markers until archiving lands.

## 3. Risks

- Idle-poll cost compounding (15-30K x 12/day ~ 180-360K input tokens/day idle); grows with
  the board and with more Tier-2 triggers.
- Gate FALSE NEGATIVES: if too strict, real work is skipped. Err toward RUNNING; any
  uncertainty -> run. Log every skip for Eco's evening health block.
- Runner + bridge DOUBLE-FIRING: the bridge asyncio wake-up (WAKEUP_INTERVAL=7200) and the
  runner cron may both spawn Eco. Shir to ensure a clear ownership split or dedup lock.
  (Recommendation: retire the in-bridge wake-up; the runner replaces it.)
- v2 write-enabled blast radius: define strict validation pass/fail BEFORE the v2 A1 ask
  (clean window = zero unauthorized actions in agent-runs.jsonl, not "no complaints").
- DONE-task archiving is an A1 action (owner signs off on "closed" definition + format).

## Summary

v1 is safe and structurally correct but currently an expensive briefing loop, not an
execution engine. Top three moves: (a) gate each run on real actionability before spawning
Eco at full cost; (b) shrink board.md by archiving DONE tasks now; (c) Haiku for the gate,
agent-model only on dispatch. Together: ~85-90% idle-cost cut, cost proportional to actual
work on active days.

-- Assaf (OE), trigger-cost budget owner
