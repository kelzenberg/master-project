/* eslint-disable no-undef */
/* eslint-disable unicorn/prefer-module */
/** @type {import('jest').Config} */
module.exports = {
  rootDir: './',
  projects: ['<rootDir>/packages/backend/jest.config.js'],
  moduleNameMapper: {
    '@master-project/libs/src/(.*)$': 'packages/libs/src/',
  },
};
