# Customer file -- template

Schema for an Eco-Synthetic customer record. Copy this into `company/customers/<name>/profile.md`
and fill every field. Owned by VP Customer Success (Mike) when active; until then Eco maintains it.
Financial fields are owned by Lital (CFO). Append-only change history at the bottom.

ASCII only. No raw personal/customer data beyond what is needed to serve the relationship.

---

## Identity
- Customer name:
- Primary contact / account:
- Entity type: (external company / individual / partner / internal-spinout)
- Relationship owner (Eco-Synthetic side):
- Status: (prospect / active / paused / closed)
- Onboarded:

## Entitled services
List the services this customer may consume from Eco-Synthetic, and any per-service limits.

## Ground rules / privacy boundary
- What data may cross the boundary (and what may NOT).
- Data-handling and retention rules.
- Any regulatory / legal notes (Eyal).

## Approval gates (A1 triggers)
Request classes that require explicit owner (A1) approval before Eco-Synthetic acts -- e.g.
anything touching budget, security, or material risk. Everything else flows per the agreed channel.

## Interface
- Channel: how the customer makes requests (relayed / direct / logged).
- Request log: path to the append-only request+outcome log.

## Financial (owned by Lital, CFO)
- Billing: (e.g., $0/month)
- Cost-to-serve accounting: how this customer's consumption is booked in company financials.
- Notes:

## Change history (append-only)
- YYYY-MM-DD -- created -- <author/gate>
