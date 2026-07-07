# Git Hygiene -- Last Audit

Date: 2026-07-07 | Run by: audit.py (deterministic, zero-token) | Verdict: ATTENTION

## State
- Branch: master
- Upstream: yes | ahead 0 | behind 0
- Changed entries: 139 (staged 0 / unstaged 22 / untracked 117)
- Top areas:
  - projects/ai-patient-simulator: 119
  - company/governance: 5
  - marketing/social: 5
  - memory/wiki: 3
  - integrations/git-hygiene: 2
  - ompany/governance: 1
  - memory/board.md: 1
  - memory/enforce-readiness-state.json: 1
  - memory/owner-dashboard.md: 1
  - company/security: 1

## Flags (ATTENTION)
- 139 changed files uncommitted -- large unsaved pile.
- 117 new untracked files never added to git.
- 139 uncommitted changes sitting directly on master.

## Note
.env / secret CONTENTS never read; git diff content never dumped (red line 1).
Thresholds: uncommitted>=25, untracked>=15, master-dirty>=10.
