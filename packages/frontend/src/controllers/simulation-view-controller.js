import { Vector3, Group, Object3D } from 'three';
import Molecule from '../models/Molecule';
import { VisualizationController } from './visualization-controller';
import { PlotController } from './plot-controller';
import { LegendController } from './legend-controller';

export class SimulationViewController {
  #visualizationController;
  #plotController;
  #legendController;
  #maxStoredPlotDataPoints;

  constructor(maxStoredPlotDataPoints) {
    this.#visualizationController = new VisualizationController();
    this.#plotController = new PlotController();
    this.#legendController = new LegendController();
    this.#maxStoredPlotDataPoints = maxStoredPlotDataPoints;
  }

  renderInitialData(jsonData) {
    // Render Initial 3D Visualization Data
    let typeDefinitions = jsonData.visualization.typeDefinitions;
    let fixedSpecies = jsonData.visualization.fixedSpecies;
    let config = jsonData.visualization.config;
    let sitesGroup = this.#initializeSites(jsonData.visualization.species);
    let speciesList = this.#initializeSpecies(jsonData.visualization.species, typeDefinitions);

    this.#visualizationController = new VisualizationController(
      fixedSpecies,
      config,
      sitesGroup,
      speciesList,
      typeDefinitions
    );
    this.#visualizationController.renderInitialData();

    // Render Initial Plot Data
    this.#plotController = new PlotController(jsonData.plots, this.#maxStoredPlotDataPoints);
    this.#plotController.renderInitialData();

    // Initialize legend
    this.#legendController = new LegendController(typeDefinitions);
    this.#legendController.initializeLegend();
  }

  renderDynamicData(jsonData) {
    let config = jsonData.visualization.config;
    this.#visualizationController.renderDynamicData(config);

    let plotData = jsonData.plots.plotData;
    this.#plotController.updatePlots(plotData);
  }

  toggleLegend() {
    this.#legendController.toggleLegend();
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

  #initializeSpecies(species, typeDefinitions) {
    let speciesList = [];
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
      speciesList.push(species);
    }
    return speciesList;
  }
}
