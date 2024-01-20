export class LegendController {
  #isLegendVisible;
  #typeDefinitions;

  constructor(typeDefinitions) {
    this.#typeDefinitions = typeDefinitions;
    this.#isLegendVisible = false;
  }

  initializeLegend() {
    const legendContainer = document.querySelector('#legendContainer');

    // Loop through each type definition and create corresponding HTML elements
    for (const key in this.#typeDefinitions) {
      if (!(key === 'empty') && Object.prototype.hasOwnProperty.call(this.#typeDefinitions, key)) {
        const type = this.#typeDefinitions[key];

        // Create a div element for each type
        const typeDiv = document.createElement('div');
        typeDiv.classList.add('legendType');
        typeDiv.style.display = 'flex'; // Set display to flex
        typeDiv.style.flexDirection = 'column'; // Arrange children vertically

        // Create a div container for the circle and text elements
        const rowContainer = document.createElement('div');
        rowContainer.style.display = 'flex'; // Set display to flex
        rowContainer.style.alignItems = 'center'; // Center items vertically

        // Create a colored circle with outline
        const circleDiv = document.createElement('div');
        circleDiv.classList.add('legendCircle');
        circleDiv.style.backgroundColor = `rgb(${type.color.map(val => val * 255).join(',')})`;
        circleDiv.style.border = '1px solid black';
        circleDiv.style.borderRadius = '50%';
        circleDiv.style.width = `${type.radius * 20}px`; // Adjust the size as needed
        circleDiv.style.height = `${type.radius * 20}px`; // Adjust the size as needed
        circleDiv.style.flex = '0 0 auto'; // Prevent the circle from shrinking
        circleDiv.style.marginRight = '8px'; // Add right margin (adjust as needed)

        // Create a span element for the type name
        const nameSpan = document.createElement('span');
        nameSpan.textContent = type.name;
        nameSpan.style.marginRight = '8px'; // Add right margin (adjust as needed)

        // Create a span element for the type key (C, H, O, ...)
        const keySpan = document.createElement('span');
        keySpan.textContent = `(${key})`;
        keySpan.style.marginRight = '8px'; // Add right margin (adjust as needed)

        // Append the circle and text elements to the rowContainer
        rowContainer.append(circleDiv);
        rowContainer.append(nameSpan);
        rowContainer.append(keySpan);

        // Create a span element for the type info
        const infoP = document.createElement('p');
        infoP.textContent = type.info;

        // Append the rowContainer and infoSpan to the typeDiv
        typeDiv.append(rowContainer);
        typeDiv.append(infoP);

        // Append the typeDiv to the legendContainer
        legendContainer.append(typeDiv);
      }
    }
  }

  toggleLegend() {
    this.#isLegendVisible = !this.#isLegendVisible;
    const toggle = document.querySelector('#legendContainer');
    this.#isLegendVisible
      ? // set the legendDiv.style.visibility='visible'
        (toggle.style.display = 'block')
      : // set the legendDiv.style.visibility='hidden'
        (toggle.style.display = 'none');
  }
}
