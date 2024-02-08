/** @type {import('jest').Config} */
export default {
  rootDir: './',
  projects: ['<rootDir>/packages/backend/jest.config.js'],
  moduleNameMapper: {
    '@master-project/libs/src/(.*)$': '<rootDir>/packages/libs/src/',
  },
  transform: {},
};
