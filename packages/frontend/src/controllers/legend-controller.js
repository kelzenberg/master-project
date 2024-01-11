export class LegendController {
  #typeDefinitions;

  constructor(typeDefinitions) {
    this.#typeDefinitions = typeDefinitions;
  }

  initializeLegend() {
    // initialize all infos in the legend with data from typeDefinitions
    // jeder type bekommt eine zeile
    //for (let type of this.#typeDefinitions) {
    // von links nach rechts in jeder zeile der legendDiv:
    // Farbiger Kreis (type.radius, type.color), Name des types (type.name), Beschreibung des types (type.info)
    //}
  }
}
