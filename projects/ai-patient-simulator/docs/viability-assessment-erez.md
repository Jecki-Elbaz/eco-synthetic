# Viability Assessment -- AI Patient Simulator
**Prepared by:** Erez (Investor / IRB Lead), Eco-Synthetic Owner Office
**Date:** 2026-06-28
**Task ref:** APS-003 (Discovery + viability, parallel workstream)
**Status:** INTERNAL ONLY -- not for external distribution without owner A1
**Approval gate:** A1 (jecki decides; Erez recommends only)

---

## 1. Executive Summary and Recommendation

**Recommendation: CONDITIONAL-GO**

The AI Patient Simulator addresses a real, underserved training gap -- psychotherapy /
counselling / LI-CBT / ACT programmes lack scalable, standardised, on-demand practice tools --
and the market window is opening now as LLM capability matures and NHS England / equivalent
bodies scale up trainee throughput. The product concept is well-defined (a 71-page HLD is
unusual rigour for early discovery), the AI cost-per-student economics are viable, and the
technology stack (Next.js + NestJS + PostgreSQL + LTI 1.3) is within our build capability.

The conditions that must be met before committing build resources:

1. Adam's institution is confirmed as the pilot site with at least 20 active students and a
   signed design-partner agreement that protects our IP.
2. A stripped-down Scope 1 (not the full 71-page MVP) is agreed: core simulation loop,
   Canvas LTI, rubric eval, and teacher dashboard. Everything else is Phase 2+.
3. Commercial pricing hypothesis is validated: one comparable institution must confirm
   willingness to pay a per-student SaaS fee in the range of $15-40/student/year before
   we build past pilot.
4. Legal and privacy gate cleared by Eyal + Rambo: student clinical transcript data,
   LTI PII flow, Israeli/GDPR data-residency posture.

Without condition 1 and 2, the build scope is too large and the revenue path is too
speculative for the current stage.

---

## 2. Market Analysis

### 2.1 Global Market

The global medical / healthcare simulation market was valued at approximately $3.0 billion
in 2024 and is projected to reach $7.23 billion by 2030 at a CAGR of roughly 15-16%
[source: MarketsandMarkets, 2025]. A narrower measure -- the virtual patient simulation
segment -- was valued at ~$4.7 billion in 2024 and is projected at ~$10.3 billion by
2032 at ~10.4% CAGR [source: SkyQuesttt, 2025].

These figures cover the broad healthcare simulation market (surgical, nursing, emergency,
clinical communication). The psychotherapy / counselling / mental-health training
sub-segment is not separately quantified in publicly available reports -- this is an
assumption-flagged gap.

**Working assumption (not evidenced):** Mental health / psychotherapy training simulation
is a sub-segment, probably 3-7% of the virtual patient simulation total based on the share
of mental health in overall clinical training spend. This implies a serviceable addressable
market (global) in the range of $140-700 million in 2024, growing at similar or faster
rates given the structural shortage of clinical training placements in this specialty.
Confidence: LOW. A commissioned market report would sharpen this. We do not have one.

### 2.2 UK / NHS Talking Therapies (Primary Target Beachhead)

The most concrete near-term opportunity is the UK NHS Talking Therapies (formerly IAPT)
training pipeline:

- NHS England targets delivery of therapy to 915,000 people per year by 2028/29, requiring
  continued growth in trainee Psychological Wellbeing Practitioners (PWPs) and High
  Intensity Therapists [source: NHS England workforce page, 2025].
- The 2025 NHS workforce census (March 2024 data) shows an 18% increase in counsellors and
  19% increase in psychotherapists year-on-year in NHS settings [source: BACP, May 2025].
- NHS Long Term Workforce Plan projects 24,000-26,000 additional psychological professions
  posts needed by 2037 [source: NHS England].
- LI-CBT / PWP training is delivered across ~20 UK universities (UCL, Sheffield, Reading,
  Southampton, Newcastle, and others) with new intakes twice per year.

**Conservative SAM estimate for UK university LI-CBT/IAPT programmes:** If 30 programmes
average 40 trainees per cohort, two intakes per year = ~2,400 active trainees at any time.
At $30-50/student/year SaaS pricing, that is $72,000-$120,000 ARR at full UK penetration.
This is a viable beachhead but not a large number on its own. The platform needs to expand
to: (a) all counselling / psychotherapy degrees (not just NHS-funded), (b) Israel, and
(c) private training providers.

Confidence on SAM: LOW-MEDIUM. Numbers are derived from public workforce data, not a
customer survey.

### 2.3 Israel Market

Israel has a $1.2 billion EdTech market overall [source: KenResearch, cited by
itrade.gov.il]. Mental health professional training is delivered through universities and
private colleges. Post-October 2023, mental health capacity has been a stated government
priority. Hebrew / Arabic multilingual support is a structural differentiator here --
almost no competitors offer it natively.

Specific data on the Israeli psychotherapy training programme market (number of trainees,
current tools used) was not found in public sources. This is a data gap. Adam's
institution, if in Israel, would be our first data point.

### 2.4 Who Buys and How

**Primary buyers:**
- University programme managers / deans who control clinical training budgets.
- NHS Talking Therapies service managers who fund and place trainees.
- Private counselling / psychotherapy colleges.

**Budget mechanism:** In the UK, training budgets are centrally funded by NHS England for
Talking Therapies trainees; universities hold the procurement relationship. Outside
NHS-funded routes, programmes operate on student fees and institutional budgets. Typical
EdTech procurement cycles in UK higher education: 3-12 months, often requiring a pilot
period. Decision makers are programme managers / academic leads; finance approval for
larger deals involves procurement teams.

**Sales motion:** Top-down (programme manager / academic lead) with bottom-up reinforcement
(clinical educators who author cases and see value in the dashboards). A design-partner
reference case at one institution shortens procurement cycles at comparable institutions.

---

## 3. Competitive Landscape

### 3.1 Direct Competitors (AI / virtual patient, text-based or voice)

**Geeky Medics SimChat**
The closest direct analogue found in public research. SimChat is an AI virtual patient
platform for communication skills training, with 800+ OSCE scenarios, educator-built
virtual patients, structured post-simulation feedback, and LMS link sharing (though LTI
integration depth is unclear from public data). Pricing is in the $2,501-$20,000 tier per
institution per year (HealthySimulation directory). Coverage is primarily medical OSCE
(history-taking, breaking bad news), not specifically psychotherapy / LI-CBT / ACT. No
evidence of: competency-mapped rubrics, dynamic emotional state engine, ground-truth
clinical boundaries, Hebrew/Arabic support, or hierarchical (college-programme-course)
multi-tenant architecture [sources: Geeky Medics product pages; HealthySimulation].

**Oxford Medical Simulation (OMS)**
VR-first medical simulation platform with a mental health module. Focus is on psychiatric
assessment (risk, de-escalation) for medical students, not psychotherapy skills training for
counsellors. Requires VR hardware for full experience; also offers on-screen mode. Strong
institutional partnerships (NHS trusts, UK universities). Not built for LI-CBT / ACT
counselling training competency models. No evidence of LTI-native Canvas grade return or
multilingual psychotherapy simulation [sources: OMS website; CBInsights; HealthySim].

**Kognito**
Was the market leader in text-based role-play simulations for mental health (suicide
prevention, at-risk student conversations). LTI-integrated with Canvas and Blackboard.
However, Kognito stopped selling / marketing as of August 2023 -- the company is in
wind-down mode [source: Kognito website, confirmed by search results 2024]. This is a
market vacancy. Kognito's existing customers at universities are now looking for
alternatives.

**Bodyswaps**
VR / immersive soft-skills training. Healthcare focus is communication skills for NHS
staff, not psychotherapy competency training. Hardware-dependent; no CBT/ACT-specific
rubric engine found [sources: HealthySim; CBInsights].

**TherapyTrainer (ScienceDirect, 2025)**
Research-stage AI tool for exposure therapy (Written Exposure Therapy) training. Academic
product, not a commercial platform. Single therapy modality. Not multi-institution or
LMS-integrated [source: ScienceDirect abstract, 2025].

**PatientHub (arXiv, 2025)**
Academic framework paper for patient simulation using LLMs. Not a commercial product.

### 3.2 Adjacent / Partial Competitors (OSCE Management Platforms)

SimCapture (Laerdal), LearningSpace (Elevate Healthcare), VALT (IVS), SIMStation ExamSuite
-- these are audiovisual recording and OSCE management platforms used in skills labs. They
do NOT include an AI patient engine. They manage human standardised patient sessions. They
are infrastructure layer, not simulation engines. Not direct competitors but relevant to
the LTI / LMS integration context.

### 3.3 Differentiation Map

| Capability | SimChat | OMS | Kognito (defunct) | APS (proposed) |
|---|---|---|---|---|
| Psychotherapy / LI-CBT / ACT specific | No | Partial | Partial | Yes |
| Dynamic emotional state engine | Unclear | No | No | Yes (HLD) |
| Ground-truth clinical boundaries | Unclear | No | No | Yes (HLD) |
| Competency-mapped rubric builder | No | No | No | Yes (HLD) |
| Multi-tenant hierarchy (college-programme-course) | No | Unclear | No | Yes (HLD) |
| Canvas LTI 1.3 with grade return | Unclear | No | Yes (now defunct) | Yes (HLD) |
| Hebrew / Arabic native | No | No | No | Yes (HLD) |
| Longitudinal student analytics | No | No | No | Yes (HLD) |
| Per-student AI cost governance | No | No | No | Yes (HLD) |

**Differentiation verdict:** If the platform ships as specified in the HLD, it would be the
only purpose-built, multilingual, LTI-native AI clinical simulation platform specifically
for psychotherapy / counselling / LI-CBT / ACT training with competency-mapped rubrics
and a dynamic emotional state engine. The gap left by Kognito's wind-down and the absence
of a specialist tool for this therapy modality are real and current.

---

## 4. SWOT -- Eco-Synthetic Taking This On

### Strengths
- Hebrew/Arabic RTL capability is rare in EdTech globally; structural fit for Israeli
  market and Arabic-speaking institutions.
- AI-native build capability (Claude Code-assisted development is already in our workflow).
- Small-team agility: can ship MVP in weeks not quarters if scope is disciplined.
- Adam as first reference customer gives domain expertise input and a live pilot environment
  without full market-discovery cost.
- The HLD is unusually detailed for a pre-discovery engagement -- reduces requirements-risk.

### Weaknesses
- No prior product in clinical simulation or EdTech; learning curve on LTI 1.3, clinical
  rubric design, and healthcare data privacy.
- Zero existing customer base or brand in this market; first sale is also first reference.
- Full HLD scope (35+ MVP items including Canvas LTI, AI engine, rubric builder, dashboards,
  technical support module, academic safety layer) is large for a startup team.
- No budget for paid market research; commercial opportunity validation is thin.
- No clinical domain expert in-house; dependency on Adam and an SME (Sami per brief).

### Opportunities
- Kognito's exit leaves a vacancy in the LTI-integrated mental health simulation space at
  hundreds of universities that were using it.
- NHS Long Term Workforce Plan creates structural demand for scalable psychotherapy trainee
  tools through at least 2037.
- UK/Israel/international counselling training is growing but has no specialist digital
  simulation tool -- a first-mover with a real reference case can set the standard.
- Design-partner model lets us co-build with a domain expert while protecting IP.
- If we own the platform IP, a future SaaS business is sellable or fundable.

### Threats
- Geeky Medics (well-funded UK team) could add CBT/counselling modules to SimChat faster
  than we can build a competing product.
- A large EdTech player (Pearson, Osmosis, TopHat) could enter this niche if market signal
  becomes obvious.
- LLM API cost: while the HLD cost estimates ($2-5 per student per 10 simulations) look
  manageable now, a price increase by OpenAI/Anthropic or a volume spike could compress
  margins if we have fixed-fee contracts.
- Clinical accuracy risk: if the AI patient invents facts outside its ground-truth file or
  gives unsafe responses, reputational and potential regulatory damage is high.
- Data privacy: student clinical transcript data + PII + LTI session tokens is a GDPR /
  Israeli Privacy Law sensitive dataset. A breach or non-compliance event in year one would
  kill the product.
- Adam's vision scope is a 71-page HLD -- if we do not aggressively scope-control the MVP,
  build time balloons and the partnership becomes a custom-dev engagement, not a product.

---

## 5. Order-of-Magnitude Build Effort and Cost

### 5.1 Scope Basis

The HLD's own Stage 1-6 development sequence (Foundation, Simulation Core, Evaluation,
Dashboards, Canvas LTI, Technical Support) maps to roughly the full MVP list (37+ items).
Stage 7 (Moodle, scale, cost governance, credit system) is Phase 2 by the HLD's own
classification.

For a credible pilot we need: Stage 1 (foundation / auth / org hierarchy) + Stage 2 (AI
patient engine, ground-truth boundaries, dynamic state) + Stage 3 (rubric evaluation,
student feedback, debrief chat) + Stage 5 (Canvas LTI launch, grade sync). Stage 4
(dashboards) and Stage 6 (technical support module) can be simplified for pilot.

### 5.2 Effort Estimate (Assumptions Stated)

Assumptions:
- Team: 1-2 senior full-stack engineers (Next.js / NestJS / TypeScript) + 1 AI / prompt
  engineer, with AI-assisted coding (Claude Code / Cursor). Part-time product lead (Perry
  or equivalent).
- No custom LLM training required -- prompt-engineered simulation engine using available
  foundation models (OpenAI / Anthropic).
- Stack as per HLD recommendation: Next.js + NestJS + PostgreSQL + Prisma + Redis + S3.
  This is a standard modern stack; no exotic dependencies.
- "Pilot" definition: one institution, one programme, one Canvas self-hosted instance,
  Hebrew + English, 20-100 active students, 2-3 simulation cases, rubric evaluation, basic
  teacher dashboard, Canvas LTI grade return.

| Phase | Scope | Estimated Effort |
|---|---|---|
| Foundation (Stage 1) | Monorepo, auth, org hierarchy, RBAC, Canvas LTI shell, DB schema | 3-5 weeks |
| Simulation core (Stage 2) | AI patient engine, ground-truth, dynamic state, transcript storage | 4-7 weeks |
| Evaluation (Stage 3) | Rubric builder, scoring, student feedback, debrief chat | 3-5 weeks |
| Canvas LTI + grade sync (Stage 5 subset) | LTI 1.3 launch, role mapping, grade return, fallback page | 2-4 weeks |
| Dashboards (simplified) | Teacher dashboard, class rubric graph, attempt management | 2-3 weeks |
| QA + clinical validation + pilot launch | Integration testing, LTI failure simulation, security review | 2-4 weeks |
| **Total pilot** | | **16-28 weeks** |

This is a rough engineering estimate based on HLD scope review. It is NOT a project
plan. A proper estimate requires Perry's requirements baseline and Lital's resourcing
review. Confidence: LOW-MEDIUM (order of magnitude only).

### 5.3 Cost Estimate (Assumptions Stated)

Assumptions: Israel-based engineering team at blended rate of $8,000-$12,000/month per
senior engineer (reflecting freelance / local market rates; adjust if using offshore or
higher-cost market). Two engineers for 5-7 months.

| Cost Item | Estimate | Notes |
|---|---|---|
| Engineering (2 engineers, 5-7 months) | $80,000-$168,000 | Dominant cost; assumption-sensitive |
| AI API (development + pilot) | $500-$2,000 | Based on HLD cost model + dev usage |
| Infrastructure (cloud, S3, Redis, monitoring) | $300-$800/month | Low at pilot scale |
| LTI / LMS testing environment | $0-$500 | Canvas self-hosted is free; test environment cost |
| Design + UX (minimal) | $3,000-$8,000 | Pilot-level only; not production polish |
| Legal (partner agreement, privacy review) | $2,000-$5,000 | One-off; Eyal can advise |
| **Total pilot build** | **$90,000-$185,000** | Central estimate: ~$130,000 |

Recurring AI API cost per student (per HLD estimate, our validation): $2-5 per student
per 10 simulations. For 100 students x 10 simulations = $200-$500/year in API cost. At
$30/student/year SaaS fee, gross margin on API is ~80-90% -- viable. With safety buffer
at $5/student, still >83% gross margin at $30 pricing. This is healthy for a SaaS model.

**Key variable:** Engineering rate and team size drive the range. A single senior
engineer on AI-assisted coding could reduce the low end; a larger team could compress the
timeline but increase cost. These are inputs for Lital to model properly.

---

## 6. Design-Partner Structure Recommendation

### 6.1 Option Comparison

**Option A: Equity for Adam**
Give Adam equity (e.g. 1-5%) in return for being the design partner and first reference
customer.
- PRO: Aligns Adam's interests with product success; avoids cash outflow if he takes
  equity instead of fee discount.
- CON: Equity is hard to unwind. It complicates future fundraising and exit discussions.
  Design partners who take equity sometimes become difficult stakeholders if the product
  evolves away from their initial vision. For a first engagement where the scope may shift,
  equity is high-commitment.
- CON: Adam's contribution is domain expertise + pilot access, not capital. Equity for
  non-capital contribution requires careful structuring (vesting, cliff, dilution terms).
- VERDICT: Not recommended at this stage. Too early; too entangling.

**Option B: IP Share (Adam co-owns IP)**
Adam receives a share of platform IP in exchange for co-design contribution.
- CON: This is the worst outcome for Eco-Synthetic. Co-ownership of IP creates a veto
  partner on every future product decision, licence, sale, or fundraise. It limits
  our ability to serve other institutions and effectively bars a clean exit.
- CON: The HLD is Adam's vision document, but the build, architecture, and implementation
  will be entirely ours. We should not give away IP ownership for design input.
- VERDICT: Do not offer. IP stays with Eco-Synthetic.

**Option C: Reduced Fee (Adam pays a pilot fee, significantly below commercial rate)**
Adam pays a below-commercial fee during the pilot period (e.g. $5,000-$15,000 for the
pilot year), in exchange for: reference rights (we can name him as first customer), active
co-design collaboration (feedback, clinical content, user testing), and a defined
transition path to standard pricing after pilot.
- PRO: We receive real revenue (even if small), which validates willingness to pay.
  Revenue, not equity or IP, is the correct early signal.
- PRO: Clean IP position. No co-ownership.
- PRO: Adam has skin in the game -- paid customers give better feedback than free ones.
- PRO: If Adam cannot or will not pay even a reduced fee, that tells us something about
  the purchasing signal.
- CON: May require negotiation if Adam expects free access.
- VERDICT: Recommended base model.

**Option D: Hybrid (Reduced Fee + Future Commercial Commitment)**
Adam pays reduced pilot fee AND commits in writing to a standard commercial contract at a
defined price point if the pilot meets agreed success criteria (e.g. 80% of students
complete at least 3 simulations, teacher satisfaction > 4/5).
- PRO: Combines revenue validation with forward commitment -- the most useful commercial
  signal possible.
- PRO: Success criteria align both parties on what "done" means.
- PRO: Still keeps IP fully with Eco-Synthetic.
- VERDICT: This is the preferred structure. Recommend pursuing Option D.

### 6.2 Recommended Structure: Option D (Reduced Fee + Commercial Commitment)

**Pilot fee:** $5,000-$15,000 for a defined pilot period (suggested 6 months). Actual
number is A1 for owner to negotiate. The fee matters less than the commitment signal.

**Commercial commitment:** Written intent (not legally binding) to convert to a standard
SaaS contract at $X/student/year if the pilot meets defined criteria. Eco-Synthetic sets
the commercial pricing; Adam commits to the process.

**Key terms to protect (recommend to owner -- Eyal to finalize):**

1. **IP ownership:** All platform IP (code, AI prompt architecture, rubric engine,
   evaluation engine, data model) is Eco-Synthetic's exclusively. Adam's clinical content
   (simulation cases he authors) is his. The platform that runs it is ours.
2. **Reference rights:** Adam / his institution agrees in writing to serve as a named
   reference customer for sales and marketing purposes (website, proposals, case study).
   This is our primary asset from the partnership.
3. **No exclusivity:** We explicitly retain the right to serve other institutions,
   including direct competitors of Adam's institution. This must be stated, not assumed.
4. **Data:** Student simulation data (transcripts, grades, rubric scores) stays within the
   institution's data scope. We may use anonymised, aggregated usage data to improve the
   platform (opt-out option for institution). No raw clinical transcript data used for
   any purpose other than the institution's own evaluation.
5. **Feedback obligation:** Adam / his institution commits to structured monthly feedback
   sessions during the pilot (e.g. 1 hour/month with a named contact). This is the core
   of the design-partner exchange.
6. **Success criteria and conversion gate:** Defined, measurable. Agree before signing.
7. **Termination:** Either party can terminate with 30 days notice. Pilot fee is
   non-refundable after Month 1.

All of the above is a recommendation only. Eyal (Legal) must review and approve the
specific terms. Owner must sign off (A1). Do not commit or represent these terms to Adam
without owner + legal approval.

---

## 7. Stage-Gate Recommendation and RICE Score

### 7.1 Stage Gate

**Recommendation: CONDITIONAL-GO to Pilot Phase (Stage 1 / Discovery-to-Pilot)**

**Condition 1 (Critical):** Adam's institution is confirmed as pilot site. At least one
named programme manager signs a design-partner agreement with the terms above.

**Condition 2 (Critical):** Scope is agreed at a disciplined Scope 1: simulation loop
(Stages 1-3 of HLD) + Canvas LTI (Stage 5 subset). Dashboard and technical support module
are simplified. No Moodle in Scope 1. This should be validated by Perry's requirements
baseline before build begins.

**Condition 3 (Important):** Legal and privacy gate cleared (Eyal + Rambo): GDPR / Israeli
privacy posture on student clinical data, LTI token handling, data residency.

**Condition 4 (Important):** At least one additional institution (outside Adam's network)
has been identified as a potential Scope 2 customer, validating that the beachhead is not
a market of one.

**Condition 5 (Important):** Lital reviews and approves the financial model, including
engineering cost, pilot fee structure, and path to breakeven.

If all five conditions are met, recommend committing engineering resources to the pilot
build.

**If Condition 1 fails** (Adam cannot commit or terms cannot be agreed): PAUSE. The pilot
without a committed first customer and domain collaborator is a product-without-a-market
risk. Do not build speculatively.

**If Condition 2 fails** (scope cannot be disciplined below 28 weeks): INVESTIGATE-FURTHER.
Bring Perry back to scope further before committing.

### 7.2 RICE Score

| Factor | Score | Reasoning |
|---|---|---|
| Reach | 6/10 | Psychotherapy / counselling training is a real market; UK IAPT pipeline alone is thousands of trainees/year. But market is niche vs. general EdTech. |
| Impact | 8/10 | High per-user impact: structured simulation directly improves clinical competency. If it works, educators advocate for it strongly. |
| Confidence | 5/10 | Market data is thin; no commercial pricing validation yet; competitor entry risk from SimChat. Design-partner conditions moderate the risk but do not eliminate it. |
| Effort | 5/10 (inverse; high effort = low score) | 16-28 week pilot build for 1-2 engineers is a significant commitment for a pre-revenue product. |

**RICE = Reach x Impact x Confidence / Effort = 6 x 8 x 5 / 5 = 48**

For reference, a score of 48 indicates a worthwhile initiative that justifies discovery
investment and a scoped pilot, but not a full-scale build before commercial validation.
This is consistent with a CONDITIONAL-GO to the pilot phase only.

---

## 8. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Scope creep from Adam's 71-page HLD | High | High | Written Scope 1 agreement before build; Perry owns scope control. No feature added without owner approval. |
| R2 | Student clinical data breach or GDPR non-compliance | Low-Medium | High | Eyal + Rambo legal / security gate before any student PII is stored. Anonymise transcripts in dev; no clinical data in test environments. |
| R3 | AI patient generates unsafe or factually wrong clinical content | Medium | High | Ground-truth boundary engine (in HLD) is the mitigation; clinical review of all simulation cases by Adam before deployment; AI-generated content disclaimer in UI. |
| R4 | SimChat expands into CBT / counselling before we ship | Medium | Medium | Speed to pilot matters. Scope discipline (Condition 2) is the mitigation. First reference case + Hebrew/Arabic is our moat. |
| R5 | Adam does not convert to commercial after pilot | Medium | Medium | Condition 4 (second institution identified early); do not build features that only serve Adam. |
| R6 | LLM API cost increase by provider | Low | Medium | Multi-model routing (already in HLD); cost governance layer; pricing contract includes pass-through clause for API cost above threshold. |
| R7 | Canvas self-hosted LTI integration is more complex than estimated | Medium | Medium | Allocate dedicated LTI sprint; test against Adam's actual Canvas instance early. Do not estimate based on documentation alone. |
| R8 | No Israeli regulatory clarity on clinical training data | Medium | High | Eyal gate (Condition 3) before any Israeli student data is ingested. This is a hard stop if unresolved. |

---

## 9. Sources

Market data:
- MarketsandMarkets: Healthcare Simulation Market (2025) -- https://www.prnewswire.com/news-releases/healthcare-simulation-market-worth-us7-23-billion-by-2030-with-15-6-cagr--marketsandmarkets-302475155.html
- SkyQuesttt: Virtual Patient Simulation Market (2025) -- https://www.skyquestt.com/report/virtual-patient-simulation-market
- NHS England Workforce page -- https://www.england.nhs.uk/mental-health/adults/nhs-talking-therapies/workforce/
- BACP, May 2025: Increase in counsellors and psychotherapists in NHS -- https://www.bacp.co.uk/news/news-from-bacp/2025/9-may-increase-in-counsellors-and-psychotherapists-working-in-nhs/
- NHS Psychological Professions Workforce Census, May 2025 -- https://www.england.nhs.uk/wp-content/uploads/2025/05/PRN01896-psychological-professions-national-workforce-census-may-2025.docx
- KenResearch / itrade.gov.il: Israel EdTech market -- https://itrade.gov.il/usa/edtech-in-israel-powering-the-future-of-learning/

Competitor data:
- Geeky Medics SimChat product pages -- https://geekymedics.com/simulation-with-ai-virtual-patients/
- HealthySimulation SimChat vendor listing -- https://www.healthysimulation.com/vendor-product/simchat/
- Oxford Medical Simulation -- https://oxfordmedicalsimulation.com/product/vr-mental-health/
- Kognito (wind-down confirmed) -- https://kognito.com/
- Bodyswaps -- https://www.healthysimulation.com/vendors/bodyswaps/
- TherapyTrainer (ScienceDirect, 2025) -- https://www.sciencedirect.com/article/abs/pii/S1077722925000495
- PatientHub (arXiv, 2025) -- https://arxiv.org/pdf/2602.11684
- CBInsights: OMS competitors -- https://www.cbinsights.com/company/oxford-medical-simulation

Research / academic:
- JMIR Medical Education: AI virtual patients for psychopathological interviewing training (2025) -- https://mededu.jmir.org/2025/1/e78857
- Frontiers in Medicine: AI-enhanced virtual patients meta-analysis (2026) -- https://www.frontiersin.org/journals/medicine/articles/10.3389/fmed.2026.1834636/full
- NCBl / PMC: AI for psychiatric training (2025) -- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12437682/

Design-partner structure:
- Common Paper: How to Work With Design Partners -- https://commonpaper.com/blog/design-partner/
- Common Paper: Free Design Partner Agreement -- https://commonpaper.com/standards/design-partner-agreement/

---

## 10. Open Questions for Owner / Next Steps

1. What is Adam's institution? (Israel? UK? Private college or university?) This determines
   the regulatory posture (GDPR vs. Israeli law) and the pilot complexity.
2. Has Adam indicated any expected compensation model from his side (fee, equity, or
   free access)?
3. Is Eco-Synthetic prepared to allocate 1-2 engineers for 5-7 months on a pre-revenue
   pilot? Lital should model the cash impact before Condition 5 is cleared.
4. Is there a second institution already in Adam's network who could be a fast-follower
   customer (Condition 4)?
5. Owner decision needed: does Eco-Synthetic want to build and own a SaaS platform (a
   multi-year product business), or deliver this as a client project (build-for-hire with
   IP transfer)? These are fundamentally different business models. This memo assumes
   Eco-Synthetic retains IP and builds a SaaS product. If the model is build-for-hire,
   the financial analysis and partner structure change entirely.

**Recommended next actions (owner to authorize):**
- Owner relays to Adam that Eco-Synthetic is in CONDITIONAL-GO and identifies the
  conditions above.
- Perry completes requirements baseline and scoped Scope 1 definition (APS workstream per
  discovery brief).
- Eyal + Rambo begin legal / privacy pre-read (per discovery brief, listed as follow-on).
- Lital reviews financial model (engineering cost, pilot fee, SaaS pricing hypothesis).
- Erez returns with an updated memo once Adam's response and Perry's scope are available.

---

*This memo is Erez's investment recommendation only. All go/no-go decisions, commitment of
resources, and external communications are Owner A1. No build, contract, or partnership
commitment is made by this document.*

*All external data (market figures, competitor descriptions) is synthesized from public
sources cited above. Raw external content has not been reproduced verbatim. Market size
estimates are indicative; the psychotherapy simulation sub-segment is not separately
quantified in available public research -- this gap is flagged explicitly.*
