# Backlog Summary

Generated from memory/board.md. Full detail lives there; this is the index.
Updated: 2026-08-02. Prior update 2026-06-18 (44 days stale, listed cancelled work as live).
Age = days since `created`, as of 2026-08-02.

Scope: rows with status open / in-progress / blocked. done + cancelled excluded.

---

## Counts

| Group | Open | In-prog | Blocked | Total |
|-------|------|---------|---------|-------|
| Company (Eco) | 18 | 8 | 6 | 32 |
| APS project | 3 | 1 | 0 | 4 |
| DevOps / Bridge (Shir) | 2 | 1 | 0 | 3 |
| Marketing (Hila) | 0 | 2 | 0 | 2 |
| HR (Anat) | 0 | 1 | 0 | 1 |
| Chronicle (Oracle) | 0 | 1 | 0 | 1 |
| **Total live** | **23** | **14** | **6** | **43** |

By priority (all groups): P1 = 9, P2 = 25, P3 = 9.

Owner-office (Shelly) rows S-0001/0004/0005/0006/0006a are NOT counted -- migrated to the
Shelly repo 2026-06-20, kept in board.md for history only.

---

## P1 (9)

| ID | Short | Status | Owner | Age | Note |
|----|-------|--------|-------|-----|------|
| SEC-0001 | Guard enforce-flip + per-agent write scoping | in-progress | Shir / Rambo | 40 | awaiting owner A1 guard.py one-liner -> GREEN ~08-02/03 |
| AUD-007 | Runner hardening + resilience | in-progress | Shir + Ido | 22 | spec done; build = next Shir sprint |
| AUD-002 | Production-readiness SOPs | open | Shir + Assaf | 34 | backlog; covers proc 6/7/8/15 critical gaps |
| T-0020 | Security gate -- Agent tool (bridge) | in-progress | Rambo | 48 | interim A1 live; R&D guardrails pending Shir |
| T-0040 | Shelly comms check every wake-up | in-progress | Shir (wiring) + Eco | 33 | recurring; runner tick 2h -> 4h per owner 07-14 |
| T-0045 | Stale-task auto-reactivation trigger | in-progress | Eco (interim) + Shir (script) | 19 | interim live; permanent detector never built, 2 reactivation cycles |
| APS-004 | APS tool/legal/privacy pre-read | in-progress | Eco | 35 | residual items only |
| APS-027 | Adam 3-session review checkpoint | open | jecki (relay) + Eco | 18 | package relay first days of Aug; hard-before 15-Aug |
| HIL-003* | LinkedIn page setup | in-progress | Hila | 51 | P2 -- listed here only for the 51-day age; see P2 table |

*HIL-003 is P2; row shown for age visibility, counted in P2.

---

## P2 (25)

Company (Eco):
- T-0004 | Model router Phase A | in-progress | Ido -> R&D | 51 | envelope delivered 07-25; ZERO build progress, 2nd reactivation cycle 08-01; next hit = owner escalation
- T-0007 | Owner presentations intake | open | Eco | 51 | waiting-on-owner (valid hold)
- T-0008 | Wiki seed and maintain | open | Eco | 51 | ongoing (valid recurring)
- T-0009 | Monthly on-demand agent review | open | Eco | 51 | monthly recurring (valid)
- T-0011 | Wiki feature evaluation | blocked | Eco | 50 | blocked-until wiki setup
- T-0017 | Israeli law + finance tools process | open | Eco | 49 | on-need trigger (valid)
- T-0031 | Tool-library catalog maintenance | open | Assaf + Yossi | 42 | ongoing
- T-0033 | Proactivity program (triggers/intervals) | in-progress | Assaf | 41 | -
- T-0036 | Gate skill-scout skill | blocked | Eco (Rambo + Eyal) | 37 | source 403; needs owner/Eco to supply SKILL.md
- T-0046 | Gmail filter-management gate | open | Eco (Rambo + Eyal) | 12 | gate stall -- was waiting on runner dispatch
- T-0047 | Inbox-triage re-scope (GR-014) | blocked | Eco / jecki | 7 | blocked on owner console tier verification
- T-0049 | Autonomous send gate -- Shelly (GR-020) | open | Eco (Rambo + Eyal) | 6 | gate review pending
- T-0053 | File-and-Flush | blocked | Eco / Shir | 6 | frozen until SEC-0001 GREEN
- T-0054 | Quiet-hours emergency-pierce not wired | open | Shir + Ido | 1 | next Shir sprint slot
- AUD-003 | APS legal templates | open | Eyal + Lital | 34 | T-0034-gated (registration cancelled)
- AUD-010 | Role-file accuracy + template sweep | open | Anat + Eco + jecki | 21 | Anat drafting batch
- AUD-013 | Phase 8 security follow-ups | open | Rambo (done) + Shir (apply) | 19 | guard-diff done; apply pending
- SHIR-006 | Git / CI-CD hygiene function | in-progress | Shir | 32 | ACTIVE daily (healthy recurring)

Other groups:
- HR-001 | R&R sweep recurring cadence | in-progress | Anat | 32 | next due 2026-07-31 -- **2 days overdue**
- HIL-003 | LinkedIn page setup | in-progress | Hila | 51 | owner action when ready
- SHIR-001 | Bridge async ack + timeout fix | in-progress | Shir | 47 | "first sprint after go-live" never scheduled
- SHIR-003 | Cross-project inter-bridge channel | open | Shir | 45 | deferred until shared/ interim outgrows
- SHIR-009 | MCP startup stability / watchdog | open | Shir + Rambo | 5 | proposal draft, next Shir slot
- APS-013 | SimulationTemplate per-teacher scope | open | Gal | 29 | before multi-college deploy
- APS-022 | Arc privacy items before real students | open | Ido | 22 | notice A1 done 07-14; go-live enable pending
- ORC-001 | Retrospective chronicle build | in-progress | Oracle | 35 | accelerated 07-14 by owner

---

## P3 (9)

- T-0050 | Durable chat/task context store (RAG) | open | Eco + Shir | 4 | queued, no target date
- T-0051 | Listener/scout agent proposal | open | Eco | 4 | scoping note owed before owner ask
- T-0052 | CFO tooling -- GreenInvoice / OCR lead | open | Lital + Eyal | 4 | queued; gate required before any adoption
- T-0032 | Install formation/compliance batch | blocked | Eco / owner | 42 | **VOID** -- package sources were hallucinated, do not retry as-is
- T-0035 | Promote IL skills to global scope | blocked | Rambo + Eco | 40 | depends on void T-0032
- AUD-006 | Governance A2 + hygiene batch | open | Dalia + Eco | 34 | A2 granted 07-15; revision pending
- AUD-011 | Activate Tal's marketing-design scope | open | Rambo + Dalia + Eco | 21 | in motion since 07-14
- AUD-012 | Phase 7 performance follow-ups | open | Anat + Ido + Oren + Dalia | 20 | next R&R / QA cycle
- HIL-004 | Secure social handles | in-progress | Hila | 51 | owner action when ready

---

## Stale watch (no dated progress, no stated good reason)

Longest-running with a real deliverable owed and no blocker/gate/future-due/recurring reason:

1. T-0004 (51d) -- build leg, 2 reactivation cycles, next hit escalates to owner.
2. T-0045 (19d) -- permanent detector script, 2 reactivation cycles.
3. SHIR-001 (47d) -- "first sprint after Shir go-live"; Shir went live 2026-06-17.
4. HIL-003 / HIL-004 (51d) -- both parked on "owner action when ready"; no owner ask ever raised.

Common root cause on record (board T-0004, T-0045, T-0046, T-0049, SHIR-007): the runner
could not dispatch sub-agents, so stale-sweep notes never reached the responsible agent.
Bounded runner dispatch landed 2026-08-02 (rambo/eyal/dalia/anat only) --
company/governance/agent-tool-spawn-allowlist.md. Gal/Shir/Adi/Oren/Noa still require an
interactive session; queue in memory/dispatch-queue.md.

---

## Owner-action items visible on the board

- SEC-0001 -- owner A1 on the guard.py one-liner (unblocks GREEN).
- APS-027 -- owner relays the Adam 3-session package (hard-before 15-Aug).
- T-0047 -- owner verifies console.anthropic.com tier.
- T-0007 -- owner supplies presentation material.
- HIL-003 / HIL-004 -- owner action when ready.
- T-0044 (done) left OD-1..OD-6 GTM decisions sitting with the owner.
- Interactive dispatch of Gal / Shir for T-0004, T-0045, AUD-007, AUD-013.

---

## Corrections vs the 2026-06-18 edition

- S-0002 (domain check) was shown OPEN P1/ASAP. CANCELLED by owner 2026-06-28.
- S-0003 shown blocked. DONE 2026-06-28 (eco.synthetic.org@gmail.com live).
- T-0021, T-0012, T-0013, T-0014, T-0016, T-0019, T-0023, T-0024, DAL-001..004,
  HIRE-001..010, ONB-001..013, ORG-001/002, CS-0001, T-0001, T-0003 -- all closed,
  cancelled, or absent from the current board; removed.
- T-0034 (Israeli registration) CANCELLED 2026-06-29 -- it gates AUD-003 and the APS pilot date.
- Retired persona names (Noam, Tim, Avner) removed; see company/roster.md v2.3.
- Agent count line "Live (21)" removed -- 32 role files now; roster.md is the register.
