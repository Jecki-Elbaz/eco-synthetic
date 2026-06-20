# Eco-Synthetic: Tool Library Catalog

Living index of the `sources/` tool library (the pre-vetted shelf). Created 2026-06-21.
Curated by: Yossi (Training) + Assaf (OE). Adoption record of truth: `gate-register.md`.
This catalog tracks the WHOLE library and its status; it does NOT adopt anything.

## How to read this
- This is the shelf. A tool is only USABLE once it passes the gate (`/tool-gate`: Rambo risk +
  Eyal terms) and is granted in `gate-register.md`. skills-il individual SKILL.md files are
  legally pre-cleared (MIT + ToS), so adopting a skill = Rambo content-scan + pin (lightweight).
- Adoption is NEEDS-DRIVEN: pull a tool when a LIVE agent has a concrete need, not speculatively.
- NO auto-update without Rambo advance approval; pin every version/SHA (security-baseline).

## Status legend
- GLOBAL -- installed at workspace/user scope (all projects). 
- ADOPTED -- gated + granted, project-scoped (eco-synthetic or Shelly repo); may be install-pending.
- GRANTED -- gate cleared + A2/A1 granted; install pending.
- STAGED -- decision made, activates on a trigger (e.g. a customer).
- SHELF -- evaluated, pre-vetted, NOT gated. Default for everything not yet needed.
- PAID -- requires a paid third-party account -> automatic A1 when adopted.
- REJECTED -- not to be used (reason recorded).

Maintenance: Yossi/Assaf complete + keep this current from `sources/` as agents come online and
needs arise. Where a row says "+ others", the named items are representative; the full file list
lives in `sources/IL Skills/` and `sources/IL MCP/` and should be folded in over time.

---

## 1. Israeli MCP servers (sources/IL MCP/, 14)

| MCP | Trust | Target agent | Status |
|-----|-------|--------------|--------|
| Hebrew Calendar (Hebcal) | 85 | Eco/Shelly/all | GLOBAL (@hebcal/mcp@0.10.3, installed 2026-06-21) |
| Kol Zchut / All Rights | 81 | Eyal/Shelly | ADOPTED (Shelly shortlist, @1.0.1; migrated to Shelly repo) |
| Sefaria (Jewish texts) | 91 | Eco/Shelly | ADOPTED (Shelly shortlist, SHA-pinned; CC-BY-NC personal-use; migrated) |
| BOI Exchange Rates | 75 | Lital | SHELF (strong candidate when finance ops start) |
| DataGov Israel (Python CKAN) | 94 | Eyal/Lital | SHELF |
| Data.gov.il Advanced (JS CKAN) | 84 | Eyal/Lital/Perry | SHELF |
| Israel Vehicles Registry | 79 | Shelly | SHELF |
| Israel Drugs Registry | 79 | Shelly/Eyal | SHELF |
| Public Transit Routes | 75 | Shelly | SHELF (uses Google Routes API -- check terms) |
| Ben Gurion Flights | 81 | Shelly | SHELF |
| Israel Weather (IMS) | 63 | Shelly | SHELF (lowest trust; revisit) |
| Supermarket Prices | 81 | Shelly | SHELF |
| Home Front Command Alerts | 73 | Shelly/Eco | SHELF (real-time safety; Docker) |
| Red Alert (missile) | 75 | Shelly/Eco | SHELF (real-time; Socket.IO) |

Note: externally-hosted MCPs are NOT eligible for global scope by default (network attack surface);
Hebcal qualified only because it is fully local.

## 2. Israeli skills (sources/IL Skills/, ~100) -- by category

### Finance / tax / accounting / payroll
| Skill | Target | Status |
|-------|--------|--------|
| Financial statements | Lital/Shelly | ADOPTED (Shelly shortlist; migrated) |
| VAT reporting | Lital/Shelly | ADOPTED (Shelly shortlist; migrated) |
| Employee tax refund | Shelly | ADOPTED (Shelly shortlist; owner-data only; migrated) |
| Tax returns, Withholding tax, Corporate tax strategy, Expense categorization | Lital/Eyal | SHELF |
| Salary calculator, Bookkeeping automation, Annual report analysis | Lital | SHELF |
| Pension advisor, Mortgage comparison, Insurance comparison, Debt collection | Lital/Shelly | SHELF |
| Hashavshevet data tools | Lital | SHELF |

### Invoicing + payment gateways (mostly PAID -> A1)
| Skill | Target | Status |
|-------|--------|--------|
| Israeli e-Invoice (SHAAM) | Lital/Shelly | SHELF (free) |
| iCount | Shelly/Lital | SHELF (PAID account) |
| Green Invoice (Morning) | Shelly/Lital | SHELF (PAID; also deferred in gate-register) |
| Receipt/invoice organizer | Shelly | SHELF |
| Grow/Meshulam, Tranzila, Pelecard, Cardcom (payment gateways) | Lital | SHELF (PAID; needs merchant account; A1) |

### Legal / government / compliance
| Skill | Target | Status |
|-------|--------|--------|
| Startup Toolkit (registration/IIA/sec.102/Delaware) | Eco/Lital/Eyal | GRANTED 2026-06-21 (install pending; orientation-only) |
| Legal research (Hebrew) | Eyal | GRANTED 2026-06-21 (install pending; verify citations) |
| Privacy shield (Amendment 13) | Eyal | GRANTED 2026-06-21 (PARTIAL: confirm install cmd; install pending) |
| Worker rights, E-commerce compliance, Gov APIs, ID validator, Gov form automation, Bureaucracy decoder, Small claims | Eyal/Shelly | SHELF |

### Marketing / content / social
| Skill | Target | Status |
|-------|--------|--------|
| LinkedIn strategy | Shelly (+Hila) | ADOPTED (Shelly shortlist; internal draft only; migrated) |
| Content marketing, Social content creator, Hebrew content writer, Paid ads, Presentation generator, Israeli marketing bundle, SEO/GEO | Hila/Sally | SHELF (publishing stays A1) |
| Social scheduling (Postiz) | Hila | SHELF (PAID) |

### Chatbots / voice / telegram / whatsapp
| Skill | Target | Status |
|-------|--------|--------|
| Hebrew chatbot builder, Telegram bot (business + builder), Hebrew voice bot, WhatsApp Business IL, Chatbot analytics, Customer support automator | Gal/Shir/Mike-CS | SHELF (P2/P3; tie to product + CS) |

### Dev / tech
| Skill | Target | Status |
|-------|--------|--------|
| hebrew-rtl-best-practices | Gal/Shir/Tal/all | GLOBAL (skills-il v1.3.0, installed 2026-06-21) |
| Dev toolkit bundle, Hebrew NLP toolkit, Form OCR, Remotion, Web accessibility, Document generator (Hebrew), Date converter, AppSec scanner, Israeli cybersecurity, Hebrew-first bundle, Zapier IL | Gal/Shir/Tal | SHELF (gate when R&D dev starts) |
| Monday.com workflows | Perry/ops | SHELF (PAID account) |

### Consumer / comparison / utility
| Skill | Target | Status |
|-------|--------|--------|
| Fact checker | Shelly/all | ADOPTED (Shelly shortlist; migrated) |
| Product/supermarket/flight/telecom/insurance/mortgage comparison, Coupon finder, Package tracking, Public transport, Vehicle manager, Real estate, Smart saver, Daily assistant, Company search, Restaurant finder, Currency converter, Live events, Drug database, CBS data navigator | Shelly | SHELF (personal-admin; pull on need) |
| Timeless meeting manager | Shelly/Mike | SHELF (PAID) |

### Bundles (meta-packages)
Hebrew-first, Israeli marketing, Tax season, Legal & compliance, Freelancer accounting, Small
business starter -- SHELF. Adopt component skills individually as needed (a bundle = several skills).

## 3. Global MCP catalog candidates (sources/MCP/, vetted shortlist)
| Tool | Target | Status |
|------|--------|--------|
| github-mcp-server | Gal/Shir/Ido | SHELF (gate when active R&D dev starts) |
| repomix / code2prompt | Gal/Eco | SHELF (low-risk codebase->prompt) |
| playwright-mcp / chrome-devtools-mcp | Shir/Gal (E2E) | SHELF (check overlap with Claude-in-Chrome) |
| firecrawl | research | SHELF -- likely REDUNDANT (WebFetch + Bright Data exist) |
| graphiti (temporal memory) | memory system | SHELF (heavy; defer) |
| caveman-shrink (MCP middleware) | Assaf | DEFERRED (separate deeper Rambo review; not the caveman skill) |

The mcp-security-hub catalog is a pre-screening reference only, NOT an approval; each pull still
goes through the gate.

## 4. Methodology + consultants (reference / training material, not tools)
- sources/IL Guieds/ (8 guides): skill content-correctness, chatbot security, DESIGN usage, GitHub
  repo-vetting / 5-things, testing & distribution, security policy, trust-score meaning, multi-agent
  compatibility. -> Yossi/Assaf training curriculum; Rambo security reference.
- sources/Consultants/Automation Flow: Capture-Brain-Act methodology. (cba-starter repo is
  REJECTED / reference-only -- see gate-register; mine ideas by reading, never clone-and-run.)
- sources/Consultants/Daniel Goldman: multi-agent production-SaaS case study. Reference.

## 5. Summary
- GLOBAL (3): caveman, hebrew-rtl, Hebcal.
- ADOPTED-scoped (Shelly repo): financial statements, VAT, employee refund, LinkedIn, fact-checker,
  Kol Zchut, Sefaria. + whatsapp-mcp (granted, install pending) + 360dialog (staged).
- GRANTED 2026-06-21 (eco-synthetic, install pending): Startup Toolkit, Legal research, Privacy shield.
- SHELF: everything else (~90+ skills, ~11 MCPs, the catalog candidates) -- pre-vetted, pull on need.
- PAID (A1 when needed): payment gateways, Green Invoice, iCount, Monday, Postiz, Timeless.
- REJECTED: cba-starter (and evolution-api/Baileys for messaging -- see gate-register).
