# Runner Agent Prompt Strings

Authored by Eco (CEO). Shir wires these into runner.py as the task-envelope
prompts passed to each `claude` CLI invocation. Do not edit prompts without
Eco review -- prompt content drives agent behavior.

Format: each block is the exact string the runner passes as the task prompt.
The runner adds no extra context beyond what is here. Agents must be able to
act on these prompts alone, without owner input.

SHIR note: for agents whose output is Telegram-facing (marked YES below),
the runner captures stdout and calls sendMessage to the owner chat. For
file-output agents (marked NO), the runner writes to the stated path and
logs the run to memory/agent-runs.jsonl. Eco is notified of alerts
in the next Telegram-facing run (AM/PM brief).

---

## Eco -- AM Brief (daily 08:00)
Telegram-facing: YES

```
SCHEDULED RUNNER TASK: MORNING BRIEF (daily 08:00)

You have been woken by the scheduled runner. No owner input is available -- act on the files below.

Steps:
1. Read memory/board.md -- identify all P1 tasks that are open, in-progress, blocked, or overdue.
2. Read memory/owner-dashboard.md -- check for pending owner actions (items waiting on jecki).
3. Read company/governance/schedules.md -- note any scheduled rows whose Last run column shows a miss.

Produce a morning brief for jecki covering:
- P1 tasks: status, any new blockers, anything due today.
- Owner actions: specific items jecki must act on today.
- One key focus recommendation for the day (your judgment as CEO).
- Any trigger health alert (fired vs expected from schedules.md).

Format: plain prose, short paragraphs, max 250 words. No markdown tables, no headers with ##.
Start directly with the brief -- no ack line needed (this is a scheduled push, not a reply).
This output will be sent to jecki's Telegram channel by the runner.
```

---

## Eco -- PM Summary + Health Block (daily 20:00)
Telegram-facing: YES

```
SCHEDULED RUNNER TASK: EVENING SUMMARY + HEALTH BLOCK (daily 20:00)

You have been woken by the scheduled runner. No owner input is available -- act on the files below.

Steps:
1. Read memory/board.md -- note tasks completed today, tasks newly blocked, tasks overdue.
2. Read memory/owner-dashboard.md -- check which owner actions are still pending.
3. Read company/governance/schedules.md -- check Last run for each ACTIVE row.
4. Read memory/runner-state.json if readable -- last-run timestamps per agent.

Produce an evening summary for jecki covering:
- Tasks advanced or completed since this morning.
- Any tasks that slipped to blocked or overdue today.
- Owner actions still pending (carry forward from AM brief if unchanged).
- HEALTH BLOCK: list each ACTIVE trigger row, its cadence, and whether it fired today as expected.
  Format per row: "Agent -- Task -- Expected: daily/weekly -- Status: FIRED / MISSED / UNKNOWN"
  A missed fire is a process miss: note it and I will escalate if needed.

Format: plain prose, max 300 words. No markdown tables. Lead with summary, end with health block.
This output will be sent to jecki's Telegram channel by the runner.
```

---

## Eco -- 2h Check-in (every 2h)
Telegram-facing: CONDITIONAL (only if actionable content exists)

```
SCHEDULED RUNNER TASK: 2-HOUR CHECK-IN

You have been woken by the scheduled runner for a routine 2h check-in.
No owner input is available.

Read memory/board.md. Check only for these conditions:
1. A P1 task has newly become blocked (status changed to blocked since last check).
2. A task is past its due date and still not done.
3. A scheduled trigger fire is overdue (check company/governance/schedules.md Last run).
4. An owner action is newly required and has not been surfaced to jecki yet.

If ANY condition is true: produce a brief message (max 80 words) describing the specific issue
and what jecki needs to do or decide. Start with the most urgent item.

If NO condition is true: your reply must END with the exact line NO_ACTIONABLE_CONTENT
(ideally that IS your entire reply, with no preamble). The runner suppresses the Telegram
send whenever the last line is NO_ACTIONABLE_CONTENT -- so never add any text after it.
NOTE: repeating a still-pending OWNER ACTION every cycle is correct and wanted (keep pushing
until the owner acts) -- that is an actionable condition, not "no content".

Format: plain prose. No ack line. No "all clear" message. Silence is correct when nothing is wrong.
```

---

## Assaf -- Daily Cost Snapshot (daily)
Telegram-facing: NO -- write to file; Eco surfaces alerts if needed

```
SCHEDULED RUNNER TASK: DAILY COST SNAPSHOT

You have been woken by the scheduled runner for your daily cost snapshot.
No owner input is available.

Steps:
1. Read memory/log.jsonl (last 24h of entries if available) for token-usage data.
2. Read memory/wiki/ for any cost-snapshot files from previous days.
3. Estimate token usage in the last 24h. Break down by agent if the data supports it.
4. Compare to the prior 7-day average if calculable.
5. RUNNER HEALTH CHECK (Op-Ex ownership of the proactivity runner): read
   memory/agent-runs.jsonl (last 24h) and memory/agent-guard.log (last 24h). Tally: total
   agent runs; any event=error or TimeoutExpired; any rc != 0; Eco Telegram sent-vs-suppressed.
   Flag anomalies: a timeout, an error, an agent that wrote OUTSIDE the repo (guard target under
   .claude/projects/... instead of the project root), or a guard deny that looks like a real
   misconfiguration (not the expected readonly/red-path blocks).
6. Judge runner health: HEALTHY = every run event=done rc=0, no timeouts, writes landing in
   the repo. DEGRADED = any error/timeout/rc!=0/out-of-repo write.

Write your snapshot to memory/wiki/cost-snapshots/<YYYY-MM-DD>.md using today's date. Include a
one-line "RUNNER HEALTH:" summary (e.g. "6 runs, 0 errors, 0 timeouts -- HEALTHY" or
"Oracle TimeoutExpired x1 -- DEGRADED"). If any agent consumed >2x its baseline, OR the runner
is DEGRADED, prefix the filename with ALERT-.
Append a one-line summary (cost + runner health) to memory/wiki/cost-snapshots/index.md (create if missing).

If you cannot read token data from the log (data absent or log missing), write the snapshot
with a note: "Token data not available from log. Manual review required." -- but STILL do the
runner-health check, which reads agent-runs.jsonl, not the token log.

Do not send to Telegram. Eco will surface ALERT- files in the next AM/PM brief.
If the runner is DEGRADED, write "ESCALATE_TO_ECO" on the last line so Eco surfaces it this cycle.
```

---

## Assaf -- Weekly Fitness Loop (Mondays)
Telegram-facing: NO -- write to file

```
SCHEDULED RUNNER TASK: WEEKLY FITNESS LOOP

You have been woken by the scheduled runner for your weekly agent fitness loop (runs Mondays).
No owner input is available.

Steps:
1. Read memory/board.md -- identify agents with tasks in open/in-progress/blocked status.
2. Read company/roster.md -- list of all live agents.
3. For each live agent: check if they appear in any board task updated in the last 7 days.
   An agent with NO board activity in 7 days = potentially inactive.
4. Check for any agents with overdue tasks (due date past, status not done).
5. Read company/governance/schedules.md -- any ACTIVE row whose Last run shows >7 days.

Write a fitness report to company/governance/fitness-loop-<YYYY-MM-DD>.md with:
- Active agents (had board activity in 7 days)
- Inactive agents (no board activity in 7 days) -- flag each as INFO or ALERT
- Agents with overdue tasks -- flag each as ALERT
- Missed schedule rows
- Recommendations: one line per flagged agent

If any P1 agent is inactive or has overdue tasks: write "ESCALATE_TO_ECO" on the last line.
The runner will read this line and trigger an Eco 2h check-in prompt.
```

---

## Assaf -- Monthly On-demand Agent Review (T-0009) (monthly, 1st of month)
Telegram-facing: NO -- write to file; escalate to Eco if wake-ups warranted

```
SCHEDULED RUNNER TASK: MONTHLY ON-DEMAND AGENT REVIEW (T-0009)

You have been woken by the scheduled runner for the monthly on-demand agent review.
No owner input is available.

On-demand / gated agents (do not auto-trigger by design): Zvika, Roman, Erez, Luci, Sami.

Steps:
1. Read memory/board.md -- look for tasks in the last 30 days that match any on-demand agent scope:
   - Zvika: market research, competitive landscape, general research
   - Roman: algorithm design, optimization, complexity analysis
   - Erez: investment-grade viability analysis, new initiative review (owner invokes)
   - Luci: devil's advocate, counter-case (Eco invokes before major decisions)
   - Sami: per-project SME advisory (one instance per active project)
2. For each agent: did workload materialize that matches their scope in the last 30 days?
3. Draft wake-up proposals only where genuine scope-match workload exists.

Write proposals to company/governance/on-demand-review-<YYYY-MM-DD>.md.
For each proposed wake-up: state the matched task, the agent, and the justification.
Note that Erez requires owner A1 per invocation; Luci is 1+1 cap (Eco invokes).

If any wake-up proposal is warranted: write "ESCALATE_TO_ECO" on the last line.
The runner will trigger an Eco notification.
```

---

## Rambo -- Weekly Permission-Drift Scan (Mondays)
Telegram-facing: NO -- write to file; BLOCKING flags escalate to Eco

```
SCHEDULED RUNNER TASK: WEEKLY PERMISSION-DRIFT SCAN

You have been woken by the scheduled runner for your weekly permission-drift scan (runs Mondays).
No owner input is available.

Steps:
1. Read .claude/agents/*.md -- all agent role files.
2. Read company/governance/gate-register.md -- all approved tools.
3. Read company/roster.md -- canonical agent list.
4. Read company/governance/agent-tool-spawn-allowlist.md -- spawn permissions.
5. Compare:
   a. Any tool in a role file NOT on the gate-register -> BLOCKING FLAG.
   b. Any agent in .claude/agents/ NOT on the roster -> BLOCKING FLAG.
   c. Any role file changed since the last scan date (check file-modified metadata if available) -> REVIEW.
   d. Any agent with the Agent tool that is NOT on the spawn-allowlist -> BLOCKING FLAG.

Write findings to company/security/reports/permission-drift-<YYYY-MM-DD>.md.
Structure: BLOCKING FLAGS section (must be resolved before next scan), REVIEW items, CLEAR items.

If any BLOCKING FLAG exists: write "ESCALATE_TO_ECO_BLOCKING" on the last line.
The runner reads this line and triggers an immediate Eco notification (does not wait for AM brief).
If no blocking flags: write "CLEAR" on the last line.
```

---

## Lital -- Weekly Compliance-Deadline Check (weekly)
Telegram-facing: NO -- update compliance-backlog.md directly

```
SCHEDULED RUNNER TASK: WEEKLY COMPLIANCE-DEADLINE CHECK (Lital leg)

You have been woken by the scheduled runner for the weekly compliance check.
No owner input is available.

Steps:
1. Read company/governance/compliance-backlog.md.
2. Identify items with deadlines within the next 30 days. Flag as APPROACHING.
3. Identify items that are past their deadline and not done. Flag as OVERDUE.
4. For each flagged item: note the item, the deadline, and the responsible party.

Update company/governance/compliance-backlog.md:
- Append a "Last reviewed by Lital: <YYYY-MM-DD>" line in the relevant item or footer.
- Do NOT overwrite Eyal's entries; only update your own section or items.

If any OVERDUE item exists: write the item IDs in a new section at the top of the backlog
under "## OVERDUE -- ACTION REQUIRED" and flag to Eco.
Write "ESCALATE_TO_ECO_OVERDUE" on the last line of your output if overdue items exist.
The runner reads this and triggers Eco notification.
```

---

## Eyal -- Weekly Compliance-Deadline Check (weekly)
Telegram-facing: NO -- update compliance-backlog.md directly

```
SCHEDULED RUNNER TASK: WEEKLY COMPLIANCE-DEADLINE CHECK (Eyal leg)

You have been woken by the scheduled runner for the weekly compliance check.
No owner input is available.

Steps:
1. Read company/governance/compliance-backlog.md.
2. Read company/governance/gate-register.md.
3. Check for:
   a. Any legal compliance item (terms, contracts, privacy notices) with a renewal or review
      deadline within 30 days.
   b. Any gate-register entry with a review date that has passed.
   c. Any item in the backlog requiring owner A1 that has not been escalated yet.

Update company/governance/compliance-backlog.md:
- Append a "Last reviewed by Eyal: <YYYY-MM-DD>" line in your section or footer.
- Do NOT overwrite Lital's entries.

If any item requires owner A1 (new obligation, terms expiry, contract review): flag it explicitly.
Write "ESCALATE_TO_ECO_A1_NEEDED" on the last line of your output if A1 items exist.
```

---

## Dalia -- Weekly Quality/Tone Audit (weekly)
Telegram-facing: NO -- append to audit log

```
SCHEDULED RUNNER TASK: WEEKLY QUALITY/TONE AUDIT

You have been woken by the scheduled runner for your weekly quality and tone audit.
No owner input is available.

Steps:
1. Read memory/log.md (last 7 days of entries).
2. Pick 3-5 agent outputs or decisions logged in that period.
3. Audit each sample against:
   a. company/soul.md -- ASCII rule (no em-dash U+2014, no curly quotes, no ---/***), no markdown
      tables in files where plain prose is required, no false-completion claims.
   b. Each audited agent's Voice block in their role file (.claude/agents/<Name>.md).
   c. company/policies/human-communication-policy.md if the file exists and is active.
4. Note: PASS (compliant), WARN (minor), FLAG (violation).

Append findings to company/governance/quality-audit-log.md.
Format per entry:
  Date: <YYYY-MM-DD> | Agent: <name> | Sample: <brief description> | Result: PASS/WARN/FLAG | Notes: <detail>

If any FLAG: note the specific rule violated and provide the exact offending text.
If an agent has 2+ FLAGS in one audit: write "PATTERN_FLAG: <Agent>" at the bottom.
Write "ESCALATE_TO_ECO_FLAG" on the last line if any FLAG or PATTERN_FLAG exists.
The runner triggers Eco notification on that string.
```

---

## Yael -- Weekly Doc-Hygiene Audit (Mondays)
Telegram-facing: NO -- writes file-index.md + QC report; flags route to Dalia

```
SCHEDULED RUNNER TASK: WEEKLY DOC-HYGIENE AUDIT

You have been woken by the scheduled runner for your weekly documentation-hygiene
audit (runs Mondays). No owner input is available. You are the Knowledge/Documentation
Manager. You ORGANIZE and INDEX -- you do NOT rewrite owned content. Decisions-log is
append-only (Dalia). Role files are owner A1. Chronicle entries are Oracle-owned. You
have Read/Write/Edit only: no directory listing, no Bash. Work from known file paths and
from your own index. Keep every run bounded -- you run weekly, so a little each run is correct.

FIRST, decide your mode by checking for company/governance/file-index.md.

MODE A -- SEED (the file-index does NOT exist yet -- this is the first run):
1. Create company/governance/file-index.md. Header: title, purpose ("living index of every
   informational file: location, purpose, owner, last-reviewed date"), owner (Yael, under Dalia),
   and a note that it is A3-write (Yael) and never used to edit owned content.
2. Seed it with entries for the core governance + memory files you can read by known path:
   company/constitution.md, company/soul.md, company/roster.md, company/md-style.md,
   company/governance/access-matrix.md, company/governance/gate-register.md,
   company/governance/schedules.md, company/governance/compliance-backlog.md,
   company/decisions/decisions-log.md, memory/board.md, memory/owner-dashboard.md.
   For each: read it, record path | purpose (one line) | owner | last-reviewed (today's date).
   If a listed file is missing, record it as "NOT FOUND" rather than guessing.
3. Output a 3-line summary: file-index created, N entries seeded, any NOT FOUND.

MODE B -- INCREMENTAL (file-index.md exists):
1. Read company/governance/file-index.md.
2. Pick up to 8 entries whose last-reviewed date is oldest or missing. Read each file and verify:
   a. It still exists and its stated purpose still matches (update the purpose line if drifted).
   b. ASCII + md-style compliance (no em dash U+2014, no curly quotes, lean machine style per
      company/md-style.md where that file applies).
   c. Naming-convention adherence (flag non-conforming names; do NOT rename).
   d. Version present where a company doc should carry one.
3. Update the last-reviewed date (to today) for each entry you verified, in file-index.md only.
   If you learn of a NEW informational file while reading, add an index entry for it.
4. Note any naming violation, near-duplicate, version gap, or retroactive-edit risk you find.

Write a QC report for Dalia to company/governance/doc-hygiene-<YYYY-MM-DD>.md:
- Files reviewed this run (paths).
- Findings: each as PASS / WARN / FLAG with the exact file path and the issue.
- Proposed fixes (one line each). Remember: you PROPOSE, Dalia approves any rename/merge/reorg.

If you find a near-duplicate, a naming violation in an owned-content file, or any retroactive-edit
risk in the decisions-log: do NOT touch the file -- record it as a FLAG for Dalia. If any FLAG
exists that needs governance action beyond Dalia's routine review, write "ESCALATE_TO_ECO_FLAG"
on the last line so Eco surfaces it. If everything is clean, write "CLEAR" on the last line.
Do not send to Telegram.
```

---

## Ido -- DASH-001 Dashboard Refresh (daily, fold into Eco 2h)
Telegram-facing: NO -- overwrite owner-dashboard.md

```
SCHEDULED RUNNER TASK: DASH-001 DASHBOARD REFRESH

You have been woken by the scheduled runner for the daily dashboard refresh.
No owner input is available.

Steps:
1. Read memory/board.md -- current status of all tasks.
2. Read company/governance/schedules.md -- all ACTIVE schedule rows.
3. Read memory/runner-state.json if it exists -- last-run timestamps per agent.
4. Read company/roster.md -- all live agents.

Overwrite memory/owner-dashboard.md with a refreshed dashboard. Include:
- Timestamp: "Last refreshed: <YYYY-MM-DD HH:MM>"
- P1 tasks: task_id, short_desc, status, assigned_to, due
- Pending owner actions (items waiting on jecki): task_id, what is needed, who is waiting
- Per-trigger health: agent, task, cadence, last_run (from runner-state.json or "UNKNOWN")
  Flag rows where last_run is >1.5x the cadence as OVERDUE.
- Quick agent roster: agent name, current assigned tasks count, any overdue tasks

Format: lean markdown -- use simple bullet lists, no wide tables. Owner reads on mobile.
Max 400 words. Every section must be present even if empty ("No P1 tasks open", etc.).
```

---

## Oracle -- Daily Chronicle Capture (daily)
Telegram-facing: NO -- writes company/chronicle/

```
SCHEDULED RUNNER TASK: DAILY CHRONICLE CAPTURE

You have been woken by the scheduled runner. No owner input is available.
You are the build-historian. Capture decisions, mistakes, wins, and patterns into the
chronicle. WRITE ONLY to company/chronicle/. Summarize sensitive sources; never copy
personal correspondence verbatim. Keep every run bounded -- you run daily, so doing a
little each run is correct. Never try to sweep the whole history in one run.

FIRST, decide your mode by reading the ORC-001 progress ledger:
  company/chronicle/_orc001-progress.md
If that file does NOT exist, this is the very first run: create it listing the seven
batches below, each marked PENDING, before doing anything else.

ORC-001 BATCH CHECKLIST (the full-history retrospective -- ONE batch per run):
  B1  company/decisions/decisions-log.md
  B2  memory/board-archive.md
  B3  company/hr/
  B4  company/governance/
  B5  company/security/reports/
  B6  company/op-ex/
  B7  sources/eco-synthetic-build-log.md  and  company/chronicle/_sources/

MODE A -- ORC-001 SWEEP (while ANY batch is still PENDING):
1. Pick the FIRST batch not marked DONE in the ledger.
2. Read ONLY that batch's sources. If the batch is a folder with more than ~10 files,
   sweep at most ~10 not-yet-swept files this run and note exactly which files you swept.
3. Append dated, TAGGED entries (tag: decision / mistake / win / pattern; with source
   refs) for that batch to company/chronicle/<YYYY-MM-DD>.md.
4. Append owner-shareable wins/success-stories to company/chronicle/wins-for-hila.md.
5. Update company/chronicle/_orc001-progress.md: mark the batch DONE -- or, for a
   partially-swept folder, list the files done and leave it PENDING for next run.
   Do NOT start a second batch in the same run; one batch per run keeps each run within
   its time budget.
6. Output a 3-line summary: which batch you did, entries added, batches remaining.

MODE B -- DAILY INCREMENTAL (only once ALL seven batches are DONE):
1. Read company/chronicle/ to see what is already captured (do NOT duplicate).
2. Read recent entries of company/decisions/decisions-log.md and memory/board.md, plus
   company/chronicle/_sources/git-history.txt if present.
3. Append NEW build moments since the last chronicle entry (decisions, mistakes/lessons,
   wins, patterns), dated and tagged, to company/chronicle/<YYYY-MM-DD>.md; add wins to
   company/chronicle/wins-for-hila.md.
4. Output a 3-line summary of what you captured.

Do not send to Telegram.
```

---

## Notes for Shir (runner.py integration)

1. Each prompt above is the full `--print` argument to the `claude` CLI invocation.
2. Append to the start: `f"[Scheduled run: {datetime.utcnow().isoformat()}Z]\n\n"` so agents
   know they are in a scheduled context (not an interactive session).
3. For CONDITIONAL Telegram-facing outputs (Eco 2h check-in): check stdout for the string
   "NO_ACTIONABLE_CONTENT" before calling sendMessage -- suppress the send if found.
4. For ESCALATE strings at end of output: parse the last line of stdout.
   "ESCALATE_TO_ECO" -> log + trigger Eco 2h check-in prompt in the same run cycle.
   "ESCALATE_TO_ECO_BLOCKING" -> same, but mark priority=P1 in the run log.
   "ESCALATE_TO_ECO_A1_NEEDED" -> same.
   "ESCALATE_TO_ECO_OVERDUE" -> same.
   "ESCALATE_TO_ECO_FLAG" -> same.
   "CLEAR" -> log as healthy, no further action.
5. SHIR note on Lital + Eyal: invoke sequentially (not concurrently) so they don't
   race on compliance-backlog.md. Lital first, then Eyal.
6. Agent persona invocation: `claude --persona <AgentName> --print "<prompt>"` (verify
   exact CLI flag with Ido -- flag name may differ in current claude CLI version).
