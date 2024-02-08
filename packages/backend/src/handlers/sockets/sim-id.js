import { SocketEventTypes } from '../../utils/events.js';

export const handler =
  (logger, socket, simControllers, workerEventHandlers) =>
  async ({ simId }) => {
    logger.info(`Received message on ${SocketEventTypes.SIM_ID.toUpperCase()}`, { data: { simId } });

    if (!simId || `${!simId}` === '') {
      logger.error('Simulation ID is missing in payload');
      return;
    }

    const chosenSimController = simControllers.find(sim => sim.uuid === `${simId}`);

    if (!chosenSimController) {
      logger.error('Could not find simulation with provided ID', { data: simId });
      return;
    }

    if (chosenSimController.isSimPaused) {
      await chosenSimController.resumeSim();
    } else if (!chosenSimController.isSimRunning) {
      await chosenSimController.startSim();
    }

    chosenSimController.setWorkerEventHandlers(workerEventHandlers); // must come after startSim()
    chosenSimController.addClient(socket.id);
    socket.data.client = {
      ...socket.data.client,
      currentSimUUID: chosenSimController.uuid,
      currentRoomId: chosenSimController.roomId,
    };

    logger.info(`Emitting message on ${SocketEventTypes.INITIAL.toUpperCase()}`, {
      data: { uuid: chosenSimController.uuid, roomId: chosenSimController.roomId, title: chosenSimController.title },
    });
    socket.emit(SocketEventTypes.INITIAL, chosenSimController.getInitialSimData());

    // ToDo
    socket.emit(SocketEventTypes.USER_ROLE, 'moderator');

    logger.info(`Assigning ${socket.id} to room ${chosenSimController.roomId}`, { data: chosenSimController.roomId });
    socket.join(chosenSimController.roomId);
  };
