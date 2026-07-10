# APS Pilot-1 Cohort Cost Estimate
# Prepared by: Lital (CFO / Finance) | 2026-07-10
# Task ref: APS-010 routing (Lital leg)
# Sources: adam-pilot-readiness-answers-2026-07-08.md | gate-finance-lital.md (2026-06-29)
# STATUS: ESTIMATES FOR OWNER PLANNING ONLY. Budget = 0. All spend requires owner A1.
# Real costs begin at production go-live. StubProvider = $0 today.

---

## 1. Adam's Confirmed Planning Numbers (COHORT-SIZE, 2026-07-08)

- Students: 20-25
- Staff (teachers/admins): ~2
- Sessions per student: 3-5
- Total simulation runs: 60-175 (floor = 20x3; ceiling = 25x7 with buffer)
- Track B (multi-session continuing arc): REQUIRED for Sep pilot (Q9.1 override; no longer deferred)
- Author-preview/self-simulation runs: ~20-60 (authoring phase, pre-pilot-launch)
- Debrief chat: up to 10 student questions per completed simulation attempt

---

## 2. Per-Run Token Model

Unit price: $0.010/1K tokens blended average (UNVERIFIED; rough proxy for GPT-4o/Sonnet-class
without routing). Must verify current provider pricing before provisioning. A1 required before
any AI API account is opened. No model routing assumed (APS-REQ-066 not confirmed as Must scope).

### Type A -- Standard Student Simulation Run (single session, no Track B carry)

- Interaction turns: 75 turns (hard cap, APS-REQ-062) x 800 tokens/turn = 60,000 tokens
- Post-session eval pass: 5,000 tokens
- Debrief Q&A (10 questions x 1,500 tokens/exchange): 15,000 tokens
- PER-RUN TOTAL: 80,000 tokens | COST: ~$0.80

Debrief note: 1,500 tokens/exchange is a low-mid estimate. If each exchange loads the full
eval output as context, range is 1,500-5,000 tokens/exchange (15K-50K total per run). Flag F1
below: Perry/Ido to confirm context-load design for debrief.

### Type B -- Track B Continuation Session (session 2+ in multi-session arc)

- Base = Type A + 20% context overhead for prior-session state carry
- PER-RUN TOTAL: 96,000 tokens | COST: ~$0.96
- Blended rate (assume 50% of sessions are continuation sessions): 88,000 tokens | $0.88/run
- Track B uplift vs Type A: +$0.08/run. Immaterial at pilot scale.

### Type C -- Author-Preview / Self-Simulation Run

- 6 turns x 800 tokens + 1,000 mini-eval = ~6,000 tokens | COST: ~$0.06/run
- Worst case (full eval pipeline triggered): ~32,000 tokens | ~$0.32/run
- Using $0.06 base. Flag F2 below: confirm whether author-preview triggers full eval pass.
- Credit-exempt but token-consuming. Volume: 20-60 runs.

---

## 3. Pilot-1 Total Range

Expected midpoint: 115 student runs (midpoint of 60-175), 40 preview runs.

### 3.1 LLM / AI API Cost Only

WITHOUT Track B (Type A, $0.80/student run):

  Scenario    | Student Runs | Preview Runs | LLM Total
  ------------|-------------|-------------|----------
  Floor       | 60          | 20          | $49
  Expected    | 115         | 40          | $94
  Ceiling     | 175         | 60          | $144

  Math: (runs x $0.80) + (preview x $0.06)

WITH Track B (blended $0.88/student run):

  Scenario    | Student Runs | Preview Runs | LLM Total
  ------------|-------------|-------------|----------
  Floor       | 60          | 20          | $54
  Expected    | 115         | 40          | $104
  Ceiling     | 175         | 60          | $158

  Track B LLM uplift: +$5 to +$14 vs without Track B. Immaterial.

### 3.2 Infrastructure (monthly flat cost, ~2 months active use)

Component                         | Low/month | Mid/month | High/month
----------------------------------|-----------|-----------|----------
Cloud VM + DB + Redis             | $35       | $80       | $160
Storage + email                   | $0        | $3        | $10
Subtotal per month                | $35       | $83       | $170
x 2 months                        | $70       | $166      | $340
Voice transcription (full pilot)  | $0        | $15       | $45
Infrastructure total (pilot)      | $70       | $181      | $385

Infra note: provider, region (IL data residency), and self-vs-managed all unresolved pending
Rambo + Eyal hosting gate (FLAG-F5 from gate-finance-lital.md; still open). Infra cost is
FIXED per active month regardless of run volume.

### 3.3 All-In Pilot-1 Total (LLM + Infrastructure)

WITHOUT Track B:
  Floor:    $49  LLM + $70  infra + $5  misc = ~$124
  Expected: $94  LLM + $181 infra + $15 misc = ~$290   (rounding: ~$275-290)
  Ceiling:  $144 LLM + $385 infra            = ~$529

WITH Track B:
  Floor:    $54  LLM + $70  infra + $5  misc = ~$129
  Expected: $104 LLM + $181 infra + $15 misc = ~$300   (rounding: ~$285-300)
  Ceiling:  $158 LLM + $385 infra            = ~$543

Track B pilot-1 uplift: +$5 to +$14 on total. Immaterial at this cohort size.

SUMMARY RANGES:
  Without Track B: floor ~$124 / expected ~$275-290 / ceiling ~$529
  With Track B:    floor ~$129 / expected ~$285-300 / ceiling ~$543

KEY OBSERVATION: At 20-25 students, INFRA ($70-385) exceeds LLM API ($49-158) in every
scenario. Infrastructure is the dominant pilot cost, not LLM tokens. This reverses at scale
(500+ students), where LLM dominates. Design decision: is there a cheaper bare-VM setup
that could reduce the infra floor to hold the expected total under $200?

---

## 4. Monthly Shape

Infra: flat $35-160/month regardless of how many students run in that month.
LLM: usage-driven by run volume. Author-preview runs occur in authoring phase (pre-launch);
student simulation runs occur during the active pilot term.

Likely 2-month distribution for the 60-175 student runs:
  Month 1 (~60% of runs, orientation + first sessions):
    LLM: $29-86 | Infra: $35-160 | Total: $64-246/month

  Month 2 (~40% of runs, remaining sessions):
    LLM: $20-58 | Infra: $35-160 | Total: $55-218/month

Peak-month scenario (all runs concentrated in one month, e.g., block format):
  Without Track B: $49-144 LLM + $35-160 infra = $84-304/month
  With Track B:    $54-158 LLM + $35-160 infra = $89-318/month

Author-preview runs (pre-launch phase): $1.20-$3.60 LLM (negligible; 20-60 runs x $0.06).

---

## 5. Sensitivity: 60-Run Floor vs 175-Run Ceiling

Run-volume sensitivity (LLM line only):
  - Each additional 10 student runs: +$8.00 LLM (no Track B) / +$8.80 (Track B)
  - Each additional 10 preview runs: +$0.60 LLM
  - Full 115-run spread (175 minus 60): $91 LLM difference

Total-cost spread floor-to-ceiling (including flat infra):
  - $405 spread (no Track B: $124 to $529)
  - Most of that spread comes from infrastructure uncertainty ($70-385), not run volume
  - If infra is pinned at one estimate, the run-volume spread shrinks to ~$91 on the LLM line

Model tier sensitivity (biggest lever -- see Assumptions A4):
  With routing (APS-REQ-066, ~$0.003/1K blended):  $28 LLM at expected volume (-70%)
  Base (no routing, $0.010/1K):                     $94 LLM at expected volume
  Premium-only higher price ($0.015/1K):            $141 LLM at expected volume (+50%)
  Routing = 3-5x difference on the LLM line alone.

---

## 6. Assumptions Register

A1 | Turns per run: 75 x 800 tokens = 60K
   Confidence: LOW. Average turns may be 40-75; hard cap = 75 (APS-REQ-062).
   APS-REQ-063 sliding-window bounds context growth.

A2 | Eval pass: 5,000 tokens per run
   Confidence: LOW-MED. Size depends on ground-truth file + rubric length.

A3 | Debrief: 10 Q x 1,500 tokens = 15K tokens per run
   Confidence: LOW. Range 5K-50K per run depending on context loaded per exchange.
   Flag: confirm with Ido/Perry what context is loaded per debrief exchange (see Flag F1).

A4 | Unit price: $0.010/1K blended (UNVERIFIED). No routing (APS-REQ-066 not in Must scope).
   Confidence: UNVERIFIED. Confirm at time of API provisioning (A1 required first).
   Risk: without routing, all turns hit premium pricing. With routing, LLM cost drops 70%.
   THIS IS THE MOST SENSITIVE ASSUMPTION. See Section 5.

A5 | Track B overhead: +20% tokens for continuation sessions
   Confidence: LOW. Range 10-30%. Net impact at pilot scale = $5-14 total (immaterial).

A6 | Author-preview pipeline: 6,000 tokens per run, $0.06, 20-60 runs
   Confidence: LOW. If full eval pipeline runs on preview: ~32,000 tokens/run = $0.32.
   Flag: Perry/Ido to confirm (see Flag F2).

A7 | Pilot active duration: 2 months
   Confidence: UNCERTAIN. Could be 1 month (intensive) to 4 months (full semester).
   Infra scales linearly: 4 months = $140-640 infra vs $70-320 base.

A8 | Infrastructure: $35-160/month
   Confidence: UNCERTAIN. Provider, region (IL data residency), self-vs-managed unresolved.
   Rambo + Eyal hosting gate required before any infra is provisioned (FLAG-F5).

A9 | Expected run midpoint: 115 (midpoint of 60-175 with buffer)
   Confidence: PLANNING ONLY. Actual depends on student completion rate and dropout.

MOST SENSITIVE: A4 (model tier). No routing = premium price for every turn. If APS-REQ-066
is excluded from pilot-Must scope, the LLM line could be 1.5-5x vs this estimate depending
on provider and pricing confirmed at time of provisioning. Perry/Eco to decide Must vs Should.

SECOND MOST SENSITIVE: A8 (infra). Dominates total cost at this cohort size. A bare-VM
self-managed setup at the low end keeps pilot total under $200; full managed stack pushes
ceiling to $529+.

---

## 7. What This Updates vs gate-finance-lital.md (2026-06-29)

The prior gate doc assumed up to 100 students x 5 sims = ~500 simulations (student count was
unknown at that time). Adam's confirmed 20-25 student cohort reduces expected LLM cost by
roughly 4-5x vs that scenario.

Prior central estimate: $250-400/month (100 students, 3-5 sims)
Updated central estimate: $94/month LLM + $35-160/month infra = $130-254/month all-in
during active months (20-25 students, per Adam's confirmed numbers).

The $115-820/month total range in gate-finance-lital.md is now bounded for Pilot-1 at:
$84-304/month peak (in any single active month, all-in).

New usage classes added by this estimate vs prior doc:
- Author-preview/self-simulation runs (Type C): ADDED -- previously unmodeled.
- Debrief (10 Q per attempt): MODELED EXPLICITLY -- prior doc treated as 20-40% LLM add-on;
  now broken out as 15K tokens/run (low-mid, with range flagged).
- Track B continuing arc: ADDED as 20% context overhead per continuation session.

---

## 8. Open Flags for Perry / Ido / Eco

F1 (token model): What context is loaded per debrief exchange? Full eval output vs compressed
   summary vs rubric-only. Answer shifts debrief from 15K to 50K tokens per run (3x LLM delta).

F2 (token model): Does author-preview/self-simulation trigger the full eval pipeline? If yes,
   cost per preview = ~$0.32 not $0.06.

F3 (Track B context): What prior-session content is embedded in the session-2 context window?
   Confirm Track B context overhead assumption (currently 20%).

F4 (APS-REQ-066): Model routing -- Perry/Eco to confirm Must vs Should for Sep pilot.
   This is the single biggest product decision affecting operating cost at pilot AND at scale.
   Without routing: all turns at premium. With routing: LLM cost drops 70%.

---

## 9. Authorization Reminders

All spend requires owner A1. Budget = 0.
- AI API account (any provider): A1 + Rambo gate before any key is provisioned.
- Cloud infra: A1 + Rambo + Eyal hosting gate (FLAG-F5, still open from gate-finance-lital.md).
- Voice transcription API: A1 + gate (self-hosted = no gate needed for the tool itself).
- Model routing scope decision: Perry/Eco confirm Must vs Should before build starts.

---

*All figures are estimates for owner planning. Unit prices are UNVERIFIED unless noted.
Nothing in this document authorizes any spend. StubProvider = $0 today; real costs begin
at production go-live only.*
