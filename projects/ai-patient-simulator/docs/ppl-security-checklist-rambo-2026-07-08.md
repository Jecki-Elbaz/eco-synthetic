# APS Pilot -- PPL Security Control Requirement Checklist
# Author: Rambo (Security, L3)
# Date: 2026-07-08
# Baseline: Adam's 4 PPL security requirements (per Eco relay, 2026-07-08)
# Prior docs: gate-security-rambo.md, adam-answers-legal-review-eyal-2026-07-08.md,
#   eyal-note-adam-data-handling-2026-07-08.md, devops-infra-shir.md, requirements-baseline.md
# Status: ASSESSMENT ONLY -- not a gate clearance; not for external sharing without owner A1.
# Internal only. Partition: projects/ai-patient-simulator/.

---

## Architecture context (current state)

Stack confirmed in devops-infra-shir.md and requirements-baseline.md:
- Frontend: Next.js (containerised)
- Backend: NestJS REST/WebSocket API
- DB: PostgreSQL + Prisma + JSONB (managed; cloud provider TBD, pending APS-004 gate)
- Cache/session: Redis (managed)
- Object storage: S3-compatible bucket
- Auth model: secure invite link + access code + email login (APS-REQ-005; no LTI in pilot)
- Data model: handles-only confirmed 2026-07-08 (no real student names/emails in platform;
  Adam/college holds identity key)

All cloud infrastructure: BLOCKED pending APS-004 gate (Rambo + Eyal). No student data
stored or processed in any cloud environment yet.

---

## Checklist format

Columns: Control | Required | Current state | Gap | Owner

---

## CONTROL AREA 1: Strong Auth + Access Management

Adam requirement: NO shared password / weak credentials. Individual authenticated accounts,
every login identifiable. MFA is standard for clinical/educational student backends.

---

| # | Control | Required | Current state | Gap | Owner |
|---|---------|----------|---------------|-----|-------|
| AUTH-001 | Individual user accounts per student (unique handle per student, no shared credentials) | YES -- pilot-blocking | PARTIAL. Design specifies individual invite-link + access-code per student (APS-REQ-005). Unique handle per student is the handles-only model (confirmed 2026-07-08). Provisioning mechanism not yet built. | Not built yet; must-fix before pilot. | Ido (build) |
| AUTH-002 | Cryptographically random invite tokens (min 128-bit entropy) | YES -- pilot-blocking (M6) | NOT BUILT. Requirement specified in gate-security-rambo.md M6. No implementation exists. | Full gap -- design only, not implemented. | Ido (build) |
| AUTH-003 | Invite token expiry (server-enforced, 72h recommended) | YES -- pilot-blocking (M7) | NOT BUILT. Requirement specified in gate-security-rambo.md M7. | Full gap -- design only. | Ido (build) |
| AUTH-004 | Access code: min 8-char alphanumeric, rate-limited (max 5 attempts / 15 min per code), hashed at rest | YES -- pilot-blocking (M8) | NOT BUILT. Requirement specified in gate-security-rambo.md M8. | Full gap -- design only. | Ido (build) |
| AUTH-005 | MFA -- second independent authentication channel (e.g. TOTP or SMS/email OTP independent of invite link) | YES -- Adam explicitly requires MFA for clinical/educational backends | GAP. The current invite-link + access-code model delivers both factors via email (same channel). This is NOT true MFA (two independent channels). Rambo's prior review did not explicitly flag MFA as a named control. Eyal confirms this is a new customer requirement (adam-answers-legal-review-eyal-2026-07-08.md Req 1). | MFA GAP. Most significant new gap from Adam's requirements. Owner must first clarify with Adam whether invite-link + strong access-code meets his intent for a formative pilot, or whether TOTP/OTP on a second channel is required. If true MFA is confirmed required: Ido must build it; no current implementation exists. If strong two-step (two credentials, strong crypto) is accepted by Adam: no new build required beyond AUTH-002 through AUTH-004. Owner relay to Adam required before this gap can be closed. | Owner (relay to Adam via A1-MFA); Ido (build if confirmed required) |
| AUTH-006 | Server-side RBAC on every transcript / evaluation / debrief / student-data endpoint | YES -- pilot-blocking (M9) | NOT BUILT. Requirement in gate-security-rambo.md M9 and APS-REQ-017/018. Design specifies RBAC roles (Student, Teacher, System Admin for pilot-minimal). | Full gap -- design only; backend RBAC enforcement not implemented. | Ido (build) |
| AUTH-007 | No shared admin or test credentials in prod; all accounts individually named and traceable | YES | NOT PROVISIONED (no prod environment yet). Must be enforced at provisioning time. | Procedural gap; not a build item but a go-live checklist item. | Ido (process); Shir (infra provisioning) |
| AUTH-008 | JWT / session library (no custom crypto); session expiry aligned to simulation max duration; invalidate on logout | YES -- pilot-blocking (M11) | NOT BUILT. Requirement in gate-security-rambo.md M11. | Full gap -- design only. | Ido (build) |

---

## CONTROL AREA 2: Encryption in Transit and at Rest

Adam requirement: DB encrypted in transit (HTTPS/SSL) AND at rest, so a compromised
server does not expose plaintext student data.

---

| # | Control | Required | Current state | Gap | Owner |
|---|---------|----------|---------------|-----|-------|
| ENC-001 | HTTPS/TLS enforced on all public-facing endpoints (no mixed content; HSTS header set) | YES -- pilot-blocking | ASSUMED but NOT EXPLICITLY CONFIRMED in any design doc. Eyal confirms this is an Adam-stated requirement that must be added to the pre-launch verification checklist (adam-answers-legal-review-eyal-2026-07-08.md Req 2). | Verification gap. HTTPS is standard practice; the gap is the absence of an explicit pre-launch check with a documented pass result. Add to pre-launch checklist: TLS cert confirmed, HSTS header set, no mixed content. | Ido (pre-launch checklist item); Shir (infra config) |
| ENC-002 | TLS enforced on all backend-to-database connections (app layer to PostgreSQL and Redis) | YES | ASSUMED for managed services with TLS-in-transit option. Not explicitly verified in any doc. | Verification gap. Must be confirmed when cloud provider is provisioned. Managed PG (RDS, Cloud SQL, Azure Flexible Server) supports TLS-in-transit; must be enabled, not just available. | Shir (infra provisioning); Ido (verify at staging) |
| ENC-003 | PostgreSQL encryption at rest (managed volume encryption or equivalent) | YES -- pilot-blocking (M15) | NOT PROVISIONED. Requirement in gate-security-rambo.md M15. All managed PostgreSQL providers support this as a configuration flag (RDS encrypted volume, Cloud SQL at-rest encryption, Azure Flexible Server transparent data encryption). | Full gap -- provider not provisioned; this is a configuration item at provisioning time, not a build item. Block: cloud provider must be confirmed (APS-004 gate) before this can be configured. | Shir (infra provisioning once provider confirmed) |
| ENC-004 | S3 / object storage server-side encryption (SSE) at rest | YES | IMPLICITLY covered under gate-security-rambo.md M12 (bucket private + Block Public Access) but SSE was not called out as a separate line item. Adam's explicit requirement elevates this. | Explicit gap: S3 SSE must be confirmed as a named requirement, not implied. Add to pre-launch infra checklist: SSE-S3 or SSE-KMS enabled on the student-data bucket. | Shir (infra provisioning) |
| ENC-005 | Redis session cache: TLS in transit and encryption at rest (or confirm no student PII stored in Redis, only session tokens + rate-limit counters) | YES | NOT CONFIRMED. devops-infra-shir.md specifies Redis for session tokens and rate-limit counters. Session tokens are sensitive (not student PII, but compromise = unauthorized session access). Encryption at rest for Redis is optional on some managed services. | Scoping gap. Confirm: does Redis hold any field that is sensitive beyond a session ID? If Redis holds only opaque session tokens and counters, TLS-in-transit is sufficient and at-rest encryption is secondary. If it holds anything richer: encrypt at rest. Clarify with Ido before provisioning. | Ido (scope confirmation); Shir (infra provisioning) |
| ENC-006 | Secrets (DB connection strings, API keys, JWT secret) stored in managed secrets store, never in code or committed files | YES | DESIGNED but NOT IMPLEMENTED. devops-infra-shir.md Section 3 documents the intended approach (AWS Secrets Manager / GCP Secret Manager / Azure Key Vault, provider TBD). | Design exists; implementation blocked on provider selection (APS-004 gate). No gap in intent; gap is execution, gated on provider. | Shir (infra once provider confirmed) |

---

## CONTROL AREA 3: Access Logging and Audit Trail

Adam requirement: automatic log of who accessed data, when, and what action
(view / edit / delete of a student evaluation).

---

| # | Control | Required | Current state | Gap | Owner |
|---|---------|----------|---------------|-----|-------|
| AUDIT-001 | Session-level audit log: every login (create), expiry, and failed/invalid attempt logged with timestamp and user handle | YES -- pilot-blocking | PARTIALLY DESIGNED. gate-security-rambo.md RISK 4/5 and M10 address session event logging. APS-REQ-106 specifies DiagnosticLog excludes tokens and transcripts. | Design addresses what must NOT be in logs (tokens) but does not specify what MUST be in the session log (login events). Must be made explicit in the build spec. Confirm with Ido that the session log captures: handle, timestamp, event type (login/expiry/failure). No real name or email in this log (handles-only model). | Ido (build spec + implementation) |
| AUDIT-002 | Resource-level access audit trail: every access to a student session record, transcript, evaluation, or persona history logs (user handle / role, timestamp, resource ID, action: view / export / evaluate / delete) | YES -- pilot-blocking | GAP. This is the most significant audit gap flagged by both Eyal and Adam. Rambo's prior review addressed RBAC enforcement (M9) and exclusion of sensitive data from logs (M10) but did not specify a positive access audit log of resource-level events. Adam's explicit requirement and Eyal's assessment (adam-answers-legal-review-eyal-2026-07-08.md Req 3) both confirm this is a launch-blocking gap. | FULL GAP. No design doc specifies an access audit log table tracking who accessed which session record, when, and what action they took. Must be designed and built before pilot. Requirements: (a) every API endpoint that returns transcript, evaluation, or persona history data records: user handle (not real name), role, timestamp, endpoint / resource ID, action type; (b) audit log must not contain clinical content (consistent with APS-REQ-106); (c) support staff access to elevated resources (APS-REQ-018) must be captured with a distinct action flag; (d) audit log is append-only and retained at least for the duration of the pilot + data retention window; (e) access to the audit log itself is restricted to System Admin only. This is a new must-fix item not previously in the M-series. Designate: M22. | Ido (design + build) -- M22 |
| AUDIT-003 | Credit audit log: every admin credit-add / deduct / reset / override logged with admin handle, action, amount, reason, timestamp (APS-REQ-143) | YES | DESIGNED in requirements-baseline.md APS-REQ-143. Not built. | Design exists; implementation not yet started. | Ido (build) |
| AUDIT-004 | No session token, invite code, or real student identifier ever written to any log (DiagnosticLog, audit log, application log, error monitoring) | YES -- pilot-blocking (M10) | DESIGNED in APS-REQ-106 and M10. Not yet implemented or verified. | Build and verification gap. Must be confirmed by code review and automated test (APS-REQ-138 privacy redaction test category). | Ido (build + QA); Adi (automated test) |
| AUDIT-005 | Sentry (or equivalent error monitoring): confirm no student transcript content, no PII (even pseudonymous session data beyond opaque error codes), no clinical data reaches the monitoring service; redaction rules at SDK level before enabling on this project | YES -- must be confirmed before Sentry is enabled on APS project | BLOCKED. devops-infra-shir.md Section 1 notes Sentry is subject to gate-register confirmation for this project. No gate row exists for Sentry on APS. Rambo prior review (devops-infra-shir.md gate-004 item 5) marks this BLOCKED. | Configuration and gate gap. Two actions: (1) Confirm Sentry is in the gate-register for this project with a scope confirming redaction rules prevent any student data egress; (2) Ido implements SDK-level redaction before Sentry is enabled. Neither action can be skipped. | Rambo (gate-register entry if Sentry is adopted for APS); Ido (SDK redaction config) |

---

## CONTROL AREA 4: Network Security (Patching, Firewall, DB Isolation)

Adam requirement: routine patching, firewall configuration, DB layer isolated from
public web traffic.

---

| # | Control | Required | Current state | Gap | Owner |
|---|---------|----------|---------------|-----|-------|
| NET-001 | PostgreSQL instance in private VPC subnet -- no public IP; accessible only from application tier | YES -- pilot-blocking | NOT PROVISIONED. devops-infra-shir.md Section 2 documents the cloud options (AWS il-central-1, GCP me-west1, Azure israelcentral). None are provisioned yet. VPC private subnet is the expected architecture for all three options. | Configuration gap, not a design gap. Explicit requirement: PostgreSQL must be provisioned with no public IP, in a private VPC subnet, accessible only from the NestJS application tier's security group / service account. Must be verified and documented at provisioning. Eyal confirms this is a launch-blocker (adam-answers-legal-review-eyal-2026-07-08.md Req 4). | Shir (infra provisioning); Ido (verify at staging) |
| NET-002 | Application-layer security groups / firewall rules: NestJS API accessible only on HTTPS (443); no other inbound ports open from public internet; outbound restricted to required services (LLM API, email provider, S3) | YES | NOT PROVISIONED. Standard cloud security group practice for the intended stack. | Configuration gap. Security group rules must be explicitly documented and verified at provisioning, not assumed. Add to Shir's infra checklist. | Shir (infra provisioning) |
| NET-003 | Redis cache in private subnet; not accessible from public internet | YES | NOT PROVISIONED. Same VPC pattern as PostgreSQL. | Configuration gap. Redis must be in the same private subnet as the app tier, not exposed publicly. Verify at provisioning. | Shir (infra provisioning) |
| NET-004 | S3 bucket: Block Public Access enabled; no public bucket policy; no permanent public object URLs | YES -- pilot-blocking (M12) | NOT PROVISIONED. Requirement in gate-security-rambo.md M12. | Full gap -- provider not provisioned; configuration item at provisioning. | Shir (infra provisioning) |
| NET-005 | Pre-signed URLs for all S3 object access; short TTL (max 15 minutes) | YES -- pilot-blocking (M13) | NOT BUILT. Requirement in gate-security-rambo.md M13. | Full gap -- build item. | Ido (build) |
| NET-006 | Least-privilege IAM role for application S3 access: bucket-scoped, no delete capability for the app role | YES -- pilot-blocking (M14) | NOT PROVISIONED. Requirement in gate-security-rambo.md M14. | Configuration gap at provisioning. | Shir (infra provisioning) |
| NET-007 | Managed PostgreSQL auto-minor-version patching enabled (or equivalent: manual patching SLA confirmed) | YES | NOT PROVISIONED. For managed RDS/Cloud SQL/Azure Flexible Server: auto-patching for minor versions is a provider feature that must be enabled, not just available. | Configuration gap. For managed services: enable auto minor-version patching at provisioning. Document the patch policy: "auto-patch minor versions enabled on RDS; OS-level patches managed by provider; application dependencies (npm) audited before launch; security patches applied within 7 days of disclosure." Pilot does not need a formal patch management system -- the documented policy is sufficient. | Shir (infra provisioning); Ido (app dependencies) |
| NET-008 | Application dependency audit (npm packages in Next.js + NestJS) before pilot launch -- scan for known vulnerabilities; no unpatched critical CVEs in production | YES | NOT DONE. No record of a dependency security scan in any APS doc. | Pre-launch gap. Run npm audit (or equivalent: Snyk, Dependabot) before staging QA and before prod deploy. Any critical severity CVE must be resolved before go-live. Adi's QA plan should include a dependency scan gate. | Ido (pre-launch); Adi (QA gate) |
| NET-009 | SPF + DKIM + DMARC on sending domain before any invite email is sent to real students | YES -- pilot-blocking (M17) | NOT CONFIGURED. Requirement in gate-security-rambo.md M17. Sending domain and email service provider not yet selected. | Full gap -- blocked on email provider selection (APS-004 gate). SPF/DKIM/DMARC are DNS + email-service configuration items, not code items. Cannot be closed until provider is selected and domain is configured. | Ido (infra + DNS config once provider selected); Rambo (gate-register entry for email service) |
| NET-010 | Invite link confirmation flow (redirect / confirmation step) to protect tokens from email scanner prefetch consuming the single-use token | YES -- pilot-blocking (M18) | NOT BUILT. Requirement in gate-security-rambo.md M18. | Full gap -- build item. | Ido (build) |

---

## CONTROL AREA 5: Data Handling and Privacy (PPL-specific; Rambo/Eyal shared)

These items sit at the security/legal boundary. Rambo flags them; Eyal owns the legal
determination. Both are required before pilot launch.

---

| # | Control | Required | Current state | Gap | Owner |
|---|---------|----------|---------------|-----|-------|
| DATA-001 | Handles-only implementation: no real student names, emails, or institutional IDs ever stored in platform DB, logs, transcripts, API calls, or error monitoring | YES -- PPL-blocking (handles-only model is only valid if cleanly implemented) | DESIGNED (confirmed 2026-07-08 by Eyal + Eyal-note-adam-data-handling). Not yet built. | Design is sound. Gap is implementation: every data model, API, and log output must be reviewed to confirm no real identifier enters the system. This must be a code-review gate before pilot launch, not an assumption. | Ido (build + code review); Rambo (verify at pre-launch scan) |
| DATA-002 | No real student data in dev or staging environments; synthetic / anonymised data only | YES -- pilot-blocking (M20) | NOT CONFIRMED in any APS doc (devops-infra-shir.md Section 3 documents the intent). | Procedural gap. Confirm with Ido that dev and staging environments are seeded with synthetic data only. No exception. Owner A1 required for any production data copy to non-production environment. | Ido (process); Shir (env config) |
| DATA-003 | LLM provider DPA in place before any student session data is processed | YES -- PPL-blocking (M1, A1-LLM) | NOT EXECUTED. Anthropic DPA is compliance-backlog Item 6, elevated to APS-blocking status by Eyal. If OpenAI is used: separate DPA required. | APS-BLOCKING. Requires owner A1 to execute. Neither provider may be used for student session data until the DPA is signed and the account is confirmed on the commercial plan (Eyal: anthropic-dpa-review-eyal.md). | Owner (A1-LLM); Eyal (advise) |
| DATA-004 | Object storage (cloud) provider DPA in place before student session data is stored | YES -- PPL-blocking (M2, A1-OS) | NOT EXECUTED. Provider not selected; DPA not in place. | APS-BLOCKING. Requires owner A1. Cloud provider DPA must be confirmed against the APS data types before provisioning. | Owner (A1-OS); Eyal (review DPA) |
| DATA-005 | Email service DPA in place before invite links (containing student handles) are sent | YES -- PPL-blocking (M2 partial) | NOT EXECUTED. Email provider not selected. | APS-BLOCKING. Eyal confirms this is required before invite emails go to students. | Owner (A1); Eyal (advise on provider DPA) |
| DATA-006 | Pilot Agreement between Eco-Synthetic and Adam / Gome Gevim College signed before pilot begins (covers: handles-only model, security commitments, IP, confidentiality) | YES -- Adam explicitly requested; A1-PA | NOT DRAFTED. Eyal confirms this is now elevated from recommended to explicitly requested by Adam (adam-answers-legal-review-eyal-2026-07-08.md Section 2). | Legal gap. Adam wants this written down. The Pilot Agreement must reference the security controls in this checklist. Owner A1 to approve before sending. | Eyal (draft); Owner (A1 approve + send) |
| DATA-007 | Student privacy notice in Hebrew (plain language) confirming handles-only model, institutional contact, AI-disclosure, off-ramp signpost; displayed before first session | YES -- pilot-blocking (A1-SN) | NOT DRAFTED. gate-legal-privacy-eyal.md and eyal-note-adam-data-handling require this. | Full gap. Must be built into the UI (non-dismissable before first session). Text requires owner A1. | Eyal (draft text); Owner (A1 approve); Ido (build UI mechanism) |
| DATA-008 | DiagnosticLog redaction: no tokens, no transcript content, no student notes; structured error codes + session metadata only; 90-day auto-delete lifecycle rule | YES -- pilot-blocking | DESIGNED in APS-REQ-106 and devops-infra-shir.md Section 4. Not built. | Build and verification gap. Rambo must confirm the redaction rule set is sufficient before the DiagnosticLog bucket is provisioned. | Ido (build redaction + auto-delete rule); Rambo (verify spec before bucket provisioning) |
| DATA-009 | No clinical transcript content in any support email body | YES -- pilot-blocking (M19) | DESIGNED in APS-REQ-106/107. Not built or verified. | Build and QA gap. | Ido (build + code review); Adi (QA test) |
| DATA-010 | LLM prompt injection filter on student input (input sanitisation before any student message enters an LLM call) | YES -- pilot-blocking (M3) | NOT BUILT. Requirement in gate-security-rambo.md M3. | Full gap -- build item. | Ido (build) |
| DATA-011 | Ground-truth / hidden case facts NOT present in the LLM generation context (pattern b or c per gate-security-rambo.md) | YES -- pilot-blocking (M4) | NOT BUILT. Architecture decision required in the technical spec. | Design + build gap. Must be documented in engine-architecture spec before build. | Ido (design spec + build) |
| DATA-012 | Debrief call structural isolation (debrief LLM call does not receive ground-truth / persona; only transcript + rubric + evaluation output) | YES -- pilot-blocking (M5) | NOT BUILT. Requirement in gate-security-rambo.md M5. | Full gap -- build item. | Ido (build) |
| DATA-013 | Data residency: cloud provider in Israeli region (il-central-1, me-west1, or israelcentral) confirmed before provisioning | YES -- Eyal + owner decision pending (M21) | UNDER ASSESSMENT. devops-infra-shir.md Section 2 documents options. No provider confirmed. | Decision pending owner A1 and Eyal DPA review of chosen provider. AWS il-central-1 is the recommended lowest-friction option per Shir's plan. | Owner; Eyal (confirm DPA covers chosen region); Shir (provision once confirmed) |

---

## Summary: Top Gaps Blocking a Compliant Pilot

Ordered by severity and path-dependency.

| Priority | Gap | Blocker type | Must-fix ID | Owner |
|----------|-----|--------------|-------------|-------|
| P1 | LLM provider DPA not executed -- no student session data may be processed without it | PPL-BLOCKING | M1 / DATA-003 | Owner A1-LLM; Eyal |
| P1 | Cloud provider and object storage DPA not executed -- no student data may be stored | PPL-BLOCKING | M2 / DATA-004 | Owner A1-OS; Eyal |
| P1 | Email service DPA not executed -- no invite emails to students | PPL-BLOCKING | M2 partial / DATA-005 | Owner A1; Eyal |
| P1 | Pilot Agreement with Adam not drafted / signed -- Adam has explicitly requested it | LEGAL + CUSTOMER | DATA-006 / A1-PA | Eyal (draft); Owner (A1) |
| P1 | MFA gap -- invite-link + access-code both via email is NOT true MFA; Adam requires MFA | CUSTOMER-CONFIRMED GAP | AUTH-005 | Owner relay (A1-MFA); Ido if true MFA required |
| P1 | Resource-level access audit log (who/when/what action) not designed or built | CUSTOMER-CONFIRMED GAP / M22 | AUDIT-002 | Ido (new must-fix M22) |
| P1 | DB private VPC subnet / no public IP -- not provisioned or verified | CUSTOMER-CONFIRMED GAP | NET-001 | Shir (provisioning) |
| P1 | All authentication controls (M6 / M7 / M8 / M9 / M11) not built | BUILD GAP | AUTH-002 through AUTH-008 | Ido (build sprint) |
| P2 | PostgreSQL encryption at rest -- not provisioned | CONFIG GAP | M15 / ENC-003 | Shir (provisioning) |
| P2 | S3 SSE + Block Public Access + pre-signed URLs + least-privilege IAM -- not provisioned/built | CONFIG + BUILD GAP | M12 / M13 / M14 / ENC-004 / NET-004 through NET-006 | Shir + Ido |
| P2 | Student privacy notice (Hebrew) not drafted or built into UI | LEGAL + BUILD GAP | DATA-007 / A1-SN | Eyal (text); Ido (UI) |
| P2 | HTTPS/TLS: assumed but not explicitly verified; no pre-launch checklist item | VERIFICATION GAP | ENC-001 | Ido + Shir (pre-launch checklist) |
| P2 | SPF / DKIM / DMARC: not configured; email provider not selected | CONFIG GAP | M17 / NET-009 | Ido + Shir (once provider confirmed) |
| P2 | Input sanitisation / injection filter on student LLM input not built | BUILD GAP | M3 / DATA-010 | Ido (build) |
| P2 | Ground-truth hidden-fact architecture (pattern b or c) not designed in tech spec | DESIGN + BUILD GAP | M4 / DATA-011 | Ido (design then build) |
| P2 | Debrief call structural isolation not built | BUILD GAP | M5 / DATA-012 | Ido (build) |
| P2 | Handles-only not implemented / verified (design only) | BUILD + REVIEW GAP | DATA-001 | Ido (build + code review) |
| P3 | Application dependency audit (npm) before launch -- not done | PRE-LAUNCH GAP | NET-008 | Ido; Adi (QA gate) |
| P3 | Sentry gate-register entry for APS project + SDK redaction not in place | GATE + CONFIG GAP | AUDIT-005 | Rambo (gate row); Ido (SDK config) |
| P3 | DiagnosticLog redaction spec and 90-day auto-delete not built / verified | BUILD GAP | M10 / DATA-008 | Ido (build); Rambo (verify spec) |
| P3 | Patching policy document not written | DOCUMENTATION GAP | NET-007 | Shir |
| P3 | No clinical transcript content in support email -- not built or QA-tested | BUILD + QA GAP | M19 / DATA-009 | Ido (build); Adi (QA) |
| P3 | Invite link confirmation flow (anti-scanner-prefetch) not built | BUILD GAP | M18 / NET-010 | Ido (build) |

---

## Items requiring owner A1

All of the following cannot proceed without explicit owner A1. None can be delegated.

| # | Item | Why A1 | Timing |
|---|------|--------|--------|
| A1-LLM | Execute DPA with LLM provider (Anthropic or OpenAI) before any student transcript processed | Legal commitment; commits the company as a processor or sub-processor | Before pilot launch; APS-blocking |
| A1-OS | Execute DPA with object storage provider (cloud) before student session data stored | Legal commitment | Before infra provisioning |
| A1-PA | Approve and send Pilot Agreement to Adam | External legal commitment; Adam explicitly requested it | Before pilot begins |
| A1-SN | Approve student privacy notice (Hebrew) | Public-facing legal document | Before first pilot session |
| A1-MFA | Clarify with Adam via relay: does invite-link + strong access-code meet his MFA intent, or is TOTP/OTP on a second channel required? | Commercial / scope decision; shapes Pilot Agreement content | Before Pilot Agreement is drafted |
| A1-DR | Confirm cloud provider and data residency choice (M21 / DATA-013) | Spend decision; entity selection for DPA signing | Before infra provisioning |

---

## Eyal coordination note

Eyal is working the legal/DPA leg in parallel (per task scope). Rambo flags the following
items where the two lanes must converge before any action:

1. DATA-003 (LLM DPA): Eyal has confirmed Anthropic's commercial API DPA covers Israeli
   PPL processor obligations CLEAR-WITH-CONFIG (anthropic-dpa-review-eyal.md, 2026-06-30).
   Three owner A1 config steps remain (confirm commercial plan, enable zero-retention,
   download DPA copy). Rambo endorses Eyal's determination. No additional Rambo security
   analysis needed on the DPA itself -- owner execution is the remaining action.

2. DATA-004 / DATA-005 (cloud and email provider DPAs): Eyal confirms both are expected-
   workable but require live confirmation per chosen provider before execution. Gate-register
   rows must exist before either provider is used with student data.

3. DATA-006 (Pilot Agreement): Eyal confirms drafting is now elevated to explicitly requested
   by Adam. The security commitments in this checklist feed directly into the agreement's
   security annex. Eyal to draft; owner to approve and send.

4. AUDIT-002 (access audit log): both Adam and Eyal confirm this is a launch-blocking gap.
   Rambo designates this M22 (new must-fix). Ido must design the audit log table before
   the next build sprint.

5. AUTH-005 (MFA): owner must relay to Adam before Eyal can finalize the Pilot Agreement
   security commitments (A1-MFA item above). Rambo cannot resolve the MFA gap without
   knowing Adam's intent. If true MFA is required: this is a significant build item for
   Ido and a timeline risk for the 1 September pilot target.

6. DATA-013 (data residency): both Rambo and Eyal must sign off on the chosen cloud provider
   region before provisioning. Shir's recommendation (AWS il-central-1) is the current
   front-runner; Eyal must confirm the AWS il-central-1 DPA covers the APS data types.

---

## New must-fix item (not in prior M-series)

M22 -- Resource-level access audit log: a dedicated audit log table (or DiagnosticLog
extension) recording, for every API call that returns transcript / evaluation / persona
history data: user handle, role, timestamp, resource ID (session_id or equivalent), action
type (view / export / evaluate / delete). Append-only. No clinical content. Access
restricted to System Admin. Retained for pilot duration + data retention window.
Owner: Ido (design + build). This item was not in gate-security-rambo.md. It is now
a must-fix confirmed by Adam's requirement and Eyal's assessment.

---

*Assessor: Rambo (Security, L3). Internal only. Not for external sharing without owner A1.*
*Coordinates with: Eyal (Legal) on all DPA / legal items above.*
*Version: 1.0 | Date: 2026-07-08.*
