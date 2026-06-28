# Adam -- Appendix: New reqs -- Credit Management & Continuing Student-Persona History

INTAKE / READ-ONLY. Received from customer (Adam) 2026-06-28. Punctuation normalized to ASCII;
wording verbatim. Do not edit; copy to ../docs/ to work on it.

## Purpose
Adds two required product capabilities:
1. Internal credit management for tracking and controlling usage of external AI/tooling resources.
2. Continuing simulated personas/patients whose therapeutic history develops uniquely with each
   student across a course.
Internal platform governance, educational continuity, controlled use of external services.
Product requirements only; does not prescribe technical implementation.

## 1. Credit / Token Management
1.1 Product Goal -- internal credit-management mechanism for admins to allocate, monitor, and
control usage of simulation-related external tools, including OpenAI/API-based services. Credits
are NOT a direct billing product for students; they are an internal unit for institutional and
course-level consumption.
1.2 Credit Model -- simple internal unit of usage; assignable/trackable at College/institution
level and Course level; course usage associated to the relevant college/institution.
1.3 What Consumes Credits -- usage of external tools and AI services, may include: running
student simulations; continuing existing persona simulations; generating session summaries;
updating persona/patient state; generating feedback; using OpenAI/API-based or other external
tools. Record which activity consumed credits and associate with college and course.
1.4 Limits -- must support BOTH soft limits (warnings/notifications near/over threshold) and
hard limits (prevent further credit-consuming activity once limit reached, unless authorised
override). Both configurable by authorised admins.
1.5 Admin Capabilities -- add / deduct / reset / grant bonus credits; override limits; view
usage by college; view usage by course; review credit-consuming activity. All manual changes
auditable.
1.6 Student Visibility -- students should NOT see credit balances or consumption details;
admin/staff only.
1.7 Billing -- no payment/external billing integration at this stage; internal tracking,
allocation, control only.

## 2. Continuing Persona / Therapeutic History
2.1 Product Goal -- courses can define personas/patients students continue working with across a
course. A persona may begin as a shared base persona; once a student interacts, it branches into
a unique student-persona version preserving that student's interaction history.
2.2 Shared Base Persona with Student-Specific Branching -- teacher defines/selects a shared base
persona; multiple students may begin with the same base; each student's interaction creates a
unique longitudinal version; future behaviour influenced by that student's previous
interactions. Teacher-adjustable course feature (one-off vs continuing).
2.3 Course-Based Continuity -- continuing personas available across a course; course defines
which personas are continuable and when; students do not define continuation structure
(course-controlled).
2.4 Preserved Therapeutic History (per student-persona pair, structured): session summaries;
evolving formulation; therapy goals; homework given/discussed; symptom change; patient internal
process change; alliance/trust level; notable student mistakes; patient avoidance/resistance;
important therapeutic themes; significant shifts in engagement/disengagement. Sufficient for the
persona to respond in future sessions as the same patient with coherent memory of prior work.
2.5 Persona Development Based on Student Interaction -- development must be influenced by student
behaviour. Strong work -> more trust/openness/reflection/engagement; student avoidance -> material
left unprocessed; poor attunement -> alliance/resistance effects; good values/formulation/process
use -> supports symptom/process change; repeated missed opportunities shape internal process and
future responses. Preserve not only "what happened" but the educationally relevant IMPACT of the
student's choices.
2.6 Lecturer / Admin Visibility -- can inspect the longitudinal history of a specific
student-persona pair; supports review, supervision, assessment, feedback.
2.7 Reset and Fork Options -- authorised course staff can reset or fork a persona history:
restart from session 1; continue from a previous point; create an alternative branch from a
stage; compare therapeutic paths. For teaching, remediation, repeated practice.
2.8 Retention -- student-persona history retained 12 months; after that delete or archive per
the platform data-retention policy.
2.9 Educational Boundary -- continuing personas are simulated educational patients; stored
history is part of the training simulation and must NOT be treated as a real clinical record.

## 3. Summary of Required Capabilities
Internal credit tracking by college and course; soft + hard credit limits; admin
adjust/override; credit balances hidden from students; tracking of credit-consuming external
tool usage; course-defined continuing personas; shared base personas branching uniquely per
student; teacher control over continuation; preservation of structured student-persona
therapeutic history; persona development influenced by student interaction; lecturer/admin
review of histories; reset/fork options; 12-month retention.
