# Dispatch Queue

Work that a scheduled runner cycle identified but could NOT dispatch itself, waiting for an
interactive session to pick it up.

WHY THIS FILE EXISTS. The scheduled runner may dispatch only rambo, eyal, dalia and anat, and
only 3 per cycle (guard: RUNNER_SPAWN_ALLOW / RUNNER_SPAWN_CAP). The code-builders and
Bash-holders -- gal, shir, adi, noa, oren -- are owner-session-only by security design
(SEC-0001). Before 2026-08-02 the runner could dispatch nobody at all, so Eco's stale-sweep
could only append "REACTIVATED" notes into board rows that no agent would ever read. Tasks then
sat: SHIR-007 for 18 days, T-0004 for 50, the T-0046/T-0049 gate reviews for 11-19, each
collecting reactivation notes that executed nothing. This queue is the handoff that was missing.

## Protocol

WRITER (runner-path Eco, AM brief step 3b / 2h check-in step 8): append one row per task that
needs an agent you cannot dispatch. Never append a second row for a task_id already `pending`.

DRAINER (every interactive session, at start -- see CLAUDE.md): read this file, dispatch each
`pending` row to its target agent with a real task envelope, set the row to
`dispatched YYYY-MM-DD`, and set it to `done YYYY-MM-DD` once the work lands. A row that has
been `dispatched` for more than 7 days without landing goes back to `pending` with a note.

Rows `done` for more than 30 days move to the Archive section at the bottom.

Status values: `pending` -> `dispatched YYYY-MM-DD` -> `done YYYY-MM-DD`.

## Queue

| queued | task_id | target_agent | reason | requested_by | status |
|--------|---------|--------------|--------|--------------|--------|
| 2026-08-02 | T-0004 | gal | Model router Phase A build: 50 days in-progress, no build output on disk. Bash-holder, owner-session-only. Envelope exists: company/r-and-d/model-router-phase-a-envelope-ido-2026-07-25.md | owner-session-2026-08-02 | done 2026-08-02 -- Phase A delivered, 39 tests green, commit 226f357; release gate still Ido's |

Not queued, verified done before dispatch: SHIR-007 (git sort) closed 2026-08-02 by a
concurrent owner-dispatched Shir session, 5 commits pushed a4a28a2..7fb6408. Checked the row
and `git log` before queueing rather than after -- this is the AUD-010 verify-before-reactivate
rule applied to dispatch, and it is why the queue does not carry a phantom row for it.

## Archive

(none yet)
