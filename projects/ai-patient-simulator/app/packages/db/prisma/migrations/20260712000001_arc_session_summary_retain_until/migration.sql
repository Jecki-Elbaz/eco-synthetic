-- S7-GAL-RETAIN: add retainUntil to ArcSessionSummary
-- Retention policy (APS-022 / Eyal 2026-07-11): end-of-arc + 90 days.
-- Set by ArcWriterService on every session write. Nullable until first write.
-- Purge: WHERE retainUntil IS NOT NULL AND retainUntil < NOW().
-- Live purge cron deferred to pre-production (runner-hosted zero-token script).

-- AlterTable (additive only: no DROP, no rename, no backfill default)
ALTER TABLE "ArcSessionSummary" ADD COLUMN "retainUntil" TIMESTAMP(3);
