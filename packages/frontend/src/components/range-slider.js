const template = document.createElement('template');
template.innerHTML = `
    <div class="sliderContainer">
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
  }

  disconnectedCallback() {
    this.shadow.querySelector('#slider').removeEventListener('input', this.inputHandler);
  }
}

customElements.define('range-slider', rangeSlider);
