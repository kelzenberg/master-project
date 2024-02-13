/* eslint-disable unicorn/prefer-module */
const pack = require('./package');

/** @type {import('jest').Config} */
module.exports = {
  displayName: pack.name,
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  testEnvironment: 'node',
};
