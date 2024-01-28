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

    // socket.data.logger = logger;
    // socket.data.simInstances = simInstances;
    socket.data.client = { currentRoomId: null };

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
      }

      logger.info(`Emitting message on ${SocketEventTypes.INITIAL.toUpperCase()}`, {
        data: { id: chosenSimController.id, roomId: chosenSimController.roomId, title: chosenSimController.title },
      });
      socket.emit(SocketEventTypes.INITIAL, chosenSimController.getInitialData());

      socket.data.client = { ...socket.data.client, currentRoomId: chosenSimController.roomId };
      logger.info(`Assigning ${socket.id} to room ${chosenSimController.roomId}`, { data: chosenSimController.roomId });
      socket.join(chosenSimController.roomId);
    });

    // this.#fetchWorker.on('message', workerMessageHandler(ioLogger, ioServer, this.roomId));
    // this.#fetchWorker.on('error', workerErrorHandler(ioLogger, ioServer, this.roomId));
    // this.#fetchWorker.on('messageerror', workerErrorHandler(ioLogger, ioServer, this.roomId, true));
    // this.#fetchWorker.on('exit', workerExitHandler(ioLogger, ioServer, this.roomId));

    // Updating the simulations parameter via received slider values
    // socket.on(SocketEventTypes.SLIDER, updateSimParamsHandler(socket));

    // Client disconnected event listener
    socket.on('disconnect', () => logger.info(`Client disconnected: ${socket.id}`));
  });
};
