# Git Hygiene -- Last Audit

Date: 2026-07-12 | Run by: audit.py (deterministic, zero-token) | Verdict: ATTENTION

## State
- Branch: master
- Upstream: yes | ahead 0 | behind 0
- Changed entries: 84 (staged 0 / unstaged 45 / untracked 39)
- Top areas:
  - projects/ai-patient-simulator: 66
  - company/governance: 4
  - company/chronicle: 3
  - memory/wiki: 3
  - integrations/git-hygiene: 2
  - ompany/chronicle: 1
  - memory/board.md: 1
  - memory/enforce-readiness-state.json: 1
  - memory/log.md: 1
  - memory/owner-dashboard.md: 1

## Flags (ATTENTION)
- 84 changed files uncommitted -- large unsaved pile.
- 39 new untracked files never added to git.
- 84 uncommitted changes sitting directly on master.

## Note
.env / secret CONTENTS never read; git diff content never dumped (red line 1).
Thresholds: uncommitted>=25, untracked>=15, master-dirty>=10.
