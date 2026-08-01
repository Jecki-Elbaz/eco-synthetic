# Calendar convention -- Eco's Google Calendar as a trackable surface

Owner directive 2026-08-01 (jecki, A1): Eco manages his own Google Calendar
(eco.synthetic.org@gmail.com) so milestones, important events, and scheduled activities are
trackable by the owner -- and later by agents where it is effective. Status: CONVENTION ADOPTED;
owner asked for convention-only for now, so NO events are auto-created until the owner reviews
this convention. Calendar write is already authorized (settings.json: manage_event, create_calendar).

## What goes on the calendar (and only this)
- Company MILESTONES: product releases, pilot dates, demo/rehearsal dates, launch gates.
- Owner DEADLINES: any A1 item with a real due date the owner must act on or track.
- External MEETINGS: calls/meetings with a real external party (design partner, prospect).
- Scheduled ACTIVITIES / GATES: a dated gate or scheduled decision point (e.g. a compliance
  deadline, a security enforce-flip target date).

## What does NOT go on the calendar
- Routine internal task churn, reprioritization, or agent-to-agent handoffs -> the board.
- Transient status or reminders -> the dashboard (memory/owner-dashboard.md).
- Anything that would clutter the owner's calendar without being a real event or deadline.
The calendar is a SIGNAL surface, not a task log. If it is not a milestone, a deadline, a
meeting, or a dated gate, it does not belong here.

## Naming
`[TYPE] short description` -- TYPE in {Milestone, Deadline, Meeting, Gate}. Examples:
- `[Milestone] APS pilot rehearsal`
- `[Deadline] HR-001 R&R sweep`
- `[Gate] GUARD_MODE shadow->enforce target`
Keep titles short and specific; put detail in the event description, not the title.

## Owner tracking
Add jecki.elbaz@gmail.com as a GUEST on every Milestone and Deadline event so it surfaces on the
owner's own calendar (the owner accepts the invite once). This is the low-friction path; a
full-calendar share is a separate owner setup step and is not required. Do NOT add external
guests to internal tracking events.

## Who writes, and when
Eco (or the responsible agent, via Eco) creates/updates the event at the point a milestone or
deadline becomes real or changes -- tie it into the "update the wiki before marking a task done"
wake-up rule (Eco.md). One owner-visible event per real milestone; update the existing event
rather than creating duplicates.

## How the runner uses it (when wired -- not yet built)
- The 2h check-in reads the calendar (get_events, next 24-48h) for schedule context; a meeting
  within a short window with relevant wiki context -> surface a brief prep note (only if it meets
  the owner-facing urgent bar; otherwise silent).
- The morning digest lists milestones/deadlines that fall today or this week, as one-liners.

## Boundaries
- Calendar entries are internal operational tracking; they are not owner-authorized commitments
  to any external party. Creating an external meeting invite that commits the company remains A1.
- No personal/sensitive third-party data in event titles or descriptions (PPL minimization).
