# Owner Dashboard

Last refreshed: 2026-07-20 06:23

---

## P1 Tasks (open / in-progress)

- **T-0004** Model router Phase A scope envelope -- Ido -- envelope due 07-14 OVERDUE (REACTIVATED 07-19; no delivery yet)
- **T-0001** Go-live structure + R&R review -- Eco -- in-progress / immediate
- **AUD-009** Guard pre-flip checklist -- guard-diff spec done (Rambo 07-14); owner A1 + Shir apply PENDING
- **AUD-004** CS-0001 policy -- Mike to fold Eyal section-8 -- stale since 07-11 (REACTIVATED 07-19)
- **AUD-007** Runner hardening -- owner FIX-05 (Task Scheduler missed-start flag) pending; build DONE
- **SEC-0001** Guard enforce-mode flip -- B2 behavioral fix + 7 clean days pending; gate monitoring
- **APS-027** Adam 3-session review package relay -- owner relay first days of Aug; package ready
- **SHIR-007** Git housekeeping -- Shir -- due immediate; REACTIVATED 07-19, no dated progress
- **SHIR-001** Bridge async ack -- Shir -- in-progress; rogue-host hunt + streaming still pending
- **T-0040** Shelly comms check on wake-up -- Shir (runner wiring) + Eco (manual) -- recurring
- **T-0045** Stale-task detector script -- Shir (script build) + Eco (interim live) -- in-progress
- **AUD-002** Production-readiness SOPs -- Shir + Assaf -- backlog; target 15-Aug APS rehearsal
- **T-0020** Agent-tool security gate -- Rambo -- R&D Bash path + bridge conditions still open

---

## Pending Owner Actions (jecki)

- **AUD-009 / AUD-013**: Apply consolidated guard-diff (guard-diff-consolidated-preflip-2026-07-14.md) -- A1 + Shir apply
- **AUD-007 FIX-05**: Set Task Scheduler "run task ASAP after missed start" on Eco-Synthetic Runner
- **AUD-010**: Owner A1 commit for role-file accuracy batch (Anat drafting; stale since 07-14)
- **APS-027**: Relay Adam review package (docs/adam-review-package-3session-draft-2026-07-15.md) -- first days of Aug
- **SHIR-007 git commit**: Commit outstanding git backlog from terminal (agents cannot commit)
- **T-0042**: Begin 2026-07-25 -- create dedicated Eco OAuth client (owner keystrokes in Google Cloud + setx)

---

## Run-Queue (pending actions by lane)

**Runner lane:** NOT ARMED (queue executor not wired into agent-prompts.md; awaits SEC-0001 enforce flip)

**Desktop lane (queued):**
- RQ-002: Land verify-before-forward in Eco.md (T-0038) -- T-0038 closed 07-14; likely stale
- RQ-003: Commit Noa role file -- APS-009 done 06-30; likely stale
- RQ-004: Email-send gate (T-0037) -- T-0037 closed 07-14; likely stale
- RQ-005: WhatsApp MCP gate (T-0039) -- both legs closed 07-11; likely stale

> RQ-002 through RQ-005 appear stale vs board state. Eco to reconcile + mark done.

---

## Per-Trigger Health

| Agent | Task | Cadence | Last run | Status |
|-------|------|---------|----------|--------|
| Eco | AM Brief | daily | 2026-07-18 09:57 | **OVERDUE** (>36h) |
| Eco | PM Summary | daily | 2026-07-18 21:57 | borderline (32h) |
| Eco | 2h Check-in | 2h | 2026-07-20 05:12 | OK |
| Assaf | Daily Cost Snapshot | daily | 2026-07-20 05:12 | OK |
| Assaf | Weekly Fitness Loop | weekly Mon | 2026-07-20 05:12 | OK |
| Assaf | Monthly On-demand (T-0009) | monthly | 2026-07-01 01:57 | OK (next ~08-01) |
| Rambo | Permission-drift scan | weekly Mon | 2026-07-20 05:57 | OK |
| Rambo | Adam Inbox Screen (exp 07-28) | 2h | 2026-07-20 05:12 | OK |
| Lital | Compliance check | weekly | 2026-07-20 05:57 | OK |
| Eyal | Compliance check | weekly | 2026-07-20 05:57 | OK |
| Dalia | Quality/tone audit | weekly | 2026-07-20 05:57 | OK |
| Yael | Doc-hygiene audit | weekly Mon | 2026-07-20 05:57 | OK |
| Ido | DASH-001 refresh | daily | 2026-07-19 01:57 | OK |
| Oracle | Daily chronicle | daily | 2026-07-19 01:57 | OK |
| Shir | Git-hygiene audit | daily | 2026-07-20 05:12 | OK |

---

## Quick Agent Roster

- **Eco**: 5+ open P1 tasks + coordination; AM/PM briefs missed 07-19
- **Ido**: T-0004 scope envelope OVERDUE; APS-022 pre-prod mandate; SHIR-007 oversight
- **Shir**: SHIR-001, SHIR-007 (immediate), SHIR-008, T-0040, T-0045, SEC-0001 B2 -- HIGH LOAD
- **Mike**: AUD-004 section-8 fold OVERDUE (stale 9 days since Eyal input 07-11)
- **Anat**: HR-001 (next 07-31), AUD-010 batch draft stale since 07-14
- **Rambo**: AUD-011 Tal marketing-scope scan pending; guard-diff done
- **Gal / Noa / Adi**: APS sprints done; APS-013 (Gal, pre-multi-college deploy) open P2
- **Oracle**: ORC-001 retrospective chronicle in-progress (daily runner)
- **Assaf**: T-0009, T-0031, T-0033 -- all active
