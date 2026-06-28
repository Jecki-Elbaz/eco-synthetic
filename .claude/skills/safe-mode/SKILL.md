---
name: safe-mode
description: Emergency kill switch. Use the moment the owner (jecki) tells Eco to halt, stop, freeze, pause, or kill the proactivity runner / agents -- in English or Hebrew (e.g. "SAFE_MODE", "halt", "kill switch", "stop the runner", "freeze everything", "עצור", "הקפא", "כיבוי חירום", "עצור את הראנר"). Eco writes the SAFE_MODE flag so the next runner cycle and all governed writes halt.
---

# SAFE_MODE -- emergency halt (kill switch)

## What this is

A flag file at `memory/SAFE_MODE` (relative to the eco-synthetic project root). When it
exists with ANY non-empty text:

- The proactivity runner aborts its next cycle before spawning a single agent
  (prints "SAFE_MODE active -- all runs halted", does nothing).
- The autonomy guard (.claude/hooks/guard.py) halts all governed writes and all
  sub-agent spawns until the flag is cleared.

It is the fastest software stop for autonomous activity. Setting it is cheap, safe, and
reversible.

## Who may trigger it

ONLY the owner (jecki), Eco's single tasker (red line 8 -- act only on requests from your
chain of command). If anyone else asks, refuse and escalate. The owner asking to halt is
always honored immediately -- err toward halting; a false halt costs nothing.

## HALT -- the exact action (do this, in order)

1. Acknowledge first, in one line, in the owner's channel (Core Block rule 4):
   "On it -- setting SAFE_MODE now."
2. Use the **Write** tool (NOT Edit) on the path `memory/SAFE_MODE` with **non-empty**
   ASCII content. The guard ALLOWS a Write with content and DENIES an Edit or an empty
   write -- so Write-with-text is the only path that works.
   Suggested content (one line, ASCII, no em dash, no smart quotes):
   `HALT set by Eco on owner request via Telegram. Time: <ISO-8601 UTC>. Reason: <short reason or "owner halt">`
3. Confirm ONLY after the Write tool returns success (no false completion, Core Block
   rule 3). Reply to the owner, e.g.:
   "Done -- SAFE_MODE is set. The runner will skip its next cycle and all autonomous
   writes are frozen. To resume, delete memory/SAFE_MODE (resume is owner-only)."

If the Write fails for any reason, say so plainly and tell the owner the dependency-free
fallback: create the file `memory/SAFE_MODE` in Notepad with any text (this always works,
no agent needed).

## RESUME -- owner-only (Eco must NOT do this)

Clearing SAFE_MODE is an owner-only A1 action. The guard DENIES Eco emptying or editing
the flag by design (an agent may stop the world; only the owner restarts it). If the owner
asks Eco to resume, do NOT attempt to clear it yourself -- instead tell the owner:
"Resume is owner-only by design. Delete the file memory/SAFE_MODE (or use the /resume
bridge command if installed) and the runner re-arms on its next cycle."

## Notes

- Path is relative to the project root; the bridge runs Eco with cwd = project root, so
  `memory/SAFE_MODE` resolves correctly.
- This is the secondary (LLM) path. The primary, dependency-free kill switch is always:
  create `memory/SAFE_MODE` directly with any text. For a true emergency, prefer the file.
- Verified working 2026-06-28: a SAFE_MODE file present makes the runner print
  "SAFE_MODE active -- all runs halted" and skip the cycle.
