# Eco-Synthetic: Compliance Readiness Backlog

Owned jointly by Eyal (Legal) and Lital (CFO). Surfaced to Eco proactively so it is
prioritized on the roadmap and never appears as a sudden critical issue.
Source: constitution section 13. Populated as T-0008.

Last legal-leg review: Eyal, 2026-06-22 (T-0005).
Format: each item has a LEGAL LEG block (Eyal) and a FINANCE LEG block (Lital).
Eyal fills legal-leg; Lital fills finance-leg. Neither overwrites the other's block.

---

## ITEM 1 -- Israeli company registration

**Status:** not started
**Required by:** first customer contract or first invoice -- whichever comes first
**Owner:** Eyal (Legal) research + jecki (A1 execution)
**Risk if delayed:** cannot legally sign contracts, issue tax-compliant invoices, or open a
business bank account

### LEGAL LEG (Eyal, 2026-06-22)

Status: OPEN -- research in progress; no registration filed.

Key legal facts (orientation-only; local counsel required for execution):
- Israeli company types: Chevra Ba'am (Ltd) is the standard vehicle for a tech startup.
  Sole proprietorship (Atzmai) is simpler but gives no liability shield and is unsuitable
  for outside investment or formal employment.
- Registration authority: Israel Corporations Authority (Rasham HaChavarot), Ministry of
  Justice. Online filing available via rasham.justice.gov.il.
- Timeline estimate: 1-3 business days for online Ltd filing once documents are ready
  (articles of association, director ID, registered address). NOT a multi-week process.
- Cost estimate: approx. ILS 2,600 registration fee (standard track as of 2025; confirm
  current fee on Rasham website before filing -- fees change). Expedited track available
  for higher fee.
- Minimum requirements: one director (can be the owner), registered address in Israel,
  Articles of Association (can use the standard statutory form from Rasham).
- Tax registration follow-on: after corporate registration, must register with the Tax
  Authority (Mas Hachnasa) and, once crossing the Osek Murshe threshold, with VAT
  (Maam). Both require the Rasham certificate as a prerequisite.
- No legal terms ambiguity on the registration itself. Execution requires A1 (jecki
  signs formation documents). Eyal can guide the process; actual filing is owner-executed
  or via local counsel (counsel cost is an A1 spend decision under budget 0).

Next concrete legal step: Eyal confirms registration type (Ltd recommended), exact
current fee, and minimum document list. Eco flags to jecki 30 days before first
contract. Requires A1 to proceed with filing.

**A1 required? YES -- filing commits the company legally. Owner action.**

**30-day flag trigger:** Eco must surface this item to jecki at least 30 days before
any contract is signed or invoice is issued. No contract or invoice is legally valid
without a registered entity and Tax Authority number.

### FINANCE LEG

FINANCE: for Lital (CFO) review -- bank account requirements, share structure, capital
registration amount, and any accounting setup needed post-registration.

---

## ITEM 2 -- Tax-compliant invoicing (VAT / Maam)

**Status:** not started
**Required by:** first paid customer
**Owner:** Lital (CFO) + Eyal (Legal)
**Dependency:** requires Item 1 (company registration) to be complete first

### LEGAL LEG (Eyal, 2026-06-22)

Status: BLOCKED on Item 1 -- no invoicing obligation exists until there is a registered
entity and, for VAT, until the Maam threshold is crossed.

Key legal facts:
- Israeli VAT (Maam) is currently 18% (rate as of 2025; confirm current rate before
  first invoice).
- Osek Murshe (licensed dealer) registration with the VAT authority is required once
  annual turnover exceeds the Patur threshold (approx. ILS 120,000 as of 2025; confirm
  current threshold). Below that threshold, the entity may register as Osek Patur
  (exempt dealer) and issue receipts without VAT collection -- but cannot reclaim input
  VAT. For a B2B tech startup, Osek Murshe registration from day one is generally
  advisable.
- Invoice legal requirements: every tax invoice (Cheshbonit Mas) must include: entity
  name, registration number, VAT number, date, sequential invoice number, customer
  details, description of service, amount, VAT amount, total. Missing mandatory fields
  make the invoice non-compliant.
- Digital invoicing: as of 2024, the Israeli Tax Authority has been phasing in mandatory
  digital invoice reporting (Hatzharot Mehacharot / Aleph reporting). Startups must
  confirm current obligation threshold before issuing invoices.
- No legal ambiguity on the obligations themselves. Invoice template design and
  accounting setup are Lital's domain.

Next concrete legal step: once Item 1 is filed, Eyal confirms VAT registration
threshold and mandatory invoice field requirements and provides to Lital for template
design. No independent action before Item 1 is complete.

**A1 required? NO for legal guidance. YES for first customer contract (which precedes
first invoice).**

### FINANCE LEG

FINANCE: for Lital (CFO) review -- invoicing tool selection (GreenInvoice or
equivalent), invoice template, VAT registration mechanics, invoice number series,
bank account for payment receipt, accounting setup.

---

## ITEM 3 -- Privacy and data protection

**Status:** baseline only (no customer data collected yet); DPA template not yet drafted
**Required by:** any customer data collected or processed -- before, not after
**Owner:** Eyal (Legal)
**Applicable law:** Israeli Privacy Protection Law 5741-1981 + Amendment 13 (2023,
in force 2025); GDPR if EU-based customers are targeted

### LEGAL LEG (Eyal, 2026-06-22)

Status: OPEN -- DPA template not yet drafted. No customer data is currently collected,
so no violation is present today. HOWEVER: the DPA template must exist BEFORE the
first customer data intake, not after.

Key legal facts and risk assessment:

Israeli Privacy Protection Law (PPL) + Amendment 13:
- Amendment 13 significantly raised obligations: mandatory Data Protection Officer (DPO)
  for certain processors, enhanced breach notification requirements (72-hour window to
  the Privacy Protection Authority, PPA), stricter consent requirements, higher fines
  (up to 5% of annual turnover or ILS 5M, whichever is higher).
- "Personal data" under Israeli law is broad: any data that identifies or can identify
  an individual. This includes names, email addresses, and usage data.
- A data processor (a company that processes data on behalf of another) must have a
  written Data Processing Agreement (DPA) with each data controller it processes for.
  As Eco-Synthetic is an AI-assisted service, it is likely to be both a controller
  (its own customer data) and a processor (customer data run through AI workflows).
- Database registration: Amendment 13 changed registration obligations. Previously,
  many databases had to be registered with the Registrar of Databases. Post-Amendment
  13, registration requirements are narrowed but new obligations (security measures,
  DPO appointment trigger thresholds, retention limits) are more demanding. Confirm
  current registration requirement against actual data type and volume at first intake.
- AI-specific risk: running personal data through an LLM (even via Anthropic's API)
  raises data processing questions. Anthropic's data processing terms must be reviewed
  against the DPA we issue to customers. The gate-register row for the whatsapp-mcp
  already flags: DPA-with-Anthropic required before LLM-processing third-party content
  (C6 in whatsapp-mcp conditions).

GDPR exposure:
- GDPR applies if we actively target or monitor EU residents, regardless of our location.
  If the product is marketed to EU customers, GDPR applies in parallel with Israeli law.
  Israeli adequacy decision: the EU has recognized Israel as providing adequate data
  protection (Commission Decision 2011), which simplifies EU-Israel data transfers but
  does not eliminate GDPR compliance obligations for controllers targeting EU individuals.
- If GDPR applies, a separate privacy notice, legal basis for processing, and data
  subject rights regime is required.

Privacy shield skill note: the company-formation batch (A2 granted 2026-06-21) includes
the Privacy Shield skill (Amendment 13 focus). That skill is orientation-only and
version-currency must be confirmed at use. DPA drafting is Eyal's authoritative work,
not the skill alone.

Actions required:
1. Draft DPA template (Eyal action, before first customer data). This is a contract
   document -- drafting requires Eyal judgment; any template offered to a customer
   requires A1 sign-off (it commits the company legally).
2. Draft privacy notice / policy for the product (required before any data collection).
3. Confirm DPO obligation threshold under Amendment 13 (depends on data type and volume
   at first intake).
4. Confirm whether Anthropic's data processing terms (existing subscription) are
   sufficient or whether a formal DPA addendum with Anthropic is needed.
5. If EU customers targeted: confirm GDPR legal basis and supplement privacy notice.

Next concrete legal step: Eyal begins DPA template draft. Template to be reviewed by
jecki before any customer sees it (A1 -- commits company legally).

**A1 required? YES -- any DPA issued to a customer is a legal commitment. Owner sign-off
required before use. Eyal drafts; jecki approves.**

**RISK LEVEL: HIGH. No customer data may be collected, stored, or processed through
any company system until the DPA template and privacy notice are in place and A1
approved.**

### FINANCE LEG

FINANCE: for Lital (CFO) review -- data retention cost implications, any insurance
coverage for data incidents, DPO appointment if threshold is met (cost is A1 under
budget 0).

---

## ITEM 4 -- ISO readiness

**Status:** not started; not required yet
**Required by:** customer or regulatory request only
**Owner:** Dalia (Quality & Governance) + Rambo (Security)

### LEGAL LEG (Eyal, 2026-06-22)

Status: NO LEGAL ACTION REQUIRED NOW.

Legal assessment:
- ISO 9001 (Quality) and ISO 27001 (Information Security) are voluntary standards.
  No Israeli law mandates them for a pre-revenue tech startup.
- Adoption as internal guidance (without seeking certification) carries no legal
  obligations and is low-risk from a legal standpoint. This is the current plan
  (constitution section 13).
- Certification creates contractual obligations with the certification body and ongoing
  audit rights. That step requires A1 (cost + legal commitment).
- Trigger for legal review: if a customer contract requires ISO certification as a
  condition of doing business, Eyal must review the contract clause and confirm scope
  before committing to certification timelines.

Next concrete legal step: none until a customer or regulatory trigger arises.
When triggered, Eyal reviews the contract clause requiring certification before Dalia
commits to a certification timeline.

**A1 required? NO for guidance adoption. YES for certification commitment (cost +
legal obligation to certification body).**

### FINANCE LEG

FINANCE: for Lital (CFO) review -- certification cost estimate when trigger arises.

---

## ITEM 5 -- Company Google account migration

**Status:** pending -- account created (eco.synthetic.org@gmail.com, 2026-06-12);
migration blocked on domain approval
**Required by:** before first external email or client contact
**Owner:** Eco (coordination + execution); was Shelly via S-0002, reassigned after
Shelly separation 2026-06-20

### LEGAL LEG (Eyal, 2026-06-22)

Status: OPEN -- no legal blocking issue on the migration itself. One legal flag noted.

Legal assessment:
- Google Workspace (Business Starter or equivalent) terms: commercial use is permitted
  under the standard Google Workspace agreement. No separate gate required for the
  migration of an existing Gmail account to a Workspace account on an approved domain,
  provided the subscription tier is appropriate.
- Domain purchase: purchasing a .com/.ai/.co.il domain is a commercial transaction
  requiring owner A1 (cost, however small, is A1 under budget 0). The legal terms of
  the domain registrar must be reviewed at purchase. Eyal recommends standard registrars
  (GoDaddy, Namecheap, Google Domains) -- all have standard ToS without unusual
  obligations. Flag if a non-standard registrar is chosen.
- Email communication: once a company email exists, it must comply with Israeli law on
  electronic commercial communications (Anti-Spam Law, Amendment to the Communications
  Law). Any marketing or commercial email to customers requires: sender identification,
  a valid unsubscribe mechanism, and compliance with opt-in requirements. This is a
  Hila / Sales concern as much as Legal; Eyal to review before first marketing send.
- MCP connector update: when the domain and email change, the gate-register rows for
  Google Drive MCP and Google Calendar MCP must be updated to reflect the new OAuth
  credentials. No new gate review is needed (same MIT-licensed MCP, same read-only
  scope), but the updated auth config is an owner action (credentials change is A1
  red line territory -- .env update).
- No Israeli law issue with the migration itself.

Next concrete legal step: flag to Eco when domain is confirmed. Review domain
registrar ToS if non-standard. Review anti-spam compliance before first marketing
email. No A1 from Eyal -- but domain purchase and email auth change are owner A1.

**A1 required? YES -- domain purchase (cost) and credential update (.env) are both
owner A1 actions.**

### FINANCE LEG

FINANCE: for Lital (CFO) review -- Google Workspace subscription cost (if upgrading
from free Gmail), domain registration cost.

---

## ITEM 6 -- Data Processing Agreement (DPA) with Anthropic

**Status:** not formally in place; operating under Anthropic subscription terms
**Required by:** before LLM-processing of any third-party personal data (flagged as
condition in whatsapp-mcp gate row C6, and implied by Amendment 13)
**Owner:** Eyal (Legal)

### LEGAL LEG (Eyal, 2026-06-22) -- NEW ITEM

Status: OPEN -- research required.

This item is raised as a new compliance backlog item because:
1. The whatsapp-mcp gate conditions (C6) explicitly require a DPA with Anthropic before
   any third-party personal data is processed through the LLM.
2. The privacy-shield skill conditions (compliance-backlog Item 3 above) also flag this.
3. Anthropic's standard usage policies and API terms govern data handling. For business
   customers, Anthropic offers a Data Processing Addendum (DPA). Whether the current
   Claude Code subscription already incorporates adequate DPA terms for Israeli PPL
   compliance, or whether a separate addendum is needed, must be confirmed.

Actions required:
1. Eyal reviews current Anthropic subscription terms and any available DPA addendum.
   (NOTE: this requires WebFetch to review Anthropic's public legal pages. Eyal
   currently has Read/Write/Edit only -- no WebFetch. This step is BLOCKED until
   Eyal is granted WebFetch via the gate, OR owner provides the Anthropic terms text
   for review, OR the legal-research skill (A2-granted, install pending T-0032) is
   used to identify the relevant Anthropic terms page for manual review.)
2. If Anthropic offers a DPA addendum: owner must execute it (A1 -- commits company
   legally). Eyal reviews terms before execution.
3. If Anthropic's standard terms are sufficient under Israeli PPL: Eyal documents the
   basis and closes this item.

BLOCKED: Eyal cannot complete this review without access to the Anthropic legal pages.
Escalation: Eco surfaces to jecki. Owner options: (a) provide Anthropic terms text
to Eyal for review, or (b) grant Eyal WebFetch via the tool gate, or (c) use the
legal-research skill once T-0032 install is complete.

**A1 required? YES -- any DPA execution with Anthropic commits the company legally.**

**RISK LEVEL: MEDIUM-HIGH. No third-party personal data should be processed through
the LLM until this is resolved. Currently no third-party personal data is flowing,
so no active violation -- but this must be resolved before WhatsApp bridge or any
customer-data workflow goes live.**

### FINANCE LEG

FINANCE: for Lital (CFO) review -- Anthropic DPA may be included in Enterprise tier
only; confirm whether current subscription tier covers it or an upgrade is needed
(upgrade cost is A1 under budget 0).

---

## Open action items (consolidated)

| # | Owner | Item | Trigger / Deadline | A1 needed? |
|---|-------|------|--------------------|------------|
| 1 | Eyal | Confirm Ltd registration type, current Rasham fee, document list | 30 days before first contract | YES (filing) |
| 2 | Eyal | Draft DPA template | Before first customer data intake | YES (to issue to customer) |
| 3 | Eyal | Draft privacy notice / policy | Before first customer data intake | YES (public-facing document) |
| 4 | Eyal | Confirm DPO obligation threshold (Amendment 13) | Before first customer data intake | NO (research); YES if DPO appointed |
| 5 | Eyal | Review Anthropic DPA / subscription terms | Before whatsapp-mcp goes live; before any personal data in LLM | YES (if executing addendum) |
| 6 | Eyal | Anti-spam compliance review | Before first marketing email | NO (guidance) |
| 7 | Lital | FINANCE: confirm VAT registration threshold and Osek type | Before first invoice | YES (VAT registration) |
| 8 | Lital | FINANCE: invoicing tool (GreenInvoice or equivalent) | Before first paid customer | NO (tool gate needed; A2) |
| 9 | Lital | FINANCE: bank account setup post-registration | After Item 1 filed | NO (operational) |
| 10 | Eco | Flag registration item to jecki 30 days before first contract | Ongoing monitoring | NO |
| 11 | Eco/jecki | Domain purchase (domain registrar ToS + cost) | Before S-0002 closes | YES (cost + A1) |
| 12 | Dalia | ISO trigger monitoring | On customer/regulatory request | NO now |

---

## Quarterly report cadence

Eyal + Lital report to Eco: quarterly (or sooner if any item crosses the 30-day
threshold or a new high-risk item is identified).

Next report due: on-demand until first trigger event (no active customers yet).
T-0033 proactivity program (P3) will add a Lital/Eyal compliance event-trigger once
SHIR-005 is built.
