# APS Intake -- Adam Pilot Readiness Answers (2026-07-08)
# task: APS-010 | relayed by: owner (jecki) | date: 2026-07-08
# status: VERBATIM RECORD -- do not edit; append corrections as addenda
# routing: Perry (product spec), Ido/Gal (multi-session build), Lital (cohort cost), Eyal (data-handling)

---

## Source

Adam (design partner, Gome Gevim College) replied by email 2026-07-07.
Owner relayed answers into the Eco session 2026-07-08 (ASCII-normalized; intent verbatim).
Shelly extract not used (owner relayed directly).

---

## Q9.1 -- Session Format

VERBATIM INTENT (owner relay):
"BOTH options for September pilot -- (a) a single clinical encounter per session AND
(b) multiple sessions with the same simulated patient over time (persistent patient state).
This is a competitive differentiator, treat as required."

DECISION STATUS: REQUIRED for Sep pilot.
Multi-session (continuing persona) is NO LONGER DEFERRED to Phase 1b.
This reopens APS-005 Section 4 (Ido's Case B) and overrides the Phase 1b deferral
in requirements-baseline.md Section 17 and Section PM.
Scope impact: SIGNIFICANT. See requirements-baseline.md Section 17 (to be updated).

---

## Q-CLINICAL-OVERSIGHT -- Clinical Oversight Model

VERBATIM INTENT (owner relay):
"Named oversight yes, but lightweight for pilot. Model: Adam is the initial clinical/product
lead for pilot content; periodic review of clinical content + simulation outputs;
DESIRED feature -- a 'self-simulation' mode where a bot simulates a student, runs the full
simulation including the final review, and Adam inspects the results; and when a teacher
builds a new simulation/persona they must be able to run checks and see whether it works
well (teacher validation/preview flow)."

DECISION STATUS:
- Adam plays the clinical/product lead role (no external advisor hire required for pilot).
- New feature request: SELF-SIMULATION MODE (bot-as-student, full run, Adam inspects output).
- New feature request: TEACHER VALIDATION/PREVIEW FLOW (teacher runs own case before publishing).
- Both are product-spec items for Perry. Both generate engineering tasks for Ido.
- Resolves Q-ADVISOR from feasibility-ido.md Section 7: Adam IS the named clinical lead.

---

## Q-WELFARE -- Student Welfare Contact

VERBATIM INTENT (owner relay):
"NOT needed at this stage (Adam wants to avoid scope creep here)."

DECISION STATUS: DE-SCOPED for pilot.
- No named welfare contact required.
- Retain: AI-disclosure (non-dismissable), off-ramp ("I am a simulated training patient").
- Retain: welfare signpost text in UI (no named contact; generic guidance only).
- The distress-contact resource placeholder in the UI must NOT link to a named person
  until Adam provides one. Use a neutral "please speak to your course supervisor" fallback.
- Flag to Eyal: welfare posture confirmed de-scoped; no named-contact PPL obligation here.

---

## COHORT-SIZE -- Pilot Planning Numbers

VERBATIM INTENT (owner relay):
"~20-25 students, ~2 teachers/supervisors/admins, ~3-5 simulation sessions per student.
Plan for ~60-175 student simulation runs for pilot 1, with buffer above."

PLANNING NUMBERS (Perry):
- Students: 20-25
- Staff: ~2 (teachers/supervisors/admins)
- Sessions per student: 3-5
- Total simulation runs: 60-175 (floor: 20 x 3 = 60; ceiling: 25 x 7 with buffer = ~175)
- Continuing persona implication: if 3-5 sessions per student are planned AND multi-session
  persistence is required, the continuing persona runtime must be ready for Sep, not Phase 1b.
  This confirms the Q9.1 scope reversal above.
- Route to Lital: cohort cost estimate needed against these numbers.

---

## DATA-HANDLING -- Data Controller + PPL Position

VERBATIM INTENT (owner relay):
"Adam is data controller/contact for now. (Security/legal detail is going to Rambo and Eyal
separately -- you do not need to spec the security controls, just note the pilot handles
student Personal Data under Israeli PPL and depends on the Rambo/Eyal requirements.)"

NOTE FOR PRODUCT SPEC:
- Adam = data controller for pilot student Personal Data.
- Platform spec notes PPL applicability only; security controls defined by Rambo/Eyal (APS-004).
- Do not spec security controls in product docs; reference APS-004 gate deliverables.
- Eyal to confirm: does data-controller = Adam change the DPA structure (student consent,
  processor relationship, residency obligations)?

---

*Record closed. For corrections or additions, append a dated addendum below this line.*
