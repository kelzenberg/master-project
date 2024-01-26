const template = document.createElement('template');
template.innerHTML = `
    <div class="rangeSliderContainer">
        <span></span>
        <input type="range" min="1" max="100" value="50" id="slider">
    </div>
`;

class rangeSlider extends HTMLElement {
  static get observedAttributes() {
    return ['min', 'max', 'value', 'scale'];
  }

  constructor() {
    super();

    this.min = 1;
    this.max = 100;
    this.value = 50;

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

    this.renderValueText();
  }

  renderValues() {
    if (!this.text) return;

    this.text.innerHTML = this.value + ' ';
  }

  setInitialAttributeValues() {
    this.input?.setAttribute('min', this.min);
    this.input?.setAttribute('max', this.max);
    this.input?.setAttribute('value', this.value);
  }

  // Life-cycle methods
  attributeChangedCallback(name, oldValue, newValue) {
    console.log(name, oldValue, String(newValue));
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
    }

    this.renderValues();
  }

  connectedCallback() {
    this.append(template.content.cloneNode(true));

    this.setInitialAttributeValues();

    this.querySelector('#slider').addEventListener('input', this.inputHandler);

    this.text = this.querySelector('span');
    this.input = this.querySelector('input');

    this.renderValues();
  }

  disconnectedCallback() {
    this.innerHTML = '';

    this.querySelector('#slider').removeEventListener('input', this.inputHandler);
  }
}

customElements.define('range-slider', rangeSlider);
