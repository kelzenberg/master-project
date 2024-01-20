import { Server as SocketIOServer } from 'socket.io';
import { Logger } from './utils/logger.js';
import { SocketEventTypes } from './utils/events.js';
// import { handler as dynamicHandler } from './handlers/events/dynamic.js';
import { packetLogger } from './middlewares/events/packet-logger.js';
import { errorHandler } from './middlewares/events/error-handler.js';

const logger = Logger({ name: 'socket-server' });

export const startSocketServer =
  (httpServer, { worker = null, targetURL }, serverOptions) =>
  async () => {
    const ioServer = new SocketIOServer(httpServer, serverOptions);

    // Packet middlewares
    ioServer.use(packetLogger(logger));
    ioServer.use(errorHandler(logger));

    // ToDo: this needs to move out of sockets as this is only happening on server-restart
    let initialData;
    try {
      logger.info(`Fetching initial data...`);
      const response = await fetch(targetURL);
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

      // Client disconnect event listener
      socket.on('disconnect', () => logger.info('Client disconnected.'));

      // If worker is present, propagate constant worker data via socket events...
      if (worker) {
        worker.on('message', value => {
          logger.info(`Received worker message. Emitting message on ${SocketEventTypes.DYNAMIC.toUpperCase()}`);
          socket.emit(SocketEventTypes.DYNAMIC, value);
        });

        worker.on('error', error => {
          logger.error('Received worker error. Closing socket client connection.', { error });
          socket.disconnect(true);
        });

        worker.on('messageerror', error => {
          logger.error('Received worker message error. Closing socket client connection.', { error });
          socket.disconnect(true);
        });

        worker.on('exit', exitCode => {
          if (exitCode !== 0) {
            const message = `Worker stopped with exit code: ${exitCode}. Closing socket client connection.`;

            logger.error(message);
            socket.disconnect(true);

            throw new Error(message);
          }
        });
      }
    });

    return ioServer;
  };
