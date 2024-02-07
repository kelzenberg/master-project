/* eslint-disable no-undef */

beforeAll(() => {
  jest.mock('./packages/frontend/src/js/services/sockets');
  global.Plotly = {
    newPlot: jest.fn(() => Promise.resolve({ data: [] })),
    update: jest.fn(),
  };
});

afterAll(() => {
  global.Plotly = undefined;
});
