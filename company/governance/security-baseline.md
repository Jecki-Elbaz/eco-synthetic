# Eco-Synthetic: Security Baseline

Owned by Rambo (Security). Review cadence: on each new agent go-live, each R&R change,
each new tool grant, and at each phase transition. Surface to Eco; escalate risks to jecki.

Status (2026-06-12): initial stub. Rambo to expand as T-0008.

---

## Access controls

- Repo: private. No public access.
- .env: gitignored. Never committed (red line 5). Secrets loaded via os.environ only.
- CLAUDE_CODE_OAUTH_TOKEN: env only; never logged or passed as message content.
- ECO_TELEGRAM_BOT_TOKEN / SHELLY_TELEGRAM_BOT_TOKEN: env only; never logged.
- MCP server permissions: scoped in .claude/settings.json; never expanded without the gate.
- Agent role files (.claude/agents/): read-only from bridge; changes are A1.

## Known risk items (open)

1. Bridge runs on personal laptop (no hardened server, no restart-on-failure).
   Risk: bridge goes down when laptop sleeps or reboots.
   Severity: medium (P1 accepted). Mitigation: jecki aware. Review: P2 cloud hosting.

2. CLAUDE_CODE_OAUTH_TOKEN is a personal OAuth token (not a scoped API key).
   Risk: if token compromised, full Claude Max subscription is exposed.
   Severity: medium. Mitigation: stored in setx/env only; never in code or logs.
   Future: rotate to scoped Console API key on customer-facing switch (OWNER_ONLY_MODE).

3. No rate-limiting or auth on bridge Telegram input.
   Risk: any Telegram user who finds the bot username can message the bot.
   Severity: low (P1, personal use). Mitigation: OWNER_ONLY_MODE = True; no sensitive data in replies.
   Future: add allowlist check on customer-facing switch.

4. Agent system prompts are passed to claude CLI via --system-prompt flag.
   Risk: flag visible in process list (ps/tasklist).
   Severity: low (no secrets in system prompts; only role file text).

## Obsidian Git auto-sync

Obsidian Git auto-sync: the plugin commits and pushes the wiki folder to GitHub automatically. Verify that memory/wiki/ never contains .env values, tokens, or customer personal data before enabling auto-push. The .gitignore in the repo root covers these, but confirm the plugin respects the root .gitignore (it does by default since it uses the repo's git config).

## Scan log

| date | scope | result | notes |
|------|-------|--------|-------|
| 2026-06-12 | Initial bridge code (bridge.py, .env handling) | Pass | ANTHROPIC_API_KEY guard verified; no secrets in code or logs; token not passed as message content |

## Next review triggers

- Any new agent go-live
- Any tool grant or R&R change
- P1-to-P2 transition (cloud hosting + customer-facing switch)
- Any dependency update in requirements.txt
