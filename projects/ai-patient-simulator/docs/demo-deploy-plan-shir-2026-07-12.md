# APS Hosted Demo -- Deployment Plan
# Author: Shir (DevOps, R&D, L4) | Date: 2026-07-12 | Task: owner A1 direction (decisions-log 2026-07-12)
# Status: PLAN ONLY -- NOT deployed; NOT provisioned; no secrets entered.
# Gate: Rambo security gate + owner A1 per-deploy required before anything goes live.
# Audience: Eco (relay to owner), Ido (VP R&D), Rambo (security gate)
# ASCII only. No customer contact. Internal only.

---

## 0. Context and Scope

This plan covers standing up a SHORT-LIVED DEMO instance of the AI Patient Simulator
so that Adam (design partner) can self-explore the app without a screen-share session.
Owner is on vacation; hosted demo is also on the product roadmap anyway.

This is NOT the pilot instance. Differences:
- Synthetic data only (seed.mjs RE-3 dataset + one Adam demo account).
- StubProvider throughout -- zero LLM egress, zero LLM cost.
- Short time-box; torn down when Adam is done.
- No IL data-residency requirement applies: no real student data, no real clinical data.
  APS-004 gate (the pilot infra gate) does NOT govern this demo.
- Rambo still gates the external-exposure model (new constraint: internet-reachable).

Hard guardrails (decisions-log 2026-07-12, non-negotiable):
1. Synthetic/demo data only. Seed.mjs RE-3 is the dataset.
2. LLM_PROVIDER=stub at all times. No real LLM key is ever set on this instance.
3. Single revocable demo account for Adam; documented kill procedure.
4. Secrets only via host secret store; never in git or a committed file.
5. Cost: prefer free; any paid tier = owner A1 before provisioning.
6. Instance is explicitly labeled DEMO; distinct from any future pilot instance.

---

## 1. Hard Blockers (Must Resolve Before Any Deployment)

### BLOCKER-1: APS-016 -- nest build fails for the API (P1, pre-deploy gate)

The `nest build` command on apps/api fails with TypeScript errors TS6059 and TS6307
(monorepo rootDir / project-references mismatch in tsconfig.build.json). This error
blocks production compilation of the NestJS API.

Without a working build, there is no dist/ artifact to run on any hosted platform.
`dev:boot` (which runs a pre-existing dist/ from the developer's machine) is not an
option for a hosted platform build step.

Two resolution paths:
- PATH A (recommended): Shir proposes a targeted fix to apps/api/tsconfig.build.json
  (set rootDir to the correct monorepo root; adjust composite/references). This is an
  A2 infra config change. Requires Ido approval before Shir applies.
- PATH B (demo-only fallback): run the API with `nest start` (ts-node mode, no compile
  step). Slower startup (~20-30s), not production-hardened, but fully functional for a
  short demo. Start command becomes:
    pnpm --filter @aps/api exec nest start
  This avoids the build failure entirely for the demo duration.

OWNER DECISION NEEDED: which path. Path A is cleaner long-term; Path B gets the demo
live faster without touching the API TypeScript config. If Path B is chosen, APS-016
still needs a proper fix before the August rehearsal (APS-016 P2 on the board).

### BLOCKER-2: Rambo security gate

New attack surface: the app becomes internet-reachable and Adam (an external person)
gets credentials. Rambo must gate this before go-live. Open questions for Rambo listed
in Section 11.

---

## 2. Recommended Stack

Recommended path: Vercel (web) + Render (API) + Supabase (Postgres).
All three have free tiers that cover this demo at zero expected cost.

### Web: Vercel (free hobby tier)
- Native Next.js host; zero config for a monorepo with output: "standalone" (already set
  in apps/web/next.config.js).
- No credit card required for hobby tier.
- No instance sleep. Always-on CDN.
- HTTPS provided automatically.
- Verified free: $0/month on hobby plan for this scale.
- Vercel MCP connector is available in this environment for provisioning steps.

### API: Render (free web service)
- Node.js runtime. Handles pnpm monorepo builds.
- Free tier: no credit card. One caveat: free web services sleep after 15 minutes of
  inactivity. First request after sleep takes 30-60 seconds to wake up. Acceptable
  for a self-paced demo -- owner can warn Adam, or owner can manually ping the API
  URL before handing Adam the demo link.
- HTTPS provided automatically.
- Verified free: $0/month. No payment method required for the free tier.
- If the sleep behavior is unacceptable: upgrade to Render Starter ($7/month) or use
  Railway Hobby ($5/month) -- both require a credit card and owner A1.

### Postgres: Supabase (free tier)
- Free: 1 project, 500MB storage, no credit card required.
- Postgres 15 compatible (matches the schema and Prisma client).
- Provides a DATABASE_URL connection string via the dashboard (direct + pooled options).
  For Prisma, use the DIRECT connection string (not the pooled/pgbouncer one) to avoid
  transaction-mode incompatibilities with Prisma migrations.
- Caveat: Supabase pauses a free project after 7 days of inactivity. For a demo that
  runs within a 7-day window from first access, this is not an issue. Owner can manually
  unpause from the Supabase dashboard if needed.
- Supabase MCP connector is available in this environment for provisioning steps.

### Redis: NOT REQUIRED
AppConfig declares REDIS_URL as required but the value is never consumed by any module
in the codebase (confirmed by code audit: grep found zero usages of config.redisUrl
outside app.config.ts). Setting REDIS_URL to any non-empty string satisfies the
required() check at boot without causing a connection error.
Set: REDIS_URL=redis://noop:6379

### S3/MinIO: NOT REQUIRED
S3 credentials are in the env example but the demo flows (simulation, debrief, feedback,
teacher dashboard) do not use object storage. Set dummy values for the S3 env vars to
satisfy any env validation; no real storage will be accessed.

### Expected total cost: $0/month (all free tiers)
See full cost table in Section 8.

---

## 3. Fallback Stack

If Render free tier's sleep behavior is unacceptable and owner approves paid:

- Web: Vercel (same; free)
- API: Railway Hobby ($5/month) -- no sleep, simpler setup, Postgres included in the
  same project
- Postgres: Railway built-in PostgreSQL (same $5 plan covers both API + DB)

Railway requires a credit card: OWNER A1 REQUIRED before provisioning.

If Railway is chosen, the Supabase step is skipped and DATABASE_URL comes from Railway's
internal Postgres service. Everything else in this plan remains identical.

---

## 4. Exposure Surface

What becomes internet-reachable:

| Component | URL (example) | Who can reach it |
|-----------|---------------|-----------------|
| Next.js web | https://aps-demo.vercel.app (owner assigns custom subdomain or uses auto) | Public URL -- HTTPS |
| NestJS API | https://aps-demo-api.onrender.com | Public URL -- HTTPS |
| Postgres | Internal only (Supabase connection string) | API only; no public DB access |

What stays private:
- DATABASE_URL (Supabase): Render secret store only; never public.
- JWT_SECRET: Render secret store only.
- DEMO_TEACHER_PASSWORD (see Section 5): Render + Vercel secret store; owner holds the
  plaintext value; Adam receives it from the owner directly.
- Supabase project dashboard: owner account only.
- Render project dashboard: owner account only.
- Vercel project dashboard: owner account only.

The API has a CORS allow-list (WEB_ORIGIN env var). The API will only accept requests
from the Vercel deployment URL. Browser requests from any other origin are rejected.

No admin UI, no database admin panel, no Prisma Studio is exposed on the internet.

---

## 5. Auth Model for Adam's Demo Login

Adam gets a TEACHER account so he can see the full teacher dashboard experience (the
richest view: class summary, criterion heatmap, score distribution, roster).

Optionally: also give him student credentials (invite token + access code) so he can
run a simulation himself and then see the teacher view of his own attempt.

### Adam's Demo Account

Create a separate script: packages/db/prisma/seed-demo.mjs
This script reads two env vars:
- DEMO_TEACHER_EMAIL (e.g. adam.demo@synthetic.test)
- DEMO_TEACHER_PASSWORD (random strong password, set in the host secret store)

The script bcrypt-hashes the password and upserts ONE teacher user + COURSE scope role
assignment against course1. It also upserts ONE student user with a fixed invite token
(INVITE_TOKENS.demo_student) and access code (CREDS.demo_student_code), both defined
as constants in seed-demo.mjs and documented in the file comment only (they are
synthetic/throwaway values, not secrets -- same pattern as seed.mjs RE-3 credentials).

Why separate script: keeps Adam's teacher password out of git entirely (it comes from
the env store at seed time). The student invite token/code can be hardcoded in the
script (same pattern as RE-3 seed) since they are synthetic, not personal credentials.

The standard RE-3 seed (seed.mjs) ALSO runs to provide the full dataset (course,
assignment, rubric, existing attempts visible on the teacher dashboard). Adam's demo
teacher account is layered on top of that.

### Revocation (3 options, in order of severity)

Option 1 (fastest -- valid sessions only): rotate JWT_SECRET on Render.
All existing JWTs immediately invalid. Adam loses access on next request. No DB change.

Option 2 (account-level): delete Adam's demo user row from the database.
Run via Supabase dashboard SQL editor (owner action):
  DELETE FROM "User" WHERE email = 'adam.demo@synthetic.test';
JWT becomes invalid immediately (user no longer exists; API's auth check fails).

Option 3 (nuclear, full teardown): delete the Render project + Supabase project +
Vercel project. Everything gone within minutes. See Section 10.

After the demo is done, Option 3 is recommended: no reason to leave the instance up.

---

## 6. Build/Deploy Steps (Exact)

IMPORTANT: Steps marked [OWNER ACTION] require the owner to perform them directly.
Shir does NOT create accounts, does NOT enter payment details, does NOT handle
credentials. Steps marked [SHIR] are actions Shir executes or prepares.

Pre-requisites:
- [ ] BLOCKER-1 resolved (APS-016 path A or B decided and applied)
- [ ] Rambo security gate cleared (Section 11 checklist answered)
- [ ] Owner A1 for per-deploy confirmed

--- PHASE 1: CODE PREP [SHIR] ---

Step 1. Write seed-demo.mjs
  File: packages/db/prisma/seed-demo.mjs
  Reads DEMO_TEACHER_EMAIL + DEMO_TEACHER_PASSWORD from env.
  Creates demo teacher user + one demo student (fixed synthetic token/code).
  Idempotent (upsert pattern matching seed.mjs).
  Owner to review before commit.

Step 2. Add seed-demo script to packages/db/package.json
  Add: "seed:demo": "dotenv -e ../../.env.local -- node prisma/seed-demo.mjs"
  This entry is needed so Render can run it as a post-deploy command.

Step 3. Confirm build command for monorepo on Render
  If BLOCKER-1 resolved via Path A (nest build fixed):
    Build command: pnpm install --frozen-lockfile && pnpm --filter @aps/engine build &&
      pnpm --filter @aps/db generate && pnpm --filter @aps/api build
    Start command: node apps/api/dist/src/main.js
  If BLOCKER-1 via Path B (dev mode):
    Build command: pnpm install --frozen-lockfile && pnpm --filter @aps/engine build &&
      pnpm --filter @aps/db generate
    Start command: pnpm --filter @aps/api exec nest start

Step 4. Confirm build command for Next.js on Vercel
  Root directory: projects/ai-patient-simulator/app
  Build command: pnpm --filter @aps/db generate && pnpm --filter @aps/web build
  Output: apps/web/.next (Vercel detects standalone automatically)
  Framework preset: Next.js

--- PHASE 2: INFRASTRUCTURE PROVISIONING [OWNER ACTION] ---

Step 5. [OWNER] Create Supabase account + free project
  Go to supabase.com -> New project -> region: any EU/US free option (no IL requirement
  for demo -- synthetic data only; Rambo to confirm acceptable region).
  Note the DATABASE_URL (direct, not pooled) from Project Settings -> Database -> URI.

Step 6. [OWNER] Create Render account + new Web Service
  Go to render.com -> New Web Service -> connect GitHub repo.
  Point to the eco-synthetic repo, root: projects/ai-patient-simulator/app.
  Runtime: Node. Set build + start commands per Step 3 choice.
  Set env vars (see Section 9). Do NOT add any payment method if staying on free tier.
  Note the assigned onrender.com URL.

Step 7. [OWNER] Create Vercel account + new project
  Go to vercel.com -> New Project -> import from GitHub.
  Root directory: projects/ai-patient-simulator/app.
  Framework: Next.js.
  Add env vars (see Section 9 -- especially NEXT_PUBLIC_API_URL = Render URL from Step 6).
  Deploy.
  Note the assigned vercel.app URL.

Step 8. [OWNER] Set WEB_ORIGIN on Render
  In Render dashboard, add env var:
    WEB_ORIGIN = https://<your-app>.vercel.app
  (The exact Vercel URL from Step 7. This enables CORS on the API for the web app.)
  Trigger a redeploy on Render after setting this.

--- PHASE 3: DATA SETUP [SHIR or OWNER] ---

Step 9. Run Prisma migrations against Supabase
  From a local machine with DATABASE_URL pointing to Supabase:
    DATABASE_URL=<supabase-url> pnpm --filter @aps/db exec prisma migrate deploy
  This applies all 6 migrations in packages/db/prisma/migrations/.
  Owner executes from terminal (Shir provides exact command; owner runs it).

Step 10. Run RE-3 seed (synthetic pilot data)
  DATABASE_URL=<supabase-url> pnpm --filter @aps/db seed
  Creates: 1 college, 2 courses, 1 admin, 2 teachers, 4 students, 1 simulation template,
  rubric, assignment, credit ledger. All synthetic (email: *@synthetic.test).

Step 11. Run demo seed (Adam's account)
  Set DEMO_TEACHER_EMAIL and DEMO_TEACHER_PASSWORD in local env (never committed).
  DATABASE_URL=<supabase-url> DEMO_TEACHER_EMAIL=adam.demo@synthetic.test
    DEMO_TEACHER_PASSWORD=<strong-password> pnpm --filter @aps/db seed:demo
  Owner notes the password; it goes into the Render secret store (DEMO_TEACHER_PASSWORD)
  so future seed reruns work consistently.

--- PHASE 4: VALIDATION [SHIR] ---

Step 12. Verify API is up
  curl https://<render-url>/health -> expect 200 {"status":"ok","db":"connected"}

Step 13. Verify web is up
  Load https://<vercel-url>/ -> expect login page in Hebrew.

Step 14. Login smoke test (owner-only, before sending to Adam)
  Teacher login: adam.demo@synthetic.test + password -> expect teacher dashboard.
  Student login: demo invite token + demo access code -> expect empty student dashboard.
  Start a simulation turn -> expect [STUB] patient reply (confirms StubProvider, no LLM).
  Confirm: NO real LLM calls in any Render logs (LLM_PROVIDER=stub should appear at boot).

Step 15. Hand credentials to owner
  Owner relays the following to Adam directly:
  - URL: https://<vercel-url>
  - Teacher login: adam.demo@synthetic.test + <password>
  - Student invite token + access code (from seed-demo output)
  - Note: patient replies show [STUB] text -- this is intentional; real AI responses
    are a later phase. Scores show 0/10 for the same reason.
  Shir does NOT contact Adam. Owner handles all Adam comms.

---

## 7. Two-Pass Deploy Note (CORS Ordering)

The web app needs NEXT_PUBLIC_API_URL baked at build time (Next.js public env vars
are compiled in, not runtime-injected). The API needs WEB_ORIGIN to allow CORS
from the web domain.

This creates a chicken-and-egg: each needs to know the other's URL first.

Solution: two-pass deploy.
Pass 1: Deploy API on Render first with a placeholder WEB_ORIGIN=http://localhost:3000.
  Note the Render URL.
Pass 2: Deploy web on Vercel with NEXT_PUBLIC_API_URL=<render-url>.
  Note the Vercel URL.
Pass 3: Update WEB_ORIGIN on Render to the real Vercel URL. Trigger Render redeploy.

Total extra time: ~5 minutes. Render redeploy is fast (~2 min).

---

## 8. Cost Table

| Component | Provider | Tier | Monthly cost |
|-----------|----------|------|-------------|
| Next.js web | Vercel | Hobby (free) | $0 |
| NestJS API | Render | Free web service | $0 |
| Postgres | Supabase | Free (500MB) | $0 |
| Redis | N/A | Not needed | $0 |
| S3/MinIO | N/A | Not needed | $0 |
| Domain / TLS | Included | Both hosts provide HTTPS | $0 |
| TOTAL | | | $0 |

Free tier limits (all well within demo scale):
- Vercel hobby: 100GB bandwidth/month, 1 project -- fine.
- Render free: 750 hours/month CPU, 512MB RAM -- fine for one demo instance.
- Supabase free: 500MB Postgres, 1 project, 2 GB bandwidth -- fine.

OWNER A1 FLAG: if any paid tier is needed (e.g. Railway $5/month to avoid Render
sleep), this requires explicit owner A1 before account creation or payment method entry.
Nothing in this plan assumes a credit card or any payment.

---

## 9. Env/Secrets Handling

All secrets are set via the hosting platform's dashboard (environment variable stores).
None are in git, none are in committed files, none are in any log.

### Render (API) environment variables

| Var | Value / source | Secret? |
|-----|---------------|---------|
| DATABASE_URL | Supabase direct connection string | YES -- Render secret |
| JWT_SECRET | Random 256-bit hex string (owner generates: openssl rand -hex 32) | YES -- Render secret |
| JWT_EXPIRES_IN | 7d | No |
| LLM_PROVIDER | stub | No |
| REDIS_URL | redis://noop:6379 | No (fake; unused) |
| WEB_ORIGIN | https://<vercel-url> | No |
| PORT | 3001 (or platform default) | No |
| NODE_ENV | production | No |
| S3_ENDPOINT | http://noop:9000 | No (unused) |
| S3_BUCKET | noop | No (unused) |
| S3_ACCESS_KEY_ID | noop | No (unused) |
| S3_SIGNING_KEY | noop | No (unused) |
| DEMO_TEACHER_EMAIL | adam.demo@synthetic.test | No |
| DEMO_TEACHER_PASSWORD | <strong password> | YES -- Render secret |

### Vercel (web) environment variables

| Var | Value / source | Secret? |
|-----|---------------|---------|
| NEXT_PUBLIC_API_URL | https://<render-url> | No (baked at build time; non-secret) |

NEXT_PUBLIC_API_URL is NOT a secret (it is the public API endpoint). It is baked into
the Next.js build. All other Render vars stay server-side only.

### What stays entirely off-platform (owner-held only)
- The plaintext DEMO_TEACHER_PASSWORD (owner memorizes or uses a password manager;
  relays to Adam directly; never written to any file in this repo).
- Supabase dashboard login credentials (owner's personal account).
- Render dashboard login credentials (owner's personal account).
- Vercel dashboard login credentials (owner's personal account).

---

## 10. Rollback / Teardown

### During the demo (if something breaks)
- API crash: Render auto-restarts. If persistent, owner triggers manual redeploy.
- Data corruption (e.g. bad seed run): re-run seed.mjs + seed-demo.mjs (idempotent;
  wipes existing attempts for seeded assignment and recreates cleanly).
- Rollback to previous deploy: Render keeps deploy history; owner clicks "Rollback"
  in the Render dashboard.

### Revoking Adam's access (before teardown)
Option 1 (instant session kill): rotate JWT_SECRET in Render env vars + redeploy.
Option 2 (account delete): Supabase dashboard -> Table Editor -> User table ->
  delete row where email = 'adam.demo@synthetic.test'.

### Full teardown (when Adam is done)
1. [OWNER] Delete Render project (or just stop the service). API goes offline.
2. [OWNER] Delete Supabase project. Postgres wiped; all demo data gone.
3. [OWNER] Delete Vercel project. Web goes offline.
4. [SHIR] Confirm all three are gone; append teardown note to memory/log.md.

Estimated teardown time: under 10 minutes.

Post-teardown: there is nothing to rotate or revoke at the infra level; the platforms
are gone. The only thing that persists is the Render/Supabase/Vercel account login
(owner's personal accounts, unrelated to APS).

---

## 11. Open Items / Gate Requirements Before Deploying

### Rambo gate items (security -- gate must clear before go-live)

R1. External exposure: the NestJS API will be internet-reachable on a public
    onrender.com URL. Confirm the attack surface is acceptable:
    - CORS is allow-listed to the Vercel domain only.
    - No admin endpoints are exposed without auth (RBAC enforced at the API level).
    - JWT auth is required for all non-public routes.
    - Rate limiting: currently NOT in place (Redis rate limit module was not built).
      Rambo to advise whether a brute-force protection gap on /auth routes is
      acceptable for a short-lived demo with one external user, or whether a simple
      IP-rate-limit nginx proxy is needed.

R2. Demo account credential: Adam's teacher password is a synthetic account on a
    synthetic database. Rambo to confirm: acceptable to relay a password to an
    external person over the owner's secure channel (Telegram DM to Adam), given
    the data involved is 100% synthetic/disposable.

R3. Render platform: confirm Render has no data-handling concern for a demo with zero
    real student data (synthetic only). Render is a US-based platform; no PPL concern
    for synthetic data, but Rambo should explicitly clear this.

R4. Supabase platform: same -- confirm Supabase (US-based) is acceptable for a
    synthetic-only demo dataset with no real PII. Supabase default region is US East.

R5. LLM_PROVIDER=stub enforced: Rambo to confirm there is no code path in the API
    that can bypass StubProvider when LLM_PROVIDER=stub is set. Based on the code
    audit (llm.module.ts: only "stub" case is wired; default falls back to stub;
    real provider cases are commented out), this appears structurally enforced.
    Rambo to verify.

### Owner A1 items (required before Shir proceeds)

A1-1. Decision on BLOCKER-1 path: Path A (fix APS-016, Ido A2 + Shir executes) or
      Path B (dev mode for demo only)?

A1-2. Per-deploy A1: explicit owner go-ahead in the session when deployment actually
      happens. Owner is on vacation; this plan sits ready until owner returns and
      gives the word.

A1-3. If any paid tier is needed (Render sleep workaround, Railway, etc.): owner A1
      before any credit card is entered or paid account created.

A1-4. Confirm Adam-comms channel: owner to relay demo URL + credentials to Adam
      directly. Shir does not contact Adam.

### Eyal note (light-touch; not a full gate)

The demo instance handles zero real personal data (synthetic seed only; Adam is a
business contact, not a student). No PPL concern expected. However, Eco should note
to Eyal that the demo happened and that synthetic-only data was confirmed. If Adam
uses his own name or personal data while interacting with the demo, that is on him
as an informed design partner -- the system shows [STUB] labels clearly indicating
this is a demo environment.

---

## 12. Assumptions and Known Limitations

1. APS-016 fix is prerequisite to deploy (or accepted Path B workaround).
2. Render free tier may have a cold-start delay of 30-60s if the service sleeps.
   Owner should warn Adam, or access the URL himself first to wake it.
3. Supabase free project pauses after 7 days inactivity. If the demo spans >7 days
   idle, owner resumes from Supabase dashboard (one click).
4. Seed.mjs RE-3 credentials (teacher1@synthetic.test etc.) are visible in the repo.
   They are intentionally synthetic/throwaway. Do not treat them as secrets. Adam
   should NOT use them; he gets the demo account only.
5. StubProvider means: patient replies are "[STUB] I'm not sure what to say." and
   scores show 0/10. This is known and should be communicated to Adam upfront so
   the stub behavior is not misread as a bug.
6. No email support functionality in the demo. Support ticket creation will succeed
   (it writes to DB) but email sending is not wired (SMTP env vars are dummies).
7. The demo URL will be a generic onrender.com / vercel.app subdomain unless the
   owner creates a custom domain (not in scope of this plan; A1 if needed).

---

*Internal only. No customer contact. Shir does not deploy without Rambo gate + owner A1.*
*All provisioning is by owner; Shir prepares steps, code changes, and validates post-deploy.*
