# Shelly Move -- Handover Package (apply IN the Shelly repo)

Prepared by Eco in eco-synthetic, 2026-06-18. Companion to company/processes/shelly-move-initial-audit.md.
Owner decisions: Step 1 install = go; T-0010 = separate now.

WHY THIS IS A PACKAGE, NOT A DIRECT MIGRATION: the eco-synthetic session is project-scoped
and cannot read/write C:\Users\Jecki\DEV\projects\Shelly. This file is the exact content to
MERGE into the Shelly repo, applied by a Claude Code session opened INSIDE that repo. The
destination already has CLAUDE.md / settings.json / mcp.json / .env and empty .claude/agents,
memory, integrations -- so MERGE, do not overwrite. Inspect each target before writing.

NEVER put any secret in this file or any tracked file. The Telegram token is set by the owner
directly in the Shelly repo .env.

---

## 1. CLAUDE.md -- sections to ensure present (merge into the Shelly repo CLAUDE.md)

Shelly inherits NOTHING from eco-synthetic's CLAUDE.md by reference. Ensure her project CLAUDE.md
contains, at minimum:

- RED LINES (the ones that apply to a solo owner-assistant repo): never read/write/log .env or any
  credential file; never commit secrets/tokens/personal data; never adopt/update an external tool
  without the gate (which for her routes back to eco-synthetic -- see section 6); pin all
  dependency versions, never "latest"; verify-before-claim; no guessing.
- ASCII rule: plain ASCII in files/logs/agent-to-agent (no em dash, no curly quotes); emoji only
  sparingly in messages to the human.
- Google Workspace connectors: READ-ONLY (Drive + Calendar); write tools blocked; bounded queries;
  never store raw personal correspondence in tracked files; same company account.
- NO-AUTO-UPDATE policy: no adopted tool updates without Rambo advance approval (routed back to
  eco-synthetic); all MCPs pinned by version/SHA; skills are static SKILL.md copies.
- Cross-project cooperation rule: Shelly is tasked by jecki only; Eco is reachable only when jecki
  delegates a specific joint task + time frame; new-tool gate, legal, and certification route back
  to eco-synthetic (section 6).

## 2. Role file -- port .claude/agents/Shelly.md

Copy the CURRENT eco-synthetic .claude/agents/Shelly.md verbatim into the Shelly repo
.claude/agents/Shelly.md (it already carries the soul Core Block, the Granted-resources section,
the on-move trigger, and the orientation boundary). Then repoint any eco-synthetic paths to the
Shelly repo's own paths (board, owner-office memory). Keep the persona line.

## 3. gate-register (create in the Shelly repo)

Create company/governance/gate-register.md (or equivalent) with rows for CARRIED grants only.
Each marked: "granted in eco-synthetic <date>; ported; NEW tools/UPDATES route back to eco-synthetic gate."

| Tool | Type | Pinned install | Conditions |
|------|------|----------------|-----------|
| Financial statements | skills-il skill | skills-il/accounting@v1.2.0-israeli-financial-reports | orientation-only (Lital authoritative) |
| VAT reporting | skills-il skill | skills-il/tax-and-finance@v1.4.0-israeli-vat-reporting | orientation-only (Lital authoritative) |
| Employee tax refund | skills-il skill | skills-il/tax-and-finance@v1.1.1-israeli-employee-tax-refund | jecki's OWN data only; PPL+DPA before third-party data |
| LinkedIn strategy | skills-il skill | skills-il/marketing-growth@v1.1.0-israeli-linkedin-strategy | internal draft only; no public posting without A1 + Eyal |
| Fact checker | skills-il skill | skills-il/government-services@v1.0.0-israeli-fact-checker | if it calls an external API, that endpoint needs its own gate row |
| Kol Zchut MCP | MCP | @skills-il/kolzchut-mcp@1.0.1 | pin; surface attribution; orientation-only |
| Hebrew calendar MCP | MCP | @hebcal/mcp@0.10.3 | BSD-2; local; pin |
| Sefaria MCP | MCP | git+https://github.com/Sivan22/mcp-sefaria-server@b8ceef78b42c9330f7b62afc020b2bc6e616b986 | SHA-pin mandatory; CC-BY-NC owner-personal use only + attribution |
| whatsapp-mcp | MCP (unofficial) | NOT a migration -- fresh gated install (owner QR + Shir + 9 conditions) | install-pending; do not port live |
| Google Drive | connector | read-only | write tools blocked |
| Google Calendar | connector | read-only | write tools blocked |
| meeting-prep | sub-agent (MIT) | copy meeting-prep.md content (no clone-and-run) | already cleared for the standalone repo |

## 4. MCP config -- entries for the Shelly repo mcp.json / settings.json

Add (pinned; confirm exact command/entry-point in the Shelly-repo session). Drive/Calendar
re-added READ-ONLY (write tools blocked):

```
"kolzchut":  { "command": "npx",  "args": ["-y", "@skills-il/kolzchut-mcp@1.0.1"] }
"hebcal":    { "command": "npx",  "args": ["-y", "@hebcal/mcp@0.10.3"] }
"sefaria":   { "command": "uvx",  "args": ["--from", "git+https://github.com/Sivan22/mcp-sefaria-server@b8ceef78b42c9330f7b62afc020b2bc6e616b986", "mcp-sefaria-server"] }
```

## 5. Skill installs (run in the Shelly repo, interactive terminal, choose PROJECT scope)

```
CI=true npx skills-il@1.10.0 add skills-il/accounting@v1.2.0-israeli-financial-reports --skill israeli-financial-reports -a claude-code
CI=true npx skills-il@1.10.0 add skills-il/tax-and-finance@v1.4.0-israeli-vat-reporting --skill israeli-vat-reporting -a claude-code
CI=true npx skills-il@1.10.0 add skills-il/tax-and-finance@v1.1.1-israeli-employee-tax-refund --skill israeli-employee-tax-refund -a claude-code
CI=true npx skills-il@1.10.0 add skills-il/marketing-growth@v1.1.0-israeli-linkedin-strategy --skill israeli-linkedin-strategy -a claude-code
CI=true npx skills-il@1.10.0 add skills-il/government-services@v1.0.0-israeli-fact-checker --skill israeli-fact-checker -a claude-code
```
(Skill slugs after --skill may need confirming from the CLI listing; the source@version pins are authoritative.)
After each: read the installed SKILL.md and confirm content matches the reviewed item (Rambo C1).

## 6. Standing cross-project services (cannot be ported -- request back from eco-synthetic)

- Security gate (Rambo) + Legal gate (Eyal): any NEW tool / any UPDATE to a carried tool / whatsapp-mcp.
- HR certification (Anat B4 + Rambo B5): T-0028, run in the Shelly repo (B3 needs a session reload).
- Spend (jecki A1): domain, WhatsApp paid track, any paid tool.
Channel: owner-relay + shared async drop-folder under C:\Users\Jecki\DEV\shared\ (no native cross-repo
agent messaging). See audit section 4.5.

## 7. Memory seed (recreate owner-office rows in the Shelly repo board)

Recreate S-0001..S-0007 (current owner-office rows from eco-synthetic memory/board.md) in the Shelly
repo's own board. Move memory/owner-office/ content into the Shelly repo memory. After the move,
eco-synthetic no longer holds owner-office (already CEO-denied).

## 8. Secrets + triggers (owner / host)

- Owner sets SHELLY_TELEGRAM_BOT_TOKEN in the Shelly repo .env (manual, never committed).
- Re-establish the 2h proactive check-in trigger in the Shelly repo bridge/schedule.
- meeting-prep: copy meeting-prep.md content into the Shelly repo (no clone-and-run).

## 9. Logging

Write the T-0010 separation execution as a founding entry in the Shelly repo's decisions log AND
mirror it in eco-synthetic's decisions-log (cross-reference). Then certify (T-0028) as the first
post-move milestone.

## 10. Verification (in the Shelly repo)

- Skills + MCPs install at their pins (no bare npx / no uvx HEAD); MCP entries pinned.
- Drive/Calendar are READ-ONLY (write tools blocked).
- No secret landed in any tracked file.
- Role file, CLAUDE.md sections, gate-register, memory rows all present.
- T-0028 certification recorded in the Shelly repo log + mirrored in eco-synthetic.
