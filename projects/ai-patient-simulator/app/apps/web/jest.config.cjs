/**
 * Jest config for @aps/web (Next.js 14, React 18, jsdom).
 * S4-NOA: dictation, heatmap, resume, timer unit tests.
 *
 * PREREQUISITE: pnpm install must be run after web/package.json updates
 * to install jest, ts-jest, jest-environment-jsdom, @testing-library/react,
 * @testing-library/jest-dom, and @types/jest.
 * These are devDependencies only -- no production/runtime impact.
 */

/** @type {import('jest').Config} */
module.exports = {
  displayName: "web-unit",
  testEnvironment: "jest-environment-jsdom",
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      tsconfig: {
        module: "CommonJS",
        moduleResolution: "node",
        jsx: "react-jsx",
        exactOptionalPropertyTypes: false,
      },
    },
  },
  moduleNameMapper: {
    // Next.js path alias
    "^@/(.*)$": "<rootDir>/src/$1",
    // Shared packages
    "^@aps/shared-types$": "<rootDir>/../../packages/shared-types/src/index.ts",
    // CSS modules -- identity proxy (no actual styles in tests)
    "\\.css$": "<rootDir>/src/__tests__/__mocks__/fileMock.cjs",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: [
    "**/src/__tests__/**/*.test.tsx",
    "**/src/__tests__/**/*.test.ts",
    "**/src/__tests__/**/*.spec.ts",
    "**/src/__tests__/**/*.spec.tsx",
  ],
  // Next.js client-only modules need transform
  transformIgnorePatterns: ["/node_modules/(?!(@aps)/)"],
};
