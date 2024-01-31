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
    return ['href', 'title', 'description', 'id'];
  }

  constructor() {
    super();
  }

  handleClick() {
    this.link.click();
  }

  setAttributeValues() {
    this.link.href = this.href;
  }

  renderValues() {
    if (!this.titleElement) return;
    this.titleElement.innerHTML = this.title;
    // eslint-disable-next-line unicorn/prefer-dom-node-text-content
    this.descriptionElement.innerText = this.description;
  }

  // Life-cycle methods
  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue === oldValue) return;

    switch (name) {
      case 'href': {
        this.href = newValue;
        this.setAttributeValues();
        break;
      }
      case 'title': {
        this.title = newValue;
        this.renderValues();
        break;
      }
      case 'description': {
        this.description = newValue;
        this.renderValues();
        break;
      }
    }
  }

  connectedCallback() {
    this.append(template.content.cloneNode(true));
    this.clickHandler = this.handleClick.bind(this);
    this.link = this.querySelector('a');
    this.titleElement = this.querySelector('h3');
    this.descriptionElement = this.querySelector('p');
    this.addEventListener('click', this.clickHandler);

    this.setAttributeValues();
    this.renderValues();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this.clickHandler);
  }
}

customElements.define('simulation-preview', SimulationPreview);
