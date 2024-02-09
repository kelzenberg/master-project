const template = document.createElement('template');
template.innerHTML = `
    <div class="rangeSliderContainer">
        <div class="rangeSliderTitleContainer">
          <span id="rangeSliderLabel"></span>
          <div id="rangeSliderIcon">
            <div class="rangeSliderModal">
              <span class="modalContent" id="rangerSliderLogInfo"></span>
              <span id="rangeSliderInfo">Controls the ambient temperature (in Fahrenheit) of the simulation.</span>
              <span class="modalContent" id="infoMin"></span>
              <span class="modalContent" id="infoMax"></span>
            </div>
          </div>
        </div>
        <input type="range" min="0" max="100" value="50" step="1" id="slider">
        <span id="rangeSliderValue"></span>
    </div>
`;

class rangeSlider extends HTMLElement {
  static get observedAttributes() {
    return ['min', 'max', 'label', 'value', 'scale', 'disabled', 'info', 'islogscale'];
  }

  constructor() {
    super();

    // Attribute values
    this.labelText = '';
    this.infoText = 'Controls the ambient temperature (in Fahrenheit) of the simulation.';
    this.min = 0;
    this.max = 100;
    this.value = 50;
    this.disabled = false;

    // other variables
    this.steps = 100;
    this.stepSize = 1;
    this.isLogScale = '';
    this.initialMin = 0;
    this.initialMax = 0;

    this.inputHandler = this.handleInput.bind(this);
  }

  calculateStepSize() {
    this.stepSize = (this.max - this.min) / this.steps;
  }

  calculateSymmetricalLog(value) {
    // handle 0 directly
    if (Number(value) === 0) return value;

    const absLogValue = Math.log10(Math.abs(value));

    return value > 0 ? absLogValue : -absLogValue;
  }

  sliderPositionToValue(position) {
    if (!this.isLogScale) {
      return Number(this.min) + this.stepSize * position;
    }

    const logValue = Number(this.min) + this.stepSize * position;

    return Math.pow(10, logValue);
  }

  sliderPosition(value) {
    value = this.isLogScale ? this.calculateSymmetricalLog(value) : value;
    return (Number(value) - Number(this.min)) / this.stepSize;
  }

  handleInput(event) {
    if (!event.target.value) return;

    let value = this.sliderPositionToValue(event.target.value);

    if (value > this.initialMax) value = this.initialMax;
    if (value < this.initialMin) value = this.initialMin;

    this.value = value;

    // Dispatch a custom event with the label and new value
    const eventOptions = { bubbles: true, composed: true };
    const valueChangedEvent = new CustomEvent('valueChanged', {
      detail: { label: this.getAttribute('label'), value: this.value },
      ...eventOptions,
    });

    this.dispatchEvent(valueChangedEvent);

    this.renderValues();
  }

  renderValues() {
    if (!this.text) return;

    this.info.textContent = this.infoText;
    this.label.textContent = this.labelText;
    this.text.textContent = Number.parseFloat(this.value).toPrecision(3);
    // eslint-disable-next-line unicorn/prefer-dom-node-text-content
    this.modalInfoMin.innerText = 'Minimum: ' + this.initialMin;
    // eslint-disable-next-line unicorn/prefer-dom-node-text-content
    this.modalInfoMax.innerText = 'Maximum: ' + this.initialMax;
    // Set text content and color based on isLogScale
    if (this.isLogScale) {
      this.modalLogInfo.textContent = 'Logarithmic scale';
      this.modalLogInfo.style.color = '#6C0006';
    } else {
      this.modalLogInfo.textContent = 'Linear scale';
    }
  }

  setAttributeValues() {
    this.input?.setAttribute('value', this.sliderPosition(this.value));
    this.input?.toggleAttribute('disabled', this.disabled === true || this.disabled === 'true');
  }

  convertStringToBool(value) {
    if (typeof value !== 'string') return value;

    return value === 'true';
  }

  // Life-cycle methods
  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue === oldValue) return;

    switch (name) {
      case 'label': {
        this.labelText = newValue;
        break;
      }
      case 'min': {
        this.initialMin = newValue;
        this.min = this.isLogScale ? this.calculateSymmetricalLog(newValue) : newValue;
        this.calculateStepSize();
        break;
      }
      case 'max': {
        this.initialMax = newValue;
        this.max = this.isLogScale ? this.calculateSymmetricalLog(newValue) : newValue;
        this.calculateStepSize();
        break;
      }
      case 'value': {
        this.value = newValue;
        break;
      }
      case 'disabled': {
        this.disabled = newValue;
        break;
      }
      case 'info': {
        this.info = newValue;
        break;
      }
      case 'islogscale': {
        this.isLogScale = this.convertStringToBool(newValue);
        break;
      }
    }

    this.renderValues();
    this.setAttributeValues();
  }

  connectedCallback() {
    this.append(template.content.cloneNode(true));

    this.querySelector('#slider').addEventListener('input', this.inputHandler);

    this.label = this.querySelector('#rangeSliderLabel');
    this.info = this.querySelector('#rangeSliderInfo');
    this.text = this.querySelector('#rangeSliderValue');
    this.modalLogInfo = this.querySelector('#rangerSliderLogInfo');
    this.modalInfoMin = this.querySelector('#infoMin');
    this.modalInfoMax = this.querySelector('#infoMax');
    this.input = this.querySelector('input');

    this.setAttributeValues();
    this.renderValues();
  }

  disconnectedCallback() {
    this.querySelector('#slider').removeEventListener('input', this.inputHandler);
    this.innerHTML = '';
  }
}

customElements.define('range-slider', rangeSlider);
