# Eco-Synthetic: Telegram Bridge

Connects the two Telegram bots (Eco and Shelly) to their respective agents.

**Status:** Stub — not yet implemented. Implementation is Phase 1 after tokens are provided.
**Owner:** Shir (DevOps), under Ido (VP R&D).

---

## Configuration

Bot tokens are read from `.env` at the repo root (gitignored):
```
ECO_TELEGRAM_BOT_TOKEN=
SHELLY_TELEGRAM_BOT_TOKEN=
```

See `company/setup-guide.md` §2 for how to obtain the tokens via BotFather.

## Security
- Tokens must never be hardcoded or committed (red line 5).
- The bridge must never expose tokens in logs, outputs, or error messages.
- Any changes to this integration pass the Security + Legal gate (constitution §6).
