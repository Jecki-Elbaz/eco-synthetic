# APS-004 Residual Legal Checklist -- Synthetic-Handle Pilot Path
# Author: Eyal (Legal, L3)
# Date: 2026-06-30
# Status: INTERNAL ADVISORY -- owner A1 required before any item is executed, sent, or signed.
# Path: Option A (synthetic/de-identified handles) per gate-legal-no-registration-options-eyal.md.
# Not for external sharing. No legal advice to Adam or Gome Gevim.

---

## Checklist summary

Five residual items remain mandatory under the synthetic-handle (Option A) pilot path.
Company registration (T-0034) is NOT on this list -- Option A is designed to proceed without it.
All five must be resolved before the platform touches real student session data.

---

## Item 1 -- LC-5: Local counsel confirm (pseudonymous handles outside PPL scope)

Status: OPEN -- not resolved. Blocking for first data intake.

The question:
Under Israeli Privacy Protection Law (PPL) 5741-1981 + Amendment 13 (2025), does a platform
that stores only opaque student handles (e.g., "Student-7F2A") with associated simulation
transcripts -- but holds NO name, email, national ID, or any credential that links the handle
to a real person -- have residual obligations as a data processor? Specifically:

(a) Does the PPA (Privacy Protection Authority) treat pseudonymous performance records as
    personal data for the platform operator when the operator has no access to the
    re-identification key?

(b) Does the platform have any database registration obligation under Amendment 13 for a
    database of this type and size (pilot scale: one institution, 1-3 courses, estimated
    under 200 students)?

(c) Does the DPO appointment threshold under Amendment 13 apply to a pseudonymous
    educational-performance database at pilot scale?

(d) Does the absence of real identifiers in the platform remove the requirement for a
    written DPA between the platform and the institution?

Eyal's confident read on the principle: Option A likely takes the platform outside the PPL
processor obligation for the pilot data. However, this is based on general PPL structure
and cannot be confirmed from current knowledge base alone -- Amendment 13 implementation
details and current PPA published guidance (post-2025 enforcement practice) require
verification. This is a fast, low-cost written query to local PPL counsel or a read of
current PPA guidance.

Who acts: owner (jecki) -- engages local counsel. Cost = spend, requires A1.
A1 required: YES (cost item; Eyal cannot self-authorize any spend).
Time-critical: YES. This must be confirmed before the first student handle + session
transcript enters the platform database. Target: confirm at least 2 weeks before the
1-Sep or 15-Oct pilot launch, to allow time to adjust if counsel raises a concern.

How to send to counsel: see item 1(a)-(d) above -- this is the precise question framing.
Eyal has framed it for a one-paragraph written query. Estimated counsel time: under 1 hour.

---

## Item 2 -- Anthropic / LLM provider DPA

Status: OPEN -- APS-BLOCKING. Compliance-backlog Item 6.

Student simulation transcripts (even pseudonymous) will flow through the LLM API
(Anthropic or OpenAI). The session content -- student therapeutic dialogue + persona
responses -- is potentially re-identifiable in context even against opaque handles,
because the content is rich and unique. Option A does NOT remove this obligation.

Required before: any real student transcript is processed by the LLM API.
This gate runs in parallel with the build (StubProvider is in use during Sprint 1;
no real data flows yet) so there is a window to execute the DPA before Sprint 2 moves
to real LLM integration.

Execution path (Anthropic):
(a) Eyal reads the current Anthropic API Data Processing Addendum via WebFetch
    (public legal page, within Eyal's authorized scope).
(b) Eyal produces a terms verdict: cleared / conditions / blocked.
(c) If cleared: owner executes the DPA by accepting it in the Anthropic account
    settings (standard API DPA acceptance mechanism). This is the A1 act.
(d) Eyal records the DPA execution in the gate-register (APS-004 legal column).

Execution path (OpenAI, if adopted instead or in addition):
Same path: Eyal live-reads terms -> verdict -> owner A1 acceptance.
OpenAI is currently DEFERRED in the gate-register (data egress + cost, A1 required).
Gate must be re-run before OpenAI is used with any APS data.

Key confirmation required in DPA (either provider):
- API inputs are NOT used for model training by default.
- Data deletion obligations are specified.
- Sub-processor list is disclosed.
- Security measures meet Amendment 13 standards (or are contractually equivalent).

Who acts: Eyal (reads terms + verdict) -> owner A1 (executes DPA acceptance).
A1 required: YES -- legal commitment.
Time-critical: YES. Must be done before real student data flows through the LLM.
Target: Eyal reads terms within 1 business day of owner instruction;
owner executes within 1 business day of Eyal clearance.

Eyal can begin the WebFetch read immediately on owner instruction -- no further gate needed
for the read step (WebFetch authorized, Rambo CLEAR-WITH-CONDITIONS 2026-06-23).

---

## Item 3 -- Hebrew student privacy notice

Status: OPEN -- required pre-launch. Draft outline: docs/draft-student-privacy-notice-outline.md.

Even under the pseudonymous model, students are entitled to know what the platform
collects, what it does with it, and who to contact with questions. A clear plain-language
notice (a) is best practice; (b) is arguably required under PPL if session transcripts
are borderline personal data (pending LC-5 resolution); (c) directly addresses the trust
and transparency dimension of an educational pilot.

Required before: first student session (login and simulation).

Content points: see docs/draft-student-privacy-notice-outline.md (produced this session).
Language: must be delivered in Hebrew. The outline is in English (internal working draft).
Translation to Hebrew is an owner/human action before distribution.

Who acts: Eyal drafts outline (done); owner reviews and approves content (A1);
owner or owner's designee translates to Hebrew; Adam distributes to students
via Gome Gevim channels (owner relay -- no agent contacts Adam).
A1 required: YES -- public-facing document representing the company legally.
Time-critical: YES. Must be ready at least 1 week before first student session
to allow distribution through the college.

---

## Item 4 -- Object storage sub-processor DPA

Status: OPEN -- required before transcripts are stored at rest.

Provider not yet chosen (devops-infra-shir.md notes IL-residency options).
Session transcripts and PatientStateLog records will be stored in object storage
(S3 or equivalent). Even pseudonymous, the storage provider processes this data
as a sub-processor and a DPA is required.

Standard arrangement: major storage providers (AWS S3, Google Cloud Storage,
Azure Blob) publish standard Data Processing Addendums. These are typically
accepted as part of account setup for business customers and are well-established.
Eyal expects this to be workable once the provider is chosen.

Required before: transcripts or PatientStateLog records are written to production storage.
This does NOT block Sprint 1 (StubProvider, no real data, local dev only).

Steps:
(a) Shir / Ido confirm storage provider choice (infrastructure decision, APS-006 scope).
(b) Eyal reads the provider's DPA via WebFetch (public terms page; within authorized scope).
(c) Eyal issues terms verdict.
(d) Rambo security review of the provider (standard gate; not a new full gate if provider
    is a major platform with prior gate history -- Rambo to advise).
(e) Owner A1 to accept the DPA / activate the account for APS data.
(f) Gate-register row updated.

Who acts: Shir/Ido (provider choice) -> Eyal (terms read) -> Rambo (security) ->
owner A1 (DPA acceptance).
A1 required: YES -- legal commitment (DPA acceptance).
Time-critical: moderate. Must be done before production infra is provisioned.
Target: execute alongside infra provisioning, well before 15-Aug rehearsal.

---

## Item 5 -- Lightweight Pilot Agreement with Gome Gevim College

Status: OPEN -- recommended before pilot goes live. Draft outline: docs/draft-pilot-agreement-outline.md.

Under Option A (synthetic-handle path), a full PPL-compliant DPA with Gome Gevim is
NOT required (because the platform holds no personal data as a processor).
However, Eyal recommends a lightweight written agreement with the college regardless.

Rationale:
- Without registration, this agreement is signed by the owner as an individual
  (or, if the owner has an active Osek Murshe, under that entity).
- It clearly documents the division of responsibility on the handle-to-identity mapping:
  the college owns that mapping and its associated data obligations.
- It protects IP and confidentiality of the pilot outputs.
- It is a signal of professionalism and is low-cost to produce.
- It avoids ambiguity if a dispute arises over who owns what from the pilot.

This is NOT the equity/IP deal (separate track, owner + legal; out of scope here).
This is an operational pilot alignment document only.

Who acts: Eyal drafts (done -- see docs/draft-pilot-agreement-outline.md);
owner reviews and approves (A1); owner signs and relays to Adam for countersignature
(owner relay only -- no agent contacts Adam).
A1 required: YES -- external legal commitment.
Time-critical: YES. Should be signed before the first student session.
Target: owner reviews draft outline and instructs Eyal to finalize; Eyal finalizes
on instruction; owner signs and sends before 1-Sep or 15-Oct pilot launch.

---

## Owner A1 summary

| Item | A1 required for | Who executes |
|------|----------------|--------------|
| LC-5 confirm | Engaging local counsel (cost item) | Owner authorizes spend + routes question |
| Anthropic DPA | Accepting the DPA in the API account | Owner (account action) |
| Hebrew student privacy notice | Approving content + authorizing distribution | Owner review + Adam relay |
| Object storage DPA | Accepting the DPA / account activation for APS data | Owner (account action) |
| Lightweight Pilot Agreement | Signing and sending to Adam | Owner signs + owner relay |

All five require owner A1. None can proceed without it.
Eyal can prepare drafts and terms reads (as above) before the A1 acts, to minimize owner time.

---

## No-registration confirmation

Option A does NOT require Israeli company registration (T-0034) as a pre-condition.
The one remaining dependency on registration status is LC-5:
if local counsel advises that a pseudonymous database still requires registration
with the Registrar or triggers a DPO appointment, that becomes a new path dependency.
Eyal assesses this as low probability but it cannot be confirmed without LC-5.

---

## Build impact

Sprint 1 (StubProvider, no real student data): zero legal blockers. Build proceeds.
Sprint 2 (real LLM integration, real student data, production infra):
- Anthropic/LLM DPA must be executed before real student transcripts flow.
- Object storage DPA must be executed before transcripts stored at rest.
- Student privacy notice must be ready before first student session.
- LC-5 confirmation recommended before any of the above go live.
- Lightweight Pilot Agreement recommended before first student session.

Target for all items: cleared 2 weeks before 15-Aug rehearsal (target 2026-08-01).
Hard deadline: all items resolved before first real student login.

---

## Document control

Internal only. No legal commitment made by this document.
A1 required before any item is executed, sent, or signed.
Equity/IP track is a separate owner + legal engagement; not covered here.
