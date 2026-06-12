# Eco-Synthetic: Setup Guide

Goal: you do only the few things that require a human, and Claude Code or Cowork does the rest.

---

## What only you can do
1. Create the company account (section 1).
2. Create the Telegram bots and get their tokens (section 2).
3. Paste the tokens into `.env` at the repo root (section 2).
4. Approve any cost, and decide WhatsApp now or later (sections 4 and 5).

Everything else (creating folders, placing files, building Shelly and Eco, wiring Telegram) is delegated.

---

## 1. The "company account" (what and why)
A dedicated identity for Eco-Synthetic, separate from your personal accounts, that owns the company's tools (repo, bot, database, hosting) and under which credentials are stored. Why: clean separation, proper access control, and agents never touch your personal accounts. With budget 0, the minimum is one free email/Google account you create for the company (you choose the address). Security (Rambo) vaults its credentials. You then use it to sign up for the Git host, database, bot owner, and hosting.

**Account created:** eco.synthetic.org@gmail.com (2026-06-12). Temporary until domain lands. Migration to domain email (eco@eco-synthetic.[tld]) is tracked in company/governance/compliance-backlog.md and blocked on domain purchase (Shelly, S-0002).

## 2. Telegram bots via BotFather (step by step)
BotFather is Telegram's official bot for creating and managing bots; it is itself a bot you chat with.

**Two bots confirmed** (Eco and Shelly — keeps owner-comms split clean).

For each bot:
1. Install Telegram and sign in (ideally with a number tied to the company).
2. In Telegram search, open @BotFather (the one with the blue verified check).
3. Send `/newbot`.
4. Give a display name and a username ending in `bot`.
5. BotFather returns an HTTP API token (looks like `1234567890:ABCdef...`). This is the secret bot token.
6. Optional: `/setdescription`, `/setuserpic`, `/setprivacy` (disable privacy mode if the bot must read group messages).

**Where the tokens go:** paste them into the `.env` file at the repo root:
```
ECO_TELEGRAM_BOT_TOKEN=your_eco_token_here
SHELLY_TELEGRAM_BOT_TOKEN=your_shelly_token_here
```
`.env` is gitignored and must never be committed (red line 5). Until the repo exists, keep both tokens in a password manager. Never paste tokens into chat. Rambo (Security) owns the vault and the access policy.

## 3. Repo is already scaffolded
The repo structure has been created by Claude Code per `company/repo-structure.md` (now in `sources/`). The folder hierarchy, `.gitignore`, `.env.example`, `CLAUDE.md`, `.claude/settings.json`, and agent role files are all in place. Eco and Shelly are built and ready to use once you provide the tokens and activate them.

## 4. Cost scope (so you approve knowingly)
- Telegram: free.
- Claude usage (tokens): the main cost driver; held down by free-first design, model mixing, and Operational Excellence monitoring. Subscription vs API billing is the open evaluation, decided later.
- Git host, database, CI, staging: free tiers initially (GitHub, Supabase free tier, GitHub Actions). Effectively zero until scale.
- WhatsApp: not free in any robust form (section 5).

## 5. WhatsApp options and recommendation
- **Official WhatsApp Cloud API (Meta)**: per-conversation pricing plus business verification. Compliant, but costs money and setup effort.
- **Evolution API**: the software is open-source and free (Apache 2.0), but:
  - **Baileys / WhatsApp Web mode**: no Meta fees, but unofficial — can violate WhatsApp's Terms and get the number banned; needs an always-on self-hosted server.
  - **Cloud API mode**: just wraps Meta's official API, carries Meta's per-conversation cost and verification.
- Evolution does not make WhatsApp free and safe: you either pay Meta (Cloud API) or accept ToS and ban risk (Baileys). Under our constitution, the unofficial route is a borderline breach (red line 4), so only you (A1) can approve it, after Eyal (Legal) reviews.
- **Recommendation**: launch on Telegram now (free, compliant). Add WhatsApp later only if you want it, via the official Cloud API with cost approved, or by explicitly accepting the Evolution/Baileys risk with eyes open.
