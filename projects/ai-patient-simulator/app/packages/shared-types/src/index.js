"use strict";
// @aps/shared-types -- barrel export
// All interfaces used across apps/web and apps/api boundary.
// This package NEVER imports from @aps/db, @aps/engine, apps/web, or apps/api.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACADEMIC_SAFETY_TRANSITIONS = exports.INITIAL_PATIENT_STATE = void 0;
var engine_types_js_1 = require("./engine.types.js");
Object.defineProperty(exports, "INITIAL_PATIENT_STATE", { enumerable: true, get: function () { return engine_types_js_1.INITIAL_PATIENT_STATE; } });
var support_types_js_1 = require("./support.types.js");
Object.defineProperty(exports, "ACADEMIC_SAFETY_TRANSITIONS", { enumerable: true, get: function () { return support_types_js_1.ACADEMIC_SAFETY_TRANSITIONS; } });
//# sourceMappingURL=index.js.map