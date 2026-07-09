# Adam -- pilot-readiness answers (relayed by owner 2026-07-08)

SOURCE: Adam replied by email; owner (jecki) relayed the verbatim text into the Eco
Telegram session 2026-07-08. Captured here as the primary-source answer set for APS-010.
ASCII-normalized (curly quotes / en-dashes converted); wording preserved.

Unblocks: APS-010 (relay), and feeds APS-005 (continuing personas), APS-004 (privacy/DPA),
and the welfare-UI / clinical-oversight open items.

---

## 1. Session format (Q9.1 -- single vs multi-session)
Adam wants BOTH options available for September:
- a single clinical encounter per session, AND
- multiple sessions with the same simulated patient over time.
He states this is important -- it distinguishes the product from competitors.

IMPLICATION: continuing-personas is NOT deferrable to Phase 1b if we honor Adam's Sep
ask. This reopens the APS-005 "continuing personas deferred pending Q9.1" decision.
-> Ido + Gal scope call: what multi-session-same-patient costs for the Sep pilot-minimal.

## 2. Clinical oversight
Named clinical oversight IS needed, but light for the pilot -- not a heavy governance
structure. Adam's proposed model:
- Adam acts as the initial clinical / product lead for pilot content.
- Periodic review of clinical content and simulation outputs.
- Ideally a "self-simulation" mode: a new bot simulates students, runs the full
  simulation including the final review, and Adam then examines the results.
- When a teacher builds a new simulation / persona, teachers must be able to run checks
  and see whether the simulation works well.

IMPLICATION: Adam nominates HIMSELF as clinical lead for the pilot -- no external clinical
advisor hire presupposed (matches the APS-010 reframe). NEW product ask: a self-simulation
/ author-preview test mode (bot-plays-student -> full run -> review output).
-> Sami + Ido validate the oversight model; Perry to scope self-simulation mode as a
   product requirement.

## 3. Student welfare contact
Not needed at this stage. Adam feels adding it may pull us into more complex areas.

IMPLICATION: the welfare-contact UI item is DE-SCOPED for the pilot per the customer.
KEEP the non-dismissable AI-disclosure / off-ramp signpost (safety baseline stays), but
do NOT build a real distress/welfare escalation contact for the pilot.
-> Confirm with Eyal that "no welfare contact" is acceptable against our safety posture
   for a formative pilot (we keep disclosure + off-ramp; no real-distress routing).

## 4. Cohort size (planning assumptions for September)
- ~20-25 students
- ~2 teachers / supervisors / admins
- ~3-5 simulation sessions per student over the pilot period
- => ~60-175 student simulation runs for the first pilot, plus buffer.

IMPLICATION: concrete sizing for Lital (run-cost estimate) and Ido (load / seed / credit
governance). Well within the pilot-minimal envelope.

## 5. Data handling with the college
- Adam is the data controller / contact for now.
- Name, course, and descriptive evaluation = Personal Data under the Protection of Privacy
  Law, 5741-1981 (PPL).
- GDPR adequacy: Israeli law permits transfer to countries party to the European Convention
  for the Protection of Individuals re Automatic Processing of Personal Data, or bound by EU
  GDPR.
- Israeli regs (per Adam) require a basic written commitment or standard DPA verifying the
  recipient (hosting provider / server framework) maintains privacy standards and will not
  hand data to unauthorized third parties.
- Adam's stated key requirements:
  1. Strong authentication + access management: no single shared password / weak creds.
     Individual authenticated accounts so each login is identifiable. MFA is standard for
     clinical/educational student backends.
  2. Data encryption: encrypted in transit (HTTPS/SSL) and at rest, so a compromised server
     does not expose plaintext student data.
  3. Access logging / audit trail: automatic log of who accessed data, when, and what action
     (view / edit / delete of a student's evaluation).
  4. Network security: routine patching, firewall config, isolation of the DB layer from
     public web traffic.

IMPLICATION: Adam is engaging as data controller and has laid out concrete PPL security
expectations. This maps directly onto Rambo's APS-004 must-fix set (encryption, auth/MFA,
audit logging, network isolation) and Eyal's DPA/residual checklist. NOTE: Adam says he is
the controller "for the time being" -- our handles-only / de-identified design (APS-004
re-scope) may still be the cleaner path; reconcile with Adam that real names may not need to
sit in-platform at all.
-> Eyal: map Adam's 4 security requirements against gate-security-rambo.md + the residual
   legal checklist; confirm whether handles-only still removes the college-DPA requirement or
   whether Adam's "controller" framing changes it.

---

## Routing (Eco, 2026-07-08)
- APS-005 continuing personas: REOPENED -> Ido/Gal scope multi-session for Sep.
- Self-simulation / author-preview mode: NEW req -> Perry.
- Welfare contact: DE-SCOPED for pilot -> Eyal safety-posture confirm.
- Cohort sizing: -> Lital (cost) + Ido (load/seed).
- Data handling: -> Eyal (map to Rambo must-fix + residual checklist; handles-only reconcile).
- Accreditation: Adam did not explicitly address formal accreditation in this reply; treat
  as still-open unless the oversight model above satisfies it. Eyal to flag if a gap.
