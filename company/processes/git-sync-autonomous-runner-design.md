# Git-Sync Autonomous Runner Design -- T-0021 (DevOps leg, autonomous extension)

Author: Shir (DevOps, L4)
Date: 2026-06-16
Task: T-0021 (Ido lead)
Status: Design proposal; all implementation items listed are A1-gated
Inputs: git-sync-devops-assessment.md, git-sync-recommendation.md,
        .claude/settings.json (verified), integrations/telegram-bridge/bridge.py (verified)
Owner ruling: ZERO human touch; halt-for-human-review rejected;
              autonomous Rambo review closes the loop instead.

---

## 0. Why the previous design was rejected

The prior recommendation (scheduled pull-commit-push job + tripwire that halts
and waits for a human on control-plane changes) still required a human to unblock
the sync after quarantine. The owner ruled: fully autonomous, zero human touch.

The blocker: a plain shell script or cron job cannot invoke Rambo (an LLM agent).
The solution: the runner is not a cron job. It is a SCHEDULED CLAUDE SESSION --
the same environment this repo already uses for cloud sessions. Inside that session
the runner can use the Agent tool to call Rambo, read the diff output, and branch
on the verdict autonomously.

---

## 1. The Loop (remote->cloud direction, fully autonomous)

### 1.1 Session type and trigger

A scheduled Claude Code session fires on a fixed cadence (recommended: every 15
minutes). This is the same mechanism as bridge.py's 2-hour wake-up, but it runs
in a CLOUD session with full tooling (Read, Write, Edit, Bash(git *), Agent tool).
It does not require a human prompt to fire; it is triggered by the scheduler
(cloud session scheduler, analogous to a cron trigger but launching a full Claude
process with the runner prompt as system context).

The session runs as a dedicated runner agent, not as Eco or Shelly. Call it
"GitSyncRunner." Its only job is the sync loop. It does not answer user messages.

### 1.2 Step-by-step loop (remote->cloud)

Step 1 -- FETCH
  git fetch origin
  Result: FETCH_HEAD updated. Working tree unchanged. Safe on any branch.

Step 2 -- DIFF
  Compute: git diff HEAD..origin/master --name-only
  Partition the changed file list into two planes:

  DATA-PLANE paths (auto-mergeable):
    memory/
    projects/
    company/processes/
    company/decisions/  (append-only; still data-plane for merge purposes)
    integrations/       (Shir-owned; safe to auto-merge after fetch)
    logs/

  CONTROL-PLANE paths (require Rambo review before merge):
    .claude/
    CLAUDE.md
    company/governance/
    scripts/
    Any file not in the data-plane list above

  Classification rule: if ANY changed file is control-plane, the entire incoming
  commit set is treated as control-plane. Mixed commits are not split.

Step 3a -- DATA-ONLY PATH
  If diff contains only data-plane files:
    git merge --ff-only origin/master
    If merge succeeds: log "auto-merge OK: data-only" with timestamp and file list.
    If ff-only fails (divergence): QUARANTINE (see Step 4).
    No Rambo call. No notification. Fully silent on clean success.

Step 3b -- CONTROL-PLANE PATH
  If diff contains any control-plane file:
    Capture full diff text: git diff HEAD..origin/master (text content, not just names).
    Invoke Agent tool -> Rambo with the following prompt:

      "Rambo: autonomous git-sync review. The following diff is about to be
      merged into the live working tree. Classify each changed file as SAFE or
      RISK. Return exactly one of: VERDICT: CLEAR or VERDICT: QUARANTINE.
      If QUARANTINE, include a one-line reason per risky file. No other output.
      Diff follows:\n<diff text>"

    Parse Rambo's response for "VERDICT: CLEAR" or "VERDICT: QUARANTINE".

    If CLEAR:
      git merge --ff-only origin/master
      Log: "control-plane merge approved by Rambo: <file list>"
      If ff-only fails: QUARANTINE.

    If QUARANTINE (or parse failure, or Rambo session error):
      Go to Step 4.

Step 4 -- QUARANTINE
  Do NOT merge origin/master into HEAD.
  Create a quarantine ref:
    git fetch origin master:refs/quarantine/YYYY-MM-DDTHH-MM-SSZ
  This preserves the incoming commits on a local ref without touching HEAD.
  Log entry (append to memory/log.md):
    "QUARANTINE <timestamp> reason=<reason> ref=refs/quarantine/<ts> files=<list>"
  Notify via bridge outbound channel (see Section 3 for mechanism).
  Leave HEAD unchanged. Session exits cleanly.

### 1.3 Fail-closed invariant

At no point does the runner merge without either:
  (a) confirming diff is data-plane only, OR
  (b) receiving VERDICT: CLEAR from Rambo.

Any ambiguity, error, or timeout defaults to QUARANTINE. This is the
fail-closed property the owner requires.

---

## 2. All Three Directions

### Direction A: Remote -> Cloud (scheduled runner session)

Covered by Section 1 above.
Who runs it: scheduled cloud session (GitSyncRunner).
Cadence: every 15 minutes.
Gate: A1 to schedule the cloud session.

### Direction B: Local-Bridge -> Remote (Eco/Shelly writes reach the repo)

Problem: Eco and Shelly write files via bridge.py (Write/Edit tools) to the
local disk clone. The local clone has no git. Those writes never reach origin.

Solution: A git daemon process on the bridge host. This is NOT a cron job that
runs git commands blindly. It is a small Python script (call it bridge-git-sync.py)
that runs as a persistent background process alongside bridge.py. It does two things:

  Watch: uses Python's watchdog library (or polling loop) to detect file changes
  in the agent-writable paths: memory/ and integrations/. Watchdog fires an event
  on any Write or Edit that the bridge agents make.

  Commit-push (on change detected, with debounce of 30 seconds to batch rapid writes):
    git add memory/ integrations/
    Check: git diff --cached --quiet
    If staged changes exist:
      git commit -m "auto: bridge agent sync <ISO-8601 timestamp>"
      git push origin master
      If push fails (conflict, network): log to logs/bridge-sync.log; retry up
      to 3 times with exponential backoff (2s, 4s, 8s); if all retries fail,
      log BLOCKED status and halt until next file change event.

  Pull (on startup and before every commit attempt):
    git fetch origin
    Check for control-plane changes in origin/master vs HEAD (same grep as Section 1).
    If control-plane changes detected: log BLOCKED, do not pull, do not commit.
    Wait for next poll cycle. Resolution requires the cloud runner to quarantine
    or clear the incoming control-plane diff first; after that succeeds, the next
    bridge-git-sync.py poll will see a clean ff-only pull and proceed.
    If data-plane only: git merge --ff-only origin/master. If ff-only fails: log
    BLOCKED, do not commit local changes until conflict is cleared.

Why this is better than a cron job:
  - Responds to actual file changes, not to a fixed clock tick.
  - Debounce prevents N commits per rapid burst of agent writes.
  - Pull-before-commit prevents the local clone from diverging silently.
  - Persistent process means no missed events between cron intervals.

The bridge-git-sync.py script does NOT call Rambo. It only handles the
local-to-remote direction, which is agent-writable data-plane paths only. Control-
plane files (anything outside memory/ and integrations/) are never staged by
bridge-git-sync.py.

Gate: A1 to deploy bridge-git-sync.py on the bridge host. A2 to develop and
commit the script. Rambo must clear the script before deployment.

### Direction C: Remote -> Local-Bridge (cloud commits reach Eco/Shelly)

Problem: when the cloud runner or a cloud session commits and pushes to
origin/master, the local clone (and therefore Eco/Shelly reads) is stale.

Solution: bridge-git-sync.py (same process as Direction B) includes a periodic
pull on a fixed cadence independent of the change-watch loop. Recommended: every
5 minutes. This is purely a git fetch + ff-only merge on data-plane-only diffs.
If a control-plane diff arrives from origin, bridge-git-sync.py logs BLOCKED and
waits -- the cloud runner will quarantine or approve it; once the cloud runner
merges it, the next bridge-git-sync.py poll will see the merged HEAD and pull
cleanly.

This means Eco and Shelly read files that are at most 5 minutes stale from
origin/master under normal conditions. The 2-hour bridge wake-up sees a clone
that is at most 5 minutes stale. Acceptable for board.md and log.md access
patterns (confirmed in prior assessment).

---

## 3. Cadence and Where Things Run

| Component              | Runs on         | Trigger                        | Cadence          |
|------------------------|-----------------|--------------------------------|------------------|
| GitSyncRunner session  | Cloud (Claude)  | Scheduler (cloud-side)         | Every 15 minutes |
| Rambo review (Agent)   | Cloud (inside GitSyncRunner session) | On control-plane diff | Per-diff |
| bridge-git-sync.py (watch + push) | Bridge host (alongside bridge.py) | File change event (watchdog) | Debounce 30s |
| bridge-git-sync.py (pull) | Bridge host | Fixed poll                     | Every 5 minutes  |

Cloud-side scheduler: the same mechanism that already supports scheduled Claude
Code sessions. GitSyncRunner is configured as a scheduled session with a dedicated
system prompt (the runner prompt, committed to scripts/git-sync-runner-prompt.md).
It does not interact with Telegram. It writes only to memory/log.md and to
quarantine refs.

Bridge-host side: bridge-git-sync.py runs as a subprocess launched by bridge.py
on startup (asyncio.create_task wrapping a subprocess call, or a separate
systemd/screen unit). It commits and pushes using the git credentials already
configured on the bridge host (the same credentials used for any manual git push).
No new credentials required.

---

## 4. Safety Properties

### 4.1 No destructive commands (CLAUDE.md red line 3)

Commands used by the runner and bridge-git-sync.py:
  git fetch origin                       -- read-only, never modifies working tree
  git diff ...                           -- read-only
  git merge --ff-only ...               -- moves HEAD forward only; refuses on diverge
  git add memory/ integrations/          -- stages files in scoped paths only
  git commit -m "..."                    -- creates a commit; not destructive
  git push origin master                 -- pushes; blocked by settings.json from --force
  git fetch origin master:refs/quarantine/<ts>  -- creates a local ref; not destructive

Commands explicitly NOT used:
  git reset --hard          (blocked)
  git push --force          (blocked by settings.json deny rule + not in runner)
  git rebase                (never used)
  rm / DROP TABLE           (never used)
  git merge (without --ff-only) (never used; runner always uses --ff-only)

### 4.2 ff-only enforcement

Every merge in every direction uses --ff-only. If the local branch has diverged
from origin/master in a way that cannot be fast-forwarded, the merge is refused.
The runner logs the failure and quarantines rather than creating a merge commit.
This preserves a linear master history.

### 4.3 Scoped paths

bridge-git-sync.py stages ONLY memory/ and integrations/.
GitSyncRunner merges the full origin/master, but only after Rambo clears control-
plane changes or the diff is confirmed data-plane only.
Neither component ever stages .env, sources/, .claude/agents/, or company/governance/
directly. Those paths can only change via owner-initiated commits.

### 4.4 Quarantine ref discipline

Quarantine refs live at refs/quarantine/<timestamp>. They are not branches. They
do not affect HEAD or master. They persist until the owner explicitly deletes them
(git update-ref -d refs/quarantine/<ts>) after resolving the issue.
Quarantine refs accumulate; a backlog is a visible signal (see Failure Modes).

---

## 5. Failure Modes

### 5.1 Network failure (fetch fails)

GitSyncRunner: git fetch exits non-zero. Runner logs "FETCH_FAILED <timestamp>"
to memory/log.md. Session exits. Next scheduled session (15 minutes later)
retries. No merge attempted. No state change. Fail-closed.

bridge-git-sync.py: same. Fetch failure is logged. Push is skipped for that
cycle. Next poll retries. Local changes accumulate on disk and will be committed
on the next successful push cycle. No data is lost (files are on local disk).

### 5.2 ff-only merge conflict (local and remote diverged)

GitSyncRunner: merge --ff-only fails. Runner creates a quarantine ref for the
incoming state, logs CONFLICT, and exits. The cloud working tree remains at the
last known good HEAD. Notification sent.

bridge-git-sync.py: merge --ff-only of incoming remote changes fails. Bridge
logs BLOCKED. Local agent writes are NOT committed to a dirty tree. The bridge-git-sync.py
process pauses the commit loop and retries pull every 5 minutes. Agent reads will
see stale data until the conflict is resolved. No corrupt state.

Resolution path (owner action): owner inspects the quarantine ref and the
divergence, manually resolves, and pushes a clean merge commit. On the next
cycle the runner and bridge-git-sync.py see a clean ff-only path and resume.

### 5.3 Quarantine backlog

If multiple control-plane diffs arrive in succession and Rambo quarantines them
all, quarantine refs accumulate. bridge-git-sync.py and GitSyncRunner continue
to operate on the last clean HEAD. Data-plane changes continue to sync normally
(since HEAD is clean for data paths). Control-plane changes stack up on
refs/quarantine/*.

Detection: memory/log.md accumulates QUARANTINE lines. A monitoring rule (to be
configured separately) can alert the owner if more than N quarantine refs exist
or if the most recent quarantine is older than T hours.

No automatic resolution of a quarantine backlog. Owner clears it explicitly.
This is correct: a backlog of quarantined control-plane changes means something
unusual is arriving at origin/master and the owner should know.

### 5.4 GitSyncRunner session itself fails (crash, timeout, Rambo unreachable)

If the GitSyncRunner session fails before completing its loop:
  - No merge has been attempted (fail-closed: merge only happens at the END of
    the loop after all checks pass).
  - No state change to the working tree.
  - The scheduler fires again in 15 minutes.
  - If Rambo was unreachable (Agent tool failure), the runner treats that as
    VERDICT: QUARANTINE and creates a quarantine ref before exiting. It does not
    leave the diff in a limbo state where neither merge nor quarantine happened.

Rambo unavailability rule: if the Agent tool call to Rambo returns an error or
times out, the runner MUST quarantine the incoming diff. It must never fall through
to a merge on Rambo failure. This is the single most important fail-closed rule
for the control-plane path.

### 5.5 bridge-git-sync.py crash

If bridge-git-sync.py crashes:
  - Local agent writes accumulate on disk (no data loss).
  - No push occurs until the process restarts.
  - Local clone does not receive remote updates until the process restarts.
  - bridge.py continues to serve Telegram messages normally (it is independent).

Detection: bridge-git-sync.py should be supervised (systemd unit or a watchdog
process). On crash, the supervisor restarts it. Restart log line goes to
logs/bridge-sync.log. Alert if restart count exceeds threshold.

On restart, bridge-git-sync.py does a pull first, then resumes watching. Any
accumulated local writes are committed and pushed in the first post-restart cycle.

### 5.6 Push rejected (non-network; e.g. remote is ahead due to race)

Two components can push to origin/master: GitSyncRunner (remote->cloud merges
that GitSyncRunner itself pulls) and bridge-git-sync.py (local->remote pushes).
A push race is possible.

Resolution: bridge-git-sync.py retries up to 3 times. Each retry does a fresh
fetch + ff-only merge first, then re-stages and re-pushes. If all 3 retries fail,
it logs PUSH_FAILED and waits for the next file-change event or poll cycle.
GitSyncRunner does not push (it only merges local HEAD from remote; it does not
originate new commits). So the push race is only between bridge-git-sync.py
instances if multiple bridge hosts exist (not current topology) or if the owner
pushes manually in a window that overlaps bridge-git-sync.py.

---

## 6. Pieces to Build

The following concrete artifacts must be created before the autonomous runner
can be deployed. None of these may be executed or deployed without A1.

| # | Artifact | Location | Gate | Who builds |
|---|----------|----------|------|------------|
| 1 | GitSyncRunner system prompt | scripts/git-sync-runner-prompt.md | A2 (Ido) + Rambo clearance | Shir |
| 2 | Quarantine-and-notify logic (runner session prompt instructions) | included in artifact 1 | same | Shir |
| 3 | bridge-git-sync.py (watchdog + commit/push + periodic pull) | integrations/telegram-bridge/bridge-git-sync.py | A2 (Ido) + Rambo clearance | Shir |
| 4 | Notification channel (quarantine alert) | bridge-git-sync.py notifies via Telegram bot send_message to owner chat | A2 (Ido) | Shir |
| 5 | Cloud session scheduler config (schedule GitSyncRunner every 15 min) | owner-configured in Claude Code scheduler | A1 (owner) | Owner |
| 6 | logs/ directory creation on bridge host | manual mkdir by owner | A1 (new path on production host) | Owner |
| 7 | systemd unit (or equivalent supervisor) for bridge-git-sync.py | /etc/systemd/system/bridge-git-sync.service | A1 (production host change) | Owner/Shir |
| 8 | Updated .claude/settings.json hook (fetch-only per Ido recommendation) | .claude/settings.json | A1 (owner-only file) | Owner |

Rambo must clear artifacts 1 and 3 before they are committed or deployed.
This is the same Rambo-clearance requirement already established in
git-sync-recommendation.md Section 5.

---

## 7. What Requires Owner A1

Per constitution §3 and CLAUDE.md red line 7, the following items are A1-gated
and cannot proceed without explicit owner approval in the relevant session:

1. Scheduling the GitSyncRunner as a recurring cloud session (new automated
   process that touches master on a production repo).
2. Deploying bridge-git-sync.py on the bridge host (new process on production
   host; touches git push to master).
3. Creating the systemd unit (or equivalent supervisor) for bridge-git-sync.py.
4. Creating the logs/ directory on the bridge host (production host filesystem
   change).
5. Editing .claude/settings.json to replace the current hook (owner-only file;
   agent cannot write it).

Items that are A2 (Ido authority, owner notified):
- Developing and committing scripts/git-sync-runner-prompt.md.
- Developing and committing integrations/telegram-bridge/bridge-git-sync.py.
- Rambo review invocations for both scripts.

---

## 8. What This Design Does NOT Change

- bridge.py: no edits. Agent tools remain Read, Write, Edit. No Bash added.
  bridge-git-sync.py is a separate process; bridge.py does not call it.
- .claude/agents/*.md: no edits. GitSyncRunner is a session prompt, not a new
  agent file. (If the owner decides to formalize it as an agent file, that is A1.)
- settings.json deny rules: no changes. git push --force and git reset --hard
  remain blocked.
- Rambo's role: Rambo is invoked ON DEMAND by the runner, not given any new
  standing access. Rambo's existing role and scope are unchanged.

---

## 9. Summary for Ido

System state: this document is a design proposal. Nothing is deployed.

Design in brief:
  GitSyncRunner (cloud scheduled session, every 15 min) handles remote->cloud
  direction. It classifies each incoming diff: data-only diffs auto-merge via
  ff-only; control-plane diffs go to Rambo (Agent tool call) for an autonomous
  CLEAR/QUARANTINE verdict. QUARANTINE creates a refs/quarantine/<ts> ref and
  logs; it never blocks the runner from exiting cleanly or the next cycle from
  running. bridge-git-sync.py (bridge host persistent process) handles
  local->remote (Eco/Shelly writes reach origin) and remote->local (origin
  changes reach local clone, 5-minute poll). All merges are ff-only. No destructive
  commands. No human step in the loop.

Concrete pieces to build: 8 artifacts (see Section 6).
A1 items before deployment: 5 (see Section 7).
A2 items Ido can approve now: 2 scripts + 2 Rambo review invocations.

This design is input to Ido's consolidation. Deployment requires owner A1.

---

End of autonomous runner design.
