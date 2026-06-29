# APS-004 -- Legal and Privacy Pre-Read
# Author: Eyal (Legal, L3)
# Date: 2026-06-29
# Status: PRE-READ ONLY -- not a gate clearance; no tool is adopted by this document.
# Task: APS-004 | Owner A1 greenlight: 2026-06-29 | Scope: Israeli pilot only (NOT GDPR)
# Not for external sharing without owner A1.

---

## SCOPE BOUNDARY (read first)

Pilot students are Israel-based (Gome Gevim College, confirmed in adam-pilot-readiness-answers.md Q5).
Privacy baseline: Israeli Privacy Protection Law (PPL) 5741-1981 + Amendment 13 (2023, in force 2025).
GDPR does NOT apply to this pilot. If international students or EU-accessed data are added later,
GDPR applicability must be re-assessed before that phase goes live. That is an out-of-scope flag,
not a current obligation.

---

## 1. PRIORITY ITEM -- StudentPersonaHistory "notable student mistakes" field + 12-month retention

Source: sme-domain-assessment.md s. 9.5.3; requirements-baseline.md APS-REQ-154/APS-REQ-160.

### Sensitivity classification

This is the highest-sensitivity personal data point in the platform. Rationale:

- It is a named, identified individual's (the student's) behavioural performance record.
- It records failure specifically -- not just activity, but mistakes made during professional
  training that the student may not know persists beyond a session.
- Under Israeli PPL, any data that identifies or can identify an individual is personal data.
  Named students + their logged clinical errors = personal data. No ambiguity.
- The full StudentPersonaHistory field set (session summaries, formulation, goals, homework,
  symptom change, alliance level, notable mistakes, avoidance/resistance, themes, engagement
  shifts) is a detailed behavioural and performance profile of an identifiable individual.
  Combined, it is sensitive personal data even though it is about simulated clinical content.
  The "not a real clinical record" label does not change its status as personal data about
  a real student under Israeli law.

### Retention justification and minimization

12-month per-student-persona retention (APS-REQ-160) is the maximum the design currently proposes.
That retention period requires a written justification. None is specified in the requirements
baseline. Required before the schema is finalized:

(a) State the legitimate purpose for 12-month retention of the "notable mistakes" field
    specifically. Formative practice and supervisor review are plausible purposes for session
    summaries; 12-month retention of verbatim mistake records requires a stronger justification.

(b) Assess whether data minimization requires a shorter retention window, an aggregated format
    (pattern summary rather than verbatim mistake records), or restricted access controls for
    the mistakes field as distinct from the broader history.

(c) The mistakes field in particular should be evaluated for a shorter default retention window
    than 12 months, or should default to the end of the course/academic year, whichever is
    shorter. 12 months for a pilot cohort that may run only 8-10 weeks is not minimized.

(d) APS-REQ-158 (reset) and APS-REQ-159 (fork): if a lecturer resets a student's history,
    does the pre-reset mistakes log persist in a backup or audit trail? If yes, the student
    cannot effectively exercise deletion rights (see below). The schema design must address
    whether reset means deletion of the original record or archival. This needs to be decided
    before build.

### Schema must-change before pilot

BLOCKING. The following must be decided and documented before the StudentPersonaHistory schema
is finalized (even as a stub for Phase 1b):

1. Retention period for the "notable mistakes" field must be defined and justified -- not just
   defaulted to 12 months. Recommend: end of academic year or course completion + 90 days,
   configurable per institution with a documented maximum.

2. Access control for the mistakes field must be specified as lecturer/supervisor-only.
   The field must NOT be exportable in raw form, must NOT be visible to support staff
   (consistent with APS-REQ-018), and must NOT be shared across institutions under any
   circumstance.

3. The "not a clinical record" boundary (APS-REQ-161) is educationally correct but does NOT
   shield the history from Israeli privacy law. The student still has data-subject rights
   (access, correction, deletion) under Israeli PPL over their own performance record.
   The platform must design a student data-subject rights pathway before collecting this data.

4. Model training prohibition: if any StudentPersonaHistory data -- including mistakes fields
   -- is ever used to fine-tune or improve any AI model, explicit informed consent from each
   identified student is required before any such use. This is a hard requirement under Israeli
   PPL. It is not addressable by a general platform privacy notice. See APS-REQ item flagged
   by Sami (sme-domain-assessment.md s. 6.3).

### Consent requirement for pilot

Pilot students must provide informed consent before their simulation data (including the
StudentPersonaHistory record) is collected and retained. The consent must:
- Identify what data is collected, how long it is retained, and who can access it.
- Identify the platform (Eco-Synthetic) as the data processor and the institution
  (Gome Gevim College) as the data controller.
- State that data is NOT used for AI model training without separate consent.
- Be in Hebrew (pilot language) and written in plain language.

This consent cannot be buried in general terms of service. It must be an explicit,
affirmative act before the first simulation session is started. The institution (Gome Gevim)
is the data controller -- the platform delivers the consent mechanism; the institution
determines its required content under its own academic and regulatory framework.
Eco-Synthetic cannot determine the institution's consent content -- it can only build the
mechanism and provide a template.

OPEN QUESTION (must resolve via owner relay to Adam): does Gome Gevim College have its own
student data processing procedures that govern this data? The institution's academic
governance team, not the platform, owns the student consent process. The platform must
be designed to plug into it, not replace it.

---

## 2. Israeli Privacy Protection Law -- Applicability Assessment

### 2.1 Applicable law

Israeli PPL 5741-1981 + Amendment 13 (in force 2025) applies. Amendment 13 key additions:
- Enhanced breach notification (72-hour window to the Privacy Protection Authority, PPA).
- Mandatory Data Protection Officer (DPO) for certain processors (threshold: depends on
  data type and volume; must be confirmed at first-data-intake for the pilot scale).
- Stricter consent requirements.
- Higher fines: up to 5% annual turnover or ILS 5M (whichever is higher).
- New security-measure obligations for data processors.

### 2.2 Data types in scope

All of the following are personal data under Israeli PPL for the pilot:

| Data type | Sensitivity | Notes |
|-----------|-------------|-------|
| Student identity (name, email, login) | Standard personal data | Collected at registration |
| Therapy-skill performance scores | Sensitive personal data | Professional performance record |
| Session transcripts | Sensitive personal data | Contains student clinical dialogue |
| Persona histories (StudentPersonaHistory) | Sensitive personal data | Behavioural record; see Item 1 above |
| "Notable student mistakes" field | Highest sensitivity (Sami flag confirmed by Eyal) | Failure record; access controls required |
| Risk/ethics flags | Sensitive personal data | May contain welfare-related signals |
| Clinical notes / formulation panel (APS-REQ-053) | Sensitive personal data | Student's own clinical reasoning |

### 2.3 Role classification: controller vs processor

Gome Gevim College is the DATA CONTROLLER for student data (the institution determines the
purpose and means of collecting student performance data in its educational programmes).

Eco-Synthetic is the DATA PROCESSOR (processes data on behalf of the institution, on its
instructions, through the platform).

Consequence: a written Data Processing Agreement (DPA) between Eco-Synthetic and
Gome Gevim College is required under Amendment 13 BEFORE the pilot goes live. This is
not optional. The platform may not collect or process student personal data without a
signed DPA with the institution.

The DPA template at company/legal/dpa-template.md (v0.1-DRAFT, awaiting owner A1) is the
starting point. It was drafted for general use. A pilot-specific DPA covering the data types
in section 2.2 above must be prepared for Gome Gevim. This is an A1 action -- the DPA
commits the company legally. Owner must approve before it is sent to the institution.
See compliance-backlog.md Item 3.

### 2.4 Database registration

Under PPL Amendment 13, the database registration requirement that previously covered most
databases has been substantially narrowed. The new framework focuses on security measures
and DPO thresholds rather than mandatory filing for all databases. My current knowledge
base (through August 2025) covers Amendment 13's general structure, but the exact current
database registration thresholds for an educational performance database of this type
require confirmation against the current Regulations before the pilot collects data.

FLAGGED UNKNOWN: I cannot state definitively whether the APS pilot database requires
registration with the Registrar of Databases under the current Amendment 13 regulations
without confirming the applicable thresholds. This is a flag for local counsel review,
not a guess. Recommend: Eyal fetches current PPA guidance or engages local counsel to
confirm before pilot data collection begins. This is a low-cost confirm, not a
showstopper, but it cannot be skipped.

### 2.5 DPO obligation

Amendment 13 introduces a DPO appointment requirement above certain thresholds (data type
and volume dependent). At pilot scale (one institution, 1-3 courses, likely under 200
students), the threshold may not be triggered. However, the pilot data includes sensitive
personal data (performance records, clinical training records). The DPO threshold for
sensitive categories under Amendment 13 must be confirmed against the actual pilot scope
before any data is collected. Flagged to Eco: confirm DPO threshold with local counsel or
current PPA guidance before pilot launch. If the threshold is crossed, a DPO appointment
is required before launch (this is a cost item -- A1).

### 2.6 Student data-subject rights

Under Israeli PPL, data subjects (the students) have:
- Right to know what personal data is held about them.
- Right to access their own data.
- Right to correct inaccurate data.
- Right to request deletion in certain circumstances.

The platform must have a documented and operational pathway for students to exercise these
rights before the pilot collects data. This is not a Phase 2 item -- it is a pre-launch
requirement under Israeli law.

The "notable mistakes" field creates an edge case: if a student requests deletion of their
performance record after a course, the platform must be able to comply. The reset/fork logic
(APS-REQ-158/159) must not block a valid deletion request by leaving data in archival states
the student cannot access.

---

## 3. External Tool Terms -- Pre-Read Posture

This section covers the external surface tools identified for the platform. NONE of these
are cleared for adoption by this document. This is a terms-posture pre-read only.
Gate clearance (Rambo security + Eyal legal terms + Eco A2) is required before any tool
is adopted or used with student data.

### 3.1 OpenAI / LLM provider (primary AI patient engine)

The platform's AI patient, interaction analyser, and evaluation engine require an LLM
provider. The HLD implies OpenAI (based on the architecture deck). OpenAI is currently in
the gate-register as DEFERRED (data egress + cost, A1 required).

Terms posture (based on Eyal's knowledge through August 2025; live fetch required before
adoption):

(a) OpenAI Data Processing: OpenAI publishes an API Data Processing Addendum (DPA) for
    business customers (platform.openai.com/legal). The enterprise/API tier includes a DPA
    that covers processing-only-on-instructions, security measures, and sub-processor
    disclosure -- broadly analogous to what is required under Amendment 13. The free tier
    and consumer-facing ChatGPT do NOT include business DPA terms.

(b) Training-use opt-out: OpenAI's API terms (as of August 2025) state that API inputs are
    NOT used to train models by default for API customers (distinct from ChatGPT). This is
    a critical requirement for the APS platform -- student session transcripts and
    performance data must not be used to train any external model. The API DPA / terms of
    service must be confirmed to include this protection before adoption.

(c) Data residency: OpenAI's default data processing is US-based. For the Israeli pilot,
    data residency outside Israel is permissible under Israeli PPL (Israel is not an
    EU-GDPR jurisdiction requiring explicit transfer mechanisms), but the DPA must still
    cover security and deletion obligations regardless of where processing occurs. If the
    institution (Gome Gevim) has its own data residency requirements (some Israeli
    educational institutions are subject to Israeli Ministry of Education data requirements),
    that must be confirmed with Adam via owner relay.

(d) Sub-processor disclosure: any sub-processors OpenAI uses for API processing must be
    disclosed. This feeds into Eco-Synthetic's own DPA with Gome Gevim (as our
    sub-processor list must include OpenAI).

TERMS BLOCKER ASSESSMENT: potential blocker on training-use opt-out and DPA tier
requirement. Not confirmed as a blocker until live fetch. Flag to Rambo + Eco: OpenAI
adoption must include live DPA review + training opt-out confirmation before first
student data is processed.

Anthropic DPA parallel: the same analysis applies to Anthropic if Anthropic's API is used
as the LLM provider (current internal model). Compliance-backlog Item 6 (DPA with
Anthropic) must be executed before APS student data flows through any Anthropic API call.
This is already flagged on the backlog. It is now linked to APS-004 as a hard dependency.

### 3.2 Object storage (student transcripts, PatientStateLog, StudentPersonaHistory)

No specific storage provider has been identified in the requirements baseline. The HLD
references S3 (AWS Simple Storage Service). No gate row exists for AWS S3.

Terms posture:
- AWS S3 has a published Data Processing Addendum (AWS GDPR DPA, which also covers
  non-EU processing scenarios). AWS S3 is a major platform with well-established terms
  for data processor obligations.
- Key requirement: the AWS DPA (or equivalent for any chosen provider) must be in place
  before student personal data is stored. AWS DPAs are typically executed as part of
  the AWS account setup for business customers.
- Data residency: AWS region selection matters. An AWS eu-west-1 (Ireland) or similar
  EU region would be appropriate for Israeli data from a latency and adequacy standpoint.
  An AWS region that is not covered by the Amendment 13 security requirements would
  require additional contractual safeguards. The exact region selection is an Ido /
  R&D decision but Eyal must confirm the DPA covers it.
- If the owner already has an AWS account with a DPA in place (from another project),
  that existing DPA must be confirmed to cover the APS data types and the Eco-Synthetic
  entity (once registered) as the contracting party.

TERMS POSTURE: expected-clear once live review confirms DPA coverage and training/processing
prohibitions. Not adopted; gate required (Rambo security + Eyal live terms review + A2/A1).

### 3.3 Email sender (transactional email for invite links, notifications)

No email provider is specified in the requirements baseline. APS-REQ-107 references email
escalation for support. APS-REQ-005 (secure invite link mode) requires email delivery.

Common candidates: SendGrid, Postmark, Amazon SES, Mailgun.

Terms posture:
- All major transactional email providers publish terms covering data processing for
  email send events. The email metadata (student name, email address, invite link)
  is personal data under Israeli PPL and must be covered by the provider's DPA.
- Key requirements: email provider must not use student email addresses for its own
  marketing or profiling; DPA must cover deletion; provider's security measures must
  meet Amendment 13 standards.
- Israeli anti-spam law (Anti-Spam Law, Communications Law Amendment): transactional
  emails (system-generated invite links, academic notifications) are generally not
  subject to the same opt-in requirements as commercial marketing emails. Confirm at
  implementation that the email content is purely transactional. Any marketing or
  promotional content sent to students via email requires opt-in and an unsubscribe
  mechanism under Israeli law.

TERMS POSTURE: standard; expected-clear once provider is chosen and DPA confirmed.
No gate blocker anticipated. Gate still required before adoption.

### 3.4 Scope note on tools not yet identified

The requirements baseline identifies additional infrastructure (Redis for session state,
PostgreSQL hosting). Each platform-level hosting provider that processes student personal
data requires its own DPA coverage. This is a general obligation, not a separate gate row
per provider -- it is addressed through the master DPA with the institution (which lists
Eco-Synthetic's sub-processors) and Eco-Synthetic's DPA with each sub-processor.

---

## 4. Design-Partner Legal Note (Adam -- commercial terms)

Noted and not drafted. Commercial terms with Adam (reduced fee, equity, IP split -- per
discovery-brief.md s. 3) are A1 + Legal and are out of scope for this pre-read. No terms
are drafted here. Before any term sheet, heads of agreement, or similar document is
shared with Adam, Eyal must review and owner A1 must approve. This is flagged to Eco
as a standing gate item for the commercial leg of APS.

---

## 5. Items Requiring Owner A1

| # | Item | Why A1 |
|---|------|--------|
| A1-1 | DPA between Eco-Synthetic and Gome Gevim College (pilot DPA) | Legal commitment by the company |
| A1-2 | Privacy notice for the APS pilot (student-facing) | Public-facing legal document |
| A1-3 | Execute Anthropic DPA (if student data flows through Anthropic API) | Legal commitment; backlog Item 6 |
| A1-4 | Any commercial / design-partner terms with Adam | Legal commitment; IP / equity implications |
| A1-5 | DPO appointment if threshold is confirmed crossed | Spend + legal obligation |
| A1-6 | Any student data used for model training -- NO, without explicit per-student consent first | Hard PPL requirement; A1 before any such use |

---

## 6. Items Requiring Local Counsel (flagged unknowns -- do not guess)

| # | Unknown | Why local counsel |
|---|---------|-------------------|
| LC-1 | Database registration threshold under Amendment 13 for the APS pilot database type | Current regulations require confirmation against actual data type + volume; Eyal cannot confirm from knowledge base alone |
| LC-2 | DPO appointment threshold for sensitive educational performance data at pilot scale | Amendment 13 DPO thresholds for this data category require current PPA guidance or counsel |
| LC-3 | Whether Gome Gevim College's own academic data regulations impose requirements on the platform | Institutional academic data law (Israeli Ministry of Education or accreditation body requirements) is outside Eyal's current confirmed knowledge |
| LC-4 | Adequacy of the pilot-scale DPA template for Israeli PPL Amendment 13 (once a draft is prepared for Gome Gevim) | Any DPA issued to a customer requires legal review; Eyal drafts; counsel confirms if any unusual data types are present |

Cost of local counsel items: A1 required (spend = 0 budget rule). Each LC item to be
presented to Eco -> jecki before engaging counsel.

---

## 7. Summary Verdicts for Eco

### StudentPersonaHistory PII verdict

BLOCKING pre-read finding. The "notable student mistakes" field + 12-month blanket
retention cannot proceed to build (even as a schema stub) without the following being
decided and documented:

1. Retention period: define and justify -- do NOT default to 12 months. Recommend
   end-of-course + 90 days as the pilot default.
2. Access controls: lecturer/supervisor only; not exportable in raw form; no cross-
   institution sharing.
3. Student data-subject rights pathway: must exist before first data is collected.
4. Model training prohibition: hard requirement; no consent = no use.
5. Reset/fork deletion semantics: must be specified before build.

These are schema design decisions that Eyal and Perry must align on before Ido finalizes
the data model, even as a stub.

### Consent and registration for pilot

Two hard requirements before the pilot goes live:
1. DPA with Gome Gevim College (written, signed, A1). Template to be prepared by Eyal;
   owner approves before sending.
2. Informed consent mechanism for pilot students (in Hebrew; institution-owned content;
   platform delivers the mechanism). Must be in place before first simulation session.

Two flagged unknowns requiring confirmation (local counsel or PPA guidance; not guesses):
- Database registration obligation under Amendment 13.
- DPO threshold at pilot scale.

### External tool terms blockers

One hard dependency already on the compliance backlog:
- Anthropic DPA (backlog Item 6) must be executed before APS student data flows through
  Anthropic's API. This is a pre-existing backlog item now elevated to APS-blocking status.

Pending gate (not adopted, not blocked -- just unreviewed):
- OpenAI: terms posture expected-workable; live fetch + training-opt-out confirmation
  required at gate. Not a current blocker because no tool is adopted.
- Object storage (AWS S3 or equivalent): DPA posture expected-workable; standard
  sub-processor arrangement; not blocking until provider is chosen.
- Email sender: standard transactional terms; not blocking.

### What needs owner A1

Six items listed in Section 5 above. None can proceed without owner A1. The two time-
critical items (DPA with Gome Gevim + privacy notice) must be completed before the pilot
goes live (1 September 2026 target). Given company registration is also a prerequisite for
signing contracts (compliance-backlog Item 1), the registration-then-DPA sequence must
start NOW if the September date is to be met.

---

## 8. Connection to Compliance Backlog

This pre-read adds the following dependencies to existing backlog items:

- Item 3 (Privacy and data protection): APS pilot DPA with Gome Gevim is the first
  real activation of the DPA template. Template must be finalized and A1-approved
  before September pilot goes live.
- Item 6 (Anthropic DPA): now APS-blocking. Elevated from MEDIUM-HIGH to HIGH risk
  given the September pilot timeline. Owner action required.
- Item 1 (Company registration): must be complete before a DPA can be signed with
  Gome Gevim College. T-0034 is on hold by owner directive. If September pilot is real,
  registration must be unblocked. Eco must surface this to owner immediately.

---

## Document control

Pre-read status. No tools are cleared. No legal advice is given to Adam or the institution.
All content is internal. Not for external sharing without owner A1.
Next step: Eco relays verdicts to owner. Owner decides which A1 items to unblock.
Eyal available for DPA template work on owner instruction.
