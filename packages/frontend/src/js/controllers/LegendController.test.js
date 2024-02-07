import { LegendController } from './LegendController';

describe('LegendController', () => {
  let mockElement;
  let documentQuerySelectorSpy;

  beforeEach(() => {
    mockElement = {
      append: jest.fn(),
      replaceChildren: jest.fn(),
      style: {},
    };

    documentQuerySelectorSpy = jest.spyOn(document, 'querySelector');
    documentQuerySelectorSpy.mockImplementation(() => mockElement);
  });

  afterEach(() => {
    documentQuerySelectorSpy.mockRestore();
  });

  it('should initialize legend', () => {
    const typeDefinitions = {
      type1: {
        color: [1, 1, 1],
        radius: 1,
        name: 'Type 1',
        info: 'Info 1',
      },
      type2: {
        color: [0, 0, 0],
        radius: 2,
        name: 'Type 2',
        info: 'Info 2',
      },
    };

    const controller = new LegendController(typeDefinitions);
    controller.initializeLegend();

    expect(mockElement.replaceChildren).toHaveBeenCalled();
  });

  it('should toggle legend visibility', () => {
    const controller = new LegendController({});
    controller.toggleLegend();

    expect(mockElement.style.display).toBe('block');

    controller.toggleLegend();

    expect(mockElement.style.display).toBe('none');
  });
});
