# Security Review: Auto-Pull Git Sync Hook (T-0021)

**Reviewer:** Rambo (Security, L3)
**Date:** 2026-06-16
**Task:** T-0021 -- Security leg
**Verdict:** HIGH RISK (as currently configured)
**Disposition:** FLAG -- harden before locking

---

## Artifact under review

Hook location: `.claude/settings.json`, `hooks.UserPromptSubmit`
Command: `git pull --ff-only origin master 2>&1 | tail -2 || true`
Trigger: fires automatically on EVERY user prompt submitted to the Claude Code session.

---

## Finding 1 -- Auto-merge of adversarial commits (CRITICAL)

**Risk level: HIGH**

The hook runs `git pull` (fetch + merge) on every prompt. If any commit reaches
`origin/master` that contains a modified `CLAUDE.md`, `.claude/agents/*.md`,
`.claude/settings.json`, or a prompt-injection payload embedded in a doc, that
content is merged into the live working tree silently and immediately -- with no
human review step between the push and the next LLM prompt that reads the file.

CLAUDE.md security notes explicitly name this threat:
"Before running any downloaded repo or script, Rambo (Security) should scan for
suspicious `.claude/`, `CLAUDE.md`, or `.cursorrules` files (prompt-injection /
takeover risk)."

The hook inverts this control: instead of scanning before merging, it merges
before any scan can run. The session then operates under the new, unreviewed
instructions on the very next prompt.

Realistic threat model:
- Owner is the only person who can push to master (small team, no contributor list
  confirmed). Direct owner account compromise (stolen token, session hijack,
  malicious GitHub Action) is the realistic path.
- A compromised GitHub Action, a supply-chain attack on a dependency pinned in
  the repo, or a mistaken owner push could all land a malicious commit.
- The blast radius is full agent takeover: an adversary who can land a commit on
  master can rewrite any agent's role file, expand permissions in settings.json,
  or inject instructions that cause agents to exfiltrate data, bypass gates, or
  approve their own tools.

This is a real, non-theoretical takeover vector per the project's own security
baseline.

---

## Finding 2 -- Silent failure via `|| true` on non-master branches (MEDIUM)

**Risk level: MEDIUM**

On any branch other than master, `--ff-only` will fail ("Not possible to
fast-forward, aborting") because the branch tip diverges from origin/master.
`|| true` swallows the exit code and `tail -2` may show the error text, but the
hook does not surface it in a way that blocks the session or alerts the user.

Security concern: silent-failure patterns mask operational state. If the hook
fails on a feature branch while a malicious commit is simultaneously present on
master, the agent on that branch has no updated instructions -- which is actually
safer in this case -- but the operator has no signal either way. The same
swallowing mechanism would hide any transient network failure, auth failure, or
corrupted object fetch without raising an alert.

More importantly: if the hook is ever modified to run on the current branch
(not hardcoded to `master`), and an attacker can push to that branch, silent
failure becomes the attacker's friend -- the operator cannot tell whether the
pull succeeded or was blocked.

---

## Finding 3 -- Gate bypass on settings.json and agent role-file changes (HIGH)

**Risk level: HIGH**

`.claude/settings.json` permission grants and `.claude/agents/*.md` role files
are both A1 (owner-only) changes per CLAUDE.md and the access matrix. The
adoption gate requires Security clear + Legal clear + A2/A1 before any new
tool or permission expansion goes live.

The auto-pull hook bypasses this gate in the following scenario:
1. A commit modifies `.claude/settings.json` to expand the `allow` list (e.g.
   adds `Bash(curl *)` or removes a deny entry).
2. The hook merges the commit on the next prompt.
3. The expanded permissions are now live in the session with no gate review.

The same applies to agent role files: a commit that expands an agent's authority,
removes a red line, or adds a new tasker relationship is merged and active before
Rambo or Eco sees it.

This directly contradicts red line 9 ("Never self-grant tools or permissions")
and the gate requirement in constitution §6. The auto-pull mechanism as designed
can cause a session to self-expand its own permission surface without any human
approval step in the loop.

---

## Finding 4 -- Red line 4 interaction (MEDIUM)

**Risk level: MEDIUM**

Red line 4 prohibits using `curl`, `wget`, or direct network calls to download or
execute external code without passing the Security + Legal gate.

`git pull` is a network operation that downloads and executes (merges) external
content. The hook fires without any per-commit review. While `git pull` from the
project's own repo is categorically different from `curl | bash`, the underlying
risk -- unreviewed external code entering the execution environment -- is the
same when the files being pulled include CLAUDE.md or settings.json. The
mechanism does not distinguish "safe data" commits from "control-plane" commits.

---

## Finding 5 -- No branch guard (LOW, already noted in T-0021 board)

**Risk level: LOW**

The hook always targets `origin/master` regardless of the current branch. On a
feature branch this produces a spurious fast-forward failure every prompt. This
is a reliability nuisance rather than a security finding (the `|| true` prevents
session breakage), but it does mean the hook fires unnecessary network calls and
produces noisy output that operators learn to ignore -- reducing the signal value
of any genuine error.

---

## Threat model summary

Primary actor: anyone who can push to origin/master (currently: owner only, plus
any configured GitHub Actions or apps with write access to the repo).

Attack path:
1. Compromise owner GitHub account OR compromise a GitHub Action with write access.
2. Push a commit to master containing adversarial content in CLAUDE.md,
   .claude/agents/*.md, or .claude/settings.json.
3. Wait for the next user prompt in an active Claude Code session.
4. Hook fires, pulls the commit, merges silently.
5. Session now operates under adversarial instructions.

Likelihood: LOW (owner account compromise is a real but non-trivial bar).
Impact if exploited: CRITICAL (full agent takeover, gate bypass, data exfiltration).
Risk rating: HIGH (low probability x critical impact = high by standard matrix).

---

## Recommendation

**HARDEN -- do not lock in current form.**

Replace the current hook command with a fetch-only command that does NOT
auto-merge. Follow up with an explicit, guarded merge that is separate from the
hook and requires human review of control-plane file changes.

**Recommended hardened hook (two-step):**

Step 1 -- Replace `UserPromptSubmit` hook command with fetch-only:

```
git fetch origin 2>&1 | tail -1 || true
```

This keeps the session aware of remote state without auto-merging anything.

Step 2 -- Add a separate guarded merge script (not a hook; owner runs manually
or Ido builds as a gated command):

```bash
#!/bin/bash
# safe-pull.sh -- must be run explicitly, never auto-triggered
set -e
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "master" ]; then
  echo "Not on master. Aborting." && exit 1
fi
git fetch origin
# Check if any control-plane files changed in the incoming commits
CHANGED=$(git diff HEAD..origin/master --name-only)
SENSITIVE=$(echo "$CHANGED" | grep -E '^\.claude/|^CLAUDE\.md$' || true)
if [ -n "$SENSITIVE" ]; then
  echo "FLAG: control-plane files changed in origin/master:"
  echo "$SENSITIVE"
  echo "Human review required before merge. Run: git diff HEAD..origin/master -- <file>"
  exit 1
fi
git merge --ff-only origin/master
```

**Minimum requirement before locking:**

1. Remove the auto-merge (`git pull`) from the hook. Replace with `git fetch` only.
2. Owner or Ido decides whether to implement the guarded merge script (Ido's call
   per T-0021 scope item 5).
3. If branch-guard is added (as per the T-0021 board suggestion), it must also
   block auto-merge on master -- not just skip non-master branches.
4. Any future re-introduction of auto-merge requires a new Rambo gate review.

**Branch-guard-only (if owner wants to keep auto-merge on master):**

If owner explicitly accepts the merge risk and wants auto-pull on master only,
the minimum safer form is:

```
git fetch origin 2>&1 | tail -1; [ "$(git branch --show-current)" = "master" ] && git diff --name-only HEAD..origin/master | grep -qE '^\.claude/|^CLAUDE\.md$' && echo "FLAG: control-plane change -- manual review required" || ([ "$(git branch --show-current)" = "master" ] && git merge --ff-only origin/master 2>&1 | tail -1 || true)
```

This is long and fragile as a one-liner. The script form above is cleaner and
auditable. Ido should decide format; Rambo clears the logic.

**Gate-register note:** the git sync mechanism itself is not a third-party tool
(it is native git against the project's own repo). No gate-register entry is
required. The settings.json hook is an internal configuration change -- A1
(owner applies) per CLAUDE.md and the access matrix.

---

## Files read for this review

- `/home/user/eco-synthetic/.claude/settings.json`
- `/home/user/eco-synthetic/CLAUDE.md`
- `/home/user/eco-synthetic/memory/board.md` (T-0021 row)
- `/home/user/eco-synthetic/company/governance/gate-register.md`

---

*End of review. Output to Eco/Ido for T-0021 consolidation. Final decision is owner A1/A2.*
