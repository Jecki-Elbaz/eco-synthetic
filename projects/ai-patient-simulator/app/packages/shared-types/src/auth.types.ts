// Auth + RBAC shared types

export type RoleType = "STUDENT" | "TEACHER" | "SYSTEM_ADMIN" | "PROGRAMME_MANAGER" | "COLLEGE_MANAGER";
export type ScopeType = "COLLEGE" | "COURSE";

export interface UserScope {
  role: RoleType;
  scopeType: ScopeType;
  scopeId: string;
}

export interface AuthTokenPayload {
  sub: string;        // user id
  email: string;
  scopes: UserScope[];
  iat: number;
  exp: number;
}
