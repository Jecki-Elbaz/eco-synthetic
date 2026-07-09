# APS Demo Walkthrough -- 2026-07-09 (for Adam, via owner)

Three short screen recordings of the pilot-minimal build, captured live against
the real local stack (Next.js web + NestJS API + Postgres, StubProvider engine).
Every screen shown is real end-to-end: real login, real database, real RBAC.
The only synthetic part is the LLM: patient/supervisor/evaluator responses are
deterministic stub text ("[STUB]") until the real model is connected at
production go-live (gated, owner A1). Scores show 0/10 for the same reason --
the stub evaluator returns empty scores; the real model will produce real ones.

## Recording 1 -- aps-demo-1-student-feedback-debrief.gif
Student dashboard (real data: completed simulation, formative-only labels),
the published feedback screen (formative indicator, criterion panel, transcript),
and a LIVE debrief chat round-trip: student question in Hebrew -> educational
supervisor reply, with the 1-of-10 question counter and the guardrail banner
("this conversation is based on your transcript and rubric only; it cannot
change your score").

## Recording 2 -- aps-demo-2-login-simulation.gif
Fresh student logs in with invite token + access code (the handles-only /
no-real-names model), lands on an empty dashboard, then runs a LIVE simulation:
Hebrew RTL chat, non-dismissable "simulation only" welfare signpost, elapsed
timer, turn counter (x/75), mic button placeholder (dictation is a later
sprint). Both patient replies came over real HTTP through the full 8-step turn
pipeline (input gate, analyser, ground-truth guard, state update, persistence).

## Recording 3 -- aps-demo-3-teacher-dashboard.gif
Teacher email login -> real class dashboard for the seeded course: class
summary (4 enrolled, 1/4 completed with progress bar), criterion heatmap,
score distribution, and the live roster -- Student 01 COMPLETED with published
scores, Student 02 IN PROGRESS (the very simulation recorded minutes earlier),
Students 03/04 NOT STARTED. All computed from the database, not mocks.

## What backs this demo (verified today)
- Golden-path E2E over real HTTP: 19/19 PASS (now includes both dashboards +
  2 new RBAC denial checks).
- Suites: engine 191/191; API unit 184 pass (8 known skips); web tsc clean.
- New this session: real /dashboard/student and /dashboard/teacher API
  endpoints (they were mock-only placeholders); Next 14 params fix on 7 pages.

## How to run it locally
See docs/sprint-handoff-2026-07-09.md section "How to run the demo".
One correction to those steps: start the web app with the API URL env var --
  NEXT_PUBLIC_API_URL=http://localhost:3001 pnpm --filter @aps/web dev
(without it the login form posts to the wrong origin).
