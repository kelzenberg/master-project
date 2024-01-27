import { SocketEventTypes } from '../../utils/events.js';

export const handler = socket => data => {
  const {
    data: { id: clientId, logger, simInstances },
  } = socket;
  const { simId } = data;

  if (!simId || `${!simId}` === '') {
    logger.error('Received no simulation ID in payload', { data });
    return;
  }

  const chosenSimInstance = simInstances.find(instance => instance.id === `${simId}`);
  if (!chosenSimInstance) {
    logger.error('Could not find simulation instance with provided ID', { data: simId });
    return; // ToDo: return Error to Frontend
  }

  // Sending initial sim data to client
  logger.info(`Emitting message on ${SocketEventTypes.INITIAL.toUpperCase()}`, {
    data: { id: chosenSimInstance.id, title: chosenSimInstance.title },
  });
  socket.emit(SocketEventTypes.INITIAL, chosenSimInstance.getInitialData());

  // Assigning client to simulation room
  const roomId = `sim:${simId}`;
  logger.info(`Assigning ${clientId} to room '${roomId}'`, { data: roomId });
  socket.join(roomId);

  socket.data.client = { chosenSimId: simId, roomId };
};
