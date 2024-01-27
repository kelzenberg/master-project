import { Server as SocketIOServer } from 'socket.io';
import { Logger } from './utils/logger.js';
import { SocketEventTypes } from './utils/events.js';
import { packetLogger } from './middlewares/events/packet-logger.js';
import { errorHandler } from './middlewares/events/error-handler.js';
import { handler as updateSimParamsHandler } from './handlers/events/slider.js';
import { handler as assignSimHandler } from './handlers/events/sim-id.js';
import {
  exitHandler as workerExitHandler,
  messageHandler as workerMessageHandler,
  errorHandler as workerErrorHandler,
} from './handlers/events/worker.js';

const logger = Logger({ name: 'socket-server' });

export const startSocketServer = (httpServer, simInstances, serverOptions) => {
  const ioServer = new SocketIOServer(httpServer, serverOptions);
  // Packet middlewares
  ioServer.use(packetLogger(logger));
  ioServer.use(errorHandler(logger));

  // Client connection over socket
  ioServer.on('connection', socket => {
    logger.info(`Client connected: ${socket.id}`); // id is not persisting between session, debug only!

    socket.data.logger = logger;
    socket.data.simInstances = simInstances;
    socket.data.client = { chosenSimId: null, roomId: null };

    // Assigning client to simulation room based on the received sim ID
    socket.on(SocketEventTypes.SIM_ID, assignSimHandler(socket));

    // Updating the simulations parameter via received slider values
    // socket.on(SocketEventTypes.SLIDER, updateSimParamsHandler(socket));

    // Client disconnected event listener
    socket.on('disconnect', () => logger.info(`Client disconnected: ${socket.id}`));
  });

  // If fetch-worker is present, propagate constant worker data via socket events...
  // if (fetchWorker) {
  //   fetchWorker.on('message', workerMessageHandler(logger, ioServer));
  //   fetchWorker.on('error', workerErrorHandler(logger, ioServer));
  //   fetchWorker.on('messageerror', workerErrorHandler(logger, ioServer, true));
  //   fetchWorker.on('exit', workerExitHandler(logger, ioServer));
  // }
};
