import { SocketEventTypes } from '../../utils/events.js';

export const handler = (logger, socket, simControllers) => async data => {
  logger.info(`Received message on ${SocketEventTypes.SLIDER.toUpperCase()}`, { data });

  if (!data.label || !data.value) {
    logger.error('Label or value is missing in payload', { data });
    return;
  }

  const currentSimId = socket.data.client.currentSimId;

  if (!currentSimId) {
    logger.error('Current sim ID could not be found', { data: socket.data.client });
    return;
  }

  const chosenSimController = simControllers.find(sim => sim.id === currentSimId);
  await chosenSimController.sendSimParameters(data);
};
