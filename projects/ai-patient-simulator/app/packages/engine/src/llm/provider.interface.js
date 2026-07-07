"use strict";
// LLM Provider abstraction [Section 4 of engine-architecture-gal.md]
// Concrete provider is NOT chosen here -- blocked on APS-004 gate.
// All engine code uses this interface only.
// The active provider is selected at startup via DI (NestJS) using LLM_PROVIDER env var.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelHint = void 0;
// Intent-based hint -- NOT provider-specific.
// Provider maps to cheapest model that fits the intent.
var ModelHint;
(function (ModelHint) {
    ModelHint["PATIENT_RESPONSE"] = "PATIENT_RESPONSE";
    ModelHint["GUARD_PASS"] = "GUARD_PASS";
    ModelHint["ANALYSER"] = "ANALYSER";
    ModelHint["SUMMARISER"] = "SUMMARISER";
    ModelHint["EVALUATOR"] = "EVALUATOR";
    ModelHint["DEBRIEF"] = "DEBRIEF";
})(ModelHint || (exports.ModelHint = ModelHint = {}));
//# sourceMappingURL=provider.interface.js.map