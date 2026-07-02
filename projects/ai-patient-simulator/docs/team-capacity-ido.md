# APS-009 -- Sprint 2 Capacity Decision
# Author: Ido (VP R&D) | Date: 2026-06-29
# Task: APS-009 | Status: INTERNAL ONLY
# Inputs: feasibility-ido.md, engine-architecture-gal.md, engine-architecture-review-ido.md

---

## Verdict: (b) GENUINE HIRE NEEDED

Sprint 2 (2026-07-14 to 2026-07-25) is NOT deliverable by Gal alone.
Oren does not change that conclusion. Explanation below.

---

## What Sprint 2 Actually Is

From feasibility-ido.md Section 3 and engine-architecture-review-ido.md DEP-4:

Sprint 2 scope in 2 weeks:
1. Full turn pipeline (7-step: input gate, analyser, state updater, context builder,
   generator, guard, delivery + persist) -- this is the highest-complexity item in the
   entire project.
2. Parallel guard architecture (stream + parallel guard call, buffered release, retry logic)
   -- non-trivial async concurrency work, decided in engine-architecture-review-ido.md S2.
3. Interaction analyser v1 -- separate LLM call, structured JSON, 9-dimension output,
   delta-table wiring. Roman on-demand handles the classification algorithm design, but
   Gal implements and integrates it.
4. Ground-truth enforcement -- guard prompt, PASS/FAIL/REGENERATE logic, version-locking,
   off-ramp carve-out.
5. Case authoring UI -- structured builder form, persona generation prompt, ground-truth
   file form, resistance rules, rubric builder (semi-auto generation + teacher edit + publish).
6. Hebrew RTL rendering -- requires i18n setup, RTL CSS, and integration testing in the
   student interface.
7. Credit/token management -- CreditLedger, CreditEntry, UsageLog, soft/hard limits,
   admin UI, deduction event pipeline.
8. StubProvider deterministic guard config (TH-01 mapping) -- test infrastructure Adi
   needs at Sprint 3 start.
9. Failure-simulation hooks (FS-01 through FS-05, TH-01 through TH-07) -- must be ready
   at Sprint 2 end.

That is 9 distinct deliverable sets. The engine pipeline alone (items 1-4) is a full 2-week
sprint for one senior engineer. The front-end and credit work (items 5-7) is another full
sprint. Combined, this is not 2 weeks of work for one person.

---

## Why Gal + Roman + Oren Does Not Cover It

GAL (builder, Bash, primary): carries the full engine pipeline build. This is the correct
assignment; no one else can do it. But items 5-7 (case authoring UI, Hebrew RTL, credit
management) are parallel tracks that cannot share a single engineer's time with items 1-4
without one of them slipping.

ROMAN (algorithm specialist, on-demand, no Bash): correctly invoked for the interaction
analyser classification design (delta-table rules, dimension thresholds). Roman's output
is a design artifact -- the rule table config -- not a build output. Roman does not reduce
Gal's implementation load; he reduces Gal's design uncertainty. Essential, but not
additional hands.

OREN (Senior Dev, live since 2026-06-18, review-only -- Read/Edit, no Bash, no build
write): Oren can review Gal's code, flag issues early, and produce design documents or
typed interfaces. He CANNOT run builds, execute migrations, wire the NestJS modules, or
push tested code. In a sprint where every deliverable requires build execution, Oren's
value is real (fewer defects escape Sprint 2 into Sprint 3) but he does not reduce the
build surface. He cannot be the second engineer on the critical path.

Concrete load gap: Gal implementing the full engine pipeline (items 1-4) realistically
takes 8-10 days of focused work. Sprint 2 is 10 working days. Items 5-9 have zero
remaining capacity in that scenario. The Sprint 2 end-of-sprint milestone (feasibility-ido.md
S3) requires: "a complete student simulation session can run end-to-end on a test case."
That milestone requires both the engine AND the case authoring (you need a case to run).
One engineer cannot deliver both in 2 weeks.

---

## What Slips Without the Hire

If no second hands-on engineer starts Sprint 2:

- Case authoring (item 5) slips to Sprint 3. Sprint 3 then cannot complete the evaluation
  pipeline + dashboards + support assistant on top of absorbing the authoring work.
  Sprint 3 becomes overloaded and the 15 Aug rehearsal has no complete simulation to run.
- Hebrew RTL (item 6) slips. The 15 Aug rehearsal runs English-only. Criterion C
  (interaction analyser, 70% acceptable on Hebrew turns) cannot be tested. This is a
  rehearsal no-go condition.
- The 15 Aug rehearsal fails on criteria (a) or (b) by default (no complete test case
  to run against). Fallback to 15 Oct activates.

The chain is direct: no second engineer -> Sprint 2 scope does not close -> 15 Aug
rehearsal fails -> 15 Oct fallback.

---

## Hire Profile Required

Role: Full-stack TypeScript engineer (hands-on, builder).
Non-negotiable capabilities:
- NestJS (modules, DI, WebSocket) -- needed for Sprint 2 NestJS service wiring.
- Next.js (App Router, RTL/i18n) -- needed for case authoring UI and Hebrew RTL.
- Prisma + PostgreSQL -- the schema is written; they need to work from it without ramp.
- Bash/shell for build tasks (git, pnpm, docker-compose) -- this is the capability gap
  vs Oren.

Seniority: mid-to-senior. Does not need to own architecture (Gal owns that). Needs to
execute clear specs from Gal without supervision overhead that consumes Gal's time.

When needed: must be productive by Sprint 2 start (2026-07-14). That means confirmed
and onboarded in Sprint 1 (by 2026-07-07 at latest -- feasibility-ido.md condition 2).
This is unchanged from the original feasibility document.

Note on Oren: Oren's review-only constraint was presumably set at hire for a reason.
If that constraint can be lifted (A1 decision -- not mine to make), Oren would partially
fill this gap. But I cannot assume or request that lift unilaterally. If Eco/owner want
to revisit Oren's tool access as an alternative to a new hire, that is a legitimate option
to evaluate -- it would need a specific A1 with the rationale for the constraint change.
I am naming it so the tradeoff is visible; I am not recommending it without knowing why
the review-only constraint was set.

---

## Conditions If Hire Is Confirmed on Time

1. Hire must be confirmed by 2026-07-07 (Sprint 1 week 2). Later confirmation does not
   give enough ramp time before Sprint 2 start.
2. Roman must be available weeks 1-2 of Sprint 2 for interaction analyser rule-table
   design. His output is a build-blocking input for the state updater.
3. Clinical advisor must be confirmed by 2026-07-11 (DEP-1 in engine-architecture-review-
   ido.md). The state updater delta caps cannot be finalised without the advisor's
   calibration, which the second engineer will also be implementing.
4. APS-004 gate must close by 2026-07-11 (DEP-2). Without a cleared LLM provider, Sprint 2
   accuracy validation is impossible regardless of team size.

---

## APS-009 Status

OPEN -- requires Eco escalation to owner (A1 hire decision).
This document is the R&D capacity analysis supporting that escalation.
No hire is initiated without explicit owner A1.

---

*Internal only. Not for external sharing without owner A1.*
*Ido (VP R&D) | 2026-06-29*
