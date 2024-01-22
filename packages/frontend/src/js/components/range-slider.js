const template = document.createElement('template');
template.innerHTML = `
    <style>
      .rangeSliderContainer {
        position: relative;
      }
      span {
        position: absolute;
        max-width: 100%;
      }
      input[type=range] {
        height: 25px;
        -webkit-appearance: none;
        margin: 10px 0;
        width: 100%;
        background: transparent;
      }
      input[type=range]:focus {
        outline: none;
      }
      input[type=range]::-webkit-slider-runnable-track {
        width: 100%;
        height: 2px;
        cursor: pointer;
        animate: 0.2s;
        background: #006c66;
      }
      input[type=range]::-webkit-slider-thumb {
        border: 1px solid #006C66;
        height: 18px;
        width: 18px;
        border-radius: 20px;
        background: #006C66;
        cursor: pointer;
        -webkit-appearance: none;
        margin-top: -8.5px;
      }
      input[type=range]:focus::-webkit-slider-runnable-track {
        background: #006c66;
      }
      input[type=range]::-moz-range-track {
        width: 100%;
        height: 2px;
        cursor: pointer;
        animate: 0.2s;
        background: #006c66;
      }
      input[type=range]::-moz-range-thumb {
        border: 1px solid #006C66;
        height: 18px;
        width: 18px;
        border-radius: 20px;
        background: #006C66;
        cursor: pointer;
      }

    </style>
    <div class="rangeSliderContainer">
        <span></span>
        <input type="range" min="1" max="100" value="50" id="slider">
    </div>
`;

class rangeSlider extends HTMLElement {
  static get observedAttributes() {
    return ['min', 'max', 'steps'];
  }

  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.append(template.content.cloneNode(true));

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

  renderValueText() {
    const xOff = this.input.offsetWidth / (Number.parseInt(this.max) - Number.parseInt(this.min));
    const px = (this.input.valueAsNumber - Number.parseInt(this.min)) * xOff - this.text.offsetParent.offsetWidth / 2;

    this.text.style.left = px + 'px';
    this.text.style.top = this.input.offsetHeight + 'px';
    this.text.innerHTML = this.input.value + ' ';
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
    }
  }

  connectedCallback() {
    this.shadow.querySelector('#slider').addEventListener('input', this.inputHandler);

    this.text = this.shadow.querySelector('span');
    this.input = this.shadow.querySelector('input');

    this.renderValueText();
  }

  disconnectedCallback() {
    this.shadow.querySelector('#slider').removeEventListener('input', this.inputHandler);
  }
}

customElements.define('range-slider', rangeSlider);
