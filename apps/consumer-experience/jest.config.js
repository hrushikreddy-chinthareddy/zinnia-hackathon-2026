// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
});

// Add any custom config to be passed to Jest
module.exports = createJestConfig({
  // ...sharedConfig,
  // preset: '@zinnia/jest-presets/browser',
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^.+\\.(svg)$': '<rootDir>/src/jest/transform/svgTransform.tsx',
    '@zinnia/bloom/internal/components':
      '<rootDir>/node_modules/@zinnia/bloom/src/components',
    '@panva/hkdf': '<rootDir>/node_modules/@panva/hkdf',
    jose: '<rootDir>/node_modules/jose',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
});
