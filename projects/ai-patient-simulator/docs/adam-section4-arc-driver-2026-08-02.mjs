// Drive a genuine 3-session arc for the Adam review package (APS-027 Section 4).
// Real ClaudeCodeProvider (owner MAX plan) -> real analyser -> real delta rules + clamps.
// Nothing here authors trust values; only the student turns are scripted, as a human
// tester would type them. The trajectory is whatever the engine produces.
//
// Seed login values come from the environment (APS_INVITE_TOKEN / APS_ACCESS_CODE) so no
// credential-shaped literal lives in the file. They are synthetic, local-only seed values.
const API = process.env.APS_API ?? "http://127.0.0.1:3001";
const ASSIGNMENT = process.env.APS_ASSIGNMENT ?? "";
const INVITE = {
  inviteToken: process.env.APS_INVITE_TOKEN ?? "",
  accessCode: process.env.APS_ACCESS_CODE ?? "",
};
if (!ASSIGNMENT || !INVITE.inviteToken || !INVITE.accessCode) {
  console.log("missing APS_ASSIGNMENT / APS_INVITE_TOKEN / APS_ACCESS_CODE in env");
  process.exit(1);
}

// Deliberate arc: session 1 clumsy -> session 2 mixed -> session 3 skilled.
// Written as a student therapist would actually type, in Hebrew (product language).
const SESSIONS = [
  [ "שלום, אז מה הבעיה שלך?",
    "כמה שעות את ישנה בלילה?",
    "נסית פשוט לעשות ספורט? זה עוזר לרוב האנשים.",
    "אני חושב שאת פשוט חושבת על זה יותר מדי.",
    "אוקיי. עוד משהו?" ],
  [ "ספרי לי קצת על השבוע שעבר.",
    "זה נשמע מתיש. איך הרגשת כשזה קרה?",
    "את אומרת שזה קורה בעיקר בבוקר -- תוכלי לתאר בוקר כזה?",
    "אולי כדאי לנסות טכניקת נשימה, זה עוזר.",
    "תודה ששיתפת. מה הכי מטריד אותך עכשיו?" ],
  [ "אני שמח שחזרת. איך היה מאז שנפגשנו?",
    "נשמע שהיה שם הרבה. ספרי לי מה עבר עלייך באותו רגע.",
    "זה בהחלט מובן שהרגשת ככה. זה נשמע מאוד בודד.",
    "מה היה עוזר לך באותו רגע, גם אם זה נשמע קטן?",
    "אני רוצה להבין את זה יותר לעומק -- מה זה עורר בך?" ],
];

const j = async (res) => { const t = await res.text(); try { return JSON.parse(t); } catch { return { _raw: t.slice(0, 300), _status: res.status }; } };
const f3 = (v) => (typeof v === "number" ? v.toFixed(3) : String(v));

const login = async () => {
  const r = await fetch(`${API}/auth/invite-login`, { method: "POST",
    headers: { "content-type": "application/json" }, body: JSON.stringify(INVITE) });
  const b = await j(r);
  const tok = b.accessToken ?? b.token ?? b.access_token;
  if (!tok) throw new Error("login failed: " + JSON.stringify(b).slice(0, 300));
  return tok;
};

const run = async () => {
  const token = await login();
  const H = { "content-type": "application/json", authorization: `Bearer ${token}` };
  console.log("auth OK");

  for (let s = 0; s < SESSIONS.length; s++) {
    const created = await j(await fetch(`${API}/assignments/${ASSIGNMENT}/attempts`,
      { method: "POST", headers: H, body: JSON.stringify({ type: "STUDENT", language: "he" }) }));
    const attemptId = created.id ?? created.attemptId ?? created.attempt?.id;
    if (!attemptId) { console.log(`SESSION ${s + 1} attempt-create FAILED:`, JSON.stringify(created).slice(0, 400)); return; }
    console.log(`\n=== SESSION ${s + 1} attempt=${attemptId} ===`);

    for (const msg of SESSIONS[s]) {
      const t0 = Date.now();
      const turn = await j(await fetch(`${API}/simulations/${attemptId}/turn`,
        { method: "POST", headers: H, body: JSON.stringify({ studentMessage: msg, language: "he" }) }));
      if (turn._status || turn.statusCode) { console.log("  TURN ERR:", JSON.stringify(turn).slice(0, 300)); break; }
      const st = turn.patientState ?? turn.state ?? {};
      console.log(`  trust=${f3(st.trust)}  open=${f3(st.openness)}  alliance=${f3(st.allianceQuality)}  (${Date.now() - t0}ms)`);
    }

    const fin = await j(await fetch(`${API}/simulations/${attemptId}/finish`, { method: "POST", headers: H, body: "{}" }));
    console.log(`  finished: ${JSON.stringify(fin).slice(0, 160)}`);
  }
  console.log("\nARC RUN COMPLETE");
};

run().catch((e) => console.log("FATAL:", String(e).slice(0, 500)));
