# Owner Dashboard

Last refreshed: 2026-07-09 02:00

---

## P1 Tasks

- T-0037 | Email-send gate | in-progress | Rambo/Eyal | owner: SHA re-pin + settings.json gmail.compose + OAuth re-consent needed
- SEC-0001 | Guard enforce-mode flip | in-progress | Shir/Rambo | B2 behavioral fix + 7-day clean window pending
- AUD-004 / CS-0001 | Customer-comms policy | in-progress | Mike/Eyal | Eyal retention input this cycle; then owner A1 package
- APS-017 | Multi-session + self-sim scope | open | Ido | CRITICAL PATH -- feasibility call needed immediately
- AUD-001 | File-lock shared files | open | Shir | backlog; race risk grows with APS
- AUD-002 | Prod-readiness SOPs | open | Shir/Assaf | target 2026-08-15 APS rehearsal
- T-0020 | Agent-tool security gate | in-progress | Rambo | R&D Bash path pending Shir
- SHIR-001 | Bridge async-ack | in-progress | Shir | rogue-host + async enhancement pending
- DASH-001 | Owner dashboard | in-progress | Ido | ongoing (auto-refresh live)

---

## Pending Owner Actions

- T-0037 | 3 steps: (1) re-pin GR-009 SHA in decisions-log, (2) add gmail.compose scope to settings.json, (3) OAuth re-consent in browser | Eco/Rambo waiting
- HR-002 | Noa cert: edit .claude/agents/Noa.md PROVISIONAL->FULL | Anat waiting
- AUD-004 | CS-0001 owner A1 package (Eyal retention input this cycle unblocks it) | Mike waiting
- T-0039 | WhatsApp at install: record commit SHA + ban-risk acceptance in decisions-log | Eyal waiting
- DAL-001 | Append POL-001 A1 grant to decisions-log (next tool session) | Dalia waiting

---

## Run-Queue (by lane)

desktop lane (queue NOT armed -- executor off until SEC-0001 guard flip):
- RQ-002 | desktop | Land verify-before-forward guideline in Eco.md | queued
- RQ-003 | desktop | Commit Noa.md + session reload | queued
- RQ-004 | desktop | Email-send gate T-0037 | queued
- RQ-005 | desktop | WhatsApp-mcp gate T-0039 | queued

runner lane: no items pending.

---

## Trigger Health

- Eco:2h Check-in | 2h | 2026-07-08 23:57 | OK
- Eco:AM Brief | daily | 2026-07-08 08:59 | OK
- Eco:PM Summary | daily | 2026-07-08 20:33 | OK
- Assaf:Daily Cost Snapshot | daily | 2026-07-08 01:57 | OK
- Ido:DASH-001 Refresh | daily | 2026-07-08 01:57 | OK
- Oracle:Daily Chronicle | daily | 2026-07-08 01:57 | OK
- Shir:git-hygiene-audit | daily | 2026-07-08 01:57 | OK
- Assaf:Monthly Agent Review | monthly | 2026-07-01 | OK
- Assaf:Weekly Fitness Loop | weekly (Mon) | 2026-06-29 | APPROACHING OVERDUE -- missed Jul-6 (9.8d elapsed, 1.5x = 10.5d)
- Rambo:Weekly Perm Scan | weekly (Mon) | 2026-06-29 | APPROACHING OVERDUE -- missed Jul-6
- Lital+Eyal:Weekly Compliance | weekly | 2026-06-29 | APPROACHING OVERDUE -- missed Jul-6
- Dalia:Weekly Quality Audit | weekly | 2026-06-29 | APPROACHING OVERDUE -- missed Jul-6
- Yael:Weekly Doc-Hygiene | weekly (Mon) | 2026-06-29 | APPROACHING OVERDUE -- missed Jul-6

---

## Agent Roster

- Eco: 5+ active (T-0001, T-0037 coords, T-0039 coords, T-0040 manual, APS-004)
- Shir: 6 active (SHIR-001 P1, SEC-0001, AUD-001, AUD-002, SHIR-006 daily, APS-016)
- Ido: 2 active (DASH-001, APS-017 P1 urgent)
- Gal: 4 open (APS-011, APS-012, APS-013, APS-014)
- Noa: 1 active (APS-014 UI parts)
- Mike: 1 P1 (CS-0001/AUD-004)
- Eyal: 2 pending this cycle (AUD-004 retention, T-0039 confirm)
- Rambo: 2 active (T-0020, SEC-0001)
- Anat: 2 active (HR-001, HR-002)
- Assaf: 2 active (T-0031, T-0033)
- Oracle: 1 active (ORC-001)
