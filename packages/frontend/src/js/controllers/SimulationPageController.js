import { Vector3, Group, Object3D } from 'three';
import Molecule from '../models/Molecule';
import { VisualizationController } from './VisualizationController';
import { PlotController } from './PlotController';
import { LegendController } from './LegendController';
import { SliderController } from './SliderController';

export class SimulationPageController {
  simId;
  #visualizationController;
  #plotController;
  #sliderController;
  #legendController;
  #title;
  #description;
  #isPaused = false;
  // #isSuperUser muss später von sockets.js mitgegeben als constructor param!
  #isSuperUser = true;

  constructor() {
    this.#visualizationController = new VisualizationController();
    this.#plotController = new PlotController();
    this.#sliderController = new SliderController();
    this.#legendController = new LegendController();
  }

  async init() {
    this.#getSimId();
    this.#addEventListeners();

    const { title, description } = await this.#fetchTitleAndDescription();
    this.#title = title;
    this.#description = description;
  }

  #getSimId() {
    const simId = new URLSearchParams(window.location.search).get('id');

    if (!simId || `${simId}`.trim() == '') {
      console.debug(`[DEBUG]: No simId found as URL param. Redirecting...`, { simId });
      window.location.href = '/';
    }

    this.simId = simId;
  }

  #addEventListeners() {
    const checkbox1Coverage = document.querySelector('#toggleCoverageButton1');
    const checkbox2Coverage = document.querySelector('#toggleCoverageButton2');

    checkbox1Coverage.addEventListener('change', () => {
      this.#toggleCoverage(checkbox2Coverage.checked);
    });

    checkbox2Coverage.addEventListener('change', () => {
      this.#toggleCoverage(checkbox2Coverage.checked);
    });

    const checkbox1Tof = document.querySelector('#toggleTofButton1');
    const checkbox2Tof = document.querySelector('#toggleTofButton2');

    checkbox1Tof.addEventListener('change', () => {
      this.#toggleTof(checkbox2Tof.checked);
    });

    checkbox2Tof.addEventListener('change', () => {
      this.#toggleTof(checkbox2Tof.checked);
    });

    const toggleLegendButton = document.querySelector('#toggleLegendButton');
    toggleLegendButton.addEventListener('click', () => {
      this.#toggleLegend();
    });

    const pauseButton = document.querySelector('#pauseButton');
    pauseButton.addEventListener('click', () => {
      this.#togglePause();
    });

    const browserLanguage = navigator.language || navigator.userLanguage;
    const germanTooltip = 'Rendering der Simulationsdaten pausieren';

    if (browserLanguage.startsWith('de')) {
      pauseButton.title = germanTooltip;
    }
  }

  async #fetchTitleAndDescription() {
    const response = await fetch(`/list?id=${this.simId}`, { method: 'GET' });

    if (response.status !== 200) {
      console.debug(`[DEBUG]: SimId is misformatted or cannot be found. Redirecting...`, {
        status: response.status,
        url: response.url,
      });
      window.location.href = '/';
      return;
    }

    return await response.json();
  }

  async renderInitialData(jsonData) {
    // Setting title and description
    document.querySelector('#simulationTitle').textContent = this.#title;
    document.querySelector('#simulationDescription').textContent = this.#description;

    // Render Initial 3D Visualization Data
    const typeDefinitions = jsonData.visualization.typeDefinitions;
    const fixedSpecies = jsonData.visualization.fixedSpecies;
    const config = jsonData.visualization.config;
    const sites = jsonData.visualization.sites;
    const species = jsonData.visualization.species;

    const sitesGroup = this.#initializeSites(sites);
    const speciesDictionary = this.#initializeSpeciesDictionary(species, typeDefinitions);

    this.#visualizationController = new VisualizationController(
      fixedSpecies,
      config,
      sitesGroup,
      speciesDictionary,
      typeDefinitions
    );
    this.#visualizationController.renderInitialData();

    // Render Initial Plot Data
    this.#plotController = new PlotController(jsonData.plots);
    this.#plotController.renderInitialData();

    // Initialize sliders
    const slider = jsonData.slider;
    this.#sliderController = new SliderController(slider);
    //pass something to the initializSliders() function that tells if user is super-user or not!
    this.#sliderController.initializeSlider(this.#isSuperUser);

    // Initialize legend
    this.#legendController = new LegendController(typeDefinitions);
    this.#legendController.initializeLegend();

    // disable loading spinner!
    this.#disableLoadingSpinner();
  }

  renderDynamicData(jsonData) {
    if (!this.#isPaused) {
      this.#visualizationController.renderDynamicData(jsonData.visualization.config);
      this.#plotController.updatePlots(jsonData.plots);
      if (!this.#isSuperUser) this.#sliderController.updateSliderValues(jsonData.sliderData);
    }
  }

  animate() {
    this.#visualizationController.animate();
  }

  #initializeSites(sites) {
    let sitesGroup = new Group();
    for (const data of sites) {
      let site = new Vector3(data.x, data.y, data.z);
      let siteObject = new Object3D();
      siteObject.position.copy(site);
      sitesGroup.add(siteObject);
    }
    return sitesGroup;
  }

  #initializeSpeciesDictionary(species, typeDefinitions) {
    let speciesDictionary = [];
    for (const data of species) {
      let species = [];
      for (const molecule of data) {
        let position = new Vector3(molecule.x, molecule.y, molecule.z);
        let type = molecule.type;
        let radius = typeDefinitions[type].radius;
        let color = typeDefinitions[type].color;
        let moleculeObject = new Molecule(position, radius, color);
        species.push(moleculeObject);
      }
      speciesDictionary.push(species);
    }
    return speciesDictionary;
  }

  #toggleLegend() {
    this.#legendController.toggleLegend();
  }

  #toggleTof(configurationCountActive) {
    this.#plotController.toggleTof(configurationCountActive);
  }

  #toggleCoverage(singleCoverageActive) {
    this.#plotController.toggleCoverage(singleCoverageActive);
  }

  #togglePause() {
    this.#isPaused = !this.#isPaused;

    const pauseButton = document.querySelector('#pauseButton');
    const pauseButtonImage = document.querySelector('#pauseButtonImage');
    const playButtonImage = document.querySelector('#playButtonImage');

    if (this.#isPaused) {
      pauseButton.title = 'Resume simulation rendering';
      playButtonImage.style.display = 'block';
      pauseButtonImage.style.display = 'none';
    } else {
      pauseButton.title = 'Pause simulation rendering';
      pauseButtonImage.style.display = 'block';
      playButtonImage.style.display = 'none';
    }
  }

  #disableLoadingSpinner() {
    document.querySelector('#canvasContainer').style.visibility = 'visible';
    document.querySelector('#plotTOF').style.visibility = 'visible';
    document.querySelector('#plotCoverage').style.visibility = 'visible';
    document.querySelector('#sliderContainer').style.visibility = 'visible';

    if (this.#isPaused) {
      document.querySelector('#playButtonImage').style.display = 'block';
    } else {
      document.querySelector('#pauseButtonImage').style.display = 'block';
    }

    document.querySelector('#coverageCheckboxContainer').style.display = 'block';
    document.querySelector('#tofCheckboxContainer').style.display = 'block';
    document.querySelector('#toggleCoverageButton1').checked = true;
    document.querySelector('#toggleCoverageButton2').checked = false;
    document.querySelector('#toggleTofButton1').checked = true;
    document.querySelector('#toggleTofButton2').checked = false;
    document.querySelector('#loader').style.display = 'none';
  }

  hideErrorOverlay() {
    const errorOverlay = document.querySelector('#errorOverlay');
    const errorContent = document.querySelector('#errorContent');
    errorOverlay.style.display = 'none';
    errorContent.innerHTML = '';
  }

  displayErrorOverlay(error) {
    const errorOverlay = document.querySelector('#errorOverlay');
    const errorContent = document.querySelector('#errorContent');
    errorOverlay.style.display = 'flex';
    errorContent.innerHTML = `
      <h3>Connection Error</h3>
      <span>Wait for automatic reconnect or reload the page.</span>
      <p><small>Details: ${error.message || 'Unknown error'} ${error.data || ''}</small></p>
    `;
  }
}
