/* eslint-disable no-undef */
import { SimulationPageController } from './SimulationPageController';

// Mock required dependencies
jest.mock('./VisualizationController', () => ({
  VisualizationController: jest.fn().mockImplementation(() => ({
    renderInitialData: jest.fn(),
    renderDynamicData: jest.fn(),
    animate: jest.fn(),
  })),
}));
jest.mock('./PlotController', () => ({
  PlotController: jest.fn().mockImplementation(() => ({
    renderInitialData: jest.fn(),
    updatePlots: jest.fn(),
    toggleTof: jest.fn(),
    toggleCoverage: jest.fn(),
  })),
}));
jest.mock('./SliderController', () => ({
  SliderController: jest.fn().mockImplementation(() => ({
    initializeSlider: jest.fn(),
    updateSliderValues: jest.fn(),
  })),
}));
jest.mock('./LegendController', () => ({
  LegendController: jest.fn().mockImplementation(() => ({
    initializeLegend: jest.fn(),
    toggleLegend: jest.fn(),
  })),
}));

describe('SimulationPageController', () => {
  let simPageController;

  beforeEach(() => {
    simPageController = new SimulationPageController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize without errors', () => {
    expect(simPageController).toBeDefined();
  });

  it('should have init method', () => {
    expect(simPageController.init).toBeDefined();
  });

  it('should have getSimId method', () => {
    expect(simPageController.getSimId).toBeDefined();
  });

  it('should have renderInitialData method', () => {
    expect(simPageController.renderInitialData).toBeDefined();
  });

  it('should have renderDynamicData method', () => {
    expect(simPageController.renderDynamicData).toBeDefined();
  });

  it('should have animate method', () => {
    expect(simPageController.animate).toBeDefined();
  });
  describe('getSimId', () => {
    it('should return simId when it is present in the URL', () => {
      delete global.window.location;
      global.window = Object.create(window);
      const url = 'http://example.com?id=123';
      global.window.location = new URL(url);
      const simId = simPageController.getSimId();
      expect(simId).toEqual('123');
    });
  });
});
