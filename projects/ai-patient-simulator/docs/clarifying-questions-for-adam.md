# Clarifying Questions for Adam
# task APS-001 | owner: Perry (VP Product) | date: 2026-06-28 | status: UPDATED 2026-06-28
# Relay via owner. Do not send directly to Adam.
# Updated 2026-06-28: P1 pilot questions (Q1.1, Q1.2, Q2.1, Q3.1, Q4.1) ANSWERED.
# New questions (Group 9) added from adam-appendix-credit-and-continuing-personas.md.

Plain-language questions grouped by theme. Priority order within each group: P1 = needed to scope pilot, P2 = needed before build, P3 = needed before commercial terms.

---

## Group 1: Cohort and Market (Who is the first pilot for?)

**Q1.1 [P1] ANSWERED 2026-06-28** Institution: Gome Gevim College, Israel. Start: 1 September 2026.
Treat as a real first-site pilot. (Student and teacher count still open -- see Q1.1b below.)

**Q1.1b [P1 -- NEW]** Approximately how many students and teachers in the Sep pilot cohort?
(Needed to size infra and credit allocation.)

**Q1.2 [P1] ANSWERED 2026-06-28** Formative practice only. NOT a formal graded assessment for v1.
Assessment data may matter later; grading is not a v1 dependency.

**Q1.3 [P1]** Which clinical training models does the first pilot focus on -- LI-CBT, ACT, CBT, general psychotherapy counselling, or a mix?

**Q1.4 [P2]** Are there other institutions already interested in following on from the first pilot? If so, approximately how many students in the first year?

---

## Group 2: Languages (Which languages, and in what order?)

**Q2.1 [P1] ANSWERED 2026-06-28** Hebrew required day one; English also desirable/likely needed;
Arabic is a later phase unless the pilot institution specifically requires it before launch.

**Q2.2 [P1]** What language do the teachers and programme managers at the pilot institution prefer for their dashboards and reports?

**Q2.3 [P2]** Is there a need to evaluate or compare students who conducted sessions in different languages in the same course? (This affects how we store and display results.)

---

## Group 3: LMS and Hosting (How do students and teachers log in?)

**Q3.1 [P1] ANSWERED 2026-06-28** Secure invite link is acceptable day one. Canvas/Moodle
desirable later but must NOT block pilot launch.

**Q3.2 [P1]** If Canvas is needed: is it self-hosted by the institution, or is it Canvas Cloud (hosted by Instructure)? Who manages the Canvas instance -- the institution's IT team, or you?

**Q3.3 [P2]** Does the pilot need grades to flow back automatically into Canvas or Moodle, or can teachers view grades in our platform's dashboard only?

**Q3.4 [P2]** Where should the platform run -- on cloud servers we choose and manage, on infrastructure the institution controls, or somewhere else? Is there a country preference for where data is stored (for example, Israel, UK, EU)?

---

## Group 4: Data and Privacy (Who owns the data, and what rules apply?)

**Q4.1 [P1] ANSWERED 2026-06-28** Israel-based pilot population. Privacy baseline: Israeli Privacy
Protection Law. If international students added later, or data processed outside Israel, review
separately.

**Q4.2 [P1]** Do the simulated patient scenarios need to include any real or sensitive clinical content (for example, direct references to self-harm or suicidality in the training script), or are they fictional training cases only?

**Q4.3 [P2]** Who is the data controller for student records -- the institution, you personally, or us? Do you have an existing privacy/data-sharing agreement with the institution?

**Q4.4 [P2]** How long do student session transcripts need to be retained? Is there a policy for deleting student data after a course ends?

---

## Group 5: Budget and Commercial Terms (What are we agreeing to?)

**Q5.1 [P1]** Do you have a rough budget in mind for building and running the first pilot -- even a broad range? (This helps us decide how much we can build before the pilot and what trade-offs to make.)

**Q5.2 [P1]** How are you thinking about the commercial arrangement -- a fixed project fee, revenue share, equity, or a combination? (We understand this is still open; knowing the direction helps us structure the engagement.)

**Q5.3 [P2]** For the pilot itself: who bears the AI usage costs (roughly $2-5 per student per 10 sessions in our current estimate)? Is that absorbed by us, by you, or billed to the institution?

**Q5.4 [P3]** Longer-term, how do you envision selling or licensing the platform -- per institution, per student seat, per simulation run, or something else?

---

## Group 6: Timeline (When does the first pilot need to happen?)

**Q6.1 [P1]** Is there a specific term or academic cohort start date that the first pilot needs to align with? What is the latest date by which the platform needs to be ready for students to use?

**Q6.2 [P2]** How much lead time do teachers and programme managers need to set up their simulations and rubrics before the pilot students start? (This affects when the authoring tools need to be ready.)

---

## Group 7: Success Criteria (How do we know the pilot worked?)

**Q7.1 [P1]** What would a successful pilot look like to you? Is it student completion rates, quality of feedback, teacher adoption, institution willingness to expand, or something else?

**Q7.2 [P1]** Who makes the go/no-go decision to expand after the pilot -- you, the institution, or both together?

**Q7.3 [P2]** Is there any academic, ethics, or institutional review process that needs to approve the use of AI in training before the pilot runs? Has that process started?

---

## Group 8: Clinical Scope and Safety (What are the limits of the simulation?)

**Q8.1 [P1]** What is the highest-risk scenario type the first pilot will include -- for example, a patient with indirect hints of self-harm, or only lower-risk presentations like anxiety and avoidance? (This affects our safety and escalation design.)

**Q8.2 [P2]** If a student interacts with an AI patient in a way that mirrors a genuine safeguarding concern (for example, role-playing an intervention poorly), what should the system do -- flag it to the teacher silently, show the student a message, or just record it for evaluation?

**Q8.3 [P2]** Should the platform include any explicit disclaimer to students that they are interacting with a simulated AI patient, not a real person? Is there a specific wording your institution or accrediting body requires?

**Q8.4 [P3]** Are you planning to submit the platform or its outcomes for any formal academic publication or accreditation review? (This affects how we need to document the evaluation methodology.)

---

## Group 9: Continuing Persona and Credits (NEW -- raised by appendix 2026-06-28)

**Q9.1 [P1 -- CRITICAL for scope]** For the September 2026 pilot specifically: does the cohort
plan to run MULTIPLE sessions with the same simulated patient across the course (i.e., is
session-to-session persona continuity required for the Sep launch), or is the Sep pilot
single-session per student? This is the deciding factor for whether continuing-persona runtime
is in the Sep pilot or deferred ~4-6 weeks to Phase 1b. If single-session is viable for Sep,
we can ship a stronger core engine sooner and add continuity in October.

**Q9.2 [P1]** For the Sep cohort: roughly how many sessions per student per course are planned?
How many weeks does the course run? (Helps us understand usage volume for credit allocation
and infra sizing.)

**Q9.3 [P2]** On the credit / token management module: at Gome Gevim College, who will be the
designated admin responsible for setting credit limits and responding to low-balance alerts?
Is that Adam, a college IT person, or a programme coordinator? (Affects the admin onboarding
flow we need to support at launch.)

**Q9.4 [P2]** On continuing persona reset and fork: how frequently do you expect lecturers to
use the fork / branch comparison feature in practice? Is this a routine teaching tool or a rare
remediation edge case? (Affects build priority within Phase 1b.)

**Q9.5 [P2]** The appendix specifies 12-month history retention. Is that 12 months from the end
of the course, 12 months from last session, or 12 months from the end of the academic year?
And after 12 months: hard delete, or archive to cold storage with restore-on-request?
(Israeli Privacy Protection Law requires a defined retention policy; Eyal will need this.)

**Q9.6 [P2]** Are there any scenarios where a student should be able to SEE their own
session-to-session progress in the continuing persona (e.g., a summary of how their patient
has changed)? Or is the longitudinal history visible to lecturers/admins only?
(The appendix says students don't control continuation, but doesn't address read visibility.)
