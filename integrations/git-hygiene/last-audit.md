# Git Hygiene -- Last Audit

Date: 2026-07-02 | Run by: audit.py (deterministic, zero-token) | Verdict: ATTENTION

## State
- Branch: master
- Upstream: yes | ahead 0 | behind 0
- Changed entries: 186 (staged 0 / unstaged 16 / untracked 170)
- Top areas:
  - projects/ai-patient-simulator: 143
  - company/hr: 10
  - company/governance: 9
  - memory/wiki: 6
  - company/chronicle: 5
  - integrations/git-hygiene: 2
  - claude/agents: 1
  - .claude/settings.json: 1
  - company/customers: 1
  - company/decisions: 1

## Flags (ATTENTION)
- 186 changed files uncommitted -- large unsaved pile.
- 170 new untracked files never added to git.
- 186 uncommitted changes sitting directly on master.

## Note
.env / secret CONTENTS never read; git diff content never dumped (red line 1).
Thresholds: uncommitted>=25, untracked>=15, master-dirty>=10.
