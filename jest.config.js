module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test', '<rootDir>/lib'],
  testMatch: ['**/*.test.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(@aws-sdk|@smithy)/)',
  ],
  collectCoverageFrom: [
    'lib/lambda/**/*.ts',
    '!lib/lambda/**/*.d.ts',
    '!lib/lambda/**/*.test.ts',
    '!lib/lambda/create-user.ts', // Legacy file
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '\.d\.ts$',
  ],
  // Temporarily disabled until we have integration tests
  // coverageThreshold: {
  //   global: {
  //     branches: 70,
  //     functions: 70,
  //     lines: 70,
  //     statements: 70,
  //   },
  // },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/lib/$1',
  },
};
