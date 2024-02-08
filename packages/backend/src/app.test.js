/* eslint-disable unicorn/consistent-function-scoping */
import { jest } from '@jest/globals';

jest.unstable_mockModule('node:path', () => ({
  path: jest.fn(),
}));
jest.unstable_mockModule('node:url', () => ({
  url: jest.fn(),
}));
jest.unstable_mockModule('express', () => ({
  express: jest.fn(() => ({ use: jest.fn() })),
}));
jest.unstable_mockModule('compression', () => ({
  compression: jest.fn(),
}));
jest.unstable_mockModule('helmet', () => ({
  helmet: jest.fn(),
}));
jest.unstable_mockModule('body-parser', () => ({
  bodyParser: jest.fn(() => ({ json: jest.fn() })),
}));
jest.unstable_mockModule('express-basic-auth', () => jest.fn());
jest.unstable_mockModule('serve-favicon', () => ({
  favicon: jest.fn(),
}));
jest.unstable_mockModule('./middlewares/authorizer.js', () => ({
  authorizer: jest.fn(() => () => jest.fn()),
}));
jest.unstable_mockModule('./middlewares/redirect-handler.js', () => ({
  redirectHandler: jest.fn(),
}));
jest.unstable_mockModule('./middlewares/error-handler.js', () => ({
  createErrorHandler: jest.fn(),
}));
jest.unstable_mockModule('./routes/public.js', () => ({
  routes: jest.fn(),
}));
jest.unstable_mockModule('./routes/protected.js', () => ({
  routes: jest.fn(),
}));

// const path = import('node:path');
// const url = import('node:url');
// const express = import('express');
// const compression = import('compression');
// const helmet = import('helmet');
// const bodyParser = import('body-parser');
// const basicAuth = import('express-basic-auth');
// const favicon = import('serve-favicon');
// const { authorizer } = import('./middlewares/authorizer.js');
// const { redirectHandler } = import('./middlewares/redirect-handler.js');
// const { createErrorHandler } = import('./middlewares/error-handler.js');
// const { routes: publicRoutes } = import('./routes/public.js');
// const { routes: protectedRoutes } = import('./routes/protected.js');

describe('createApp', () => {
  it('returns an ExpressJS app', () => {
    const { createApp } = import('./app.js');
    const app = createApp(jest.fn());
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });
});
