import { sendSliderEvent } from '../services/sockets';

/**
 * Controls the initialization and updating of sliders.
 */
export class SliderController {
  #slider;

  /**
   * Creates a SliderController instance.
   * @param {Object[]} slider - The slider data.
   * @public
   */
  constructor(slider) {
    this.#slider = slider;
  }

  /**
   * Initializes the sliders.
   * @param {boolean} isModerator - Indicates whether the user is a moderator user and should be able to interact with the sliders or not.
   * @public
   */
  initializeSlider(isModerator) {
    const sliderContainer = document.querySelector('#sliderContainer');
    const slider = this.#slider.map(sliderData => {
      const rangeSlider = document.createElement('range-slider');

      const isLogScale = sliderData.min.toString().includes('e') || sliderData.max.toString().includes('e');

      rangeSlider.setAttribute('islogscale', isLogScale);
      rangeSlider.setAttribute('min', sliderData.min);
      rangeSlider.setAttribute('max', sliderData.max);
      rangeSlider.setAttribute('value', sliderData.default);
      rangeSlider.setAttribute('label', sliderData.label);
      if (sliderData.info !== null) {
        rangeSlider.setAttribute('info', sliderData.info);
      }
      rangeSlider.setAttribute('disabled', !isModerator);

      rangeSlider.addEventListener('change', event => {
        this.#sendChangeEvent(event.currentTarget.getAttribute('label'), event.currentTarget.value);
      });

      return rangeSlider;
    });

    sliderContainer.replaceChildren(...slider);
  }

  /**
   * Updates the values of sliders.
   * @param {Object[]} sliderData - The updated slider data.
   * @public
   */
  updateSliderValues(sliderData) {
    sliderData.map(sliderData => {
      let rangeSlider = this.#findSliderByLabel(sliderData.label);
      rangeSlider.setAttribute('value', sliderData.value);
    });
  }

  /**
   * Finds the HTML object range slider with the specified label.
   * @param label - The label of the slider
   * @public
   */
  #findSliderByLabel(label) {
    return document.querySelector(`range-slider[label="${label}"]`);
  }

  /**
   * Triggers a socket slider change event.
   * @param label the label of the slider that triggered the change event
   * @param value the value of the slider change event
   * @public
   */
  #sendChangeEvent(label, value) {
    sendSliderEvent({
      label,
      value,
    });
  }
}
