# APS -- Production Container Image Design
# Author: Shir (DevOps, R&D) | Date: 2026-06-30 | Task: APS Sprint 1 / owner directive 2026-06-30
# Status: DESIGN ONLY -- no provisioning, no build, no registry push.
# Gate: APS-004 (Rambo + Eyal) must clear before any production infrastructure is created.
# Audience: Ido (VP R&D), owner (A1 decisions called out explicitly below)
# ASCII only -- no smart quotes, no em dashes.

---

## 1. Image Count: 2 Images

Two images: one for `apps/web` (Next.js), one for `apps/api` (NestJS).

Rationale:
- The support assistant must be isolated from the patient engine at the infrastructure
  level, not just by code convention (Sami s. 4.4 / APS-REQ-111). Two separate images
  make the network boundary enforceable: the API image hosts both engine and support routes,
  but the images can be scaled independently and the web container never reaches internal
  engine state.
- Independent scaling: patient engine turns are CPU/memory intensive (LLM calls); the
  Next.js frontend is I/O-bound. Separate images let us scale them independently without
  over-provisioning the web tier.
- Independent rollback: a UI-only change can roll back the web image without touching the
  API, and vice versa.
- Build cache efficiency: Next.js and NestJS have different build pipelines; a single
  combined image would bust cache on every change to either.

A single image is rejected: it conflates concerns, complicates independent scaling and
rollback, and makes the support/engine isolation boundary harder to audit at the infra level.

---

## 2. Dockerfiles

### Monorepo / pnpm workspace build strategy

The monorepo uses pnpm workspaces + turbo. The canonical pattern for building in-image:

1. Copy the full repo at the start (or use a pruned workspace -- see below).
2. `pnpm install --frozen-lockfile` to restore all dependencies.
3. `pnpm db:generate` to generate the Prisma client (not a network call; uses the schema).
4. `turbo run build --filter=<target>...` to build only the target app and its workspace
   dependencies.
5. Copy only the built output and its required node_modules to a lean final stage.

Pruning with `turbo prune --scope=@aps/api --docker` (turbo's built-in monorepo pruner)
is the preferred approach: it produces a minimal `json/` stage (package.jsons only, for
layer caching) and a `full/` stage (source + lockfile), keeping image layers small and
cache-friendly.

### apps/api -- Dockerfile (NestJS)

```dockerfile
# syntax=docker/dockerfile:1.7

# Stage 1: pruner (turbo monorepo prune -- produces minimal workspace slice)
FROM node:20-alpine AS pruner
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
COPY . .
RUN pnpm dlx turbo prune --scope=@aps/api --docker

# Stage 2: deps (install from pruned json only -- maximise layer cache hit)
FROM node:20-alpine AS deps
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
COPY --from=pruner /repo/out/json/ .
COPY --from=pruner /repo/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Stage 3: builder (compile TypeScript; generate Prisma client)
FROM node:20-alpine AS builder
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=pruner /repo/out/full/ .
# DATABASE_URL is needed for prisma generate (schema parsing only -- no DB connection)
ARG DATABASE_URL=postgresql://placeholder:placeholder@placeholder:5432/placeholder
ENV DATABASE_URL=${DATABASE_URL}
RUN pnpm db:generate
RUN pnpm turbo run build --filter=@aps/api...

# Stage 4: runner (lean non-root final image)
FROM node:20-alpine AS runner
WORKDIR /app

# Non-root user for runtime (CIS benchmark; principle of least privilege)
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser

# Copy only the built artifact + required runtime modules
COPY --from=builder --chown=appuser:appgroup /repo/apps/api/dist ./dist
COPY --from=builder --chown=appuser:appgroup /repo/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /repo/packages/db/src/generated ./packages/db/src/generated

USER appuser

# Runtime secrets are NEVER baked in -- injected at deploy time (see Section 5)
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "dist/main.js"]
```

### apps/web -- Dockerfile (Next.js)

```dockerfile
# syntax=docker/dockerfile:1.7

# Stage 1: pruner
FROM node:20-alpine AS pruner
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
COPY . .
RUN pnpm dlx turbo prune --scope=@aps/web --docker

# Stage 2: deps
FROM node:20-alpine AS deps
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
COPY --from=pruner /repo/out/json/ .
COPY --from=pruner /repo/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile

# Stage 3: builder
FROM node:20-alpine AS builder
WORKDIR /repo
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=pruner /repo/out/full/ .
# Next.js public env vars (NEXT_PUBLIC_*) baked at build time are non-secret.
# API_URL is the internal service URL (not secret; injected as build arg for next.config.js).
ARG NEXT_PUBLIC_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm turbo run build --filter=@aps/web...

# Stage 4: runner
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser

# Next.js standalone output (enable in next.config.js: output: 'standalone')
# This copies only the minimal runtime -- no devDependencies, no source.
COPY --from=builder --chown=appuser:appgroup /repo/apps/web/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=appuser:appgroup /repo/apps/web/public ./apps/web/public

USER appuser

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "apps/web/server.js"]
```

NOTE: `next.config.js` needs `output: 'standalone'` added (one-line change; Gal's action,
not a DevOps change). Without standalone mode, the web Dockerfile must copy all
node_modules instead, which is larger but functional.

Base image choice: `node:20-alpine` for both.
- Alpine gives a minimal attack surface and small layer size (~50 MB base vs ~300 MB for
  node:20-bullseye).
- Node 20 LTS -- matches the monorepo `engines.node` requirement (>=20.0.0).
- Alpine has musl libc; bcrypt (used in api) has a native binary. The `pnpm-workspace.yaml`
  already lists bcrypt in `allowBuilds`, so it will be compiled during `pnpm install` inside
  the builder stage. Test the api image build on arm64 (Apple Silicon CI runners) if used --
  native binaries can differ.

---

## 3. Image Registry + Tagging / Versioning

### Registry

Provider-managed container registry, co-located with the compute region.
Candidates (pending APS-004 provider decision):
- AWS il-central-1: Amazon ECR (Elastic Container Registry). Private, IAM-gated,
  image scanning built in. ECR is available in il-central-1 (confirmed in AWS docs as of 2026).
- GCP me-west1: Google Artifact Registry. Regional repo; image scanning via Container Analysis.
- Azure israelcentral: Azure Container Registry (ACR). Private; geo-replicated if needed.

Israel data-residency note: all three Israel-region registries store image layers in-region.
Image pulls from the registry to the compute instances do not cross region boundaries IF both
are in the same IL region. Confirm with Rambo that the registry regional locking policy is
enabled (ECR repository policy, GCP Artifact Registry location lock, ACR geo-replication scope)
so that image data never replicates to non-IL regions without explicit opt-in.

### Tagging strategy

Every image is tagged with:
1. The git commit SHA (7-char short form): `aps-api:abc1234`
2. A timestamp-qualified tag for human sorting: `aps-api:2026-07-15-abc1234`
3. `latest` ONLY on the registry -- never referenced in a production deploy manifest.
   Staging and prod deploy specs always reference an explicit SHA-based tag.

Rule: NEVER deploy with the `latest` tag in any non-local environment.
This is the only way to guarantee deterministic rollback (see Section 6).

### Versioning flow

CI builds on every merge to `main`:
- Build both images.
- Tag with commit SHA + timestamp.
- Push to registry.
- Deploy to staging automatically (SHA-tagged).

Prod deploy: manual trigger (A1 gate). The deploy spec names the exact SHA-tagged image.
There is no "promote latest to prod" -- only "deploy sha:abc1234 to prod."

---

## 4. Israel Data-Residency Considerations

### Registry
As above: pin registry region to IL. Enable image scanning (provider-native or Trivy in CI).

### Compute
Pilot compute (the thing that runs the containers) must be in the same IL region as the
registry and the managed Postgres/Redis. Cross-region data flow between compute and DB would
be both a latency and a potential residency issue. Eyal must confirm whether any component
of the runtime can egress to a non-IL sub-processor without explicit disclosure.

### LLM API egress (APS-004 open item)
When the LLM provider is confirmed (APS-004), the API container will make outbound HTTPS
calls to that provider's endpoint. Student transcript fragments in those calls constitute
potential cross-border data transfer. This is the highest-surface residency question and is
explicitly Eyal's gate item before the API container is permitted to make live LLM calls.
Until APS-004 clears, LLM_PROVIDER=stub in all non-production containers.

---

## 5. Secrets: Runtime Injection, Never Baked

This is the central security requirement for production images.

### What NEVER goes in an image
- DB connection string (DATABASE_URL)
- Redis URL (REDIS_URL)
- LLM API key (LLM_PROVIDER_API_KEY)
- JWT secret (JWT_SECRET)
- S3/MinIO signing key (S3_SIGNING_KEY)
- Any credential, token, or private key

The Dockerfile above passes only a placeholder DATABASE_URL as a build arg for
`prisma generate` (schema parsing only; no DB connection established at build time).
This placeholder never has a real password and is not the production value.

### How secrets are injected at deploy time

The container orchestrator (ECS task definition, Cloud Run revision, AKS deployment)
references secrets by name/ARN from a managed secret store:

```yaml
# Example: ECS task definition env injection pattern (conceptual -- not a real config yet)
environment:
  - name: DATABASE_URL
    valueFrom:
      secretsManagerArn: arn:aws:secretsmanager:il-central-1:ACCOUNT:secret:aps/prod/database-url
  - name: LLM_PROVIDER_API_KEY
    valueFrom:
      secretsManagerArn: arn:aws:secretsmanager:il-central-1:ACCOUNT:secret:aps/prod/llm-api-key
  - name: JWT_SECRET
    valueFrom:
      secretsManagerArn: arn:aws:secretsmanager:il-central-1:ACCOUNT:secret:aps/prod/jwt-secret
```

GCP equivalent: Secret Manager + Workload Identity bindings in Cloud Run / GKE.
Azure equivalent: Key Vault references in App Service / AKS.

### LLM API key specifically

Per owner directive: the real LLM API key connects only at production go-live.
Implementation: LLM_PROVIDER=stub in all pre-prod environments (local, staging).
LLM_PROVIDER=<real-provider> and LLM_PROVIDER_API_KEY=<secret-ref> injected ONLY into
the prod task definition, after APS-004 gate clears and owner A1 is given for go-live.
No prior environment ever carries the real LLM key.

### CI secrets (GitHub Actions)
Build-time non-secret variables (NEXT_PUBLIC_API_URL, NODE_ENV) are set as plain env vars.
No real credentials are ever in CI environment variables. The CI workflow does not push
to the production registry or deploy to production -- it pushes to a separate CI registry
path (e.g., ECR repo `aps-ci/`) distinct from `aps-prod/`.

---

## 6. Data Services: Managed vs Containerised

### PostgreSQL: MANAGED in production (not a container)

Decision: managed Postgres in prod. Containerised Postgres is local-dev only.

Reasons:
1. PITR (point-in-time recovery) is a managed service feature. Running a container-based
   Postgres and implementing PITR manually is a significant operational burden and a
   reliability risk. For student data (TranscriptMessages, PatientStateLog), a PITR window
   of at least 7 days is required (infra plan s. 4).
2. Automated backups, storage auto-scaling, and minor-version patching are included in
   managed offerings (RDS, Cloud SQL, Azure PostgreSQL Flexible Server) at no additional
   engineering cost.
3. A containerised Postgres on the same host as the API creates a shared-fate failure mode:
   a bad container restart or host failure takes both the application and the DB. Separation
   reduces blast radius.
4. Data-residency: managed Postgres in the IL region gives a provider DPA reference. A
   self-managed container Postgres on a cloud VM is technically the same residency, but the
   provider DPA coverage for managed DB services is more explicit and Eyal-auditable.

Candidate:
- AWS: Amazon RDS for PostgreSQL 15 (not Aurora -- confirm il-central-1 Aurora availability
  before committing; RDS is confirmed available). Multi-AZ for HA in prod.
- GCP: Cloud SQL for PostgreSQL 15, HA instance.
- Azure: Azure Database for PostgreSQL Flexible Server.

Schema migrations (Prisma): run as a CI/CD step BEFORE the new container is deployed.
`prisma migrate deploy` is the command; it is idempotent and runs against the live DB.
The migration step runs with a short-lived migration credential (separate from the app
runtime credential; narrower permissions: ALTER TABLE, CREATE TABLE only).

### Redis: MANAGED in production

Same reasoning as Postgres: managed Redis (ElastiCache, Memorystore, Azure Cache for Redis)
gives automated failover, replication, and provider DPA coverage. Redis holds session
tokens and rate-limit counters; data loss on a restart is acceptable (sessions invalidate,
users re-auth) but unplanned restart frequency should be near zero. Managed services deliver
this.

Local dev: Redis 7-alpine container (docker-compose). Consistent with prod version.

### Object storage: S3-COMPATIBLE (provider-managed)

DiagnosticLog bucket: provider-managed object storage (S3, GCS, Azure Blob) in IL region.
Not a container. Object storage is stateful; containerising it adds no benefit.
MinIO in local dev only (docker-compose). MinIO's S3-compatible API means local dev uses
the same SDK calls as prod with zero code change -- only the endpoint and credentials differ.

---

## 7. Deploy / Rollback / Health Checks

### Immutable image tags

Every production deploy is expressed as:
  "run image aps-api:abc1234 with these secrets"

The image tag abc1234 is immutable (it is the git commit SHA -- the registry tag cannot be
overwritten, only new tags added). This means rollback is always:
  "run image aps-api:prev_sha with the previous secrets config"

No rebuild, no recompile. Rollback time is the container start time (~30-60 seconds for
NestJS; ~20-40 seconds for Next.js standalone) plus the container orchestrator's drain time.

### Deploy flow

1. CI: build images on merge to main; tag with commit SHA; push to registry.
2. Staging: auto-deploy SHA-tagged image to staging; run smoke test / Adi QA.
3. Prod: Ido approves the specific SHA via A1 gate; Shir triggers deploy with that SHA.
   Deploy = update the task definition / service revision to the new SHA tag.
4. Health check gate: orchestrator polls /health on the new containers; if unhealthy
   within start-period (30s), the deploy stops and the previous revision stays active.
   No traffic ever shifts to an unhealthy container (rolling deploy with health gate).

### Health endpoints

- `GET /health` on API (port 3001): returns 200 + `{"status":"ok","db":"connected"}` if
  the Prisma client can reach the DB. Returns 503 if DB is down. Used by orchestrator
  health check and uptime monitor.
- `GET /health` on Web (port 3000): returns 200 + minimal JSON. No DB dependency (web is
  a Next.js frontend; DB calls go through the API). Used to confirm the Node process is live.

Both health endpoints are already referenced in the Dockerfiles above as HEALTHCHECK.

### Where go-live wires in the real LLM model

Go-live sequence (all A1 -- see Section 8):
1. Ido + owner approve go-live (A1).
2. Shir creates the prod secret for LLM_PROVIDER_API_KEY in the managed secrets store
   (value from the selected provider, post-APS-004 gate).
3. Shir updates the prod task definition to reference the real LLM secret and sets
   LLM_PROVIDER=<real-provider>.
4. Deploy the exact same prod-tagged API image with the updated secrets config.
5. Health check confirms /health 200.
6. Ido verifies a test simulation turn completes (not a real student session) before
   opening access.

The image itself does not change between "stub mode" and "live mode" -- only the runtime
environment variables change. This makes it straightforward to verify that nothing in the
image was built with or contains the real API key.

---

## 8. A1 Owner Decisions Required at Go-Live

The following actions are A1 gates (Shir role file / constitution s. 3).
None of these happen without explicit owner approval in that session.

| # | Action | Gate |
|---|--------|------|
| 1 | Provision production managed Postgres (creates infra, incurs spend) | A1 |
| 2 | Provision production managed Redis (creates infra, incurs spend) | A1 |
| 3 | Create production S3/object storage bucket (infra + potential spend) | A1 |
| 4 | Create production container registry repo and push first prod image | A1 |
| 5 | Deploy prod container for the first time (first production deploy) | A1 |
| 6 | Store real LLM API key in production secrets manager | A1 |
| 7 | Wire LLM_PROVIDER to the real provider in the prod task definition | A1 |
| 8 | Any subsequent production deploy (even a patch) | A1 |
| 9 | Any data-destructive migration (DROP COLUMN, data transform) | A1 + Ido review |

Shir does not proceed on any of these without the owner saying go in the relevant session.
APS-004 gate (Rambo + Eyal) is a prerequisite for items 1-8 above.

---

## 9. Assessment: Is Image-Based Production the Right Call?

Yes. Reasons:

1. Reproducibility: the image built from commit abc1234 is the exact same binary that ran
   in CI, staging, and will run in prod. No "works on my machine" gap.

2. Rollback is reliable and fast: rollback = re-deploy previous image tag. No code checkout,
   no rebuild, no dependency reinstall. For a 9-week sprint with a live reference customer
   pilot, fast rollback is essential.

3. Secrets isolation: the Dockerfile as written has a hard structural barrier -- secrets
   are never in the image. The pattern is auditable by Rambo at image scan time.

4. Monorepo build complexity is absorbed by the multi-stage Dockerfile: the pruner stage
   handles the pnpm workspace slicing; the builder stage handles turbo + prisma generate;
   the runner stage is lean. This pattern is well-established for pnpm + turbo monorepos.

5. Provider-agnostic: the same Dockerfiles work on ECS, Cloud Run, AKS, or any
   OCI-compliant runtime. If the APS-004 gate picks AWS, we use ECR + ECS. If GCP, we use
   Artifact Registry + Cloud Run. No Dockerfile change required.

One genuine complexity: the pnpm workspace + turbo prune build requires a careful
COPY layering strategy to get good Docker layer cache behaviour. The staged build above
addresses this (json layer before full source copy). This should be tested once in CI
before the first staging deploy.

One thing I would flag to Ido: the `next.config.js` needs `output: 'standalone'` enabled
for the lean web runner stage to work. Without it, we fall back to copying the full
node_modules into the runner stage (functional but larger image). Gal can add this in
Sprint 2 with no functional impact on local dev.

---

*Internal only. No provisioning. Provider decision gated by APS-004 (Rambo + Eyal).*
*All A1 actions at go-live require explicit owner approval in that session.*
