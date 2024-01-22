//import { sendSliderEvent } from '../services/sockets';
export class SliderController {
  #sliders;

  constructor(sliders) {
    this.#sliders = sliders;
  }

  initializeSliders() {
    const sliderContainer = document.querySelector('#sliderContainer');

    const sliders = this.#sliders.map(sliderData => {
      const rangeSlider = document.createElement('range-slider');

      // Setzen der Attribute für den Range-Slider
      rangeSlider.setAttribute('min', sliderData.min);
      rangeSlider.setAttribute('max', sliderData.max);
      rangeSlider.setAttribute('value', sliderData.default);
      rangeSlider.setAttribute('label', sliderData.label);
      rangeSlider.setAttribute('scale', sliderData.scale);
      rangeSlider.setAttribute('info', sliderData.info);

      // Add event listener for the custom event
      rangeSlider.addEventListener('valueChanged', event => {
        this.#sendValueChangedEvent(event.detail.label, event.detail.value);
      });

      return rangeSlider;
    });

    sliderContainer.replaceChildren(...sliders);
  }

  #sendValueChangedEvent(label, value) {
    console.log(label + ' ' + value);
    //console.log(label + ' new value = ' + value);
    // sendSliderEvent({
    //   label,
    //   value,
    // });
  }
}
