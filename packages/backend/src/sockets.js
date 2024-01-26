import { Server as SocketIOServer } from 'socket.io';
import { Logger } from './utils/logger.js';
import { SocketEventTypes } from './utils/events.js';
import { packetLogger } from './middlewares/events/packet-logger.js';
import { errorHandler } from './middlewares/events/error-handler.js';
import { handler as sliderHandler } from './handlers/events/slider.js';
import {
  exitHandler as workerExitHandler,
  messageHandler as workerMessageHandler,
  errorHandler as workerErrorHandler,
} from './handlers/events/worker.js';

const logger = Logger({ name: 'socket-server' });

export const startSocketServer =
  (httpServer, { fetchWorker, url, initialData }, serverOptions) =>
  async () => {
    const ioServer = new SocketIOServer(httpServer, serverOptions);

    // Packet middlewares
    ioServer.use(packetLogger(logger));
    ioServer.use(errorHandler(logger));

    // Client connection over Sockets
    ioServer.on('connection', async socket => {
      logger.info(`Client connected: ${socket.id}`); // id is not persisting between session, debug only!

      // Sending initial data to client
      logger.info(`Emitting message on ${SocketEventTypes.INITIAL.toUpperCase()}`);
      socket.emit(SocketEventTypes.INITIAL, initialData);

      // Client slider event listener
      socket.on(SocketEventTypes.SLIDER, sliderHandler(logger, url));

      // Client disconnect event listener
      socket.on('disconnect', () => logger.info(`Client disconnected: ${socket.id}`));

      fetchWorker.on('message', workerMessageHandler(logger, socket));
      fetchWorker.on('error', workerErrorHandler(logger, socket));
      fetchWorker.on('messageerror', workerErrorHandler(logger, socket, true));
      fetchWorker.on('exit', workerExitHandler(logger, socket));
    });

    return ioServer;
  };
