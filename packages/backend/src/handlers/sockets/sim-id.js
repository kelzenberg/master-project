import { SocketEventTypes } from '../../utils/events.js';

export const handler =
  (logger, socket, simControllers, fetchWorkerCallbacks) =>
  async ({ simId }) => {
    logger.info(`Received message on ${SocketEventTypes.SIM_ID.toUpperCase()}`, { data: { simId } });

    if (!simId || `${!simId}` === '') {
      logger.error('Simulation ID is missing in payload', { data: simId });
      return;
    }

    const chosenSimController = simControllers.find(sim => sim.id === `${simId}`);

    if (!chosenSimController) {
      logger.error('Could not find simulation instance with provided ID', { data: simId });
      return;
    }

    if (!chosenSimController.isSimRunning) {
      await chosenSimController.startSim();
      chosenSimController.setWorkerEventHandlers(fetchWorkerCallbacks);
    }

    logger.info(`Emitting message on ${SocketEventTypes.INITIAL.toUpperCase()}`, {
      data: { id: chosenSimController.id, roomId: chosenSimController.roomId, title: chosenSimController.title },
    });
    socket.emit(SocketEventTypes.INITIAL, chosenSimController.getInitialSimData());

    socket.data.client = {
      ...socket.data.client,
      currentSimId: chosenSimController.id,
      currentRoomId: chosenSimController.roomId,
    };

    logger.info(`Assigning ${socket.id} to room ${chosenSimController.roomId}`, { data: chosenSimController.roomId });
    socket.join(chosenSimController.roomId);
  };
