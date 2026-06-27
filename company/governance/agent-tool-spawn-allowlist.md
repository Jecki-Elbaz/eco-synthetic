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
- Perry (Product)      -- Read, Write, Edit
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

This section governs the SCHEDULED RUNNER (shared/scripts/agent-runner.py) ONLY -- a
different mechanism from the bridge Agent-tool list above. The runner launches each agent
as a separate headless `claude` process with an explicit allowed-tools whitelist that
NEVER includes Bash/WebFetch/WebSearch (shell-tool stripping). See
company/security/reports/T-0020-C3-resolution-2026-06-28.md.

- RUNNER-SPAWNABLE (stripped: Read, or Read/Write/Edit to own scope; never Bash/Web):
  all roster agents, INCLUDING the Bash-holding reports that are DENIED on the bridge path
  above -- Gal, Shir, Adi, Senior Dev, Roman -- plus Mike, Tim, Noam, Yael and the CS/Sales
  ICs. Bash is stripped at launch, so the bridge-path Bash risk (R2) does not apply here.
- The bridge Agent-tool PERMITTED/DENIED lists above are UNCHANGED. guard.py ALLOWED_AGENTS
  is NOT loosened. A Bash agent remains off the bridge path; it is only reachable, stripped,
  via the runner.
- AUTONOMOUS BASH is NOT granted on this path (tests/deploy stay gated -- separate A1).
- Every runner launch is logged to memory/agent-runs.jsonl; SAFE_MODE halts all launches.
