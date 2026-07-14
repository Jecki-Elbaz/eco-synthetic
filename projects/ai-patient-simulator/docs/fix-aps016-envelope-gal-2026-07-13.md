# APS-016 Build-Fix Envelope -- Gal
# Author: Ido (VP R&D) | Date: 2026-07-13 | Requester: Eco (relaying Ido ruling)
# Board: APS-016 (nest build rootDir/composite failure -- REGRESSED; fix now)
# Demo gate: unblocks Shir demo-deploy plan (demo-deploy-plan-shir-2026-07-12.md BLOCKER-1)
# Rehearsal gate: must be fixed before 15-Aug rehearsal regardless; fixing now serves both.
# ASCII only. Internal only. No Adam contact. No new deps.

---

## Context

APS-016 was closed DONE 2026-07-09 (Shir, Sprint-2 hardening). The tsconfig paths fix
pointed @aps/* to dist .d.ts files, not source .ts. That was a real fix, not premature.

It has REGRESSED. The most likely trigger: Sprint 7 added new test files under
apps/api/src/__tests__/ (untracked at this moment). On Windows, the exclude pattern
`**/__tests__/**` in tsconfig.build.json may not be reliably matched by the TypeScript
compiler in composite mode when those files are discovered on disk. More fundamentally,
tsconfig.build.json inherits `composite: true` from tsconfig.json but does NOT set an
explicit rootDir -- TypeScript infers rootDir from the discovered file set, and that
inference can shift when new files appear in src/. Any file TypeScript discovers outside
the inferred rootDir triggers TS6059/TS6307.

Note: pnpm --filter @aps/api exec tsc --noEmit (which uses tsconfig.json) is still
passing -- this confirms the issue is specific to nest build's tsconfig.build.json path.

---

## Permitted Bash commands (Rambo C3 -- exhaustive list for this task)

1.  pnpm --filter @aps/api build                         -- nest build (the failing command)
2.  pnpm --filter @aps/api exec tsc --noEmit             -- api typecheck
3.  pnpm --filter @aps/api test                          -- unit suite
4.  pnpm --filter @aps/api test:integration              -- integration suite
5.  pnpm --filter @aps/db generate                       -- regenerate Prisma client
6.  node apps/api/src/scripts/e2e-golden-path.mjs        -- E2E runner

No other commands. No git. No web build (it does not change). If you hit an unexpected
error that is not on this list to diagnose, stop and flag to Ido.

---

## Fix (targeted -- one file, two added lines)

File: apps/api/tsconfig.build.json

CURRENT content:
{
  "extends": "./tsconfig.json",
  "exclude": ["node_modules", "dist", "test", "**/*.spec.ts", "**/*.test.ts", "**/__tests__/**"]
}

REPLACE WITH:
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src"
  },
  "exclude": ["node_modules", "dist", "test", "**/*.spec.ts", "**/*.test.ts", "**/__tests__/**"]
}

What this does: pins rootDir explicitly to ./src (the same directory implied by
`include: ["src/**/*"]` in the parent tsconfig.json). This prevents TypeScript from
inferring rootDir from the discovered file set, which is sensitive to new files in
src/ and to composite-mode file discovery. All production source files are under src/;
this change makes that constraint explicit and enforced.

What this does NOT touch:
- tsconfig.json (used by tsc --noEmit and the jest test runner) -- leave it unchanged
- packages/engine/tsconfig.json -- leave it unchanged
- packages/shared-types/tsconfig.json -- leave it unchanged
- apps/web (Next.js build) -- no change
- The paths entries (already pointing to dist .d.ts) -- leave them unchanged
- The exclude list -- leave it unchanged

---

## Verification sequence (run in order; stop and flag any failure to Ido)

STEP 1 -- Apply the edit above to apps/api/tsconfig.build.json.

STEP 2 -- Run nest build:
  pnpm --filter @aps/api build
  EXPECT: exit 0 with no TypeScript errors in the output.
  If TS6059/TS6307 still appear -> do NOT proceed; follow Fallback section below.

STEP 3 -- Run api typecheck (confirm tsc --noEmit still clean):
  pnpm --filter @aps/api exec tsc --noEmit
  EXPECT: 0 errors.

STEP 4 -- Run unit suite:
  pnpm --filter @aps/api test
  EXPECT: >= 301 / 0-fail / <= 8-skip (Sprint 7 baseline per Gal delivery notes).

STEP 5 -- Run integration suite:
  pnpm --filter @aps/api test:integration
  EXPECT: 8/8 suites / >= 78 / 0-fail / <= 2-skip.

STEP 6 -- Run E2E:
  node apps/api/src/scripts/e2e-golden-path.mjs
  EXPECT: 34/34 PASS.

Report all exact numbers to Ido. Do not declare done if any step is below baseline.

---

## Fallback (if Step 2 still fails after the rootDir fix)

If TS6059/TS6307 persist after adding rootDir: "./src", apply this ADDITIONAL override
in tsconfig.build.json (do NOT do this unless the rootDir fix alone was insufficient):

{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src",
    "composite": false,
    "declaration": false,
    "declarationMap": false
  },
  "exclude": ["node_modules", "dist", "test", "**/*.spec.ts", "**/*.test.ts", "**/__tests__/**"]
}

Rationale: nest build does not need composite mode (the API is not a referenced project;
no other package depends on its .d.ts output). Disabling composite + declaration removes
the TS6059/TS6307 constraint entirely. The test runner (which needs composite for
incremental builds) uses tsconfig.json -- unchanged.

Re-run Steps 2-6 after the fallback.

Flag to Ido which path resolved the issue so the board can be updated correctly.

---

## Acceptance criteria (Gal CP-DONE signal to Ido)

- pnpm --filter @aps/api build: exit 0
- pnpm --filter @aps/api exec tsc --noEmit: 0 errors
- pnpm --filter @aps/api test: >= 301 / 0-fail / <= 8-skip
- pnpm --filter @aps/api test:integration: 8/8 / >= 78 / 0-fail / <= 2-skip
- node apps/api/src/scripts/e2e-golden-path.mjs: 34/34
- Report which fix applied (rootDir-only or rootDir + fallback)

ETA: ~2 hours from start (30 min edit + 90 min gate run).

---

## Board update (Ido handles after CP-DONE)

Ido will:
- Reopen APS-016 (done -> in-progress) now; close back to done on CP-DONE
- Confirm BLOCKER-1 in Shir's deploy plan is cleared
- Route Shir to proceed with deploy plan Phase 1 (code prep) once CP-DONE received

---

## What Gal does NOT do

- Does not contact Adam.
- Does not change the web build.
- Does not change the test runner configs (tsconfig.json is off-limits for this task).
- Does not commit (owner commits from terminal).
- Does not adopt new tools or packages.
