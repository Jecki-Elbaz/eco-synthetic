# Phase 7 -- Agent Performance Audit ("is each agent doing its job 100%?")

Program: company/audits/audit-program-plan.md (expansion, Phase 7). Date: 2026-07-13.
Assessors (self-excluded): Assaf (delivery + utilization from run logs/board/deliverables) + Dalia (work-product
quality of real delivered outputs). Synthesized by Eco (who assesses the two assessors). Completes the DOING% axis
of company/audits/2026-06/agent-fitness-scorecard.md.

---

## 1. Executive summary

**The fleet is doing its job.** Measured against DUE output (not raw activity), no agent failed a responsibility
because of its own performance. Delivery is on-track and work-product QUALITY is STRONG across the agents that have
produced real deliverables -- notably the live APS Sprint-7 build (Ido envelopes, Gal delivery, Oren review, Adi QA,
Shir infra all rated STRONG with genuine verify-before-claim discipline), the legal/finance/security governance work
(Eyal, Lital, Rambo, Anat), and Eco's orchestration. Every "gap" resolves into one of three benign buckets:

- **Blocked-by-infra (external, now fixed):** the weekly scheduled cadence for Rambo, Dalia, Ido, Oracle, Yael
  stalled 06-29..07-06 -- the AUD-007 runner degradation, NOT the agents. Shir delivered the AUD-007 fixes 2026-07-12,
  so these recover automatically.
- **Owner-gated (not a miss):** Hila (publishing gated on your avatar A1), Mike (CS-0001 awaiting A1), Sally
  (cert-line awaiting A1) -- performing to the extent allowed.
- **Idle-by-design (100%):** the on-demand and pre-product agents (Zvika, Roman, Sami, Luci, Erez, CS/Sales group,
  MeetingPrep) that correctly wait for a trigger and perform when invoked (validated by the Phase 6 spot-tests:
  Jenny held her CS hard gate; Gal/Lital passed).

The two program questions are now answered with evidence: every live agent CAN do its job (Phase 6) and IS doing it
(Phase 7). The fitness scorecard lands overwhelmingly in FIT or correctly-IDLE; no agent is "neither."

Tally: 1 major quality finding + 2 minor + 2 observations. Zero critical; zero real performance misses.

## 2. The one finding that matters -- F-QUAL01 (Assaf)

The single real quality miss is, pointedly, the Op-Ex agent's own: in the Phase 6 inputs/deps leg, Assaf reported
Adi and Oren as "not live" (blockers) and T-0012 as "open" -- all three are stale misreads (Adi/Oren certified+live
since 2026-06-18; T-0012 closed/formalized in the access-matrix). Eco caught both by reading the decisions-log --
the exact source Assaf should have consulted. This is a verify-before-claim breach (soul rule 2; CLAUDE.md RL11) and
a KPI miss for the role whose fitness-loop depends on accurate live-status. Dalia's quality leg independently
confirmed it. Note: Assaf's Phase 7 delivery leg (this phase) was accurate -- he verified live status -- so the fix
is a durable procedure, not a pattern.
Fix: add a mandatory source-read step to the fitness-loop procedure ("before flagging any agent as not-live, read its
cert record + the decisions-log entry"); route to Anat for Assaf's next R&R.

## 3. Minor findings

- **F-QUAL02 (Ido):** a Sprint-7 envelope specified a Prisma field (`studentId`) from memory; the real field is
  `userId`. Gal caught + corrected it (verify-before-claim working downstream). Fix: read the schema before naming
  fields in a task envelope.
- **F-QUAL03 (Oren):** the Sprint-7 review took 3 runs to land (session-limit + stall) before a bounded 9-file
  reading list worked. Fix: make the bounded reading list the default start condition for a review.
- **F-QUAL04 (obs):** Oracle + Yael output fires but was not directly sampled this cycle -> add to the next quality
  audit sample.
- **F-QUAL05 (obs):** Mike's CS-0001 draft is sound; section 8 pending fold-in of Eyal's EA-2 retention text (now
  available) -> Mike folds it, then the owner-A1 package is complete.

## 4. Assessor check (Eco)

Both assessors were reliable this round. Assaf's Phase 7 delivery leg verified live status (no repeat of the Phase 6
misread) and applied the fairness rule correctly (infra/owner-gated/idle distinguished from real misses). Dalia's
quality leg sampled real deliverables with citations and independently surfaced F-QUAL01. Eco covers both (self-
exclusion honored). Assaf's own F-QUAL01 is the exception, carried to his R&R.

## 5. Recommendation

Nothing here blocks anything. The fleet is fit and performing; the runner block that suppressed the scheduled agents
is already fixed. Close the loop on F-QUAL01 (procedure + R&R) and note F-QUAL02/03 as coaching. Triage below. With
Phase 7 done, the two-axis Agent Fitness Scorecard is complete -- the answer to "does every agent work, independently
and as a team" is a documented yes.
