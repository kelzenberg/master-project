/** @type {import('jest').Config} */
const config = {
  rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.js'],
  clearMocks: true,
};

// eslint-disable-next-line unicorn/prefer-module, no-undef
module.exports = config;
