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

      const isLogScale = sliderData.min.toString().includes('e') || sliderData.max.toString().includes('e');

      rangeSlider.setAttribute('islogscale', isLogScale);
      rangeSlider.setAttribute('min', sliderData.min);
      rangeSlider.setAttribute('max', sliderData.max);
      rangeSlider.setAttribute('value', sliderData.default);
      rangeSlider.setAttribute('label', sliderData.label);
      rangeSlider.setAttribute('info', sliderData.info);

      rangeSlider.setAttribute('disabled', !isSuperUser);

      rangeSlider.addEventListener('change', event => {
        this.#sendChangeEvent(event.currentTarget.getAttribute('label'), event.currentTarget.value);
        console.log(event.currentTarget.value);
      });

      return rangeSlider;
    });

    sliderContainer.replaceChildren(...slider);
  }

  // Funktioniert nicht!
  // reproduce: in SimulationPageController die if Bedingugn vorm Aufurf von updateSliderValues rausnehmen
  // dann anwendung starten
  // slider verschieben -> eigentlich sollte bei nächster dynamic data dann der slider value wieder geupdated werden, passiert aber nicht!
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
