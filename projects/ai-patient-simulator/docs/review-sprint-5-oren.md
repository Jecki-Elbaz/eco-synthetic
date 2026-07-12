# Sprint 5 Independent Review -- Oren
# Round 1 | 2026-07-11 | Requester: Eco (CEO), standing quality gate
# Scope: all Sprint-5 changes (Track B arc, m6 publish gate, REQ-066 tier map)
# NOTE ON PROVENANCE: Oren delivered this review in-session (his Write scope does not
# cover this path); Eco persisted it verbatim-in-substance as the review of record.
# Fix status appended by Eco at bottom.

## VERDICT: APPROVE-WITH-CONDITIONS
0 BLOCKER | 2 MAJOR | 4 MINOR | 4 INFO

Arc state machine, Sami-C2 ground-truth boundary, and REQ-066 wiring structurally
sound. Clamp math correct. Migration additive. No red lines crossed. Conditions:
M1 code fix + M2 comment; both same-commit, no full re-review round required.

## MAJOR

M1 -- packages/engine/src/pipeline/guard-runner.ts:136-142 -- operator precedence bug
in runGuard verdict check: `(A && B && C && D) || E` instead of `A && B && C && (D || E)`.
The FAIL branch is entered without null/object guards; a real guard LLM returning
{"verdict":"FAIL"} without a violations array leads to firstGuardResp.violations.join()
TypeError -- turn-processing crash, exactly on the guard-FAIL path where correctness
matters most. Harmless under StubProvider; surfaces at APS-004 go-live. FIX: parenthesize
the verdict OR. (Gal / same commit.)

M2 -- apps/api/src/org/org.service.ts:106-114 -- ARC_COMPLETE count is per-template,
cross-assignment, undocumented. A student who exhausts the arc via course A's assignment
is blocked on course B's assignment sharing the same template. Clinically defensible
(arc belongs to the patient, not the assignment) and invisible for pilot-1, but will
surprise operators in multi-assignment deployments. FIX: documentation comment at the
guard; no code change. (Gal / same commit.)

## MINOR

m3 -- SimulationScreen.tsx:164-166 -- welfare modal re-fires on session resume/refresh
(ack state is in-memory React state). Harmless, arguably correct clinically; ArcStudent
tests cover initial load only. RECOMMENDATION: document; persist per-attempt in
sessionStorage only if product wants no re-fire. (Noa.)

m4 -- SimulationScreen.tsx:290-292 -- handleSend does not itself gate on
welfareModalAcknowledged; relies solely on InputBar disabled prop. Add explicit
`if (!welfareModalAcknowledged) return;` for robustness. (Noa.)

m5 -- simulation.service.ts:104-110 -- loadArcContext runs a DB read on EVERY turn;
arc context is static within a session. Fine at pilot scale. TECH DEBT: cache at
attempt start. (Gal, production hardening backlog.)

m6 -- arc-delta-config.ts / arc-writer.service.ts:31 -- ArcDeltaConfig hardcoded at
construction; Adam's 2026-08-08 calibration requires a code edit. Acceptable for
pilot-1 per envelope. TECH DEBT: make injectable via ConfigService before production
go-live. (Gal.)

## INFO

i1 -- Clamp applied to session-final state (lastLog values) rather than literal
priorState+delta; mathematically equivalent to envelope formula. No issue.
i2 -- Last-session-summary limitation documented in schema.prisma, arc.types.ts,
arc-loader.service.ts, all referencing the feasibility doc. DoD satisfied.
i3 -- Context summariser uses main provider; not in REQ-066 scope (3 named slots
only). Correct by design.
i4 -- rubricProvisional timestamps both UTC Prisma DateTimes; derivation consistent
between getTemplate and publishRubric. No timezone bug.

## PRIORITY-AREA RESULTS (envelope-required)

P1 Arc state machine: CLEAN. COMPLETED-only count correct; IN_PROGRESS resume returns
existing attempt before cap check (no double-count); no off-by-one (>= at cap);
AUTHOR_PREVIEW excluded from count and from arc write; loader session N reads N-1;
clamp = Math.max(min, Math.min(max, v)), ceiling+floor, pre/post logged.
P2 Ground-truth boundary (Sami C2): CLEAN, structural. buildGuardPrompt(proposedResponse,
groundTruth, turnNumber) has no arcContext parameter; arc block goes only to the patient
context builder as a labeled system message. Guard never sees it. Matches Adi C2-T3.
P3 RBAC/data isolation: CLEAN. Loader findUnique on (userId, templateId, sessionNumber);
writer derives userId from attempt; count WHERE includes userId (student A does not
block student B). Template-vs-assignment scope -> M2 (documented).
P4 m6 publish gate: CLEAN. No bypass path sets PUBLISHED outside publishRubric;
GROUND_TRUTH_REQUIRED checked before RUBRIC_PROVISIONAL; both 422s carry code field;
PATCH rubric-reviewed inherits JwtAuthGuard + RolesGuard TEACHER/SYSTEM_ADMIN.
P5 REQ-066: CLEAN. Three tokens provided in LlmModule, injected via EngineProvider,
analyser/guard/patient call sites each use their slot; all default to StubProvider;
backward-compatible re-exports.
P6 Sami C3/C5 UI: CLEAN with m3/m4 noted. Modal blocks input until ack at sessions
2 AND 3, both text components present; briefing after ack before first send; session-1
regression correct.
P7 Envelope conformance + red lines: no new deps; migration additive (no DROP/mutate);
no .env access; ASCII-compliant comments.

## FIX STATUS (Eco, 2026-07-11, same session)

- M1: FIXED by Eco -- parenthesization corrected AND violations/suggestion defaulted
  when absent on a well-formed verdict object (Oren's parenthesize-only fix would still
  have crashed the caller on {"verdict":"FAIL"} with no violations array; defaulting
  closes the crash path entirely). Regression test added to engine-test-harness.
- M2: FIXED by Eco -- documentation comment added at the arc-cap guard in org.service.ts.
- m4 (+ m3 comment): applied by Eco after Adi's E2E pass completed (see below).
- m5, m6: accepted as tech debt -> production-hardening backlog (pre-APS-004 items).
