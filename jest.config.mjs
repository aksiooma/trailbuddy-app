// jest.config.mjs
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  // If your test files are named as *.test.tsx or *.test.ts:
  testMatch: [
    '**/__tests__/**/*.tsx', // Looks for any files inside __tests__ folders with a .tsx extension
    '**/?(*.)+(spec|test).tsx', // Looks for any files ending in .test.tsx or .spec.tsx
  ],
  // If you're using TypeScript, you may need to add a transform property as well
  transform: {
    '^.+\\.(ts|tsx)$': 'babel-jest',
  },
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Uncomment if you have a setup file
};

export default createJestConfig(customJestConfig);
