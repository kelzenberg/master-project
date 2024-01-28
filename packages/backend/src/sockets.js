import { Server as SocketIOServer } from 'socket.io';
import { Logger } from './utils/logger.js';
import { SocketEventTypes } from './utils/events.js';
import { packetLogger } from './middlewares/events/packet-logger.js';
import { errorHandler } from './middlewares/events/error-handler.js';
// import {
//   messageHandler as workerMessageHandler,
//   errorHandler as workerErrorHandler,
//   exitHandler as workerExitHandler,
// } from './worker/events.js';

const logger = Logger({ name: 'socket-server' });

export const startSocketServer = (httpServer, simInstances, serverOptions) => {
  const ioServer = new SocketIOServer(httpServer, serverOptions);

  // Packet middlewares
  ioServer.use(packetLogger(logger));
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

      console.log('foo', simId);
      // const chosenSimInstance = simInstances.find(sim => sim.id === `${simId}`);
      const chosenSimInstance = simInstances[0];

      if (!chosenSimInstance) {
        logger.error('Could not find simulation instance with provided ID', { data: simId });
        return;
      }

      if (!chosenSimInstance.isRunning) {
        await chosenSimInstance.start();
      }

      logger.info(`Emitting message on ${SocketEventTypes.INITIAL.toUpperCase()}`, {
        data: { id: chosenSimInstance.id, roomId: chosenSimInstance.roomId, title: chosenSimInstance.title },
      });
      socket.emit(SocketEventTypes.INITIAL, chosenSimInstance.getInitialData());

      socket.data.client = { ...socket.data.client, currentRoomId: chosenSimInstance.roomId };
      logger.info(`Assigning ${socket.id} to room ${chosenSimInstance.roomId}`, { data: chosenSimInstance.roomId });
      socket.join(chosenSimInstance.roomId);
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
