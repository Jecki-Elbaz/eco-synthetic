# APS 15-Aug Rehearsal Runbook
# Self-Sufficient Owner-Executable Tester Script
# Author: Adi (QA Engineer) | Sprint 9 S9-ADI-RUNBOOK | 2026-07-14
# Rehearsal date: 2026-08-15 | Decision owner: Ido (VP R&D)
# DO NOT cross-reference other documents on rehearsal day.
# This file is the single source of truth.

---

## STUBPROVIDER CAVEATS -- read before starting

This rehearsal runs entirely on StubProvider (no real LLM). 0/10 scores for criteria
(a)/(c)/(d) are COSMETIC -- they do not indicate a pipeline failure. Clinical quality
(real LLM) is a SEPARATE gate, not in this plan.

| Criterion | Testable on StubProvider? | Implication |
|-----------|---------------------------|-------------|
| (a) patient state coherence | STRUCTURAL ONLY | PatientStateLog rows written, pipeline runs; response quality not evaluable |
| (b) ground-truth guard fires | STRUCTURAL ONLY | Guard code path runs; verdict accuracy NOT testable |
| (c) analyser accuracy | STRUCTURAL ONLY | Call runs, scores recorded; 70% accuracy bar deferred to real-model rehearsal |
| (d) evaluation coherence | STRUCTURAL ONLY | Pipeline completes; scores are 0/10 (COSMETIC -- not a failure) |
| (e) session resume | FULLY TESTABLE | DB state persistence; model-independent |
| (f) credit hard-limit | FULLY TESTABLE | DB credit logic; model-independent |
| (g) support isolation | FULLY TESTABLE | Deterministic module; no LLM call |
| (h) 3-session arc coherence | FULLY TESTABLE | Arc state in DB; all invariants verifiable |
| (i) author-preview | FULLY TESTABLE | Pipeline and DB; model-independent |

---

## PRE-DAY CHECKLIST (complete before 09:00 on 2026-08-15)

- [ ] Machine powered on; no pending OS updates or restarts during the day
- [ ] Docker Desktop running; PostgreSQL container healthy
- [ ] DATABASE_URL in project .env.local points to DEVELOPMENT database (NOT production)
- [ ] Browser: fresh window, no prior session cookies (Chrome or Firefox)
- [ ] Evidence folder exists on disk: projects/ai-patient-simulator/docs/rehearsal-evidence-15aug/
      (Adi creates this in dress run R3; verify it exists before 09:00)
- [ ] Note-taking tool ready (paper or local text file) for recording DB query results
- [ ] OAuth / Google credentials NOT needed -- StubProvider only
- [ ] API terminal window ready to stay visible all day (do not close or minimize it)

---

## SECTION 1 -- ENVIRONMENT RESET PROCEDURE

Run ONCE at 09:00. If a mid-day re-seed is needed (e.g. after (f) leaves dirty credit state),
repeat from step 3 onwards and re-verify step 4.

### Step 1 -- Boot API in dev/debug mode

```
pnpm --filter @aps/api dev:boot
```

Leave this terminal OPEN AND VISIBLE all day. Arc-context and guard-prompt logging are
enabled in dev mode. All API console output must remain visible for evidence capture.

### Step 2 -- Confirm API is responding

```
curl -s http://localhost:3001/auth/me
```

Expected: HTTP 401 (no token -- correct). If curl is unavailable, open
http://localhost:3001/auth/me in a browser tab and expect a 401 or JSON error body.
Do not proceed until the API is confirmed responsive.

### Step 3 -- Re-seed the development database

```
pnpm --filter @aps/db seed
```

The seed is idempotent. It deletes and recreates all Attempt rows and their children for
the seeded assignment, then recreates the SimulationTemplate (same fixed ID). Because the
template is deleted and recreated, any ArcSessionSummary rows linked by templateId via
cascade should also be cleared. Watch the terminal for:

  [seed] Done.

and the SYNTHETIC TEST CREDENTIALS block printed at the end (credentials reproduced in
Section 2 below for quick reference; no need to copy from terminal).

### Step 4 -- Verify seed state

Connect to the development PostgreSQL database (psql, TablePlus, or any Postgres client).
Run the following queries and confirm all expected values:

```sql
-- Template and assignment exist
SELECT id, title, "challengeLevel"
FROM "SimulationTemplate"
WHERE id = 'seed-tpl---0001-0000-0000-000000000001';
-- Expected: 1 row, title = "GAD Intake -- Pilot Case 01", challengeLevel = 2

SELECT id, "maxAttempts", "maxTurns"
FROM "Assignment"
WHERE id = 'seed-asgn--0001-0000-0000-000000000001';
-- Expected: 1 row, maxAttempts = 2, maxTurns = 50

-- RubricVersion is PUBLISHED (rubricProvisional = false)
SELECT id, status
FROM "RubricVersion"
WHERE id = 'seed-rv----0001-0000-0000-000000000001';
-- Expected: status = PUBLISHED

-- CreditLedger has ample balance
SELECT id, balance, "softLimit", "hardLimit"
FROM "CreditLedger"
WHERE id = 'seed-ledg--0001-0000-0000-000000000001';
-- Expected: balance = 100000, softLimit = 20000, hardLimit = 2000

-- CRITICAL: ArcSessionSummary must be zero for all rehearsal students
SELECT COUNT(*)
FROM "ArcSessionSummary"
WHERE "userId" IN (
  'seed-user---0004-0000-0000-000000000004',
  'seed-user---0005-0000-0000-000000000005',
  'seed-user---0006-0000-0000-000000000006'
);
-- Expected: COUNT = 0
-- If COUNT > 0: manually delete these rows before proceeding:
--   DELETE FROM "ArcSessionSummary"
--   WHERE "userId" IN (
--     'seed-user---0004-0000-0000-000000000004',
--     'seed-user---0005-0000-0000-000000000005',
--     'seed-user---0006-0000-0000-000000000006'
--   );
-- Re-run the COUNT query to confirm 0 before continuing.
```

NAMING NOTE: the seed creates college name "Gome Gevim -- pilot". The rehearsal plan
document says "Gome Gevim Rehearsal". These refer to the same seeded college; use the
seeded name for any queries. The discrepancy is a documentation artifact only.

CREDIT NOTE: the rehearsal plan document says "50 credits." The seed creates
balance = 100000 with hardLimit = 2000, providing ample credit for all sessions.
Disregard the "50 credits" description.

---

## SECTION 2 -- SEED CREDENTIALS (all synthetic, local-only, verified from seed.mjs)

### rehearsal-admin (SYSTEM_ADMIN)
  Login method: email + password
  Email:        admin@synthetic.test
  Password:     AdminPass!re3
  User ID:      seed-user---0001-0000-0000-000000000001
  Login URL:    http://localhost:3000/login  (VERIFY-ON-DAY: exact login page path)

### rehearsal-teacher (TEACHER -- course CC-Y2-PILOT)
  Login method: email + password
  Email:        teacher1@synthetic.test
  Password:     TeacherPass1!re3
  User ID:      seed-user---0002-0000-0000-000000000002
  Login URL:    http://localhost:3000/login

### rehearsal-student-01 (STUDENT -- primary: criteria a/b/c/d/g/h + i visibility check)
  Login method: invite token + access code
  Invite token: invite-tok-student-01-re3
  Access code:  code-s01-re3
  User ID:      seed-user---0004-0000-0000-000000000004
  Login URL:    VERIFY-ON-DAY (likely /invite/invite-tok-student-01-re3 or a login page
                that accepts invite token + access code)

### rehearsal-student-02 (STUDENT -- criterion e: interrupt-resume)
  Invite token: invite-tok-student-02-re3
  Access code:  code-s02-re3
  User ID:      seed-user---0005-0000-0000-000000000005

### rehearsal-student-03 (STUDENT -- criterion f: credit block test)
  Invite token: invite-tok-student-03-re3
  Access code:  code-s03-re3
  User ID:      seed-user---0006-0000-0000-000000000006

### Fixed IDs needed for DB queries
  Assignment:    seed-asgn--0001-0000-0000-000000000001
  Template:      seed-tpl---0001-0000-0000-000000000001
  CreditLedger:  seed-ledg--0001-0000-0000-000000000001
  Course:        seed-course--0001-0000-0000-000000000001

### Student routing rationale
  Student-01 completes all 3 arc sessions during criteria (a)-(d) and (h) by ~13:00.
  After that, any new attempt-create for student-01 returns 403 ARC_COMPLETE.
  Criteria (e) and (f), scheduled at 13:30 and 14:00, require creating new sessions;
  they therefore use student-02 and student-03 (both clean on a fresh seed).

---

## SECTION 3 -- DEV-LOGGING PREREQUISITE CHECK (Oren i-4)

Run this check at 09:30 as part of starting criterion (g). The guard-prompt log is required
to verify criterion (g) and invariant 2 of criterion (h). Without it, evidence for those
two criteria is behavioral-only and weaker.

Steps:
  1. Login as rehearsal-student-01 (invite token flow).
  2. Start a new simulation session on the seeded template (this is arc session 1).
  3. Send one turn: "שלום, כיצד אתה מרגיש היום?"
  4. In the API console (dev:boot terminal), search for a log line containing
     "buildGuardPrompt" or the guard-logger prefix in use (e.g. "GuardRunner",
     "guard-prompt", or similar). Scroll the console to find it.

PASS: guard-prompt log line is visible. Continue with criterion (g) in this same session.

STOP condition: if NO guard-prompt log line is visible after the test turn --
  Do NOT proceed with criterion (g) or criterion (h) invariant 2 evidence.
  Flag to Ido immediately with: the full API console output, the exact turn text sent,
  and the absence of any guard log line.
  Ido decides whether to resolve same-day or adjust the evidence requirement.

---

## SECTION 4 -- DAY SCHEDULE (2026-08-15)

09:00  Environment reset -- dev:boot, seed, verify (Sections 1-2)
09:30  Criterion (g) support isolation -- student-01 starts arc session 1 here;
       dev-logging prereq check (Section 3) runs within this block
10:00  Criteria (a)/(b)/(c)/(d) -- student-01, arc session 1 continued (5+ turns, finish,
       teacher evaluation, student debrief)
       NOTE: the 09:30 and 10:00 blocks are ONE continuous arc session for student-01.

11:15  TIME CHECKPOINT (Oren i-5):
         If the 10:00 block (arc session 1 + criterion (d) teacher override) is NOT
         finished by 11:15, shift the ENTIRE (h) block to a later slot.
         NEVER split arc sessions 2 and 3 across a break. Both must run contiguously.

11:30  Criterion (h) arc sessions 2 and 3 -- student-01, contiguous, no break between them.
       Both sessions 2 and 3 run in sequence in the same browser before any lunch break.
       Estimated: 60-90 minutes.
13:30  Criterion (e) interrupt-and-resume -- student-02
14:00  Criterion (f) credit hard-limit -- student-03 (admin sets hardLimit=0 first;
       reset hardLimit to 2000 after test)
14:30  Criterion (i) author-preview -- teacher-01 preview, student-01 visibility, admin credit
15:30  Ido reviews all evidence packages in rehearsal-evidence-15aug/
17:00  GO/NO-GO ruling delivered to Eco

---

## SECTION 5 -- ROLE-SWITCH PROTOCOL (Oren i-5)

Use a SINGLE browser tab for all role switches throughout the day.

For each role switch:
  1. Click logout (navigate to http://localhost:3000/logout or use the logout button in the UI).
  2. If the login page does not appear automatically: clear session cookies and local storage.
     Browser dev tools (F12) -> Application tab -> Storage -> Clear site data.
  3. Login with the target role's credentials:
       - Teacher / Admin: email + password at http://localhost:3000/login
       - Student:         invite token + access code at the invite login URL
  4. Confirm the correct role's landing page loads before taking any screenshot:
       - Student:  student dashboard (URL contains /student/<userId>)
       - Teacher:  authoring or teacher UI (URL contains /authoring or /teacher)
       - Admin:    admin panel (URL contains /admin)
  5. ONLY AFTER the correct landing page is confirmed: take the evidence screenshot.

Criterion (i) role-switch order (3 switches):
  Switch 1: logout (from whatever role) -> login as rehearsal-teacher
             (run preview; view transcript and DRAFT eval)
  Switch 2: logout teacher -> login as rehearsal-student-01
             (confirm no preview in dashboard)
  Switch 3: logout student -> login as rehearsal-admin
             (confirm credit balance unchanged)
  Record the URL of the confirmed landing page at each switch in your notes.

---

## SECTION 6 -- EVIDENCE-CAPTURE TEMPLATES

Save ALL evidence files to:
  projects/ai-patient-simulator/docs/rehearsal-evidence-15aug/

Naming convention:  rehearsal-evidence-<criterion>-<type>-<detail>.<ext>

Full list of expected evidence files:

  rehearsal-evidence-a-patientstatelog-rowcount.png      (DB query output)
  rehearsal-evidence-a-server-log-no-exception.txt       (API console copy, no crash)
  rehearsal-evidence-a-completed-session.png             (screenshot)
  rehearsal-evidence-b-patientstatelog-guardverdict.png  (DB query, guardVerdict non-null)
  rehearsal-evidence-c-patientstatelog-analyseroutput.png (DB query, analyserOutput non-null)
  rehearsal-evidence-d-student-feedback-view.png         (student sees criteria + scores)
  rehearsal-evidence-d-teacher-override-save.png         (override saved, no error)
  rehearsal-evidence-e-resumed-session-prior-turns.png   (3 prior turns + timer visible)
  rehearsal-evidence-f-first-turn-blocked.png            (blocked turn in UI)
  rehearsal-evidence-g-support-response-no-patient-data.png
  rehearsal-evidence-g-support-prompt-log.txt            (API console lines at support call time)
  rehearsal-evidence-h-arcsessionsummary-after-s1.png    (DB query, 1 row, trust values)
  rehearsal-evidence-h-welfare-modal-session2.png        (modal visible, input disabled)
  rehearsal-evidence-h-gap-briefing-session2.png         (briefing visible after ack)
  rehearsal-evidence-h-guard-prompt-session2-log.txt     (API console, guard prompt for s2 turn)
  rehearsal-evidence-h-arcsessionsummary-after-s2.png    (DB query, 2 rows)
  rehearsal-evidence-h-arcloader-session2-log.txt        (ArcLoaderService log at s2 start)
  rehearsal-evidence-h-welfare-modal-session3.png
  rehearsal-evidence-h-gap-briefing-session3.png
  rehearsal-evidence-h-arcloader-session3-log.txt        (ArcLoaderService log at s3 start)
  rehearsal-evidence-h-arcsessionsummary-after-s3.png    (DB query, 3 rows, ceilings confirmed)
  rehearsal-evidence-h-arc-cap-403.png                   (network tab, 403 ARC_COMPLETE)
  rehearsal-evidence-i-credit-balance-before.png
  rehearsal-evidence-i-preview-result-teacher-view.png
  rehearsal-evidence-i-student-dashboard-no-preview.png
  rehearsal-evidence-i-credit-balance-after.png

For .txt files: copy-paste the relevant lines from the API console.
For .png files: use the OS screenshot tool; include the browser URL bar in the shot.

---

## SECTION 7 -- PER-CRITERION TESTER SCRIPTS

---

### CRITERION (a) -- Patient state coherence (STRUCTURAL PASS)

**Purpose:** Confirm the turn pipeline runs end-to-end, PatientStateLog rows are written
per turn, and no uncaught exception appears in the API console.

**StubProvider caveat:** Response quality not evaluable. 0/10 scores cosmetic.
STRUCTURAL PASS only.

**CREDENTIALS:**
  rehearsal-student-01 (invite-tok-student-01-re3 / code-s01-re3)
  NOTE: this criterion runs as CONTINUATION of arc session 1 started at 09:30 for (g).
  Do not create a new session.

**CLICKS/COMMANDS:**
  1. Confirm you are logged in as student-01 in arc session 1 (same browser tab from 09:30).
     The session was started during the (g) / dev-logging block.
  2. Send 5 or more turns (type any conversational or clinical messages):
       "שלום, איך אתה מרגיש היום?"
       "ספר לי עוד על מה שאתה חווה"
       "מתי התחילו הסימפטומים?"
       "האם קיבלת טיפול בעבר?"
       "ספר לי על חייך ביום יום"
     Include at least 1 turn referencing a clinical detail NOT in the patient history
     (for criterion (b) guard check -- see below).
  3. Click "סיים סימולציה" (or the finish/end button) to mark the attempt COMPLETED.
  4. Confirm the simulation moves to a completed / debrief state.
  5. Note the attempt ID. Either:
       a. Check the browser URL bar (typically contains the attempt UUID), or
       b. Run this DB query:
            SELECT id FROM "Attempt"
            WHERE "assignmentId" = 'seed-asgn--0001-0000-0000-000000000001'
              AND "userId" = 'seed-user---0004-0000-0000-000000000004'
            ORDER BY "createdAt" DESC LIMIT 1;
       Record this attempt ID -- it is needed for criteria (b) and (c) queries.
  6. Run the PatientStateLog row-count query (substitute <attempt-id>):
       SELECT COUNT(*) AS turn_count
       FROM "PatientStateLog"
       WHERE "attemptId" = '<attempt-id>';
     Confirm count equals the number of turns sent.

**EXPECTED OBSERVATIONS:**
  - All 5+ turns complete without error; patient responds to each (stub text acceptable)
  - API console: no uncaught exception or stack trace during turns
  - Attempt status moves to COMPLETED after finish
  - PatientStateLog row count equals turn count

**EVIDENCE TO CAPTURE:**
  rehearsal-evidence-a-patientstatelog-rowcount.png   -- screenshot of DB query output
  rehearsal-evidence-a-server-log-no-exception.txt    -- copy of API console (no exception)
  rehearsal-evidence-a-completed-session.png          -- screenshot of completed session screen

**PASS BAR:**
  STRUCTURAL PASS if:
  - Turn pipeline completed all 5+ turns without error
  - PatientStateLog row count equals turn count
  - No uncaught exception in API console
  Do not evaluate response quality. 0/10 scores are cosmetic.

**NO-GO TRIGGER (automatic):**
  Turn pipeline crashes mid-session OR PatientStateLog rows are not written.

---

### CRITERION (b) -- Ground-truth guard fires (STRUCTURAL PASS)

**Purpose:** Confirm the guard code path runs without crashing; guardVerdict is populated.

**StubProvider caveat:** Guard accuracy NOT testable. Stub returns a fixed verdict.
STRUCTURAL PASS only.

**CREDENTIALS:**
  rehearsal-student-01 (same session as (a); no additional browser action needed).

**CLICKS/COMMANDS:**
  1. The guard-triggering turn was sent during step 2 of criterion (a) above (a turn
     referencing something not in the patient's ground truth, e.g. a mention of a sibling,
     employment detail, or symptom not in the GAD Intake case).
  2. After the session is COMPLETED, run this DB query (substitute <attempt-id>)
     [column names corrected per Oren S9 review F1 -- schema uses guardResult + trust]:
       SELECT "attemptId", "guardResult", "trust"
       FROM "PatientStateLog"
       WHERE "attemptId" = '<attempt-id>'
       ORDER BY "createdAt";
  3. Confirm guardResult is non-null for the turn where the guard-triggering message was sent.
     Any value (PASS, BLOCKED, REGENERATE) is acceptable on StubProvider.
  4. Check the API console: search for "TypeError" or "GuardRunner" exception. Confirm none.

**EXPECTED OBSERVATIONS:**
  - guardVerdict column non-null for the guard-checked turn
  - No TypeError or guard-runner exception in API console

**EVIDENCE TO CAPTURE:**
  rehearsal-evidence-b-patientstatelog-guardverdict.png  -- DB query showing guardVerdict non-null
  (API console log already captured for (a) covers the no-crash check)

**PASS BAR:**
  STRUCTURAL PASS if guard code path ran without crash and guardVerdict is non-null.
  Any non-null verdict value = PASS.

**NO-GO TRIGGER (automatic):**
  Guard-runner throws a TypeError or uncaught exception during the session.

---

### CRITERION (c) -- Interaction analyser accuracy (STRUCTURAL PASS)

**Purpose:** Confirm the analyser call runs without crashing and the analyser output column
is non-null in PatientStateLog for each turn.

**StubProvider caveat:** 70% accuracy bar CANNOT be evaluated on StubProvider.
Deferred to real-model rehearsal (APS-004 gate, pre-production).

**CREDENTIALS:**
  rehearsal-student-01 (same session as (a)/(b); no additional browser action).

**CLICKS/COMMANDS:**
  1. After the (a) session is COMPLETED, run this query (substitute <attempt-id>).
     [RESOLVED per Addendum 1 + Oren S9 F1/F4: the column IS "analyserOutput" (confirmed
     in schema + asserted by the S9-GAL-GAP1 integration test) and the trust column is
     "trust" (not "trustValue"). No information_schema check needed on day.]

       SELECT "attemptId", "analyserOutput", "trust"
       FROM "PatientStateLog"
       WHERE "attemptId" = '<attempt-id>'
       ORDER BY "createdAt";

  2. Confirm the column is non-null for every row (all turns).

**EXPECTED OBSERVATIONS:**
  - analyserOutput (or interactionAnalysis) column is non-null for each PatientStateLog row
  - No analyser crash in API console

**EVIDENCE TO CAPTURE:**
  rehearsal-evidence-c-patientstatelog-analyseroutput.png  -- DB query showing non-null values

**PASS BAR:**
  STRUCTURAL PASS if analyser call did not crash and the column is non-null for each turn row.
  Score values are cosmetic on StubProvider (any value acceptable).

**NO-GO TRIGGER (automatic):**
  Analyser crashes (exception in API console) OR column is null on all rows.

---

### CRITERION (d) -- Evaluation output coherence (STRUCTURAL PASS)

**Purpose:** Confirm the evaluation pipeline completes; student and teacher views render;
teacher override saves; debrief responds. 0/10 scores are cosmetic.

**StubProvider caveat:** Scores will be 0/10. COSMETIC -- not a failure.

**CREDENTIALS:**
  rehearsal-student-01 (student feedback + debrief view)
  rehearsal-teacher: teacher1@synthetic.test / TeacherPass1!re3 (evaluate + override)

**CLICKS/COMMANDS:**
  TEACHER STEPS (run after arc session 1 is COMPLETED, from ~10:30):
  1. Apply role-switch protocol (Section 5): logout student-01, login as rehearsal-teacher.
  2. Navigate to the teacher evaluation panel for the completed attempt.
     VERIFY-ON-DAY: exact URL (likely http://localhost:3000/authoring or /teacher-dashboard).
  3. Click "Generate Evaluation" if not auto-triggered. Wait for the evaluation to load.
  4. Confirm rubric criteria are listed. Expect 2 criteria: "Empathy" (אמפתיה) and
     "Risk Assessment" (הערכת סיכון).
  5. Confirm scores are shown. 0/10 is expected and is NOT a failure.
  6. Change one score (e.g., change Empathy from 0 to 5). Click Save / Publish.
  7. Confirm save confirmation with no error.

  STUDENT STEPS (after teacher publish):
  8. Apply role-switch protocol: logout teacher, login as student-01.
  9. Navigate to student feedback view for the completed attempt.
     Confirm both criteria listed with the updated score visible.
  10. Open debrief chat. Send: "מה יכולתי לעשות אחרת?"
  11. Confirm a response appears (any text acceptable on StubProvider).

**EXPECTED OBSERVATIONS:**
  - Student feedback view renders with rubric criteria listed (0/10 OK)
  - Teacher override: score changed and saved without error
  - Debrief chat returns a response

**EVIDENCE TO CAPTURE:**
  rehearsal-evidence-d-student-feedback-view.png    -- student page showing criteria + scores
  rehearsal-evidence-d-teacher-override-save.png    -- override saved, confirmation visible

**PASS BAR:**
  STRUCTURAL PASS if:
  - Student feedback view renders without error
  - Rubric criteria listed (count = 2)
  - 0/10 scores displayed (NOT a failure)
  - Teacher override: one score changed and saved without error
  - Debrief chat returns a response (stub text acceptable)

**NO-GO TRIGGER (automatic):**
  Evaluation pipeline does not complete for the COMPLETED attempt (no eval row created;
  page errors on load).

---

### CRITERION (e) -- No data loss on session interruption/resume

**Purpose:** Confirm prior turns are preserved after a browser-level interrupt; student can
resume and continue.

**CREDENTIALS:**
  rehearsal-student-02 (invite-tok-student-02-re3 / code-s02-re3)
  NOTE: student-01 is arc-complete by 13:30. Student-02 has no prior arc history.

**CLICKS/COMMANDS:**
  1. Apply role-switch protocol: login as student-02.
  2. Navigate to the assignment and start a new simulation session.
  3. Send exactly 3 turns:
       Turn 1: "שלום"
       Turn 2: "ספר לי על הרגשתך"
       Turn 3: "מה קרה לאחרונה?"
  4. WITHOUT clicking finish: close the browser tab (simulate interruption).
  5. Open a new browser tab. Navigate to http://localhost:3000 (student dashboard).
  6. Login again as student-02 if the session cookie was cleared.
  7. Confirm: the student dashboard shows an in-progress / "המשך" (Resume) card for
     the interrupted session.
  8. Click the Resume card.
  9. Confirm: the chat transcript shows all 3 prior turns.
  10. Confirm: the timer shows elapsed time or "--:--" (both acceptable per Sprint 4 ruling).
  11. Send 1 more turn to confirm the session is functional post-resume:
        "תודה, נמשיך"
      Confirm the patient responds (stub text acceptable).

**EXPECTED OBSERVATIONS:**
  - Resume card visible on student dashboard after close + reopen
  - 3 prior turns visible in transcript on resume
  - Timer shows elapsed time or "--:--" (both acceptable)
  - 4th turn succeeds; patient responds without error

**EVIDENCE TO CAPTURE:**
  rehearsal-evidence-e-resumed-session-prior-turns.png
    Screenshot of resumed session showing all 3 prior turns + timer display.
    Include the student dashboard URL in the browser bar.

**PASS BAR:**
  PASS if:
  - Resume card appears on student dashboard for the interrupted session
  - Transcript shows all 3 prior turns on resume
  - 4th turn succeeds; session can continue

**NO-GO TRIGGER:**
  Not automatic. If (e) fails: Ido judges whether a same-day hotfix is feasible before 18:00.

---

### CRITERION (f) -- Credit hard-limit blocks correctly

**Purpose:** Confirm credit enforcement fires at the turn level. At exhausted credit,
attempt-create SUCCEEDS and the FIRST TURN returns the blocked result.

**CRITICAL -- CORRECTED PASS BAR (Eco addendum 2026-07-11, code-verified):**
  The rehearsal plan's original wording "confirm 402" DOES NOT match the build.
  Credit enforcement fires at the TURN level via the engine InputGate (CREDIT_HARD_LIMIT),
  implemented in credit-ledger.service.ts (HardLimitExceededException).
  getOrCreateAttempt (org.service.ts) contains NO credit logic.
  There is NO 402 path anywhere in the codebase.

  CORRECT EXPECTATION:
    attempt-create SUCCEEDS -- HTTP 201 is CORRECT, not a failure of criterion (f).
    The FIRST TURN returns the blocked result in the UI.
    Do NOT treat a 201 on attempt-create as a test failure.

**CREDENTIALS:**
  rehearsal-admin: admin@synthetic.test / AdminPass!re3 (to set hardLimit = 0)
  rehearsal-student-03: invite-tok-student-03-re3 / code-s03-re3 (to test the blocked turn)
  NOTE: student-01 is arc-complete; student-02 was used for (e). Student-03 is fresh.

**CLICKS/COMMANDS:**
  ADMIN STEPS -- set credit hard-limit to 0:
  1. Apply role-switch protocol: login as rehearsal-admin.
  2. Navigate to credit-admin panel.
     VERIFY-ON-DAY: likely http://localhost:3000/admin/credits
  3. Find the CreditLedger for course "Clinical Communication -- Year 2" (CC-Y2-PILOT).
     Ledger ID: seed-ledg--0001-0000-0000-000000000001.
  4. [CORRECTED per Oren S9 review F2 + dress-run -- the original hardLimit=0 instruction
     produced a FALSE PASS: creditBalance = balance - hardLimit, so hardLimit=0 never
     blocks. There is NO OVERRIDE_HARD_LIMIT actionType and NO /actions route for limits.]
     First read the CURRENT BALANCE (GET the ledger in the credit-admin panel or
     GET http://localhost:3001/admin/credits/seed-ledg--0001-0000-0000-000000000001).
     Then set hardLimit EQUAL TO THAT BALANCE via:
       PATCH http://localhost:3001/admin/credits/seed-ledg--0001-0000-0000-000000000001/limits
       Body (JSON): { "hardLimit": <current balance value> }
     (Dress-run 2026-07-14 verified this exact flow: hardLimit=balance -> first turn blocked.)
  5. Confirm hardLimit now equals the balance (refresh the credit-admin page and check).

  STUDENT STEPS -- attempt blocked turn:
  6. Apply role-switch protocol: login as student-03.
  7. Navigate to the assignment and click "Start Simulation" (or equivalent start button).
  8. The attempt-create call will return HTTP 201. This is CORRECT -- do not be alarmed.
     The session may begin to load normally.
  9. Send the first turn (any message, e.g. "שלום").
  10. Observe the UI: the first turn must show a blocked / credit-limit message.
      No normal patient response should appear. Only the blocked result is shown.

  RESET after test (required before criterion (i)):
  11. Switch back to rehearsal-admin.
  12. Reset hardLimit to 2000 (the seeded value) [CORRECTED per Oren S9 F2 -- PATCH
      /limits, not an actionType]:
        PATCH http://localhost:3001/admin/credits/seed-ledg--0001-0000-0000-000000000001/limits
        Body (JSON): { "hardLimit": 2000 }
      (Or use the admin UI limits control if available.)
  13. Confirm hardLimit is 2000 again before moving to criterion (i).

**EXPECTED OBSERVATIONS:**
  - Attempt-create: HTTP 201 -- CORRECT, not a failure
  - First turn: blocked / credit-limit result shown in UI; no patient response
  - The message may indicate "credit limit exceeded" or a system-level block

**EVIDENCE TO CAPTURE:**
  rehearsal-evidence-f-first-turn-blocked.png
    Screenshot of the student UI showing the blocked first-turn result and no patient response.
    Note in your evidence log: "attempt-create returned 2xx (CORRECT per corrected pass bar)."

**PASS BAR:**
  PASS if:
  - Attempt-create returns 2xx (201 is CORRECT -- not a failure)
  - First turn sent as student-03 returns a blocked / credit-limit result in the UI
  FAIL if: the first turn returns a normal patient response (credit enforcement not firing)

**NO-GO TRIGGER:**
  Not automatic. If (f) fails: Ido judges whether a same-day hotfix is feasible.

---

### CRITERION (g) -- Support assistant structural isolation

**Purpose:** Confirm the support assistant responds with support/troubleshooting content only
and does NOT echo clinical patient details from the simulation.

**StubProvider caveat:** None. Support module is deterministic (no LLM call). Fully testable.
Structural isolation confirmed in support.spec.ts Sprint 6: no patient-engine imports.
The absence of a guard-prompt-style log for the support call IS EXPECTED (deterministic module).

**CREDENTIALS:**
  rehearsal-student-01 (invite-tok-student-01-re3 / code-s01-re3)
  NOTE: (g) runs at 09:30, as the first action in arc session 1, immediately after the
  dev-logging prereq check passes (Section 3). Same session, same browser tab.

**CLICKS/COMMANDS:**
  1. After the dev-logging prereq check in Section 3 passes (guard-prompt log line confirmed):
     remain in arc session 1 as student-01.
  2. Open the support assistant from the student interface.
     VERIFY-ON-DAY: exact UI location (sidebar button, help tab, or separate page within
     the simulation UI). If only accessible from the student dashboard (outside a session),
     note the interruption in your evidence log, access it from the dashboard, then return
     to the simulation for criterion (a)/(b)/(c)/(d).
  3. Send a message referencing clinical content from the session:
       "the patient mentioned they have no sister, but I think this matters -- what do I do?"
  4. Observe the response.
  5. In the API console: note any log lines appearing at the time of the support call.
     Look for lines containing "support" or "runTroubleshootingFlow".
     Confirm no PatientStateLog / ground-truth / guardVerdict data appears in any support log.
     If no support-specific log lines appear: expected for the deterministic module.
     Note "No support prompt log -- deterministic module confirmed" in your evidence log.

**EXPECTED OBSERVATIONS:**
  - Response contains troubleshooting / procedural support content
  - Response does NOT echo the patient's specific clinical details ("no sister" phrasing,
    diagnosis name, ground-truth field values)
  - API console: no PatientStateLog or ground-truth data in support-related log lines

**EVIDENCE TO CAPTURE:**
  rehearsal-evidence-g-support-response-no-patient-data.png
    Screenshot of support chat response. Confirm no patient clinical detail in the text.
  rehearsal-evidence-g-support-prompt-log.txt
    Copy of API console lines at the time of the support call.
    If none: paste "No support prompt log -- deterministic module confirmed."

**PASS BAR:**
  PASS if:
  - Support assistant responds with support/troubleshooting content
  - Response contains no patient clinical details (no ground-truth data echoed)
  - API console: no PatientStateLog or ground-truth fields in any support-related log lines
  FAIL if: response echoes specific patient clinical details -- automatic NO-GO.

**NO-GO TRIGGER (automatic):**
  Support assistant response contains clinical patient details (data leakage -- clinical
  safety violation).

---

### CRITERION (h) -- 3-session continuing-persona arc coherence

**Purpose:** Confirm all 4 session-boundary invariants hold across 3 contiguous arc sessions
and the arc cap blocks session 4 with 403 ARC_COMPLETE.

**FULLY TESTABLE on StubProvider.** FAIL on ANY invariant or arc cap = automatic NO-GO.

**MANDATORY RULE:**
  All 3 sessions run CONTIGUOUSLY, SAME TESTER, SAME BROWSER, SAME DAY.
  Do not stop for lunch between sessions 2 and 3.
  Session 3 coherence depends on session 2 state; split = invalid test.
  Arc session 1 is completed during criterion (a)/(b)/(c)/(d) at 10:00-11:15.
  Sessions 2 and 3 run starting at 11:30.

**CREDENTIALS:**
  rehearsal-student-01
  User ID (for DB queries): seed-user---0004-0000-0000-000000000004
  Template ID (for DB queries): seed-tpl---0001-0000-0000-000000000001

---

#### PRE-CHECK before session 2 (run immediately after session 1 finishes)

Confirm ArcSessionSummary for session 1 is written:

```sql
SELECT "sessionNumber", "finalTrustLevel", "finalOpenness", "finalAlliance",
       "notableMomentsSummary"
FROM "ArcSessionSummary"
WHERE "userId" = 'seed-user---0004-0000-0000-000000000004'
  AND "templateId" = 'seed-tpl---0001-0000-0000-000000000001'
ORDER BY "sessionNumber";
```

Expected: 1 row, sessionNumber = 1, finalTrustLevel non-null (value within 0.70),
finalOpenness non-null (within 0.65), finalAlliance non-null (within 0.70).

Record these values in your notes -- you need them for the trust-continuity check at
session 2 start and to identify a distinctive phrase from notableMomentsSummary.

STOP if 0 rows: arc writer did not fire after session 1. Flag to Ido. Automatic NO-GO.

Capture: rehearsal-evidence-h-arcsessionsummary-after-s1.png

---

#### SESSION 2 -- STEPS

1. With student-01 logged in: navigate to the assignment and click "Start New Session."
   (Attempt-create for session 2.)

**BEFORE SENDING ANY MESSAGE -- check invariants 3 and 4:**

2. INVARIANT 3 -- Welfare modal:
   a. Confirm the welfare re-anchor modal fires automatically BEFORE the chat input is enabled.
   b. Confirm BOTH of these Hebrew strings are present in the modal text:
        "המטופל הוא דמות אימון מדומה; הוא אינו אדם אמיתי."
        "אם אתה/את חש/ה אי-נוחות, פנה/י לאיש הצוות שלך."
   c. Confirm the chat textarea is DISABLED (you cannot type in it).
   d. Confirm the modal does NOT auto-dismiss (it waits for your click).
   EVIDENCE: rehearsal-evidence-h-welfare-modal-session2.png
     Take this screenshot NOW before clicking anything.
   e. Click "הבנתי" to acknowledge.

3. INVARIANT 4 -- Session-gap briefing:
   a. After clicking "הבנתי": confirm Hebrew briefing text is visible.
      The text describes the session-gap limitation (the patient does not recall fine
      details from the prior session per clinical condition C5).
   b. Confirm the chat input is NOW ENABLED (you can type).
   c. Confirm no messages have been sent yet (message list is empty at this point).
   EVIDENCE: rehearsal-evidence-h-gap-briefing-session2.png
     Take this screenshot NOW (briefing visible, input enabled, no messages).

4. SESSION-CONTEXT PANEL: Confirm the panel shows "פגישה 2 מתוך 3".

**INVARIANT 2 -- Guard prompt check (during session 2 turns):**

5. Send 1-2 simulation turns.
6. After each turn: in the API console, search for the guard-prompt log line (contains
   "buildGuardPrompt" or the guard-logger prefix identified in Section 3).
7. In that log line, confirm the following are ABSENT:
   - The notableMomentsSummary content from session 1 (use a distinctive phrase from the
     DB query result recorded in the pre-check step above to search for it).
   - Any phrasing from session 1 patient responses.
   The guard receives ONLY the authored SimulationTemplate ground truth.
   The arc context (with notableMomentsSummary) should appear in a SEPARATE log entry
   labeled "PRIOR SESSION CONTEXT -- context only, not ground truth" (patient context
   builder; NOT the guard prompt).
8. EVIDENCE: rehearsal-evidence-h-guard-prompt-session2-log.txt
   Copy the guard-prompt log line(s) for one session-2 turn.

**FINISH SESSION 2:**

9. Send at least 3 turns total in session 2. Click "סיים סימולציה" to finish (COMPLETED).

**INVARIANT 1 -- Trust continuity check (after session 2):**

10. Run the ArcSessionSummary query:
```sql
SELECT "sessionNumber", "finalTrustLevel", "finalOpenness", "finalAlliance"
FROM "ArcSessionSummary"
WHERE "userId" = 'seed-user---0004-0000-0000-000000000004'
  AND "templateId" = 'seed-tpl---0001-0000-0000-000000000001'
ORDER BY "sessionNumber";
```
Expected: 2 rows (sessions 1 and 2). Record session-2 finalTrustLevel, finalOpenness,
finalAlliance in your notes (needed for session-3 trust-continuity check).
EVIDENCE: rehearsal-evidence-h-arcsessionsummary-after-s2.png

Also: search the API console (scroll back to session-2 start) for the ArcLoaderService
log line. Look for text containing "ArcLoaderService" and "arc context loaded" (or
"arcContext" and a trust value). Confirm: the trust value in that log equals the
session-1 finalTrustLevel from the pre-check query.
EVIDENCE: rehearsal-evidence-h-arcloader-session2-log.txt

---

#### SESSION 3 -- STEPS

START IMMEDIATELY after session 2 finishes. Do not take a break.

11. Navigate to the assignment and click "Start New Session." (Session 3.)

12. INVARIANT 3 -- Welfare modal at session 3:
    Repeat the same checks as step 2 above.
    Both Hebrew strings must be present; input disabled; modal does not auto-dismiss.
    EVIDENCE: rehearsal-evidence-h-welfare-modal-session3.png
    Click "הבנתי."

13. INVARIANT 4 -- Session-gap briefing at session 3:
    Briefing text visible after ack; input enabled; no messages yet.
    EVIDENCE: rehearsal-evidence-h-gap-briefing-session3.png

14. SESSION-CONTEXT PANEL: Confirm panel shows "פגישה 3 מתוך 3".

15. INVARIANT 1 -- Trust continuity at session 3 start:
    In the API console, look for the ArcLoaderService log line at session-3 start.
    Search for "ArcLoaderService" and "arc context loaded".
    Confirm: the trust value in that log equals the session-2 finalTrustLevel recorded
    in step 10.
    EVIDENCE: rehearsal-evidence-h-arcloader-session3-log.txt

16. Send 3+ turns in session 3. Apply invariant 2 check (guard prompt) as in step 7.
    No separate evidence file required if session-2 guard check already passed;
    note "same check performed, same result" in your notes.

17. Click "סיים סימולציה" to finish session 3 (COMPLETED).

18. Run the final ArcSessionSummary query:
```sql
SELECT "sessionNumber", "finalTrustLevel", "finalOpenness", "finalAlliance"
FROM "ArcSessionSummary"
WHERE "userId" = 'seed-user---0004-0000-0000-000000000004'
  AND "templateId" = 'seed-tpl---0001-0000-0000-000000000001'
ORDER BY "sessionNumber";
```
Expected: 3 rows. Confirm ALL values are within ceilings:
  finalTrustLevel  <= 0.70 for all sessions
  finalOpenness    <= 0.65 for all sessions
  finalAlliance    <= 0.70 for all sessions
EVIDENCE: rehearsal-evidence-h-arcsessionsummary-after-s3.png

---

#### ARC CAP -- session 4 blocked

19. With student-01 still logged in: open browser developer tools (F12) -> Network tab
    -> clear the network log.
20. Navigate to the assignment and click "Start New Session."
21. Observe the network tab: the POST to .../attempts should return 403.
22. Click on the 403 request in the network tab and view the Response body.
    Confirm: the JSON body contains code = "ARC_COMPLETE" (or a field named "code"
    with value "ARC_COMPLETE").
EVIDENCE: rehearsal-evidence-h-arc-cap-403.png
  Screenshot of network tab showing the 403 request selected and the response body
  with ARC_COMPLETE visible.

---

#### 4-INVARIANT PASS BAR CHECKLIST

Check every box. A single unchecked box = automatic NO-GO.

INVARIANT 1 (Trust continuity):
  [ ] ArcSessionSummary session 1: finalTrustLevel non-null, within 0.70
  [ ] ArcLoaderService log at session 2 start: trust value = session-1 finalTrustLevel
  [ ] ArcSessionSummary session 2: finalTrustLevel non-null, within 0.70
  [ ] ArcLoaderService log at session 3 start: trust value = session-2 finalTrustLevel
  [ ] ArcSessionSummary session 3: all values within ceilings (trust<=0.70, openness<=0.65, alliance<=0.70)

INVARIANT 2 (No invented facts through guard):
  [ ] Session-2 guard-prompt log: distinctive session-1 notableMomentsSummary phrase is ABSENT
  [ ] Session-3 guard-prompt log: arc-summary content from sessions 1-2 is ABSENT
  [ ] Arc context block (if logged separately) is labeled "PRIOR SESSION CONTEXT -- context only,
      not ground truth" (patient context builder log, NOT guard prompt)

INVARIANT 3 (Welfare modal fires + blocks at sessions 2 and 3):
  [ ] Session 2: modal fires before chat input; both Hebrew strings present
  [ ] Session 2: chat input disabled while modal is showing; modal does not auto-dismiss
  [ ] Session 3: same checks -- modal fires, both strings, input disabled, no auto-dismiss

INVARIANT 4 (Session-gap briefing fires after ack at sessions 2 and 3):
  [ ] Session 2: briefing visible after "הבנתי" click; chat input enabled; no messages sent yet
  [ ] Session 3: same

ARC CAP:
  [ ] Session-4 attempt-create returns 403 with code = "ARC_COMPLETE" in response body

**PASS BAR:** ALL boxes above must be checked.
**NO-GO TRIGGER (automatic):** ANY unchecked box. October fallback activated.

---

### CRITERION (i) -- Author-preview run

**Purpose:** Confirm the author-preview bot run completes; result is invisible to students;
credit balance is unchanged; evaluation is auto-triggered (DRAFT status).

**CREDENTIALS:**
  rehearsal-teacher:    teacher1@synthetic.test / TeacherPass1!re3 (run preview; view result)
  rehearsal-student-01: invite-tok-student-01-re3 / code-s01-re3 (visibility check)
  rehearsal-admin:      admin@synthetic.test / AdminPass!re3 (credit balance check)

**CLICKS/COMMANDS:**

  PRE-CHECK (admin -- before switching to teacher):
  1. Apply role-switch protocol: login as rehearsal-admin.
  2. Navigate to credit-admin panel (VERIFY-ON-DAY: likely http://localhost:3000/admin/credits).
  3. Record the current credit balance for ledger seed-ledg--0001-0000-0000-000000000001.
     EVIDENCE: rehearsal-evidence-i-credit-balance-before.png

  TEACHER STEPS (preview run):
  4. Apply role-switch protocol: login as rehearsal-teacher.
  5. Navigate to the template authoring UI.
     VERIFY-ON-DAY: exact URL (likely http://localhost:3000/authoring).
  6. Find template "GAD Intake -- Pilot Case 01."
  7. Click "Run Preview" (VERIFY-ON-DAY: exact button label; may be in Hebrew).
  8. Wait for completion. The bot runs all turns server-side (StudentBotProvider;
     expect 6 turns; StubProvider completes quickly, typically 10-30 seconds).
  9. View the transcript in the teacher/authoring review view.
     Confirm: at least 1 transcript item with fields studentInput, patientResponse, turnIndex.
     Confirm: no system-prompt content visible (no personaPrompt, groundTruth, systemPrompt
     fields shown in the UI or any transcript export).
  10. View the evaluation panel for the preview attempt.
      Confirm: a DRAFT evaluation is present (auto-triggered after preview completes).
  EVIDENCE: rehearsal-evidence-i-preview-result-teacher-view.png
    Screenshot of teacher view showing transcript items and DRAFT evaluation.

  STUDENT STEPS (visibility check):
  11. Apply role-switch protocol: login as rehearsal-student-01.
  12. Navigate to student dashboard.
  13. Confirm: the AUTHOR_PREVIEW attempt is NOT listed anywhere in the dashboard.
      The completed simulations list should show only student-01's own arc sessions
      (sessions 1-3), NOT the preview attempt.
  EVIDENCE: rehearsal-evidence-i-student-dashboard-no-preview.png
    Screenshot of student dashboard with no preview entry visible.

  ADMIN STEPS (credit balance check):
  14. Apply role-switch protocol: login as rehearsal-admin.
  15. Navigate to credit-admin panel.
  16. Confirm the credit balance is IDENTICAL to the value recorded in step 3.
  EVIDENCE: rehearsal-evidence-i-credit-balance-after.png
    Screenshot of credit-admin showing the balance (must match before value).

**EXPECTED OBSERVATIONS:**
  - Bot run completes without crash
  - Transcript has at least 1 item; no system-prompt fields visible
  - DRAFT evaluation accessible to teacher in authoring/review view
  - Preview attempt absent from student-01 dashboard
  - Credit balance: before = after (unchanged)

**PASS BAR:**
  PASS if ALL of:
  - Author-preview bot run completes without crash
  - Transcript has >= 1 item, correct fields, no system-prompt leak
  - DRAFT evaluation auto-triggered and visible to teacher
  - Preview attempt NOT in student-01 dashboard
  - Credit balance before = after (no deduction for preview)
  FAIL if preview attempt appears in student dashboard = automatic NO-GO.

**NO-GO TRIGGER (automatic):**
  Preview attempt visible in the student-facing dashboard (data isolation violation).

---

## SECTION 8 -- NO-GO TRIGGERS SUMMARY

Automatic NO-GO triggers (any one fires -> October fallback ~2026-10-15):
  1. (a) Turn pipeline crashes mid-session OR PatientStateLog rows not written
  2. (b) Guard-runner throws TypeError or uncaught exception
  3. (d) Evaluation pipeline does not complete for the COMPLETED attempt
  4. (g) Support assistant response contains clinical patient details
  5. (h) ANY of the 4 invariants fails (trust wrong, invented facts in guard, welfare modal
         missing at session 2 or 3, gap briefing missing at session 2 or 3)
  6. (h) Arc cap does not fire on session 4 (no 403 ARC_COMPLETE)
  7. (i) Author-preview attempt visible in student-facing dashboard

Ido judgment call (not automatic):
  8. (e) Resume failure -- Ido may hold GO if same-day hotfix before 18:00
  9. (f) Credit-block failure -- same judgment path

Any NO-GO: Ido reports to Eco same day with criterion(ia) failed, engineering root cause,
remediation estimate, and revised rehearsal/launch dates.

---

*Adi (QA Engineer) | 2026-07-14 | Sprint 9 S9-ADI-RUNBOOK*
*Sources verified from files: sprint-9-envelope-ido-2026-07-14.md,*
*rehearsal-plan-15aug-ido-2026-07-11.md, rehearsal-readiness-adi-2026-07-11.md,*
*app/packages/db/prisma/seed.mjs, app/apps/api/src/scripts/e2e-golden-path.mjs*

---

## Addendum: ambiguity resolutions (Eco, code-verified 2026-07-14)

Resolves the VERIFY-ON-DAY items flagged at runbook delivery. Tester should treat
these as authoritative; the in-section VERIFY-ON-DAY markers are superseded where
covered here.

1. CRITERION (a)/(c) COLUMN NAME: the interaction-analysis column on PatientStateLog
   is `analyserOutput` (Json). Confirmed from schema.prisma AND asserted by the new
   S9-GAL-GAP1 integration test (simulation-turn.integration.spec.ts): non-null after
   a live processTurn. No information_schema query needed on day; the day check is
   simply: SELECT "analyserOutput" FROM "PatientStateLog" ... IS NOT NULL.
2. CRITERION (f) HARD-LIMIT MECHANISM: use PATCH /admin/credits/:ledgerId/limits
   (APS-REQ-141/142; sets softLimit/hardLimit directly; requires SYSTEM_ADMIN token)
   or the credit-admin UI limits control. There is NO OVERRIDE_HARD_LIMIT actionType --
   limits are a dedicated endpoint, separate from the credit-action endpoint. To force
   the blocked state: set hardLimit equal to the current balance (effective available
   = min(balance, hardLimit) - deduction attempt then exceeds it), then run a turn.
   Reminder of the corrected pass bar: attempt-create SUCCEEDS; the FIRST TURN returns
   the blocked result.
3. CRITERION (g) SUPPORT ENTRY POINT: the Help button on the student simulation screen
   opens HelpOverlay (Hebrew Q&A + "skip to email support"). The deterministic
   troubleshooting flow is exercised via the support endpoints (API-level), which is
   what the isolation evidence targets; the overlay is the student-visible surface.
4. STUDENT ROUTING (ambiguity 3): Adi's routing ACCEPTED (Eco, on Ido's behalf per
   envelope sequencing authority): student-02 for (e), student-03 for (f); student-01
   is arc-complete after the (h) block and cannot open new sessions. Correct as written.
5. COLLEGE NAME (ambiguity 1): cosmetic discrepancy; seed value "Gome Gevim -- pilot"
   is what the tester will see. No action.

---

## Addendum 2: Sami clinical-read fixes (Eco applied, 2026-07-14) -- SUPERSEDES the named steps

Sami (SME) reviewed the criterion (h) section (R4, flag-or-clear): VERDICT FLAG x2.
Both fixes below are BINDING for the tester; where they conflict with the main body,
this addendum wins.

FIX 1 (Sami FLAG 1 -- session-3 guard check must evidence SESSION-2 summary exclusion):
- Step 10 query: SELECT additionally "notableMomentsSummary" for the sessionNumber=2
  row. Record a DISTINCTIVE PHRASE from session 2's notableMomentsSummary (as done for
  session 1 at the earlier pre-check).
- Step 16 (session-3 invariant 2): the guard-prompt check must verify the ABSENCE of
  BOTH captured phrases -- session 1's AND session 2's. The session-2 phrase is the new
  exposure at session 3 and the exact compounding path C2 exists to catch.
- Evidence: a SEPARATE file rehearsal-evidence-h-guard-prompt-session3-log.txt IS
  required. The main body's "no separate evidence file; note same-check-same-result"
  policy for session 3 is REVOKED.

FIX 2 (Sami FLAG 2 -- invariant 4 briefing check is content-verified, not
visibility-only): at BOTH session 2 (step 3) and session 3 (step 13), the tester must
verify the briefing shows the TEMPORAL-LIMITATION text, exact string (built in Sprint 5
per C5; this is the app's actual briefing copy):
  "שים/י לב: המטופל המדומה אינו מדמה חלוף זמן אמיתי בין פגישות. ייתכן שנושאים
   מהפגישה הקודמת יוזכרו, אך לא יהיו שינויים הנובעים מאירועי חיים שהתרחשו בין הפגישות."
PASS requires this string (or its unedited on-screen rendering) present in the
screenshot -- text merely saying the patient "may not recall details" is a FAIL for
invariant 4 (wrong limitation; C5 is about unmodeled time passage, not recall).

Sami's full read (incl. a non-flag completeness note on loader-log trust-only
verification at step 15) is recorded in the session log; no other clinical changes.

---

## Addendum 3: dress-run corrections (Eco, from Adi dress-run 2026-07-14 -- BINDING)

Full dress-run report: dressrun-report-adi-2026-07-14.md (criteria e/f/g/h/i all PASS
against the live stack).

1. GATE RE-CONFIRM REQUIRES A FRESH SEED (FLAG-DR-001): the (h) arc block consumes all
   3 arc sessions for its student, and the day's flows consume others. ANY E2E gate
   re-confirm run during or after the rehearsal day MUST be preceded by a re-seed
   (`pnpm --filter @aps/db seed`) -- otherwise it fails on ARC_COMPLETE/stale data and
   the failure is procedural, not code. Schedule the re-confirm as: re-seed -> E2E.
   Note: a re-seed WIPES the day's attempts -- capture all evidence BEFORE the re-seed.
2. CRITERION (g) SCRIPT FIX: the support-ticket response identifier field is `ticketId`
   (NOT `id`). The response keys are [ticketId, notifiedEmail, expectedResponseHours,
   canContinueNow, recoveryGuidance] -- and the PASS check is that NO patient/clinical
   fields appear among them.
3. Confirmed by dress-run for tester confidence: (f) blocked-turn message reads "This
   session is currently unavailable..." with attempt-create still 201; (h) session 4
   returns 403 code=ARC_COMPLETE; (i) credit balance is unchanged by preview and the
   preview attempt is absent from the student dashboard.
