import { SocketEventTypes } from '../../utils/events.js';

export const handler = (logger, socket, simList) => data => {
  if (!data.id || `${!data.id}` === '') {
    logger.error('Received no simulation ID in payload', { data });
    return;
  }

  const simId = `${data.id}`;
  if (!Object.keys(simList).includes(simId)) {
    logger.error('Simulation ID does not exist in sim list', { data: simId });
    return;
  }

  // Sending initial config of simulation to client
  logger.info(`Emitting message on ${SocketEventTypes.INITIAL.toUpperCase()}`, { data: simList[simId] }); // DEBUG data log
  socket.emit(SocketEventTypes.INITIAL, simList[simId].initial);

  // Assigning client to simulation room
  logger.info(`Assigning ${socket.id} to room 'sim:${simId}'`, { data: simId });
  socket.join(`sim:${simId}`);
};
