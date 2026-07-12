// Typed config loader.
// No raw process.env access outside this module [architecture rule].
// Placeholders only -- real values in .env.local (gitignored). [red line 1]
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppConfig {
  readonly port: number = this.getInt("PORT", 3001);
  readonly databaseUrl: string = this.getRequired("DATABASE_URL");
  readonly redisUrl: string = this.getRequired("REDIS_URL");
  readonly jwtSecret: string = this.getRequired("JWT_SECRET");
  readonly jwtExpiresIn: string = this.getString("JWT_EXPIRES_IN", "1d");
  readonly llmProvider: string = this.getString("LLM_PROVIDER", "stub");
  readonly webOrigin: string = this.getString("WEB_ORIGIN", "http://localhost:3000");

  // S3-compatible storage (MinIO in dev)
  readonly s3Endpoint: string = this.getString("S3_ENDPOINT", "");
  readonly s3Bucket: string = this.getString("S3_BUCKET", "");
  // S3 signing credentials are read directly by the S3 SDK from process.env
  // (S3_ACCESS_KEY_ID + S3_SIGNING_KEY). Never surfaced via this config class,
  // never logged or serialised. [red line 1 compliance]

  // ARC ceiling/floor config -- PENDING ADAM REVIEW BEFORE PRODUCTION GO-LIVE (Sami C1).
  // Env var names (set to calibrate without a code edit at the 2026-08-08 Adam checkpoint):
  //   ARC_MAX_TRUST    (default 0.70)
  //   ARC_MAX_OPENNESS (default 0.65)
  //   ARC_MAX_ALLIANCE (default 0.70)
  //   ARC_MIN_TRUST    (default 0.15)
  //   ARC_MIN_OPENNESS (default 0.10)
  //   ARC_MIN_ALLIANCE (default 0.10)
  // When env vars are absent, defaults are unchanged (StubProvider behavior: identical).
  // S6-GAL-ARCCONFIG: injectable via AppConfig so calibration = config change, not code edit.
  readonly arcMaxTrust: number = this.getFloat("ARC_MAX_TRUST", 0.70);
  readonly arcMaxOpenness: number = this.getFloat("ARC_MAX_OPENNESS", 0.65);
  readonly arcMaxAlliance: number = this.getFloat("ARC_MAX_ALLIANCE", 0.70);
  readonly arcMinTrust: number = this.getFloat("ARC_MIN_TRUST", 0.15);
  readonly arcMinOpenness: number = this.getFloat("ARC_MIN_OPENNESS", 0.10);
  readonly arcMinAlliance: number = this.getFloat("ARC_MIN_ALLIANCE", 0.10);

  private getRequired(key: string): string {
    const val = process.env[key];
    if (!val) {
      throw new Error(`Required env var ${key} is not set. See .env.example.`);
    }
    return val;
  }

  private getString(key: string, fallback: string): string {
    return process.env[key] ?? fallback;
  }

  private getInt(key: string, fallback: number): number {
    const val = process.env[key];
    if (!val) return fallback;
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) throw new Error(`Env var ${key} must be an integer`);
    return parsed;
  }

  private getFloat(key: string, fallback: number): number {
    const val = process.env[key];
    if (!val) return fallback;
    const parsed = parseFloat(val);
    if (isNaN(parsed)) throw new Error(`Env var ${key} must be a number`);
    return parsed;
  }
}
