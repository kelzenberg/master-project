import pack from './package.json' with { type: 'json' };

/** @type {import('jest').Config} */
export default {
  displayName: pack.name,
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {},
  testEnvironment: 'node',
};
