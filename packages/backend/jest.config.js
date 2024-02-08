/* eslint-disable unicorn/prefer-module */
const pack = require('./package');

/** @type {import('jest').Config} */
module.exports = {
  displayName: pack.name,
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  moduleNameMapper: {
    '@master-project/libs/(.*)$': '../libs/src/',
  },
  transform: {
    '^.+\\.(m?js|ts)$': ['babel-jest', { rootMode: 'upward' }], // transpile mjs, mts, js, ts files
  },
  testEnvironment: 'node',
};
