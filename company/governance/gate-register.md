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
| Erez tools (WebSearch, WebFetch) | Claude Code built-ins | free (subscription) | jecki (A1, 2026-06-17) | Subset of approved Claude Code runtime (A1, 2026-06-12). Read-only, public sources only. Rambo B5 2026-06-17 clear-with-conditions: tainted-content rule added to Erez.md (synthesize + cite, never relay raw external content); owner reviews every memo (A1 gate) as the primary injection control. No new terms. |
| Zvika tools (WebSearch, WebFetch) | Claude Code built-ins | free (subscription) | jecki (A1, 2026-06-18) | Same tools/terms as the Erez row; extends the grant to Zvika's general-research scope. Subset of approved Claude Code runtime (A1, 2026-06-12); read-only, public sources only; no new vendor/account/terms (T-0013 logic -- no new Eyal review). Rambo B5 2026-06-18 clear-with-conditions: tainted-content / prompt-injection rule present in Zvika.md (synthesize + cite, never relay raw external content; flag + discard injected instructions -- verified in B3 Scenario 2); Eco task envelopes include a tainted-content reminder per invocation. On-demand, A2 to wake. |

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
| 360dialog (WhatsApp Cloud API BSP) | Messaging / customer | Vehicle CHOSEN (owner, 2026-06-17) for the official WhatsApp Cloud API business track. Paid -> A1. Not adopted now: activate only when a real customer needs it (owner notifies). Then run /tool-gate 360dialog; Lital costs per-message + fees first. evolution-api/Baileys rejected for business (ToS + ban at 10k+ scale). | Eco/Lital on first customer need (owner A1) |

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
| Agent tool (for Eco, Telegram bridge) | Claude Code built-in capability | Part of existing approved Claude Code runtime (A1, 2026-06-12) | Eco/jecki (2026-06-15) | PARTIAL-CLEAR (T-0020, 2026-06-15) -- A1 required; 10 conditions C1-C10; full findings: company/governance/gate-review-agent-tool-eco-rambo.md | PENDING (Eyal not yet live; scope: same subscription, no new terms -- confirm on activation) | R1 HIGH (prompt injection, no sanitization layer visible), R2 HIGH (blast-radius: WebFetch via Rambo live now; Bash via Gal/Shir/Ido when certified; deny-list cascade to subprocesses unconfirmed). R3 MEDIUM, R4 MEDIUM, R5 LOW-MEDIUM. Blocked until: (1) owner A1 with all 10 conditions documented, (2) Eyal Legal clear or explicit owner waiver of Legal review. Re-assess blast radius at each new Bash-capable agent certification (C5). |
| whatsapp-mcp (@lharries, unofficial) -- GRANTED A1 2026-06-17 (owner accepted ToS/ban risk; install pending owner QR + Shir) | WhatsApp MCP bridge (Go + Python) | https://github.com/lharries/whatsapp-mcp | jecki (owner, 2026-06-17) | PARTIAL-CLEAR (Rambo, 2026-06-17) -- A1 required; 9 conditions C1-C9; full findings: company/governance/gate-review-whatsapp-mcp-rambo.md | REVIEWED 2026-06-17 -- FLAG on operational WhatsApp ToS (same class as shelved Baileys row) / PARTIAL-CLEAR on Israeli PPL; A1 owner risk-acceptance required; conditions C1-C8 (secondary number; no business/customer use on this track; defined SQLite retention before real-person ingest; DPA-with-Anthropic before LLM-processing third-party content; owner accepts ToS/ban risk; no human-impersonation without disclosure). Software license MIT (Rambo-confirmed). Full reasoning: Eyal verdict 2026-06-17 | R1 HIGH (lethal trifecta: inbound messages verbatim to LLM, no sanitization); R3 HIGH (raw SQLite storage of all contacts messages, Israeli privacy law); R4 HIGH (send_message/send_file write blast radius, no recipient allowlist); R2 HIGH (unofficial API, ban risk, 20-day re-auth cadence). R5 MEDIUM (Python deps min-version only; uv.lock exists). Repo itself: no .claude/, CLAUDE.md, AGENTS.md, .cursorrules -- clean. Secondary number only; low volume; A1 ban-risk acceptance required (C5). SHIR-002 tracks permanent R1/R4 mitigations (bridge-layer sanitization + allowlist). |
| caveman skill (JuliusBrussee) -- GRANTED A2 2026-06-17 (owner-approved adoption, red line 7) | Claude Code skill (SKILL.md, MIT) | https://github.com/JuliusBrussee/caveman | Eco/jecki (2026-06-17) | PARTIAL-CLEAR (Rambo, 2026-06-17) -- A2 sufficient (free, MIT); 4 conditions C1-C4; full findings: company/governance/gate-review-caveman-rambo.md | CLEAR 2026-06-17 -- MIT (Rambo-confirmed); no external service, no vendor ToS, no data egress, no telemetry; Israeli PPL not triggered (no personal data). Recommends A2 once owner approves adoption (red line 7) | R1 HIGH (structural): official install curl|bash / irm|iex is red line 4 violation -- blocked. Safe path: manual copy of SKILL.md from pinned commit SHA only (C1). R2 MEDIUM-HIGH: bin/install.js writes hooks to ~/.claude/settings.json system-wide -- entirely avoided by C1. R3 MEDIUM: must pin to specific commit SHA (C2). R4 MEDIUM: scope discipline -- /caveman not permitted in owner-facing or Telegram bridge sessions (C3, C4). Skill content (SKILL.md): CLEAN -- no telemetry, no external calls, no injection vectors, no safety overrides. .cursorrules: does not exist. License: MIT confirmed (Julius Brussee, 2026). Steward: Assaf. Proposed scope: internal + agent-to-agent sessions only. Caveman-shrink MCP middleware NOT included -- requires separate gate. |
| hebrew-rtl-best-practices (skills-il) -- GRANTED A2 2026-06-17 (owner-approved adoption, red line 7) | AI agent skill (Claude Code) | https://github.com/skills-il/localization/tree/master/hebrew-rtl-best-practices ; CLI: https://github.com/skills-il/skills-il-cli | Eco (2026-06-17) | PARTIAL-CLEAR (Rambo, 2026-06-17) -- A2 sufficient; 4 conditions C1-C4; findings: company/governance/gate-review-hebrew-rtl-rambo.md | CLEAR 2026-06-17 -- per Eyal's stated conditional rule (permissive license + ToS allows commercial use), both triggers now met: Rambo confirmed MIT; agentskills.co.il/he/terms explicitly permits commercial use of individual MIT SKILL.md files (verified via WebFetch by gate coordinator); platform-curation commercial restriction does not apply to a single MIT skill. No personal data. Recommends A2 once owner approves adoption (red line 7). Conditions: pin skills-il@1.10.0 + skill v1.3.0, CI=true at install, post-install content check (C1) | Skill content: clean (no injection vectors, MIT license). CLI: no postinstall hooks, zero runtime deps. R1 LOW, R2-R5 MEDIUM, R6 LOW. Install command must include: CLI version pin `skills-il@1.10.0`, `--skill hebrew-rtl-best-practices -a claude-code`, and `CI=true`. Post-install content check required (C1). Full findings: company/governance/gate-review-hebrew-rtl-rambo.md. |

## Adopted -- Shelly preliminary-knowledge shortlist (GRANTED 2026-06-18, owner A1-directed)

Gate: Rambo batch scan (CLEAR/PARTIAL-CLEAR) + Eyal terms; owner directed adoption for
Shelly (preliminary orientation for jecki). Reviews: company/governance/gate-review-shelly-shortlist-rambo.md.
NO auto-update without Rambo approval (security-baseline). Install pending (npx/MCP setup).

| Tool | Type | Pinned install | Tier | Conditions |
|------|------|----------------|------|-----------|
| Financial statements | skills-il skill | `skills-il/accounting@v1.2.0-israeli-financial-reports` | free | orientation-only; not authoritative (Lital owns) |
| VAT reporting | skills-il skill | `skills-il/tax-and-finance@v1.4.0-israeli-vat-reporting` | free | orientation-only; not authoritative (Lital owns) |
| Employee tax refund | skills-il skill | `skills-il/tax-and-finance@v1.1.1-israeli-employee-tax-refund` | free | jecki's OWN data only; PPL+DPA before third-party data |
| LinkedIn strategy | skills-il skill | `skills-il/marketing-growth@v1.1.0-israeli-linkedin-strategy` | free | internal draft only; no public posting without A1 + Eyal |
| Fact checker | skills-il skill | `skills-il/government-services@v1.0.0-israeli-fact-checker` | free | if it calls an external API, that endpoint needs its own gate row |
| Kol Zchut / All Rights | MCP (skills-il) | `@skills-il/kolzchut-mcp@1.0.1` | free | pin @1.0.1; surface kolzchut attribution; orientation-only |
| Hebrew calendar (Hebcal) | MCP (3rd-party) | `@hebcal/mcp@0.10.3` | free | BSD-2; fully local, zero egress; pin @0.10.3 |
| Sefaria | MCP (3rd-party) | `git+https://github.com/Sivan22/mcp-sefaria-server@b8ceef78b42c9330f7b62afc020b2bc6e616b986` | free | SHA-pin mandatory (no tags); CC-BY-NC = owner personal use only + attribution |

---
| nspady/google-calendar-mcp | MCP server / GitHub repo | https://github.com/nspady/google-calendar-mcp | jecki (owner, 2026-06-18) | CLEARED-WITH-CONDITIONS (read-only review 2026-06-18) | PENDING (Eyal: MIT -- expected clear; confirm before go-live) | Rambo review 2026-06-18: MIT license; no shell install scripts, no autostart/launch-agent; .claude/ present (developer sub-agents only -- calendar-feature-implementer.md + calendar-test-engineer.md -- not adversarial); CLAUDE.md present (developer codebase guide, not adversarial); AGENTS.md present (multi-account usage guide for AI agents, not adversarial); OAuth Desktop app, token in system config dir; read-only scopes supported; 7 read + 5 write + 1 account-mgmt tools. CONDITIONS: (1) deny-list write tools in settings.json before go-live (see Rambo gate report 2026-06-18 for exact names); (2) Eyal legal review required. Calendar-only -- no Gmail/Drive. Eyal review PENDING. |
| taylorwilsdon/google_workspace_mcp | MCP server / GitHub repo | https://github.com/taylorwilsdon/google_workspace_mcp | jecki (owner, 2026-06-18) | CLEARED-WITH-CONDITIONS (read-only review 2026-06-18) | PENDING (Eyal: MIT -- expected clear; confirm before go-live) | Rambo review 2026-06-18: MIT license; no shell install scripts, no autostart/launch-agent; no .claude/ directory, no CLAUDE.md, no .cursorrules, no AGENTS.md; .claude-plugin/ present (plugin.json + marketplace.json -- metadata only, not adversarial); OAuth 2.0/2.1, Desktop app, tokens at ~/.google_workspace_mcp/credentials/ (0o600); read-only scopes supported per service; Python; deps use >= not pinned (flag: supply chain drift risk); explicit prompt-injection warning in README; gmail+calendar+drive all covered. CONDITIONS: (1) deny-list all write/send/delete tools in settings.json before go-live (see Rambo gate report 2026-06-18 for exact names); (2) pin all dependency versions via uv.lock at adoption and verify lock integrity; (3) Eyal legal review required; (4) consider scope-level auth config (readonly scopes only for phase 1). RECOMMENDATION candidate for Shelly. Eyal review PENDING. |

## Rejected / reference-only (external repos)

| Tool / Service | Type | Source | Reason | Status |
|----------------|------|--------|--------|--------|
| cba-starter | Project starter / GitHub repo | https://github.com/automation-flow/cba-starter | No LICENSE (legal gate fails by default); 100% shell incl. install-launchagents.sh (OS autostart persistence); ships CLAUDE.md + AGENTS.md + .claude/ (prompt-injection vectors). Reviewed read-only 2026-06-13 for the Shelly separation. | REFERENCE-ONLY -- never cloned or executed; ideas may be mined by reading only |

---

---

## T-0013 Legal Confirmation -- Rambo Tool Set (2026-06-16)

Reviewed by: Eyal (Legal)
Date: 2026-06-16
Task: T-0013 (bootstrapping legal confirmation deferred from Rambo go-live)

Tools reviewed: Read, Write, Edit, Grep, Glob, WebFetch (Claude Code built-ins, Rambo agent)

Verdict: NO LEGAL TERMS GAP.

Rationale:
- All six tools are Claude Code built-in runtime tools with no separate vendor, account, or API.
- Governing terms: Anthropic/Claude Code subscription, approved A1 by jecki 2026-06-12. No new terms relationship is created by Rambo's agent-level use.
- Data-processing: tools operate on local filesystem content and, for WebFetch, on outbound HTTP requests scoped within the existing Claude Code runtime permissions (.claude/settings.json). Rambo's security-scanning use case does not open a new personal data pipeline or trigger any new data-processing obligation.
- Licensing: proprietary Anthropic tooling under the existing subscription. No open-source license obligations triggered.
- Use-case scope: Rambo uses these tools for security review (scanning repos, reading files, writing scan results, fetching public URLs). All within the approved runtime scope.

T-0013 is closed. Gate-register row for Rambo tools is confirmed with no legal gap. Eyal sign-off complete.

---

---

## Shelly tools batch -- pending Eyal review + Eco A2 grant (2026-06-18)

Full Rambo findings: company/governance/gate-review-shelly-shortlist-rambo.md

| Tool / Service | Type | Source | Flagged by | Rambo | Eyal | Notes |
|----------------|------|--------|------------|-------|------|-------|
| israeli-financial-reports (skills-il) | AI skill (SKILL.md, MIT) | skills-il/accounting@v1.2.0-israeli-financial-reports | jecki (owner, 2026-06-18) | CLEAR (Rambo 2026-06-18) -- static file, no egress, SKILL.md scan clean | Not required (platform pre-cleared 2026-06-17; MIT; no new terms) | Pin: `skills-il/accounting@v1.2.0-israeli-financial-reports`. No auto-update. |
| israeli-vat-reporting (skills-il) | AI skill (SKILL.md, MIT) | skills-il/tax-and-finance@v1.4.0-israeli-vat-reporting | jecki (owner, 2026-06-18) | CLEAR (Rambo 2026-06-18) -- static file, no egress, SKILL.md scan clean | Not required (same as above) | Pin: `skills-il/tax-and-finance@v1.4.0-israeli-vat-reporting`. No auto-update. |
| israeli-employee-tax-refund (skills-il) | AI skill (SKILL.md, MIT) | skills-il/tax-and-finance@v1.1.1-israeli-employee-tax-refund | jecki (owner, 2026-06-18) | CLEAR (Rambo 2026-06-18) -- static file, no egress, SKILL.md scan clean | Not required (same as above) | Pin: `skills-il/tax-and-finance@v1.1.1-israeli-employee-tax-refund`. Privacy note: Shelly session-only handling of any personal tax data (no logging to tracked files). |
| israeli-linkedin-strategy (skills-il) | AI skill (SKILL.md, MIT) | skills-il/marketing-growth@v1.1.0-israeli-linkedin-strategy | jecki (owner, 2026-06-18) | CLEAR (Rambo 2026-06-18) -- static file, no egress, SKILL.md scan clean; repo CLAUDE.md confirmed benign | Not required (same as above) | Pin: `skills-il/marketing-growth@v1.1.0-israeli-linkedin-strategy`. No auto-update. |
| israeli-fact-checker (skills-il) | AI skill (SKILL.md, MIT) | skills-il/government-services@v1.0.0-israeli-fact-checker | jecki (owner, 2026-06-18) | CLEAR (Rambo 2026-06-18) -- static file, no egress, SKILL.md scan clean | Not required (same as above) | Pin: `skills-il/government-services@v1.0.0-israeli-fact-checker`. No auto-update. |
| @skills-il/kolzchut-mcp | MCP server (TypeScript, stdio) | github.com/skills-il/mcps dir:kolzchut-mcp | jecki (owner, 2026-06-18) | PARTIAL-CLEAR (Rambo 2026-06-18) -- no .claude/CLAUDE.md/.cursorrules, no postinstall scripts; calls kolzchut.org.il only | PENDING (skills-il pre-cleared platform; confirm MIT extends to this npm package) | C1: pin @1.0.1 in mcp.json. C2: no bump without Rambo advance. C3: no personal data in queries. |
| @hebcal/mcp | MCP server (TypeScript, stdio) | github.com/hebcal/hebcal-mcp | jecki (owner, 2026-06-18) | PARTIAL-CLEAR (Rambo 2026-06-18) -- no .claude/CLAUDE.md/.cursorrules, no postinstall scripts; FULLY LOCAL computation, zero external egress at runtime | PENDING -- BSD-2-Clause commercial use confirm | C1: pin @0.10.3. C2: no bump without Rambo advance. C3: Eyal BSD-2-Clause confirm (expected fast clear). |
| mcp-sefaria-server (Sivan22) | MCP server (Python, stdio) | github.com/Sivan22/mcp-sefaria-server | jecki (owner, 2026-06-18) | PARTIAL-CLEAR (Rambo 2026-06-18) -- no .clone/CLAUDE.md/.cursorrules, no postinstall; calls sefaria.org API only; NO releases/tags -- C1 is MANDATORY before install | PENDING -- (a) confirm license type; (b) confirm Sefaria.org public API terms permit use in commercial assistant | C1 MANDATORY: SHA-pin `git+https://github.com/Sivan22/mcp-sefaria-server@b8ceef78b42c9330f7b62afc020b2bc6e616b986` before any install. C2: re-pin on any update (Rambo advance). C3: Eyal (a)+(b). C4: no personal data in queries. |

---

## Adding a new tool
Any agent that identifies a tool need flags its manager. The manager escalates to Eco. Eco routes it to Rambo (Security risk review) and Eyal (Legal terms review). Once both clear it, A2 grant (or A1 if borderline or paid). The tool then gets a row here. Free-first is mandatory while budget is 0; any paid tool is A1.
