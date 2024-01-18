import { SocketEventTypes } from '@master-project/libs/src/events';
import { SimulationViewController } from '../controllers/simulation-view-controller';

// eslint-disable-next-line no-undef
const socket = io(); // `io` object is being exported by '/socket.io/socket.io.js'
const simulationViewController = new SimulationViewController(50);

socket.on(SocketEventTypes.INITIAL, payload => {
  console.log(`[TEST]: Socket event on ${SocketEventTypes.INITIAL} arrived with payload: ${JSON.stringify(payload)}`);
  simulationViewController.renderInitialData(payload);
  simulationViewController.animate();
});

socket.on(SocketEventTypes.DYNAMIC, payload => {
  console.log(`[TEST]: Socket event on ${SocketEventTypes.DYNAMIC} arrived with payload: ${JSON.stringify(payload)}`);
  simulationViewController.renderDynamicData(payload);
});

export function sendSliderEvent(payload) {
  console.log(`[TEST]: sendSliderEvent triggered with payload: ${JSON.stringify(payload)}`);
  socket.emit(SocketEventTypes.SLIDER, payload);
}
