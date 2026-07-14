# Eco-Synthetic: Compliance Readiness Backlog

Owned jointly by Eyal (Legal) and Lital (CFO). Surfaced to Eco proactively so it is
prioritized on the roadmap and never appears as a sudden critical issue.
Source: constitution section 13. Populated as T-0008.

Last legal-leg review: Eyal, 2026-06-29 (scheduled runner).
Last finance-leg review: Lital, 2026-07-13 (scheduled runner, run 6).

---

## OVERDUE -- ACTION REQUIRED

Reviewed by Lital: 2026-07-13 (run 6)

**ITEM-6 / APS-004 -- Anthropic config 3 owner steps (target was 2026-07-07; NOW 6 DAYS PAST)**

Owner: jecki (A1). Responsible party: jecki.

Three A1 steps were targeted for completion before APS Sprint 2 (2026-07-07):
1. Confirm Anthropic account is on commercial plan (DPA applies).
2. Confirm/enable zero data-retention in Anthropic console.
3. Download and retain a copy of the Anthropic DPA.

None confirmed completed as of this review. APS is now on Sprint 8 (2026-07-13) and
active simulation code (arc-writer.service.ts, simulation.service.ts) is being modified.
A new migration (arc_session_summary_retain_until, 2026-07-12) and purge scripts confirm
that student data retention logic is being implemented in code -- the compliance gate must
close before student data enters the LLM pipeline. This is no longer preventive; it is
overdue relative to its own internal target and APS's rate of progress.

ESCALATE_TO_ECO_OVERDUE
Format: each item has a LEGAL LEG block (Eyal) and a FINANCE LEG block (Lital).
Eyal fills legal-leg; Lital fills finance-leg. Neither overwrites the other's block.

---

## ECO-ASSIGNED ACTION ITEMS -- EYAL (open; added by Eco 2026-07-09)

Concrete, self-contained legal tasks Eco assigned to Eyal. Complete each on your next
compliance run: do the task, write the stated output, then append a one-line
"DONE <date>: <result>" under the item (do not delete it). No owner input needed for either.

**EA-1 -- WhatsApp ToS confirm (closes T-0039 item 3).**
Read C:\Users\Jecki\DEV\shared\handoff\shelly-outbox\S-0005-whatsapp-tos-packet-for-eyal-2026-07-02.md
(Shelly already staged the primary-source ToS text -- this is Read-only, NOT a WebFetch task).
In one line, confirm whether the packet satisfies your live-ToS item for the whatsapp-mcp gate:
does it show that both the consumer ToS and the Business Terms prohibit unofficial/automated
clients and reserve account termination (the concrete basis for the C5 / C-L1 ban-risk the owner
must accept)? Write the verdict to
C:\Users\Jecki\DEV\shared\handoff\eyal-whatsapp-tos-confirm-2026-07-09.md and mark DONE here.
After your confirm, only two owner keystrokes remain (record SHA + ban-risk acceptance at install).
DONE 2026-07-11: CONFIRMED. Both sources verified from primary-source (whatsapp.com). Consumer
ToS prohibits unauthorized/automated clients; Business Terms prohibit unauthorized apps AND
explicitly reserve account termination. Concrete ban-risk basis for C5/C-L1 established. Verdict
filed at shared/handoff/eyal-whatsapp-tos-confirm-2026-07-09.md. Eyal gate leg CLOSED. Remaining:
owner records SHA + ban-risk acceptance in decisions-log at install (2 keystrokes, no Eyal action).

**EA-2 -- CS ticket retention window (last item before CS-0001 owner A1 package; AUD-004).**
Provide the PPL-compliant retention period for CUSTOMER-SUPPORT TICKET SUMMARIES (CS ticket
data, not APS student data). Legal guidance from PPL data-minimisation -- no WebFetch needed.
State three things: the retention period, the PPL basis, and any deletion/minimisation condition.
Write it to C:\Users\Jecki\DEV\shared\handoff\eyal-cs-retention-2026-07-09.md and mark DONE here.
Eco folds it into company/cs/cs-0001-customer-communication-policy.md and the owner A1 package is
then complete.
DONE 2026-07-11: CLOSED. Retention window = 2 years from ticket close date, then delete or
anonymize. Basis: PPL proportionality + purpose-limitation (Amendment 13 minimization); 2 years
covers dispute-resolution justification for routine CS tickets without approaching the 7-year
civil limitation ceiling. Exception: active legal dispute -- retain until resolved + 1 year.
Data-subject rights (access, correction, deletion, objection) mandatory throughout. No separate
consent required (contractual/legitimate-interest basis); must be disclosed in privacy notice
(Item 3). Third-party data in tickets: anonymize at close. Full guidance + CS-0001 insert text
filed at shared/handoff/eyal-cs-retention-2026-07-09.md. CS-0001 can now proceed to owner A1
package once Eco folds retention language into section 8 (per handoff file).

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

### FINANCE LEG (Lital, 2026-06-24)

Status: OPEN -- registration not filed; no spend authorized.

Finance facts and assessment:

Registration cost:
- Rasham fee: est. ILS 2,600 (standard online track, per Eyal legal-leg and T-0034). Exact
  current fee must be confirmed on rasham.justice.gov.il before filing -- fees change. Do not
  commit to the figure without confirming.
- Expedited track: higher fee (amount unknown to me; confirm on Rasham website). Owner A1 to
  choose track.
- Legal counsel (if used instead of self-filing): cost unknown, variable. Must be scoped and
  A1-approved before engaging any counsel.
- All of the above: owner A1 required before any spend.

Share structure / capital:
- Minimum share capital for a Chevra Ba'am (Ltd) under Israeli Companies Law: ILS 1 (nominal).
  A startup is not required to inject real capital at registration beyond the nominal amount.
  Recommended: issue founder shares at par value (1 share = ILS 1 or similar). No large capital
  injection is needed or expected at this stage. This is not a cash expense beyond registration.
- The share structure decision (number of shares, classes, split) is a legal question (Eyal) with
  a tax implication (income recognition on future grants). Lital flags: do not issue shares to any
  party other than the founder without Eyal review and owner A1 -- equity grants have tax
  consequences (Section 102 / tzarot option plans; Israeli tax law; Eyal to guide).

Bank account:
- A business bank account (Hesbon Inyan) requires: Rasham certificate (company registration
  number) + authorized signatories + director ID. Cannot open until Item 1 is complete.
- Cost: depends on bank and account tier. Israeli business accounts typically carry monthly fees
  (range roughly ILS 80-200/month depending on tier and transaction volume; confirm at time of
  opening -- I have no verified current figures). Monthly fee is a recurring expense -> owner A1
  before committing.
- Account is required before any revenue can be received into the company. Unblocked by Item 1.

Bookkeeping / accounting setup:
- Israel requires a registered company to maintain bookkeeping per the Tax Authority's
  bookkeeping regulations (Takanonim). At startup scale a single-entry or double-entry
  spreadsheet may suffice initially; a licensed Israeli accountant (Roh Heshbon) is the
  authoritative guide on which regime applies at our revenue level. I track and report; I do not
  engage or pay an accountant without owner A1.
- Accountant engagement cost: unknown (market rate; typically ILS 500-2,000/month for a small
  tech company depending on scope). Do not commit without owner A1.

Post-registration tax registrations (finance dependency):
- After Rasham cert: must register with Mas Hachnasa (Income Tax Authority) -- administrative,
  no fee I am aware of, but requires owner action.
- Osek Murshe (VAT / Maam) registration: see Item 2. Triggered by registration and revenue
  trajectory. No separate cost to register; VAT collected from customers is remitted to the Tax
  Authority (not a company expense, but a cash-flow obligation to model).

Sequencing from finance perspective:
1. Owner A1 to file with Rasham (ILS 2,600 est. + any counsel cost). Prerequisite for all else.
2. Rasham cert triggers: bank account opening (owner action; monthly fee = A1), Mas Hachnasa
   registration (owner action), Maam/VAT registration (see Item 2).
3. Bank account must exist before first payment can be received.

**A1 required? YES -- every item above involves spend or legal commitment. I do not authorize
any of it. All flagged to owner via Eco.**

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

### FINANCE LEG (Lital, 2026-06-24)

Status: BLOCKED on Item 1 (no registered entity = no invoice can be issued legally).

Finance facts and assessment:

VAT / Maam registration:
- Registration with the VAT authority (Maman) is required once the company is registered
  (Rasham cert is a prerequisite). The Osek Murshe threshold is currently approx.
  ILS 120,000 annual turnover (per Eyal legal-leg; confirm current threshold before first
  invoice -- threshold is updated periodically by the Tax Authority).
- For a B2B tech startup I concur with Eyal: register as Osek Murshe from day one. Reason:
  reclaiming input VAT on company expenses (software, equipment, services) is a real benefit
  even at low early revenue. The registration is free administratively (no fee I am aware of).
- Owner A1 required: VAT registration is an owner action (form 821 or online equivalent;
  requires authorized signatory). Not a cash spend, but a legal-administrative commitment.

Invoicing tool (GreenInvoice or equivalent):
- GreenInvoice is the leading Israeli cloud invoicing platform and the planned vehicle
  (gate-register deferred row). It generates Heshbonit Mas (tax invoices) compliant with
  Israeli Tax Authority requirements including sequential numbering and mandatory fields
  per Eyal's legal-leg.
- Status: DEFERRED in gate-register. Gate-review (Security + Legal = Rambo + Eyal) must run
  before adoption. Any paid tier = A1. Free tier (if available) = A2 gate minimum.
- I flag to owner: GreenInvoice gate-review should be initiated at least 30 days before the
  first paid customer is expected, so invoicing capability is ready at close. I will surface
  this to Eco/jecki when that 30-day window opens.
- Alternative: manual compliant invoice template (no tool) is possible at very low invoice
  volume and is zero cost. Requires Eyal to confirm all mandatory fields are covered. This
  is the fallback if the gate is not complete in time.
- No tool cost authorized until gate passed and owner A1 obtained.

Invoice template and series:
- Invoice number series must be sequential and unbroken (Israeli Tax Authority requirement;
  per Eyal legal-leg). I will set up and maintain the series once a tool is adopted or a
  manual template is confirmed.
- Template design (mandatory fields: entity name, registration number, VAT number, date,
  sequential number, customer details, service description, amount, VAT, total) is A3 for me
  to draft; any customer-facing template requires owner A1 before use (legal commitment per
  Eyal).

Digital invoice reporting:
- Israeli Tax Authority is phasing in mandatory digital invoice reporting (Hatzharot
  Mehacharot). Eyal flagged: confirm current obligation threshold before first invoice.
  This may require an API integration or reporting through an approved platform. I cannot
  confirm the current threshold without either current data or owner providing the current
  regulations text. I flag this as an unknown to confirm at the time of first invoice.

Bank account for payment receipt:
- Same dependency as Item 1: bank account required before revenue can be received.
  Unblocked by Item 1 completion.

Sequencing from finance perspective:
1. Item 1 complete (Rasham cert) -> Maam registration (owner action, admin, no fee).
2. Initiate GreenInvoice gate-review (Rambo + Eyal, A2; any paid tier A1). Do not wait until
   day of first invoice.
3. Invoice template drafted (Lital, A3) -> owner A1 before use.
4. Bank account open (owner action; Item 1 prerequisite).
5. First invoice only after all above are complete.

**A1 required? YES -- Maam registration (owner action), GreenInvoice adoption if paid (spend),
any invoice template issued to a customer (legal commitment). Nothing in this leg is authorized
by me. All flagged to owner via Eco.**

**30-day flag trigger (Lital standing obligation):** I will escalate to Eco and jecki when the
first paid customer is imminent (>= 30 days before expected) so the GreenInvoice gate-review
can be initiated in time.

---

## ITEM 3 -- Privacy and data protection

**Status:** DPA template DRAFTED 2026-06-23 (company/legal/dpa-template.md, v0.1-DRAFT);
awaiting owner A1 review before activation. No customer data collected yet.
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

### FINANCE LEG (Lital, 2026-06-24)

Status: No current spend; cost exposures identified for owner awareness.

Finance facts and assessment:

Data retention cost:
- At current scale (no customers, no data collected): zero ongoing data retention cost.
- When customer data is collected: cloud storage cost depends on volume and provider.
  Too early to estimate meaningfully. I will surface a cost estimate when the product
  and data architecture are defined (Ido / R&D scope).

Cyber/data-incident insurance:
- Israeli law does not mandate specific data-incident insurance. However, Amendment 13
  (per Eyal) raises fine exposure to up to 5% of annual turnover or ILS 5M (whichever is
  higher). For a startup with low/zero revenue today the fine ceiling is effectively ILS 5M.
- Cyber insurance (Bituach Cyber) is available from Israeli and international insurers.
  Cost: highly variable; for a small startup expect USD 2,000-10,000+ per year depending
  on coverage, deductible, and risk profile. I do not have a firm quote. Any insurance
  purchase = spend = owner A1.
- Recommendation to owner: insurance should be evaluated before customer data intake
  begins, not after. I can request a market survey (A3) when triggered; actual purchase
  is owner A1.

DPO appointment:
- The DPO threshold under Amendment 13 depends on data type and volume (per Eyal -- exact
  thresholds depend on the category and scale of data processed; Eyal to confirm at first
  data intake). If the threshold is crossed, a DPO must be appointed.
- DPO appointment cost: an external DPO service in Israel typically costs ILS 2,000-8,000+
  per month depending on scope and provider. I do not have a verified current market rate --
  this is a rough orientation range. Any DPO appointment = spend = owner A1.
- If the threshold is NOT crossed, no DPO cost. Confirm threshold before first data intake
  (Eyal action per Eyal legal-leg item 4).

Sequencing from finance perspective:
- No action needed until Item 1 (registration) and Item 3 (DPA + privacy notice A1) are
  complete. Insurance and DPO evaluation triggered by approach to first customer data intake.
- I will flag insurance and DPO cost estimates to owner before first data intake.

**A1 required? YES -- any insurance purchase, any DPO appointment = spend = owner A1.
I do not authorize either. Flagged to owner via Eco when the trigger event approaches.**

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

### FINANCE LEG (Lital, 2026-06-24)

Status: No action required now. Cost noted for future owner awareness.

Finance assessment:
- ISO 9001 certification cost (orientation estimate only; not a verified quote): for a small
  Israeli tech company, external certification body fees typically range USD 5,000-20,000+
  for initial certification, plus ongoing annual surveillance audits. Internal preparation
  cost (consultant, gap analysis, documentation) is additional. I have no verified current
  Israeli market rate.
- ISO 27001 certification: typically higher cost than 9001 (information security scope is
  broader); same order of magnitude or more.
- Any certification = spend = owner A1. I will produce a cost estimate when a customer
  trigger arises, before any commitment.
- No current action. Dalia monitors for trigger (per Eyal legal-leg).

**A1 required? YES -- when triggered. No action or spend now.**

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

### FINANCE LEG (Lital, 2026-06-24)

Status: OPEN -- migration pending domain approval. No spend authorized yet.

Finance facts and assessment:

Domain registration cost:
- .com domain: approx. USD 10-20/year depending on registrar (GoDaddy, Namecheap, Google
  Domains all cited by Eyal as standard). Not a verified current quote.
- .ai domain: typically USD 50-100+/year (premium TLD). Not a verified current quote.
- .co.il domain: typically USD 20-50/year through an Israeli registrar. Not verified.
- All domain costs are small but non-zero. Any purchase = spend = owner A1 (per Eyal and
  per our budget-0 rule). No amount is too small to require A1 under current policy.

Google Workspace subscription:
- Current account is a free Gmail (eco.synthetic.org@gmail.com). Migration to a custom
  domain requires Google Workspace Business Starter or equivalent.
- Google Workspace Business Starter (as of my knowledge): approx. USD 6/user/month. For a
  1-user account (owner): approx. USD 72/year. This figure may have changed -- confirm
  current pricing at workspace.google.com before committing.
- If the company grows and more users are added, cost scales per seat.
- Any Workspace subscription = recurring spend = owner A1.
- Free alternative: Google offers no free custom-domain Gmail tier for new accounts.
  The custom-domain email requires a paid Workspace plan (or a third-party email host).
  Owner should confirm they want Workspace vs an alternative (e.g. Zoho Mail free tier for
  small teams) before committing.

Sequencing from finance perspective:
1. Owner A1 to purchase domain (small one-time cost; any amount = A1).
2. Owner A1 to subscribe to Google Workspace (recurring cost; A1 required).
3. Both actions unblock company email, which unblocks S-0003 and HIL-003/HIL-004.

**A1 required? YES -- domain purchase and Workspace subscription are both spend. I do not
authorize either. Flagged to owner via Eco.**

---

## ITEM 6 -- Data Processing Agreement (DPA) with Anthropic

**Status:** not formally in place; operating under Anthropic subscription terms
**Required by:** before LLM-processing of any third-party personal data (flagged as
condition in whatsapp-mcp gate row C6, and implied by Amendment 13)
**Owner:** Eyal (Legal)

### LEGAL LEG (Eyal, 2026-06-23) -- UPDATED

Status: OPEN -- WebFetch granted (A1 2026-06-23) but not available at runtime in this
session (tool enabled in role file; not wired in the Claude Code execution context used).
Assessment below is based on Eyal's verified knowledge of Anthropic's published terms
structure (knowledge base through August 2025). A live fetch must confirm before relying
on this for execution. Flag to Eco: live fetch should be re-run once WebFetch is
confirmed working in a Eyal session.

---

ANTHROPIC TERMS STRUCTURE -- VERIFIED KNOWLEDGE BASIS (not live fetch):

Anthropic publishes a layered set of legal documents covering API and Claude Code use:

(A) Usage Policy / Acceptable Use Policy -- governs what you may build or do with the
    service. Not a DPA.

(B) Privacy Policy (anthropic.com/legal/privacy) -- covers Anthropic's own data practices
    as a controller of user/account data. Governs what Anthropic does with account data,
    support data, and similar. Does NOT constitute a data processing agreement for customer
    personal data processed through the API.

(C) API Service Terms / Consumer Terms -- the main subscription contract. As of knowledge
    cutoff (August 2025): the standard consumer/developer subscription terms include
    limited data processing commitments (Anthropic does not train on API inputs by
    default; data retention windows apply). These terms are NOT a full DPA under GDPR
    standard, and are unlikely to satisfy Israeli PPL Amendment 13 processor obligations
    on their own.

(D) Data Processing Addendum (DPA) -- Anthropic publishes a separate DPA for business
    customers. As of knowledge cutoff, this was available at:
    anthropic.com/legal/data-processing-addendum (or linked from the main legal index).
    The DPA is a separate document that must be: (i) reviewed, (ii) accepted/executed by
    an authorized signatory (the account holder), typically via a self-serve acceptance
    flow on the Anthropic console for eligible tiers, or via a negotiated agreement for
    Enterprise. Key provisions in the published DPA (verified knowledge, not live fetch):
    - Processing only on customer instructions: YES, included.
    - Security measures (Article 32 GDPR equivalent): YES, included (Anthropic's security
      obligations described).
    - Breach notification: YES, included (72-hour window referenced, consistent with
      GDPR Art. 33 / Israeli PPL Amendment 13).
    - Sub-processors: YES, included (Anthropic maintains a sub-processor list; customer
      notification of sub-processor changes included).
    - Deletion / return of data: YES, included (data deletion obligations on termination).
    - SCCs / Transfer mechanism: YES -- Anthropic's DPA references EU Standard Contractual
      Clauses (SCCs, 2021 version) for EU/EEA data transfers. Israel has an EU adequacy
      decision (Commission Decision 2011/61/EU). This means EU SCCs are not legally
      required for Israel-to-US transfers per Israeli law, BUT referencing them in the
      DPA is compatible and provides a strong transfer mechanism that covers both EU and
      Israeli data subjects.

TIER CONSIDERATION: The self-serve DPA is available to API customers (paid tier). Claude
Code subscriptions (the current vehicle) may be under the individual/consumer plan rather
than the API business plan. It must be confirmed whether the DPA is accessible under the
current subscription tier, or whether an upgrade to a business/team/enterprise plan is
needed to execute the DPA. This is a Lital (CFO) + owner question (cost = A1).

---

ASSESSMENT AGAINST ISRAELI PPL AMENDMENT 13:

Israeli PPL Amendment 13 obligations for a data processor:
1. Written DPA with each controller: Anthropic's published DPA satisfies this IF executed.
   Standard subscription terms alone do NOT -- they lack the processor-specific obligations
   Amendment 13 requires.
2. Processing only on instructions: covered in the DPA (not in standard terms alone).
3. Security measures: covered in the DPA.
4. Breach notification (72 hours to PPA): Anthropic's DPA covers breach notification to
   the customer. The customer (Eco-Synthetic) then has its own obligation to notify the
   PPA. The DPA does not eliminate our own notification obligation -- it supports it.
5. Sub-processors: covered in the DPA (list + change-notification).
6. Deletion: covered in the DPA.
7. Transfer adequacy: Israel has EU adequacy status. Anthropic's DPA SCCs provide an
   adequate mechanism even though technically not required for Israel. No gap identified.

CONCLUSION:

(b) DPA addendum required -- owner A1 to execute.

Standard Anthropic subscription terms are NOT sufficient on their own to satisfy Israeli
PPL Amendment 13 processor obligations. A formal DPA execution is required before any
third-party personal data is processed through the LLM. Anthropic publishes a DPA; it
must be: (1) confirmed available under current subscription tier (Lital/owner action),
(2) reviewed in its current live text (Eyal WebFetch -- pending runtime fix), and
(3) executed by jecki as account holder (A1 -- legal commitment).

LIVE FETCH CAVEAT: This assessment is based on knowledge through August 2025. Before
jecki executes the DPA, Eyal must confirm the current live text via WebFetch (once
runtime is confirmed) or owner provides the current terms text directly. Terms may have
changed. Do not execute based solely on this memo.

---

Actions required (updated):
1. Eyal: confirm WebFetch works in a live Eyal session; re-fetch
   anthropic.com/legal/data-processing-addendum and anthropic.com/legal to confirm
   current DPA text and tier eligibility. Flag to Eco when done.
2. Lital/owner: confirm current Claude Code subscription tier and whether DPA is
   self-serve accessible, or whether a tier upgrade or enterprise negotiation is needed.
   Upgrade cost is A1. Flag cost estimate to jecki before any commitment.
3. jecki (A1): once Eyal confirms current DPA text and Lital confirms tier: execute
   DPA via Anthropic console (self-serve acceptance flow) or via enterprise process.
   This is a legal commitment -- A1.
4. After DPA execution: Eyal documents the executed DPA reference in this backlog item
   and closes Item 6. This then satisfies the C6 condition in the whatsapp-mcp gate row
   and the Item 3 precondition for real-data use.

**A1 required? YES -- DPA execution commits the company legally. Owner action.**

**RISK LEVEL: MEDIUM-HIGH (unchanged). No third-party personal data should be processed
through the LLM until DPA is executed. Currently no third-party personal data is flowing
-- no active violation. Must be resolved before WhatsApp bridge or any customer-data
workflow goes live.**

### FINANCE LEG (Lital, 2026-06-24)

Status: OPEN -- tier eligibility unconfirmed. Potential upgrade cost flagged to owner.

Finance facts and assessment:

Current subscription tier:
- Current vehicle: Claude Code subscription (per Eyal legal-leg). I do not have confirmed
  visibility into the exact current plan name, tier, or monthly cost for the owner's
  subscription. I cannot verify subscription details from tracked files (credentials/billing
  are outside my file scope). Owner must confirm the current tier directly from the Anthropic
  console or billing email.

DPA tier eligibility question (from Eyal legal-leg):
- Anthropic's DPA (per Eyal's assessment) may be available via a self-serve acceptance flow
  for API business plan customers. Claude Code subscriptions may be on an individual/consumer
  plan that does NOT include DPA access.
- If the current plan does not include DPA access, options are: (a) upgrade to an API
  business/team plan (cost unknown to me -- must confirm on Anthropic's pricing page), or
  (b) negotiate an enterprise agreement (cost: significantly higher; custom pricing).
- Either upgrade path = spend = owner A1. I flag this now so jecki is aware before
  approaching the DPA execution step.

What I can confirm without billing access:
- If the DPA is available via self-serve acceptance on the current tier at no incremental
  cost: zero additional spend. Owner A1 to execute (legal commitment, not spend).
- If a tier upgrade is required: cost amount unknown to me; must be confirmed before
  committing. Any cost = owner A1.

Sequencing from finance perspective:
1. Owner checks current Anthropic plan tier (owner action; Anthropic console or billing).
2. Owner confirms whether DPA self-serve acceptance is available on current tier.
3. If zero-cost DPA available: owner A1 to execute (legal commitment only).
4. If upgrade needed: owner A1 after cost confirmed (spend decision).
5. Eyal reviews current live DPA text via WebFetch once that is confirmed working (per
   Eyal legal-leg Item 6 action 1) before jecki executes.

**A1 required? YES -- DPA execution is a legal commitment (owner action); any tier upgrade
is spend. I do not authorize either. Escalated to Eco/jecki.**

**PRIORITY:** this is a gating item for the WhatsApp bridge and any customer-data LLM
workflow. Per Eyal: MEDIUM-HIGH risk. No third-party personal data should flow through the
LLM until the DPA is executed. Currently no violation (no customer data flowing). Must be
resolved before bridge or customer-data workflow goes live.

---

## Open action items (consolidated)

| # | Owner | Item | Trigger / Deadline | A1 needed? |
|---|-------|------|--------------------|------------|
| 1 | Eyal | Confirm Ltd registration type, current Rasham fee, document list | 30 days before first contract | YES (filing) |
| 2 | Eyal | DPA template DRAFTED (v0.1-DRAFT, 2026-06-23; company/legal/dpa-template.md) -- awaiting owner A1 review | Before first customer data intake | YES (to issue to customer) |
| 3 | Eyal | Draft privacy notice / policy | Before first customer data intake | YES (public-facing document) |
| 4 | Eyal | Confirm DPO obligation threshold (Amendment 13) | Before first customer data intake | NO (research); YES if DPO appointed |
| 5 | Eyal | Review Anthropic DPA / subscription terms | Before whatsapp-mcp goes live; before any personal data in LLM | YES (if executing addendum) |
| 6 | Eyal | Anti-spam compliance review | Before first marketing email | NO (guidance) |
| 7 | Lital | FINANCE: VAT/Maam registration (owner action; Osek Murshe recommended from day 1; DONE: assessed 2026-06-24) | Before first invoice | YES (owner action; registration is admin/free but owner-executed) |
| 8 | Lital | FINANCE: GreenInvoice gate-review initiation (30 days before first paid customer; gate = Rambo + Eyal; any paid tier = A1; DONE: assessed 2026-06-24, flag trigger noted) | Before first paid customer | NO (gate A2); YES if paid tier |
| 9 | Lital | FINANCE: bank account setup post-registration (monthly fees est. ILS 80-200/mo; confirm at opening; DONE: assessed 2026-06-24) | After Item 1 filed | YES (recurring spend) |
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

---

## Lital review log

Last reviewed by Lital: 2026-07-13 (run 6)

Status summary (2026-07-13, run 6):

OVERDUE items: ONE. See top-of-file OVERDUE section.
- ITEM-6 / APS-004 Anthropic config (3 owner A1 steps): target was 2026-07-07; now 6 days past.
  Steps: (1) confirm commercial plan; (2) confirm/enable zero-retention; (3) download DPA copy.
  Owner: jecki. No completion confirmed in any file reviewed.
  Context: APS is on Sprint 8. New migration (20260712000001_arc_session_summary_retain_until)
  and purge scripts (purge-arc-summaries.ts, purge-expired-arc-summaries.mjs) confirm that
  retention logic is being coded. DSR test files (dsr.spec.ts, dsr-live.integration.spec.ts)
  show data-subject rights handling is being built. The compliance gate must close before
  student data enters the LLM pipeline. APS's pace is outrunning the open gate.
  ESCALATED to Eco.

APPROACHING (30-day calendar window, by 2026-08-12):
- No additional items have hard calendar dates within 30 days. All remaining deadlines are
  event-triggered. However, the APS September pilot implies a soft window of ~7-8 weeks.

Soft flags (updated from run 5):
- Item 3 (DPA template v0.1-DRAFT, company/legal/dpa-template.md): drafted 2026-06-23;
  now 20 days pending owner A1 review. APS Sprint 8 is underway. Urgency: HIGH. The team
  is implementing data-subject rights and retention logic in code; if the pilot approaches
  with student data, this gate must close first. Lital re-flags to Eco: owner A1 review
  has been pending 20 days -- scheduling is overdue by attention, not by hard deadline.
- Item 6 (Anthropic DPA compliance-backlog track): now formally OVERDUE (see above).
- APS M16 (transcript retention): New migration arc_session_summary_retain_until (2026-07-12)
  suggests R&D has moved ahead implementing retention dates in the schema. The owner input on
  the retention period is now MORE urgent -- code is being written around an unconfirmed
  compliance decision. Phase 1b notable_mistakes field also still blocked.
- APS M21 (data residency): Israeli region preference still unconfirmed. Sprint 8 indicates
  infrastructure decisions will be needed before the September pilot window.
- No new compliance items identified from file review. No spend authorized.
- Budget-0 policy holds. All A1 items remain with jecki.

Previous run: 2026-07-06 (run 5)

Status summary (2026-07-06, run 5):
- OVERDUE items: NONE. All deadlines remain event-triggered (first customer / first contract /
  first invoice / first data intake). No trigger events have occurred as of this review.
- APPROACHING (30-day calendar window): NONE with hard calendar dates.
- Soft flags (unchanged from run 4; same date):
  - Item 3 (DPA template v0.1-DRAFT, company/legal/dpa-template.md): drafted 2026-06-23;
    now 13 days pending owner A1 review. APS R&D continues to show active file changes (git
    status confirms simulation, engine, and schema modifications). September pilot window is
    approaching; urgency remains elevated. Lital re-flags to Eco: owner A1 scheduling is
    overdue by attention, not by hard deadline.
  - Item 6 (Anthropic DPA): Eyal WebFetch re-fetch still outstanding. APS project active and
    using LLM pipeline (simulation.service.ts, engine changes observed in git status). No
    confirmed student/personal data flowing yet -- no active violation. Must be resolved before
    any student transcript enters LLM pipeline.
  - APS M16 (transcript retention): retention period decision still pending owner input.
    Phase 1b notable_mistakes field blocked. September pilot window narrowing.
  - APS M21 (data residency): Israeli region preference unconfirmed. Must resolve before
    pilot infrastructure is provisioned.
- No new compliance items identified since run 4.
- No spend authorized on any item. Budget-0 policy holds. All A1 items remain with jecki.

Previous run: 2026-07-06 (run 4) -- see archived entry below.

Status summary (2026-07-06, run 4):
- OVERDUE items: NONE. All deadlines remain event-triggered (first customer / first contract /
  first invoice / first data intake). No trigger events have occurred as of this review.
- APPROACHING (30-day calendar window): NONE with hard calendar dates.
- Soft flags (updated urgency):
  - Item 3 (DPA template v0.1-DRAFT, company/legal/dpa-template.md): drafted 2026-06-23;
    now 13 days pending owner A1 review (was 6+ days on 2026-06-29). APS R&D is active;
    if September pilot targets student data, ~60 days remain to resolve this before first
    data intake. Urgency continues to rise. Lital re-flags to Eco: owner A1 review should
    be scheduled without further delay.
  - Item 6 (Anthropic DPA): still outstanding (Eyal WebFetch re-fetch pending). APS project
    creates a concrete pathway to trigger this obligation if Claude/Anthropic used for the
    patient engine or debrief. No personal data flowing -- no active violation. Must be
    resolved before any student transcript enters LLM pipeline.
  - APS M16 (transcript retention): retention period decision still pending owner input.
    Blocks Phase 1b notable_mistakes field (highest-sensitivity PII). If September pilot
    is ~60 days out, this window is shrinking.
  - APS M21 (data residency): Israeli region preference still unconfirmed. Must be resolved
    before pilot infrastructure is provisioned, not at billing time.
- No new compliance items identified since last review (2026-06-29).
- No spend authorized on any item. Budget-0 policy holds. All A1 items remain with jecki.

Previous run: 2026-06-29 (run 3) -- see archived entry below.

Status summary (2026-06-29, run 3):
- OVERDUE items: NONE. All deadlines remain event-triggered (first customer / first contract /
  first invoice / first data intake). No trigger events have occurred as of this review.
- APPROACHING (30-day calendar window): NONE with hard calendar dates.
- Soft flag (escalating urgency): Item 3 (DPA template v0.1-DRAFT, company/legal/dpa-template.md)
  drafted 2026-06-23; now 6+ days pending owner A1 review. APS project R&D docs are active
  (engine architecture, QA plan, UX flows all new 2026-06-29). If APS moves toward a September
  pilot with student data, DPA must be A1-reviewed before any data intake. Urgency increasing.
  Lital flags to Eco: request owner scheduling of A1 review for Item 3.
- Item 6 (Anthropic DPA): MEDIUM-HIGH risk. Eyal WebFetch re-fetch of current DPA text remains
  outstanding. No personal data flowing -- no active violation. APS project creates a new
  pathway to trigger this obligation (if Claude/Anthropic used for patient engine or debriefs).
- APS cost flags (maintained from run 2):
  - M16 (transcript retention): storage cost implications pending R&D data-volume definition.
    Owner input on retention period required (A1 per Eyal) before APS pilot goes live.
  - M21 (data residency): Israeli region hosting carries cost premium; must be quantified at
    architecture time (Ido/Shir), not at billing time. No spend today.
  - Both non-blocking today; must be resolved before APS pilot data goes live.
- No spend authorized on any item. Budget-0 policy holds. All A1 items remain with jecki.

Previous run: 2026-06-29 (run 2) -- see archived entry below.

Status summary (2026-06-29, run 2 -- archived):
- OVERDUE items: NONE. All deadlines are event-triggered (first customer / first contract /
  first invoice / first data intake). No trigger events have occurred as of this review.
- APPROACHING (30-day window): NONE with hard calendar dates.
- Soft flag: Item 3 (privacy DPA template) was drafted by Eyal on 2026-06-23 and is sitting
  at "awaiting owner A1 review." No calendar deadline, but it has been pending 6 days. Flagged
  to Eco for owner awareness -- the AI Patient Simulator project is progressing (new R&D docs
  observed 2026-06-29), so data-intake timelines may be approaching sooner than expected.
- Item 6 (Anthropic DPA): MEDIUM-HIGH risk per Eyal. Eyal's WebFetch re-fetch of current DPA
  text is still outstanding. No personal data flowing today -- no active violation.
- APS cost flags (new, 2026-06-29 run 2 -- from Eyal review log, Lital finance angle):
  - M16 (transcript retention): retention period decision has storage cost implications once
    APS pilot goes live. Lital cannot estimate until R&D defines data volume and provider.
    Owner input needed on retention period (A1 per Eyal). No spend today.
  - M21 (data residency): if Israeli region hosting is chosen, it typically carries a premium
    over US-based cloud regions. Cost delta depends on provider and tier. Lital flags: confirm
    Israeli region requirement before infrastructure is provisioned -- cost differential should
    be quantified at architecture time (Ido/Shir), not at billing time. No spend today.
  - Both M16 and M21 are non-blocking today but must be resolved before APS pilot data goes
    live. No A1 authorized by Lital; all flagged to Eco/jecki.
- No spend authorized on any item. Budget-0 policy holds. All A1 items remain with jecki.

---

## Eyal review log

Last reviewed by Eyal: 2026-06-29

Status summary (2026-06-29) -- scheduled runner, no owner input available:

OVERDUE items: NONE. All backlog deadlines remain event-triggered (first contract / first
invoice / first data intake / first external email). No trigger events have occurred.

APPROACHING (30-day calendar window): NONE with hard calendar dates.

NEW since last Eyal review (2026-06-22): APS-004 gate entries added to gate-register.md
on 2026-06-29. These create concrete Eyal action items:
- M1: OpenAI API LLM provider DPA -- Eyal must confirm Israeli PPL processor obligations
  and training-use opt-out before any OpenAI adoption for APS. Action: live terms fetch
  + assessment. Blocking for APS pilot if OpenAI is the chosen LLM.
- M2: Transactional email service DPA -- Eyal must confirm PPL processor obligations once
  provider is chosen. Provider not yet selected. Non-blocking today; blocking at adoption.
- M16: Transcript retention policy -- Eyal + Lital + owner must agree on retention period
  (PPL minimisation principle). Also blocks "notable_mistakes" Phase 1b field (highest-
  sensitivity PII; PPL student correction/deletion rights review required before Phase 1b).
- M21: Data residency -- Eyal + Lital + owner to confirm Israeli region preference.
  Non-blocking for formative pilot but must be confirmed before pilot data goes live.
- LTI / Canvas / Moodle: DEFERRED from v1 pilot per gate-register APS note. No gate row
  needed for September pilot. Eyal will flag if scope changes.

SOFT FLAGS (existing items, increased urgency):
- Item 3 (DPA template v0.1-DRAFT): drafted 2026-06-23; now 6 days pending owner A1 review.
  AI Patient Simulator project is progressing (R&D docs observed 2026-06-29). If APS moves
  toward a September pilot with student data, the DPA template must be A1-reviewed and in
  place before any data intake. Urgency is rising. Eyal flags to Eco: this item should not
  continue to sit -- request owner scheduling of the A1 review.
- Item 6 (Anthropic DPA): Eyal WebFetch re-fetch of current DPA text remains outstanding
  (pending runtime confirmation). No personal data flowing -- no active violation. However,
  the APS project (if it uses Claude/Anthropic for the patient engine or debrief) would
  trigger this obligation. Must resolve before any student transcript enters an LLM. Eyal
  will re-run WebFetch in a live session when tool is confirmed available.
- Item 5 (Google account migration): Domain purchase and Workspace subscription remain
  deferred (no A1 yet). No customer contact is blocked by this today. Non-urgent until
  first external communication.

A1 ITEMS -- summary for owner (via Eco):
1. Item 3: DPA template v0.1-DRAFT (company/legal/dpa-template.md) -- owner A1 review
   required before any customer data is collected. PENDING 6 DAYS. Request scheduling.
2. Item 6: Anthropic DPA execution -- A1 legal commitment; pending Eyal WebFetch confirm
   of current terms. Eyal will re-fetch and report. Must precede any student/customer data
   in LLM.
3. APS M16 + M21: Owner input required on transcript retention period and data residency
   (Israeli region preference). Not blocking today but needed before APS pilot goes live.
4. APS OpenAI API gate: If OpenAI is chosen as the APS LLM engine, A1 required (paid +
   data egress). Eyal must complete M1 assessment first. Not adopted yet -- no spend.
5. Item 1 (Company registration): A1 required to file. Trigger = 30 days before first
   contract. No contract imminent today, but APS progressing -- owner should be aware this
   lead time is fixed (1-3 business days for Ltd online filing once docs are ready).

NO items have breached a hard deadline. All flags above are preventive.

Run 2 confirmation (2026-06-29): second scheduled-runner pass. No new items vs run 1.
Gate-register cross-check: two Eyal-PENDING rows remain unresolved with no hard deadline
(nspady/google-calendar-mcp; taylorwilsdon/google_workspace_mcp) -- flag to Eco to schedule.
Agent-tool Eco (T-0020) Eyal-PENDING also still open. No overdue gate-register review dates found.
A1 items remain open -- see A1 summary above. Last reviewed by Eyal: 2026-06-29 (run 2).

Run 3 confirmation (2026-06-29): third scheduled-runner pass. No new items vs run 2.
Status: unchanged. No hard deadlines breached. All flags are preventive.

Gate-register cross-check (run 3):
- nspady/google-calendar-mcp: Eyal PENDING -- no hard review date, but unresolved.
- taylorwilsdon/google_workspace_mcp: Eyal PENDING -- no hard review date, but unresolved.
- Agent-tool Eco (T-0020): Eyal PENDING -- no hard review date, but unresolved.
- APS-004 gate rows (OpenAI API, AWS S3, transactional email): PRE-READ only; Eyal live
  terms review required before adoption. Non-blocking today (none adopted). M1 and M2 are
  co-blocking Rambo gate close -- cannot close without Eyal.

A1 items still open (unchanged from run 1/run 2) -- escalating to Eco:
1. Item 3: DPA template v0.1-DRAFT (company/legal/dpa-template.md) -- owner A1 review
   required before any customer data collected. Now 6+ days pending with no scheduling.
   APS project active; urgency rising. REQUEST: Eco schedule owner A1 review.
2. Item 6: Anthropic DPA execution -- A1 legal commitment. Pending Eyal WebFetch confirm
   of current terms. Must precede any student or customer data entering LLM pipeline.
3. APS M16: Transcript retention period -- owner input required (PPL minimisation + cost
   modelling). Blocking Phase 1b notable_mistakes field.
4. APS M21: Data residency (Israeli region) -- owner input required before pilot data live.
5. Item 1: Company registration (Ltd filing) -- A1 required to file. Lead time 1-3 days
   once ready; no contract or invoice is valid without it.

Last reviewed by Eyal: 2026-06-29 (run 3).

---

Run 4 (2026-07-06): weekly scheduled runner. No owner input available.

OVERDUE items: NONE. All backlog deadlines remain event-triggered (first contract / first
invoice / first data intake / first external email). No trigger events have occurred.

APPROACHING (30-day calendar window): NONE with hard calendar dates.

NEAR-DEADLINE (within 24 hours as of 2026-07-06):
- APS Anthropic API config (gate-register APS-004 row, updated 2026-06-30 by Eyal):
  three owner A1 config steps were targeted for 2026-07-07 (before APS Sprint 2):
  (1) confirm account is on commercial plan (DPA applies);
  (2) confirm/enable zero-retention in Anthropic console;
  (3) download and retain a copy of the DPA.
  Eyal legal side is CLEAR-WITH-CONDITIONS (2026-06-30). Owner execution still pending.
  Full review: projects/ai-patient-simulator/docs/anthropic-dpa-review-eyal.md.
  This is the most time-sensitive item. Eco must escalate to jecki today.

NEW since last Eyal review (2026-06-29):
- Anthropic API (APS): CLEAR-WITH-CONDITIONS (Eyal, 2026-06-30). DPA incorporated by
  reference in commercial terms; no-training prohibition confirmed from source.
  Three owner config steps still pending (see NEAR-DEADLINE above).
  This partially addresses compliance-backlog Item 6. Item 6 is NOT fully closed until
  (a) owner confirms commercial plan, (b) zero-retention confirmed/enabled, (c) DPA copy
  retained, and (d) Eyal updates Item 6 status to closed. Item 6 remains OPEN on the
  compliance-backlog track until Eyal can confirm these steps completed in a live session.
- taylorwilsdon/google_workspace_mcp (GR-009): Eyal CLEAR-WITH-CONDITIONS (2026-07-01).
  Base row now closed. MIT clear; Google Workspace ToS for internal single-account use clear.
- Gmail send scope (T-0037/S-0025): Eyal CLEAR-WITH-CONDITIONS (2026-07-01). Gate not
  fully closed -- owner must execute Rambo C-R4 (re-pin) + C-R5 (settings.json update) +
  OAuth re-consent. Send tool not live until those 3 owner actions are done.
- whatsapp-mcp: Eyal CLEAR-WITH-CONDITIONS (2026-07-01). Two hard pre-install owner gates
  remain open: (1) owner records exact commit SHA in decisions-log; (2) formal ban-risk
  acceptance in decisions-log (C5/C-L1).

GATE-REGISTER PENDING (no hard dates -- Eyal action outstanding):
- nspady/google-calendar-mcp: Eyal PENDING since 2026-06-18. MIT expected clear.
  No hard deadline; flagged at run 2 and run 3. Still unresolved as of today.
  Eco should schedule Eyal review for this row in the next available session.
- Agent tool for Eco (T-0020): Eyal PENDING since 2026-06-15 (same subscription,
  no new terms expected). Non-blocking for current operations. Should be resolved.
- OpenAI API (APS M1), AWS S3, transactional email (APS M2): all PRE-READ rows.
  Non-blocking today (none adopted). Eyal live review required before any adoption.

SOFT FLAGS (existing items, urgency unchanged or increasing):
- Item 3 (DPA template v0.1-DRAFT, company/legal/dpa-template.md): drafted 2026-06-23;
  now 13 days pending owner A1 review (same count as Lital run 5; same day). APS R&D
  active (simulation, engine, schema changes in git status). September pilot ~60 days
  out. Urgency is HIGH. Eyal re-flags to Eco: owner A1 scheduling is overdue by attention.
- Item 6 (Anthropic DPA compliance-backlog track): gate-register APS-004 row shows
  Eyal legal analysis complete (2026-06-30). Three owner config steps remain outstanding
  (target was 2026-07-07). Until owner completes steps and Eyal confirms, Item 6 on the
  compliance-backlog track remains OPEN. No personal data confirmed flowing -- no active
  violation. Must be resolved before any student/customer data enters LLM pipeline.
- APS M16 (transcript retention): pending owner input on retention period. Phase 1b
  notable_mistakes field blocked. September pilot window narrowing (~60 days).
- APS M21 (data residency): Israeli region preference unconfirmed. Must be confirmed
  before pilot infrastructure is provisioned.

A1 ITEMS -- summary for owner (via Eco), run 4:
1. APS Anthropic config (3 steps) -- target was 2026-07-07; at/past deadline. URGENT.
   Owner must confirm commercial plan, enable/confirm zero-retention, download DPA copy.
2. Item 3 (DPA template v0.1-DRAFT) -- 13 days pending A1 review; September pilot
   ~60 days out. Owner A1 review required before any customer or student data collected.
3. APS M16 (transcript retention period) -- owner input required (PPL minimisation).
   Blocks Phase 1b notable_mistakes field.
4. APS M21 (data residency) -- owner confirmation of Israeli region preference required
   before pilot infrastructure is provisioned.
5. Item 6 (Anthropic DPA formal close) -- dependent on owner completing APS config steps
   and Eyal confirming in a subsequent session.
6. Item 1 (company registration, Ltd) -- A1 required to file; no contract imminent but
   APS September pilot is approaching; 1-3 business day lead time once docs ready.

NO hard deadlines have been breached (all event-triggered except item 1 near-deadline
above which is past its target date, not a legal hard-stop).

Last reviewed by Eyal: 2026-07-06 (run 4).

---

## ECO-QUEUED ACTION ITEMS FOR EYAL (queued by Eco 2026-07-09)

Placed here because Eyal's scheduled compliance job READS this file (it does not read the
task board). Both items are Read/reason/Write only -- NO WebFetch needed. Do on the next
Eyal run; do not defer to "a tool session." Owner directive 2026-07-09: start-time is NOW,
agent cadence, not the due date.

EYAL-Q1 -- WhatsApp ToS confirm (closes T-0039 remaining item 3):
- Read shared/handoff/shelly-outbox/S-0005-whatsapp-tos-packet-for-eyal-2026-07-02.md
  (Shelly staged the verbatim WhatsApp consumer ToS + Business Terms prohibitions).
- Confirm the packet satisfies your live-ToS item and states a concrete ban-risk basis
  (both docs prohibit unofficial/automated clients + reserve account termination = the
  C5/C-L1 ban-risk the owner formally accepts at install).
- Write a one-line verdict to shared/handoff/eco-eyal-whatsapp-tos-confirm-2026-07-09.md
  so only the two owner keystrokes (record SHA + ban-risk acceptance) remain at install.

EYAL-Q2 -- CS ticket-summary retention window (unblocks CS-0001 / AUD-004 owner A1 package):
- Provide the PPL-compliant retention window for CS ticket summaries (data-minimisation,
  Amendment 13). This is legal guidance from PPL knowledge -- no external fetch required.
- State the window (e.g. "N months after ticket close") + the legal basis, and write it so
  Mike can insert it into company/cs/cs-0001-customer-communication-policy.md before owner A1.
