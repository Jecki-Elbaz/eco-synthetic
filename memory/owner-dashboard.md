# Owner Dashboard -- Eco-Synthetic
Last refreshed: 2026-06-28 02:05

---

## P1 Tasks

- **T-0001** Go-live R&R review | in-progress | Eco | due: immediate
- **T-0020** Security gate (Agent tool / bridge) | in-progress | Rambo | interim live; Bash R&D pending C3
- **SEC-0001** Guard enforce-mode flip | open | Shir + jecki A1 | backlog; shadow mode now
- **DASH-001** Auto-refresh dashboard | in-progress | Ido | ASAP; blocked on SHIR-005
- **SHIR-001** Bridge async ack + rogue-host close-out | in-progress | Shir | next sprint
- **SHIR-005** Scheduled runner build | in-progress | Shir | ASAP -- blocks ALL triggers + DASH-001

---

## Pending Owner Actions (waiting on jecki)

- **Hiring A1 batch** -- activate Ido, Dalia, Noam, Lital, Assaf; Stage C packages ready in company/hr/stage-c/
- **Gal + Shir go-live A1** -- B3-B6 done; Bash agents held for owner batch
- **SEC-0001 guard flip A1** -- after shadow-log validation window clears; Shir will request
- **SHIR-001 rogue-host** -- elevated PowerShell: Get-CimInstance Win32_Process | select ProcessId,CommandLine to ID 3rd python/Telegram PID; do NOT kill blind
- **SHIR-001 bridge restart** -- restart eco bridge in fresh shell to activate httpx token-leak fix (SHIR-002 code applied 2026-06-27)
- **HIL-003/004** -- create LinkedIn page + secure "ecosynthetic" handles; content at marketing/social/social-presence-draft-2026-06-23.md
- **T-0034** -- IL company registration on hold (owner directive); Eco surfaces 30 days before first contract
- **DAL-001** -- human-comms policy on hold; resume 2026-07-04 or after CS-0001 owner approval, whichever first

---

## Trigger Health

**Root issue: SHIR-005 (scheduled runner) not built. No trigger actually fires. runner-state.json does not exist.**
Cadence clock from ACTIVE date 2026-06-22. All last_run = UNKNOWN.

- Eco AM brief | Daily | UNKNOWN | **OVERDUE** (6d > 1.5d threshold)
- Eco PM summary | Daily | UNKNOWN | **OVERDUE** (6d > 1.5d threshold)
- Assaf cost snapshot | Daily | UNKNOWN | **OVERDUE** (6d > 1.5d threshold)
- Assaf fitness loop | Weekly Mon | UNKNOWN | missed first fire 2026-06-23
- Assaf on-demand review | Monthly | UNKNOWN | within window
- Rambo permission scan | Weekly Mon | UNKNOWN | missed first fire 2026-06-23
- Oracle chronicle sweep | Daily | BLOCKED | T-0020 C3 -- off spawn-allowlist
- Lital+Eyal compliance check | Weekly | UNKNOWN | missed first fire week of 2026-06-22
- Dalia quality audit | Weekly | UNKNOWN | missed first fire week of 2026-06-22
- Ido DASH-001 refresh | Hourly | UNKNOWN | **OVERDUE** (this run = manual fill-in)
- Shir bridge uptime | 15-30 min | PENDING BUILD | needs SHIR-005 + T-0020 C3 + Bash
- MeetingPrep | Event-driven | PENDING BUILD | needs SHIR-005

---

## Agent Roster

- **Eco** -- ~10 tasks open/in-prog; heaviest queue in company
- **Shir** -- 3 tasks (SHIR-001/003/005); 2x P1 in-prog; highest delivery pressure
- **Rambo** -- T-0020 in-prog (P1); T-0035 blocked on void T-0032
- **Ido** -- DASH-001 in-prog (P1); waiting on Shir/SHIR-005
- **Oracle** -- ORC-001 open; due 2026-06-29 (background chronicle build)
- **Hila** -- HIL-003/004 in-prog; awaiting owner action to publish
- **Mike** -- CS-0001 open; unblocked 2026-06-24; draft in progress
- **Dalia** -- DAL-001 on hold; resume 2026-07-04
- **Assaf/Yossi** -- T-0031 ongoing (tool-library catalog)
- **jecki** -- 8 pending actions above; T-0034 on hold
