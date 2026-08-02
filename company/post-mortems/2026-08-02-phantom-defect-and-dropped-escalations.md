# Post-Mortem: Phantom Defect and Dropped Escalations

Date: 2026-08-02
Author: Dalia (Q&G)
Scope: Two unrelated failures discovered in the same session, documented together.
Status: Open -- action items tracked below.

---

## Incident summary

Two distinct failures discovered and root-caused 2026-08-02:

**Failure 1 (Phantom defect):** The Eco PM Summary runner job was retired by owner directive
2026-07-27 and correctly marked in agent-prompts.md (the registry of record). It was then
escalated as a worsening production defect for six days, through 2026-08-02. Every verification
step during those six days checked agent-runs.jsonl for recent run entries -- a derived artifact --
rather than agent-prompts.md, which plainly shows the RETIRED HTML comment. The job was never
broken.

**Failure 2 (Dropped escalations):** Three independent escalation channels failed silently and
in parallel for weeks. (a) The owner_notify() emergency parameter existed from the start but was
never set by any caller, so the "emergencies pierce quiet hours" promise was never real.
(b) Escalation-triggered overnight Eco runs were silently dropped by the cost-trim gate because
the escalation=True bypass flag was never passed. (c) Rambo's weekly permission-drift scan had
been returning error_final (TimeoutExpired) on every run since 2026-07-18 -- six consecutive
failures -- while the owner dashboard showed "OK" because stale_detector was reading the last
run DATE, not the last TERMINAL event.

---

## Timeline

**Failure 1 -- PM Summary phantom defect:**

- 2026-07-26T21:57Z: Last real PM Summary run. Output produced normally.
- 2026-07-27: Owner directive to retire the PM Summary job. agent-prompts.md updated (HTML
  comment: "PM Summary + Health Block RETIRED 2026-07-27 -- owner directive"). schedules.md row
  updated to show RETIRED. memory/owner-dashboard.md NOT updated (omission -- per-trigger
  health block left stale). stale_detector.py did not exist at time of retirement.
- 2026-07-27 to 2026-08-01: Each health check looked for the job in agent-runs.jsonl and found
  no recent run entries after 2026-07-26T21:57Z. This was interpreted as "the job has not run
  recently / is broken" rather than "the job is retired and its absence is correct."
- 2026-08-01: Eco escalated "PM Summary has not run since 2026-07-26" as a worsening production
  defect. Owner pinged.
- 2026-08-02 (this session): Investigation read agent-prompts.md and found the RETIRED HTML
  comment. Also read commit b92851e which corroborates the 2026-07-27 retirement date. The job
  was never broken. The defect was phantom. Six days of escalations, owner pings, and
  investigation cycles were wasted.

**Failure 2 -- Dropped escalations:**

- 2026-07-18: Rambo weekly permission-drift scan begins returning error_final (TimeoutExpired)
  on every run. Per-job timeout was 300s; the scan reads 30+ role files and reliably exceeds this.
- 2026-07-18 to 2026-08-02 (six consecutive scan cycles, six weeks): Owner dashboard shows "OK"
  for Rambo scan health. stale_detector.py check 5 (trigger health) was reading the last run DATE
  from agent-runs.jsonl. A run ending in error_final has a DATE entry but no successful terminal
  event. The OVERDUE_HOURS threshold was never tripped because the last run was always "recent"
  (just broken, not absent).
- 2026-07-27 (or earlier): owner_notify() emergency parameter has existed since the function was
  written. No caller ever sets it. The URGENT: first-line convention was in agent prompts but the
  runner never set emergency=True based on it. Every notification used the default emergency=False.
- 2026-07-27: Eco cost-trim gate introduced. Eco runs during quiet hours (22:00-09:00 Israel)
  are skipped unless escalation=True. Escalation-triggered overnight runs were never passed this
  flag. They were silently dropped.
- 2026-08-02 (this session): All three dead channels identified and fixed in the same session.

---

## Agents involved

- Eco (CEO, runner-path): primary verifier on the phantom defect; dispatcher of
  escalation-triggered runs that were silently dropped.
- Rambo (Security): weekly permission-drift scan affected by timeout; scan results unreachable
  for six weeks.
- Shir (DevOps): implemented the runner changes (AI-02 through AI-05 below) in the same session.
- Dalia (Q&G): investigation, root cause, this post-mortem.

---

## Root cause

**Failure 1 -- Wrong source of truth for job health verification:**

The registry of record for whether a runner job exists and is active is agent-prompts.md. The
run log (agent-runs.jsonl) records runs that happened; it is silent on whether a job is SUPPOSED
to run. Verifying job health against agent-runs.jsonl is a verify-against-derived-artifact
failure: a job that shows no recent runs in agent-runs.jsonl could be retired (correct) or
broken (incorrect), and there is no way to distinguish the two without reading agent-prompts.md.

Secondary cause: three-file retirement rule not enforced. Retiring a job requires updating
agent-prompts.md (registry), schedules.md (human table), and memory/owner-dashboard.md
(per-trigger health block). Only the first two were updated 2026-07-27. The owner-dashboard.md
omission meant the health block still implied the job was active, reinforcing the "broken job"
interpretation when it was not running.

**Failure 2 -- Three independent dead channels (RC-A, RC-B, RC-C):**

RC-A (emergency escalation never real): owner_notify() accepted an emergency parameter since
its introduction. No caller ever passed emergency=True. The "emergencies pierce quiet hours"
behavior was structural but unreachable. The URGENT: first-line convention in agent prompts
described the intent but the runner never read the first line and set the flag accordingly.

RC-B (escalation-triggered Eco runs silently dropped): the cost-trim gate suppresses Eco 2h
runs during quiet hours. The gate has a bypass: if escalation=True is passed to the run_job
call, the run proceeds regardless. Escalation-triggered invocations were never passed this flag.
Result: an overnight escalation causing an Eco run was silently dropped by the same gate that
was supposed to be bypassed.

RC-C (Rambo scan health misread): stale_detector.py check 5 computed trigger health from the
last agent-runs.jsonl entry for the job, reading the RUN DATE. An error_final run increments the
date without producing a successful terminal event. The freshness check saw a "recent" date and
declared the trigger healthy. The actual terminal state (error_final vs success) was never read.
The stale_detector.py comment for this check explicitly names this failure pattern:
"exactly how Rambo's weekly permission-drift scan showed 'OK' on the dashboard while
error_final'ing every single week since 2026-07-18."

---

## Contributing factors

1. No post-retirement verification gate: there was no rule requiring a verification step after
   marking a job RETIRED to confirm that the absence of run records is expected, not broken.

2. Three-file retirement rule undocumented: the rule existed in practice (agent-prompts.md +
   schedules.md both updated) but memory/owner-dashboard.md was not in scope. The rule was not
   formally stated anywhere until this session's retrospective note in agent-prompts.md.

3. URGENT: convention was aspirational, not enforced: the convention appeared in agent prompts
   as guidance but had no corresponding enforcement at the call site in runner.py.

4. PER_JOB_TIMEOUT not calibrated per job: all jobs shared a 300s timeout. Rambo's scan reads
   the full role-file set. The timeout was not revisited when the roster grew.

5. stale_detector.py did not exist at retirement time: even if it had existed, the check-5
   logic would have needed to distinguish error_final from success -- which the original
   design did not do. The fix (use last TERMINAL event) was applied in this session.

---

## Action items

| # | Action | Owner | Deadline | Status |
|---|--------|-------|----------|--------|
| AI-01 | Three-file retirement rule: note added to agent-prompts.md header ("RETIRING A JOB IS A THREE-FILE CHANGE") | Shir/Eco | 2026-08-02 | DONE -- note present in agent-prompts.md |
| AI-02 | stale_detector.py check 5: uses last TERMINAL event (not last run date) from agent-runs.jsonl | Shir | 2026-08-02 | DONE -- stale_detector.py confirmed on disk at integrations/task-hygiene/stale_detector.py |
| AI-03 | PER_JOB_TIMEOUTS in runner.py bumped to 900s for Eco 2h, Eco AM Brief, Rambo Weekly | Shir | 2026-08-02 | DONE -- runner.py PER_JOB_TIMEOUTS verified in this session |
| AI-04 | URGENT: escalation: runner sets emergency=True when output first line starts "URGENT:" | Shir | 2026-08-02 | DONE -- runner.py line 737 verified: urgent = bool(lines_out) and lines_out[0].startswith("URGENT:") |
| AI-05 | Escalation-triggered Eco runs pass escalation=True to bypass cost-trim and quiet-hours gates | Shir | 2026-08-02 | DONE -- runner.py escalation=True path verified |
| AI-06 | Eco behavior: any job health check reads agent-prompts.md (registry) first; absence of run records is verified against ACTIVE/RETIRED status before escalating | Eco (behavior) | 2026-08-05 | OPEN -- coaching clause needed in Eco role file prompt or soul.md |
| AI-07 | dispatch-queue.md: handoff file for runner-path -> owner-session-only agents | Eco | 2026-08-02 | DONE -- memory/dispatch-queue.md confirmed on disk |
| AI-08 | Rambo permission-drift scan: verify first clean TERMINAL event (success) after the timeout fix before marking the six-week gap resolved | Rambo | next run | OPEN |

---

## What worked well

- agent-prompts.md retirement marker was unambiguous. The RETIRED HTML comment with author
  and date was clear; the problem was that verifiers never read it.
- stale_detector.py design was correct in principle (separate trigger health from run freshness).
  The check-5 fix was a targeted single-source correction, not a rearchitecture.
- The runner escalation=True path existed in the codebase (design was correct); the failure was
  only at the call site.
- All three Failure 2 root causes were independent failures that converged on the same symptom
  (no emergency escalation reaching the owner). Fixing all three in one session was possible
  because they were isolated code paths.

---

## Closure criteria

1. AI-06: Eco role file (or equivalent prompt coaching) updated with verify-against-registry rule.
2. AI-08: Rambo weekly scan produces one clean TERMINAL event (success) following the timeout fix.
3. Dalia confirms AI-06 and AI-08 complete, appends closure note below, notifies Eco.

## Closure record

(open as of 2026-08-02)
