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
  (httpServer, { fetchWorker = null, urls: { staticURL, sliderURL } }, serverOptions) =>
  async () => {
    const ioServer = new SocketIOServer(httpServer, serverOptions);

    // Packet middlewares
    ioServer.use(packetLogger(logger));
    ioServer.use(errorHandler(logger));

    // ToDo: this needs to move out of sockets as this is only happening on server-restart
    let initialData;
    try {
      logger.info(`Fetching initial data...`);
      const response = await fetch(staticURL);
      initialData = await response.json();
      logger.info(`Received initial data...`);
    } catch (error) {
      logger.error('Retrieving initial config failed', error);
      throw new Error('Retrieving initial config failed', error);
    }

    // Client connection over Sockets
    ioServer.on('connection', async socket => {
      logger.info(`Client connected: ${socket.id}`); // id is not persisting between session, debug only!

      // Sending initial data to client
      logger.info(`Emitting message on ${SocketEventTypes.INITIAL.toUpperCase()}`);
      socket.emit(SocketEventTypes.INITIAL, initialData);

      // Client slider event listener
      socket.on(SocketEventTypes.SLIDER, sliderHandler(logger, sliderURL));

      // Client disconnect event listener
      socket.on('disconnect', () => logger.info(`Client disconnected: ${socket.id}`));

      // If fetch-worker is present, propagate constant worker data via socket events...
      if (fetchWorker) {
        fetchWorker.on('message', workerMessageHandler(logger, socket));
        fetchWorker.on('error', workerErrorHandler(logger, socket));
        fetchWorker.on('messageerror', workerErrorHandler(logger, socket, true));
        fetchWorker.on('exit', workerExitHandler(logger, socket));
      }
    });

    return ioServer;
  };
