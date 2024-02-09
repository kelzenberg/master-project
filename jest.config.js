/* eslint-disable no-undef */
/* eslint-disable unicorn/prefer-module */
/** @type {import('jest').Config} */
module.exports = {
  rootDir: './',
  projects: ['<rootDir>/packages/frontend/jest.config.js', '<rootDir>/packages/backend/jest.config.js'],
};
