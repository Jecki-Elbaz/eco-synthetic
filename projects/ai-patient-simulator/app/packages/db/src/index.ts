// @aps/db -- public exports
// Generated Prisma client re-exported from here.
// apps/api imports from "@aps/db", never directly from the generated path.

// NOTE: src/generated/ is created by `pnpm db:generate` (prisma generate).
// It is gitignored. Run `pnpm db:generate` after:
//   1. Installing dependencies (pnpm install)
//   2. Starting the database (docker-compose up -d postgres)
//   3. Setting DATABASE_URL in .env.local
//
// COMPILE-TIME STUB: This stub class satisfies all type requirements until
// prisma generate has been run. At runtime it will throw on $connect if
// the real generated client is not present. Replace this file's contents with
// the commented block at the bottom once prisma generate has been run.

// Stub interfaces that mirror the generated Prisma client shape.
// Only the models/operations used in the api are stubbed here.
// This allows the full monorepo to typecheck before first prisma generate.

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PrismaClientKnownRequestError extends Error {
  code: string;
  meta?: Record<string, unknown>;
}

// Minimal stub for a Prisma model delegate
interface ModelDelegate {
  findUnique: (args: any) => Promise<any>;
  findFirst: (args: any) => Promise<any>;
  findMany: (args: any) => Promise<any>;
  create: (args: any) => Promise<any>;
  createMany: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  updateMany: (args: any) => Promise<any>;
  upsert: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
  deleteMany: (args: any) => Promise<any>;
  count: (args?: any) => Promise<number>;
}

export class PrismaClient {
  readonly user: ModelDelegate = {} as ModelDelegate;
  readonly college: ModelDelegate = {} as ModelDelegate;
  readonly course: ModelDelegate = {} as ModelDelegate;
  readonly programme: ModelDelegate = {} as ModelDelegate;
  readonly assignment: ModelDelegate = {} as ModelDelegate;
  readonly attempt: ModelDelegate = {} as ModelDelegate;
  readonly userRoleAssignment: ModelDelegate = {} as ModelDelegate;
  readonly competency: ModelDelegate = {} as ModelDelegate;
  readonly simulationTemplate: ModelDelegate = {} as ModelDelegate;
  readonly groundTruth: ModelDelegate = {} as ModelDelegate;
  readonly triggerRule: ModelDelegate = {} as ModelDelegate;
  readonly rubricVersion: ModelDelegate = {} as ModelDelegate;
  readonly rubricCriterion: ModelDelegate = {} as ModelDelegate;
  readonly message: ModelDelegate = {} as ModelDelegate;
  readonly patientStateLog: ModelDelegate = {} as ModelDelegate;
  readonly evaluation: ModelDelegate = {} as ModelDelegate;
  readonly debriefChat: ModelDelegate = {} as ModelDelegate;
  readonly supportTicket: ModelDelegate = {} as ModelDelegate;
  readonly diagnosticLog: ModelDelegate = {} as ModelDelegate;
  readonly creditLedger: ModelDelegate = {} as ModelDelegate;
  readonly creditEntry: ModelDelegate = {} as ModelDelegate;
  readonly usageLog: ModelDelegate = {} as ModelDelegate;
  readonly personaBranch: ModelDelegate = {} as ModelDelegate;
  readonly studentPersonaHistory: ModelDelegate = {} as ModelDelegate;
  // S5-GAL-ARC-WRITER/LOADER: arc session summary table (added 2026-07-11)
  readonly arcSessionSummary: ModelDelegate = {} as ModelDelegate;

  async $connect(): Promise<void> {
    throw new Error(
      "PrismaClient stub: run `pnpm db:generate` and configure DATABASE_URL before connecting.",
    );
  }

  async $disconnect(): Promise<void> {
    // no-op in stub
  }

  async $transaction(operations: Promise<any>[] | ((prisma: any) => Promise<any>)): Promise<any> {
    if (Array.isArray(operations)) {
      return Promise.all(operations);
    }
    return operations(this);
  }
}

// Enum stubs
export const AttemptStatus = {
  NOT_STARTED: "NOT_STARTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  ABANDONED: "ABANDONED",
  SUBMITTED: "SUBMITTED",
  EVALUATED: "EVALUATED",
  TECHNICALLY_AFFECTED: "TECHNICALLY_AFFECTED",
  TECHNICAL_FAILURE_CONFIRMED: "TECHNICAL_FAILURE_CONFIRMED",
  RETRY_AUTHORISED: "RETRY_AUTHORISED",
} as const;

export const UserRole = {
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
  SYSTEM_ADMIN: "SYSTEM_ADMIN",
  PROGRAMME_MANAGER: "PROGRAMME_MANAGER",
  COLLEGE_MANAGER: "COLLEGE_MANAGER",
} as const;

export const ScopeType = {
  COLLEGE: "COLLEGE",
  COURSE: "COURSE",
} as const;

export const CompetencyScope = {
  CORE: "CORE",
  COLLEGE: "COLLEGE",
  PROGRAMME: "PROGRAMME",
  COURSE: "COURSE",
  SIMULATION: "SIMULATION",
} as const;

export const CompetencyStatus = {
  DRAFT: "DRAFT",
  LOCAL: "LOCAL",
  SUBMITTED: "SUBMITTED",
  APPROVED_PROGRAMME: "APPROVED_PROGRAMME",
  APPROVED_COLLEGE: "APPROVED_COLLEGE",
  CORE: "CORE",
  DEPRECATED: "DEPRECATED",
} as const;

export const RubricStatus = { DRAFT: "DRAFT", PUBLISHED: "PUBLISHED" } as const;
export const MessageRole = { STUDENT: "STUDENT", PATIENT: "PATIENT" } as const;
export const EvalStatus = {
  PENDING: "PENDING",
  DRAFT: "DRAFT",
  TEACHER_REVIEW: "TEACHER_REVIEW",
  PUBLISHED: "PUBLISHED",
} as const;
export const DebriefRole = { STUDENT: "STUDENT", SUPERVISOR: "SUPERVISOR" } as const;
export const TicketStatus = {
  OPEN: "OPEN",
  ESCALATED: "ESCALATED",
  RESOLVED: "RESOLVED",
} as const;

export type Prisma = any;

// After `prisma generate`, replace this file contents with:
// export { PrismaClient } from "./generated/index.js";
// export type { Prisma } from "./generated/index.js";
// export { AttemptStatus, UserRole, ScopeType, ... } from "./generated/index.js";
