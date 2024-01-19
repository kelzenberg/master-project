import { SimulationViewController } from './controllers/simulation-view-controller';

const maxStoredPlotDataPoints = 50;
const simulationController = new SimulationViewController(maxStoredPlotDataPoints);

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

document.addEventListener('readystatechange', function () {
  if (document.readyState === 'complete') {
    document.querySelector('body').style.visibility = 'visible';
    document.querySelector('#loader').style.display = 'none';
  } else {
    document.querySelector('body').style.visibility = 'hidden';
    document.querySelector('#loader').style.visibility = 'visible';
  }
});
