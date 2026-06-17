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
- Status: prospect (relationship scaffolded; activates when the separation executes -- see B3/B4 of the plan)
- Onboarded: pending (provision Shelly's Google account when calendar management goes live)

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
- Channel (start state): owner-relayed or Telegram-relayed requests, logged on both sides. Direct
  bot-to-bot comms is deferred as a gated future step (graduates via the earned-autonomy ledger once
  the customer file and gates are proven).
- Request log: `company/customers/shelly/requests-log.md` (Eco side; Shelly keeps the mirror).

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
