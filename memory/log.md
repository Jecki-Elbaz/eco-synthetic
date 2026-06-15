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
2026-06-15 | Eco (scheduled insights run) | task-progress | T-0016 wiki + dashboard refresh executed. Files updated: memory/owner-dashboard.md (corrected stale Rambo claims; Rambo IS live, 17 agent files confirmed; added T-0013 through T-0019 to task lists; updated NEEDS section to reflect T-0002 brief not yet drafted and T-0019 as primary blocker); memory/wiki/backlog-summary.md (full rewrite -- old 2026-06-12 entries with wrong task numbering superseded); memory/wiki/agent-roster.md (certification status updated for Rambo, Hila, 10 P1 drafts). Root cause of stale wiki confirmed: backlog-summary.md was last synced 2026-06-12 with a different numbering scheme, causing Eco confabulation. | --
