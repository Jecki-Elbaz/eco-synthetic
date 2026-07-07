/**
 * RE-3 Seed -- synthetic pilot data (no real PII)
 *
 * Run via:  pnpm --filter @aps/db seed
 * (dotenv-cli loads .env.local before node executes this script)
 *
 * Idempotent: uses fixed UUIDs + upsert / delete-then-create so re-runs are safe.
 * All handles, emails, tokens are synthetic throwaway values.
 */

import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Load generated Prisma client (CJS module)
const { PrismaClient } = require(
  path.join(__dirname, "../src/generated/index.js"),
);

// bcrypt is a native CJS addon
const bcrypt = require("bcrypt");

const BCRYPT_ROUNDS = 12;

// ---------------------------------------------------------------------------
// Fixed IDs -- guarantees idempotency across re-runs
// ---------------------------------------------------------------------------
const IDS = {
  college: "seed-college-0001-0000-0000-000000000001",
  course1: "seed-course--0001-0000-0000-000000000001",
  course2: "seed-course--0002-0000-0000-000000000002",

  userAdmin:    "seed-user---0001-0000-0000-000000000001",
  userTeacher1: "seed-user---0002-0000-0000-000000000002",
  userTeacher2: "seed-user---0003-0000-0000-000000000003",
  userStudent1: "seed-user---0004-0000-0000-000000000004",
  userStudent2: "seed-user---0005-0000-0000-000000000005",
  userStudent3: "seed-user---0006-0000-0000-000000000006",
  userStudent4: "seed-user---0007-0000-0000-000000000007",

  groundTruth:      "seed-gt----0001-0000-0000-000000000001",
  simTemplate:      "seed-tpl---0001-0000-0000-000000000001",
  rubricVersion:    "seed-rv----0001-0000-0000-000000000001",
  criterion1:       "seed-crit--0001-0000-0000-000000000001",
  criterion2:       "seed-crit--0002-0000-0000-000000000002",
  assignment:       "seed-asgn--0001-0000-0000-000000000001",
  creditLedger:     "seed-ledg--0001-0000-0000-000000000001",
};

// ---------------------------------------------------------------------------
// Plaintext credentials (synthetic only -- printed at end for manual testing)
// ---------------------------------------------------------------------------
const CREDS = {
  adminPassword:   "AdminPass!re3",
  teacher1Password:"TeacherPass1!re3",
  teacher2Password:"TeacherPass2!re3",
  student1Code:    "code-s01-re3",
  student2Code:    "code-s02-re3",
  student3Code:    "code-s03-re3",
  student4Code:    "code-s04-re3",
};

const INVITE_TOKENS = {
  student1: "invite-tok-student-01-re3",
  student2: "invite-tok-student-02-re3",
  student3: "invite-tok-student-03-re3",
  student4: "invite-tok-student-04-re3",
};

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  const prisma = new PrismaClient();

  try {
    console.log("[seed] Starting RE-3 synthetic seed...");

    // -- Hash all credentials upfront (bcrypt is slow; do in parallel)
    console.log("[seed] Hashing credentials (bcrypt rounds=" + BCRYPT_ROUNDS + ")...");
    const [
      adminHash,
      teacher1Hash,
      teacher2Hash,
      student1Hash,
      student2Hash,
      student3Hash,
      student4Hash,
    ] = await Promise.all([
      bcrypt.hash(CREDS.adminPassword,    BCRYPT_ROUNDS),
      bcrypt.hash(CREDS.teacher1Password, BCRYPT_ROUNDS),
      bcrypt.hash(CREDS.teacher2Password, BCRYPT_ROUNDS),
      bcrypt.hash(CREDS.student1Code,     BCRYPT_ROUNDS),
      bcrypt.hash(CREDS.student2Code,     BCRYPT_ROUNDS),
      bcrypt.hash(CREDS.student3Code,     BCRYPT_ROUNDS),
      bcrypt.hash(CREDS.student4Code,     BCRYPT_ROUNDS),
    ]);
    console.log("[seed] Hashing done.");

    // -----------------------------------------------------------------------
    // 1. College
    // -----------------------------------------------------------------------
    const college = await prisma.college.upsert({
      where: { id: IDS.college },
      create: {
        id:     IDS.college,
        name:   "Gome Gevim -- pilot",
        slug:   "gome-gevim-pilot",
        locale: "he",
      },
      update: {
        name:   "Gome Gevim -- pilot",
        slug:   "gome-gevim-pilot",
      },
    });
    console.log("[seed] College upserted:", college.id);

    // -----------------------------------------------------------------------
    // 2. Courses
    // -----------------------------------------------------------------------
    const course1 = await prisma.course.upsert({
      where: { id: IDS.course1 },
      create: {
        id:        IDS.course1,
        collegeId: IDS.college,
        name:      "Clinical Communication -- Year 2",
        code:      "CC-Y2-PILOT",
      },
      update: {
        name: "Clinical Communication -- Year 2",
        code: "CC-Y2-PILOT",
      },
    });

    const course2 = await prisma.course.upsert({
      where: { id: IDS.course2 },
      create: {
        id:        IDS.course2,
        collegeId: IDS.college,
        name:      "Advanced Patient Interaction -- Year 3",
        code:      "API-Y3-PILOT",
      },
      update: {
        name: "Advanced Patient Interaction -- Year 3",
        code: "API-Y3-PILOT",
      },
    });
    console.log("[seed] Courses upserted:", course1.id, course2.id);

    // -----------------------------------------------------------------------
    // 3. Users
    //    UserRoleAssignment has a polymorphic scopeId (no DB FK).
    //    We delete-then-recreate role assignments to keep idempotency clean.
    // -----------------------------------------------------------------------

    // Admin
    await prisma.user.upsert({
      where: { id: IDS.userAdmin },
      create: {
        id:           IDS.userAdmin,
        email:        "admin@synthetic.test",
        displayName:  "Synthetic Admin",
        passwordHash: adminHash,
      },
      update: { passwordHash: adminHash },
    });

    // Teachers
    await prisma.user.upsert({
      where: { id: IDS.userTeacher1 },
      create: {
        id:           IDS.userTeacher1,
        email:        "teacher1@synthetic.test",
        displayName:  "Synthetic Teacher One",
        passwordHash: teacher1Hash,
      },
      update: { passwordHash: teacher1Hash },
    });

    await prisma.user.upsert({
      where: { id: IDS.userTeacher2 },
      create: {
        id:           IDS.userTeacher2,
        email:        "teacher2@synthetic.test",
        displayName:  "Synthetic Teacher Two",
        passwordHash: teacher2Hash,
      },
      update: { passwordHash: teacher2Hash },
    });

    // Students
    const studentDefs = [
      { id: IDS.userStudent1, email: "student-01@synthetic.test", displayName: "Synthetic Student 01", inviteToken: INVITE_TOKENS.student1, accessCodeHash: student1Hash },
      { id: IDS.userStudent2, email: "student-02@synthetic.test", displayName: "Synthetic Student 02", inviteToken: INVITE_TOKENS.student2, accessCodeHash: student2Hash },
      { id: IDS.userStudent3, email: "student-03@synthetic.test", displayName: "Synthetic Student 03", inviteToken: INVITE_TOKENS.student3, accessCodeHash: student3Hash },
      { id: IDS.userStudent4, email: "student-04@synthetic.test", displayName: "Synthetic Student 04", inviteToken: INVITE_TOKENS.student4, accessCodeHash: student4Hash },
    ];

    for (const s of studentDefs) {
      await prisma.user.upsert({
        where: { id: s.id },
        create: {
          id:          s.id,
          email:       s.email,
          displayName: s.displayName,
          inviteToken: s.inviteToken,
          accessCode:  s.accessCodeHash,
        },
        update: {
          inviteToken: s.inviteToken,
          accessCode:  s.accessCodeHash,
        },
      });
    }
    console.log("[seed] Users upserted (1 admin, 2 teachers, 4 students).");

    // -----------------------------------------------------------------------
    // 4. Role assignments (delete existing seed rows, then recreate)
    //    @@unique([userId, role, scopeType, scopeId]) makes upsert tricky
    //    (the compound key is not the PK). Delete-by-userId then create is
    //    simpler and safe since these are seed-owned rows.
    // -----------------------------------------------------------------------
    const seedUserIds = [
      IDS.userAdmin, IDS.userTeacher1, IDS.userTeacher2,
      IDS.userStudent1, IDS.userStudent2, IDS.userStudent3, IDS.userStudent4,
    ];
    await prisma.userRoleAssignment.deleteMany({
      where: { userId: { in: seedUserIds } },
    });

    const roleAssignments = [
      // Admin -- COLLEGE scope
      { userId: IDS.userAdmin,    role: "SYSTEM_ADMIN", scopeType: "COLLEGE", scopeId: IDS.college },
      // Teachers -- COURSE scope (teacher1 -> both courses; teacher2 -> course2)
      { userId: IDS.userTeacher1, role: "TEACHER",      scopeType: "COURSE",  scopeId: IDS.course1 },
      { userId: IDS.userTeacher1, role: "TEACHER",      scopeType: "COURSE",  scopeId: IDS.course2 },
      { userId: IDS.userTeacher2, role: "TEACHER",      scopeType: "COURSE",  scopeId: IDS.course2 },
      // Students -- COURSE scope -> course1
      { userId: IDS.userStudent1, role: "STUDENT", scopeType: "COURSE", scopeId: IDS.course1 },
      { userId: IDS.userStudent2, role: "STUDENT", scopeType: "COURSE", scopeId: IDS.course1 },
      { userId: IDS.userStudent3, role: "STUDENT", scopeType: "COURSE", scopeId: IDS.course1 },
      { userId: IDS.userStudent4, role: "STUDENT", scopeType: "COURSE", scopeId: IDS.course1 },
    ];

    await prisma.userRoleAssignment.createMany({ data: roleAssignments });
    console.log("[seed] Role assignments created:", roleAssignments.length);

    // -----------------------------------------------------------------------
    // 5. GroundTruth (must exist before SimulationTemplate due to 1-1 relation)
    //    SimulationTemplate.groundTruthId references GroundTruth.id.
    //    GroundTruth.simulationTemplateId is also unique but is the back-link.
    //    We create GroundTruth first with a placeholder simulationTemplateId,
    //    then create the template, then patch the back-link.
    // -----------------------------------------------------------------------

    // Delete existing seed template + ground truth (FK-safe order)
    // Order: RubricCriterion -> Assignment -> RubricVersion -> SimulationTemplate -> GroundTruth
    const existingTemplate = await prisma.simulationTemplate.findUnique({
      where: { id: IDS.simTemplate },
    });

    if (existingTemplate) {
      // Remove any Attempts (+ their children) created against the seeded assignment,
      // so re-seeding works even after simulations have run against this data
      // (Attempt.assignmentId FKs the assignment we are about to delete).
      const seededAttempts = await prisma.attempt.findMany({
        where: { assignmentId: IDS.assignment },
        select: { id: true },
      });
      const attemptIds = seededAttempts.map((a) => a.id);
      if (attemptIds.length > 0) {
        const whereAttempt = { attemptId: { in: attemptIds } };
        await prisma.message.deleteMany({ where: whereAttempt });
        await prisma.patientStateLog.deleteMany({ where: whereAttempt });
        await prisma.usageLog.deleteMany({ where: whereAttempt });
        await prisma.debriefChat.deleteMany({ where: whereAttempt });
        await prisma.evaluation.deleteMany({ where: whereAttempt });
        await prisma.supportTicket.deleteMany({ where: whereAttempt });
        await prisma.attempt.deleteMany({ where: { id: { in: attemptIds } } });
      }
      // Delete rubric criteria first
      await prisma.rubricCriterion.deleteMany({
        where: { rubricVersionId: IDS.rubricVersion },
      });
      // Delete assignment
      await prisma.assignment.deleteMany({
        where: { id: IDS.assignment },
      });
      // Delete rubric version
      await prisma.rubricVersion.deleteMany({
        where: { id: IDS.rubricVersion },
      });
      // Delete template (disconnects GT back-link)
      await prisma.simulationTemplate.delete({ where: { id: IDS.simTemplate } });
      // Delete ground truth
      await prisma.groundTruth.deleteMany({ where: { id: IDS.groundTruth } });
    } else {
      // Still clean up orphaned GT if it exists
      await prisma.groundTruth.deleteMany({ where: { id: IDS.groundTruth } });
    }

    // Create GroundTruth (simulationTemplateId is @unique but nullable-path -- Prisma
    // requires the field because of the relation. We set it to IDS.simTemplate even
    // before the template row exists; Postgres will enforce the FK only if there is one,
    // but the schema comment says GroundTruth.simulationTemplate is the owning side of
    // a 1-1 where SimulationTemplate owns the FK (groundTruthId). So GroundTruth rows
    // have simulationTemplateId as a back-reference. Create GT first, then template.)
    const groundTruth = await prisma.groundTruth.create({
      data: {
        id:                  IDS.groundTruth,
        simulationTemplateId: IDS.simTemplate,
        knownFacts: {
          diagnosis: "Generalised Anxiety Disorder",
          keyHistory: "First presentation, referred by GP",
          medications: [],
        },
        disclosureAllowList: {
          items: ["presenting_problem", "sleep_disturbance", "work_stress"],
        },
        escalationRules: {
          trigger: "explicit_self_harm_mention",
          action:  "surface_hard_off_ramp",
        },
        hardOffRampText:
          "I need to pause our conversation. " +
          "If you are in distress right now, please contact your supervisor immediately. " +
          "[HARD STOP -- simulated patient will not continue this exchange]",
        version: 1,
      },
    });
    console.log("[seed] GroundTruth created:", groundTruth.id);

    // Create SimulationTemplate referencing the GT
    const simTemplate = await prisma.simulationTemplate.create({
      data: {
        id:             IDS.simTemplate,
        title:          "GAD Intake -- Pilot Case 01",
        version:        1,
        clinicalModel:  "CBT",
        studentLevel:   "year2",
        challengeLevel: 2,
        riskLevel:      "medium",
        languages:      ["he", "en"],
        personaPrompt:
          "You are Dana, a 32-year-old software engineer presenting with generalised anxiety. " +
          "You are initially guarded but warm up when the student shows genuine empathy. " +
          "Respond in the language the student uses. Clinical model: CBT. Mode: intake.",
        groundTruthId:  IDS.groundTruth,
      },
    });
    console.log("[seed] SimulationTemplate created:", simTemplate.id);

    // -----------------------------------------------------------------------
    // 6. RubricVersion (PUBLISHED) + RubricCriteria
    // -----------------------------------------------------------------------
    const rubricVersion = await prisma.rubricVersion.create({
      data: {
        id:                   IDS.rubricVersion,
        simulationTemplateId: IDS.simTemplate,
        version:              1,
        status:               "PUBLISHED",
        publishedAt:          new Date(),
      },
    });
    console.log("[seed] RubricVersion created:", rubricVersion.id);

    await prisma.rubricCriterion.createMany({
      data: [
        {
          id:             IDS.criterion1,
          rubricVersionId: IDS.rubricVersion,
          labelKey:       "empathy",
          labels:         { he: "אמפתיה", en: "Empathy" },
          weight:         0.4,
          maxScore:       10,
          scoringAnchors: {
            1:  "No acknowledgement of patient emotion",
            5:  "Basic reflection; some labelling",
            10: "Consistent, accurate empathic attunement throughout",
          },
          formativeOnly: false,
        },
        {
          id:             IDS.criterion2,
          rubricVersionId: IDS.rubricVersion,
          labelKey:       "risk_assessment",
          labels:         { he: "הערכת סיכון", en: "Risk Assessment" },
          weight:         0.3,
          maxScore:       10,
          scoringAnchors: {
            1:  "Risk not explored at all",
            5:  "Risk mentioned but not followed up",
            10: "Systematic, sensitive risk inquiry with appropriate response",
          },
          formativeOnly: true,  // formative-only risk criterion as required
        },
      ],
    });
    console.log("[seed] RubricCriteria created (2).");

    // -----------------------------------------------------------------------
    // 7. Assignment (course1 + the published rubric)
    // -----------------------------------------------------------------------
    const assignment = await prisma.assignment.create({
      data: {
        id:                   IDS.assignment,
        courseId:             IDS.course1,
        simulationTemplateId: IDS.simTemplate,
        rubricVersionId:      IDS.rubricVersion,
        challengeLevel:       2,
        languagesAllowed:     ["he", "en"],
        maxAttempts:          2,
        maxTurns:             50,
      },
    });
    console.log("[seed] Assignment created:", assignment.id);

    // -----------------------------------------------------------------------
    // 8. CreditLedger (college-level + course-level)
    // -----------------------------------------------------------------------
    // CreditEntry FKs CreditLedger (per-turn deductions + admin actions) -- clear first.
    await prisma.creditEntry.deleteMany({ where: { ledgerId: IDS.creditLedger } });
    await prisma.creditLedger.deleteMany({ where: { id: IDS.creditLedger } });

    const ledger = await prisma.creditLedger.create({
      data: {
        id:        IDS.creditLedger,
        collegeId: IDS.college,
        courseId:  IDS.course1,
        // balance well above the hard limit so credit governance permits normal turns.
        // (creditBalance = balance - hardLimit must be > 0, else the input gate blocks
        // every turn with CREDIT_HARD_LIMIT.)
        balance:   100000,
        softLimit: 20000,
        hardLimit: 2000,
      },
    });
    console.log("[seed] CreditLedger created:", ledger.id);

    // -----------------------------------------------------------------------
    // Row count summary
    // -----------------------------------------------------------------------
    const counts = await Promise.all([
      prisma.college.count(),
      prisma.course.count(),
      prisma.user.count(),
      prisma.userRoleAssignment.count(),
      prisma.simulationTemplate.count(),
      prisma.groundTruth.count(),
      prisma.rubricVersion.count(),
      prisma.rubricCriterion.count(),
      prisma.assignment.count(),
      prisma.creditLedger.count(),
    ]);

    console.log("\n[seed] Row counts after seed:");
    console.log("  College:              " + counts[0]);
    console.log("  Course:               " + counts[1]);
    console.log("  User:                 " + counts[2]);
    console.log("  UserRoleAssignment:   " + counts[3]);
    console.log("  SimulationTemplate:   " + counts[4]);
    console.log("  GroundTruth:          " + counts[5]);
    console.log("  RubricVersion:        " + counts[6]);
    console.log("  RubricCriterion:      " + counts[7]);
    console.log("  Assignment:           " + counts[8]);
    console.log("  CreditLedger:         " + counts[9]);

    // -----------------------------------------------------------------------
    // Synthetic login handles -- PRINTED FOR MANUAL TESTING ONLY
    // These are throwaway synthetic values defined in this script.
    // -----------------------------------------------------------------------
    console.log("\n========================================================");
    console.log("  SYNTHETIC TEST CREDENTIALS (RE-3 seed -- throwaway)");
    console.log("========================================================");
    console.log("  SYSTEM_ADMIN");
    console.log("    email:    admin@synthetic.test");
    console.log("    password: " + CREDS.adminPassword);
    console.log("");
    console.log("  TEACHER 1 (courses: CC-Y2-PILOT + API-Y3-PILOT)");
    console.log("    email:    teacher1@synthetic.test");
    console.log("    password: " + CREDS.teacher1Password);
    console.log("");
    console.log("  TEACHER 2 (course: API-Y3-PILOT)");
    console.log("    email:    teacher2@synthetic.test");
    console.log("    password: " + CREDS.teacher2Password);
    console.log("");
    console.log("  STUDENTS (course: CC-Y2-PILOT)");
    console.log("    student-01  inviteToken: " + INVITE_TOKENS.student1 + "  accessCode: " + CREDS.student1Code);
    console.log("    student-02  inviteToken: " + INVITE_TOKENS.student2 + "  accessCode: " + CREDS.student2Code);
    console.log("    student-03  inviteToken: " + INVITE_TOKENS.student3 + "  accessCode: " + CREDS.student3Code);
    console.log("    student-04  inviteToken: " + INVITE_TOKENS.student4 + "  accessCode: " + CREDS.student4Code);
    console.log("========================================================\n");

    console.log("[seed] Done.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error("[seed] FAILED:", err);
  process.exit(1);
});
