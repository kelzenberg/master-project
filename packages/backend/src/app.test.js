import { createApp } from './app.js';

jest.mock('node:path');
jest.mock('node:url');
jest.mock('express');
jest.mock('body-parser');
jest.mock('compression');
jest.mock('helmet');
jest.mock('express-basic-auth');
jest.mock('serve-favicon');
jest.mock('./middlewares/authorizer.js');
jest.mock('./routes/public.js');
jest.mock('./routes/protected.js');
jest.mock('./middlewares/error-handler.js');
jest.mock('./middlewares/redirect-handler.js');

describe('createApp', () => {
  it('returns an ExpressJS app', () => {
    const app = createApp(jest.fn());
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });
});
