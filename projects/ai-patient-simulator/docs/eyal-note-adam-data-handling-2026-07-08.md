# Eyal (Legal) -- Adam Data-Handling Note
# Date: 2026-07-08
# Source: adam-pilot-readiness-answers-2026-07-08.md (Section 5)
# Task: APS-004 residual (Eco routing 2026-07-08)
# Status: LEGAL FINDINGS (internal). Not for external sharing without owner A1.

---

## Scope

Adam's section 5 answers, relayed by owner 2026-07-08. Three sub-questions:
(a) Does Adam-as-controller change the handles-only / no-college-DPA path?
(b) Is no-welfare-contact acceptable for a formative pilot (AI-disclosure + off-ramp retained)?
(c) Accreditation gap flag.

---

## (a) Adam as controller -- handles-only reconciliation

### What Adam said

Adam states he is "the data controller / contact for now" and names four PPL security
requirements: (1) auth + MFA, (2) encryption in transit + at rest, (3) access audit logging,
(4) network isolation / DB layer isolation.

### Mapping Adam's 4 requirements to Rambo must-fix set

| Adam requirement | Rambo must-fix | Status |
|-----------------|----------------|--------|
| Auth + MFA (individual accounts, identifiable login) | M9 (server-side RBAC on every endpoint) | ALIGNED. Rambo M9 requires server-side access control. Adam's MFA requirement adds one specific control Rambo did not name explicitly. Must-fix: MFA is now a confirmed customer requirement, not just a best-practice flag -- Ido must spec it as required for the pilot login, not optional. |
| Encryption in transit (HTTPS/SSL) + at rest | M15 (encryption at rest) | ALIGNED. M15 covers at rest; HTTPS/TLS in transit is assumed as baseline but Adam's explicit call-out makes it a documented requirement, not just implicit. |
| Access audit logging (who / when / what action) | M10 (no session token or invite code in any log -- partial); M9 (RBAC) | PARTIAL ALIGNMENT. Rambo M10 is about what must NOT be in logs (no tokens). Adam's requirement is about what MUST be in logs (access audit trail: who viewed/edited/deleted a student record). These are compatible but not the same. Explicit access-log requirement is now customer-confirmed. Ido must spec an access audit trail as a pilot requirement. |
| Network security: patching, firewall, DB isolation from public web | M12 (bucket private + Block Public Access), M14 (least-privilege IAM), M9 (RBAC) | ALIGNED in substance. Rambo M14 + M12 address network isolation at the storage and IAM layer. Adam's call-out of routine patching is a standard ops requirement -- not a legal gate item but it is a customer expectation. |

CONCLUSION: Adam's 4 requirements are CONSISTENT with and ALIGNED to Rambo's must-fix set.
They add two specifics not named by Rambo: (1) MFA as a required control (not just strong
auth), and (2) an explicit access audit log (positive logging of access events, not just
exclusion of tokens from logs). Both must be confirmed with Ido as pilot-required.

No conflict between Adam's requirements and the current Rambo gate posture.

### Does Adam-as-controller change the handles-only / no-college-DPA path?

ANSWER: NO -- handles-only still removes the college-DPA requirement IF properly implemented.
Here is the reasoning:

Adam states he is "data controller for now." Under Israeli PPL 5741-1981 as read through
Eyal's knowledge base (through August 2025), the controller/processor distinction turns on
WHO determines the purpose and means of processing identifiable personal data. If the platform
stores only pseudonymous handles (student ID tokens, not names or email addresses), and the
mapping between handle and real identity is held ONLY by the institution (i.e. Adam/college
holds the key), then:

1. The platform processes pseudonymous data, not personal data. No identifiable individual
   can be derived from the platform database alone.
2. The college (Adam as controller) holds the identity key. The platform is not a processor
   of personal data -- it is a processor of pseudonymous educational records.
3. No DPA with the college is required if the platform has no access to the identity key
   and cannot re-identify any record.

THIS PATH REQUIRES A CLEAN IMPLEMENTATION. The handles-only design is only valid if:
- Student names, emails, and institutional identifiers NEVER enter the platform in any field,
  log, transcript, or API call.
- Invite links / access tokens do not encode a student name or email.
- The mapping table (token -> real student) is held exclusively by Adam / the institution
  and is never transmitted to the platform.

If ANY of those conditions are violated -- even in a support email, a debug log, or an API
call -- the platform becomes a processor of personal data and the DPA with the college
becomes mandatory.

Adam's "for the time being" framing does not change this. The question is not who Adam
currently is; it is whether identifiable data enters the platform. The owner relay must
clarify with Adam that the handles-only design means his college identity-key stays
with him, not with the platform.

RECOMMENDED OWNER-RELAY TO ADAM: confirm he is comfortable with the handles-only model,
where the platform never receives real student names or emails -- only opaque student IDs
issued by the college. If Adam needs the platform to receive real names (e.g. for
gradebook integration or communications), the DPA path becomes mandatory immediately.

Until that confirm arrives, Eyal's position is: handles-only is still the cleaner path;
no college DPA is required on handles-only IF implemented cleanly.

---

## (b) No welfare contact -- acceptable for formative pilot?

Adam's answer: "Not needed at this stage. Adam feels adding it may pull us into more complex
areas."

### Legal posture

ACCEPTABLE, with conditions.

For a formative pilot (the tool is not a clinical service; it is an educational simulation
training tool for students learning clinical skills), the absence of a real-time welfare
escalation pathway is legally permissible under the following conditions:

1. NON-DISMISSABLE AI-DISCLOSURE must remain. Students must see, before every session,
   a clear statement that they are interacting with an AI simulation, not a real patient,
   and that the content is training material. This is the baseline under Israeli PPL and
   general tort principles (deception of a user in a system that touches clinical content
   creates liability even without a clinical-service designation).

2. OFF-RAMP SIGNPOSTING must remain. If a student types content indicating personal distress
   or crisis, the system must display a static, non-AI signpost pointing to appropriate
   support resources (e.g. a university counsellor contact, a crisis line number). The system
   does not need to route the student live -- but it must not be silent when distress signals
   appear. This is not a welfare service; it is a duty-of-care baseline.

3. THE PILOT IS FORMATIVE AND SUPERVISED. Adam's own oversight model (periodic review,
   teacher preview mode, small cohort of ~20-25 students) provides the human supervision
   layer. This is explicitly a training context, not a standalone public-facing clinical tool.

4. SCOPE LIMIT: this determination applies only to the formative pilot at Gome Gevim College
   under Adam's direct supervision. If the product scales beyond this cohort or is marketed
   as a clinical training platform without direct academic oversight, the welfare contact
   question must be re-examined before that deployment.

CONCLUSION: de-scoping the real-time welfare escalation contact for the pilot is legally
acceptable PROVIDED the AI-disclosure and off-ramp signpost remain as hard requirements.
These two items are non-negotiable regardless of Adam's de-scoping preference.

---

## (c) Accreditation gap

Adam's answers do NOT address formal accreditation of the simulation as an accredited
educational activity, or whether Gome Gevim College's academic governance has approved
the tool for use in accredited coursework.

THIS IS AN OPEN GAP. Eyal flags it to Eco for owner relay to Adam.

Specifically:
- Israeli higher education institutions operate under the Council for Higher Education
  (CHE / Vaad HaHinuch HaGavoha) framework. Use of an AI simulation tool as part of
  accredited coursework in a clinical training programme may require institutional
  academic committee approval, not just the department head's (Adam's) agreement.
- If the pilot is a non-graded, voluntary, informal activity (not part of official
  coursework assessment), the CHE / accreditation concern is lower. If it feeds
  into grades or formal assessment, institutional academic governance approval is
  likely required.
- Adam's description ("Adam acts as the initial clinical / product lead for pilot content")
  suggests he has authority to direct content and oversight, but does not confirm he has
  institutional governance approval for the tool as part of accredited coursework.
- This is a flagged unknown, not a confirmed blocker. It is outside Eyal's confirmed
  knowledge. If it is a non-graded formative pilot (practice only, not assessed), the
  risk is low. If it is embedded in assessed coursework, it is a potential blocker.

RECOMMENDATION: owner relay to Adam -- ask explicitly: is this pilot part of assessed
coursework or grades? If yes, has the college's academic committee approved the tool?
If no -- purely formative and not graded -- document that clearly; risk is low.

This is not a local counsel item unless Adam's answer indicates the tool touches graded
coursework without institutional governance approval. Flag to Eco as an open item.

---

## Summary for Eco

(a) Adam-as-controller does NOT change the handles-only / no-college-DPA path. Handles-only
    still removes the DPA requirement -- but only if cleanly implemented (no real names or
    emails in the platform). Owner must confirm with Adam that he is comfortable holding the
    identity-key at the college side. Adam's 4 security requirements are fully aligned with
    Rambo's must-fix set; two specifics (MFA + access audit log) must be confirmed as
    pilot-required with Ido.

(b) No welfare contact is acceptable for the formative pilot ONLY if AI-disclosure and
    off-ramp signposting remain as hard, non-dismissable requirements. De-scope of live
    welfare routing is accepted; de-scope of the signpost is not.

(c) Accreditation gap is open. Eco should relay to Adam: is this part of graded/assessed
    coursework? If yes, has college academic governance approved the tool? Answer changes
    the risk level.

---

Document control: internal, Eyal only. Not for external sharing without owner A1.
