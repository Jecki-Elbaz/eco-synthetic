# Owner Dashboard

Last refreshed: 2026-07-27 04:05

---

## P1 Tasks (open / in-progress)

- **T-0004** | Model router Phase A build | in-progress | Gal | sprint in progress
- **T-0020** | Agent-tool security gate | in-progress | Rambo | R&D (Shir) sub-items pending
- **SEC-0001** | Guard enforce-mode flip | in-progress | Shir (B2 fix) + owner (A1 flip) | awaiting 7-day clean window after B2
- **AUD-007** | Runner hardening | in-progress | Shir done; owner: Task Scheduler FIX-05 flag + keep machine on Mondays
- **AUD-009** | Guard pre-flip checklist | open | jecki | changes applied 2026-07-26; owner terminal commit pending
- **AUD-002** | Production-readiness SOPs | open | Shir + Assaf | backlog, target 2026-08-15 rehearsal
- **T-0045** | Stale-task auto-reactivation | in-progress | Eco (interim live) + Shir (script, next sprint)
- **APS-027** | Adam 3-session review checkpoint | open | jecki (relay) | package ready; relay first days Aug; HARD before 15-Aug
- **SHIR-001** | Bridge async-ack | in-progress | ESCALATED to owner 2026-07-26 - dispatch Shir or deprioritize
- **SHIR-007** | Git housekeeping | open | Shir | immediate; owner already waiting

---

## Pending Owner Actions

1. **Terminal commit batch** (AUD-009 guard.py + AUD-010 role-files + AUD-013 redteam clauses + AUD-006 access-matrix) -- all applied, just need `git commit` from your terminal. No secrets.
2. **APS-027 relay** -- send Adam the 3-session review package (docs/adam-review-package-3session-draft-2026-07-15.md); must land before 15-Aug rehearsal. Package ready, regen Section 4 live numbers first.
3. **SHIR-001** -- dispatch Shir for async-ack in next sprint OR formally mark deprioritized on board. 2 reactivation notes ignored.
4. **AUD-007 FIX-05** -- set "run task ASAP after missed start" on the Eco-Synthetic Runner Task Scheduler job + keep machine on Mondays.
5. **T-0047 decision** -- inbox-triage re-scope blocked: pick Path A (close Anthropic DPA compliance Item 6) or Path B (fresh in-session residual-risk A1) to unblock whole-inbox triage after GR-014 Adam-only expires 2026-07-28 (tomorrow).
6. **HR-001** (Anat) -- next R&R sweep due 2026-07-31 (4 days).

---

## Run-Queue (pending actions by lane)

**Runner lane:** (queue executor NOT ARMED -- no items run autonomously yet)
- No runner-lane items pending.

**Desktop lane:**
- RQ-002 | Land verify-before-forward guideline in Eco.md | queued
- RQ-003 | Commit Noa.md + make spawnable | queued
- RQ-004 | Email-send gate for Eco account | queued
- RQ-005 | WhatsApp-mcp gate review | queued

---

## Per-Trigger Health

| Agent | Cadence | Last Run | Status |
|-------|---------|----------|--------|
| Eco 2h Check-in | 2h | 2026-07-27 03:57Z | OK |
| Eco AM Brief | Daily | 2026-07-26 09:57Z | OK |
| Eco PM Summary | Daily | 2026-07-26 21:57Z | OK |
| Assaf Cost Snapshot | Daily | 2026-07-27 01:57Z | OK |
| Assaf Fitness Loop | Weekly (Mon) | 2026-07-27 01:57Z | OK |
| Assaf On-demand Review | Monthly | 2026-07-01 01:57Z | OK (26d/30d) |
| Rambo Permission-Drift Scan | Weekly (Mon) | 2026-07-27 01:57Z | OK |
| Rambo Adam Inbox Screen | 2h (EXPIRES 07-28) | 2026-07-27 03:57Z | ** EXPIRES TOMORROW ** |
| Rambo Guard-proof suite | Daily | 2026-07-27 01:57Z | OK |
| Lital Compliance Check | Weekly | 2026-07-27 01:57Z | OK |
| Eyal Compliance Check | Weekly | 2026-07-27 01:57Z | OK |
| Dalia Quality/Tone Audit | Weekly | 2026-07-27 03:57Z | OK |
| Yael Doc-Hygiene Audit | Weekly (Mon) | 2026-07-27 03:57Z | OK |
| Ido DASH-001 Refresh | Daily | 2026-07-26 01:57Z | OK |
| Oracle Chronicle Capture | Daily | 2026-07-26 01:57Z | OK |
| Shir Git-Hygiene Audit | Daily | 2026-07-27 01:57Z | OK |

No OVERDUE triggers. Rambo Adam Inbox Screen expires 2026-07-28 -- T-0047 owner decision needed today.

---

## Agent Roster (active task count)

- **Eco** -- 4 open tasks (T-0003, T-0006, T-0045, T-0047)
- **Gal** -- 1 (T-0004 build, in sprint)
- **Shir** -- 4 (SEC-0001 B2, AUD-007 owner pending, SHIR-001 escalated, SHIR-007 immediate)
- **Ido** -- 1 (T-0004 oversight; APS-022 pre-prod mandates queued)
- **Rambo** -- 2 (T-0020, T-0046 gate pending)
- **Eyal** -- 1 (T-0046 gate pending)
- **Anat** -- 1 (HR-001 R&R due 2026-07-31)
- **Oracle** -- 1 (ORC-001 chronicle, daily)
- **jecki** -- 6 pending actions listed above
