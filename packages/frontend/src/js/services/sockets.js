import { SocketEventTypes } from '@master-project/libs/src/events';
import { SimulationPageController } from '../controllers/SimulationPageController';

const fetchTitleAndDescription = async simId => {
  const response = await fetch('/list?id=' + simId, { method: 'GET' });
  return response.json();
};

const urlParams = new URLSearchParams(window.location.search);
const simId = urlParams.get('id');
const { title, description } = await fetchTitleAndDescription(simId);
const simulationPageController = new SimulationPageController(title, description);
simulationPageController.addEventListeners();

const errorOverlay = document.querySelector('#errorOverlay');
const errorContent = document.querySelector('#errorContent');

// eslint-disable-next-line no-undef
const socket = io(); // `io` object is being exported by '/socket.io/socket.io.js'

socket.emit(SocketEventTypes.SIM_ID, { simId });

socket.on(SocketEventTypes.INITIAL, payload => {
  console.debug(`[DEBUG]: Socket event on ${SocketEventTypes.INITIAL.toUpperCase()} arrived with payload`, payload);
  simulationPageController.renderInitialData(payload);
  simulationPageController.animate();
});

socket.on(SocketEventTypes.DYNAMIC, payload => {
  console.debug(`[DEBUG]: Socket event on ${SocketEventTypes.DYNAMIC.toUpperCase()} arrived with payload`, payload);
  simulationPageController.renderDynamicData(payload);
});

socket.on('connect', () => {
  errorOverlay.style.display = 'none';
  errorContent.innerHTML = '';
});

socket.on('connect_error', err => {
  errorOverlay.style.display = 'flex';
  errorContent.innerHTML = `
    <h2>Error:</h2>
    <span>Connection lost. Wait for automatic reconnect or reload the page.</span>
    <p>${err.message || 'Unknown error'} ${err.data || ''}</p>
  `;
});

socket.io.on('reconnect', () => {
  socket.emit(SocketEventTypes.SIM_ID, { simId });
});

export const sendSliderEvent = payload => {
  console.debug(`[DEBUG]: Send socket event on ${SocketEventTypes.SLIDER.toUpperCase()} with payload`, payload);
  socket.emit(SocketEventTypes.SLIDER, payload);
};
