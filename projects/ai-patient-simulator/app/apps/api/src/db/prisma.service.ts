// PrismaService -- lifecycle-managed Prisma client.
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@aps/db";

// Supabase project ref for the aps-demo pooler (demo deploy only).
const APS_DEMO_POOLER_REF = "hxuxcpigvrylsxaviobh";

/**
 * Supabase's connection pooler requires a tenant-qualified username of the
 * form `postgres.<project-ref>`. A DATABASE_URL configured with a bare
 * `postgres` user against a `*.pooler.supabase.com` host (a common mistake)
 * fails authentication. Normalise it so the demo connects regardless of how
 * the env value was entered. Credentials are never logged; a correctly-formed
 * or non-pooler URL is returned unchanged.
 */
function normalizePoolerUrl(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  try {
    const u = new URL(raw);
    if (u.hostname.endsWith(".pooler.supabase.com") && u.username === "postgres") {
      u.username = `postgres.${APS_DEMO_POOLER_REF}`;
      return u.toString();
    }
  } catch {
    // Not a parseable URL -- leave untouched; Prisma will surface the error.
  }
  return raw;
}

// Normalise at import time, before PrismaClient is constructed, so the base
// client (datasource url = env("DATABASE_URL")) picks up the corrected value.
{
  const fixed = normalizePoolerUrl(process.env.DATABASE_URL);
  if (fixed && fixed !== process.env.DATABASE_URL) {
    process.env.DATABASE_URL = fixed;
  }
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit(): Promise<void> {
    // Do not hard-crash the whole service if the initial connect fails
    // (free-tier cold start / pooler warmup). Prisma connects lazily on the
    // first query, so the HTTP server still binds and the exact DB error is
    // surfaced in logs instead of an opaque process exit.
    try {
      await this.$connect();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(
        "[PrismaService] initial $connect failed; continuing with lazy connect:",
        (err as Error).message,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
