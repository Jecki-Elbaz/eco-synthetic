# Git / CI-CD Hygiene Procedure

Owner: Shir (DevOps), git/CI-CD hygiene function (owner A1 2026-06-30).
Tasked on this function by Eco/owner directly; Ido manages all other R&D work.
Purpose: keep the repo's version state clean so work is never lost, half-saved, or
out of sync -- especially when the owner (non-dev) works directly in the repo.

ASCII only. Red line 1: never read or print `.env` or any secret. `git diff --stat`
only -- never dump full diffs that could echo secret contents.

---

## 1. What "clean" means

- Working tree clean (nothing uncommitted sitting for >~1 day).
- Nothing committed-but-unpushed (local ahead of remote).
- Nothing on remote that is unpulled (local behind remote).
- On an expected branch (feature branch for new work; not stranded on `master`
  with large uncommitted changes; no detached HEAD).
- Version tags roughly track shipped work (not 50 commits past the last tag with no
  reason).

## 2. The audit (read-only; needs Bash; run from repo root)

```
git status --porcelain            # uncommitted/untracked -- count + top paths
git branch --show-current         # current branch
git branch -vv                    # upstream tracking + ahead/behind
git rev-list --count @{u}..HEAD   # unpushed commits (if upstream exists)
git rev-list --count HEAD..@{u}   # unpulled commits (if upstream exists)
git log --oneline -5              # recent history sanity
git diff --stat                   # SCOPE of uncommitted change (never full diff)
git tag --sort=-creatordate       # last version tags
```

Compare against the previous run in `last-audit.md` (this folder) to spot drift.

## 3. Verdict + report

- CLEAN: working tree clean, nothing unpushed/unpulled, expected branch.
- ATTENTION: any of -- uncommitted work aging past ~1 day; unpushed or unpulled
  commits; detached HEAD; heavy uncommitted work directly on `master`; large
  untracked files; long version-tag drift.

Write the snapshot to `integrations/git-hygiene/last-audit.md` (overwrite) and append a
one-line dated summary to `integrations/git-hygiene/audit-log.md`.

On ATTENTION, surface to the owner in PLAIN language -- what is unsynced and the ONE
action to fix it. Example: "12 uncommitted changes under projects/ai-patient-simulator/
sitting since yesterday -- want me to commit them?" No jargon dumps.

## 4. Procedure Shir enforces (and helps the owner follow)

1. New work goes on a `feat/` / `fix/` / `chore/` branch (global CLAUDE.md), not raw
   on `master`, when it is more than a tiny edit.
2. Commit at the end of a working session -- imperative subject, <=72 chars.
3. Push after committing so nothing lives only on this machine.
4. Pull before starting if the remote may have moved.
5. Tag a version at meaningful milestones.

Shir does NOT silently rewrite the owner's git history. She flags, explains, and (when
asked) runs the safe fix. Destructive git ops (`reset --hard` on shared branches,
`push --force` to `master`) stay A1 (red line 3).

## 5. Limits

- An agent cannot force a human to commit. Real enforcement is mechanical: git
  pre-commit / pre-push hooks, the repo guard, or CI. Shir may BUILD these.
- Switching ON any new hook/tool/automation runs the Security + Legal gate
  (Rambo + Eyal) + owner A1. Proposing is free; activating is gated.
- Production deploy stays A1. Hygiene is not deploy authority.

## 6. Automation backlog (proposals -> owner A1, then gate)

- Pre-commit hook: warn/block on committing large or secret-looking files.
- Pre-push hook: warn when pushing straight to `master`.
- Session-end reminder: prompt "uncommitted work -- commit now?" when a session ends
  with a dirty tree.
- Scheduled auto-audit: DONE 2026-07-01 -- shipped as a deterministic zero-token script
  (audit.py) wired into runner.py run_git_hygiene(), daily. No Bash-in-agent needed (it is a
  plain subprocess, not an LLM tool call), so the guard Bash block was NOT weakened. Rambo
  CLEAR-WITH-CONDITIONS (company/security/reports/git-hygiene-review-2026-07-01.md).

## 7. Maintenance notes

- audit.py ROOT is hardcoded (audit.py line 28). If the repo ever relocates, update it
  (Rambo C2, 2026-07-01).
- The `git diff --name-only` calls in audit.py are intentional and security-reviewed --
  paths only, never contents (Rambo C1). Never change them to a bare `git diff`.
- New enforcement hooks (pre-commit / pre-push / session-end) stay PROPOSALS until the full
  gate (Rambo + Eyal) + owner A1 clears them (Rambo C3).
