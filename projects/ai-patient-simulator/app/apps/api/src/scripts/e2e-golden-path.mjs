// APS golden-path E2E -- dependency-free (Node global fetch, no Playwright).
// Drives the full pilot flow over real HTTP against a running API + seeded data:
//   student invite-login -> create attempt -> turns (stub patient) -> finish ->
//   teacher login -> evaluate -> publish -> student reads feedback -> debrief ->
//   RBAC (student forbidden on admin) -> admin login -> credit action -> no-token 401.
// Run the seed (pnpm --filter @aps/db seed) and boot the API first, then:
//   node apps/api/src/scripts/e2e-golden-path.mjs
// Exits 0 iff every step passes.

const API = process.env.APS_API_URL || "http://localhost:3001";

// SYNTHETIC LOCAL TEST FIXTURES -- these are the throwaway, de-identified values that
// packages/db/prisma/seed.mjs creates in the local dev/test database. They are NOT real
// credentials and grant nothing outside the seeded local DB. Override any of them via env.
const env = process.env;
const ASSIGNMENT_ID = env.E2E_ASSIGNMENT_ID || "seed-asgn--0001-0000-0000-000000000001";
const LEDGER_ID = env.E2E_LEDGER_ID || "seed-ledg--0001-0000-0000-000000000001";
const STUDENT = {
  inviteToken: env.E2E_STUDENT_INVITE || "invite-tok-student-01-re3",
  accessCode: env.E2E_STUDENT_CODE || "code-s01-re3",
};
const TEACHER = {
  email: env.E2E_TEACHER_EMAIL || "teacher1@synthetic.test",
  password: env.E2E_TEACHER_SECRET || "TeacherPass1!re3",
};
const ADMIN = {
  email: env.E2E_ADMIN_EMAIL || "admin@synthetic.test",
  password: env.E2E_ADMIN_SECRET || "AdminPass!re3",
};
// S5-ADI-ARC-E2E: arc steps use student2 (no prior COMPLETED attempts in fresh DB).
// Student1 already has COMPLETED attempts from baseline steps 1-4; using student2
// ensures sessionNumber starts at 1 without interfering with the baseline flow.
const STUDENT2 = {
  inviteToken: env.E2E_STUDENT2_INVITE || "invite-tok-student-02-re3",
  accessCode: env.E2E_STUDENT2_CODE || "code-s02-re3",
};

async function call(method, path, { token, body } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  return { status: res.status, data };
}

const results = [];
function check(name, cond, detail) {
  const ok = !!cond;
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail !== undefined ? "  [" + detail + "]" : ""}`);
}

async function main() {
  // 1. Student invite-login
  const sl = await call("POST", "/auth/invite-login", { body: STUDENT });
  check("student invite-login 200", sl.status === 200, sl.status);
  const studentToken = sl.data?.accessToken;

  // 2. Create (or get) attempt for the assignment
  const at = await call("POST", `/assignments/${ASSIGNMENT_ID}/attempts`, {
    token: studentToken, body: { language: "he" },
  });
  check("create attempt 2xx", at.status >= 200 && at.status < 300, at.status);
  const attemptId = at.data?.id;
  check("attempt has id", !!attemptId, attemptId);

  // 3. Two simulation turns (stub patient)
  const t1 = await call("POST", `/simulations/${attemptId}/turn`, {
    token: studentToken, body: { studentMessage: "שלום, איך אתה מרגיש היום?", language: "he" },
  });
  check("turn 1 delivers patient response (NOT gate-blocked)",
    (t1.status >= 200 && t1.status < 300) && t1.data?.guardResult !== "BLOCKED" && t1.data?.hardLimitReached !== true && !!t1.data?.patientMessage,
    `${t1.status} guard=${t1.data?.guardResult} hardLimit=${t1.data?.hardLimitReached}`);
  const t2 = await call("POST", `/simulations/${attemptId}/turn`, {
    token: studentToken, body: { studentMessage: "ספר לי עוד על מה שאתה חווה", language: "he" },
  });
  check("turn 2 delivers patient response (NOT gate-blocked)",
    (t2.status >= 200 && t2.status < 300) && t2.data?.guardResult !== "BLOCKED" && !!t2.data?.patientMessage,
    `${t2.status} guard=${t2.data?.guardResult}`);

  // 4. Finish
  const fin = await call("POST", `/simulations/${attemptId}/finish`, { token: studentToken, body: {} });
  check("finish 2xx", fin.status >= 200 && fin.status < 300, fin.status);

  // 5. Teacher login
  const tl = await call("POST", "/auth/email-login", { body: TEACHER });
  check("teacher email-login 200", tl.status === 200, tl.status);
  const teacherToken = tl.data?.accessToken;

  // 6. Teacher generates the evaluation
  const ev = await call("POST", `/simulations/${attemptId}/evaluate`, { token: teacherToken, body: {} });
  check("teacher evaluate 2xx", ev.status >= 200 && ev.status < 300, `${ev.status} status=${ev.data?.status}`);

  // 7. Teacher publishes it
  const pub = await call("PATCH", `/simulations/${attemptId}/evaluation`, {
    token: teacherToken, body: { publish: true, teacherNotes: "E2E published" },
  });
  check("publish evaluation 200 -> PUBLISHED", pub.status === 200 && pub.data?.status === "PUBLISHED", `${pub.status} status=${pub.data?.status}`);

  // 8. Student reads their published feedback
  const sev = await call("GET", `/simulations/${attemptId}/evaluation`, { token: studentToken });
  check("student reads PUBLISHED evaluation 200", sev.status === 200, sev.status);

  // 9. Student debrief (requires published evaluation)
  const db = await call("POST", `/simulations/${attemptId}/debrief`, {
    token: studentToken, body: { message: "מה יכולתי לעשות אחרת?" },
  });
  check("debrief 2xx + supervisorText reply", (db.status >= 200 && db.status < 300) && typeof db.data?.supervisorText === "string" && db.data.supervisorText.length > 0, `${db.status} capped=${db.data?.capped}`);

  // 9b. Student dashboard (real data: completed sim + debrief history)
  const studentUserId = sl.data?.user?.id || env.E2E_STUDENT_USER_ID || "seed-user---0004-0000-0000-000000000004";
  const sd = await call("GET", `/dashboard/student/${studentUserId}`, { token: studentToken });
  check("student dashboard 200 + completed sim + debrief history",
    sd.status === 200 && Array.isArray(sd.data?.completedSimulations) && sd.data.completedSimulations.length > 0 && Array.isArray(sd.data?.debriefHistory) && sd.data.debriefHistory.length > 0,
    `${sd.status} sims=${sd.data?.completedSimulations?.length} debriefs=${sd.data?.debriefHistory?.length}`);

  // 9c. Teacher class dashboard (real cohort matrix with the student's scores)
  const COURSE_ID = env.E2E_COURSE_ID || "seed-course--0001-0000-0000-000000000001";
  const td = await call("GET", `/dashboard/teacher/${COURSE_ID}`, { token: teacherToken });
  const row = td.data?.students?.find((s) => s.userId === studentUserId);
  check("teacher dashboard 200 + student row scored",
    td.status === 200 && Array.isArray(td.data?.criteria) && td.data.criteria.length > 0 && !!row && row.overallScore !== null,
    `${td.status} students=${td.data?.students?.length} row=${row?.status} overall=${row?.overallScore}`);

  // 9d. RBAC: student forbidden on ANOTHER student's dashboard
  const otherStudent = env.E2E_OTHER_STUDENT_ID || "seed-user---0005-0000-0000-000000000005";
  const sdf = await call("GET", `/dashboard/student/${otherStudent}`, { token: studentToken });
  check("student FORBIDDEN on another student's dashboard (403)", sdf.status === 403, sdf.status);

  // 9e. RBAC: student forbidden on teacher dashboard
  const tdf = await call("GET", `/dashboard/teacher/${COURSE_ID}`, { token: studentToken });
  check("student FORBIDDEN on teacher dashboard (403)", tdf.status === 403, tdf.status);

  // 10. RBAC: student forbidden on admin surface
  const forbidden = await call("GET", "/admin/credits", { token: studentToken });
  check("student FORBIDDEN on /admin/credits (403)", forbidden.status === 403, forbidden.status);

  // 11. Admin login + audited credit action
  const al = await call("POST", "/auth/email-login", { body: ADMIN });
  check("admin email-login 200", al.status === 200, al.status);
  const adminToken = al.data?.accessToken;
  const act = await call("POST", `/admin/credits/${LEDGER_ID}/actions`, {
    token: adminToken, body: { actionType: "ADMIN_ADD", amount: 1000, reason: "E2E top-up" },
  });
  check("admin ADMIN_ADD credit action 2xx", act.status >= 200 && act.status < 300, act.status);

  // 12. No-token protected call -> 401
  const noauth = await call("GET", "/admin/credits", {});
  check("no-token /admin/credits -> 401", noauth.status === 401, noauth.status);

  // 20. Author-preview: teacher POST -> 2xx + attemptId; credit balance unchanged; student dashboard excludes it.
  // 20a. Snapshot credit balance before preview
  const ledgerBefore = await call("GET", `/admin/credits/ledger/${LEDGER_ID}`, { token: adminToken });
  const creditBefore = ledgerBefore.data?.balance;

  // 20b. Teacher runs preview (TYPICAL profile)
  const prev = await call("POST", `/assignments/${ASSIGNMENT_ID}/preview`, {
    token: teacherToken,
    body: { profile: "TYPICAL" },
  });
  check("20a: teacher POST /preview -> 2xx + { attemptId }",
    prev.status >= 200 && prev.status < 300 && typeof prev.data?.attemptId === "string",
    `${prev.status} attemptId=${prev.data?.attemptId}`);
  const previewAttemptId = prev.data?.attemptId;

  // 21. GET transcript for the preview attempt -- verify shape, no system-prompt leak
  const tr21 = await call("GET", `/simulations/${previewAttemptId}/transcript`, { token: teacherToken });
  const tr21Items = Array.isArray(tr21.data) ? tr21.data : [];
  const tr21FieldsOk =
    tr21Items.length > 0 &&
    tr21Items.every(
      (item) =>
        typeof item.studentInput === "string" &&
        typeof item.patientResponse === "string" &&
        typeof item.turnIndex === "number",
    );
  const tr21NoLeak = tr21Items.every(
    (item) =>
      item.systemPrompt === undefined &&
      item.groundTruth === undefined &&
      item.personaPrompt === undefined,
  );
  check(
    "21: GET transcript >=1 item, correct fields, no system-prompt leak",
    tr21.status === 200 && tr21FieldsOk && tr21NoLeak,
    `${tr21.status} items=${tr21Items.length} fieldsOk=${tr21FieldsOk} noLeak=${tr21NoLeak}`,
  );

  // 20c. Balance must not have changed (bypassCreditCheck=true)
  const ledgerAfter = await call("GET", `/admin/credits/ledger/${LEDGER_ID}`, { token: adminToken });
  const creditAfter = ledgerAfter.data?.balance;
  check("20b: credit balance unchanged after preview",
    creditBefore !== undefined && creditAfter !== undefined && creditBefore === creditAfter,
    `before=${creditBefore} after=${creditAfter}`);

  // 20d. Preview attempt must have a DRAFT Evaluation (Track-A-fix-001: auto-triggered)
  const evalRes = await call("GET", `/simulations/${previewAttemptId}/evaluation`, { token: teacherToken });
  check("20d: preview has DRAFT Evaluation auto-triggered (Track-A-fix-001)",
    evalRes.status === 200 && evalRes.data?.status === "DRAFT",
    `${evalRes.status} evalStatus=${evalRes.data?.status}`);

  // 20e. Student dashboard must NOT list the AUTHOR_PREVIEW attempt
  const sd20 = await call("GET", `/dashboard/student/${studentUserId}`, { token: studentToken });
  const previewInDashboard = Array.isArray(sd20.data?.completedSimulations) &&
    sd20.data.completedSimulations.some(
      (s) => s.id === previewAttemptId || s.attemptId === previewAttemptId,
    );
  check("20e: student dashboard excludes AUTHOR_PREVIEW attempt",
    sd20.status === 200 && !previewInDashboard,
    `status=${sd20.status} found=${previewInDashboard}`);

  // ---------------------------------------------------------------------------
  // 25. RESUME-ON-INTERRUPT (S4-NOA-RESUME / S4-GAL-RESUME)
  //     Interrupt an in-progress attempt; verify dashboard and transcript.
  //     Step 25c depends on Gal S4-GAL-RESUME (dashboard returns IN_PROGRESS).
  //     Step 25d tests the existing transcript endpoint (no Gal dep needed).
  // ---------------------------------------------------------------------------

  // 25a. Create a second attempt (separate from the main flow).
  const ra = await call("POST", `/assignments/${ASSIGNMENT_ID}/attempts`, {
    token: studentToken, body: { language: "he" },
  });
  check("25a: resume attempt created (new IN_PROGRESS attempt)", ra.status >= 200 && ra.status < 300, ra.status);
  const resumeAttemptId = ra.data?.id ?? null;

  // 25b. Send exactly 1 turn -- do NOT call /finish (attempt stays IN_PROGRESS).
  let step25bOk = false;
  if (resumeAttemptId) {
    const rt1 = await call("POST", `/simulations/${resumeAttemptId}/turn`, {
      token: studentToken, body: { studentMessage: "שאלה ראשונה בסימולציה חלקית", language: "he" },
    });
    step25bOk = rt1.status >= 200 && rt1.status < 300;
    check("25b: 1 turn sent to IN_PROGRESS attempt (not finished)", step25bOk, rt1.status);
  } else {
    check("25b: 1 turn sent to IN_PROGRESS attempt (not finished)", false, "no attemptId from 25a");
  }

  // 25c. Student dashboard -> IN_PROGRESS attempt must appear (S4-GAL-RESUME required).
  // This check will fail until Gal lands dashboard IN_PROGRESS extension.
  const sd25 = await call("GET", `/dashboard/student/${studentUserId}`, { token: studentToken });
  const inProgressArr = Array.isArray(sd25.data?.inProgressSimulations) ? sd25.data.inProgressSimulations : [];
  const inProgressEntry = inProgressArr.find((s) => s.attemptId === resumeAttemptId);
  check(
    "25c: IN_PROGRESS attempt visible in student dashboard with status=IN_PROGRESS (dep: S4-GAL-RESUME)",
    sd25.status === 200 && !!inProgressEntry && inProgressEntry.status === "IN_PROGRESS",
    `${sd25.status} found=${!!inProgressEntry} status=${inProgressEntry?.status}`,
  );

  // 25d. GET /simulations/:attemptId/transcript -> contains the prior turn.
  // This uses the already-live transcript endpoint; no Gal dep needed.
  let step25dOk = false;
  if (resumeAttemptId && step25bOk) {
    const rtResp = await call("GET", `/simulations/${resumeAttemptId}/transcript`, { token: studentToken });
    const rtItems = Array.isArray(rtResp.data) ? rtResp.data : [];
    step25dOk = rtResp.status === 200 && rtItems.length > 0 && typeof rtItems[0]?.turnIndex === "number";
    check(
      "25d: transcript for IN_PROGRESS attempt contains prior turn",
      step25dOk,
      `${rtResp.status} turns=${rtItems.length} firstTurnIndex=${rtItems[0]?.turnIndex}`,
    );
  } else {
    check("25d: transcript for IN_PROGRESS attempt contains prior turn", false, "skipped (25a or 25b failed)");
  }

  // ---------------------------------------------------------------------------
  // 29-34. ARC FLOW (S5-ADI-ARC-E2E) -- 3-session arc end-to-end
  //    Uses seeded student2 (no prior COMPLETED attempts -- arc starts at session 1).
  //    Steps 30 and 32: ArcSessionSummary row is verified INDIRECTLY (script is
  //    HTTP-only; no endpoint exposes ArcSessionSummary). The next session's
  //    attempt-create carrying sessionNumber=2 (step 31) and sessionNumber=3 (step 33)
  //    proves completedCount incremented, which requires finishAttempt +
  //    arcWriterService.writeSessionSummary to have completed. Direct row checks
  //    are covered by arc-coherence.integration.spec.ts (C1-T1, C1-T2).
  // ---------------------------------------------------------------------------

  // Login student2 (pre-flight; not a separate check step)
  const s2l = await call("POST", "/auth/invite-login", { body: STUDENT2 });
  const student2Token = s2l.data?.accessToken;

  // 29. Arc session 1: create (assert sessionNumber=1) + 1 turn + finish (assert COMPLETED)
  const arc1 = await call("POST", `/assignments/${ASSIGNMENT_ID}/attempts`, {
    token: student2Token, body: { language: "he" },
  });
  const arc1Id = arc1.data?.id ?? null;
  if (arc1Id) {
    await call("POST", `/simulations/${arc1Id}/turn`, {
      token: student2Token, body: { studentMessage: "שלום, כיצד אתה מרגיש היום?", language: "he" },
    });
  }
  const arc1fin = arc1Id
    ? await call("POST", `/simulations/${arc1Id}/finish`, { token: student2Token, body: {} })
    : { status: 0, data: null };
  check(
    "29: arc session-1 attempt (sessionNumber=1) + finish -> COMPLETED",
    s2l.status === 200 &&
      arc1.status >= 200 && arc1.status < 300 &&
      arc1.data?.sessionNumber === 1 &&
      arc1fin.data?.status === "COMPLETED",
    `login=${s2l.status} create=${arc1.status} sessionNumber=${arc1.data?.sessionNumber} finish=${arc1fin.data?.status}`,
  );

  // 30. ArcSessionSummary for session 1 -- INDIRECT VARIANT
  //     No HTTP endpoint exposes ArcSessionSummary. COMPLETED proves arc writer was triggered.
  //     Step 31 (sessionNumber=2 on next create) confirms completedCount incremented,
  //     completing the indirect proof. Direct row: arc-coherence.integration.spec.ts C1-T1.
  check(
    "30: session-1 arc summary (indirect) -- COMPLETED confirms arc writer triggered; direct row in integration suite",
    arc1fin.data?.status === "COMPLETED",
    `arc1 finishedStatus=${arc1fin.data?.status}`,
  );

  // 31. Start session 2 -> assert attempt-create 2xx and sessionNumber=2 (count=1, max=3)
  const arc2 = await call("POST", `/assignments/${ASSIGNMENT_ID}/attempts`, {
    token: student2Token, body: { language: "he" },
  });
  check(
    "31: arc session-2 attempt-create -> 2xx, sessionNumber=2",
    arc2.status >= 200 && arc2.status < 300 && arc2.data?.sessionNumber === 2,
    `${arc2.status} sessionNumber=${arc2.data?.sessionNumber}`,
  );
  const arc2Id = arc2.data?.id ?? null;

  // 32. Send 1 turn, finish session 2 -> COMPLETED
  //     ArcSessionSummary indirect: step 33 (sessionNumber=3) confirms completedCount=2.
  //     Direct row: arc-coherence.integration.spec.ts C1-T2.
  if (arc2Id) {
    await call("POST", `/simulations/${arc2Id}/turn`, {
      token: student2Token, body: { studentMessage: "המשך מהפגישה הקודמת", language: "he" },
    });
  }
  const arc2fin = arc2Id
    ? await call("POST", `/simulations/${arc2Id}/finish`, { token: student2Token, body: {} })
    : { status: 0, data: null };
  check(
    "32: session-2 finish -> COMPLETED (summary indirect: step-33 sessionNumber=3 confirms arc writer ran)",
    arc2fin.status >= 200 && arc2fin.status < 300 && arc2fin.data?.status === "COMPLETED",
    `${arc2fin.status} status=${arc2fin.data?.status}`,
  );

  // 33. Start session 3 -> assert sessionNumber=3 (count=2, max=3).
  //     Then finish session 3 so completedCount=3 before step 34 cap test.
  const arc3 = await call("POST", `/assignments/${ASSIGNMENT_ID}/attempts`, {
    token: student2Token, body: { language: "he" },
  });
  check(
    "33: arc session-3 attempt-create -> 2xx, sessionNumber=3 (count=2, max=3)",
    arc3.status >= 200 && arc3.status < 300 && arc3.data?.sessionNumber === 3,
    `${arc3.status} sessionNumber=${arc3.data?.sessionNumber}`,
  );
  const arc3Id = arc3.data?.id ?? null;
  // Finish session 3 so completedCount=3 for the step 34 cap assertion.
  if (arc3Id) {
    await call("POST", `/simulations/${arc3Id}/turn`, {
      token: student2Token, body: { studentMessage: "פגישה שלישית ואחרונה", language: "he" },
    });
    await call("POST", `/simulations/${arc3Id}/finish`, { token: student2Token, body: {} });
  }

  // 34. Attempt session 4 -> 403 ARC_COMPLETE (count=3 >= max=3)
  const arc4 = await call("POST", `/assignments/${ASSIGNMENT_ID}/attempts`, {
    token: student2Token, body: { language: "he" },
  });
  check(
    "34: arc session-4 blocked -> 403 ARC_COMPLETE (count=3, max=3)",
    arc4.status === 403 && arc4.data?.code === "ARC_COMPLETE",
    `${arc4.status} code=${arc4.data?.code}`,
  );

  const passed = results.filter((r) => r.ok).length;
  console.log(`\nE2E GOLDEN PATH: ${passed}/${results.length} PASS`);
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((e) => { console.error("E2E crashed:", e); process.exit(2); });
