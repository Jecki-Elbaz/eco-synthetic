# APS -- Adam Cohort Cost Analysis
# Prepared by: Lital (CFO / Finance)
# Date: 2026-07-08
# Input: Adam design-partner cohort sizing, 2026-07-08 (via Eco)
# Ref: gate-finance-lital.md (APS-004, 2026-06-29)
# Status: INTERNAL ONLY. Not for external sharing without owner A1.
# HARD CONSTRAINT: budget = 0. All numbers are estimates only. No spend authorized.
# All spend is A1 (owner). Lital tracks and reports only.

---

## 1. Adam Cohort Input (as received 2026-07-08)

- Students: ~20-25
- Staff / instructors: ~2
- Simulations per student: 3-5
- Total student simulation runs: 60-125 (20x3 low, 25x5 high)
- Adam-stated buffer ceiling: ~175 runs (stated explicitly as "with buffer above that")
- Self-simulation mode: bot plays a student, runs full simulations end-to-end.
  Author use: testing personas and scenarios before student-facing deploy.
  Volume: unspecified. See Section 3 for envelope.

Working run range: 60 (low) / 100 (expected midpoint) / 175 (high with buffer).

---

## 2. Per-Run Cost Model

### 2.1 Token Anatomy Per Simulation Run

Basis from APS-004 gate doc (gate-finance-lital.md, Section 2.1):
- Turns per simulation: up to 75 (hard cap APS-REQ-062).
- Tokens per turn (combined in + out): ~800 tokens.
- Ground-truth guard pass: runs IN PARALLEL per turn (APS pipeline design).
  This is a second LLM call per turn. Guard pass is typically shorter context
  (ground-truth file + turn content). Estimate: ~400 tokens per guard call.
- Total tokens per turn (student response + guard): ~800 + 400 = ~1,200 tokens.
- Post-session rubric evaluation pass: ~5,000 tokens (one pass per sim).
- Debrief chat: ~5-10 exchanges x ~600 tokens each = ~3,000-6,000 tokens.
  Central estimate: 4,000 tokens.
- Sliding-window summarization (APS-REQ-063): context management; does not add
  net new tokens beyond the turn budget. Already included in per-turn estimate.

Per-simulation token total:
- Turns: 75 x 1,200 = 90,000 tokens
- Eval pass: 5,000 tokens
- Debrief: 4,000 tokens
- TOTAL PER RUN: ~99,000 tokens (round to 100,000 for working estimate)

Note: gate doc used 65,000 tokens/run (no guard pass included). The guard pass
adds ~38% to per-run token load. This is the primary reason the per-run estimate
increases from the APS-004 baseline.

### 2.2 Model Price Assumption

UNVERIFIED. Must confirm from provider pricing pages at time of build.
Using GPT-4o / Claude Sonnet as rough proxy for premium-tier (no routing):
- Blended input+output rate: ~$0.008-0.015 per 1,000 tokens (UNVERIFIED range).
- Working central: $0.010 per 1,000 tokens (same as gate doc baseline).

Per-simulation cost at $0.010/1K tokens:
- 100,000 tokens x $0.010 / 1,000 = $1.00 per run (central, premium model, no routing)

Sensitivity:
- If model routing (APS-REQ-066) is implemented -- cheaper model for simpler turns:
  effective blended rate drops to ~$0.003-0.005/1K tokens. Cost per run: ~$0.30-0.50.
- If premium model only (routing not implemented in pilot): $1.00 per run.
- If guard pass uses a cheaper model (Haiku / GPT-3.5 equivalent) while main
  response stays premium: guard cost drops ~80%. Guard tokens = 75 x 400 = 30,000.
  Savings: ~$0.24 per run. Effective cost: ~$0.76 per run.

Working per-run cost range: $0.30 (routed) / $0.75 (mixed) / $1.00 (premium all).

---

## 3. Student Simulation Cost -- 60-175 Run Range

Using per-run range: low $0.30 / central $0.75 / high $1.00.

|             | 60 runs | 100 runs (mid) | 175 runs (buffer) |
|-------------|---------|----------------|-------------------|
| Low ($0.30) | $18     | $30            | $53               |
| Mid ($0.75) | $45     | $75            | $131              |
| High ($1.00)| $60     | $100           | $175              |

Expected pilot student-simulation LLM cost:
- Low scenario (60 runs, routed model): ~$18
- Expected scenario (100 runs, mixed model): ~$75
- High scenario (175 runs, premium model only): ~$175

These are LLM-only costs for student simulations. Infrastructure (compute, DB,
Redis, storage, transcription) is additive -- see Section 5.

---

## 4. Self-Simulation (Bot) Load -- Additional Envelope

### 4.1 What it is

Authors run automated simulations where a bot plays the student role end-to-end.
Purpose: test personas, scenario logic, rubric calibration before student-facing deploy.
Each self-simulation is a full pipeline run: same token anatomy as a student run
(patient LLM + guard pass + eval + debrief equivalent).

Possible difference: debrief may be skipped in automated mode. If so, save ~4,000
tokens per run. Adjusted self-sim token estimate: ~95,000 tokens (vs 100,000 for student).
Treated as equivalent for this estimate (difference is immaterial).

### 4.2 Volume Envelope

Adam has ~2 staff / instructors. Volume is not specified. Working assumptions:
- Pre-pilot testing phase: each author tests each persona they build.
  If there are 5-10 patient personas, and each is tested 3-5 times during authoring:
  = 15-50 author test runs per persona. With 2 staff and multiple personas:
  Estimate: 30-100 self-sim runs during the build/test phase.
- Ongoing: authors may re-run after edits. Nominal ongoing: 10-30 runs/month during
  active authoring.

Self-simulation run envelope: 30 runs (low) / 75 runs (expected) / 150 runs (high).

IMPORTANT CONSTRAINT -- build phase vs production phase (see Section 6):
- During build/test phase: StubProvider is used (near-zero model cost). Self-sims
  running against StubProvider cost approximately $0 in LLM tokens.
- Only after production go-live gate (APS-004 real-model gate) does self-sim incur
  real model cost. The above cost estimates apply ONLY in production mode.

### 4.3 Self-Simulation Cost (Production Mode)

Using same per-run range as student sims: low $0.30 / central $0.75 / high $1.00.

- Low (30 runs, routed): ~$9
- Expected (75 runs, mixed): ~$56
- High (150 runs, premium): ~$150

---

## 5. Full Pilot LLM Cost -- Combined

Student sims + self-sims (production mode only):

- Low total: $18 + $9 = ~$27
- Expected total: $75 + $56 = ~$131
- High total: $175 + $150 = ~$325

Adding other pilot-period LLM-adjacent costs from gate doc (teacher dashboard AI
queries, rubric auto-generation passes): +$20-50 (unchanged from APS-004 estimate;
small cohort reduces this).

TOTAL PILOT LLM COST RANGE (production mode, full pilot period):
- Low: ~$50
- Expected: ~$150-180
- High: ~$375

Confidence: LOW-MEDIUM. Unit prices unverified. Self-sim volume is an assumption.
Model routing decision (Should item in pilot-minimal) is the largest single lever.

---

## 6. Build Phase vs Pilot Production -- Cost Separation

This is a critical distinction:

BUILD / TEST PHASE (before production go-live gate):
- Real model is GATED to production go-live (APS-004 gate).
- All dev, unit test, integration test, and self-sim runs use StubProvider.
- StubProvider: deterministic outputs, no API calls, near-zero model cost.
- Build-phase LLM cost: approximately $0.
- Note: small number of real-model spot tests may be run during final integration
  (not covered by StubProvider). These would be a handful of runs -- estimate <$5
  total if done. Still requires A1 before any API key is provisioned.

PILOT PRODUCTION PHASE (after go-live gate, real students):
- Real model active. All costs in Sections 3-5 apply.
- This is when the $50-375 LLM estimate is incurred.
- Infrastructure costs (compute, DB, Redis) run from first deployment (pre-students),
  not just from first student session. See Section 5.2 of gate-finance-lital.md.

Summary table:
- Build phase LLM cost: ~$0 (StubProvider)
- Pilot production LLM cost: $50-375 (estimate; all A1 before incurred)
- Infrastructure (monthly, from deployment): $35-160/month (unchanged from gate doc)
- Transcription (voice, full pilot): $0-50 (unchanged from gate doc)

---

## 7. Reconciliation Against APS-004 Prior Estimate

APS-004 gate doc (2026-06-29) range:
- Low: $115/month
- Central: $250-400/month
- High: $820/month

APS-004 was sized for 50-100 students, 2-5 sims each = 100-500 simulation runs.
Adam cohort (60-175 runs, students only) is at the LOW end of that range.

LLM cost comparison:
- APS-004 Scenario A (100 runs at $0.65/run): ~$65 LLM. (Gate doc used 65K tokens/run.)
- This analysis (100 runs at $0.75/run with guard pass): ~$75 LLM.
  Difference: guard pass adds ~15% per run vs the gate-doc baseline. Not material.
- Adam cohort + self-sims (175 runs combined, expected): ~$131 LLM.
  This is still comfortably inside the APS-004 Scenario A range.

Does the Adam cohort fit inside the prior envelope?

YES -- with room to spare on the LLM line.
- The 60-175 student run range maps to $18-175 in LLM cost alone.
- Adding self-sims (expected 75 runs): +$56.
- Total expected LLM: ~$131. This is well below the APS-004 Scenario A LLM estimate
  of $65-90 (which did not include guard pass) and close to it when guard pass is added.
- The $250-400/month central estimate from APS-004 was sized for 100 students.
  Adam's 20-25 students is 1/4 to 1/5 of that. The LLM line scales down proportionally.
- Full pilot (LLM + infra + other): expected ~$185-540 for the pilot period total
  (not per month; a one-term pilot of 2-3 months at Adam's cohort scale).

CAVEAT: if model routing is NOT implemented (all turns hit premium model) and
self-sim volume is high, the high end ($375 LLM alone) approaches but does not
exceed the APS-004 monthly high of $820. Infrastructure is additive.

CONCLUSION: Adam's cohort as described fits comfortably inside the APS-004 envelope.
The prior range does not need to be revised upward. The self-simulation add-on is
an incremental load that is manageable at this cohort scale.

---

## 8. Open Items and Flags

FLAG-F8 (new): Self-simulation volume is not yet specified by Adam. If authors run
heavily (hundreds of automated runs/month in production), cost can scale quickly.
Recommend: set a soft cap on production self-sim runs per month (e.g., 200 runs/month)
and monitor. Flag to owner if usage approaches the cap. Owner A1 to lift cap.

FLAG-F2 (carry forward): Model routing (APS-REQ-066) is a Should item. At Adam cohort
scale the cost difference between routed and premium-only is $27-175 for the full pilot
-- not large in absolute terms, but the per-unit economics matter at scale. Still
recommend confirming routing scope before build.

FLAG-F9 (new): Guard pass model tier is a new cost dimension not in the APS-004 gate
doc. If the guard pass runs on a cheap model (Haiku / GPT-3.5 equivalent), it removes
~$0.24/run from the premium-model estimate. Ido / Perry to confirm guard pass model in
pilot-minimal scope.

FLAG-F1 (carry forward, now partially answered): Q1.1b student count answered (20-25).
Q9.2 sessions per student also answered (3-5). Range is now meaningfully tight.
Remaining unknown: self-sim volume and whether model routing is in pilot scope.

---

## 9. Summary (tight)

Expected pilot LLM run-cost (production mode, full pilot period):
- Student sims (60-175 runs): $18-175. Expected: ~$75.
- Self-simulation add-on (30-150 runs, production only): $9-150. Expected: ~$56.
- COMBINED expected: ~$131. COMBINED high: ~$325.

Build-phase model cost: ~$0 (StubProvider; real model gated to go-live).

Fit inside prior APS-004 envelope: YES. Adam cohort is well inside it.
APS-004 central was sized for 100 students. This cohort is 20-25 students.
LLM scales proportionally; the cohort fits in the lower portion of the prior range.

Infrastructure (compute + DB + Redis): $35-160/month from deployment, unchanged.
This remains the second-largest cost line and is not reduced by smaller cohort size
(fixed cost at pilot scale).

All costs are estimates. All unit prices unverified. Nothing here authorizes spend.
All spend is A1 (owner). Lital tracks and reports only.

---

*Prepared by Lital (CFO / Finance). Ref: gate-finance-lital.md (APS-004, 2026-06-29).*
*Adam cohort input received via Eco, 2026-07-08.*
