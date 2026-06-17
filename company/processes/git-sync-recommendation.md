# Git-Sync Consolidated Recommendation -- T-0021

Author: Ido (VP R&D, L3)
Date: 2026-06-16
Task: T-0021 (lead consolidation)
Owner option selected: A (validate and extend existing mechanism)
Input reviews: Rambo (git-sync-security-review.md), Shir (git-sync-devops-assessment.md)
Status: Decision-ready; implementation gated on owner A1 (items listed below)
Dalia leg: BLOCKED (Dalia not yet live; see section 5)

---

## 1. What the current mechanism does and the single most important risk

The current hook in `.claude/settings.json` fires `git pull --ff-only origin master`
on every UserPromptSubmit event in a cloud Claude Code session. This keeps the cloud
working tree current with origin/master automatically, with no human action required.
The `--ff-only` flag prevents merge commits and refuses to merge if the local branch
has diverged; `|| true` suppresses non-zero exit codes so Claude Code does not treat a
failed pull as a session error.

The single most important risk (Rambo Finding 1, rated CRITICAL): the hook runs
fetch + merge in a single unreviewed step. If any commit reaches origin/master
containing adversarial content in `.claude/`, `CLAUDE.md`, or `settings.json`
-- via a compromised owner account, a malicious GitHub Action, or a supply-chain
attack on a pinned dependency -- that content is merged silently into the live
working tree and is active on the very next prompt. There is no review gate, no
Rambo scan, and no A1 step between the push and the agent operating under the
new instructions. This inverts the prompt-injection scan control mandated by
CLAUDE.md security notes: the hook merges before any scan can run.

---

## 2. Reconciled hook design -- RULING: fetch-only with guarded merge script

### Ruling

Security red lines outrank operational convenience. Rambo's fetch-only
recommendation governs. Shir's hardened hook (master-only guard with auto
ff-merge) is an improvement over the current hook but does not close Rambo
Finding 1 or Finding 3: it still auto-merges control-plane files without a
review gate, which directly contradicts red line 9 (no self-grant of permissions)
and the A1 gate requirement on settings.json and agent role files.

Operational cost (stated plainly): with fetch-only in the hook, the cloud session
will NOT auto-update its working tree. A human (owner or delegated agent with A2)
must explicitly run the guarded merge script after any push to origin/master that
they want reflected in the live session. This adds one manual step per update
cycle. That is the correct trade-off: the operator knows exactly when the working
tree changes and can confirm no control-plane files were affected.

### Reconciled hook command (replaces current hook; owner applies to settings.json)

```
git fetch origin 2>&1 | tail -1 || true
```

This is the only command in the UserPromptSubmit hook. It fetches remote state so
the session is aware of what is on origin/master, but never modifies the working
tree. Safe on any branch. No merge, no auto-update, no control-plane risk.

### Guarded merge script (separate from hook; owner or Ido runs explicitly)

Save as `scripts/safe-pull.sh` in the repo root. Owner runs this after pushing
commits they want reflected in the live cloud session.

```bash
#!/bin/bash
# safe-pull.sh -- run explicitly after owner pushes to origin/master.
# Never auto-triggered. Requires human review if control-plane files changed.
set -e
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "master" ]; then
  echo "Not on master. Aborting." && exit 1
fi
git fetch origin
CHANGED=$(git diff HEAD..origin/master --name-only)
SENSITIVE=$(echo "$CHANGED" | grep -E '^\.claude/|^CLAUDE\.md$' || true)
if [ -n "$SENSITIVE" ]; then
  echo "FLAG: control-plane files changed in origin/master:"
  echo "$SENSITIVE"
  echo "Human review required before merge."
  echo "Run: git diff HEAD..origin/master -- <file>"
  echo "If clean, run: git merge --ff-only origin/master"
  exit 1
fi
git merge --ff-only origin/master
echo "Merge complete. No control-plane files affected."
```

Logic: fetches, diffs what would change, blocks if any `.claude/` or `CLAUDE.md`
file is in the changeset and requires the owner to inspect the diff manually
before merging. Non-control-plane commits (memory/, projects/, company/processes/,
etc.) merge automatically via ff-only. If there is a divergence that prevents
fast-forward, the script halts and the owner resolves manually.

The script must be committed to the repo. Creating it is within Ido A2/A3 authority
(internal tooling); no A1 required for the script itself. Placing it in `scripts/`
keeps it auditable in the repo history.

Rambo must clear the final script logic before it is committed (Rambo's own
recommendation included this same guard pattern; this is a cosmetic adjustment
to match the agreed file layout).

---

## 3. Local-agent gap solution (Gap B -- Shir's scheduled pull-commit-push job)

### Endorsement with one modification

Shir's Option 1 (scheduled pull-commit-push job on the bridge host) is endorsed
as the correct architectural solution. It is the only option that closes the root
cause of the 2026-06-15 incident (local clone is a write sink with no path to
origin) without modifying bridge.py code or agent permissions.

The modification: the scheduled job must also adopt the control-plane-change guard
before merging. Specifically, the pull step (before committing local changes) must
check whether the incoming commits touch `.claude/` or `CLAUDE.md`. If they do,
the job must halt and alert rather than auto-merge. This aligns the local sync job
with the fetch-only principle governing the cloud hook.

### Endorsed job script (implementation sketch -- not final; Shir implements under Ido approval)

```bash
#!/bin/bash
# /etc/cron.d/eco-git-sync (or user crontab on bridge host)
# Cadence: every 15 minutes
# Scope: memory/ and integrations/ only (agent-writable paths)
# Gate: A1 required before scheduling on bridge host

set -e
REPO="/path/to/eco-synthetic"     # owner fills in absolute path
LOG="$REPO/logs/bridge-sync.log"
cd "$REPO"

# Step 1: fetch
git fetch origin 2>>"$LOG"

# Step 2: check for control-plane changes in incoming commits
SENSITIVE=$(git diff HEAD..origin/master --name-only | grep -E '^\.claude/|^CLAUDE\.md$' || true)
if [ -n "$SENSITIVE" ]; then
  echo "$(date -u) BLOCKED: control-plane change detected -- human review required: $SENSITIVE" >> "$LOG"
  exit 1
fi

# Step 3: pull remote changes (ff-only; halt on conflict)
git merge --ff-only origin/master >> "$LOG" 2>&1 || {
  echo "$(date -u) BLOCKED: ff-only merge failed -- conflict; human review required" >> "$LOG"
  exit 1
}

# Step 4: stage only agent-writable paths
git add memory/ integrations/

# Step 5: commit only if there are staged changes
git diff --cached --quiet || git commit -m "auto: local bridge sync $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Step 6: push to master (ff-only; no force)
git push origin master >> "$LOG" 2>&1 || {
  echo "$(date -u) BLOCKED: push failed -- conflict or network; human review required" >> "$LOG"
  exit 1
}

echo "$(date -u) sync OK" >> "$LOG"
```

Key properties:
- No destructive commands (no force-push, no reset).
- Halts and logs on any conflict or control-plane change.
- Scoped to memory/ and integrations/ only; role files, sources/, .env are never
  staged.
- Log file is append-only; owner reviews on alert.
- `logs/` directory must be created by owner before scheduling (not auto-created
  by the script to avoid side effects).

Wake-up session coverage: at 15-minute cadence the local clone is at most
15 minutes stale when a 2h wake-up fires. Shir's assessment confirms this is
acceptable for current board.md and log.md access patterns. Ido concurs.

---

## 4. File-ownership and conflict rules

Shir's table and rules are endorsed without modification. Reproduced here for
completeness and to make this document self-contained.

### File ownership

| File | Owner | Rule |
|------|-------|------|
| memory/board.md | Eco (orchestrator) | Each agent writes its own rows only. Eco writes Eco rows and orchestrates. Append new rows; never rewrite another agent's row without consent or Ido routing. |
| memory/log.md | All agents (append-only) | Append only. Never truncate, rewrite, or delete lines. Chronological order. |
| company/decisions/decisions-log.md | Append-only (all) | Append new entries at the bottom only. No retroactive edits. CLAUDE.md red line 6. |
| .claude/agents/*.md | Owner (A1) | No agent writes these. Read allowed per role. Changes require A1. |
| sources/* | Archived (read-only) | Never write. CLAUDE.md red line 2. |
| integrations/ | Shir (under Ido approval) | Read+Write per role file. Changes go through Ido approval. |
| memory/wiki/* | Eco (A3 autonomous) | Eco maintains; other agents read. |
| company/processes/ | Ido (R&D lead) | Assessment and process files written by R&D agents under Ido task. |

### Conflict prevention rules (endorsed verbatim from Shir's assessment)

1. Fast-forward only. No merge commits to master. If a fast-forward fails, halt
   and alert the owner -- do not auto-merge.
2. No simultaneous writes to the same file from cloud and local in the same time
   window. The scheduled job pulls before committing local changes. If the pull
   fails (remote ahead and conflict), the local commit is held and owner resolves
   manually.
3. Append-only files (log.md, decisions-log.md) are the lowest-risk targets because
   appending to different ends of the same file does not produce a semantic conflict
   even if git sees a textual one. Still: pull before appending is the rule.
4. Board.md row discipline. Each agent owns its rows. Cloud and local agents must
   not write the same row concurrently.
5. Role files are owner-only (A1). Neither cloud nor local agents write them.
   No conflict risk from agents.
6. No last-writer-wins on governance files (decisions-log.md, gate-register.md,
   access-matrix.md). A conflict on these requires human review before resolution.
7. PR-gated changes for architecture or stack files (CLAUDE.md, settings.json,
   any file under company/governance/). Direct pushes to master for these require
   owner awareness; prefer branch + PR so the diff is reviewable.

---

## 5. Gate requirements -- what requires A1, what is A2, what is blocked on Dalia

### Requires owner A1 (no implementation before owner approves in this session)

1. **settings.json hook edit** -- replace current `git pull --ff-only origin master`
   hook command with `git fetch origin 2>&1 | tail -1 || true`. Agent cannot write
   settings.json (classifier blocks it; access matrix confirms owner-only). Owner
   applies the edit directly.

2. **Scheduled pull-commit-push job on bridge host** -- any new scheduled process
   that runs git push to master on a production host is A1. Owner approves the
   script, the cadence (15 min recommended), the log path, and the scoped paths
   (memory/, integrations/) before Shir implements.

### Requires A2 (Ido authority; owner notified)

3. **Committing safe-pull.sh to scripts/** -- internal tooling; Rambo must clear
   the script logic first (Rambo already cleared the equivalent pattern in his
   review). Ido approves commit under A2 (architecture/tooling change). Owner
   notified via T-0021 close-out note.

4. **Rambo clearance of safe-pull.sh final text** -- Ido invokes Rambo (A2, on-demand)
   to confirm the script matches the pattern Rambo approved and introduces no new
   attack surface. Not a full gate-register entry (internal script, not a third-party
   tool), but Rambo sign-off is required before the script goes live.

### Blocked on Dalia (governance leg of T-0021)

The T-0021 task envelope explicitly names three reviewers: Rambo (done), Shir
(done), and Dalia (Q&G). Dalia is not yet live (T-0012 and T-0021 board rows
both confirm this). Her governance leg covers:

- Whether the auto-pull process (in any form) is the correct governance posture
  for keeping agents in sync with master.
- Whether the guarded merge script and scheduled job meet audit and quality
  standards.
- Whether the file-ownership and conflict rules are sufficient for the audit trail.

The consolidated recommendation above is decision-ready without Dalia's input,
because the Security red lines (Rambo's findings) are non-negotiable regardless
of governance posture. However, Dalia's review should be tasked immediately on
her activation, and she may surface additional requirements (e.g., audit logging
of every safe-pull.sh run, governance file for the sync process). Ido will
incorporate those before the mechanism is considered fully locked.

**Status: T-0021 is partially closed (Security leg resolved; DevOps leg resolved;
Governance leg open/blocked on Dalia activation).**

Owner may approve and implement the A1 items above before Dalia's review.
The risk of proceeding without Dalia is that her governance review may add
requirements (audit logging, process documentation standards). These would be
additive, not contradictory, so they can be layered on after Dalia goes live.

---

## 6. Single go-forward recommendation

**Replace the hook with fetch-only now (A1), commit the guarded merge script
(A2 + Rambo clearance), and schedule the bridge sync job (A1). Do not re-introduce
auto-merge into any hook or scheduled job on master-affecting paths without a new
Rambo gate review.**

The fetch-only hook closes Rambo Findings 1 and 3 (the two HIGH-rated items)
immediately and at near-zero operational cost: the owner runs `scripts/safe-pull.sh`
explicitly after any push they want reflected in the live session, which takes
seconds and provides a clear control-plane-change gate. The scheduled job closes
the local-agent gap (the original owner-raised issue) without modifying bridge.py
or agent permissions. The file-ownership rules prevent concurrent-write conflicts.
The one unsatisfied element is Dalia's governance review, which cannot proceed
until she is live.

---

## Files read for this consolidation

- `/home/user/eco-synthetic/company/processes/git-sync-security-review.md`
- `/home/user/eco-synthetic/company/processes/git-sync-devops-assessment.md`
- `/home/user/eco-synthetic/.claude/settings.json`
- `/home/user/eco-synthetic/memory/board.md`

---

End of consolidated recommendation. Output to owner (jecki) for A1 decisions.
T-0021 governance leg remains open pending Dalia activation.
