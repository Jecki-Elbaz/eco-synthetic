# Git Hygiene -- Last Audit

Date: 2026-06-30 | Run by: audit.py (deterministic, zero-token) | Verdict: ATTENTION

## State
- Branch: master
- Upstream: yes | ahead 1 | behind 0
- Changed entries: 187 (staged 0 / unstaged 18 / untracked 169)
- Top areas:
  - projects/ai-patient-simulator: 140
  - company/governance: 10
  - company/hr: 7
  - company/chronicle: 4
  - memory/wiki: 4
  - integrations/git-hygiene: 4
  - .claude/agents: 2
  - integrations/runner: 2
  - company/security: 2
  - claude/agents: 1

## Flags (ATTENTION)
- 1 commit(s) committed locally but NOT pushed to GitHub.
- 187 changed files uncommitted -- large unsaved pile.
- 169 new untracked files never added to git.
- 187 uncommitted changes sitting directly on master.

## Note
.env / secret CONTENTS never read; git diff content never dumped (red line 1).
Thresholds: uncommitted>=25, untracked>=15, master-dirty>=10.
