export type RoleType = "STUDENT" | "TEACHER" | "SYSTEM_ADMIN" | "PROGRAMME_MANAGER" | "COLLEGE_MANAGER";
export type ScopeType = "COLLEGE" | "COURSE";
export interface UserScope {
    role: RoleType;
    scopeType: ScopeType;
    scopeId: string;
}
export interface AuthTokenPayload {
    sub: string;
    email: string;
    scopes: UserScope[];
    iat: number;
    exp: number;
}
/** Shape returned by POST /auth/invite-login and POST /auth/email-login. */
export interface LoginResponse {
    accessToken: string;
    user: {
        id: string;
        displayName?: string;
        scopes: UserScope[];
        roles: string[];
    };
}
/** Shape returned by GET /auth/me. */
export interface MeResponse {
    userId: string;
    displayName?: string;
    email?: string;
    scopes: UserScope[];
    roles: string[];
}
//# sourceMappingURL=auth.types.d.ts.map