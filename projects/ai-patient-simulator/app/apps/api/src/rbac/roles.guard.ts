// RolesGuard -- scope-based RBAC enforcement [APS-REQ-016, APS-REQ-017].
// Applied after JwtAuthGuard. Checks that the JWT payload scopes satisfy
// the roles required by the endpoint.
// Scope check: user must have the required role for the relevant scopeId.
// scopeId is extracted from route params by convention: :collegeId or :courseId.

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "./roles.decorator.js";
import type { RoleType, AuthTokenPayload } from "@aps/shared-types";

interface RequestWithUser {
  user: AuthTokenPayload;
  params: Record<string, string>;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No role requirement on this endpoint -- allow all authenticated users
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user || !user.scopes) throw new ForbiddenException();

    // SYSTEM_ADMIN bypasses scope checks (sees all hierarchy slices)
    if (user.scopes.some((s) => s.role === "SYSTEM_ADMIN")) return true;

    // Scope IDs from route params -- used to verify the user's scope matches
    const params = request.params;
    const scopeId = params["courseId"] ?? params["collegeId"] ?? null;

    const hasRole = user.scopes.some((scope) => {
      const roleMatch = requiredRoles.includes(scope.role as RoleType);
      if (!roleMatch) return false;
      if (!scopeId) return true; // no scope constraint on this route
      return scope.scopeId === scopeId;
    });

    if (!hasRole) throw new ForbiddenException("Insufficient role for this resource");
    return true;
  }
}
