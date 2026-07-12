# SME Clinical Note -- 3-Session vs 2-Session Arc for Pilot 1
# Date: 2026-07-11
# Author: Sami (SME Advisor, Product Group, on-demand)
# Assigned project: ai-patient-simulator
# Requester: Eco (CEO) -- task relayed 2026-07-11
# Grounded in: docs/adam-answers-feasibility-ido-2026-07-08.md,
#              docs/sme-domain-assessment.md (incl. Section 9 addendum),
#              docs/feasibility-ido.md Section 4
# Status: INTERNAL -- not for external sharing without owner A1
# Adam contact: none (owner-relay only per standing protocol)

---

## 1. What my prior assessment actually said

Confirmed in sme-domain-assessment.md Section 9.2 (net realism verdict):
"Achievable for 2-4 session arcs with careful engineering."

The 2-session-specific cap in adam-answers-feasibility-ido-2026-07-08.md (Condition 5)
came from Ido's R&D feasibility layer -- framed as QA/validation capacity for the
15-Aug window -- not from a hard clinical line I drew. My original clinical range
was 2-4 sessions for v1, provided the engineering constraints I named were met.

This matters for the current question: 3 sessions is within my original clinical
range. The question is whether the pilot-specific conditions change that read.

---

## 2. Clinical risk differential: 3 sessions vs 2 sessions

### What does NOT change at session 3

The fundamental failure modes I identified (sme-domain-assessment.md Section 9.2)
are present from the first session boundary onward. They apply at session 2 and they
still apply at session 3. There is no new category of clinical risk that appears only
at session 3. The risks are:

- Memory flattening (LLM treats older session content as lower-salience)
- Formulation drift (structured formulation mutates through natural language summaries)
- Alliance score coherence (rate-of-change not bounded without clinical calibration)
- LLM-generated history compounding (session 2 summary becomes session 3 ground)

### What does change at session 3 -- incremental risks

The incremental risks are real. Each additional session boundary multiplies the
surface where errors compound.

A. ERROR COMPOUNDING IN LLM-GENERATED SUMMARIES
Session 2 ends. The session-arc writer persists a distilled summary. Session 3 loads
that summary as its opening state. Unlike the session 1-to-2 transition (where the
summary is generated from the authored-grounded session 1 state), the session 2-to-3
transition loads a summary that was ALREADY LLM-generated from session 1. A small
confabulation in the session 2 summary becomes a "confirmed fact" in session 3.
RISK LEVEL: HIGH if not mitigated. Mitigation: Adi's QA must explicitly test a full
3-session arc for compounding invented facts -- this is a different test from the
2-session coherence test already planned at item (h) in adam-answers.
CONFIDENCE: Confirmed (domain knowledge, sme-domain-assessment.md Section 9.2 item 5).

B. DELTA ACCUMULATION IN THE SIMPLIFIED MODEL
The simplified delta model (trust +/- N, symptom marker advancement gated by turn
count + trigger rules) was designed and accepted in the context of a 2-session arc:
one delta applied, one state transition to verify. At 3 sessions, two deltas
accumulate sequentially. If a student performs well in both session 1 and session 2,
the model may produce a session 3 starting state with implausibly high trust and
openness -- which defeats the pedagogical point of a challenging patient and teaches
the wrong lesson about therapeutic pace (sme-domain-assessment.md Section 9.3 item 4:
"unrealistically fast change is a HIGH risk without explicit rate-of-change
calibration").
The simplified model needs explicit ceiling enforcement that was not required
for a 2-session arc. Trust and openness must have a floor on difficulty regardless
of student performance, and the ceiling after two accumulated positive deltas must
be clinically calibrated, not left to the model's default arithmetic.
CONFIDENCE: Confirmed (domain knowledge).

C. STUDENT WELFARE RISK AT SESSION 3
sme-domain-assessment.md Section 9.5 item 2 explicitly named the 3-session arc as
a welfare risk threshold: "A 3-session arc with a patient who presents with
depression, avoidance, and suicidal ideation (even simulated) may, over repeated
engagement, begin to feel less like practice and more like a real relationship."
This is a known phenomenon in psychotherapy training. The risk increases with session
count. The between-session welfare re-anchor prompt (required at session 2+ login per
section 9.5) must be present at session 3 login specifically -- not only at session 2.
This is not optional if the platform is running high-challenge cases (challenge level
3-5) in a 3-session arc.
CONFIDENCE: Confirmed (domain knowledge -- known psychotherapy training risk).

D. SESSION-GAP MODELING LIMITATION MORE VISIBLE
The simplified v1 model does not model between-session time passage (no mood
fluctuation, no partial regression between sessions). At 2 sessions this is a
single disclosed limitation in the student briefing. At 3 sessions there are two
inter-session gaps where real patients would show observable change that the
simulator ignores. The limitation is pedagogically more visible and the student
briefing must address it explicitly, twice.
CONFIDENCE: Inferred from sme-domain-assessment.md Section 9.2 item 4 (session-gap
realism flagged as assumption to validate).

---

## 3. Does Adam's personal sign-off change the risk calculus?

Yes -- partially. No -- on QA surface.

Adam's sign-off on the between-session change model is meaningful for clinical
validation. He is the named pilot clinical/product lead with domain expertise in the
educational use of these simulations. His review of the actual delta parameters
(which trust values map to which student behaviours; what the floor/ceiling on
alliance movement is; what symptom marker advancement looks like across 3 sessions
rather than 2) addresses the calibration gap I flagged in Section 9.3 and Section 9.6
item 1 of my original assessment.

HOWEVER: the 2-session cap in Ido's document was not only about clinical sign-off
authority. It was also about QA validation capacity -- specifically, whether Adi can
test a 3-session arc coherently (including the compounding-error test at point A above)
within the Sprint 3 window and before the 15-Aug rehearsal. That is an R&D scheduling
question, not a clinical question. I am not competent to adjudicate the sprint capacity.

The clinical conclusion: Adam signing off does close the clinical calibration gap,
provided his review explicitly covers 3-session arc parameters, not just 2-session
ones. It does not reduce the QA surface Adi must cover.

---

## 4. Verdict

VERDICT: YES-WITH-CONDITIONS
A 3-session same-patient arc is clinically acceptable for Pilot 1.

Rationale:
- 3 sessions is within the "2-4 session arcs with careful engineering" range I set
  in my original assessment.
- The 2-session cap in Ido's document was an R&D scheduling constraint, not a hard
  clinical line.
- The incremental risks at session 3 vs session 2 are real but manageable with the
  specific conditions below.
- Adam's personal sign-off on the delta model meaningfully closes the clinical
  calibration gap, provided scope of that review covers 3-session trajectories.

NOT a NO-GO from a clinical standpoint. A NO-GO would require evidence that the
simplified delta model is clinically incoherent over 3 sessions -- that evidence does
not exist yet (model hasn't been reviewed for 3-session trajectories), but neither
is there evidence it is incoherent. The conditions below make the go decision safe.

---

## 5. Conditions (required before go-live of any 3-session arc)

C1 -- DELTA MODEL SCOPE EXTENSION (clinical calibration)
Adam's sign-off on the simplified delta model must explicitly cover 3-session
trajectories, not just 2-session ones. Specifically:
- What is the clinical ceiling on trust/openness/alliance after two consecutive
  positive-delta sessions? Confirm a floor on difficulty is enforced regardless
  of student performance in sessions 1 and 2.
- What does a realistic 3-session symptom trajectory look like for the pilot case
  set? Slow, bounded, not dramatically resolved in 3 sessions.
- What is the expected range of cumulative state at session 3 end for a student
  performing at average, above-average, and below-average levels?
This is a specific extension of the clinical advisor review already required at
Condition 7 of adam-answers (simplified delta model review). It is not a new gate --
it is an extension of the same gate to 3-session scope.
CONFIDENCE LABEL: Open assumption -- requires Adam's explicit 3-session review.

C2 -- QA: FULL 3-SESSION COHERENCE TEST
Adi's QA test plan (currently item h in adam-answers: "session 2 patient correctly
reflects session 1 state") must extend to a full 3-session arc coherence test:
- Session 3 patient correctly reflects accumulated state from sessions 1 AND 2.
- No compounding invented facts: a specific error introduced in the session 2
  LLM-generated summary must NOT appear as a "confirmed fact" in session 3.
- A 3-session test with a student performing above average in both sessions must
  produce a session 3 state that is clinically plausible (trust/openness not
  implausibly high; patient retains some resistance appropriate to the case).
This is additional QA surface beyond the 2-session test already planned. Whether
it fits in the Sprint 3 / 15-Aug window is Ido's scheduling call, not mine.
CONFIDENCE LABEL: Confirmed requirement (domain knowledge + risk at point A above).

C3 -- WELFARE PROMPT AT SESSION 3 LOGIN
The between-session welfare re-anchor prompt (required per sme-domain-assessment.md
Section 9.5 for session 2+) must fire at session 3 login, not only session 2. Text
must include a simulation-identity reminder ("This is a simulated training patient;
the patient is not real") and a welfare signpost resource. This applies regardless
of challenge level but is especially required for challenge levels 3-5.
CONFIDENCE LABEL: Confirmed (domain knowledge; Section 9.5 item 2 explicitly named
the 3-session threshold).

C4 -- DELTA MODEL CEILING ENFORCEMENT
The session-arc writer must enforce explicit ceilings on trust, openness, and
alliance accumulation so that two sequential positive-delta sessions cannot produce
an implausibly cooperative patient in session 3. The exact ceiling values are for
Adam (clinical calibration), but the enforcement mechanism must be in the code,
not left to the simplified arithmetic of the delta rules.
CONFIDENCE LABEL: Confirmed requirement (domain knowledge; Section 9.3 item 4).

C5 -- STUDENT BRIEFING: SESSION-GAP MODELING LIMITATION
The student briefing (pre-simulation instructions panel) must explicitly state that
the simulated patient does not model real between-session time passage (no mood
fluctuation, no life events, no partial regression between sessions). This limitation
should be stated at session 2 AND session 3 start. It is clinically honest and sets
appropriate expectations about what the simulation can and cannot teach about
therapeutic continuity.
CONFIDENCE LABEL: Confirmed (sme-domain-assessment.md Section 9.2 item 4;
amplified at 3 sessions).

---

## 6. Conditions NOT required by Sami (clarifying scope)

The following are NOT additional Sami conditions for 3 vs 2 sessions. They are
already required for any multi-session arc and were stated in my prior documents:

- Named clinical advisor sign-off on the simplified delta model (Condition 7
  of adam-answers): ALREADY REQUIRED. C1 above extends its scope.
- Adi QA for 2-session coherence: ALREADY REQUIRED (item h in adam-answers).
  C2 above extends its scope.
- Hard-coded off-ramp ("I am a simulated training patient") in every simulation:
  ALREADY REQUIRED (sme-domain-assessment.md Section 4.3). Not new for 3 sessions.
- Arc-length enforcement cap (max_sessions field + guard on attempt-create):
  ALREADY REQUIRED (arc-length enforcement, adam-answers item C). The cap value
  changes from 2 to 3 -- that is a configuration change, not a new structural
  requirement.

---

## 7. What remains outside my clinical lane

The following aspects of the 3-session question are R&D scheduling and QA capacity
questions, not clinical questions. I flag them but do not adjudicate:

- Whether Adi's extended QA test plan (C2 above) fits in Sprint 3 before 15-Aug.
  That is Ido's call.
- Whether the session-arc writer can implement delta ceiling enforcement (C4) in
  the same sprint window as the original session-arc writer build.
  That is Gal's and Ido's call.
- Whether Adam's 3-session review (C1) can be completed by 2026-07-25 (end of
  Sprint 2 equivalent) rather than the 2026-07-25 deadline set for the 2-session
  review. If Adam is the reviewer, the scope extension is incremental and should
  not require additional lead time. But I cannot commit on Adam's behalf.

If Ido determines that the QA surface and ceiling enforcement build cannot be absorbed
in Sprint 3 without slipping the 15-Aug rehearsal, the correct call remains at 2
sessions for the pilot. The clinical case for 3 sessions is sound. The execution
window is Ido's judgment.

---

## 8. Confidence label summary

| Finding | Confidence |
|---|---|
| 3 sessions within my original "2-4 session" clinical range | Confirmed (sme-domain-assessment.md Section 9.2) |
| 2-session cap in adam-answers was an R&D scheduling constraint, not a hard clinical line | Confirmed (reading of adam-answers Condition 5 rationale) |
| Error compounding risk at 3rd session boundary is real and requires specific QA test | Confirmed (domain knowledge) |
| Simplified delta model needs ceiling enforcement to be valid over 3 sessions | Confirmed (domain knowledge) |
| Adam's sign-off closes the clinical calibration gap for 3-session trajectories if scope extended | Inferred -- requires Adam's explicit review of 3-session parameters |
| Welfare prompt at session 3 login is required | Confirmed (sme-domain-assessment.md Section 9.5 item 2) |
| Session-gap modeling limitation more visible at 3 sessions; student briefing must address | Confirmed (domain knowledge) |
| QA capacity and sprint scheduling for 3-session test: not a clinical determination | Out of Sami's lane -- Ido's call |

---

*Advisory note written 2026-07-11. Grounded in project documents read in this session.
No external clinical sources cited -- all findings are domain knowledge and inferences
from the project documents above. No Adam contact; internal only. Not for external
sharing without owner A1.*
