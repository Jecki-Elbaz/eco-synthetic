# Wiki-Maintenance Recurrence (T-0016 -- DEFINE only)

Status: DRAFT for owner review. Prepared by Eco (CEO) on an isolated working branch, 2026-06-16.
Scope: DEFINE the recurrence that keeps memory/wiki/ fresh. This document does NOT run a refresh.
Reason for not refreshing now: the roster is changing live under the parallel hiring session, so a
refresh now would be immediately stale. The recurrence defined here brings the wiki current after
that settles.

## Problem

The company wiki (memory/wiki/) is a cached, human-readable summary layer over the canonical files
(company/decisions/decisions-log.md, memory/board.md, .claude/agents/, company/model-matrix.md).
Cached summaries go stale: agents go live, decisions land, and the backlog moves while the wiki
pages keep showing the old state. Stale wiki pages are a VERIFY-THEN-CLAIM hazard -- they must never
be the source for a current-state assertion (already enforced by Eco's STATUS CHECK RULE), but they
should still be kept current as the fast human-readable index. The gap is that "keep it fresh" had
no defined cadence, no defined trigger, and no enforced owner.

## Ownership (assignment)

Owner of wiki maintenance: ECO (CEO).
Basis: the A3 grant "Eco wiki-write access granted (A3)" (decisions-log, 2026-06-12) makes wiki
update part of the DEFINITION of "task complete" -- a task is not done until the wiki reflects it.
Eco creates/updates memory/wiki/ pages autonomously, no owner trigger for routine updates. This
recurrence formalizes that standing responsibility into a scheduled + triggered routine rather than
an ad hoc one. Ownership is not delegated; Eco performs or explicitly directs each refresh.

## Pages in scope (the refresh set)

These four pages must be kept current. Each has a named canonical source it is summarizing:
- agent-roster.md      <- source: .claude/agents/ + company/roster.md (who is live, level, group, model)
- backlog-summary.md   <- source: memory/board.md (open/in-progress/done tasks by priority)
- decisions-summary.md <- source: company/decisions/decisions-log.md (recent significant decisions)
- home.md              <- source: the three above (top-level index / pointers; updated last)

Out of scope for the routine (update only on real change, not on cadence):
constitution-summary.md, glossary.md, model-matrix.md -- these change rarely and are refreshed when
the underlying canonical doc changes, not on the daily cadence.

## Recurrence (trigger / cadence)

Two triggers, belt-and-suspenders:

1. SCHEDULED -- part of Eco's daily EVENING ROUTINE.
   Once per day, as a fixed step in the evening routine, Eco refreshes the four in-scope pages
   against their canonical sources. This is the baseline cadence that catches drift even on a quiet
   day. The refresh reads the canonical source first (never summarizes from memory), then rewrites
   the page concisely and factually, and stamps "Updated: YYYY-MM-DD" at the top.

2. EVENT -- on every certification OR major decisions-log append.
   Any agent certification/go-live, or any significant append to company/decisions/decisions-log.md,
   triggers a same-session refresh of the affected pages (typically agent-roster.md and/or
   decisions-summary.md, and home.md if the top-level picture changed). This keeps the roster and
   decisions index from lagging between evening runs -- exactly the lag the live hiring wave creates.

Net effect: the wiki is at most one day stale on quiet items, and effectively live on the two things
that move fastest (roster and decisions).

## Enforcement (how this is actually kept)

The recurrence is enforced by wiring it into existing routines and the existing "task-complete"
definition, so it cannot quietly lapse:

1. Evening-routine step. Add an explicit "Wiki refresh (4 in-scope pages)" line item to Eco's daily
   evening routine checklist so the scheduled refresh is a named, non-optional step, not a memory
   item. The step is not "done" until each of the four pages reads its canonical source and is
   re-stamped with the current date.

2. Decisions-log-append trigger. Eco's existing wake-up spec already says "when closing/progressing
   a task, update the relevant wiki page BEFORE marking done; decision -> decisions-summary.md;
   agent online/changed -> agent-roster.md; backlog moved -> backlog-summary.md." This document
   binds that same trigger to EVERY certification and EVERY major decisions-log append, not only to
   Eco's own task closures -- so a decision landed by a parallel session also obligates a wiki
   refresh at Eco's next wake-up that reads the log.

3. Staleness check on wake-up. Each wake-up, Eco compares the "Updated:" date stamp on the four
   in-scope pages against the latest decisions-log / board change date. If a page is behind, refresh
   it before doing anything that would cite wiki content. (Citing current state still goes to the
   canonical files per the STATUS CHECK RULE -- the wiki is the human index, never the assertion
   source.)

4. Definition-of-done backstop. Per the 2026-06-12 A3 grant, a task is not complete until the wiki
   reflects it. Any task closure that touched roster, backlog, or decisions must show the matching
   wiki page updated, or the task is not done. This is the catch-all that makes the cadence and the
   event trigger self-correcting.

## Explicit non-action now

No wiki content is edited by this document. The first application of this recurrence should run AFTER
the parallel hiring session settles the roster, so agent-roster.md is refreshed once against a stable
.claude/agents/ rather than mid-change. Until then this file stands as the agreed definition; Eco
runs the first full refresh as the opening step of the next evening routine after the roster stabilizes.
