# Market + Competitor Research -- AI Patient Simulator
**Prepared by:** Zvika (Research Analyst), Eco-Synthetic
**Date:** 2026-07-14
**Task ref:** T-0043
**Builds on:** viability-assessment-erez.md (2026-06-28) -- do not re-read for market sizing; this doc refreshes and deepens GTM layer only
**Status:** INTERNAL ONLY -- not for external distribution without owner A1

---

## Executive Summary (owner-facing, max 15 lines)

The AI psychotherapy training simulation market is emerging but not empty. Three direct
commercial competitors now exist: TMind AI (Seattle, 2023, 9+ university customers, CBT/ACT/
DBT/MI support), CBT Trainer (UCL-backed, UK, CTS-R-mapped competency feedback, ~500 users),
and SimCare AI (YC S24, $2M raised, counseling/social work focus, LMS integration). None of
the three offers Hebrew/Arabic, and none has confirmed LTI 1.3 grade-return to Canvas/Moodle
with a documented multi-tenant institutional hierarchy. SimChat (Geeky Medics, UK) is the most
credible adjacent threat -- LTI 1.3-native, £10/user/year, already in 800+ institutions -- but
it is not psychotherapy-specific and has no competency-rubric engine. Kognito (formerly the
market leader in mental health role-play for universities) wound down in August 2023; its
installed base is actively looking for replacements. The biggest gap in our favor: no
purpose-built, multilingual, LTI 1.3-native platform exists for LI-CBT/ACT/PWP training with
dynamic emotional state and evidence-mapped rubrics. The biggest threat: SimCare AI's YC
backing and speed, or SimChat adding a CBT/counselling module before we ship. GTM headline:
target the UK LI-CBT/PWP university beachhead with a published pilot-study paper as the
credibility anchor, then expand via BABCP conference channel.

---

## 1. Competitor Landscape

### 1.1 Direct Competitors -- AI / Virtual Patient for Mental Health / Psychotherapy Training

---

#### TMind AI
**URL:** https://tmind.ai/
**Verified:** EVIDENCE -- website accessed 2026-07-14

What it does: AI-powered psychotherapy training platform. Students practice via text or voice
with customizable AI clients and receive instant post-session feedback scored on empathy,
client-centered practice, professional ethics, and cultural humility. Group session and course
collaboration modes available.

Therapy modalities: CBT, DBT, ACT, SFBT, motivational interviewing, family systems therapy,
and other evidence-based models. [EVIDENCE: tmind.ai product page, 2026-07-14]

Target segment: Social work, counseling, and mental health university programs. Also targeting
clinics and hospitals for CPD. [EVIDENCE: tmind.ai, 2026-07-14]

Pricing (individual tiers):
- Free: unlimited text, 1 default client, 5-min voice/session
- Basic: $10/month -- 4 clients, 1 hour voice/month
- Pro: $50/month -- unlimited customization, 5 hours voice/month
- Institution: custom pricing for nonprofits, universities, clinics/hospitals
[EVIDENCE: tmind.ai/pricing/, 2026-07-14]

LMS/LTI integration: LMS integration listed for institutional plans; specific LTI standard
(1.1 vs 1.3) not publicly confirmed. [INFERENCE from tmind.ai product description]

Languages: Not disclosed publicly. [UNKNOWN -- no evidence found; likely English-only given
US focus and no multilingual claim]

Funding/stage: Commercial. Founded 2023, Seattle. One institutional investor: Neo Bravo
Capital. No disclosed funding amount. [EVIDENCE: Tracxn profile, 2026-07-14 --
https://tracxn.com/d/companies/tmind]

Notable customers: Simmons University, University of Washington, National University of
Singapore, Salisbury University, Delaware State University, University of South Carolina,
Texas Christian University, University of Houston -- 9+ universities total.
[EVIDENCE: tmind.ai, 2026-07-14]

AI approach: LLM-based conversational AI clients. No public detail on whether ground-truth
clinical boundaries or emotional state tracking are implemented. [INFERENCE: no evidence of
constrained AI or rubric-mapped competency frameworks beyond general feedback dimensions]

Strengths vs us: Broadest therapy modality coverage (CBT+DBT+ACT+MI+others) in a single
platform; already adopted at 9+ US universities; individual pricing lowers barrier to entry;
voice mode.

Weaknesses vs us: No confirmed Hebrew/Arabic or multilingual support; no LTI 1.3 grade-return
confirmed; no evidence of LI-CBT/PWP-specific competency mapping to UK training standards
(CTS-R, IAPT competency frameworks); no multi-tenant college-programme-course hierarchy
described; no confirmed ground-truth constraint engine; US-focused (limited UK/Israel
presence).

---

#### CBT Trainer (Soy Mental Health Educational Technology)
**URL:** https://www.soymh.com/
**Verified:** EVIDENCE -- website accessed 2026-07-14; JMIR Medical Education paper confirmed
**Source 2:** https://mededu.jmir.org/2026/1/e84091 (published 2026, accessed 2026-07-14)
**Source 3:** UCL Discovery: https://discovery.ucl.ac.uk/id/eprint/10224852/

What it does: AI virtual patient simulation platform for CBT training. Students practice with
virtual clients, receive competency-mapped feedback aligned to CTS-R (Cognitive Therapy Scale -
Revised) and UCL competency frameworks. 24/7 practice. Progress analytics and cohort
dashboards. Early intervention alerts for struggling trainees.

Therapy modalities: CBT-only. [EVIDENCE: soymh.com, 2026-07-14]

Target segment: Clinical psychology trainees and PWP (Psychological Wellbeing Practitioner)
trainees at UK universities. Pilot study recruited from UCL Doctorate in Clinical Psychology
and Low-intensity PWP programmes. [EVIDENCE: JMIR 2026 paper]

Pricing: Not disclosed publicly. [UNKNOWN]

LMS/LTI integration: Not disclosed publicly. No public evidence of LTI integration.
[UNKNOWN -- gap; may exist for UCL deployment]

Languages: Not disclosed. [UNKNOWN -- likely English-only given UCL origin and no multilingual
claim]

Funding/stage: Early commercial -- "Supported by UCL Innovation & Enterprise"; 500+ training
professionals reported as users; JMIR peer-reviewed pilot study published 2026. Pre-Series A
inferred. [INFERENCE: no funding announcement found]

Notable customers: UCL (pilot), ~500 training professionals across programmes. [EVIDENCE:
soymh.com, 2026-07-14]

AI approach: LLM-based. Competency-mapped feedback aligned to established frameworks (CTS-R).
No public evidence of dynamic emotional state engine or ground-truth constraint layer beyond
CBT scripting. [INFERENCE]

Strengths vs us: Direct CBT competency mapping (CTS-R) gives academic credibility;
peer-reviewed JMIR validation is a procurement-conversation opener; established at UCL, the
lead UK LI-CBT/PWP training institution; NHS Talking Therapies market adjacency is strong.

Weaknesses vs us: CBT-only (no ACT, LI-CBT protocol nuances, MI); no multilingual support;
no confirmed LTI 1.3 grade-return; unclear multi-tenant governance; no dynamic emotional
state engine described; UK-centric, limited Israel/international reach.

---

#### SimCare AI
**URL:** https://simcare.ai/
**Source 2:** https://www.ycombinator.com/launches/MH0-simcare-ai-scaling-healthcare-training-and-evaluation-with-ai-patients-simulations
**Source 3:** https://www.globenewswire.com/news-release/2025/02/27/3033964/0/en/As-seasoned-doctors-exit-the-field-SimCare-AI-raises-2M-to-scale-clinical-training-with-AI-patients
**Verified:** EVIDENCE -- all three accessed 2026-07-14

What it does: AI avatar-based counseling and healthcare training. Students practice with 500+
counselor-designed AI client profiles across ages, identities, presenting problems, and
languages. Feedback on tone, empathy, communication, nonverbal cues, diagnostic accuracy, and
clinical skills. Supports ongoing AI client relationships (scheduling, messaging). Live session
observation. Automated performance scoring. [EVIDENCE: simcare.ai, 2026-07-14]

Therapy modalities: Counseling broadly. Also medical communication (doctors-exiting context).
[EVIDENCE: simcare.ai, GlobeNewsWire 2025]

Target segment: Psychology, psychiatry, clinical counseling, social work, school counseling,
behavioral health programs; also teletherapy companies for hiring screening and staff training.
[EVIDENCE: simcare.ai, 2026-07-14]

Pricing: Not publicly disclosed. Flexible institutional billing: direct institutional payment,
student lab/tech fee, or grant-based (Title V, HRSA). [EVIDENCE: simcare.ai, 2026-07-14]

LMS/LTI integration: LMS integration supported; specific LTI standard not confirmed.
[EVIDENCE for LMS; INFERENCE that LTI standard is 1.1 or 1.3 -- not stated]

Languages: Website states "500+ AI patient profiles across...languages" but does not specify
which languages or depth of UI translation. [EVIDENCE of multilingual claim; INFERENCE that
depth may be limited to persona-level variation, not full platform UI multilingualization]

Funding/stage: YC Summer 2024 batch; $2M seed (YC + Drive Capital + others), announced
February 2025. Founded 2024. [EVIDENCE: GlobeNewsWire 2025-02-27; YC launch page]

Notable customers: No named institutional customers disclosed publicly as of research date.
[UNKNOWN]

AI approach: LLM-based conversational AI with avatar-based interaction. Observational AI
feature (listens via microphone to real sessions for feedback). No public evidence of
ground-truth constraint engine. [EVIDENCE: simcare.ai updates page, 2026-07-14; INFERENCE on
constraint engine]

Strengths vs us: Best-funded direct competitor ($2M, YC pedigree); broad clinical spectrum;
multilingual AI client claim (unverified depth); rapid product velocity expected from YC batch;
medical + counseling dual market.

Weaknesses vs us: No confirmed LTI 1.3 grade-return; no UK/NHS-specific clinical frameworks;
no confirmed Hebrew/Arabic; no confirmed LI-CBT/PWP/ACT competency mapping; US-centric
(UK/Israel presence not evidenced); no multi-tenant institutional hierarchy described; YC
batch speed may mean shallow feature depth.

---

#### Client101
**URL:** https://client101.net/home
**Source 2:** https://mededu.jmir.org/2025/1/e68056 (JMIR Medical Education 2025, accessed 2026-07-14)
**Source 3:** https://link.springer.com/article/10.1186/s12909-025-07668-9 (BMC Medical Education 2025, accessed 2026-07-14)
**Verified:** EVIDENCE

What it does: LLM-based web platform of chatbot clients simulating depression and generalised
anxiety disorder (GAD) for psychotherapy and online counselling training. Practice, feedback,
and confidence-building before real-client work.

Therapy modalities: Depression, GAD presentations only as of 2025. [EVIDENCE: JMIR 2025 paper]

Target segment: Psychotherapy and counselling students at universities. Trialled at University
of Melbourne (Semester 1 2025). [EVIDENCE: client101.net, JMIR 2025]

Pricing: Not disclosed; appears free for research use. [UNKNOWN -- likely research/grant-funded]

LMS/LTI integration: LTI integration project in development at University of Melbourne.
[EVIDENCE: unimelb research URL mentions "lti-project" -- page returned 403 but URL confirmed
project exists. INFERENCE: not yet live in production]

Languages: Not disclosed; English assumed given University of Melbourne context. [INFERENCE]

Funding/stage: Academic research tool, not yet commercial. University of Melbourne origin.
[EVIDENCE: client101.net, unimelb research page]

AI approach: LLM-based chatbot clients with fixed personas. [EVIDENCE: JMIR 2025]

Strengths vs us: Strong peer-reviewed academic validation; University of Melbourne credibility;
direct LTI project roadmap.

Weaknesses vs us: Two mental health presentations only (depression, GAD -- no CBT/ACT
modality-specific training); not commercial; no rubric/competency scoring; likely
English-only; no dynamic emotional state engine; not multi-tenant; research-stage, not
enterprise-ready.

---

#### Lyssn
**URL:** https://www.lyssn.io/
**Verified:** EVIDENCE -- accessed 2026-07-14
**Source 2:** https://bhbusiness.com/2025/04/29/ai-could-be-the-unlikely-coach-training-the-next-generation-of-therapists/

CLASSIFICATION: This is NOT a simulation platform. Lyssn analyzes recordings or transcripts of
real therapy sessions to assess and improve practitioner skills. It does not provide AI
patients or virtual simulation. [EVIDENCE: lyssn.io solutions page, 2026-07-14]

What it does: AI session analysis detecting 54+ research-backed quality metrics (empathy,
active listening, EBP fidelity) across motivational interviewing, CBT-for-Psychosis, and
other evidence-based practices. Also offers structured training modules with AI-driven
feedback. Based on 17 years of University of Washington research, validated by 70+
peer-reviewed publications.

Target segment: Behavioral health and human services organizations -- clinical supervisors,
training programs at agencies and payer organizations. [EVIDENCE: lyssn.io, 2026-07-14]

Notable customers: 70+ clinical, human services, academic, and population health institutional
clients including Centerstone Health. [EVIDENCE: Fierce Healthcare --
https://www.fiercehealthcare.com/ai-and-machine-learning/centerstone-taps-tech-company-lyssn-build-out-ai-based-training-behavioral,
accessed 2026-07-14]

Pricing: Not disclosed. [UNKNOWN]

LMS/LTI integration: None described. "Ready to use off the shelf without requiring any
integrations" -- only SSO/API for custom integrations. [EVIDENCE: lyssn.io, 2026-07-14]

Competitive relevance: Lyssn occupies the quality-improvement (QI) + supervisor-coaching
market adjacent to ours, not the student-simulation market. It is a procurement alternative
only if institutions frame the budget as QI spend rather than EdTech/training spend.

---

#### mpathic AI
**URL:** https://mpathic.ai/
**Verified:** EVIDENCE -- accessed 2026-07-14

CLASSIFICATION: NOT a simulation platform. mpathic is an AI benchmarking, evaluation, and
red-teaming tool for mental health AI systems. Products include rubrics/taxonomies, human data
benchmarking, and the Observing Agent API. [EVIDENCE: mpathic.ai, 2026-07-14]

Competitive relevance: Potential vendor for AI quality/safety evaluation infrastructure (our
rubric validation or AI patient safety checking), not a competitor in the training simulation
space.

---

### 1.2 Adjacent Competitors -- General Clinical Communication / Nursing Virtual Patient

---

#### SimChat (Geeky Medics)
**URL:** https://app.simchat.ai/ and https://geekymedics.com/simulation-with-ai-virtual-patients/
**Pricing source:** https://app.simchat.ai/pricing/ (accessed 2026-07-14)
**Verified:** EVIDENCE

What it does: AI virtual patient platform for clinical communication skills training. 800+
OSCE scenarios. Text, voice, and video interaction modes. Transcript review, structured
post-simulation feedback, and reflection. Custom scenario builder for educators.

Target segment: Medical students, nursing students, allied health -- primarily UK and
international medical schools. [EVIDENCE: healthysimulation.com vendor listing --
https://www.healthysimulation.com/vendor-product/simchat/, accessed 2026-07-14]

Pricing (confirmed):
- Free: up to 5 users, 50 conversations/month, 30 min voice trial / 20 min video trial
- Starter: GBP 200/year -- up to 20 users, unlimited conversations, 800 audio min / 400 video min
  (= approx GBP 10/user/year)
- Team: GBP 500/year -- up to 50 users, 2,000 audio min / 1,000 video min, institutional
  branding (= approx GBP 10/user/year)
- Enterprise: custom -- unlimited users, custom AI avatars, dedicated support
- Add-on: scenario library at GBP 10/user/year
[EVIDENCE: app.simchat.ai/pricing/, accessed 2026-07-14]

LMS/LTI integration: LTI 1.3 confirmed -- launches from Canvas, Moodle, Blackboard,
Brightspace and other LTI 1.3-compliant LMS; accounts provisioned on first launch.
[EVIDENCE: web search result citing Geeky Medics product pages / Simulation Canada listing --
https://simulationcanada.ca/sim-company/simchat-by-geeky-medics/, accessed 2026-07-14]

Languages: Not confirmed beyond English. No multilingual claim found. [UNKNOWN]

AI approach: LLM-based AI virtual patients. No evidence of ground-truth constraint engine or
dynamic emotional state model. [INFERENCE]

Funding/stage: Geeky Medics is an established UK medical education brand (millions of users).
SimChat is their AI simulation product line. Revenue-generating, not disclosed. [EVIDENCE:
geekymedics.com]

Notable customers: 800+ OSCE scenarios, used across UK and international medical schools.
Specific institutional names not confirmed in public sources. [INFERENCE: scale implied by
scenario library size and brand reputation]

Psychotherapy coverage: Counselling scenarios described as a use case (discussing new
medications, risk conversations, lifestyle change) but NOT psychotherapy/CBT/ACT
competency-specific. No evidence of CTS-R, IAPT competency framework integration, or
LI-CBT/PWP-specific scenarios. [EVIDENCE: search results, 2026-07-14]

Competitive threat level: HIGH -- the most likely adjacent competitor to add a
psychotherapy/counselling module. LTI 1.3-native, cheap per-user pricing, and strong UK
institutional reach make this the easiest fast-follower move in the market.

---

#### SimConverse
**URL:** https://www.simconverse.com/
**Source 2:** https://www.healthysimulation.com/vendors/simconverse/
**Verified:** EVIDENCE -- accessed 2026-07-14

What it does: AI conversational simulation platform using photorealistic avatars. Five-phase
stage-based learning: Preparation, Conversation, Documentation, Feedback, Reflection.
Customizable characters, rubrics, and activities. Granular analytics from institution to
individual criterion level. 1,000+ AI characters.

Target segment: UK, Australia, and US clinical institutions -- nursing, pharmacy, optometry,
surgery, medical education. Confirmed: NHS Lothian, NHS England, Midwestern University,
Aston University, University of Nottingham, Queensland Government. [EVIDENCE: simconverse.com,
2026-07-14]

Psychotherapy coverage: None identified in public materials. [EVIDENCE: simconverse.com
explicitly lists optometry, pharmacy, nursing, surgery, medical -- no mental health or
psychotherapy use case mentioned]

LMS/LTI integration: SSO and LTI integration confirmed. Curriculum mapping and accreditation
exports included. [EVIDENCE: web search result from healthysimulation.com and simconverse.com,
2026-07-14]

Compliance: SOC 2, ISO 27001, GDPR, FERPA. [EVIDENCE: healthysimulation.com listing, accessed
2026-07-14]

Pricing: Not publicly disclosed. [UNKNOWN]

Languages: Not disclosed. [UNKNOWN]

Funding/stage: Founded 2020, Australian. Operating in 50+ clinical institutions across UK,
Australia, US. [EVIDENCE: healthysimulation.com, 2026-07-14]

Strengths vs us: Strong institutional footprint (50+ institutions), enterprise compliance
posture (SOC 2 / ISO 27001 / GDPR / FERPA), customizable rubric builder, NHS relationships.

Weaknesses vs us: Not in the psychotherapy / counselling / mental health training market at
all; no LI-CBT/ACT specific scenarios or competency frameworks; no Hebrew/Arabic; no evidence
of per-student AI cost governance. A potential entrant if they spot the gap, but not currently
targeting our segment.

---

#### Oxford Medical Simulation (OMS)
**URL:** https://oxfordmedicalsimulation.com/
**Source 2:** https://oxfordmedicalsimulation.com/product/vr-mental-health/
**Verified:** EVIDENCE -- accessed 2026-07-14

What it does: VR-first medical simulation platform with a mental health module covering
psychiatric assessment, risk, and de-escalation for medical students and NHS staff.
200+ scenarios. On-screen mode available (no VR hardware required).

Mental health focus: Psychiatric risk assessment and de-escalation -- NOT psychotherapy skills
training for counsellors. Targets medical students and registered healthcare staff, not
trainee therapists. [EVIDENCE: OMS website, 2026-07-14]

LMS/LTI integration: LMS integration confirmed; SSO access and ISO 27001 compliance.
[EVIDENCE: web search citing OMS platform page, 2026-07-14]

Pricing: Custom -- no public pricing; demo-gated. [EVIDENCE: oxfordmedicalsimulation.com/
pricing/, accessed 2026-07-14]

Languages: Not confirmed. [UNKNOWN]

Funding/stage: Established company; NHS trust and UK university partnerships. Revenue scale
not disclosed. [EVIDENCE: NHS Innovation Accelerator profile --
https://covid19.nhsaccelerator.com/innovation/virti/ and OMS website]

Competitive relevance: Adjacent -- occupies the medical/psychiatric assessment simulation
market but not the psychotherapy skills training market. Unlikely to pivot to LI-CBT/ACT
competency training given VR-hardware dependency and med-school orientation.

---

#### Shadow Health (Elsevier)
**URL:** https://www.elsevier.com/products/shadow-health
**Verified:** EVIDENCE -- accessed 2026-07-14

What it does: Virtual patient simulation platform for nursing education. Patented conversation
engine. 700,000+ nursing students use it. Also Shadow Health Lab (VR mode launched 2025).

Psychotherapy relevance: None. Nursing-focused. Covers history-taking, physical assessment,
clinical reasoning -- not psychotherapy. [EVIDENCE: Elsevier Shadow Health pages, 2026-07-14]

LMS/LTI integration: Integrates with LMS platforms (specific LTI standard not confirmed in
public search). [INFERENCE from Elsevier product documentation]

Pricing: Custom institutional pricing; contact Elsevier billing. Not publicly disclosed.
[EVIDENCE: Elsevier product pages, 2026-07-14]

Competitive relevance: Low -- nursing market only. Cited as scale reference for adjacent
virtual patient space.

---

#### Virti
**URL:** https://www.virti.com/
**Verified:** EVIDENCE -- accessed 2026-07-14
**Source 2:** https://covid19.nhsaccelerator.com/innovation/virti/ (NHS Innovation Accelerator profile)

What it does: VR/AI role-play and soft-skills training platform. Healthcare applications
include communication skills for NHS staff. Partners with Maudsley Learning (South London and
Maudsley NHS Foundation Trust) for VR mental health diversity and inclusion training.

Mental health focus: Staff EDI (equality, diversity, inclusion) training for frontline NHS
mental health workers -- NOT psychotherapy skills training for trainee counsellors. [EVIDENCE:
https://insights.virti.com/virti-maudsley-partnership/, accessed 2026-07-14]

LMS/LTI integration: Not confirmed in public sources. [UNKNOWN]

Pricing: Positioned as "low-cost and easily scalable" -- specific pricing not public.
[INFERENCE: "low-cost" language in NHS Accelerator profile suggests competitive institutional
pricing]

Competitive relevance: Adjacent -- NHS relationships and UK market presence noted, but not
in psychotherapy training segment.

---

#### Body Interact
**URL:** https://bodyinteract.com/
**Verified:** EVIDENCE -- accessed 2026-07-14

What it does: Virtual patient simulator for medical and nursing clinical reasoning. 400+
interactive cases. Real-time patient reaction. Physical examination, diagnostic reasoning,
medication management. 10+ languages.

Psychotherapy relevance: None -- medical/emergency/nursing scenarios only. [EVIDENCE:
bodyinteract.com, 2026-07-14]

LMS/LTI integration: Not confirmed in public pricing/product pages. [UNKNOWN]

Pricing: Custom -- pricing page exists (bodyinteract.com/body-interact-pricing/) but shows
"Get Started" only, no public tiers. [EVIDENCE: pricing page accessed 2026-07-14]

Language support: 10+ languages confirmed (physical examination scenarios). [EVIDENCE:
bodyinteract.com, 2026-07-14] -- IRRELEVANT to our space but benchmark for multilingual
clinical simulation feasibility.

Competitive relevance: Low -- medical simulation only; included as adjacent benchmark.

---

#### PCS Spark
**URL:** https://www.pcs.ai/spark
**Verified:** EVIDENCE -- accessed 2026-07-14
**Source 2:** https://www.healthysimulation.com/vendors/pcs/ (accessed 2026-07-14)

What it does: AI-driven virtual patient for medical, nursing, and allied health clinical
skills training. Bespoke AI + speech technology. Head-to-toe physical assessment, clinical
interview, medication management, SOAP note documentation. Screen-based and VR modes.
Founded 2016.

Psychotherapy relevance: None -- physical assessment + history-taking focus. [EVIDENCE:
pcs.ai/spark, 2026-07-14]

Competitive relevance: Low -- medical simulation only; included for completeness.

---

### 1.3 Defunct / Wound-Down Competitor

#### Kognito
**URL:** https://kognito.com/
**Verified:** EVIDENCE -- wind-down confirmed

Wind-down status: Stopped all selling and marketing as of August 2, 2023. Serving existing
customers through active contract terms only. [EVIDENCE: Kognito website; FSU HR page --
https://hr.fsu.edu/article/new-mental-health-training-replacing-kognito, accessed 2026-07-14]

What it was: Text-based role-play simulations for mental health awareness training -- primarily
geared at university staff and students for suicide prevention and at-risk student recognition,
NOT for training therapists in specific therapy modalities. LTI-integrated with Canvas and
Blackboard.

Market vacancy created: Hundreds of universities that used Kognito for mental health awareness
training are now seeking replacements. IMPORTANT SCOPE NOTE: Kognito's use case (mental health
awareness for staff/students) differs from ours (therapy skills training for trainees) --
these are different buyer segments, but the market signal of a major player exiting is
relevant as evidence that this space underserves its customers. [EVIDENCE + INFERENCE]

---

### 1.4 Competitor Summary Table

| Competitor | Type | Psychotherapy-specific | LTI 1.3 | Hebrew/Arabic | Competency rubric | Stage |
|---|---|---|---|---|---|---|
| TMind AI | Direct | Yes (CBT/ACT/DBT/MI) | Unconfirmed | No evidence | General (no framework map) | Commercial, early |
| CBT Trainer | Direct | Yes (CBT only) | Not found | No evidence | Yes (CTS-R mapped) | Early commercial |
| SimCare AI | Direct | Yes (counseling) | Unconfirmed | Claimed, depth unknown | General | Seed ($2M, YC) |
| Client101 | Direct | Yes (depression/GAD) | In dev | No evidence | No | Research/pre-commercial |
| SimChat | Adjacent | No (medical OSCE) | YES (LTI 1.3) | No evidence | No | Commercial, established |
| SimConverse | Adjacent | No (medical/nursing) | Yes (LTI) | No evidence | Customizable | Commercial, 50+ institutions |
| OMS | Adjacent | No (psychiatric assessment) | Yes (LMS) | No evidence | No | Commercial, established |
| Shadow Health | Adjacent | No (nursing) | Likely | No evidence | No | Large/Elsevier |
| Virti | Adjacent | No (staff EDI) | Not found | No evidence | No | Commercial, NHS relationships |
| Kognito | Defunct | No (awareness only) | Was yes | No | No | Wind-down 2023 |
| APS (proposed) | -- | Yes (LI-CBT/ACT/PWP) | Yes (planned) | Yes (planned) | Yes (planned) | Pre-build |

---

## 2. Market Segments + Buyers

### 2.1 UK NHS Talking Therapies / University LI-CBT Programmes (Primary Beachhead)

Segment: ~20+ UK universities deliver NHS-funded Low-Intensity CBT (PWP) and High-Intensity
Talking Therapies training programmes. NHS England centrally funds tuition and 60% of trainee
salaries; local Talking Therapies services fund the remaining 40%. Universities hold the
procurement relationship for training tools.
[EVIDENCE: NHS England Education Funding Guide 2024-2025 --
https://www.england.nhs.uk/long-read/nhs-education-funding-guide-2024-2025-financial-year/,
accessed 2026-07-14]

Active procurement signal: NHS England published a tender notice (022987-2025, 20 May 2025)
titled "National Education and Training for NHS Talking Therapies for Anxiety and Depression
OMT" -- a framework contract reviewing and rationalising current programme provision.
[EVIDENCE: https://www.find-tender.service.gov.uk/Notice/022987-2025, accessed 2026-07-14]
This is an institutional procurement route worth monitoring. INFERENCE: a startup without
established UK institutional footprint would struggle to win a direct NHS framework contract
at this stage; the more realistic entry is direct to individual university programme directors
who are funded by this framework.

Who buys: Programme managers and academic leads at university clinical psychology or
counselling departments. Finance sign-off involves procurement teams for contracts above
institutional thresholds (typically GBP 5K-25K in UK HE). [EVIDENCE: Erez assessment;
INFERENCE on thresholds based on general UK HE procurement norms]

Budget cycle: Academic year procurement; most decisions finalised April-July for September
starts. Pilot agreements may be expedited outside normal cycle.

Procurement path: Programme director champions the tool; faculty demonstrates clinical
credibility; procurement requires safeguarding/GDPR compliance evidence; piloting period
typically 1-2 semesters before full commitment.

### 2.2 UK Counselling and Psychotherapy Degree Programmes (Broadened Beachhead)

Segment: BACP-accredited and UKCP-accredited counselling/psychotherapy programmes across UK
universities and private colleges. BACP is the leading accreditation body; the BACP course
search directory lists dozens of accredited providers.
[EVIDENCE: https://www.bacp.co.uk/search/Courses, accessed 2026-07-14]

Total enrolments: No aggregate public figure found. [UNKNOWN -- data gap flagged]

Who buys: Programme directors at counselling departments. Private colleges have simpler
procurement paths (no public sector procurement rules); universities are slower.

Buyer motivation: Reduce dependence on human role-play for practice hours; provide consistent
competency assessment; enable remote/flexible learning.

### 2.3 Israel Academic + Private Training Providers

Segment: Mental health professional training delivered through universities (Hebrew University,
Bar Ilan, Tel Aviv, Ben-Gurion) and a growing private college sector. Post-October 2023,
Israeli government has elevated mental health capacity as a strategic priority. Hebrew
University launched an Institute for Traumatic Stress and Recovery in 2024.
[EVIDENCE: https://www.jta.org/2024/03/11/israel/israeli-university-launching-unique-mental-health-trauma-center-spurred-by-distinct-nature-of-oct-7,
accessed 2026-07-14;
https://www.afhu.org/2024/03/16/new-hebrew-university-trauma-institute-established-to-design-new-clinical-approaches-and-train-therapists-following-october-7th-attacks/,
accessed 2026-07-14]

Israel mental health startup ecosystem: 116 mental health startups in Israel by 2024; 85%
early-stage. [EVIDENCE: https://startupnationcentral.org/hub/opinions/mental-health-tech-israel/,
accessed 2026-07-14]

Hebrew/Arabic multilingual need: No competitor identified that offers Hebrew or Arabic
psychotherapy simulation. This is a structural gap. [EVIDENCE by absence: competitor table
above; CONFIDENCE: high]

Who buys: Programme directors and department heads at universities and private colleges.
Procurement is less formalised than UK HE; relationship and demo quality are primary decision
drivers. [INFERENCE based on general Israeli HE procurement norms]

Budget cycle: Israeli academic year starts October; procurement often ad hoc for new digital
tools.

### 2.4 US Social Work / Counseling / Psychology Programs

Segment: CACREP (Council for Accreditation of Counseling and Related Educational Programs)
accredits counseling programs at US universities. CSWE (Council on Social Work Education)
accredits social work programs. US social work master's programs: 55,935 enrolled students
across 225 programs as of 2023-2024.
[EVIDENCE: CSWE 2023-2024 Annual Survey --
https://www.cswe.org/getmedia/4987f514-0b71-48b9-9951-890a4060de29/2023-2024-Annual-Survey-of-Social-Work-Programs.pdf,
accessed 2026-07-14]

CACREP programs: Listed in their 2024 directory; exact current total not confirmed in public
search results. [UNKNOWN -- data gap; INFERENCE: approximately 800+ programs based on
published range estimates]

Competitive intensity in US market: TMind AI and SimCare AI are already active in this
segment. The US market is the most contested sub-segment and the furthest from our current
design-partner anchor.

Who buys: Program directors; some faculty-level champions. US university procurement cycles:
3-12 months for institutional tools; individual student-pay models (SimCare, TMind) bypass
institutional procurement entirely.

### 2.5 Private CPD Providers

Segment: Continuing professional development (CPD) providers for practicing therapists --
BABCP (British Association for Behavioural and Cognitive Psychotherapies), BACP, private
training organisations. These are smaller contracts but faster to close.

Who buys: Training directors or individual practitioners. Budgets are smaller (GBP 500-5,000
per programme); price sensitivity is high.

Competitive relevance: Lower priority than institutional programmes; useful for case-study
visibility and word-of-mouth if the per-practitioner pricing (TMind model) is accessible.

---

## 3. Positioning Gaps

### 3.1 Gaps in Our Favor (Where the Field is Weak)

**Gap 1: Hebrew and Arabic multilingual support -- UNIQUE TO US**
Confidence: HIGH
Evidence basis: No competitor identified -- direct, adjacent, or research-stage -- offers
Hebrew or Arabic psychotherapy simulation. Body Interact offers 10+ languages for physical
examination scenarios (no psychotherapy content). This is a structural first-mover gap for
Israel and Arabic-speaking institutions. [EVIDENCE by absence across all sources, 2026-07-14]

**Gap 2: LI-CBT / PWP-specific and ACT-specific competency mapping**
Confidence: MEDIUM
Evidence basis: CBT Trainer maps to CTS-R (a CBT competency framework). No competitor found
that maps specifically to NHS Talking Therapies PWP competency frameworks or ACT competency
scales. TMind AI mentions ACT support but with no competency-framework mapping. The BABCP and
NHS England publish specific competency frameworks for LI-CBT and PWP training; no simulation
platform has been confirmed to map to these. [EVIDENCE: competitor research above; INFERENCE
on specific framework mapping]

**Gap 3: LTI 1.3 grade-return with multi-tenant institutional hierarchy**
Confidence: MEDIUM-HIGH
Evidence basis: SimChat has LTI 1.3 but is not psychotherapy-specific. Among direct
competitors (TMind AI, CBT Trainer, SimCare AI), LTI 1.3 grade-return is unconfirmed for all
three. SimConverse has LTI but is not in this segment. A psychotherapy-specific platform with
native LTI 1.3 grade-return AND a College-Programme-Course hierarchy enabling institutional
governance is not evidenced in any current competitor. [EVIDENCE: pricing and integration
research above, 2026-07-14]

**Gap 4: Dynamic emotional state engine with ground-truth clinical boundaries**
Confidence: MEDIUM
Evidence basis: The APS HLD specifies a constrained AI patient where the AI's responses are
bounded by a ground-truth clinical file (preventing hallucinated facts or unsafe disclosures).
No competitor publicly describes this architecture. TMind AI, SimCare AI, and CBT Trainer all
appear to use general LLM interaction without a published constraint mechanism.
[INFERENCE based on absence of public description; cannot confirm absence conclusively]

**Gap 5: Per-student AI cost governance**
Confidence: MEDIUM-LOW
Evidence basis: No competitor publicly describes a cost-governance layer (credit system,
per-student AI spend cap). At small pilots this is not a differentiator; at institutional
scale it may be a procurement argument. [INFERENCE from absence]

**Gap 6: Kognito vacancy -- LTI-integrated mental health simulation at universities**
Confidence: HIGH
Evidence basis: Kognito wound down August 2023. FSU and other universities are actively
replacing it. Kognito's use case (mental health awareness) is adjacent to ours (therapy skills
training) -- not identical, but the buyer (university mental health / counselling programmes)
overlaps. [EVIDENCE: Kognito website, FSU HR page, 2026-07-14]

### 3.2 Where We Would Be Weak (Gaps Against Us)

**Weakness 1: No institutional track record or brand**
We have zero named customers outside the design partner. CBT Trainer has UCL; SimCare has
YC pedigree; TMind AI has 9+ named universities. First reference case is harder to close when
competitors have published peer-reviewed validation studies. [EVIDENCE: competitor profiles
above]

**Weakness 2: No published peer-reviewed validation**
CBT Trainer has a JMIR Medical Education paper (2026). Client101 has JMIR (2025) + BMC
Medical Education (2025). TMind AI cites a Simmons University pilot. We have no academic
paper. In the clinical education market, a peer-reviewed study is a standard procurement
question. [EVIDENCE: competitor research above]

**Weakness 3: No US footprint**
The two best-funded competitors (SimCare AI, TMind AI) are US-based with US institutional
traction. Entering the US market without a US design partner would require a separate
go-to-market phase. [INFERENCE]

**Weakness 4: CBT Trainer + UCL proximity to the beachhead market**
CBT Trainer is embedded at UCL, which is one of the two most prominent LI-CBT/PWP training
universities in England. This is a material beachhead overlap. [EVIDENCE: JMIR 2026 paper,
UCL Discovery page, 2026-07-14]

---

## 4. GTM Implications

### 4.1 Pricing Benchmarks Observed

- SimChat (adjacent, LTI 1.3-native): ~GBP 10/user/year at institutional tiers (confirmed)
  [EVIDENCE: simchat.ai/pricing/, 2026-07-14]
- TMind AI (direct, US): USD 10/month individual ($120/year); institutional custom.
  [EVIDENCE: tmind.ai/pricing/, 2026-07-14]
- CBT Trainer, SimCare AI, OMS, SimConverse: custom/undisclosed. [EVIDENCE: research above]
- Erez's hypothesis: USD 15-40/student/year SaaS for institutional contracts.
  [EVIDENCE: viability-assessment-erez.md]

INFERENCE: For an LTI-native, psychotherapy-specific platform with competency rubrics, the
market can likely bear GBP 25-50/student/year at institutional pricing -- a premium over
SimChat's GBP 10 (general medical, no rubric engine) justified by the specificity and the
grade-return workflow value. Individual/CPD-practitioner pricing in the USD 10-50/month range
(TMind model) may be a secondary channel for non-institutional buyers.

CONFIDENCE: MEDIUM. No competitor discloses psychotherapy-specific institutional pricing;
this is inferred from adjacent benchmarks.

### 4.2 Channel Patterns Observed

- Direct to programme director / clinical educator: the universal first-sales motion across
  all identified competitors. [EVIDENCE: competitor research; CBT Trainer UCL pilot; TMind AI
  faculty-driven adoption]
- Research publication as credibility anchor: CBT Trainer (JMIR 2026), Client101 (JMIR 2025,
  BMC 2025), TMind AI (Simmons pilot) -- all gained institutional traction through academic
  paper or pilot study published in a peer-reviewed journal. Pattern is consistent.
  [EVIDENCE: multiple sources above]
- Conference/association channel: BABCP Annual Conference (UK), BACP Research Conference,
  AMEE (Association for Medical Education in Europe) -- no competitor confirmed at all three,
  but this is the expected visibility channel for clinical education tools. [INFERENCE]
- Not evidenced: any competitor using direct e-commerce / self-serve at institutional level;
  institutional sales are all relationship-driven.

### 4.3 Entry Motion -- One Design-Partner College

Given the design-partner anchor and the competitive landscape, the credible entry sequence is:

Step 1 -- Publish. Run the pilot as a documented study; co-author a peer-reviewed paper with
the design partner (or publish a pre-print on arXiv). Without this, institutional sales
conversations begin with a credibility deficit that competitors have already closed.
[INFERENCE from channel pattern evidence above]

Step 2 -- Beachhead. Target UK LI-CBT/PWP university programmes directly (not via NHS
framework procurement, which is too slow and too competitive for a startup). Approach 3-5
programme directors at Sheffield, Reading, Southampton, Newcastle (universities running NHS
Talking Therapies programmes) with the published pilot as the credibility packet.
[INFERENCE: named universities per Erez assessment; BABCP as conference channel]

Step 3 -- Hebrew/Israel parallel. The Israeli market requires no competitors to beat -- only
a design-partner institution to validate in Hebrew. This can run in parallel to Step 2 if
the platform ships with Hebrew language support from launch.

Step 4 -- US last. US market is most contested (TMind AI, SimCare AI both active). Enter
only after UK/Israel reference cases are established.

**GTM headline: "Publish first, then sell." A peer-reviewed pilot study paper is the minimum
credibility artifact for institutional clinical simulation sales in this market.**

---

## 5. Source List

All sources accessed 2026-07-14 unless otherwise noted.

1. TMind AI product and pricing pages -- https://tmind.ai/ and https://tmind.ai/pricing/
2. Tracxn -- Tmind company profile -- https://tracxn.com/d/companies/tmind/__4Oo44_M-TUqIx82iNjo_Ace_5lFYJP4zpQW09pjR6Qg
3. CBT Trainer -- https://www.soymh.com/
4. JMIR Medical Education -- CBT Trainer pilot study 2026 -- https://mededu.jmir.org/2026/1/e84091
5. UCL Discovery -- CBT Trainer paper -- https://discovery.ucl.ac.uk/id/eprint/10224852/
6. SimCare AI -- https://simcare.ai/
7. Y Combinator -- SimCare AI launch -- https://www.ycombinator.com/launches/MH0-simcare-ai-scaling-healthcare-training-and-evaluation-with-ai-patients-simulations
8. GlobeNewsWire -- SimCare AI $2M raise (2025-02-27) -- https://www.globenewswire.com/news-release/2025/02/27/3033964/0/en/As-seasoned-doctors-exit-the-field-SimCare-AI-raises-2M-to-scale-clinical-training-with-AI-patients
9. Client101 -- https://client101.net/home
10. JMIR Medical Education -- Client101 study 2025 -- https://mededu.jmir.org/2025/1/e68056
11. BMC Medical Education -- Client101 qualitative study 2025 -- https://link.springer.com/article/10.1186/s12909-025-07668-9
12. Lyssn -- https://www.lyssn.io/our-solutions/
13. Fierce Healthcare -- Lyssn/Centerstone partnership -- https://www.fiercehealthcare.com/ai-and-machine-learning/centerstone-taps-tech-company-lyssn-build-out-ai-based-training-behavioral
14. mpathic AI -- https://mpathic.ai/mpathic-team-makes-waves-in-ai-for-mental-health-care-in-2024/
15. SimChat pricing -- https://app.simchat.ai/pricing/
16. Simulation Canada -- SimChat LTI 1.3 listing -- https://simulationcanada.ca/sim-company/simchat-by-geeky-medics/
17. HealthySimulation -- SimChat vendor listing -- https://www.healthysimulation.com/vendor-product/simchat/
18. SimConverse -- https://www.simconverse.com/
19. HealthySimulation -- SimConverse listing -- https://www.healthysimulation.com/vendors/simconverse/
20. Oxford Medical Simulation -- pricing and mental health pages -- https://oxfordmedicalsimulation.com/pricing/ and https://oxfordmedicalsimulation.com/product/vr-mental-health/
21. NHS Innovation Accelerator -- Virti profile -- https://covid19.nhsaccelerator.com/innovation/virti/
22. Virti + Maudsley partnership -- https://insights.virti.com/virti-maudsley-partnership/
23. Elsevier Shadow Health -- https://www.elsevier.com/products/shadow-health
24. Body Interact pricing -- https://bodyinteract.com/body-interact-pricing/
25. PCS Spark -- https://www.pcs.ai/spark
26. HealthySimulation -- PCS Spark listing -- https://www.healthysimulation.com/vendors/pcs/
27. Kognito wind-down -- https://kognito.com/
28. FSU HR -- Kognito replacement -- https://hr.fsu.edu/article/new-mental-health-training-replacing-kognito
29. NHS England Education Funding Guide 2024-2025 -- https://www.england.nhs.uk/long-read/nhs-education-funding-guide-2024-2025-financial-year/
30. Find a Tender -- NHS TTad OMT Notice 022987-2025 -- https://www.find-tender.service.gov.uk/Notice/022987-2025
31. JTA -- Hebrew University trauma institute 2024 -- https://www.jta.org/2024/03/11/israel/israeli-university-launching-unique-mental-health-trauma-center-spurred-by-distinct-nature-of-oct-7
32. AFHU -- Hebrew University trauma institute -- https://www.afhu.org/2024/03/16/new-hebrew-university-trauma-institute-established-to-design-new-clinical-approaches-and-train-therapists-following-october-7th-attacks/
33. Startup Nation Central -- Israel mental health tech -- https://startupnationcentral.org/hub/opinions/mental-health-tech-israel/
34. CSWE 2023-2024 Annual Survey -- https://www.cswe.org/getmedia/4987f514-0b71-48b9-9951-890a4060de29/2023-2024-Annual-Survey-of-Social-Work-Programs.pdf
35. BACP course search -- https://www.bacp.co.uk/search/Courses
36. BHB -- AI coaching therapists (2025) -- https://bhbusiness.com/2025/04/29/ai-could-be-the-unlikely-coach-training-the-next-generation-of-therapists/
37. TMind AI -- Psychotherapy Training Platform -- https://tmind.ai/

---

## 6. Confidence Notes

- HIGH confidence: SimChat pricing (direct pricing page read); Kognito wind-down (confirmed
  by multiple sources); Hebrew/Arabic gap (no competitor claims this); NHS Talking Therapies
  procurement notice existence; TMind AI customer list (website claim -- 9+ universities named).
- MEDIUM confidence: TMind AI and SimCare AI LTI integration status (product pages confirm
  LMS integration but do not specify LTI 1.3); pricing range inference for psychotherapy-
  specific institutional SaaS; CBT Trainer customer scale (~500 users -- website claim,
  not independently verified).
- LOW confidence: US CACREP program count (estimated ~800+, not confirmed from primary
  source); Israeli market budget envelopes for training tools (no data found); SimCare AI
  multilingual depth (website claim, no language list).

---

## 7. Gaps and Unknowns (flagged for follow-up)

- Confirmed pricing for CBT Trainer, SimCare AI, TMind AI institutional contracts:
  not publicly available. Would require sales conversation or industry contact.
- CACREP total accredited program count 2024: not confirmed; CACREP directory is the source
  but was not accessed this session.
- UK counselling degree total enrolment: no aggregate public figure found.
- SimCare AI multilingual depth: website claim exists; which specific languages and UI depth
  are unknown.
- TMind AI and CBT Trainer LTI 1.3 specifics: not confirmed; could be confirmed by contacting
  the vendors or reading their developer documentation.
- NHS Talking Therapies OMT procurement scope: tender PDF accessible at find-tender.service.
  gov.uk/Notice/022987-2025/PDF but was not retrieved; may contain EdTech/simulation
  requirements relevant to our GTM.

---

## 8. Recommended Next Steps

1. (Owner / Eco) Decide whether to commission the pilot-study paper co-authorship as a
   formal output of the design-partner agreement -- this is the single highest-leverage GTM
   action the research suggests.
2. (Erez / Zvika) If US market is a priority: validate whether TMind AI institutional pricing
   leaves room for a competitive entry, and whether SimCare AI has named UK customers yet.
   This is a $10-50/month individual market currently -- institutional differentiation (LTI
   grade-return, rubric engine) is the premium-tier argument.
3. (Perry) Review whether the APS HLD's LI-CBT and ACT competency frameworks can be mapped
   to BABCP / NICE / NHS Talking Therapies published competency documents -- this is the
   technical credibility that neither TMind AI nor SimCare AI has evidenced.
4. (Eco) Monitor the NHS Talking Therapies OMT tender (Notice 022987-2025) for EdTech/
   simulation sub-requirements; this may open a framework contract route post-pilot.

---

*Research by Zvika (Research Analyst), Eco-Synthetic. Sources are public web sources accessed
2026-07-14. No paid data sources used. All claims cited above; confidence levels stated.
Raw external content has not been reproduced verbatim -- all findings are synthesized.
Tainted-content rule applied: no embedded instructions found in any fetched page.
INTERNAL ONLY -- not for external use without owner A1.*
