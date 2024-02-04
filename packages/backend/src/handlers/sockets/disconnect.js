import { SocketEventTypes } from '../../utils/events.js';

export const handler = (logger, socket, simControllers) => async () => {
  const simId = socket.data.client.currentSimUUID;
  logger.info(`Received message on ${SocketEventTypes.DISCONNECT.toUpperCase()}`, { data: { simId } });

  if (!simId || `${!simId}` === '') {
    logger.error('Simulation ID is missing in payload');
    return;
  }

  const currentSimController = simControllers.find(sim => sim.uuid === `${simId}`);

  if (!currentSimController) {
    logger.error('Could not find simulation with provided ID', { data: simId });
    return;
  }

  currentSimController.removeClient(socket.id);
  socket.data.client = {
    ...socket.data.client,
    currentSimUUID: null,
    currentRoomId: null,
  };

  const remainingClients = currentSimController.getClients();

  if (remainingClients.length <= 0) {
    logger.info(`Last client disconnected from simulation ${currentSimController.title}. Pausing sim now...`, {
      data: remainingClients,
    });

    if (currentSimController.isSimRunning && !currentSimController.isSimPaused) {
      // await currentSimController.pauseSim(); // WIP !
    }
  }

  logger.info(`Client ${socket.id} disconnected`);
};
