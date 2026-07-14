# Git Hygiene -- Last Audit

Date: 2026-07-14 | Run by: audit.py (deterministic, zero-token) | Verdict: ATTENTION

## State
- Branch: master
- Upstream: yes | ahead 0 | behind 0
- Changed entries: 36 (staged 0 / unstaged 18 / untracked 18)
- Top areas:
  - projects/ai-patient-simulator: 20
  - company/governance: 4
  - integrations/runner: 3
  - company/chronicle: 2
  - integrations/git-hygiene: 2
  - ompany/chronicle: 1
  - memory/board.md: 1
  - memory/enforce-readiness-state.json: 1
  - memory/log.md: 1
  - company/security: 1

## Flags (ATTENTION)
- 36 changed files uncommitted -- large unsaved pile.
- 18 new untracked files never added to git.
- 36 uncommitted changes sitting directly on master.

## Note
.env / secret CONTENTS never read; git diff content never dumped (red line 1).
Thresholds: uncommitted>=25, untracked>=15, master-dirty>=10.
