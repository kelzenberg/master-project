import { Vector3, Group, Object3D } from 'three';
import Molecule from '../models/Molecule';
import { VisualizationController } from './visualization-controller';
import { PlotController } from './plot-controller';
import { LegendController } from './legend-controller';
import { SliderController } from './slider-controller';

export class SimulationViewController {
  #isPaused;
  #visualizationController;
  #plotController;
  #sliderController;
  #legendController;
  #maxStoredPlotDataPoints;

  constructor(maxStoredPlotDataPoints) {
    this.#visualizationController = new VisualizationController();
    this.#plotController = new PlotController();
    this.#sliderController = new SliderController();
    this.#legendController = new LegendController();
    this.#maxStoredPlotDataPoints = maxStoredPlotDataPoints;
    this.#isPaused = false;
  }

  renderInitialData(jsonData) {
    // Render Initial 3D Visualization Data
    const typeDefinitions = jsonData.visualization.typeDefinitions;
    const fixedSpecies = jsonData.visualization.fixedSpecies;
    const config = jsonData.visualization.config;
    const sitesGroup = this.#initializeSites(jsonData.visualization.sites);
    const speciesDictionary = this.#initializeSpeciesDictionary(jsonData.visualization.species, typeDefinitions);

    this.#visualizationController = new VisualizationController(
      fixedSpecies,
      config,
      sitesGroup,
      speciesDictionary,
      typeDefinitions
    );
    this.#visualizationController.renderInitialData();

    // Render Initial Plot Data
    this.#plotController = new PlotController(jsonData.plots, this.#maxStoredPlotDataPoints);
    this.#plotController.renderInitialData();

    // Initialize sliders
    const sliders = jsonData.slider;
    this.#sliderController = new SliderController(sliders);
    this.#sliderController.initializeSliders();

    // Initialize legend
    this.#legendController = new LegendController(typeDefinitions);
    this.#legendController.initializeLegend();

    // disable loading spinner!
    this.#disableLoadingSpinner();
  }

  renderDynamicData(jsonData) {
    if (!this.#isPaused) {
      let config = jsonData.visualization.config;
      this.#visualizationController.renderDynamicData(config);

      let plotData = jsonData.plots.plotData;
      this.#plotController.updatePlots(plotData);
    }
  }

  animate() {
    this.#visualizationController.animate();
  }

  addToggleLegendButtonEventListener() {
    const pauseButton = document.querySelector('#toggleLegendButton');
    pauseButton.addEventListener('click', () => {
      this.#toggleLegend();
    });
  }

  #toggleLegend() {
    this.#legendController.toggleLegend();
  }

  addEventListeners() {
    const pauseButton = document.querySelector('#pauseButton');
    pauseButton.addEventListener('click', () => {
      this.#togglePause();
    });
  }

  #togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) {
      // Set Play button icon
    } else {
      // Set Pause button icon
    }
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

  #disableLoadingSpinner() {
    document.querySelector('#canvasContainer').style.visibility = 'visible';
    document.querySelector('#plotTOF').style.visibility = 'visible';
    document.querySelector('#plotCoverage').style.visibility = 'visible';
    document.querySelector('#sliderContainer').style.visibility = 'visible';
    document.querySelector('#loader').style.display = 'none';
  }
}
