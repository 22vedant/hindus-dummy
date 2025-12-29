/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from 'jest';

const config: Config = {
  clearMocks: true,
  // collectCoverage: true,
  // coverageDirectory: "coverage",

  preset: 'ts-jest/presets/default-esm',

  extensionsToTreatAsEsm: [".ts"],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  // roots: [
  //   "<rootDir>/tests"
  // ],

  testEnvironment: "node",

  testMatch: ['**/tests/*.test.ts', '**/tests/**/*.test.ts'],

  testPathIgnorePatterns: [
    "\\\\node_modules\\\\"
  ],

  transform: {
    '^.+\\.tsx?': [
      'ts-jest',
      {
        useESM: true,
        tsconfig: {
          verbatimModuleSyntax: false,
        },
      },
    ],
  },

  transformIgnorePatterns: [
    'node_modules/(?!(supertest)/)',
  ],
};

export default config;