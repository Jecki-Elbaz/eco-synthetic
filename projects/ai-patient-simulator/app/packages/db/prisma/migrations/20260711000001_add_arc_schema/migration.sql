-- Sprint 5 arc schema migration
-- S5-GAL-ARC-ENFORCE: add max_sessions to SimulationTemplate
-- S5-GAL-M6: add rubricLastReviewedAt to SimulationTemplate
-- S5-GAL-ARC-LOADER/ENFORCE: add sessionNumber to Attempt
-- S5-GAL-ARC-LOADER/WRITER: new ArcSessionSummary table

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "sessionNumber" INTEGER;

-- AlterTable
ALTER TABLE "SimulationTemplate" ADD COLUMN     "maxSessions" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "rubricLastReviewedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ArcSessionSummary" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "trustDeltaApplied" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalTrustLevel" DOUBLE PRECISION NOT NULL,
    "finalOpennessLevel" DOUBLE PRECISION NOT NULL,
    "finalAllianceLevel" DOUBLE PRECISION NOT NULL,
    "symptomMarkerState" JSONB NOT NULL DEFAULT '{}',
    "notableMomentsSummary" TEXT NOT NULL DEFAULT '',
    "sessionCompletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArcSessionSummary_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArcSessionSummary_userId_templateId_sessionNumber_key" ON "ArcSessionSummary"("userId", "templateId", "sessionNumber");
