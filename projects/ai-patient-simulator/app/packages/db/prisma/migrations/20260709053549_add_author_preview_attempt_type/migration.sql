-- CreateEnum
CREATE TYPE "AttemptType" AS ENUM ('STUDENT', 'AUTHOR_PREVIEW');

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "type" "AttemptType" NOT NULL DEFAULT 'STUDENT';

-- AlterTable
ALTER TABLE "CreditEntry" ADD COLUMN     "deduction_reason" TEXT;
