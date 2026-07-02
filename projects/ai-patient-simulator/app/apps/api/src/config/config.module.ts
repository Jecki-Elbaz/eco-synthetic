// ConfigModule -- global provider for AppConfig.
// Marked @Global() so AppConfig is available in every module
// without needing to import ConfigModule in each one.
import { Global, Module } from "@nestjs/common";
import { AppConfig } from "./app.config.js";

@Global()
@Module({
  providers: [AppConfig],
  exports: [AppConfig],
})
export class ConfigModule {}
