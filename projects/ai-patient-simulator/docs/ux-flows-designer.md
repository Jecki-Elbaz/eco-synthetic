# APS -- UX Flows and Wireframe Spec (Sprint 1)
# Author: Tal (Designer, Product) | Date: 2026-06-29 | Task: APS (design)
# Owner: Perry (VP Product)
# Status: INTERNAL ONLY -- not for external sharing without owner A1
# Inputs: requirements-baseline.md, feasibility-ido.md, sme-domain-assessment.md
# Scope: pilot-minimal (1 Sep 2026, Gome Gevim College, FORMATIVE, Hebrew + English)

---

## 0. Design Principles for This Pilot

1. WELFARE FIRST. The persistent welfare signpost (Sami, SME section 4.3) is never behind a
   scroll, never dismissable, never omitted -- on every simulation screen, every session.

2. RTL-NATIVE. Hebrew is the primary language. Layouts are designed RTL-first; LTR (English)
   is a mirror/logical-property variant, not an afterthought. All spatial references in this
   spec use logical (start/end/block-start/block-end), not physical (left/right/top/bottom).

3. LANGUAGE-INDEPENDENT DATA. Competency IDs and rubric criterion IDs are displayed as
   language-neutral keys internally; labels render in the active UI language. Scores are
   numeric only -- no language in the score itself.

4. FORMATIVE TRANSPARENCY. Every score is labelled "formative indicator" -- not "grade,"
   not "result." The evaluation header must say so in both languages.

5. SIMULATED PATIENT LABEL. Every screen that shows patient dialogue or patient state carries
   the simulation boundary label: "this is a simulated training patient."

6. NO PERSONAL DATA IN MOCKUPS. All examples in this spec use synthetic placeholders.

---

## 1. Primary User Journeys (Text Flow Diagrams)

### 1A. Student Journey -- Invite Link to Debrief

```
[Receive invite link + access code via email]
        |
        v
[Landing / Auth screen]
  - Enter email + access code
  - If credentials invalid: inline error, "check your email or contact your lecturer"
  - On success: JWT session created
        |
        v
[Readiness Check screen]
  Steps (sequential, student cannot skip):
  Step 1: Language selection
    - Radio: Hebrew / English (only permitted languages for assignment shown)
    - Selected language sets UI direction (RTL for Hebrew, LTR for English)
    - Confirmation: "The simulation will run in [language]"
  Step 2: Mic test
    - Button: "Test microphone" -> browser requests mic permission
    - Outcome A: mic detected -> green confirm + waveform animation -> Step 3
    - Outcome B: mic blocked/missing -> amber warning:
        "Mic unavailable -- you can still type your responses"
        Fallback mode flag set; student continues
  Step 3: Instructions panel
    - Simulation title (no spoilers; e.g., "Practice Session -- Assessment intake")
    - Duration and turn limit shown
    - Mode: "Formative practice -- no formal grade"
    - Welfare signpost (first occurrence, full text):
        [HE] "זהו מטופל-סימולציה לצורכי הכשרה. אם אתה/את חש/ה במצוקה אמיתית, פנה/י
               ל[גורם הרווחה של המוסד]."
        [EN] "This is a simulated training patient. If you are experiencing real distress,
               contact [institutional welfare resource]."
    - Acknowledgement checkbox: "I understand this is a simulation"
    - Button: "Begin session"
        |
        v
[Simulation Session screen] -- see wireframe spec, section 2A
  - Student sends messages; AI patient responds
  - Timer counts down (configurable; hard stop in formative = soft warning only for pilot)
  - Notes side panel available (optional; teacher may or may not see)
  - Help button always visible
  - Finish button always visible
        |
        v
[Finish Confirmation modal]
  - "Are you sure you want to end the session?"
  - Shows turns used, time elapsed
  - Warning if under minimum turns (author-configured): "You have only completed N turns.
    Consider continuing to practice."
  - Buttons: "Continue session" | "End session"
        |
        v
[Processing screen] -- "Preparing your feedback..." (indeterminate spinner)
  - Welfare signpost persists
  - Expected wait: 10-30 seconds (evaluation pipeline)
  - If >30 s: "Still working -- thank you for your patience"
  - If error: see states section 4
        |
        v
[Student Feedback screen] -- see wireframe spec, section 2B
  - Overall formative summary
  - Criterion scores + transcript evidence
  - Strengths and growth areas
  - Debrief entry point
        |
        v
[Debrief Chat screen]
  - AI educational supervisor (NOT the patient persona)
  - Label: "Debrief chat -- educational supervisor"
  - Hard boundary notice: "This chat uses only your transcript and rubric.
    It cannot change your score or access clinical facts beyond what you discussed."
  - Chat input (text only; no mic in debrief)
  - Max 10 questions (APS-REQ-062); counter shown "3 / 10 questions used"
  - On limit reached: "You have used all debrief questions. Review your feedback above
    or contact your lecturer with questions."
  - End debrief -> Student dashboard (session added to history)
```

### 1B. Teacher Journey -- Login to Attempt Review

```
[Teacher navigates to platform URL]
        |
        v
[Login screen]
  - Email + password (or invite-link first use)
  - "Forgot password" -> email reset flow
  - On success: Teacher dashboard
        |
        v
[Teacher Class Dashboard] -- see wireframe spec, section 2C
  - Course selector (if teacher has >1 course)
  - Assignment selector within course
  - Class list with completion status per student
  - Rubric heatmap (criteria x class, colour-coded)
  - Score distribution bar chart
  - Flagged attempts queue (technically affected + risk flags)
        |
        v
[Student row click -> Attempt Review screen] -- see wireframe spec, section 2D
  - Side-by-side: transcript (scrollable) + evaluation panel
  - Criterion scores with transcript evidence links
  - Click evidence link -> transcript scrolls to that turn + highlights it
  - Risk-awareness criterion: labelled "FORMATIVE - requires your review"
    (cannot auto-confirm; teacher must act to clear or escalate)
  - Override section: text field "Reason for override" + revised score input
    (APS-REQ-076; reason stored in audit)
  - Save + back to dashboard
        |
        v
[Optional: Teacher comment on attempt]
  - Free-text comment field below evaluation panel
  - Not visible to student in v1 (teacher-only notes)
  - Save -> back to dashboard
```

---

## 2. Wireframe Specs (Screen Layouts Described)

All measurements are unitless proportional values for design intent; engineering converts to
rem/viewport units. All layouts are RTL-default (Hebrew-first). LTR (English) variant mirrors
all logical-start/end positions.

### 2A. Student Simulation Screen

```
+------------------------------------------------------------------+
| SIMULATION HEADER (sticky block-start bar, full width)          |
|  [Simulation title]    [Timer: 23:41 remaining]  [Help] [Finish] |
|  "Simulated training patient -- formative session"               |
+------------------------------------------------------------------+
|                                                                  |
|  CHAT AREA (main region, ~70% inline-size)                      |
|  +----------------------------------------------------------+   |
|  |  [Non-verbal cue tag: [Long pause]]           (patient)  |   |
|  |  "I don't know... I've been feeling really low lately."  |   |
|  |                                                          |   |
|  |  (student) "That sounds really hard. Can you tell me     |   |
|  |   more about what 'low' feels like for you?"             |   |
|  |                                                          |   |
|  |  [Non-verbal cue tag: [Looks away]]           (patient)  |   |
|  |  "It's hard to explain. I just... I don't want to        |   |
|  |   leave the house anymore."                              |   |
|  |                                                          |   |
|  | ... (scrollable; block-end anchored on new message)      |   |
|  +----------------------------------------------------------+   |
|                                                                  |
|  INPUT BAR (sticky block-end, full inline-size of chat area)    |
|  +----------------------------------------------------------+   |
|  |  [Mic button]  [Text field: "Type your response..."]     |   |
|  |                                              [Send]      |   |
|  |  Dictation active: "Recording... click to stop"          |   |
|  |  Dictation result: editable text before send             |   |
|  +----------------------------------------------------------+   |
|                                                                  |
+------------------------+  +-----------------------------------+  |
|  (Inline-end sidebar,  |  |  NOTES PANEL (collapsible,       |  |
|  ~30% inline-size)     |  |  toggle button in header)        |  |
|                        |  |                                   |  |
|  WELFARE SIGNPOST      |  |  Sections (ACT/LI-CBT workspace): |  |
|  (persistent, always   |  |  - Problem statement              |  |
|  visible, not behind   |  |  - Thoughts                       |  |
|  scroll)               |  |  - Emotions                       |  |
|                        |  |  - Behaviours                     |  |
|  [HE] "זהו מטופל-      |  |  - Values                         |  |
|  סימולציה. אם אתה/את   |  |  - Hypotheses                     |  |
|  חש/ה במצוקה, פנה/י    |  |  (plain text fields; auto-saved   |  |
|  ל[משאב]."             |  |  locally per session)             |  |
|                        |  |                                   |  |
|  [EN] "Simulated       |  |  Teacher visibility toggle shown  |  |
|  training patient.     |  |  only if teacher has configured   |  |
|  Real distress?        |  |  "notes visible in evaluation"    |  |
|  Contact [resource]."  |  |                                   |  |
|                        |  +-----------------------------------+  |
+------------------------+                                         |
+------------------------------------------------------------------+
| TURN COUNTER: Turn 12 / 75  |  Soft warning at 60: amber badge  |
+------------------------------------------------------------------+
```

KEY DESIGN DECISIONS:

- Non-verbal cue rendering: inline bracketed tags in the patient message bubble, visually
  distinguished (italics + muted background colour, no icon). These are authored cues from
  the simulation engine; they are part of the patient response, not system messages.

- Welfare signpost: fixed in the inline-end sidebar, always in view regardless of chat scroll
  position. In narrow viewports (tablet portrait), collapses to a persistent icon + one-line
  label that expands on tap; never fully hidden.

- Mic button states:
  State A (ready): microphone icon, neutral colour.
  State B (recording): icon pulses, "Recording..." label, tap-to-stop.
  State C (processing dictation): spinner, "Transcribing...".
  State D (result ready): transcribed text appears in editable field; student reviews + sends.
  State E (mic unavailable / fallback): icon greyed out, tooltip "Mic unavailable -- type below".
  State E is set at session start (readiness check) and persists; student cannot re-enable
  without reloading (which prompts session resume flow).

- Timer: block-start header. Configurable display (none / countdown / elapsed). In formative
  mode, timer reaching zero shows a soft prompt: "Time suggested -- continue or end session."
  No hard cut in pilot-minimal (confirmed formative mode).

- Help button: always in header. Opens deterministic support overlay (see section 5).
  Support overlay has NO access to patient transcript or case state.

- Finish button: always in header. Opens Finish Confirmation modal (see section 1A flow).

- AI response delay state: after student sends, patient response area shows a typing indicator
  (three-dot animation) for up to 8 seconds. If >8 s, typing indicator changes to "Patient
  is thinking..." label. At 20 s, shows "Taking a moment -- please wait." At 45 s, shows
  error recovery (see section 4).

### 2B. Student Feedback Screen

```
+------------------------------------------------------------------+
| FEEDBACK HEADER (sticky)                                        |
|  "Session feedback -- [Simulation title]"                       |
|  Label (always): "Formative indicator -- not an official grade" |
|  "Simulated training patient -- educational feedback"           |
+------------------------------------------------------------------+
|                                                                  |
|  OVERALL SUMMARY CARD (block-start, full width)                  |
|  +----------------------------------------------------------+   |
|  |  Formative summary: [1-3 sentences, plain language]      |   |
|  |  Suggested focus areas: [bullet list, 1-3 items]         |   |
|  +----------------------------------------------------------+   |
|                                                                  |
|  CRITERION SCORES PANEL (~60% inline-size, inline-start)        |
|  +----------------------------------------------------------+   |
|  | Criterion ID + label (in active language)   Score  Bar   |   |
|  |                                                          |   |
|  | C-001 [HE/EN label]: Alliance / empathy      7 / 10 |==| |   |
|  | C-002: Open questions                         5 / 10 |=| |   |
|  | C-003: Functional analysis                    8 / 10 |==| |   |
|  | C-004: Risk awareness  [FORMATIVE - see below] 6/10 |=| |   |
|  |                                                          |   |
|  | Each row is interactive: click -> expands detail         |   |
|  | Detail shows:                                            |   |
|  |   - Score rationale (2-3 sentences)                      |   |
|  |   - Transcript evidence: "Turn 17: [quoted excerpt]"     |   |
|  |     Click quote -> highlights that turn in transcript    |   |
|  |   - Strengths: "You used open questions here effectively" |   |
|  |   - Growth area: "Consider exploring the emotion further" |   |
|  |   - Suggested phrasing: "[example alternative response]" |   |
|  |                                                          |   |
|  | Risk awareness criterion always carries:                  |   |
|  |   yellow badge "Formative -- your lecturer will review   |   |
|  |   this score before it is treated as official"           |   |
|  +----------------------------------------------------------+   |
|                                                                  |
|  TRANSCRIPT PANEL (~40% inline-size, inline-end, scrollable)   |
|  +----------------------------------------------------------+   |
|  | Full session transcript                                   |   |
|  | Highlighted turns:                                        |   |
|  |   Green outline = strong moment                          |   |
|  |   Amber outline = missed opportunity                     |   |
|  |   Red outline = risk / ethics flag                       |   |
|  | Clicking highlight opens tooltip with criterion link      |   |
|  +----------------------------------------------------------+   |
|                                                                  |
|  DEBRIEF ENTRY (block-end, full width)                          |
|  +----------------------------------------------------------+   |
|  |  "Want to explore your session further?"                  |   |
|  |  "Start debrief chat -- educational supervisor"          |   |
|  |  [Button: Begin debrief]   [Button: Return to dashboard] |   |
|  +----------------------------------------------------------+   |
|                                                                  |
+------------------------------------------------------------------+
```

KEY DESIGN DECISIONS:

- Criterion IDs are always shown alongside the label. If the UI language changes, the ID
  stays the same; only the label translates. Scores are numeric; no language-specific
  score strings.

- Risk-awareness criterion (C-004 in this example) is visually distinguished from the
  start: yellow left-border (logical inline-start border), "FORMATIVE" badge, cannot
  be dismissed by the student. This is a Sami/SME requirement.

- Suggested phrasing: presented as an example, not a "correct answer." Label above it
  reads "Example alternative phrasing (not the only valid response)."

- Transcript and criteria panels are linked: click any transcript turn -> nearest
  criterion row pulses. Click criterion evidence link -> transcript scrolls.

- On narrow viewports: panels stack (criteria above; transcript below, collapsible).

### 2C. Teacher Class Dashboard

```
+------------------------------------------------------------------+
| DASHBOARD HEADER (sticky)                                        |
|  [College name] > [Course name]    [Assignment selector dropdown]|
|  Teacher: [name]   Last updated: [timestamp]   [Export] [Help]  |
+------------------------------------------------------------------+
|                                                                  |
|  ROW 1 -- SUMMARY STATS (full width, 3 stat cards side by side) |
|  +-----------+ +------------------+ +-------------------------+ |
|  | Enrolled  | | Completed        | | Flagged for review      | |
|  |    28     | |   19 / 28 (68%)  | |   3 attempts            | |
|  |           | | +progress bar+   | | 2 technical / 1 welfare | |
|  +-----------+ +------------------+ +-------------------------+ |
|                                                                  |
|  ROW 2 -- RUBRIC HEATMAP (full width)                           |
|  Criteria (IDs + labels) as columns; students as rows           |
|  Cell colour: green (>=8), amber (5-7), red (<5), grey (no data)|
|  Column header: criterion ID + short label                       |
|  Row = student (first name + last initial, or anonymised ID)     |
|  Hover on cell -> tooltip: "Student X, C-002: 5/10"             |
|  Click on cell -> opens attempt review for that student/criterion|
|  Sort column: click criterion header -> sorts rows by that score |
|  Empty state: "No completed attempts yet"                        |
|                                                                  |
|  ROW 3 -- SCORE DISTRIBUTION (inline-start ~50%) + CLASS LIST  |
|  Score distribution: horizontal bar chart (per criterion)        |
|  X-axis: 0-10; Y-axis: student count                            |
|  Toggle: "Show per criterion" / "Show overall"                  |
|  (No radar charts or advanced charts in pilot-minimal)          |
|                                                                  |
|  CLASS LIST (inline-end ~50%):                                   |
|  Columns: Student | Status | Score (overall) | Actions           |
|  Status options: Not started / In progress / Completed /         |
|    Technically affected / Flagged                                |
|  Actions: [Review] | [Retry authorise] (if technically affected) |
|  "Technically affected" row: amber row background + icon         |
|  Filter bar: All / Completed / Not started / Flagged            |
|                                                                  |
|  FLAGGED ATTEMPTS QUEUE (block-end, collapsible, full width)    |
|  Shows attempts where: technical issue confirmed, risk flag      |
|  raised, or override pending                                     |
|  Each row: student + flag type + brief description + [Review]    |
|                                                                  |
+------------------------------------------------------------------+
```

KEY DESIGN DECISIONS:

- Heatmap is the primary tool for pattern recognition (class-wide criterion weakness).
  Score distribution chart is secondary for overall distribution.

- Student names: shown to the teacher (in scope). Not shown in any export shared outside
  the course hierarchy. Anonymisation setting available for group review sessions (future).

- "Technically affected" status is visually distinguished (amber) to draw teacher action.
  Retry authorisation is one click from the class list; it opens a confirm modal with
  the academic safety flow (APS-REQ-119).

- Welfare flag (Flag Type B) is distinct from technical/academic flag (Flag Type A).
  Welfare-flagged row uses a red left border (logical inline-start) vs amber for technical.
  Welfare flags route to: "Contact your institutional welfare resource for [student name]"
  -- not to the teacher's grading flow. The platform does not own the welfare response;
  it creates the routing hook.

- No credit balance shown on teacher dashboard. Credit is admin-only (APS-REQ-145).

### 2D. Teacher Attempt Review Screen

```
+------------------------------------------------------------------+
| REVIEW HEADER (sticky)                                           |
|  < Back to class dashboard   [Student: Synthetic Student A]      |
|  [Assignment: intake simulation v1]   [Attempt: 2026-09-05]     |
|  "Simulated training patient -- educational assessment"          |
+------------------------------------------------------------------+
|                                                                  |
|  EVALUATION PANEL (~50% inline-size, inline-start)              |
|  +----------------------------------------------------------+   |
|  |  AI EVALUATION (draft -- pending your review)            |   |
|  |                                                          |   |
|  |  Overall formative summary: [text]                       |   |
|  |                                                          |   |
|  |  CRITERION SCORES (teacher view = student view + more):  |   |
|  |  Each criterion:                                         |   |
|  |    ID + label | AI draft score | Override field          |   |
|  |    Rationale (2-3 sentences)                             |   |
|  |    Evidence: "Turn 17: [excerpt]" -- click to jump       |   |
|  |    Teacher-only note: [patient state at that turn]       |   |
|  |                                                          |   |
|  |  Risk-awareness criterion:                               |   |
|  |    [FORMATIVE -- MANDATORY REVIEW]                       |   |
|  |    Yellow section; cannot save without teacher action:   |   |
|  |    Radio: "Accept AI score" | "Override" | "Flag for     |   |
|  |    supervision" | "Mark as welfare concern (Type B)"     |   |
|  |                                                          |   |
|  |  OVERRIDE SECTION (each criterion, collapsible):         |   |
|  |    Revised score: [number input, 0-10]                   |   |
|  |    Reason (required field if overriding): [text area]    |   |
|  |    Audit: "Override will be recorded with your name,     |   |
|  |    date, and reason."                                    |   |
|  |                                                          |   |
|  |  TEACHER COMMENTS:                                       |   |
|  |    Private note (not shown to student in v1): [text area]|   |
|  |                                                          |   |
|  |  [Save evaluation]  [Return without saving]              |   |
|  +----------------------------------------------------------+   |
|                                                                  |
|  TRANSCRIPT PANEL (~50% inline-size, inline-end, scrollable)   |
|  +----------------------------------------------------------+   |
|  | Full session transcript                                   |   |
|  | Student messages + patient responses + NV cue tags        |   |
|  | Highlights same as student feedback view:                 |   |
|  |   Green / Amber / Red per criterion evidence              |   |
|  | Teacher-only annotations:                                 |   |
|  |   Patient state at that turn (trust/openness/etc.)       |   |
|  |   shown as collapsed info strip under patient bubble     |   |
|  |   "Patient state: Trust 4/10 | Openness 3/10 | ..."      |   |
|  |   Expand on click                                        |   |
|  |                                                          |   |
|  | Language toggle if student conducted in Hebrew:           |   |
|  |   [View in Hebrew] | [View translated]                   |   |
|  |   Translated view carries label: "Machine translation --  |   |
|  |   verify critical clinical terms in original"            |   |
|  +----------------------------------------------------------+   |
|                                                                  |
+------------------------------------------------------------------+
```

KEY DESIGN DECISIONS:

- Teacher sees patient state strip under each patient turn. This is a teacher-only view;
  never exposed in the student feedback screen.

- Risk-awareness criterion mandates teacher action before the evaluation can be saved.
  The four radio options map to: affirm AI draft / correct score / escalate internally /
  raise welfare concern. The welfare concern option triggers a Flag Type B workflow --
  it does not change the academic score; it opens the welfare routing pathway.

- Override reason field is required when overriding. The audit trail is explicit and
  visible to the teacher at the point of action (not hidden in logs).

- Translation disclaimer is persistent when viewing a translated transcript. It cannot
  be dismissed.

---

## 3. Hebrew RTL + Bilingual Design Requirements

### 3.1 Layout Mirroring

All component layouts use CSS logical properties throughout:
- `margin-inline-start` / `margin-inline-end` (not `margin-left` / `margin-right`)
- `padding-block-start` / `padding-block-end`
- `border-inline-start` (for left-border accent on status rows in LTR; right-border in RTL)
- `text-align: start` (not `text-align: left`)
- `float: inline-start` (never `float: left`)
- `direction: rtl` set on `<html>` for Hebrew sessions; `direction: ltr` for English.

Flex and grid containers: do NOT use `flex-direction: row-reverse` to fake RTL. Use
`direction: rtl` on the container so `flex-direction: row` behaves correctly.

The global `dir` attribute is set at the `<html>` level based on the active UI language.
Individual mixed-direction strings (a Hebrew sentence containing an English term) use the
Unicode bidi algorithm with explicit `<bdi>` or `dir="ltr"` spans for embedded LTR content
(English acronyms, numeric scores, competency IDs).

Reference: hebrew-rtl-best-practices skill (globally installed, v1.3.0).

### 3.2 Language Switch

Language switch is available in two places:
a. Readiness check (before session starts): this sets the session language. Cannot be changed
   mid-session without ending the current attempt.
b. Teacher dashboard header: teachers can switch their UI display language at any time.
   Dashboard content (rubric labels, criterion names) re-renders in the selected language.
   Transcript display language has its own toggle (see 2D above).

Session language is stored on the Attempt record. The language under which a student
conducted the session is visible to the teacher in the attempt review header.

### 3.3 Competency IDs and Scores Are Language-Independent

Competency IDs and rubric criterion IDs (e.g., "C-001") are always displayed alongside their
label. The ID never changes regardless of language. If a teacher switches from Hebrew to English
view, the ID stays the same; only the label text translates. This ensures cross-language
comparability in analytics and audit without ambiguity.

Score values (e.g., "7 / 10") are numeric only. No language-specific phrasing is embedded
in the score display itself.

### 3.4 Typography and Font Stack

Hebrew font stack (in order of preference, all free/open licence -- MUST confirm at gate):
- Primary: system font stack via `-apple-system` + `Arial` for Hebrew characters.
- Do not use a paid or unlicensed Hebrew font without Perry's A1 and a Security + Legal gate.
- Flag to Perry before any paid Hebrew font is considered.

English font: inherit system stack.

Line height for Hebrew: minimum 1.6 for body text. Hebrew characters have ascenders/descenders
that require more vertical space than Latin equivalents. Do not use line-height below 1.5
in Hebrew UI strings.

Text overflow in RTL: ellipsis truncation direction must be at the inline-end (visual right
in RTL = logical end). Test all truncated labels in Hebrew to confirm ellipsis appears at
the correct end.

### 3.5 Numeric Input in RTL

Numeric input fields (score overrides, turn counters, timer displays) use `dir="ltr"` on
the field itself regardless of page direction. Numbers in Hebrew context read left-to-right.
This is a standard Hebrew UX convention; deviate only if clinical context requires otherwise.

### 3.6 Mixed-Language Strings (Clinical Terminology)

Students and teachers frequently mix Hebrew and English clinical terms in the same sentence
(e.g., "ACT" or "CBT" embedded in a Hebrew sentence, or "case conceptualization" used in
English by Hebrew-speaking students). The chat display must handle mixed-direction strings
gracefully using Unicode bidi and `<bdi>` wrappers. Test with representative mixed strings
before Sprint 3 ends.

---

## 4. Accessibility + States

### 4.1 Loading States

a. Initial auth / session load:
   - Branded loading screen with spinner and text: "Loading session..." / "...טוען את
     ההפעלה"
   - No blank page; no unformatted HTML flash.

b. AI patient response loading (per turn):
   - Typing indicator in patient bubble: three-dot animation.
   - Screen reader label: "Patient is composing a response" (aria-live="polite").
   - At 8 s: text label "Patient is thinking..."
   - At 20 s: text label "Taking a moment -- please wait."
   - At 45 s: error recovery trigger (see 4.3).

c. Evaluation pipeline (post-session):
   - Full-screen processing screen (not overlay).
   - "Preparing your feedback..." with indeterminate spinner.
   - Progress is not deterministic; do not show a false progress bar.
   - Welfare signpost remains visible on this screen.

d. Dashboard data load:
   - Skeleton screens (grey placeholder shapes for heatmap rows and stat cards).
   - Data populates in-place without layout shift.

### 4.2 AI Response Delay (full state sequence)

```
Student sends message
  -> immediately: typing indicator in patient bubble
  -> 0-8 s: "Patient is typing..." (default)
  -> 8-20 s: "Patient is thinking..."
  -> 20-45 s: "Taking a moment -- please wait."
  -> 45 s: display error recovery:
     "The patient is taking too long to respond.
      Your conversation is saved.
      Options: [Wait longer] [Retry this message] [End session and review feedback]"
     If retry fails (2nd attempt > 45 s):
     "Unable to continue this session right now.
      Your transcript is saved. You can return to continue.
      [Return to dashboard] [Contact support]"
```

### 4.3 Error / Recovery States

a. Dictation failure (mic denied post-readiness-check):
   - Inline warning under input bar: "Microphone unavailable. Type your response below."
   - Mic button state E (greyed, no interaction).
   - Typed input immediately available -- no reload required.
   - Welfare signpost unaffected.

b. Session interruption / network drop:
   - On reconnect: "Your session was interrupted. Resuming from Turn N..."
   - Turn N is the last successfully persisted turn (APS-REQ-065).
   - If resume fails: "Unable to resume. Your transcript up to Turn N is saved.
     Contact support with reference: [ticket ID if support was triggered]."

c. Evaluation pipeline error:
   - Replace processing spinner with:
     "There was a problem generating your feedback. Your transcript is saved.
      Please try again in a few minutes, or contact your lecturer."
   - [Retry feedback] button: re-triggers evaluation pipeline.
   - [Return to dashboard] button: session appears as "Completed - evaluation pending".

d. Hard credit limit reached (student-facing):
   - Student sees: "This session is temporarily unavailable. Please contact your lecturer."
   - No credit balance or limit details shown to student (APS-REQ-145).
   - Welfare signpost remains visible.

e. Auth / invite-link failure:
   - Specific messages for:
     - "This invite link has expired. Contact your lecturer for a new one."
     - "Access code incorrect. Please check your email or contact your lecturer."
   - No technical error codes exposed to student.

### 4.4 Empty States

a. Teacher dashboard -- no completed attempts yet:
   - Heatmap area: "No completed attempts yet for this assignment."
   - Class list: shows all students with status "Not started."
   - No skeleton confusion; clear empty-state message.

b. Student dashboard -- no sessions yet:
   - "You have not completed any sessions yet. Use your invite link to begin."

c. Debrief -- no questions asked:
   - "Ask a question about your session to begin the debrief."

### 4.5 Accessibility Requirements

- All interactive elements have visible focus indicators (2px outline, contrast ratio >= 3:1
  against background; do not remove `:focus-visible` outlines).
- Welfare signpost: `role="complementary"` + `aria-label` in active language.
- Typing indicator: `aria-live="polite"` region so screen readers announce patient response.
- Colour alone is never the sole differentiator for status:
  - Heatmap cells: colour + numeric value shown.
  - Status badges: colour + text label.
  - Highlight types in transcript: colour + outline pattern (solid green / dashed amber /
    bold red outline) so they are distinguishable without colour alone.
- All form inputs have associated `<label>` elements (not placeholder-only labels).
- Session timer: `aria-live="off"` (polling the timer every second would be disruptive for
  screen reader users); accessible via a static label showing time remaining on focus.
- Language toggle: announces current language to screen reader on change.
- RTL screen readers: test with NVDA (Windows) on Hebrew pages. Logical reading order must
  match visual order in RTL mode.

---

## 5. Information Architecture

### 5.1 Site Map (Pilot-Minimal)

```
[Student entry: invite link]
  /auth                             Landing / access code entry
  /readiness                        Readiness check (lang + mic + instructions)
  /session/:attemptId               Simulation session screen
  /session/:attemptId/finish        Finish confirmation modal (overlay)
  /feedback/:attemptId              Student feedback screen
  /debrief/:attemptId               Debrief chat screen
  /dashboard/student                Student session history

[Teacher entry: direct URL + login]
  /login                            Email + password
  /dashboard/teacher                Class dashboard (course + assignment selector)
  /review/:attemptId                Attempt review screen

[System Admin -- minimal UI in pilot]
  /admin/credit                     Credit allocation + limits per college/course
  /admin/usage                      Usage log view
  /admin/support                    Support ticket queue

[Support flow -- overlay on any screen]
  Triggered by Help button
  Opens deterministic support overlay (not a new page)
  Includes: "Skip to email support" escape hatch at top of overlay
```

### 5.2 Navigation Patterns

Students have a linear flow (invite link -> readiness -> session -> feedback -> debrief ->
student dashboard). There is no global nav for students; back navigation between sections
is via explicit buttons in the UI, not browser back. Browser back during an active session
shows a modal: "Navigating away will not lose your session. Continue?" -- because the session
auto-saves.

Teachers have a two-level nav: course/assignment selector in the dashboard header
(persistent) + drill-down to attempt review. Breadcrumb shown on attempt review screen.

### 5.3 Minimal Component Inventory

The following components are required for build. Names are logical/semantic; implementation
naming is Gal's call.

AUTH + ONBOARDING COMPONENTS:
- AccessCodeForm: invite-link landing with email + access-code fields + error states.
- ReadinessWizard: multi-step (language select -> mic test -> instructions + acknowledgement).
- MicTest: browser media device API, animated waveform, fallback messaging.
- InstructionsPanel: markdown-rendered simulation instructions + welfare signpost (first).

SIMULATION COMPONENTS:
- SessionHeader: sticky; title + timer + Help + Finish + simulation boundary label.
- ChatArea: scrollable message list; anchored to block-end on new message.
- PatientBubble: patient message + NV cue tag rendering + typing indicator states.
- StudentBubble: student message display.
- NonVerbalCueTag: inline tag within PatientBubble; visually distinct (italic + muted bg).
- InputBar: text field + mic button (all states A-E) + send button; sticky block-end.
- WelfareSignpost: persistent block (sidebar); role="complementary"; bilingual.
- TurnCounter: turn used / max with soft-warning state.
- NotesPanel: collapsible sidebar; ACT/LI-CBT section fields; auto-save indicator.
- FinishModal: confirm + turn/time summary + low-turn warning.
- ProcessingScreen: full-screen; spinner; welfare signpost; delay messaging.

FEEDBACK + DEBRIEF COMPONENTS:
- FeedbackHeader: sticky; title + formative label + boundary label.
- SummaryCard: overall formative summary + suggested focus list.
- CriterionRow: expandable; ID + label + score bar + rationale + evidence links.
- EvidenceLink: click -> scrolls + highlights transcript turn.
- TranscriptPanel: scrollable; turn-by-turn display; highlight states (green/amber/red).
- HighlightTooltip: on hover/tap; criterion label + action link.
- SuggestedPhrasingBlock: example text with disclaimer label.
- DebriefChat: AI supervisor chat; question counter; end debrief action.

TEACHER DASHBOARD COMPONENTS:
- CourseAssignmentSelector: dropdown/tabs in header; persistent across dashboard views.
- SummaryStatCards: 3-card row; enrolled / completed / flagged.
- RubricHeatmap: criteria x students; colour coding + numeric; click-to-review.
- ScoreDistributionChart: horizontal bar chart; criterion toggle.
- ClassList: filterable table; status badges; action buttons; technically-affected
  row highlight.
- FlaggedQueue: collapsible panel; flag type A vs B visual distinction; welfare routing.
- RetryAuthoriseModal: confirm modal for academic safety retry (APS-REQ-121).

TEACHER REVIEW COMPONENTS:
- ReviewHeader: sticky; breadcrumb; assignment + student + attempt context.
- EvaluationPanel: AI draft scores; criterion rows; override fields; risk criterion
  mandatory-action block; teacher comment field; save action.
- OverrideSection: per criterion; score input + required reason field + audit notice.
- RiskCriterionBlock: mandatory-action radio (accept / override / flag / welfare); yellow
  treatment; cannot save without action.
- PatientStateStrip: collapsed info strip under patient bubble (teacher-only).
- TranslationToggle + TranslationDisclaimer: for Hebrew sessions in teacher review.

SHARED / UTILITY COMPONENTS:
- WelfareSignpost (reused from simulation, adapted for other screens where required).
- SupportOverlay: deterministic troubleshooting; triggered by Help button; isolated from
  patient context; skip-to-email escape hatch at block-start.
- SupportTicketConfirm: ticket ID + who notified + expected response + continue option.
- LanguageToggle: sets page dir + label language; announces to screen reader.
- StatusBadge: colour + text; not colour alone.
- LoadingSkeleton: placeholder layout for data-loading states.

---

## 6. Design Flags and Open Items for Perry / Gal

FLAG 1 (HIGH -- welfare, before build):
The welfare signpost text references "[institutional welfare resource]" as a placeholder.
The actual resource name, contact method, and link for Gome Gevim College must be provided
by the institution before go-live. This is a named field in the simulation assignment
configuration. It cannot default to a generic URL. Route to Perry -> Adam (via owner relay)
to confirm the welfare point-of-contact (per Q-WELFARE in feasibility-ido.md).

FLAG 2 (HIGH -- Hebrew font, Sprint 1):
No paid Hebrew font has been adopted. Current spec uses system font stack. If the design
requires a specific Hebrew typeface beyond system fonts, Perry A1 and a Security + Legal gate
are required before adoption. Flag to Perry before Sprint 2 begins.

FLAG 3 (MEDIUM -- non-verbal cue rendering, Sprint 2):
The NV cue tag design (italic + muted background) is described at a concept level. Specific
colour tokens need to be defined in Sprint 2 when the component system is started. Colours
must meet WCAG AA contrast (4.5:1 for text; 3:1 for UI components) in both light and any
future dark mode. Gal to confirm colour system in Sprint 2.

FLAG 4 (MEDIUM -- dictation Hebrew accuracy, Sprint 3):
Voice dictation for Hebrew clinical speech is an open assumption (feasibility-ido.md).
The UX fallback (typed input) is fully specified. However, the microphone state label copy
("Recording...", "Transcribing...") must be reviewed in Hebrew by a native speaker before
go-live. Route to Perry for a Hebrew copy review task.

FLAG 5 (LOW -- notes panel visibility default, Sprint 2):
The notes panel (ACT/LI-CBT workspace) is teacher-controlled for evaluation visibility
(APS-REQ-053: "visibility in evaluation is teacher-controlled"). The default state (visible
or hidden to teacher) is a teacher setting at assignment level, not a student setting. The
default value for the pilot needs a decision from Perry / Adam. This spec assumes the default
is "not visible to teacher" unless explicitly enabled.

FLAG 6 (LOW -- student dashboard scope, Sprint 3):
The student dashboard is specified in the IA but not wireframed in detail here. Pilot-minimal
scope (APS-REQ-089 subset): completed simulations list, criterion feedback links, debrief
history. This is a simple list view; no advanced chart. Gal can implement directly from the
IA + component inventory without a separate wireframe pass unless Perry requests one.

---

*Internal design artifact. Produced by Tal (Designer). Next step: Perry review; then
handoff brief to Gal for Sprint 1 implementation. No external sharing without owner A1.*
