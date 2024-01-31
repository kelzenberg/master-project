import { Server as SocketIOServer } from 'socket.io';
import { Logger } from './utils/logger.js';
import { SocketEventTypes } from './utils/events.js';
import { errorHandler } from './middlewares/sockets/error-handler.js';

const logger = Logger({ name: 'socket-server' });

const getFetchWorkerCallbacks = ioServer => ({
  messageHandler: roomId => value => {
    logger.info(
      `Received worker message for room ${roomId}. Emitting message on ${SocketEventTypes.DYNAMIC.toUpperCase()}`
    );
    ioServer.to(roomId).emit(SocketEventTypes.DYNAMIC, value);
  },
  errorHandler:
    (roomId, messageError = false) =>
    error => {
      logger.error(
        `Received worker ${messageError ? 'message ' : ''}error for room ${roomId}. Closing all socket client connections.`,
        {
          error,
        }
      );
      ioServer.in(roomId).disconnectSockets();
    },

  exitHandler: roomId => exitCode => {
    if (exitCode !== 0) {
      const message = `Worker for room ${roomId} stopped with exit code: ${exitCode}. Closing all socket client connections.`;
      logger.error(message);
      ioServer.in(roomId).disconnectSockets();
      throw new Error(message);
    }
  },
});

export const startSocketServer = (httpServer, simControllers, serverOptions) => {
  const ioServer = new SocketIOServer(httpServer, serverOptions);

  // Packet middlewares
  ioServer.use(errorHandler(logger));

  // Client connection over socket
  ioServer.on('connection', socket => {
    logger.info(`Client connected: ${socket.id}`); // Id is not persisting between session, debug only!

    socket.data.client = { currentSimId: null, currentRoomId: null };

    // Sending client initial sim data and assigning client to sim room based on received simId
    socket.on(SocketEventTypes.SIM_ID, async ({ simId }) => {
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
        chosenSimController.setWorkerEventHandlers(getFetchWorkerCallbacks(ioServer));
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
    });

    // Updating the simulations parameter via received slider values
    socket.on(SocketEventTypes.SLIDER, async data => {
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
    });

    // Client disconnected event listener
    socket.on('disconnect', () => logger.info(`Client disconnected: ${socket.id}`));
  });
};
