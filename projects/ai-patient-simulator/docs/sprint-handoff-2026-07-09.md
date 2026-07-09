# APS Sprint Handoff -- 2026-07-09 (for the next-phase kickoff session)

Owner directive (2026-07-09): move FASTER. New mode: (1) re-evaluate the sprint plan +
execution first; (2) run sprints one after another; (3) each sprint is tested + validated
before the next starts; (4) only real blockers hold the plan; (5) all owner questions are
asked UP FRONT at kickoff, or later only when nothing else can proceed. Owner wants a DEMO
as soon as possible.

## Current state (verified, committed by owner)
- Pilot-minimal is BUILT and CLICKABLE end-to-end on StubProvider.
- Proof: golden-path E2E 15/15 PASS over real HTTP (apps/api/src/scripts/e2e-golden-path.mjs):
  student invite-login -> attempt -> turns -> finish -> teacher evaluate -> publish ->
  student feedback -> debrief -> RBAC 403 -> admin credit action -> no-token 401.
- Suites: engine 191; API unit 184 (8 skipped stubs); integration 33/33 on live Postgres;
  web tsc clean; idempotent seed (`pnpm --filter @aps/db seed`).
- Full history: docs/overnight-progress.md. Reviews: docs/review-inc3..inc8-ido.md.

## How to run the demo (local, stub)
1. Docker up (aps-postgres :5433) + `pnpm --filter @aps/db seed`
2. `pnpm --filter @aps/api dev:boot` (API :3001)
3. `pnpm --filter @aps/web dev` (web :3000) -- login page; seed prints synthetic creds
4. Demo routes need no API/auth: /simulation/demo, /feedback/demo, /debrief/demo,
   /teacher/demo, /student/demo, /authoring/demo, /admin/credits/demo

## Open tasks (board rows)
- APS-016 (P2, Shir): `nest build` prod compile fails (monorepo rootDir/project-refs
  TS6059/6307). Blocks the production container image only; dev:boot runs fine.
- APS-011 (P2, Gal): integration-spec DB-stub typing (~45 tsc errors in test files only).
- APS-012 (P2, Gal): shared LlmModule refactor -- HARD prerequisite before any real LLM.
- APS-013 (P2, Gal): SimulationTemplate ownerUserId/courseId scope -- before multi-college.
- APS-014 (P3, Noa): credit-admin pagination/aggregation hardening + minor UX.
- 8 describe.skip integration stubs (support + credit-admin) -- test-writing scope.
- APS-010: Adam's answers -- owner reports handled; CHECK shared/handoff/shelly-outbox/
  for the extract (request staged at eco-shelly-request-adam-aps-answers-2026-07-07.md).

## Questions to ask the owner AT KICKOFF (before execution)
1. DEMO: who is the audience (owner only, or shown to Adam?) and which flow matters most?
   Local demo is ready now; anything beyond localhost (hosting/tunnel) is an A1 gate.
2. ADAM'S ANSWERS (if not in shelly-outbox): Q9.1 single-vs-multi-session; clinical advisor;
   welfare contact text for the signpost; pilot date 1 Sep vs ~15 Oct.
3. SPRINT PRIORITY: after demo -- continuing-persona (if Q9.1 says multi-session) vs
   hardening (voice dictation APS-REQ-046, resume-on-interrupt UX, prod image)?
4. REHEARSAL DATE: keep 15 Aug internal go/no-go?

## Standing constraints (unchanged)
StubProvider only until production go-live (owner A1). No agent git commits (owner commits).
No customer contact (owner relays). Env files inside app/ only. A1 for spend/deploy/tools.
