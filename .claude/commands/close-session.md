# /close-session

Cleanly close a working session: make sure nothing is left half-open, the board and logs
reflect reality, and the repo is committed + pushed (or confirmed it does not need to be).
Run this at the end of any working session before signing off.

## Steps

1. **Background work.** Confirm no spawned subagents / background tasks are still running. If any
   are in-flight, either wait for them or explicitly tell the owner what is still running and that
   its result is not yet folded in. Never close while claiming "done" if work is still pending.

2. **Board + logs honest** (see [[feedback_eco_owns_board]] / feedback_verify_before_claim).
   - For every task touched this session, update its `memory/board.md` row + status to the real
     state. Nothing sits without a stated reason.
   - Append any decisions made this session to `company/decisions/decisions-log.md` (append-only;
     new entries at the bottom; never edit existing ones -- red line 6).
   - Read the row back if unsure; do not assert state from memory.

3. **Owner-action items surfaced.** Anything that needs the owner (an email to send, an OAuth
   consent, an A1 approval, a manual step) must be stated plainly to the owner now -- not left
   implicit in a file. Say clearly whether each drafted email is "send this" vs "for awareness"
   ([[feedback_minimize_adam_contact]] / feedback_show_draft_before_approval).

4. **Git.** Run `git status`.
   - If there are uncommitted changes that are legitimate work product, stage them
     (`git add -A`, or a scoped set if only part should land), commit with a clear message ending
     in the `Co-Authored-By: Claude` trailer, and `git push`.
   - NEVER commit secrets, tokens, `.env`, or personal data (red line 5). If a staged file looks
     suspicious, STOP and flag it to the owner instead of committing.
   - NEVER force-push to a shared branch; never `git reset --hard` on shared branches (red line 3).
   - If there is genuinely nothing to commit, say so explicitly ("working tree clean, nothing to
     push").

5. **Verify the sync.** After pushing, confirm `git status` is clean and local is level with origin
   (`git rev-list --left-right --count HEAD...origin/master` -> `0  0`). Report the pushed commit
   hash.

6. **Close-out summary to the owner.** One short block:
   - What was accomplished this session.
   - What was committed + pushed (hash), or "nothing to commit."
   - What is still open, who owns it, and any owner action outstanding.
   - Lead with open items / owner-actions first.

## Notes
- This is bookkeeping discipline, not new work -- do not start fresh tasks during a close.
- If the repo uses a git-hygiene runner that auto-commits, still verify the session's own changes
  actually landed; do not assume the runner caught them.
