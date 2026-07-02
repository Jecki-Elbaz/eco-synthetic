/**
 * Jest config for @aps/engine-test-harness
 * Covers: engine unit + integration tests (no DB, no HTTP).
 * Resolves @aps/engine and @aps/shared-types from their TypeScript source.
 * Strip .js extensions at test time (ts-jest handles re-mapping).
 */

/** @type {import('jest').Config} */
module.exports = {
  displayName: "engine-test-harness",
  testEnvironment: "node",
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      tsconfig: {
        module: "CommonJS",
        moduleResolution: "node",
        // Relax exactOptionalPropertyTypes for test fixtures
        exactOptionalPropertyTypes: false,
      },
    },
  },
  // Resolve workspace packages from their TypeScript source
  moduleNameMapper: {
    "^@aps/engine$": "<rootDir>/../engine/src/index.ts",
    "^@aps/shared-types$": "<rootDir>/../shared-types/src/index.ts",
    // Strip .js extension from relative imports (NodeNext uses .js; jest needs the .ts)
    "^(\\.\\.?/.*)\\.js$": "$1",
  },
  testMatch: ["**/__tests__/**/*.spec.ts"],
  collectCoverageFrom: [
    "../engine/src/**/*.ts",
    "src/**/*.ts",
    "!src/index.ts",
  ],
  coverageThreshold: {
    global: {
      lines: 80,
    },
  },
};
