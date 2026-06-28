# APS-002 -- SME Domain Assessment: AI Patient Simulator
**Date:** 2026-06-28
**Author:** Sami (SME Advisor, product group, on-demand)
**Assigned project:** ai-patient-simulator
**Grounded in:** `intake/adam-hld-text-extract.txt` (71 pp), `docs/discovery-brief.md`
**Status:** Internal discovery artifact. Not for external sharing without owner A1.

---

## 1. Clinical Realism -- How Achievable Is a Pedagogically-Useful AI Patient?

### What the HLD proposes (confirmed in HLD ss. 10-14, 18)
The patient is not a simple chatbot. It runs a structured runtime loop: interaction analyser ->
patient state update -> ground-truth check -> disclosure/resistance rules -> response generation.
State tracks trust, openness, defensiveness, emotional activation, disclosure readiness. Non-verbal
cues are text-bracketed. Resistance and disclosure are conditionally triggered by student skill.
Challenge level 1-5 modulates all these simultaneously.

### What LLMs are genuinely good at here (confirmed / domain knowledge)
- Producing naturalistic, emotionally-varied dialogue that adapts to conversational cues.
- Rendering distinct persona styles (guarded, avoidant, scattered, polite) with good surface realism.
- Generating plausible non-verbal cue markers in text.
- Varying sentence-level expression of the same underlying fact (exactly what is needed for
  "vary wording but not clinical reality").

### Where the realism ceiling sits (domain knowledge; open assumptions flagged)
1. **Emotional state tracking via prompt engineering is fragile.** The HLD describes dynamic state
   (trust/openness/defensiveness/etc.) maintained session-long and driving responses. In practice,
   LLMs do not reliably maintain precise quantitative state across 50-75 turns in a single context
   window. The proposed runtime model (external state machine that updates and re-injects state
   each turn) is the right architecture. Without it, the patient will drift -- it will become more
   cooperative than it should, or forget earlier disclosures, or be inconsistent in resistance.
   RISK LEVEL: HIGH if the state machine is soft (just prompt wording); MANAGEABLE if state is
   hard-persisted (PatientStateLog schema exists -- good) and injected into each prompt call as a
   structured block.

2. **Conditional disclosure triggers require a reliable interaction analyser.** The HLD's
   disclosure logic ("if student validates experience -> patient becomes slightly more open") is
   pedagogically excellent but rests on the interaction analyser correctly classifying the
   student's message on every turn. LLM classifiers for therapeutic micro-skills (empathy,
   premature advice, missed cues, ACT-consistency) are not reliably accurate out of the box,
   especially in Hebrew/Arabic. This is an assessment-validity risk, not just a realism risk.
   ASSUMPTION TO VALIDATE: accuracy of the interaction analyser classifier needs empirical testing
   by a clinical SME with real student transcripts before graded use.

3. **Challenge level 4-5 + distress simulation.** A patient who is "distressed or reactive" with
   "indirect risk hints" and "tests the therapist" may produce outputs that a student finds
   genuinely distressing or that blur the simulation/reality boundary. This is not a reason to
   avoid high-challenge cases; it is a reason to validate them with a clinical educator before
   deployment and to have clear pre-simulation student briefing.

4. **Text-only simulation misses prosody, silence, and embodied cues.** LI-CBT and ACT training
   in real practice relies heavily on tone and non-verbal reading. The bracketed cue system
   ([Long pause], [Looks away]) is a reasonable pedagogical approximation but should be explicitly
   labelled to students as a deliberate abstraction, not a claim of full clinical equivalence.
   This should be addressed in the student briefing and in any published educational rationale.

### Net clinical realism verdict
ACHIEVABLE at a pedagogically-useful level for foundational and intermediate skills practice,
provided: (a) hard state persistence is implemented, (b) the interaction analyser is validated
empirically, (c) the briefing sets accurate student expectations. It will not replicate a live
clinical session. It does not need to -- analogous to a flight simulator: high training value
without being confused with real flight.

---

## 2. The Ground-Truth Boundary -- Is the HLD Approach Sound?

### The principle (confirmed in HLD ss. 11, 38.3)
"The AI patient can vary expression, but not clinical reality." Every simulation has a structured
ground-truth file: known facts, what may be disclosed, what must not be invented, risk/safeguarding
boundaries, escalation rules. The runtime checks this file before generating a response.

### Domain assessment
The principle is sound and is the single most important clinical safeguard in the design.
Without it, an LLM patient will confabulate -- inventing symptoms, history, or risk signals that
were never authored -- making the transcript unfit for rubric-based assessment (you cannot score
a student on what the patient said if the patient said something the case never authorized).

### What the HLD does not yet specify (gaps -- need design decisions)
1. **Enforcement mechanism.** The ground-truth file exists conceptually, but the HLD does not
   specify HOW the runtime prevents invention. Three patterns exist in practice, with different
   reliability levels:
   a. Soft: ground-truth is embedded in the patient system prompt as text instructions. RISK:
      LLMs routinely violate long prompt instructions under conversational pressure, especially
      at high challenge levels where the patient is distressed.
   b. Medium: after response generation, a guard-model or rule-based checker compares the
      proposed response against the ground-truth file and rejects/regenerates if a new fact
      appears. More reliable but adds latency and cost.
   c. Hard: the ground-truth file is structured (JSON schema), and the response generation prompt
      is given ONLY the facts in the disclosure-allowed list for that state, not the full case.
      The hidden-facts are kept entirely out of the generation context until disclosure is
      triggered. Highest reliability.
   RECOMMENDATION: v1 should use at minimum pattern (b) with a lightweight guard pass.
   Pattern (c) is architecturally cleanest and most defensible. This decision needs a clinical
   SME and a technical architect in the same room.

2. **Rubric-grading dependency.** If the patient invents a clinical fact (e.g., discloses risk
   that was never in the ground truth), and the student responds appropriately to that invented
   fact, the evaluation engine may score them as if they handled an authored risk scenario. This
   would be an assessment-validity breach. The guard mechanism is therefore not just a realism
   feature -- it is an assessment-integrity requirement.

3. **Version locking.** The HLD correctly specifies rubric version locking per simulation
   assignment. The same locking should apply to the ground-truth file. If an educator updates
   a case mid-cohort, existing attempts must evaluate against the original ground truth.

---

## 3. Assessment Validity -- Rubric, Transcripts, Graded vs. Formative

### The HLD's approach (confirmed in HLD ss. 19, 20, 38.5)
Structured evaluation: rubric-based scoring -> criterion-level feedback -> transcript evidence ->
highlighted moments. The system generates structured data first, then language. Teacher can
override grade. Debrief chat does not change official grade.

### Where rubric-based AI scoring can be defensible (domain knowledge)
- Transcript-evidenced scoring is the right model. Attaching a score to a specific transcript
  turn ("Turn 17 -- patient hinted at avoidance; student moved to advice without exploring")
  allows teacher review and challenge. This is substantially more defensible than a holistic
  AI judgement.
- If rubric criteria are anchored to observable, behavioural descriptors (not vague traits) and
  validated against real clinical training standards (e.g., BABCP competency frameworks, IAPT
  KSF, or a validated ACT fidelity scale), the scoring has an external reference point.
- Teacher override exists. As long as AI scoring is positioned as a draft that the teacher
  reviews -- not as autonomous final grades -- the assessment governance risk is lower.

### Where it is risky for graded use in v1 (domain knowledge + inferred from HLD)
1. **Interaction analyser accuracy is unvalidated.** The rubric score is only as good as the
   interaction analyser's classification of each student turn. If "premature advice" or
   "missed cue" is misclassified, the score is wrong. Until accuracy is empirically tested
   against a clinically-validated gold standard (expert-annotated transcripts), graded use
   based on AI score alone is not defensible.
   RECOMMENDATION: v1 graded use should require mandatory teacher review and approval of the
   AI score before any grade is returned to Canvas/Moodle. AI score = draft; teacher sign-off
   = official grade.

2. **Risk-awareness criterion is highest-stakes.** The example rubric weights "Notices risk /
   ethical boundaries" at 10 points. If the AI patient failed to surface a risk cue (state
   machine drift, see section 1) and the student is scored down for not addressing a cue that
   was never clearly expressed, that is an unfair grade. Conversely, if the AI over-generates
   risk signals and the student is scored as having handled a genuine risk situation, the
   educational signal is distorted. RISK: HIGH. In v1, the risk-awareness criterion should be
   FORMATIVE-ONLY -- flagged for teacher review rather than auto-scored.

3. **Rubric validity is not built-in.** The competency library at the core level is
   "managed by platform admin / academic lead." What that framework is based on is not
   specified in the HLD. A rubric is only valid for graded assessment if it maps to an
   accepted competency framework (BABCP, IAPT, APA, etc.) or has been validated by the
   institution's academic board. Without that, even a technically accurate AI score is
   academically indefensible. This is the single highest-priority gap for graded use.

### Formative vs. graded split recommendation for v1
| Assessment element | v1 recommendation |
|---|---|
| Alliance, empathy, open questions | Formative-first; graded only with teacher review |
| Functional analysis / problem mapping | Formative-first; graded with teacher review |
| ACT/CBT consistency | Graded only after rubric framework is validated externally |
| Risk-awareness criterion | FORMATIVE-ONLY in v1 -- teacher reviews flag, not AI score |
| Overall grade return to LMS | Teacher-approved only in v1; no auto-return without sign-off |

---

## 4. Safety -- Risk Flags, Student Distress, and the Support/Simulation Separation

### Risk and safeguarding flags (confirmed in HLD ss. 11, 30, 20)
The HLD includes risk/safeguarding boundaries in the ground-truth file, risk-level settings
in the simulation builder (low/moderate/high), an automated alert when a student triggers a
risk/ethics flag, and a risk-awareness criterion in the rubric.

### Domain gaps and risks

1. **The boundary between simulated risk content and real student distress.**
   A student practising with a high-challenge patient who expresses indirect suicidal ideation
   (an authored simulation scenario) may themselves be triggered into real distress. The HLD
   does not specify a protocol for this. Required elements not currently in the HLD:
   - Pre-simulation briefing with opt-out acknowledgement for high-risk scenarios.
   - A mid-session welfare check or student-accessible signpost ("If you are experiencing
     distress, please contact [named welfare resource]") that persists regardless of simulation
     mode.
   - A clear institutional policy on whether tutors review flagged transcripts for student
     welfare (not just for academic grading). This requires input from the institution's
     counselling or student wellbeing team -- not from the platform.
   RISK: Without this, the platform could face a student welfare incident with no documented
   safeguarding pathway. This is a duty-of-care gap, not a feature gap.

2. **Who flags real distress and what happens next?**
   The HLD's alert system flags "student triggers risk/ethics flag" to teachers. But the flag
   is currently framed as a competency observation (the student did or did not address a risk
   cue in the simulation). There is no flag for: the simulation itself may be causing real
   student distress. These are different things. The platform should distinguish:
   - Flag Type A: clinical performance flag (student missed a risk cue -- academic review)
   - Flag Type B: student welfare flag (student may be distressed -- welfare escalation)
   Both need separate handling, separate routing, and a separate policy from the institution.

3. **The AI patient must never represent itself as capable of real clinical support.**
   If a student (or in a later phase, a real user) attempts to use the simulated patient for
   real emotional support -- particularly in a high-distress session -- the patient must have a
   hard-coded off-ramp: "I am a simulated training patient. If you are experiencing real
   distress, please contact [resource]." This should be a ground-truth rule present in EVERY
   simulation, not an optional educator setting.

4. **Technical support / AI patient separation (confirmed in HLD s. 25.2).**
   The HLD's requirement here is correct and well-specified: the technical support assistant
   must not access clinical roleplay context, case facts, or transcript, and must not give
   clinical advice. The design principle is sound. The implementation risk is context bleed
   at the API layer -- both agents may be LLM calls in the same system, and if they share a
   session or context, a student could elicit clinical content through the support channel.
   REQUIREMENT: the separation must be enforced at the infrastructure level (different prompt
   contexts, different API calls, no shared context store), not just by prompt instruction.
   This is an engineering constraint that must be specified in the technical design, not left
   to implementation judgment.

---

## 5. Multilingual Clinical Nuance -- What Breaks

### The HLD's approach (confirmed in HLD s. 21)
Students choose simulation language per attempt. Competency IDs are language-independent.
Scores and analytics aggregate across languages. Lecturers can view translated transcripts.

### What works well
The language-independent competency ID architecture is correct. Aggregating scores across
language variants of the same simulation is feasible if the scoring is done on structured
criteria, not on language surface.

### What breaks (domain knowledge; open assumptions flagged)

1. **Therapeutic language is not translation-equivalent.**
   In ACT, "psychological flexibility," "defusion," and "values" carry precise technical
   meanings. Hebrew and Arabic clinical training communities may use different terms, or the
   same term with different clinical weight. A rubric criterion written in English and
   auto-translated to Hebrew may assess a different skill than intended. RISK: the core
   competency library, if written in English first and translated, will carry English-language
   clinical assumptions into Hebrew and Arabic programmes. This is not a translation problem;
   it is a clinical-construct equivalence problem.
   RECOMMENDATION: Hebrew and Arabic clinical content requires independent review by a
   clinician who practices and trains in that language, not just a fluent translator.

2. **The interaction analyser in Hebrew/Arabic.**
   Classifying student messages for "empathy," "premature advice," "ACT-consistency," and
   "missed cues" requires the LLM to understand clinical Hebrew/Arabic pragmatics. Current
   models are weaker at clinical nuance in these languages than in English. The interaction
   analyser's classification accuracy in Hebrew will be lower than in English without specific
   fine-tuning or few-shot examples drawn from validated Hebrew clinical training data.
   ASSUMPTION TO VALIDATE: test interaction analyser classification on a sample of Hebrew
   student turns before any graded Hebrew use.

3. **RTL layout and voice dictation.**
   Eco-Synthetic has noted Hebrew RTL as a strength. The dictation-to-text path for Hebrew
   and Arabic needs to be tested with clinical vocabulary, which is often transliterated or
   mixed-register in practice (students may mix Hebrew/English terms, Arabic/English terms,
   or formal/colloquial registers mid-session). Dictation accuracy for clinical speech in
   these languages is an open assumption -- not a given.

4. **Translated transcripts for teachers.**
   If a student conducts a simulation in Arabic and the teacher reviews a translated transcript
   to grade them, any translation error in a clinically significant utterance becomes a
   grading error. This cannot be automated without clinical translation validation. In v1,
   if Arabic is included, teacher review must be by a clinician who reads Arabic -- not a
   teacher relying on machine translation of the transcript.

### Multilingual v1 recommendation (inferred from risk profile)
Hebrew: viable for v1 with clinical Hebrew review of rubric criteria and interaction analyser
testing. English: primary validation language. Arabic: defer to v2 or run as a pilot with
explicit teacher Arabic literacy requirement and formative-only mode.

---

## 6. Domain Expertise the Build Requires -- and Ethical/Regulatory Red Flags

### Required domain dependencies (open assumption to validate before build)

1. **Clinical / academic advisor -- CRITICAL.**
   The single most important dependency. The platform needs a named clinician-educator with
   credentials in LI-CBT and/or ACT who will:
   - Validate the core competency framework against an accepted external standard.
   - Review and approve the ground-truth file format and boundary rules.
   - Validate a sample of AI evaluations against their own expert scoring.
   - Approve the rubric anchor wording.
   - Sign off on the student welfare safeguarding policy.
   Without this person, no graded use of AI scores is clinically or academically defensible.
   This is not a nice-to-have for v2 -- it is a precondition for v1 graded assessment.

2. **Institutional ethics / academic governance review.**
   Any AI-generated grade that contributes to academic progression requires ethics approval
   from the institution's academic board or equivalent. The platform must be designed so that
   institutions can produce this documentation. A disclosure document ("what the AI does and
   does not decide") should be a platform deliverable, not an afterthought.

3. **Student welfare policy owner.**
   Each institution deploying the platform needs a named welfare point-of-contact integrated
   into the risk-flag routing. The platform cannot own this role -- it can only route to it.
   But the platform must create the routing hooks and the documentation.

4. **Data protection / privacy review (flagged for Rambo + Eyal).**
   Student simulation transcripts containing clinical content, risk flags, and formulation
   notes are sensitive personal data. GDPR (if UK or EU institutions) or Israeli privacy law
   apply to student data. The discovery brief flags this as a follow-on workstream. From a
   clinical domain perspective: transcripts should be treated as pseudonymised clinical records,
   with access controls, retention limits, and deletion rights. The HLD's redaction requirements
   for support logs are good but the broader data classification of transcripts and evaluations
   as clinical-adjacent data needs legal review.

5. **Accreditation body awareness.**
   LI-CBT and counselling programmes in the UK operate under BABCP and BACP accreditation
   standards. Any assessment tool used in those programmes may require notification to or
   approval from those bodies. This is not a blocker for a pilot but is a commercial-risk item
   Adam should be asked about (via owner relay).

### Ethical red flags to raise early

1. **AI grading in healthcare-adjacent training.** Students trained using AI-assessed
   simulation will eventually practice with real clients. If the AI mis-assessed a skill
   (e.g., scored a student as competent in risk identification when they were not), the
   downstream harm is clinical. This is a higher-stakes assessment validity question than in
   most EdTech contexts. The platform's mitigations (teacher override, transcript evidence,
   formative-first) reduce but do not eliminate this risk. It should be stated explicitly in
   the platform's terms and educational design documentation.

2. **Bias in persona generation.** The HLD's inclusivity principle is well-stated (demographic
   identity does not determine pathology). But the persona generator is LLM-driven. LLMs carry
   demographic biases in how they render distress, help-seeking, and clinical presentation
   across cultural groups. The diversity/context engine must be reviewed by a clinical and
   cultural competence expert, not just an engineering quality checker.

3. **Student PII in training data.** If any student transcript or interaction data is used to
   fine-tune or improve the AI model, explicit consent is required and the scope must be
   disclosed in the platform's privacy documentation. The HLD does not address this. It should
   be a legal/ethical gate item before any model training on user data.

---

## 7. Confidence Labels Summary

| Finding | Confidence level |
|---|---|
| LLM capable of surface realism for therapy skill practice | Confirmed (domain knowledge) |
| State machine must hard-persist patient state | Confirmed (domain knowledge + HLD PatientStateLog schema) |
| Ground-truth enforcement requires guard mechanism beyond prompt | Confirmed (domain knowledge) |
| Interaction analyser accuracy is unvalidated risk | Inferred from HLD design + domain knowledge |
| Risk-awareness criterion should be formative-only in v1 | Inferred -- requires clinical SME confirmation |
| Hebrew RTL feasible in v1; Arabic defer to v2 | Inferred -- assumption to validate with clinical Hebrew reviewer |
| Named clinical/academic advisor is build precondition | Confirmed (domain knowledge) |
| GDPR/privacy review of transcripts as clinical-adjacent data | Inferred -- open item for Rambo + Eyal |
| Accreditation body (BABCP/BACP) notification may be required | Inferred -- assumption to validate with Adam via owner |
| Student welfare safeguarding protocol is a duty-of-care gap | Confirmed (domain knowledge; not addressed in HLD) |

---

## 8. Recommended Next Steps

1. Identify a named clinical/academic advisor (LI-CBT or ACT practitioner with training
   programme experience) BEFORE scoping the rubric or competency framework. This is the
   blocking dependency.

2. Agree with Perry on a formative-first policy for v1: all graded score returns require
   teacher review and sign-off. No autonomous AI grading to LMS in v1.

3. Add a student welfare safeguarding protocol to the HLD as a required element, not a
   later feature. Route to Perry / Adam (via owner) to clarify institutional welfare owner.

4. Specify the ground-truth enforcement mechanism (guard model or structured disclosure
   context) as a technical design decision in the requirements baseline -- not left open.

5. Flag the GDPR/privacy classification of transcripts to Rambo + Eyal as a discovery-phase
   input, not a post-build item.

6. Defer Arabic to v2 or formative-only pilot; validate Hebrew interaction analyser with
   clinical Hebrew sample transcripts before graded Hebrew use.

---

## 9. Addendum: Continuing Persona / Therapeutic History -- Clinical and EdTech Assessment

**Date added:** 2026-06-28
**Grounded in:** `intake/adam-appendix-credit-and-continuing-personas.md` (section 2),
`intake/adam-pilot-readiness-answers.md` (v1 = formative, Hebrew-first, Gome Gevim College,
Sep 2026 start).
**Status:** Internal advisory only. Not for external sharing without owner A1.

---

### 9.1 Educational Value -- Why Longitudinal "Same Patient" Practice is Pedagogically Strong

Single-session simulations (the default elsewhere in the HLD) are well-suited for discrete
skill practice: opening, assessment, specific intervention. But psychotherapy training --
especially CBT, LI-CBT, and ACT -- requires competencies that are inherently longitudinal:

- **Formulation evolution.** A good formulation is a hypothesis that gets revised as the
  patient discloses more. Students trained only in first-session simulations learn to formulate
  at intake but never practice revising a formulation when new data emerges -- or when earlier
  assumptions are contradicted. Continuing personas force this skill.
- **Alliance as a process, not a status.** The therapeutic alliance is built (and repaired)
  across time. A student who causes a rupture in session 2 and then manages repair in session 3
  is practising a skill that cannot exist in a one-shot simulation. That arc -- rupture, repair,
  re-engagement -- is one of the most clinically important things a trainee can learn safely.
- **Homework follow-through.** Behavioural activation, thought records, ACT exercises -- the
  pedagogically important moment is often session N+1: did the patient do the homework? What
  got in the way? How does the student respond to non-compliance? This is invisible in
  single-session designs.
- **Symptom trajectory and pacing.** Students who have only ever seen "new patient" scenarios
  have no calibration for what change looks like over 6-8 sessions -- how fast is realistic,
  what plateaus, what regresses. Continuing personas give that calibration.

CONFIDENCE: Confirmed -- domain knowledge, consistent with CBT and ACT competency frameworks
(e.g., BABCP, APA Division 12 evidence-based practice standards).

---

### 9.2 Clinical-Realism Risk -- Why Longitudinal Continuity is Much Harder Than Single-Session

This is the hardest part of the module to build correctly. Single-session realism requires
holding state for 50-75 turns. Longitudinal realism requires holding a coherent therapeutic
narrative across multiple sessions, possibly weeks apart in wall-clock time. The failure modes
are different and more serious.

**What must be persisted and re-injected (confirmed in adam-appendix s. 2.4)**
The spec lists: session summaries, evolving formulation, therapy goals, homework
given/discussed, symptom change, patient internal process change, alliance/trust level, notable
student mistakes, patient avoidance/resistance, important themes, significant engagement
shifts. This list is clinically appropriate. The engineering question is whether it can be
re-injected in a form the LLM uses reliably -- not just a text dump it ignores.

**Where longitudinal continuity will break (domain knowledge; high confidence)**

1. **Memory flattening.** When session history is long, LLM context windows treat older
   content as lower-salience. A patient who disclosed a specific trauma in session 2 may
   "forget" that disclosure in session 5 -- not because the data is absent from the prompt,
   but because the session 5 generation context is dominated by more recent turns. The
   structured re-injection block (from the PatientStateLog equivalent) must explicitly
   resurface clinically salient facts, not just append summaries. A "notable disclosures"
   or "facts that must persist regardless of session count" sub-field is needed.
   RISK LEVEL: HIGH without explicit surfacing logic.

2. **Formulation drift.** A good simulated patient has a coherent cognitive-behavioural or
   ACT formulation underlying its responses. Across sessions, if the formulation is only held
   in natural language (e.g., "the patient believes X"), LLM generation may subtly mutate it
   -- adding beliefs that were not authored, or softening core avoidance patterns that should
   remain fixed until clinically addressed. The formulation must be structured (not just prose)
   and must be checked against the ground-truth mechanism already specified in section 2 of
   this assessment. The ground-truth enforcement problem from section 2 is amplified
   longitudinally.
   RISK LEVEL: HIGH if formulation is prose-only in the session history store.

3. **Alliance score coherence.** If alliance/trust is a numeric state (which the spec implies),
   small session-to-session changes need to be clinically calibrated. An alliance that jumps
   from 3/10 to 8/10 in one session because the student performed well is not clinically
   credible. The rate of change must be bounded by a clinical pacing model. Without this, the
   simulation will reinforce an unrealistic expectation: that good technique produces rapid
   transformation. That is the wrong lesson.
   RISK LEVEL: MEDIUM-HIGH. Rate-of-change caps on alliance, symptom, and openness scores
   need explicit clinical calibration -- not just whatever the LLM infers from "strong work."

4. **Session-gap realism.** If a student returns to a session two weeks after their last
   interaction, the patient's internal state should reflect the passage of time -- mood
   fluctuation, life events (authored or plausible), partial regression on homework. The
   current spec does not address time-passage modeling. Ignoring it produces a patient who is
   frozen between sessions, which is not realistic and not good pedagogical modeling of the
   between-session process.
   ASSUMPTION TO VALIDATE: whether session-gap state change is in scope for v1. If not,
   the limitation should be disclosed to students in the briefing.

5. **Authored vs. LLM-generated history.** In a continuing persona, session summaries and
   state updates will be partially LLM-generated (from the previous session's interaction).
   Over multiple sessions, errors in those summaries compound. A small LLM fabrication in
   session 2's summary becomes a "fact" in session 3's context. The ground-truth file cannot
   be the sole check on this: the structured history fields (formulation, goals, symptoms)
   must be human-readable and lecturer-reviewable so drift can be caught before it compounds.
   RISK LEVEL: HIGH for multi-session arcs. This is a build constraint, not just a monitoring
   note.

**Net realism verdict for longitudinal module:**
Achievable for 2-4 session arcs with careful engineering. More than 4-5 sessions without a
structured formulation anchor and explicit surfacing logic will produce incoherent patients.
Build v1 with explicit session arc length caps (e.g., a course defines a 3-session arc, not
an open-ended one) and design for that constraint, not for infinite continuity.
CONFIDENCE: Confirmed -- domain knowledge.

---

### 9.3 The "Development Influenced by Student Behaviour" Model -- Sound or Not?

The spec (adam-appendix s. 2.5) requires that strong work -> more trust/openness/reflection;
avoidance -> material left unprocessed; poor attunement -> alliance/resistance effects;
good formulation/process use -> symptom/process change. This is clinically attractive but
carries specific risks.

**Where the model is clinically sound (confirmed)**
- Disclosure contingent on student skill: realistic. Patients in real therapy disclose more
  when they feel understood. A simulated patient who becomes more open after genuine empathy
  is teaching a true clinical lesson.
- Avoidance leaving material unprocessed: realistic and pedagogically important. Students who
  avoid a difficult topic should see the patient continue to avoid it too. The model of
  "unprocessed material persists" is correct.
- Alliance rupture from poor attunement: realistic. Modelling this well is one of the most
  valuable things the platform can do.

**Where the model risks rewarding the wrong things (domain knowledge; high concern)**

1. **Symptom change as feedback on technique.** If symptom reduction is a visible outcome
   that responds to student skill level within a short session arc, students learn to optimise
   for fast symptom relief -- which is not the goal of ACT or CBT-based training. The goal is
   process: functional analysis, defusion, values clarification, behavioural activation. If the
   patient gets "better" quickly when the student is "good," the model teaches outcome chasing
   rather than process fidelity.
   RECOMMENDATION: symptom-level change should be slow, bounded, and not a primary within-
   session signal. Process change (patient engagement, willingness, openness) can be more
   responsive; symptom change should lag and be constrained to multi-session arcs.

2. **Rewarding compliance-focused technique.** An AI patient that becomes more cooperative in
   response to "strong work" may produce a patient who is too easy to work with after a few
   skilled sessions -- which fails to model the clinical reality that some patients remain
   difficult despite excellent technique. If the development model has a ceiling effect (patient
   becomes very open, symptoms drop, engagement peaks), it undertrains for persistence and
   tolerance of stuck cases. Build in a floor on difficulty regardless of student performance.

3. **Punishing exploration.** A student who tries an unconventional but potentially valid
   intervention and gets scored as "poor attunement" may see the patient worsen -- which
   teaches students not to experiment. This is a genuine educational risk. The interaction
   analyser's classification of "poor" technique must be calibrated by a clinical expert, not
   derived entirely from LLM judgment. The margin for false negatives (marking good technique
   as bad) is very low when the consequence is a visible patient deterioration.

4. **Unrealistically fast change.** If strong work in session 1 visibly unlocks new disclosure
   and alliance in session 2, students build an expectation that good therapy produces rapid
   transformation. Real CBT and ACT work is slower and more effortful. The development model
   must be calibrated to realistic pace. This is a specific validation task for the clinical
   advisor.
   RISK LEVEL: HIGH without explicit rate-of-change calibration. This is not a technical
   problem -- it is a clinical design problem.

**Net verdict on development model:** The underlying principle is sound. The specific
implementation -- which behaviours trigger which changes, at what rate, with what floor and
ceiling -- requires explicit clinical calibration before build. It cannot be left to LLM
inference or engineering intuition. This is the highest single domain-design risk in the
continuing personas module.
CONFIDENCE: Confirmed -- domain knowledge.

---

### 9.4 Assessment and Supervision Use -- How Lecturers Should Read a Longitudinal History

The spec (adam-appendix s. 2.6) allows lecturers to inspect the full longitudinal history of
a student-persona pair. This is a high-value supervisory feature if done well. A few design
principles from a clinical supervision standpoint:

1. **Longitudinal view, not session-by-session grades.** A lecturer reviewing a 3-session arc
   should see a trajectory: where did alliance start, where is it now, what formulation
   revisions were made, which homework was given and what happened. A flat session-by-session
   score list misses the point of longitudinal practice. The history view should surface
   trajectory, not just snapshots.

2. **Notable student mistakes persist (spec s. 2.4).** This is good clinical design. In real
   supervision, recurring errors (always redirecting when the patient is distressed, never
   addressing avoidance directly) are more important than single errors. The history store must
   support pattern detection across sessions, not just within-session flagging.

3. **Keep it formative in v1.** Consistent with the locked answer (pilot-readiness q.3:
   v1 is formative, not graded), the longitudinal history should be a supervision and
   reflection tool, not an assessment record in v1. Scores visible in the history view should
   be explicitly labelled as formative indicators -- not grades, not academic records. This is
   both educationally correct (longitudinal development is complex to grade) and safer
   (avoids academic governance issues with an unvalidated longitudinal scoring model).
   CONFIDENCE: Confirmed -- consistent with pilot-readiness answer and domain best practice.

4. **Lecturer interface design matters.** A raw JSON dump of the therapeutic history is not
   useful for supervision. The interface must present the history in clinical narrative form
   (not data form) with the structured fields (alliance, symptoms, goals, formulation) readable
   alongside the session summaries. This is a UX requirement with a clinical design input
   requirement. The clinical advisor should review the history view design before launch.

---

### 9.5 Safety and Ethics -- Longitudinal History-Specific Risks

The continuing personas module introduces safety and ethics risks that are additional to those
flagged in section 4 (general safety). All of section 4 applies; the following are specific
to the longitudinal history module.

**12-month retention of detailed student-persona histories (confirmed in adam-appendix s. 2.8)**

The structured history includes: session summaries, formulation, goals, homework,
symptom trajectory, alliance level, notable student mistakes, avoidance/resistance, themes,
engagement shifts. Retained for 12 months per student-persona pair.

This is more than a usage log -- it is a detailed behavioural record of a named student's
practice performance over time, including their errors. Under Israeli privacy law (Protection
of Privacy Law 5741-1981) and likely under any future alignment with GDPR for international
students, this constitutes sensitive personal data about an identifiable individual.

Key risks to flag (clinical view; legal specifics deferred to Eyal/Lital):

1. **"Not a real clinical record" boundary (confirmed in adam-appendix s. 2.9).** The spec
   correctly states this boundary. But the boundary will be legally and practically tested if:
   - A student challenges a grade or academic outcome and the history is used as evidence.
   - A student claims the history is inaccurate and requests correction or deletion.
   - The history is subpoenaed in any academic misconduct proceeding.
   The "simulated educational patient" label does not automatically protect the history from
   being treated as a student record under institutional or national academic records law.
   ASSUMPTION TO VALIDATE: Eyal should advise on whether 12-month retention of detailed
   mistake-level student performance data meets Israeli privacy law minimization requirements,
   and whether students have access/correction rights under that data.

2. **Risk that a long arc surfaces real student distress.** A 3-session arc with a patient who
   presents with depression, avoidance, and suicidal ideation (even simulated) may, over
   repeated engagement, begin to feel less like practice and more like a real relationship to
   the student. This is a known phenomenon in psychotherapy training -- trainees sometimes
   over-identify with simulated patients, or the material resonates with personal experience.
   The risk increases with session count and with the depth of the simulated history.
   RISK LEVEL: MEDIUM-HIGH. Requires a welfare check protocol (see section 4.1) adapted
   specifically for continuing persona use: not just a pre-simulation briefing but a
   between-session welfare prompt (e.g., at session 2 and 3 login, a brief "this is
   simulated training" re-anchor with a welfare signpost).

3. **Data minimisation view.** The spec's history fields (s. 2.4) are clinically appropriate
   for the simulation to function. But "notable student mistakes" retained for 12 months is
   the most sensitive field from a student perspective -- it is a record of failure, not just
   performance. Consider whether this field needs to be:
   - Aggregated (patterns, not specific mistakes) rather than verbatim-stored.
   - Restricted to lecturer-supervisor access only (not exportable or reportable in raw form).
   - Subject to a shorter retention window than the full history.
   DEFER specifics to Eyal (legal) and Lital (data governance). Flag clinically: the mistakes
   field is the highest-sensitivity data point in the history store.

4. **Reset and fork options (adam-appendix s. 2.7) and data deletion.** When a lecturer
   resets or forks a student's history, does the original history persist? Is there an audit
   trail? If the original history includes student mistakes and the reset is done for
   remediation, there is a legitimate question about whether the pre-reset history should be
   deletable by the student. The spec does not address this. Flag to Eyal.

**What must NOT happen:**
- The continuing persona history must never be used as the basis for an autonomous grade,
  academic penalty, or formal record without explicit teacher review and institutional sign-off.
- Student-persona histories must not be shared across institutions or used for model training
  without explicit student consent (see section 6.3 of this assessment).
- The simulated patient in a continuing arc must retain the hard-coded off-ramp (section 4.3):
  "I am a simulated training patient" -- present at every session, not just the first.

---

### 9.6 Domain Validation Required from the Named Clinician-Educator

The clinician-educator named in section 6.1 as a build precondition is required for the
continuing personas module in addition to all the validation tasks already listed. The
continuing persona module adds the following specific validation requirements:

1. **Development model calibration.** Review and approve the rate-of-change parameters for
   alliance, openness, symptom, and process change in response to student behaviour. Define
   realistic floors and ceilings. Approve the list of student behaviours that trigger which
   changes. This cannot be done by engineering or product alone.

2. **Session arc length.** Advise on what session arc lengths (2, 3, 4, 6 sessions) are
   pedagogically appropriate for different course stages. A first-year student should probably
   not be running a 6-session arc with a high-challenge patient. Define appropriate constraints.

3. **Formulation anchor design.** Review the structured formulation fields in the history store
   and confirm they are clinically coherent -- that the structure matches how CBT/ACT
   formulations actually evolve in practice.

4. **History view (supervision interface).** Review the lecturer history view before launch and
   confirm it presents information in a form that supports real supervisory judgment, not just
   data display.

5. **Welfare risk calibration for long arcs.** Advise on at what session count and challenge
   level a between-session welfare prompt is clinically warranted.

6. **Between-session state modeling.** Advise on whether session-gap state change (mood
   fluctuation, partial regression) should be in scope for v1 or deferred, and if deferred,
   what the student briefing should say about this limitation.

CONFIDENCE: Confirmed -- all six items require clinical educator input before build.
The continuing personas module does not change the "named clinician-educator is a
precondition" call. It adds scope to that person's validation remit.

---

### 9.7 Confidence Labels -- Continuing Personas Addendum

| Finding | Confidence level |
|---|---|
| Longitudinal "same patient" practice is pedagogically strong for psychotherapy training | Confirmed (domain knowledge) |
| Continuity across more than 4-5 sessions without structured formulation anchor will produce incoherent patients | Confirmed (domain knowledge) |
| Alliance/symptom rate-of-change must be clinically bounded; LLM will not calibrate this correctly by default | Confirmed (domain knowledge) |
| Development model principle (skill -> disclosure/alliance) is clinically sound | Confirmed (domain knowledge) |
| Development model risks rewarding outcome-chasing over process fidelity | Confirmed (domain knowledge) |
| "Notable student mistakes" field is the highest-sensitivity personal data in the history store | Confirmed (domain knowledge + privacy law inference) |
| 12-month retention of detailed student mistake history requires Israeli privacy law review | Inferred -- open item for Eyal/Lital |
| Long session arcs increase risk of student over-identification / real distress surfacing | Confirmed (domain knowledge -- known psychotherapy training risk) |
| Between-session welfare prompt warranted for continuing persona sessions | Inferred -- requires clinical educator calibration |
| Session-gap state modeling (mood between sessions) is out of scope for v1 | Assumption to validate with clinical advisor and Perry |
| Named clinician-educator precondition unchanged; continuing personas module adds validation scope | Confirmed |
