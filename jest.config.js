const esModules = ['plotly.js-dist-min', 'three'].join('|');

/** @type {import('jest').Config} */
// eslint-disable-next-line unicorn/prefer-module, no-undef
module.exports = {
  rootDir: '.',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.js'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  modulePathIgnorePatterns: ['dist'],
  moduleNameMapper: {
    '@master-project/libs/(.*)$': '<rootDir>/packages/libs/src',
  },
  transform: {
    '^.+\\.(m?js|ts)$': ['babel-jest', { rootMode: 'upward' }], // transpile mjs, mts, js, ts files
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  verbose: false, // for debugging only
};
