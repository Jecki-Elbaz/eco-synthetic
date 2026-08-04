# Security Incident Report -- Append-Only Shadow Degradation
# Rambo (Security) | 2026-08-02 (filed 2026-08-03)
# Origin: owner-directed task (jecki A1, via interactive session)
# Incident: Dalia sub-agent used Edit on decisions-log.md; guard fired would-DENY; write succeeded.

---

## VERDICT: LEADING HYPOTHESIS CONFIRMED -- WITH PROMOTION RECOMMENDATION

The Dalia Edit incident is expected shadow-mode degradation of a correctly-firing append-only
check. The guard evaluated it, logged it, and degraded to allow -- exactly as designed for
shadow mode. No novel hole. However: the gap should be closed NOW, not at the enforce flip,
for the same reason Red paths were promoted to hard-enforce on 2026-08-01. See Q4.

---

## SOURCES READ

- .claude/hooks/guard.py (full, 833 lines)
- .claude/settings.json
- memory/agent-guard.log (grep: decisions-log, dalia, 2026-08 entries)
- memory/enforce-readiness-state.json
- company/security/reports/guard-delta-scan-rambo-2026-08-02.md
- memory/GUARD_MODE

---

## Q1 -- Did the guard evaluate and log a would-DENY for this specific Edit call?

YES. Confirmed. Entry found at memory/agent-guard.log line 7069:

  {"ts": "2026-08-02T16:21:11.195936+00:00", "mode": "shadow", "tool": "Edit",
   "target": "...decisions-log.md", "decision": "allow",
   "reason": "[shadow] would-DENY: append-only 'company/decisions/decisions-log.md':
              in-place edit denied (5.3)", "origin": "Dalia", "runner": false}

The check fired correctly. `origin: "Dalia"` confirms the sub-agent path was correctly
identified. Shadow leniency converted DENY to allow. This is NOT a bypass -- it is the
guard working as designed in shadow mode.

Addendum: searching agent-guard.log for all decisions-log.md entries shows 100+
would-DENY events going back to 2026-06-18. This is a chronic pattern, not a one-off.
Every agent in the system has been using Edit on decisions-log.md instead of Write for
months, and every single instance has silently degraded to allow in shadow.

---

## Q2 -- Does Edit from an interactive-session-spawned sub-agent reach guard.evaluate()?

YES. Confirmed via two independent sources:

(a) settings.json PreToolUse hook matcher (line 88):
    "Bash|Write|Edit|MultiEdit|Agent|Task|mcp__google_workspace__.*"
    "Edit" is explicitly listed. The hook fires for ALL Edit calls, regardless of whether
    the caller is the owner's top-level session or a spawned sub-agent.

(b) The log entry above: origin="Dalia" and decision/reason are correctly populated.
    The harness populates agent_type with the sub-agent name when a tool call originates
    inside a spawned Claude process. guard.evaluate() receives it and uses it to set
    `origin` (guard.py line 572). The path is fully covered.

No coverage gap here. Unlike the Cesura browser-tools note (those tools were not in the
hook matcher at all), Edit is explicitly in the matcher. The Dalia sub-agent path works.

---

## Q3 -- Detection/enforcement layer map

Two independent layers were at play:

LAYER A: guard.py PreToolUse hook
  - Fires on every Edit call via the settings.json matcher.
  - evaluate() returns DENY with reason "append-only '...': in-place edit denied (5.3)".
  - decide() in shadow mode: DENY is NOT in the hard-enforced set (see below) -> degrades
    to "[shadow] would-DENY -> ALLOW". Write goes through.
  - In enforce mode: decide() passes the DENY through directly -> write is BLOCKED.
  - Status today (shadow): WARNS in log, does NOT block.

LAYER B: Claude Code harness "[Logging/Audit Tampering]" warning
  - This is a harness-level feature independent of guard.py.
  - It fires POST-HOC after the write already succeeded.
  - It never blocks. It never will block. It is informational only.
  - guard.py does not emit this warning; the harness detects append-only file edits itself.

CONCLUSION FOR OWNER: The harness warning you saw did not stop the write and will not
stop any future write. Only the guard, at enforce mode, produces a hard block. Today, in
shadow, the only blocking layer is the hard-enforced subset in decide(). The append-only
rule is not currently in that subset (see Q4).

---

## Q4 -- Should the append-only rule be promoted to hard-enforced-in-shadow NOW?

VERDICT: YES. PROMOTE NOW. SEVERITY: HIGH.

### Reasoning

The hard-enforced subset in decide() exists for rules where shadow degradation is too
dangerous -- where the consequence of allow-instead-of-deny is immediate and irreversible.
The current subset: RUNNER_CONTEXT, BRIDGE_CONTEXT, handoff-secret-scan, google-boundary,
Red-path write, and absolute-prohibitions (.env/sources/).

Red paths were not in this set until 2026-08-01, when an adversary finding showed that
a bridge-path DENY on the send whitelist was degrading to ALLOW in shadow -- meaning an
injected email could silently rewrite the whitelist. The fix: promote Red paths to hard-
enforce in shadow, because the boundary is a security guarantee, not a phase-in rule.

The append-only rule for decisions-log.md and memory/log.md is the SAME category:
- Red line 6a states: "this binds every agent and the owner's own sessions."
- The audit trail's integrity is a security guarantee. It is not meaningful as a "phase-in"
  rule: either you can silently corrupt the audit trail or you cannot.
- The log shows agents have been Editing decisions-log.md 100+ times since 2026-06-18.
  In every case it was a clean end-of-file append -- so far. But the guard's job is to
  block the case where it is NOT a clean append. Shadow leniency means it would allow
  that too.
- enforce-readiness-state.json: green=false, false_blocks=10. The enforce flip is NOT
  today. The shadow window is still open. The risk window is real.

### What the gap actually allows right now

Any agent in the system -- or a prompt-injected agent -- can issue an Edit to
decisions-log.md that modifies EXISTING entries (retroactively alters the audit trail)
and the guard will log a would-DENY and let it through. The harness warning fires after
the fact. Red line 6 ("never modify decisions-log.md retroactively") has no enforcement
layer in the current shadow configuration.

### Proposed guard.py change

In decide() (guard.py lines ~734-768), add one variable and include it in the hard-enforce
condition:

--- current (line ~754) ---
    handoff_block = decision == DENY and "handoff write" in reason
    google_block = decision == DENY and reason.startswith("google boundary")
    red_block = decision == DENY and reason.startswith("Red path")
    absolute_block = decision == DENY and reason.startswith("absolute prohibition")
    if (runner or bridge or mode == "enforce" or handoff_block or google_block
            or red_block or absolute_block):

--- proposed ---
    handoff_block = decision == DENY and "handoff write" in reason
    google_block = decision == DENY and reason.startswith("google boundary")
    red_block = decision == DENY and reason.startswith("Red path")
    absolute_block = decision == DENY and reason.startswith("absolute prohibition")
    # Append-only audit-trail violation is hard-enforced regardless of GUARD_MODE.
    # An Edit on APPEND_ONLY files (or a non-pure-append Write) is an audit integrity
    # violation, not a phase-in rule. Same category as Red paths (promoted 2026-08-01).
    # Covers both: "in-place edit denied (5.3)" and "write is not a pure append (5.3)".
    # (owner A1 required for this change; proposed 2026-08-03 per Rambo incident report)
    append_only_block = decision == DENY and reason.startswith("append-only '")
    if (runner or bridge or mode == "enforce" or handoff_block or google_block
            or red_block or absolute_block or append_only_block):

No other changes needed. The evaluate() logic is already correct (DENY fires on Edit
and on non-pure-append Write for any APPEND_ONLY file). This change ensures decide()
does not degrade those denials in shadow.

### Authority note

This guard.py change modifies the hard-enforce subset -- it narrows what shadow leniency
covers. It is a security tightening, which Rambo can recommend (A3) but the owner must
authorize (A1) because it touches guard.py (a Red-path file: .claude/hooks/ is not in
RED_PREFIXES, but guard.py is the enforcement layer itself and changes to it have been
owner-authorized in every prior instance). Rambo cannot self-apply this change.

### Named mitigation owner: jecki (owner A1) for the guard.py change

Until the change is applied, agents must use Write (not Edit) on all APPEND_ONLY files.
Dalia's role file already permits company/decisions/decisions-log.md writes via Write.
The behavioral instruction is in CLAUDE.md red line 6a. The enforcement gap is the only
open item.

---

## STATUS

status: done

ESCALATION TO ECO/OWNER: promote append_only_block to hard-enforce-in-shadow (A1 required
for guard.py change). The shadow window is open; false_blocks=10 means the enforce flip
is not imminent. Risk is real; fix is one-line.

---

## MITIGATION SUMMARY (named owners, per standing standard)

| Finding | Mitigation | Owner | Priority |
|---------|-----------|-------|----------|
| append_only_block not in hard-enforce set | Add append_only_block to decide() condition | jecki (A1) | HIGH -- before enforce flip |
| 100+ historical would-DENY on decisions-log | No retroactive action needed (git tracks all; no corruption confirmed) | Eco (A2 audit if desired) | LOW |
| Harness warning is post-hoc only | Owner awareness only; no code change | n/a | INFO |

---

Rambo (Security) | 2026-08-02 | owner-directed session
Sources: 6 files read; log entry confirmed at line 7069; guard.py logic traced end-to-end.
