# Eco-Synthetic: Agent Schedules

Approved scheduled wake-ups and recurring agent tasks.
Owned by Operational Excellence (Assaf). Changes require A1 (owner approval).
A schedule entry requires owner A1 approval once before it activates. It stays approved until explicitly changed or revoked.
Decision logged: decisions-log.md 2026-06-12 -- scheduled wake-ups approved (A1: jecki).

---

| Agent | Task | Cadence | Status | Approved by | Approved date | Last run |
|-------|------|---------|--------|-------------|---------------|----------|
| Eco | Queue review + dispatch follow-up + wiki update on task progress/completion | Every 2h | APPROVED | jecki (A1) | 2026-06-12 | - |
| Shelly | Owner queue triage + reminders sweep | Every 2h | APPROVED | jecki (A1) | 2026-06-12 | - |

---

## Governance notes

- Any new schedule entry requires A1 (jecki) approval before adding a row here.
- The bridge reads this file conceptually; the asyncio timer uses WAKEUP_INTERVAL = 7200 (bridge.py).
- Fire condition: only if owner chat_id registered (requires /start at least once per bot). Skips silently otherwise.
- T-0009 (Eco, monthly): reviews on-demand/later agents and drafts wake-up proposals. Transfer to Assaf (OE) when built.
- Adding or changing a row is A1; log the decision in decisions-log.md.
