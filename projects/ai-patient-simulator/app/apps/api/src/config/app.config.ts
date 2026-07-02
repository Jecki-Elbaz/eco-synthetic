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

  // S3-compatible storage (MinIO in dev)
  readonly s3Endpoint: string = this.getString("S3_ENDPOINT", "");
  readonly s3Bucket: string = this.getString("S3_BUCKET", "");
  // S3 signing credentials are read directly by the S3 SDK from process.env
  // (S3_ACCESS_KEY_ID + S3_SIGNING_KEY). Never surfaced via this config class,
  // never logged or serialised. [red line 1 compliance]

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
}
