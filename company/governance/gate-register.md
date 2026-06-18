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
| Google Drive MCP | connector | free (company account) | jecki (A1, gate bypassed 2026-06-12) | read-only scope; adopted (read-only); pin version at setup |
| Google Calendar MCP | connector | free (company account) | jecki (A1, gate bypassed 2026-06-12) | read-only scope; adopted (read-only); pin version at setup |
| Rambo tools (Read, Write, Edit, Grep, Glob, WebFetch) | Claude Code built-ins | free (subscription) | jecki (A1, bootstrapping exception 2026-06-14) | Rambo cannot self-clear own tools. These are a subset of the approved Claude Code runtime (A1, 2026-06-12). No separate Rambo risk review; no separate Eyal legal review (same subscription, no new terms). Eyal to confirm on activation that no gap exists -- see board task. |

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

## Pending review

Items flagged by the owner or agents; blocked until Rambo (Security) + Eyal (Legal) clear them.

| Tool / Service | Type | Source | Flagged by | Rambo | Eyal | Notes |
|----------------|------|--------|------------|-------|------|-------|
| meeting-prep agent | External agent / GitHub repo | https://github.com/automation-flow/meeting-prep | jecki (owner, 2026-06-13) | CLEARED (A1 read-only review 2026-06-13) | CLEARED (MIT) | Read-only review completed 2026-06-13: no .claude/, CLAUDE.md, or .cursorrules (no prompt-injection vectors); no install scripts; pure markdown prompt protocol (meeting-prep.md + Word template + example); LICENSE = MIT. Adopted as the meeting-prep sub-agent in the standalone Shelly project (C:\Users\Jecki\DEV\projects\Shelly). Company Sales deployment (MeetingPrep.md, P3) remains gated on its own go-live but the repo itself is cleared. Use by copying meeting-prep.md content; do not clone-and-run. |
| nspady/google-calendar-mcp | MCP server / GitHub repo | https://github.com/nspady/google-calendar-mcp | jecki (owner, 2026-06-18) | CLEARED-WITH-CONDITIONS (read-only review 2026-06-18) | PENDING (Eyal: MIT -- expected clear; confirm before go-live) | Rambo review 2026-06-18: MIT license; no shell install scripts, no autostart/launch-agent; .claude/ present (developer sub-agents only -- calendar-feature-implementer.md + calendar-test-engineer.md -- not adversarial); CLAUDE.md present (developer codebase guide, not adversarial); AGENTS.md present (multi-account usage guide for AI agents, not adversarial); OAuth Desktop app, token in system config dir; read-only scopes supported; 7 read + 5 write + 1 account-mgmt tools. CONDITIONS: (1) deny-list write tools in settings.json before go-live (see Rambo gate report 2026-06-18 for exact names); (2) Eyal legal review required. Calendar-only -- no Gmail/Drive. Eyal review PENDING. |
| taylorwilsdon/google_workspace_mcp | MCP server / GitHub repo | https://github.com/taylorwilsdon/google_workspace_mcp | jecki (owner, 2026-06-18) | CLEARED-WITH-CONDITIONS (read-only review 2026-06-18) | PENDING (Eyal: MIT -- expected clear; confirm before go-live) | Rambo review 2026-06-18: MIT license; no shell install scripts, no autostart/launch-agent; no .claude/ directory, no CLAUDE.md, no .cursorrules, no AGENTS.md; .claude-plugin/ present (plugin.json + marketplace.json -- metadata only, not adversarial); OAuth 2.0/2.1, Desktop app, tokens at ~/.google_workspace_mcp/credentials/ (0o600); read-only scopes supported per service; Python; deps use >= not pinned (flag: supply chain drift risk); explicit prompt-injection warning in README; gmail+calendar+drive all covered. CONDITIONS: (1) deny-list all write/send/delete tools in settings.json before go-live (see Rambo gate report 2026-06-18 for exact names); (2) pin all dependency versions via uv.lock at adoption and verify lock integrity; (3) Eyal legal review required; (4) consider scope-level auth config (readonly scopes only for phase 1). RECOMMENDATION candidate for Shelly. Eyal review PENDING. |

## Rejected / reference-only (external repos)

| Tool / Service | Type | Source | Reason | Status |
|----------------|------|--------|--------|--------|
| cba-starter | Project starter / GitHub repo | https://github.com/automation-flow/cba-starter | No LICENSE (legal gate fails by default); 100% shell incl. install-launchagents.sh (OS autostart persistence); ships CLAUDE.md + AGENTS.md + .claude/ (prompt-injection vectors). Reviewed read-only 2026-06-13 for the Shelly separation. | REFERENCE-ONLY -- never cloned or executed; ideas may be mined by reading only |

---

## Adding a new tool
Any agent that identifies a tool need flags its manager. The manager escalates to Eco. Eco routes it to Rambo (Security risk review) and Eyal (Legal terms review). Once both clear it, A2 grant (or A1 if borderline or paid). The tool then gets a row here. Free-first is mandatory while budget is 0; any paid tool is A1.
