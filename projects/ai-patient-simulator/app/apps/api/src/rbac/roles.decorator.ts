// @RequiredRoles decorator -- attaches role requirements to controller endpoints.
import { SetMetadata } from "@nestjs/common";
import type { RoleType } from "@aps/shared-types";

export const ROLES_KEY = "required_roles";
export const RequiredRoles = (...roles: RoleType[]) =>
  SetMetadata(ROLES_KEY, roles);
