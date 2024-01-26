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
    var content = null;
    content = isSuperUser
      ? this.#sliders.map(sliderData => {
          const rangeSlider = document.createElement('range-slider');

          rangeSlider.setAttribute('min', sliderData.min);
          rangeSlider.setAttribute('max', sliderData.max);
          rangeSlider.setAttribute('value', sliderData.default);
          rangeSlider.setAttribute('label', sliderData.label);
          rangeSlider.setAttribute('scale', sliderData.scale);
          rangeSlider.setAttribute('info', sliderData.info);

          rangeSlider.addEventListener('valueChanged', event => {
            this.#sendValueChangedEvent(event.detail.label, event.detail.value);
          });

          return rangeSlider;
        })
      : this.#sliders.map(sliderData => {
          const labeledInfoFieldDiv = document.createElement('div');

          const labeledInfoFieldDescription = document.createElement('p');
          labeledInfoFieldDescription.textContent = sliderData.info;
          labeledInfoFieldDescription.style.marginBottom = '0px';

          const labeledInfoField = document.createElement('span');
          labeledInfoField.textContent = sliderData.label + ' = ' + sliderData.default;
          labeledInfoField.id = sliderData.label;
          labeledInfoField.style.marginBottom = '10px';

          labeledInfoFieldDiv.append(labeledInfoFieldDescription);
          labeledInfoFieldDiv.append(labeledInfoField);
          return labeledInfoFieldDiv;
        });

    sliderContainer.replaceChildren(...content);
  }

  updateLabeledInfoFields(sliderData, isSuperUser) {
    if (!isSuperUser) {
      for (const data of sliderData) {
        const { label, value } = data;

        const labeledInfoField = this.#findLabeledInfoFieldById(label);

        if (labeledInfoField) {
          labeledInfoField.textContent = label + ' = ' + value;
        }
      }
    }
  }

  #findLabeledInfoFieldById(label) {
    // Find the labeled-info-field element with the specified label
    return document.querySelector(`span[id="${label}"]`);
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
