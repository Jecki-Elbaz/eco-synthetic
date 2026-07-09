# Git Hygiene -- Last Audit

Date: 2026-07-09 | Run by: audit.py (deterministic, zero-token) | Verdict: ATTENTION

## State
- Branch: master
- Upstream: yes | ahead 1 | behind 0
- Changed entries: 38 (staged 0 / unstaged 18 / untracked 20)
- Top areas:
  - projects/ai-patient-simulator: 15
  - company/governance: 3
  - company/hr: 3
  - company/chronicle: 2
  - company/policies: 2
  - integrations/git-hygiene: 2
  - memory/wiki: 2
  - ompany/chronicle: 1
  - company/decisions: 1
  - integrations/runner: 1

## Flags (ATTENTION)
- 1 commit(s) committed locally but NOT pushed to GitHub.
- 38 changed files uncommitted -- large unsaved pile.
- 20 new untracked files never added to git.
- 38 uncommitted changes sitting directly on master.

## Note
.env / secret CONTENTS never read; git diff content never dumped (red line 1).
Thresholds: uncommitted>=25, untracked>=15, master-dirty>=10.
