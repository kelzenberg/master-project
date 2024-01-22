export class LegendController {
  #isLegendVisible = false;
  #typeDefinitions;

  constructor(typeDefinitions) {
    this.#typeDefinitions = typeDefinitions;
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
        typeDiv.style.flexDirection = 'row'; // Arrange children vertically

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
        circleDiv.style.width = `${type.radius * 15}px`; // Adjust the size as needed
        circleDiv.style.height = `${type.radius * 15}px`; // Adjust the size as needed
        circleDiv.style.flex = '0 0 auto'; // Prevent the circle from shrinking
        circleDiv.style.marginRight = '5px'; // Add right margin (adjust as needed)
        circleDiv.style.alignItems = 'center';

        // Create a span element for the type name
        const nameSpan = document.createElement('span');
        nameSpan.textContent = type.name;
        nameSpan.style.marginRight = '30px'; // Add right margin (adjust as needed)
        nameSpan.style.alignItems = 'center';

        // Create a span element for the type key (C, H, O, ...)
        const keySpan = document.createElement('span');
        keySpan.textContent = `(${key})`;
        keySpan.style.marginRight = '30px'; // Add right margin (adjust as needed)
        keySpan.style.alignItems = 'center';

        // Append the circle and text elements to the rowContainer
        rowContainer.append(circleDiv);
        rowContainer.append(nameSpan);
        rowContainer.append(keySpan);

        // Create a span element for the type info
        const infoP = document.createElement('p');
        infoP.textContent = type.info;
        infoP.style.padding = '0';

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

    const legend = document.querySelector('#legendContainer');
    const toggleLegendButton = document.querySelector('#toggleLegendButton');
    const legendButtonImage = document.querySelector('#legendButtonImage');
    const openLegendButtonImage = document.querySelector('#openLegendButtonImage');
    const browserLanguage = navigator.language || navigator.userLanguage;

    if (this.#isLegendVisible) {
      toggleLegendButton.title = browserLanguage.startsWith('de') ? 'Schließe Legende' : 'Close legend';
      legendButtonImage.style.display = 'block';
      openLegendButtonImage.style.display = 'none';
      legend.style.display = 'block';
    } else {
      openLegendButtonImage.title = browserLanguage.startsWith('de') ? 'Zeige Legende an' : 'Show legend';
      openLegendButtonImage.style.display = 'block';
      legendButtonImage.style.display = 'none';
      legend.style.display = 'none';
    }
  }
}
