import { SocketEventTypes } from '@master-project/libs/src/events';
import { SimulationPageController } from '../controllers/SimulationPageController';

const fetchTitleAndDescription = async simId => {
  const response = await fetch(`/list?id=${simId}`, { method: 'GET' });

  if (response.status !== 200) {
    console.debug(`[DEBUG]: SimId is misformatted or cannot be found. Redirecting...`, {
      status: response.status,
      url: response.url,
    });
    window.location.href = '/';
    return;
  }

  return response.json();
};

const simId = new URLSearchParams(window.location.search).get('id');
if (!simId || `${simId}`.trim() == '') {
  console.debug(`[DEBUG]: No simId found as URL param. Redirecting...`, { simId });
  window.location.href = '/';
}

const { title, description } = await fetchTitleAndDescription(simId);
const simulationPageController = new SimulationPageController(title, description);
simulationPageController.addEventListeners();

// eslint-disable-next-line no-undef
const socket = io(); // `io` object is being exported by '/socket.io/socket.io.js'

socket.on(SocketEventTypes.CONNECT, () => {
  console.debug(`[DEBUG]: Connected to sim`, { simId });
  simulationPageController.hideErrorOverlay();

  console.debug(`[DEBUG]: Send socket event on ${SocketEventTypes.SIM_ID.toUpperCase()} with simID`, { simId });
  socket.emit(SocketEventTypes.SIM_ID, { simId });
});

socket.on(SocketEventTypes.CONNECT_ERROR, error => {
  console.debug(`[DEBUG]: Received connect error`, { error });
  simulationPageController.displayErrorOverlay(error);
});

socket.on(SocketEventTypes.DISCONNECT, message => {
  console.debug(`[DEBUG]: Client disconnected`);
  simulationPageController.displayErrorOverlay(message);
});

socket.on(SocketEventTypes.INITIAL, payload => {
  console.debug(`[DEBUG]: Socket event on ${SocketEventTypes.INITIAL.toUpperCase()} arrived with payload`, payload);
  simulationPageController.renderInitialData(payload);
  simulationPageController.animate();
});

socket.on(SocketEventTypes.DYNAMIC, payload => {
  console.debug(`[DEBUG]: Socket event on ${SocketEventTypes.DYNAMIC.toUpperCase()} arrived with payload`, payload);
  simulationPageController.renderDynamicData(payload);
});

export const sendSliderEvent = payload => {
  console.debug(`[DEBUG]: Send socket event on ${SocketEventTypes.SLIDER.toUpperCase()} with payload`, payload);
  socket.emit(SocketEventTypes.SLIDER, payload);
};
