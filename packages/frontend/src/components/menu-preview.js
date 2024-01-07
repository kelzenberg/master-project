const template = document.createElement('template');
template.innerHTML = `
  <style>
    * {
      cursor: pointer;
    }

    .backBtn {
      padding: 5px 7px;
      cursor: pointer;
      background-color: #006C66;
      border:none;
      border-radius: 10px;
      background-image: url("../ressources/misc/left-arrow.png");
    }

  </style>

    <button class="backBtn"><a href="${this.href}"></a>
    <img
        src="./ressources/misc/left-arrow.png"
        alt="Back"
        width="30"
        height="30"
      /></button>
`;

class BackBtn extends HTMLElement {
  static get observedAttributes() {
    return ['href'];
  }

  constructor() {
    super();

    const shadow = this.attachShadow({ mode: 'open' });
    shadow.append(template.content.cloneNode(true));

    this.clickHandler = this.handleClick.bind(this);

    this.link = shadow.querySelector('a');
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

customElements.define('menu-preview', BackBtn);
