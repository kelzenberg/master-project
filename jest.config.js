/** @type {import('jest').Config} */
export default {
  rootDir: './',
  projects: ['<rootDir>/packages/backend/jest.config.js'],
  globalSetup: '<rootDir>/tests/global-setup.js',
  moduleNameMapper: {
    '@master-project/libs/src/(.*)$': '<rootDir>/packages/libs/src/',
  },
  transform: {},
};
