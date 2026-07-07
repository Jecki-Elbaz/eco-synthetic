# Owner Dashboard

Last refreshed: 2026-07-07 04:08

---

## ALERT: Runner appears DOWN

All runner-state timestamps stalled at 2026-07-03 (~3.5 days gap). Every interval trigger
is dormant. Owner action: check Task Scheduler "Eco-Synthetic Runner" + restart if stopped.

---

## P1 Tasks Open / In-Progress

- T-0020 | Agent-tool security gate | in-progress | Rambo | R&D path pending Shir
- SEC-0001 | Guard enforce-mode flip | in-progress | Shir/Rambo/jecki | B2 fix + clean window pending
- AUD-001 | Shared-file lock (board race) | open | Shir+Eco | backlog
- AUD-002 | Production-readiness SOPs | open | Shir+Assaf | target 2026-08-15
- T-0040 | Shelly comms check on wake-up | in-progress | Shir+Eco | recurring; wiring pending
- SHIR-001 | Bridge rogue-host + async ack | in-progress | Shir | loose ends open
- APS-010 | Relay open questions to Adam | open | Eco/jecki | due 2026-07-11
- T-0033 | Proactivity program (event triggers) | in-progress | Assaf/Eco | Phase B pending

---

## Pending Owner Actions (waiting on jecki)

- RQ-003 (APS-009): Commit Noa.md -> .claude/agents/ + session reload. Noa B3 live gate due TODAY.
- RQ-002 (T-0038): Edit Eco.md w/ verify-before-forward guideline (A1 given; run in Claude Code)
- RQ-005 (T-0039): WhatsApp gate -- record commit SHA + ban-risk acceptance in decisions-log
- RQ-004 (T-0037): Email-send gate -- OAuth re-consent in browser after Eyal confirms (Eyal leg pending)
- APS-010: Relay questions to Adam -- due 2026-07-11 (owner-only relay)
- AUD-004/Mike: CS-0001 draft due TODAY (2026-07-07) -- check if Mike submitted
- HIL-003/Hila: 3 LinkedIn post drafts postponed to TODAY -- review when ready
- DAL-001/Dalia: resume was due 2026-07-04 (3 days overdue)

---

## Run-Queue (by lane)

**Runner lane:** queue executor NOT armed -- no items auto-run

**Desktop lane (jecki or /flush):**
- RQ-002 | Eco role-file verify-before-forward edit (T-0038) | queued
- RQ-003 | Commit Noa role file + session reload (APS-009) | queued
- RQ-004 | Email-send gate Rambo+Eyal (T-0037) | queued
- RQ-005 | whatsapp-mcp gate completion (T-0039) | queued

---

## Per-Trigger Health

!! RUNNER STOPPED -- last fire 2026-07-03; all daily/2h triggers OVERDUE !!

- Eco: 2h check-in | cadence 2h | last 2026-07-03 | **OVERDUE**
- Eco: AM brief | daily | last 2026-07-03 | **OVERDUE**
- Eco: PM summary | daily | last 2026-07-03 | **OVERDUE**
- Assaf: cost snapshot | daily | last 2026-07-03 | **OVERDUE**
- Ido: DASH-001 | daily | last 2026-07-03 | **OVERDUE**
- Oracle: chronicle | daily | last 2026-07-03 | **OVERDUE**
- Shir: git-hygiene | daily | last 2026-07-03 | **OVERDUE**
- Assaf: fitness loop | weekly (Mon) | last 2026-06-29 | OK (8d / 10.5d limit)
- Rambo: permission scan | weekly (Mon) | last 2026-06-29 | OK
- Lital+Eyal: compliance | weekly | last 2026-06-29 | OK
- Dalia: quality audit | weekly | last 2026-06-29 | OK
- Yael: doc-hygiene | weekly (Mon) | last 2026-06-29 | OK
- Assaf: monthly T-0009 | monthly | last 2026-07-01 | OK
- Shir: bridge uptime | 15-30m | PENDING BUILD | -
- MeetingPrep | event trigger | PENDING BUILD | -

---

## Quick Agent Roster

- Eco: many tasks (T-0001/003/006/007/008/033/036/038/040, APS-004/010) | runner OVERDUE
- Shir: 5 tasks (SHIR-001/006, SEC-0001 B2, AUD-001, T-0040) | git-hygiene OVERDUE
- Gal: 4 tasks (APS-011/012/013/014 Sprint 2)
- Noa: 1 task (APS-014 UI) | live B3 gate due today
- Anat: HR-001/002 | Noa B3 gate due today
- Assaf: T-0031/033 + HR-002 C2 (~07-08) | cost snapshot OVERDUE
- Rambo: T-0020/037/039, SEC-0001 | scan OK
- Eyal: T-0037/039, APS-004 residual | compliance check OK
- Mike: CS-0001/AUD-004 | draft due today
- Hila: HIL-003/004 | post drafts due today
- Dalia: DAL-001 (resume 3d overdue), AUD-006 | quality audit OK
- Oracle: ORC-001 (B3-B7 pending) | chronicle OVERDUE
- Ido: DASH-001 | refresh OVERDUE
