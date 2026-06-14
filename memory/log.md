# Eco-Synthetic: Activity Log

Running activity log. Append-only — add new entries at the bottom, never edit existing ones.
All agents append their own entries. Assaf (OE) monitors usage and cost.

Format per entry:
```
YYYY-MM-DD HH:MM | agent | action | detail | tokens (if known)
```

---

2026-06-12 | Claude Code (jecki session) | scaffold | Repo scaffolded per company/repo-structure.md. All folders, infrastructure files, company docs, agent role files placed. See company/build-log.md Phase 1 entry for full details. | --

2026-06-14 | Eco-session (observed) | performance-flag | Eco asserted "nothing was done" after jecki approved Rambo onboarding, without reading decisions-log.md or board.md first. Rule breach: Core Block rule 2 (VERIFY-THEN-CLAIM). Root context: work was on branch claude/pending-agent-onboarding-gb6f9e, not yet merged to master; Eco read master and found no changes. Correct response: "I see no changes on master -- work may be on a branch." Fix applied: explicit status-check trigger added to Eco.md (A1, jecki, 2026-06-14). Flagged to Anat for R&R record. | --
2026-06-14 | Eco-session (observed) | performance-flag | Eco cited "ONB-001 through ONB-008" as real board tasks in same session. Investigation: those IDs do not exist in memory/board.md or anywhere in git history (all commits searched). Root cause: Eco appears to have read stale memory/wiki/backlog-summary.md (last auto-synced 2026-06-12, different task numbering scheme) and confabulated an ONB prefix. Core Block rule 2 breach. R&R flag added to Eco.md certification section. Wiki source-of-truth rule added to Eco.md triggers. | --
2026-06-14 | Eco-session-2 (observed) | performance-flag-escalation | Eco invented 6 system-state facts that do not exist anywhere in the repo (confirmed git ls-tree both branches): (1) claimed PR merged before it was; (2) company/hr/role-drafts/Rambo-final.md; (3) memory/owner-dashboard.md; (4) Gate-3 activation process; (5) ONB-001..008 AGAIN after prior flag; (6) DASH-001 task. All fabricated. This is a pattern across two sessions -- not isolated failures. Owner flagged as "very big problem." Fixes (STATUS CHECK RULE, BRANCH AWARENESS RULE, OPUS default) now live on master after PR merge 2026-06-14. R&R flag escalation added to Eco.md. Anat to assess before Eco's next certification renewal. | --
2026-06-14 | Claude Code (jecki session) | sync-fix | Root cause identified for Eco stale-state: Eco Telegram bridge runs on local Windows clone that never auto-pulls from GitHub. Cloud sessions push to master; local clone stays on old state; Eco reads stale files. Fix applied: UserPromptSubmit hook added to .claude/settings.json (command: git pull --ff-only origin master 2>&1 | tail -2 || true) -- fires before every session start. NOTE: auto-mode classifier blocked the settings.json edit; owner must apply the JSON change manually (see board T-0021 notes and CHANGELOG PR #2 entry for exact diff). T-0021 created and assigned to Ido (VP R&D) to validate, harden, and lock the mechanism. LOCAL SYNC RULE added to Eco.md triggers. | --
