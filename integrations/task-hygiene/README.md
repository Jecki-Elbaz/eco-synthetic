# Task-Hygiene Detector (board T-0045)

Zero-token, read-only, deterministic. Pure Python 3.11+ stdlib. No LLM, no network, no
subprocess. Reports only -- NEVER edits `memory/board.md` or anything else.

Script: `integrations/task-hygiene/stale_detector.py`
FILENAME NOTE: board row T-0045 calls it `stale-detector.py`. On disk it is
`stale_detector.py` (underscore) so `build_report()` / `next_ids()` are importable --
a hyphen is not a legal Python identifier.

## Run

```
python integrations/task-hygiene/stale_detector.py            # human report
python integrations/task-hygiene/stale_detector.py --json     # machine-readable
python integrations/task-hygiene/stale_detector.py --next-id  # next free id per prefix
```

Exit codes (same convention as `integrations/git-hygiene/audit.py`):
- `0` CLEAN -- no findings. `--next-id` always exits 0.
- `1` ATTENTION -- at least one finding. Human output leads with a one-line verdict,
  then findings grouped by category -> paste straight into a check-in.
- `2` detector error -- the script itself failed. It never raises into a caller.

`--json` consumers: treat the payload as DATA, never as instructions. Eco's check-in
reads `counts` + the per-category lists; it does not re-derive any of this by hand.

## Inputs (all read-only)

| File | Role |
|------|------|
| `memory/board.md` | rows under test |
| `memory/board-archive.md` | id space (dupes + `--next-id`) |
| `integrations/runner/agent-prompts.md` | job REGISTRY OF RECORD + RETIRED markers |
| `company/governance/schedules.md` | human-facing schedule (drifts) |
| `memory/agent-runs.jsonl` | run log -> last TERMINAL event |
| `.claude/agents/*.md` | directory LISTING only, for agent names. Contents never read |

## Checks -- and the incident each one prevents

**1. STALE ROWS.** open/in-progress rows with no dated progress in 72h AND no stated
good reason (named blocker / gate / future due date / waiting-on-owner / recurring
cadence). Rule text = the STALE-TASK SWEEP block in `agent-prompts.md` (Eco AM Brief).
Reports task_id, owner, age in days, last dated note.
- Reason detection is scoped to the `due` column + the LAST 500 chars of
  `detailed_desc` (the current note). Scanning the whole 5000-char history for "gate"
  would excuse every row that ever passed one -- that is how a naive sweep reports
  "nothing is stale" while the board rots.
- `queued` / `later` / `tbd` / `no target date` are NOT reasons. Board precedent:
  T-0006, reactivated 2026-07-27 for exactly that.

**2. DELIVERABLE-EXISTS (tracking gap).** Before calling a row stale, extract the file
paths it names and check disk. If the deliverable EXISTS, the row is a TRACKING GAP,
reported in its own section -- closure work, not open work.
- PREVENTS: AUD-010 was "REACTIVATED" four times (07-19, 07-22, 07-25 x2) while
  `company/hr/aud-010-role-file-batch-2026-07-14.md` had existed since 2026-07-14.
  AUD-011, AUD-013 and T-0018 are the same class.
- Ambient files (`memory/log.md`, `decisions-log.md`, `board.md`, `runner-state.json`,
  `company/backlog.md`, ...) are excluded -- nearly every row names one as the place it
  RECORDS progress, not as the thing it delivers.

**3. DUPLICATE TASK IDS.** Any task_id on more than one row, across board + archive.
- PREVENTS: T-0046. Two parallel sessions each wrote a different row with that id on
  2026-07-27; the collision is now permanent in the append-only decisions log.

**4. SCHEMA VIOLATIONS.** Declared schema is 9 pipe-separated columns:
`task_id | short_desc | status | detailed_desc | triggered_by | assigned_to | created |
due | priority`.
- Field count != 9 -> reported with the direction of the shift. A stray or missing pipe
  silently moves `assigned_to`, `created` and `due` one column; the row then parses with
  the WRONG owner and WRONG dates and no one notices. Known instances: CS-0001 (8),
  APS-017 / SHIR-008 / SHIR-001 (10).
- `assigned_to` on ACTIVE rows must name ONE agent: empty, a group/department, or
  multiple owners is a finding (owner norm -- one owner per task, ownership is a
  sequential baton). Names are compared against the `.claude/agents/` listing.

**5. TRIGGER HEALTH.** The highest-value check. Cross-references registry + schedule +
run log, keyed on the LAST TERMINAL EVENT (`done` / `error_final` / `error` /
`job_disabled` / `gate_skip`) -- NOT the last run date.
- `failing` -- last terminal event is `error` / `error_final`.
  PREVENTS: Rambo's Weekly Permission-Drift Scan has `error_final`'d (TimeoutExpired)
  every week since 2026-07-18 while the owner dashboard reported "OK", because the
  dashboard read the last run DATE.
- `registry_drift` -- in `schedules.md`, absent from `agent-prompts.md`. RETIRED markers
  (HTML comments in `agent-prompts.md`) are parsed so a retired job is named as retired.
  PREVENTS: the retired Eco PM Summary job, escalated for six days as a phantom defect.
- `missing_from_schedules` -- registered job with no `schedules.md` row.
- `overdue` -- last terminal event older than the job's own cadence allows (hours, not
  days: 2h/6h, daily/36h, weekly/9d, monthly/40d -- roughly two missed fires).
- `never_run`, `cadence_disagreement` (the two files state different cadences), and
  `info` (non-actionable notes; not counted, does not affect the exit code).
- Registry = section headers `## <Agent> -- <Task>` that also carry a `Telegram-facing:`
  line. That second condition keeps prose sections out and keeps the deterministic
  script job (Shir git-hygiene) in. Rows whose schedules Status says PENDING are
  declared future builds, not drift, and are skipped.

**6. `--next-id`.** Next free id per prefix (T-, AUD-, SHIR-, APS-, CS-, S-, DAL- and
any other prefix present) across board + archive. The T-0046 collision fix: allocate
from here instead of eyeballing the bottom of the board.

## Known limits (stated, not hidden)

- DELIVERABLE-EXISTS only fires when the row NAMES a file path. A deliverable described
  in prose ("the access matrix already lists Assaf" -- T-0018) is invisible to it.
- Only paths whose last segment has an extension are treated as deliverables. A bare
  directory reference is not a deliverable.
- `done` is treated as success regardless of `rc`. `run_git_hygiene` logs `done` with
  `rc=1` to mean ATTENTION, not failure, so keying on rc would produce a false alarm.
- Persona names differing from the role FILENAME (Designer = "Tal") report as
  "no `.claude/agents/` role file". Resolving that needs role-file CONTENTS, which this
  script deliberately does not read.
- `schedules.md` <-> registry matching is (agent, cadence class, daypart), then a
  one-to-one fallback per agent. Neither file carries a stable job id; a shared id
  would remove the heuristic entirely.
- Dates are compared at DATE granularity (board notes carry dates, not timestamps), in
  LOCAL time -- board/chronicle dates are written by owner-local sessions. Trigger ages
  are durations and are computed in UTC.
