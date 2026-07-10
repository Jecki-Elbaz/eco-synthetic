-- Migration: APS-014 m7 -- override audit delta context
-- Adds overrideAudit JSONB column to Evaluation.
-- Stores { previousStatus, newStatus, previousTeacherNotes, newTeacherNotes,
--          overriddenAt, overriddenBy } when a teacher override is performed.
-- Non-destructive: nullable column, default NULL. No existing rows affected.

-- AlterTable
ALTER TABLE "Evaluation" ADD COLUMN "overrideAudit" JSONB;
