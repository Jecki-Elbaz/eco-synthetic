# Post-Sprint-9 Infra Sprint Envelope
# Author: Ido (VP R&D) | Date: 2026-07-14 | Requester: Eco (CEO, owner-approved)
# Board refs: AUD-001, AUD-002, AUD-007, SHIR-001, SHIR-005, T-0020 (R1/R2), T-0045, DASH-001

---

## Primary Assignee

Shir (DevOps) -- all 7 scope items; est. ~11.5 eng-days.

Supporting (parallel, non-blocking on Shir):
- Eyal: AUD-002 item 6c (IR runbook + PPL 72h clock) -- ~1 day, Read/Write only
- Assaf: AUD-002 items 6e + 6f (audit cadence + cost-prompt fix) -- ~0.5 day
- Noa or Gal: DASH-001 display layer -- ~0.5 day (after SHIR-005 Phase B event triggers land)

---

## Scope, Risk Order, and Eng-Days

### 1. AUD-001 -- File-lock for shared files (P1)

Risk level: ACTIVE. Every runner cycle fans out agents that may concurrently write board.md
and decisions-log.md. Last-write-wins is a live data-integrity defect.

Effort: 1.5 eng-days

Approach (sentinel file; no new dependency, no gate required):
- Before any runner-path agent writes board.md or decisions-log.md:
  1. Check for .board.md.lock in project root; if present and age < 30s, wait up to 30s then retry
  2. Create .board.md.lock with timestamp + agent name
  3. Perform the write
  4. Delete .board.md.lock
- Same pattern for decisions-log.md via .decisions-log.lock
- Implement in runner.py as a context manager: acquire_file_lock(path, timeout=30)
- Add a cleanup hook in runner main() finally block: delete any sentinel left on crash
- Wire into the two write-path agents in the runner: Eco (board + log writes), Oracle (log writes)
  and any other agent whose runner prompt produces board/decisions-log writes

Note: if portalocker or similar library is needed for Windows-safe cross-process locking, that
requires a gate before adoption. Sentinel file approach avoids this entirely for Phase 1.

Done criteria:
- acquire_file_lock() function exists; tested by running two concurrent runner --dry-run
  processes and confirming only one proceeds past lock acquisition at a time
- .board.md.lock and .decisions-log.lock are cleaned up on normal exit AND on exception
- py_compile pass; dry-run pass; no new dependencies

CANNOT WAIT: Shir starts this item NOW (before Sprint 9 close). Active data risk.

---

### 2. AUD-007 remainder -- First clean live runner cycle (FIX-05 + verify)

Risk level: LOW (all code fixes delivered 2026-07-12). One owner action + one Shir verification.

Effort: 0.25 days (Shir)

Owner action (TODAY -- do not defer):
- Windows Task Scheduler -> Eco-Synthetic Runner -> Properties -> Settings tab
- Check "Run task as soon as possible after a scheduled start is missed"
- 5-minute action; required for FIX-05 (the code-side complement FIX-04 is already in runner.py)

Shir action after FIX-05 confirmed:
- Observe next runner cycle: read agent-runs.jsonl and runner-state.json
- Confirm all 7 AUD-007 fix indicators visible:
  FIX-01: per-job save_state (state file age matches most recent completed job)
  FIX-02: per-model timeout (Opus jobs have 600s timeout; Sonnet 300s; visible in logs if timed)
  FIX-03: Eco model = claude-sonnet-4-6 in event=done records on runner path
  FIX-04: no weekly catch-up skip (if >8 days elapsed, weekly jobs fire regardless of day)
  FIX-05: Task Scheduler "run missed" flag confirmed set (owner confirms verbally or Telegram)
  FIX-06: no error_final events (or if they appear, retry event precedes them)
  FIX-07: cost_usd, model, input_tokens, output_tokens present in event=done records
- On pass: update AUD-007 board row to done; log to memory/log.md

Done criteria: one clean cycle post-FIX-05; all 7 indicators confirmed; AUD-007 closed.

---

### 3. SHIR-001 bundle -- Rogue-host + T-0020 R1 + T-0020 R2 + async-ack/streaming

Combined effort: 3 days

Sequencing within the bundle:
- 3a (rogue-host) and 3b (R1 sender allowlist) in parallel; no code dependency between them
- 3c (R2 strip Bash/WebFetch) follows 3b (same bridge.py file; merge conflicts if concurrent)
- 3d (async-ack/streaming) last; depends on bridge.py being stable after 3a-3c

#### 3a -- Rogue-host hunt (0.5 day; owner-assisted)

Context: a third Telegram poller was observed on 2026-06-27 (3 python PIDs with Telegram connections,
only 2 bridges expected). Token was rotated (now harmless). Source unidentified.

Steps:
- Owner runs elevated shell: Get-CimInstance Win32_Process | select ProcessId,CommandLine
  to read the command-line of all python PIDs
- Shir: run getWebhookInfo + getUpdates 409 check on both current bot tokens
- If a third poller is confirmed: identify host (machine name in the command-line) and shut down
  gracefully (stop the process; do NOT kill the machine or delete files without A1)
- If unconfirmed (only 2 PIDs, prior 3rd was transient): document finding and close

Done: either the rogue host is identified + shut down, or the finding is documented as "not found;
prior 3rd connection was transient; current state clean."

#### 3b -- T-0020 R1: Sender chat-ID allowlist (0.5 day)

Add ALLOWED_CHAT_IDS to bridge.py:
- On message receive: if update.message.chat.id not in ALLOWED_CHAT_IDS -> drop silently, log
- ALLOWED_CHAT_IDS populated from env var (TELEGRAM_ALLOWED_CHAT_IDS, comma-separated)
- Owner sets the env var at next bridge restart (owner action; not automatable -- red line 1)
- Default-secure: if env var unset, allowlist is empty and the bridge drops all messages with a
  startup WARNING log (not silent failure)

Note: R1 completion is a pre-condition for adding Rambo + Erez to the bridge spawn allowlist
(T-0020 condition R1-CODE). Also part of the path to unblocking R&D trio (Ido/Gal/Shir) on bridge.

#### 3c -- T-0020 R2: Strip Bash/WebFetch on bridge spawns (0.5 day)

Bridge.py agent spawn path: add --allowedTools flag restricting spawned agents to Read/Write/Edit only.
No Bash, no WebFetch, no sub-agent spawns on the bridge path.
Implementation: in the spawn call (subprocess.run for claude CLI), prepend:
  --allowedTools Read,Write,Edit
This is in addition to the existing PreToolUse guard (guard.py) on the runner path; this is the
bridge-specific layer.

Note: --allowedTools alone does NOT strip Bash on the runner path per Shir verification (see board
T-0020). On the BRIDGE path, --allowedTools IS the structural enforcement layer (no guard.py
injection on bridge-spawned sessions). R2 must be verified by spawning a test agent and confirming
Bash is unavailable.

#### 3d -- Async-ack/streaming: bridge receives -> immediate ack -> Claude async -> send result (1.5 days)

Current behavior: bridge receives message -> calls Claude (synchronous, up to 120s) -> Telegram
times out at 120s if Claude runs long.

Target: bridge receives message -> immediately pushes "On it, jecki..." to Telegram (< 1s) ->
calls Claude in a background thread -> pushes result as a second Telegram message when done.

Approach: Python threading.Thread (not asyncio; simpler given the existing bridge structure).
- On receive: push ack; launch Thread(target=process_and_reply, args=(update,))
- Thread calls Claude, sends result via sendMessage when complete
- Timeout: if thread exceeds 300s, push "processing longer than expected, check runner log" to owner
- No shared state mutation between threads (each thread is an independent message handler)

Also evaluate streaming (send partial responses as Claude streams): lower priority than async-ack.
Streaming requires SSE or chunked transfer from the Claude CLI (--output-format streaming-json).
If streaming adds >0.5 extra days, defer streaming and ship async-ack only.

Done: owner sends a message to the Telegram bot and sees the ack within 2s; full response arrives
as a second message. No 120s timeout errors for normal Claude runs.

---

### 4. T-0045 -- Stale-task auto-detector (ZERO-TOKEN, P1)

Risk: tasks stalling with no stated reason = process miss per owner directive 2026-07-14.
Effort: 0.5 days

Pattern: same as integrations/git-hygiene/audit.py (deterministic Python script, no LLM, no tokens).
Location: integrations/task-hygiene/stale-detector.py (new file; new directory)

Logic:
- Read memory/board.md (plain file read)
- Parse all table rows in open and in-progress status sections
- For each row: check detailed_desc for a dated progress marker (any YYYY-MM-DD string within
  72h of today) OR a blocker keyword ("blocked", "gated on", "waiting-on-owner", "owner action",
  "pending owner")
- If neither dated progress nor blocker keyword found: FLAG that row (task_id + short_desc)
- If any FLAGS: print ATTENTION + list (same format as audit.py); runner sends Telegram alert to owner
- If no FLAGS: print CLEAN (silent; no Telegram)

Wire into runner.py:
- New function: run_stale_check(state, t, dry) following the run_git_hygiene() pattern
- Subprocess call: python integrations/task-hygiene/stale-detector.py
- Cadence: daily (align with daily zero-token jobs)
- Call in main() after run_git_hygiene() block; save_state after run

Done criteria:
- Dry-run flags T-0004 (status: open, no dated progress in detailed_desc within 72h, no blocker
  keyword) as ATTENTION
- Dry-run shows CLEAN for rows with a blocker keyword or recent dated progress
- py_compile pass; dry-run pass; no LLM invocation, no tokens consumed

---

### 5. DASH-001 event-health view + SHIR-005 Phase B event triggers

Depends on: AUD-001 file-lock stable (so file writes do not race during trigger checks)
Effort: 3 days (Shir for event build; Noa or Gal 0.5 day for display layer)

#### SHIR-005 Phase B -- Event-condition triggers (2.5 days, Shir)

Current state: all active scheduled rows fire on interval (the runner polls every 4h after cadence
change). Event-condition triggers (fire on a state change, not a timer) are not yet built.

Phase B scope (four triggers):

TRIGGER 1 -- decisions-log new-entry -> wake Oracle chronicle sweep
  Implementation: in runner.py, before each daily Oracle run, check the line count of
  company/decisions/decisions-log.md against the last-seen count stored in runner-state.json.
  If count increased: also queue an immediate Oracle run (outside the normal daily cadence).
  Zero-token: the count check is a wc -l equivalent in Python (no LLM).

TRIGGER 2 -- new agent file -> wake Rambo permission scan
  Implementation: check mtime of files in .claude/agents/ against last-checked timestamp in
  runner-state.json. If any file is newer: queue an immediate Rambo scan run.
  Rambo scan is already a weekly scheduled row; this event trigger adds an on-change run.

TRIGGER 3 -- compliance-deadline proximity -> Lital+Eyal alert
  Implementation: parse a lightweight deadline config (company/governance/compliance-deadlines.md
  or a new integrations/task-hygiene/deadlines.json) for upcoming dates. If any deadline is
  within 7 days and no Lital+Eyal run in the past 24h: fire immediately.
  Shir proposes the deadline config format; Ido approves before Shir builds.

TRIGGER 4 -- MeetingPrep: T-Xh before Google Calendar event
  Implementation: requires a daily Google Calendar read (GR-009 connector must be available on
  the runner path). If T-0041 calendar-write gate completes and GR-009 is wired to the runner,
  check for events in the next 2h; if found: fire MeetingPrep.
  BLOCKED until: T-0041 calendar-write gate closes (Rambo leg + owner OAuth re-consent).
  Plan: Shir stubs the trigger with a TODO comment and implements once T-0041 unblocks.
  MeetingPrep trigger does not block Phase B close; it ships as a stub.

Shir-uptime health check (bridge uptime monitor) remains PENDING. Requires T-0020 C3 close
(R1+R2 must land first from SHIR-001 bundle) + Bash on the runner path (currently denied on
bridge path; runner path Bash via subprocess is available). Shir proposes design to Ido after
R1+R2 close.

#### DASH-001 event-health view (0.5 day, Noa or Gal)

Add a new section to memory/owner-dashboard.md (the daily-refreshed dashboard Ido's runner job
overwrites each cycle):

Section: "Event Trigger Health"
Columns: trigger_name | last_event_detected | last_job_fired | status
Status values: HEALTHY (event detected; job fired within 2h) | STALE (event detected; job not
fired within 2h -- flag) | PENDING-BUILD (trigger not yet implemented)

Data source: runner-state.json (add event trigger last-detected and last-fired timestamps
as Shir wires Phase B). Noa or Gal reads runner-state.json fields and writes the table.
Assign to whoever is not in APS Sprint 10 at the time Phase B lands.

Done criteria for item 5:
- Triggers 1, 2, 3 fire on condition (not just interval); verified by injecting a test event
  (new decisions-log line, new agent file, near-deadline date) and confirming the corresponding
  job fires in dry-run
- Trigger 4 stub present in runner.py with TODO comment; no error on dry-run
- DASH-001 event-health section present in dashboard template; refreshed on each cycle
- py_compile pass; dry-run pass

---

### 6. AUD-002 -- Production-readiness SOP bundle (target: 2026-08-08)

Target: all sub-deliverables DONE by 2026-08-08 (one week before 2026-08-15 rehearsal).
The Aug 15 rehearsal will serve as the first real exercise of these SOPs.

Six sub-deliverables:

#### 6a. Monitoring + alerting SOP -- Shir, 1 day
Output: company/sops/monitoring-alerting-sop.md
Scope: document the current alert surface (bridge startup auth probe, runner FIX-06 Telegram on
error_final, git-hygiene ATTENTION alerts, T-0045 stale-task alerts, T-0033 trigger-health block
in Eco PM summary). Define: alert severity levels (INFO / WARN / CRITICAL), expected response
per level, escalation path (agent -> Eco -> owner), and what "system dark" means (bridge unresponsive
+ no runner cycle for >8h = CRITICAL; owner phones jecki). Define uptime target: bridge responds
to /status within 30s; runner cycle fires within 30 min of scheduled time.

#### 6b. Release / CI-CD gate SOP -- Shir + Ido, 0.5 day
Output: company/sops/release-gate-sop.md
Scope: pre-release green-gate criteria (test pass bars matching APS sprint close DoD pattern),
who signs off (Ido), what blocks a release (any failing test, any open P1 task without stated
reason, any Ido NO-GO), deploy steps (Shir; no agent autonomous deploy without Ido explicit A2),
rollback trigger.

#### 6c. Incident-response runbook + PPL 72h clock -- Eyal, 1 day
Output: company/sops/incident-response-runbook.md
Scope (Eyal primary, Read/Write only, no gate needed):
Define: what is an incident (data breach, PII exposure, system dark >8h, security finding).
PPL 72h clock: from moment of discovery, owner has 72h to notify affected data subjects if PPL
thresholds met (breach of sensitive data; more than a negligible number of persons). Runbook:
  step 1 -- discovery + timestamp
  step 2 -- contain (halt writes; preserve logs; do not delete evidence)
  step 3 -- assess (is PII involved? is it student data? scope of exposure?)
  step 4 -- 72h decision point (notify data subjects or document why not required)
  step 5 -- owner notification to Eco + jecki within 1h of discovery
  step 6 -- postmortem (within 48h of resolution; Oracle chronicles)
Reference the APS-022 deleteStudentData / retainUntil procedure as the response playbook for
student-data incidents.

#### 6d. Backup + restore -- Shir, 0.5 day
Output: company/sops/backup-restore-sop.md
Scope: what to back up (Postgres DB snapshot, runner-state.json, agent-runs.jsonl, memory/board.md,
memory/log.md, decisions-log.md, .claude/agents/ role files), frequency (daily for DB; after each
runner cycle for state files; weekly for role files), restore steps per component, recovery time
target (RTO: < 4h for DB restore to last snapshot; < 15 min for state files from git).
Note: the git repo IS the backup for all tracked files. What needs non-git backup: the Postgres DB
(not in git) and runner-state.json (not committed). Shir designs the DB snapshot step; owner
executes the first backup run.

#### 6e. On-call + acting-CEO continuity -- Assaf, 0.5 day
Output: company/sops/on-call-continuity.md
Scope: escalation path when Eco is unavailable (runner cycle miss + no PM summary for >8h).
Define: acting-CEO authority (Ido holds R&D decisions; no other agent holds company-level A2
without Eco). Owner (jecki) is the sole A1 authority at all times. Document: how to reach jecki
outside Telegram (not in this file -- owner holds that info offline); what Ido can decide alone
(R&D scope A3); what waits for owner (A1 items, A2 company-scope).

#### 6f. Token/cost instrumentation -- Assaf, 0.5 day
AUD-007 FIX-07 already puts cost_usd, model, tokens in agent-runs.jsonl. Gap: Assaf's cost
cost-snapshot prompt step 1 still reads memory/log.jsonl (offline/stale). Assaf updates the
prompt: add "read agent-runs.jsonl cost_usd fields for current-cycle cost data" to step 1.
Also update the health check to scan for event=error_final (not event=error) per FIX-07 note.
Done: next Assaf cost-snapshot run reads real cost data from agent-runs.jsonl.

---

### 7. Runner cadence reconciliation: 2h -> 4h (owner decision 2026-07-14)

Effort: 0.5 days (Shir) + ~30 min owner actions

Owner decision: runner tick changes from 2h to 4h. Eco and Shelly runners staggered 2h apart.
Example stagger: Eco runner fires at 08:00/12:00/16:00/20:00; Shelly fires at 10:00/14:00/18:00/22:00.
Owner confirms the stagger times at Task Scheduler re-registration.

Shir file changes:
- company/governance/schedules.md: all "Every 2h" cadence cells -> "Every 4h"
  Note: AM brief (daily 08:00) and PM summary (daily 20:00) stay daily -- do NOT change those
- integrations/runner/agent-prompts.md: any "every 2h" text in prompt bodies -> "every 4h"
- integrations/runner/runner.py: if WAKEUP_INTERVAL = 7200 is referenced in comments or code,
  update the comment; the actual Task Scheduler interval is NOT set in Python -- it is set in
  Task Scheduler. Verify no Python code assumes a 2h cycle time in its logic.
- bridge.py: WAKEUP_INTERVAL = 7200 is the bridge polling interval (separate from runner Task
  Scheduler cadence) -- do NOT change. Bridge polling interval is not what the owner is changing.

Owner actions (required; Shir cannot do these):
- Re-register "Eco-Synthetic Runner" in Windows Task Scheduler: modify trigger interval from 2h
  to 4h. Do NOT delete and re-create the task (that loses FIX-05 settings). Edit the trigger.
- Adjust or re-register Shelly runner Task Scheduler job at 4h, staggered as agreed above.
- Confirm both new schedules fire correctly on first trigger.

Done: schedules.md shows 4h for all relevant rows; agent-prompts.md updated; runner.py comments
updated; owner confirms both Task Scheduler jobs fire at 4h intervals on expected stagger.

---

## Sequencing vs 2026-08-15 Rehearsal

### Block A -- Start NOW (cannot wait for Sprint 9 close)

| Item | Start | Owner of start | Est. close |
|---|---|---|---|
| AUD-001 sentinel lock (design + impl start) | 2026-07-14 | Shir | 2026-07-16 |
| AUD-007 FIX-05 Task Scheduler flag | 2026-07-14 | owner (TODAY) | 2026-07-14 |
| AUD-007 verify clean cycle | day after FIX-05 | Shir | 2026-07-15 |
| T-0045 stale-detector script | 2026-07-14 | Shir | 2026-07-15 |
| Cadence reconciliation (Shir files) | 2026-07-14 | Shir | 2026-07-15 |
| Cadence reconciliation (Task Scheduler) | 2026-07-14 | owner | 2026-07-14 |

### Block B -- Start 2026-07-15 (after Block A items launched)

| Item | Est. eng-days | Est. close |
|---|---|---|
| SHIR-001 3a rogue-host hunt | 0.5 | 2026-07-16 |
| SHIR-001 3b R1 sender allowlist | 0.5 | 2026-07-17 |
| SHIR-001 3c R2 strip Bash/WebFetch | 0.5 | 2026-07-18 |
| SHIR-001 3d async-ack/streaming | 1.5 | 2026-07-22 |
| Block B total | 3.0 | ~2026-07-22 |

### Block C -- Start 2026-07-18 (AUD-001 stable; SHIR-001 3b/3c done)

| Item | Assignee | Est. eng-days | Est. close |
|---|---|---|---|
| SHIR-005 Phase B (triggers 1-3; trigger 4 stub) | Shir | 2.5 | 2026-07-25 |
| DASH-001 event-health display layer | Noa/Gal | 0.5 | 2026-07-26 |
| AUD-002 6a monitoring SOP | Shir | 1.0 | 2026-07-29 |
| AUD-002 6b release gate SOP | Shir + Ido | 0.5 | 2026-07-30 |
| AUD-002 6c IR runbook (PPL clock) | Eyal | 1.0 | 2026-07-21 |
| AUD-002 6d backup/restore SOP | Shir | 0.5 | 2026-07-31 |
| AUD-002 6e continuity SOP | Assaf | 0.5 | 2026-07-21 |
| AUD-002 6f cost-prompt fix | Assaf | 0.5 | 2026-07-21 |
| Block C total (Shir) | Shir | 4.5 | 2026-07-31 |
| Block C total (non-Shir) | Eyal/Assaf/Noa | 2.5 | 2026-07-26 |

### AUD-002 all-hands target: 2026-08-08 (buffer before rehearsal)

The 2026-08-15 rehearsal is the first live exercise of the incident runbook (6c), monitoring
SOP (6a), and release gate SOP (6b). All six sub-deliverables must be at DONE status by 2026-08-08
to allow a tabletop run-through before rehearsal day.

---

## Pull-Forward Items (before Sprint 9 close)

These three items start TODAY regardless of Sprint 9 status:

1. AUD-001: active data-integrity risk on every runner cycle. Shir starts sentinel lock design now.
2. AUD-007 FIX-05: 5-minute owner Task Scheduler action. Owner does it today.
3. Cadence reconciliation: owner decision made today. Shir + owner act same day.

---

## APS Cross-Impact

Shir's infra sprint touches no APS app code. No APS test suites. No Prisma schema.
No collision with Gal/Noa APS Sprint 10 work.

Exception: DASH-001 display layer (0.5 day) requires one developer briefly. Assign to Noa
if Noa has a gap between APS Sprint 10 increments; assign to Gal if Noa is unavailable.
Ido coordinates. This is a tiny item and will not block either sprint.

---

## Capacity Assessment

After Sprint 9 close:
| Agent | Track | Est. eng-days |
|---|---|---|
| Gal | T-0004 Phase A then APS Sprint 10 | 1.5 + Sprint 10 |
| Noa | APS Sprint 10 + DASH-001 display | Sprint 10 + 0.5 |
| Adi | QA: T-0004 + APS Sprint 10 | as needed |
| Shir | Infra sprint (all items) | 11.5 |
| Eyal | AUD-002 6c | 1.0 |
| Assaf | AUD-002 6e + 6f | 1.0 |

Two concurrent tracks: APS production hardening (Gal/Noa/Adi) and infra sprint (Shir).
Zero float on either track. Risk: if APS Sprint 10 grows unexpectedly, no developer buffer.

I am NOT escalating for additional headcount at this time. The plan fits within current capacity.
I will escalate immediately to Eco if:
- APS Sprint 10 scope exceeds Gal+Noa bandwidth
- AUD-001 sentinel approach is insufficient and requires a library that needs a gate (delays infra)
- SHIR-001 async-ack exceeds 1.5 days (threading complexity)

---

## Total Eng-Days Summary

| Deliverable | Assignee | Eng-days |
|---|---|---|
| T-0004 Phase A | Gal | 1.5 |
| 1 AUD-001 file-lock | Shir | 1.5 |
| 2 AUD-007 close | Shir | 0.25 |
| 3 SHIR-001 bundle | Shir | 3.0 |
| 4 T-0045 stale-detector | Shir | 0.5 |
| 5 DASH-001 + SHIR-005 B | Shir (+ Noa/Gal 0.5) | 3.0 |
| 6 AUD-002 SOP bundle (Shir) | Shir | 2.0 |
| 6 AUD-002 SOP bundle (Eyal) | Eyal | 1.0 |
| 6 AUD-002 SOP bundle (Assaf) | Assaf | 1.0 |
| 7 Cadence reconciliation | Shir | 0.5 |
| DASH-001 display layer | Noa/Gal | 0.5 |
| Total | | 15.25 |
| Shir total | Shir | 10.75 |

---

*Ido (VP R&D) | 2026-07-14*
*Sources: board.md rows listed in header + aud-007-delivery-shir-2026-07-12.md*
*+ company/model-router-design.md + company/governance/schedules.md*
*+ integrations/runner/agent-prompts.md*
