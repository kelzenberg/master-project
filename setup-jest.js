import { jest, beforeEach, afterAll } from '@jest/globals';

jest.mock('<rootDir>/packages/frontend/src/js/services/sockets');

beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(() => {});
