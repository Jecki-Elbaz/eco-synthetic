# Adam Hands-On Demo -- Owner Go-Live Checklist (2026-07-14)

Everything is STAGED and SECURITY-CLEARED (Shir staged; Rambo GR-016: secret-scan PASS,
platforms cleared, rate-limit OK for demo, teacher role OK). Nothing is provisioned or live.
This is the owner's mechanical checklist for when you are ready. Full detail: Shir's plan at
demo-deploy-plan-shir-2026-07-12.md. Final go-live is your A1.

## Cost: $0 (all free tiers). Render free sleeps after 15 min idle (~30-60s first-load).

## Step 0 -- two quick confirms (optional; my defaults in brackets)
- Adam's role: TEACHER so he sees the full educator/dashboard experience [recommended; Rambo cleared].
  If you want strict student-only view instead, tell Eco.
- Vercel Hobby tier is technically "personal use"; a short business demo is a gray area Rambo did
  not block on. Route to Eyal only if you want a strict ToS opinion [skip for a short demo].

## Step 1 -- create the three free accounts
- Supabase (Postgres) -- NEW, SEPARATE project (not shared with any future pilot DB). Note the
  DATABASE_URL (Project Settings > Database > Connection String > Direct).
- Render (API host).
- Vercel (web frontend).

## Step 2 -- generate two secrets (keep in your password manager)
- JWT_SECRET:  run  openssl rand -hex 32
- DEMO_TEACHER_PASSWORD: pick a strong 12+ char password (this is Adam's login).

## Step 3 -- Render (API)
- New Web Service > connect the eco-synthetic GitHub repo > root dir: projects/ai-patient-simulator/app
- Set env vars (secrets): DATABASE_URL, JWT_SECRET, DEMO_TEACHER_PASSWORD. Deploy. Note the
  <service>.onrender.com URL.

## Step 4 -- migrate + seed (from your local terminal, using the Supabase DATABASE_URL)
    cd projects/ai-patient-simulator/app
    DATABASE_URL=<supabase-url> pnpm --filter @aps/db exec prisma migrate deploy
    DATABASE_URL=<supabase-url> pnpm --filter @aps/db seed:hosted
    DATABASE_URL=<supabase-url> DEMO_TEACHER_EMAIL=adam.demo@synthetic.test DEMO_TEACHER_PASSWORD=<pw> pnpm --filter @aps/db seed:demo:hosted
- Review the DEMO-C4 spot-check output: every email must end in @synthetic.test. Share the output
  with Eco/Rambo for counter-sign (hard rule -- do not go live if it fails).

## Step 5 -- Vercel (web)
- New Project > import the repo > root dir: projects/ai-patient-simulator/app
- Env var: NEXT_PUBLIC_API_URL = https://<service>.onrender.com  (the Render URL). Deploy. Note the
  <project>.vercel.app URL.

## Step 6 -- CORS: back in Render, set WEB_ORIGIN = https://<project>.vercel.app, redeploy.

## Step 7 -- smoke test (you, before sending Adam anything)
- Load the Vercel URL -> Hebrew login page.
- Teacher login (adam.demo@synthetic.test + your password) -> teacher dashboard.
- Student login (invite token invite-tok-demo-student-01 / access code code-demo-s01) -> student view.
- Run one simulation turn -> reply shows [STUB] text (intentional; no real AI). Confirm no LLM call
  in Render logs.

## Step 8 -- relay to Adam (you only; no agent contacts Adam)
- URL, teacher login, and the student invite token/code.
- Tell him: replies show [STUB] and scores show 0/10 by design (demo has no real AI).

## Teardown (any time, <10 min): delete the Render, Supabase, and Vercel projects. Synthetic data
## only, so nothing to clean up. Instant kill mid-demo: rotate JWT_SECRET in Render (all logins die).
