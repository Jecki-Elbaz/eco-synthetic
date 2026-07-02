// APS API -- root module
import { Module } from "@nestjs/common";
import { ConfigModule } from "./config/config.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { OrgModule } from "./org/org.module.js";
import { SimulationModule } from "./simulation/simulation.module.js";
import { DbModule } from "./db/db.module.js";

@Module({
  imports: [
    ConfigModule,  // global -- makes AppConfig available everywhere
    DbModule,
    AuthModule,
    OrgModule,
    SimulationModule,
  ],
})
export class AppModule {}
