"use strict";
// @aps/shared-types -- support + academic-safety types
// APS-REQ-102/103/104/105/106/107/108/109/110/111/118/119/120/121
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACADEMIC_SAFETY_TRANSITIONS = void 0;
// Valid status transitions for academic-safety flow (APS-REQ-118/119/120/121)
//
// JC-2 (re-entry): RETRY_AUTHORISED -> IN_PROGRESS is the re-entry edge.
// The student re-launches the simulation via the existing simulation-start/turn path
// (SimulationService.processTurn). That path rejects only COMPLETED and ABANDONED;
// RETRY_AUTHORISED is not in the rejection list, so re-entry works correctly.
// Verified 2026-07-04 (Gal, code review fix pass): no change to processTurn needed.
//
// JC-2 missing edges (documented per Ido review):
//
// TECHNICALLY_AFFECTED -> ABANDONED: no path exists for a teacher to abandon an attempt
// that is in the tech-safety chain. If the teacher decides the attempt should not be
// retried, there is no supported transition. This is a spec gap; accept for pilot
// (teacher cannot do this via the API; requires direct DB intervention or a future
// admin endpoint). Track before beta.
//
// SUBMITTED -> TECHNICALLY_AFFECTED: SUBMITTED has no inbound from tech-safety states.
// A student who submits and then realises there was a technical failure cannot enter
// the tech-safety chain. Whether this is intentional (submission = assessment complete,
// handled via grade appeal) or an omission is undocumented. Current design: intentional
// (submitted work is assessed; a tech-fault claim after submission goes through appeal,
// not the retry path). Document explicitly here to prevent accidental edge additions.
// MINOR-5: add SUBMITTED -> TECHNICALLY_AFFECTED if product decides otherwise.
exports.ACADEMIC_SAFETY_TRANSITIONS = {
    NOT_STARTED: ["IN_PROGRESS", "TECHNICALLY_AFFECTED"],
    IN_PROGRESS: ["COMPLETED", "ABANDONED", "TECHNICALLY_AFFECTED"],
    COMPLETED: ["EVALUATED", "TECHNICALLY_AFFECTED"],
    ABANDONED: [],
    // SUBMITTED -> TECHNICALLY_AFFECTED is intentionally absent (see comment above).
    SUBMITTED: ["EVALUATED"],
    EVALUATED: [],
    TECHNICALLY_AFFECTED: ["TECHNICAL_FAILURE_CONFIRMED"],
    // TECHNICALLY_AFFECTED -> ABANDONED is intentionally absent (see comment above).
    TECHNICAL_FAILURE_CONFIRMED: ["RETRY_AUTHORISED"],
    // RETRY_AUTHORISED -> IN_PROGRESS: student re-launches via simulation-start/turn path.
    // SimulationService.processTurn allows RETRY_AUTHORISED (only rejects COMPLETED/ABANDONED).
    RETRY_AUTHORISED: ["IN_PROGRESS"],
};
//# sourceMappingURL=support.types.js.map