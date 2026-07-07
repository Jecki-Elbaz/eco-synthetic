// AuthService -- invite-link + access-code + email login [APS-REQ-005]
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../db/prisma.service.js";
import type { AuthTokenPayload, UserScope, LoginResponse } from "@aps/shared-types";

const BCRYPT_ROUNDS = 12;

export interface InviteLinkLoginDto {
  inviteToken: string;
  accessCode: string;
}

export interface EmailLoginDto {
  email: string;
  password: string;
}

/** @deprecated -- kept for internal use; external callers use LoginResponse */
export interface AuthResult {
  accessToken: string;
  userId: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Invite-link login [APS-REQ-005].
   * Student follows a link containing their inviteToken, then enters their access code.
   * The invite token identifies the user; the access code is the second factor.
   */
  async loginWithInvite(dto: InviteLinkLoginDto): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { inviteToken: dto.inviteToken },
      include: { roleAssignments: true },
    });

    if (!user) {
      throw new UnauthorizedException("Invalid invite token");
    }

    if (!user.accessCode) {
      throw new UnauthorizedException("No access code configured for this user");
    }

    // Access code comparison -- constant-time to resist timing attacks
    const matches = await bcrypt.compare(dto.accessCode, user.accessCode);
    if (!matches) {
      throw new UnauthorizedException("Invalid access code");
    }

    return this.issueToken(user.id, user.email, user.roleAssignments);
  }

  /**
   * Email + password login (teachers / admins).
   */
  async loginWithEmail(dto: EmailLoginDto): Promise<LoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { roleAssignments: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const matches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!matches) {
      throw new UnauthorizedException("Invalid credentials");
    }

    return this.issueToken(user.id, user.email, user.roleAssignments);
  }

  /**
   * Hash a plain-text password for storage.
   * Called when creating / updating user credentials.
   */
  async hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_ROUNDS);
  }

  /**
   * Hash an access code for storage.
   */
  async hashAccessCode(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_ROUNDS);
  }

  private issueToken(
    userId: string,
    email: string,
    roleAssignments: Array<{
      role: string;
      scopeType: string;
      scopeId: string;
    }>,
  ): LoginResponse {
    const scopes: UserScope[] = roleAssignments.map((ra) => ({
      role: ra.role as UserScope["role"],
      scopeType: ra.scopeType as UserScope["scopeType"],
      scopeId: ra.scopeId,
    }));

    const payload: Omit<AuthTokenPayload, "iat" | "exp"> = {
      sub: userId,
      email,
      scopes,
    };

    const accessToken = this.jwt.sign(payload);

    const roles = [...new Set(scopes.map((s) => s.role))];
    return {
      accessToken,
      user: { id: userId, scopes, roles },
    };
  }
}
