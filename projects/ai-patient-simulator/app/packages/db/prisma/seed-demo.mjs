/**
 * seed-demo.mjs -- Demo seed: Adam demo teacher account + one synthetic student
 *
 * DEMO-C4: ALL data is 100% synthetic (domain: *.synthetic.test). No real PII.
 * DEMO-C8: adam.demo@synthetic.test is assigned TEACHER role (NOT SYSTEM_ADMIN).
 *          FLAG FOR RAMBO: GR-016 DEMO-C8 reads "student-role only"; task owner
 *          directed TEACHER so Adam can see the teacher dashboard. Rambo must
 *          explicitly confirm TEACHER is acceptable before go-live.
 * DEMO-C7: DEMO_TEACHER_PASSWORD comes from env only; never hardcoded in this file.
 *
 * Run (local, needs .env.local with DATABASE_URL + DEMO_TEACHER_PASSWORD):
 *   pnpm --filter @aps/db seed:demo
 *
 * Run (hosted, env vars already in environment -- no dotenv wrapper):
 *   pnpm --filter @aps/db seed:demo:hosted
 *
 * Idempotent: upsert on fixed IDs + delete-then-create role assignments.
 * Prerequisite: RE-3 seed (seed.mjs) must have run first (creates college + course1).
 */

import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Load generated Prisma client (CJS module) -- same pattern as seed.mjs
const { PrismaClient } = require(
  path.join(__dirname, "../src/generated/index.js"),
);

// bcrypt is a native CJS addon -- hoisted from apps/api devDependencies
const bcrypt = require("bcrypt");

const BCRYPT_ROUNDS = 12;

// ---------------------------------------------------------------------------
// RE-3 seed IDs (must already exist -- run seed.mjs first)
// ---------------------------------------------------------------------------
const RE3 = {
  college: "seed-college-0001-0000-0000-000000000001",
  course1: "seed-course--0001-0000-0000-000000000001",
};

// ---------------------------------------------------------------------------
// Fixed IDs for demo accounts -- guarantees idempotency across re-runs
// ---------------------------------------------------------------------------
const DEMO_IDS = {
  demoTeacher: "demo-user---0001-0000-0000-000000000001",
  demoStudent: "demo-user---0002-0000-0000-000000000002",
};

// ---------------------------------------------------------------------------
// Demo student credentials -- SYNTHETIC THROWAWAY, NOT SECRETS.
// Hardcoded here by the same convention as RE-3 student credentials in seed.mjs.
// These values may be relayed to Adam directly by the owner.
// ---------------------------------------------------------------------------
const DEMO_STUDENT = {
  email:       "demo-student-01@synthetic.test",
  displayName: "Demo Student 01",
  inviteToken: "invite-tok-demo-student-01",
  accessCode:  "code-demo-s01",
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const demoTeacherEmail    = process.env.DEMO_TEACHER_EMAIL ?? "adam.demo@synthetic.test";
  const demoTeacherPassword = process.env.DEMO_TEACHER_PASSWORD;

  if (!demoTeacherPassword) {
    throw new Error(
      "[seed-demo] DEMO_TEACHER_PASSWORD env var is required.\n" +
      "  Local:  set it in .env.local (gitignored)\n" +
      "  Hosted: set it as a secret in the Render dashboard\n" +
      "  NEVER hardcode it in this file (DEMO-C7 / red line 5)."
    );
  }

  const prisma = new PrismaClient();

  try {
    console.log("[seed-demo] Starting demo seed...");
    console.log("[seed-demo] Teacher email:", demoTeacherEmail);

    // Confirm RE-3 base data exists (seed.mjs must run first)
    const college = await prisma.college.findUnique({ where: { id: RE3.college } });
    const course1 = await prisma.course.findUnique({ where: { id: RE3.course1 } });
    if (!college || !course1) {
      throw new Error(
        "[seed-demo] RE-3 base data not found (college=" + RE3.college +
        ", course1=" + RE3.course1 + ").\n" +
        "  Run 'pnpm --filter @aps/db seed' (or seed:hosted) before seed:demo."
      );
    }
    console.log("[seed-demo] RE-3 base data confirmed.");

    // Hash credentials (bcrypt, 12 rounds)
    console.log("[seed-demo] Hashing credentials (rounds=" + BCRYPT_ROUNDS + ")...");
    const [teacherHash, studentCodeHash] = await Promise.all([
      bcrypt.hash(demoTeacherPassword, BCRYPT_ROUNDS),
      bcrypt.hash(DEMO_STUDENT.accessCode, BCRYPT_ROUNDS),
    ]);
    console.log("[seed-demo] Hashing done.");

    // -- Upsert demo teacher --
    await prisma.user.upsert({
      where: { id: DEMO_IDS.demoTeacher },
      create: {
        id:           DEMO_IDS.demoTeacher,
        email:        demoTeacherEmail,
        displayName:  "Adam (Demo Teacher)",
        passwordHash: teacherHash,
      },
      update: {
        email:        demoTeacherEmail,
        passwordHash: teacherHash,
      },
    });
    console.log("[seed-demo] Demo teacher upserted:", demoTeacherEmail);

    // -- Upsert demo student --
    await prisma.user.upsert({
      where: { id: DEMO_IDS.demoStudent },
      create: {
        id:          DEMO_IDS.demoStudent,
        email:       DEMO_STUDENT.email,
        displayName: DEMO_STUDENT.displayName,
        inviteToken: DEMO_STUDENT.inviteToken,
        accessCode:  studentCodeHash,
      },
      update: {
        inviteToken: DEMO_STUDENT.inviteToken,
        accessCode:  studentCodeHash,
      },
    });
    console.log("[seed-demo] Demo student upserted:", DEMO_STUDENT.email);

    // -- Role assignments: delete any existing for demo user IDs, then recreate --
    await prisma.userRoleAssignment.deleteMany({
      where: { userId: { in: [DEMO_IDS.demoTeacher, DEMO_IDS.demoStudent] } },
    });

    await prisma.userRoleAssignment.createMany({
      data: [
        // DEMO-C8 FLAG: TEACHER role, NOT SYSTEM_ADMIN. Rambo confirm before go-live.
        {
          userId:    DEMO_IDS.demoTeacher,
          role:      "TEACHER",
          scopeType: "COURSE",
          scopeId:   RE3.course1,  // CC-Y2-PILOT (same course as RE-3 students + assignment)
        },
        {
          userId:    DEMO_IDS.demoStudent,
          role:      "STUDENT",
          scopeType: "COURSE",
          scopeId:   RE3.course1,
        },
      ],
    });
    console.log("[seed-demo] Role assignments created (TEACHER on course1 + STUDENT on course1).");

    // Row counts for DEMO-C4 spot-check output
    const [userCount, roleCount] = await Promise.all([
      prisma.user.count(),
      prisma.userRoleAssignment.count(),
    ]);
    console.log("[seed-demo] Total users after demo seed:", userCount);
    console.log("[seed-demo] Total role assignments after demo seed:", roleCount);

    // -- DEMO-C4 spot-check output (all emails must be *.synthetic.test) --
    const allUsers = await prisma.user.findMany({ select: { id: true, email: true } });
    const nonSynthetic = allUsers.filter((u) => !u.email.endsWith("@synthetic.test"));
    if (nonSynthetic.length > 0) {
      console.error("[seed-demo] DEMO-C4 VIOLATION: non-synthetic email(s) found:");
      for (const u of nonSynthetic) {
        console.error("  id=" + u.id + " email=" + u.email);
      }
      throw new Error("[seed-demo] DEMO-C4 check failed -- non-synthetic data in DB. Do NOT go live.");
    }
    console.log("[seed-demo] DEMO-C4 spot-check PASS: all " + allUsers.length + " user emails are @synthetic.test.");

    // Print demo credentials for owner
    console.log("\n========================================================");
    console.log("  DEMO SEED COMPLETE -- SYNTHETIC CREDENTIALS (DEMO)");
    console.log("========================================================");
    console.log("  DEMO TEACHER (role: TEACHER, scope: CC-Y2-PILOT course1)");
    console.log("    email:    " + demoTeacherEmail);
    console.log("    password: [set via DEMO_TEACHER_PASSWORD env -- not printed here]");
    console.log("              Owner relays password to Adam directly.");
    console.log("");
    console.log("  DEMO STUDENT (role: STUDENT, scope: CC-Y2-PILOT course1)");
    console.log("    email (not used for login): " + DEMO_STUDENT.email);
    console.log("    inviteToken: " + DEMO_STUDENT.inviteToken);
    console.log("    accessCode:  " + DEMO_STUDENT.accessCode);
    console.log("    (Synthetic/throwaway -- owner may relay to Adam directly)");
    console.log("========================================================\n");
    console.log("[seed-demo] Done.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("[seed-demo] FAILED:", err);
  process.exit(1);
});
