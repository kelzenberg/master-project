import { SocketEventTypes } from '@master-project/libs/src/events';
import { SimulationViewController } from '../controllers/simulation-view-controller';

// eslint-disable-next-line no-undef
const socket = io(); // `io` object is being exported by '/socket.io/socket.io.js'
const simulationViewController = new SimulationViewController();
simulationViewController.addEventListeners();

const errorOverlay = document.querySelector('#errorOverlay');
const errorContent = document.querySelector('#errorContent');

socket.on(SocketEventTypes.INITIAL, payload => {
  console.debug(`[DEBUG]: Socket event on ${SocketEventTypes.INITIAL.toUpperCase()} arrived with payload`, payload);
  simulationViewController.renderInitialData(payload);
  simulationViewController.animate();
});

socket.on(SocketEventTypes.DYNAMIC, payload => {
  console.debug(`[DEBUG]: Socket event on ${SocketEventTypes.DYNAMIC.toUpperCase()} arrived with payload`, payload);
  simulationViewController.renderDynamicData(payload);
});

socket.on('connect_error', err => {
  errorOverlay.style.display = 'flex';

  errorContent.innerHTML = `
    <h2>Error:</h2>
    <span>${err.message}</span>
    <br>
    <span>${err.data}</span>
  `;
});

export const sendSliderEvent = payload => {
  console.debug(`[DEBUG]: Send socket event on ${SocketEventTypes.SLIDER.toUpperCase()} with payload`, payload);
  socket.emit(SocketEventTypes.SLIDER, payload);
};
