import { sendSliderEvent } from '../services/sockets';
export class SliderController {
  #slider;

  constructor(slider) {
    this.#slider = slider;
  }

  initializeSlider(isSuperUser) {
    const sliderContainer = document.querySelector('#sliderContainer');
    const slider = this.#slider.map(sliderData => {
      const rangeSlider = document.createElement('range-slider');

      rangeSlider.setAttribute('min', sliderData.min);
      rangeSlider.setAttribute('max', sliderData.max);
      rangeSlider.setAttribute('value', sliderData.default);
      rangeSlider.setAttribute('label', sliderData.label);
      rangeSlider.setAttribute('scale', sliderData.scale);
      rangeSlider.setAttribute('info', sliderData.info);

      rangeSlider.setAttribute('disabled', !isSuperUser);

      rangeSlider.addEventListener('change', event => {
        this.#sendChangeEvent(event.currentTarget.getAttribute('label'), event.target.value);
      });

      return rangeSlider;
    });

    sliderContainer.replaceChildren(...slider);
  }

  updateSliderValues(sliderData) {
    sliderData.map(sliderData => {
      let rangeSlider = this.#findSliderByLabel(sliderData.label);
      rangeSlider.setAttribute('value', sliderData.value);
    });
  }

  #findSliderByLabel(label) {
    return document.querySelector(`range-slider[label="${label}"]`);
  }

  #sendChangeEvent(label, value) {
    console.log(label + ' ' + value);
    sendSliderEvent({
      label,
      value,
    });
  }
}
