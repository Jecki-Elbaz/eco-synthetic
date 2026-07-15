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

## 4. THE LIVE RUN (regenerate FRESH within a few days of the relay -- placeholder)

HONESTY NOTE for the owner (do not relay stale numbers): scripted StubProvider
E2E sessions are 1-2 trivial turns -- state stays flat (verified 2026-07-15:
trust 0.30 across all three sessions, delta 0, empty narratives). A meaningful
run for Adam needs MULTI-TURN sessions that exercise the delta rules -- run the
rehearsal runbook criterion (h) block (3 contiguous sessions, student-01, the
scripted turn sets) against the live stack, then capture:
  - Per-session ArcSessionSummary rows (SQL in the runbook (h) section: final
    trust/openness/alliance + notableMomentsSummary + pre/post-clamp log lines).
  - Session-3 opening context (ArcLoaderService log line).
  - Per-turn trust curve per session (runbook criterion (a) SQL).
Package that as a table + the transcripts, and attach Sections 1-3 above.

## 5. Relay checklist (owner)

[ ] Regenerate Section 4 from a fresh multi-turn run (runbook (h)).
[ ] Attach transcripts of the three sessions (owner-reviewed before sending).
[ ] Send Sections 1-4 to Adam from the eco account, owner cc'd (Eco may draft
    the cover email on request -- drafting is authorized, sending is owner-only).
[ ] Deadline math: Adam's read in the "first days of August" leaves tuning room
    before 15-Aug; if his answers require >2 eng-days of model change, escalate
    to Ido immediately (structural-defect path -> October fallback assessment).
