export class LandingPageController {
  constructor() {}

  async initializeLandingPage() {
    const config = await this.#fetchSimList();
    const previewContainer = document.querySelector('#previewContainer');

    config.map(configEntry => {
      const simulationPreview = document.createElement('simulation-preview');
      previewContainer.append(simulationPreview);
      simulationPreview.setAttribute('title', configEntry.title);
      simulationPreview.setAttribute('description', configEntry.description);
      simulationPreview.setAttribute('href', './simulation.html?id=' + configEntry.id);
      simulationPreview.style.backgroundImage = `url("${configEntry.thumbnail}")`;
    });
  }

  async #fetchSimList() {
    const response = await fetch('/list', { method: 'GET' });
    return await response.json();
  }
}
