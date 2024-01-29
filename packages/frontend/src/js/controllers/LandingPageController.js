export class LandingPageController {
  constructor() {}

  initializeLandingPage(config) {
    console.log(config);
    const previewContainer = document.querySelector('#previewContainer');

    const simulationPreviews = config.map(configEntry => {
      const simulationPreview = document.createElement('simulation-preview');
      simulationPreview.setAttribute('title', configEntry.title);
      simulationPreview.setAttribute('description', configEntry.description);
      simulationPreview.setAttribute('href', './simulation.html?id=' + configEntry.id);
      simulationPreview.style.backgroundImage = `url('data:image/png;base64,${configEntry.image}')`;

      return simulationPreview;
    });

    previewContainer.replaceChildren(...simulationPreviews);
  }
}
