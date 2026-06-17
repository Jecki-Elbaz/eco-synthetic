# Git-Sync Autonomous Gate -- Phase B Deploy Checklist

Status: READY. Gate code is on master (scripts/gate-runner.sh, scripts/git-sync-runner-prompt.md,
integrations/telegram-bridge/bridge-git-sync.py) including the red-team #09 fix. All three review
legs (Security, DevOps, Governance) are complete. This is the owner-A1 go-live sequence.

## CRITICAL SEQUENCING -- do NOT deploy yet

Deployment must wait until the parallel AGENT-HIRING session has finished. Reason: every deploy
step below changes the sync/push behavior that the hiring session currently depends on --
- switching the hook to fetch-only stops cloud sessions auto-merging master (hiring sessions would
  drift onto stale clones -> exactly the double-certification failure mode);
- enabling branch protection blocks the hiring session's direct pushes to master;
- starting the GitSyncRunner while the old auto-pull is live means two merge mechanisms at once.
Deploying mid-hiring would disrupt the other session. Run this only after hiring is done (same gate
as merging claude/eco-ops-overnight).

## Deploy order (owner A1; once hiring is complete)

1. ENABLE GitHub branch protection on master: push allowlist = owner only, no force-push, PR + 1
   approval required. (Prerequisite; do this first so the gate is the only merge path.)

2. ONE-TIME BOOTSTRAP (the single unavoidable human step; you personally do this):
   a. Read and approve the gate scripts on master (gate-runner.sh, git-sync-runner-prompt.md,
      bridge-git-sync.py) -- confirm they are what was reviewed.
   b. Write /etc/git-sync-hashes.txt on the bridge host with the SHA-256 of CLAUDE.md and the gate
      scripts (the runner HALTS if this file is absent -- fail-closed, per Rambo FIX-1).
   c. Wire the bridge outbound watcher (bridge.py reads integrations/telegram-bridge/outbound/ to
      deliver quarantine alerts) -- see DECISION 1 in the runbook.
   Full step-by-step: company/processes/git-sync-runbook.md (bootstrap section).

3. DEPLOY bridge-git-sync.py on the bridge host alongside bridge.py; install the systemd unit from
   scripts/git-sync-systemd.unit.template (fill the <ANGLE-BRACKET> placeholders); create logs/ and
   logs/quarantine/ on the host.

4. SCHEDULE GitSyncRunner as a recurring cloud session (every 15 min) driven by
   scripts/git-sync-runner-prompt.md.

5. SWITCH the UserPromptSubmit hook in .claude/settings.json from:
       git pull --ff-only origin master 2>&1 | tail -2 || true
   to fetch-only:
       git fetch origin 2>&1 | tail -1 || true
   (Classifier blocks agent writes to settings.json, so you apply this edit.)

6. VERIFY first cycle per the runbook (a benign data-plane change auto-merges; a control-plane test
   change routes to Rambo and quarantines). Then confirm gate-audit.log is writing.

## Governance (Dalia, T-0021 leg -- already defined)

Per company/processes/git-sync-governance-review.md: weekly gate-audit.log scan + immediate review
of every QUARANTINE; escalate to Eco/owner on the Tier-2/Tier-3 thresholds. Two deploy-blocker audit
additions (resolution log lines REQ-1; weekly meta-log) must be in before go-live.

## Residual risk (accepted at design A1)

Zero-human-per-cycle, not zero-risk: LLM-reviewer blind spots (low-med), bootstrap integrity (low),
GitHub dependency (low). The one human step is the one-time bootstrap above.
