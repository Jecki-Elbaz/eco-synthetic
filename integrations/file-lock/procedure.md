# File-Lock Sentinel Protocol
# AUD-001 | 2026-07-14 | Shir (DevOps) | Owner A1 (infra sprint envelope, Ido 2026-07-14)

## Why

The runner fans out agents every 4h. Parallel interactive sessions can also write at
any time. Without coordination, the last write wins and a prior agent's updates are
silently lost. Seen live: Ido and Eco both created a T-0045 row simultaneously
(2026-07-14) -- dedup cost manual effort. AUD-001 builds the soft lock to prevent this.

## Sentinel Files (gitignored)

| Protected File | Sentinel Path (project root) |
|---|---|
| memory/board.md | .board.md.lock |
| company/decisions/decisions-log.md | .decisions-log.md.lock |

Both patterns are covered by `.*.lock` in .gitignore. Never commit sentinel files.

## Protocol (any writer must follow this)

1. Check for the sentinel file in the project root.
   - Absent: proceed to step 2.
   - Present, mtime < 30s ago: another writer is active. Wait 1s and re-check.
     Stop waiting after 30s total (soft fail -- proceed with caution, log the
     override). NEVER block forever.
   - Present, mtime >= 30s ago: stale (writer crashed). Delete it, proceed to
     step 2.
2. Write the sentinel: ISO timestamp + your identity (agent name + task).
3. Perform your write to the protected file.
4. Delete the sentinel immediately after the write completes.

Stale timeout (30s) rationale: a typical board.md Write/Edit tool call takes < 5s.
30s gives ample buffer before assuming the writer died. If single-agent sessions
consistently exceed 30s between acquiring and releasing, raise STALE_TIMEOUT_S in
file_lock.py and flag Ido.

## Runner Path (automated)

runner.py imports file_lock.py via importlib (the directory name is hyphenated) and
wraps Eco and Oracle jobs in acquire_file_lock() context managers. The runner's main()
finally block calls release_all_held_locks() to clean up after any crash.

Agents wrapped (runner path, live 2026-07-14):
  - Eco -> board.md lock + decisions-log.md lock
  - Oracle -> decisions-log.md lock

Pattern used in runner.py:
    with contextlib.ExitStack() as stack:
        for tgt in _AGENT_LOCKS.get(job["agent"].lower(), []):
            stack.enter_context(
                acquire_file_lock(tgt,
                                  writer=f"{job['agent']}:{job['key'][:40]}",
                                  timeout=30)
            )
        res = run_job(job, mode, dry)

The lock is held for the duration of the spawned claude subprocess. This serializes
entire agent jobs (coarse-grained), which is correct for runner-to-runner conflicts.
Fine-grained per-write locking inside the agent is not possible without agent-side
tooling (see limits below).

## Interactive Sessions (manual procedure)

Before writing board.md or decisions-log.md in a Claude Code or Telegram session:

1. Read the sentinel file: <project-root>/.board.md.lock (or .decisions-log.md.lock).
   - Absent: proceed to step 2.
   - Present and recent (< 30s old): wait ~5s, re-read. After 30s total: proceed and
     log: "OVERRIDE: lock timeout, proceeding without lock (board.md)".
   - Present and old (>= 30s): stale -- ignore it.
2. Write the sentinel (Write tool on the path .board.md.lock in project root):
   Content: "<ISO timestamp> | writer=<AgentName>:<task>"
3. Write to the protected file (your actual board.md or decisions-log.md change).
4. Delete the sentinel (unlink .board.md.lock).

If your session ends or crashes before step 4, the stale-timeout (30s) protects
other writers -- they will clear the stale sentinel automatically.

## agent-prompts.md additions still needed (Eco applies per task envelope)

Add this block to the prompt of each agent that writes board.md or decisions-log.md
on the runner path. The runner wraps jobs externally, but the prompt note is
defense-in-depth for interactive sessions running the same agent logic:

--- BEGIN BLOCK ---
SHARED-FILE WRITE RULE: before writing to memory/board.md or
company/decisions/decisions-log.md, check for .board.md.lock or
.decisions-log.md.lock in the project root (<project-root>/.board.md.lock).
If present and < 30s old: wait up to 30s before writing. Write your sentinel
first, then the file, then delete the sentinel. See
integrations/file-lock/procedure.md.
--- END BLOCK ---

Agents needing this block added:
  - Eco (2h check-in + AM brief + PM summary): writes board.md
  - Oracle (daily chronicle): writes decisions-log.md
  - Any future agent whose prompt instructs it to update board.md or append to
    decisions-log.md

## Limits (what this does NOT cover)

1. Agents that bypass the protocol (e.g. interactive Claude.ai web sessions that do
   not read the procedure) can still race. Full protection requires every write-path
   caller to participate.

2. Two agent subprocesses spawned by the SAME runner cycle are serialized by the runner
   job loop (sequential). Cross-cycle races are covered by the lock.

3. If the sentinel approach proves insufficient (e.g. agent runs consistently exceed
   STALE_TIMEOUT_S), escalate to Ido. Portalocker (gated item, requires Security gate)
   is the next-tier option.

## Validation (py_compile + smoke test)

  python -m py_compile integrations/file-lock/file_lock.py
  python integrations/file-lock/file_lock.py   # runs _smoke_test()
  python integrations/runner/runner.py --dry-run  # confirms no import error

Concurrent-lock test (manual):
  # Terminal 1: add a time.sleep(10) inside the with block in a test script
  # Terminal 2: run concurrently and observe "WARN: .board.md.lock held within
  # stale window; waited Ns" message confirming only one writer proceeds at a time.
