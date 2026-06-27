# Shir Sprint 002 -- SHIR-002 + SHIR-005

Assigned: Shir (DevOps)
Tasked by: Eco (CEO)
Date: 2026-06-24
Priority: P1 -- no open-ended hold; escalate blockers to Eco before any slip

---

## Context

The bridge is live and healthy (SHIR-001 delivery restored). Two loose ends remain from SHIR-001,
then the main build: SHIR-005 (scheduled runner). SHIR-005 is the critical-path blocker for ALL
trigger activation across the company (T-0033, DASH-001, Assaf, Rambo, Dalia, etc.). Nothing fires
on a schedule today. This sprint closes the loose ends and starts SHIR-005.

Sequence is strict: SHIR-002 first (5-min code change), then rogue-host hunt (needs owner assist),
then SHIR-005 design + build.

---

## Part 1 -- SHIR-002: fix httpx token leak in logs (do first, 5 min)

File: integrations/telegram-bridge/bridge.py (after the logging.basicConfig block at line ~79)

Problem: httpx INFO-level logs include the full bot token in request URLs. Token is now rotated but
this must be fixed before the token bleeds into any log file.

Fix: add one line early in bridge startup (before any requests), right after the logging config block:
  import logging
  logging.getLogger("httpx").setLevel(logging.WARNING)

This suppresses httpx request/response INFO lines (which include the URL with the token) while
keeping WARNING and ERROR (which don't).

Verify: restart the bridge, send a test message, confirm no token appears in the log output.
Mark SHIR-002 done on the board.

---

## Part 2 -- Rogue host hunt (needs Bash + owner runtime assist)

Context: during the SHIR-001 recovery session, a phantom getUpdates poller on the old eco token
persisted even with zero local instances running. The token was rotated (so it's harmless now)
but the host is still unidentified.

Steps:
1. Check BotFather webhook vs getUpdates mode -- confirm the new token is in polling-only mode
   and no webhook is set (`getWebhookInfo` API call).
2. Check local network for any other process polling Telegram:
   - netstat / ss for outbound HTTPS to api.telegram.org
   - Any other Task Scheduler jobs or startup entries on this machine besides the two bridges
3. Check other machines: owner has a Mac -- any old bridge instance running there?
4. If still unidentified after steps 1-3: document what was checked + result and close as
   "origin unknown, token rotation mitigates risk." Log in board.md SHIR-001 entry.

Owner action required at step 3: Shir cannot reach the Mac or other machines. Provide findings
to owner and ask them to check the Mac for any running bridge process.

---

## Part 3 -- SHIR-005: scheduled agent runner (main build)

### What it must do

A standalone runner (separate from the bridge) that:
1. Reads the active schedule rows from company/governance/schedules.md (or a derived JSON config)
2. Determines which agents are due to fire based on their interval + last-run time
3. For each due agent: invokes `claude` CLI with the correct agent persona and task prompt
4. Logs each invocation to memory/agent-runs.jsonl (SAFE_MODE -- same format as bridge spawns)
5. Routes output: for agents that produce Telegram-facing output (Eco AM brief, Eco PM summary),
   pipes the result to the bridge's outbound send queue or calls sendMessage directly.
   For agents that produce file outputs (Assaf cost snapshot, Dalia audit), writes to the
   agreed file path and optionally notifies Eco.
6. On each run, updates a last-run timestamp per agent in a simple JSON state file
   (e.g. memory/runner-state.json -- not committed to git if it has timestamps only).

### Architecture

Runner is a Python script: integrations/runner/runner.py
Registered as a Windows Task Scheduler job (AtLogon + every 30 min), similar to the bridges.
Does NOT run inside the 120s bridge subprocess -- that subprocess is Telegram-reactive only.
Shares the same credential env vars (CLAUDE_CODE_OAUTH_TOKEN, USERPROFILE, etc.) as the bridges.

### Phase A deliverable (interval triggers only, no event triggers)

Wire up the 9 approved ACTIVE rows from schedules.md:
- Eco: AM brief (once daily, 08:00), PM summary + health block (once daily, 20:00), 2h check-in
- Assaf: daily cost snapshot, weekly fitness loop
- Rambo: weekly permission-drift scan
- Lital+Eyal: weekly compliance-deadline check
- Dalia: weekly quality/tone audit
- Ido: DASH-001 refresh (daily)

First deliverable: a runner that fires Eco's 2h check-in and Assaf's daily cost snapshot.
Once those work end-to-end (verified by owner seeing output), wire the rest.

### Phase B deliverable (event triggers -- later, after Phase A stable)

Build fire-on-CONDITION support:
- New entry in decisions-log.md -> Oracle capture prompt
- New agent / R&R change detected -> Rambo scan prompt
- Calendar event within 4h -> MeetingPrep prompt (needs Calendar MCP)
- Compliance deadline approaching -> Lital/Eyal alert

Phase B requires file-watch or polling logic. Design separately after Phase A ships.

### Output routing spec for Phase A agents

| Agent | Output target | Telegram send? |
|-------|--------------|----------------|
| Eco AM brief | Telegram owner channel | Yes |
| Eco PM summary | Telegram owner channel | Yes |
| Eco 2h check-in | Telegram owner channel | Only if actionable content |
| Assaf cost snapshot | memory/wiki/cost-snapshots/ | No (Eco surfaces if alert) |
| Rambo scan | company/security/reports/ | No (Eco surfaces if flags) |
| Lital+Eyal compliance | company/governance/compliance-backlog.md | No |
| Dalia quality audit | company/governance/quality-audit-log.md | No |
| Ido DASH-001 refresh | memory/owner-dashboard.md | No |

### Task prompt design (per agent)

Each runner invocation must pass a task-envelope prompt to the claude CLI so the agent knows
what to do without owner input. Eco will draft the per-agent prompt strings; Shir wires them in.
Shir: flag to Eco when runner skeleton is ready for prompt injection -- do not hard-code prompts
yourself; ask Eco for the exact strings.

### Owner runtime action (same as bridges)

Once runner.py is built and tested locally, Shir provides:
1. The Task Scheduler registration command (elevated PowerShell, same pattern as bridge installer)
2. The env vars needed in the service env (same USERPROFILE/HOME/etc. as bridges)
Owner registers via elevated PowerShell. Shir cannot self-register.

### State file: memory/runner-state.json

Simple key: agent_id -> last_run_iso8601. Not committed to git (add to .gitignore).
Runner reads on startup, updates after each successful invocation.
If file missing: treat all intervals as due (first-run behavior).

### Escalation rule

If any part of SHIR-005 is blocked for more than 24h, Shir escalates to Eco with:
- What is blocked
- Proposed resolution
- Requested timeframe

Eco then escalates to owner if needed. No silent holds.

---

## Done criteria

- [ ] SHIR-002: httpx logs no longer contain bot token. Verified by Shir.
- [ ] Rogue host: either identified+shut-down OR documented-as-unknown. Written to board.
- [ ] SHIR-005 Phase A: runner fires at least Eco 2h check-in and Assaf daily snapshot end-to-end.
      Owner sees Eco's morning brief arrive without manually opening Claude Code.
- [ ] SHIR-005 registered as Task Scheduler job. Owner confirmed it fires on schedule.
- [ ] agent-runs.jsonl receives runner invocation entries (SAFE_MODE logging).

---

## Files to create/modify

- integrations/telegram-bridge/bridge.py -- httpx logger fix (SHIR-002)
- integrations/runner/runner.py -- new file (SHIR-005 Phase A)
- integrations/runner/runner-install.ps1 -- Task Scheduler registration script
- integrations/runner/agent-prompts.md -- per-agent task prompt strings (authored by Eco; Shir wires in)
- memory/runner-state.json -- runtime state (gitignored)
- .gitignore -- add memory/runner-state.json if not already excluded
