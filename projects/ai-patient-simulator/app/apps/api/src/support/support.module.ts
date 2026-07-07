// SupportModule (APS-REQ-102..121)
import { Module } from "@nestjs/common";
import { SupportService } from "./support.service.js";
import { SupportController } from "./support.controller.js";
import { DbModule } from "../db/db.module.js";

@Module({
  imports: [DbModule],
  providers: [SupportService],
  controllers: [SupportController],
  exports: [SupportService],
})
export class SupportModule {}
