/**
 * Jest config for @aps/api (auth + RBAC unit tests)
 * These tests mock Prisma and JWT; no live DB is required.
 * Integration tests requiring Postgres are excluded here and
 * live in a separate config (jest.integration.config.cjs) -- not yet written.
 */

/** @type {import('jest').Config} */
module.exports = {
  displayName: "api-unit",
  testEnvironment: "node",
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      tsconfig: {
        module: "CommonJS",
        moduleResolution: "node",
        exactOptionalPropertyTypes: false,
      },
    },
  },
  moduleNameMapper: {
    "^@aps/shared-types$": "<rootDir>/../../packages/shared-types/src/index.ts",
    "^@aps/engine$": "<rootDir>/../../packages/engine/src/index.ts",
    // Strip .js from relative imports
    "^(\\.\\.?/.*)\\.js$": "$1",
  },
  testMatch: ["**/src/__tests__/**/*.spec.ts"],
  // Exclude integration tests (require Postgres)
  testPathIgnorePatterns: ["\\.integration\\.spec\\.ts$"],
  // Coverage is scoped to units under direct test in this config.
  // SimulationService, OrgService, JwtStrategy, and controllers all require
  // a live Postgres DB and are excluded until integration tests run (Sprint 3).
  collectCoverageFrom: [
    "src/auth/auth.service.ts",
    "src/rbac/roles.guard.ts",
    "src/rbac/roles.decorator.ts",
  ],
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
};
