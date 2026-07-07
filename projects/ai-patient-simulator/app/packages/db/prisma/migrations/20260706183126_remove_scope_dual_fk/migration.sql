-- Remove the dual foreign keys on UserRoleAssignment.scopeId.
-- scopeId is polymorphic (a College id when scopeType=COLLEGE, a Course id when
-- scopeType=COURSE). A single column cannot satisfy two hard FKs at once, so every
-- COURSE-scoped role insert violated UserRoleAssignment_college_scopeId_fkey.
-- Referential integrity for scopeId is now enforced in application code.

-- DropForeignKey
ALTER TABLE "UserRoleAssignment" DROP CONSTRAINT IF EXISTS "UserRoleAssignment_college_scopeId_fkey";

-- DropForeignKey
ALTER TABLE "UserRoleAssignment" DROP CONSTRAINT IF EXISTS "UserRoleAssignment_course_scopeId_fkey";
