# Proposal: Make Eco able to ACT on what you ask via Telegram

Status: DRAFT for owner review (jecki). Author: Claude Code session, 2026-06-30.
Scope: how you work with Eco over the Telegram bridge. No execution in this doc -- plan only.

---

## 1. The problem, in your words

"It is very hard to work with Eco this way." When you ask Eco to do something over
Telegram, too often the answer is "I can't do that from here." You want: Eco either
does it, or it hands the task to an automated run that ACTUALLY does it -- not a bounce
back to you. You explicitly said it is FINE for Eco to say "I added it to the next agent
run" instead of doing it live -- as long as the next run really does it.

### Evidence (not a guess)
In the last 20 Telegram messages alone, Eco made 24 separate "I can't from here"
admissions. Real examples from the saved chat (memory/chats/eco/63160285.json):
- "I can't run Rambo or Eyal from this Telegram session, so it's queued for the next
  tool-enabled session, not done."
- "I tried to write it straight into my role file and the bridge blocked me -- the
  harness won't allow writes to .claude/agents/."
- "I can't actually send email from this session (no email tool here)."
- "I can't run git here to confirm which is current."
- "The handoff folder isn't readable from this Telegram bridge session -- so I can't see
  Shelly's messages."
- "But I cannot make Noa live from this Telegram session... both execute in the next
  Claude Code session."

The honesty is correct behavior (red line 10/11). The problem is the WORKFLOW that keeps
forcing the honesty.

---

## 2. Why it happens: three execution surfaces, very different powers

Eco runs in three different places, and they are NOT equal. Verified from the actual code
(integrations/telegram-bridge/bridge.py, integrations/runner/runner.py, .claude/hooks/guard.py):

| Capability | Bridge (you chat live) | Runner (auto, every 2h) | Desktop Claude Code (this) |
|---|---|---|---|
| Read/Write/Edit company files | YES | YES (act mode) | YES |
| Write .claude/agents/ (role files) | NO -- harness denies | NO -- guard Red path | YES (owner A1) |
| Run gates (spawn Rambo/Eyal) | NO -- no Agent tool | NO -- guard denies spawn | YES |
| Bash / git (builds, repo state) | NO | NO -- guard denies | YES |
| Web / email / other MCP tools | NO | NO | YES (if tool installed) |
| Spawn a NEW agent (e.g. Noa) | NO | NO | YES, but only AFTER reload |

Key facts behind the table:
- The bridge gives Eco only Read, Write, Edit (bridge.py `_AGENT_TOOLS`). No Agent tool,
  no Bash, no web, no email. So Eco cannot message other agents or run a gate live.
- The runner is deliberately locked down (guard.py: on the runner path Bash and sub-agent
  spawns are HARD-denied regardless of mode; Red paths denied). It is a monitor, not a
  general worker.
- .claude/agents/ is the single highest-blast-radius path (it defines the whole fleet).
  It is owner-A1-only BY DESIGN. This is a safety feature; the plan does not weaken it.
- A brand-new agent type is not spawnable until the Claude Code process reloads. This is a
  Claude Code limitation, not a setting. No automation removes it.

### The hidden gap
The runner only executes 11 fixed prompts (Eco AM/PM/2h, Assaf cost/fitness/monthly, Rambo
scan, Lital/Eyal compliance, Dalia audit, Yael doc-hygiene, Ido dashboard, Oracle chronicle
-- see integrations/runner/agent-prompts.md). NONE of them reads the board and DOES a queued
task. So "I added it to the board for the next run" currently has no executor behind it for
general work. That is the most important thing to fix.

---

## 3. The three categories of "I can't" -- and what to do about each

Every bounce falls into one of three buckets. The plan treats them differently.

### Bucket A -- FALSE blocks (Eco could do it; only config/wording is in the way). Fix now, low risk.
These need no new power, just small fixes:
1. Cannot read shared/handoff (Shelly's cross-project messages). CAUSE: the bridge read-access
   list for Eco (bridge.py `_AGENT_ACCESS["eco"]`) does not include the shared/ folder, and the
   session's working dir is the repo. FIX: add `C:\Users\Jecki\DEV\shared\handoff` to Eco's
   read scope. WORKAROUND if you would rather not touch the bridge: mirror a read-only copy of
   the handoff folder into the repo. RISK: low -- read-only, no secrets transit (guard already
   secret-scans writes to that path). MITIGATION: read-only; never write secrets there.
2. Verbose re-explaining of limits every time. FIX: a brevity rule + one standard phrasing so a
   block costs one line, not a paragraph (see Move 4). RISK: none.

### Bucket B -- Runner-automatable (plain file work Eco can do, just not in a 120s live chat). Build the executor.
This is the bucket your "add it to the board and it gets done on next wake" idea targets.
Today there is no executor. THE BUILD:
1. A single execution queue (proposed: memory/run-queue.md, or a tagged column on the board).
   Eco appends an item ONLY when you have asked for it over Telegram. Each item states: exact
   files to touch, exact change, and "authorized by jecki <date> via Telegram."
2. A new runner agent-prompt "Eco -- Queue Execution (every cycle)" that: reads the queue,
   performs each item that is within the runner's safe envelope (Read/Write/Edit on allowed
   paths only), marks it done, and reports the result in the next AM/PM brief.
   RESULT: "I added it to the next agent run" becomes literally true for the file-edit class.
RISKS + MITIGATIONS:
- Risk: an autonomous executor doing arbitrary edits widens blast radius.
  Mitigation: it only runs items Eco enqueued from an explicit owner request; the guard still
  enforces Red-path / append-only / SAFE_MODE on every write; the executor is whitelisted to
  Read/Write/Edit and cannot Bash, spawn, touch .claude/agents/, or reach the network.
- Risk: the guard is in SHADOW mode today (logs but does not block -- SEC-0001). An autonomous
  executor is exactly the case where shadow is not good enough.
  Mitigation: gate this build behind flipping GUARD_MODE to ENFORCE (SEC-0001), so the path
  rules actually bite for autonomous writes. Recommend: do not ship the executor until enforce
  is on.
- Risk: two writers race (runner + a live session) on board.md.
  Mitigation: this is already tracked as AUD-001 (file-lock); the executor should use the same
  read-before-write + .lock sentinel.

### Bucket C -- Genuinely desktop-only (agent files, gates, Bash, web/email, reload). Reduce friction; targeted workarounds.
These cannot be made live-on-bridge without weakening real safety lines or fighting a Claude
Code limitation. Options, with the safety tradeoff stated honestly:

1. Email send from Eco's own account (your task T-0037).
   WORKAROUND: install the gmail send tool and grant it to Eco on the bridge AND/OR the runner.
   Then "send this email when I ask" is real on the bridge (per-action), and "draft + send on
   next wake" is real via the queue. This is literally T-0037 -- the plan says prioritize it.
   RISK: email is an external, hard-to-reverse action. MITIGATION: per-action owner confirm
   (never blanket auto-send), plus the customer-comms policy gate (AUD-004 / CS-0001) still
   governs any CUSTOMER email -- tool-enabled is not the same as customer-authorized.

2. Running gates (Rambo/Eyal) and web research (T-0036, T-0039).
   These need sub-agent spawn + web, which the runner forbids and the bridge lacks.
   OPTION C1 (recommended): a SCHEDULED DESKTOP worker session -- Task Scheduler launches a
   full `claude` session (not the restricted runner) that drains a "gate queue," runs the
   Rambo/Eyal reviews, writes the findings, and reports. Same power as you opening a session,
   just automated.
   OPTION C2 (not recommended): loosen the runner guard to allow a narrow Rambo/Eyal-only
   spawn. This re-opens the exact blast-radius the C3 control closed. Avoid.
   RISK of C1: a full automated session CAN write Red paths while the guard is in shadow mode.
   MITIGATION: run the worker only with GUARD_MODE=enforce so Red paths are hard-denied even
   there; keep .claude/agents/ commits OUT of the worker's job list (owner-present only).

3. Editing role files and going live with new agents (T-0038, APS-009 Noa, AUD-005 Yossi).
   Editing .claude/agents/ is owner-A1-only by design, and a NEW agent needs a process reload.
   The reload cannot be automated away. RECOMMENDATION: keep these owner-present, but make the
   handoff one action: a /flush ritual (Move 3) that, in one desktop session, applies every
   queued role-file change you have already approved, then you reload once. Your only touch is
   triggering that session + the reload. Batching 5 pending items into one reload beats five
   separate "next session" promises.

---

## 4. The four moves (what I would actually do)

Move 1 -- One visible queue, split by surface. Add a "Pending actions" section to
memory/owner-dashboard.md (the runner already refreshes it daily). Every deferred item tagged
[bridge-doable] / [runner-queued] / [desktop-needed], with: what, why, approval status. Nothing
is an invisible promise; you can see the whole backlog at a glance.

Move 2 -- Build the runner execution queue (Bucket B). memory/run-queue.md + a new
"Eco -- Queue Execution" runner prompt. Gate it behind GUARD_MODE=enforce (SEC-0001). This is
the change that makes "done on next wake" true for the file-edit class.

Move 3 -- A one-command desktop /flush ritual (Bucket C, items 2-3). When you open Claude Code,
one command drains the desktop queue: runs the queued gates, applies the role-file edits you
have already approved, updates the board + decisions-log, and posts a summary to Telegram. Turns
"shuttle and re-explain N times" into "open, run, approve once, reload once."

Move 4 -- Tighten Eco's Telegram voice + standard deferral phrasing. Fold into the T-0038
role-file edit you already approved: lead with the decision in 1-2 lines; when something is
deferred, say it in ONE line with the surface and queue position ("Queued to the next runner
cycle." / "Needs a desktop session -- #2 in the desktop queue."), not a paragraph of apology.

---

## 5. Decisions I need from you (with my recommendation)

D1. Build the runner execution queue (Move 2)? It is the core of your request, but it means
    Eco edits files autonomously on a schedule. RECOMMEND: yes, AND flip GUARD_MODE to enforce
    first (SEC-0001) so the safety rules actually bite.

D2. Flip GUARD_MODE shadow -> enforce now? Prerequisite for safe autonomy. RECOMMEND: yes, after
    one validation pass of the shadow logs for false denies (SEC-0001 already says this).

D3. Scheduled desktop worker for gates/web (C1) -- build it, or keep gates owner-triggered?
    RECOMMEND: build it, enforce-mode only, with .claude/agents/ commits explicitly excluded.

D4. Prioritize the email-send gate (T-0037) so "send email when I ask" becomes real?
    RECOMMEND: yes -- it removes a whole recurring bounce, and the per-action A1 + CS gate keep
    it safe.

D5. Keep .claude/agents/ commits + new-agent reload owner-present-only (just made one-command
    via /flush), or do you want an automated session allowed to edit the fleet?
    RECOMMEND: keep owner-present. It is the strongest safety line and reload needs you anyway.

---

## 6. What I am NOT proposing (so the safety story is explicit)
- Not giving the bridge or the runner the ability to write .claude/agents/.
- Not giving the runner Bash or sub-agent spawn (keeps the C3 control intact).
- Not auto-sending email or any customer contact without per-action owner approval.
- Not removing the honesty rule -- the goal is fewer SITUATIONS that trigger it, not hiding it.

---

## 7. Honest limits that no plan removes
- A brand-new agent is not live until a Claude Code reload. Noa-class go-lives always cross a
  session boundary; the best we do is batch them and make the reload your single touchpoint.
- Anything truly external (email, public posts, customer contact) stays per-action A1 by red line.
- Until GUARD_MODE is enforce, autonomous writes are governed by behavior + logging only, not by
  hard code. Autonomy should not expand ahead of that flip.
