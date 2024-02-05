/* eslint-disable no-undef */

beforeAll(() => {
  global.Plotly = {
    newPlot: jest.fn(() => ({ data: [] })),
    update: jest.fn(),
  };
});

afterAll(() => {
  global.Plotly = undefined;
});

jest.mock('./packages/frontend/src/js/services/sockets');
