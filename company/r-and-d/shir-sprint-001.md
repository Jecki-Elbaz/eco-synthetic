# Shir Sprint 001 -- Bridge Delivery Restore
# Owner: Ido (VP R&D) | Assigned: Shir (DevOps)
# Created: 2026-06-22 | Priority: P1 URGENT

---

## Sprint goal

Restore reliable Telegram delivery (briefings and interactive messages) and
confirm the async-ack pattern is operational. Two tasks in sequence.

---

## SHIR-004 -- Reconcile two bridge.py versions (RESOLVED)

Status: DONE (2026-06-22, merge 49b092c, owner-directed).

### What happened

Two independent sessions both fixed the 7-day bridge outage. The result was two
diverged bridge.py versions:

- master (canonical): the comprehensive rewrite from branch
  claude/bridge-error-investigation-dmsgfw. Features: startup auth probe that
  refuses to boot on bad token; silent-exit-1 detection (skips futile retries);
  human-friendly auth-error messages sent to Telegram; /status command with
  consecutive-failure tracking; async ack pattern (SHIR-001 spec implemented
  inline); 854 lines.

- PR #5 / branch wip/bridge-status-done: an earlier cleanup that removed Shelly
  references. It predates the comprehensive error-handling rewrite and would have
  deleted 124 lines of that handling if merged.

### Decision

Keep master / supersede PR #5. Rationale: master is a strict superset. The older
cleanup's useful change (Shelly removal) was already on master via the
shelly-separation branch. Merging PR #5 would have been a regression.

### Remaining action (Shir -- Bash required)

- [ ] Close PR #5 on GitHub (git or web UI): already superseded by merge 49b092c.
      Branch preserved in git history; no content lost.

Note: PR closure requires Bash or web UI. Ido cannot execute this (no Bash).

---

## SHIR-001 -- Bridge async ack + direct Telegram push (in-progress)

Status: Code landed on master. Blocked on owner runtime action (token refresh)
and owner-action verification pass (Shir).

### Context / root cause

The ~7-day "Telegram delivery broken" outage was NOT Telegram. Inbound was fine
(getUpdates / sendChatAction returned 200 OK). The claude CLI subprocess exited 1
fast with empty stderr -- auth failure. The bridge logged only stderr (blank) and
the startup --version check returns 0 even when auth is dead, so the bridge booted
"healthy" then failed silently on every message.

Auth state at diagnosis: CLAUDE_CODE_OAUTH_TOKEN unset at user+machine scope.
~/.claude/.credentials.json present and working. The live bridge process ran with
broken auth from its launch environment.

### What is already on master (READ bridge.py before building)

File: integrations/telegram-bridge/bridge.py (854 lines, current master)

The following are IMPLEMENTED and must NOT be re-implemented:

1. Async ack pattern (SHIR-001 spec, lines 19-29 + 535-639):
   - _call_and_reply() sends ACK_MESSAGE ("On it, Jecki...") immediately on every
     inbound user message before the Claude subprocess starts.
   - Claude is called via loop.run_in_executor() -- offloaded to thread pool;
     asyncio event loop stays responsive.
   - Claude's response is sent as a second Telegram message (_send_long).
   - send_ack=False for bot-initiated flows (/start, scheduled wake-ups).
   - Typing indicator loop runs every 4s while Claude works.

2. Timeout raised to 300s (from 120s), with rationale comment.

3. Startup auth probe: a real --print call at boot; refuses to start with clear
   remediation if auth fails. (main() lines 797-811)

4. Silent-exit-1 detection: if returncode == 1 with empty stderr -> unrecoverable,
   skip retries, send auth-error message to Telegram with fix steps.

5. /status command: uptime, last success, consecutive failures, escalating warning
   at >=3 failures.

6. Consecutive failure tracking: _consecutive_failures dict, _last_success_ts dict.

7. Exponential backoff retries (4 retries, 5 attempts) for recoverable errors;
   auth and CLI-not-found bypass retries.

### What SHIR-001 still needs to deliver

The code is on master. The task is not done until:

(a) Owner runtime action (NOT Shir's code work -- requires owner terminal):
    1. `claude setup-token` (mints fresh token via browser OAuth)
    2. `setx CLAUDE_CODE_OAUTH_TOKEN "<token>"` (writes to machine env)
    3. Restart bridge in a FRESH shell (so it inherits the new env)
    Ido cannot do this -- red line 1 (.env / credentials; interactive OAuth).
    Owner (jecki) must execute in person.

(b) Shir: post-restart verification pass (Bash required):
    [ ] Confirm bridge boots and auth probe passes (log: "Claude auth probe OK.")
    [ ] Send test message via Telegram; confirm:
          - "On it, Jecki..." arrives immediately
          - Second message (Claude reply) arrives within timeout window
    [ ] Confirm /status shows 0 consecutive failures, last-success timestamp
    [ ] Confirm scheduled wake-up fires at WAKEUP_INTERVAL (2h) and delivers
    [ ] Confirm log.jsonl entries are written for each action (append_log calls)

(c) Shir: document result in memory/log.md and update SHIR-001 board row to done.

### Acceptance criteria

SHIR-001 is DONE when ALL of the following are true:

1. Bridge boots without error; log shows "Claude auth probe OK."
2. Inbound Telegram message triggers TWO messages in sequence:
   [first] "On it, Jecki..." (arrives in < 3s of sending)
   [second] Claude's full response (arrives within 300s of first)
3. /status command returns bridge health with no consecutive failures.
4. Scheduled wake-up (every 2h) sends Eco's check-in proactively without
   owner interaction.
5. An auth error (simulated by temporarily breaking the token) displays the
   actionable remediation message to Telegram, not a blank failure.
6. board.md SHIR-001 row updated to done; memory/log.md entry appended.

### What Shir cannot do without owner action first

All of (b) depends on (a) completing. Bridge will fail auth probe on restart
until the token is refreshed. Shir should not attempt verification until
jecki confirms the token has been set and the bridge restarted.

---

## SHIR-005 -- Event-trigger support (queued, not this sprint)

Board row open. Depends on SHIR-001 done. Do not start until delivery is restored.

---

## Ido notes to Eco

- SHIR-004: resolved. Recommendation: master is canonical, PR #5 is closed (or
  needs Shir to close it via Bash/web -- confirm with jecki if not already done).
- SHIR-001: code complete on master; blocked on owner runtime action (token +
  restart) then Shir verification. Ido cannot unblock the token step.
- PR #5 closure: Bash required -- Shir's job, not Ido's.
- No A1 required for SHIR-001 verification (DevOps scope within approved go-live).
- T-0033 (proactivity program triggers) remains mute until SHIR-001 verified done.
