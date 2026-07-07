// CreditAdminModule -- wires CreditAdminService + CreditAdminController.
import { Module } from "@nestjs/common";
import { CreditAdminService } from "./credit-admin.service.js";
import { CreditAdminController } from "./credit-admin.controller.js";

@Module({
  providers: [CreditAdminService],
  controllers: [CreditAdminController],
  exports: [CreditAdminService],
})
export class CreditAdminModule {}
