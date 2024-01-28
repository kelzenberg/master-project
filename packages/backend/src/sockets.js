import { Server as SocketIOServer } from 'socket.io';
import { Logger } from './utils/logger.js';
import { SocketEventTypes } from './utils/events.js';
import { errorHandler } from './middlewares/events/error-handler.js';
// import {
//   messageHandler as workerMessageHandler,
//   errorHandler as workerErrorHandler,
//   exitHandler as workerExitHandler,
// } from './worker/events.js';

const logger = Logger({ name: 'socket-server' });

export const startSocketServer = (httpServer, simControllers, serverOptions) => {
  const ioServer = new SocketIOServer(httpServer, serverOptions);

  // Packet middlewares
  ioServer.use(errorHandler(logger));

  // Client connection over socket
  ioServer.on('connection', socket => {
    logger.info(`Client connected: ${socket.id}`); // Id is not persisting between session, debug only!

    socket.data.client = { currentRoomId: null };

    const messageHandler = roomId => value => {
      logger.info(`Received worker message. Emitting message on ${SocketEventTypes.DYNAMIC.toUpperCase()}`);
      ioServer.to(roomId).emit(SocketEventTypes.DYNAMIC, value);
    };

    const errorHandler =
      (roomId, messageError = false) =>
      error => {
        logger.error(`Received worker ${messageError ? 'message ' : ''}error. Closing all socket client connections.`, {
          error,
        });
        ioServer.in(roomId).disconnectSockets();
      };

    const exitHandler = roomId => exitCode => {
      if (exitCode !== 0) {
        const message = `Worker stopped with exit code: ${exitCode}. Closing all socket client connections.`;
        logger.error(message);
        ioServer.in(roomId).disconnectSockets();
        throw new Error(message);
      }
    };

    // Sending client initial sim data and assigning client to sim room based on received simId
    socket.on(SocketEventTypes.SIM_ID, async ({ simId }) => {
      if (!simId || `${!simId}` === '') {
        logger.error('Received no simulation ID in payload', { data: simId });
        return;
      }

      // const chosenSimInstance = simInstances.find(sim => sim.id === `${simId}`);
      console.log('Fake selecting sim controller, based on fake simId', simId);
      const chosenSimController = simControllers[0]; // Fake selection

      if (!chosenSimController) {
        logger.error('Could not find simulation instance with provided ID', { data: simId });
        return;
      }

      if (!chosenSimController.isRunning) {
        await chosenSimController.start();

        chosenSimController.setFetchWorkerEventHandlers({
          messageHandler,
          errorHandler,
          exitHandler,
        });
      }

      logger.info(`Emitting message on ${SocketEventTypes.INITIAL.toUpperCase()}`, {
        data: { id: chosenSimController.id, roomId: chosenSimController.roomId, title: chosenSimController.title },
      });
      socket.emit(SocketEventTypes.INITIAL, chosenSimController.getInitialData());

      socket.data.client = { ...socket.data.client, currentRoomId: chosenSimController.roomId };
      logger.info(`Assigning ${socket.id} to room ${chosenSimController.roomId}`, { data: chosenSimController.roomId });
      socket.join(chosenSimController.roomId);
    });

    // Updating the simulations parameter via received slider values
    // socket.on(SocketEventTypes.SLIDER, updateSimParamsHandler(socket));

    // Client disconnected event listener
    socket.on('disconnect', () => logger.info(`Client disconnected: ${socket.id}`));
  });
};
