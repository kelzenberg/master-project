/**
 * The LandingPageController class is responsible for initializing the landing page with simulation previews.
 */
export class LandingPageController {
  /**
   * Creates a LandingPageController instance.
   * @public
   */
  constructor() {}

  /**
   * Asynchronously initializes the landing page by fetching simulation data and creating preview elements.
   * @public
   */
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

  /**
   * Asynchronously fetches the list of simulations from the server.
   * @returns {Promise<Object[]>} An array of simulation configuration objects.
   * @private
   */
  async #fetchSimList() {
    const response = await fetch('/list', { method: 'GET' });
    return await response.json();
  }
}
