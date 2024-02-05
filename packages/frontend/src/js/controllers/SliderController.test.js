import { SliderController } from './SliderController';

jest.mock('../services/sockets');

describe('SliderController', () => {
  let sliderController;

  beforeEach(() => {
    // Mock the slider data
    const sliderData = [
      { label: 'slider1', min: 0, max: 100, default: 50, info: 'Slider 1 Info' },
      { label: 'slider2', min: 10, max: 50, default: 30, info: 'Slider 2 Info' },
    ];

    // Mock the SliderController before each test
    sliderController = new SliderController(sliderData);
  });

  describe('initializeSlider', () => {
    test('should initialize slider with correct attributes', () => {
      document.body.innerHTML = `
        <div id="sliderContainer"></div>
      `;

      try {
        // Call the initializeSlider method
        sliderController.initializeSlider(true);

        // Assertions
        expect(mockSliderContainer).toHaveBeenCalledWith('#sliderContainer');
        expect(document.createElement).toHaveBeenCalledTimes(2); // Two calls for range-slider
        expect(document.querySelector).toHaveBeenCalledTimes(2); // Twice for container and slider

        // Assuming you have specific attributes, adjust the assertions accordingly
        expect(document.createElement).toHaveBeenCalledWith('range-slider');
        expect(document.createElement).toHaveBeenNthCalledWith(2, 'range-slider');

        // Assuming you have specific attributes, adjust the assertions accordingly
        expect(document.createElement().setAttribute).toHaveBeenCalledWith('islogscale', false);
        expect(document.createElement().setAttribute).toHaveBeenCalledWith('min', 0);
        expect(document.createElement().setAttribute).toHaveBeenCalledWith('max', 100);
        expect(document.createElement().setAttribute).toHaveBeenCalledWith('value', 50);
        expect(document.createElement().setAttribute).toHaveBeenCalledWith('label', 'slider1');
        expect(document.createElement().setAttribute).toHaveBeenCalledWith('info', 'Slider 1 Info');
        expect(document.createElement().setAttribute).toHaveBeenCalledWith('disabled', true);

        expect(document.createElement().setAttribute).toHaveBeenCalledWith('islogscale', false);
        expect(document.createElement().setAttribute).toHaveBeenCalledWith('min', 10);
        expect(document.createElement().setAttribute).toHaveBeenCalledWith('max', 50);
        expect(document.createElement().setAttribute).toHaveBeenCalledWith('value', 30);
        expect(document.createElement().setAttribute).toHaveBeenCalledWith('label', 'slider2');
        expect(document.createElement().setAttribute).toHaveBeenCalledWith('info', 'Slider 2 Info');
        expect(document.createElement().setAttribute).toHaveBeenCalledWith('disabled', true);
      } catch (error) {
        // If an exception is thrown, fail the test
        expect(error).toBeNull();
      }
    });
  });

  describe('updateSliderValues', () => {
    test('should update slider values based on provided data', () => {
      // Mock the document.querySelector function and slider elements
      const mockSlider1 = document.querySelector.mockReturnValueOnce({});
      const mockSlider2 = document.querySelector.mockReturnValueOnce({});

      // Call the updateSliderValues method
      sliderController.updateSliderValues([
        { label: 'slider1', value: 75 },
        { label: 'slider2', value: 20 },
      ]);

      // Assertions
      expect(mockSlider1.setAttribute).toHaveBeenCalledWith('value', 75);
      expect(mockSlider2.setAttribute).toHaveBeenCalledWith('value', 20);
    });
  });
});
