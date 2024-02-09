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
  await simulationPageController.init(simId);
  simulationPageController.hideErrorOverlay();

  socket.emit(SocketEventTypes.SIM_ID, { simId });
});

socket.on(SocketEventTypes.CONNECT_ERROR, error => {
  simulationPageController.displayErrorOverlay(error);
});

socket.on(SocketEventTypes.DISCONNECT, message => {
  simulationPageController.displayErrorOverlay(message);
});

socket.on(SocketEventTypes.USER_ROLE, async payload => {
  simulationPageController.setIsModerator(payload === 'moderator');
});

socket.on(SocketEventTypes.INITIAL, async payload => {
  simulationPageController.renderInitialData(payload, true);
  simulationPageController.animate();
});

socket.on(SocketEventTypes.DYNAMIC, payload => {
  simulationPageController.renderDynamicData(payload);
});

export const sendSliderEvent = payload => {
  socket.emit(SocketEventTypes.SLIDER, payload);
};
