export interface PrismaClientKnownRequestError extends Error {
    code: string;
    meta?: Record<string, unknown>;
}
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
export declare class PrismaClient {
    readonly user: ModelDelegate;
    readonly college: ModelDelegate;
    readonly course: ModelDelegate;
    readonly programme: ModelDelegate;
    readonly assignment: ModelDelegate;
    readonly attempt: ModelDelegate;
    readonly userRoleAssignment: ModelDelegate;
    readonly competency: ModelDelegate;
    readonly simulationTemplate: ModelDelegate;
    readonly groundTruth: ModelDelegate;
    readonly triggerRule: ModelDelegate;
    readonly rubricVersion: ModelDelegate;
    readonly rubricCriterion: ModelDelegate;
    readonly message: ModelDelegate;
    readonly patientStateLog: ModelDelegate;
    readonly evaluation: ModelDelegate;
    readonly debriefChat: ModelDelegate;
    readonly supportTicket: ModelDelegate;
    readonly diagnosticLog: ModelDelegate;
    readonly creditLedger: ModelDelegate;
    readonly creditEntry: ModelDelegate;
    readonly usageLog: ModelDelegate;
    readonly personaBranch: ModelDelegate;
    readonly studentPersonaHistory: ModelDelegate;
    $connect(): Promise<void>;
    $disconnect(): Promise<void>;
    $transaction(operations: Promise<any>[] | ((prisma: any) => Promise<any>)): Promise<any>;
}
export declare const AttemptStatus: {
    readonly NOT_STARTED: "NOT_STARTED";
    readonly IN_PROGRESS: "IN_PROGRESS";
    readonly COMPLETED: "COMPLETED";
    readonly ABANDONED: "ABANDONED";
    readonly SUBMITTED: "SUBMITTED";
    readonly EVALUATED: "EVALUATED";
    readonly TECHNICALLY_AFFECTED: "TECHNICALLY_AFFECTED";
    readonly TECHNICAL_FAILURE_CONFIRMED: "TECHNICAL_FAILURE_CONFIRMED";
    readonly RETRY_AUTHORISED: "RETRY_AUTHORISED";
};
export declare const UserRole: {
    readonly STUDENT: "STUDENT";
    readonly TEACHER: "TEACHER";
    readonly SYSTEM_ADMIN: "SYSTEM_ADMIN";
    readonly PROGRAMME_MANAGER: "PROGRAMME_MANAGER";
    readonly COLLEGE_MANAGER: "COLLEGE_MANAGER";
};
export declare const ScopeType: {
    readonly COLLEGE: "COLLEGE";
    readonly COURSE: "COURSE";
};
export declare const CompetencyScope: {
    readonly CORE: "CORE";
    readonly COLLEGE: "COLLEGE";
    readonly PROGRAMME: "PROGRAMME";
    readonly COURSE: "COURSE";
    readonly SIMULATION: "SIMULATION";
};
export declare const CompetencyStatus: {
    readonly DRAFT: "DRAFT";
    readonly LOCAL: "LOCAL";
    readonly SUBMITTED: "SUBMITTED";
    readonly APPROVED_PROGRAMME: "APPROVED_PROGRAMME";
    readonly APPROVED_COLLEGE: "APPROVED_COLLEGE";
    readonly CORE: "CORE";
    readonly DEPRECATED: "DEPRECATED";
};
export declare const RubricStatus: {
    readonly DRAFT: "DRAFT";
    readonly PUBLISHED: "PUBLISHED";
};
export declare const MessageRole: {
    readonly STUDENT: "STUDENT";
    readonly PATIENT: "PATIENT";
};
export declare const EvalStatus: {
    readonly PENDING: "PENDING";
    readonly DRAFT: "DRAFT";
    readonly TEACHER_REVIEW: "TEACHER_REVIEW";
    readonly PUBLISHED: "PUBLISHED";
};
export declare const DebriefRole: {
    readonly STUDENT: "STUDENT";
    readonly SUPERVISOR: "SUPERVISOR";
};
export declare const TicketStatus: {
    readonly OPEN: "OPEN";
    readonly ESCALATED: "ESCALATED";
    readonly RESOLVED: "RESOLVED";
};
export type Prisma = any;
export {};
//# sourceMappingURL=index.d.ts.map