// Jest config for @aps/engine-test-harness
// Uses ts-jest for direct TypeScript execution -- no separate build step needed for tests.
// Module name mapping mirrors the tsconfig paths so workspace imports resolve.

/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/src/__tests__/**/*.spec.ts"],
  moduleNameMapper: {
    "^@aps/engine$": "<rootDir>/../engine/src/index.ts",
    "^@aps/shared-types$": "<rootDir>/../shared-types/src/index.ts",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.json",
      },
    ],
  },
};

module.exports = config;
