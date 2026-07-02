# APS Legal Re-scope: Pilot Without Company Registration
# Author: Eyal (Legal, L3)
# Date: 2026-06-29
# Status: INTERNAL ADVISORY -- not a gate clearance; no external commitment.
# Triggered by: owner cancellation of T-0034 (Rasham registration), 2026-06-29.
# Background: APS-004 pre-read (gate-legal-privacy-eyal.md) assumed the path:
#   registration -> Eco-Synthetic Ltd as contracting party -> signed DPA with Gome Gevim -> pilot.
#   That path is now closed by owner decision. This document re-scopes.
# Not for external sharing without owner A1.

---

## Context: why registration mattered

Israeli PPL Amendment 13 (in force 2025) requires a written Data Processing Agreement (DPA)
between the DATA PROCESSOR (Eco-Synthetic) and the DATA CONTROLLER (Gome Gevim College) BEFORE
any student personal data is collected or processed. A DPA is a legal contract. A legal contract
requires a legal entity as the signatory. Without company registration, Eco-Synthetic cannot sign
the college DPA as a legal entity.

This was the critical-path link: no registration -> no entity -> no DPA -> no real-name student
data -> no pilot using identified student PII.

Owner has cancelled T-0034. The question is therefore: can a formative pilot run that does NOT
require that DPA?

---

## OPTION A: SYNTHETIC / DE-IDENTIFIED PILOT

### What it is

All data in the pilot system is pseudonymous or synthetic. No real student names, no real student
ID numbers, no real email addresses stored in the platform database. Specifically:

- Students are assigned opaque handles (e.g., "Student-7F2A") by the teacher, offline, before the
  pilot. The teacher holds the handle-to-student mapping in their own records (paper or college
  system). The platform never sees that mapping.
- Login is via the secure invite-link + access-code flow (APS-REQ-005). The access code is tied
  to the student handle, not to a real identity credential.
- The "notable mistakes" field, session transcripts, and StudentPersonaHistory records are stored
  against the opaque handle, not against a real name or identifier.
- No email addresses are stored in the platform. The teacher distributes invite links via their
  own college email system (outside the platform), so the platform never processes student email.
- No LMS roster sync (already deferred from pilot-minimal scope per requirements-baseline.md).

### Does this remove the PPL "processor" obligation and the DPA requirement?

Legal position (confident, but see caveat below):

If no personal data is collected or processed, the PPL processor obligations and the DPA
requirement do not trigger for the platform. The question is whether opaque handles with
associated performance records constitute personal data.

Israeli PPL definition of personal data: data about a person, from which that person can be
identified, or data in possession of someone who can identify that person. Two tests apply:

TEST 1 -- Is the platform itself able to identify the student from the data it holds?
Under Option A, the platform holds handles (e.g., "Student-7F2A") with no name, no email, no
national ID, no credential that links to a real person. The platform CANNOT, from its own data
alone, identify the student. RESULT: likely not personal data as processed by the platform.

TEST 2 -- Is it reasonably possible for the platform operator (Eco-Synthetic) to link the handle
to a real person by using other data within its reach?
Under Option A, the handle-to-student mapping lives ONLY in the teacher's hands, not in the
platform, not accessible to Eco-Synthetic. If Eco-Synthetic has no means of re-identification,
the data is effectively pseudonymous for Eco-Synthetic's purposes.
RESULT: likely outside PPL scope for Eco-Synthetic, provided the mapping is genuinely not
accessible to Eco-Synthetic.

IMPORTANT CAVEAT -- FLAGGED UNKNOWN: I am stating a confident read on the principle, but
Amendment 13 implementation details (specifically the current PPA guidance on pseudonymous
handles in educational software) require confirmation from local counsel or current PPA
guidance before the pilot collects any data. This is a fast, low-cost legal confirm, not
a rebuild, but it is not a step that can be skipped. Eyal cannot confirm from current
knowledge base alone that the PPA treats this approach as outside-scope with zero residual
obligation. FLAG FOR LOCAL COUNSEL: LC-5 (new, below).

PRACTICAL NOTE on the teacher's side: Gome Gevim College still holds a real-name-to-handle
mapping. For Gome Gevim, the handles are personal data (because they hold the link). The college
has its own data-governance obligations for that mapping under Israeli PPL and Ministry of
Education rules. That is the COLLEGE's compliance obligation, not the platform's. The platform
needs to document this division clearly in its privacy notice (see residual obligations below).

### Product constraints imposed by Option A

| Constraint | Detail |
|------------|--------|
| No student-email in platform | Teacher delivers invite links via college email. Platform does not send invite emails directly. No email sender DPA needed for student email. |
| No LMS roster sync | Already deferred to Phase 1b. No change from pilot-minimal scope. |
| No real-name display anywhere in platform | All UI shows student handle only. Teacher UI shows handles; teacher holds the key offline. |
| Teacher must manage handle mapping offline | Operational burden on the teacher. For a formative pilot with one institution + 1-3 courses + <200 students, this is manageable. For scale, it is not a long-term answer. |
| StudentPersonaHistory stored against handle only | This is the high-sensitivity field. Under Option A it is pseudonymous performance data. Still requires access controls (lecturer-only, APS-REQ-018), but the PPL obligations for the college DPA are removed or substantially reduced. |
| No student data-subject rights mechanism required from platform (for pilot) | Under Option A the platform holds no identified personal data, so it has no PPL obligation to respond to a data-subject access/deletion request. The college holds the mapping and would handle any student query via its own systems. This must be disclosed in the privacy notice. |
| Continuing personas deferred to Phase 1b | No change. Already out of pilot-minimal scope per requirements-baseline.md. The StudentPersonaHistory schema is designed but not live for the 1-Sep pilot. Under Option A this is further reason to confirm that deferral: the continuing-persona data is the highest-sensitivity PII in the system and keeping it out of the pilot removes the most significant PPL risk surface. |

### Is this credible for a formative teaching pilot?

Yes. Perry's pilot-minimal scope already omits LMS integration, grade sync, and continuing
personas. The invite-link model (APS-REQ-005) does not require the platform to know who the
student is -- it only needs to know which handle is accessing which simulation assignment. For
a formative pilot where the goal is to generate per-session feedback (not longitudinal records),
pseudonymous handles are educationally sufficient. The teacher maps grades to students offline.
This is how many early-stage EdTech pilots run before full LMS integration.

The one real product question is whether Adam (Gome Gevim) is willing to manage the offline
handle-to-student mapping for the pilot. That is a usability discussion, not a legal one. It
should be surfaced to Adam by owner relay before the pilot design is finalized.

### Residual obligations that remain under Option A (mandatory regardless)

1. ANTHROPIC / LLM DPA. Student simulation transcripts still flow through the LLM API
   (Anthropic or OpenAI), even if pseudonymous. The handles + therapy dialogue are still
   potentially re-identifiable in context. The LLM provider DPA must be executed before
   any transcript is processed. Compliance-backlog Item 6 (Anthropic DPA) remains APS-blocking.
   This is NOT removed by Option A. A1 required to execute.

2. SECURITY BASELINE. Rambo's 21 must-fix items (gate-security-rambo.md) are not affected by
   the registration decision. All security conditions stand. Gate does not close until M1-M21
   are addressed.

3. STUDENT NOTICE / PRIVACY STATEMENT. Even for pseudonymous data, best practice (and arguably
   a PPL requirement if the data is borderline personal) is to provide students with a plain-
   language statement explaining: what data the platform collects, what it does with it, who
   the teacher contacts for questions about their data, and that the platform does not hold
   their real identity. In Hebrew. This is not a DPA but it is still an A1 document (public-
   facing, represents the company legally). Owner must approve before distribution.

4. OBJECT STORAGE DPA. Transcripts and PatientStateLog records will be stored in object storage
   (S3 or equivalent). Even if pseudonymous, the storage provider processes this data. A DPA
   with the object storage provider is required. Standard sub-processor arrangement; expected-
   workable once provider is chosen. Gate required (Rambo + Eyal + A2).

5. DB REGISTRATION UNKNOWN. If local counsel confirms the pseudonymous database still requires
   PPL registration under Amendment 13 (unlikely but possible at certain thresholds for sensitive
   training data), that is an obligation regardless of registration status. This is LC-5 (see
   below). Low probability of being a blocker, but must be confirmed.

6. COLLEGE AGREEMENT (LIGHTWEIGHT). Even without a full PPL DPA, Eyal recommends the owner
   execute a lightweight Pilot Agreement with Gome Gevim (via owner relay to Adam) that covers:
   (a) what data the platform collects (pseudonymous handles + session data); (b) that the
   college owns the handle-to-student mapping and its associated PPL obligations; (c) IP and
   confidentiality of the pilot results. This is NOT a registered-entity DPA. It can be signed
   as an individual / sole-proprietor (see Option B below) or as a letter of understanding.
   A1 required (external legal commitment). Short document. Recommended even under Option A.

---

## OPTION B: EXISTING LEGAL VEHICLE (SOLE PROPRIETOR / OSEK MURSHE)

### What it is

Run the pilot under an existing legal vehicle -- the owner's Osek Murshe (Israeli sole
proprietorship / self-employed VAT payer) rather than a new Ltd. An Osek Murshe can:
- Enter into contracts.
- Sign a DPA with Gome Gevim College as a legal party.
- Issue invoices (Cheshbonet).
- Hold a VAT number (Maam).

An Osek Murshe does not require Rasham registration. If the owner already has an active Osek
Murshe (or is willing to open one -- simpler and cheaper than a Ltd; can be done via Misrad
Hamishpatim / the Tax Authority online in 1-2 days at near-zero cost), this is the fastest
path to a signed DPA without company registration.

### Feasibility

POSSIBLE -- with conditions:

(a) Owner must have (or open) an active Osek Murshe. If the owner does not have one, opening it
    is simple and does not require Rasham registration. Maam registration may follow (required
    once annual revenue exceeds the Ptor threshold or from day 1 if invoicing a business).
    Eyal cannot confirm the current Ptor threshold figure -- the Misrad Hashivuch number changes
    annually and is outside my confirmed knowledge base. Owner or accountant should confirm
    before invoicing. This is a finance item (Lital), not a legal blocker.

(b) The DPA under an Osek Murshe names the owner as the legal party, not "Eco-Synthetic Ltd."
    For a formative pilot with a friendly design partner, this is unlikely to be an issue.
    For a future institutional contract (after registration), the DPA would need to be novated
    to the Ltd entity. Plan for that transition explicitly before registration if/when it happens.

(c) IP ownership: contracts signed by the owner as Osek Murshe vest IP in the owner personally.
    If the company later incorporates, the IP transfer from owner-personally to Eco-Synthetic Ltd
    must be documented at that time. This is a standard founder-to-company IP assignment; it is
    not complicated but it must not be skipped. Eyal flags this as a future obligation, not a
    current blocker.

(d) Liability: sole proprietor carries personal liability, unlike a Ltd. For a small formative
    pilot with a friendly partner, the risk is low. For any contract that includes indemnities,
    liability caps, or SLAs beyond basic goodwill, the owner should weigh this. Eyal recommends
    the pilot agreement (under Option B) be kept simple and liability-limited in scope.

### What it requires

- Owner confirms or opens an Osek Murshe (owner action; non-delegatable; not Eyal's scope).
- Eyal drafts a Pilot Agreement / DPA covering the student data types under the Osek Murshe
  entity. A1 required before sending.
- Owner signs and sends to Adam (owner relay; no agent contacts Adam).
- StudentPersonaHistory schema fix (blocking items from gate-legal-privacy-eyal.md Section 1)
  must still be resolved before the schema is finalized -- this is independent of entity type.

### Residual obligations

All obligations listed under Option A (1-6) apply here, plus:
- The full signed DPA with Gome Gevim College is required (not just a lightweight pilot
  agreement). This is what the signing entity (Osek Murshe) commits to.
- Consent mechanism for pilot students is required (Israeli PPL): in Hebrew, affirmative,
  before first simulation session, identifying the data processor as the owner / Osek Murshe.
- Amendment 13 DPO threshold and database registration unknowns (LC-1, LC-2 from prior pre-read)
  still apply under an Osek Murshe. Confirm with local counsel.

---

## OPTION C: DELAY / REINSTATE T-0034

Noted only per owner instruction. Owner declined reinstating. Not recommended here.

---

## Local counsel flag -- new item

| # | Unknown | Why |
|---|---------|-----|
| LC-5 | PPA treatment of pseudonymous educational handles under Amendment 13 -- does the platform operator have residual obligations even when no real identifiers are stored? | Cannot confirm from current knowledge base. Fast confirm: written query to local PPL counsel or PPA published guidance. Low cost. Must be confirmed before first data is collected under Option A. |

---

## RECOMMENDATION

RECOMMENDED PATH: Option A (SYNTHETIC / DE-IDENTIFIED) for the 1-Sep formative pilot.

Rationale:
- It does not require any entity -- no registration, no Osek Murshe needed for the pilot phase.
- It removes or substantially reduces the platform's PPL obligation for the pilot data,
  subject to LC-5 confirmation.
- The product constraints (no student email in platform, no real names, offline handle mapping
  by teacher) are manageable for a formative pilot of <200 students at one institution.
- It is already consistent with the pilot-minimal scope (APS-REQ-005 invite-link model; no LMS
  roster sync; no grade sync; continuing personas deferred).

If Option A is confirmed viable by local counsel (LC-5) and owner approves the student notice
(A1), the APS-004 gate can close on the legal/privacy leg without company registration.

Option B is the backup if Adam (Gome Gevim) requires real-name student records in the
platform, or if the college's own data-governance requires a signed DPA with a named legal
entity. Owner should relay the handle-approach to Adam before the Sep pilot design is final.
If Adam says "real names must be in the platform," fall back to Option B (Osek Murshe) or
delay the pilot.

---

## What stays mandatory regardless (all options)

1. Anthropic / LLM DPA -- must be executed before any student transcript is processed.
   APS-blocking. Compliance-backlog Item 6. A1 required.
2. Security baseline -- Rambo's 21 must-fix items (M1-M21). Not removed by any of the above.
3. Student notice / privacy statement -- in Hebrew, A1, before pilot goes live.
   Under Option A: explains pseudonymous model and that college holds the identity key.
   Under Option B: full PPL-compliant consent notice.
4. Object storage DPA -- before transcripts are stored. Gate required.
5. Lightweight Pilot Agreement with Gome Gevim -- A1; even under Option A this protects IP,
   confidentiality, and clarifies the handle-to-identity division of responsibility.
6. LC-5 confirmation -- pseudonymous handles local-counsel confirm before first data intake.

---

## APS-003 task update note

AUD-003 (DPA templates, registration-gated) remains correctly TRACKED-NOT-URGENT. Under
Option A it may not be needed at all for the pilot. Under Option B it transforms into the
Osek-Murshe DPA. Either way, AUD-003 does not unblock until owner decision on which option
to pursue. Eyal will draft on owner instruction.

---

## Document control

Internal only. No legal advice to Adam or Gome Gevim. No external commitment.
A1 required before any document listed above (student notice, pilot agreement, DPA, Anthropic
DPA) is drafted, shared, or signed.
Next step: Eco relays recommendation to owner. Owner decides Option A or B.
On owner decision, Eyal proceeds with: LC-5 confirm (A1 required for cost), draft of the
student notice and lightweight pilot agreement on owner instruction.
