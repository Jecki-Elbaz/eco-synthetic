# APS -- Draft Student Privacy Notice (Outline)
# Author: Eyal (Legal, L3)
# Date: 2026-06-30
# Last updated: 2026-07-12 -- Section ARC-SUMMARIES added (Eyal, pre-real-students
#   condition 3 per privacy-note-arc-session-summary-eyal-2026-07-11.md)
# Status: DRAFT -- internal working document. Owner A1 required before any version is
#         distributed or shown to students, parents, or the college.
# Scope: Pseudonymous-handle (Option A) pilot path only.
# Language note: this outline is in English. The notice MUST be delivered in Hebrew.
#   Translation is an owner/human action before distribution. Do not distribute this
#   English draft to Adam or to students.
# Not for external sharing without owner A1.

---

## NOTICE TO STUDENT -- PILOT PRIVACY STATEMENT
## [Platform name: to be confirmed by owner]
## Gome Gevim College -- Pilot Programme [Academic Year TBD]

---

### Content points (in order of recommended presentation)

---

**1. Who we are**

Content: identify the platform and the individual or entity operating it.
Under Option A (no company registration), this is the owner operating as an individual
or as an Osek Murshe (sole proprietor). The exact legal name and contact detail must
be confirmed by the owner before the notice is finalised. Do NOT use "Eco-Synthetic Ltd"
-- that entity does not exist.
Confident position: the notice must name a real, reachable person or entity.

---

**2. What this platform does**

Content: one paragraph explaining the AI patient simulator -- a learning tool that
lets students practise therapeutic conversations with a simulated patient. Confirm that
the simulated patient is not a real person and that the content is educational only.
Note: "not a clinical record" boundary (already in APS requirements) should appear here
in student-friendly language.

---

**3. What information we collect -- and what we do NOT collect**

Content: structured list.

What we DO collect (under Option A):
- Your assigned student handle (a code like "Student-7F2A"). This handle is assigned
  to you by your lecturer. We do not know your real name or identity.
- Your session activity: what you typed and how the simulated patient responded.
- Your performance summary: session feedback, skill ratings, and the notes your lecturer
  records about your learning progress (including any mistakes noted for formative purposes).
- Technical data: login time, session duration, and basic usage logs (to keep the platform
  running and to fix problems).
- Arc session summaries (multi-session arcs only): if your practise involves more than
  one session with the same simulated patient, the platform saves a brief summary at the
  end of each session so the next session continues where you left off. Full disclosure
  clause and Hebrew text in Section ARC-SUMMARIES below.

What we do NOT collect:
- Your real name.
- Your student ID number.
- Your email address.
- Any information about you outside this platform.

Who holds the link between your handle and your real name: your lecturer at Gome Gevim
College holds this link, not us. If you want to know what information is held about you
personally, contact your lecturer or the college.

---

**4. Why we collect this information**

Content: state the legitimate purpose plainly.
- To run the simulation sessions you use for practice.
- To provide formative feedback to you and your lecturer.
- To improve the platform during the pilot (aggregate, non-identified usage data only).

State clearly: we do not use your session data or performance records to train AI models.
[Confident position under Israeli PPL: explicit per-student consent is required for model
training use; we do not have that consent and will not use data for that purpose.]

---

**5. How long we keep your information**

Content:
- Session transcripts and performance records are kept until the end of your course or
  academic year, plus 90 days for lecturer review, then deleted.
- If your lecturer resets your history in the platform, the original record is deleted
  (not archived in a hidden backup).
[Note to owner: this retention period must match the finalised schema decision per
gate-legal-privacy-eyal.md Item 1. If the schema is set differently, this notice must
be updated before distribution.]

---

**6. Who can see your information**

Content:
- Your lecturer / supervisor on this course (not other lecturers, not other institutions).
- Platform technical staff, only when needed to fix a problem (access controlled; your
  data is never used for any other purpose).
- No one else. We do not share your session data with any third party for marketing,
  research, or any other purpose.

---

**7. Where your information is stored**

Content:
- Your session data is stored on secure servers. [Storage provider and region to be
  confirmed by the time this notice is distributed -- must reflect the actual provider
  chosen per APS-006 infra decision. Do not publish this notice before the provider
  is confirmed and the DPA is executed.]
- Your data is protected by security controls appropriate to its sensitivity.

---

**8. Your rights**

Content (Israeli PPL rights -- applicable even under the pseudonymous model as a
good-practice disclosure, and required if LC-5 confirms borderline personal-data status):

You have the right to:
- Ask what information the platform holds under your student handle.
- Ask us to correct information that is wrong.
- Ask us to delete your information.

Because your handle is not linked to your real name in our system, you will need your
lecturer to confirm your handle before we can respond to any of these requests.
Contact your lecturer first, then contact us at [owner contact detail].

---

**9. Questions and contact**

Content: plain email or contact form address where a student (or their lecturer on their
behalf) can reach the platform operator with privacy questions.
[Owner to fill in before distribution.]

---

**10. Changes to this notice**

Content: if we update this notice, we will notify your lecturer in advance of any change
that affects what we collect or how we use it.

---

### Delivery and format notes (for owner)

- This notice must be delivered in Hebrew before any student begins a session.
- It should be displayed as a standalone page before the first login (not buried in terms).
- The student should confirm they have read it before the session starts (affirmative
  acknowledgment -- a simple "I have read this notice" checkbox is sufficient; this is
  NOT a consent form for personal data under Option A since Option A is designed to
  avoid collecting personal data; it is a transparency notice).
- If LC-5 local counsel confirms the data IS personal data despite the pseudonymous model,
  this notice must be upgraded to a consent form (affirmative consent, not just
  acknowledgment). Eyal will update on LC-5 resolution.
- Adam / Gome Gevim distributes this to students via college channels; the platform
  displays it on first access. Owner relay to Adam required -- no agent contacts Adam.

---

### ARC-SUMMARIES -- DATA DISCLOSURE CLAUSE

APPROVED -- OWNER A1 2026-07-14 (jecki, in-session directive; recorded in decisions-log).
Added: 2026-07-12, Eyal (Legal, L3)
Pre-real-students condition 3 of 5 (see privacy-note-arc-session-summary-eyal-2026-07-11.md).
CLAUSE CONTENT approved for incorporation into the final Hebrew-language notice. The
NOTICE AS A WHOLE still requires its own pre-launch owner A1 + final Hebrew review
before distribution (that gate is unchanged; see the document-level status line).

---

**Background -- for owner and legal reference (not student-facing text)**

The ArcSessionSummary table (Sprint 5) stores per-student, per-template, per-session arc
state to support multi-session arcs (up to 3 sessions with the same simulated patient).
Fields: userId (platform handle), templateId, sessionNumber, trust / openness / alliance
levels (Float), symptomMarkerState (JSON), notableMomentsSummary (free-text LLM-generated
session narrative), sessionCompletedAt.

Under Israeli PPL (5741-1981 + Amendment 13), this data linked to a real student via
their platform handle is personal data. Disclosure before acknowledgment or consent is a
pre-launch requirement.

Retention ruling (Eyal 2026-07-11): end-of-arc + 90 days, then permanently deleted.
Implementation note: the retainUntil field and purge mechanism are not yet in the schema.
This is an engineering task required before real students onboard (condition 1 of 5 from
the same ruling note, separate from this notice clause).

---

**English working version -- plain-language disclosure clause**

Arc session summaries -- what they are, what we store, and how long we keep them

Some practise scenarios in this platform span more than one session with the same
simulated patient. We call this a multi-session arc. To allow each session to continue
from where the last one ended, the platform saves a brief arc session summary at the
close of each session.

What an arc session summary contains:

- The simulated patient's trust, openness, and alliance levels at the end of your
  session (internal numeric scores used only by the simulation engine).
- Which aspects of the simulated patient's situation were disclosed during your session
  (internal symptom markers -- simulation state only; not a clinical record).
- A short automatically generated note describing what happened during the session:
  patient state changes and key interaction moments. This is not a verbatim transcript
  of what you said.
- The date and time your session ended.

How it is linked to you: the summary is stored under your assigned student handle (for
example, "Student-7F2A"), not under your real name. We do not know your real name. See
the note on handles-only design below.

What it is used for: solely to allow the next session in the same arc to continue
coherently from where you stopped. No other purpose. Your lecturer does not see the raw
summary; the platform uses it internally only.

How long we keep it: until the arc is complete (all sessions done) plus 90 days, then
permanently deleted. The 90-day window allows you to exercise your data rights (see
Section 8) before the record is removed.

Who can see it: platform technical staff only, under the same access controls as all
other session data (see Section 6).

---

Note on handles-only pilot design (APS-004 LC-5 posture)

Under the current pilot design the platform stores only your synthetic student handle --
not your real name, student ID number, or any other identifying information. The link
between your handle and your real name exists only with your lecturer and the college,
not with us. Arc session summaries are linked to a handle, not to an identified person
as far as the platform is concerned. Your lecturer holds the key.

---

**Hebrew draft text -- for inclusion in the final Hebrew-language notice**

[DRAFT -- PENDING OWNER A1 AND FINAL HEBREW REVIEW BEFORE DISTRIBUTION]

**סיכומי מפגש קשת -- מה הם, מה אנחנו שומרים, וכמה זמן**

חלק מתרחישי התרגול בפלטפורמה זו כוללים יותר ממפגש אחד עם אותו/ה מטופל/ת מדומה/ה. אנחנו קוראים לזה "קשת רב-מפגשית". כדי שכל מפגש יוכל להמשיך בצורה רציפה מהנקודה שבה עצרת/ת, המערכת שומרת סיכום קצר בסיום כל מפגש.

**מה כולל סיכום מפגש קשת:**

- רמות האמון, הפתיחות והברית של המטופל/ת המדומה/ה בסוף המפגש (ציונים מספריים פנימיים המשמשים את מנוע הסימולציה בלבד).
- אילו היבטים של מצב המטופל/ת המדומה/ה נחשפו במהלך המפגש (סמני תסמינים פנימיים -- מצב סימולציה בלבד; לא רשומה קלינית).
- הערה קצרה שנוצרת אוטומטית ומתארת מה קרה במפגש: שינויים במצב המטופל/ת ורגעי אינטראקציה מרכזיים. זה אינו תמליל של דבריך.
- תאריך ושעת סיום המפגש.

**כיצד הסיכום מקושר אליך:** הסיכום נשמר תחת כינוי הסטודנט/ית שהוקצה לך (לדוגמה, "Student-7F2A"), לא תחת שמך האמיתי. איננו יודעים את שמך האמיתי. ראה/י את ההערה על עיצוב כינויים-בלבד להלן.

**למה אנחנו שומרים:** אך ורק כדי לאפשר למפגש הבא באותה הקשת להמשיך בצורה רציפה מהנקודה שבה עצרת/ת. אין מטרה אחרת. המרצה/ה שלך אינו/ה רואה את הסיכום הגולמי; המערכת משתמשת בו פנימית בלבד.

**כמה זמן אנחנו שומרים:** עד לסיום הקשת (כל המפגשים הסתיימו) בתוספת 90 יום, ואז נמחק לצמיתות. חלון 90 הימים מאפשר לך לממש את זכויות המידע שלך (ראה/י סעיף 8) לפני הסרת הרשומה.

**מי יכול לראות:** צוות טכני של הפלטפורמה בלבד, בכפוף לאותן בקרות גישה כמו כל שאר נתוני המפגש (ראה/י סעיף 6).

---

**הערה על עיצוב כינויים-בלבד (עיצוב פיילוט)**

בעיצוב הפיילוט הנוכחי, הפלטפורמה שומרת אך ורק את הכינוי הסינתטי שלך -- לא את שמך האמיתי, מספר הסטודנט/ית, או כל מידע מזהה אחר. הקישור בין הכינוי שלך לשמך האמיתי קיים רק אצל המרצה/ה שלך ובמוסד הלימודי, ולא אצלנו. סיכומי מפגש קשת מקושרים לכינוי, לא לאדם מזוהה מבחינת הפלטפורמה. המרצה/ה שלך מחזיק/ה את המפתח.

---

## Document control

DRAFT outline only. All content is internal.
A1 required before any version is shown to students or the college.
Owner fills in: entity name, contact address, storage provider details.
Eyal refines the full Hebrew-ready draft on owner instruction.
Section ARC-SUMMARIES added 2026-07-12; pending owner A1 before distribution.
