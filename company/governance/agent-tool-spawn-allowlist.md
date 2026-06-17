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
- Noam (Product)       -- Read, Write, Edit
- Assaf (Op-Ex)        -- Read, Write, Edit
- Luci (Devil's Adv.)  -- Read, Write, Edit
- Erez (Investor)      -- Read, Write, Edit, WebSearch, WebFetch
- Hila (Marketing)     -- Read, Write, Edit
- Rambo (Security)     -- Read, Write, Edit, Grep, Glob, WebFetch

## DENIED (hold Bash -- shell risk)
- Ido (VP R&D)         -- Bash. NOTE: bash may be excess for a planning role; flagged to Rambo for trim review.
- Gal (Lead Dev)       -- Bash required (code execution, tests, build).
- Shir (DevOps)        -- Bash required (pipeline, deploy/rollback, infra).

## Caveats (interim, not permanent)
- Erez and Rambo hold WebFetch/WebSearch -- outbound web. Acceptable for interim
  because they do not hold Bash; revisit when guardrails land.
- Anat holds the Agent tool (can spawn further agents). Eco spawns Anat for HR
  tasks only; Anat must not be used to reach Bash agents indirectly.
- This allowlist is the single source of truth. Eco spawns no agent not on
  the PERMITTED list. Any change to this list is A1.
