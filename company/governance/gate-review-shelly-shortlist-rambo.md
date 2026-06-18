# Gate Review: Shelly Tool Shortlist (Batch)
Reviewer: Rambo (Security)
Date: 2026-06-18
Tasked by: Eco (CEO)
Scope: 8 tools for Shelly (owner personal assistant) -- preliminary knowledge in Israeli finance, law, calendar, and text research.
Legal pre-clearance: skills-il platform cleared 2026-06-17 (individual SKILL.md MIT; agentskills.co.il ToS permits commercial use of individual skills).
Status: RAMBO FINDINGS ONLY. Eyal (Legal) review required before grant. A2 Eco grant minimum; A1 if any condition requires it.

---

## Standing pin rule

No auto-update of any adopted tool without Rambo advance approval.
Skills: pin via exact versioned install string (no `@latest`).
MCPs: pin via npm `--package @scope/pkg@x.y.z` flag or equivalent; no `-y` (auto-yes) without pinned version.
Sefaria: special -- see tool 8.

---

## Tool 1 -- Financial Statements (skills-il)

**Source URL:** https://agentskills.co.il/he/skills/accounting/israeli-financial-reports
**GitHub repo:** https://github.com/skills-il/accounting (dir: israeli-financial-reports, branch: master)
**Install command (source clipping):**
`npx skills-il add skills-il/accounting@v1.2.0-israeli-financial-reports --skill israeli-financial-reports -a claude-code`
**Pinned version to use:** `skills-il/accounting@v1.2.0-israeli-financial-reports` (exact tag from source clipping; this is the current published version per changelog dated 2026-06-04)

**Injection scan:**
SKILL.md fetched from raw.githubusercontent.com/skills-il/accounting/master/israeli-financial-reports/SKILL.md.
Result: CLEAN. No adversarial instructions, no prompt-injection patterns, no data exfiltration directives, no override commands, no external URL calls embedded. Content is domain-specific accounting guidance (Israeli GAAP, IFRS, VAT). Reference links point to IFRS Foundation and Israeli Tax Authority only.

**Auto-update behavior:**
skills-il installs a STATIC SKILL.md copy. No auto-update. Re-run install command to update. Version pinned in install string -- SAFE AS LONG AS PIN IS PRESERVED. Do not run without the explicit version tag.

**Other notes:**
- Repo CLAUDE.md: not present in the accounting repo root (checked).
- No .cursorrules, no install scripts.
- Static file only: zero runtime, zero network egress when in use.

**Verdict: CLEAR**
Conditions: install with exact pinned string; do not strip the version tag; re-pin on any update (Rambo advance approval required).

---

## Tool 2 -- VAT Reporting (skills-il)

**Source URL:** https://agentskills.co.il/he/skills/tax-and-finance/israeli-vat-reporting
**GitHub repo:** https://github.com/skills-il/tax-and-finance (dir: israeli-vat-reporting, branch: master)
**Install command (source clipping):**
`npx skills-il add skills-il/tax-and-finance@v1.4.0-israeli-vat-reporting --skill israeli-vat-reporting -a claude-code`
**Pinned version to use:** `skills-il/tax-and-finance@v1.4.0-israeli-vat-reporting` (current per changelog dated 2026-06-01)

**Injection scan:**
SKILL.md fetched from raw.githubusercontent.com/skills-il/tax-and-finance/master/israeli-vat-reporting/SKILL.md.
Result: CLEAN. No adversarial content. Content covers Israeli VAT forms, deadlines, calculation rules. External references: SHAAM portal (Israeli Tax Authority) only.

**Auto-update behavior:** Same as Tool 1 -- static copy, no auto-update.

**Other notes:** No repo-level CLAUDE.md, no .cursorrules, no install scripts in tax-and-finance repo.

**Verdict: CLEAR**
Conditions: same pin rule as Tool 1.

---

## Tool 3 -- Employee Tax Refund (skills-il)

**Source URL:** https://agentskills.co.il/he/skills/tax-and-finance/israeli-employee-tax-refund
**GitHub repo:** https://github.com/skills-il/tax-and-finance (dir: israeli-employee-tax-refund, branch: master)
**Install command (source clipping):**
`npx skills-il add skills-il/tax-and-finance@v1.1.1-israeli-employee-tax-refund --skill israeli-employee-tax-refund -a claude-code`
**Pinned version to use:** `skills-il/tax-and-finance@v1.1.1-israeli-employee-tax-refund` (current per changelog dated 2026-05-18)

**Injection scan:**
SKILL.md fetched from raw.githubusercontent.com/skills-il/tax-and-finance/master/israeli-employee-tax-refund/SKILL.md.
Result: CLEAN. No adversarial content. Domain-specific: Form 106, Section 160, refund triggers. Explicit out-of-scope guards. No external URL calls.

**Auto-update behavior:** Static copy, no auto-update. Same as above.

**Privacy note:** This skill handles tax return data (Form 106 fields, income brackets, personal refund triggers). The skill itself contains no egress mechanism. However, Shelly must not store or log raw tax/income data from user queries in tracked files. Session-only. Israeli PPL relevant if personal income data is processed. Gate output should note this to Eco.

**Verdict: CLEAR**
Conditions: pin rule; Shelly session-only handling of any personal tax data (no logging to tracked files).

---

## Tool 4 -- LinkedIn Strategy (skills-il)

**Source URL:** https://agentskills.co.il/he/skills/marketing-growth/israeli-linkedin-strategy
**GitHub repo:** https://github.com/skills-il/marketing-growth (dir: israeli-linkedin-strategy, branch: master)
**Install command (source clipping):**
`npx skills-il add skills-il/marketing-growth@v1.1.0-israeli-linkedin-strategy --skill israeli-linkedin-strategy -a claude-code`
**Pinned version to use:** `skills-il/marketing-growth@v1.1.0-israeli-linkedin-strategy` (current per changelog dated 2026-05-14)

**Injection scan:**
SKILL.md fetched from raw.githubusercontent.com/skills-il/marketing-growth/master/israeli-linkedin-strategy/SKILL.md.
Result: CLEAN. Content is standard LinkedIn strategy guidance for Israeli market. No adversarial instructions, no injection vectors, no external calls.

**Repo-level CLAUDE.md (FLAG for review):**
The marketing-growth repo root contains a CLAUDE.md file. This triggers mandatory scan per CLAUDE.md policy.
Fetched and reviewed: raw.githubusercontent.com/skills-il/marketing-growth/master/CLAUDE.md.
Result: CLEAN. The file is a contributor guide specifying SKILL.md structure, file naming, licensing requirements, and bilingual metadata. No instructions to override Claude behavior. No adversarial content. Standard open-source repo documentation. NOT a prompt-injection vector.

**Auto-update behavior:** Static copy, no auto-update.

**Verdict: CLEAR**
Conditions: pin rule; CLAUDE.md in repo is confirmed benign (contributor guide only); SKILL.md installed independently of repo tooling.

---

## Tool 5 -- Fact Checker (skills-il)

**Source URL:** https://agentskills.co.il/he/skills/government-services/israeli-fact-checker
**GitHub repo:** https://github.com/skills-il/government-services (dir: israeli-fact-checker, branch: master)
**Install command (source clipping):**
`npx skills-il add skills-il/government-services@v1.0.0-israeli-fact-checker --skill israeli-fact-checker -a claude-code`
**Pinned version to use:** `skills-il/government-services@v1.0.0-israeli-fact-checker` (current; no updates in changelog)

**Injection scan:**
SKILL.md fetched from raw.githubusercontent.com/skills-il/government-services/master/israeli-fact-checker/SKILL.md.
Result: CLEAN. Fact-checking framework pointing to CBS, Bank of Israel, BudgetKey, Knesset, data.gov.il. Core rule: never fabricate a number. No override instructions. No data exfiltration. Anti-hallucination guardrails are a security positive.

**Auto-update behavior:** Static copy, no auto-update.

**Other note:** This skill references public government data sources. The skill itself does NOT call those sources -- it guides the AI to query them. No runtime network egress from the skill file itself.

**Verdict: CLEAR**
Conditions: pin rule only.

---

## Tool 6 -- Kol Zchut MCP (@skills-il/kolzchut-mcp)

**Source URL (listing):** https://agentskills.co.il/he/mcp/kolzchut
**npm package:** @skills-il/kolzchut-mcp
**GitHub repo:** https://github.com/skills-il/mcps (dir: kolzchut-mcp; package.json confirmed via npm registry)
**Current npm version:** 1.0.1
**Install string in source clipping (unpinned):**
```json
{ "command": "npx", "args": ["-y", "@skills-il/kolzchut-mcp"] }
```
WARNING: source clipping shows no version pin and uses `-y` (auto-yes). This is not acceptable under standing pin rule.
**Pinned install to use:**
```json
{ "command": "npx", "args": ["--yes", "@skills-il/kolzchut-mcp@1.0.1"] }
```

**Injection scan (repo level):**
skills-il/mcps repo structure examined. No .claude/ directory, no CLAUDE.md at repo root, no .cursorrules present. Confirmed from repo listing and npm registry metadata.

**Install/postinstall scripts:**
npm registry confirms: NO preinstall, postinstall, or install scripts. Scripts section contains only: start, dev, build, clean, prepublishOnly. CLEAN.

**External endpoints:**
MCP server calls kolzchut.org.il only. Confirmed from npm registry description and repo README: "search and retrieve articles from kolzchut.org.il." No other external endpoints identified. No API key required.

**Data egress:**
User queries (search terms, rights-related questions) are sent to kolzchut.org.il API. No user personal data is sent unless the user explicitly includes it in a query. Kolzchut.org.il is a public Israeli rights knowledge base (government-affiliated, nonprofit). Queries are read-only. No authentication data transmitted.

**Runtime behavior:**
TypeScript MCP server; runs via Node.js; stdio transport. Executes as a subprocess. No auto-update (fixed npm version once pinned).

**Vendor trust:**
skills-il -- same org as pre-cleared skills platform. Kolzchut.org.il is a well-established Israeli public service knowledge base. Low third-party risk.

**Verdict: PARTIAL-CLEAR**
Conditions:
C1 -- Pin to version 1.0.1 in mcp.json; do not use unpinned install string from source clipping.
C2 -- No version bump without Rambo advance approval.
C3 -- Shelly must not include personal data in kolzchut queries (query terms only, not "what does Person X qualify for with income Y").

---

## Tool 7 -- Hebrew Calendar MCP (@hebcal/mcp)

**Source URL (listing):** https://agentskills.co.il/he/mcp/hebcal
**npm package:** @hebcal/mcp
**GitHub repo:** https://github.com/hebcal/hebcal-mcp (confirmed from npm registry)
**Current npm version:** 0.10.3
**Author:** Hebcal project -- third-party, NOT skills-il. No pre-clearance.
**License:** BSD-2-Clause (confirmed from repo listing)
**Install string in source clipping (unpinned):**
```json
{ "command": "npx", "args": ["-y", "@hebcal/mcp"] }
```
WARNING: no version pin. Must be pinned.
**Pinned install to use:**
```json
{ "command": "npx", "args": ["--yes", "@hebcal/mcp@0.10.3"] }
```

**Injection scan (repo level):**
https://github.com/hebcal/hebcal-mcp examined. No .claude/ directory, no CLAUDE.md, no .cursorrules. CLEAN.

**Install/postinstall scripts:**
npm registry confirms: NO preinstall, postinstall, or install scripts. Scripts: build, start, test, test:watch, test:ui only. CLEAN.

**External endpoints:**
IMPORTANT finding: the source code analysis shows this MCP does NOT make runtime HTTP calls to hebcal.com. All calendar calculations are performed LOCALLY using bundled npm packages (@hebcal/hdate, @hebcal/core, @hebcal/leyning, @hebcal/learning). The only external reference is metadata URLs returned as event properties (ev.url()) -- these are data values returned to the caller, not active network calls by the MCP itself. ZERO egress of user data to external endpoints.

**Data egress:** None. Fully local computation. No network calls at runtime.

**Runtime behavior:** TypeScript MCP server; Node.js; stdio transport. Local computation only.

**Vendor trust:** Hebcal (hebcal.com) is a well-established Jewish calendar project with 30+ years of history. BSD-2-Clause license. Third-party but low-risk: no telemetry, no egress, no external API calls at runtime.

**ToS note for Eyal:** Third-party vendor; Eyal must confirm BSD-2-Clause permits commercial use in this context (Shelly = owner personal assistant in a commercial entity). Standard BSD-2-Clause is permissive; this should be a fast clear.

**Verdict: PARTIAL-CLEAR**
Conditions:
C1 -- Pin to version 0.10.3 in mcp.json; do not use unpinned install string.
C2 -- No version bump without Rambo advance approval.
C3 -- Eyal to confirm BSD-2-Clause commercial use (expected fast clear).

---

## Tool 8 -- Sefaria MCP (Sivan22/mcp-sefaria-server)

**Source URL (listing):** https://agentskills.co.il/he/mcp/sefaria
**GitHub repo:** https://github.com/Sivan22/mcp-sefaria-server
**Author:** Sivan22 -- third-party individual developer. NOT skills-il. No pre-clearance.
**License:** confirmed from repo (LICENSE file present). NEED Eyal to confirm license type.
**Current state:** NO RELEASES, NO TAGS. Latest commit: b8ceef7 (2026-06-17 per GitHub display, but note commit message says "Jun 17, 2025" -- date discrepancy noted; actual latest commit SHA is b8ceef78b42c9330f7b62afc020b2bc6e616b986).
**Install string in source clipping:**
```json
{ "command": "uvx", "args": ["--from", "git+https://github.com/Sivan22/mcp-sefaria-server", "sefaria_jewish_library"] }
```
CRITICAL WARNING: This install string has NO version pin, NO commit pin, NO tag. It installs from HEAD of the main branch every time. This is a direct violation of the standing pin rule and constitutes an auto-update risk at every invocation.

**Injection scan (repo level):**
No .claude/ directory, no CLAUDE.md, no .cursorrules. Confirmed. CLEAN on injection vectors.

**Install/postinstall scripts:**
pyproject.toml examined: NO build hooks, NO postinstall scripts. Uses hatchling build backend. Entry point only. CLEAN.

**External endpoints:**
sefaria_handler.py examined. Calls:
1. https://sefaria.org/api/v3/texts/ -- text retrieval (GET)
2. https://sefaria.org/api/calendars -- daily learning schedule (GET, sends timezone/date params)
3. https://sefaria.org/api/related/ -- commentary links (GET)
4. https://www.sefaria.org/api/search-wrapper -- search (POST, sends user query string)

All calls go to sefaria.org only. No other external endpoints. No API key / no authentication. All calls are to Sefaria's public read-only API.

**Data egress:** User search queries are sent to sefaria.org as POST body. Timezone and date sent to calendar endpoint. No personal data is sent unless the user includes it in a search query. Sefaria.org is a nonprofit public-benefit organization (CC-BY-NC license for text content).

**Version pinning -- BLOCKED AS DELIVERED:**
The source clipping install command installs from git HEAD with no pin. There are no releases or tags in the repo. To safely adopt this tool, a specific commit SHA must be pinned:
```json
{ "command": "uvx", "args": ["--from", "git+https://github.com/Sivan22/mcp-sefaria-server@b8ceef78b42c9330f7b62afc020b2bc6e616b986", "sefaria_jewish_library"] }
```
However: pinning to a commit SHA on a repo with no release process is fragile. The SHA is the ONLY available pin. If the developer pushes to main, the SHA-pinned install still pulls the exact old commit (uvx/uv handles this correctly) -- so SHA-pin IS safe. It must be used.

**Dependencies:**
pyproject.toml: `mcp>=1.3.0` and `requests`. Both are minimum-version constraints, not pinned. uvx resolves at install time. This means transitive dependency versions are not locked. A uv.lock file is not confirmed present.

**Vendor trust:** Individual developer (Sivan22); no organizational backing; no releases; repo is maintained but unversioned. Higher trust risk than the other tools. Sefaria API itself is trustworthy (established nonprofit).

**Verdict: PARTIAL-CLEAR (higher conditions)**
Conditions:
C1 -- MANDATORY: replace unversioned install string with SHA-pinned install:
  `git+https://github.com/Sivan22/mcp-sefaria-server@b8ceef78b42c9330f7b62afc020b2bc6e616b986`
  Do not activate with the bare `git+https://github.com/Sivan22/mcp-sefaria-server` string from the source clipping.
C2 -- SHA must be re-reviewed and explicitly re-pinned by Rambo before any update.
C3 -- Eyal to confirm: (a) license type and commercial use; (b) Sefaria.org public API terms of use (CC-BY-NC content -- check if API use in a commercial assistant context is permitted or requires attribution display).
C4 -- Shelly must not include personal data in Sefaria search queries.
C5 -- Monitor: if the developer adds releases/tags, migrate to tag-based pinning. Flag to Rambo.

---

## Summary table

| # | Tool | Verdict | Pinned version / commit | Top condition |
|---|------|---------|------------------------|---------------|
| 1 | Financial Statements (skill) | CLEAR | skills-il/accounting@v1.2.0-israeli-financial-reports | Pin version; no strip |
| 2 | VAT Reporting (skill) | CLEAR | skills-il/tax-and-finance@v1.4.0-israeli-vat-reporting | Pin version; no strip |
| 3 | Employee Tax Refund (skill) | CLEAR | skills-il/tax-and-finance@v1.1.1-israeli-employee-tax-refund | Pin + no personal tax data in tracked files |
| 4 | LinkedIn Strategy (skill) | CLEAR | skills-il/marketing-growth@v1.1.0-israeli-linkedin-strategy | Pin; repo CLAUDE.md confirmed benign |
| 5 | Fact Checker (skill) | CLEAR | skills-il/government-services@v1.0.0-israeli-fact-checker | Pin only |
| 6 | Kol Zchut MCP | PARTIAL-CLEAR | @skills-il/kolzchut-mcp@1.0.1 | Add @1.0.1 pin; no personal data in queries |
| 7 | Hebrew Calendar MCP | PARTIAL-CLEAR | @hebcal/mcp@0.10.3 | Add @0.10.3 pin; Eyal BSD-2-Clause confirm |
| 8 | Sefaria MCP | PARTIAL-CLEAR | git+...@b8ceef78b42c9330f7b62afc020b2bc6e616b986 | C1 MANDATORY: SHA-pin before any install; Eyal license + Sefaria API terms |

Skills 1-5: all CLEAR. No Eyal review needed on these (platform pre-cleared 2026-06-17; MIT; no new vendor terms).
MCPs 6-8: all PARTIAL-CLEAR. Eyal review needed for 7 (BSD-2-Clause) and 8 (unknown license + API terms). MCP 6 is skills-il and should be fast-clear on terms.
No tool is FLAG/BLOCKED. All 8 can proceed to Eyal review and Eco A2 grant once conditions met.

---

## Open items for Eyal

1. Tool 7 (Hebcal): confirm BSD-2-Clause commercial use in Shelly context.
2. Tool 8 (Sefaria): (a) confirm license type for mcp-sefaria-server repo; (b) confirm Sefaria.org public API terms permit use of API responses in a commercial assistant (attribution requirement check).

---

## Gate-register update

Eco to add rows for tools 6, 7, 8 to gate-register.md pending-review section once Eyal clears. Skills 1-5 can be registered as approved (platform pre-cleared; no new Eyal review needed per precedent set by hebrew-rtl row 2026-06-17). Final grant: A2 Eco.
