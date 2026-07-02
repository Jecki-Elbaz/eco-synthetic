-- CreateEnum
CREATE TYPE "AttemptStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED', 'SUBMITTED', 'EVALUATED', 'TECHNICALLY_AFFECTED', 'TECHNICAL_FAILURE_CONFIRMED', 'RETRY_AUTHORISED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'TEACHER', 'SYSTEM_ADMIN', 'PROGRAMME_MANAGER', 'COLLEGE_MANAGER');

-- CreateEnum
CREATE TYPE "ScopeType" AS ENUM ('COLLEGE', 'COURSE');

-- CreateEnum
CREATE TYPE "CompetencyScope" AS ENUM ('CORE', 'COLLEGE', 'PROGRAMME', 'COURSE', 'SIMULATION');

-- CreateEnum
CREATE TYPE "CompetencyStatus" AS ENUM ('DRAFT', 'LOCAL', 'SUBMITTED', 'APPROVED_PROGRAMME', 'APPROVED_COLLEGE', 'CORE', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "RubricStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('STUDENT', 'PATIENT');

-- CreateEnum
CREATE TYPE "EvalStatus" AS ENUM ('PENDING', 'DRAFT', 'TEACHER_REVIEW', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "DebriefRole" AS ENUM ('STUDENT', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'ESCALATED', 'RESOLVED');

-- CreateTable
CREATE TABLE "College" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'he',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "College_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Programme" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Programme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "simulationTemplateId" TEXT NOT NULL,
    "rubricVersionId" TEXT NOT NULL,
    "challengeLevel" INTEGER NOT NULL,
    "languagesAllowed" TEXT[],
    "maxAttempts" INTEGER NOT NULL DEFAULT 1,
    "timeLimitMinutes" INTEGER,
    "maxTurns" INTEGER NOT NULL DEFAULT 75,
    "openAt" TIMESTAMP(3),
    "closeAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "AttemptStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "language" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "turnCount" INTEGER NOT NULL DEFAULT 0,
    "tokenInputTotal" INTEGER NOT NULL DEFAULT 0,
    "tokenOutputTotal" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'he',
    "inviteToken" TEXT,
    "accessCode" TEXT,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoleAssignment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "scopeType" "ScopeType" NOT NULL,
    "scopeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRoleAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Competency" (
    "id" TEXT NOT NULL,
    "externalKey" TEXT NOT NULL,
    "scope" "CompetencyScope" NOT NULL DEFAULT 'CORE',
    "parentId" TEXT,
    "labels" JSONB NOT NULL,
    "status" "CompetencyStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Competency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationTemplate" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "clinicalModel" TEXT NOT NULL,
    "studentLevel" TEXT NOT NULL,
    "challengeLevel" INTEGER NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "languages" TEXT[],
    "personaPrompt" TEXT NOT NULL,
    "groundTruthId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SimulationTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroundTruth" (
    "id" TEXT NOT NULL,
    "simulationTemplateId" TEXT NOT NULL,
    "knownFacts" JSONB NOT NULL,
    "disclosureAllowList" JSONB NOT NULL,
    "escalationRules" JSONB NOT NULL,
    "hardOffRampText" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroundTruth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TriggerRule" (
    "id" TEXT NOT NULL,
    "simulationTemplateId" TEXT NOT NULL,
    "triggerCondition" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TriggerRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricVersion" (
    "id" TEXT NOT NULL,
    "simulationTemplateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "status" "RubricStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RubricVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RubricCriterion" (
    "id" TEXT NOT NULL,
    "rubricVersionId" TEXT NOT NULL,
    "competencyId" TEXT,
    "labelKey" TEXT NOT NULL,
    "labels" JSONB NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "scoringAnchors" JSONB NOT NULL,
    "formativeOnly" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RubricCriterion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "turnNumber" INTEGER NOT NULL,
    "originalText" TEXT NOT NULL,
    "translatedText" TEXT,
    "nonVerbalCues" TEXT,
    "language" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientStateLog" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "turnNumber" INTEGER NOT NULL,
    "trust" DOUBLE PRECISION NOT NULL,
    "openness" DOUBLE PRECISION NOT NULL,
    "emotionalActiv" DOUBLE PRECISION NOT NULL,
    "avoidanceLevel" DOUBLE PRECISION NOT NULL,
    "defensiveness" DOUBLE PRECISION NOT NULL,
    "allianceQuality" DOUBLE PRECISION NOT NULL,
    "disclosureReady" DOUBLE PRECISION NOT NULL,
    "riskRelevance" DOUBLE PRECISION NOT NULL,
    "unlockedFactIds" TEXT[],
    "pendingTriggers" TEXT[],
    "analyserOutput" JSONB NOT NULL,
    "challengeLevel" INTEGER NOT NULL,
    "guardResult" TEXT NOT NULL,
    "guardDetail" TEXT,
    "summarisedUpTo" INTEGER,
    "contextSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientStateLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "rubricVersionId" TEXT NOT NULL,
    "status" "EvalStatus" NOT NULL DEFAULT 'PENDING',
    "structuredScores" JSONB NOT NULL,
    "transcriptHighlights" JSONB NOT NULL,
    "overallSummary" TEXT,
    "teacherOverride" BOOLEAN NOT NULL DEFAULT false,
    "teacherNotes" TEXT,
    "publishedAt" TIMESTAMP(3),
    "generatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DebriefChat" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "role" "DebriefRole" NOT NULL,
    "turnNumber" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "citedTurns" INTEGER[],
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DebriefChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT,
    "userId" TEXT NOT NULL,
    "issueCategory" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'OPEN',
    "metadata" JSONB NOT NULL,
    "diagnosticLogId" TEXT,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "emailSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosticLog" (
    "id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagnosticLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditLedger" (
    "id" TEXT NOT NULL,
    "collegeId" TEXT NOT NULL,
    "courseId" TEXT,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "softLimit" INTEGER,
    "hardLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditEntry" (
    "id" TEXT NOT NULL,
    "ledgerId" TEXT NOT NULL,
    "adminId" TEXT,
    "activityType" TEXT NOT NULL,
    "delta" INTEGER NOT NULL,
    "reason" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageLog" (
    "id" TEXT NOT NULL,
    "attemptId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "modelId" TEXT,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "dictationSeconds" INTEGER NOT NULL DEFAULT 0,
    "estimatedCostUsd" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonaBranch" (
    "id" TEXT NOT NULL,
    "simulationTemplateId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "baseState" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonaBranch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentPersonaHistory" (
    "id" TEXT NOT NULL,
    "personaBranchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sessionCount" INTEGER NOT NULL DEFAULT 0,
    "sessionSummaries" JSONB,
    "evolvingFormulation" JSONB,
    "therapyGoals" JSONB,
    "homeworkLog" JSONB,
    "symptomTrajectory" JSONB,
    "allianceTrustTrajectory" JSONB,
    "notableStudentMistakes" JSONB,
    "avoidanceResistanceLog" JSONB,
    "importantThemes" JSONB,
    "engagementShifts" JSONB,
    "retainUntil" TIMESTAMP(3),
    "lastSessionAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentPersonaHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "College_slug_key" ON "College"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_inviteToken_key" ON "User"("inviteToken");

-- CreateIndex
CREATE UNIQUE INDEX "UserRoleAssignment_userId_role_scopeType_scopeId_key" ON "UserRoleAssignment"("userId", "role", "scopeType", "scopeId");

-- CreateIndex
CREATE UNIQUE INDEX "Competency_externalKey_key" ON "Competency"("externalKey");

-- CreateIndex
CREATE UNIQUE INDEX "SimulationTemplate_groundTruthId_key" ON "SimulationTemplate"("groundTruthId");

-- CreateIndex
CREATE UNIQUE INDEX "GroundTruth_simulationTemplateId_key" ON "GroundTruth"("simulationTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "RubricVersion_simulationTemplateId_version_key" ON "RubricVersion"("simulationTemplateId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "PatientStateLog_attemptId_turnNumber_key" ON "PatientStateLog"("attemptId", "turnNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Evaluation_attemptId_key" ON "Evaluation"("attemptId");

-- CreateIndex
CREATE UNIQUE INDEX "SupportTicket_diagnosticLogId_key" ON "SupportTicket"("diagnosticLogId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentPersonaHistory_personaBranchId_userId_key" ON "StudentPersonaHistory"("personaBranchId", "userId");

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_simulationTemplateId_fkey" FOREIGN KEY ("simulationTemplateId") REFERENCES "SimulationTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_rubricVersionId_fkey" FOREIGN KEY ("rubricVersionId") REFERENCES "RubricVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attempt" ADD CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_college_scopeId_fkey" FOREIGN KEY ("scopeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRoleAssignment" ADD CONSTRAINT "UserRoleAssignment_course_scopeId_fkey" FOREIGN KEY ("scopeId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Competency" ADD CONSTRAINT "Competency_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Competency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationTemplate" ADD CONSTRAINT "SimulationTemplate_groundTruthId_fkey" FOREIGN KEY ("groundTruthId") REFERENCES "GroundTruth"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TriggerRule" ADD CONSTRAINT "TriggerRule_simulationTemplateId_fkey" FOREIGN KEY ("simulationTemplateId") REFERENCES "SimulationTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricVersion" ADD CONSTRAINT "RubricVersion_simulationTemplateId_fkey" FOREIGN KEY ("simulationTemplateId") REFERENCES "SimulationTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricCriterion" ADD CONSTRAINT "RubricCriterion_rubricVersionId_fkey" FOREIGN KEY ("rubricVersionId") REFERENCES "RubricVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RubricCriterion" ADD CONSTRAINT "RubricCriterion_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientStateLog" ADD CONSTRAINT "PatientStateLog_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DebriefChat" ADD CONSTRAINT "DebriefChat_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_diagnosticLogId_fkey" FOREIGN KEY ("diagnosticLogId") REFERENCES "DiagnosticLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedger" ADD CONSTRAINT "CreditLedger_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditLedger" ADD CONSTRAINT "CreditLedger_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditEntry" ADD CONSTRAINT "CreditEntry_ledgerId_fkey" FOREIGN KEY ("ledgerId") REFERENCES "CreditLedger"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageLog" ADD CONSTRAINT "UsageLog_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "Attempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonaBranch" ADD CONSTRAINT "PersonaBranch_simulationTemplateId_fkey" FOREIGN KEY ("simulationTemplateId") REFERENCES "SimulationTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentPersonaHistory" ADD CONSTRAINT "StudentPersonaHistory_personaBranchId_fkey" FOREIGN KEY ("personaBranchId") REFERENCES "PersonaBranch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
