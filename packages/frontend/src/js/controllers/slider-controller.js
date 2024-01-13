export class SliderController {
  #sliders;

  constructor(sliders) {
    this.#sliders = sliders;
  }

  initializeSliders() {
    const sliderContainer = document.querySelector('#sliderContainer');

    for (const sliderData of this.#sliders) {
      const rangeSlider = document.createElement('range-slider');

      // Setzen der Attribute für den Range-Slider
      rangeSlider.setAttribute('min', sliderData.min);
      rangeSlider.setAttribute('max', sliderData.max);
      rangeSlider.setAttribute('value', sliderData.default);
      rangeSlider.setAttribute('label', sliderData.label);
      rangeSlider.setAttribute('scale', sliderData.scale);
      rangeSlider.setAttribute('info', sliderData.info);

      sliderContainer.append(rangeSlider);
    }
  }
}
