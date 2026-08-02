# APS Hosted Demo -- Anthropic API Cost Estimate
# Author: Lital (CFO) | Task: APS-031-COST | Date: 2026-08-02
# Owner A1 required before any spend. This document is estimate only.

---

## 1. LLM CALL FAN-OUT PER TURN (verified from source)

Source files read: turn-pipeline.ts, guard-runner.ts, context-builder.ts,
input-gate.ts, evaluator.ts, debrief-supervisor.ts, claude-code.provider.ts

Per student turn (NORMAL path -- guard PASS on first attempt):
- 3 LLM calls:
  (1) Analyser call -- light model (ANALYSER hint)
  (2) Patient response call -- strong model (PATIENT_RESPONSE hint)
  (3) Guard check call -- light model (GUARD_PASS hint)

Per student turn (REGENERATE path -- guard FAIL, retry PASS):
- 5 LLM calls: (1) analyser + (2) patient attempt 1 + (3) guard FAIL
  + (4) patient attempt 2 + (5) guard PASS

Context summariser (light model, SUMMARISER hint):
- Fires ONLY when conversation history exceeds 4000 token window.
- Threshold: ~13-40 turns (per addendum 4 of runbook, code-verified by Gal 2026-08-02).
- 5-turn demo sessions: ZERO summariser calls. Not costed below.

Per session end (on COMPLETED):
- Evaluation: 2 LLM calls -- both strong model (EVALUATOR hint).
  Step 1: structured scoring (JSON). Step 2: prose + highlights.

On demand (debrief):
- 1 LLM call per question -- strong model (DEBRIEF hint).

---

## 2. MODEL TIERING (from claude-code.provider.ts modelForHint)

STRONG model (patientModel slot):
- PATIENT_RESPONSE, EVALUATOR, DEBRIEF -> premium/sonnet class

LIGHT model (lightModel slot):
- GUARD_PASS, ANALYSER, SUMMARISER -> lighter/haiku class

UNVERIFIABLE: Ido is finalizing the exact Anthropic model names in
APS-031-BUILD. Estimate below assumes sonnet class (strong) and
haiku class (light). If Opus class is selected for patient generation,
multiply patient-call costs by ~5x on that slot.

---

## 3. PRICES USED

Source: Anthropic public pricing page, knowledge cutoff August 2025.
CANNOT VERIFY 2026-08-02 prices -- Anthropic may have changed rates.
All figures below should be re-checked against the live pricing page
before owner decision.

Model assumed (strong): claude-3-5-sonnet-20241022
  Input:  $3.00 per million tokens
  Output: $15.00 per million tokens

Model assumed (light): claude-3-5-haiku
  Input:  $0.80 per million tokens
  Output: $4.00 per million tokens

---

## 4. TOKEN SIZE ASSUMPTIONS (Hebrew patient simulation, GAD intake)

Patient response call (strong model, per turn):
- System prompt (persona + challenge + ground truth + state JSON): ~530 tokens
  - Hebrew GAD intake patient persona: ~250 tokens
  - Challenge instructions block (1 of 5): ~30 tokens
  - Ground truth block (unlocked facts, doNotInvent, offRamp): ~150 tokens
  - State JSON (9 numeric fields + unlockedFactIds array): ~100 tokens
- Arc context block (sessions 2 and 3 only): ~120 tokens (included in avg below)
- Conversation history (sliding window, avg across 5-turn session): ~350 tokens
  - Turn 1: ~0 prior history; turn 5: ~560 tokens (4 exchanges x ~140 tokens)
  - Average across 5 turns: ~280-400 tokens
- Current student message (Hebrew): ~35 tokens
- Total input average: ~915 tokens
- Output (Hebrew patient response): ~150 tokens

Analyser call (light model, per turn):
- System prompt (classification schema + field list): ~150 tokens
- Student message: ~35 tokens
- Total input: ~185 tokens
- Output (JSON AnalyserResult, 12 fields): ~100 tokens

Guard call (light model, per turn):
- System prompt (guard instructions + ground truth lists): ~220 tokens
- Proposed patient response: ~150 tokens
- Total input: ~370 tokens
- Output (JSON verdict + violations + suggestion): ~20 tokens

Evaluation calls (strong model, 2 calls, per 5-turn session):
- Step 1 (scoring): rubric criteria + full transcript + analyser outputs
  Input: ~1500 tokens; Output: ~300 tokens (JSON scores)
- Step 2 (prose): step 1 context + structured scores
  Input: ~1800 tokens; Output: ~300 tokens (summary + highlights)

Debrief (strong model, per question):
- Transcript + rubric labels + eval summary + prior debrief turns + student Q
  Input: ~1400 tokens; Output: ~200 tokens

---

## 5. PER-TURN COST (normal PASS path, 3 calls)

Patient (strong):  $3.00/M * 0.000915 + $15.00/M * 0.000150 = $0.00500
Analyser (light):  $0.80/M * 0.000185 + $4.00/M  * 0.000100 = $0.00055
Guard (light):     $0.80/M * 0.000370 + $4.00/M  * 0.000020 = $0.00038
                                                             ----------
Per turn subtotal (PASS):                                    $0.00593

Guard retry (~8% of turns, adds 1 patient + 1 guard call):  $0.00538 extra
Expected retry contribution per turn: 0.08 * $0.00538 =     $0.00043

Per-turn cost (blended, incl. retry expectation):           ~$0.006-$0.007
Used below: $0.007 (conservative round)

---

## 6. PER-SESSION COST (5 turns + evaluation)

Turns: 5 * $0.007 =                                         $0.035
Evaluation step 1 (strong):
  $3.00/M * 0.0015 + $15.00/M * 0.0003 =                   $0.009
Evaluation step 2 (strong):
  $3.00/M * 0.0018 + $15.00/M * 0.0003 =                   $0.010
                                                          --------
Per session (no debrief):                                   ~$0.054

Debrief (per question, on demand, strong model):
  $3.00/M * 0.0014 + $15.00/M * 0.0002 =                  ~$0.007

---

## 7. DEMO WINDOW SCENARIOS

Scope: one external design partner (Adam), short-lived hosted demo,
synthetic patient only. Not recurring; one-off.

LOW -- 1 arc, 3 sessions, 15 turns, 2 debrief questions:
  Turns:         15 * $0.007 = $0.105
  Evaluations:   3  * $0.019 = $0.057
  Debrief:       2  * $0.007 = $0.014
  TOTAL:                      ~$0.18

EXPECTED -- 3 arcs, 9 sessions, 45 turns, 5 debrief questions:
  Turns:         45 * $0.007 = $0.315
  Evaluations:   9  * $0.019 = $0.171
  Debrief:       5  * $0.007 = $0.035
  TOTAL:                      ~$0.52

HIGH -- heavy exploration: ~12 sessions, 60 turns, 15 debrief questions:
  Turns:         60 * $0.007 = $0.420
  Evaluations:   12 * $0.019 = $0.228
  Debrief:       15 * $0.007 = $0.105
  TOTAL:                      ~$0.75

All three scenarios are well under $1.00 for the entire demo window.

---

## 8. KEY ASSUMPTIONS (explicit)

A1. Model choice: sonnet (strong) and haiku (light). Ido's final model
    selection (APS-031-BUILD) may change costs. Opus for patient = ~5x
    patient-slot cost.
A2. Session length: 5 turns/session per task spec. Longer sessions
    (>13 turns) may trigger the context summariser (1 additional light
    model call per turn above the window).
A3. Prices: Anthropic public prices, August 2025. Re-check before spend.
A4. Guard retry rate: ~8% of turns. Higher on adversarial or off-topic
    student input.
A5. Debrief usage: estimated 2-15 questions total across the demo window.
    More debrief use shifts cost toward the high scenario.
A6. No summariser in 5-turn sessions (code-verified; threshold ~13-40 turns).
A7. Evaluation always fires at session end (per simulation.service.ts;
    also fires after author-preview -- bypasses ledger, but costs tokens).

---

## 9. UNVERIFIABLE / FLAGGED

- Exact model names for the hosted demo: Ido finalizing in APS-031-BUILD.
  Stated prices are for the most likely sonnet/haiku mapping.
- 2026-08-02 Anthropic pricing: cannot verify; August 2025 rates used.
- If prompt caching is enabled on the Anthropic API, patient system-prompt
  tokens may be cached across turns, reducing input cost by ~80% on cached
  tokens. Not factored in above (conservative).

---

## 10. AUTHORIZATION NOTE

This is a bounded one-off demo spend for one design partner (Adam),
not a recurring cost. Total expected spend: $0.18-$0.75 for the full
demo window. Any spend against an Anthropic API account requires
owner A1 -- this estimate provides the financial basis for that decision.
No account, key, or spend has been authorized or committed.

---
Lital (CFO) | APS-031-COST | 2026-08-02
