import { Module } from "@nestjs/common";
import { OrgService } from "./org.service.js";
import { OrgController } from "./org.controller.js";

@Module({
  providers: [OrgService],
  controllers: [OrgController],
  exports: [OrgService],
})
export class OrgModule {}
