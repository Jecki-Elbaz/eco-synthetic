# Eco-Synthetic: Company Overview

**Owner:** jecki (L1)
**Phase:** P1 (foundation and infrastructure)
**Status (2026-06-12):** Telegram bridge live; Eco + Shelly active; scheduled wake-ups running.

## Mission

Build a multi-project AI company with a shared agent-powered corporate core.
Two business sides: Product/R&D (vendor) and Service-Operations (operator).
Each active project backed by an on-demand SME (Sami pattern).

## Active agents in P1

- Eco (CEO, L2) -- company orchestration, all company tasks
- Shelly (Office Manager, owner office) -- jecki's admin and Telegram channel
- Hila (Marketing, P1 light track) -- brand basics, LinkedIn, social

## Key constraints (P1)

- Budget: 0. No expenses without A1 (jecki).
- Free-first: all tools must be free at current scale.
- Certification before work: HR (Anat) certifies each agent before go-live.
- Authentication: Claude Max subscription via CLAUDE_CODE_OAUTH_TOKEN. Never ANTHROPIC_API_KEY.

## Current bridge

- Both bots running via python-telegram-bot long-polling.
- Eco: claude-sonnet-4-6 default, claude-opus-4-8 escalation (decisions/approval or >500 chars).
- Shelly: claude-haiku-4-5 default, claude-sonnet-4-6 escalation (drafting or >300 chars).
- Scheduled 2h wake-ups active (see company/governance/schedules.md).
- History per chat: memory/chats/{eco,shelly}/{chat_id}.json.
- Event log: memory/log.jsonl.
