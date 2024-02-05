const esModules = ['plotly.js-dist-min'].join('|');

/** @type {import('jest').Config} */
export default {
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.js'],
  clearMocks: true,
  transform: {
    '^.+\\.(m?js|ts)$': 'babel-jest', // transpile mjs, mts, js, ts files
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules})`],
  verbose: true,
};
