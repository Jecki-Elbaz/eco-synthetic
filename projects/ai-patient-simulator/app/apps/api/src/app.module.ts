// APS API -- root module
import { Module } from "@nestjs/common";
import { ConfigModule } from "./config/config.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { OrgModule } from "./org/org.module.js";
import { SimulationModule } from "./simulation/simulation.module.js";
import { DbModule } from "./db/db.module.js";
import { EvaluationModule } from "./evaluation/evaluation.module.js";
import { DebriefModule } from "./debrief/debrief.module.js";
import { AuthoringModule } from "./authoring/authoring.module.js";
import { SupportModule } from "./support/support.module.js";
import { CreditAdminModule } from "./credit-admin/credit-admin.module.js";

@Module({
  imports: [
    ConfigModule,  // global -- makes AppConfig available everywhere
    DbModule,
    AuthModule,
    OrgModule,
    SimulationModule,
    EvaluationModule,
    DebriefModule,
    AuthoringModule,
    SupportModule,
    CreditAdminModule,
  ],
})
export class AppModule {}
