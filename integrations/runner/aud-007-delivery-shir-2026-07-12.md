# AUD-007 Delivery -- Runner Hardening + Resilience
Shir | 2026-07-12 | Built per spec (Ido->Shir 2026-07-11, Phase 5 audit, FIX-NOW)

---

## SHIR-FIX-01 -- Atomic save_state + per-job persist (P1)
Status: DONE

Changes:
- `save_state()` (runner.py line 132-139): replaced direct `STATE.write_text()` with
  write-to-temp-then-`Path.replace()`. The `.tmp` file is never left behind on success;
  a crash mid-write cannot corrupt `runner-state.json`.
- `main()`: `save_state(state)` is now called (a) after `run_git_hygiene()` returns,
  (b) inside the job loop after each job that sets `res["ran"]=True`, and (c) after the
  escalation-triggered Eco run. The existing final `save_state(state)` is kept as a
  safety net. All three new call-sites are guarded by `not a.dry_run`.

Validation: self-test wrote state, confirmed tmp file is gone, confirmed read-back matches. PASS.

---

## SHIR-FIX-02 -- Per-model timeout table
Status: DONE

Changes:
- Added constants (runner.py lines 63-65):
  `MODEL_TIMEOUTS = {"opus": 600, "sonnet": 300, "haiku": 180}`
  `CLAUDE_TIMEOUT_DEFAULT = 300`
  Old flat `CLAUDE_TIMEOUT = 300` removed.
- Added `_model_timeout(model)` helper (lines 142-148): substring-match on model name
  (e.g. "opus" in "claude-opus-4-5" -> 600). Falls back to 300 for unknown models.
- `run_job()`: `timeout = _model_timeout(model)` replaces the old hardcoded constant
  and is passed through `_invoke_claude()`.

Validation: self-test confirmed opus=600, sonnet=300, haiku=180, unknown=300. PASS.
Dry-run output shows Assaf/Yael (Haiku) correctly resolved.

---

## SHIR-FIX-03 -- RUNNER_MODEL_OVERRIDE (Eco->Sonnet on runner path)
Status: DONE

Changes:
- Added constant (runner.py line 71):
  `RUNNER_ECO_MODEL = os.environ.get("RUNNER_MODEL_OVERRIDE", "claude-sonnet-4-6")`
- `run_job()` (line 337-338): immediately after `model = agent_model(agent)`, if
  `agent.lower() == "eco"`, model is replaced with `RUNNER_ECO_MODEL`. No other agent
  or session type is affected. Eco's role file is never touched.
- To override from Task Scheduler: add env var `RUNNER_MODEL_OVERRIDE=<model-id>` in
  the task's environment. Default is `claude-sonnet-4-6` with no env var set.

Authority: Ido A3 pre-approved 2026-07-11 (board AUD-007).
Interactive-session model: unchanged (read from role file only in claude.ai / CLI
interactive sessions, which do not go through this code path).

Validation: self-test confirmed default is `claude-sonnet-4-6`. PASS.

---

## SHIR-FIX-04 -- Weekly catch-up (>8 days -> fire regardless of weekday)
Status: DONE

Changes:
- `is_due()` weekly branch (runner.py lines 253-259): before the Monday gate, added:
  `if last_dt and (t.date() - last_dt.date()).days > 8: return True`
  Uses `.date()` subtraction (no timezone arithmetic) to avoid tz-aware/naive issues.
  If last run was >8 days ago, returns True immediately regardless of weekday.
  Normal Monday-only gate still applies when within 8 days.

Validation:
- Dry-run on 2026-07-12 (Saturday): all 6 weekly jobs showed WOULD RUN because last
  run was 2026-06-29 (13 days ago). Catch-up triggered correctly.
- Self-test: job with last_dt 13 days ago on Saturday -> True. Job with last_dt this
  Monday (5 days ago) on Saturday -> False. Both PASS.

Note: the DISABLED_JOBS dict and the Rambo inbox-screen job state are untouched per spec.

---

## SHIR-FIX-05 -- Task Scheduler "run missed task" setting (documentation only)
Status: DONE (documentation, no system change made)

Owner action required (do not skip -- this is the infra-layer fix for the 07-06 Monday
cycle that never fired):

In Windows Task Scheduler, open the "Eco-Synthetic Runner" task -> Properties ->
Settings tab -> check the box:
  "Run task as soon as possible after a scheduled start is missed"

This is a single checkbox. Default is unchecked. With it checked, if the machine is
asleep or off when the 2h trigger fires, the task runs immediately on next wake-up.
SHIR-FIX-04 (catch-up logic) is the code-side complement; this setting is the
OS-side complement. Both are needed for full resilience.

No file was modified for this item.

---

## SHIR-FIX-06 -- Retry on session-limit/connection/stall + final-failure alert
Status: DONE

Changes:
- Added `RETRY_PATTERNS` constant (runner.py lines 74-80): tuple of lowercase substrings
  matching session-limit, connection-refused, socket, and stall error patterns.
- Added `_invoke_claude(cmd, stdin_data, env, timeout, cwd)` helper (lines 151-166):
  wraps a single `subprocess.run` call; catches `TimeoutExpired` and other exceptions;
  scans combined stdout+stderr for RETRY_PATTERNS; returns `(rc, raw_stdout, err_tag)`.
  `err_tag` is None on a clean run or a short string on a retryable failure.
- `run_job()` (lines 355-370): calls `_invoke_claude` once; if `err_tag` is set, logs
  event=retry and calls `_invoke_claude` a second time (one bounded retry). On second
  failure, logs event=error_final and calls `send_telegram()` with a FAIL alert
  (the existing Telegram pathway). Returns `{"ran": True, "error": True}`.
  The old bare `subprocess.run` + `except Exception` block is fully replaced.

Alert pathway: uses the existing `send_telegram()` function (same one used by git
hygiene alerts and readiness-gate). No new Telegram integration was built per spec.
Failure is always written to `agent-runs.jsonl` via the `log()` call regardless of
whether Telegram delivery succeeds.

Retry applies to: session limit, connection refused, FailedToOpenSocket, stalled
mid-stream, response stalled, and TimeoutExpired (caught as exception -> err_tag).

Validation: _invoke_claude logic verified by code review. No live-agent invocation
in tests per constraint. PASS (review).

---

## SHIR-FIX-07 -- --output-format json, cost_usd capture into agent-runs.jsonl
Status: DONE

Changes:
- Added `_parse_json_output(raw)` helper (runner.py lines 169-177): parses the JSON
  envelope produced by `--output-format json`; extracts `result` (text), `cost_usd`,
  `model`, and `usage` dict. Falls back gracefully to `(raw, None, None, {})` if the
  output is not valid JSON (e.g., error text before invocation completes).
- `run_job()` cmd list (line 352): added `"--output-format", "json"` between `--print`
  and `--model`. The `result` field of the JSON is used as `out` for all existing
  routing logic (Telegram send, escalation detection, NO_ACTIONABLE_CONTENT check).
  Raw JSON is never forwarded to Telegram.
- `log()` call in `run_job()` (lines 384-388): added four new fields to each
  `event=done` record in `agent-runs.jsonl`:
    `cost_usd`       -- float or null
    `model`          -- string or null (the model the CLI actually used)
    `input_tokens`   -- int or null
    `output_tokens`  -- int or null

agent-prompts.md changes: NONE. The spec says update only if a field name that
agent-prompts.md references changes. Assaf's cost-snapshot prompt references
`memory/log.jsonl` (a separate, currently-offline token log, audit finding F-PA03) --
not a field name in agent-runs.jsonl. The runner health check step already reads
`agent-runs.jsonl`; cost fields will be visible there as new additions. No field
name that agent-prompts.md references was changed. Eco review of the prompt is
required before any prompt content change (per agent-prompts.md header).

Note for Ido/Eco: Assaf's cost prompt step 1 reads `memory/log.jsonl` (offline).
Step 5 reads `agent-runs.jsonl`. Cost data is now in agent-runs.jsonl. A small Eco
prompt edit (add "also read agent-runs.jsonl for cost_usd fields" to step 1) would
restore cost visibility without any gate. Flagged here -- Eco decides.

Note on event names: `_invoke_claude` emits `event=retry` and `event=error_final`
(not `event=error`). Assaf's health check looks for `event=error`. On final failure
the correct event to scan is `error_final`. This is a minor Assaf prompt gap;
flagged here for Eco/Ido; out of scope for this build.

Validation: self-test parsed good JSON (text, cost_usd=0.0142, model, tokens
all extracted correctly) and non-JSON fallback (text=raw, cost=None). PASS.

---

## Validation summary

| Check | Result |
|---|---|
| python -m py_compile runner.py | PASS |
| --dry-run --mode act (no agents invoked) | PASS (14 jobs parsed, weekly catch-up fires) |
| Self-test: SHIR-FIX-01 atomic write | PASS |
| Self-test: SHIR-FIX-02 timeout table | PASS |
| Self-test: SHIR-FIX-03 model override default | PASS |
| Self-test: SHIR-FIX-04 catch-up (13d->fire, 5d->no fire) | PASS |
| Self-test: SHIR-FIX-07 JSON parse + fallback | PASS |
| SHIR-FIX-06 retry logic | Code-review only (no live agent test per constraint) |

No destructive commands run. No live agents invoked. No .env read/written.
No agent-prompts.md modified. No job enable/disable state changed.

---

## S8-SHIR-PURGEJOB -- APS-022 Weekly Purge Job Registration
Shir | 2026-07-13 | Sprint 8 envelope (Ido->Shir via Eco 2026-07-13)
Gal CP-DONE received: script at apps/api/src/scripts/purge-expired-arc-summaries.mjs,
CWD = projects/ai-patient-simulator/app/

### What changed

File: integrations/runner/runner.py

1. Lines 32-34 -- new path constants:
   PURGE_ARC_JOB_KEY = "purge_expired_arc_summaries"
   APS_APP_DIR = ROOT / "projects" / "ai-patient-simulator" / "app"
   PURGE_SCRIPT = APS_APP_DIR / "apps" / "api" / "src" / "scripts" / "purge-expired-arc-summaries.mjs"

2. Lines 63-75 -- DISABLED_JOBS updated from empty dict {} to include:
   PURGE_ARC_JOB_KEY: "APS-022 retention purge -- enable only at pilot go-live (owner A1)
   when real student data exists. Deletes ArcSessionSummary rows
   (retainUntil IS NOT NULL AND retainUntil < NOW()). Zero-token script.
   Ref: Sprint 8 envelope 2026-07-13."

3. Lines 444-499 -- new function run_purge_arc_summaries(state, t, dry):
   Mirrors the run_git_hygiene() pattern (same script-job mechanism already in runner).
   - Checks DISABLED_JOBS first; if key present: prints DISABLED on dry-run, logs
     job_disabled on live run, returns. No script ever executes while disabled.
   - Weekly cadence: fires on Mondays; catch-up if >8 days since last run (SHIR-FIX-04
     pattern). State tracked under key "purge_expired_arc_summaries" in runner-state.json.
   - Invocation: subprocess.run(["node", str(PURGE_SCRIPT), "--apply"], cwd=APS_APP_DIR)
     Timeout 120s. Logs event=start/done/error. Alerts owner via Telegram on non-zero exit.

4. Lines 546-552 -- call in main(), after run_git_hygiene() block:
   if not a.only or a.only.lower() in ("shir", "purge", "purge-arc"):
       run_purge_arc_summaries(state, t, a.dry_run)
       if not a.dry_run:
           save_state(state)

### Job key and invocation as registered

key:        purge_expired_arc_summaries
command:    node <ROOT>/projects/ai-patient-simulator/app/apps/api/src/scripts/purge-expired-arc-summaries.mjs --apply
CWD:        <ROOT>/projects/ai-patient-simulator/app/
cadence:    weekly (Mondays; catch-up if >8 days)
status:     DISABLED (in DISABLED_JOBS; will NOT fire on any cycle)

### Validation results

| Check | Result |
|---|---|
| python -m py_compile integrations/runner/runner.py | PASS |
| python integrations/runner/runner.py --dry-run | PASS |
| Purge job appears in dry-run output as DISABLED | PASS |
| Purge job NOT in WOULD-RUN list (does not fire) | PASS |
| No other job enable/disable state changed | CONFIRMED |
| Rambo inbox-screen job state: untouched | CONFIRMED |

Dry-run line (verbatim):
  DISABLED purge_expired_arc_summaries -- APS-022 retention purge -- enable only at
  pilot go-live (owner A1) when real student data exists. Deletes ArcSessionSumm[...]

### Owner step to enable at pilot go-live (owner A1 required)

When: pilot go-live confirmed AND real student data exists in ArcSessionSummary.
Authority required: owner A1 (red line 3 -- the script deletes database rows).

Action: in integrations/runner/runner.py, remove the PURGE_ARC_JOB_KEY entry from
DISABLED_JOBS. After the edit DISABLED_JOBS will either be {} (empty) or contain only
other entries. Commit from terminal (agent cannot commit). The job fires on the next
Monday runner cycle (or sooner if >8 days elapsed since runner-state last saw it).

Verify after enabling: python integrations/runner/runner.py --dry-run should show
  WOULD RUN purge_expired_arc_summaries (weekly, zero-token node script, --apply)
NOT the DISABLED line. Confirm DATABASE_URL is set in the runner environment so the
node script can reach Postgres.

No other file changed. No live runner invoked. No purge script invoked with --apply.
