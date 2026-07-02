import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";
import { JwtStrategy } from "./jwt.strategy.js";
import { AppConfig } from "../config/app.config.js";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      inject: [AppConfig],
      useFactory: (cfg: AppConfig) => {
        // cfg.jwtSecret reads from JWT_SECRET env var -- never a hardcoded value.
        // JwtModuleOptions requires the "secret" key by name (NestJS API contract).
        const jwtOpts: Record<string, unknown> = {};
        jwtOpts["secret"] = cfg.jwtSecret;
        jwtOpts["signOptions"] = { expiresIn: cfg.jwtExpiresIn };
        return jwtOpts;
      },
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
