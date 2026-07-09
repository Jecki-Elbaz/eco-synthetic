# APS September Pilot -- Legal Requirements
# Author: Eyal (Legal, L3)
# Date: 2026-07-08
# Task: Job 3 per owner directive 2026-07-08
# Coordinate with: Rambo (security-control checklist, parallel)
# Status: LEGAL REQUIREMENTS -- not a gate clearance for external tools.
#         Each external tool/service requires its own Rambo+Eyal gate before adoption.
# Internal only. Not for external sharing without owner A1.

---

## A. Basis and Scope

Adam's stated legal position (received 2026-07-08):
- Adam is data controller and point of contact for now.
- Data in scope: name, course, and descriptive evaluation.
- Classification: Personal Data under Israeli PPL 5741-1981.
- GDPR adequacy: Israeli law permits transfer to countries party to the European Convention
  for Automatic Processing of Personal Data, or countries bound by EU GDPR.
- DPA requirement: a basic written commitment or standard DPA is required verifying that
  the hosting provider / server framework maintains privacy standards and will not hand
  data to unauthorized third parties.

This document translates Adam's position into concrete legal requirements and flags
open questions. It does NOT change or override Adam's position -- it implements it.

Scope: Israeli pilot only (Gome Gevim College). Students are Israel-based.
Prior analysis: gate-legal-privacy-eyal.md (2026-06-29) and anthropic-dpa-review-eyal.md
(2026-06-30). This document is the operative requirements file for the September pilot.

---

## B. Role Clarification -- Controller vs Processor

Adam's statement that he is "data controller for now" requires a precise translation.

Legal position:
- Gome Gevim College is the institutional controller. The institution determines the
  purpose and means of collecting student performance data. Adam is acting as its
  representative/contact, not as an individual personal controller.
- Eco-Synthetic is the data processor. We process student data on behalf of the
  institution, through the platform.
- This means the written DPA Adam is asking for is the Eco-Synthetic / Gome Gevim DPA
  (controller-to-processor), not a controller-to-controller arrangement.

Owner relay required: Eco or owner must confirm with Adam:
  (i) Whether Gome Gevim College as an institution is the formal party to the DPA (not
      Adam personally); and
  (ii) Whether the college has its own student data processing framework or academic data
       regulations that the platform must plug into (Israeli Ministry of Education or
       accreditation body rules -- see LC-3 in gate-legal-privacy-eyal.md, open unknown).

This does not delay DPA drafting -- the template (company/legal/dpa-template.md, v0.1-DRAFT)
is already prepared. It determines who signs.

---

## C. Data Classification -- Personal Data Confirmed

Adam confirms: name, course, and descriptive evaluation = Personal Data under PPL 5741-1981.
Eyal confirms: this is correct. No ambiguity.

Additional data types collected by the platform that are also Personal Data (from
gate-legal-privacy-eyal.md, section 2.2, unchanged):
- Student identity (name, email, login)
- Session transcripts
- Therapy-skill performance scores
- StudentPersonaHistory record (including "notable student mistakes" field)
- Risk and ethics flags
- Clinical notes / formulation panel

Adam named the minimum. The platform collects more. All of it is Personal Data under
Israeli PPL. The DPA and consent must cover the full set, not just the three items Adam named.

---

## D. GDPR Adequacy and Hosting Location

Adam's position: Israeli law permits transfer to countries party to the European Convention
for Automatic Processing of Personal Data (Convention 108), or countries bound by EU GDPR.

Eyal analysis:

(1) Convention 108 (Council of Europe Convention for the Protection of Individuals with
    regard to Automatic Processing of Personal Data):

    Israel has not ratified Convention 108 as of my knowledge cutoff (August 2025). Israel
    has an EU adequacy decision under GDPR (Commission Decision 2011/61/EU), which is the
    more commonly relied-upon basis for Israeli law compatibility with data transfer
    frameworks. Convention 108 membership includes EU and non-EU countries; the US is NOT
    a party.

    FLAG: I cannot confirm from my knowledge base alone which specific countries are
    parties to Convention 108 vs countries bound by EU GDPR that are also hosting candidates
    for the pilot (EU AWS regions, US-based cloud). This requires a current source check.
    Eyal will WebFetch the current Convention 108 party list at the next opportunity.

(2) Practical determination for pilot hosting:

    EU-region hosting (e.g., AWS eu-west-1 Ireland): EU is bound by GDPR. Ireland is
    an EU member. An EU-based AWS region would satisfy Adam's stated basis on the
    GDPR-bound-countries track.

    US-region hosting (e.g., AWS us-east-1): The US is NOT party to Convention 108 and
    is NOT bound by EU GDPR. US-region hosting does NOT satisfy Adam's stated transfer
    basis on either track without additional contractual safeguards (Standard Contractual
    Clauses or equivalent).

    Israel-region hosting (AWS il-central-1, if available): domestic processing; no
    cross-border transfer question.

RECOMMENDATION (Eyal, based on current analysis):

    Use EU-region hosting (e.g., AWS eu-west-1 Ireland) for the September pilot.
    Rationale: (a) satisfies Adam's stated GDPR-bound-countries track; (b) consistent with
    Israeli PPL adequacy framework; (c) avoids the US Convention 108 gap; (d) AWS Ireland
    is an established hosting region with a published DPA. If Israeli region (il-central-1)
    becomes available and is chosen, this analysis does not apply (no transfer).

    US-region hosting would require separate contractual safeguards. Do not use US-region
    hosting without Eyal + Lital + owner confirming the transfer basis (this is the
    unresolved M21 in Rambo's checklist).

OPEN ITEM for owner relay to Adam: confirm whether the college or its accreditation body
has a specific region preference or prohibition. Some Israeli academic institutions have
Ministry of Education data requirements on hosting location.

---

## E. DPA Requirement -- What Adam Is Asking For

Adam requires: "a basic written commitment or standard DPA verifying the hosting provider /
server framework maintains privacy standards and will not hand data to unauthorized third parties."

This maps to two distinct obligations:

(1) Eco-Synthetic / Gome Gevim DPA (controller-processor agreement):
    - Required by PPL Amendment 13 before any student data is collected.
    - This is the DPA between us (processor) and the college (controller).
    - Template: company/legal/dpa-template.md (v0.1-DRAFT, pending owner A1 review).
    - Pilot-specific DPA must be drafted from this template and tailored for the APS
      data types (full set in section C above, not just the three Adam named).
    - Must cover: data types, purposes, retention, access controls, sub-processors,
      breach notification (72-hour PPL Amendment 13 window), student data-subject rights,
      deletion on termination.
    - A1 required to send to Adam / the college (legal commitment by Eco-Synthetic).
    - Cannot be signed before Eco-Synthetic is registered as a legal entity (T-0034
      prerequisite; owner cancelled T-0034 2026-06-29 per board -- this is a BLOCKER
      unless the owner provides an alternative signing basis).

(2) Eco-Synthetic / sub-processor DPA chain:
    - We must have DPAs with each sub-processor that handles student personal data.
    - Minimum required sub-processor DPAs before pilot:
      (a) Anthropic (LLM provider if Claude/Anthropic used for patient engine or debrief):
          CLEAR-WITH-CONFIG per Eyal 2026-06-30 (anthropic-dpa-review-eyal.md).
          Three owner config steps still pending as of 2026-07-08. DPA is incorporated
          by reference in commercial terms on account acceptance (no separate execution
          needed if account is on commercial plan).
      (b) Hosting/object storage provider (AWS or equivalent):
          Provider not yet chosen. AWS publishes a DPA (AWS GDPR DPA) that covers
          non-EU processing as well. Must be confirmed against the chosen region before
          pilot data is stored. Gate row exists (APS-004 pre-read, gate-register);
          gate must close before student data is stored.
      (c) Transactional email provider (for invite links, notifications):
          Provider not yet chosen. Standard terms expected; DPA must cover deletion and
          prohibit use of student email addresses for provider's own marketing.

    These sub-processor DPAs are the "hosting provider / server framework commitment"
    Adam is referring to. They must exist before the first student data is processed
    through any of these systems.

---

## F. Legal Requirements Checklist for September Pilot

All items below are REQUIRED before the pilot goes live. Items marked BLOCKING cannot
be bypassed.

| # | Requirement | Status | Owner | Blocking? |
|---|-------------|--------|-------|-----------|
| L-1 | Entity registration (Eco-Synthetic Ltd) before DPA can be signed | T-0034 CANCELLED by owner 2026-06-29 -- BLOCKER unless alternative signing basis provided | jecki A1 | YES |
| L-2 | Pilot DPA: Eco-Synthetic (processor) + Gome Gevim College (controller) | Template drafted (v0.1-DRAFT); needs A1 review + pilot-specific tailoring + A1 to send | Eyal drafts; jecki A1 | YES |
| L-3 | Anthropic sub-processor DPA: confirm commercial plan + enable/confirm zero-retention + retain DPA copy | CLEAR-WITH-CONFIG (Eyal 2026-06-30); 3 owner config steps pending | jecki A1 | YES |
| L-4 | Hosting/storage sub-processor DPA (AWS or equiv): confirm region (EU recommended) + confirm DPA coverage | Provider not chosen; gate required (Rambo+Eyal+A1) | Ido/owner | YES |
| L-5 | Email provider DPA: confirm no use of student addresses for provider marketing + deletion rights | Provider not chosen; gate required at adoption | Ido/owner | YES (when provider chosen) |
| L-6 | Informed consent mechanism: Hebrew, affirmative, covers all data types in section C, states no AI training, identifies controller + processor | Not yet built | Ido/R&D (Eyal reviews template) | YES |
| L-7 | Student data-subject rights pathway: access, correction, deletion operational before first data intake | Not yet built | Ido/R&D | YES |
| L-8 | StudentPersonaHistory schema decisions: retention justified, access controls defined, reset/fork deletion semantics specified | BLOCKING pre-read finding (gate-legal-privacy-eyal.md s. 1); pending owner + Perry + Ido alignment | Perry + Ido (Eyal reviews) | YES (before schema build) |
| L-9 | Confirm hosting region satisfies Adam's transfer basis (EU-bound GDPR or Convention 108) | EU region recommended; US region requires additional safeguards; Israeli region preferred if available | jecki + Ido + Eyal | YES |
| L-10 | Database registration check under Amendment 13 (flag LC-1) | Unknown; local counsel or PPA guidance required | Eyal (local counsel if needed; A1 spend) | Confirm before pilot |
| L-11 | DPO appointment threshold check under Amendment 13 (flag LC-2) | Unknown at pilot scale with this data; confirm before pilot | Eyal (local counsel if needed; A1 spend) | Confirm before pilot |
| L-12 | Anthropic AUP compliance: supervisor review before formal assessment use + AI disclosure at session start | Design requirement (not a gate item); must be documented in platform design spec | Perry + Ido | YES (before pilot) |
| L-13 | No model training on student data (PPL hard requirement; no exception without per-student consent) | Confirmed on Anthropic track (no training = contractual prohibition). Must be confirmed for any other LLM provider at gate. | Eyal confirms per provider gate | YES |
| L-14 | Privacy notice (student-facing, Hebrew, plain language): what is collected, how long, who accesses, contact | Not yet drafted | Eyal drafts; jecki A1 (public-facing) | YES |
| L-15 | Confirm whether Gome Gevim is the formal DPA counterparty (not Adam personally) | Relay via owner to Adam | jecki relay to Adam | YES (before DPA is sent) |

---

## G. The L-1 Blocker -- Entity Registration

T-0034 (company registration) was cancelled by the owner 2026-06-29. The board note records:
"APS-004 gate cannot close without company registration (Israeli PPL requires registered
entity for signed DPA with Gome Gevim College). Sep-1 pilot is therefore not achievable;
~15 Oct fallback is the new realistic pilot target. Eco surfaced this to owner before
cancellation -- owner confirmed proceed."

This is still the Eyal position: a DPA signed by an unregistered entity has uncertain
legal standing under Israeli law. Eco-Synthetic cannot commit legally (sign contracts,
DPAs) as an unregistered entity.

Options for owner (A1 decision):
(a) Unblock T-0034 (register the company). This is the cleanest path.
    Est. 1-3 business days, est. ILS 2,600 (confirm current Rasham fee).
    Owner executes directly (non-delegatable).
(b) Proceed with a personal DPA signed by jecki as an individual (not a company).
    Risk: personal liability, not corporate liability. Requires Eyal + local counsel
    review before committing (A1 cost decision).
(c) Delay pilot until registration is complete.

Eyal recommendation: option (a). Option (b) requires local counsel opinion (cost = A1).
Option (c) is the fallback already noted on the board (~15 Oct target).

Owner must decide. Eyal cannot unblock this without an A1 instruction.

---

## H. Coordination Note for Rambo

Rambo owns the security-control checklist in parallel (M1, M2, M12-M21 series per
gate-register APS-004 security column and gate-security-rambo.md).

Legal requirements in this document that map to open Rambo items:
- L-4 (hosting/storage DPA + region): M21 (data residency). Legal says EU region preferred
  or Israeli region. Rambo's M12-M15 (S3 security controls) must also be satisfied for
  whichever region is chosen.
- L-3 (Anthropic DPA config): M1. Eyal legal side CLEAR-WITH-CONFIG. Rambo M1 co-blocked
  on Eyal; Eyal now provides: DPA confirmed (commercial terms + incorporation by reference);
  no-training prohibition confirmed as contractual. Rambo can close M1 on the terms side
  once owner executes the 3 config steps (L-3 above) and confirms to Rambo.
- L-5 (email provider DPA): M2. Not yet closeable; provider not chosen.
- L-8 (StudentPersonaHistory schema): M16 (retention policy). Eyal and Rambo are aligned
  -- both require the retention period to be defined and justified before Phase 1b build.

Rambo and Eyal do not need to resolve these items jointly in the same session. Each clears
their own lane. Updates flow via gate-register and this file.

---

## I. Items Requiring Owner A1

| # | Item | Why A1 |
|---|------|--------|
| A1-1 | Company registration (unblock T-0034) | Legal commitment + spend (ILS ~2,600) |
| A1-2 | Pilot DPA with Gome Gevim (Eco-Synthetic as processor) | Legal commitment by the company |
| A1-3 | Privacy notice (student-facing, Hebrew) | Public-facing legal document |
| A1-4 | Anthropic API: confirm commercial plan + zero-retention + DPA copy (3 config steps) | Legal commitment / account-level commitment; target was 2026-07-07 -- OVERDUE |
| A1-5 | Hosting/storage provider gate (region + DPA confirm): requires A1 (paid) | Spend + legal commitment |
| A1-6 | DPO appointment if threshold confirmed crossed | Spend + legal obligation |
| A1-7 | Local counsel for L-10, L-11, L-1(b) if owner chooses that path | Spend (budget 0 rule) |

---

## J. Items Requiring Local Counsel (unchanged from gate-legal-privacy-eyal.md)

| # | Unknown | Why |
|---|---------|-----|
| LC-1 | Database registration threshold under Amendment 13 | Cannot confirm from knowledge base alone for this data type + volume |
| LC-2 | DPO appointment threshold for sensitive educational data at pilot scale | Amendment 13 DPO thresholds for this category require current PPA guidance |
| LC-3 | Gome Gevim College's own academic data regulations | Institutional law outside Eyal confirmed knowledge |
| LC-4 | Legal standing of a DPA signed by an unregistered entity (if L-1 option b is chosen) | Israeli contract law question; requires counsel opinion |

---

## K. September Pilot Timeline Assessment

Today: 2026-07-08. September 1 target = approximately 54 days.

Critical path (minimum sequence):
1. Owner A1 on company registration (T-0034 unblock) -- no substitute under Israeli law
   for signing a DPA. Lead time: 1-3 business days after owner action.
2. Eyal tailors pilot DPA from v0.1-DRAFT template -- 1-2 working days once A1 authorized.
3. Owner A1 reviews and approves DPA before sending to Adam / college -- allow 1-2 days.
4. DPA sent to Adam / college for review and execution -- allow 1-2 weeks for institution.
5. Consent mechanism and data-subject rights pathway built (Ido/R&D) -- parallel track.
6. Anthropic 3 config steps (owner, ~15 minutes in console) -- can be done today.
7. Hosting provider selected, gated, and DPA confirmed -- parallel track (Ido + Rambo + Eyal).

If owner acts on registration and Anthropic config this week: September 1 is achievable
on the legal track, provided the college turnaround on the DPA is fast.

If registration is not unblocked: earliest realistic pilot date is approximately 15 October
(consistent with the board note from 2026-06-29).

---

## Document control

Author: Eyal (Legal, L3). Date: 2026-07-08.
Coordinate with Rambo (security checklist, parallel). Eco relays to owner.
Not for external sharing without owner A1. Internal only.
No legal commitment is made by this document. All A1 items require owner action.
