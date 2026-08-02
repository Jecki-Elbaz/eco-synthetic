# Adam 3-Session Review Package -- DRAFT SKELETON
# Eco | 2026-07-15 | For the ~2026-08-08 checkpoint (Adam-confirmed 2026-07-12:
# "first days of August ... timing works for me")
# OWNER RELAYS. No agent contacts Adam. Regenerate Section 4 fresh before relay.
# Purpose: Ido feasibility condition 2 + Sami C1 -- Adam's B2 sign-off applied at
# 3-session depth: he reviews a complete 3-session run and calibrates the delta
# model bounds BEFORE the 15-Aug internal rehearsal.

---

## 1. What we ask Adam to rule on (Sami C1 scope, verbatim intent)

1. CEILINGS: after two well-handled sessions, how cooperative may the patient
   plausibly be at session-3 start? Confirm or adjust:
   - trust ceiling 0.70 | openness ceiling 0.65 | alliance ceiling 0.70 (0-1 scale)
   - floors (irreducible difficulty regardless of student performance):
     trust 0.15 | openness 0.10 | alliance 0.10
2. EXPECTED CUMULATIVE RANGES: for a student performing below-average / average /
   above-average across sessions 1-2, what session-3 starting band is clinically
   plausible per dimension? (We enforce the ceilings; Adam defines the bands.)
3. SYMPTOM TRAJECTORY: what does a realistic 3-session symptom-marker progression
   look like for the pilot case set -- slow, bounded, NOT dramatically resolved
   in 3 sessions?

Any adjustment Adam gives = config change only (no redeploy): the six env vars
ARC_MAX_TRUST, ARC_MAX_OPENNESS, ARC_MAX_ALLIANCE, ARC_MIN_TRUST,
ARC_MIN_OPENNESS, ARC_MIN_ALLIANCE (apps/api/src/config/app.config.ts;
defaults in apps/api/src/simulation/arc/arc-delta-config.ts, marked
PENDING ADAM REVIEW BEFORE PRODUCTION GO-LIVE).

## 2. How the between-session model works (what he is signing off)

- IN-SESSION: per-turn patient state (trust/openness/alliance + symptom markers)
  moves under the engine's delta-cap rules and is hard-persisted per turn
  (PatientStateLog).
- SESSION END: the arc writer distills a per-session summary (final state values
  + notable-moments narrative, source-restricted to patient-state content, max
  2000 chars) and CLAMPS the carried values to the ceilings/floors above. Pre-
  and post-clamp values are logged for exactly this review.
- NEXT SESSION START: the loader injects the PRIOR session's summary as labeled
  context ("context only, not ground truth"). The guard NEVER sees arc summaries;
  authored ground truth stays the only authoritative source (QA-proven: the
  compounding-invented-facts test).
- KNOWN LIMITATION 1 (accepted, pilot-1): last-session-summary pattern -- session
  3 sees only session 2's summary; a session-1 detail that session 2's summary
  dropped is not recoverable in session 3.
- KNOWN LIMITATION 2 (disclosed to students at sessions 2 and 3): no modeling of
  between-session time passage (no mood fluctuation, life events, or regression
  between sessions).

## 3. Worked arithmetic examples (deterministic; what the clamp does)

Example A -- above-average student, both sessions:
  session-1 final trust 0.55 -> carried 0.55 (under ceiling).
  session-2 final trust computed 0.78 -> CLAMPED to 0.70 at carry.
  Session-3 patient opens at trust 0.70: engaged but still guarded. Adam
  calibrates whether 0.70 is the right "most cooperative plausible" bound.
Example B -- below-average student, both sessions:
  session-2 final trust computed 0.08 -> CLAMPED UP to floor 0.15.
  Session-3 patient opens minimally trusting but not clinically implausible
  (total shutdown would end the training value). Adam calibrates the floor.
Example C -- mixed (good session 1, poor session 2):
  no clamp typically fires; raw carry applies. The bands Adam gives in ask #2
  tell us whether unclamped mid-range carries also need bounds.

## 4. THE LIVE RUN (regenerated 2026-08-02 -- real 3-session arc)

Full detail, sample transcript, and reproduction steps:
`adam-review-package-section4-liverun-2026-08-02.md`. Summary below.

**How it was produced:** a real 3-session arc, driven through the live HTTP API
(invite-login -> create attempt -> 5 turns -> finish, x3 contiguous sessions, same
student). ONLY the student turns were scripted (session 1 clumsy, session 2 mixed,
session 3 skilled, in Hebrew, as a student would type). Every trust/openness/alliance
value is what the engine computed -- nothing authored or hand-tuned.

**Two caveats that bound the numbers.** (1) This used the DEV provider (local Claude Code
CLI on the owner Max plan), which ignores temperature -- behaviour is *indicative, not
exact*; the production (APS-004) provider will differ somewhat. (2) The default
StubProvider CANNOT produce this at all: it returns a constant analyser (empathy 0.5), so
trust never moves (verified: 15 identical stub turns -> trust delta 0.0000). Any earlier
flat data was a stub artefact, not a finding.

### Per-session summary (ArcSessionSummary)

| session | trustDeltaApplied | finalTrust | finalOpenness | finalAlliance |
|---------|-------------------|------------|---------------|---------------|
| 1 | -0.150 | **0.150** | 0.200 | 0.200 |
| 2 |  0.000 | **0.150** | 0.200 | 0.200 |
| 3 | +0.100 | **0.250** | 0.280 | 0.300 |

### The headline: the FLOOR fired twice; the CEILING was never approached.

Sessions 1 and 2 ended in-session at trust 0.100 and 0.080; both were clamped UP to the
`minTrust` floor (0.15) at carry -- visible in the server logs (pre-clamp 0.100/0.080 ->
post-clamp 0.150). This is Example B from Section 3 happening for real: a weak student
cannot drive the patient into implausible shutdown. Trust continuity holds -- session 3
opened at exactly 0.150 (= session-2 final), loading from session 2, not session 1.

The ceiling (0.70) was never tested -- the best session peaked at 0.250. **So this run
exercises the FLOOR, not the ceiling. Adam's ceiling asks (#1, #2) remain OPEN and cannot
be answered from this data.** A stronger-student / longer run would be needed to test them.

### What this says for the relay
- The **floor** is the binding constraint for weak students and it works; 0.15 is being
  hit repeatedly, so Adam's floor calibration matters in practice.
- The **ceiling** is still an engineering guess -- ask #1 stands unchanged.
- **Recovery is asymmetric:** two bad sessions cost more than one good session recovers
  (0.30 -> 0.15 -> 0.15 -> 0.25). Adam to say whether that is clinically right.

### Engineering findings (internal; board APS-030 -- share only if Adam asks about tuning)
1. The challenge-level dial is one-directional: `levelMultiplier` is clamped at 1.0, so
   levels 1/2/3 behave identically; the documented "level 1 = 1.4x" is unreachable.
2. `notableMomentsSummary` was empty (short sessions never triggered summarisation), which
   makes rehearsal criterion (h) invariant 2 vacuous until sessions are long enough.

## 5. Relay checklist (owner)

[x] Regenerate Section 4 from a fresh multi-turn run -- DONE 2026-08-02 (see Section 4 +
    adam-review-package-section4-liverun-2026-08-02.md). NOTE: this run exercises the FLOOR
    only; the ceiling is untested, so the relay must keep ceiling asks #1/#2 open.
[ ] Attach transcripts of the three sessions (owner-reviewed before sending). Full session-3
    transcript sample in the Section 4 file; one turn returned an English fallback (disclosed).
[ ] Send Sections 1-4 to Adam from the eco account, owner cc'd (Eco may draft
    the cover email on request -- drafting is authorized, sending is owner-only).
[ ] Deadline math: Adam's read in the "first days of August" leaves tuning room
    before 15-Aug; if his answers require >2 eng-days of model change, escalate
    to Ido immediately (structural-defect path -> October fallback assessment).
