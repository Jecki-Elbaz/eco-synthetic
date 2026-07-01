# DRAFT -- Eco Queue-Execution runner job (NOT ARMED)

This block is the runner-lane executor. It is kept OUT of the live agent-prompts.md on
purpose. Arming = paste this one block into agent-prompts.md AFTER owner A1 to flip
GUARD_MODE to enforce (SEC-0001). The runner already runs in --mode act, so once the block
is live it fires every 2h with Read/Write/Edit. Nothing else is needed.

Safety model: the runner CANNOT Bash, spawn sub-agents, reach the network, or write
.claude/agents/ (guard.py hard-denies all of these on the runner path regardless of mode).
So the worst this executor can do is a file Read/Write/Edit on an allowed path -- and in
enforce mode the guard also blocks Red paths, append-only violations, and SAFE_MODE writes.

---

## Eco -- Queue Execution (every 2h, act)
Telegram-facing: CONDITIONAL (only report items actually completed or newly blocked)

```
SCHEDULED RUNNER TASK: EXECUTE THE RUN-QUEUE

You have been woken by the scheduled runner. No owner input is available -- act on the file.

Read memory/run-queue.md. Process ONLY rows where lane = runner AND status = ready.
Do at most 3 such rows this cycle (keep the run bounded). For each one:

1. SANITY CHECK before doing anything:
   - It must have a non-empty authorized_by. If not -> set status=blocked, result="no
     authorization recorded", and skip. Never run an unauthorized item.
   - The "exact action" must be a plain file Read/Write/Edit on an allowed path
     (memory/, company/, dashboards/, projects/, marketing/, integrations/). If the action
     needs Bash, a web call, a gate/sub-agent, email/external send, a session reload, or a
     write under .claude/agents/ -> this is a DESKTOP-lane item filed on the wrong lane.
     Set status=blocked, result="needs desktop lane: <reason>", and skip. Do NOT attempt it.

2. EXECUTE the exact action using Read/Write/Edit only. Read-before-write. If the target is
   append-only (decisions-log, log.md, log.jsonl, agent-runs.jsonl) only append. If anything
   is ambiguous or you are not confident you can do it correctly and safely, set
   status=blocked with a one-line reason instead of guessing (red lines 10/11).

3. RECORD the outcome in memory/run-queue.md: set status=done and write a one-line result
   (what changed, which file). If you could not finish, status=blocked + reason. Never write
   done unless the Write/Edit actually succeeded.

After processing, produce output for jecki ONLY if something changed:
- List each item you completed (id + one line) and each newly blocked item (id + reason).
- If you completed nothing and blocked nothing, your reply must END with the exact line
  NO_ACTIONABLE_CONTENT (the runner suppresses the Telegram send on that line).

Format: plain prose, max 120 words. No markdown tables. No ack line.
```
