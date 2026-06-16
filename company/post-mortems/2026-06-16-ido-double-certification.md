# Post-mortem: Ido double-certification (2026-06-16)

Owner of record: Dalia (Quality & Governance) -- to expand and track action items.
Status: documented at merge time; open for Dalia review.

## Summary
Ido (VP R&D) was certified twice, the same day, by two parallel Claude Code sessions that
were unaware of each other:
- R&D-wave session (branch claude/agent-buildout-ido): certified Ido -> Gal -> Shir, merged to master.
- Bridge-config session (branch claude/agent-tool-bridge-config-8kotbr): certified Eyal, then a
  consolidated batch of Ido, Noam, Lital, Dalia, Assaf.

Both produced a certified Ido with owner A1 and competency 3/3. No conflicting outcome -- a
duplicate of effort, not a contradiction.

## Impact
- Wasted effort: one full Ido competency pipeline run twice (~5 sub-agent runs of duplicate work).
- Merge friction: 4 conflicting files at merge (Ido.md, Ido-spec, Ido-test-results, decisions-log).
- No production harm: resolved by keeping master's already-live Ido; no information lost (the
  bridge-config Ido artifacts remain in branch history, commits up to 4d1a6f9).

## Root cause
Concurrent agent-buildout work on diverged branches/clones with no cross-session coordination
or lock. Each session read its own branch as truth and proceeded. This is the exact failure
mode that T-0002 Decision 1 (file-level locking at all times, owner A1 2026-06-16) targets.

## What worked
- Append-only decisions-log made both histories recoverable; union lost nothing.
- The merge was inspected before pushing to production rather than blind-merged.
- Both certifications independently reached the same correct result (no quality divergence).

## Action items
1. Build the T-0002 Decision-1 file-lock so concurrent shared-file writes are serialized. (R&D)
2. Until the lock exists, serialize agent-buildout through one session, or claim each agent on
   memory/board.md before starting its pipeline, so two sessions never take the same agent. (Eco)
3. Add a pre-flight check to the hiring process: before Stage B, verify the agent is not already
   certified or in-progress on master / another branch. (Anat + Eco)
4. Confirm no other agent overlapped -- per the 2026-06-16 merge diff, only Ido did. (Eco, done at merge)
