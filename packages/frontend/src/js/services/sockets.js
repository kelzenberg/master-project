import { SocketEventTypes } from '@master-project/libs/src/events';
import { SimulationPageController } from '../controllers/SimulationPageController';

const simulationPageController = new SimulationPageController();
const simId = simulationPageController.getSimId();

// `io` object is being exported by '/socket.io/socket.io.js'
// eslint-disable-next-line no-undef
const socket = io({
  withCredentials: true,
});

socket.on(SocketEventTypes.CONNECT, async () => {
  console.debug(`[DEBUG]: Connected to sim`, { simId });

  await simulationPageController.init(simId);
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

socket.on(SocketEventTypes.USER_ROLE, async payload => {
  console.debug(`[DEBUG]: Socket event on ${SocketEventTypes.USER_ROLE.toUpperCase()} arrived with payload`, payload);

  // ToDo: update user role from payload
});

socket.on(SocketEventTypes.INITIAL, async payload => {
  console.debug(`[DEBUG]: Socket event on ${SocketEventTypes.INITIAL.toUpperCase()} arrived with payload`, payload);
  await simulationPageController.renderInitialData(payload);
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
