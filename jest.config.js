/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',

  testTimeout: 1000 * 30,
  testEnvironment: "node",
  testMatch: ["<rootDir>/test/**/*.ts"],

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};
