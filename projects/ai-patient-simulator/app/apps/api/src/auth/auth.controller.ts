import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { IsString, MinLength } from "class-validator";

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
}
