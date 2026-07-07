import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";
import { IsString, MinLength } from "class-validator";
import type { AuthTokenPayload, MeResponse } from "@aps/shared-types";

export class InviteLinkLoginBodyDto {
  @IsString()
  inviteToken!: string;

  @IsString()
  @MinLength(4)
  accessCode!: string;
}

export class EmailLoginBodyDto {
  @IsString()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/invite-login
   * Student invite-link + access-code login [APS-REQ-005]
   */
  @Post("invite-login")
  @HttpCode(HttpStatus.OK)
  async inviteLogin(@Body() body: InviteLinkLoginBodyDto) {
    return this.authService.loginWithInvite({
      inviteToken: body.inviteToken,
      accessCode: body.accessCode,
    });
  }

  /**
   * POST /auth/email-login
   * Teacher / admin email + password login [APS-REQ-005]
   */
  @Post("email-login")
  @HttpCode(HttpStatus.OK)
  async emailLogin(@Body() body: EmailLoginBodyDto) {
    // Pass email + plaintext password to service for bcrypt verification.
    // No credential is stored or logged from this layer.
    const creds = body;
    return this.authService.loginWithEmail({ email: creds.email, password: creds.password });
  }

  /**
   * GET /auth/me
   * Returns the authenticated principal so the front-end can hydrate a session
   * and drive role-based route guards. Sourced from the validated JWT (req.user);
   * no DB round-trip since the token already carries scopes.
   */
  @Get("me")
  @UseGuards(JwtAuthGuard)
  getMe(@Request() req: { user: AuthTokenPayload }): MeResponse {
    const user = req.user;
    const roles = [...new Set(user.scopes.map((s) => s.role))];
    return {
      userId: user.sub,
      email: user.email,
      scopes: user.scopes,
      roles,
    };
  }
}
