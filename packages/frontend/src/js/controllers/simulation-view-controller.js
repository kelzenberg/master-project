import { Vector3, Group, Object3D } from 'three';
import Molecule from '../models/Molecule';
import { VisualizationController } from './visualization-controller';
import { PlotController } from './plot-controller';
import { LegendController } from './legend-controller';
import { SliderController } from './slider-controller';

export class SimulationViewController {
  #isPaused = false;
  #visualizationController;
  #plotController;
  #sliderController;
  #legendController;

  constructor() {
    this.#visualizationController = new VisualizationController();
    this.#plotController = new PlotController();
    this.#sliderController = new SliderController();
    this.#legendController = new LegendController();
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
    this.#plotController = new PlotController(jsonData.plots);
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
      this.#visualizationController.renderDynamicData(jsonData.visualization.config);
      this.#plotController.updatePlots(jsonData.plots);
    }
  }

  animate() {
    this.#visualizationController.animate();
  }

  addEventListeners() {
    this.#addCheckboxEventlisteners();

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

  #addCheckboxEventlisteners() {
    const checkbox1Coverage = document.querySelector('#toggleCoverageButton1');
    const checkbox2Coverage = document.querySelector('#toggleCoverageButton2');

    checkbox1Coverage.checked = true;
    checkbox2Coverage.checked = false;

    checkbox1Coverage.addEventListener('change', () => {
      if (checkbox1Coverage.checked) {
        checkbox2Coverage.checked = false;
      } else {
        checkbox1Coverage.checked = true;
      }
      this.#toggleCoverage(checkbox2Coverage.checked);
    });

    checkbox2Coverage.addEventListener('change', () => {
      if (checkbox2Coverage.checked) {
        checkbox1Coverage.checked = false;
      } else {
        checkbox2Coverage.checked = true;
        checkbox1Coverage.checked = false;
      }
      this.#toggleCoverage(checkbox2Coverage.checked);
    });

    const checkbox1Tof = document.querySelector('#toggleTofButton1');
    const checkbox2Tof = document.querySelector('#toggleTofButton2');

    checkbox1Tof.checked = true;
    checkbox2Tof.checked = false;

    checkbox1Tof.addEventListener('change', () => {
      if (checkbox1Tof.checked) {
        checkbox2Tof.checked = false;
      } else {
        checkbox1Tof.checked = true;
      }
      this.#toggleTof(checkbox2Tof.checked);
    });

    checkbox2Tof.addEventListener('change', () => {
      if (checkbox2Tof.checked) {
        checkbox1Tof.checked = false;
      } else {
        checkbox2Tof.checked = true;
        checkbox1Tof.checked = false;
      }
      this.#toggleTof(checkbox2Tof.checked);
    });
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
    const browserLanguage = navigator.language || navigator.userLanguage;

    if (this.#isPaused) {
      pauseButton.title = browserLanguage.startsWith('de')
        ? 'Rendering der Simulationsdaten fortsetzen'
        : 'Resume simulation rendering';
      playButtonImage.style.display = 'block';
      pauseButtonImage.style.display = 'none';
    } else {
      pauseButton.title = browserLanguage.startsWith('de')
        ? 'Rendering der Simulationsdaten pausieren'
        : 'Pause simulation rendering';
      pauseButtonImage.style.display = 'block';
      playButtonImage.style.display = 'none';
    }
  }

  #disableLoadingSpinner() {
    document.querySelector('#canvasContainer').style.visibility = 'visible';
    document.querySelector('#plotTOF').style.visibility = 'visible';
    document.querySelector('#plotCoverage').style.visibility = 'visible';
    document.querySelector('#sliderContainer').style.visibility = 'visible';
    document.querySelector('#pauseButtonImage').style.display = 'block';
    document.querySelector('#coverageCheckboxContainer').style.display = 'block';
    document.querySelector('#tofCheckboxContainer').style.display = 'block';
    document.querySelector('#toggleCoverageButton1').checked = true;
    document.querySelector('#toggleCoverageButton2').checked = false;
    document.querySelector('#toggleTofButton1').checked = true;
    document.querySelector('#toggleTofButton2').checked = false;
    document.querySelector('#loader').style.display = 'none';
  }
}
