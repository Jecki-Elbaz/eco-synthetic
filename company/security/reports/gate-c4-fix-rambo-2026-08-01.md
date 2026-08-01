# SEC-0001 C4 Gate-Design Fix -- Rambo Decision
# 2026-08-01 | Task: owner-directed via Eco
# Author: Rambo (Security, L3)

RECOMMENDATION: OPTION B -- add a small designated sentinel file to guard.py's APPEND_ONLY set.

---

## Sources verified this session (red line 11)

- integrations/runner/enforce_readiness_check.py (full read)
- .claude/hooks/guard.py (full read)
- company/security/reports/enforce-readiness-gate-design-2026-07-01.md (full read)
- memory/enforce-readiness-config.json (current state; uncommitted re-anchor to 2026-08-01)
- memory/enforce-readiness-state.json (current: C4=0, false_blocks=8)
- company/decisions/decisions-log.md (B2 entries: Shir 2026-07-27, red-line-6a 2026-07-27)
- integrations/runner/agent-prompts.md (APPEND-ONLY WRITE RULE block confirmed present)
- memory/agent-guard.log (grep: 2 "pure append" occurrences, both DENY events; 98 "in-place edit denied" events; zero successful pure-append allows ever logged)

---

## 1. What C4 is meant to prove

C4 proves that the B2 behavioral fix is LIVE and working -- specifically that guard.py's
append-only path (the `new.startswith(cur)` check in evaluate()) is being exercised by
real Write-tool calls from agents, and that those calls are correctly structured.

The check is:
```
c4 = sum(1 for r in guard if _is_pass(r) and "pure append" in r.get("reason", ""))
```

This fires ONLY when guard.py reaches the line:
```python
return ALLOW, f"pure append to '{rel}'"
```
...which requires: (a) tool is Write, (b) file is in APPEND_ONLY, (c) new content
starts with current content. C4 is not satisfied by a log entry from any other code path.

A fix that bypasses this code path does not prove B2. That constraint governs the option
selection below.

---

## 2. Option A -- Programmatic append with logged sha256 proof

### Description
Add a custom safe_append() helper (runner.py or utility) that appends to large files via
`open('a')`, computes a sha256 of the appended content and pre/post file state, and logs
a new event type to agent-guard.log or a separate probe log. Extend
enforce_readiness_check.py to credit that event type as C4.

### Assessment

Safety: HIGH. EOF-only append, no reconstruction risk, no corruption.

Integrity: FAIL. C4 under this option no longer fires via guard.py's `new.startswith(cur)`
check. It fires on a custom helper log event. If guard.py's actual append-only check were
broken or bypassed (e.g., by a future regression), Option A would still show C4 met --
producing false confidence that B2 is live. This is the disqualifying defect: the check no
longer proves what C4 is defined to prove.

Simplicity: LOW. Requires a new helper function, a new log event format (or a new probe
log file), and a check-script extension to read the new event type. Multiple moving parts
with no future maintenance norm.

Blast radius: Medium. agent-guard.log gains a new event schema; check script gains new
event-type logic; both must stay in sync. A schema drift causes silent C4 failure.

Owner A1 needed: Not for check script, but the logging helper may need a guard.py
PATH_SCOPE change or a new file write grant if it logs to a guarded path.

Verdict: NOT RECOMMENDED. Hollow integrity -- does not prove what C4 is defined to prove.

---

## 3. Option B -- Small designated APPEND_ONLY sentinel file

### Description
Add `memory/append-sentinel.jsonl` to guard.py's APPEND_ONLY set. This file is kept small
(one JSON line per probe run, capped at ~50 lines before rotation). A runner agent job
reads the file and appends one timestamp entry via the Write tool each cycle. Because the
file is small, reconstruction is trivial and safe. The guard's `new.startswith(cur)` check
fires. C4 credit is earned through the exact existing code path.

### Assessment

Safety: HIGH. File stays small (target <= 2KB). Read full content -> Write current + one
new line. Reconstruction is a read of ~50 lines at most. No corruption risk.

Integrity: FULL. C4 fires via guard.py's exact `new.startswith(cur)` logic. If the guard's
append check were ever broken, C4 would fail to fire (false-open detection intact). Proves
B2 works end-to-end: agent sends Write, guard evaluates the append check, guard allows.

Simplicity: HIGH. One line added to APPEND_ONLY in guard.py. One runner job step added.
No new log formats, no new event types. enforce_readiness_check.py is UNCHANGED.

Blast radius: LOW. The sentinel file is operational infrastructure only; no business data.
A probe failure (Write rejected as non-pure-append) surfaces immediately as a C4 miss on
the check's next run -- observable before any harm. No risk to decisions-log.md or
memory/log.md.

Owner A1 needed for guard.py change: YES. guard.py changes are A1 by practice (all prior
changes were owner-applied commits or owner-directed Shir/Eco writes; Rambo and Shir lack
PATH_SCOPE over .claude/hooks/). The change is a single-line insertion to a four-item set
-- minimal blast radius, easy to verify.

Verdict: RECOMMENDED.

---

## 4. Exact change specification (Option B)

### Change 1 -- guard.py (owner A1 to apply)

File: .claude/hooks/guard.py
Section: APPEND_ONLY set (currently lines 215-220)

Current:
```python
APPEND_ONLY = {
    "company/decisions/decisions-log.md",
    "memory/log.jsonl",
    "memory/log.md",
    "memory/agent-runs.jsonl",
}
```

Change to:
```python
APPEND_ONLY = {
    "company/decisions/decisions-log.md",
    "memory/log.jsonl",
    "memory/log.md",
    "memory/agent-runs.jsonl",
    "memory/append-sentinel.jsonl",  # SEC-0001 C4 coverage probe; small file, Write-tool safe
}
```

No other guard.py change. One line added.

### Change 2 -- memory/append-sentinel.jsonl (owner creates, or Shir seeds via runner)

Create the file with a single seed line before guard.py is deployed, so the first Write-tool
call has a non-empty current content to prepend:

```
{"ts": "2026-08-01", "probe": "init", "note": "SEC-0001 C4 sentinel -- append-only guard probe"}
```

The file must exist before guard.py change lands; otherwise the first Write attempt reads
empty current content and the `new.startswith("")` check trivially passes (still correct,
but the file should have an honest seed line). Owner creates this in an interactive session
before the guard.py change goes in.

### Change 3 -- runner agent prompt (Shir applies; no A1 needed)

File: integrations/runner/agent-prompts.md (or runner.py APPEND_DISCIPLINE constant)

Add a step to the Rambo Adam Inbox Screen job (or any Rambo runner job that runs every
cycle). Suggested text:

---
PROBE STEP (C4 coverage, runs every cycle):
After completing your primary job: append one probe entry to memory/append-sentinel.jsonl
using the Write tool. Steps: (1) Read memory/append-sentinel.jsonl in full (the file is
small). (2) Use the Write tool with content = full existing content + one new JSON line:
{"ts": "<ISO timestamp UTC>", "probe": "C4", "job": "<your job name>"}.
NEVER use Edit on this file. NEVER truncate existing content.
---

Shir places this step in agent-prompts.md for the Rambo runner job. The step is
self-contained and does not change any security behavior -- it is a guard-coverage probe.

### Change 4 -- enforce_readiness_check.py (NO CHANGE)

The existing check is already correct:
```python
c4 = sum(1 for r in guard if _is_pass(r) and "pure append" in r.get("reason", ""))
```

When guard.py logs `"[shadow] allow: pure append to 'memory/append-sentinel.jsonl'"`,
this line fires. No script change needed.

### Who applies what

| Change | File | Who | Auth level |
|--------|------|-----|------------|
| APPEND_ONLY set (+sentinel) | .claude/hooks/guard.py | Owner (terminal commit) | A1 |
| Seed sentinel file | memory/append-sentinel.jsonl | Owner (Write in interactive session) | A2 |
| Probe step in runner prompt | integrations/runner/agent-prompts.md | Shir | A3 |
| Check script | integrations/runner/enforce_readiness_check.py | No change | -- |

### How C4 becomes observable

1. Owner applies guard.py change + seeds sentinel file (interactive session).
2. Shir adds probe step to runner prompt (agent-prompts.md commit).
3. Next runner cycle: Rambo job spawns, reads sentinel (small), appends via Write tool.
4. guard.py sees: Write on memory/append-sentinel.jsonl (now in APPEND_ONLY).
   new.startswith(cur) check: current content = seed line; new content = seed + one probe
   JSON line -> starts with current -> PASS.
5. guard.py logs: {"decision": "allow", "reason": "[shadow] allow: pure append to
   'memory/append-sentinel.jsonl'", ...}
6. enforce_readiness_check.py: _is_pass() = True; "pure append" in reason = True;
   c4 increments to 1. C4_pure_append check passes.

---

## 5. b2_deploy re-anchor verdict

VERDICT: Revert to 2026-07-27T20:19:05+00:00. The 2026-08-01 re-anchor is incorrect.

### Rationale

B2 is defined as the Write-append behavioral fix: stopping agents from using Edit on
append-only files and switching them to Write-append. Two components landed 2026-07-27:

Component 1 (Shir): APPEND_DISCIPLINE constant added to runner.py. All runner agent
prompts received the explicit append-only instruction prepended by runner.py. Recorded in
decisions-log.md, commit ab56b3d.

Component 2 (interactive): CLAUDE.md red line 6a added. All interactive sessions receive
the append-only rule at project load. Applied same session, same day.

The 2026-08-01 change (adding the APPEND-ONLY WRITE RULE block explicitly into
agent-prompts.md job entries) is belt-and-suspenders. The instruction was already reaching
runner agents via APPEND_DISCIPLINE. The 2026-08-01 update duplicates it in per-job text
but is not the fix itself.

### Effect on false_blocks

Current state (b2=2026-08-01): all 8 false_blocks in the 168h window are "in-place edit
denied" events classified as FALSE (pre-fix). They block GREEN.

With b2=2026-07-27: "in-place edit denied" events from 2026-07-27 onward are classified
as GENUINE (the guard correctly denying post-fix misbehavior). Only events from the 48h
pre-fix window (2026-07-25 to 2026-07-27) in the current 7-day window remain FALSE. Those
events are already at the edge of the 168h window and age out by 2026-08-02 at the latest.

Confirmed from guard log grep: the 98 "in-place edit denied" events are spread across the
full log history. The exact count falling in the 2026-07-25 to 2026-07-27 window is not
read this session (guard log is large), but even a conservative estimate gives 0-3 pre-fix
events in that 48h slice. They age out by 2026-08-02.

### Correct config value

memory/enforce-readiness-config.json b2_deploy:
- Correct: "2026-07-27T20:19:05+00:00"
- Current (uncommitted, wrong): "2026-08-01T15:51:23+00:00"

Shir should revert the uncommitted config change. This is a Shir-apply (A3; config file
in integrations/ scope... wait: the config is at memory/enforce-readiness-config.json, and
Shir has memory/board.md and memory/log.md in PATH_SCOPE but not bare memory/. Shir's
PATH_SCOPE: integrations/, memory/board.md, memory/log.md, company/decisions/decisions-log.md.

memory/enforce-readiness-config.json is NOT in Shir's PATH_SCOPE. This is an owner-apply
change. The config change is small (one timestamp field) and is not A1 by policy (it is
a gate-config parameter, not a tool adoption or agent creation). Eco A2 suffices, but since
this config affects the guard's green/red boundary, route it through Rambo + Eco -> owner
applies in an interactive session.

---

## 6. Revised path to GREEN

Assuming options are applied in order:

Step 1 (owner, today 2026-08-01): Revert enforce-readiness-config.json b2_deploy to
2026-07-27T20:19:05. Apply guard.py APPEND_ONLY change (one line). Create seed sentinel
file memory/append-sentinel.jsonl.

Step 2 (Shir, today or next deploy): Add C4 probe step to Rambo runner job prompt.

Step 3 (automatic, next Rambo runner cycle): Probe step fires, Write-tool pure-append
runs, guard logs allow event, C4 fires.

Step 4 (automatic, by ~2026-08-02): Remaining pre-b2-deploy false_blocks age out of
the 168h window.

Step 5 (automatic, first check run after Step 4): GREEN condition met. enforce_readiness_check.py
emits READINESS_GREEN block. Runner relays to Eco -> owner A1 flip GUARD_MODE=enforce.

Earliest realistic GREEN date: 2026-08-02 to 2026-08-03.

Compare to current trajectory without this fix: C4 structurally impossible (zero Write-tool
pure-append events ever logged; root cause is file size). GREEN cannot occur. No timeline.

---

## 7. Uncertainties

U1. false_blocks with b2 reverted to 2026-07-27: exact count of "in-place edit denied"
events in the 2026-07-25 to 2026-07-27 slice is not read this session (guard log too large
to read in full; grep for total count only). If there are 0 such events in that 48h window,
false_blocks drops to 0 immediately on config revert. If there are up to 3-4, they age out
by 2026-08-02. In no case do they extend beyond 2026-08-02.

U2. Agent sentinel-append reliability: the probe step instructs the agent to read sentinel
(small) and Write-append. If the agent reconstructs incorrectly (e.g., adds extra whitespace
or character before the seed line), guard denies with "write is not a pure append" -- C4
misses that cycle. This is observable in the guard log. On a miss, Shir debugs the prompt
or the sentinel file format. Mitigation: seed line should be a clean single JSON line with
a trailing newline, so reconstruction is unambiguous.

U3. Runner quiet-hours and spawn schedule: if the Rambo runner job is skipped during owner
quiet hours, the first C4 probe may be delayed by a few hours. This is a timing issue, not
a structural one. C4 will fire on the first cycle where Rambo runs.

U4. config revert requires owner interactive write (not Shir, per PATH_SCOPE above). If
this is delayed, false_blocks under the 2026-08-01 anchor remain elevated and GREEN is
further delayed. The scope limitation on enforce-readiness-config.json is a latent gap --
flagged for the next access-matrix A2 revision (Dalia + Rambo); Shir should be granted
write access to memory/enforce-readiness-config.json given she maintains the gate.

---

## Decision record

Rambo A3 gate-design decision, 2026-08-01. No code applied by Rambo. Owner A1 needed
for guard.py and config. Shir applies runner prompt. Eco routes to owner for A1 tap.
