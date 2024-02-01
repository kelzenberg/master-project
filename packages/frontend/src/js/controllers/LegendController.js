export class LegendController {
  #typeDefinitions;
  #isLegendVisible = false;

  constructor(typeDefinitions) {
    this.#typeDefinitions = typeDefinitions;
  }

  initializeLegend() {
    const legendContainer = document.querySelector('#legendContainer');

    // Create a table element
    const legendTable = document.createElement('table');
    legendTable.classList.add('legendTable'); // You can add a class for styling if needed

    // Map each type definition to a table row
    const typeRows = Object.entries(this.#typeDefinitions)
      .filter(([key]) => key !== 'empty')
      .map(([key, type]) => {
        // Create a table row for each type
        const typeRow = document.createElement('tr');

        // Create a table data for the circle
        const circleCell = document.createElement('td');
        const circleDiv = document.createElement('div');
        circleDiv.classList.add('legendCircle');
        circleDiv.style.backgroundColor = `rgb(${type.color.map(val => val * 255).join(',')})`;
        circleDiv.style.border = '1px solid black';
        circleDiv.style.borderRadius = '50%';
        circleDiv.style.width = `${type.radius * 15}px`; // Adjust the size as needed
        circleDiv.style.height = `${type.radius * 15}px`; // Adjust the size as needed
        circleDiv.style.margin = 'auto';
        circleCell.append(circleDiv);

        // Create a table data for the name
        const nameCell = document.createElement('td');
        nameCell.textContent = type.name;
        nameCell.style.paddingLeft = '0.5rem';

        // Create a table data for the type key
        const keyCell = document.createElement('td');
        keyCell.textContent = `(${key})`;

        // Create a table data for the type info
        const infoCell = document.createElement('td');
        const infoP = document.createElement('p');
        infoP.textContent = type.info;
        infoP.style.margin = '10px';
        infoCell.append(infoP);

        // Append cells to the row
        typeRow.append(circleCell);
        typeRow.append(nameCell);
        typeRow.append(keyCell);
        typeRow.append(infoCell);

        return typeRow;
      });

    // Append all rows to the table
    legendTable.append(...typeRows);

    // Replace the content of legendContainer with the table
    legendContainer.replaceChildren(legendTable);
  }

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
      legend.style.display = 'block';
    } else {
      openLegendButtonImage.title = 'Show legend';
      openLegendButtonImage.style.display = 'block';
      legendButtonImage.style.display = 'none';
      legend.style.display = 'none';
    }
  }
}
