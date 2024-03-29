import { Vector3, Group, Object3D } from 'three';
import Molecule from '../models/Molecule.js';
import { VisualizationController } from './VisualizationController.js';
import { PlotController } from './PlotController.js';
import { LegendController } from './LegendController.js';
import { SliderController } from './SliderController.js';

/**
 * The SimulationPageController class manages the data for the simulation page, including 3D visualization, plots, sliders, and other controls.
 * It provides an API to render the data and passes it on to the VisualizationController, PlotController, SliderController and LegendController.
 */
export class SimulationPageController {
  #visualizationController;
  #plotController;
  #sliderController;
  #legendController;
  #initialData;
  #title;
  #description;
  #isPaused = false;
  #isModerator = false;
  #isModeratorUpdated = false;

  /**
   * Creates a SimulationPageController instance.
   * @public
   */
  constructor() {
    this.#visualizationController = new VisualizationController();
    this.#plotController = new PlotController();
    this.#sliderController = new SliderController();
    this.#legendController = new LegendController();
    this.#initialData = {};
  }

  /**
   * Initializes the simulation page with the title and description of the simulation with ID: simId.
   * @param {string} simId - The ID of the simulation.
   * @public
   */
  async init(simId) {
    this.#addEventListeners();

    const { title, description } = await this.#fetchTitleAndDescription(simId);
    this.#title = title;
    this.#description = description;
    this.simId = simId;
  }

  /**
   * Adds event listeners for the UI controls of the simulation page.
   * @private
   */
  #addEventListeners() {
    const checkbox1Coverage = document.querySelector('#toggleCoverageButton1');
    const checkbox2Coverage = document.querySelector('#toggleCoverageButton2');
    const confirmationOverlay = document.querySelector('#overlay');
    const resetButton = document.querySelector('#resetButton');

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

    document.querySelector('#resetButton').addEventListener('click', () => {
      resetButton.disabled = true;
      confirmationOverlay.style.display = 'block';
    });

    document.querySelector('#confirmationButton').addEventListener('click', async () => {
      try {
        const simId = this.getSimId();
        const response = await fetch(`/reset?id=${simId}`, { method: 'POST' });
        const { status: statusCode, ok: requestOk } = response;

        if (requestOk) {
          this.renderInitialData(this.#initialData, false);
          confirmationOverlay.style.display = 'none';
          resetButton.disabled = false;
        } else {
          const message = `Python sim ${this.simId} returned unsuccessfully (code: ${statusCode}) on RESET request`;
          throw new Error(message);
        }
      } catch {
        confirmationOverlay.style.display = 'none';
        resetButton.disabled = false;
      }
    });

    document.querySelector('#cancelButton').addEventListener('click', () => {
      confirmationOverlay.style.display = 'none';
      resetButton.disabled = false;
    });
  }

  /**
   * Retrieves the simulation ID from the URL parameters.
   * @returns {string} The simulation ID.
   * @public
   */
  getSimId() {
    const simId = new URLSearchParams(window.location.search).get('id');

    if (!simId || `${simId}`.trim() === '') {
      window.location.href = '/';
      return;
    }

    return simId;
  }

  /**
   * Fetches the title and description of the simulation from the server.
   * @param {string} simId - The ID of the simulation.
   * @returns {Promise<{ title: string, description: string }>} The title and description of the simulation.
   * @private
   */
  async #fetchTitleAndDescription(simId) {
    const response = await fetch(`/list?id=${simId}`, { method: 'GET' });

    if (response.status !== 200) {
      window.location.href = '/';
      return;
    }

    return response.json();
  }

  /**
   * Passes the initial data for visualization, plots, sliders, and legend to the specific controllers.
   * @param {Object} jsonData - The JSON data containing initial simulation data.
   * @public
   */
  renderInitialData(jsonData, isInitialCall) {
    if (isInitialCall) {
      this.#initialData = jsonData;
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

      // Initialize legend
      this.#legendController = new LegendController(typeDefinitions);
      this.#legendController.initializeLegend();

      // Initialize sliders
      const slider = jsonData.slider;
      this.#sliderController = new SliderController(slider);
    }

    this.#sliderController.initializeSlider(this.#isModerator);
    this.#disableLoadingSpinner(isInitialCall);
  }

  /**
   * Passes the dynamic data updates for visualization and plots to the specific controllers.
   * @param {Object} jsonData - The JSON data containing dynamic simulation updates.
   * @public
   */
  renderDynamicData(jsonData) {
    if (!this.#isPaused) {
      this.#visualizationController.renderDynamicData(jsonData.visualization.config);
      this.#plotController.updatePlots(jsonData.plots);
      if (!this.#isModeratorUpdated) this.#updateModSlider(jsonData.sliderData);
      if (!this.#isModerator) this.#sliderController.updateSliderValues(jsonData.sliderData);
    }
  }

  /**
   * Initiates animation for the visualization.
   * @public
   */
  animate() {
    this.#visualizationController.animate();
  }

  /**
   * Initializes site objects for the 3D scene.
   * @param {Object[]} sites - The array of site data.
   * @returns {Group} - The group containing site objects.
   * @private
   */
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

  /**
   * Initializes species dictionary for the simulation.
   * @param {Object[]} species - The array of species data.
   * @param {Object} typeDefinitions - Definitions for different types of species.
   * @returns {Object[]} - The initialized species dictionary.
   * @private
   */
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

  /**
   * Toggles the visibility of the legend.
   * @private
   */
  #toggleLegend() {
    this.#legendController.toggleLegend();
  }

  /**
   * Toggles the TOF plot.
   * @param {boolean} configurationCountActive - Flag indicating whether configuration count is active.
   * @private
   */
  #toggleTof(configurationCountActive) {
    this.#plotController.toggleTof(configurationCountActive);
  }

  /**
   * Toggles the coverage plot.
   * @param {boolean} singleCoverageActive - Flag indicating whether coverage per site type is active.
   * @private
   */
  #toggleCoverage(coveragePerSiteTypeActive) {
    this.#plotController.toggleCoverage(coveragePerSiteTypeActive);
  }

  /**
   * Toggles the pause/play state of the simulation rendering.
   * @private
   */
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

    const tofCheckBox1 = document.querySelector('#toggleTofButton1');
    const tofCheckBox2 = document.querySelector('#toggleTofButton2');
    const coverageCheckBox1 = document.querySelector('#toggleCoverageButton1');
    const coverageCheckBox2 = document.querySelector('#toggleCoverageButton2');

    tofCheckBox1.disabled = this.#isPaused;
    tofCheckBox2.disabled = this.#isPaused;
    coverageCheckBox1.disabled = this.#isPaused;
    coverageCheckBox2.disabled = this.#isPaused;
  }

  /**
   * Disables the loading spinner and displays simulation components.
   * @private
   */
  #disableLoadingSpinner(isInitialCall) {
    if (isInitialCall) {
      document.querySelector('#toggleCoverageButton1').checked = true;
      document.querySelector('#toggleCoverageButton2').checked = false;
      document.querySelector('#toggleTofButton1').checked = true;
      document.querySelector('#toggleTofButton2').checked = false;
    }
    document.querySelector('#canvasContainer').style.visibility = 'visible';
    document.querySelector('#plotTOF').style.visibility = 'visible';
    document.querySelector('#plotCoverage').style.visibility = 'visible';
    document.querySelector('#sliderContainer').style.visibility = 'visible';
    document.querySelector('#cancelButton').style.display = 'block';
    document.querySelector('#confirmationButton').style.display = 'block';
    document.querySelector('#toggleLegendButton').style.display = 'block';

    if (this.#isPaused) {
      document.querySelector('#playButtonImage').style.display = 'block';
      document.querySelector('#pauseButton').style.display = 'block';
    } else {
      document.querySelector('#pauseButtonImage').style.display = 'block';
      document.querySelector('#pauseButton').style.display = 'block';
    }

    if (this.#isModerator) {
      document.querySelector('#resetButtonImage').style.display = 'block';
      document.querySelector('#resetButton').style.display = 'block';
    }

    document.querySelector('#coverageCheckboxContainer').style.display = 'block';
    document.querySelector('#tofCheckboxContainer').style.display = 'block';
    document.querySelector('#loader').style.display = 'none';
  }

  setIsModerator(isModerator) {
    this.#isModerator = isModerator;
    if (Object.keys(this.#initialData).length > 0) this.renderInitialData(this.#initialData, false);
  }

  #updateModSlider(sliderData) {
    const updatedInitial = this.#initialData.slider.map(slider => {
      const label = slider.label;
      const value = slider.default;
      return { label: label, value: value };
    });

    let hasChanges = false;

    for (const slider of sliderData) {
      const correspondingObject = updatedInitial.find(obj => obj.label === slider.label);
      if (correspondingObject && correspondingObject.value !== slider.value) {
        hasChanges = true;
      }
    }

    if (hasChanges) this.#sliderController.updateSliderValues(sliderData);
    this.#isModeratorUpdated = true;
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
