// CreditLedgerModule -- wires the runtime deduction service.
// Import this module in SimulationModule (or any module that triggers deductions).
import { Module } from "@nestjs/common";
import { CreditLedgerService } from "./credit-ledger.service.js";

@Module({
  providers: [CreditLedgerService],
  exports: [CreditLedgerService],
})
export class CreditLedgerModule {}
