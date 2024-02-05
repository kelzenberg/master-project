// Import the LegendController class
import { LegendController } from './LegendController';

// Mock document functions for testing
jest.mock('document', () => ({
  querySelector: jest.fn(),
}));

describe('LegendController', () => {
  let legendController;

  beforeEach(() => {
    // Mock the typeDefinitions
    const typeDefinitions = {
      type1: {
        name: 'Type 1',
        color: [0.2, 0.4, 0.6],
        radius: 0.1,
        info: 'Type 1 Information',
      },
      type2: {
        name: 'Type 2',
        color: [0.8, 0.5, 0.1],
        radius: 0.15,
        info: 'Type 2 Information',
      },
      empty: {},
    };

    // Initialize LegendController before each test
    legendController = new LegendController(typeDefinitions);
  });

  describe('initializeLegend', () => {
    test('should create legend table with correct elements', () => {
      // Mock the document.querySelector function
      const mockLegendContainer = document.querySelector.mockReturnValueOnce({
        replaceChildren: jest.fn(),
      });

      // Call the initializeLegend method
      legendController.initializeLegend();

      // Assertions
      expect(mockLegendContainer).toHaveBeenCalledWith('#legendContainer');
      expect(document.createElement).toHaveBeenCalledTimes(5); // table, tr, td, div, p
      expect(document.querySelector).toHaveBeenCalledTimes(1);
    });
  });

  describe('toggleLegend', () => {
    test('should toggle legend visibility and update button state', () => {
      // Mock the document.querySelector function and button elements
      const mockLegend = document.querySelector.mockReturnValueOnce({});
      const mockToggleLegendButton = document.querySelector.mockReturnValueOnce({});
      const mockLegendButtonImage = document.querySelector.mockReturnValueOnce({});
      const mockOpenLegendButtonImage = document.querySelector.mockReturnValueOnce({});

      // Initial state check
      expect(mockOpenLegendButtonImage.title).toBe('Show legend');
      expect(mockOpenLegendButtonImage.style.display).toBe('block');
      expect(mockLegendButtonImage.style.display).toBe('none');
      expect(mockLegend.style.display).toBe('none');

      // Toggle the legend visibility
      legendController.toggleLegend();

      // Assertions for the first toggle
      expect(mockToggleLegendButton.title).toBe('Close legend');
      expect(mockLegendButtonImage.style.display).toBe('block');
      expect(mockOpenLegendButtonImage.style.display).toBe('none');
      expect(mockLegend.style.display).toBe('block');

      // Toggle the legend visibility again
      legendController.toggleLegend();

      // Assertions for the second toggle
      expect(mockOpenLegendButtonImage.title).toBe('Show legend');
      expect(mockOpenLegendButtonImage.style.display).toBe('block');
      expect(mockLegendButtonImage.style.display).toBe('none');
      expect(mockLegend.style.display).toBe('none');
    });
  });
});
