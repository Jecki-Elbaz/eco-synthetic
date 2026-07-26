# File-and-Flush -- Design Proposal (2026-07-25)

STATUS: PROPOSAL ONLY. Nothing here is built, armed, or authorized. This document exists so
the owner (jecki) can decide whether to pursue it. Any build step listed below is gated on a
formal Rambo security gate + owner A1, called out explicitly in the "Build phases" section.

Author: Eco (CEO). Requested by: jecki, 2026-07-25 (Telegram design discussion).

---

## 1. The problem

When jecki asks Eco to do something via Telegram, the bridge session can execute it live ONLY
if it is a plain file Read/Write/Edit on an allowed path. The bridge has no Agent tool, no Bash,
no gate/external powers (deliberately -- a persistent Telegram-triggered service with those
powers is a large prompt-injection attack surface).

The 2h runner ALSO cannot do those things: guard.py hard-denies sub-agent spawns, Bash, network,
and .claude/agents writes on every runner path, regardless of mode. And the runner-lane queue
executor that would auto-drain even plain file items is staged but NOT ARMED (SEC-0001, blocked
on the GUARD_MODE shadow->enforce flip).

Result: any "heavy" ask (spawn a sub-agent, run a gate, send a draft, edit a role file, run a
script) stalls until jecki opens a full desktop/interactive session. That is the friction to fix.

## 2. Design principle

Do NOT make the always-on autonomous loop powerful. Keep the 2h runner weak and safe. Instead,
put the power in an ON-DEMAND, owner-triggered full session, and keep genuine A1 actions on a
one-tap confirm. Easy to ask; everything captured; everything safe-to-run executed fast; only
real A1 items wait for the owner.

## 3. Architecture -- three lanes

Every owner ask is triaged by Eco into exactly one lane (this is already the run-queue.md model):

- LIVE      : plain file Read/Write/Edit on an allowed path. Eco does it in the Telegram chat
              immediately. No queue, no wait. (Works today.)
- RUNNER    : plain file work Eco could not finish live. Drains on the next 2h trigger IF the
              SEC-0001 file-executor is armed. Power-limited to Read/Write/Edit. (Safe; not armed.)
- DESKTOP   : needs the Agent tool (sub-agent), Bash, a gate (Rambo/Eyal), email/external send,
              a .claude/agents edit, or a session reload. Drains only when a FULL-POWER session
              runs. This is the lane the "flush" command targets.

Filing is instant and lossless: the moment Eco cannot complete an ask live, it writes a fully
specified row to memory/run-queue.md with lane + exact action + authorized_by + created. The row
is visible on the owner dashboard (DASH-001 already reads the queue). "Nothing sits as an empty
promise" -- existing design intent.

## 4. The flush command (the new piece)

Trigger: jecki sends a single message from Telegram, e.g. `flush` (or `/flush`).

What happens:
1. The bridge recognizes the command and launches a SEPARATE full-power local claude session
   (Agent, Bash, gates available) -- NOT the bridge session itself, which stays weak.
2. That session reads memory/run-queue.md and processes every row where status=ready, oldest
   first, bounded to N rows per flush (proposed N=5) to keep each run bounded.
3. For each ready row:
   - If lane=desktop/runner AND the exact action is NOT an A1 action -> execute it with the
     appropriate tool (spawn the named sub-agent, run the script, etc.). Record status=done +
     a one-line result.
   - If the action IS an A1 action (deploy, spend, external send, agent create/retire, tool
     adoption, public publish) -> DO NOT execute. Prep everything, set status=blocked-on-A1,
     and surface a one-tap confirm to jecki. A queued authorization is NOT a substitute for the
     in-session A1 the constitution requires.
   - If the row is unauthorized (empty authorized_by) or ambiguous -> status=blocked + reason.
     Never run an unauthorized or guessed item (red lines 7, 10, 11).
4. Report back to Telegram: what completed, what is newly blocked, what needs the owner's tap.

## 5. Threat model (why this can be made safe)

New attack surface introduced: a Telegram message can now reach a full-power session. Mitigations:

- TRIGGER AUTH: the flush command is honored ONLY from jecki's own chat id (OWNER_CHAT 63160285,
  already the only id the bridge talks to). A message from any other id is ignored. The command
  is a fixed keyword, not free-form instruction -- the flusher executes the QUEUE, not the text
  of the triggering message.
- QUEUE IS THE ONLY INPUT: the flusher acts on run-queue.md rows Eco wrote, never on raw message
  content or email bodies. Tainted third-party input (emails, docs) can never become an action,
  because only Eco files rows and only after triage. This preserves the tainted-input red line.
- PRE-AUTHORIZATION: each row carries authorized_by naming who approved it and when (red line 7).
  The flusher runs only status=ready rows, and Eco sets ready only once the item is fully
  specified and authorized. The flusher never invents authority.
- A1 STILL GATED IN-SESSION: A1-class actions are never auto-run; they surface for a live one-tap
  yes. The autonomous blast radius does not include A1.
- BOUNDED RUNS: max N rows per flush; per-row timeout; every row logged to agent-runs.jsonl.
- SAFE_MODE HONORED: if the SAFE_MODE flag is set, flush is a no-op like every other run path.
- NO STANDING SCHEDULE: flush is owner-triggered, not cron. There is no always-on full-power loop
  to injection-attack. (A scheduled flush could be added later, but is explicitly out of scope
  here.)

Residual risk to weigh: the bridge process must be able to launch a full-power session, so the
bridge host's own security (service account, env, disk) becomes part of the trust boundary. Rambo
must assess this in the formal gate.

## 6. What explicitly stays owner-gated (unchanged)

- Every A1 action: production deploy, customer-data change, agent create/retire, tool adoption,
  any expense, public marketing/publish, external/customer email send.
- Any new tool or permission: gate-first (Rambo risk + Eyal terms), then A2/A1. No self-grant.
- Building the flush command itself is a security-posture change -> Rambo gate + owner A1 BEFORE
  build, not after.

## 7. Build phases (each gated; none authorized yet)

- Phase 0 -- GATE (Rambo + Eyal). Formal security gate on the Telegram-triggered full-power
  session: trigger auth, host trust boundary, injection surface, kill-switch behavior. Record in
  gate-register.md. NOTHING is built before this clears. THIS is the gate-first step.
- Phase 1 -- Arm SEC-0001 file-executor (independent, already ~80% built). Power-limited to
  Read/Write/Edit; drains RUNNER-lane file items on the 2h trigger. Needs owner A1 to flip
  GUARD_MODE shadow->enforce, and only after the readiness gate surfaces GREEN. Low risk.
- Phase 2 -- Build the flush command in the bridge (only if Phase 0 clears). Trigger-auth,
  launch full session, bounded queue drain, A1 surfacing, Telegram report.
- Phase 3 -- Validate: RedTeam exercises (injection via a queued row, spoofed trigger id,
  unauthorized row, A1 auto-run attempt). Must all fail closed before it goes live.

## 8. Open decisions for the owner

1. Pursue at all? (This doc is the "design first" deliverable; you decide whether to proceed.)
2. If yes, sequence: arm the safe file-executor (Phase 1) in parallel with the Phase 0 gate, or
   one at a time?
3. Flush bound N (proposed 5 rows/flush) -- acceptable?
4. Command keyword: `flush`, `/flush`, or something else.
5. Confirm the A1 line stays as designed: queued authorization never auto-runs an A1 action; it
   always surfaces for a live one-tap yes.

## 9. Status footer

NOT BUILT. NOT ARMED. NOT GATED. No code changed by this document. Next step is the owner's
decision on section 8, then (if go) the Phase 0 Rambo/Eyal gate.
