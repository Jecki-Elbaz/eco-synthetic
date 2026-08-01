# Git Hygiene -- Last Audit

Date: 2026-08-01 | Run by: audit.py (deterministic, zero-token) | Verdict: ATTENTION

## State
- Branch: master
- Upstream: yes | ahead 0 | behind 0
- Changed entries: 20 (staged 0 / unstaged 10 / untracked 10)
- Merge in progress: no
- Unpushed commits with template text in the subject: 0
- Top areas:
  - memory/wiki: 6
  - company/chronicle: 5
  - integrations/git-hygiene: 2
  - shared/handoff: 2
  - ompany/chronicle: 1
  - dashboards/agent-performance.html: 1
  - memory/board.md: 1
  - memory/enforce-readiness-state.json: 1
  - memory/owner-dashboard.md: 1

## Flags (ATTENTION)
- 20 uncommitted changes sitting directly on master.

## Note
.env / secret CONTENTS never read; git diff content never dumped (red line 1).
Thresholds: uncommitted>=25, untracked>=15, master-dirty>=10.
