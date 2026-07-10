# Product Ruling -- Model-Tier Routing (APS-REQ-066)
# Task: APS-014 / Lital F4 cost flag | Author: Perry (VP Product) | Date: 2026-07-10
# Input: cohort-cost-estimate-lital-2026-07-10.md (Section 5, A4, F4)
# Status: RULING (route via Eco to Ido for engineering scope)

---

## The question

Must APS-REQ-066 (model-tier routing) be built before production go-live, or can it be
deferred post-pilot and accept premium pricing for Pilot-1? Pilot-1 LLM dollars are small
(~$94 expected); the concern is the pattern locked in for multi-college scale.

---

## Ruling: SPLIT by call type -- MUST for analyser/guard; SHOULD for patient response

This is not a binary must/should. The two major call categories in the engine have
fundamentally different quality risk profiles and must be treated differently.

### Analyser + guard calls -- MUST route to a lighter tier before production go-live

The interaction analyser (empathy scoring, question-type classification, ACT-consistency
check) and the ground-truth guard (rules enforcement, out-of-bounds detection) are
structured, classification-type tasks. They have explicit pass/fail or categorical outputs
and short prompts relative to the patient-response generation step.

These calls are genuinely cheaper-model appropriate. The quality risk of routing a
classification task to a lighter model is materially lower than routing creative generation.
If the analyser miscategorises an empathy signal by one tier, the patient state update
shifts slightly -- it does not produce a clinically incoherent patient response in the
student's chat window. The guard's output is boolean (pass/block); a capable mid-tier model
handles this well. Neither call has the "front of house" realism requirement that the patient
response does.

These should be routed before production go-live because:
1. The LlmModule hook exists (APS-012 delivered it as env-driven, shared, provider-agnostic).
   The routing infrastructure is already in place. Wiring it for analyser/guard is low-cost.
2. At scale these calls account for a significant fraction of total turn tokens (each turn
   runs both calls before the patient response). Leaving them unrouted permanently means
   paying premium pricing for classification work indefinitely.
3. No pilot data is needed to validate this routing -- the correctness of a classification
   call is verifiable deterministically (did the guard correctly block the out-of-bounds
   response?). We can test this in QA without real students.

MUST = confirmed before production go-live, not before Pilot-1 launch if Pilot-1 is still
on StubProvider. Gate: route analyser/guard by the time the LLM switch from StubProvider
to a real model occurs (APS-004 production gate).

### Patient-response generation -- SHOULD; defer to post-pilot

The patient response is the clinical face of the simulation. Realism, coherence, emotional
authenticity, and correct application of disclosure rules on the response side are the
CORE clinical-validity concern. Pilot-1 is the first validation of this quality with real
students and a real clinical lead (Adam). This is the worst moment to introduce model
variability into the output that validates the product.

Routing patient responses to a cheaper model:
- Changes the patient's voice in ways that Adam will immediately notice during validation
- May degrade subtle emotional cues and resistance patterns (the features Adam's self-sim
  mode is specifically designed to test)
- Cannot be validated without running real students through the simulation -- and Pilot-1
  IS that run

We have no empirical data yet on which lighter models maintain acceptable patient realism.
That data comes FROM the pilot. The right sequence is:
  Step 1: run Pilot-1 on premium-model patient responses (baseline quality established)
  Step 2: use Pilot-1 output to validate a lighter model's patient responses against the
          premium baseline (can be done in post-pilot self-sim mode)
  Step 3: if validated, promote patient-response routing to MUST for multi-college Phase 2

Deferring patient-response routing does not lock us into a bad pattern. The architecture
supports it. The decision to route is just not yet validated on the response side.

---

## Cost impact of this split

If analyser/guard calls account for 2 of every ~5 LLM calls per turn (estimate pending
Ido confirmation of actual call count per turn pipeline), routing those two to a ~$0.003/1K
tier vs $0.010/1K saves roughly 25-40% of turn cost before we touch patient responses.
At expected Pilot-1 volume that is a ~$25-38 LLM saving (small), but the pattern is correct
for scale. At 500 students x 5 sessions the same routing yields $1,500-2,000+ LLM saving
before patient-response routing is even applied.

---

## Engineering items implied (no commitment on timeline -- Ido's domain)

1. Extend LlmModule provider-token to support two named provider slots:
   LLM_PROVIDER_ANALYSER and LLM_PROVIDER_GUARD (separate from LLM_PROVIDER_PATIENT).
   All three env-driven; pilot default = same model for all three (no behaviour change
   until ops sets different env values).
2. At production go-live: ops sets LLM_PROVIDER_ANALYSER and LLM_PROVIDER_GUARD to a
   lighter model; LLM_PROVIDER_PATIENT stays premium.
3. QA gate: add a routing integration test that confirms each call path hits its intended
   provider slot (verifiable without a real model; StubProvider variants suffice).
4. Post-pilot (Phase 2): add LLM_PROVIDER_PATIENT routing when pilot data confirms
   realism is maintained at the lighter tier. That is a separate product decision, not
   part of this ruling.

Perry does not commit timelines or feasibility. All engineering scoping is Ido's domain.

---

## Summary

  Call type              | Ruling | Gate
  -----------------------|--------|-----
  Interaction analyser   | MUST   | Before production go-live (APS-004 gate)
  Ground-truth guard     | MUST   | Before production go-live (APS-004 gate)
  Patient-response gen   | SHOULD | Defer; validate post-pilot; Phase 2 decision
