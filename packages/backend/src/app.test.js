import { createApp } from './app.js';

describe('createApp', () => {
  it('returns an ExpressJS app', () => {
    const app = createApp(jest.fn());
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });
});
