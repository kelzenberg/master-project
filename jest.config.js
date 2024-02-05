const esModules = ['plotly.js-dist-min'].join('|');

/** @type {import('jest').Config} */
// eslint-disable-next-line unicorn/prefer-module, no-undef
module.exports = {
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.js'],
  clearMocks: true,
  transform: {
    '^.+\\.(m?js|ts)$': ['babel-jest', { rootMode: 'upward' }], // transpile mjs, mts, js, ts files
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  verbose: true,
};
