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

  const passed = results.filter((r) => r.ok).length;
  console.log(`\nE2E GOLDEN PATH: ${passed}/${results.length} PASS`);
  process.exit(passed === results.length ? 0 : 1);
}

main().catch((e) => { console.error("E2E crashed:", e); process.exit(2); });
