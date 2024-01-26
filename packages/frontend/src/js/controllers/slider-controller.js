//import { sendSliderEvent } from '../services/sockets';
export class SliderController {
  #sliders;

  constructor(sliders) {
    this.#sliders = sliders;
  }

  // Depending on if the user is a super-user with slider-controls or not either the range-sliders or
  // the labeled info fields with current values of the sliders (parameters like temperature etc.) should be initialized
  initializeSliders(isSuperUser) {
    const sliderContainer = document.querySelector('#sliderContainer');
    const sliders = this.#sliders.map(sliderData => {
      const rangeSlider = document.createElement('range-slider');

      rangeSlider.setAttribute('min', sliderData.min);
      rangeSlider.setAttribute('max', sliderData.max);
      rangeSlider.setAttribute('value', sliderData.default);
      rangeSlider.setAttribute('label', sliderData.label);
      rangeSlider.setAttribute('scale', sliderData.scale);
      rangeSlider.setAttribute('info', sliderData.info);

      rangeSlider.setAttribute('disabled', !isSuperUser);

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
