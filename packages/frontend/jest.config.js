import pack from './package.json' with { type: 'json' };
const esModules = ['plotly.js-dist-min', 'three'].join('|');

/** @type {import('jest').Config} */
export default {
  displayName: pack.name,
  setupFilesAfterEnv: ['./setup-jest.js'],
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  modulePathIgnorePatterns: ['dist'],
  moduleNameMapper: {
    '@master-project/libs/(.*)$': '../libs/src/',
  },
  transform: {
    '^.+\\.(m?js|ts)$': ['babel-jest', { rootMode: 'upward', configFile: './babel.config.json' }], // transpile mjs, mts, js, ts files
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  testEnvironment: 'jsdom',
};
