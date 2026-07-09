# APS -- Legal Review: Adam Pilot-Readiness Answers
# Author: Eyal (Legal, L3)
# Date: 2026-07-08
# Input: Adam answers received 2026-07-08 (verbatim-normalized, via Eco task).
# Prior docs read: gate-legal-privacy-eyal.md, gate-legal-no-registration-options-eyal.md,
#   gate-security-rambo.md.
# Status: INTERNAL ADVISORY -- not a gate clearance; no external commitment.
# Not for external sharing without owner A1.

---

## 1. WELFARE DE-SCOPE: Dropping Live Welfare Contact for the Pilot

### Adam's answer

Student welfare contact: NOT needed at this stage. Adam wants to avoid added complexity.

### Legal/safety verdict: DEFENSIBLE WITH CONDITIONS

Dropping a live welfare contact for a FORMATIVE pilot is defensible on these grounds:

(a) The platform handles simulated patient distress, not real patient or real student
    distress. The AI patient is an authored persona. Students are in a training context,
    not a clinical one.

(b) The pilot is small (20-25 students, 2 staff). Adam serves as clinical/product lead
    with periodic review. This is a supervised academic setting with an institutional
    contact present, not an unsupported deployment.

(c) AI-disclosure (students know they are interacting with a simulated patient) and
    off-ramp (students can exit the session) remain IN scope. These two elements are the
    minimum responsible safeguard for a simulation platform.

### Residual duty -- what cannot be dropped

Even without a live welfare contact, the following remain mandatory:

1. AI-DISCLOSURE: every student must be clearly informed before the session begins that
   the patient is a simulated AI, not a real person. This is both an ethical requirement
   and an Israeli consumer-information principle. No user should believe they are
   interacting with a real patient. A1 required for the disclosure wording (public-facing).

2. OFF-RAMP: students must be able to exit any session without academic penalty implied
   by the platform. The platform must not create a technical barrier to exit. Off-ramp
   must be visible and always available during a session.

3. CONTENT BOUNDARY: the authored persona scenarios (especially suicidal ideation,
   trauma) must not be designed to trigger genuine student distress. Clinical oversight
   from Adam at the persona-authoring stage is the mechanism for this. Adam's
   "self-simulation author-preview mode" (new ask, see Section 4) directly supports this
   and is legally positive -- it gives the clinical lead a verification step before
   students see a persona.

4. ESCALATION PATH WITHIN THE INSTITUTION: the platform does not need to provide a
   live welfare contact, but the privacy notice / student notice must name an
   institutional contact (Adam or a Gome Gevim College contact) for any concerns.
   The platform must not be a dead end.

### Accreditation note on welfare

See Section 4 (Accreditation). MAN'AT and accreditation bodies for health-profession
training programs in Israel may have their own requirements for student welfare in
simulation contexts. Adam is the right person to confirm this from Gome Gevim's side
before the pilot goes live. The platform cannot determine institutional welfare obligations
for a specific accreditation framework without more information. Owner should relay this
question to Adam.

### Summary verdict: WELFARE DE-SCOPE

DEFENSIBLE for a formative pilot. Conditions: AI-disclosure and off-ramp remain
non-negotiable. Student notice must name an institutional contact. Persona design must
pass Adam's own clinical review (author-preview mode supports this). No A1 action
created by this item alone -- it is a product-design confirmation for Ido and a
disclosure-wording requirement for owner (A1 on the notice).

---

## 2. HANDLES-ONLY RECONCILE: Adam's Controller Statement vs. Option A

### Adam's answer

Adam confirms: Name, course, descriptive evaluation = Personal Data under PPL 5741-1981.
Adam = data controller/contact for now. He wants a basic written commitment / DPA
confirming: privacy maintained + no unauthorized third-party disclosure.

### The question

Does Adam's controller statement change the handles-only conclusion from
gate-legal-no-registration-options-eyal.md (Option A)? Does it still remove the college
DPA / PPL-processor requirement, OR does his controller stance require the Pilot Agreement
to be signed regardless?

### Analysis

Adam's answer CONFIRMS, not contradicts, the handles-only architecture:

- Adam says he holds name/course/evaluation as personal data. He is the controller of
  that mapping.
- Under Option A, the PLATFORM holds only opaque handles + session data (no real names,
  no real emails, no real IDs). Adam holds the handle-to-student map offline.
- This is exactly the architecture described in gate-legal-no-registration-options-eyal.md:
  the college / teacher holds the identifying link; the platform does not.

So: the platform's handles-only position is CONFIRMED by Adam's own framing. He is
acknowledging he is the controller of the identified data. He is not asking the platform
to process identified personal data on his behalf.

### Does the Pilot Agreement still apply?

YES. And Adam has now explicitly requested it ("basic written commitment / DPA").

His request does NOT change the PPL-processor analysis for the platform (because the
platform is not processing personal data under Option A). But it DOES mean:

1. A lightweight Pilot Agreement is now required regardless -- Adam wants one. The
   recommendation in gate-legal-no-registration-options-eyal.md (residual obligation 6)
   to execute this agreement is now elevated from "recommended" to "requested by the
   counterparty."

2. The Pilot Agreement content must cover:
   (a) What data the platform collects (pseudonymous handles + session data -- no real
       identifiers in the platform).
   (b) That the platform operator maintains appropriate security on that data (no
       unauthorized third-party disclosure).
   (c) That Adam / the college holds the handle-to-student map and its PPL obligations.
   (d) IP and confidentiality of pilot results.
   This is a short document. It is NOT a full Amendment 13 DPA (because the platform
   is not a processor of personal data under Option A). It is a contractual commitment
   to the handling standard Adam has requested.

3. Adam's security requirements (Section 3 below) feed directly into the commitments
   the Pilot Agreement makes. The agreement must reference (or annex) the security
   baseline the platform commits to. This is not an academic point -- Adam wants it
   written down.

### Residual A1 items (from this section)

| # | Item | Why A1 |
|---|------|--------|
| A1-PA | Draft, review, and send the Pilot Agreement to Adam | External legal commitment; Eyal drafts; owner approves and sends (no agent contacts Adam directly) |
| A1-SN | Student privacy notice (in Hebrew, plain language) confirming handles-only model and institutional contact | Public-facing; legal representation of the platform |

NOTE: the Pilot Agreement does NOT require company registration under Eco-Synthetic Ltd.
It can be signed by the owner as an individual or Osek Murshe (Option A / B per
gate-legal-no-registration-options-eyal.md). The entity question is unchanged.

### Summary verdict: HANDLES-ONLY

CONFIRMED. Adam's controller statement is consistent with Option A. The platform's
handles-only architecture removes the PPL processor / college DPA requirement for the
platform. The Pilot Agreement is now explicitly requested by Adam and must be drafted
and signed before the pilot begins. Two A1 items created (A1-PA, A1-SN).

---

## 3. PPL SECURITY REQUIREMENTS MAP

Adam's 4 requirements mapped against APS design as documented in gate-security-rambo.md.

### Requirement 1: Strong auth + individual authenticated accounts + MFA

ADAM'S ASK: individual accounts per student, strong authentication, MFA.

CURRENT DESIGN COVERAGE:
- gate-security-rambo.md Section 2 addresses the secure invite-link + access-code auth
  model (APS-REQ-005). Individual accounts: YES, each student gets a unique handle +
  access code.
- Strong auth (cryptographically random tokens, 128-bit entropy, rate-limited access
  codes, hashed storage): addressed in Rambo must-fix items M6, M7, M8. Status: MUST-FIX
  BEFORE PILOT (not yet built).
- MFA: GAP. The current auth model is invite link + access code (two factors in sequence,
  but both delivered through the same channel -- email -- which is effectively one-factor
  from an MFA standpoint). True MFA (e.g., TOTP app or SMS OTP as a second independent
  channel) is NOT specified in APS-REQ-005 or in Rambo's review.

ASSESSMENT: PARTIALLY COVERED.
- Individual accounts: covered in design.
- Strong auth controls: specified as must-fix items (M6-M8); not built yet.
- MFA proper (two independent channels): GAP. The invite-link + access-code model is not
  standard MFA. Adam has explicitly asked for MFA. This must be scoped before the Pilot
  Agreement commits to it.

LAUNCH-BLOCKING? YES if the Pilot Agreement commits to MFA and the platform does not
deliver it. Options: (a) build TOTP or email OTP as a second factor before pilot launch;
(b) negotiate with Adam that invite-link + access-code (two-step, cryptographically
strong) meets his intent for a formative pilot scope. Owner must relay this question to
Adam. Eyal cannot negotiate terms with Adam directly.

### Requirement 2: Encryption in transit (HTTPS/SSL) AND at rest

ADAM'S ASK: HTTPS/SSL for all connections AND encryption at rest for stored data.

CURRENT DESIGN COVERAGE:
- Encryption in transit: not explicitly called out in Rambo's gate review as a separate
  must-fix item, which suggests it was assumed as a baseline. HTTPS for a web application
  is standard practice. However, it is not explicitly confirmed in the design docs as a
  specific requirement with a verification gate.
- Encryption at rest: addressed. gate-security-rambo.md M15 = PostgreSQL encryption at
  rest (MUST-FIX BEFORE PILOT). S3 bucket configuration (M12-M13) covers object storage
  private access. Rambo does not explicitly call out S3 server-side encryption (SSE) as
  a separate line item, but S3 SSE is a configuration option that should be treated as
  part of M12.

ASSESSMENT: PARTIALLY COVERED.
- HTTPS in transit: assumed in design but not explicitly confirmed with a verification
  gate. Must be added as an explicit pre-launch check item (confirm TLS cert, HSTS
  header, no mixed content).
- At rest (PostgreSQL): addressed as M15 (must-fix, not yet built/configured).
- At rest (S3): implicitly covered by M12; should be made explicit as S3 SSE required.

LAUNCH-BLOCKING? Not a new gap, but Adam's explicit request means the Pilot Agreement
must commit to this, and the pre-launch checklist must include HTTPS verification +
S3 SSE confirmation. Add both to Ido's must-fix list as explicit items. Not blocking
if properly tracked under M12 and M15.

### Requirement 3: Access logging / audit trail (who/when/what action)

ADAM'S ASK: access logging -- who accessed what, when, and what action was taken.

CURRENT DESIGN COVERAGE:
- gate-security-rambo.md Section 2 (RISK 4, RISK 5): session events must be logged
  (create, expire, invalid attempt) in the DiagnosticLog. APS-REQ-106 specifies
  DiagnosticLog structure (excluding transcripts and tokens).
- Rambo requires: session event logging (login, expiry, invalid attempt). This is
  session-level audit logging.
- APS-REQ-017 and APS-REQ-018: server-side RBAC enforcement (M9 must-fix). RBAC
  enforcement at the API layer means each transcript/evaluation access is role-checked,
  but logging of those accesses is not explicitly required as a separate line item in
  Rambo's review.
- No explicit requirement in the design docs for a comprehensive access audit trail
  (e.g., "lecturer X accessed student handle Y's transcript at time Z").

ASSESSMENT: PARTIALLY COVERED.
- Session-level logging (login, expiry, anomalous attempts): addressed in design (M10,
  RISK 4).
- Comprehensive access audit trail (who accessed which student record, when): GAP.
  The design has RBAC enforcement but does not explicitly require an audit log of
  resource-level access events. Adam's request is for the latter.

LAUNCH-BLOCKING? YES -- this is a gap that Adam has explicitly requested. An access
audit trail (who/when/what) is also a best-practice PPL security measure under
Amendment 13. Must be added as a must-fix item before pilot launch. Ido must design
an audit log table (or DiagnosticLog extension) that records: user (handle or role),
timestamp, action (view/export/evaluate), resource (session ID or handle reference).
No clinical transcript content in the audit log -- consistent with APS-REQ-106.

### Requirement 4: Network security (patching, firewall, DB-layer isolation from public web)

ADAM'S ASK: patching regime, firewall, database not directly accessible from public web.

CURRENT DESIGN COVERAGE:
- gate-security-rambo.md Section 3 (Object Storage): addresses S3 bucket private access
  (M12) and IAM least-privilege (M14). PostgreSQL encryption at rest (M15).
- DB isolation: Rambo does not explicitly address whether the PostgreSQL instance is
  isolated from the public internet (VPC private subnet, no public IP). This is an
  infrastructure architecture item.
- Firewall: not explicitly addressed in Rambo's review. Implied by standard cloud
  infrastructure practice but not confirmed as a specific must-fix.
- Patching: not addressed in Rambo's review. For a pilot on managed infrastructure
  (AWS RDS for PostgreSQL, EC2 or equivalent for the app layer), patching cadence
  depends on whether managed services with auto-patching are used or whether Ido is
  managing OS-level patches manually.

ASSESSMENT: PARTIALLY COVERED.
- DB-layer public isolation: implied by cloud best practice but not explicitly confirmed
  in the design docs. Must be stated explicitly: PostgreSQL in private VPC subnet, no
  public IP, accessible only from application tier.
- Firewall: security groups (AWS) limiting inbound access must be specified and
  verified at infrastructure provisioning.
- Patching: must define a patching policy before the pilot. For a managed service
  (AWS RDS), auto minor-version patching covers most of this. For application-layer
  dependencies (npm packages, etc.), a pre-launch dependency audit and a patching
  commitment must be documented.

LAUNCH-BLOCKING? YES for DB isolation and firewall (if not confirmed in the
infrastructure spec). These are standard but must be explicitly verified and documented
before the Pilot Agreement commits to "network security." Patching policy is REQUIRED
before pilot launch -- even a simple statement ("auto-patch enabled on RDS; application
dependencies audited before launch; security updates applied within X days of disclosure")
is sufficient for a pilot. Ido must document this.

### 4-Requirement Coverage Summary

| # | Requirement | Coverage | Launch-blocking gap? |
|---|-------------|----------|----------------------|
| 1 | Strong auth + individual accounts + MFA | Partial -- individual accounts and strong auth in design (M6-M8 must-fix); MFA gap | YES -- MFA gap; owner must clarify with Adam |
| 2 | Encryption in transit + at rest | Partial -- at-rest addressed (M15, M12); in-transit not explicitly verified | NO if HTTPS added to pre-launch checklist; not a new gap |
| 3 | Access logging / audit trail | Partial -- session logging in design; resource-level audit trail is a gap | YES -- must be built before pilot |
| 4 | Network security (patch, firewall, DB isolation) | Partial -- S3/IAM addressed; DB isolation and patching not explicitly confirmed | YES for DB isolation + patching policy; must be in infra spec |

New must-fix items for Ido (from Adam's security requirements, not previously explicit):
- MFA (second independent auth channel) -- or owner negotiates intent with Adam.
- HTTPS verification + S3 SSE as explicit pre-launch checklist items.
- Resource-level access audit log (who/when/what action, no transcript content).
- DB private subnet / no public IP -- explicit infra spec and verification.
- Patching policy document (auto-patch RDS + dependency audit cadence).

---

## 4. ACCREDITATION / REGULATORY FLAGS

Adam's answers raise the following accreditation and regulatory flags. These are flags
for owner relay to Adam, not determinations Eyal can make unilaterally.

### Flag 1: Multi-session / continuing persona (Adam's competitive differentiator)

Adam confirms multi-session with the same simulated patient is in scope. The continuing
persona / StudentPersonaHistory feature was previously scoped to Phase 1b (deferred from
pilot-minimal). Adam's answer suggests it may be in scope for the pilot, at least in
some form, as it is his competitive differentiator.

If multi-session with persona continuity is in scope for the pilot, then:
- The StudentPersonaHistory data (session summaries, notable mistakes, etc.) becomes
  a live data item in the pilot, not a Phase 1b stub.
- The PPL obligations for that field (retention period, access controls, data-subject
  rights, model-training prohibition) from gate-legal-privacy-eyal.md Section 1 are
  no longer deferred -- they must be resolved before the pilot.
- Rambo's notable_mistakes schema design flag (gate-security-rambo.md M-notable_mistakes)
  must also be resolved before build, not after.

This is a scope-change flag for Eco to confirm with owner and relay to Adam. If
multi-session is confirmed for the pilot, Eyal's prior finding that the most sensitive
PII obligations are deferred to Phase 1b no longer holds. The gate-legal-privacy-eyal.md
Section 1 blocking items are activated for the pilot.

### Flag 2: Health-profession training simulation -- accreditation body requirements

Health-science and social-work training programs in Israel are subject to oversight by
MAN'AT (the National Council for Clinical Training) and relevant professional bodies
(e.g., Israeli Association of Social Workers, nursing regulatory bodies). These bodies
may have requirements for:
- How simulated clinical encounters are structured (fidelity standards).
- What disclosures are required when AI is used in clinical training.
- Whether simulation results can be used in formal assessments.
- Student welfare obligations in simulation contexts (links back to Section 1 above).

Eyal cannot determine from current knowledge whether Gome Gevim College's use of an
AI patient simulator for social-work / psychology / nursing training (the specific
program type is not confirmed in the documents read) triggers any specific MAN'AT or
professional-body requirement. This is a FLAG FOR ADAM: Adam should confirm with
Gome Gevim's academic governance whether the college's accreditation body has any
requirements for AI-assisted simulation that the platform must meet.

### Flag 3: Author-preview ("self-simulation") mode

Adam's new ask: teachers can run checks on a new persona before students see it.
This is a reasonable clinical oversight mechanism. Legal flag: if the author-preview
mode creates a session record (transcript, state log) for the teacher's test run, those
records must be clearly tagged as test/preview data and must not be included in any
student evaluation or audit logs. The platform must also define the retention policy for
preview-mode session records. This is a product-design flag for Ido, not a legal blocker.

### Flag 4: Pilot scale vs. PPL thresholds

Adam confirms: ~20-25 students, ~2 staff, 3-5 sessions each = ~60-175 sim runs.
This is below the scale where DPO appointment is clearly triggered, consistent with
the prior flag in gate-legal-privacy-eyal.md Section 2.5. However, if multi-session
with continuing persona is in scope (Flag 1 above), the data volume per student increases
and the sensitivity classification of the stored data increases. The DPO threshold
question (LC-2 from gate-legal-privacy-eyal.md) becomes more important if the pilot
includes continuing-persona data, not less.

---

## 5. RESIDUAL A1 ITEMS (consolidated)

| # | Item | Source | Timing |
|---|------|--------|--------|
| A1-PA | Draft and send Pilot Agreement to Adam (covers: handles-only data model; Adam-as-controller for identified data; platform security commitments; IP + confidentiality) | Adam explicitly requested; gate-legal-no-registration-options-eyal.md residual 6 | Before pilot launch; before any student data collected |
| A1-SN | Student privacy notice (Hebrew; plain language; handles-only model; institutional contact named; off-ramp and AI-disclosure confirmed) | gate-legal-no-registration-options-eyal.md residual 3; this review Section 1 | Before first pilot session |
| A1-LLM | Execute DPA with LLM provider (Anthropic or OpenAI) before any student transcript is processed | gate-security-rambo.md M1; gate-legal-privacy-eyal.md A1-3; gate-legal-no-registration-options-eyal.md residual 1 | Before pilot launch; APS-blocking |
| A1-OS | Execute DPA with object storage provider (AWS or equivalent) before student session data is stored | gate-legal-no-registration-options-eyal.md residual 4; gate-security-rambo.md M2 | Before pilot launch |
| A1-MFA | Owner must clarify with Adam (via relay) whether invite-link + access-code meets his MFA intent, or whether TOTP/OTP is required | This review Section 3 Req 1 | Before Pilot Agreement is drafted |
| A1-SCOPE | Confirm with Adam whether multi-session / continuing persona is in scope for the pilot (not just Phase 1b) -- scope change activates additional PPL obligations | This review Section 4 Flag 1 | Before pilot design is final |

---

## Document control

Internal only. No advice to Adam or Gome Gevim College. No external commitment.
All A1 items above require owner approval before action.
Next step: Eco relays to owner. Owner decides which A1 items to unblock and in what order.
Eyal available to draft Pilot Agreement on owner instruction (after A1-MFA and A1-SCOPE
are resolved -- those answers shape the agreement content).
