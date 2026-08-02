// PrismaService -- lifecycle-managed Prisma client.
import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@aps/db";

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
