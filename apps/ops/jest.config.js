// eslint-disable-next-line @typescript-eslint/no-var-requires
const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

module.exports = createJestConfig({
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
    testEnvironment: 'jsdom',
    modulePaths: ['<rootDir>/src'],
    testPathIgnorePatterns: [
        '<rootDir>/.next/',
        '<rootDir>/.storybook',
        '<rootDir>/lib/',
        '<rootDir>/node_modules/',
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleDirectories: ['node_modules', '<rootDir>/src'],
    moduleNameMapper: {
        '^.+\\.(svg)$': '<rootDir>/src/jest/transform/svgTransform.js',
        '^@deps(.*)$': '<rootDir>/src/$1',
        '^jose': require.resolve('jose'),
        '^@panva/hkdf$': require.resolve('@panva/hkdf'),
    },
    testRegex: '/.*(?<!\\.vitest)(\\.test\\.tsx?$)',
    collectCoverage: true,
    coverageReporters: ['text', 'json', 'html'],
    coverageDirectory: '<rootDir>/src/jest/coverage',
    coverageThreshold: {
        global: {
            branches: 0,
            functions: 0,
            lines: 0,
            statements: 0,
        },
    },
});
