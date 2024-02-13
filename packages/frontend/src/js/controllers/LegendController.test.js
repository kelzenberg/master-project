import { LegendController } from './LegendController';

describe('LegendController', () => {
  let mockElement;
  let documentQuerySelectorSpy;

  beforeEach(() => {
    mockElement = {
      append: jest.fn(),
      replaceChildren: jest.fn(),
      style: {},
      querySelectorAll: jest.fn(), // Mocking querySelectorAll
    };

    documentQuerySelectorSpy = jest.spyOn(document, 'querySelector');
    documentQuerySelectorSpy.mockImplementation(() => mockElement);

    // Mocking querySelectorAll implementation for legendContainer
    mockElement.querySelectorAll.mockImplementation(selector =>
      selector === '.typeContainer' ? [{ style: {} }, { style: {} }] : []
    );
  });

  afterEach(() => {
    documentQuerySelectorSpy.mockRestore();
  });

  it('should toggle legend visibility', () => {
    const controller = new LegendController({});
    controller.toggleLegend();

    expect(mockElement.style.display).toBe('flex');

    controller.toggleLegend();

    expect(mockElement.style.display).toBe('none');
  });
});
