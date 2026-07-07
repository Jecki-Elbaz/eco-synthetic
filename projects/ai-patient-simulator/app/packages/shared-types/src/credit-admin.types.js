"use strict";
// Credit-admin shared types (APS-REQ-139..148)
// Used across apps/api and apps/web (read-only from web side).
//
// SCHEMA GAP 1 (APS-REQ-143 override-expiry):
//   CreditLedger has no hardLimitOverrideUntil DateTime? field.
//   The current override endpoint raises or clears hardLimit with a mandatory
//   reason + audit entry but cannot enforce a time-boxed auto-expiry.
//   A future migration must add: hardLimitOverrideUntil DateTime? to CreditLedger.
//
// SCHEMA GAP 2 (APS-REQ-147 alert-threshold):
//   CreditLedger has no configurable low-balance threshold field.
//   Pilot implementation uses softLimit as the threshold (balance <= softLimit).
//   A future migration must add: lowBalanceThresholdPct Float? (or similar) to CreditLedger.
Object.defineProperty(exports, "__esModule", { value: true });
//# sourceMappingURL=credit-admin.types.js.map