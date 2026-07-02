/**
 * Jest config for @aps/api integration tests (require live Postgres).
 * Run via: pnpm --filter @aps/api test:integration
 * Env is loaded externally via: dotenv -e ../../.env.local -- jest ...
 */

/** @type {import('jest').Config} */
module.exports = {
  displayName: "api-integration",
  testEnvironment: "node",
  preset: "ts-jest",
  testTimeout: 30_000, // DB ops can be slow on first connect
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
    "^@aps/db$": "<rootDir>/../../packages/db/src/generated/index.js",
    // Strip .js from relative imports
    "^(\\.\\.?/.*)\\.js$": "$1",
  },
  testMatch: ["**/src/__tests__/**/*.integration.spec.ts"],
};
