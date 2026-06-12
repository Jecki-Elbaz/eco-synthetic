# /insights

Generate a daily insights summary from the current company state.
Output plain text only -- no emojis, no em dashes, no curly quotes.

## Steps

1. Read `memory/board.md` -- classify each task as: done, in-progress, blocked, or open/stale.
   A task is stale if it is open with no log entry in the last 3 days.

2. Read the last 40 lines of `memory/log.md` -- recent activity and agent actions.

3. Read the last 4 entries of `company/decisions/decisions-log.md` -- recent decisions.

4. Read `memory/wiki/glossary.md` -- count terms as a proxy for wiki growth.

5. Check `company/governance/schedules.md` if it exists -- note any upcoming deadlines or
   scheduled events in the next 7 days.

6. Synthesize:
   - MOMENTUM: tasks completed or meaningfully advanced in the last 24h
   - STUCK / AT RISK: tasks open >3 days with no log activity; note why if visible
   - DECISIONS: last 1-2 decisions in one line each (date + what)
   - PATTERN: one observation about how the company is operating
     (e.g. "decisions are being made but wiki is not being updated",
      "three tasks have been open >7 days with no owner")
   - IMPROVE THIS: one concrete, specific suggestion to act on today

## Output format

Keep the full output under 25 lines. Use this structure exactly:

---
DAILY INSIGHTS -- <YYYY-MM-DD>

MOMENTUM
- <item>

STUCK / AT RISK
- <item> (stale <N> days)

DECISIONS (recent)
- <date>: <what was decided, one line>

PATTERN
<one observation>

IMPROVE THIS
<one concrete suggestion>
---

If memory/log.md or memory/board.md do not exist yet, note "no data yet" for that section
and skip it -- do not guess or fabricate activity.

Apply constitution section 16: never guess. If a file is absent or ambiguous, say so.
