import { SliderController } from './SliderController';

describe('SliderController', () => {
  let mockElement;
  let documentQuerySelectorSpy;

  beforeEach(() => {
    mockElement = {
      append: jest.fn(),
      replaceChildren: jest.fn(),
      style: {},
      setAttribute: jest.fn(),
      addEventListener: jest.fn(),
    };

    documentQuerySelectorSpy = jest.spyOn(document, 'querySelector');
    documentQuerySelectorSpy.mockImplementation(() => mockElement);
    jest.mock('./packages/frontend/src/js/services/sockets');
  });

  afterEach(() => {
    documentQuerySelectorSpy.mockRestore();
  });

  it('should initialize slider', () => {
    const sliderData = [
      {
        min: 0,
        max: 100,
        default: 50,
        label: 'Test Slider',
        info: 'Test Info',
      },
    ];

    const controller = new SliderController(sliderData);
    controller.initializeSlider(true);

    expect(mockElement.replaceChildren).toHaveBeenCalled();
    expect(mockElement.setAttribute).toHaveBeenCalledWith('islogscale', false);
    expect(mockElement.setAttribute).toHaveBeenCalledWith('min', sliderData[0].min);
    expect(mockElement.setAttribute).toHaveBeenCalledWith('max', sliderData[0].max);
    expect(mockElement.setAttribute).toHaveBeenCalledWith('value', sliderData[0].default);
    expect(mockElement.setAttribute).toHaveBeenCalledWith('label', sliderData[0].label);
    expect(mockElement.setAttribute).toHaveBeenCalledWith('info', sliderData[0].info);
    expect(mockElement.setAttribute).toHaveBeenCalledWith('disabled', false);
  });

  it('should update slider values', () => {
    const sliderData = [
      {
        label: 'Test Slider',
        value: 75,
      },
    ];

    const controller = new SliderController([]);
    controller.updateSliderValues(sliderData);

    expect(mockElement.setAttribute).toHaveBeenCalledWith('value', sliderData[0].value);
  });
});
