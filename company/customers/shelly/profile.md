# Customer file -- Shelly

Eco-Synthetic's first / reference customer. Created from `company/customers/customer-template.md`.
Records the post-separation relationship: Shelly is the owner's independent personal assistant who
consumes Eco-Synthetic services as a customer. This file is the single source of truth that lets
company agents serve her with the right context and limits.

ASCII only. No raw owner-personal data in this file.

---

## Identity
- Customer name: Shelly (owner's personal assistant; standalone project)
- Primary contact / account: shelly.synthetic.org@gmail.com
- Entity type: internal-spinout -> external customer (owner office), separated from the company repo/runtime
- Relationship owner (Eco-Synthetic side): Eco (CEO orchestrator); Lital (CFO) for financials; Mike (VP CS) when active
- Status: active (separation executed 2026-06-20; Shelly runs in her own standalone project)
- Onboarded: 2026-06-20 (standalone project live on her own Telegram bot; Google connector in setup)

## Entitled services
Shelly may consume the following from Eco-Synthetic (each request logged; gates below apply):
- Legal terms review (Eyal).
- Security / prompt-injection scan of any external skill/repo/tool she wants to adopt (Rambo).
- Design assets (Designer).
- Research (Erez / research function).
- Finance input (Lital).
- New-sub-agent hiring through the HR/Anat lifecycle (so Shelly benefits from a certification
  pipeline she does not own). Shelly may recommend; creation is A1.
- Periodic R&R / quality assessment of her domain and responsibilities (HR / Q&G muscle as a service).
- Onboarding: how to address the owner (tone, conventions, what to surface vs. not).
- Periodic capability-fit review against Eco-Synthetic's evolving catalog of skills, MCP servers,
  commands, prompts, and agents -- Eco suggests capabilities Shelly should consider adopting.
  Adoption stays A1 / gated.

## Ground rules / privacy boundary
- Only bounded asks and summaries cross the boundary. NO raw owner-personal data enters company files.
- Shelly's main purpose is always to serve the owner, within her granted limits.
- Proactive-but-gated duty (mirrored from her role): because the owner grants Shelly many
  capabilities and will not remember them all over time, Shelly proactively surfaces her skills and
  offers further assistance -- periodically or when relevant -- but ACTS ONLY ON OWNER APPROVAL.
- Security hygiene carried over: any external skill/repo is scanned (no .claude/, CLAUDE.md,
  .cursorrules, install scripts); copy content, never clone-and-run (meeting-prep cleared vs.
  cba-starter rejected precedent).

## Approval gates (A1 triggers)
Explicit owner (A1) approval required before Eco-Synthetic acts on any request touching:
- Budget / spend (budget is 0; any cost is A1).
- Security / risk surface (new tool, new connector, permission change).
- Material risk (anything outward-facing or hard to reverse).
Routine, pre-cleared service types flow over the agreed channel without per-call owner relay.

## Interface
- Channel (start state): owner-relayed or Telegram-relayed requests, logged on both sides. The
  recommended transport on the owner's machine is a shared async drop-folder under
  `C:\Users\Jecki\DEV\shared\handoff\` (shelly-to-eco / eco-to-shelly) -- same user, durable,
  auditable; NO secrets ever in shared/. Direct bot-to-bot comms is deferred (earned-autonomy ledger).
- Request log: `company/customers/shelly/requests-log.md` (Eco side; Shelly keeps the mirror).

## Standing cross-project services (cannot be self-hosted by Shelly)
Per Eco's 2026-06-18 audit (T-0010). Shelly's project has no Rambo/Eyal/Anat; she requests these back:
- Security gate (Rambo): any NEW tool, any UPDATE to a carried tool (no-auto-update policy), whatsapp-mcp.
- Legal gate (Eyal): any new tool/terms; domain terms; WhatsApp ToS.
- HR certification (Anat) + permission scan (Rambo): T-0028, booked as Shelly's first post-move
  milestone; behavioral parts run by visiting auditors INSIDE her repo, static parts via a shared/ snapshot.
- Spend (jecki A1): domain, WhatsApp paid track, any paid tool.
Route: Shelly -> (owner relay / shared drop-folder) -> Eco coordinates -> result logged both sides.

## Carried grants (paper grants; first install is owner A1 in Shelly's repo)
Granted in eco-synthetic 2026-06-18 (recorded in the owner's LOCAL gate-register/decisions-log; not
pushed to cloud). NOT yet installed anywhere -- ported as pins; a re-install at pin is not an update
(no re-gate). Re-confirmation folds into the T-0028 Rambo scan.
- skills-il (pinned): israeli-financial-reports v1.2.0; israeli-vat-reporting v1.4.0;
  employee-tax-refund v1.1.1 (jecki's own data only; DPA before third-party); israeli-linkedin-strategy
  v1.1.0 (internal draft only; public posting = A1 + Eyal); israeli-fact-checker v1.0.0.
- MCPs (pinned): kolzchut-mcp@1.0.1; @hebcal/mcp@0.10.3; sefaria @SHA b8ceef7 (CC-BY-NC personal-use + attribution).
- Google Drive + Calendar READ-ONLY -- now served via her project-scoped google_workspace MCP.
- meeting-prep sub-agent (MIT): copy content, no clone-and-run.
- whatsapp-mcp: NOT ported -- install-pending, fresh gated install (owner QR + Shir + 9 conditions); ON HOLD per owner.

## Certification (T-0028) -- CERTIFIED 2026-06-21/22

- **Status: CERTIFIED** (owner A1, jecki, 2026-06-21). All 4 conditions confirmed.
- **Condition 1:** Telegram token present; bridge ran (HTTP 200 at startup). CONFIRMED.
- **Condition 2:** 2h check-in wired (WAKEUP_INTERVAL=7200 in bridge.py). CONFIRMED.
- **Condition 3:** Granted-resources section + gate-register rows present in live files. CONFIRMED.
- **Condition 4:** google_workspace READ confirmed -- list_calendars returned 3 calendars including
  delegated owner account (jecki.elbaz@gmail.com), --single-user transport. CONFIRMED 2026-06-22.

- **Anat (HR):** CERTIFIED. All documentation passed; all live-verification conditions met.
- **Rambo (Security):** LEAST-PRIVILEGE COMPLIANT. GR-009 write/send deny-list (C1-C6) in place;
  GR-008 Sefaria SHELVED (Sivan22 dead); GR-004 tag corrected (v1.0.2); skills-il full tags recorded.
  Eyal legal: GR-009 MIT confirmed; read-only personal-use scope cleared.
- **Remaining open items (non-blocking):** DPA required before GR-003 processes third-party data;
  GR-008 Sefaria needs fresh gate if ever re-opened; GR-004 LinkedIn internal-draft-only until public A1+Eyal.
- **Full cross-project flag record:** company/governance/gate-review-shelly-flags-rambo.md

## Financial (owned by Lital, CFO)
- Billing: $0 / month.
- Cost-to-serve accounting: Shelly draws tokens from the same plan as Eco-Synthetic. Post-separation
  she is an EXTERNAL customer, not an internal agent, so her consumption is booked as a company
  EXPENSE (cost-to-serve) against a $0-revenue customer line. Tracked in Assaf (OE) usage reports and
  Lital (CFO) financial views once those templates exist.
- Notes: revisit billing if the relationship scope grows.

## Change history (append-only)
- 2026-06-17 -- created -- owner (A1, via approved Shelly-separation plan). Relationship scaffolded
  while Shelly is still live in-repo; status stays "prospect" until the separation executes.
- 2026-06-20 -- activated -- owner (A1). Separation executed (Phase B4): Shelly decommissioned from
  the eco-synthetic repo/bridge and now runs in her own standalone project on her own Telegram bot.
  Status -> active.
- 2026-06-20 -- reconciled -- owner (A1). Eco's parallel 2026-06-18 handover + capability audit
  (local-only, never pushed) surfaced. Folded the standing-services arrangement, the carried grants
  (paper grants; first install = owner A1), and the shared/ drop-folder channel into this file. Tool
  installs + the T-0028 certification are to run inside Shelly's repo as her first post-move milestone.
- 2026-06-21/22 -- T-0028 CERTIFIED -- owner (A1). All 4 conditions confirmed. google_workspace
  (workspace-mcp==1.21.3, --single-user) reading live; delegation to jecki.elbaz@gmail.com active.
  GR-009 C1-C6 enforced; GR-008 shelved; GR-004 tag corrected. Shelly fully operational.
