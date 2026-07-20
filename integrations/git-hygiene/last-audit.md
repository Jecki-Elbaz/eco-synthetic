# Git Hygiene -- Last Audit

Date: 2026-07-20 | Run by: audit.py (deterministic, zero-token) | Verdict: ATTENTION

## State
- Branch: master
- Upstream: yes | ahead 0 | behind 0
- Changed entries: 12 (staged 0 / unstaged 0 / untracked 4)
- Top areas:
  - company/chronicle: 2
  - integrations/git-hygiene: 2
  - memory/wiki: 2
  - ompany/chronicle: 1
  - memory/board.md: 1
  - memory/enforce-readiness-state.json: 1
  - memory/owner-dashboard.md: 1
  - memory/feedback_language_rule.md: 1
  - shared/handoff: 1

## Flags (ATTENTION)
- 12 uncommitted changes sitting directly on master.

## Note
.env / secret CONTENTS never read; git diff content never dumped (red line 1).
Thresholds: uncommitted>=25, untracked>=15, master-dirty>=10.
