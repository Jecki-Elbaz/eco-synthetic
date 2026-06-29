# APS-004 Finance Pre-Read -- Gate Document
# Prepared by: Lital (CFO / Finance)
# Date: 2026-06-29
# Task ref: APS-004 (Tool/Legal/privacy pre-read -- Finance leg)
# Owner A1 greenlight: 2026-06-29
# Status: INTERNAL ONLY. Not for external sharing without owner A1.
# HARD CONSTRAINT: budget = 0. All numbers are estimates only. No spend is authorized.
# Every cost item requires owner A1 before any money moves.

---

## 1. Scope

This document covers the PILOT ONLY (1-Sep-2026 target, Gome Gevim College, Israel).
Scope basis: pilot-minimal per requirements-baseline.md (Perry, 2026-06-28) and
viability-assessment-erez.md (Erez, 2026-06-28).

Pilot definition: one institution, 1-3 courses, formative only (no grade sync),
Hebrew + English, secure invite link (no LTI), PostgreSQL + Prisma + JSONB + Redis + S3,
AI patient engine with ground-truth enforcement and dynamic state.

All numbers flagged as ESTIMATE. Unit prices flagged as UNVERIFIED where current pricing
was not confirmed from a live source this session.

---

## 2. Running-Cost Envelope -- External Surface (Monthly Pilot)

### 2.1 LLM / AI API

Key inputs from source docs:
- HLD cost model (Erez, viability-assessment): $2-5 per student per 10 simulations.
- Pilot scale: student count UNKNOWN (Q1.1b open). Erez assumes up to 100 students.
  Requirements-baseline mentions "1-3 courses." Perry says "<200 students" for pilot scale.
- Runtime pipeline (requirements-baseline APS-REQ-057 to APS-REQ-063): each turn runs an
  interaction-analyser pass + patient-response generation. Per simulation: up to 75 turns,
  sliding-window context management, post-session rubric evaluation pass, debrief chat.
- Model routing (APS-REQ-066, Should): cheaper model for lower-complexity turns -- can
  compress cost if implemented. Not confirmed as in pilot-minimal Must scope.
- Prompt caching (APS-REQ-067, Should): also cost-reducing if implemented. Not confirmed Must.

Lital estimate (ORDER OF MAGNITUDE ONLY):

Scenario A -- 50 students, 2 simulations each, no model routing:
- Token cost per simulation: assume 75 turns x ~800 tokens per turn (combined in + out) =
  ~60,000 tokens per simulation. Plus evaluation pass (~5,000 tokens). Total ~65,000 per sim.
- At GPT-4o pricing as rough proxy (UNVERIFIED; confirm current OpenAI pricing before build):
  approximately $0.005-0.015 per 1,000 tokens (input vs output split; unverified).
  ~65,000 tokens x $0.010 average = ~$0.65 per simulation.
- 50 students x 2 sims = 100 simulations x $0.65 = ~$65 in LLM cost.
- Debrief chat adds ~5-10 debrief questions per student. Rough add: 20-40% on top.
  Adjusted: ~$80-90 for a one-month pilot run-through.

Scenario B -- 100 students, 5 simulations each (fuller pilot, multiple courses):
- 100 students x 5 sims = 500 simulations x $0.65 = ~$325 base.
- With debrief add: ~$400-450.
- With teacher dashboard AI queries and rubric auto-generation passes: add $50-100.
  Total: ~$450-550.

Range summary (ESTIMATE; unit prices UNVERIFIED):
- Low end (50 students, 2 sims): $80-100/month of active use.
- Mid (100 students, 5 sims): $450-600/month of active use.
- High-sensitivity driver: if the model used is a premium tier (GPT-4o or Sonnet) for ALL
  turns, costs increase 3-5x vs a mixed/routed stack. Model routing (APS-REQ-066) is
  therefore a meaningful cost lever -- even if it is a "Should" item, it has real budget impact.

Key cost drivers:
- Students x simulations x turns per simulation: dominant variable. Student count still unknown.
- Model tier: premium vs budget routing for each turn.
- Evaluation and debrief: 1-2 additional LLM passes per simulation (post-simulation eval,
  debrief chat). These are smaller but real.
- Context window management: sliding-window summarization (APS-REQ-063) keeps token count
  bounded -- this is a cost-control mechanism built into the design.

ACTION NEEDED (owner A1 to spend): before any AI API key is provisioned or charges incur,
owner must authorize. Estimate above is planning only.

UNVERIFIED: current OpenAI / Anthropic API pricing. Must confirm at time of build.
Multi-model routing (APS-REQ-066) is not yet confirmed as in pilot scope -- if excluded,
all turns hit premium-tier pricing, increasing the estimate above.

### 2.2 Object Storage (S3 or equivalent)

Pilot stores: conversation transcripts (JSONB per turn), StudentPersonaHistory stubs
(schema only, no runtime in pilot per Perry), support ticket metadata, diagnostic logs.
Blobs: voice dictation audio (APS-REQ-046 -- pre-transcription). Audio is transcient if
transcribed and discarded; if retained, adds storage cost.

Estimate at pilot scale (<200 students, 1-3 courses, formative only):
- Text/JSONB data: negligible. PostgreSQL on a small cloud VM covers this.
- S3 for audio blobs: depends on whether audio is retained post-transcription.
  If discarded after transcription: near-zero S3 cost.
  If retained 30 days: rough estimate <5 GB at pilot scale = <$0.15/month (S3 standard).
  UNVERIFIED: confirm retention policy with Eyal (data minimization principle under Israeli
  Privacy Protection Law; Eyal APS-004 lead).
- Backups: one daily snapshot at pilot scale = <$1/month.

Range summary: $0-5/month. Not a material cost driver at pilot scale.

### 2.3 Email Sending

Pilot uses email for: support ticket routing (APS-REQ-107), low-credit-balance alerts
(APS-REQ-147, Should), and access-code delivery on secure invite link (APS-REQ-083 implied).
Volume at pilot scale: very low. 50-200 students receiving invite emails = one batch.
Support emails: occasional, low volume.

Options (gate required before adoption per CLAUDE.md sec 6):
- SendGrid / AWS SES free tier: SendGrid free = 100 emails/day; AWS SES ~ $0.10 per 1,000.
  At pilot scale: effectively $0/month or immaterial.
- UNVERIFIED: current free tier limits and terms for any provider -- must go through gate
  (Rambo + Eyal) before adopting even a "free" email tool. No tool adoption without gate.

Range summary: $0-5/month at pilot scale. Not a material driver.
Gate required before any email provider is adopted -- even free tier.

### 2.4 Infrastructure (Cloud Compute + DB + Redis)

This is the most uncertain line item because the cloud provider and hosting model are not
yet decided (Flag 5 in requirements-baseline.md -- still open; Eyal + Rambo must clear before
infra selection).

For planning purposes, based on pilot scale (<200 students, non-concurrent peak):
- One small VM (2-4 vCPU, 4-8 GB RAM): approximately $20-80/month depending on provider
  and region. UNVERIFIED.
- Managed PostgreSQL (small tier): $15-50/month. Or self-managed on the VM: adds ops burden,
  reduces cost. UNVERIFIED.
- Redis (session / token cache): can run on the same VM at pilot scale. $0 if self-managed;
  $10-30/month if managed. UNVERIFIED.
- Data residency: pilot is Israel-based. If owner requires Israel data residency, provider
  options narrow. AWS has an Israel (Tel Aviv) region; Google Cloud + Azure also present.
  Region choice affects pricing. UNVERIFIED -- flag to Eyal/Rambo for hosting gate.

Range summary: $35-160/month, depending on provider, region, and self-vs-managed choices.
This is the second-largest running cost after AI API.

GATE REQUIRED: cloud provider / hosting model is an infrastructure adoption decision.
Rambo (security) + Eyal (data residency / legal) must clear before committing to a provider.
No spend without owner A1.

### 2.5 Voice Transcription (Dictation -- APS-REQ-046)

Voice dictation (audio -> transcription -> editable text) is in pilot-minimal Must scope.
Transcription requires an API (e.g., OpenAI Whisper API or equivalent).

Whisper API pricing (UNVERIFIED; confirm current): approximately $0.006 per minute.
At pilot scale: 50-100 students x 15 minutes max dictation (APS-REQ-062) x 2-5 simulations
= 1,500 - 7,500 dictation minutes total.
Range: $9-45 for the full pilot.

If using a self-hosted Whisper model on the same VM: $0 incremental (runs on compute already
paid). Self-hosted adds GPU requirement if speed matters; small models run on CPU.

Range summary: $0-50 for pilot duration (not per month -- one-time if pilot is one term).
UNVERIFIED: Whisper pricing and whether self-hosted is feasible on the pilot VM spec.

---

## 3. Consolidated Pilot Running-Cost Range (Monthly, Active Use)

All items flagged as ESTIMATE. Unit prices UNVERIFIED unless stated. Needs owner A1 to spend.

- LLM / AI API: $80-600/month (wide range; dominant driver is students x simulations x model tier)
- Object storage: $0-5/month
- Email sending: $0-5/month
- Voice transcription: $0-50/month (or partial; depends on self-hosted option)
- Infrastructure (compute + DB + Redis): $35-160/month

TOTAL PILOT RUNNING COST RANGE: $115-820/month of active use.

Central rough estimate: $250-400/month for a 100-student formative pilot
with moderate simulation volume (3-5 sims per student) using a mixed or routed model stack.

Confidence: LOW. Student count, session volume, and model choices are all unknown or
unconfirmed. The range will tighten when Q1.1b (student + teacher count) and the model
routing decision are resolved.

Key cost levers the product team controls:
1. Model routing (APS-REQ-066, Should) -- the single biggest lever. Routing simpler turns
   to a cheaper model (Haiku, GPT-3.5 equivalent) cuts the LLM line by 50-70%.
2. Prompt caching (APS-REQ-067, Should) -- meaningful on repeated system-prompt content
   (ground-truth file, rubric) if the API provider supports it.
3. Per-simulation token budget + hard turn cap (APS-REQ-062, Must) -- already in design.
   Prevents runaway costs per session. This is the cost-floor guarantee.
4. Self-hosted Whisper vs API -- removes the transcription variable cost entirely.

---

## 4. Build Cost (Erez Estimate -- Not Lital's Line Item, Surfaced for Context)

From viability-assessment-erez.md (Erez, Section 5.3):
- Engineering (2 engineers, 5-7 months): $80,000-$168,000.
- Supporting items (design, legal, infra, AI API for dev): $5,800-$16,300.
- TOTAL PILOT BUILD: $90,000-$185,000 (central estimate ~$130,000).

Lital notes: this is entirely Erez's estimate for planning. Build cost = engineering spend.
ALL of this is A1 before any commitment is made. Budget = 0.

The $80-160/month running cost is SEPARATE from and much smaller than the build cost.
Running cost only becomes material if the product launches at scale.

---

## 5. Privacy / Compliance Cost Flags

Lital scope: flag cost implications. Legal analysis is Eyal's (APS-004 co-lead). Do not
duplicate Eyal's legal work.

### 5.1 Israeli Privacy Protection Law (IPPL)

Pilot students are Israel-based (confirmed, requirements-baseline LOCKED PILOT FACTS).
IPPL applies. Per APS-004 board entry, Eyal is the lead.

Cost implication flags:
- Database registration: Israeli law may require registering a database holding personal
  information with the Israeli Privacy Protection Authority (PPA). Registration fee: small
  but non-zero (exact current fee UNVERIFIED). Timing: required BEFORE data is collected.
  Flag to Eyal to confirm whether the simulation transcript database triggers registration
  requirement.
- Privacy notice: required under IPPL before collecting PII. Cost: legal drafting time
  (Eyal). No third-party fee expected.
- Data retention: requirements-baseline specifies 12-month retention for StudentPersona
  history (Phase 1b). Retention period must be stated in privacy notice and technically
  enforced. Audit cost at pilot scale: minimal.
- DPO (Data Protection Officer): IPPL does not mandate a DPO in the same way GDPR does,
  but if Israeli regulatory posture requires it, it is a recurring cost item. Eyal to confirm.

PRIORITY FLAG (from Sami APS-002 / board APS-004): the StudentPersonaHistory "notable
student mistakes" field and 12-month retention is the highest-sensitivity PII item in the
design. Schema finalization is blocked on Eyal review. This is Eyal's gate, not Lital's.
Lital flag: if Eyal requires structural data redesign, that is an engineering cost item --
surface to owner before build starts.

### 5.2 Cyber Insurance

At pilot scale (one institution, formative only, no real clinical outcome dependency):
cyber insurance is not an immediate cost trigger in Lital's assessment. However:
- If the pilot stores student PII (name, email, session transcripts) on cloud infra, a
  basic cyber policy is prudent before any student data is ingested.
- Cyber insurance for a pre-revenue Israeli startup: rough range $500-3,000/year (UNVERIFIED;
  market rates vary; coordinate with Eyal + owner before purchasing anything).
- This is A1 to commit. Flag: raise with Eyal and owner before first student data is stored.

### 5.3 Company Registration Prerequisite

T-0034 on the board (Israeli company registration) is ON HOLD by owner directive 2026-06-24.
Lital flag: if Eco-Synthetic signs a design-partner agreement with Gome Gevim College, that
contract requires a legal entity. T-0034 must be unblocked and completed before signing.
This is the owner's personal action (non-delegatable per board). Lital has no cost authority
here; surfacing the dependency to Eco for relay to owner.

---

## 6. Financial Information Still Needed from Adam (via Owner)

Budget envelope and commercial terms (Group 5 in clarifying-questions-for-adam.md) are
unanswered. Lital's framing of what is needed:

Q5.1 (open): Does Adam have a budget for the pilot? Range or direction only needed at this
stage. This is not about Adam's willingness to pay -- it is about whether Eco-Synthetic
can structure a design-partner fee (Option D, Erez recommendation: $5,000-$15,000 pilot fee)
that Adam can absorb institutionally. Without this, the reduced-fee structure is speculative.

Q5.2 (open): Adam's compensation model preference (fixed fee, revenue share, equity).
Erez recommends Option D (reduced fee + commercial commitment). Lital flag: equity or
IP-split would change the financial model entirely and would require a different financial
analysis. Owner must decide before any terms are discussed.

Q5.3 (open): Who bears the AI API cost during the pilot? Three options:
- Eco-Synthetic absorbs it: running cost $80-600/month added to our burn. A1 to commit.
- Adam / institution pays a cost-plus top-up: requires invoicing capability (GreenInvoice
  gate not yet started; T-0034 not yet complete). Not feasible at pilot start unless
  company registration is resolved.
- Rolled into the pilot fee: simplest. Adam pays a flat pilot fee; API cost is our internal
  line item covered by that fee. Recommended.

Q5.4 (open, P3): Long-term per-student SaaS pricing. Not needed for pilot financial model
but needed before any commercial conversion commitment is made. HLD suggests $15-40/student/
year; Erez used $30 as the working number. Gross margin on AI API at $30 pricing: ~80-90%
per Erez. Lital has not independently verified this -- it depends on model routing actually
being implemented and volume scaling.

Q1.1b (open): Student + teacher count for the Sep cohort. This is the single input that
most narrows the running-cost range. Without it, the $115-820/month range cannot be tightened.
Lital recommends prioritizing this question.

Q9.2 (open): Sessions per student per course + course duration. Together with Q1.1b, these
two numbers give the total simulation volume for the pilot -- the basis for projecting total
AI API cost for the full pilot period (not just per month).

---

## 7. Items Requiring Owner A1 Before Any Spend

The following all require owner A1 (budget = 0; Lital tracks and reports only):

1. Any AI API account opened or charged (OpenAI, Anthropic, or other).
2. Any cloud hosting committed (AWS, GCP, Azure, or other) -- also requires Rambo + Eyal
   gate before provider is selected (data residency + security).
3. Any email sending service adopted -- even free tier requires Rambo + Eyal gate first.
4. Any transcription API adopted (e.g., Whisper API) -- gate required.
5. Design-partner pilot fee structure (any fee charged to or received from Adam).
6. Cyber insurance (if pursued -- Eyal to advise on timing).
7. Israeli company registration fee (~ILS 2,600 per T-0034 -- owner personal action).

---

## 8. Open Flags for Eco (to Route as Appropriate)

- FLAG-F1: Student count (Q1.1b) is the highest-priority financial unknown. Route to owner
  for relay to Adam. Lital cannot size the running cost meaningfully without it.
- FLAG-F2: Model routing (APS-REQ-066) is a Should item in pilot-minimal scope but has
  significant cost impact. Perry / Ido should confirm whether it is in the 1-Sep scope.
  If not, flag the cost impact to owner.
- FLAG-F3: T-0034 (company registration) must be resolved before any design-partner contract
  is signed. Owner holds the action. Lital flags the dependency; timing is owner's call.
- FLAG-F4: Who bears AI API cost during the pilot (Q5.3) needs an answer before build
  starts. Recommend rolling into the pilot fee. Owner + Eyal to resolve in partner terms.
- FLAG-F5: Cloud hosting gate (Rambo + Eyal on data residency) must complete before any
  infra is provisioned. This is on the APS-004 critical path.
- FLAG-F6: Whisper / transcription: self-hosted on pilot VM vs API -- a small but cleanly
  bounded decision. Ido to advise on feasibility (APS-005). If API, gate required.
- FLAG-F7: Cyber insurance timing -- raise with Eyal before first student data is stored.

---

## 9. What Lital Cannot Determine Without More Input

- Exact AI API unit costs: current provider pricing is UNVERIFIED in this session. Must
  confirm from provider pricing pages at time of build.
- Exact student session volume: Q1.1b and Q9.2 are unanswered. Range will not tighten
  until answered.
- Cloud hosting cost: depends on provider, region, and self-vs-managed choices -- all
  unresolved pending the Eyal/Rambo hosting gate.
- Any cost implications of Israeli IPPL database registration: Eyal must confirm whether
  the simulation database triggers the registration requirement and its current fee.
- Whether Continuing Persona runtime is in the Sep pilot: if Adam requires it (Q9.1),
  the data volume and API call pattern change. Perry recommends deferring; but if it is
  included, add 15-30% to LLM estimate.

---

*All costs are estimates. All unit prices are UNVERIFIED unless stated. Nothing in this
document authorizes any spend. All spend is A1 (owner). Lital tracks and reports only.*

*Coordination note: Eyal (APS-004 co-lead) owns the legal / privacy analysis. Lital
surfaces cost implications of compliance requirements but does not duplicate Eyal's
legal determinations.*
