const template = document.createElement('template');
template.innerHTML = `
    <div class="rangeSliderContainer">
        <span></span>
        <input type="range" min="1" max="100" value="50" id="slider">
        <div class="rangeSliderModal">
          <span class="modalContent" id="infoMin"></span>
          <span class="modalContent" id="infoMax"></span>
        </div>
    </div>
`;

class rangeSlider extends HTMLElement {
  static get observedAttributes() {
    return ['min', 'max', 'label', 'value', 'scale', 'disabled'];
  }

  constructor() {
    super();

    this.min = 1;
    this.max = 100;
    this.value = 50;
    this.disabled = false;

    this.inputHandler = this.handleInput.bind(this);
  }

  handleInput(event) {
    if (!event.target.value) return;

    const value = event.target.value * 1;

    if (value <= this.min || value >= this.max) return;

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

    this.text.innerHTML = this.value + ' ';
    // eslint-disable-next-line unicorn/prefer-dom-node-text-content
    this.modalInfoMin.innerText = 'Minimum: ' + this.min;
    // eslint-disable-next-line unicorn/prefer-dom-node-text-content
    this.modalInfoMax.innerText = 'Maximum: ' + this.max;
  }

  setAttributeValues() {
    this.input?.setAttribute('min', this.min);
    this.input?.setAttribute('max', this.max);
    this.input?.setAttribute('value', this.value);
    this.input?.toggleAttribute('disabled', this.disabled === true || this.disabled === 'true');
  }

  // Life-cycle methods
  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue === oldValue) return;

    switch (name) {
      case 'min': {
        this.min = newValue;
        break;
      }
      case 'max': {
        this.max = newValue;
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
    }

    this.renderValues();
    this.setAttributeValues();
  }

  connectedCallback() {
    this.append(template.content.cloneNode(true));

    this.querySelector('#slider').addEventListener('input', this.inputHandler);

    this.text = this.querySelector('span');
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
