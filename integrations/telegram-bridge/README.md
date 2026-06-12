# Eco-Synthetic: Telegram Bridge

Runs the Eco (CEO) and Shelly (Office Manager) bots concurrently via long-polling.
No public URL or webhook required.

**Auth model:** Claude Max subscription via OAuth (`CLAUDE_CODE_OAUTH_TOKEN`).
No `ANTHROPIC_API_KEY` — the bridge refuses to start if one is present (it would
silently bill API rates instead of your subscription).

**Status:** Implemented — Phase 1 active after tokens are provided.

---

## One-time headless auth setup

Run this once on the machine that will host the bridge (needs a browser):

```powershell
claude setup-token
# OAuth opens in browser → authorises → prints a long-lived token (≈1 year)
# Copy the printed token, then store it permanently:
setx CLAUDE_CODE_OAUTH_TOKEN "<paste-token-here>"
# Open a new terminal so the variable is visible, then verify:
$env:CLAUDE_CODE_OAUTH_TOKEN  # should print the token
```

Or add it to the repo-root `.env` (never commit that file):
```
CLAUDE_CODE_OAUTH_TOKEN=<token>
```

## Other prerequisites

- Python 3.11+
- Claude Code CLI (`claude`) in PATH and authenticated (see above)
- Two Telegram bot tokens from BotFather — see `company/setup-guide.md` §2

## Setup

```powershell
cd integrations\telegram-bridge
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Add to your `.env` at the repo root:

```
CLAUDE_CODE_OAUTH_TOKEN=<long-lived token from claude setup-token>
ECO_TELEGRAM_BOT_TOKEN=<from BotFather>
SHELLY_TELEGRAM_BOT_TOKEN=<from BotFather>
```

**Do NOT add `ANTHROPIC_API_KEY`** — the bridge will refuse to start if it finds one.

## Run

```powershell
# from integrations\telegram-bridge\ with .venv active
python bridge.py
```

Both bots start polling. Stop with **Ctrl+C**.

## How to test

1. In Telegram, open your Eco bot by username → send `/start` → receive Eco's greeting.
2. Send any message → routed to Claude Sonnet by default.
3. Send a message containing decision/approval keywords (e.g. "I need you to approve this strategy") → automatically escalated to Claude Opus.
4. Repeat for your Shelly bot: `/start`, then any message (Haiku default), or a drafting request (Sonnet escalation).
5. After a conversation, inspect:
   - `memory/chats/eco/<chat_id>.json` — full conversation history
   - `memory/chats/shelly/<chat_id>.json`
   - `memory/log.jsonl` — one JSON line per `/start` or message, with `ts`, `agent`, `chat_id`, `model`, `tokens_in`, `tokens_out`

## Architecture

| What | Detail |
|------|--------|
| Transport | `python-telegram-bot` v20+ long-polling |
| Claude auth | `CLAUDE_CODE_OAUTH_TOKEN` via `claude --print` subprocess (Claude Max subscription) |
| Eco default model | `claude-sonnet-4-6` |
| Eco escalated model | `claude-opus-4-8` (triggers on decision/approval keywords or message > 500 chars) |
| Shelly default model | `claude-haiku-4-5` |
| Shelly escalated model | `claude-sonnet-4-6` (triggers on draft/write keywords or message > 300 chars) |
| System prompts | Loaded from `.claude/agents/Eco.md` and `Shelly.md`; YAML frontmatter stripped at startup |
| Conversation history | Formatted as XML and passed to each `claude --print` call; persisted at `memory/chats/{eco,shelly}/{chat_id}.json`; capped at 20 messages / 40 000 chars |
| Event log | `memory/log.jsonl` — one line per event |
| Subprocess threading | Blocking `claude` calls run in a thread-pool executor so the asyncio event loop stays responsive |

## Customer-facing migration (TODO)

`OWNER_ONLY_MODE = True` in `bridge.py` marks the current state.
When external customers need access, see the TODO block in the module docstring:
switch to a scoped Console API key, replace the subprocess with the `anthropic`
Python SDK, and review Anthropic's usage-policy terms.

## Security

- `CLAUDE_CODE_OAUTH_TOKEN` and Telegram tokens are loaded via `os.environ` — never logged, never passed as Claude message content.
- The bridge refuses to start if `ANTHROPIC_API_KEY` is present.
- History files contain conversation text only — no credentials.
- Any changes to this integration must pass the Security + Legal gate (constitution §6).
