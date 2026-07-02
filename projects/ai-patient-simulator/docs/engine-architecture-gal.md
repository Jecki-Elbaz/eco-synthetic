# APS -- AI Patient Engine Architecture
# Author: Gal (Lead Developer) | Date: 2026-06-29 | Task: Sprint 1 design deliverable
# Requester: Ido (VP R&D) | Status: DRAFT -- for Ido review; not for external sharing
# Scope: pilot-minimal, 1-Sep-2026 target. Design only -- no code execution this doc.
# Grounded in: feasibility-ido.md, requirements-baseline.md, sme-domain-assessment.md

---

## 1. Monorepo Scaffold Spec

### 1.1 Root Layout

```
aps/                            <- monorepo root
  apps/
    web/                        <- Next.js 14 app (student + teacher + admin UI)
    api/                        <- NestJS app (REST + WebSocket server)
  packages/
    db/                         <- Prisma schema + generated client + migrations
    shared-types/               <- TypeScript interfaces shared by web + api
    engine/                     <- AI patient engine (pure TS, no framework dep)
    engine-test-harness/        <- deterministic stubs for engine testing (no live LLM)
  infra/
    docker/                     <- docker-compose for local dev (postgres, redis)
    scripts/                    <- seed, migration-run, health-check scripts
  .env.example                  <- placeholder keys only; no real values [red line 1]
  turbo.json                    <- Turborepo build pipeline
  package.json                  <- workspace root (pnpm workspaces)
  tsconfig.base.json
```

### 1.2 Package Boundaries

| Package | Depends on | Never imports from |
|---------|------------|--------------------|
| db | (none) | engine, web |
| shared-types | (none) | db, engine, web, api |
| engine | shared-types | db (reads via api service layer only), web |
| api | db, engine, shared-types | web |
| web | shared-types | db, engine (calls api over HTTP/WS) |
| engine-test-harness | engine, shared-types | db, api, web |

Boundary enforcement: path aliases in tsconfig + ESLint import/no-restricted-paths rules.

### 1.3 Tech Versions (pinned -- do not float)

- Node: 20.x LTS
- Next.js: 14.x (App Router)
- NestJS: 10.x
- TypeScript: 5.4.x
- Prisma: 5.x
- PostgreSQL: 15.x
- Redis: 7.x
- pnpm: 9.x
- Turborepo: 2.x

### 1.4 Env / Config Strategy

Three-tier config: defaults in code -> `.env.example` (repo, placeholders only) ->
`.env.local` / `.env.production` (local/CI, gitignored, never committed).

Config is loaded via a typed `AppConfig` class in `api/src/config/app.config.ts`.
No raw `process.env` access outside config module.

```
# .env.example -- PLACEHOLDERS ONLY. No real values here.
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/aps_dev
REDIS_URL=redis://HOST:6379
S3_ENDPOINT=https://ENDPOINT
S3_BUCKET=BUCKET_NAME
S3_ACCESS_KEY_ID=KEY_ID_PLACEHOLDER
S3_SECRET_ACCESS_KEY=SECRET_PLACEHOLDER
LLM_PROVIDER_API_KEY=API_KEY_PLACEHOLDER     # provider TBD (APS-004 gate)
LLM_PROVIDER_BASE_URL=https://PROVIDER_API_URL
JWT_SECRET=JWT_SECRET_PLACEHOLDER
SUPPORT_EMAIL_FROM=no-reply@PLACEHOLDER
SUPPORT_EMAIL_SMTP_HOST=PLACEHOLDER
```

S3-compatible storage: used for audio dictation uploads (pre-signed PUT) and attachment
blobs. Local dev: use MinIO in docker-compose. Production provider: blocked on APS-004.

---

## 2. Database Schema v1 (Prisma)

All models in `packages/db/schema.prisma`. PostgreSQL dialect.
Timestamps: `createdAt DateTime @default(now())`, `updatedAt DateTime @updatedAt` on
every model (omitted below for brevity but REQUIRED on all).

### 2.1 Org Hierarchy

```prisma
model College {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  locale      String   @default("he")
  courses     Course[]
  users       UserRoleAssignment[]
  creditAlloc CreditLedger[]
}

model Course {
  id          String   @id @default(uuid())
  collegeId   String
  college     College  @relation(fields: [collegeId], references: [id])
  name        String
  code        String
  assignments Assignment[]
  users       UserRoleAssignment[]
  creditAlloc CreditLedger[]
}

// Programme: stub only -- no UI in pilot
model Programme {
  id          String   @id @default(uuid())
  collegeId   String
  name        String
}

model Assignment {
  id                  String   @id @default(uuid())
  courseId            String
  course              Course   @relation(fields: [courseId], references: [id])
  simulationTemplateId String
  simulationTemplate  SimulationTemplate @relation(fields: [simulationTemplateId], references: [id])
  rubricVersionId     String
  rubricVersion       RubricVersion @relation(fields: [rubricVersionId], references: [id])
  challengeLevel      Int      // 1-5
  languagesAllowed    String[] // ["he","en"]
  maxAttempts         Int      @default(1)
  timeLimitMinutes    Int?
  maxTurns            Int      @default(75)
  openAt              DateTime?
  closeAt             DateTime?
  attempts            Attempt[]
}

model Attempt {
  id              String   @id @default(uuid())
  assignmentId    String
  assignment      Assignment @relation(fields: [assignmentId], references: [id])
  userId          String
  user            User     @relation(fields: [userId], references: [id])
  status          AttemptStatus @default(NOT_STARTED)
  language        String   // "he" | "en"
  startedAt       DateTime?
  finishedAt      DateTime?
  turnCount       Int      @default(0)
  tokenInputTotal Int      @default(0)
  tokenOutputTotal Int     @default(0)
  messages        Message[]
  patientStateLogs PatientStateLog[]
  evaluation      Evaluation?
  debriefMessages DebriefChat[]
  usageLogs       UsageLog[]
  supportTickets  SupportTicket[]
}

enum AttemptStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  ABANDONED
  SUBMITTED
  EVALUATED
  TECHNICALLY_AFFECTED
  TECHNICAL_FAILURE_CONFIRMED
  RETRY_AUTHORISED
}
```

### 2.2 User + RBAC

```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  displayName  String
  locale       String   @default("he")
  inviteToken  String?  @unique
  accessCode   String?
  passwordHash String?
  roleAssignments UserRoleAssignment[]
  attempts     Attempt[]
}

model UserRoleAssignment {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  role      UserRole
  scopeType ScopeType
  scopeId   String   // College.id or Course.id depending on scopeType
  college   College? @relation(fields: [scopeId], references: [id])
  course    Course?  @relation(fields: [scopeId], references: [id])

  @@unique([userId, role, scopeType, scopeId])
}

enum UserRole {
  STUDENT
  TEACHER
  SYSTEM_ADMIN
  // PROGRAMME_MANAGER and COLLEGE_MANAGER are data-model stubs; no UI in pilot
  PROGRAMME_MANAGER
  COLLEGE_MANAGER
}

enum ScopeType {
  COLLEGE
  COURSE
}
```

### 2.3 Competency Library

```prisma
model Competency {
  id          String   @id @default(uuid())
  externalKey String   @unique  // language-independent key (e.g. "ACT_DEFUSION_01")
  scope       CompetencyScope @default(CORE)
  parentId    String?
  parent      Competency? @relation("CompetencyHierarchy", fields: [parentId], references: [id])
  children    Competency[] @relation("CompetencyHierarchy")
  labels      Json     // { "he": "...", "en": "..." }
  status      CompetencyStatus @default(DRAFT)
  rubricCriteria RubricCriterion[]
}

enum CompetencyScope { CORE COLLEGE PROGRAMME COURSE SIMULATION }
enum CompetencyStatus { DRAFT LOCAL SUBMITTED APPROVED_PROGRAMME APPROVED_COLLEGE CORE DEPRECATED }
```

### 2.4 Simulation Template + Ground Truth

```prisma
model SimulationTemplate {
  id               String   @id @default(uuid())
  title            String
  version          Int      @default(1)
  clinicalModel    String   // "ACT" | "LI_CBT" | "CBT" | ...
  studentLevel     String
  challengeLevel   Int      // 1-5 default
  riskLevel        String   // "low" | "moderate" | "high"
  languages        String[]
  personaPrompt    String   // generated by guided builder (APS-REQ-029)
  groundTruthId    String   @unique
  groundTruth      GroundTruth @relation(fields: [groundTruthId], references: [id])
  triggerRules     TriggerRule[]
  assignments      Assignment[]
  rubricVersions   RubricVersion[]
}

// GroundTruth: the authoritative clinical-facts file for a simulation.
// LOCKED per assignment (versioned with SimulationTemplate version).
// The guard model reads this at runtime to validate every AI response.
model GroundTruth {
  id                   String   @id @default(uuid())
  simulationTemplateId String   @unique
  simulationTemplate   SimulationTemplate?
  knownFacts           Json     // structured: { facts: [...], doNotInvent: [...], riskBoundaries: [...] }
  disclosureAllowList  Json     // { disclosed: [], locked: [], triggers: [] }
  escalationRules      Json
  hardOffRampText      String   // always: "I am a simulated training patient..." (APS-REQ hard rule)
  version              Int      @default(1)
}

model TriggerRule {
  id                   String   @id @default(uuid())
  simulationTemplateId String
  simulationTemplate   SimulationTemplate @relation(fields: [simulationTemplateId], references: [id])
  triggerCondition     String   // interaction analyser dimension + threshold, e.g. "empathy >= 0.7"
  action               String   // e.g. "UNLOCK:FACT_ID_07"
  priority             Int      @default(0)
}
```

### 2.5 Rubric

```prisma
model RubricVersion {
  id                   String   @id @default(uuid())
  simulationTemplateId String
  simulationTemplate   SimulationTemplate @relation(fields: [simulationTemplateId], references: [id])
  version              Int
  status               RubricStatus @default(DRAFT)
  publishedAt          DateTime?
  criteria             RubricCriterion[]
  assignments          Assignment[]

  @@unique([simulationTemplateId, version])
}

enum RubricStatus { DRAFT PUBLISHED }

model RubricCriterion {
  id              String   @id @default(uuid())
  rubricVersionId String
  rubricVersion   RubricVersion @relation(fields: [rubricVersionId], references: [id])
  competencyId    String?
  competency      Competency? @relation(fields: [competencyId], references: [id])
  labelKey        String
  labels          Json     // { "he": "...", "en": "..." }
  weight          Float
  maxScore        Float
  scoringAnchors  Json     // { "1": "...", "2": "...", ... }
  formativeOnly   Boolean  @default(false) // risk-awareness criterion: true (Sami req)
}
```

### 2.6 Simulation Runtime -- Core Tables

```prisma
// One row per student message and one row per AI response in an attempt.
model Message {
  id              String   @id @default(uuid())
  attemptId       String
  attempt         Attempt  @relation(fields: [attemptId], references: [id])
  role            MessageRole  // STUDENT | PATIENT
  turnNumber      Int
  originalText    String
  translatedText  String?  // auto-translated; original preserved
  nonVerbalCues   String?  // e.g. "[Long pause] [Looks away]"
  language        String
  sentAt          DateTime @default(now())
}

enum MessageRole { STUDENT PATIENT }

// HARD-PERSIST state per turn (Sami requirement -- not soft/prompt-only).
// One row written at the end of every turn, before response delivery.
// Re-injected as structured block at start of every subsequent turn.
model PatientStateLog {
  id               String   @id @default(uuid())
  attemptId        String
  attempt          Attempt  @relation(fields: [attemptId], references: [id])
  turnNumber       Int
  // Quantitative state dimensions (all 0.0-1.0 scale unless noted)
  trust            Float
  openness         Float
  emotionalActiv   Float    // emotional activation
  avoidanceLevel   Float
  defensiveness    Float
  allianceQuality  Float
  disclosureReady  Float
  riskRelevance    Float
  // Disclosure tracking
  unlockedFactIds  String[] // GroundTruth fact IDs disclosed so far
  pendingTriggers  String[] // trigger rule IDs that have fired but not yet resolved
  // Interaction analyser output for this turn (stored for audit + evaluation)
  analyserOutput   Json     // see Section 3.3 for schema
  // Challenge-level modulation snapshot
  challengeLevel   Int
  // Guard model outcome for this turn
  guardResult      String   // "PASS" | "REGENERATE" | "BLOCKED"
  guardDetail      String?  // reason if not PASS
  // Context window management
  summarisedUpTo   Int?     // last turn number included in sliding-window summary
  contextSummary   String?  // persisted summary injected above sliding window

  @@unique([attemptId, turnNumber])
}
```

### 2.7 Evaluation + Debrief

```prisma
model Evaluation {
  id              String   @id @default(uuid())
  attemptId       String   @unique
  attempt         Attempt  @relation(fields: [attemptId], references: [id])
  rubricVersionId String
  status          EvalStatus @default(PENDING)
  structuredScores Json    // { criterionId: { score, maxScore, evidence: [turnNums], notes } }
  transcriptHighlights Json // [{ type: "STRONG"|"MISSED"|"RISK_FLAG", turnNumber, note }]
  overallSummary  String?
  teacherOverride Boolean  @default(false)
  teacherNotes    String?
  publishedAt     DateTime?
  generatedAt     DateTime?
}

enum EvalStatus { PENDING DRAFT TEACHER_REVIEW PUBLISHED }

model DebriefChat {
  id          String   @id @default(uuid())
  attemptId   String
  attempt     Attempt  @relation(fields: [attemptId], references: [id])
  role        DebriefRole  // STUDENT | SUPERVISOR
  turnNumber  Int
  text        String
  citedTurns  Int[]    // transcript turn references cited in this message
  sentAt      DateTime @default(now())
}

enum DebriefRole { STUDENT SUPERVISOR }
```

### 2.8 Technical Support + Academic Safety

```prisma
model SupportTicket {
  id            String   @id @default(uuid())
  attemptId     String?
  attempt       Attempt? @relation(fields: [attemptId], references: [id])
  userId        String
  issueCategory String
  status        TicketStatus @default(OPEN)
  metadata      Json     // browser, device, role, error codes; NO clinical transcript
  diagnosticLogId String? @unique
  diagnosticLog DiagnosticLog? @relation(fields: [diagnosticLogId], references: [id])
  emailSent     Boolean  @default(false)
  emailSentAt   DateTime?
}

enum TicketStatus { OPEN ESCALATED RESOLVED }

// Stored separately from ticket; referenced by ID only in ticket. Redacted of tokens/transcripts.
model DiagnosticLog {
  id            String   @id @default(uuid())
  payload       Json     // error codes, API status, mic status, attempt state -- no patient text
  capturedAt    DateTime @default(now())
  supportTicket SupportTicket?
}
```

### 2.9 Credit Ledger + Usage Log

```prisma
model CreditLedger {
  id            String   @id @default(uuid())
  collegeId     String
  college       College  @relation(fields: [collegeId], references: [id])
  courseId      String?
  course        Course?  @relation(fields: [courseId], references: [id])
  balance       Int      @default(0)
  softLimit     Int?
  hardLimit     Int?
  entries       CreditEntry[]
}

model CreditEntry {
  id            String   @id @default(uuid())
  ledgerId      String
  ledger        CreditLedger @relation(fields: [ledgerId], references: [id])
  adminId       String?
  activityType  String   // "SIMULATION_RUN" | "FEEDBACK_GEN" | "ADMIN_ADJUST" | ...
  delta         Int      // negative = deduction, positive = credit add
  reason        String?
  timestamp     DateTime @default(now())
}

model UsageLog {
  id              String   @id @default(uuid())
  attemptId       String
  attempt         Attempt  @relation(fields: [attemptId], references: [id])
  eventType       String   // "SIMULATION_TURN" | "GUARD_PASS" | "EVAL_GEN" | "DEBRIEF_TURN" | ...
  modelId         String?  // provider-specific model name; null if stub
  inputTokens     Int      @default(0)
  outputTokens    Int      @default(0)
  dictationSeconds Int     @default(0)
  estimatedCostUsd Float?
  timestamp       DateTime @default(now())
}
```

### 2.10 Phase 1b Schema Stubs (runtime deferred; tables exist now to avoid migration over student data)

```prisma
// PersonaBranch: base persona per course (teacher-defined).
// No runtime logic in pilot; table exists so Phase 1b does not migrate over live data.
model PersonaBranch {
  id                   String   @id @default(uuid())
  simulationTemplateId String
  courseId             String
  label                String
  baseState            Json     // initial PatientState snapshot at session 0
  studentHistories     StudentPersonaHistory[]
}

// StudentPersonaHistory: per-student branched history (JSONB).
// Highest-sensitivity PII field: notableStudentMistakes (Sami Section 9.5).
// Eyal MUST review schema and retention policy before Phase 1b activates this.
// 12-month retention per APS-REQ-160; field-level access: TEACHER + SYSTEM_ADMIN only.
model StudentPersonaHistory {
  id               String   @id @default(uuid())
  personaBranchId  String
  personaBranch    PersonaBranch @relation(fields: [personaBranchId], references: [id])
  userId           String
  sessionCount     Int      @default(0)
  // JSONB fields -- all Phase 1b; null in pilot
  sessionSummaries         Json?  // [{ sessionN, summary, allianceEnd, symptomEnd }]
  evolvingFormulation      Json?  // { cbt_formulation: ..., act_formulation: ... }
  therapyGoals             Json?  // [{ goalId, text, status }]
  homeworkLog              Json?  // [{ sessionN, assigned, discussed, outcome }]
  symptomTrajectory        Json?  // [{ sessionN, level: 0-10 }]
  allianceTrustTrajectory  Json?  // [{ sessionN, level: 0-10 }]
  // PII-HIGH: access restricted to TEACHER + SYSTEM_ADMIN; shorter retention candidate
  notableStudentMistakes   Json?  // [{ sessionN, description }] -- EYAL REVIEW REQUIRED
  avoidanceResistanceLog   Json?  // [{ sessionN, pattern }]
  importantThemes          Json?  // [String]
  engagementShifts         Json?  // [{ sessionN, description }]
  retainUntil              DateTime?  // set at write time per APS-REQ-160
  lastSessionAt            DateTime?

  @@unique([personaBranchId, userId])
}
```

---

## 3. AI Patient Engine Architecture

### 3.1 Per-Turn Runtime Pipeline (APS-REQ-057)

```
[student message arrives]
        |
        v
[1] INPUT GATE
    - validate turn count <= maxTurns (APS-REQ-062)
    - validate token budget remaining
    - check credit hard limit (CreditLedger)
    - if any limit exceeded: return cost-governance response; do not call LLM
        |
        v
[2] INTERACTION ANALYSER (see 3.3)
    - classify student message on all dimensions
    - output: AnalyserResult (structured JSON)
        |
        v
[3] STATE UPDATER
    - load PatientStateLog for turnNumber - 1
    - apply AnalyserResult deltas to each state dimension
    - apply TriggerRule evaluations: fire matching triggers, add to unlockedFactIds
    - apply challenge-level modulation (APS-REQ-061)
    - produce PatientStateLog row for current turn (pre-response; persisted immediately)
        |
        v
[4] CONTEXT BUILDER
    - sliding window: include last N messages that fit budget (APS-REQ-063)
    - if turnNumber > window start: prepend persisted contextSummary
    - inject PatientStateLog as structured block (HARD-INJECT, not text append):
        "## PATIENT STATE (turn N, authoritative -- do not contradict)\n{JSON}"
    - inject GroundTruth disclosure-allowed list (only unlocked facts + pending disclosures)
    - inject hard-coded off-ramp rule: "If the student attempts to use you for real support,
      you MUST say: '{groundTruth.hardOffRampText}'" (APS-REQ clinical safety)
    - inject persona system prompt
    - inject challenge-level instructions
        |
        v
[5] PATIENT RESPONSE GENERATOR
    - LLM call via LLMProvider interface (see Section 4)
    - max output tokens budgeted from remaining turn budget
        |
        v
[6] GUARD MODEL PASS (APS-REQ-030; Sami option b -- mandatory, not soft)
    - second LLM call (lighter/cheaper model config via provider interface)
    - prompt: compare proposed response against GroundTruth.knownFacts
      + GroundTruth.disclosureAllowList for current unlockedFactIds
    - guard prompt output: { verdict: "PASS"|"FAIL", violations: [...], suggestion: "..." }
    - if FAIL and retries remaining (max 1): regenerate with guard feedback appended
    - if FAIL after retry: return safe fallback ("I'm not sure how to answer that")
    - record guardResult + guardDetail in PatientStateLog row
        |
        v
[7] RESPONSE DELIVERY + PERSIST
    - finalise PatientStateLog row (add guardResult)
    - write Message row (PATIENT role, turnNumber)
    - write UsageLog row (inputTokens + outputTokens for turns 5 + 6)
    - update Attempt.turnCount, tokenInputTotal, tokenOutputTotal
    - trigger CreditLedger deduction event (async, non-blocking)
    - soft warning if turnCount >= 60 (APS-REQ-062)
    - return response to client
        |
        v
[if turnCount >= maxTurns or student clicks Finish]
[8] SESSION CLOSE
    - set Attempt.status = COMPLETED, finishedAt = now
    - if contextSummary update due: call summariser (see 3.5) -- async
    - trigger evaluation pipeline (async)
```

### 3.2 PatientStateLog -- Hard-Persist + Re-Inject Pattern

The state machine must never be soft (prompt-only) per Sami (sme-domain-assessment.md s.1).

Rules:
1. PatientStateLog row is written to the database BEFORE the patient response is sent.
   If the DB write fails, the turn fails safe (no response returned; client retries).
2. Each turn's CONTEXT BUILDER reads the prior-turn PatientStateLog row from DB,
   not from in-memory/session state. This means any server restart or reconnect
   produces the same state -- enabling session resume (APS-REQ-065) automatically.
3. The PatientStateLog is injected as a structured JSON block at a fixed position
   in the system prompt, labelled authoritative. It is NOT appended at the end
   or interpolated into prose -- it is a hard-typed block the LLM is instructed
   to never contradict.
4. Quantitative dimensions (trust, openness, etc.) are stored as floats in the DB.
   The state updater calculates deltas from AnalyserResult using a rule table
   (not LLM inference for the delta itself). Rate-of-change caps are applied
   per challenge level. Sami's risk: state should not jump unrealistically.
   Cap spec (initial; clinical advisor must review before go-live):
     - per-turn delta max: 0.10 on any dimension
     - trust / openness: can only increase if analyser empathy >= THRESHOLD
     - avoidanceLevel / defensiveness: can only decrease if analyser reduces pressure
5. The contextSummary field stores a running summary of turns outside the sliding
   window. It is generated by the summariser (Section 3.5) and stored in the last
   PatientStateLog row before the window boundary. It is re-injected above the
   sliding window on every turn.

### 3.3 Interaction Analyser Design (APS-REQ-059)

The analyser is a separate LLM call (or structured prompt) that runs BEFORE state update.
It classifies the student message on all required dimensions and returns a typed JSON object.

Input: student message text + current PatientStateLog + last N turns of context.

Output schema (AnalyserResult):
```typescript
interface AnalyserResult {
  empathy: number;             // 0.0 - 1.0
  questionType: QuestionType;  // "open" | "closed" | "leading" | "clarifying" | "none"
  specificity: number;         // 0.0 - 1.0
  validation: number;          // 0.0 - 1.0 (acknowledgement of patient experience)
  actConsistency: number;      // 0.0 - 1.0 (ACT therapeutic stance)
  prematureAdvice: boolean;    // flag: advice given before adequate exploration
  pressure: number;            // 0.0 - 1.0 (pushing patient before ready)
  missedCues: string[];        // list of cue types the student did not respond to
  riskRelevance: boolean;      // student addressed a risk/ethics cue
  therapeuticStance: TherapeuticStance;  // "supportive" | "directive" | "avoidant" | ...
  turnLanguage: string;        // detected language of this turn
  rawClassification: string;   // full LLM output (stored for audit)
}
```

The analyser output drives:
- State updater delta table (e.g. empathy >= 0.7 -> trust += 0.05)
- TriggerRule evaluation (rules reference analyserResult fields)
- Rubric evidence accumulation (stored in PatientStateLog.analyserOutput)
- Evaluation pipeline input (evaluation reads analyserOutput per turn)

ACCURACY NOTE (Sami, s.2 + s.5.2): interaction analyser accuracy in Hebrew is unvalidated.
The analyser must be tested with Hebrew clinical transcripts before graded use.
In the pilot (formative only), the analyser output is used for state and is shown to
teachers as a draft. Clinical advisor must review classification sample at 15 Aug rehearsal.

### 3.4 Ground-Truth Guard Model (APS-REQ-030; Sami option b)

Architecture principle: the guard model is a SEPARATE LLM call, not a prompt modifier.

Why separate call:
- The patient generator and the guard must not share the same context.
- The guard's job is adversarial: find what the generator should not have said.
- If the guard is in the same call, the LLM cannot reliably critique its own output.

Guard prompt structure:
```
SYSTEM: You are a clinical ground-truth auditor. Your only job is to check whether a
simulated patient response introduces clinical facts not present in the authorised
disclosure list below.

AUTHORISED FACTS (unlocked as of turn N):
{groundTruth.disclosureAllowList.unlocked at this turn}

DO-NOT-INVENT LIST:
{groundTruth.knownFacts.doNotInvent}

PROPOSED PATIENT RESPONSE:
{proposedResponse}

Output ONLY valid JSON: { "verdict": "PASS" | "FAIL", "violations": [], "suggestion": "" }
```

Guard model config: may use a lighter/cheaper model variant via the LLMProvider interface
(provider abstraction covers model-within-provider selection -- see Section 4).

Guard result actions:
- PASS: deliver response. Record guardResult = "PASS".
- FAIL (first occurrence): append guard.suggestion to regeneration prompt.
  Retry once. Record guardResult = "REGENERATE".
- FAIL (after retry): return safe fallback. Record guardResult = "BLOCKED".
  Log to DiagnosticLog (not to SupportTicket by default).

Version-locking: the GroundTruth version used for guarding is locked to the
SimulationTemplate version at Assignment creation (same as rubric version lock, APS-REQ-032).

Hard-coded off-ramp rule (Sami s.4.3; not an author setting -- always present):
The GroundTruth record includes a hardOffRampText field populated at template creation time:
"I am a simulated training patient. If you are experiencing real distress, please contact
[welfare resource]." The welfare resource token is filled at institution-configuration level.
This text is injected into every context build unconditionally. It is not guardable out.

### 3.5 Sliding-Window Memory + Summarisation (APS-REQ-063)

Window strategy:
- Maintain a rolling window of the last W turns in the LLM context.
- W is calculated per turn: (remainingTokenBudget - stateBlockSize - systemPromptSize)
  / avgTokensPerTurn. Min W = 4.
- Turns older than the window are replaced by the contextSummary.

Summarisation trigger:
- When the window slides past a new turn boundary, call the summariser.
- Summariser is a separate LLM call: "Summarise the following therapy session excerpt in
  third-person clinical note style, preserving: key disclosures made, student errors noted,
  patient emotional trajectory, turns N-M."
- Output stored in PatientStateLog.contextSummary of the boundary-turn row.
- All future context builds re-inject this summary above the sliding window.

On session resume: load the last PatientStateLog row. contextSummary + sliding window
start index are present. Context is rebuilt exactly as it was. No in-memory state required.

### 3.6 Cost Governance Hooks (APS-REQ-062)

Enforced in INPUT GATE (step 1) and RESPONSE DELIVERY (step 7):

```typescript
interface TurnBudget {
  maxTurns: number;           // default 75 (APS-REQ-062)
  softWarnTurns: number;      // default 60
  tokenBudgetPerSimulation: number;  // configurable per Assignment
  maxDictationSeconds: number; // 15 * 60 = 900
  maxDebriefQuestions: number; // 5-10
  maxGuardRetries: number;    // 1
}
```

Budget tracking is stateless per-call: sum from Attempt.tokenInputTotal +
Attempt.tokenOutputTotal (always fresh from DB). No in-memory accumulation.

Hard credit limit check: before INPUT GATE, query CreditLedger for courseId.
If balance <= 0 and no override active: block with "session unavailable" (APS-REQ-142).
Student never sees credit detail (APS-REQ-145).

---

## 4. LLM Provider Abstraction

### 4.1 Interface

The concrete provider is NOT chosen here. APS-004 gate (Rambo + Eyal + Lital) must clear
the provider before any live API calls. All engine code uses this interface only.

```typescript
// packages/engine/src/llm/provider.interface.ts

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMRequest {
  messages: LLMMessage[];
  maxOutputTokens: number;
  temperature: number;
  modelHint: ModelHint;  // caller declares intent; provider maps to actual model
  stream?: boolean;
}

export interface LLMResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  modelId: string;       // actual model used; recorded in UsageLog
  cached: boolean;       // prompt cache hit if provider supports it (APS-REQ-067)
}

// ModelHint: intent-based, not provider-specific. Provider maps to cheapest-fit.
export enum ModelHint {
  PATIENT_RESPONSE,  // main generation -- needs highest quality
  GUARD_PASS,        // guard model -- can be lighter
  ANALYSER,          // interaction analyser -- structured JSON output
  SUMMARISER,        // summarisation -- moderate quality
  EVALUATOR,         // post-simulation evaluation -- high quality
  DEBRIEF,           // debrief chat -- moderate quality
}

export interface LLMProvider {
  complete(req: LLMRequest): Promise<LLMResponse>;
  estimateCost(inputTokens: number, outputTokens: number, hint: ModelHint): number;
}
```

### 4.2 Provider Registration

A single active provider is registered at startup via dependency injection (NestJS DI).
The concrete implementation lives in `packages/engine/src/llm/providers/`.
A StubProvider (deterministic, no API calls) is the default for dev/test:

```
packages/engine/src/llm/providers/
  stub.provider.ts     <- deterministic; used in dev + CI (no API key needed)
  anthropic.provider.ts  <- wired when APS-004 clears Anthropic
  openai.provider.ts     <- wired when APS-004 clears OpenAI
  [future].provider.ts
```

The active provider is selected by the `LLM_PROVIDER` env var (e.g. "stub", "anthropic").
No hard-wired imports outside the provider directory. The engine module never imports
a concrete provider class directly -- only the interface.

### 4.3 Support/Debrief Isolation

The debrief chat and technical support assistant each use the same LLMProvider interface
but are called from separate NestJS modules with separate prompt contexts:
- DebriefModule: reads only Attempt.messages + Evaluation; never reads PatientStateLog
  or GroundTruth. Guardrail enforced at service layer (not just prompt instruction).
- SupportModule: has NO access to LLMProvider in pilot (deterministic only, APS-REQ-114).
  This is structural isolation, not prompt instruction (Sami s.4.4).

---

## 5. Open Questions and Risks for Ido

### RISK-1 (Critical): Guard model latency budget
Adding a guard LLM call per turn adds 500ms-2s of latency depending on provider and
model size. At challenge level 4-5 the patient response itself is longer, compounding
this. Total turn latency may feel slow. Options: (a) stream the patient response while
guard runs in parallel and gate delivery on guard pass (complex but fast-feeling);
(b) use a local/lighter guard model if provider offers one; (c) accept latency and
set user expectations. I need Ido's call on which to design for Sprint 2.

### RISK-2 (High): Rate-of-change caps need clinical calibration before Sprint 2 build
The state updater delta table (Section 3.2 rule 4) has placeholder thresholds. If these
are wrong, the patient either changes too fast (pedagogically misleading) or too slowly
(unresponsive). Sami is explicit: clinical advisor must define these. Without the named
advisor confirmed by end of Sprint 1, I cannot finalise the state updater in Sprint 2.
This is the direct link from the "named advisor" dependency to the build schedule.

### RISK-3 (High): APS-004 gate timing vs. Sprint 2 engine implementation
The engine is designed around the LLMProvider stub for Sprint 1. In Sprint 2, I will
implement the full turn pipeline including the guard model and interaction analyser.
Both require real LLM calls for accuracy testing. If APS-004 has not cleared a provider
by Sprint 2 start (2026-07-14), I can implement with stubs but cannot run accuracy
validation -- which means the 15 Aug rehearsal criterion (c) (analyser 70% on Hebrew)
cannot be met on time. APS-004 must close by 2026-07-11 (end Sprint 1) for Sprint 2
to stay on track.

### OPEN QUESTION for Ido:
Should the guard model use the same provider as the patient generator, or should we
design for a configurable second provider (e.g. a cheaper/faster model from a different
tier)? The interface supports this (ModelHint.GUARD_PASS), but the provider registration
currently assumes one active provider. I can extend to dual-provider config if Ido and
APS-004 results suggest that is useful. Decision needed before Sprint 2.

---

*Internal only. Not for external sharing. No secrets referenced. Design only -- no build started.*
*Next step: Ido reviews + clinical advisor engagement confirmed. Engine implementation starts Sprint 2.*
