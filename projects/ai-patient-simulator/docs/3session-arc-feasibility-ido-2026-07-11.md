# APS -- 3-Session Arc Feasibility Assessment
# Author: Ido (VP R&D) | Date: 2026-07-11
# Inputs: adam-answers-feasibility-ido-2026-07-08.md (Sections 1+4),
#         feasibility-ido.md (Section 4), board.md APS-017
# Requester: Eco (CEO) -- Adam counter-ask, B2 gate now satisfied
# Status: INTERNAL ONLY -- not for external sharing without owner A1

---

## Context

Adam confirmed (2026-07-10 reply, Rambo-screened SAFE):
- Multi-session same-patient IS his pilot design (settled, IN for Sep).
- He personally signs off the between-session delta model (B2 gate = SATISFIED).
- Counter-ask: raise the arc cap from 2 sessions (Ido's 2026-07-08 recommendation)
  to 3 sessions for pilot-1.

This note assesses the 3-session arc on engineering/QA/timeline dimensions only.
Clinical acceptability of raising the cap from 2 to 3 is deferred to Sami --
the 2-cap was my conservative recommendation layered on top of Sami's stated
"2-4 sessions for v1" range (feasibility-ido.md Section 4). 3 is within that range
but I cannot speak to whether the accumulated delta model effect over 3 transitions
changes Sami's clinical requirements.

---

## 1. Added Engineer-Days -- 3-Session vs 2-Session

The Track-B component list from 2026-07-08 (A through G):

COMPONENTS WITH NO INCREMENTAL COST AT 3 SESSIONS:
- A. Session-boundary loader: the loader reads the prior session's StudentPersonaHistory
  summary. The logic is identical whether the prior session is session 1 or session 2.
  No code change needed for 3 sessions vs 2.
- C. Arc-length enforcement: the max_sessions field on SimulationTemplate is a config
  value. Changing the cap from 2 to 3 is a config default change, not a code change.
  ~0 days.
- D. Authoring UI extension: the max_sessions input field already accepts any integer
  in the 2-4 range per Sami's constraint. No additional UI work for 3 vs 2.
- E. Student UI session context: shows "continuing from session N" regardless of N.
  No additional work.

COMPONENTS WITH INCREMENTAL COST AT 3 SESSIONS:
- B. Session-arc writer: the writer persists a per-session summary to
  StudentPersonaHistory. For a 3-session arc, the delta model is applied TWICE
  (session 1->2, then session 2->3). The simplified delta model (trust +/- N,
  symptom marker advancement gated by turn count + trigger rules) is parameterized
  -- it does not need redesign for a second application. The incremental cost is
  a review pass to confirm the cumulative state (accumulated trust delta,
  symptom progression after two sessions) does not produce out-of-bound values
  (e.g. trust score overflowing its valid range). Estimate: +0.5 days Gal (guard
  rails on cumulative delta, one additional unit test covering the 3-session
  accumulation path).
- F. QA (Adi): This is the largest incremental cost. A 2-session arc requires Adi
  to validate one state transition (session 1 -> session 2). A 3-session arc requires
  two consecutive transitions (session 1 -> session 2 -> session 3). The QA surface
  roughly doubles for the arc-coherence tests because:
  (i) A session-2 state error that was invisible at session 2 may only surface at
      session 3 when the compounded delta is applied.
  (ii) The "no invented facts" assertion must hold across two transitions, not one.
  (iii) The live-Postgres integration tests must cover the full 3-session run,
       which is a longer test execution.
  Estimate: +1 day Adi (additional integration test suite covering the 2->3
  transition; regression on cumulative state coherence).

TOTAL INCREMENTAL COST: +1.5 engineer-days above the 8-day Track-B estimate.

REVISED TRACK-B ESTIMATE WITH 3-SESSION CAP:
- Gal: 5.5-6.5 days (was 5-6)
- Noa: 2 days (unchanged)
- Adi: 2-3 days (was 1-2)
- Total: ~9.5 engineer-days (vs 8 at 2-session cap).

---

## 2. Impact on 15-Aug Rehearsal Criterion (h)

CURRENT CRITERION (h) from 2026-07-08 assessment:
"A 2-session continuing-persona arc is coherent: session 2 patient correctly reflects
session 1 state without inventing facts or losing prior alliance context."

REQUIRED UPDATE FOR 3-SESSION CAP:
"A 3-session continuing-persona arc is coherent across all three sessions: session 2
patient correctly reflects session 1 state; session 3 patient correctly reflects the
accumulated state from sessions 1 and 2. No invented facts. No lost alliance context
across either transition."

MATERIAL DIFFERENCE FOR THE REHEARSAL:
- A 2-session arc test consumes 2 sequential rehearsal simulation slots.
- A 3-session arc test consumes 3 sequential rehearsal simulation slots.
- The rehearsal was planned for 3-5 full simulation sessions (feasibility-ido.md
  Sprint 4). A full 3-session arc coherence test takes 3 of those slots.
  That is feasible but it means the rehearsal scenario set must explicitly allocate
  3 contiguous slots to the arc-coherence test. Do not run it across two days --
  the state coherence check needs all three sessions in sequence under the same
  tester.
- The harder problem: session 3 state correctness depends on session 2 state
  correctness. If session 2 introduces a subtle delta error (e.g. trust delta
  applied twice due to a boundary condition), session 3 compounds it. The rehearsal
  will surface this if the tester is looking for it -- but the pass/fail bar for
  criterion (h) must explicitly state that session 3 coherence is checked, not just
  session 2.

DOES 15-AUG PASS BY THIS CRITERION?
Yes, IF:
1. Build starts by 2026-07-14 (Sprint-2 remainder -- one week from today).
2. Adi's QA on the 3-session arc completes before 2026-08-08 (Sprint-3 end).
3. Rehearsal scenario planning explicitly allocates 3 contiguous slots for the
   arc-coherence run and includes a tester who knows what session-boundary
   invariants to check.

The +1.5 engineer-days do not push the build past Sprint-3 end -- there is headroom.
The risk is not the engineering days; it is whether the cumulative state is
clinically coherent enough to pass Adam's review (B2 gate) before 15-Aug.

---

## 3. Sprint-2 Remainder + Sprint-3 Fit

Available capacity (from 2026-07-08 assessment):
- Sprint-2 remainder (2026-07-14 to 2026-07-25): ~10 engineer-days
- Sprint-3 (2026-07-28 to 2026-08-08): ~10 engineer-days
- Total available for Track B: ~20 engineer-days

Track B at 3-session cap: ~9.5 engineer-days.

This fits -- there is approximately 10.5 engineer-days of buffer in Sprint-2+3.
That buffer is not free; it is allocated to other Sprint-3 items (evaluation pipeline
hardening, teacher/student UI polish, APS-014 follow-ups, Perry's m6 GT-before-rubric
ruling from APS-020). The 3-session arc does not consume the buffer alone, but it
leaves less margin for slippage on those other items.

SEQUENCING RECOMMENDATION (within the track-B envelope):
- Sprint-2 remainder (Gal): session-boundary loader + session-arc writer with
  3-session cumulative guard + arc-length config. Highest-risk items first.
- Sprint-2 (Noa): authoring UI max_sessions field + student context panel.
- Sprint-3 (Gal): unit + integration test coverage for the 3-session accumulation path.
- Sprint-3 (Adi): QA -- full arc-coherence integration suite (both transitions).
- Sprint-3 checkpoint (Adam / B2): run a test 3-session sequence; Adam confirms
  the delta model output is clinically coherent across 3 transitions. This must
  happen BEFORE the 15-Aug rehearsal, not at it. Target: 2026-08-08.

DOES IT RISK THE 15-AUG GO/NO-GO?
The timeline risk is LOW-to-MEDIUM. It does not push past the build window.
The quality risk is MEDIUM: the 3-session arc's second transition is being built and
validated for the first time. The simplified delta model has not been exercised at
3-session depth in any real simulation. There is no precedent for how it behaves
at the accumulated state. The 15-Aug rehearsal is the first full test of that.
If the rehearsal catches a compound-error in the session 2->3 transition, it is a
NO-GO trigger for criterion (h) and activates the October fallback.

I rate the probability of hitting the 15-Aug rehearsal with a GREEN criterion (h)
at 3-session depth as approximately 70-75%, vs approximately 85% at 2-session depth.
The 10-15 percentage point difference is the additional risk this decision carries.
That is not a veto but it should be named.

---

## 4. State-Schema Implications

The PatientStateLog and StudentPersonaHistory schema was designed for exactly this
pattern (feasibility-ido.md Section 1, feasibility-ido.md Section 2 schema stubs).

PATIENTSTATELOG: per-turn, hard-persisted. Stores the full in-session patient state.
No schema change for 3 sessions -- the schema is session-scoped, not arc-scoped.

STUDENTPERSONAHISTORY: the session-arc writer persists a per-session summary
(distilled arc state: trust level, symptom change, notable moments, alliance score).
The loader at session N reads the session N-1 summary.

For a 3-session arc, session 3's loader reads session 2's summary (NOT session 1
directly). This is the "last-session-summary" pattern. It is already the intended
design and carries a 3-session arc cleanly. No schema migration required.

ONE RISK TO NAME: the session 2 summary is the ONLY thing the session 3 loader
sees from the full arc history. If the session 2 summary loses information that was
set in session 1 and that is still clinically relevant in session 3 (e.g. a specific
formulation anchor from session 1 that session 2 did not revisit), session 3 has no
path to recover it. This is an inherent limitation of the summary approach, not a
schema defect. For the pilot -- one patient, known arc, small cohort -- it is
acceptable. Adam should be aware of it when reviewing session-3 outputs.

THE TRUST/SYMPTOM ACCUMULATION RISK: the simplified delta model applies trust +/- N
per session. If trust is already at a boundary after session 2 (e.g. trust = max),
a further positive delta in session 3 must be clamped. This needs an explicit bound
check in the arc writer. The +0.5 days for Gal covers this.

SCHEMA VERDICT: carries 3-session arc cleanly. No migration needed beyond what was
already planned for Track B.

---

## 5. Verdict

3-SESSION ARC FEASIBLE FOR SEP PILOT: YES-WITH-CONDITIONS.

The 3-session cap is within Sami's stated 2-4 range for v1. Engineering cost is
manageable. The schema carries it. The sprint fits.

Conditions (engineering/QA -- clinical conditions deferred to Sami):
1. Build starts by 2026-07-14. No slip on this date.
2. Adam reviews a complete 3-session test run and confirms delta model coherence
   by 2026-08-08 (Sprint-3 end). This is the B2 gate applied at 3-session depth.
   Adam said he signs off -- he needs to actually see it work across 3 sessions
   before the rehearsal, not at it.
3. Criterion (h) is updated from 2-session to 3-session coherence test in the
   rehearsal scenario plan. Rehearsal allocates 3 contiguous slots for the arc run.
4. Sami assesses whether 3 transitions (vs 2) changes any clinical requirement on
   the simplified delta model. If Sami flags a new constraint, it feeds into the
   build BEFORE the B2 adam review (condition 2 above). If Sami is silent or clears
   it, condition 2 is the only clinical gate.

RISK DELTA vs 2-SESSION CAP: the 15-Aug GO probability drops approximately 10-15
percentage points (from ~85% to ~70-75%) due to the untested second transition.
This is an engineering judgment; the clinical acceptability of that risk delta is
Sami's call.

IF SAMI FLAGS NEW CONSTRAINTS OR THE 2026-07-14 BUILD START IS MISSED:
Hold at 2 sessions and relay back to Adam. A 2-session cap is not a commercial
failure -- Adam's stated need is "same-patient across sessions"; 2 sessions delivers
that. 3 sessions is an enhancement.

ADDED ENGINEER-DAYS: +1.5 days (revised Track B total: ~9.5 days).
15-AUG CRITERION (h): expands to 3-session coherence; still passable by 15-Aug.
SAMI DEPENDENCY: this verdict is conditional on Sami's clinical read. If Sami
says 3 sessions requires model changes that add more than ~2 engineer-days, reassess.

---

*Architecture decisions in this document are R&D recommendations pending Eco confirmation.
Conditional on Sami's clinical assessment. No build started. No external tools adopted.
No contact with Adam -- owner-relay only.*
