# PROPOSAL -- not deployed. Deployment is owner A1 per git-sync-autonomous-recommendation.md.
#
# Git-Sync Autonomous Gate -- Operator Runbook
#
# Author: Shir (DevOps, L4)
# Date: 2026-06-16
# Task: T-0021 (Phase A BUILD artifact)
# Audience: owner (jecki), Ido (VP R&D), Rambo (Security)
#
# This runbook covers:
#   1. Bootstrap (one-time owner step -- the unavoidable A1 action)
#   2. How to resolve a quarantine ref
#   3. How to read gate-audit.log
#   4. Failure-mode responses
#
# Nothing in this runbook may be executed before owner A1 approval of the
# full autonomous gate design (git-sync-autonomous-recommendation.md).
# Plain ASCII, no em dashes, no curly quotes.

---

## 1. Bootstrap (one-time owner step)

Bootstrap is the unavoidable A1 action described in Section 4.4 of
git-sync-autonomous-recommendation.md. After bootstrap, the gate runs without
per-cycle owner action. You do this ONCE per repo clone.

### 1.1 Prerequisites (verify all before starting)

- [ ] You have read and approved all gate scripts in scripts/ and
      integrations/telegram-bridge/bridge-git-sync.py
- [ ] Rambo has cleared each artifact (separate Rambo clearance sessions)
- [ ] You are on a trusted device (not a shared or compromised machine)
- [ ] GitHub branch protection on master is already active (Section 4.5 of
      the recommendation). If not, do step 1.2 first.
- [ ] Python environment on bridge host has watchdog==4.0.1 installed

### 1.2 Enable GitHub branch protection (if not already active)

In the GitHub repo settings:
  - Settings -> Branches -> Add branch protection rule -> master
  - Require pull request reviews before merging: YES (1 approval minimum)
  - Restrict who can push to matching branches: owner (jecki) only
  - Block force pushes: YES
  - Allow deletions: NO (leave unchecked)

This is the control that limits who can push commits the gate will process.
Without this, the gate provides no meaningful trust boundary.

### 1.3 Apply the bootstrap commit (owner runs this manually)

The bootstrap commit adds the gate scripts and the logs/ directory stubs to
master. Run these commands from your trusted device in the repo clone:

    cd <REPO_ROOT>
    git checkout master
    git pull origin master           # ensure you are at latest HEAD
    # scripts/ and integrations/ artifacts are already in the repo (from Phase A).
    # The logs/ stubs may need to be created if not already committed:
    mkdir -p logs/quarantine
    touch logs/.gitkeep
    touch logs/quarantine/.gitkeep
    git add scripts/ integrations/telegram-bridge/bridge-git-sync.py logs/
    git status                       # REVIEW the staged files before committing
    git diff --cached                # READ the diff -- this is the bootstrap trust step
    git commit -m "bootstrap: autonomous git-sync gate artifacts (T-0021, owner A1)"
    git push origin master

After this commit, all future changes to scripts/ and bridge-git-sync.py will
flow through the autonomous gate's own review (self-protecting gate scripts,
Section 4.3 of the recommendation).

### 1.4 Write the integrity hash file

After the bootstrap commit, write the SHA-256 hashes of the two trust anchors
to a file outside the repo (so it cannot be modified by a commit):

    sha256sum <REPO_ROOT>/CLAUDE.md <REPO_ROOT>/.claude/agents/Rambo.md \
        > /etc/git-sync-hashes.txt
    chmod 644 /etc/git-sync-hashes.txt

GitSyncRunner checks this file at the start of every session. If either hash
changes without owner knowledge, the runner halts and alerts.

Update this file after any intentional CLEAR-approved change to CLAUDE.md or
Rambo.md. Format:

    <sha256hex>  /absolute/path/to/CLAUDE.md
    <sha256hex>  /absolute/path/to/.claude/agents/Rambo.md

### 1.5 Deploy bridge-git-sync.py on the bridge host

Copy the systemd unit template:

    cp <REPO_ROOT>/scripts/git-sync-systemd.unit.template \
       /etc/systemd/system/bridge-git-sync.service

Edit the file and fill in all <ANGLE-BRACKET> placeholders (see the template
checklist at the bottom of that file).

Then:

    sudo systemctl daemon-reload
    sudo systemctl enable bridge-git-sync.service
    sudo systemctl start bridge-git-sync.service
    sudo systemctl status bridge-git-sync.service    # should show Active: active (running)
    journalctl -u bridge-git-sync.service -f          # verify startup log lines

### 1.6 Schedule GitSyncRunner in the Claude cloud scheduler

Configure a recurring scheduled cloud session using the Claude Code scheduler:
  - System prompt: contents of scripts/git-sync-runner-prompt.md
  - Schedule: every 15 minutes
  - Working directory: <REPO_ROOT>
  - Tools available: Read, Write, Edit, Bash (git only), Agent

This is the A1 action that activates the autonomous gate. Until this session
is scheduled, the gate scripts are inert files on disk.

### 1.7 Verify first cycle

After scheduling, wait up to 15 minutes for the first GitSyncRunner session.
Check:

    tail -f <REPO_ROOT>/logs/gate-audit.log

You should see either:
    <TIMESTAMP> | ACTION=NO_OP | REASON=already-up-to-date
or (if there are pending commits):
    <TIMESTAMP> | ACTION=AUTO-MERGED | ...
or:
    <TIMESTAMP> | ACTION=RAMBO-REVIEW-PENDING | ...

If the audit log is empty after 20 minutes, the scheduler is not firing.
Check the cloud scheduler configuration and recheck step 1.6.

---

## 2. Resolving a quarantine ref

A quarantine ref is created when GitSyncRunner cannot auto-merge an incoming
commit (control-plane change that Rambo quarantined, or an ff-only failure).

### 2.1 Identify what is quarantined

    # List all quarantine refs
    git for-each-ref refs/quarantine/ --format='%(refname) %(objectname:short) %(creatordate)'

    # See the diff that was quarantined (the diff file written before the review)
    ls logs/quarantine/
    cat logs/quarantine/diff-<commit-sha>.txt

    # See the audit log entry
    grep QUARANTINE logs/gate-audit.log

    # See the security-baseline entry
    grep -A 7 "<commit-sha>" company/governance/security-baseline.md

### 2.2 Decide: approve or reject

Read the diff file (logs/quarantine/diff-<sha>.txt) carefully.
Read the Rambo findings in gate-audit.log.

Option A -- APPROVE the quarantined commit (you have reviewed it and it is safe):

    # First confirm HEAD is not already at or past this commit
    git log --oneline -5

    # Merge manually (ff-only if possible; if not, review the divergence first)
    git merge --ff-only refs/quarantine/<timestamp>
    # If ff-only is not possible (divergence), consider rebasing your local
    # changes onto origin/master before merging. Do NOT git push --force.

    git push origin master

    # Update the integrity hash file if CLAUDE.md or Rambo.md changed
    sha256sum CLAUDE.md .claude/agents/Rambo.md > /etc/git-sync-hashes.txt

    # Delete the quarantine ref (it is now merged)
    git update-ref -d refs/quarantine/<timestamp>

    # Log the resolution in gate-audit.log
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) | COMMIT=<sha> | ACTION=OWNER-APPROVED-MERGE | REVIEWER=jecki" \
        >> logs/gate-audit.log

Option B -- REJECT the quarantined commit (it contains something unsafe):

    # Delete the quarantine ref
    git update-ref -d refs/quarantine/<timestamp>

    # Log the rejection
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) | COMMIT=<sha> | ACTION=OWNER-REJECTED | REVIEWER=jecki | REASON=<your reason>" \
        >> logs/gate-audit.log

    # Notify the pusher (if the pusher was a legitimate team member who made
    # an accidental change, route through Ido)

### 2.3 Multiple quarantine refs (backlog)

A backlog of quarantine refs means unusual control-plane activity has been
arriving at origin/master. Investigate:

    git for-each-ref refs/quarantine/ --format='%(refname) %(objectname:short) %(creatordate)' \
        | sort -k3

If the backlog grew because of repeated legitimate commits that Rambo was
over-quarantining (false positives), discuss with Ido whether any of the six
Rambo checks should be tuned. Changes to the review prompt or checks require
going through the gate itself (scripts/ is control-plane).

---

## 3. Reading gate-audit.log

Location: logs/gate-audit.log
Format (one line per event):

    TIMESTAMP | COMMIT=<sha> | PUSHER=<email> | CLASS=<type> | FILES=<list> |
    VERDICT=<result> | CHECKS=<per-check> | ACTION=<action>

Not every field appears on every line (depends on the event type).

### 3.1 Event types

NO_OP:
    HEAD already up to date with origin/master. Normal. Nothing to do.

FETCH_FAILED:
    git fetch origin returned non-zero. Check network. GitSyncRunner will retry
    next session (15 minutes). No action needed unless it persists.

INTEGRITY-CHECK=FAIL:
    SHA-256 of CLAUDE.md or Rambo.md does not match /etc/git-sync-hashes.txt.
    STOP. Investigate immediately. Do not run the gate until resolved.
    Resolution: verify the hash file is current (update it if you made an
    intentional approved change); if you made no such change, treat as a
    potential security incident and escalate to Rambo and Ido.

AUTO-MERGED (CLASS=DATA-PLANE):
    A data-plane-only commit was merged automatically. Routine. No action needed.
    If you see unexpected files in the FILES list, investigate.

RAMBO-REVIEW-PENDING:
    A control-plane diff was written to logs/quarantine/ and Rambo was invoked.
    This is followed by either MERGED-AFTER-CLEAR or QUARANTINE.

MERGED-AFTER-CLEAR (CLASS=CONTROL-PLANE):
    Rambo issued CLEAR and the commit was merged. Review CHECKS field to see
    Rambo's per-check findings. Routine for safe governance-additive commits.

QUARANTINE:
    A commit was quarantined. ACTION required from owner. See Section 2.

BRIDGE-PULL:
    bridge-git-sync.py performed a periodic pull (Direction C). BLOCKED means
    a control-plane change was pending (waiting for GitSyncRunner). Normal; no
    action needed. FF-MERGE-FAILED means divergence -- owner should investigate.

BRIDGE-PUSH:
    bridge-git-sync.py pushed local changes to origin (Direction B). PUSH_FAILED
    means all 3 retries exhausted -- check git credentials and network on bridge
    host.

### 3.2 Audit log review cadence

Recommended (pending Dalia definition):
  - Weekly scan: review all lines since last scan. Look for unexpected CLEAR
    verdicts on control-plane files and any QUARANTINE events not yet resolved.
  - Immediate review: any QUARANTINE event generates a board.md BLOCKED row and
    a Telegram notification. Do not defer quarantine review.
  - INTEGRITY-CHECK=FAIL: treat as priority 1. Investigate before allowing any
    further gate operation.

---

## 4. Failure-mode responses

### 4.1 git fetch fails repeatedly

Symptom: FETCH_FAILED in audit log across multiple 15-minute sessions.
Check: network connectivity from cloud session to GitHub.
Action: investigate cloud session environment. If transient, it self-recovers.
        If persistent, GitSyncRunner sessions are failing silently -- check the
        cloud session scheduler logs for error output.

### 4.2 ff-only merge failure (divergence)

Symptom: QUARANTINE with REASON=FF-MERGE-FAILED in audit log.
Cause: local HEAD and origin/master have diverged (parallel commits from
       GitSyncRunner merge and a manual push created a non-linear history).
Action: owner resolves the divergence manually. Do NOT use git push --force.
        Pull locally, rebase or merge cleanly, push. On next GitSyncRunner
        session the ff-only path should succeed.

### 4.3 Rambo returns an error or times out

Symptom: QUARANTINE with REASON=RAMBO-ERROR in audit log.
Cause: Agent tool call to Rambo failed (session error, timeout, etc.).
Action: check whether Rambo's agent configuration is intact. Verify
        .claude/agents/Rambo.md is present and readable. If Rambo is
        consistently failing, pause the GitSyncRunner schedule (A1 action)
        until the issue is diagnosed with Ido and Rambo.

### 4.4 bridge-git-sync.py crash or stop

Symptom: systemd shows service stopped; logs/bridge-sync.log stops updating;
         local agent writes are not reaching origin.
Action: check journalctl -u bridge-git-sync.service for the crash reason.
        Systemd should auto-restart (RestartSec=10s). If restart loop is
        exceeding StartLimitBurst (5 restarts in 60s), systemd will stop
        retrying. Then:
          sudo systemctl reset-failed bridge-git-sync.service
          sudo systemctl start bridge-git-sync.service
        If the crash is reproducible, investigate bridge-git-sync.py logs and
        report to Shir (route via Ido).

### 4.5 Push rejected after all retries

Symptom: PUSH_FAILED in audit log + BLOCKED row in memory/board.md.
Cause: git push to origin master was rejected 3 times.
Possible causes:
  - GitHub token or SSH key expired on bridge host.
  - Remote is ahead due to a race (GitSyncRunner just merged a large commit).
  - Network issue to GitHub.
Action:
  - Verify git credentials on bridge host: git push --dry-run
  - Check if remote is ahead: git fetch origin; git status
  - Restart bridge-git-sync.py after fixing credentials if needed.
  - Local writes are NOT lost -- they are on disk and will be committed on
    the next successful push cycle.

### 4.6 INTEGRITY-CHECK failure (CLAUDE.md or Rambo.md hash mismatch)

Symptom: INTEGRITY-CHECK=FAIL in audit log. GitSyncRunner halted.
Cause (benign): CLAUDE.md or Rambo.md was updated through a CLEAR-approved
       merge and the hash file was not updated after bootstrap.
Cause (suspicious): unexpected change to CLAUDE.md or Rambo.md that was not
       knowingly approved.
Action:
  1. Compare the current content of CLAUDE.md and .claude/agents/Rambo.md
     against your last known approved version (git log --oneline -20).
  2. If the change is expected and was CLEAR-approved: update /etc/git-sync-hashes.txt
     (see step 1.4). Then GitSyncRunner will resume on next session.
  3. If the change is NOT expected: treat as a potential security incident.
     STOP. Do not update the hash file. Escalate to Rambo and Ido immediately.
     Pause the GitSyncRunner schedule (A1). Audit gate-audit.log for any recent
     CLEAR verdicts that covered .claude/ or CLAUDE.md.

### 4.7 Quarantine backlog growing without resolution

Symptom: multiple refs in refs/quarantine/, memory/log.md has many QUARANTINE
         lines, memory/board.md has multiple BLOCKED rows.
Cause: owner has not reviewed and resolved queued quarantine refs.
Action: follow Section 2 for each quarantined ref in order (oldest first).
        Data-plane syncing continues normally while quarantine refs are pending
        (GitSyncRunner operates on the last clean HEAD for data-plane paths).
        Control-plane changes stack up but do not block data flow.
        If the backlog reflects repeated false-positive quarantines on legitimate
        commits, discuss check tuning with Rambo and Ido.

---

End of runbook. Questions: escalate to Shir via Ido (R&D chain). Security
incidents: escalate to Rambo via Ido.
