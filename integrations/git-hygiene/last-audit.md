# Git Hygiene -- Last Audit

Date: 2026-07-26 | Run by: audit.py (deterministic, zero-token) | Verdict: ATTENTION

## State
- Branch: master
- Upstream: yes | ahead 0 | behind 1
- Changed entries: 38 (staged 0 / unstaged 15 / untracked 23)
- Top areas:
  - shared/handoff: 8
  - company/chronicle: 7
  - memory/wiki: 6
  - integrations/runner: 5
  - integrations/git-hygiene: 2
  - claude/agents: 1
  - CLAUDE.md: 1
  - company/cs: 1
  - company/governance: 1
  - company/hr: 1

## Flags (ATTENTION)
- 1 commit(s) on the remote not pulled in yet.
- 38 changed files uncommitted -- large unsaved pile.
- 23 new untracked files never added to git.
- 38 uncommitted changes sitting directly on master.

## Note
.env / secret CONTENTS never read; git diff content never dumped (red line 1).
Thresholds: uncommitted>=25, untracked>=15, master-dirty>=10.
