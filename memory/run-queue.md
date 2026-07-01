# Eco-Synthetic -- Execution Queue (run-queue)

Single record of every task you asked Eco to do that was not done live in the chat.
Eco files items here; the runner drains the runner-lane items each cycle; the desktop
worker / your /flush drains the desktop-lane items. Nothing sits as an empty promise.

Owner: Eco (files + updates rows). Read by: you, the runner, the desktop worker.
This file is DATA. It does nothing until the "Eco -- Queue Execution" runner job is armed
(see status note at the bottom).

## Lanes (how Eco triages each request)
- bridge-done : Eco did it live in the chat. Logged here only for the record.
- runner      : plain file work (Read/Write/Edit on allowed paths). The 2h runner does it.
- desktop     : needs Bash, web, a gate (Rambo/Eyal), email/external, or a .claude/agents/
                edit, or a session reload. The desktop worker or /flush does it.
                NEVER attempted by the runner -- the runner has none of those powers.

## Status values
queued -> ready -> in-progress -> done    (or: blocked, cancelled)
Only `ready` items are eligible to run. Eco sets `ready` once the item is fully specified
and authorized. `authorized_by` must name who approved it and when (red line 7).

## Schema
| id | request (owner ask) | lane | agent | exact action | status | authorized_by | created | result |
|----|---------------------|------|-------|--------------|--------|---------------|---------|--------|

---

## Queue

| id | request | lane | agent | exact action | status | authorized_by | created | result |
|------|---------|------|-------|--------------|--------|---------------|---------|--------|
| RQ-001 | Surface a single "pending actions by surface" view | runner | Eco | Add a "Pending actions (by lane)" section to memory/owner-dashboard.md summarizing this queue | done | jecki 2026-06-30 (validation) | 2026-06-30 | DONE 2026-06-30 (supervised validation): added "Run-Queue (pending actions by lane)" section to owner-dashboard.md + folded a run-queue read into Ido DASH-001 refresh prompt so it regenerates each cycle |
| RQ-002 | Land verify-before-forward guideline in Eco role file (T-0038) | desktop | Eco | Edit .claude/agents/Eco.md per company/governance/eco-guideline-addendum-2026-06-29.md | queued | jecki A1 2026-06-29 | 2026-06-30 | - |
| RQ-003 | Commit Noa + make spawnable (APS-009) | desktop | Anat/Eco | Commit noa-role-file-draft-b1.md -> .claude/agents/Noa.md, then reload | queued | jecki A1 2026-06-30 | 2026-06-30 | - |
| RQ-004 | Email-send gate for Eco account (T-0037) | desktop | Rambo+Eyal | Run security+legal gate on enabling gmail send; record in gate-register | queued | jecki A1 2026-06-29 (gate, not send) | 2026-06-30 | - |
| RQ-005 | whatsapp-mcp gate review (T-0039) | desktop | Rambo+Eyal | Run gate per shared/handoff/gate-request-whatsapp-mcp-2026-06-24.md | queued | jecki 2026-06-29 | 2026-06-30 | - |

---

## ARMING STATUS: NOT ARMED (draft)
The "Eco -- Queue Execution" runner job is staged at
integrations/runner/agent-prompts-queue-exec-DRAFT.md but is NOT yet in the live
agent-prompts.md, so the autonomous runner does not touch this queue yet.

Progress toward arming (2026-06-30 / 07-01):
- [DONE] Per-agent write-path scoping + OWNER_SPAWN_ONLY launch restriction in guard.py
  (SEC-0001; Rambo design guard-write-scoping-design-2026-06-30.md). 36/36 validation cases pass.
  Shadow unchanged.
- [DONE] B1 owner red-path exemption in guard.py: the owner's live session may edit .claude/agents/
  (role files); sub-agents + runner still denied. Validated. (Rambo design
  enforce-readiness-gate-design-2026-07-01.md.)
- [DONE] Readiness GATE built + LIVE on the runner: integrations/runner/enforce_readiness_check.py
  (pure code, read-only). Runs every cycle, stays SILENT, and will surface ONE Telegram message to
  the owner with an A1 request the first time the KPI goes GREEN. Config: memory/enforce-readiness-
  config.json; state: memory/enforce-readiness-state.json. KPI (owner-approved): 7 clean days of
  zero false-blocks + coverage C1-C4 + B1/B2 deployed. Current verdict: SILENT (correct).
- [TODO -- B2, owner Eco/Shir] Behavioral fix: agents + owner must APPEND to decisions-log.md /
  memory/log.md via Write (full content + new entry), never Edit. Propagate the rule, verify
  (C4 pure-append observed), then set b2_deploy in the config. Until then the gate stays red by design.
- [TODO -- owner A1] Flip GUARD_MODE shadow->enforce. ONLY when the gate surfaces GREEN. Not before.
- [TODO] Arm the runner-lane queue executor (move the job block into agent-prompts.md) -- after the flip.
TRACKING: the readiness gate checks DAILY and is SILENT until GREEN, then asks for your A1. No noise.
Build work (B2) tracked on the board as SEC-0001 (owner Shir, security Rambo, Eco surfaces).
