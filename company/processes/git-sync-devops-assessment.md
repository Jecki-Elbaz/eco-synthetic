# Git-Sync DevOps Assessment -- T-0021 (DevOps leg)

Author: Shir (DevOps, L4)
Date: 2026-06-16
Task: T-0021 (Ido lead)
Status: Assessment complete; implementation pending owner A1

---

## 1. What the existing mechanism covers (verified from source files)

### Hook (verified: .claude/settings.json)

```
git pull --ff-only origin master 2>&1 | tail -2 || true
```

Fires on: every UserPromptSubmit event in a cloud Claude Code session.

What it does:
- Pulls master from origin into the current working tree.
- Uses --ff-only, so it refuses to merge if the local branch has diverged;
  it will not create a merge commit or overwrite uncommitted local changes.
- Pipes stderr+stdout through tail -2 so only the last two lines are visible.
- || true suppresses the non-zero exit code so Claude Code does not treat it
  as a hook failure.

What it covers:
- Remote-to-cloud direction, master branch only.
- Keeps the cloud session current with whatever was pushed to origin/master
  before the prompt fires.
- Works correctly when the cloud session is on master and origin/master is
  ahead: fast-forward succeeds silently.

### Local agents (verified: integrations/telegram-bridge/bridge.py, _AGENT_TOOLS)

Both Eco and Shelly are granted: Read, Write, Edit.
Neither has Bash, git, or any shell-execution tool in the bridge session.
The bridge spawns claude CLI with --allowedTools Read,Write,Edit.
There is no git pull, git push, or git commit call anywhere in bridge.py.

---

## 2. What the mechanism does NOT cover

### 2a. Feature-branch noise (confirmed by T-0021 board note)

When the cloud session is on any branch other than master, --ff-only fails
with "Not possible to fast-forward, aborting" and exits non-zero.
The || true swallows the exit code. The error text still flows through tail -2
and appears in hook output. It is harmless but noisy and technically wrong:
the hook is attempting a pull it cannot complete, on every single prompt.

### 2b. Local clone -- no git at all

Eco and Shelly run through the bridge. The bridge's _AGENT_TOOLS grants only
Read, Write, Edit. This means:

- Any file an agent writes locally via the bridge (board.md update, wiki edit,
  log append) is written to the local disk clone only.
- That local change is never staged, never committed, never pushed to origin.
- Remote changes pushed to origin by cloud sessions are never pulled into the
  local clone.
- The local and remote clones drift apart silently over time.

This is the root cause of the "Eco local work was never pushed" incident noted
in T-0021 board notes and the exoneration entry of 2026-06-15.

### 2c. Wake-up sessions

The 2h scheduled wake-up in bridge.py fires call_claude_cli() with the same
_AGENT_TOOLS subset (Read, Write, Edit). No git pull precedes it. If the agent
reads board.md at wake-up time, it reads the local stale version.

### 2d. Cloud-to-local direction

There is currently no mechanism to push cloud-side commits back to the local
machine automatically. The local clone only receives changes if someone manually
runs git pull on that machine.

---

## 3. Gap A -- Hardened hook command (master-only guard)

Current (fires on every branch, fails on non-master):
```
git pull --ff-only origin master 2>&1 | tail -2 || true
```

Proposed hardened command:
```
git fetch origin 2>&1 | tail -1; [ "$(git branch --show-current)" = "master" ] && git merge --ff-only origin/master 2>&1 | tail -1 || true
```

How it works:
1. git fetch origin -- unconditionally fetches remote state. Safe on any
   branch; never modifies working tree. One-line output captured.
2. Checks current branch with git branch --show-current (no subprocess
   ambiguity, exits cleanly on detached HEAD returning empty string).
3. If and only if the branch is master: runs git merge --ff-only origin/master.
   On any other branch: the [ ... ] test fails, the && short-circuits, || true
   handles the non-zero exit from the test. No error output, no failed merge.

This satisfies the CLAUDE.md red line 3 constraint: no destructive commands.
--ff-only never rewrites history; it only moves HEAD forward if the remote is
strictly ahead.

To apply: owner (A1) edits .claude/settings.json, replacing the hooks.command
value with the string above. Agent cannot write settings.json (blocked per
classifier).

---

## 4. Gap B -- Local-side sync (Eco and Shelly on the bridge)

### Problem statement

The bridge grants Read/Write/Edit but no Bash or git. Every file written by a
bridge agent lands on local disk and stops there. The local clone is a write
sink with no outbound path to origin.

### Three options

#### Option 1: Scheduled pull-commit-push job on the local machine

A cron job (Linux) or Task Scheduler job (Windows) runs on the machine hosting
the bridge, on a fixed cadence (e.g. every 15 minutes or every hour).

Script logic (pseudocode, no destructive commands):
  cd <repo_root>
  git fetch origin
  git merge --ff-only origin/master     # pull remote changes first
  if [ $? -ne 0 ]; then
    echo "CONFLICT: ff-only failed, human review needed" | mail/log
    exit 1
  fi
  git add -p <allowed paths only>       # stage only agent-writable paths
  git diff --cached --quiet || git commit -m "auto: local agent sync $(date -u)"
  git push origin master

Risk: if a conflict occurs (local and remote both modified same file), the
--ff-only refusal halts and alerts; no auto-merge or force-push. Human resolves.
Must be scoped to agent-writable paths only (memory/, integrations/) -- role
files, sources/, .env never included.
Gate: A2 to implement (scheduled job on infra); A1 not required unless it
involves new tool adoption.

#### Option 2: Bridge-integrated pull-before-read + commit-push-after-write

Add two git calls into bridge.py itself, via subprocess, scoped to specific
operations:
- On session start (before loading board.md or agent prompt): subprocess git
  fetch + git merge --ff-only.
- After any Write or Edit tool call: subprocess git add <file> + git commit +
  git push.

Risk: adds latency to every write (commit + push in the hot path). If push
fails (network, conflict), the write succeeds locally but the push error must
surface cleanly without crashing the agent response. Adds complexity to
bridge.py. Requires explicit A2 approval before adding Bash-equivalent
subprocess calls to the bridge.
Gate: A2 (architecture change to integration); owner notified.

#### Option 3: Read-only local, write-via-PR (safest)

Local bridge agents are read-only. Any change they need to persist is returned
as output to the owner (jecki) via Telegram. Owner applies it in the cloud
session (which has full Write/Edit + the auto-pull hook). Cloud session commits
and pushes. Local clone syncs on next scheduled pull (or manual pull).

Risk: more friction for the owner. Agent cannot autonomously update board.md
or append to log.md without owner relay. Does not scale well once agent
autonomy increases.
Gate: A3 (process rule change only; no code change).

### Recommended option: Option 1 (scheduled pull-commit-push job)

Rationale:
- No changes to bridge.py code or agent permissions.
- No latency added to agent responses.
- Conflict detection is safe: --ff-only halts and alerts rather than
  auto-merging.
- Cadence is tunable independently of agent activity.
- Paths can be scoped to exactly the agent-writable set.
- Does not introduce destructive commands (no force-push, no reset).
- Aligns with existing git workflow: commits are traceable, messages are
  consistent, log is clean.

Implementation sketch (Linux cron, requires owner A1 for scheduling on the
bridge host):
  # /etc/cron.d/eco-git-sync or user crontab
  */15 * * * * cd /path/to/eco-synthetic && \
    git fetch origin && \
    git merge --ff-only origin/master && \
    git add memory/ integrations/ && \
    { git diff --cached --quiet || git commit -m "auto: local bridge sync $(date -u +%Y-%m-%dT%H:%M:%SZ)"; } && \
    git push origin master

Alert on failure: pipe stderr to a log file or send to owner channel.
No --force, no --reset, no destructive flags. Halts cleanly on conflict.

Gate required: A1 (new scheduled process on production host; touches git push
to master). Owner approves before implementation.

Wake-up sessions: the scheduled pull runs independently of wake-up cadence
(2h). At 15-minute cadence the local clone is at most 15 minutes stale when
a wake-up fires. Acceptable for current board.md/log.md access patterns.

---

## 5. Conflict and file-ownership rules

### Ownership by file

| File | Owner | Rule |
|------|-------|------|
| memory/board.md | Eco (orchestrator) | Each agent writes its own rows only. Eco writes Eco rows and orchestrates. Append new rows; never rewrite another agent's row without that agent's consent or Ido routing. |
| memory/log.md | All agents (append-only) | Append only. Never truncate, rewrite, or delete lines. Chronological order. |
| company/decisions/decisions-log.md | Append-only (all) | Append new entries at the bottom only. No retroactive edits. CLAUDE.md red line 6. |
| .claude/agents/*.md | Owner (A1) | No agent writes these. Read allowed per role. Changes require A1. |
| sources/* | Archived (read-only) | Never write. CLAUDE.md red line 2. |
| integrations/ | Shir (under Ido approval) | Read+Write per role file. Changes go through Ido approval. |
| memory/wiki/* | Eco (A3 autonomous) | Eco maintains; other agents read. |
| company/processes/ | Ido (R&D lead) | Assessment files like this one written by R&D agents under Ido task. |

### Conflict prevention rules

1. Fast-forward only. No merge commits to master. If a fast-forward fails,
   halt and alert the owner -- do not auto-merge.

2. No simultaneous writes to the same file from cloud and local in the same
   time window. The scheduled job pulls before committing local changes. If
   the pull fails (remote ahead and conflict), the local commit is held and
   owner resolves manually.

3. Append-only files (log.md, decisions-log.md) are the lowest-risk targets
   because appending to different ends of the same file does not produce a
   semantic conflict even if git sees a textual one. Still: pull before
   appending is the rule.

4. Board.md row discipline. Each agent owns its rows. Cloud and local agents
   should not write the same row concurrently. If a task row is being worked
   on locally, the cloud session should not update the same row until the local
   commit is pushed.

5. Role files are owner-only (A1). Neither cloud nor local agents write them.
   No conflict risk from agents.

6. No last-writer-wins on any governance file (decisions-log.md, gate-register.md,
   access-matrix.md). These are append-only or owner-gated. A conflict on these
   files means a human review is required before resolution.

7. PR-gated changes for architecture or stack files (CLAUDE.md, settings.json,
   any file under company/governance/). Direct pushes to master for these
   require owner awareness; prefer a branch + PR so the diff is reviewable.

---

## 6. Summary for Ido

Current state:
- Cloud sessions on master: auto-pull works correctly.
- Cloud sessions on feature branches: hook fires, --ff-only fails, || true
  swallows it. Noisy but harmless.
- Local bridge agents (Eco, Shelly): no git at all. All writes stay local.
  Remote changes never reach them. Root cause of the 2026-06-15 incident.

Hardened hook (immediate, A1 to apply):
  git fetch origin 2>&1 | tail -1; [ "$(git branch --show-current)" = "master" ] && git merge --ff-only origin/master 2>&1 | tail -1 || true

Local sync (recommended, A1 to schedule):
  Scheduled pull-commit-push job, 15-minute cadence, scoped to memory/ and
  integrations/, --ff-only only, halts on conflict.

Conflict rules:
  ff-only enforcement + append-only discipline + per-agent row ownership +
  PR-gated governance files.

This assessment is input to Ido's consolidated recommendation (T-0021).
Implementation requires owner A1.

---

End of assessment.
