import { SimulationViewController } from './controllers/simulation-view-controller';

const simulationController = new SimulationViewController();
simulationController.addEventListeners();

const initialData = await fetchData('../data/new-json-data-format/initial-data.json');
const dynamicData = await fetchData('../data/new-json-data-format/dynamic-data.json');

//Diese functions müssen dann aufgerufen werden, wenn wir von der simulation aus dem backend data bekommen (initialData oder dynamicData)
simulationController.renderInitialData(initialData);
simulationController.animate();
setTimeout(() => {
  simulationController.renderDynamicData(dynamicData);
}, 2000);

async function fetchData(path) {
  const file = await fetch(path);
  return file.json();
}
