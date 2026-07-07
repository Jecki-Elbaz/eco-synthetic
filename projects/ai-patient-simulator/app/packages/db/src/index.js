"use strict";
// @aps/db -- public exports
// Generated Prisma client re-exported from here.
// apps/api imports from "@aps/db", never directly from the generated path.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketStatus = exports.DebriefRole = exports.EvalStatus = exports.MessageRole = exports.RubricStatus = exports.CompetencyStatus = exports.CompetencyScope = exports.ScopeType = exports.UserRole = exports.AttemptStatus = exports.PrismaClient = void 0;
class PrismaClient {
    user = {};
    college = {};
    course = {};
    programme = {};
    assignment = {};
    attempt = {};
    userRoleAssignment = {};
    competency = {};
    simulationTemplate = {};
    groundTruth = {};
    triggerRule = {};
    rubricVersion = {};
    rubricCriterion = {};
    message = {};
    patientStateLog = {};
    evaluation = {};
    debriefChat = {};
    supportTicket = {};
    diagnosticLog = {};
    creditLedger = {};
    creditEntry = {};
    usageLog = {};
    personaBranch = {};
    studentPersonaHistory = {};
    async $connect() {
        throw new Error("PrismaClient stub: run `pnpm db:generate` and configure DATABASE_URL before connecting.");
    }
    async $disconnect() {
        // no-op in stub
    }
    async $transaction(operations) {
        if (Array.isArray(operations)) {
            return Promise.all(operations);
        }
        return operations(this);
    }
}
exports.PrismaClient = PrismaClient;
// Enum stubs
exports.AttemptStatus = {
    NOT_STARTED: "NOT_STARTED",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    ABANDONED: "ABANDONED",
    SUBMITTED: "SUBMITTED",
    EVALUATED: "EVALUATED",
    TECHNICALLY_AFFECTED: "TECHNICALLY_AFFECTED",
    TECHNICAL_FAILURE_CONFIRMED: "TECHNICAL_FAILURE_CONFIRMED",
    RETRY_AUTHORISED: "RETRY_AUTHORISED",
};
exports.UserRole = {
    STUDENT: "STUDENT",
    TEACHER: "TEACHER",
    SYSTEM_ADMIN: "SYSTEM_ADMIN",
    PROGRAMME_MANAGER: "PROGRAMME_MANAGER",
    COLLEGE_MANAGER: "COLLEGE_MANAGER",
};
exports.ScopeType = {
    COLLEGE: "COLLEGE",
    COURSE: "COURSE",
};
exports.CompetencyScope = {
    CORE: "CORE",
    COLLEGE: "COLLEGE",
    PROGRAMME: "PROGRAMME",
    COURSE: "COURSE",
    SIMULATION: "SIMULATION",
};
exports.CompetencyStatus = {
    DRAFT: "DRAFT",
    LOCAL: "LOCAL",
    SUBMITTED: "SUBMITTED",
    APPROVED_PROGRAMME: "APPROVED_PROGRAMME",
    APPROVED_COLLEGE: "APPROVED_COLLEGE",
    CORE: "CORE",
    DEPRECATED: "DEPRECATED",
};
exports.RubricStatus = { DRAFT: "DRAFT", PUBLISHED: "PUBLISHED" };
exports.MessageRole = { STUDENT: "STUDENT", PATIENT: "PATIENT" };
exports.EvalStatus = {
    PENDING: "PENDING",
    DRAFT: "DRAFT",
    TEACHER_REVIEW: "TEACHER_REVIEW",
    PUBLISHED: "PUBLISHED",
};
exports.DebriefRole = { STUDENT: "STUDENT", SUPERVISOR: "SUPERVISOR" };
exports.TicketStatus = {
    OPEN: "OPEN",
    ESCALATED: "ESCALATED",
    RESOLVED: "RESOLVED",
};
// After `prisma generate`, replace this file contents with:
// export { PrismaClient } from "./generated/index.js";
// export type { Prisma } from "./generated/index.js";
// export { AttemptStatus, UserRole, ScopeType, ... } from "./generated/index.js";
//# sourceMappingURL=index.js.map