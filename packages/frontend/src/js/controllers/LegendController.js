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
    const infoEnum = {
      C: 'A fundamental element essential to life on Earth, carbon forms the backbone of organic molecules, ranging from simple sugars to complex proteins and DNA. It exhibits remarkable versatility, bonding with other elements to create a vast array of compounds, including diamonds and graphite.',
      O: "Vital for respiration and combustion, oxygen is indispensable for sustaining life and various industrial processes. It is highly reactive, forming oxides with almost all other elements, and constitutes a significant portion of the Earth's atmosphere, providing the necessary oxygen for aerobic organisms to thrive.",
      H: 'As the simplest and most abundant element in the universe, hydrogen plays a crucial role in numerous chemical reactions and is a key component of water and organic compounds. Its unique properties make it a promising candidate for clean energy applications, particularly in fuel cells.',
      Rh: 'A rare transition metal known for its exceptional catalytic properties, rhodium is utilized in various industrial processes, including catalytic converters in automobiles to reduce harmful emissions. It is also employed in jewelry and as a catalyst in organic synthesis reactions due to its ability to facilitate complex chemical transformations.',
    };

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
        info.textContent = infoEnum[key];

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
