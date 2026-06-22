# Eco-Synthetic: Agent Schedules

Approved scheduled wake-ups and recurring agent tasks.
Owned by Operational Excellence (Assaf). Changes require A1 (owner approval).
A schedule entry requires owner A1 approval once before it activates. It stays approved until explicitly changed or revoked.
Decision logged: decisions-log.md 2026-06-12 -- scheduled wake-ups approved (A1: jecki).

---

| Agent | Task | Cadence | Status | Approved by | Approved date | Last run |
|-------|------|---------|--------|-------------|---------------|----------|
| Eco | Queue review + dispatch follow-up + wiki update on task progress/completion | Every 2h | APPROVED | jecki (A1) | 2026-06-12 | - |
| Eco | Morning brief (queue + overnight + day plan) | Daily AM | APPROVED (activates on delivery restore) | jecki (A1) | 2026-06-22 | - |
| Eco | Evening summary + proactivity health block | Daily PM | APPROVED (activates on delivery restore) | jecki (A1) | 2026-06-22 | - |
| Assaf | Cost/token snapshot + threshold alert | Daily | APPROVED (activates on delivery restore) | jecki (A1) | 2026-06-22 | - |
| Assaf | Fitness loop + usage report | Weekly (Mon) | APPROVED | jecki (A1) | 2026-06-22 | - |
| Assaf | On-demand agent review (T-0009) | Monthly | APPROVED | jecki (A1) | 2026-06-22 | - |
| Rambo | Permission-drift scan | Weekly (Mon) | APPROVED | jecki (A1) | 2026-06-22 | - |
| Oracle | Chronicle sweep (capture day's decisions) | Daily | BLOCKED -- T-0020 C3 (off spawn-allowlist) | jecki (A1 intent) | 2026-06-22 | - |
| Lital + Eyal | Compliance-deadline check (IL reg/invoicing/privacy) | Weekly | APPROVED (P3) | jecki (A1) | 2026-06-22 | - |
| Dalia | Quality/tone audit sample | Weekly | APPROVED (P3) | jecki (A1) | 2026-06-22 | - |
| Ido | DASH-001 dashboard refresh | Hourly / fold into Eco 2h | APPROVED (P3) | jecki (A1) | 2026-06-22 | - |
| Shir | Bridge + uptime health check | Every 15-30 min | PENDING BUILD -- event trigger + T-0020 C3 + Bash | jecki (A1 intent) | 2026-06-22 | - |
| MeetingPrep | Pre-meeting prep | Event: T-Xh before external meeting | PENDING BUILD -- event trigger (SHIR-005) | jecki (A1 intent) | 2026-06-22 | - |

---

## Governance notes

- Any new schedule entry requires A1 (jecki) approval before adding a row here.
- The bridge reads this file conceptually; the asyncio timer uses WAKEUP_INTERVAL = 7200 (bridge.py).
- Fire condition: only if owner chat_id registered (requires /start at least once per bot). Skips silently otherwise.
- T-0009 (Eco, monthly): reviews on-demand/later agents and drafts wake-up proposals. Transfer to Assaf (OE) when built.
- Adding or changing a row is A1; log the decision in decisions-log.md.
