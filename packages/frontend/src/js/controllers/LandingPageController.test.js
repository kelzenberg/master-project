/* eslint-disable no-undef */
import { LandingPageController } from './LandingPageController';

describe('LandingPageController', () => {
  let mockElement;
  let documentQuerySelectorSpy;

  beforeEach(() => {
    mockElement = {
      append: jest.fn(),
      style: {},
    };

    documentQuerySelectorSpy = jest.spyOn(document, 'querySelector');
    documentQuerySelectorSpy.mockImplementation(() => mockElement);
  });

  afterEach(() => {
    documentQuerySelectorSpy.mockRestore();
  });

  it('should initialize landing page', async () => {
    const config = [
      {
        id: 1,
        title: 'Test',
        description: 'Test Description',
        thumbnail: 'test.jpg',
      },
    ];

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(config),
      })
    );

    const controller = new LandingPageController();
    await controller.initializeLandingPage();

    expect(mockElement.append).toHaveBeenCalled();
    const simulationPreview = mockElement.append.mock.calls[0][0];
    expect(simulationPreview.getAttribute('title')).toBe('Test');
    expect(simulationPreview.getAttribute('description')).toBe('Test Description');
    expect(simulationPreview.getAttribute('href')).toBe('./simulation.html?id=1');
    expect(simulationPreview.style.backgroundImage).toBe('url(test.jpg)');
  });
});
