# Git Hygiene -- Last Audit

Date: 2026-07-27 | Run by: audit.py (deterministic, zero-token) | Verdict: ATTENTION

## State
- Branch: master
- Upstream: yes | ahead 0 | behind 0
- Changed entries: 11 (staged 0 / unstaged 5 / untracked 6)
- Merge in progress: no
- Unpushed commits with template text in the subject: 0
- Top areas:
  - projects/ai-patient-simulator: 3
  - shared/handoff: 2
  - emory/board.md: 1
  - memory/enforce-readiness-state.json: 1
  - company/governance: 1
  - company/legal: 1
  - company/security: 1
  - integrations/runner: 1

## Flags (ATTENTION)
- 11 uncommitted changes sitting directly on master.

## Note
.env / secret CONTENTS never read; git diff content never dumped (red line 1).
Thresholds: uncommitted>=25, untracked>=15, master-dirty>=10.
