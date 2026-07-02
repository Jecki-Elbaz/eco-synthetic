# APS -- DevOps + Infra Plan (Pilot)
# Author: Shir (DevOps, R&D) | Date: 2026-06-29 | Task: APS Sprint 1 / APS-004 gate input
# Status: PLANNING ONLY -- no provisioning, no deploy, no data stored
# Audience: Ido (VP R&D), Rambo (Security), Eyal (Legal/Privacy)
# Gate dependency: APS-004 (Rambo + Eyal) must clear before ANY student-data infra is provisioned

---

## 1. Target Architecture -- Pilot (one institution, <200 students)

### Application tier

| Component | Role | Notes |
|-----------|------|-------|
| Next.js (frontend) | Student/teacher UI, RTL Hebrew, SSR | Deployed as containerised Node service or Vercel-equivalent |
| NestJS (backend API) | REST/WS API, auth, RBAC, business logic | Separate container; no shared context with support agent |
| AI patient engine (NestJS module) | Turn pipeline, PatientStateLog, guard-model pass | Strict context isolation from support assistant -- separate API call paths, no shared session or context store (per APS-REQ-111 / Sami s. 4.4) |
| Support assistant (NestJS module) | Deterministic only (v1); no LLM access to patient state | Enforced at infra level: no patient-engine routes exposed to support service paths |

### Data tier

| Component | Product | Notes |
|-----------|---------|-------|
| Primary DB | Managed PostgreSQL (candidate provider TBD -- APS-004) | All relational data, JSONB for PatientStateLog + StudentPersonaHistory stubs |
| Cache / session | Managed Redis | Session tokens, rate-limit counters, sliding-window state cache |
| Object storage | S3-compatible bucket | DiagnosticLogs ONLY (redacted -- see s. 3); NOT transcripts; NOT student notes; separate bucket from any other storage |

### Supporting services

| Service | Role | Gate status |
|---------|------|-------------|
| CI/CD | GitHub Actions | Existing tooling; no new adoption needed |
| Error monitoring | Sentry (existing, check gate-register) | Confirm Sentry scope in gate-register before enabling on this project |
| Email sending (support escalation) | TBD -- APS-004 item 4 | Do not adopt until Rambo clears |
| LLM API | TBD -- APS-004 item 2 | Blocked; use mock stubs in Sprint 1+early Sprint 2 |
| Dictation / STT | TBD -- APS-004 item 3 | Blocked; use typed fallback in dev until cleared |

### Scale assumption
Pilot: 1 college, 1-3 courses, <200 students, concurrent load well under 50 simultaneous sessions.
Single-region deployment is sufficient for the pilot. Multi-region is Phase 2.

---

## 2. Cloud Provider Options -- Israel Data-Residency Lens

Provider selection is NOT made here. This section is input for the APS-004 gate (Rambo + Eyal).
DO NOT provision anything until APS-004 verdict is received.

### Residency baseline
Students are Israel-based. Applicable law: Israeli Privacy Protection Law 5741-1981 (and
any 2023 amendment in force). The data held (simulation transcripts, PatientStateLog,
StudentPersonaHistory.notable_mistakes) is clinical-adjacent sensitive personal data about
identified students (confirmed: Sami s. 9.5, requirements-baseline Flag 5/6).
Data must not leave a jurisdiction that provides adequate protection without explicit legal
basis and student disclosure.

### Option A -- AWS (eu-west-1 / il-central-1)

| Dimension | Detail |
|-----------|--------|
| Residency | AWS il-central-1 (Tel Aviv) launched 2023. Data stays in Israel by default. |
| Managed PostgreSQL | Amazon RDS for PostgreSQL or Amazon Aurora PostgreSQL |
| Managed Redis | Amazon ElastiCache (Redis OSS) |
| Object storage | Amazon S3 (il-central-1 bucket) |
| DPA / sub-processors | AWS Data Processing Addendum available; il-central-1 sub-processor list must be verified by Eyal |
| Cost | il-central-1 carries a regional premium (~15-20% above eu-west-1 typical). For pilot scale (<200 students), absolute cost is low (rough order of magnitude: $200-600/mo for RDS t3.medium + ElastiCache t3.micro + minimal S3). Exact estimate pending provider confirmation. |
| Operational simplicity | High -- team likely has AWS familiarity; managed services reduce ops burden |
| Residency confidence | HIGH if il-central-1 is used and bucket/DB policies restrict replication to that region |
| Cons | Regional premium; il-central-1 service catalog is smaller than us-east-1 / eu-west-1 (some managed services not yet available); must confirm Aurora is available in il-central-1 or fall back to RDS |

### Option B -- GCP (me-west1 / europe-west region)

| Dimension | Detail |
|-----------|--------|
| Residency | GCP me-west1 (Tel Aviv) launched 2023. Data stays in Israel. |
| Managed PostgreSQL | Cloud SQL for PostgreSQL |
| Managed Redis | Memorystore for Redis |
| Object storage | Cloud Storage (me-west1 bucket) |
| DPA / sub-processors | Google Cloud DPA available; me-west1 sub-processor list must be verified by Eyal |
| Cost | me-west1 pricing comparable to AWS il-central-1 range; rough pilot estimate similar to Option A. |
| Operational simplicity | Medium -- less common in Israeli startup dev teams than AWS; some additional learning curve |
| Residency confidence | HIGH if me-west1 is enforced at org-policy level (GCP org constraints can lock region) |
| Cons | Lower team familiarity likely; me-west1 is newer region, some services lag in availability; Memorystore has fewer configuration options than ElastiCache |

### Option C -- Azure (israelcentral)

| Dimension | Detail |
|-----------|--------|
| Residency | Azure israelcentral region (2023). Data stays in Israel. |
| Managed PostgreSQL | Azure Database for PostgreSQL Flexible Server |
| Managed Redis | Azure Cache for Redis |
| Object storage | Azure Blob Storage |
| DPA / sub-processors | Microsoft DPA (Online Services Terms) available; israelcentral sub-processor list must be verified by Eyal |
| Cost | Comparable range to AWS/GCP for pilot scale. Azure has strong non-profit/academic pricing -- worth checking if Eco-Synthetic qualifies. |
| Operational simplicity | Medium -- team familiarity likely lower than AWS; Azure portal UI is heavier |
| Residency confidence | HIGH if israelcentral is locked in Azure Policy |
| Cons | Highest operational overhead of the three for a team without Azure experience; Flexible Server is GA but younger product |

### Option D -- EU region fallback (if Israel-region provider has blocking issue)

If all IL-region options have a blocking legal or commercial issue identified by Eyal, the
fallback is an EU region (AWS eu-west-1 Frankfurt/Ireland, GCP europe-west3, Azure westeurope).
EU regions operate under GDPR and the EU-Israel adequacy arrangement. Residency is NOT in
Israel but the legal framework is strong and well-documented.

IMPORTANT: This option REQUIRES Eyal to confirm it satisfies Israeli Privacy Protection Law
obligations for student data held outside Israel. Do not assume EU = adequate without Eyal sign-off.

### Summary comparison

| Criterion | AWS il-central-1 | GCP me-west1 | Azure israelcentral | EU fallback |
|-----------|-----------------|--------------|--------------------|-|
| IL data residency | Yes | Yes | Yes | No (EU only) |
| Managed PG | Yes (RDS/Aurora) | Yes (Cloud SQL) | Yes (Flexible Server) | Yes (all) |
| Managed Redis | Yes | Yes | Yes | Yes (all) |
| Team familiarity | Likely HIGH | Likely MEDIUM | Likely LOW | Likely HIGH |
| Cost (pilot scale) | ~$200-600/mo est. | ~$200-600/mo est. | ~$200-600/mo est. | Lower (~10-20%) |
| Residency confidence | HIGH | HIGH | HIGH | Conditional on Eyal |
| DPA available | Yes | Yes | Yes | Yes (all) |

Recommendation FOR THE GATE (not a choice): AWS il-central-1 is the likely lowest-friction
option given team familiarity and residency confidence. GCP me-west1 is a credible alternative.
Rambo/Eyal must make the final call.

---

## 3. Environments, Secrets Management

### Environments

| Env | Purpose | Data | Notes |
|-----|---------|------|-------|
| local-dev | Developer workstation | Mock/seeded data ONLY; no real student data ever | Docker Compose: local PG + Redis |
| staging | Pre-prod integration + QA | Synthetic test data ONLY; never real student data | Mirrors prod config; reset between QA runs |
| prod | Live pilot (1 Sep onward) | Real student data | Provisioned ONLY after APS-004 gate clears |

Promotion path: local-dev -> staging (via PR merge) -> prod (manual A1 approval gate per constitution / Shir role file).

### Secrets management -- conceptual (no real values here; red line 1 enforced)

Secrets are NEVER committed to git. Approach:
- Runtime secrets (DB connection strings, Redis URL, LLM API key, email service key, JWT secret)
  injected as environment variables from a managed secrets store at deploy time.
- Candidate stores (pending APS-004 provider decision):
  - AWS: AWS Secrets Manager or Parameter Store (SecureString)
  - GCP: Secret Manager
  - Azure: Key Vault
- CI/CD secrets (GitHub Actions): stored in GitHub Actions encrypted secrets; never logged;
  never echoed in pipeline output.
- No secrets in docker-compose.yml, .env files in repo, any tracked config file, or logs.
- .env files for local dev use only (gitignored); developers seed from a shared secure doc
  (out of repo), not from a committed file.
- Secret rotation: Ido approves rotation schedule; Shir executes; no rotation without gate.

---

## 4. Backup, Retention, and Erasure Design

### Backup

| Target | Approach | Frequency | Retention |
|--------|---------|-----------|-----------|
| PostgreSQL (prod) | Managed provider automated backup (point-in-time recovery) | Continuous / daily snapshots | 7-day rolling retention for snapshots; PITR window minimum 7 days |
| Redis (prod) | RDB snapshot or AOF (provider managed) | Daily | 2 days (cache is reconstructable; not primary store) |
| DiagnosticLog bucket (S3-compatible) | Object versioning OFF (redacted logs; no PII retained per design); lifecycle rule to delete after retention window | n/a | 90 days max then auto-delete (support diagnostic purpose only; not a student record) |

### Data retention and erasure -- 12-month rule (APS-REQ-160)

StudentPersonaHistory (Phase 1b runtime; schema stubs in pilot):
- Retention: 12 months from last session activity per student-persona pair.
- Mechanism: a background job (scheduled task, weekly run) queries for StudentPersona records
  where last_session_at < NOW() - 12 months and soft-deletes (archive flag) or hard-deletes
  per policy.
- Policy choice (archive vs delete): requires Eyal sign-off before Phase 1b implementation.
  Israeli privacy law minimisation principle likely favours hard delete or irreversible
  anonymisation after the retention window. Do not implement archive-only without Eyal confirmation.
- "notable_mistakes" field: Sami (s. 9.5) flags this as the highest-sensitivity field.
  Consider separate retention logic or shorter window. Flag to Eyal before Phase 1b build.
- Student access/correction rights: Eyal must advise whether students have a right to view,
  correct, or request deletion of their StudentPersonaHistory under Israeli law before the
  12-month window expires.

Transcript data:
- Session transcripts (TranscriptMessage table) are primary student record data.
- Retention period: to be confirmed by Eyal. Recommendation: align to academic year + buffer
  (minimum until grade dispute window closes, typically 1-2 years), then delete.
- Not the same retention period as DiagnosticLogs (which are 90-day operational logs).

DiagnosticLogs (APS-REQ-106):
- Redacted before storage: no tokens, no transcript content, no student notes, no free-text
  student input. Structured error codes + session metadata only.
- Stored in a separate S3-compatible bucket, not in the primary DB.
- Auto-deleted at 90 days via bucket lifecycle policy.
- Access: Support Staff + System Admin only (no student-facing access).

### Erasure on student account deletion
- If a student account is deleted (by admin or on student request), cascade delete or
  anonymise: TranscriptMessages, PatientStateLog, StudentPersonaHistory, UsageLog rows
  linked to that student_id.
- Audit log of deletion event retained (without PII) for compliance.
- Implementation design: use a soft-delete + scheduled purge pattern; hard purge runs on
  a confirmed schedule to allow rollback window (72h) before irreversible deletion.
- Requires Eyal sign-off on the exact cascade scope before implementation.

---

## 5. Deploy / Rollback + Uptime / Alerting

### CI/CD pipeline (GitHub Actions)

Stage order:
1. Lint + type-check (ruff equivalent for TS: ESLint + tsc)
2. Unit tests (Jest)
3. Build Docker images (Next.js + NestJS)
4. Push to container registry (provider-managed: ECR / Artifact Registry / ACR)
5. Deploy to STAGING automatically on PR merge to main
6. Deploy to PROD: manual trigger only, requires Ido A1 sign-off per gate (A1 per Shir role file)

No auto-deploy to prod. Ever.

### Rollback

- Container-based deploy: rollback = redeploy previous image tag. Tag every prod image with
  git commit SHA + timestamp. Never use "latest" tag in prod.
- DB schema rollback: Prisma migration files are forward-only in normal flow. Any destructive
  migration (DROP COLUMN, data transform) is a separate migration file requiring Ido review
  before merge. Rollback of a data-destructive migration is A1 (Shir role file: A1 if
  data-destructive).
- RTO target (pilot): 30 minutes for application-layer issues; 2 hours for DB restore from
  backup (rough estimate at managed PG PITR; confirm with provider).
- Rollback decision threshold: Shir owns rollback decision at A2 if incident is active and
  no data-destructive step is needed. A1 required if rollback involves data changes.

### Uptime and alerting

| What | How | Threshold |
|------|-----|-----------|
| Uptime probe | HTTP health endpoint (/health) polled from provider monitoring or a lightweight external ping (e.g., provider-native CloudWatch / Cloud Monitoring) | Alert if >1 min downtime |
| Error rate | Sentry (confirm gate-register entry for this project before enabling) | Alert if error rate >1% per 5-min window |
| LLM cost spike | UsageLog aggregate job; compare rolling 1h cost vs baseline | Alert if 3x baseline in 1h (APS-REQ-132) |
| Credit hard limit | In-app logic; alert to admin in-platform + email when hard limit hit | Immediate |
| DB CPU / storage | Provider-native CloudWatch / Cloud Monitoring alerts | CPU >80% for 5 min; storage >80% capacity |
| Redis memory | Provider-native alert | >75% memory used |

On-call (pilot): Shir is first responder for infra alerts. Escalation to Ido per incident
playbook if not resolved within 30 minutes or if A2/A1 gate is triggered.

Pilot SLA target (internal, not contractual): 99.5% uptime during academic hours (Sun-Thu
08:00-22:00 IST). Below that threshold: incident report to Ido same day.

---

## 6. APS-004 Hard Gate -- What MUST Clear Before Any Student-Data Infra Is Provisioned

This is the blocker checklist. Nothing below "Cleared" is provisioned in a student-data
environment until Rambo and Eyal return written verdict on each item.

| # | Item | Owner | Status |
|---|------|-------|--------|
| 1 | Cloud provider confirmed (IL or EU-equivalent); DPA signed; sub-processors reviewed | Eyal + Rambo | BLOCKED |
| 2 | LLM/AI API provider selected; data-handling terms reviewed against Israeli privacy law; confirm whether student transcript fragments sent to LLM API constitute sensitive personal data under IL law; confirm provider processes data only for inference (no training on our data without consent) | Eyal + Rambo | BLOCKED |
| 3 | Dictation / STT provider selected; same data-handling review as LLM API; confirm audio fragments are not retained by provider beyond transcription | Eyal + Rambo | BLOCKED |
| 4 | Email sending service for support escalation selected; Rambo security review (no student PII in email service beyond address + ticket metadata; confirm SPF/DKIM alignment with platform domain) | Rambo | BLOCKED |
| 5 | Sentry (error monitoring) scope confirmed for this project: confirm no student transcript content, no PII, no clinical data reaches Sentry; redaction rules in place at SDK level before enabling | Rambo | BLOCKED |
| 6 | StudentPersonaHistory "notable_mistakes" field: Eyal advises on data classification, retention minimisation, student access/correction rights under Israeli Privacy Protection Law 5741-1981 (and any 2023 amendment in force) | Eyal | BLOCKED |
| 7 | 12-month retention policy: Eyal confirms archive-vs-hard-delete choice for StudentPersonaHistory; confirms whether cascade-delete on student account deletion is legally required or recommended | Eyal | BLOCKED |
| 8 | DiagnosticLog redaction spec: Rambo confirms the redaction rule set (no tokens, no transcript, no student notes) is sufficient before DiagnosticLog bucket is stood up | Rambo | BLOCKED |
| 9 | Confirm whether student PII in transcripts and PatientStateLog is subject to any cross-border transfer restriction even within a named cloud provider (sub-processor chains that leave IL) | Eyal | BLOCKED |
| 10 | Clinical advisor approved student welfare safeguarding protocol (Sami s. 4.1, s. 4.2); Flag Type A vs Flag Type B routing confirmed at infrastructure level (separate alert routes, not same queue) | Clinical advisor + Ido | BLOCKED -- not a security/legal item, but a build dependency before any prod session runs |

Shir action once APS-004 clears: provision staging environment first, verify config, run QA
cycle, then request Ido A1 for prod provisioning. No shortcuts.

---

## 7. What Shir Can Do NOW (Before APS-004 Clears)

- Local dev Docker Compose setup (Postgres + Redis local; no cloud; no student data).
- CI/CD pipeline scaffolding (GitHub Actions lint/test/build stages; staging deploy stage
  wired but not connected to any cloud endpoint yet).
- Container image build and tagging conventions (documented; not pushed to any registry yet).
- Health endpoint and alerting schema design.
- Secrets injection pattern design (documented; no real secrets; no provider selected yet).
- Backup and retention config templates (ready to apply once provider is confirmed).
- This document (infra plan for the gate).

---

*Internal only. Not for external sharing without owner A1.
No provisioning, no deploy, no data stored. Provider selection gated by APS-004 (Rambo + Eyal).*
