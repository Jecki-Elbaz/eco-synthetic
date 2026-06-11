# Eco-Synthetic: Tool and Source Register (Gate Register) v1.0

**Owned by:** Eyal (Legal) — maintains the register; Rambo (Security) — clears risk.
**Rule:** every tool, service, or external source used by any agent must have a row here before use.
Per constitution §6: Security clears risk, Legal clears terms, then A2 grant (A1 if borderline or paid).

---

## Status legend
- `approved` — passed Security + Legal; in use or available for use.
- `deferred` — reviewed; not adopted yet; may be revisited.
- `shelved` — not adopted; concrete reasons recorded; do not use.
- `pending-review` — flagged for gate review; blocked until cleared.

---

## Approved tools

| Tool / Service | Type | Tier | Approved by | Notes |
|----------------|------|------|-------------|-------|
| Claude (Anthropic API) | LLM / agent runtime | free (subscription) | jecki (A1) | Primary model; all agents |
| Claude Code | Agent orchestration runtime | free (subscription) | jecki (A1) | Primary execution environment |
| Telegram Bot API | Messaging / integration | free | jecki (A1) | Two bots: Eco + Shelly; tokens in `.env` |
| Obsidian | Documentation / notes store | free | jecki (A1) | KB-compatible markdown; approved in constitution §9 |
| GitHub (free tier) | Git host / CI | free | jecki (A1) | Repo host; GitHub Actions for CI |
| Canva (free tier) | Design / brand | free | jecki (A1) | Hila's brand and avatar tooling |

---

## Deferred tools

| Tool / Service | Type | Reason deferred | Owner to revisit |
|----------------|------|-----------------|-----------------|
| OpenAI / GPT (API) | LLM | Hosted, costs money (A1 under budget 0); data egress | Eco/Assaf when budget allows |
| Gemini (API) | LLM | Hosted, "unlimited free" is tiered — needs cost/terms review (A1) | Eco/Assaf; possibly for non-sensitive research/second-opinion |
| Grok (API) | LLM | Hosted, costs money; data egress; terms review | Eco/Assaf when budget allows |
| Hermes (open-weight model) | LLM / local | Compute cost, no current infra; deferred not shelved | Eco/Assaf when local model infra ready |
| WhatsApp Cloud API (Meta) | Messaging | Costs money (per-conversation); needs business verification (A1) | Shelly to evaluate and recommend |
| Supabase (free tier) | Database / backend | Not yet needed; free tier available when needed | Ido/Gal when first product needs a DB |
| GreenInvoice | Israeli invoicing | Not yet needed; compliance backlog (Lital + Eyal) | Lital when invoicing is required |

---

## Shelved tools

| Tool / Service | Type | Reason shelved | Re-open condition |
|----------------|------|----------------|-----------------|
| OpenClaw / Claw runtime | Agent runtime | Broad autonomy, attack surface, overlap with Claude Code; acquisition claim also unverified | Only if concrete low-risk job; Rambo security review required |
| Hermes Agent (agent framework) | Agent runtime | Same as OpenClaw; separate from Hermes model family | Same as OpenClaw |
| WhatsApp (Baileys / Evolution API unofficial mode) | Messaging | Unofficial; violates WhatsApp ToS; ban risk; borderline red line 4 | Only with explicit A1 + Eyal (Legal) review of terms risk |

---

## NanoClaw (held in reserve)

NanoClaw is not adopted and not approved. It is held in reserve only as a future possible gated, sandboxed tool for a specific low-risk job (e.g. isolated code review). Before any use: Rambo (Security) must complete a full security review; Eyal (Legal) must clear terms; A1 or A2 grant. It is not an autonomous decision-maker.

---

## Adding a new tool
Any agent that identifies a tool need flags its manager. The manager escalates to Eco. Eco routes it to Rambo (Security risk review) and Eyal (Legal terms review). Once both clear it, A2 grant (or A1 if borderline or paid). The tool then gets a row here. Free-first is mandatory while budget is 0; any paid tool is A1.
