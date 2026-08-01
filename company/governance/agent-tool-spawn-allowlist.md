# Agent Tool -- Permitted Spawn Allowlist (Telegram bridge, Eco)

Status: ACTIVE interim grant. Owner A1: jecki, 2026-06-15.
Scope: Eco may invoke the Agent tool from the Telegram bridge ONLY for the
non-shell agents named below. Every spawn is logged to memory/log.md.

## Basis
- Gate review: company/governance/gate-review-agent-tool-eco-rambo.md (T-0020).
- Verdict PARTIAL-CLEAR, A1. Risk R2 (blast-radius) is the binding constraint:
  any agent holding Bash could be reached from a public Telegram channel via Eco.
- Owner ruling 2026-06-15: approve interim use for non-Bash agents only.
  R&D (Bash-holding) agents stay OFF the bridge until Shir builds code-level
  guardrails (sender allowlist + shell-tool stripping). Tracked as separate R&D plan.

## PERMITTED (no Bash)
- Anat (HR)            -- Read, Write, Edit, Agent
- Dalia (Q&G)          -- Read, Write, Edit
- Lital (CFO)          -- Read, Write, Edit
- Eyal (Legal)         -- Read, Write, Edit
- Perry (VP Product)   -- Read, Write, Edit
- Ido (VP R&D)         -- Read, Write, Edit (no Bash; removed at go-live 2026-06-17). Moved DENIED -> PERMITTED, owner A1 2026-06-18 (T-0030).
- Assaf (Op-Ex)        -- Read, Write, Edit
- Luci (Devil's Adv.)  -- Read, Write, Edit
- Erez (Investor)      -- Read, Write, Edit, WebSearch, WebFetch
- Hila (Marketing)     -- Read, Write, Edit
- Rambo (Security)     -- Read, Write, Edit, Grep, Glob, WebFetch

## DENIED (hold Bash -- shell risk)
- Gal (Lead Dev)       -- Bash required (code execution, tests, build).
- Shir (DevOps)        -- Bash required (pipeline, deploy/rollback, infra).

## Caveats (interim, not permanent)
- Erez and Rambo hold WebFetch/WebSearch -- outbound web. Acceptable for interim
  because they do not hold Bash; revisit when guardrails land.
- Anat holds the Agent tool (can spawn further agents). Eco spawns Anat for HR
  tasks only; Anat must not be used to reach Bash agents indirectly.
- This allowlist is the single source of truth. Eco spawns no agent not on
  the PERMITTED list. Any change to this list is A1.

## Runner-spawn (stripped) -- SEPARATE PATH (owner A1 2026-06-28, T-0020 C3 resolved)

This section governs the SCHEDULED RUNNER (integrations/runner/runner.py) ONLY -- a
different mechanism from the bridge Agent-tool list above. The runner launches each agent
as a separate headless `claude` process with an explicit allowed-tools whitelist that
NEVER includes Bash/WebFetch/WebSearch (shell-tool stripping). See
company/security/reports/T-0020-C3-resolution-2026-06-28.md.

- RUNNER-SPAWNABLE (stripped: Read, or Read/Write/Edit to own scope; never Bash/Web):
  all roster agents, INCLUDING the Bash-holding reports that are DENIED on the bridge path
  above -- Gal, Shir, Adi, Oren (Senior Dev), Roman -- plus Mike, Sally, Perry, Yael and the
  CS/Sales ICs. Bash is stripped at launch, so the bridge-path Bash risk (R2) does not apply here.
- The bridge Agent-tool PERMITTED/DENIED lists above are UNCHANGED. guard.py ALLOWED_AGENTS
  is NOT loosened. A Bash agent remains off the bridge path; it is only reachable, stripped,
  via the runner.
- AUTONOMOUS BASH is NOT granted on this path (tests/deploy stay gated -- separate A1).
- Every runner launch is logged to memory/agent-runs.jsonl; SAFE_MODE halts all launches.

NOTE: "runner-spawnable" above describes which agent a runner JOB may be launched AS.
It is NOT the same as a running runner agent DISPATCHING a sub-agent mid-cycle -- that
was hard-denied until 2026-08-02 and is now governed by the next section.

---

## Runner Agent-tool dispatch (owner A1 2026-08-02)

The scheduled runner (integrations/runner/runner.py) may now DISPATCH sub-agents from
inside a running job. This was previously hard-denied: the guard refused Task/Agent on
any RUNNER_CONTEXT=1 path, unconditionally.

Sources of record (keep this section in sync with both):
- .claude/hooks/guard.py -- RUNNER_SPAWN_ALLOW, RUNNER_SPAWN_CAP, OWNER_SPAWN_ONLY.
- integrations/runner/runner.py -- PER_JOB_TOOLS.

### Allowlist

- rambo (Security)  -- verified non-Bash
- eyal  (Legal)     -- verified non-Bash
- dalia (Q&G)       -- verified non-Bash
- anat  (HR)        -- verified non-Bash

Anything not on this list is denied with a pointer to queue it instead.

### Oren is deliberately EXCLUDED

Oren holds NO Bash, so he looks like an obvious 5th entry. He is excluded anyway: he sits
in guard.py OWNER_SPAWN_ONLY under the SEC-0001 code-builder restriction. Adding Oren to
runner dispatch needs its own owner A1 -- it is not a housekeeping edit.

### Four hard limits (guard-enforced, not prompt-enforced)

1. ALLOWLIST ONLY -- the requested subagent_type must be in RUNNER_SPAWN_ALLOW.
2. DEPTH 1 -- no nested spawn. A dispatch request that itself arrives from a sub-agent
   (agent_type set) is denied.
3. ACT CYCLES ONLY -- RUNNER_MODE must be "act". No dispatch on readonly cycles.
4. CAPPED AT 3 PER RUNNER CYCLE -- RUNNER_SPAWN_CAP = 3, counted across ALL jobs in the
   cycle, tracked in memory/runner-spawn-count.json keyed on RUNNER_CYCLE_ID. FAIL-CLOSED:
   a missing RUNNER_CYCLE_ID, an unwritable counter, or a corrupt counter file all DENY the
   dispatch rather than granting an uncounted one. A retried job reuses its cycle id, so a
   retry cannot double the budget. The slot is taken LAST, after every other check, so a
   denied attempt never burns budget.

SAFE_MODE, SPAWN_DENY, ALLOWED_AGENTS and OWNER_SPAWN_ONLY all still apply on top.

### What stays owner-session-only

Bash-holders and code-builders -- gal, shir, adi, noa -- plus oren, stay owner-session-only
(guard.py OWNER_SPAWN_ONLY). Work that needs them is QUEUED in memory/dispatch-queue.md and
drained at the start of an interactive session. The runner never reaches them.

### Which jobs hold the tool

The Agent/Task tool is granted (runner.py PER_JOB_TOOLS) to exactly the two Eco jobs that
own the 72h stale-sweep:

- "Eco:2h Check-in (every 2h)"   -- Read,Write,Edit,Task,Agent
- "Eco:AM Brief (daily 08:00)"   -- Read,Write,Edit,Task,Agent

No other job holds Task/Agent. The tool grant is convenience; the guard is the boundary.

### Rationale

Before this change the runner could spawn nobody. Eco's 72h stale-sweep could therefore
only append "REACTIVATED" notes into board rows that no agent would ever read, so any task
whose next step belonged to another agent stalled until the owner opened an interactive
session. That is the documented root cause behind SHIR-007, T-0004, and the T-0046/T-0049
gate stalls -- repeated reactivation cycles that produced text and no work. Bounded dispatch
to four non-Bash governance agents lets the sweep actually hand work over, while the
allowlist, depth cap, act-only rule and per-cycle cap keep the blast radius small.
