/**
 * The LegendController class is responsible for managing and displaying a legend for visualizations.
 */
export class LegendController {
  #typeDefinitions;
  #isLegendVisible = false;

  /**
   * Create a LegendController instance.
   * @param {Object} typeDefinitions - An object containing definitions for different types in the legend.
   * @public
   */
  constructor(typeDefinitions) {
    this.#typeDefinitions = typeDefinitions;
  }

  /**
   * Initializes the legend by creating and populating the legend table.
   * @public
   */
  initializeLegend() {
    const legendContainer = document.querySelector('#legendContainer');

    // Create a table element
    const legendTable = document.createElement('table');
    legendTable.classList.add('legendTable'); // You can add a class for styling if needed

    let largestWidth = 0;
    // The radii of the types are rather small so we multiply them with a constant
    const widthMultiplier = 15;

    // Map each type definition to a table row
    const typeDivs = Object.entries(this.#typeDefinitions)
      .filter(([key]) => key !== 'empty')
      .map(([key, type]) => {
        if (type.radius > largestWidth) largestWidth = type.radius;

        const typeContainer = document.createElement('div');
        typeContainer.classList.add('typeContainer');

        // Create a table data for the circle
        const circleDiv = document.createElement('div');
        circleDiv.classList.add('legendCircle');
        circleDiv.style.backgroundColor = `rgb(${type.color.map(val => val * 255).join(',')})`;
        circleDiv.style.border = '1px solid black';
        circleDiv.style.borderRadius = '50%';
        circleDiv.style.width = `${type.radius * widthMultiplier}px`; // Adjust the size as needed
        circleDiv.style.height = `${type.radius * widthMultiplier}px`; // Adjust the size as needed
        typeContainer.append(circleDiv);

        // Create a container for the name
        const nameDiv = document.createElement('div');
        nameDiv.textContent = type.name;

        // Create a container for the type key
        const keyDiv = document.createElement('div');
        keyDiv.textContent = `(${key})`;

        // Create a container for the type info
        const info = document.createElement('p');
        info.classList.add('legendInfoText');
        info.textContent = type.info;

        const labelDiv = document.createElement('div');
        labelDiv.classList.add('labelDiv');
        labelDiv.append(nameDiv);
        labelDiv.append(keyDiv);

        typeContainer.append(circleDiv);
        typeContainer.append(labelDiv);
        typeContainer.append(info);

        return typeContainer;
      });

    // Replace the content of legendContainer with the table
    legendContainer.append(...typeDivs);
    for (const element of legendContainer.querySelectorAll('.typeContainer'))
      element.style.gridTemplateColumns = `${largestWidth * widthMultiplier + 'px'} auto`;
  }

  /**
   * Toggles the visibility state of the legend.
   * @public
   */
  toggleLegend() {
    this.#isLegendVisible = !this.#isLegendVisible;

    const legend = document.querySelector('#legendContainer');
    const toggleLegendButton = document.querySelector('#toggleLegendButton');
    const legendButtonImage = document.querySelector('#legendButtonImage');
    const openLegendButtonImage = document.querySelector('#openLegendButtonImage');

    if (this.#isLegendVisible) {
      toggleLegendButton.title = 'Close legend';
      legendButtonImage.style.display = 'block';
      openLegendButtonImage.style.display = 'none';
      legend.style.display = 'flex';
    } else {
      openLegendButtonImage.title = 'Show legend';
      openLegendButtonImage.style.display = 'block';
      legendButtonImage.style.display = 'none';
      legend.style.display = 'none';
    }
  }
}
