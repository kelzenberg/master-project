const template = document.createElement('template');
template.innerHTML = `
  <div class="simulation-preview">
    <div class="simulationPreview__container">
      <div class="simulationPreview__innerContainer">
        <h3>Name</h3>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
        magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.
        </p>
        <a></a>
      </div>
    </div>
  </div>
`;

class SimulationPreview extends HTMLElement {
  static get observedAttributes() {
    return ['href'];
  }

  constructor() {
    super();

    this.append(template.content.cloneNode(true));

    this.clickHandler = this.handleClick.bind(this);

    this.link = this.querySelector('a');
  }

  handleClick() {
    this.link.click();
  }

  updateLink() {
    this.link.href = this.href;
  }

  // Life-cycle methods
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'href' && newValue !== oldValue) {
      this.href = newValue;
      this.updateLink();
    }
  }

  connectedCallback() {
    this.addEventListener('click', this.clickHandler);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.clickHandler);
  }
}

customElements.define('simulation-preview', SimulationPreview);
